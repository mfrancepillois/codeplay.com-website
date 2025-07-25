---
category: blogs
date: '2025-02-11T09:00:00.0'
hidden: false
layout: portal/portal-article-view
thumbnail: /assets/images/portal/no-thumbnail-placeholder.png
title: 'SYCL Bindless Images - An Introduction'
user_id: 13988281
---

## Preface

SYCL is a modern high-level programming model with a focus on enabling
hardware-accelerated compute capabilities across every manner of device and
platform. Because SYCL does not directly interface with accelerator hardware,
it relies on intermediary vendor APIs for device communication and code
execution. This backend implementation approach ensures SYCL code remains
platform agnostic.

The rising popularity of computer vision and increasing demand for accelerated
image processing requires graphics and compute APIs to provide the best in user
experience, functionality, and performance if they are to maintain a
competitive status within the industry. The SYCL image API has never attained
popular adoption due to deficits in these three factors - we present a solution
for fixing that.

One feature critical to the implementation of complex image processing
software is *Bindless Textures* - a technique allowing flexible access to
multiple texture resources without explicit and costly binding operations.
Modern graphics and compute APIs have long since deprecated the traditional
texture binding model in favor the more efficient bindless texture handle
approach. Our goal is to bring the benefits of this approach to SYCL.

This post serves as an introduction to a new API for creating and
manipulating images - an extension to SYCL aptly referred to as
*Bindless Images*.

In this post, we will examine the limitations of the current SYCL images API
design and demonstrate how the bindless images extension addresses these
challenges. We'll explore the extension's core concepts, walk through a
practical example, showcase its key benefits, and discuss our plans for the
future of bindless images in SYCL.

[If you want to learn more about the extension, you can find it on GitHub here.](https://github.com/intel/llvm/blob/sycl/sycl/doc/extensions/experimental/sycl_ext_oneapi_bindless_images.asciidoc)

## Motivation for a New Approach

From inception, the design of SYCL has been driven with a priority on
high-level abstractions. These abstractions, while enhancing user productivity,
come at the cost of limited flexibility. This is evident by the narrow
applicability of SYCL buffers in complex applications, and the introduction of
Unified Shared Memory (USM) as the solution to enable low-level memory
management.

Like buffers, SYCL images suffer from similar problems of lacking flexibility
and low-level control. As such, a solution to tackle these problems is required
if SYCL images are to be more widely adopted, and achieve a competitive status
among compute APIs. Hence, the *Bindless Images* extension was created.

Bindless images are characterized by their low-level representation as simple
opaque reference handles. They can be passed directly to kernels, bypassing the
accessor model which effectively acts as a quasi-binding mechanism, and notably
restricts the number of images in a SYCL application to be known at
compile-time.

Users of USM and bindless image handles lose the key benefits of the accessor
model - e.g. automatic data dependency tracking between kernel submissions.
However, the flexibility these lower-level APIs offer in return is invaluable
in the development of large software applications of high complexity.

## Introduction to Bindless Images

The Bindless Images extension rectifies the limitations of SYCL images by
offering a more flexible, feature-rich API that provides users enhanced control
over image and memory management. The extension's design is guided by two core
principles:

1. Images represented as simple opaque handles.
2. Decoupled image memory allocation and handle construction.

The following sections walk through the steps of getting started with the
basics of bindless images, from creating image descriptors, through to
kernel-based image manipulation.

For brevity and consistency, all code examples assume a valid `sycl::queue`
and the following namespace setup:

```cpp
namespace syclexp = sycl::ext::oneapi::experimental;
sycl::queue syclQueue; // Valid SYCL queue
```

### Image descriptors

Image descriptors consolidate common image properties into a single struct,
simplifying the API and improving user experience by reducing parameter counts
in image functions. A descriptor can be reused throughout the application
lifecycle.

Below is an example of creating a descriptor for a standard 2D image
with four channels of floating-point data:

```cpp
// Define image properties.
const size_t width = 64;
const size_t height = 64;
const unsigned int numChannels = 4;
const auto channelType = sycl::image_channel_type::fp32;

// Construct the image descriptor.
syclexp::image_descriptor imgDesc(
    {width, height},     // Dimensions
    numChannels,         // Channel count
    channelType          // Channel data type
);
```

### Image memory allocation

The extension supports two image memory backing options:

1. Linear USM (represented by regular pointers).
2. Device-optimal memory (represented by an `image_mem_handle`).

The device-optimal memory layout is determined by the backend and device,
typically using a tiled-swizzle pattern optimized for 2D image sampling.

While we expose low-level APIs for managing `image_mem_handle` allocation and
de-allocation, we recommend using the `image_mem` RAII wrapper class for
automatic allocation and cleanup. A simple image memory allocation requires
just two parameters:

```cpp
// Allocate device-optimal image memory.
syclexp::image_mem imgMem(
    imgDesc,     // Image descriptor
    syclQueue    // Device and context association
);
```

### Copying data between host and device

The extension allows users to copy data to image memory prior to creating
the image handle. The asynchronous `ext_oneapi_copy` API, available through
the SYCL queue and handler, facilitates these transfers.

Below is an example showing bidirectional data transfer. Note that host
allocation size must match device memory size as specified by the image
descriptor's properties (in this case width, height, the number of channels,
and the channel type):

