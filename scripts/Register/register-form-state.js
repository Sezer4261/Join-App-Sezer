/** @file Signup form field error state and handlers. */

/**
 * Attaches focus handlers that re-show stored validation errors for each signup field.
 * @returns {void}
 */
function attachSignupErrorFocusHandlers() {
    const fieldIds = [
        'register-name',
        'register-email',
        'register-password',
        'register-password-confirm',
        'accept-privacy'
    ];
    fieldIds.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (el) el.addEventListener('focus', () => handleSignupFieldFocus(fieldId));
    });
}

/**
 * Re-displays the stored validation error when a signup field receives focus.
 * @param {string} fieldId - DOM id of the signup field that received focus.
 * @returns {void}
 */
function handleSignupFieldFocus(fieldId) {
    showFieldErrorMessage(fieldId);
}

/**
 * Reads the current raw values from all signup form inputs and the privacy checkbox.
 * @returns {Object} Current field values used to evaluate form completeness.
 */
function getSignupInputValues() {
    return {
        nameRaw: document.getElementById('register-name')?.value ?? '',
        emailRaw: document.getElementById('register-email')?.value ?? '',
        passwordValue: document.getElementById('register-password')?.value,
        confirmValue: document.getElementById('register-password-confirm')?.value,
        policyChecked: document.getElementById('accept-privacy')?.checked
    };
}

/**
 * Determines whether every signup field is valid and free of active error state.
 * @param {Object} v - Current field values from getSignupInputValues.
 * @returns {boolean} Whether the signup button should be enabled for submission.
 */
function isSignupFormComplete(v) {
    const nameValid = validateContactNameInput(v.nameRaw).isValid;
    const emailValid = validateEmailLikeSignup(v.emailRaw).isValid;
    const passwordValid = Boolean(v.passwordValue);
    const confirmValid = Boolean(v.confirmValue) && passwordValid && v.passwordValue === v.confirmValue;
    const policyValid = Boolean(v.policyChecked);
    const hasActiveErrors = Object.keys(signupFieldErrors || {}).length > 0;
    return nameValid && emailValid && passwordValid && confirmValid && policyValid && !hasActiveErrors;
}

/**
 * Enables or disables the signup submit button based on current form completeness.
 * @returns {void}
 */
function updateSignupButtonState() {
    const v = getSignupInputValues();
    const signupButton = document.querySelector('.btn-signup');
    if (signupButton) signupButton.disabled = !isSignupFormComplete(v);
}

/**
 * Clears the privacy policy error and updates button state when the checkbox is checked.
 * @param {HTMLInputElement} policyCheckbox - Privacy policy acceptance checkbox element.
 * @returns {void}
 */
function handlePolicyCheckboxChange(policyCheckbox) {
    if (policyCheckbox.checked) applySignupPolicyBlurValidation('');
    updateSignupButtonState();
}

/**
 * Binds change and blur handlers to the privacy policy acceptance checkbox.
 * @param {HTMLElement|null} policyCheckbox - Privacy policy acceptance checkbox element.
 * @returns {void}
 */
function bindPolicyCheckboxHandlers(policyCheckbox) {
    if (!policyCheckbox) return;
    policyCheckbox.addEventListener('change', () => handlePolicyCheckboxChange(policyCheckbox));
    policyCheckbox.addEventListener('change', () => validateSignupFieldOnBlur('accept-privacy'));
    policyCheckbox.addEventListener('blur', () => validateSignupFieldOnBlur('accept-privacy'));
}

/**
 * Attaches input and blur handlers to all signup text inputs and the privacy checkbox.
 * @returns {void}
 */
function attachSignupFormStateHandlers() {
    const inputs = getSignupInputElements();
    const policyCheckbox = document.getElementById('accept-privacy');
    inputs.forEach(input => bindSignupInputHandlers(input));
    bindPolicyCheckboxHandlers(policyCheckbox);
}

/**
 * Returns an array of non-null signup text input elements.
 * @returns {HTMLElement[]} Signup input elements for name, email, password, and confirm password.
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
 * Clears resolved errors and re-validates a signup field when the user types into it.
 * @param {HTMLElement} input - Signup input element whose value changed.
 * @returns {void}
 */
function handleSignupInputChange(input) {
    clearSignupFieldErrorIfResolved(input.id);
    updateSignupButtonState();
}

/**
 * Validates a signup field and updates button state when it loses focus.
 * @param {HTMLElement} input - Signup input element that lost focus.
 * @returns {void}
 */
function handleSignupInputBlur(input) {
    validateSignupFieldOnBlur(input.id);
    updateSignupButtonState();
}

/**
 * Binds input and blur handlers to a single signup text input field.
 * @param {HTMLElement} input - Signup input element to wire up with event handlers.
 * @returns {void}
 */
function bindSignupInputHandlers(input) {
    input.addEventListener('input', () => handleSignupInputChange(input));
    input.addEventListener('blur', () => handleSignupInputBlur(input));
}

/**
 * Clears the name field error when the current value passes contact name validation.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @returns {void}
 */
function clearSignupNameErrorIfResolved(fields) {
    const nameCheck = validateContactNameInput(fields.nameInput?.value ?? '');
    if (nameCheck.isValid) applySignupInputBlurValidation('register-name', fields.nameInput, '');
}

