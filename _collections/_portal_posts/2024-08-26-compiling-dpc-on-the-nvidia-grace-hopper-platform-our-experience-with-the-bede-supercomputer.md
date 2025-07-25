---
category: blogs
date: '2024-08-26T09:00:00'
hidden: false
layout: portal/portal-article-view
thumbnail: /assets/images/portal/article-images/2024-08-26-bede-supercomputer/thumbnail.jpg
title: "Compiling DPC++ on the NVIDIA Grace Hopper Platform: Our Experience with the BEDE Supercomputer"
user_id: 92131
---

With the growing adoption of ARM processors in supercomputing, more and more developers are looking to optimize their
applications for these architectures. In this blog post, we’ll share our experience compiling DPC++ (Data Parallel C++)
for the NVIDIA Grace Hopper platform, which is used in the BEDE supercomputer at Durham University. We’ll explore the
compilation process, explain how to build benchmarks, discuss the conformance tests for the SYCL standard from Khronos,
and build the oneMKL library.

## What is BEDE and Why Grace Hopper?

BEDE is a supercomputer based on the NVIDIA Grace Hopper platform, which combines ARM processors with high-performance
GPUs. In this case, the setup includes a 72-core ARM processor connected to a NVIDIA H100 GPU via NVLink-C2C, a link
offering 900 GB/s of bandwidth. This architecture promises impressive performance, particularly in tasks requiring high
data transfer rates.

### Compiling DPC++ on BEDE

