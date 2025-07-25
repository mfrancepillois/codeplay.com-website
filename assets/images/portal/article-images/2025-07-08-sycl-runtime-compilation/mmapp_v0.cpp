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

#include "mmlib.h"

using namespace sycl;

int main(int argc, char **argv) {
  queue q;

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
    cgh.parallel_for(range<2>{M, N}, [=](id<2> _) {
      mmlib::mm<float, mmlib::ReLU>(A, B, C, K);
    });
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
