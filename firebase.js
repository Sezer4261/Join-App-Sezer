const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_PROJECT.appspot.com",
  messagingSenderId: "DEIN_SENDER_ID",
  appId: "DEIN_APP_ID"
};

if (typeof firebase !== "undefined") {
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
} else {
  console.warn("Firebase SDK not loaded — skipping init.");
}

// Optional: User-Profil aktualisieren
function updateUserProfile() {
  const userData = JSON.parse(localStorage.getItem("user") || "null");
  const profile = document.getElementById("user-profile");
  if (!profile) return;

  // Default leer
  profile.textContent = "";

  if (!userData) return;

  // Guest: immer "G"
  if (userData.mode === "guest") {
    profile.textContent = "G";
    return;
  }

  // Eingeloggt: Initialen wie bei Contacts
  const name = (userData.displayName || userData.name || "").trim();
  if (name) {
    const initials = name.split(" ").map(n => n[0]).join("");
    profile.textContent = initials;
    return;
  }

  if (userData.email) {
    profile.textContent = userData.email[0].toUpperCase();
  }
}

document.addEventListener("DOMContentLoaded", updateUserProfile);
