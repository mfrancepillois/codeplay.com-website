---
category: blogs
date: '2024-08-16T13:53:11.499999'
hidden: false
layout: portal/portal-article-view
thumbnail: /assets/images/portal/article-images/synxflow.png
title: "Codeplay’s Plugins for oneAPI Benefit High-Performance Flood Modelling Software"
user_id: 931
---

![SynxFlow](/assets/images/portal/article-images/synxflow.png)

Floods cause enormous damage each year, posing significant threats to people and infrastructure. Due to climate
change, we are seeing more frequent and severe flood events around the world. Hydrodynamic flood models are
powerful tools to help with reducing flood risks. They can simulate the behavior of water flow and the extent of
flooding during a flood event. These models are essential for predicting floods and understanding flood risks,
and ultimately help increase societal resilience.

[SynxFlow](https://github.com/SynxFlow/SynxFlow) is an open-source GPU-based hydrodynamic flood modelling software
developed by Dr Xilin Xia(University of Birmingham) and his colleagues in CUDA, C++ and Python. The CUDA part is
used for running the simulations while the Python code is used for data pre-processing and visualization. As a model
that runs on multiple GPUs, SynxFlow can run flood simulations faster than real-time with hundreds of
millions of computational cells and meter-level resolution. Being an open-source software with a
user-friendly Python interface, it can be easily integrated into data science workflows for risk
assessments of disastrous circumstances. Therefore, the model has been widely used for research and
in industry, for example, to support flood early warning systems and generate flood maps.

In a collaborative project between the [University of Birmingham](https://www.birmingham.ac.uk/schools/engineering)
and the [UK Centre for Ecology](https://www.ceh.ac.uk/) and Hydrology supported by the
[Natural Environment Research Council](https://www.ukri.org/councils/nerc/), Xilin and his colleagues are developing
a new generation of probabilistic flood forecasting system.

Probabilistic flood forecasting is a computationally challenging process due to several factors such as:

- Storage, retrieval and management of large datasets,
- High-performance computing requirements to process complex real-time data,
- Model calibration and validation required with evolving real-world conditions,
- Efficient integration of different (hydrological, hydraulic and meteorological) models and accurate data
  transfer between them, and a lot more.

With many such challenges that a flood forecasting system must deal with simultaneously, parallel data
processing and offloading compute-intense tasks to hardware accelerators are required for faster outcomes
from the system. Hence, the SynxFlow team needs to further extend the flood simulation size with much reduced
simulation time by using even larger supercomputers. But the newest supercomputer in the UK namely
[DAWN](https://www.hpc.cam.ac.uk/d-w-n), uses Intel® GPUs which SynxFlow did not support.

After weighing various options, the SynxFlow project team decided to leverage the Intel® oneAPI Base Toolkit
implementation of the oneAPI specification backed by the Unified Acceleration Foundation (UXL). It is all
based on multiarchitecture, multi-vendor supported SYCL framework.  With support for Intel, NVIDIA and AMD
GPUs, through Codeplay’s plugins for oneAPI.

<div class="quote">
  <blockquote>
  “The resultant code can run on CPUs, Intel GPUs, and NVIDIA GPUs by using the oneAPI plugins from Codeplay*.
  Without any performance optimisation yet, for simulations of urban flooding in a large city, the SYCL
  code can be over 10% faster [1] than the original CUDA code on the same NVIDIA A100 GPUs. The performance
  is also comparable on Intel® Data Center GPU Max 1550, on which the same simulation takes about 40% longer
  than on NVIDIA A100 GPUs. In terms of scalability, the code achieved almost 90% strong scaling efficiency
  on both NVIDIA and Intel GPU-based supercomputers.”
  </blockquote>
  <cite><img src="{{ '/assets/images/portal/article-images/synxflow-author.jpg' | relative_url }}" /> Dr Xilin Xia, Assistant Professor, University of Birmingham</cite>
</div>

The process of migrating the SynxFlow code was smooth. After re-organising the project using Microsoft Visual
Studio, Xilin was able to run the DPC++ compatibility successfully. This resulted in a code with most of the
CUDA kernels and API calls translated into SYCL automatically. When compiling after the auto-translation, there
were some errors, which were easy to fix based on the error-diagnostic hints and warnings included in the
output of the migration tool. The more time-consuming part was changing the NVIDIA* Collective Communications
Library (NCCL)-based inter-GPU communication to GPU-direct enabled [Intel® MPI library](https://www.intel.com/content/www/us/en/developer/tools/oneapi/mpi-library.html)
calls as this could not be automatically done.

In summary, an attempt to migrate a complex CUDA-based flood simulation code to SYCL is promising and
achieved both performance-portability and scalability. [The Intel® oneAPI Base Toolkit](https://www.intel.com/content/www/us/en/developer/tools/oneapi/base-toolkit.html)
has made the migration smooth and manageable.

## About the Author from the University of Birmingham

Dr Xilin Xia is an Assistant Professor in Resilience Engineering within the School of Engineering at the
University of Birmingham, UK, and a Turing Fellow of The Alan Turing Institute. His research focuses on
computational modelling of natural hazards, such as floods, landslides and debris/mud flows, and their
impacts. He has developed numerical methods and open-source code that have been used worldwide. For his
contribution to developing open-source flood model, he is a recipient of the 2024 Prince Sultan bin
Abdulaziz International Prize for Water.

## Useful Resources

- [Intel oneAPI programming model](https://www.intel.com/content/www/us/en/developer/tools/oneapi/overview.html)
- [SYCLomatic documentation](https://oneapi-src.github.io/SYCLomatic/get_started/index.html)
- [Migrate from CUDA to C++ with SYCL portal](https://www.intel.com/content/www/us/en/developer/tools/oneapi/training/migrate-from-cuda-to-cpp-with-sycl.html)
- [Codeplay’s oneAPI plugins for NVIDIA GPUs](https://developer.codeplay.com/products/oneapi/nvidia/home/)

## Notices and Disclaimers

[1]

**Testing Date:** Performance results are based on testing by the University of Birmingham and the UK Centre for
Ecology and Hydrology as of May 2024 and may not reflect all publicly available security updates.

**Simulation size:** 262.5 million grid cells in total

**Hardware and Software setting:**

- For NVIDIA machine (Baskerville HPC)): 16 or 32 NVIDIA A100 GPUs, CUDA Toolkit v11.1
- For Intel machine (DAWN HPC): 16, 32 or 64 Intel Data Center GPU Max 1550, Intel oneAPI Base Toolkit v2024.2.0

Performance results are based on testing as of dates shown in configurations and may not reflect all
publicly available updates. See configuration disclosure for details.  No product or component can be
absolutely secure.

Performance varies by use, configuration, and other factors. Your costs and results may vary.

Intel technologies may require enabled hardware, software, or service activation. Intel does not control
or audit third-party data. You should consult other sources to evaluate accuracy.
