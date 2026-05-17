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
        case 'register-name': {
            const nameValue = fields.nameInput?.value ?? '';
            const nameCheck = validateContactNameInput(nameValue);
            const message = nameCheck.isValid ? '' : (nameCheck.error || 'Please enter your name.');
            applySignupInputBlurValidation('register-name', fields.nameInput, message);
            if (nameCheck.isValid && fields.nameInput) {
                fields.nameInput.value = nameCheck.normalizedName;
            }
            break;
        }
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
