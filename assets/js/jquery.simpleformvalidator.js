(function ($) {
    $.fn.SimpleFormValidator = function(onValidCallbackFn, onInvalidCallbackFn) {
        const fElement = $(this);
        const fThis = this;

        // This is the minimum length of a input before it will attempt to show validation failure
        // (will still run callback)
        const fValidationLengthThreshold = 3;

        /**
         * Validate all inputs.
         */
        this.validateAll = function () {
            let allFormsValid = true;

            fElement.find(':input').each(function() {
                const currentInput = $(this);
                const isInputValid = fThis.isValid(currentInput);

                // Form isn't valid, validate it
                if (!isInputValid) {
                    if (currentInput.val().length >= fValidationLengthThreshold) {
                        if (currentInput.attr("id")) {
                            fElement.find("label[for='" + currentInput.attr("id") + "']").css("color", "red");
                        }
                    }

                    allFormsValid = false;
                    return;
                } else {
                    // Clear any previous feedback
                    fElement.find("label[for='" + currentInput.attr("id") + "']").css("color", "inherit");
                }
            });

            if(fElement.data('is-valid')) {
                if (fElement.data('is-valid') !== "true") {
                    allFormsValid = false;
                }
            }

            if (allFormsValid) {
                fElement.find('button[type="submit"]').prop("disabled", false);

                if(onValidCallbackFn) {
                    onValidCallbackFn(fElement);
                }
            } else {
                fElement.find('button[type="submit"]').prop("disabled", true);

                if(onInvalidCallbackFn) {
                    onInvalidCallbackFn(fElement);
                }
            }
        };

        /**
         * Validate a single input.
         * @param inputElement
         */
        this.isValid = function (inputElement) {
            const elementValue = inputElement.val();

            // Check if field is required or not
            if (inputElement.prop("required")) {
                if (elementValue.length === 0) {
                    return false;
                }
            }

            // Validate email types
            if (inputElement.prop("type") === 'email') {
                const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(!re.test(elementValue)) {
                    return false;
                }
            }

            // Validate min length
            if (inputElement.attr("minlength") !== undefined) {
                if (elementValue.length < inputElement.attr("minlength")) {
                    return false;
                }
            }

            // Validate max length
            if (inputElement.attr("maxlength") !== undefined) {
                if (elementValue.length > inputElement.attr("maxlength")) {
                    return false;
                }
            }

            return true;
        };

        // Detect any changes and re-validate all inputs
        fElement.on('change keyup paste', ':input', function(e) {
            fThis.validateAll();
        });

        // Perform initial validation
        fThis.validateAll();
    };
})(jQuery);
