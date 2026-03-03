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
