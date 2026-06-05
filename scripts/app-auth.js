/** @file Authentication guard, session, and navigation helpers. */

/** Redirects unauthenticated users away from protected pages. */
function protectThisPage() {
  const currentPage = window.location.pathname;
  if (isPublicPage(currentPage)) return;
  if (!localStorage.getItem("user")) {
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

/** Sends logged-in users away from login/signup entry pages. */
function redirectLoggedInUserFromEntryPages() {
  if (!localStorage.getItem("user")) return;
  const path = String(window.location.pathname || "").replace(/\\/g, "/");
  const onEntryPage =
    path === "/" ||
    path.endsWith("/index.html") ||
    path.endsWith("/signup.html");
  if (onEntryPage) {
    window.location.replace(getPagePath("summary.html"));
  }
}

/** Returns from help to the app start page when a session exists. */
function navigateFromHelpBack() {
  if (localStorage.getItem("user")) {
    window.location.href = getPagePath("summary.html");
    return;
  }
  window.history.back();
}

protectThisPage();
redirectLoggedInUserFromEntryPages();

window.addEventListener("pageshow", (event) => {
  const currentPage = window.location.pathname;
  if (event.persisted) {
    redirectLoggedInUserFromEntryPages();
  }
  if (!event.persisted || isPublicPage(currentPage)) return;
  if (!localStorage.getItem("user")) {
    window.location.replace(getPagePath("index.html"));
  }
});
