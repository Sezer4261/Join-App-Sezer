/** @file Password show/hide toggle on signup form. */

/**
 * Initializes password visibility toggle icons and handlers for a single signup password field.
 * @param {{ inputId: string, lockIconId: string, visibilityOffIconId: string, visibilityIconId: string }} config - DOM ids for the password input and its three icons.
 * @returns {void}
 */
function initPasswordVisibilityToggle({ inputId, lockIconId, visibilityOffIconId, visibilityIconId }) {
    const elements = getPasswordVisibilityElements(inputId, lockIconId, visibilityOffIconId, visibilityIconId);
    if (!elements) return;
    bindPasswordVisibilityHandlers(elements);
    syncPasswordVisibilityIcons(elements);
}

/**
 * Collects DOM references for a signup password field and its visibility icons.
 * @param {string} inputId - DOM id of the password input element.
 * @param {string} lockIconId - DOM id of the lock icon shown when the field is empty.
 * @param {string} visibilityOffIconId - DOM id of the icon that reveals the password.
 * @param {string} visibilityIconId - DOM id of the icon that hides the password.
 * @returns {Object|null} Element references object, or null when any required element is missing.
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
 * Binds input and click handlers that control password visibility for a signup field.
 * @param {Object} elements - Password visibility element references from getPasswordVisibilityElements.
 * @returns {void}
 */
function bindPasswordVisibilityHandlers(elements) {
    elements.passwordInput.addEventListener('input', () => handleSignupPasswordInput(elements));
    elements.visibilityOffIcon.addEventListener('click', () => handleSignupShowPasswordClick(elements));
    elements.visibilityIcon.addEventListener('click', () => handleSignupHidePasswordClick(elements));
}

/**
 * Syncs password icon visibility when the user types in a signup password field.
 * @param {Object} elements - Password visibility element references from getPasswordVisibilityElements.
 * @returns {void}
 */
function handleSignupPasswordInput(elements) {
    syncPasswordVisibilityIcons(elements);
}

/**
 * Reveals the signup password when the visibility-off icon is clicked.
 * @param {Object} elements - Password visibility element references from getPasswordVisibilityElements.
 * @returns {void}
 */
function handleSignupShowPasswordClick(elements) {
    showPassword(elements);
}

/**
 * Hides the signup password when the visibility icon is clicked.
 * @param {Object} elements - Password visibility element references from getPasswordVisibilityElements.
 * @returns {void}
 */
function handleSignupHidePasswordClick(elements) {
    hidePassword(elements);
}

/**
 * Reveals plain-text characters in a signup password field when it contains a value.
 * @param {Object} elements - Password visibility element references from getPasswordVisibilityElements.
 * @returns {void}
 */
function showPassword(elements) {
    if (elements.passwordInput.value.length === 0) return;
    setPasswordVisibility(elements, true);
}

/**
 * Masks characters in a signup password field when it contains a value.
 * @param {Object} elements - Password visibility element references from getPasswordVisibilityElements.
 * @returns {void}
 */
function hidePassword(elements) {
    if (elements.passwordInput.value.length === 0) return;
    setPasswordVisibility(elements, false);
}

/**
 * Sets the password input type and toggles visibility icon display state.
 * @param {Object} elements - Password visibility element references from getPasswordVisibilityElements.
 * @param {boolean} isVisible - Whether password characters should be shown in plain text.
 * @returns {void}
 */
function setPasswordVisibility(elements, isVisible) {
    elements.passwordInput.type = isVisible ? 'text' : 'password';
    elements.visibilityIcon.classList.toggle('is-hidden', !isVisible);
    elements.visibilityOffIcon.classList.toggle('is-hidden', isVisible);
}

/**
 * Syncs lock and visibility icon visibility with the current password input state.
 * @param {Object} elements - Password visibility element references from getPasswordVisibilityElements.
 * @returns {void}
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
 * Initializes password visibility toggle for the main register-password field.
 * @returns {void}
 */
function initRegisterPasswordToggle() {
    initPasswordVisibilityToggle({
        inputId: 'register-password',
        lockIconId: 'register-lock-icon',
        visibilityOffIconId: 'register-visibility-off-icon',
        visibilityIconId: 'register-visibility-icon'
    });
}

/**
 * Initializes password visibility toggle for the register-password-confirm field.
 * @returns {void}
 */
function initRegisterConfirmPasswordToggle() {
    initPasswordVisibilityToggle({
        inputId: 'register-password-confirm',
        lockIconId: 'register-confirm-lock-icon',
        visibilityOffIconId: 'register-confirm-visibility-off-icon',
        visibilityIconId: 'register-confirm-visibility-icon'
    });
}

/**
 * Initializes password visibility toggles for all signup password fields on the page.
 * @returns {void}
 */
function initSignupPasswordVisibilityToggles() {
    initRegisterPasswordToggle();
    initRegisterConfirmPasswordToggle();
}
