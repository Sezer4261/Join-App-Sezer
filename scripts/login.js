//const BASE_URL = "https://deine-api-url-hier"; // Passe deine API-URL an

async function login() {
    try {
        let response = await fetch(`${BASE_URL}/users.json`);
        if (!response.ok) throw new Error(`HTTP-Error! Status: ${response.status}`);
        let userAsJson = await response.json();

        let email = document.getElementById("loginEmail").value;
        let password = document.getElementById("loginPassword").value;

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
}

function navigateToSignup() {
     window.location.href = "signup.html";
}

function guestLogin() {
  // Guest-Session speichern (wichtig für Summary)
  localStorage.setItem("user", JSON.stringify({ mode: "guest" }));

  window.location.href = "summary.html";
}
