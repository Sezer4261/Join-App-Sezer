async function addUser() {
    let name = document.getElementById('registerName');
    let email = document.getElementById('registerEmail');
    let password = document.getElementById('registerPassword');
    let confirmPassword = document.getElementById('registerPasswordConfirm');

    if (password.value === confirmPassword.value) {
        let newUser = { name: name.value, email: email.value, password: password.value };
        users.push(newUser);
        try {
            await postData("users", newUser); // Nur den neuen User senden
            window.location.href = 'index.html?msg=Du hast dich erfolgreich registriert!';
        } catch (err) {
            console.error("Fehler beim Posten:", err);
            alert("Registrierung fehlgeschlagen.");
        }
    } else {
        alert("Die eingegebenen Passwörter stimmen nicht überein!");
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
