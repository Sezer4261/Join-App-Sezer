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
    const nameValue = fields.nameInput.value.trim();
    if (!nameValue) {
        setSignupFieldError('register-name', 'Please enter your name.', fields.nameInput, state);
    }
}

/**
 * Validates email field.
 * @param {*} fields - Parameter.
 * @param {*} state - Parameter.
 * @returns {void} Result.
 */
function validateEmailField(fields, state) {
    const emailValue = fields.emailInput.value.trim();
    if (!emailValue) {
        setSignupFieldError('register-email', 'Please enter an email address.', fields.emailInput, state);
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        setSignupFieldError('register-email', 'Please enter a valid email address.', fields.emailInput, state);
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
    const nameValue = document.getElementById('register-name')?.value.trim();
    const emailValue = document.getElementById('register-email')?.value.trim();
    const passwordValue = document.getElementById('register-password')?.value;
    const confirmValue = document.getElementById('register-password-confirm')?.value;
    const policyChecked = document.getElementById('accept-privacy')?.checked;
    const signupButton = document.querySelector('.btn-signup');

    const isComplete = Boolean(nameValue && emailValue && passwordValue && confirmValue && policyChecked);
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
        policyCheckbox.addEventListener('change', updateSignupButtonState);
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
    input.addEventListener('input', updateSignupButtonState);
    input.addEventListener('blur', () => {
        validateSignupFieldOnBlur(input.id);
        updateSignupButtonState();
    });
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
            applySignupInputBlurValidation('register-name', fields.nameInput, fields.nameInput?.value.trim() ? '' : 'Please enter your name.');
            break;
        case 'register-email': {
            const emailValue = fields.emailInput?.value.trim() ?? '';
            const message = !emailValue
                ? 'Please enter an email address.'
                : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue) ? '' : 'Please enter a valid email address.');
            applySignupInputBlurValidation('register-email', fields.emailInput, message);
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
