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
    const ids = [
        'register-name-error',
        'register-email-error',
        'register-password-error',
        'register-password-confirm-error',
        'accept-privacy-error'
    ];
    ids.forEach(spanId => {
        const span = document.getElementById(spanId);
        if (span) span.textContent = '';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    attachSignupErrorFocusHandlers();
    attachSignupFormStateHandlers();
    initSignupPasswordVisibilityToggles();
    updateSignupButtonState();
});
