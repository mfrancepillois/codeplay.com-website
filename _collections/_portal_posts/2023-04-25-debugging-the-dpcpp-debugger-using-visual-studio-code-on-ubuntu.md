---
title: "Debugging the DPC++ debugger using Visual Studio&reg; Code on Ubuntu"
date: 2023-04-25T09:00:00.298000+00:00
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
      current: true
    - guide: 3
      title: Porting C++ projects to SYCL with DPC++ and Visual Studio Code
      url: /portal/blogs/2023/06/30/porting-cpp-projects-to-visual-studio-code
    - guide: 4
      title: Linking oneAPI libraries to a Visual Studio Code C++ Project
      url: /portal/blogs/2023/08/16/linking-oneapi-libraries-to-a-visual-studio-code-cpp-project
---

![](/assets/images/portal/article-images/2023/art4_title-image.png)

The previous guides in this series, we setup the Visual Studio Code (VSCode) development environment on a Ubuntu 20.04 platform from scratch.  The previous guides in this series are:

{%- include _includes/portal/previous-in-series.html -%}

## Introduction

This guide introduces a detailed view of debugging a Data Parallel C++ (DPC++) program using the VSCode IDE. The first section of two parts provides a breakdown of the explicit and implicit actions that occur during DPC++ program execution.

The second part of this article demonstrates how to use the VSCode IDE and its various extensions to provide an information rich view on the DPC++ program being debugged. The VSCode debugger with its suppporting extensions can provide additional debug information to that of using the Intel debugger **gdb-oneapi** from the terminal command line.

As of version 2023.0.0 of the Intel oneAPI Base Toolkit, Intel are predominantly using their icpx compiler in place of the dpcpp version. For the sake of continuity, when this guide mentions DPC++ program, it means a **icpx** compiled program.

### Prerequistics
Before debugging, ensure the following:
- Ubunbtu 20.04 or newer.
- The Intel oneAPI Base Toolkit 2023.0.0 is setup and working.
- VSCode v1.75 is setup. See Guide 1 Parts 2 and 3 on how to do this.
- Install the VSCode extension **NateAGeek Memory Viewer**. The extension is referenced as part of the debugging exercise in this guide.

A very impportant part of the prerequistes, enter the following into any DPC++ project's debug configuration found in the **launch.json** file.

  ```
  "setupCommands": [{
     "description": "Intel gdb-oneapi disable target async",
     "text": "set target-async off",
     "ignoreFailures": true
  }]
  ```
This command will prevent the gdb-oneapi debug session from hanging when it is asked to step into or over the SYCL function ```queue(DeviceSelector.select_device(),...)```.

The VSCode's documentation is extensive and useful. The following documentation can support this article:
1. Debugging  <https://code.visualstudio.com/docs/editor/debugging>
2. Debug C++ in Visual Studio Code <https://code.visualstudio.com/docs/cpp/cpp-debug>
3. Configure C/C++ debugging <https://code.visualstudio.com/docs/cpp/launch-json-reference>

<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
      <div>What is vectorisation?   https://stackoverflow.com/questions/1422149/what-is-vectorization</div>
      <div>How gdb handles threads: https://ftp.gnu.org/old-gnu/Manuals/gdb/html_node/gdb_24.html</div>
      <div>The Intel compiler DPC++ is wrapper for the <b>LLVM clang++</b> compiler. The clang compiler is compatible driver for the <b>gcc</b> compiler and so the options and arguments used are the same. For debugging purposes, both gcc and clang generate DWARF/ELF object files on Linux. DWARF/ELF object files can debugged using either <b>gdb</b>, <b>lldb</b>, <b>gdb-oneapi</b> or any other standard Linux debugger.</div>
      <div>The gdb-oneAPI debugger is gdb compatible with extensions to handle multi-thread debugging across SIMD lanes. This Intel document explains differences between the gdb and gdb-oneapi debugger: https://www.intel.com/content/www/us/en/develop/documentation/debugging-dpcpp-linux/top.html.</div>
      <div>Need to familiarise yourself with C++'11 lambda functions? See this article https://learn.microsoft.com/en-us/cpp/cpp/lambda-expressions-in-cpp?view=msvc-170</div>
      <div>With SYCL, defining lambda functions using capture by value is almost always used because no variable is allowed to be captured by reference for use in a kernel. The capture by value copies the entire function scope to every call site where the lambda is invoked. Hence you will see this method used a lot when using SIMD type architectures where the lambda executes in parallel or asynchronous operations.</div>
      <div></div>
    </div>
