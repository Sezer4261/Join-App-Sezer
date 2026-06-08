/** @file Login form validation and password visibility. */

/**
 * Initializes password visibility toggles and blur validation when the login page loads.
 * @returns {void}
 */
function initLoginForm() {
  initLoginPasswordToggle();
  initLoginBlurValidation();
}

window.addEventListener("DOMContentLoaded", initLoginForm);

/**
 * Wires up password visibility toggle icons and syncs their state for the login form.
 * @returns {void}
 */
function initLoginPasswordToggle() {
  const elements = getLoginPasswordElements();
  if (!elements) return;
  initLoginPasswordHandlers(elements);
  syncLoginPasswordIcons(elements);
}

/**
 * Attaches blur validation listeners to the login email and password inputs.
 * @returns {void}
 */
function initLoginBlurValidation() {
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  if (!emailInput || !passwordInput) return;
  emailInput.addEventListener("blur", handleLoginEmailBlur);
  passwordInput.addEventListener("blur", handleLoginPasswordBlur);
}

/**
 * Validates the login email field when it loses focus.
 * @returns {boolean} Whether the email field passes validation after blur.
 */
function handleLoginEmailBlur() {
  return validateLoginFieldOnBlur("email");
}

/**
 * Validates the login password field when it loses focus.
 * @returns {boolean} Whether the password field passes validation after blur.
 */
function handleLoginPasswordBlur() {
  return validateLoginFieldOnBlur("password");
}

/**
 * Validates the login email field value and shows inline errors when invalid.
 * @param {string} email - Trimmed email value from the email input.
 * @param {HTMLInputElement} emailInput - Email input element whose error state will be updated.
 * @returns {boolean} Whether the email field is valid and may proceed.
 */
function validateLoginEmailField(email, emailInput) {
  emailInput.classList.remove("input-error");
  if (!email) { showLoginBlurError("Please fill in all fields.", emailInput); return false; }
  if (!isValidEmail(email)) { showLoginBlurError("Please enter a valid email address.", emailInput); return false; }
  return true;
}

/**
 * Validates the login password field value and shows inline errors when empty.
 * @param {string} password - Trimmed password value from the password input.
 * @param {HTMLInputElement} passwordInput - Password input element whose error state will be updated.
 * @returns {boolean} Whether the password field is valid and may proceed.
 */
function validateLoginPasswordField(password, passwordInput) {
  passwordInput.classList.remove("input-error");
  if (!password) { showLoginBlurError("Please fill in all fields.", passwordInput); return false; }
  return true;
}

/**
 * Clears login field errors when both email and password are valid after blur validation.
 * @param {string} email - Trimmed email value from the email input.
 * @param {string} password - Trimmed password value from the password input.
 * @param {HTMLInputElement} emailInput - Email input element whose error class may be removed.
 * @param {HTMLInputElement} passwordInput - Password input element whose error class may be removed.
 * @returns {void}
 */
function clearLoginFieldErrors(email, password, emailInput, passwordInput) {
  if (email && password && isValidEmail(email)) {
    removeLoginError();
    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
  }
}

/**
 * Validates a single login field on blur and clears errors when both fields become valid.
 * @param {"email"|"password"} fieldName - Identifier of the field that triggered blur validation.
 * @returns {boolean} Whether the validated field passes client-side checks.
 */
function validateLoginFieldOnBlur(fieldName) {
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  if (!emailInput || !passwordInput) return false;
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (fieldName === "email" && !validateLoginEmailField(email, emailInput)) return false;
  if (fieldName === "password" && !validateLoginPasswordField(password, passwordInput)) return false;
  clearLoginFieldErrors(email, password, emailInput, passwordInput);
  return true;
}

/**
 * Shows a blur validation error message and marks the affected input with the error class.
 * @param {string} message - User-facing error text displayed below the login form.
 * @param {HTMLInputElement} [input] - Input element to highlight, when applicable.
 * @returns {void}
 */
function showLoginBlurError(message, input) {
  removeLoginError();
  appendLoginError(message);
  input?.classList.add("input-error");
}

/**
 * Collects DOM references for the login password field and its visibility icons.
 * @returns {Object|null} Element references for password input and icons, or null when any are missing.
 */
