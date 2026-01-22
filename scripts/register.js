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

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value;
    const confirmValue = confirmPasswordInput.value;

    const errors = [];

    if (!nameInput.value.trim()) {
        errors.push({ field: nameInput, message: 'Please enter your name.' });
    }

    if (!emailValue) {
        errors.push({ field: emailInput, message: 'Please enter an email address.' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        errors.push({ field: emailInput, message: 'Please enter a valid email address.' });
    }

    if (!passwordValue) {
        errors.push({ field: passwordInput, message: 'Please enter a password.' });
    }

    if (!confirmValue) {
        errors.push({ field: confirmPasswordInput, message: 'Please confirm your password.' });
    }

    if (passwordValue && confirmValue && passwordValue !== confirmValue) {
        errors.push({ field: confirmPasswordInput, message: 'Passwords do not match.' });
    }

    if (!policyCheckbox.checked) {
        errors.push({ field: policyCheckbox, message: 'Please accept the privacy policy.' });
    }

    if (errors.length > 0) {
        const message = errors.map((entry) => entry.message).join(' ');
        if (typeof showMessage === 'function') {
            showMessage(message, 'error');
        } else {
            alert(message);
        }
        errors[0].field?.focus();
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
