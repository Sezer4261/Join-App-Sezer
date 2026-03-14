let signupFieldErrors = {};

const SIGNUP_ERROR_ID_MAP = {
    'register-name': 'register-name-error',
    'register-email': 'register-email-error',
    'register-password': 'register-password-error',
    'register-password-confirm': 'register-password-confirm-error',
    'accept-privacy': 'accept-privacy-error',

    // Backwards-compatible aliases (falls irgendwo camelCase verwendet wird)
    registerName: 'register-name-error',
    registerEmail: 'register-email-error',
    registerPassword: 'register-password-error',
    registerPasswordConfirm: 'register-password-confirm-error',
    acceptPrivacy: 'accept-privacy-error'
};

/**
 * Executes handle signup submit logic.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function handleSignupSubmit(event) {
    event.preventDefault();
    if (!validateSignupForm()) {
        return;
    }
    addUser();
}

/**
 * Validates signup form.
 * @returns {void} Result.
 */
function validateSignupForm() {
    const fields = getSignupFields();
    resetSignupErrors(fields);
    const state = { firstErrorShown: false };
    validateNameField(fields, state);
    validateEmailField(fields, state);
    validatePasswordField(fields, state);
    validateConfirmPasswordField(fields, state);
    validatePolicyField(fields, state);
    return !state.firstErrorShown;
}

/**
 * Returns signup fields.
 * @returns {*} Result.
 */
function getSignupFields() {
    return {
        nameInput: document.getElementById('register-name'),
        emailInput: document.getElementById('register-email'),
        passwordInput: document.getElementById('register-password'),
        confirmPasswordInput: document.getElementById('register-password-confirm'),
        policyCheckbox: document.getElementById('accept-privacy')
    };
}

/**
 * Executes reset signup errors logic.
 * @param {*} fields - Parameter.
 * @returns {void} Result.
 */
function resetSignupErrors(fields) {
    signupFieldErrors = {};
    [fields.nameInput, fields.emailInput, fields.passwordInput, fields.confirmPasswordInput].forEach(input => {
        input.classList.remove('input-error');
    });
    clearSignupErrorTexts();
    clearPolicyError();
}

/**
 * Clears signup error texts.
 * @returns {void} Result.
 */
function clearSignupErrorTexts() {
    setSignupErrorText('register-name-error', '');
    setSignupErrorText('register-email-error', '');
    setSignupErrorText('register-password-error', '');
    setSignupErrorText('register-password-confirm-error', '');
    setSignupErrorText('accept-privacy-error', '');
}

/**
 * Sets signup error text.
 * @param {string} id - Identifier.
 * @param {string} value - Value.
 * @returns {void} Result.
 */
function setSignupErrorText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/**
 * Clears policy error.
 * @returns {void} Result.
 */
function clearPolicyError() {
    const policyContainer = document.querySelector('.accept-privacy-policy');
    if (policyContainer) {
        policyContainer.classList.remove('input-error');
    }
}

/**
 * Validates name field.
 * @param {*} fields - Parameter.
 * @param {*} state - Parameter.
 * @returns {void} Result.
 */
function validateNameField(fields, state) {
    const nameValue = fields.nameInput.value;
    const nameCheck = validateContactNameInput(nameValue);

    if (!nameCheck.isValid) {
        setSignupFieldError('register-name', nameCheck.error || 'Please enter your name.', fields.nameInput, state);
        return;
    }

    // Normalize (trim/collapse whitespace) to keep consistent formatting.
    fields.nameInput.value = nameCheck.normalizedName;
}

/**
 * Validates email field.
 * @param {*} fields - Parameter.
 * @param {*} state - Parameter.
 * @returns {void} Result.
 */
function validateEmailField(fields, state) {
    const emailValue = fields.emailInput.value;
    const emailCheck = validateEmailLikeSignup(emailValue);

    if (!emailCheck.isValid) {
        const message = getSignupEmailErrorMessage(emailCheck);
        setSignupFieldError('register-email', message, fields.emailInput, state);
        return;
    }

    // Normalize (lowercase) so the stored value is consistent across the app.
    fields.emailInput.value = emailCheck.normalizedEmail;
}

