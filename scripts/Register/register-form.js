/** @file Signup form validation and input handling. */
let signupFieldErrors = {};

const SIGNUP_ERROR_ID_MAP = {
    'register-name': 'register-name-error',
    'register-email': 'register-email-error',
    'register-password': 'register-password-error',
    'register-password-confirm': 'register-password-confirm-error',
    'accept-privacy': 'accept-privacy-error',
    registerName: 'register-name-error',
    registerEmail: 'register-email-error',
    registerPassword: 'register-password-error',
    registerPasswordConfirm: 'register-password-confirm-error',
    acceptPrivacy: 'accept-privacy-error'
};

/**
 * Prevents default form submission and delegates to addUser when validation passes.
 * @param {Event} event - Submit event from the signup form.
 * @returns {void}
 */
function handleSignupSubmit(event) {
    event.preventDefault();
    if (!validateSignupForm()) {
        return;
    }
    addUser();
}

/**
 * Validates all signup form fields and returns whether the form may be submitted.
 * @returns {boolean} Whether every field passed validation without errors.
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
 * Collects DOM references for all signup form inputs and the privacy checkbox.
 * @returns {Object} Signup field element references keyed by logical field name.
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
 * Clears all signup field error states, inline messages, and the policy container highlight.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @returns {void}
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
 * Clears the text content of all signup inline error message spans.
 * @returns {void}
 */
function clearSignupErrorTexts() {
    setSignupErrorText('register-name-error', '');
    setSignupErrorText('register-email-error', '');
    setSignupErrorText('register-password-error', '');
    setSignupErrorText('register-password-confirm-error', '');
    setSignupErrorText('accept-privacy-error', '');
}

/**
 * Sets the text content of a signup inline error span identified by its DOM id.
 * @param {string} id - DOM id of the error message span element.
 * @param {string} value - Error message text to display, or empty string to clear.
 * @returns {void}
 */
function setSignupErrorText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/**
 * Removes error styling from the privacy policy acceptance container.
 * @returns {void}
 */
function clearPolicyError() {
    const policyContainer = document.querySelector('.accept-privacy-policy');
    if (policyContainer) {
        policyContainer.classList.remove('input-error');
    }
}

/**
 * Validates the signup name field using shared contact name rules and normalizes the value.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @param {{ firstErrorShown: boolean }} state - Mutable object tracking whether the first error was shown.
 * @returns {void}
 */
function validateNameField(fields, state) {
    const nameValue = fields.nameInput.value;
    const nameCheck = validateContactNameInput(nameValue);

    if (!nameCheck.isValid) {
        setSignupFieldError('register-name', nameCheck.error || 'Please enter your name.', fields.nameInput, state);
        return;
    }

    fields.nameInput.value = nameCheck.normalizedName;
}

/**
 * Validates the signup email field using strict email rules and normalizes the value.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @param {{ firstErrorShown: boolean }} state - Mutable object tracking whether the first error was shown.
 * @returns {void}
 */
function validateEmailField(fields, state) {
    const emailValue = fields.emailInput.value;
    const emailCheck = validateEmailLikeSignup(emailValue);

    if (!emailCheck.isValid) {
        const message = getSignupEmailErrorMessage(emailCheck);
        setSignupFieldError('register-email', message, fields.emailInput, state);
        return;
    }

    fields.emailInput.value = emailCheck.normalizedEmail;
}

/**
 * Maps strict email validation failure reasons to user-facing signup error messages.
 * @param {{ isValid: boolean, normalizedEmail: string, error: string, reason?: string }} emailCheck - Result object from validateEmailLikeSignup.
 * @returns {string} Localized error message appropriate for the validation failure reason.
 */
function getSignupEmailErrorMessage(emailCheck) {
    switch (emailCheck?.reason) {
        case 'required':
            return 'Please enter an email address.';
        case 'too_long':
            return 'Email address is too long.';
        case 'pattern':
            return 'Please enter a valid email address.';
        default:
            return emailCheck?.error || 'Please enter a valid email address.';
    }
}

/**
 * Validates that the signup password field is not empty on form submission.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @param {{ firstErrorShown: boolean }} state - Mutable object tracking whether the first error was shown.
 * @returns {void}
 */
function validatePasswordField(fields, state) {
    const passwordValue = fields.passwordInput.value;
    if (!passwordValue) {
        setSignupFieldError('register-password', 'Please enter a password.', fields.passwordInput, state);
    }
}

/**
 * Validates that the confirm-password field is filled and matches the password field.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @param {{ firstErrorShown: boolean }} state - Mutable object tracking whether the first error was shown.
 * @returns {void}
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
 * Validates that the privacy policy acceptance checkbox is checked on form submission.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @param {{ firstErrorShown: boolean }} state - Mutable object tracking whether the first error was shown.
 * @returns {void}
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
 * Records a field error, updates the UI, and focuses the first invalid field encountered.
 * @param {string} fieldId - DOM id or logical identifier of the invalid field.
 * @param {string} message - User-facing validation error message for the field.
 * @param {HTMLElement} input - Input element that will receive the error CSS class and focus.
 * @param {{ firstErrorShown: boolean }} state - Mutable object tracking whether the first error was shown.
 * @returns {void}
 */
function setSignupFieldError(fieldId, message, input, state) {
    signupFieldErrors[fieldId] = message;
    input.classList.add('input-error');
    setSignupErrorText(getSignupErrorId(fieldId), message);
    if (!state.firstErrorShown) {
        input.focus();
        state.firstErrorShown = true;
    }
}

/**
 * Returns the DOM id of the inline error span associated with a signup field id.
 * @param {string} fieldId - DOM id or logical identifier of the signup field.
 * @returns {string|undefined} DOM id of the corresponding error message span, if mapped.
 */
function getSignupErrorId(fieldId) {
    return SIGNUP_ERROR_ID_MAP[fieldId];
}

/**
 * Re-displays the stored validation error message when the user focuses an invalid field.
 * @param {string} fieldId - DOM id or logical identifier of the focused field.
 * @returns {void}
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
 * Clears the text content of all signup inline error message spans at once.
 * @returns {void}
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

/**
 * Initializes signup form handlers, password toggles, and button state when the page loads.
 * @returns {void}
 */
function initSignupFormPage() {
    attachSignupErrorFocusHandlers();
    attachSignupFormStateHandlers();
    initSignupPasswordVisibilityToggles();
    updateSignupButtonState();
}

document.addEventListener('DOMContentLoaded', initSignupFormPage);
