function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showMessage("Bitte fülle alle Felder aus ❌", "error");
    return;
  }

  // Simulierter Login
  if (email === "test@test.com" && password === "1234") {
    showMessage("Login erfolgreich ✅", "success");
    setTimeout(() => {
      window.location.href = "summary.html";
    }, 2000);
  } else {
    showMessage("Falsche Zugangsdaten ❌", "error");
  }
}

function guestLogin() {
  showMessage("Guest Login erfolgreich ✅", "success");
  setTimeout(() => {
    window.location.href = "summary.html";
  }, 1500);
}

function navigateToSignup() {
  window.location.href = "signup.html";
}