```cpp
// Initialize host data.
std::vector<sycl::float4> hostImgData(
    width * height,       // Length of vector
    {1.f, 2.f, 3.f, 4.f}  // Pixel values
);

// Host to device transfer.
auto copyToDeviceEvent = syclQueue.ext_oneapi_copy(
    hostImgData.data(),     // Source
    imgMem.get_handle(),    // Destination
    imgDesc                 // Image descriptor
);
copyToDeviceEvent.wait_and_throw();

// Device to host transfer.
auto copyFromDeviceEvent = syclQueue.ext_oneapi_copy(
    imgMem.get_handle(),    // Source
    hostImgData.data(),     // Destination
    imgDesc                 // Image descriptor
);
copyFromDeviceEvent.wait_and_throw();
```

### Image handle construction

The construction of image handles is a very simple process. Two handle types
are available for image access:

* `unsampled_image_handle`: A read-write handle for direct pixel access

* `sampled_image_handle`: A read-only handle supporting hardware-accelerated
  texture filtering operations for pixel sampling

To create an `unsampled_image_handle`, we use the `create_image` API with the
memory handle and image descriptor:

```cpp
// Create an unsampled image handle from allocated memory.
syclexp::unsampled_image_handle imgHandle = syclexp::create_image(
    imgMem,    // Memory allocation
    imgDesc,   // Image descriptor
    syclQueue  // Device and context association
);
```

### Image manipulation within kernels

The extension uses opaque handles passed directly to kernels, replacing the
accessor model. These handles work with device-only functions for sampling,
fetching, and writing to various image types.

Having constructed an `unsampled_image_handle` above, we can use the
device-only `fetch_image` and `write_image` functions to implement a simple
kernel that modifies image data.

{% raw %}
```cpp
// Define a simple kernel that doubles pixel values
auto simpleKernel = [=](sycl::nd_item<2> it) {
  // Get pixel coordinates.
  sycl::int2 coords({it.get_global_id(0), it.get_global_id(1)});

  // Fetch pixel data.
  sycl::float4 pixel = syclexp::fetch_image<sycl::float4>(imgHandle, coords);

  // Double pixel values.
  pixel *= 2;

  // Write back the modified pixel.
  syclexp::write_image<sycl::float4>(imgHandle, coords, pixel);
};

// Submit the kernel.
syclQueue.submit([&](sycl::handler &cgh) {
  cgh.parallel_for<class SimpleKernel>(
      sycl::nd_range<2>{{width, height}, {32, 32}}, simpleKernel);
});
```
{% endraw %}

## Benefits of Bindless Images

### No More Templates - No More Accessors

Replacing the accessor model with an opaque image handle representation yields
significant benefits:

1. No compile-time constraints on the number of images SYCL applications can create.
2. Enables support for creating dynamic arrays of images.
3. Trivialized passing of image handles between functions (host or device).

### Decoupled Memory Management

Separating the allocation of image memory from image handle creation provides
its own set of benefits to the user, including:

1. Control over memory allocation timing.
2. Control over memory layout and tiling.
3. Independent memory and image handle lifetimes.
4. Memory reuse, including across multiple images.
5. Flexible USM-backed image support.

Additionally, the ability to create image handles from existing memory also
enables bindless images to operate on external memory, imported from APIs such
as Vulkan or DirectX using interoperability extensions.

### Extra Features and Benefits

The Bindless Images extension also offers other, powerful new features:

1. **Extended Image Types**
  - Support for mipmaps, image arrays, and cubemaps.
  - New `bindless_image_sampler` struct for advanced filtering options.
  - Future extensibility for combined image types (e.g. mipmapped cubemaps).

