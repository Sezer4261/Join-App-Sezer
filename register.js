function addUser() {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerPasswordConfirm").value;

  if (password !== confirmPassword) {
    document.getElementById("msgBox").innerText = "Passwords do not match!";
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      localStorage.setItem("username", name);
      window.location.href = "login.html";
    })
    .catch(error => {
      document.getElementById("msgBox").innerText = "Sign up failed: " + error.message;
    });
}
