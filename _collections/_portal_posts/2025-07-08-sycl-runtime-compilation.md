---
category: blogs
date: '2025-07-08T09:00:00.0'
hidden: false
layout: portal/portal-article-view
thumbnail: /assets/images/portal/article-images/2025-07-02-sycl-10-years/thumbnail.webp
title: 'SYCL Runtime Compilation: A New Way to Specialise Kernels Using C++ Metaprogramming'
user_id: 501121313
---

The open-source DPC++ compiler recently gained support for compiling SYCL source code at runtime using the
[`kernel_compiler`](https://github.com/intel/llvm/blob/sycl/sycl/doc/extensions/experimental/sycl_ext_oneapi_kernel_compiler.asciidoc)
extension. The feature is also available in the 2025.2 release of Intel's oneAPI distribution. This blog post explores
how applications can leverage runtime compilation as a powerful addition to SYCL's toolbox for kernel specialisation
by C++ metaprogramming.

## What is runtime compilation?

Usually, the source code for SYCL kernels is translated by the SYCL compiler (e.g. `clang++` if you are using the
open-source DPC++ toolchain) when compiling an application. Runtime compilation refers to the ability of the resulting
application to define additional kernels during execution, for example by compiling SYCL source code, as we will explore
in this blog post.

```console
$ clang++ -fsycl myapp.cpp -o myapp
$ ./myapp # <-- runtime compilation happens here
```

Beyond SYCL, the `kernel_compiler` extension also supports OpenCL and SPIR-V as source languages –
refer to our previous [blog post](https://www.intel.com/content/www/us/en/developer/articles/technical/oneapi-compiler-kernel-compiler-extension.html) for more details.

A note on the terminology: SYCL implementations often give the application developer a choice between translating kernel
code into an intermediate representation (such as SPIR-V), or directly to the native format for the target device (think: the GPU's assembly code). These modes are called *just-in-time (JIT)* and *ahead-of-time (AOT)* compilation, but only
concerns kernels known at compile-time of the application. While similarly named, runtime compilation is orthogonal to
the JIT-vs.-AOT choice, and allows an application to generate new kernels while it is running.

## Should you use it?

That depends.

SYCL runtime compilation (**SYCL-RTC**) is a powerful tool in certain situations, but can hurt the user experience if used
too much or incorrectly. After all, the translation of SYCL code incurs a cost, and instead of being done once at the
application's compile time, it needs to happens every time the application runs. The persistent cache described at the end of this post can reduce the overhead.

However, SYCL-RTC opens up new possibilities, as we demonstrate in this blog post: Kernel specialisation by C++
templates and integration of user-supplied code snippets at runtime were not available to application developers before.
If you have a similar problem to solve, it is worth considering SYCL-RTC for it.

## The challenge

Assume you have the following SYCL library for matrix multiplications with a configurable post operation, which is
applied to the result matrix elements before writing them back to memory.

[**`mmlib.h`:**](/assets/images/portal/article-images/2025-07-08-sycl-runtime-compilation/mmlib.h)

```cpp
#include <sycl/sycl.hpp>
namespace mmlib {
struct NoOp {
  template <typename T> static inline T apply(T v) { return v; } };
};
struct ReLU {
  template <typename T> static inline T apply(T v) { return v >= 0 ? v : (T)0; }
};
struct Sigmoid {
  template <typename T> static inline T apply(T v) { return 1 / (1 + sycl::exp(-v)); }
};
template <typename T, typename PostOp>
void mm(T *A, T *B, T *C, int K) {
  sycl::nd_item it = sycl::ext::oneapi::this_work_item::get_nd_item<2>();
  int m = it.get_global_id(0), M = it.get_global_range(0);
  int n = it.get_global_id(1), N = it.get_global_range(1);
  T c_ij = 0;
  for (int k = 0; k < K; ++k)
    c_ij += A[m * M + k] * B[k * N + n];
  C[m * M + n] = PostOp::apply(c_ij);
}
} // namespace mmlib
```

The `mm` function computes *C = A·B* for an *MxN* matrix *C*, an *MxK* matrix *A* and a *KxN* matrix *B*. It accepts template arguments
to

- tailor the computation to a given data type (e.g., `float` or `sycl::half`), and
- select one of the supplied post operations (e.g., the ReLU activation function).

The function's arguments are pointers to USM memory for input/output matrices, and the common dimension *K*. Note that
the function obtains the `nd_item` (representing the position in the iteration space) via
the [free_function_queries](https://github.com/intel/llvm/blob/sycl/sycl/doc/extensions/supported/sycl_ext_oneapi_free_function_queries.asciidoc)
extension instead of a function argument.

The library has been working great for launching specialised SYCL kernels in your application, choosing
configurations at compile-time, such as:

[**`mmapp_v0.cpp`:**](/assets/images/portal/article-images/2025-07-08-sycl-runtime-compilation/mmapp_v0.cpp)

```cpp
// ... set up arguments ... 
q.submit([&](handler &cgh) {
  cgh.parallel_for(range<2>{M, N},
    [=](id<2> i) { mmlib::mm<float, mmlib::ReLU>(A, B, C, K); });
});
// ...
```

But now you are tasked with letting users supply new post operations at runtime. Can you express that in SYCL? Yes!

## The `kernel_compiler` extension to the rescue

The following example shows the basic usage of the `kernel_compiler` extension to tackle this challenge. We are using the
following declarations to keep names concise.

[**`mmapp_v1.cpp`:**](/assets/images/portal/article-images/2025-07-08-sycl-runtime-compilation/mmapp_v1.cpp)

```cpp
using namespace sycl;
namespace syclexp = sycl::ext::oneapi::experimental;
```

1. First check that the selected device supports runtime compilation of the SYCL language. For oneAPI 2025.2,
   this covers Intel GPUs via Level Zero or OpenCL, and CPUs via OpenCL.

    ```cpp
    if (!q.get_device().ext_oneapi_can_compile(syclexp::source_language::sycl)) {
      std::cout << "SYCL-RTC not supported for "
                << q.get_device().get_info<info::device::name>() << std::endl;
      return -1;
    }
    ```

2. Generate the source string.

    ```cpp
    std::string sycl_source = R"""(
      #include <sycl/sycl.hpp>
      #include "mmlib.h"
      %USER_OP%
      extern "C" SYCL_EXT_ONEAPI_FUNCTION_PROPERTY((
        sycl::ext::oneapi::experimental::nd_range_kernel<2>))
      void mm_kernel_%TYPE%_%POST_OP%(%TYPE% *A, %TYPE% *B, %TYPE% *C, int K) {
        mmlib::mm<%TYPE%, %POST_OP%>(A, B, C, K);
      }
    )""";
    sycl_source = std::regex_replace(sycl_source, std::regex{"%TYPE%"}, "float");
    sycl_source =
          std::regex_replace(sycl_source, std::regex{"%POST_OP%"}, "GeLU");
    sycl_source = std::regex_replace(sycl_source, std::regex{"%USER_OP%"}, R"""(
      struct GeLU {
        template <typename T> static inline T apply(T v) {
          return v * sycl::erf(v);
        }
      };
    )""");
    ```

   The kernel is defined using the [free-function kernel syntax](https://github.com/intel/llvm/blob/sycl/sycl/doc/extensions/proposed/sycl_ext_oneapi_free_function_kernels.asciidoc): It is a `void`-function that has been marked with the
   `nd_range_kernel<2>` property. The template argument `<2>` makes it two-dimensional. The function's arguments represent the
   kernel arguments. The function's body can contain arbitrary SYCL device code.
   Note that we are using functions from the C++ standard library's `<regexp>` header here, but any form of text generation
   or manipulation available in C++ can be used.

3. The `kernel_compiler` extension uses [kernel bundles](https://github.khronos.org/SYCL_Reference/iface/kernel-bundles.html)
   (introduced in SYCL 2020) and defines a new bundle state, `ext_oneapi_source`. A bundle in this state is the entry
   point to runtime compilation, and is constructed from the source string and the given source language.

    ```cpp
    kernel_bundle<bundle_state::ext_oneapi_source> source_bundle =
      syclexp::create_kernel_bundle_from_source(q.get_context(),
        syclexp::source_language::sycl, sycl_source);
    ```

4. The `build(…)` function compiles the source bundle into executable state.

    ```cpp
    kernel_bundle<bundle_state::executable> exec_bundle = syclexp::build(source_bundle);
    ```

   Note: If the compilation is not successful (e.g., due to a syntax error in the string), a `sycl::exception` is thrown and
   contains the compiler's error message. For brevity, this example relies on a default exception handler to print it out,
   but in general SYCL applications should handle exceptions explictly.

5. Obtain a `kernel` object by name.

    ```cpp
    kernel mm_kernel = exec_bundle.ext_oneapi_get_kernel("mm_kernel_float_GeLU");
    ```

6. Set the kernel arguments and submit it to the queue.

    ```cpp
    q.submit([&](handler &cgh) {
      cgh.set_args(A, B, C, K);
      cgh.parallel_for(range<2>{M, N}, mm_kernel);
    });
    ```

   As before, we assume that suitable buffers for matrices *A*, *B*, *C* and *M*, *N*, *K* arguments have been set up by the
   application.

No special flags for SYCL-RTC are needed when building and running the application:

```cpp
clang++ -fsycl mmapp_v1.cpp -o mmapp_v1
./mmapp_v1
```

## Controlling the compilation via properties

In the example above, we have seen the most basic usage of the extension. However, by passing properties to the
`create_kernel_bundle_from_source` and `build` functions, we can steer the compilation process and elide the manual string
substitutions in the SYCL code. In this section, we explore the available properties and typical use-cases.

### Defining virtual header files with `include_files`

First, let us revisit how we insert a user-supplied post operation into the source string. With the include_files
property, the application can define virtual header files, in the form of *(path, contents)* pairs for each virtual file.
If we put the user's post operation into such a file, we can rely on the C preprocessor to `#include` it for us, instead
of manually replacing a placeholder in the string.

[**`mmapp_v2.cpp`:**](/assets/images/portal/article-images/2025-07-08-sycl-runtime-compilation/mmapp_v2.cpp)

```cpp
std::string sycl_source = R"""(
  #include <sycl/sycl.hpp>
  #include "mmlib.h"
  #include "user_ops.h" // instead of the %USER_OP% placeholder
  // ...
)""";
// ...
std::string header_source = R"""(
  struct GeLU {
    static inline float apply(float v) { return v * sycl::erf(v); }
  };
)""";
syclexp::include_files includes{"user_ops.h", header_source};
auto source_bundle =
  syclexp::create_kernel_bundle_from_source(
    q.get_context(), syclexp::source_language::sycl, sycl_source,
    syclexp::properties{includes}); // <-- pass the property here
```

The same `include_files` instance may be reused for multiple source bundles. More than one virtual header can be defined –
refer to the [extension specification](https://github.com/intel/llvm/blob/sycl/sycl/doc/extensions/experimental/sycl_ext_oneapi_kernel_compiler.asciidoc#new-properties-for-the-create_kernel_bundle_from_source-function)
for details.

The files defined via the `include_files` property take precedence over files with the same path on the filesystem. For
example, if the application runs in a directory in which a `user_ops.h` file exists, the runtime compiler will still use
the virtual file.

### Specifying include paths and other compiler options with `build_options`

When running our sample application, the runtime compiler expects the library header, `mmlib.h`, to be present in the
current working directory, which is inconvenient for users who might want to run the application from arbitrary
locations. As we learned in the previous section, we could embed `mmlib.h` as a virtual header. However, if headers are
already available system-wide on the client machine (for example, `/opt/mmlib/include/mmlib.h`), or when a library is
split across multiple files, a better approach is to extend the runtime compiler's search path for headers.

The `kernel_compiler` extension specifies the `build_options` property for passing a subset of typical compiler command line
options to the runtime compiler. For adding directories to the header search path, use the `-I<path>` option.

[**`mmapp_v3.cpp`:**](/assets/images/portal/article-images/2025-07-08-sycl-runtime-compilation/mmapp_v3.cpp)

```cpp
syclexp::build_options opts{"-I/opt/mmlib/include"};
auto exec_bundle = syclexp::build(source_bundle, syclexp::properties{opts});
```

Note that this property is passed to the `build(…)` function. Conceptually, the property accepts a list of options – refer
to the corresponding section in the extension document for additional ways to construct the property, and an overview of
currently supported options. Passing multiple options can be achieved like this:

```cpp
syclexp::build_options opts2{std::vector<std::string>{
"-I/opt/mmlib/include", "-DFOO=BAR", "-Wextra"}};
```

### Inspecting warnings with `save_log`

The runtime compiler does not produce any output on the console. Besides wrapping the compiler output in exception
messages, the application can use the `save_log` property to request the output when the compilation was successful:

[**`mmapp_v4.cpp`:**](/assets/images/portal/article-images/2025-07-08-sycl-runtime-compilation/mmapp_v4.cpp)

```cpp
std::string compiler_output;
syclexp::save_log log{&compiler_output};
auto exec_bundle = syclexp::build(source_bundle, syclexp::properties{opts, log});
std::cout << "Compiler output:\n" << compiler_output << '\n';
```

### Using C++ source code names and triggering template instantiations with `registered_names`

Last but not least, the extension defines the `registered_names` property, which accepts a list of source code names. Our
example kernel shown above used the `extern "C"` qualifier, which makes it easier for the SYCL runtime to determine the
compiler-generated name for the kernel. When using C++ names, that mapping is no longer trivial due to
implementation-specific name mangling in the compiler, and the application needs to register any kernel names it wants
to query later.

For example, assume we want to define our kernel in the same `mmlib` namespace as our library,

[**`mmapp_v5.cpp`:**](/assets/images/portal/article-images/2025-07-08-sycl-runtime-compilation/mmapp_v5.cpp)

```cpp
std::string sycl_source = R"""(
  #include <sycl/sycl.hpp>
  #include "mmlib.h"
  #include "user_ops.h"   
  namespace mmlib {
  SYCL_EXT_ONEAPI_FUNCTION_PROPERTY((
    sycl::ext::oneapi::experimental::nd_range_kernel<2>))
  void mm_kernel_%TYPE%_%POST_OP%(%TYPE% *A, %TYPE% *B, %TYPE% *C, int K) {
    mmlib::mm<%TYPE%, %POST_OP%>(A, B, C, K);
  }
  }
)""";
```

then we have to register the source code name while building the executable bundle:

```cpp
syclexp::registered_names names{"mmlib::mm_kernel_float_GeLU"};
auto exec_bundle = syclexp::build(source_bundle, syclexp::properties{opts, names, log});
kernel mm_kernel = exec_bundle.ext_oneapi_get_kernel("mmlib::mm_kernel_float_GeLU");
```

The `registered_names` property has another handy function: The application can use it to explicitly instantitate template
kernels. With this, we can rewrite our source string to be static and only contain a function template for wrapping the
library.

[**`mmapp_v6.cpp`:**](/assets/images/portal/article-images/2025-07-08-sycl-runtime-compilation/mmapp_v6.cpp)

```cpp
static constexpr auto sycl_source = R"""(
  #include <sycl/sycl.hpp>
  #include "mmlib.h"
  #include "user_ops.h"
  namespace mmlib {
  template<typename T, typename PostOp>
  SYCL_EXT_ONEAPI_FUNCTION_PROPERTY((
    sycl::ext::oneapi::experimental::nd_range_kernel<2>))
  void mm_kernel(T *A, T *B, T *C, int K) {
    mmlib::mm<T, PostOp>(A, B, C, K);
  }
  }
)""";
```

We construct a source bundle as usual from this string, then supply a list of template instances that shall be available
in the executable bundle, as follows:

```cpp
std::vector<std::string> names_vec{
  "mmlib::mm_kernel<float, mmlib::NoOp>",
  "mmlib::mm_kernel<float, GeLU>",
  "mmlib::mm_kernel<sycl::half, mmlib::ReLU>"
};
syclexp::registered_names names{names_vec};
auto exec_bundle =
  syclexp::build(source_bundle, syclexp::properties{opts, names, log});
// Demonstration only: Check that all kernels are available
for (const auto &name : names_vec)
  std::cout << "has_kernel(" << name << "): "
            << exec_bundle.ext_oneapi_has_kernel(name) << std::endl;
kernel mm_kernel =
  exec_bundle.ext_oneapi_get_kernel("mmlib::mm_kernel<float, GeLU>"); 
```

Note that without the `registered_names` property, we also could have compiled multiple variants of our kernel into the
executable bundle, but would have had to generate additional copies of our kernel code manually. Now, we just pass a
list of names. Neat!

The spelling of a source code name in the `registered_names` property and passed to the kernel bundle methods must be
identical. Please refer to the [section on obtaining kernel objects](https://github.com/intel/llvm/blob/sycl/sycl/doc/extensions/experimental/sycl_ext_oneapi_kernel_compiler.asciidoc#obtaining-a-kernel-when-the-language-is-sycl)
in the extension document for more details and usage examples.

### Final version

Putting all of this together, in `mmapp_v6.cpp`, we have built a SYCL application that can **instantiate and launch a kernel
template at runtime by giving source code names as strings**, and even **include user-supplied code snippets** that are
"fused" directly into the kernel execution.

[**`mmapp_v6.cpp`:**](/assets/images/portal/article-images/2025-07-08-sycl-runtime-compilation/mmapp_v6.cpp)

```cpp
#include <sycl/sycl.hpp>
using namespace sycl;
namespace syclexp = sycl::ext::oneapi::experimental;
int main(int argc, char **argv) {
  queue q;
  if (!q.get_device().ext_oneapi_can_compile(syclexp::source_language::sycl)) {
    std::cout << "SYCL-RTC not supported for "
              << q.get_device().get_info<info::device::name>() << std::endl;
    return -1;
  }
  static constexpr auto sycl_source = R"""(
    #include <sycl/sycl.hpp>
    #include "mmlib.h"
    #include "user_ops.h"
    namespace mmlib {
    template<typename T, typename PostOp>
    SYCL_EXT_ONEAPI_FUNCTION_PROPERTY((
      sycl::ext::oneapi::experimental::nd_range_kernel<2>))
    void mm_kernel(T *A, T *B, T *C, int K) {
      mmlib::mm<T, PostOp>(A, B, C, K);
    }
    }
  )""";
  std::string header_source = R"""(
    struct GeLU {
      template <typename T> static inline T apply(T v) {
        return v * sycl::erf(v);
      }
    };
  )""";
  syclexp::include_files includes{"user_ops.h", header_source};
  auto source_bundle = syclexp::create_kernel_bundle_from_source(
      q.get_context(), syclexp::source_language::sycl, sycl_source,
      syclexp::properties{includes});
  syclexp::build_options opts{"-I/opt/mmlib/include"};
  std::vector<std::string> names_vec{
      "mmlib::mm_kernel<float, mmlib::NoOp>",
      "mmlib::mm_kernel<float, GeLU>",
      "mmlib::mm_kernel<sycl::half, mmlib::ReLU>"};
  syclexp::registered_names names{names_vec};
  std::string compiler_output;
  syclexp::save_log log{&compiler_output};
  auto exec_bundle =
      syclexp::build(source_bundle, syclexp::properties{opts, names, log});
  std::cout << "Compiler output:\n" << compiler_output << '\n';
  // Demonstration only: Check that all kernels are available
  for (const auto &name : names_vec)
    std::cout << "has_kernel(" << name << "): "
              << exec_bundle.ext_oneapi_has_kernel(name) << std::endl;
  kernel mm_kernel =
      exec_bundle.ext_oneapi_get_kernel("mmlib::mm_kernel<float, GeLU>");
  // ...
  q.submit([&](handler &cgh) {
    cgh.set_args(A, B, C, K);
    cgh.parallel_for(range<2>{M, N}, mm_kernel);
  });
  // ...
}
```

## Cache

If an application is used often, it might end up compiling the same small set of kernels over and over again: Users of
our sample application might appreciate that SYCL-RTC allows them to supply their custom activation functions in the
morning, but then work with the same combination of data type and post operation for the rest of the day.

To mitigate the cost of runtime compilation in such circumstances, a persistent on-disk cache is available. The cache
considers the source string, included files (virtual or from the filesystem) and build options. To activate it, simply
set the the environment variable `SYCL_CACHE_PERSISTENT=1`. The location of the cache can be changed by setting
`SYCL_CACHE_DIR`. Refer to the [compiler documentation](https://intel.github.io/llvm/design/KernelProgramCache.html#persistent-cache)
for more details on how to control the cache.

## Conclusion

In this blog post, we demonstrated how the new SYCL language support in the `kernel_compiler` extension enables SYCL
application to leverage powerful C++ metaprogramming techniques for runtime specialisation of kernels. The functionality
is included in the open-source version of DPC++ as well as the Intel oneAPI 2025.2 release, supporting Intel GPUs via
Level Zero or OpenCL, and CPUs via OpenCL. Applications using SYCL-RTC currently require that DPC++ is installed and
able to compile SYCL code normally on the system. We aim to provide a leaner, RTC-specific package to ease the
distribution of RTC-enabled applications in a future release.
