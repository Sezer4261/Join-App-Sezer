// Entferne Intro-Overlay nach Animation
window.addEventListener('DOMContentLoaded', () => {
    initIntroAlignment();
    scheduleIntroOverlayRemoval();
    initLoginPasswordToggle();
});

/**
 * Initializes intro alignment.
 * @returns {void} Result.
 */
function initIntroAlignment() {
    requestAnimationFrame(() => alignIntroLogo());
}

/**
 * Executes align intro logo logic.
 * @returns {void} Result.
 */
function alignIntroLogo() {
    const introLogo = document.getElementById('introLogo');
    const headerLogo = document.querySelector('.header-left img');
    if (!introLogo || !headerLogo) return;
    const introRect = introLogo.getBoundingClientRect();
    const headerRect = headerLogo.getBoundingClientRect();
    const dx = getCenterDeltaX(introRect, headerRect);
    const dy = getCenterDeltaY(introRect, headerRect);
    introLogo.style.setProperty('--logo-dx', `${dx}px`);
    introLogo.style.setProperty('--logo-dy', `${dy}px`);
}

/**
 * Returns center delta x.
 * @param {*} introRect - Parameter.
 * @param {*} headerRect - Parameter.
 * @returns {*} Result.
 */
function getCenterDeltaX(introRect, headerRect) {
    const introCenterX = introRect.left + introRect.width / 2;
    const headerCenterX = headerRect.left + headerRect.width / 2;
    return headerCenterX - introCenterX;
}

/**
 * Returns center delta y.
 * @param {*} introRect - Parameter.
 * @param {*} headerRect - Parameter.
 * @returns {*} Result.
 */
function getCenterDeltaY(introRect, headerRect) {
    const introCenterY = introRect.top + introRect.height / 2;
    const headerCenterY = headerRect.top + headerRect.height / 2;
    return headerCenterY - introCenterY;
}

/**
 * Executes schedule intro overlay removal logic.
 * @returns {void} Result.
 */
function scheduleIntroOverlayRemoval() {
    setTimeout(() => removeIntroOverlay(), 2000);
}

/**
 * Executes remove intro overlay logic.
 * @returns {void} Result.
 */
function removeIntroOverlay() {
    const introOverlay = document.getElementById('introOverlay');
    if (introOverlay) {
        introOverlay.remove();
    }
}

/**
 * Initializes login password toggle.
 * @returns {void} Result.
 */
function initLoginPasswordToggle() {
    const elements = getLoginPasswordElements();
    if (!elements) return;
    initLoginPasswordHandlers(elements);
    syncLoginPasswordIcons(elements);
}

/**
 * Returns login password elements.
 * @returns {*} Result.
 */
function getLoginPasswordElements() {
    const passwordInput = document.getElementById('loginPassword');
    const lockIcon = document.getElementById('lockIcon');
    const visibilityOffIcon = document.getElementById('visibilityOffIcon');
    const visibilityIcon = document.getElementById('visibilityIcon');
    if (!passwordInput || !lockIcon || !visibilityOffIcon || !visibilityIcon) return null;
    return { passwordInput, lockIcon, visibilityOffIcon, visibilityIcon };
}

/**
 * Initializes login password handlers.
 * @param {*} elements - Parameter.
 * @returns {void} Result.
 */
function initLoginPasswordHandlers(elements) {
    elements.passwordInput.addEventListener('input', () => syncLoginPasswordIcons(elements));
    elements.visibilityOffIcon.addEventListener('click', () => showLoginPassword(elements));
    elements.visibilityIcon.addEventListener('click', () => hideLoginPassword(elements));
}

/**
 * Shows login password.
 * @param {*} elements - Parameter.
 * @returns {void} Result.
 */
function showLoginPassword(elements) {
    if (elements.passwordInput.value.length === 0) return;
    setLoginPasswordVisibility(elements, true);
}

/**
 * Hides login password.
 * @param {*} elements - Parameter.
 * @returns {void} Result.
 */
function hideLoginPassword(elements) {
    if (elements.passwordInput.value.length === 0) return;
    setLoginPasswordVisibility(elements, false);
}

/**
 * Sets login password visibility.
 * @param {*} elements - Parameter.
 * @param {*} isVisible - Parameter.
 * @returns {void} Result.
 */
function setLoginPasswordVisibility(elements, isVisible) {
    elements.passwordInput.type = isVisible ? 'text' : 'password';
    elements.visibilityIcon.classList.toggle('is-hidden', !isVisible);
    elements.visibilityOffIcon.classList.toggle('is-hidden', isVisible);
}

