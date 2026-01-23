let signupFieldErrors = {};

function handleSignupSubmit(event) {
    event.preventDefault();
    if (!validateSignupForm()) {
        return;
    }
    addUser();
}

function validateSignupForm() {
    const nameInput = document.getElementById('registerName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('registerPasswordConfirm');
    const policyCheckbox = document.getElementById('acceptPrivacy');

    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value;
    const confirmValue = confirmPasswordInput.value;

    // Alle Input-Fehler-Klassen und Error-Messages entfernen
    signupFieldErrors = {};
    [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.classList.remove('input-error');
    });
    document.getElementById('registerNameError').textContent = '';
    document.getElementById('registerEmailError').textContent = '';
    document.getElementById('registerPasswordError').textContent = '';
    document.getElementById('registerPasswordConfirmError').textContent = '';
    document.getElementById('acceptPrivacyError').textContent = '';

    const policyContainer = document.querySelector('.accept-privacy-policy');
    if (policyContainer) {
        policyContainer.classList.remove('input-error');
    }

    // Validierung in Reihenfolge: Name -> Email -> Passwort -> Confirm -> Privacy
    // Erste Fehlermeldung anzeigen, aber alle fehlerhaften Felder markieren
    let firstErrorShown = false;

    // 1. Name prüfen
    if (!nameValue) {
        signupFieldErrors.registerName = 'Please enter your name.';
        nameInput.classList.add('input-error');
        if (!firstErrorShown) {
            document.getElementById('registerNameError').textContent = signupFieldErrors.registerName;
            nameInput.focus();
            firstErrorShown = true;
        }
    }

    // 2. Email prüfen
    if (!emailValue) {
        signupFieldErrors.registerEmail = 'Please enter an email address.';
        emailInput.classList.add('input-error');
        if (!firstErrorShown) {
            document.getElementById('registerEmailError').textContent = signupFieldErrors.registerEmail;
            emailInput.focus();
            firstErrorShown = true;
        }
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        signupFieldErrors.registerEmail = 'Please enter a valid email address.';
        emailInput.classList.add('input-error');
        if (!firstErrorShown) {
            document.getElementById('registerEmailError').textContent = signupFieldErrors.registerEmail;
            emailInput.focus();
            firstErrorShown = true;
        }
    }

    // 3. Passwort prüfen
    if (!passwordValue) {
        signupFieldErrors.registerPassword = 'Please enter a password.';
        passwordInput.classList.add('input-error');
        if (!firstErrorShown) {
            document.getElementById('registerPasswordError').textContent = signupFieldErrors.registerPassword;
            passwordInput.focus();
            firstErrorShown = true;
        }
    }

    // 4. Confirm Password prüfen
    if (!confirmValue) {
        signupFieldErrors.registerPasswordConfirm = 'Please confirm your password.';
        confirmPasswordInput.classList.add('input-error');
        if (!firstErrorShown) {
            document.getElementById('registerPasswordConfirmError').textContent = signupFieldErrors.registerPasswordConfirm;
            confirmPasswordInput.focus();
            firstErrorShown = true;
        }
    } else if (passwordValue && passwordValue !== confirmValue) {
        signupFieldErrors.registerPasswordConfirm = 'Passwords do not match.';
        confirmPasswordInput.classList.add('input-error');
        if (!firstErrorShown) {
            document.getElementById('registerPasswordConfirmError').textContent = signupFieldErrors.registerPasswordConfirm;
            confirmPasswordInput.focus();
            firstErrorShown = true;
        }
    }

    // 5. Privacy Policy prüfen
    if (!policyCheckbox.checked) {
        signupFieldErrors.acceptPrivacy = 'Please accept the privacy policy.';
        if (policyContainer) {
            policyContainer.classList.add('input-error');
        }
        if (!firstErrorShown) {
            document.getElementById('acceptPrivacyError').textContent = signupFieldErrors.acceptPrivacy;
            firstErrorShown = true;
        }
    }

    if (firstErrorShown) {
        return false;
    }

    return true;
}

function showFieldErrorMessage(fieldId) {
    const idMap = {
        registerName: 'registerNameError',
        registerEmail: 'registerEmailError',
        registerPassword: 'registerPasswordError',
        registerPasswordConfirm: 'registerPasswordConfirmError',
        acceptPrivacy: 'acceptPrivacyError'
    };

    // Alle Meldungen ausblenden
    Object.values(idMap).forEach(spanId => {
        const span = document.getElementById(spanId);
        if (span) {
            span.textContent = '';
        }
    });

    const message = signupFieldErrors[fieldId];
    if (!message) return;

    const spanId = idMap[fieldId];
    const span = document.getElementById(spanId);
    if (span) {
        span.textContent = message;
    }
}

function attachSignupErrorFocusHandlers() {
    const pairs = [
        { fieldId: 'registerName', event: 'focus' },
        { fieldId: 'registerEmail', event: 'focus' },
        { fieldId: 'registerPassword', event: 'focus' },
        { fieldId: 'registerPasswordConfirm', event: 'focus' },
        { fieldId: 'acceptPrivacy', event: 'focus' },
        { fieldId: 'acceptPrivacy', event: 'click' }
    ];

    pairs.forEach(({ fieldId, event }) => {
        const el = document.getElementById(fieldId);
        if (el) {
            el.addEventListener(event, () => showFieldErrorMessage(fieldId));
        }
    });
}

document.addEventListener('DOMContentLoaded', attachSignupErrorFocusHandlers);

async function addUser() {
    let name = document.getElementById('registerName');
    let email = document.getElementById('registerEmail');
    let password = document.getElementById('registerPassword');
    let confirmPassword = document.getElementById('registerPasswordConfirm');

    if (password.value !== confirmPassword.value) {
        if (typeof showMessage === 'function') {
            showMessage('Passwords do not match.', 'error');
        } else {
            alert('Passwords do not match.');
        }
        confirmPassword.focus();
        return;
    }

    const newUser = { name: name.value.trim(), email: email.value.trim(), password: password.value };
    users.push(newUser);
    try {
        await postData("users", newUser);
        window.location.href = 'index.html?msg=Du hast dich erfolgreich registriert!';
    } catch (err) {
        console.error("Fehler beim Posten:", err);
        if (typeof showMessage === 'function') {
            showMessage('Registration failed. Please try again.', 'error');
        } else {
            alert('Registration failed. Please try again.');
        }
    }
}

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

function navigateToLogin() {
     window.location.href = "index.html";
}
