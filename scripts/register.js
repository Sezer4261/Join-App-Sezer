let signupFieldErrors = {};

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
    signupFieldErrors.acceptPrivacy = 'Please accept the privacy policy.';
    const policyContainer = document.querySelector('.accept-privacy-policy');
    if (policyContainer) {
        policyContainer.classList.add('input-error');
    }
    if (!state.firstErrorShown) {
        setSignupErrorText('accept-privacy-error', signupFieldErrors.acceptPrivacy);
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
    const idMap = {
        registerName: 'register-name-error',
        registerEmail: 'register-email-error',
        registerPassword: 'register-password-error',
        registerPasswordConfirm: 'register-password-confirm-error',
        acceptPrivacy: 'accept-privacy-error'
    };
    return idMap[fieldId];
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
    input.addEventListener('blur', updateSignupButtonState);
}

/**
 * Initializes password visibility toggle.
 * @param {*} param - Parameter.
 * @param {*} lockIconId - Parameter.
 * @param {*} visibilityOffIconId - Parameter.
 * @param {*} visibilityIconId } - Parameter.
 * @returns {void} Result.
 */
function initPasswordVisibilityToggle({ inputId, lockIconId, visibilityOffIconId, visibilityIconId }) {
    const elements = getPasswordVisibilityElements(inputId, lockIconId, visibilityOffIconId, visibilityIconId);
    if (!elements) return;
    bindPasswordVisibilityHandlers(elements);
    syncPasswordVisibilityIcons(elements);
}

/**
 * Returns password visibility elements.
 * @param {*} inputId - Parameter.
 * @param {*} lockIconId - Parameter.
 * @param {*} visibilityOffIconId - Parameter.
 * @param {*} visibilityIconId - Parameter.
 * @returns {*} Result.
 */
function getPasswordVisibilityElements(inputId, lockIconId, visibilityOffIconId, visibilityIconId) {
    const passwordInput = document.getElementById(inputId);
    const lockIcon = document.getElementById(lockIconId);
    const visibilityOffIcon = document.getElementById(visibilityOffIconId);
    const visibilityIcon = document.getElementById(visibilityIconId);
    if (!passwordInput || !lockIcon || !visibilityOffIcon || !visibilityIcon) return null;
    return { passwordInput, lockIcon, visibilityOffIcon, visibilityIcon };
}

/**
 * Executes bind password visibility handlers logic.
 * @param {*} elements - Parameter.
 * @returns {void} Result.
 */
function bindPasswordVisibilityHandlers(elements) {
    elements.passwordInput.addEventListener('input', () => syncPasswordVisibilityIcons(elements));
    elements.visibilityOffIcon.addEventListener('click', () => showPassword(elements));
    elements.visibilityIcon.addEventListener('click', () => hidePassword(elements));
}

/**
 * Shows password.
 * @param {*} elements - Parameter.
 * @returns {void} Result.
 */
function showPassword(elements) {
    if (elements.passwordInput.value.length === 0) return;
    setPasswordVisibility(elements, true);
}

/**
 * Hides password.
 * @param {*} elements - Parameter.
 * @returns {void} Result.
 */
function hidePassword(elements) {
    if (elements.passwordInput.value.length === 0) return;
    setPasswordVisibility(elements, false);
}

/**
 * Sets password visibility.
 * @param {*} elements - Parameter.
 * @param {*} isVisible - Parameter.
 * @returns {void} Result.
 */
function setPasswordVisibility(elements, isVisible) {
    elements.passwordInput.type = isVisible ? 'text' : 'password';
    elements.visibilityIcon.classList.toggle('is-hidden', !isVisible);
    elements.visibilityOffIcon.classList.toggle('is-hidden', isVisible);
}

/**
 * Executes sync password visibility icons logic.
 * @param {*} elements - Parameter.
 * @returns {void} Result.
 */
function syncPasswordVisibilityIcons(elements) {
    const hasValue = elements.passwordInput.value.length > 0;
    elements.lockIcon.classList.toggle('is-hidden', hasValue);

    if (!hasValue) {
        elements.visibilityOffIcon.classList.add('is-hidden');
        elements.visibilityIcon.classList.add('is-hidden');
        elements.passwordInput.type = 'password';
        return;
    }

    const isVisible = elements.passwordInput.type === 'text';
    setPasswordVisibility(elements, isVisible);
}

