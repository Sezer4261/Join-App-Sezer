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
