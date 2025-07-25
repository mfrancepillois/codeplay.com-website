---
title: "Setting up SYCL&trade; development with oneAPI&trade;, DPC++ and Visual Studio&reg; Code on Ubuntu"
date: 2023-03-01T08:00:00.298000+00:00
layout: portal/portal-article-view
user_id: 649
category: blogs
thumbnail: /assets/images/portal/article-images/2023/thumb-3.jpg
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
      current: true
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

This guide is part 3 of a three part guide. The previous two guides in the series are: 

{%- include _includes/portal/previous-in-series.html -%}

This guide will help you to set up your Ubuntu machine so that you can write C++ and SYCL code, compile it using the DPC++ compiler and debug it in the Visual Studio Code IDE.

<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
        <div>The name DPC++ and the compiler name <b>dpcpp</b> are names given to the Intel version of the Clang compiler. The Intel compiler <b>icpx</b> is the new compiler replacing dpcpp. It is also called the DPC++ compiler. It is a compatible replacement for the dpcpp compiler when used with the compiler flag <b>-fsycl</b>.</div>
        <div>The Clang LLVM compiler and LLDB debugger are a drop-in replacement for the gcc compiler and gdb debugger respectively.</div>
        <div>The name DPC++ and the compiler name <b>dpcpp</b> are the names given to the SYCL version of the Clang compiler.</div>
        <div>The compiler dpcpp is being depreciated from oneAPI release v2023.0.0 and is being replaced with icpx. The icpx compiler is a drop in replacement using the compiler option <b>-fsycl</b> to inform the compiler to handle SYCL includes in the build. It is also called the DPC++ compiler.</div>
        <div>The Intel classic compiler is called ICC. It also has a compiler called ICL.</div>
        <div>C or C++ projects (Folders) which use the CMake or Makefile build configuration systems can be used and mixed with Microsoft's C/C++ Visual Studio Code extension projects (Folders) and should not conflict.</div>
    </div>
</div>

From within the application Visual Studio Code open up the Extensions panel and search for available Intel oneAPI extensions. In turn, select the following Intel's oneAPI extensions and install:

* Code Sample Browser for Intel oneAPI Toolkits
* Analysis Configurator for Intel oneAPI Toolkits
* Environment Configurator for Intel oneAPI Toolkits

## Prepare a Visual Studio Code C/C++ project to become a DPC++ project

<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
        <div>Many of Intel oneAPI code examples for Visual Studio Code use build configurations that are either CMake or Makefile based. While these examples will compile and execute from a terminal window within Visual Studio Code, they do not utilize the Visual Studio Code C/C++ extension for build and debugging.</div>
    </div>
</div>

Using the standard C/C++ **Helloworld** project from the Guide 1 Part 2 as a model, we will create another C/C++ project that takes code from a simple Intel oneAPI program example and configure it to use Microsoft's C/C++ extension's build and debug configuration system (removing any previous CMake or similar systems). The project's various configuration files will be edited to use the Intel's **icpx** compiler and **gdb-oneapi** debugger instead. The project will compiler and enable debugging in the same way as we did with the Helloworld project.

For this example, we will use Intel’s code example **Simple Add**. This example demonstrates how a simple Helloworld equivalent DPC++ program can produce the same results using two different SYCL memory models. Inside that project it has two .cpp files, one for each model.

<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
        <div>To keep your Visual Studio Code projects working in the future, replace the version text in any paths with text 'latest'.</div>
        <div>Most of the icpx compiler options used in this C/C++ project were taken from the Intel 
            example's Makefile.</div>
    </div>
</div>

Steps to make a DPC++ equivalent C/C++ project:
1. Create a new project directory folder. For this example, we will call it **VSCodeDpcppSimpleAdd**.
2. Create two project's sub-directories called **bin** and **src**.
3. Copy both the oneAPI simple-add .cpp files to the src directory.
4. Open a terminal window and go to the new top project directory folder.
5. To get Visual Studio Code to form a new C/C++ project for this folder, type in a terminal window ```code .```.
6. In the Visual Studio Code Explorer pane select one of the .cpp files.
7. Visual Studio Code may prompt you with a popup wanting you to configure IntelliSense. IntelliSense settings are held in the **c_cpp_properties.json** file. It will create this file for you. If it does not, then use the command palette (ctrl+shift+p) and type **c/c++: edit configurations** and choose it.
8. Edit the c_cpp_properties.json file and replace the necessary options with those shown in figure 10.
9. Select one of the .cpp files and from main menu select **Terminal→Configure task...**.
10. From the drop list of compilers choose the Intel compiler listed, i.e. **/opt/.../icpx**. A new **task.json** file is created by Visual Studio Code.
11. Edit the task.json file so that it contains the four build configurations as shown in figure 11a, 11b, 11c and 11d. These are four types of executable tasks. Two programs each with a release and debug configuration.
12. We are using environmental variables to provide the names of the four executables. Make a **settings.json** as shown in figure 12.
13. Test all four build configurations compile cleanly. Use keys **ctrl+shift+b** and choose each configuration in turn builds.
14. Open a terminal window or use Visual Studio Code's terminal window and execute the four binaries in the project's bin directory.