/**
 * Maps strict email validation results to the signup form's error messages.
 * @param {{ isValid: boolean, normalizedEmail: string, error: string, reason?: string }} emailCheck - Validation result.
 * @returns {string} Message.
 */
function getSignupEmailErrorMessage(emailCheck) {
    switch (emailCheck?.reason) {
        case 'required':
            return 'Please enter an email address.';
        case 'too_long':
            return 'Maximum 20 characters allowed.';
        case 'pattern':
            return 'Please enter a valid email address.';
        default:
            // Fallback (keeps behavior stable if reason is missing)
            return emailCheck?.error || 'Please enter a valid email address.';
    }
}

/**
 * Validates password field.
 * @param {*} fields - Parameter.
 * @param {*} state - Parameter.
 * @returns {void} Result.
 */
function validatePasswordField(fields, state) {
    const passwordValue = fields.passwordInput.value;
    if (!passwordValue) {
        setSignupFieldError('register-password', 'Please enter a password.', fields.passwordInput, state);
    }
}

/**
 * Validates confirm password field.
 * @param {*} fields - Parameter.
 * @param {*} state - Parameter.
 * @returns {void} Result.
 */
function validateConfirmPasswordField(fields, state) {
    const passwordValue = fields.passwordInput.value;
    const confirmValue = fields.confirmPasswordInput.value;
    if (!confirmValue) {
        setSignupFieldError('register-password-confirm', 'Please confirm your password.', fields.confirmPasswordInput, state);
        return;
    }
    if (passwordValue && passwordValue !== confirmValue) {
        setSignupFieldError('register-password-confirm', 'Passwords do not match.', fields.confirmPasswordInput, state);
    }
}

/**
 * Validates policy field.
 * @param {*} fields - Parameter.
 * @param {*} state - Parameter.
 * @returns {void} Result.
 */
function validatePolicyField(fields, state) {
    if (fields.policyCheckbox.checked) return;
    signupFieldErrors['accept-privacy'] = 'Please accept the privacy policy.';
    const policyContainer = document.querySelector('.accept-privacy-policy');
    if (policyContainer) {
        policyContainer.classList.add('input-error');
    }
    if (!state.firstErrorShown) {
        setSignupErrorText('accept-privacy-error', signupFieldErrors['accept-privacy']);
        state.firstErrorShown = true;
    }
}

/**
 * Sets signup field error.
 * @param {*} fieldId - Parameter.
 * @param {string} message - Message text.
 * @param {HTMLElement} input - Input element.
 * @param {*} state - Parameter.
 * @returns {void} Result.
 */
function setSignupFieldError(fieldId, message, input, state) {
    signupFieldErrors[fieldId] = message;
    input.classList.add('input-error');
    if (!state.firstErrorShown) {
        setSignupErrorText(getSignupErrorId(fieldId), message);
        input.focus();
        state.firstErrorShown = true;
    }
}

/**
 * Returns signup error id.
 * @param {*} fieldId - Parameter.
 * @returns {*} Result.
 */
function getSignupErrorId(fieldId) {
    return SIGNUP_ERROR_ID_MAP[fieldId];
}

/**
 * Shows field error message.
 * @param {*} fieldId - Parameter.
 * @returns {void} Result.
 */
function showFieldErrorMessage(fieldId) {
    clearAllSignupErrorMessages();
    const message = signupFieldErrors[fieldId];
    if (!message) return;
    const spanId = getSignupErrorId(fieldId);
    const span = document.getElementById(spanId);
    if (span) {
        span.textContent = message;
    }
}

/**
 * Clears all signup error messages.
 * @returns {void} Result.
 */
function clearAllSignupErrorMessages() {
    const ids = Object.values({
        registerName: 'register-name-error',
        registerEmail: 'register-email-error',
        registerPassword: 'register-password-error',
        registerPasswordConfirm: 'register-password-confirm-error',
        acceptPrivacy: 'accept-privacy-error'
    });
    ids.forEach(spanId => {
        const span = document.getElementById(spanId);
        if (span) {
            span.textContent = '';
        }
    });
}

/**
 * Executes attach signup error focus handlers logic.
 * @returns {void} Result.
 */
