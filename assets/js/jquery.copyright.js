/**
 * Copyright (C) 2016 Codeplay Software Limited
 * All Rights Reserved.
 *
 * jQuery plugin that enable a navigation bar to respond to scroll events.
 *
 * @author Scott Straughan
 */
(function ($) {
    $.fn.CopyrightText = function ($outputElement) {
        var $fThis = this;
        var $fOutputElement = $outputElement;
        var $fDictionary = [
            {
                'group': 'khronos',
                'keywords': ['SYCL', 'OpenVX', 'Khronos', 'SPIR', 'WebGL', 'WebCL', 'OpenCV', 'OpenVG', 'EGL', 'COLLADA', 'glTF', 'OpenKODE', 'OpenKCAM', 'OpenSL ES', 'OpenWF', 'DevU'],
                'copyright_s': 'is a trademark of the Khronos&reg; Group',
                'copyright_p': 'are trademarks of the Khronos&reg; Group'
            },
            {
                'group': 'khronos2',
                'keywords': ['Vulkan'],
                'copyright_s': 'is a registered trademark of the Khronos Group Inc',
                'copyright_p': 'are registered trademarks of the Khronos Group Inc'
            },
            {
                'group': 'codeplay',
                'keywords': ['Codeplay'],
                'copyright': 'Codeplay is a registered trademark of Codeplay Software Ltd',
            },
            {
                'group': 'codeplay-products',
                'keywords': ['ComputeCpp', 'ComputeAorta', 'Acoran', 'ComputeSuite'],
                'copyright_s': 'is a registered trademark of the Codeplay Software Ltd',
                'copyright_p': 'are registered trademarks of the Codeplay Software Ltd'
            },
            {
                'group': 'nvidia',
                'keywords': ['Nvidia', 'PhysX', 'CUDA'],
                'copyright_s': 'is a registered trademark of NVIDIA Corporation',
                'copyright_p': 'are registered trademark of NVIDIA Corporation'
            },
            {
                'group': 'microsoft',
                'keywords': ['Microsoft', 'Windows', 'Visual Studio'],
                'copyright_s': 'is a registered trademark of Microsoft Corporation in the United States and/or other countries',
                'copyright_p': 'are registered trademarks of Microsoft Corporation in the United States and/or other countries'
            },
            {
                'group': 'opencl',
                'keywords': ['OpenCL'],
                'copyright_s': 'and the OpenCL logo are trademarks of Apple Inc. used by permission by Khronos'
            },
            {
                'group': 'risc-v',
                'keywords': ['RISC-V'],
                'copyright': 'The "RISC-V" trade name is a registered trade mark of RISC-V International'
            },
            {
                'group': 'imagination',
                'keywords': ['Imagination'],
                'copyright_s': 'Imagination Technologies is a registered trademark of Imagination Technologies Limited'
            },
            {
                'group': 'hsa',
                'keywords': ['HSA'],
                'copyright': 'The HSA logo is a trademark of the HSA Foundation'
            },
            {
                'group': 'arm',
                'keywords': ['ARM'],
                'copyright_s': 'is a registered trademark of ARM Limited (or its subsidiaries) in the EU and/or elsewhere. All rights reserved'
            },
            {
                'group': 'mips',
                'keywords': ['MIPS'],
                'copyright_s': 'is a registered trademark of Imagination Technologies Limited'
            },
            {
                'group': 'powerpc',
                'keywords': ['PowerPC'],
                'copyright_s': 'is a trademark of International Business Machines Corporation, registered in many jurisdictions worldwide'
            },
            {
                'group': 'amd',
                'keywords': ['AMD'],
                'copyright_s': 'is a registered trademark of Advanced Micro Devices, Inc'
            },
            {
                'group': 'intel',
                'keywords': ['Intel'],
                'copyright_s': 'is a trademark of Intel Corporation in the U.S. and/or other countries'
            },
            {
                'group': 'linux',
                'keywords': ['Linux'],
                'copyright_s': 'is the registered trademark of Linus Torvalds in the U.S. and other countries'
            },
            {
                'group': 'android',
                'keywords': ['Android'],
                'copyright_s': 'is a trademark of Google Inc'
            },
            {
                'group': 'playstation',
                'keywords': ['PlayStation®'],
                'copyright_s': 'is a registered trademark, and "Cell Broadband Engine" is a trademark of Sony Computer Entertainment Inc'
            },
            {
                'group': 'java',
                'keywords': ['Java'],
                'copyright_s': 'is a registered trademark of Oracle and/or its affiliates'
            },
            {
                'group': 'qualcomm',
                'keywords': ['Qualcomm'],
                'copyright_s': 'is a trademark of Qualcomm Incorporated, registered in the United States and other countries, used with permission'
            },
            {
                'group': 'subversion',
                'keywords': ['Subversion'],
                'copyright_s': 'is a trademark of the Apache Software Foundation'
            },
            {
                'group': 'opengl',
                'keywords': ['OpenGL'],
                'copyright_s': 'and the oval logo are trademarks or registered trademarks of Silicon Graphics, Inc. in the United States and/or other countries worldwide'
            },
            {
                'group': 'tensorflow',
                'keywords': ['TensorFlow'],
                'copyright_s': ', the TensorFlow logo and any related marks are trademarks of Google Inc'
            }
        ];

        String.prototype.rtrim = function(s) {
            return this.replace(new RegExp(s + "*$"),'');
        };

        var $fFinds = [];

        this.reload = function() {
            $fFinds = [];
            $fOutputElement.html($fThis.generateCopyrightString($fThis.text()));
        };

        $fThis.bind('input propertychange', function() {
            $fThis.reload()
        });

        this.generateCopyrightString = function(inputString) {
            $.each($fDictionary, function(index, item) {
                $.each(item['keywords'], function(index, keyword) {
                    var regex = new RegExp('\\b'+ keyword.toLowerCase().replace(/[^a-zA-Z\- ]+/g, '') +'\\b');
                    if(regex.test(inputString.toLowerCase().replace(/[^\x00-\x7F]/g, ""))) {
                        $fThis.addFind(item['group'], keyword);
                    }
                });
            });

            return $fThis.generateStringFromFinds();
        };

        this.addFind = function(groupName, keyword) {
            var found = false;
            $.each($fFinds, function(index, find) {
                if(find['group'] == groupName) {
                    if($.inArray(keyword, find['items'])) {
                        found = true
                        find['items'].push(keyword);
                    }
                }
            });

            if(!found) {
                $fFinds.push({
                    'group': groupName,
                    'items': [keyword]
                });
            }
        };

        this.generateStringFromFinds = function() {
            var output = '';

            $.each($fFinds, function(index, find) {
                var dictItem = $fThis.getItemByGroupName(find['group']);
                if(dictItem != undefined) {
                    if(find['items'].length > 1) {
                        output = output + $fThis.createStringFromArray(find['items']) + ' ' + dictItem['copyright_p'] + '. ';
                    } else {
                        if(dictItem['copyright_s']) {
                            output = output + find['items'][0] + ' ' + dictItem['copyright_s'] + '. ';
                        } else {
                            output = output + dictItem['copyright'] + '. ';
                        }
                    }
                }
            });

            return output;
        };

        this.createStringFromArray = function(array) {
            var string = '';

            $.each(array, function(index, item) {
                if(index < (array.length - 1)) {
                    string = string + item + ', ';
                }
                else {
                    string = string.rtrim(', ') + ' and ' + item;
                }
            });

            return string;
        };

        this.getItemByGroupName = function(groupName) {
            var f = null;

            $.each($fDictionary, function(index, item) {
                if(item['group'] == groupName) {
                    f = item;
                }
            });

            return f;
        };

        this.reload();

        return this;
    }
})(jQuery);
