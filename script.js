let BASE_URL = "https://join-app-firebase-default-rtdb.europe-west1.firebasedatabase.app";

let columns = ["To Do", "In Progress", "Await Feedback", "Done"];
let draggedTaskId = null;
let activeTask = null;
let users = [
  { 'email': 'erik@test.de', 'password': 'test1234' }
];
let contacts = [];
let selectedContacts = [];
let subtasks = [];

/**
 * Loads contacts.
 * @returns {Promise<*>} Result.
 */
async function loadContacts() {
  try {
    const data = await fetchContactsData();
    contacts = data ? mapContactsData(data) : [];
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}

/**
 * Fetches contacts data.
 * @returns {Promise<*>} Result.
 */
async function fetchContactsData() {
  const response = await fetch(`${BASE_URL}/contacts.json`);
  return await response.json();
}

/**
 * Executes map contacts data logic.
 * @param {*} data - Parameter.
 * @returns {void} Result.
 */
function mapContactsData(data) {
  return Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
}

// Seite sofort schützen (BEVOR irgendwas anderes passiert)
// ABER NUR auf geschützten Seiten (nicht auf index.html / signup.html)
/**
 * Executes protect this page logic.
 * @returns {void} Result.
 */
function protectThisPage() {
  const currentPage = window.location.pathname;
  if (isPublicPage(currentPage)) {
    return;
  }
  if (!localStorage.getItem("user")) {
    window.location.replace("index.html");
  }
}

/**
 * Checks whether public page.
 * @param {*} pathname - Parameter.
 * @returns {boolean} Result.
 */
function isPublicPage(pathname) {
  return pathname.includes('index.html') || pathname.includes('signup.html');
}

// Sofort aufrufen
protectThisPage();

/**
 * Shows message.
 * @param {string} message - Message text.
 * @param {string} type - Message type.
 * @param {{ iconSrc?: string, iconAlt?: string }} [options] - Optional options.
 * @returns {void} Result.
 */
function showMessage(message, type = "success", options = {}) {
  const box = getOrCreateMessageBox();
  setMessageBoxContent(box, message, options);
  setMessageBoxType(box, type);
  setMessageBoxBaseStyles(box);
  setMessageBoxLayoutStyles(box);
  setMessageBoxColors(box, type);
  scheduleMessageHide(box);
}

/**
 * Returns or create message box.
 * @returns {*} Result.
 */
function getOrCreateMessageBox() {
  let box = document.getElementById("msgBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "msgBox";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }
  return box;
}

/**
 * Sets message box content.
 * @param {*} box - Parameter.
 * @param {string} message - Message text.
 * @param {{ iconSrc?: string, iconAlt?: string }} [options] - Optional options.
 * @returns {void} Result.
 */
function setMessageBoxContent(box, message, options = {}) {
  box.innerHTML = "";
  const textEl = document.createElement("span");
  textEl.textContent = message;
  box.appendChild(textEl);

  if (options && options.iconSrc) {
    const iconEl = document.createElement("img");
    iconEl.src = options.iconSrc;
    iconEl.alt = options.iconAlt || "";
    iconEl.style.width = "24px";
    iconEl.style.height = "24px";
    iconEl.style.flex = "0 0 auto";
    box.appendChild(iconEl);
  }
}

/**
 * Sets message box type.
 * @param {*} box - Parameter.
 * @param {string} type - Message type.
 * @returns {void} Result.
 */
function setMessageBoxType(box, type) {
  box.className = `msgBox ${type}`;
}

/**
 * Sets message box base styles.
 * @param {*} box - Parameter.
 * @returns {void} Result.
 */
function setMessageBoxBaseStyles(box) {
  box.style.position = "fixed";
  box.style.left = "50%";
  box.style.top = "50%";
  box.style.transform = "translate(-50%, -50%)";
  box.style.zIndex = "9999";
}

/**
 * Sets message box layout styles.
 * @param {*} box - Parameter.
 * @returns {void} Result.
 */
function setMessageBoxLayoutStyles(box) {
  box.style.display = "flex";
  box.style.alignItems = "center";
  box.style.justifyContent = "center";
  box.style.gap = "10px";
  box.style.minWidth = "280px";
  box.style.maxWidth = "min(520px, calc(100vw - 32px))";
  box.style.padding = "18px 22px";
  box.style.borderRadius = "18px";
  box.style.color = "#fff";
  box.style.fontSize = "18px";
  box.style.fontWeight = "400";
  box.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.22)";
  box.style.pointerEvents = "none";
}

/**
 * Sets message box colors.
 * @param {*} box - Parameter.
 * @param {string} type - Message type.
 * @returns {void} Result.
 */
function setMessageBoxColors(box, type) {
  if (type === "error") {
    box.style.background = "var(--urgent, #ff3d00)";
    return;
  }
  box.style.background = "var(--sidebar-bg, #2a3647)";
}

/**
 * Executes schedule message hide logic.
 * @param {*} box - Parameter.
 * @returns {void} Result.
 */
function scheduleMessageHide(box) {
  window.clearTimeout(box._hideTimeout);
  box._hideTimeout = window.setTimeout(() => {
    box.style.display = "none";
  }, 1500);
}

/**
 * Toggles profile menu.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function toggleProfileMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById('profileMenu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

// Menü schließen wenn außerhalb geklickt wird
document.addEventListener('click', (event) => {
  const menu = document.getElementById('profileMenu');
  const profileContainer = document.querySelector('.user-profile-container');
  if (menu && profileContainer && !profileContainer.contains(event.target)) {
    menu.classList.remove('active');
  }
});

/**
 * Executes logout logic.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function logout(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  clearUserSession();
  safeFirebaseLogout();
  redirectToLogin();
}

/**
 * Clears user session.
 * @returns {void} Result.
 */
function clearUserSession() {
  localStorage.removeItem("user");
}

/**
 * Executes safe firebase logout logic.
 * @returns {void} Result.
 */
function safeFirebaseLogout() {
  try {
    if (typeof window.firebaseLogout === "function") {
      window.firebaseLogout();
    }
  } catch (e) {
    console.warn("Firebase logout failed (not critical):", e);
  }
}

/**
 * Executes redirect to login logic.
 * @returns {void} Result.
 */
function redirectToLogin() {
  window.location.replace("index.html");
}

// Verhindere Seiten-Cache
window.addEventListener("pageshow", (event) => {
  if (event.persisted && !localStorage.getItem("user")) {
    window.location.replace("index.html");
  }
});

// Cache deaktivieren
window.addEventListener("beforeunload", () => {
  // Keine Aktion nötig, aber wichtig für manche Browser
});
