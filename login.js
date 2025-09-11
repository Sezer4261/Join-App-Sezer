const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_PROJECT.appspot.com",
  messagingSenderId: "DEIN_SENDER_ID",
  appId: "DEIN_APP_ID"
};

firebase.initializeApp(firebaseConfig);

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      localStorage.setItem("username", email.split("@")[0]);
      window.location.href = "summary.html";
    })
    .catch(error => {
      document.getElementById("msgBox").innerText = "Login failed: " + error.message;
    });
}

function guestLogin() {
  localStorage.setItem("username", "Guest");
  window.location.href = "summary.html";
}
