// Copyright Codeplay Software Ltd.
//
// Licensed under the Apache License, Version 2.0(the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include <chrono>
#include <iostream>
#include <vector>

#include <sycl/sycl.hpp>

using namespace sycl;

constexpr size_t dataSize = 100'000'000;

std::vector<float> get_random_data() {
  std::vector<float> arr;
  arr.reserve(dataSize);
  for (size_t i = 0; i < dataSize; ++i) {
    arr.push_back(static_cast<float>(rand()) /
                  (static_cast<float>(RAND_MAX / 42.0)));
  }
  return arr;
}

int main() {
  auto in1 = get_random_data();
  auto in2 = get_random_data();
  auto in3 = get_random_data();
  auto in4 = get_random_data();
  std::vector<float> out(dataSize, -1.0);

  queue q{cpu_selector_v};

  {
    buffer<float> bIn1{in1.data(), range{dataSize}};
    buffer<float> bIn2{in2.data(), range{dataSize}};
    buffer<float> bIn3{in3.data(), range{dataSize}};
    buffer<float> bIn4{in4.data(), range{dataSize}};
    buffer<float> bOut{out.data(), range{dataSize}};
    buffer<float> bTmp1{range{dataSize}};
    buffer<float> bTmp2{range{dataSize}};
    buffer<float> bTmp3{range{dataSize}};

    for (size_t i = 0; i < 10; ++i) {

      auto start = std::chrono::steady_clock::now();

      // tmp1 = in1 * in2
      q.submit([&](handler &cgh) {
        auto accIn1 = bIn1.get_access(cgh);
        auto accIn2 = bIn2.get_access(cgh);
        auto accTmp1 = bTmp1.get_access(cgh);
        cgh.parallel_for<class KernelOne>(
            dataSize, [=](id<1> i) { accTmp1[i] = accIn1[i] * accIn2[i]; });
      });

      // tmp2 = in1 - in3
      q.submit([&](handler &cgh) {
        auto accIn1 = bIn1.get_access(cgh);
        auto accIn3 = bIn3.get_access(cgh);
        auto accTmp2 = bTmp2.get_access(cgh);
        cgh.parallel_for<class KernelTwo>(
            dataSize, [=](id<1> i) { accTmp2[i] = accIn1[i] - accIn3[i]; });
      });

      // tmp3 = tmp2 * in4
      q.submit([&](handler &cgh) {
        auto accIn4 = bIn4.get_access(cgh);
        auto accTmp2 = bTmp2.get_access(cgh);
        auto accTmp3 = bTmp3.get_access(cgh);
        cgh.parallel_for<class KernelThree>(
            dataSize, [=](id<1> i) { accTmp3[i] = accTmp2[i] * accIn4[i]; });
      });

      // out = tmp1 - tmp3
      q.submit([&](handler &cgh) {
        auto accTmp1 = bTmp1.get_access(cgh);
        auto accTmp3 = bTmp3.get_access(cgh);
        auto accOut = bOut.get_access(cgh);
        cgh.parallel_for<class KernelFour>(
            dataSize, [=](id<1> i) { accOut[i] = accTmp1[i] - accTmp3[i]; });
      });

      q.wait();

      auto stop = std::chrono::steady_clock::now();

      std::cout << "Elapsed time in microseconds: "
                << std::chrono::duration_cast<std::chrono::microseconds>(stop -
                                                                         start)
                       .count()
                << "\n";
    }
  }

  return 0;
}
