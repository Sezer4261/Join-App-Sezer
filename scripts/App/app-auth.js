/** @file Authentication guard, session, and navigation helpers. */

/** @returns {boolean} */
function isUserLoggedIn() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return false;
    const session = JSON.parse(raw);
    return !!session && (session.mode === "guest" || session.mode === "user" || !!session.email);
  } catch (_) {
    return false;
  }
}

/** Redirects unauthenticated users away from protected pages. */
function protectThisPage() {
  const currentPage = window.location.pathname;
  if (isPublicPage(currentPage)) return;
  if (!isUserLoggedIn()) {
    window.location.replace(getPagePath("index.html"));
  }
}

/**
 * @param {string} pathname
 * @returns {boolean}
 */
function isPublicPage(pathname) {
  const normalizedPath = String(pathname || "").replace(/\\/g, "/");
  return (
    normalizedPath === "/" ||
    normalizedPath.endsWith("/index.html") ||
    normalizedPath.endsWith("/signup.html") ||
    normalizedPath.endsWith("/help.html") ||
    normalizedPath.endsWith("/privacy-policy.html") ||
    normalizedPath.endsWith("/legal-notice.html") ||
    normalizedPath.endsWith("/public/privacy-policy.html") ||
    normalizedPath.endsWith("/public/legal-notice.html")
  );
}

/**
 * @param {Event} [event]
 * @returns {void}
 */
function logout(event) {
  event?.preventDefault();
  event?.stopPropagation();
  clearUserSession();
  safeFirebaseLogout();
  redirectToLogin();
}

function clearUserSession() {
  localStorage.removeItem("user");
}

function safeFirebaseLogout() {
  try {
    if (typeof window.firebaseLogout === "function") window.firebaseLogout();
  } catch (e) {
    console.warn("Firebase logout failed (not critical):", e);
  }
}

function redirectToLogin() {
  window.location.replace(getPagePath("index.html"));
}

/** Opens the app home (summary when logged in, login otherwise). */
function navigateToAppHome() {
  window.location.href = getPagePath(isUserLoggedIn() ? "summary.html" : "index.html");
}

function navigateToHelp() {
  window.location.href = getPagePath("help.html");
}

/**
 * @param {string} fileName
 * @returns {string}
 */
function getPagePath(fileName) {
  const normalizedPath = String(window.location.pathname || "").replace(/\\/g, "/");
  const inPublicFolder = normalizedPath.includes("/public/");
  return `${inPublicFolder ? "../" : "./"}${fileName}`;
}

/** Sends folder-root URLs to the login page when no HTML file is in the path. */
function redirectBareRootToLogin() {
  const path = String(window.location.pathname || "").replace(/\\/g, "/");
  if (/\.html$/i.test(path)) return;
  if (path === "/" || path.endsWith("/")) {
    window.location.replace(getPagePath("index.html"));
  }
}

/** Returns from help to the app home (never back to login when a session exists). */
function navigateFromHelpBack() {
  if (isUserLoggedIn()) {
    window.location.href = getPagePath("summary.html");
    return;
  }
  window.location.href = getPagePath("index.html");
}

/** Updates mobile footer entry links for the current session. */
function initSessionAwareNavigation() {
  const loggedIn = isUserLoggedIn();
  document.querySelectorAll("[data-app-home-link]").forEach((link) => {
    link.href = getPagePath(loggedIn ? "summary.html" : "index.html");
    link.textContent = loggedIn ? "Summary" : "Log In";
  });
}

redirectBareRootToLogin();
protectThisPage();

document.addEventListener("DOMContentLoaded", initSessionAwareNavigation);

window.addEventListener("pageshow", (event) => {
  const currentPage = window.location.pathname;
  initSessionAwareNavigation();
  if (!event.persisted || isPublicPage(currentPage)) return;
  if (!isUserLoggedIn()) {
    window.location.replace(getPagePath("index.html"));
  }
});
