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
    // Nur die erste leere Validierung wird angezeigt
    
    // 1. Name prüfen
    if (!nameValue) {
        nameInput.classList.add('input-error');
        document.getElementById('registerNameError').textContent = 'Please enter your name.';
        nameInput.focus();
        return false;
    }

    // 2. Email prüfen
    if (!emailValue) {
        emailInput.classList.add('input-error');
        document.getElementById('registerEmailError').textContent = 'Please enter an email address.';
        emailInput.focus();
        return false;
    }

    // Email Validierung (wenn nicht leer)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        emailInput.classList.add('input-error');
        document.getElementById('registerEmailError').textContent = 'Please enter a valid email address.';
        emailInput.focus();
        return false;
    }

    // 3. Passwort prüfen
    if (!passwordValue) {
        passwordInput.classList.add('input-error');
        document.getElementById('registerPasswordError').textContent = 'Please enter a password.';
        passwordInput.focus();
        return false;
    }

    // 4. Confirm Password prüfen
    if (!confirmValue) {
        confirmPasswordInput.classList.add('input-error');
        document.getElementById('registerPasswordConfirmError').textContent = 'Please confirm your password.';
        confirmPasswordInput.focus();
        return false;
    }

    // Passwörter müssen übereinstimmen (wenn beide gefüllt)
    if (passwordValue !== confirmValue) {
        confirmPasswordInput.classList.add('input-error');
        document.getElementById('registerPasswordConfirmError').textContent = 'Passwords do not match.';
        confirmPasswordInput.focus();
        return false;
    }

    // 5. Privacy Policy prüfen
    if (!policyCheckbox.checked) {
        if (policyContainer) {
            policyContainer.classList.add('input-error');
        }
        document.getElementById('acceptPrivacyError').textContent = 'Please accept the privacy policy.';
        return false;
    }

    return true;
}

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
