---
title: "Linking oneAPI libraries to a Visual Studio Code C++ project"
date: 2023-08-16T11:00:00.298000+00:00
layout: portal/portal-article-view
user_id: 649
category: blogs
thumbnail: /assets/images/portal/article-images/vscodedpcpp.png
series:
    - guide: 1
      part: 1
      title: Debugging SYCL&trade; code with DPC++ and Visual Studio&reg; Code
      url: /portal/blogs/2023/03/01/debugging-sycl-code-with-dpc-and-visual-studio-code
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
      current: true
---

In the previous guides in this series, I setup the Visual Studio Code (VSCode) development environment on a Ubuntu 20.04 platform from scratch. The previous guides in this series are:

{%- include _includes/portal/previous-in-series.html -%}

## Introduction
The development and tuning of applications for vendor neutral acceleration hardware has been made easier with the open-source Data Parallel C++ (DPC++) SYCL compiler and the support of the accompanying oneAPI ecosystem. As well as providing the tuning tools, the ecosystem also provides a core set of Runtime Libraries to assist in the development of high-performance, data-centric applications.
This guide, continues from Guide 3 and will show you how to link the oneAPI Math Kernel Library (oneMKL) to a simple DPC++ program using the VSCode IDE. The Microsoft C/C++ extensions pack will be used to configure the build and debug sessions for this DPC++ program.

### Prerequisites
This guide relies on the VSCode development environment being already setup and can compile existing DPC++ projects. If VSCode is not setup for DPC++ development already, then Guide 1 parts 2 and 3 will show you the steps to do this. It is also recommended Guide 3 is looked at prior to this guide as it goes into detail on tools mentioned in this guide.

![](/assets/images/portal/article-images/2023/art6_figure1.png)

Figure 1: The oneAPI ecosystem.

We will use the Intel oneAPI example program **student_t_test** with the oneMKL library. This guide converts the example into a VSCode Microsoft C/C++ extension specific project. The example program is available from numerous sources, but we will use Intel's VSCode extension **Code Sample Browser for Intel® oneAPI Toolkits** to retrieve it.

<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
        <div>The Intel example <b>Student_t_test</b> is located in the oneAPI Base Toolkit in the directory <b>oneAPI-samples/Libraries/oneMKL/student_t_test</b>.</div>
    </div>
</div>

Porting the example project to use Microsoft C/C++ extensions' build and debug configurations provides a feature rich interactive development GUI, and can be carried out in a matter of minutes* (see Guide 3: Porting C+++ projects on how to do this). All the Intel example projects, whether they use the CMake, Makefile or GNUmakefile build systems, can already be used within the framework on the VSCode IDE. However, those build systems only allow the VSCode IDE to be used as a code editor, using its built in terminal to execute make commands. While some developers are very proficient at using a shell-based environment, there are others who are more familiar with GUI IDEs like Microsoft's Visual Studio. The Microsoft C/C++ extensions along with other third-party extensions provide a similar experience.

## Linking oneAPI libraries
Like with other build configuration tools, the Microsoft C/C++ extensions for VSCode needs to hold the paths to any external static libraries and header files that are to be included as part of the program's compilation.

The DPC++ compiler uses the following option flags to specify where it can locate and use specific static libraries.

Compiler option flags:
- **-l** links with a library file.
- **-L** looks in directory for library files.


<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
        <div> In VSCode, use ctrl+click on variable in the code text to follow symbols to their definitions.</div>
        <div>You can add symlinks to external project libraries so that they are listed in the VSCode Explorer pane if you wish. Install and use VSCode extension <b>External libraries</b>.</div>
    </div>
</div>


Using the oneAPI example program **t_test.cpp** from the example, we will now create an equivalent project using the Microsoft C/C++ extension. The steps are:
1. Download the oneAPI example program.
2. Create a new project folder and copy across the code files from the oneAPI example.
3. With reference to Guide 3, create a new project to duplicate the example.
4. Edit the configuration files to fit the new project structure and the program's name (matching the name of the .cpp file).
5. With reference to Guide 3, use the Bear tool to create a **Compilation Database** file.
6. Examine the Compilation Database information and the **make** file in the original MKL example project.
7. Editing the new project's **task.json** file and referencing figure 3, insert the necessary compiler paths to the libraries to be linked to the project.

        {
            "version": "2.0.0",
            "tasks": [
                {
                    "type": "cppbuild",
                    "label": "t_test MKL Debug C/C++: Intel icpx build active file",
                    "command": "/opt/intel/oneapi/compiler/latest/linux/bin/icpx",
                    "args": [
                        "-fsycl",
                        "-fno-limit-debug-info",
                        "-DMKL_ILP64",
                        "-fdiagnostics-color=always",
                        "-fsycl-device-code-split=per_kernel",
                        "-g",
                        "-I/opt/intel/oneapi/mkl/latest/include",
                        "-L/opt/intel/oneapi/mkl/latest/lib/intel64",
                        "-lmkl_sycl",
                        "-lmkl_intel_ilp64",
                        "-lmkl_sequential",
                        "-lmkl_core",
                        "-O0",
                        "${workspaceFolder}/src/${config:programName}.cpp",
                        "-o",
                        "${workspaceFolder}/bin/${config:programName}_d"
                    ],
                    "options": {
                        "cwd": "${workspaceFolder}"
                    },
                    "problemMatcher": [
                        "$gcc"
                    ],
                    "group": "build",
                    "detail": "compiler: /opt/intel/oneapi/compiler/latest/linux/bin/icpx"
                },
                {
                    "type": "cppbuild",
                    "label": "t_test MKL Release C/C++: Intel icpx build active file",
                    "command": "/opt/intel/oneapi/compiler/latest/linux/bin/icpx",
                    "args": [
                        "-fsycl",
                        "-DNDEBUG",
                        "-DMKL_ILP64",
                        "-I/opt/intel/oneapi/mkl/latest/include",
                        "-L/opt/intel/oneapi/mkl/latest/lib/intel64",
                        "-lmkl_sycl",
                        "-lmkl_intel_ilp64",
                        "-lmkl_sequential",
                        "-lmkl_core",
                        "${workspaceFolder}/src/${config:programName}.cpp",
                        "-o",
                        "${workspaceFolder}/bin/${config:programName}"
                    ],
                    "options": {
                        "cwd": "${workspaceFolder}"
                    },
                    "problemMatcher": [
                        "$gcc"
                    ],
                    "group": "build",
                    "detail": "compiler: /opt/intel/oneapi/compiler/latest/linux/bin/icpx"
                }
            ]
        }
Figure 3: The project's tasks.json build configuration file.

9.  Compile the program by using keyboard shortcut **ctrl+shift+b**.
10. Execute the program to debug it by using keyboard shortcut **ctrl+shift+d**, followed by F5.
11. Choose the kernel acceleration device from the VSCode drop menu.

## Conclusion
With this knowledge presented here along with the supporting Guides 1 and 2, you are able to convert and use DPC++ examples in the VSCode IDE with all the advantages it has to offer.

## Next steps
Many target devices to accelerate DPC++ programs are available on remote or cloud platforms. The next guide in the series, Guide 5, will show you how to use VSCode to connect to remote platforms and their devices using SSH, in particular Intel's DevCloud platform. It will show you how to take existing VSCode DPC++ example projects and copy to the DevCloud, select a target node and use it to compile and debug using VSCode.
