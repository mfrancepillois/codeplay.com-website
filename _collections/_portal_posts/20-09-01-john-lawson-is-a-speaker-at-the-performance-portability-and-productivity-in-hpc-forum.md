---
user_id: 840
date: 2020-09-01T14:21:50.3600Z
category: news
title: "John Lawson is a speaker at the Performance, Portability, and Productivity in HPC Forum"
thumbnail: /assets/images/portal/article-images/pppforum.png
layout: portal/portal-article-view
---

John Lawson, our Graph Compiler Project Lead, will be speaking at the [Performance, Portability, and Productivity in HPC Forum](https://p3hpcforum2020.alcf.anl.gov/) on '[Experiences tuning SYCL libraries for varied hardware](https://whova.com/embedded/session/ppp_202009/1180927/)' on the 1st September at 3.20pm.

Automated tuning of compute kernels is a popular area of research, mainly focused on finding optimal kernel parameters for a problem with fixed input sizes. This approach is good for problems where sizes and parameters are all known and fixed, but when deploying accelerated libraries into production environments this is often not the case. Traditional kernel auto-tuning has limited impact for these libraries where a wide range of different input parameters must be supported for each operation. SYCL provides a platform agnostic high level framework for expressing heterogeneous programs that can run on a wide range of devices and so it is a good framework to use for accelerated compute libraries. A typical SYCL implementation will convert the kernels into an intermediate representation that is bundled with the final SYCL application or library. This places limits on the number of kernels that can be provided with an application without generating excessively large binaries.

At Codeplay we have developed compute libraries targeting varied devices from desktop GPUs to embedded accelerators, using machine learning to select which kernels to provide in the libraries to balance performance and binary size requirements.

In this talk John will discuss some of the challenges of auto tuning and deploying SYCL libraries as well as the work using machine learning to help select kernel parameters in order to easily adapt the libraries to achieve good performance on new devices.

The Performance, Portability, and Productivity in HPC (P3HPC) Forum is an opportunity to present on ideas and progress toward the goal of performance portability across current and future high performance computing platforms. The two primary goals of this meeting are to:

*   Share best practices and ideas between application developers, hardware architects, and software architects, and to focus on the issue of achieving high performance across platforms without greatly sacrificing portability, productivity, and maintainability
*   Identify major challenges toward the goal of performance, portability, and productivity, and work with vendors and tool providers on determining implementations and solutions

The HPC Forum are particularly interested in research that addresses the complexities of real-life applications and/or realistic workloads, the composability challenges arising from the use of bespoke solutions, and the desire to “future-proof” applications in the long term.

Full details on the event can be found [here](https://p3hpcforum2020.alcf.anl.gov/)

If you want to talk to someone from Codeplay you can contact us via [LinkedIn](https://www.linkedin.com/company/codeplay-software-ltd) or using our _**[contact form](https://www.codeplay.com/support/contact/)**_ on Codeplay’s website or follow on Twitter **_[@codeplaysoft](https://twitter.com/codeplaysoft/)_** 

Codeplay are hiring.  If you're interested in working for Codeplay then please follow the attached link & apply directly to any of the positions we have advertised. Please ensure the following documents are attached to your application: Cover Letter, CV and Code Samples - [Codeplay Careers.](https://www.codeplay.com/company/careers/)