</div>

## Build the array-transform program
The [array-transform](https://github.com/oneapi-src/oneAPI-samples/tree/master/Tools/ApplicationDebugger/array-transform) example from the Intel **Getting Started** series will be used to demonstrate a debugging session using the VSCode IDE. Use the following steps to prepare the array-transform example. You may wish to refer to Guide 1 Part 2 as it goes into detail of how-to setup VSCode with the Microsoft C/C++ extensions for DPC++ compiling and debugging.

The VSCode IDE provides several ways to develop and debug C++ code. This guide uses the Microsoft C/C++ extensions to manage a C++ project. When VSCode is mentioned on its own in this guide, it generally means we are using the Microsoft C/C++ extension pack.

Follow the steps to setup VSCode for this example:
1. Optional: Follow the steps in Guide 1 Part 2 to create a simple VSCode C++ project.
2. Create a new C++ project folder **VSCodeDpCppArrayTransform**.
3. Copy the **.vscode** directory's configuration files from an existing DPC++ VSCode project or create a new set of configuration files.
4. Create the **bin** and **src** directories.
5. Copy the array-transform code files to the src directory.
6. Edit the project's **.json** files; **settings**, **tasks**, and **launch** to create configurations for **debug** and **release** builds of the code putting the binaries in the **bin** directory. See figures 1, 2, 3, and 4 for examples of these files.
   ```
    {
        "programName": "array-transform",
        "files.associations": {
        "string_view": "cpp",
            "regex": "cpp"
        }
    }
   ```
   Figure 1: Project’s **settings.json** file – setting the program’s name

   Figure 2: Project’s build configuration file **tasks.json**
    
   ```
   {
        "configurations": [
        {
            "name": "C/C++: Intel icpx build and debug array-transform",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceFolder}/bin/${config:programName}_d",
            "args": [
                "${input:args}"
            ],
            "stopAtEntry": true,
            "cwd": "${fileDirname}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "setupCommands": [
            {
                "description": "Enable pretty-printing for gdb",
                "text": "-enable-pretty-printing",
                "ignoreFailures": true
            },
            {
                "description": "Set Disassembly Flavor to Intel",
                "text": "-gdb-set disassembly-flavor intel",
                "ignoreFailures": true
            },
            {
                "description": "Needed by Intel oneAPI: Disable target async",
                "text": "set target-async off",
                "ignoreFailures": true
            }
            ],
            "preLaunchTask": "array-transform Debug C/C++: Intel icpx build active file",
            "miDebuggerPath": "/opt/intel/oneapi/debugger/latest/gdb/intel64/bin/gdb-oneapi"
        }
        ],
        "inputs" : [
        {
            "id": "args",
            "type": "pickString",
            "description": "Program args",
            "default": "cpu",
            "options": [
            "cpu",
            "gpu",
            "accelerator"
            ]
        }
        ]
    }
   ```

   Figure 3: Project’s debug configuration file **launch.json**

   ```
    {
        "configurations": [
        {
            "name": "Linux",
            "includePath": [
            "${workspaceFolder}/**"
        ],
        "defines": [],
        "compilerPath": "/opt/intel/oneapi/compiler/latest/linux/bin/icpx",
        "compilerArgs": [ "-fsycl" ],
        "cStandard": "gnu17",
        "cppStandard": "gnu++17",
        "intelliSenseMode": "linux-gcc-x64"
        }
        ],
        "version": 4
    }
   ```
   
   Figure 4: Project’s Intellisense configuration file **c_cpp_properties.json**

7. As this example program takes arguments, edit the **launch.json** file to present a device option list to the user. Add the text as shown in figures 5a and 5b.

   ![](/assets/images/portal/article-images/2023/art4_figure5a.png)

   Figure 5a: Debug configuration, allow for arguments to be passed to the debug session.

   ![](/assets/images/portal/article-images/2023/art4_figure5b.png)

   Figure 5b: Debug configuration, allow for arguments to be passed to the debug session.

8. Select and build a debug build using **ctrl+shift+b**. Ignore any popups that may pop up i.e. Make.
9. Check the program runs by using the debug terminal window and typing  ```./bin/array-transform_d```.

## Part 1: Examine a DPC++ program
The following detail is more than you need to debug the simple program provided however, this information will help provide a better understanding of the many implicit actions that occur during the program's execution.

### Code structure
We can view DPC++ programs as a nested set of three scopes: application, command group and kernel scope. This single source model code would follow the typical sequence in table 1 below. The kernel scope (figure 6) forms the innermost scope and represents the kernel code to be executed on a device.

![](/assets/images/portal/article-images/2023/art4_figure6.png)

Figure 6: A typical DPC++ program’s structure.

<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
      <div>While it is the norm to use the anonymous unnamed closure types generated by lambda expressions to define the kernel device code, there is no reason a normal C++ function could not be used in its place. A good reason to define a function instead of a lambda is if the code kernel code is overly large in the number of lines it contains. Or to quickly swap in or out variations of the same kernel for debugging purposes.</div>
      <div> Kernel code when submitted to a device that is not a CPU, cannot support certain C++ features. This includes any functions called from within kernel. Function pointers are prohibited. This extends to functionality which is dependent on support for function pointers, such as virtual function calls, and runtime type information. Exceptions, dynamic memory allocation and runtime recursion within kernels are also prohibited.</div>
    </div>
</div>

### Explicit and implicit actions

A typical SYCL platform as shown in figure 7 represents the underlying activity that occurs on the device driver(s) side or 'backends' with the DPC++ program executing on the host.

![](/assets/images/portal/article-images/2023/art4_figure7.png)

Figure 7: Order of activities and the interaction with the underlying 'backends'.

Looking at the typical program above, table 1, breaks the flow of the program into the progression activities that occur. Figure 7 reveals the implicit activities that occur deep within the device driver layer.

| Steps | WWhere executed | DPC++ program | Function   | Underlying 'backend' i.e. OpenCL library | Terminology | 
|:-----:|:---------------:|:--------------|------------|:-----------------------------------------|:------------|
|   1   | Host            | sycl::device selector class | Represents a specific device to execute kernels (lambda functions) on. A device a can a CPU, GPU, FPGA or something else. It implicitly instantiates a device context(s). | Query for available platforms | A device context contains one or more devices. Contexts are used for managing objects such as command queues, transfer buffer memory, program, and kernel objects and for executing kernels on one or more devices specified in the context. |
|   2   | Host            |               |            | Query one or more platforms for devices  |             |
|   3   | Host            |               |            | Create a context for each device         |             |
|   4   | Host            | sycl::queue class | Represents a queue to which kernels or sycl::queue functions (i.e. memcpy()) can be submitted ('enqueued') for work. Kernels or functions execute asynchronously from the host code. There is no expectation a queue's work will start immediately and so the host code continues before the queue's work starts. Kernels only start work when all dependences for execution are satisfied. | Create a command queue for a context | A command queue is an object associated with one device and a device context to which work is submitted. Different devices can have their own queue. Commands submitted to a command queue are queued in-order but may be executed in-order or out-of-order depending on the attributes specified during the command queue’s creation. Beware race conditions can occur between host and device code accessing the same data buffers out of expected sequence. SYCL's USM data buffer model is prone to race conditions. SYCL's Buffer model eliminates race conditions as the SYCL Scheduler examines the queue(s) for data dependencies. |
|   5   | Host            | sycl::buffer class | Encapsulate a memory allocation that the runtime can use to transfer data between the host and the device. | Create memory objects (or transfer buffers) |             |
|   6   | Host            | sycl::handler class | Used to define a command group scope connecting kernels with buffers. |  | Command group means to perform work.  A command group encapsulates one kernel with its dependencies, and it is processed as a single atomic entity once submitted to a command queue. A command group is defined either as a functor or as a lambda. |
|   7   | Host            | sycl::accessor class | Used to define buffer access requirements of specific kernels, e.g. READ, WRITE or READ-WRITE. | Transfer data from host to device and return results |              |
|   8   | Host            | sycl::range, sycl::nd_range, sycl::id, sycl::item, sycl::nd_item. | Represents execution ranges and execution agents within a range. | | A range describe the iteration space where work groups and the work-items within those groups are composed to be executed.  Work can be split up into smaller units of work, or several work-items divided into equally sized work-groups. Work groups can be on the same device or spread across different devices. Each instance of a kernel is referred to as a work-item.  A work-item executes on 'a single GPU execution unit' or processing element (PE) in a compute unit. |
|   9   | Host            | C++ Lambda expressions or functors (a class or struct) | | Create a program object |             |
|   10  | Host            |               |            | Build a program object                   |             |
|   11  | Host            |               |            | Create one or more kernels               | Generally, it is assumed that kernels run asynchronously with the following traits: • Kernels will schedule execution according to data dependencies or data requirements, • Kernels will block when requesting data on the host, • Kernels handle memory operations automatically. The terms' thread' and 'item' are the equivalent. |
|   12  | Host            |               |            | Set each kernel's arguments              |             |
|   13  | Target device          | Submit a kernel object to a queue |            | Enqueue a kernel for execution |             |
|   14  | Target device          | Kernels are executed across the device's execution units (The host thread that submitted the queue can wait for kernels to complete execution). |              | 1 to N kernels are executed|             |
|   15  | Target device          | Optional: Implicit asynchronous error exceptions collected if enabled. |            | Report 0 or N kernel execution errors. |             |
|   16  | Host            | Buffer object sycl::buffer destruction |  | Transfer data from device to host. |             |
|   17  | Host            | Optional: sycl::event class |  | Handle the device context's generated events |             |
|   18  | Host            | Implicit object destruction |  | Resources released |             |
|   19  | Host            | Optional: If error exception enabled for collection parse the error list. | | |  |

Table 1: Order for activities between the host and device driven by the DPC++ program

A 'backend' is a hardware interface library that at a low level communicates directly with the hardware. Such a library could be an OpenCL driver or OpenGL driver written by the hardware vendor. For example, Intel has a driver called the oneAPI Level-Zero driver. A 'backend' can contain one or more acceleration device. Generally, the device driver API is based on an open standard like OpenCL. Using an open standard allows application developers to target many different vendors' accelerator, yet still use the same software due to the standards’ common API.

<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
      <div>Presently the SYCL specification states there must be only one host platform with at least one device and that should be a CPU device.</div>
      <div>A DPC++ application can access the available compute devices and choose to utilise each device in turn or together when it deems appropriate.</div>
    </div>
</div>

## Part 2: Debug the array-transform program
You may wish to refer to the following Intel debugging information pages:
1. Tutorial: Debugging with Intel® Distribution for GDB* on Linux* OS host [here](https://www.intel.com/content/www/us/en/develop/documentation/debugging-dpcpp-linux/top.html).
2. Tutorial: Debug a DPC++ Application on a CPU [here](https://www.intel.com/content/www/us/en/develop/documentation/debugging-dpcpp-linux/top/debug-a-sycl-application-on-a-cpu.html#debug-a-sycl-application-on-a-cpu_debug-a-dpcpp-application-on-a-cpu).
3. Tutorial: Debug a DPC++ Application on a GPU [here](https://www.intel.com/content/www/us/en/develop/documentation/debugging-dpcpp-linux/top/debug-a-sycl-application-on-a-gpu.html#debug-a-sycl-application-on-a-gpu_debug-a-dpcpp-application-on-a-gpu).

The program array-transform processes elements of an input data buffer depending on whether they are even or odd, and outputs the calculations of the kernels into a separate output buffer.

To demonstrate that kernels execute at any time in any order, the Intel example program is to be amended with some additional code. Modify the program as shown in figure 8, insert the code before the program’s ```try catch``` scope and recompile it.

    constexpr size_t dataElementSize = sizeof( int );
    constexpr size_t fenceSize1 = dataElementSize * 2;
    constexpr size_t fenceSize2 = dataElementSize * 2;
    constexpr size_t dataBufferSize = 64;
    constexpr size_t memBlkDebugLength = dataBufferSize + fenceSize1 + fenceSize2;
    // Initialize the input data buffer
    int arrayInput[ dataBufferSize ];
    for( int i = 0; i < dataBufferSize; i++ )
    arrayInput[ i ] = i + 100;

    // Initialize the (output data buffer) debug memory block wrapping
    // the output buffer. The 0xffs are the debug fence. 
    int arraysDebugMemBlock[ memBlkDebugLength ];
    for( int i = 0; i < memBlkDebugLength; i++ )
    arraysDebugMemBlock[ i ] = 0xffffffff;

    // Initialize the output data buffer content with something so easy
    // to see changes in buffer content as and when written to.
    int *ptrArrayOutput = &arraysDebugMemBlock[ 0 ] + fenceSize1;
    for( int i = 0; i < dataBufferSize; i++ )
    ptrArrayOutput[ i ] = 0xbbbbbbbb;

    // Commence program and kernel execution...

Figure 8: Code to create an output buffer memory fence

Figure 9 shows the **NateAGeek Memory viewer** pane. This is very useful tool that can be used to visually see host side buffers update as the data is copied from the device back to the host as the program iterates through the kernels.

![](/assets/images/portal/article-images/2023/art4_figure9.png)

Figure 9: See the contents of the output data buffer change as kernels execute.

The simple memory fence used here is one technique that can be used to detect if any of the kernel writes to the host buffer extends past the buffer's boundaries so causing memory corruption or fatal program termination.

Switch to the Visual Studio Code debug mode.

![](/assets/images/portal/article-images/2023/art4_figure10.png)

Figure 10: VSCode's debug mode.

The VSCode debugger allows debug break points and variable watches to be added or removed at any time whether a debug session is running or not. Most types of break points and all watch expressions created in one debug session are persistent for future different sessions irrespective of the project workspace (VSCode folder) being closed and opened.

A break point is represented by a red dot in the left margin or gutter of the code line number. Click on the line and simply hit the F9 key or move the mouse cursor to the gutter left of the line number and click.

VSCode supports several distinct kinds of break points:
- Halt on reaching a line of code
- Halt on reaching a line of code when a condition is met
- Halt on entering a function
- Halt on visiting a line of code N times
- Halt on data changing at a memory location


<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
      <div>Halt on data change will not work on variables of type string. The debug engine can produce an error when asked to perform this type of break activity. This is due to the limit on the number of platform specific data hardware break points available or the size of the variable type. For example, x64 can support 4 hardware data breakpoints and types of 8 bytes or less. See https://aka.ms/hardware-data-breakpoints for more information.</div>
      <div>Halt on data change is only support by gdb or gdb-oneapi debugger.</div>
      <div>The ability to set a break point to know when a memory location or variable is read is not supported. Use the gdb-oneapi commands; watch for write detection, rwatch for read detection or awatch for both read and write detection.</div>
    </div>
</div>

## Debug on the CPU

Before debugging the program, place a debug break point on first line of code after ```main()```.

Start a debug session. To debug the example for the first time, enter the IDE's command palette (ctrl+shift+p) **Debug: Select new debug session*** and choose the debug version of the build. Subsequent debug sessions can be initiated by simply hitting the F5 key to start a new debug session. On the IDE prompting you to make a choice of the device to debug, choose ```CPU```.

A quick summary of the VSCode debug keyboard shortcuts:
- To open the debugger window **ctrl+shift+d**
- Press **F9** to set or toggle breakpoint on a selected line of code.
- Press **F5** to start debugging or to run the application.
- Press **F10** to step over.
- Press **F11** to step into.
- Press **shift+F11** to step out of the current function and return to calling function.
- Press **shift+F5** to stop debugging.
- Press **ctrl+shift+F5** to restart Debugging.


The program should halt on the line of the program where the new break point was placed. Reveal the terminal pane and select the DEBUG CONSOLE. Here will be displayed messages from the gdb-oneapi debugger.

Using the Intel array-transform example’s instruction notes as a reference, step through the code setting breaking points where you wish. The Intel article suggests putting a breakpoint pn the kernel code line ```const int element = ptrDataIn[ index ];  // <-- set breakpoint here ```. Do this and continue the program where it should now halt at the first break point visited.

The Intel article asks that the command **print index** be entered into the gdb-oneapi command line to see the contents of the variable index. This action can be achieved in VSCode by performing either:
1. Typing exec print index in the Debug Console's terminal pane prompt.
2. Click the + icon in the debug watch pane and typing index.
3. Mouse hover over a variable to display its contents.

<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
      <div>Hit F12 while selecting a variable symbol will take you to the definition of the variable.</div>
      <div>The address of a variable can be found by entering the name of a variable in the watch pane prefixed with '&'.</div>
      <div>To change the contents of a variable, select either the Variable or Watch pane, select the variable and choose Set Value from the context menu.</div>
      <div>VSCode is limited on how it can display a memory dump view. Use the gdb's <b>x</b> command to display the contents of memory at a particular memory address, i.e. <b>-exec x /64ab 0x7fffffffbca0</b>.</div>
    </div>
</div>


![](/assets/images/portal/article-images/2023/art4_figure11.png)
Figure 11: View of current set of threads (kernels) operating on the data range while halted at a line in the kernel code.

Having inspected the variable index, hit F5 again. The debugger will halt on the same line as before but by a different thread. The watch pane will be automatically updated as variable content changes. If using the **NateAGeek Memory Viewer**, be sure to refresh the memory view manually as it will not update automatically.

Like in Intel's version of this project, debugging is not being stepped. Instead, a break point event is occurring on each thread being executed and so switches to the context of that thread. To step through the code of a single thread, the use the gdb-oneapi command **set scheduler-locking step** or **on** at the IDE's debug console prompt. As this is not the main thread, be sure to revert this setting on returning to debug any host side code. Use the command **set scheduler-locking replay** or **off**.

To see the contents of the program’s accessor ```in```, add it to the watch pane. By expanding the variable ```in```, various aspects of the variable can be seen. Click on the variable ```in```'s **MData** field to view the first memory address and its contents. Click on the variable's Hex editor to reveal the contents of the memory at that location. If it asks to install an extension to do this then choose yes, let it install, and choose the MData field again, a new hex memory view pane will appear. Hover over any of the contents of memory will produce a popup displaying the hex number in a range of other number formats.

## Monitor data movement between the device and the host
One of the defining characteristics of a SYCL program is that it creates a data buffer which can be shared with the host side code and the device side kernel code. As kernels execute processing incoming data, their results are placed in the various buffers, but in which buffers in which order? Is it one transfer (efficient) or several (inefficient)? We have the following buffers:
- ```int output[length]```
- ```buffer buffer_out{output, data_range}```
- ```accessor out(buffer_out, h, write_only)```

At what stage does the ```output``` buffer in this array-transform program start to see results of the kernels' execution?  We are going to be debug the program to find out. This debug session is going to use a combination of different break point types at various points in the program's execution. This is because visibility of variables' content (variable scope) only becomes available as the program executes. The following demonstration is best repeated several times exploring the range of possibilities that can occur, so broadly do the following steps while experimenting with enabling different break points in the code:

1. Change to the Visual Studio Code debug mode.
2. Remove all the break points that may exist in the program already.
3. Reveal the debug console terminal output pane to see debugger messages as they appear.
4. Place a break point at line ``` int arrayInput[ dataBufferSize ];```.
5. Start a debug session and choose **CPU** as the acceleration device.
6. In the variables pane under locals expand variable ```output``` and select ```[0]: -16928```.
7. From the context menu choose break on variable change. A new break point will appear in the break points pane.
8. In the watch pane add a new expression and type **&output**.
8. Copy the address of the ```output``` array and paste it into the NateAGeek Memory View, then hit refresh.
10. Take note of the content starting from this location (use a screen grab to take a picture).
11. Place a break point at line ```constexpr int dimension = 0;```.
12. Continue program execution at let it halt at the break point at line ```constexpr int dimension = 0;```
13. In the variables pane choose ```buffer_out``` and choose break on variable change.
14. The new break point has appeared in the break points pane but is not enabled. Hover over the break point to view the message.
15. This break point will be not be enabled and so we cannot monitor ```buffer_out``` for changes.
16. Place a break point at line ```result = result + 50;``` at let the program halt at that break point.
17. In the variables pane choose ```out``` and create break point on variable change.
18. The new break point has appeared in the break points pane but is not enabled. Hover over the break point to view the message.
19. Place break points at later stages on the kernel code. Remove the break point at line ```result = result + 50;``` and let the program continue to execute.

Be sure to refresh the NateAGeek Memory View to verify that the contents of the output array have changed.

<div class="hint-group">
    <div><span class="material-icons">sticky_note_2</span></div>
    <div>
      <div>Use Ubuntu's calculator app in hex mode to convert hex numbers into their decimal equivalent.</div>
    </div>
</div>


### Observations and conclusion
The main thread does indeed wait on ```q.wait```, however it can be observed the main thread being paused at any time before, during or after kernel execution when stepping through the code. A kernel break point can be visited before the same main thread break point is reached - it is undetermined as to which will be reached first. Once the program is continued, eventually the main thread will halt at the break point on ```q.wait```. Meanwhile, kernels are executing asynchronously. Once all kernel break points are exercised, the main thread will not stop at ```q.wait``` again - it has already been there. It is recommended to place a break point on the next main thread execution code path away from any kernel execution to halt execution and so not end the debug session.
The output array can have its contents changed before the debugger can halt on a triggered data change break point which could make debugging 'exactly when and where' more time consuming. This would be especially the case if trying to see if a memory fence is touched.
