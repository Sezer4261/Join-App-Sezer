/**
 * Adds user.
 * @returns {Promise<*>} Result.
 */
/**
 * Performs registration: saves user, saves contact, shows toast, redirects.
 * @param {Object} newUser - New user object.
 * @returns {Promise<void>} Result.
 */
async function performSignupRegistration(newUser) {
    await saveNewUser(newUser);
    await saveNewContact(newUser);
    showToast("You signed up successfully");
    setTimeout(() => {
        window.location.href = 'index.html?msg=Du hast dich erfolgreich registriert!';
    }, 300);
}

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
/**
 * Displays a signup error message via showMessage, or falls back to alert.
 * @param {string} message - Error message to display.
 * @returns {void} Result.
 */
function showSignupError(message) {
    if (typeof showMessage === 'function') {
        showMessage(message, 'error');
    } else {
        alert(message);
    }
}

function showPasswordMismatch(confirmPassword) {
    showSignupError('Passwords do not match.');
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
    showSignupError('Registration failed. Please try again.');
}

/**
 * Executes post data logic.
 * @param {string} path - API path.
 * @param {Object} user - User payload.
 * @returns {Promise<*>} Result.
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
 * Executes navigate to login logic.
 * @returns {void} Result.
 */
function navigateToLogin() {
     window.location.href = "index.html";
}