2. **Optimized Memory Management**
  - Fine-grained control through image sub-region copies.
  - Efficient host-device and device-device transfers.
  - Selective image memory region updates.

3. **Simplified Image API Migration**
  - More intuitive manual porting of CUDA and other APIs to SYCL.
  - Hugely reduced complexity for automated migration tools.
  - All owing to the replacement of the accessor model and decoupling of memory and image object management.

## SYCL Code Example

This example demonstrates more sophisticated bindless image usage by creating
three image handles from allocated memory regions: two inputs and one output.
We showcase sampling through a `sampled_image_handle` using the `sample_image`
API, along with a `bindless_image_sampler` (no advanced filtering parameters
are set, as we are not using specialized image types). The kernel in this
example performs a blending operation between two images.

{% raw %}
```cpp
namespace syclexp = sycl::ext::oneapi::experimental;

syclexp::image_descriptor imgDesc({width, height}, 4,
                                  sycl::image_channel_type::fp32);

syclexp::image_mem imgMem1(imgDesc, syclQueue);
syclexp::image_mem imgMem2(imgDesc, syclQueue);
syclexp::image_mem imgMemOut(imgDesc, syclQueue);

syclexp::bindless_image_sampler
    imgSampler(sycl::addressing_mode::repeat,
               sycl::coordinate_normalization_mode::normalized,
               sycl::filtering_mode::linear);

syclexp::sampled_image_handle imgHandle1 =
    syclexp::create_image(imgMem1, imgDesc, imgSampler, syclQueue);
syclexp::unsampled_image_handle imgHandle2 =
    syclexp::create_image(imgMem2, imgDesc, syclQueue);
syclexp::unsampled_image_handle imgHandleOut =
    syclexp::create_image(imgMemOut, imgDesc, syclQueue);

syclQueue.ext_oneapi_copy(dataIn1.data(), imgMem1.get_handle(), imgDesc);
syclQueue.ext_oneapi_copy(dataIn2.data(), imgMem2.get_handle(), imgDesc);
syclQueue.wait_and_throw();

auto blendImagesKernel = [=](nd_item<2> it) {
  auto imgIntCoords = sycl::int2{it.get_global_id(0), it.get_global_id(1)};
  auto imgFloatCoords =
      (imgIntCoords.convert<float>() / sycl::float2{width, height}) + 0.5f;

  auto px1 = syclexp::sample_image<sycl::float4>(imgHandle1, imgFloatCoords);
  auto px2 = syclexp::fetch_image<sycl::float4>(imgHandle2, imgIntCoords);

  syclexp::write_image<sycl::float4>(imgHandleOut, imgIntCoords,
                                     (px1 + px2) / 2.f);
};

syclQueue.submit([&](sycl::handler &cgh) {
  cgh.parallel_for<class BlendImagesKernel>(
      sycl::nd_range<2>{{width, height}, {32, 32}}, blendImagesKernel);
});

syclQueue.wait_and_throw();
```
{% endraw %}

## Extension Status and Support

The bindless images extension is currently in the experimental stage of
development. It is intended to be proposed as an extension for the SYCL
standard. The existing implementation in DPC++ has full support for the Nvidia
device compiler target; the Intel/Level Zero target has partial support; and the
AMD target is in development.

## Future of Bindless Images

The bindless images extension represents a significant step forward for SYCL's
image processing capabilities. Looking ahead, we have several key objectives
for its continued development.

One of our primary points of focus is working towards standardization of the
extension. We are collaborating with stakeholders to refine the API design, and
gathering feedback from real-world usage to ensure it meets the needs of
diverse applications.

Backend support expansion is another crucial initiative. While the extension
currently offers full support for the CUDA backend, we are working to ensure
complete feature parity across all backend implementations. This includes
optimizing performance for various target platforms.

Interoperability remains a key consideration. The extension currently supports
several interoperability features. We are exploring ways to enhance integration
with other graphics and compute APIs, potentially through separating the core
bindless images functionality and interoperability aspects into standalone
extensions. This would enable more flexible adoption and easier integration
with existing codebases.

We encourage developers to try the extension, provide feedback, and contribute
to its evolution. Your experience with SYCL bindless images in real
applications will help shape its future development and standardization path.

Check out the full specification of SYCL bindless images
[on GitHub](https://github.com/intel/llvm/blob/sycl/sycl/doc/extensions/experimental/sycl_ext_oneapi_bindless_images.asciidoc).
