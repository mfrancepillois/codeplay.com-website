---
category: blogs
date: '2025-04-30T09:00:00.0'
hidden: false
layout: portal/portal-article-view
thumbnail: /assets/images/portal/article-images/2025-05-21-iwocl-2025-reflective-blog-thumbnail.webp
title: 'IWOCL 2025 Reflective Blog'
user_id: 931
redirect_from:
  - /portal/blogs/2025/02/11/iwocl-2025-reflective-blog
---

<style>
.separator {
    display: flex;
    vertical-align: middle;
    gap: 1rem;
    margin: 3rem 0 1rem 0;
}

.separator > div {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.separator .title {
    display: flex;
    vertical-align: middle;
}

.separator img {
    width: 60px;
    height: 60px;
    border-radius: 100%;
    vertical-align: middle;
    margin: 0 !important;
}

.separator h2 {
    margin: 0 !important;
}

.separator hr {
    flex: 1;
    height: 1px;
    opacity: .3 !important;
}
</style>

![Banner Image](/assets/images/portal/article-images/2025-05-21-iwocl-2025-reflective-blog-banner.webp)

IWOCL is the annual conference for SYCL and OpenCL – two open standards with the same goal of giving developers the
freedom to write software that works across all available hardware, regardless of architecture or vendor. This goal has
only become more important as hardware evolves to meet the increasing demands of AI applications and data centric
computing; whether it’s new GPUs, FPGAs or specialized AI accelerators.

Codeplay attends each year to present the progress we’ve made with SYCL, and to meet with colleagues from across the
industry to discuss and share our approaches and learnings. We had a lot to showcase this year – Bindless Images brought
more flexibility and control over images in SYCL, SYCL Graph enabled graph optimizations and we also presented our work
with Fast-in-Memory Runtime Compilation. Each of these presentations was recorded and they are now freely available.

<div class="separator">
    <div>
        <img src="{{ '/assets/images/portal/authors/lukas-sommer.png' | relative_url }}" />
        <div class="title"><h2>Lukas Sommer</h2></div>
    </div>
    <hr /> 
</div>

This year’s IWOCL kicked off with two days of tutorial and hackathon and it was great to see so many people interested
in learning about SYCL during the tutorial. On the second day of the tutorial, I had the opportunity to present
Codeplay’s plugin for the oneAPI DPC++ SYCL implementation that allow users to seamlessly run SYCL code on Nvidia and
AMD hardware and to easily port applications between hardware from different vendors in the open SYCL ecosystem. After
some of the conversations I had on the first day, I also wanted to provide an overview of the large library ecosystem
for SYCL in the ecosystem. With the different library API specifications being developed and maintained under the
umbrella of the UXL foundation, these libraries cover a broad range of use cases, thanks to input from across the
industry in the UXL foundation.

During the hackathon, I tried to assist the participants in their effort to write or port applications to SYCL, while
learning a lot about all the interesting use cases on the way myself.

Later in the week, I also had the opportunity to present the traditional State of the Union update on behalf of the
Khronos SYCL SC working group. The SYCL SC working group aims to develop a specification of a variation of the SYCL
programming model that can be used in safety critical applications and domains. The update from the working group
focused on an overview of the SYCL SC effort and the challenges that arise in adapting the SYCL APIs and programming
model to safety-critical applications and the certification process for such applications. With working group members
from different industries and perspectives, the working group tackles challenges that are specific to these domains and
typically not found in the more HPC-focused SYCL working group.

On the same day, I also had the pleasure to be one of the initial panel members for the fishbowl panel. The format was
new for me, but thanks to the contributions of many participants and great moderation from the SYCL working group chair,
Tom Deakin, we had a lively and interesting discussion.

It was my first participation in IWOCL, and I really enjoyed my time there. With participants from a many different
backgrounds in academia and industry and a well-organized program that left ample time for discussion among the
participants, the event had a great workshop spirit, where people exchange and learn from each other.

<div class="separator">
    <div>
        <img src="{{ '/assets/images/portal/authors/julian.jpeg' | relative_url }}" />
        <div class="title"><h2>Julian Oppermann</h2></div>
    </div>
    <hr /> 
</div>

I attended IWOCL to present the progress that Codeplay and Intel teams have made in enabling runtime compilation of SYCL
code using the kernel_compiler extension. Our work lets users compile new kernels at runtime, for example, to fully
specialise a matrix multiplication to input shapes and the target device.

The first part of my talk was aimed at potential users of the extension, demonstrating how the kernel_compiler extension
uses kernel bundles and new properties to control the runtime compilation and execution of kernels. Stay tuned for a
follow-up post on this blog to explain how you can bring runtime compilation to your application!

The second part the presentation outlined our compilation flow, which executes completely in memory, without using
temporary files for speed and safety.

In our experiments, we found that compilation times are dominated by the processing time for the SYCL headers. Intel’s
Alexey Sachkov brought up that issue and proposed breaking up the language headers into smaller bits earlier at the
conference, and a consensus was already forming in the audience to tackle this in the SYCL working group. We are
currently working on simplifying the distribution of applications using runtime compilation, which was the main concern
of potential users at the workshop.

In summary, SYCL runtime compilation is a powerful new tool that complements existing and new approaches for runtime
specialisation, such as the new adaptivity framework in AdaptiveCpp presented by Aksel Alpay the day before.

This was my first time attending IWOCL, and I had a great time! I think what sets the workshop apart from other academic
events is the unique mix of researchers, users, and implementors, discussing and not sugarcoating real issues in the
community. Personally, I enjoyed learning about the variety of the scientific applications using SYCL.

<div class="separator">
    <div>
        <img src="{{ '/assets/images/portal/authors/duncan-brawley.jpeg' | relative_url }}" />
        <div class="title"><h2>Duncan Brawley</h2></div>
    </div>
    <hr /> 
</div>

At IWOCL, during the hackathon during the first two days I was a tutor. Helping and providing assistance where I could.
Saw some interesting projects such as adding support in Compiler Explorer for AdaptiveCPP and other projects. During the
main conference, I presented "SYCL Interoperability with DirectX and Vulkan via Bindless Images". Initially giving an
update on the status of bindless images and then discussing the benefits of memory interop between DirectX/Vulkan and
SYCL. I also in the presentation covered synchronization primitives interoperability as they are vital for memory
interoperability to be useful.

I have been working on bindless images since the start of the project. The aim of bindless images is to provide a new
and improved way to create and access images in SYCL with attention taken to allow bindless images to function on all
different kinds of hardware. One of the main features of bindless images is that all images on the device and
represented via opaque handle types, which can be passed directly to the kernel without requesting access. Bindless
images interoperability with DirectX and Vulkan was a highly desired feature from a number of our stakeholders. Through
working on this we have began looking at expanding interoperability with not just bindless image feature but also other
parts of SYCL such as USM memory.

IWOCL Heidelberg is the first conference I have attended. I am really glad have gotten the opportunity to attend the
conference plus get to visit Heidelberg. It was great to not only get the experience of being a tutor at the hackathon
but also present at the main conference. I feel my presentation went well and it was great meeting new people plus just
exploring the city of Heidelberg. I am excited for any opportunities to attend conferences in the future.

<div class="separator">
    <div>
        <img src="{{ '/assets/images/portal/authors/2952d89c52763b83de503fb5acfa9b16.jpg' | relative_url }}" />
        <div class="title"><h2>Ewan Crawford</h2></div>
    </div>
    <hr /> 
</div>

Heidelberg is the third IWOCL I have attended in person after going to Cambridge in 2023 and Oxford in 2018, and it's a
conference I always enjoyed going to. It's a great forum to meet folks passionate about open compute standards and hear
directly about the projects being enabled through them.

This year I presented on the SYCL-Graph project, a oneAPI vendor extension to SYCL that Codeplay have been collaborating
with Intel on. The SYCL-Graph extension separates the concepts of command creation and submission which are tied
together in SYCL 2020. Our technical talk was on the integration of the extension in GROMACS, a molecular dynamics
engine, focusing on a case-study of the grappa PME workload. We showed performance improvements for small system sizes
on Intel and NVIDIA GPUs compared to default SYCL. This is the first time we've talked publicly about the performance
benefits of the extension, rather than just presenting its functionality, so the talk was a great milestone for the
project. Another reason the presentation was special was that we did it jointly with Andrey Alekseenko from KTH Royal
Institute of Technology, who is a GROMACS maintainer. Andrey has given us lots of excellent feedback throughout the
project, and it was cool to be able to do a talk presenting both implementer and user perspectives of the project.

Another reason I enjoyed this year's conference was being able to see the uptake of the OpenCL cl_khr_command_buffer
extension, the OpenCL API used as a backend to SYCL-Graph. This is an extension that I have been collaborating with the
OpenCL WG on for several years, and it was amazing being able to listen to talks referencing it. As well as discuss
OpenCL with conference attendees from the OpenCL WG who I've spent many hours on calls with. 

![Image 1](/assets/images/portal/article-images/2025-05-21-iwocl-2025-reflective-blog-g1.webp)

![Image 2](/assets/images/portal/article-images/2025-05-21-iwocl-2025-reflective-blog-g2.webp)

![Image 3](/assets/images/portal/article-images/2025-05-21-iwocl-2025-reflective-blog-g3.webp)
