---
title: "Debugging SYCL&trade; code with DPC++ and Visual Studio&reg; Code"
date: 2023-03-01T06:00:00.298000+00:00
layout: portal/portal-article-view
user_id: 649
category: blogs
thumbnail: /assets/images/portal/article-images/2023/thumb-1.jpg
series:
    - guide: 1
      part: 1
      title: Debugging SYCL&trade; code with DPC++ and Visual Studio&reg; Code
      url: /portal/blogs/2023/03/01/debugging-sycl-code-with-dpc-and-visual-studio-code
      current: true
    - guide: 1
      part: 2
      title: Setting up Visual Studio Code on Ubuntu for C++ development
      url: /portal/blogs/2023/03/01/setting-up-c-development-with-visual-studio-code-on-ubuntu
    - guide: 1
      part: 3
      title: Setting up SYCL&trade; development with oneAPI&trade;, DPC++ and Visual Studio&reg; Code on Ubuntu
      url: /portal/blogs/2023/03/01/setting-up-sycl-development-with-oneapi-dpc-and-visual-studio-code-on-ubuntu
    - guide: 2
      title: Debugging the DPC++ debugger using Visual Studio&reg; Code on Ubuntu
      url: /portal/blogs/2023/04/25/debugging-the-dpcpp-debugger-using-visual-studio-code-on-ubuntu
    - guide: 3
      title: Porting C++ projects to SYCL with DPC++ and Visual Studio Code
      url: /portal/blogs/2023/06/30/porting-cpp-projects-to-visual-studio-code
    - guide: 4
      title: Linking oneAPI libraries to a Visual Studio Code C++ Project
      url: /portal/blogs/2023/08/16/linking-oneapi-libraries-to-a-visual-studio-code-cpp-project
---

If you already possess some modern C++ skills but are not familiar with the Khronos&reg; open standard SYCL&reg;, Intel&reg;'s oneAPI Toolkits and the Intel Data Parallel C++ (DPC++) SYCL implementation, I will try to provide you with the
necessary information to develop High Performance Computing (HPC) applications using SYCL with the latest Microsoft
cross platform development environment (IDE) Visual Studio Code.

SYCL is an open standard C++ API to enable modern C++ programs (SYCL 1.2.1 C++ 11, SYCL 2020 and so DPC++ requires C++ 17 or newer) to utilize heterogeneous computing architectures efficiently. One of the key benefits is that a SYCL program can target different heterogeneous architectures without any modifications. Heterogeneous architectures can comprise of any type and number of accelerator devices like GPUs, FPGAs or multi-core CPUs or DSPs.

DPC++ is an implementation of the SYCL standard and based on the open source LLVM Clang compiler project. DPC++ programs
use the gdb-oneAPI debugger to enable verification and tuning of code and data as it moves from the host device,
normally operated by a CPU, to matrix vector model (GPUs) or spatial pipeline model (FPGAs) devices to execute and
return the results.

oneAPI implements a set of Toolkits which can be used together to enable DPC++ programs to utilize performance libraries
and tuning tools making them effective when used on heterogeneous High-Performance Compute (HPC) systems. To facilitate
our education of oneAPI, Intel provides numerous videos, articles, program examples and information on how to setup
multiple cross platform development platforms on its website.

Traditional non-GUI command-line based C/C++ configuration and build systems like Make or CMake files along with shell
scripts are used to orchestrate most DPC++ program compilation. However, if the majority of your development experience
has been with GUI orientated development environments, for example, a user of Microsoft's Visual Studio IDE, this can
make DPC++ programming unfamiliar, especially when it comes to debugging programs. A GUI IDE programmer also must
familiarize and understand how to use command line development environments, and this can be a learning curve that must
be handled before programming can start in earnest. Another challenge for the GUI IDE programmer is to be able to work
with rudimentary debugging tools when they are used to working with a feature rich GUI IDE.

**Using the Visual Studio Code IDE with Microsoft's C/C++ extensions can provide benefits over the command line
development approach:**

* IntelliSense code highlighting and ability to hover over variables, functions or class details and jump to their
  definitions.
* View code files through multiple windows or split views.
* Interactive debugging to step in over or out of functions, dynamically set or remove break points, reveal stack 
  scope or watch variables in real time.
* Use the terminal to execute debugger commands whilst using the IDE.
* Set project configuration through the IDE
* Instant access to other project files whilst debugging.
* Attach your project to a Git repository through the IDE interface.

These blogs will take you through the necessary steps to setup and utilize the Visual Studio Code IDE for SYCL 
programming and debugging with DPC++ on HPC platforms using the Visual Studio Code IDE.

## About Me

I'm a long time C++ programmer using Microsoft Visual Studio for application and games tools development on PC and
PlayStation. Before now I've spent very little time developing on Linux. I have found that much of the documentation and
supporting DPC++ code is targeted for either Linux or Windows. I have also found that while the Visual Studio Code IDE
is mentioned as an option to build and explore DPC++ programs, the use of the IDE is rudimentary, not using any the 
debugging features the IDE can offer. I also struggled to find documentation on how to setup and use Visual Studio 
Code for DPC++ development to take advantage of the GUI environment as a build and debugging aid as I have done 
in the past with Microsoft Visual Studio. These series of blogs address this gap.

## Getting Started

This series of blogs will guide you to be able to:

* Rapidly set up your environment to compile DPC++ using the Visual Studio Code IDE.
* Get Ubuntu OS ready for SYCL development using DPC++.
* Debug DPC++ code on multiple devices.

The following instructions were developed using Ubuntu 20.04.5 LTS. The Visual Studio Code version used was 1.72.2.
Should you be looking to use these blogs to help you on a different platform, the Visual Studio Code elements to this
guide should remain relevant. Other elements will need interpretation and change so that it may work on other platforms.

These series of blog guides were developed during my exploration of getting setup up on a freshly installed Ubuntu
machine, where Visual Studio Code needed to be installed and configured for DPC++ development. I'd recommend if you are
in the same situation that you do not yet install any of the Intel oneAPI Toolkits nor install OpenCL or other compute
or graphic drivers until the Visual Studio Code IDE is operational. I'll explain how to do that in the next section.
This avoids a situation where you are trying to figure out if the problem is with DPC++ or just with the C++ toolchain.

## Setting up the C++ Environment

If you have not yet set up your development environment for C++ projects, you should use the following guide as it 
describes what you need to do to setup Visual Studio Code.

[Guide 1 Part 2 Setting up Visual Studio Code on Ubuntu for C++ development](/portal/blogs/2023/03/01/setting-up-c-development-with-visual-studio-code-on-ubuntu.html)

If you already have this set up and are comfortable working with C++ projects in Visual Studio Code then you can skip
this and move onto the next step.

## Setting up SYCL development with oneAPI and DPC++

Once you have a working C++ development environment it's time to set up SYCL with oneAPI and DPC++.

[Guide 1 Part 3 Debugging SYCL with DPC++ and Visual Studio Code](/portal/blogs/2023/03/01/setting-up-sycl-development-with-oneapi-dpc-and-visual-studio-code-on-ubuntu.html)