function attachSignupErrorFocusHandlers() {
    const pairs = [
        { fieldId: 'register-name', event: 'focus' },
        { fieldId: 'register-email', event: 'focus' },
        { fieldId: 'register-password', event: 'focus' },
        { fieldId: 'register-password-confirm', event: 'focus' },
        { fieldId: 'accept-privacy', event: 'focus' },
    ];

    pairs.forEach(({ fieldId, event }) => {
        const el = document.getElementById(fieldId);
        if (el) {
            el.addEventListener(event, () => showFieldErrorMessage(fieldId));
        }
    });
}

/**
 * Updates signup button state.
 * @returns {void} Result.
 */
function updateSignupButtonState() {
    const nameRaw = document.getElementById('register-name')?.value ?? '';
    const emailRaw = document.getElementById('register-email')?.value ?? '';
    const passwordValue = document.getElementById('register-password')?.value;
    const confirmValue = document.getElementById('register-password-confirm')?.value;
    const policyChecked = document.getElementById('accept-privacy')?.checked;
    const signupButton = document.querySelector('.btn-signup');

    const nameValid = validateContactNameInput(nameRaw).isValid;
    const emailValid = validateEmailLikeSignup(emailRaw).isValid;
    const passwordValid = Boolean(passwordValue);
    const confirmValid = Boolean(confirmValue) && Boolean(passwordValue) && passwordValue === confirmValue;
    const policyValid = Boolean(policyChecked);
    const hasActiveErrors = Object.keys(signupFieldErrors || {}).length > 0;

    const isComplete = Boolean(
        nameValid &&
        emailValid &&
        passwordValid &&
        confirmValid &&
        policyValid &&
        !hasActiveErrors
    );
    if (signupButton) {
        signupButton.disabled = !isComplete;
    }
}

/**
 * Executes attach signup form state handlers logic.
 * @returns {void} Result.
 */
function attachSignupFormStateHandlers() {
    const inputs = getSignupInputElements();
    const policyCheckbox = document.getElementById('accept-privacy');
    inputs.forEach(input => bindSignupInputHandlers(input));
    if (policyCheckbox) {
        policyCheckbox.addEventListener('change', () => {
            // Clear a previously shown error once the checkbox is valid again.
            if (policyCheckbox.checked) {
                applySignupPolicyBlurValidation('');
            }
            updateSignupButtonState();
        });
        policyCheckbox.addEventListener('change', () => validateSignupFieldOnBlur('accept-privacy'));
        policyCheckbox.addEventListener('blur', () => validateSignupFieldOnBlur('accept-privacy'));
    }
}

/**
 * Returns signup input elements.
 * @returns {*} Result.
 */
function getSignupInputElements() {
    return [
        document.getElementById('register-name'),
        document.getElementById('register-email'),
        document.getElementById('register-password'),
        document.getElementById('register-password-confirm')
    ].filter(Boolean);
}

/**
 * Executes bind signup input handlers logic.
 * @param {HTMLElement} input - Input element.
 * @returns {void} Result.
 */
function bindSignupInputHandlers(input) {
    input.addEventListener('input', () => {
        clearSignupFieldErrorIfResolved(input.id);
        updateSignupButtonState();
    });
    input.addEventListener('blur', () => {
        validateSignupFieldOnBlur(input.id);
        updateSignupButtonState();
    });
}

/**
 * Clears an already shown field error once the field becomes valid again.
 * Does not create new errors while typing.
 * @param {string} fieldId - Field identifier.
 * @returns {void} Result.
 */
