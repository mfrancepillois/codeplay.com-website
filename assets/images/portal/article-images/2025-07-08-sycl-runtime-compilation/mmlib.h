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

namespace mmlib {

struct NoOp {template <typename T> static inline T apply(T v) { return v; }};

struct ReLU {
  template <typename T> static inline T apply(T v) { return v >= 0 ? v : (T)0; }
};

struct Sigmoid {
  template <typename T> static inline T apply(T v) {
    return 1 / (1 + sycl::exp(-v));
  }
};

template <typename T, typename PostOp>
void mm(T *A, T *B, T *C, int K) {
  sycl::nd_item it = sycl::ext::oneapi::this_work_item::get_nd_item<2>();
  int m = it.get_global_id(0), M = it.get_global_range(0);
  int n = it.get_global_id(1), N = it.get_global_range(1);

  T c_ij = 0.f;
  for (int k = 0; k < K; ++k)
    c_ij += A[m * M + k] * B[k * N + n];

  C[m * M + n] = PostOp::apply(c_ij);
}

} // namespace mmlib