function getLoginPasswordElements() {
  const passwordInput = document.getElementById("login-password");
  const lockIcon = document.getElementById("lock-icon");
  const visibilityOffIcon = document.getElementById("visibility-off-icon");
  const visibilityIcon = document.getElementById("visibility-icon");
  if (!passwordInput || !lockIcon || !visibilityOffIcon || !visibilityIcon) return null;
  return { passwordInput, lockIcon, visibilityOffIcon, visibilityIcon };
}

/**
 * Binds input and click handlers that control login password visibility toggling.
 * @param {Object} elements - Password visibility element references from getLoginPasswordElements.
 * @returns {void}
 */
function initLoginPasswordHandlers(elements) {
  elements.passwordInput.addEventListener("input", () => handleLoginPasswordInput(elements));
  elements.visibilityOffIcon.addEventListener("click", () => handleLoginShowPasswordClick(elements));
  elements.visibilityIcon.addEventListener("click", () => handleLoginHidePasswordClick(elements));
}

/**
 * Syncs login password icon visibility when the user types in the password field.
 * @param {Object} elements - Password visibility element references from getLoginPasswordElements.
 * @returns {void}
 */
function handleLoginPasswordInput(elements) {
  syncLoginPasswordIcons(elements);
}

/**
 * Reveals the login password when the visibility-off icon is clicked.
 * @param {Object} elements - Password visibility element references from getLoginPasswordElements.
 * @returns {void}
 */
function handleLoginShowPasswordClick(elements) {
  showLoginPassword(elements);
}

/**
 * Hides the login password when the visibility icon is clicked.
 * @param {Object} elements - Password visibility element references from getLoginPasswordElements.
 * @returns {void}
 */
function handleLoginHidePasswordClick(elements) {
  hideLoginPassword(elements);
}

/**
 * Reveals plain-text characters in the login password field when it contains a value.
 * @param {Object} elements - Password visibility element references from getLoginPasswordElements.
 * @returns {void}
 */
function showLoginPassword(elements) {
  if (elements.passwordInput.value.length === 0) return;
  setLoginPasswordVisibility(elements, true);
}

/**
 * Masks the login password field characters when it contains a value.
 * @param {Object} elements - Password visibility element references from getLoginPasswordElements.
 * @returns {void}
 */
function hideLoginPassword(elements) {
  if (elements.passwordInput.value.length === 0) return;
  setLoginPasswordVisibility(elements, false);
}

/**
 * Sets the login password input type and toggles visibility icon display state.
 * @param {Object} elements - Password visibility element references from getLoginPasswordElements.
 * @param {boolean} isVisible - Whether the password characters should be shown in plain text.
 * @returns {void}
 */
function setLoginPasswordVisibility(elements, isVisible) {
  elements.passwordInput.type = isVisible ? "text" : "password";
  elements.visibilityIcon.classList.toggle("is-hidden", !isVisible);
  elements.visibilityOffIcon.classList.toggle("is-hidden", isVisible);
}

/**
 * Syncs lock and visibility icon visibility with the current password input state.
 * @param {Object} elements - Password visibility element references from getLoginPasswordElements.
 * @returns {void}
 */
function syncLoginPasswordIcons(elements) {
  const hasValue = elements.passwordInput.value.length > 0;
  elements.lockIcon.classList.toggle("is-hidden", hasValue);
  if (!hasValue) {
    elements.visibilityOffIcon.classList.add("is-hidden");
    elements.visibilityIcon.classList.add("is-hidden");
    elements.passwordInput.type = "password";
    return;
  }
  setLoginPasswordVisibility(elements, elements.passwordInput.type === "text");
}

/**
 * Removes any existing login error message element from the DOM.
 * @returns {void}
 */
function removeLoginError() {
  document.querySelector(".login-error")?.remove();
}

/**
 * Appends a new login error message element to the error container.
 * @param {string} message - User-facing error text displayed below the login form.
 * @returns {void}
 */
function appendLoginError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "login-error";
  errorDiv.textContent = message;
  document.getElementById("error-container")?.appendChild(errorDiv);
}

/**
 * Adds the error CSS class to both login email and password inputs.
 * @returns {void}
 */
function markLoginInputsError() {
  document.getElementById("login-email")?.classList.add("input-error");
  document.getElementById("login-password")?.classList.add("input-error");
}

/**
 * Checks whether a string matches a basic email address format pattern.
 * @param {string} email - Email address string to validate.
 * @returns {boolean} Whether the string conforms to the expected email format.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