![](/assets/images/portal/article-images/vscodedpc/2/1.png)

Figure 10: DPC++ configured IntelliSense file c_cpp_properties.json

![](/assets/images/portal/article-images/vscodedpc/2/2.png)

Figure 11a: DPC++ debug build task for simple-add-usm

<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
        <div>The clang compiler option <b>–fno-limit-debug-info</b>. This option enables the contents of string variables to be visible when inspecting them in the debugger.</div>
    </div>
</div>

![](/assets/images/portal/article-images/vscodedpc/2/3.png)

Figure 11b: DPC++ release build task for simple-add-usm

![](/assets/images/portal/article-images/vscodedpc/2/4.png)

Figure 11c: DPC++ debug build task for simple-add-buffer

![](/assets/images/portal/article-images/vscodedpc/2/5.png)

Figure 11d: DPC++ release build task for simple-add-buffer

![](/assets/images/portal/article-images/vscodedpc/2/6.png)

Figure 12: Project's environment variables definition file settings.json

## Prepare a Visual Studio Code DPC++ project to debug a program

Having verified all four variations of the example compile and execute, the debug session configurations can now be
added to the project.

Steps to add the debug configurations to the **launch.json** file:
1. In the Explorer window select the **simple-add-usm.cpp** file.
2. From the command palette type **‘c/c++: Add debug configuration’** and select the command, choose the **simple-add-usm debug** from the list.
3. Edit the new launch.json file so that it contains two configurations as shown in figures 13a and 13b.

![](/assets/images/portal/article-images/vscodedpc/2/7.png)

Figure 13a: Debug configuration for the simple-add-usm executable

![](/assets/images/portal/article-images/vscodedpc/2/8.png)

Figure 13b: Debug configuration for the simple-add-buffers executable

Notable changes to the launch.json file are:

- Changed the name of each of the configurations to be unique, 
i.e. ```"name": "C/C++: dpc++ build and debug simple-add-usm"```.

- Used the same environmental variable substitution method as in the tasks.json file, 
i.e. ```"program": "${workspaceFolder}/bin/${config:programNameUsm}_d"```.

- The prelaunchTask matches the equivalent label of the build configuration in the tasks.json file.

- The miDebuggerPath points to the oneAPI debugger, 
i.e. ```"miDebuggerPath": "/opt/intel/oneapi/debugger/latest/gdb/intel64/bin/gdb-oneapi"```.

To prevent a situation where a Visual Studio Code's debug session can stall or hang, for example when stepping in or over a SYCL function like ```queue q(d_selector, dpc_common::exception_handler);```, edit the launch.json file and add the following:

```
"setupCommands": [
{
  "description": "Needed by Intel oneAPI: Disable target async",
  "text": "set target-async off",
  "ignoreFailures": true
}]
```
A visual symptom of a hang is the interactive debug panel to run or step over into code looks ghosted out and non responsive. Generally, in this situation, the only option is to forcibly abort the debug session.

<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
        <div>From the Visual Studio Code's debug console command prompt, gdb or gdb-oneapi commands can 
            be executed at any time using <b>-exec &lt;a gdb command&gt;</b> during a C/C++ debug session. Microsoft do say at the time of writing this guide that this is not yet fully tested and so may result in unexpected behavior.</div>
        <div>Substituting the project parameter setting (the environmental variable) <b>${config:programNameUsm}</b> in a <b>name</b> type option does not work.</div>
    </div>
</div>

We are now at a stage where we can now choose the debug session to execute by going to the command palette and typing and selecting **Debug: Select Session → Start a debug session → [choose one of the executables to debug]**. This will now become the default debug session. Subsequent debug sessions can be had by using keyboard short cut (Fn+)F5 or using **ctrl+shift+d**. To select another executable to debug, choose **Debug: Select Session again** from the command palette.

Visual Studio Code can now debug DPC++ programs just like normal C++ programs by using the Visual Studio Code debug mode and debug execution panel. 

## Next steps
Guide 2 in this series **Debugging the Intel DPC++ debugger using Visual Studio Code on Ubuntu** will build on this guide and show you the IDE's features that are available to you as you debug a DPC++ program and its kernels as they execute. The guide will show you how to visualize the program and the kernels' changing state as you step through the code, set breakpoints as you go, view the content of variables and vitally see the memory of the output buffer update as each kernel runs.