/**
 * Clears the email field error when the current value passes email validation.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @returns {void}
 */
function clearSignupEmailErrorIfResolved(fields) {
    const emailCheck = validateEmailLikeSignup(fields.emailInput?.value ?? '');
    if (emailCheck.isValid) applySignupInputBlurValidation('register-email', fields.emailInput, '');
}

/**
 * Clears the password field error when the field contains a non-empty value.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @returns {void}
 */
function clearSignupPasswordErrorIfResolved(fields) {
    if (fields.passwordInput?.value)
        applySignupInputBlurValidation('register-password', fields.passwordInput, '');
}

/**
 * Clears the confirm-password error when both password fields match and are non-empty.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @returns {void}
 */
function clearSignupConfirmErrorIfResolved(fields) {
    const pw = fields.passwordInput?.value ?? '';
    const confirm = fields.confirmPasswordInput?.value ?? '';
    if (Boolean(confirm) && Boolean(pw) && pw === confirm)
        applySignupInputBlurValidation('register-password-confirm', fields.confirmPasswordInput, '');
}

/**
 * Clears a previously shown field error once the field value becomes valid again during typing.
 * @param {string} fieldId - DOM id of the signup field whose error may be cleared.
 * @returns {void}
 */
function clearSignupFieldErrorIfResolved(fieldId) {
    if (!signupFieldErrors[fieldId]) return;
    const fields = getSignupFields();
    if (fieldId === 'register-name') clearSignupNameErrorIfResolved(fields);
    else if (fieldId === 'register-email') clearSignupEmailErrorIfResolved(fields);
    else if (fieldId === 'register-password') clearSignupPasswordErrorIfResolved(fields);
    else if (fieldId === 'register-password-confirm') clearSignupConfirmErrorIfResolved(fields);
}

/**
 * Validates the signup name field on blur and normalizes the value when valid.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @returns {void}
 */
function validateSignupNameOnBlur(fields) {
    const nameCheck = validateContactNameInput(fields.nameInput?.value ?? '');
    const message = nameCheck.isValid ? '' : (nameCheck.error || 'Please enter your name.');
    applySignupInputBlurValidation('register-name', fields.nameInput, message);
    if (nameCheck.isValid && fields.nameInput) fields.nameInput.value = nameCheck.normalizedName;
}

/**
 * Validates the signup email field on blur and normalizes the value when valid.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @returns {void}
 */
function validateSignupEmailOnBlur(fields) {
    const emailCheck = validateEmailLikeSignup(fields.emailInput?.value ?? '');
    const message = emailCheck.isValid ? '' : getSignupEmailErrorMessage(emailCheck);
    applySignupInputBlurValidation('register-email', fields.emailInput, message);
    if (emailCheck.isValid && fields.emailInput) fields.emailInput.value = emailCheck.normalizedEmail;
}

/**
 * Validates that the signup password field is not empty on blur.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @returns {void}
 */
function validateSignupPasswordOnBlur(fields) {
    applySignupInputBlurValidation('register-password', fields.passwordInput,
        fields.passwordInput?.value ? '' : 'Please enter a password.');
}

/**
 * Validates that the confirm-password field is filled and matches the password on blur.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @returns {void}
 */
function validateSignupConfirmOnBlur(fields) {
    const confirmValue = fields.confirmPasswordInput?.value ?? '';
    const passwordValue = fields.passwordInput?.value ?? '';
    let message = '';
    if (!confirmValue) message = 'Please confirm your password.';
    else if (passwordValue && passwordValue !== confirmValue) message = 'Passwords do not match.';
    applySignupInputBlurValidation('register-password-confirm', fields.confirmPasswordInput, message);
}

/**
 * Validates that the privacy policy checkbox is checked on blur.
 * @param {Object} fields - Signup field element references from getSignupFields.
 * @returns {void}
 */
function validateSignupPolicyOnBlur(fields) {
    const message = fields.policyCheckbox?.checked ? '' : 'Please accept the privacy policy.';
    applySignupPolicyBlurValidation(message);
}

/**
 * Dispatches blur validation to the appropriate field handler based on field id.
 * @param {string} fieldId - DOM id of the signup field that lost focus.
 * @returns {void}
 */
function validateSignupFieldOnBlur(fieldId) {
    const fields = getSignupFields();
    if (fieldId === 'register-name') validateSignupNameOnBlur(fields);
    else if (fieldId === 'register-email') validateSignupEmailOnBlur(fields);
    else if (fieldId === 'register-password') validateSignupPasswordOnBlur(fields);
    else if (fieldId === 'register-password-confirm') validateSignupConfirmOnBlur(fields);
    else if (fieldId === 'accept-privacy') validateSignupPolicyOnBlur(fields);
}

/**
 * Applies blur validation state to a signup text input field and its inline error span.
 * @param {string} fieldId - DOM id of the signup field being validated.
 * @param {HTMLElement} input - Input element whose error class and span will be updated.
 * @param {string} message - Validation error message, or empty string when the field is valid.
 * @returns {void}
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
 * Applies blur validation state to the privacy policy checkbox and its error container.
 * @param {string} message - Validation error message, or empty string when the checkbox is checked.
 * @returns {void}
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
