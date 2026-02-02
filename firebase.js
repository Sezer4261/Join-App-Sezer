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

// Firebase Logout (optional)
function firebaseLogout() {
  if (auth && typeof auth.signOut === "function") {
    auth.signOut().catch((error) => {
      console.warn("Logout failed:", error);
    });
  }
}

window.firebaseLogout = firebaseLogout;

// Optional: User-Profil aktualisieren
function updateUserProfile() {
  const userData = JSON.parse(localStorage.getItem("user") || "null");
  if (userData && userData.email) {
    const profile = document.getElementById("user-profile");
    if (profile) {
      profile.innerText = userData.displayName
        ? userData.displayName[0]
        : userData.email[0].toUpperCase();
    }
  }
}

document.addEventListener("DOMContentLoaded", updateUserProfile);
