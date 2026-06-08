/** @file User registration submission and redirect. */

/**
 * Persists the new user and contact to Firebase, shows a toast, and redirects to login.
 * @param {Object} newUser - New user payload containing name, email, and password.
 * @returns {Promise<void>}
 */
async function performSignupRegistration(newUser) {
    await saveNewUser(newUser);
    await saveNewContact(newUser);
    showToast("You signed up successfully");
    setTimeout(() => {
        window.location.href = 'index.html?msg=Du hast dich erfolgreich registriert!';
    }, 300);
}

/**
 * Reads signup form values, validates password match, and submits registration to Firebase.
 * @returns {Promise<void>}
 */
async function addUser() {
    const values = getSignupValues();
    if (!isPasswordMatch(values)) { showPasswordMismatch(values.confirmPassword); return; }
    const newUser = buildNewUser(values);
    users.push(newUser);
    try {
        await performSignupRegistration(newUser);
    } catch (err) {
        console.error("Fehler beim Posten:", err);
        showRegistrationFailed();
    }
}

/**
 * Collects DOM references for all signup form input fields.
 * @returns {Object} Input element references keyed by field name.
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
 * Checks whether the password and confirm-password input values are identical.
 * @param {Object} values - Signup input element references from getSignupValues.
 * @returns {boolean} Whether both password fields contain the same value.
 */
function isPasswordMatch(values) {
    return values.password.value === values.confirmPassword.value;
}

/**
 * Displays a signup error via the message overlay, falling back to alert when unavailable.
 * @param {string} message - User-facing error text to display.
 * @returns {void}
 */
function showSignupError(message) {
    if (typeof showMessage === 'function') {
        showMessage(message, 'error');
    } else {
        alert(message);
    }
}

/**
 * Shows a password mismatch error and moves focus to the confirm-password field.
 * @param {HTMLInputElement} confirmPassword - Confirm password input that will receive focus.
 * @returns {void}
 */
function showPasswordMismatch(confirmPassword) {
    showSignupError('Passwords do not match.');
    confirmPassword.focus();
}

/**
 * Builds a trimmed user payload object from the signup form input values.
 * @param {Object} values - Signup input element references from getSignupValues.
 * @returns {Object} New user object with name, email, and password properties.
 */
function buildNewUser(values) {
    return {
        name: values.name.value.trim(),
        email: values.email.value.trim(),
        password: values.password.value
    };
}

/**
 * Posts a new user record to the Firebase users collection.
 * @param {Object} newUser - New user payload containing name, email, and password.
 * @returns {Promise<Object>} Firebase response data from the POST request.
 */
async function saveNewUser(newUser) {
    await postData("users", newUser);
}

/**
 * Posts a new contact record derived from the registered user's name and email.
 * @param {Object} newUser - New user payload used to populate the contact record.
 * @returns {Promise<Object>} Firebase response data from the POST request.
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
 * Shows a generic registration failure message when the Firebase request fails.
 * @returns {void}
 */
function showRegistrationFailed() {
    showSignupError('Registration failed. Please try again.');
}

/**
 * Sends a JSON POST request to a Firebase Realtime Database REST endpoint.
 * @param {string} path - Firebase collection path such as "users" or "contacts".
 * @param {Object} user - Payload object to serialize and store.
 * @returns {Promise<Object>} Parsed JSON response body from Firebase.
 */
async function postData(path = "", user = {}) {
    const response = await fetch(`${BASE_URL}/${path}.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    });
    if (!response.ok) throw new Error(`HTTP-Error! Status: ${response.status}`);
    return await response.json();
}

/**
 * Navigates the browser to the login page after registration.
 * @returns {void}
 */
function navigateToLogin() {
     window.location.href = "index.html";
}
