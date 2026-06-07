/** @file Login form validation and password visibility. */

window.addEventListener("DOMContentLoaded", () => {
  initLoginPasswordToggle();
  initLoginBlurValidation();
});

function initLoginPasswordToggle() {
  const elements = getLoginPasswordElements();
  if (!elements) return;
  initLoginPasswordHandlers(elements);
  syncLoginPasswordIcons(elements);
}

function initLoginBlurValidation() {
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  if (!emailInput || !passwordInput) return;
  emailInput.addEventListener("blur", () => validateLoginFieldOnBlur("email"));
  passwordInput.addEventListener("blur", () => validateLoginFieldOnBlur("password"));
}

function validateLoginEmailField(email, emailInput) {
  emailInput.classList.remove("input-error");
  if (!email) { showLoginBlurError("Please fill in all fields.", emailInput); return false; }
  if (!isValidEmail(email)) { showLoginBlurError("Please enter a valid email address.", emailInput); return false; }
  return true;
}

function validateLoginPasswordField(password, passwordInput) {
  passwordInput.classList.remove("input-error");
  if (!password) { showLoginBlurError("Please fill in all fields.", passwordInput); return false; }
  return true;
}

function clearLoginFieldErrors(email, password, emailInput, passwordInput) {
  if (email && password && isValidEmail(email)) {
    removeLoginError();
    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
  }
}

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

function showLoginBlurError(message, input) {
  removeLoginError();
  appendLoginError(message);
  input?.classList.add("input-error");
}

function getLoginPasswordElements() {
  const passwordInput = document.getElementById("login-password");
  const lockIcon = document.getElementById("lock-icon");
  const visibilityOffIcon = document.getElementById("visibility-off-icon");
  const visibilityIcon = document.getElementById("visibility-icon");
  if (!passwordInput || !lockIcon || !visibilityOffIcon || !visibilityIcon) return null;
  return { passwordInput, lockIcon, visibilityOffIcon, visibilityIcon };
}

function initLoginPasswordHandlers(elements) {
  elements.passwordInput.addEventListener("input", () => syncLoginPasswordIcons(elements));
  elements.visibilityOffIcon.addEventListener("click", () => showLoginPassword(elements));
  elements.visibilityIcon.addEventListener("click", () => hideLoginPassword(elements));
}

function showLoginPassword(elements) {
  if (elements.passwordInput.value.length === 0) return;
  setLoginPasswordVisibility(elements, true);
}

function hideLoginPassword(elements) {
  if (elements.passwordInput.value.length === 0) return;
  setLoginPasswordVisibility(elements, false);
}

function setLoginPasswordVisibility(elements, isVisible) {
  elements.passwordInput.type = isVisible ? "text" : "password";
  elements.visibilityIcon.classList.toggle("is-hidden", !isVisible);
  elements.visibilityOffIcon.classList.toggle("is-hidden", isVisible);
}

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

function removeLoginError() {
  document.querySelector(".login-error")?.remove();
}

function appendLoginError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "login-error";
  errorDiv.textContent = message;
  document.getElementById("error-container")?.appendChild(errorDiv);
}

function markLoginInputsError() {
  document.getElementById("login-email")?.classList.add("input-error");
  document.getElementById("login-password")?.classList.add("input-error");
}

/**
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