/**
 * Initializes signup password visibility toggles.
 * @returns {void} Result.
 */
function initSignupPasswordVisibilityToggles() {
    initPasswordVisibilityToggle({
        inputId: 'register-password',
        lockIconId: 'register-lock-icon',
        visibilityOffIconId: 'register-visibility-off-icon',
        visibilityIconId: 'register-visibility-icon'
    });

    initPasswordVisibilityToggle({
        inputId: 'register-password-confirm',
        lockIconId: 'register-confirm-lock-icon',
        visibilityOffIconId: 'register-confirm-visibility-off-icon',
        visibilityIconId: 'register-confirm-visibility-icon'
    });
}

document.addEventListener('DOMContentLoaded', () => {
    attachSignupErrorFocusHandlers();
    attachSignupFormStateHandlers();
    initSignupPasswordVisibilityToggles();
    updateSignupButtonState();
});

/**
 * Adds user.
 * @returns {Promise<*>} Result.
 */
async function addUser() {
    const values = getSignupValues();
    if (!isPasswordMatch(values)) { showPasswordMismatch(values.confirmPassword); return; }
    const newUser = buildNewUser(values); users.push(newUser);
    try {
        await saveNewUser(newUser);
        await saveNewContact(newUser);
        window.location.href = 'index.html?msg=Du hast dich erfolgreich registriert!';
    } catch (err) {
        console.error("Fehler beim Posten:", err);
        showRegistrationFailed();
    }
}

/**
 * Returns signup values.
 * @returns {*} Result.
 */
function getSignupValues() {
    return {
        name: document.getElementById('register-name'),
        email: document.getElementById('register-email'),
        password: document.getElementById('register-password'),
        confirmPassword: document.getElementById('register-password-confirm')
    };
}

/**
 * Checks whether password match.
 * @param {*} values - Parameter.
 * @returns {boolean} Result.
 */
function isPasswordMatch(values) {
    return values.password.value === values.confirmPassword.value;
}

/**
 * Shows password mismatch.
 * @param {*} confirmPassword - Parameter.
 * @returns {void} Result.
 */
function showPasswordMismatch(confirmPassword) {
    if (typeof showMessage === 'function') {
        showMessage('Passwords do not match.', 'error');
    } else {
        alert('Passwords do not match.');
    }
    confirmPassword.focus();
}

/**
 * Builds new user.
 * @param {*} values - Parameter.
 * @returns {*} Result.
 */
function buildNewUser(values) {
    return {
        name: values.name.value.trim(),
        email: values.email.value.trim(),
        password: values.password.value
    };
}

/**
 * Saves new user.
 * @param {*} newUser - Parameter.
 * @returns {Promise<*>} Result.
 */
async function saveNewUser(newUser) {
    await postData("users", newUser);
}

/**
 * Saves new contact.
 * @param {*} newUser - Parameter.
 * @returns {Promise<*>} Result.
 */
async function saveNewContact(newUser) {
    const newContact = {
        name: newUser.name,
        email: newUser.email,
        phone: ''
    };
    await postData("contacts", newContact);
}

/**
 * Shows registration failed.
 * @returns {void} Result.
 */
function showRegistrationFailed() {
    if (typeof showMessage === 'function') {
        showMessage('Registration failed. Please try again.', 'error');
    } else {
        alert('Registration failed. Please try again.');
    }
}

/**
 * Executes post data logic.
 * @param {string} path - API path.
 * @param {Object} user - User payload.
 * @returns {Promise<*>} Result.
 */
async function postData(path = "", user = {}) {
    let response = await fetch(`${BASE_URL}/${path}.json`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });

    if (!response.ok) {
        throw new Error(`HTTP-Error! Status: ${response.status}`);
    }

    return await response.json();
}

/**
 * Executes navigate to login logic.
 * @returns {void} Result.
 */
function navigateToLogin() {
     window.location.href = "index.html";
}
