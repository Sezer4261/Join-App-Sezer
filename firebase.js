const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_PROJECT.appspot.com",
  messagingSenderId: "DEIN_SENDER_ID",
  appId: "DEIN_APP_ID"
};

function isPlaceholderFirebaseConfig(config) {
  if (!config || typeof config !== "object") return true;
  return Object.values(config).some((value) =>
    typeof value === "string" && value.toUpperCase().includes("DEIN_")
  );
}

function exposeFirebaseLogout(auth) {
  function firebaseLogout() {
    if (auth && typeof auth.signOut === "function") {
      auth.signOut().catch((error) => {
        console.warn("Logout failed:", error);
      });
    }
  }
  window.firebaseLogout = firebaseLogout;
}

function initFirebaseIfAvailable() {
  if (typeof firebase === "undefined") return false;
  if (isPlaceholderFirebaseConfig(firebaseConfig)) return false;

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  exposeFirebaseLogout(auth);
  return true;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureFirebaseSdkAndInit() {
  if (isPlaceholderFirebaseConfig(firebaseConfig)) {
    return;
  }
  if (initFirebaseIfAvailable()) {
    return;
  }

  try {
    // Load Firebase global (compat) SDK on demand.
    // Using compat because this project uses the namespaced v8-style API (firebase.initializeApp, firebase.auth()).
    const version = "9.23.0";
    await loadScript(`https://www.gstatic.com/firebasejs/${version}/firebase-app-compat.js`);
    await loadScript(`https://www.gstatic.com/firebasejs/${version}/firebase-auth-compat.js`);
    initFirebaseIfAvailable();
  } catch (error) {
    console.warn("Firebase SDK not loaded — skipping init.", error);
  }
}

ensureFirebaseSdkAndInit();

// Optional: User-Profil aktualisieren
/**
 * Updates user profile.
 * @returns {void} Result.
 */
function updateUserProfile() {
  const userData = getStoredUser();
  const profile = document.getElementById("user-profile");
  if (!profile) return;
  profile.textContent = "";
  if (!userData) return;
  applyUserProfile(profile, userData);
}

/**
 * Returns stored user.
 * @returns {*} Result.
 */
function getStoredUser() {
  return JSON.parse(localStorage.getItem("user") || "null");
}

/**
 * Executes apply user profile logic.
 * @param {*} profile - Parameter.
 * @param {*} userData - Parameter.
 * @returns {void} Result.
 */
function applyUserProfile(profile, userData) {
  if (userData.mode === "guest") {
    profile.textContent = "G";
    return;
  }
  const initials = getUserInitials(userData);
  if (initials) {
    profile.textContent = initials;
    return;
  }
  applyEmailInitial(profile, userData);
}

/**
 * Returns user initials.
 * @param {*} userData - Parameter.
 * @returns {*} Result.
 */
function getUserInitials(userData) {
  const name = (userData.displayName || userData.name || "").trim();
  if (!name) return "";
  return name.split(" ").map(n => n[0]).join("");
}

/**
 * Executes apply email initial logic.
 * @param {*} profile - Parameter.
 * @param {*} userData - Parameter.
 * @returns {void} Result.
 */
function applyEmailInitial(profile, userData) {
  if (userData.email) {
    profile.textContent = userData.email[0].toUpperCase();
  }
}

document.addEventListener("DOMContentLoaded", updateUserProfile);
