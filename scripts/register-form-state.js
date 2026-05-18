/**
 * Executes attach signup error focus handlers logic.
 * @returns {void} Result.
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
        if (el) el.addEventListener('focus', () => showFieldErrorMessage(fieldId));
    });
}

/**
 * Updates signup button state.
 * @returns {void} Result.
 */
/**
 * Returns raw input values from signup form.
 * @returns {Object} Result.
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
 * Returns whether the signup form is complete and error-free.
 * @param {Object} v - Input values.
 * @returns {boolean} Result.
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

function updateSignupButtonState() {
    const v = getSignupInputValues();
    const signupButton = document.querySelector('.btn-signup');
    if (signupButton) signupButton.disabled = !isSignupFormComplete(v);
}

/**
 * Executes attach signup form state handlers logic.
 * @returns {void} Result.
 */
/**
 * Binds change/blur handlers to the privacy policy checkbox.
 * @param {HTMLElement|null} policyCheckbox - Checkbox element.
 * @returns {void} Result.
 */
function bindPolicyCheckboxHandlers(policyCheckbox) {
    if (!policyCheckbox) return;
    policyCheckbox.addEventListener('change', () => {
        if (policyCheckbox.checked) applySignupPolicyBlurValidation('');
        updateSignupButtonState();
    });
    policyCheckbox.addEventListener('change', () => validateSignupFieldOnBlur('accept-privacy'));
    policyCheckbox.addEventListener('blur', () => validateSignupFieldOnBlur('accept-privacy'));
}

function attachSignupFormStateHandlers() {
    const inputs = getSignupInputElements();
    const policyCheckbox = document.getElementById('accept-privacy');
    inputs.forEach(input => bindSignupInputHandlers(input));
    bindPolicyCheckboxHandlers(policyCheckbox);
}

/**
 * Returns signup input elements.
 * @returns {HTMLElement[]} Result.
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
/** @param {Object} fields - Signup fields. */
function clearSignupNameErrorIfResolved(fields) {
    const nameCheck = validateContactNameInput(fields.nameInput?.value ?? '');
    if (nameCheck.isValid) applySignupInputBlurValidation('register-name', fields.nameInput, '');
}

/** @param {Object} fields - Signup fields. */
function clearSignupEmailErrorIfResolved(fields) {
    const emailCheck = validateEmailLikeSignup(fields.emailInput?.value ?? '');
    if (emailCheck.isValid) applySignupInputBlurValidation('register-email', fields.emailInput, '');
}

/** @param {Object} fields - Signup fields. */
function clearSignupPasswordErrorIfResolved(fields) {
    if (fields.passwordInput?.value)
        applySignupInputBlurValidation('register-password', fields.passwordInput, '');
}

/** @param {Object} fields - Signup fields. */
function clearSignupConfirmErrorIfResolved(fields) {
    const pw = fields.passwordInput?.value ?? '';
    const confirm = fields.confirmPasswordInput?.value ?? '';
    if (Boolean(confirm) && Boolean(pw) && pw === confirm)
        applySignupInputBlurValidation('register-password-confirm', fields.confirmPasswordInput, '');
}

function clearSignupFieldErrorIfResolved(fieldId) {
    if (!signupFieldErrors[fieldId]) return;
    const fields = getSignupFields();
    if (fieldId === 'register-name') clearSignupNameErrorIfResolved(fields);
    else if (fieldId === 'register-email') clearSignupEmailErrorIfResolved(fields);
    else if (fieldId === 'register-password') clearSignupPasswordErrorIfResolved(fields);
    else if (fieldId === 'register-password-confirm') clearSignupConfirmErrorIfResolved(fields);
}

/**
 * Validates a single signup field on blur.
 * @param {string} fieldId - Field identifier.
 * @returns {void} Result.
 */
/** @param {Object} fields - Signup fields. */
function validateSignupNameOnBlur(fields) {
    const nameCheck = validateContactNameInput(fields.nameInput?.value ?? '');
    const message = nameCheck.isValid ? '' : (nameCheck.error || 'Please enter your name.');
    applySignupInputBlurValidation('register-name', fields.nameInput, message);
    if (nameCheck.isValid && fields.nameInput) fields.nameInput.value = nameCheck.normalizedName;
}

/** @param {Object} fields - Signup fields. */
function validateSignupEmailOnBlur(fields) {
    const emailCheck = validateEmailLikeSignup(fields.emailInput?.value ?? '');
    const message = emailCheck.isValid ? '' : getSignupEmailErrorMessage(emailCheck);
    applySignupInputBlurValidation('register-email', fields.emailInput, message);
    if (emailCheck.isValid && fields.emailInput) fields.emailInput.value = emailCheck.normalizedEmail;
}

/** @param {Object} fields - Signup fields. */
function validateSignupPasswordOnBlur(fields) {
    applySignupInputBlurValidation('register-password', fields.passwordInput,
        fields.passwordInput?.value ? '' : 'Please enter a password.');
}

/** @param {Object} fields - Signup fields. */
function validateSignupConfirmOnBlur(fields) {
    const confirmValue = fields.confirmPasswordInput?.value ?? '';
    const passwordValue = fields.passwordInput?.value ?? '';
    let message = '';
    if (!confirmValue) message = 'Please confirm your password.';
    else if (passwordValue && passwordValue !== confirmValue) message = 'Passwords do not match.';
    applySignupInputBlurValidation('register-password-confirm', fields.confirmPasswordInput, message);
}

/** @param {Object} fields - Signup fields. */
function validateSignupPolicyOnBlur(fields) {
    const message = fields.policyCheckbox?.checked ? '' : 'Please accept the privacy policy.';
    applySignupPolicyBlurValidation(message);
}

function validateSignupFieldOnBlur(fieldId) {
    const fields = getSignupFields();
    if (fieldId === 'register-name') validateSignupNameOnBlur(fields);
    else if (fieldId === 'register-email') validateSignupEmailOnBlur(fields);
    else if (fieldId === 'register-password') validateSignupPasswordOnBlur(fields);
    else if (fieldId === 'register-password-confirm') validateSignupConfirmOnBlur(fields);
    else if (fieldId === 'accept-privacy') validateSignupPolicyOnBlur(fields);
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
