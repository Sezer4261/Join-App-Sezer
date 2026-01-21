//const BASE_URL = "https://deine-api-url-hier"; // Passe deine API-URL an

// Entferne Intro-Overlay nach Animation
window.addEventListener('DOMContentLoaded', () => {
    // Align intro animation logo with the real header logo position
    requestAnimationFrame(() => {
        const introLogo = document.getElementById('introLogo');
        const headerLogo = document.querySelector('.header-left img');

        if (!introLogo || !headerLogo) return;

        const introRect = introLogo.getBoundingClientRect();
        const headerRect = headerLogo.getBoundingClientRect();

        const introCenterX = introRect.left + introRect.width / 2;
        const introCenterY = introRect.top + introRect.height / 2;
        const headerCenterX = headerRect.left + headerRect.width / 2;
        const headerCenterY = headerRect.top + headerRect.height / 2;

        const dx = headerCenterX - introCenterX;
        const dy = headerCenterY - introCenterY;

        introLogo.style.setProperty('--logo-dx', `${dx}px`);
        introLogo.style.setProperty('--logo-dy', `${dy}px`);
    });

    setTimeout(() => {
        const introOverlay = document.getElementById('introOverlay');
        if (introOverlay) {
            introOverlay.remove();
        }
    }, 2000);
    
    // Toggle Icons für Passwort-Feld
    const passwordInput = document.getElementById('loginPassword');
    const lockIcon = document.getElementById('lockIcon');
    const visibilityOffIcon = document.getElementById('visibilityOffIcon');
    const visibilityIcon = document.getElementById('visibilityIcon');

    if (passwordInput && lockIcon && visibilityOffIcon && visibilityIcon) {
        const setPasswordVisibility = (isVisible) => {
            passwordInput.type = isVisible ? 'text' : 'password';
            visibilityIcon.classList.toggle('is-hidden', !isVisible);
            visibilityOffIcon.classList.toggle('is-hidden', isVisible);
        };

        const syncIconsWithInput = () => {
            const hasValue = passwordInput.value.length > 0;
            lockIcon.classList.toggle('is-hidden', hasValue);

            if (!hasValue) {
                visibilityOffIcon.classList.add('is-hidden');
                visibilityIcon.classList.add('is-hidden');
                passwordInput.type = 'password';
                return;
            }

            const isVisible = passwordInput.type === 'text';
            setPasswordVisibility(isVisible);
        };

        passwordInput.addEventListener('input', syncIconsWithInput);

        visibilityOffIcon.addEventListener('click', () => {
            if (passwordInput.value.length === 0) return;
            setPasswordVisibility(true);
        });

        visibilityIcon.addEventListener('click', () => {
            if (passwordInput.value.length === 0) return;
            setPasswordVisibility(false);
        });

        // Initial state
        syncIconsWithInput();
    }
});

async function login() {
    try {
        // Validiere Input
        let email = document.getElementById("loginEmail").value.trim();
        let password = document.getElementById("loginPassword").value.trim();

        if (!email || !password) {
            showLoginError("Please fill in all fields.");
            return;
        }

        if (!isValidEmail(email)) {
            showLoginError("Please enter a valid email address.");
            return;
        }

        let response = await fetch(`${BASE_URL}/users.json`);
        if (!response.ok) throw new Error(`HTTP-Error! Status: ${response.status}`);
        let userAsJson = await response.json();

        let signedUpUser = Object.values(userAsJson || {}).find(
            u => u.email === email && u.password === password
        );

        if (signedUpUser) {
            localStorage.setItem("user", JSON.stringify({
                mode: "user",
                email: email,
                displayName: signedUpUser.name || ""
            }));
            window.location.href = "summary.html";
        } else {
            // Zeige benutzerdefinierte Fehlermeldung
            showLoginError("Email or password is incorrect.");
        }
    } catch (error) {
        showLoginError("An error occurred. Please try again later.");
    }
}

function showLoginError(message) {
    // Entferne alte Fehlermeldung falls vorhanden
    const oldError = document.querySelector('.login-error');
    if (oldError) oldError.remove();

    // Erstelle neue Fehlermeldung
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error';
    errorDiv.textContent = message;
    
    // Füge Fehlermeldung in den permanenten Container ein
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.appendChild(errorDiv);
    
    // Markiere Input-Felder mit Fehler-Border
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    emailInput.classList.add('input-error');
    passwordInput.classList.add('input-error');
    
    // Entferne Fehler-Markierung beim Tippen
    const removeError = () => {
        emailInput.classList.remove('input-error');
        passwordInput.classList.remove('input-error');
        if (oldError) oldError.remove();
    };
    
    emailInput.addEventListener('input', removeError, { once: true });
    passwordInput.addEventListener('input', removeError, { once: true });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function navigateToSignup() {
     window.location.href = "signup.html";
}

function guestLogin() {
  // Guest-Session speichern (wichtig für Summary)
  localStorage.setItem("user", JSON.stringify({ mode: "guest" }));

  window.location.href = "summary.html";
}
