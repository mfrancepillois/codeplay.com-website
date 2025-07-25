// Copyright 2025 Codeplay Software Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include <sycl/sycl.hpp>

#include <regex>

using namespace sycl;
namespace syclexp = sycl::ext::oneapi::experimental;

int main(int argc, char **argv) {
  queue q;

  if (!q.get_device().ext_oneapi_can_compile(syclexp::source_language::sycl)) {
    std::cout << "SYCL-RTC not supported for "
              << q.get_device().get_info<info::device::name>() << std::endl;
    return -1;
  }

  std::string sycl_source = R"""(
    #include <sycl/sycl.hpp>
    #include "mmlib.h"

    #include "user_ops.h"

    extern "C" SYCL_EXT_ONEAPI_FUNCTION_PROPERTY((
      sycl::ext::oneapi::experimental::nd_range_kernel<2>))
    void mm_kernel_%TYPE%_%POST_OP%(%TYPE% *A, %TYPE% *B, %TYPE% *C, int K) {
      mmlib::mm<%TYPE%, %POST_OP%>(A, B, C, K);
    }
  )""";

  std::string header_source = R"""(
    struct GeLU {
      template <typename T> static inline T apply(T v) {
        return v * sycl::erf(v);
      }
    };
  )""";

  sycl_source = std::regex_replace(sycl_source, std::regex{"%TYPE%"}, "float");
  sycl_source =
      std::regex_replace(sycl_source, std::regex{"%POST_OP%"}, "GeLU");

  syclexp::include_files includes{"user_ops.h", header_source};

  auto source_bundle = syclexp::create_kernel_bundle_from_source(
      q.get_context(), syclexp::source_language::sycl, sycl_source,
      syclexp::properties{includes});

  // Change this path to the location of `mmlib.h`!
  syclexp::build_options opts{"-I/opt/mmlib/include"};
  std::string compiler_output;
  syclexp::save_log log{&compiler_output};

  auto exec_bundle =
      syclexp::build(source_bundle, syclexp::properties{opts, log});

  std::cout << "Compiler output:\n" << compiler_output << '\n';

  kernel mm_kernel = exec_bundle.ext_oneapi_get_kernel("mm_kernel_float_GeLU");

  constexpr auto M = 4;
  constexpr auto N = 4;
  constexpr auto K = 4;

  float *A = malloc_shared<float>(M * K, q);
  float *B = malloc_shared<float>(K * N, q);
  float *C = malloc_shared<float>(M * N, q);

  for (int m = 0; m < M; ++m)
    for (int n = 0; n < M; ++n) {
      A[m * M + n] = m + 1;
      B[m * M + n] = 1.0f / (n + 1);
      C[m * M + n] = -1.f;
    }

  q.submit([&](handler &cgh) {
    cgh.set_args(A, B, C, K);
    cgh.parallel_for(range<2>{M, N}, mm_kernel);
  });
  q.wait_and_throw();

  for (int m = 0; m < M; ++m) {
    for (int n = 0; n < M; ++n)
      std::cout << C[m * M + n] << ' ';
    std::cout << '\n';
  }

  free(A, q);
  free(B, q);
  free(C, q);

  return 0;
}