The process of compiling DPC++ for this platform was straightforward. We used
the [Intel&trade; LLVM](https://github.com/intel/llvm)  compiler, which already supports ARM processors, and followed
these steps to set it up on BEDE:

```bash  
module load gcc/native cuda

mkdir ~/sycl_workspace && cd ~/sycl_workspace  
git clone https://github.com/intel/llvm.git

python3 $DPCPP_HOME/llvm/buildbot/configure.py --cuda --host-target "AArch64;ARM;X86" -t Release
python3 $DPCPP_HOME/llvm/buildbot/compile.py -j 8 
```

Once the compilation was completed, we tested its functionality using the sample program included in
the [Getting Started Guide](https://github.com/intel/llvm/blob/sycl/sycl/doc/GetStartedGuide.md#run-simple-dpc-application)
file of the DPC++ package.

executing the following steps to compile and run::

```bash
export PATH=$DPCPP_HOME/llvm/build/bin:$PATH
export LD_LIBRARY_PATH=$DPCPP_HOME/llvm/build/lib:$LD_LIBRASY_PATH
clang++ -fsycl -fsycl-targets=nvptx64-nvidia-cuda simple-sycl-app.cpp -o simple-sycl-app-cuda.exe
ONEAPI_DEVICE_SELECTOR=cuda:* ./simple-sycl-app-cuda.exe
```

Everything worked smoothly, demonstrating the viability of this tool on an advanced ARM platform like Grace Hopper.

## Conformance Tests: Conformance Test Suite (CTS)

The next step was to run the  [Conformance Test Suite](https://github.com/KhronosGroup/SYCL-CTS)[5] for the SYCL
standard from Khronos. This test suite evaluates how compatible a compiler is with SYCL, but in this case, we found that
full support for ARM64 was not yet available. However, there was support for ARM, so we made a few small modifications
to the code:

- We added the `__arm64__` macro where necessary, allowing the compiler to work with the new architecture.
- We adjusted some operations, such as replacing `fmrx` and `fmxr` instructions with the newer `msx` and `mxs`.

After making these modifications, we were able to compile the package successfully, and the results were quite positive:
94% of the tests passed (only 5 out of 88 tests failed). These results indicate a high level of maturity for the DPC++
compiler on ARM64.

## Benchmarking: Measuring Performance on Grace Hopper

In addition to the conformance tests, we used the [SYCL-bench](https://github.com/unisa-hpc/sycl-bench)[4] package to
measure the performance of the compiler and the platform. This set of benchmarks helped us better understand how DPC++
behaves on an architecture like Grace Hopper compared to an A100 GPU.

To compile the SYCL-bench package, we added the `-Wno-missing-template-arg-list-after-template-kw` flag in
the `CMakeLists.txt` file, a temporary fix that we expect to be resolved in future software updates.

### Performance Comparison: A100 vs. Grace Hopper

We observed significant performance improvements compared to the A100 [2], particularly in memory bandwidth, as expected
given the architecture of the Grace Hopper [1] platform.

Here are some of the key results from the benchmarks:

![Computing Task Performance](/assets/images/portal/article-images/2024-08-26-bede-supercomputer/image1.png)

The results show that task performance is comparable to that of an A-100 connected to an Intel Xeon Gold 6326 CPU
processor.

![Mircobench Device Bandwith](/assets/images/portal/article-images/2024-08-26-bede-supercomputer/image2.png)

As seen in the results, the high memory-to-GPU bandwidth in Grace Hopper led to significant improvements in benchmarks
related to data transfer intensive tasks.

### Building the oneMKL libraries

Finally, we built the oneMKL [3] libraries by following
the [instructions](https://oneapi-src.github.io/oneMKL/building_the_project_with_dpcpp.html#) found in oneAPI oneMKL
project page:

```bash
git clone https://github.com/oneapi-src/oneMKL.git

mkdir build && cd build
cmake .. -DCMAKE_CXX_COMPILER=clang++   \
        -DCMAKE_C_COMPILER=clang        \
        -DENABLE_MKLCPU_BACKEND=False   \
        -DENABLE_MKLGPU_BACKEND=False   \
        -DENABLE_CUFFT_BACKEND=True     \
        -DENABLE_CUBLAS_BACKEND=True    \
        -DENABLE_CUSOLVER_BACKEND=True  \
        -DENABLE_CURAND_BACKEND=True    \
        -DBUILD_FUNCTIONAL_TESTS=False  \
        -DBUILD_EXAMPLES=True
cmake --build .
cmake --install . --prefix ~/usr/local
```

We then successfully ran the examples located in build/bin.

## Conclusions

Our experience compiling DPC++ on the NVIDIA Grace Hopper platform has shown that the Intel LLVM compiler is advancing
toward a high level of maturity in supporting ARM processors. While some aspects, such as full conformance
certification, are still in development, the results in terms of performance and functionality are promising.

### Key Takeaways

- **Seamless compilation**: The compilation process on BEDE was straightforward, demonstrating the robustness of Intel
  LLVM's support for ARM.
- **Minimal code modifications**: Minor adjustments in the code allowed us to overcome initial limitations with the CTS.

In conclusion, the Grace Hopper platform offers enormous potential for using SYCL in supercomputing environments, and
DPC++ is emerging as a viable tool for development on these new architectures.

### Notices and Disclaimers

Performance varies by use, configuration and other factors. Performance results are based on testing as of dates shown
in configurations and may not reflect all publicly available updates. See configuration details.No product or component
can be absolutely secure. Your costs and results may vary. Intel technologies may require enabled hardware, software or
service activation.

### Configuration

[1]

- [NVIDIA&trade; Grace Hopper Superchip](https://www.nvidia.com/en-gb/data-center/grace-hopper-superchip/): 72-core 64
  bit ARM CPU + 96GB Hopper GPU
- [Rocky Linux release 9.4](https://rockylinux.org/)
- CUDA&trade; 12.3.2
- DPC++ built using commit de4851c5888e88662ddccdf6f52b5233bbec5a32

[2]

- [NVIDIA&trade; A100](https://www.nvidia.com/en-us/data-center/a100/)
- Ubuntu 22.04.5 LTS
- CUDA&trade; 12.5.0
- Intel&trade; oneAPI DPC++/C++ Compiler 2024.2.0 (2024.2.0.20240602)

[3] oneMKL interfaces project built using commit 4ed3e97bb7c11531684168665d5a980fde0284c9

[4] sycl-bench built using commit aabfb4161af888d7056f472c982af318068d3192

[5] sycl-cts built using commit 0e34dd51f7531ab8bbe123c3f5bf25a801fdd23b
