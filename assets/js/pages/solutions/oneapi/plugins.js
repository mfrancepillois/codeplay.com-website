$(document).ready(() => {
    if(cookiePolicyManager.isCookiePolicyAccepted()) {
        $.getScript('https://www.recaptcha.net/recaptcha/api.js?render=explicit');
    }

    if(window.location.hash && window.location.hash.substring(1) === 'sent') {
        showPackagePopup(null, true);
    }

    $('.package-select').click(function() {
        showPackagePopup($(this).data('package'));
    });

    initializeCharts();
});

function showPackagePopup(packageName, sent = false) {
    $('#support-packages-popup').PopupDialog(
        'Support Package Subscribe',
        function (popup) {
            if (sent) {
                popup.find('.prepare').hide();
                popup.find('.sent').show();
            } else {
                popup.find('.package-title').text(packageName);
                popup.find('input[name="_subject"]').val('oneAPI Support Request Upgrade');
                popup.find('input[name="package"]').val(packageName);

                const form = popup.find('form');
                const captchaTarget = popup.find('.g-recaptcha');

                grecaptcha.render(captchaTarget.empty()[0], {
                    'sitekey': captchaTarget.data('site-key'),
                    'callback' : function(response) {
                        form.data('is-valid', 'true');
                        form.find(':input').trigger('change');
                    }
                });

                form.SimpleFormValidator();
            }
        }).show();
}

/**
 * Create chart js config.
 * @param title
 */
function createChartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true
            },
            tooltip: {
                enabled: true
            },
        },
        scales: {
            y: {
                grid: {
                    display: true,
                    drawBorder: false,
                },
                ticks: {
                    display: true
                },
                title: {
                    display: true,
                    text: 'Relative Performance (higher is better)',
                    font: {
                        size: 12
                    }
                },
            },
            x: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    },
                    padding: 32
                },
                grid: {
                    display: true,
                    drawBorder: true,
                }
            }
        }
    };
}

/**
 * Initialize the Chart.js charts.
 */
function initializeCharts() {
    // NVIDIA chart
    new Chart(document.getElementById('oneapi-nvidia-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: [
                'Sobel Filter',
                'Reverse Time Migration',
                'SYCL-HP Linpack',
                'Support Vector Machine',
                'Hashtable',
                'Bitcracker',
                'Easywave',
                'Ethminer',
                'Cudasift',
                'Aobench'
            ],
            datasets: [{
                label: 'NVIDIA CUDA',
                data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                backgroundColor: [
                    '#b7b7b7'
                ],
            }, {
                label: 'NVIDIA SYCL',
                data: [1.01, 0.95, 0.99, 1.09, 0.97, 0.99, 1.12, 0.9, 1.04, 1.09],
                backgroundColor: [
                    '#001cea'
                ],
            }]
        },
        options: createChartOptions('Relative Performance: Nvidia CUDA vs Nvidia SYCL on Nvidia A-100')
    });

    // AMD chart
    new Chart(document.getElementById('oneapi-amd-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: [
                'Sobel Filter',
                'Reverse Time Migration',
                'SYCL-HP Linpack',
                'Support Vector Machine',
                'Hashtable',
                'Bitcracker',
                'Easywave',
                'Ethminer',
                'Aobench'
            ],
            datasets: [{
                label: 'AMD HIP',
                data: [1, 1, 1, 1, 1, 1, 1, 1, 1],
                backgroundColor: [
                    '#b7b7b7'
                ],
            }, {
                label: 'AMD SYCL',
                data: [0.75, 1.3, 0.93, 0.96, 0.84, 0.96, 1.9, 1.5, 1.07],
                backgroundColor: [
                    '#001cea'
                ],
            }]
        },
        options: createChartOptions('Relative Performance: AMD HIP vs AMD SYCL on AMD MI100')
    });
}