function clearSignupFieldErrorIfResolved(fieldId) {
    const fields = getSignupFields();

    switch (fieldId) {
        case 'register-name': {
            const nameCheck = validateContactNameInput(fields.nameInput?.value ?? '');
            if (nameCheck.isValid) {
                applySignupInputBlurValidation('register-name', fields.nameInput, '');
            }
            break;
        }
        case 'register-email': {
            const emailCheck = validateEmailLikeSignup(fields.emailInput?.value ?? '');
            if (emailCheck.isValid) {
                applySignupInputBlurValidation('register-email', fields.emailInput, '');
            }
            break;
        }
        case 'register-password': {
            if (fields.passwordInput?.value) {
                applySignupInputBlurValidation('register-password', fields.passwordInput, '');
            }
            break;
        }
        case 'register-password-confirm': {
            const passwordValue = fields.passwordInput?.value ?? '';
            const confirmValue = fields.confirmPasswordInput?.value ?? '';
            const isValid = Boolean(confirmValue) && Boolean(passwordValue) && passwordValue === confirmValue;
            if (isValid) {
                applySignupInputBlurValidation('register-password-confirm', fields.confirmPasswordInput, '');
            }
            break;
        }
        default:
            break;
    }
}

/**
 * Validates a single signup field on blur.
 * @param {string} fieldId - Field identifier.
 * @returns {void} Result.
 */
function validateSignupFieldOnBlur(fieldId) {
    const fields = getSignupFields();
    switch (fieldId) {
        case 'register-name':
            {
                const nameValue = fields.nameInput?.value ?? '';
                const nameCheck = validateContactNameInput(nameValue);
                const message = nameCheck.isValid ? '' : (nameCheck.error || 'Please enter your name.');
                applySignupInputBlurValidation('register-name', fields.nameInput, message);

                if (nameCheck.isValid && fields.nameInput) {
                    fields.nameInput.value = nameCheck.normalizedName;
                }
            }
            break;
        case 'register-email': {
            const emailValue = fields.emailInput?.value ?? '';
            const emailCheck = validateEmailLikeSignup(emailValue);
            const message = emailCheck.isValid ? '' : getSignupEmailErrorMessage(emailCheck);
            applySignupInputBlurValidation('register-email', fields.emailInput, message);

            if (emailCheck.isValid && fields.emailInput) {
                fields.emailInput.value = emailCheck.normalizedEmail;
            }
            break;
        }
        case 'register-password':
            applySignupInputBlurValidation('register-password', fields.passwordInput, fields.passwordInput?.value ? '' : 'Please enter a password.');
            break;
        case 'register-password-confirm': {
            const confirmValue = fields.confirmPasswordInput?.value ?? '';
            const passwordValue = fields.passwordInput?.value ?? '';
            let message = '';
            if (!confirmValue) {
                message = 'Please confirm your password.';
            } else if (passwordValue && passwordValue !== confirmValue) {
                message = 'Passwords do not match.';
            }
            applySignupInputBlurValidation('register-password-confirm', fields.confirmPasswordInput, message);
            break;
        }
        case 'accept-privacy': {
            const message = fields.policyCheckbox?.checked ? '' : 'Please accept the privacy policy.';
            applySignupPolicyBlurValidation(message);
            break;
        }
        default:
            break;
    }
}

/**
 * Applies blur validation state to signup input fields.
 * @param {string} fieldId - Field identifier.
 * @param {HTMLElement} input - Input element.
 * @param {string} message - Validation message.
 * @returns {void} Result.
 */
function applySignupInputBlurValidation(fieldId, input, message) {
    const errorId = getSignupErrorId(fieldId);
    if (message) {
        signupFieldErrors[fieldId] = message;
        input?.classList.add('input-error');
        setSignupErrorText(errorId, message);
        return;
    }
    delete signupFieldErrors[fieldId];
    input?.classList.remove('input-error');
    setSignupErrorText(errorId, '');
}

/**
 * Applies blur validation state to the signup privacy field.
 * @param {string} message - Validation message.
 * @returns {void} Result.
 */
function applySignupPolicyBlurValidation(message) {
    const policyContainer = document.querySelector('.accept-privacy-policy');
    if (message) {
        signupFieldErrors['accept-privacy'] = message;
        policyContainer?.classList.add('input-error');
        setSignupErrorText('accept-privacy-error', message);
        return;
    }
    delete signupFieldErrors['accept-privacy'];
    policyContainer?.classList.remove('input-error');
    setSignupErrorText('accept-privacy-error', '');
}

document.addEventListener('DOMContentLoaded', () => {
    attachSignupErrorFocusHandlers();
    attachSignupFormStateHandlers();
    initSignupPasswordVisibilityToggles();
    updateSignupButtonState();
});
