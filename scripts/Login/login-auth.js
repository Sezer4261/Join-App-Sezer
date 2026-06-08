/** @file Login submission and session handling. */

/**
 * Validates credentials, authenticates against Firebase, and redirects on success.
 * @returns {Promise<void>}
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
 * Validates that login email and password fields are present and the email format is valid.
 * @param {{ email: string, password: string }} credentials - Trimmed email and password read from the form.
 * @returns {boolean} Whether the credentials pass client-side validation and login may proceed.
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
 * Stores the session and redirects on successful login, or shows an authentication error.
 * @param {{ email: string, password: string }} credentials - Trimmed email and password that were submitted.
 * @param {Object|undefined} signedUpUser - Matched user record from Firebase, or undefined when credentials fail.
 * @returns {void}
 */
function handleLoginResult(credentials, signedUpUser) {
  if (signedUpUser) {
    storeUserSession(credentials.email, signedUpUser);
    showToast("You logged in successfully");
    setTimeout(() => { window.location.href = getPagePath("summary.html"); }, 300);
    return;
  }
  showLoginError("Check your email and password. Please try again.");
}

/**
 * Removes error styling from both login input fields before a new submission attempt.
 * @returns {void}
 */
function clearLoginErrors() {
  document.getElementById("login-email")?.classList.remove("input-error");
  document.getElementById("login-password")?.classList.remove("input-error");
}

/**
 * Reads trimmed email and password values from the login form inputs.
 * @returns {{ email: string, password: string }} Current credential values ready for validation.
 */
function getLoginCredentials() {
  return {
    email: document.getElementById("login-email").value.trim(),
    password: document.getElementById("login-password").value.trim(),
  };
}

/**
 * Searches Firebase for a registered user whose email and password match the submitted credentials.
 * @param {string} email - Email address entered in the login form.
 * @param {string} password - Password entered in the login form.
 * @returns {Promise<Object|undefined>} Matched user record, or undefined when no match is found.
 */
async function findSignedUpUser(email, password) {
  const response = await fetch(`${BASE_URL}/users.json`);
  if (!response.ok) throw new Error(`HTTP-Error! Status: ${response.status}`);
  const userAsJson = await response.json();
  return Object.values(userAsJson || {}).find((u) => u.email === email && u.password === password);
}

/**
 * Persists an authenticated user session object to localStorage after successful login.
 * @param {string} email - Email address of the authenticated user.
 * @param {Object} signedUpUser - Matched Firebase user record containing profile data.
 * @returns {void}
 */
function storeUserSession(email, signedUpUser) {
  localStorage.setItem("user", JSON.stringify({
    mode: "user",
    email,
    displayName: signedUpUser.name || "",
  }));
}

/**
 * Displays a login error message and marks both input fields with the error CSS class.
 * @param {string} message - User-facing error text shown below the login form.
 * @returns {void}
 */
function showLoginError(message) {
  removeLoginError();
  appendLoginError(message);
  markLoginInputsError();
}

/**
 * Navigates the browser to the signup registration page.
 * @returns {void}
 */
function navigateToSignup() {
  window.location.href = "signup.html";
}

/**
 * Creates a guest session in localStorage and redirects to the summary page.
 * @returns {void}
 */
function guestLogin() {
  localStorage.setItem("user", JSON.stringify({ mode: "guest" }));
  showToast("You logged in successfully");
  setTimeout(() => { window.location.href = getPagePath("summary.html"); }, 300);
}