/**
 * Executes sync login password icons logic.
 * @param {*} elements - Parameter.
 * @returns {void} Result.
 */
function syncLoginPasswordIcons(elements) {
    const hasValue = elements.passwordInput.value.length > 0;
    elements.lockIcon.classList.toggle('is-hidden', hasValue);
    if (!hasValue) {
        elements.visibilityOffIcon.classList.add('is-hidden');
        elements.visibilityIcon.classList.add('is-hidden');
        elements.passwordInput.type = 'password';
        return;
    }
    const isVisible = elements.passwordInput.type === 'text';
    setLoginPasswordVisibility(elements, isVisible);
}

/**
 * Executes login logic.
 * @returns {Promise<*>} Result.
 */
async function login() {
    try {
        clearLoginErrors();
        const credentials = getLoginCredentials();
        if (!validateLoginCredentials(credentials)) return;
        const signedUpUser = await findSignedUpUser(credentials.email, credentials.password);
        handleLoginResult(credentials, signedUpUser);
    } catch (error) {
        showLoginError("An error occurred. Please try again later.");
    }
}

/**
 * Validates login credentials.
 * @param {*} param - Parameter.
 * @param {*} password } - Parameter.
 * @returns {void} Result.
 */
function validateLoginCredentials({ email, password }) {
    if (!email || !password) {
        showLoginError("Please fill in all fields.");
        return false;
    }
    if (!isValidEmail(email)) {
        showLoginError("Please enter a valid email address.");
        return false;
    }
    return true;
}

/**
 * Executes handle login result logic.
 * @param {*} credentials - Parameter.
 * @param {*} signedUpUser - Parameter.
 * @returns {void} Result.
 */
function handleLoginResult(credentials, signedUpUser) {
    if (signedUpUser) {
        storeUserSession(credentials.email, signedUpUser);
        window.location.href = "summary.html";
        return;
    }
    showLoginError("Check your email and password. Please try again.");
}

/**
 * Clears login errors.
 * @returns {void} Result.
 */
function clearLoginErrors() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');
}

/**
 * Returns login credentials.
 * @returns {*} Result.
 */
function getLoginCredentials() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    return {
        email: emailInput.value.trim(),
        password: passwordInput.value.trim()
    };
}

/**
 * Executes find signed up user logic.
 * @param {string} email - Email address.
 * @param {*} password - Parameter.
 * @returns {Promise<*>} Result.
 */
async function findSignedUpUser(email, password) {
    const response = await fetch(`${BASE_URL}/users.json`);
    if (!response.ok) throw new Error(`HTTP-Error! Status: ${response.status}`);
    const userAsJson = await response.json();
    return Object.values(userAsJson || {}).find(u => u.email === email && u.password === password);
}

/**
 * Executes store user session logic.
 * @param {string} email - Email address.
 * @param {*} signedUpUser - Parameter.
 * @returns {void} Result.
 */
function storeUserSession(email, signedUpUser) {
    localStorage.setItem("user", JSON.stringify({
        mode: "user",
        email: email,
        displayName: signedUpUser.name || ""
    }));
}

/**
 * Shows login error.
 * @param {string} message - Message text.
 * @returns {void} Result.
 */
function showLoginError(message) {
    removeLoginError();
    appendLoginError(message);
    markLoginInputsError();
}

/**
 * Executes remove login error logic.
 * @returns {void} Result.
 */
function removeLoginError() {
    const oldError = document.querySelector('.login-error');
    if (oldError) oldError.remove();
}

/**
 * Executes append login error logic.
 * @param {string} message - Message text.
 * @returns {void} Result.
 */
function appendLoginError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error';
    errorDiv.textContent = message;
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.appendChild(errorDiv);
}

/**
 * Executes mark login inputs error logic.
 * @returns {void} Result.
 */
function markLoginInputsError() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    emailInput.classList.add('input-error');
    passwordInput.classList.add('input-error');
}

/**
 * Checks whether valid email.
 * @param {string} email - Email address.
 * @returns {boolean} Result.
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Executes navigate to signup logic.
 * @returns {void} Result.
 */
function navigateToSignup() {
     window.location.href = "signup.html";
}

/**
 * Executes guest login logic.
 * @returns {void} Result.
 */
function guestLogin() {
  // Guest-Session speichern (wichtig für Summary)
  localStorage.setItem("user", JSON.stringify({ mode: "guest" }));

  window.location.href = "summary.html";
}
