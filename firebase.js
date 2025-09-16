const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_PROJECT.appspot.com",
  messagingSenderId: "DEIN_SENDER_ID",
  appId: "DEIN_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function logout() {
  auth.signOut()
    .then(() => {
      localStorage.removeItem("user");
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert("Logout failed: " + error.message);
    });
}

function checkAuth() {
  auth.onAuthStateChanged((user) => {
    if (!user && !localStorage.getItem("user")) {
      window.location.href = "login.html";
    } else {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.email) {
        const profile = document.getElementById("user-profile");
        if (profile) profile.innerText = userData.displayName ? userData.displayName[0] : userData.email[0].toUpperCase();
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", checkAuth);
