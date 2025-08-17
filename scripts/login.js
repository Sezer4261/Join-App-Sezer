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
        processLogin(signedUpUser);
    } catch (error) {
        alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    }
}

function processLogin(signedUpUser) {
    if (signedUpUser) {
        window.location.href = "summary.html";
    } else {
        alert("E-Mail oder Passwort ist falsch!");
    }
}

function navigateToSignup() {
     window.location.href = "signup.html";
}

function guestLogin() {
  // Beispiel für Gastlogin (optional)
  window.location.href = "summary.html";
}
