function addUser() {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerPasswordConfirm").value;

  if (password !== confirmPassword) {
    showMessage("Passwörter stimmen nicht überein ❌", "error");
    return;
  }

  if (!name || !email || !password) {
    showMessage("Bitte alle Felder ausfüllen ❌", "error");
    return;
  }

  showMessage("Account erfolgreich erstellt ✅", "success");

  setTimeout(() => {
    navigateToLogin();
  }, 2000);
}

function navigateToLogin() {
  window.location.href = "login.html";
}
