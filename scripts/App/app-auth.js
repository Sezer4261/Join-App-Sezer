/** @file Authentication guard, session, and navigation helpers. */

/**
 * Checks whether localStorage contains a valid user or guest session.
 * @returns {boolean} Whether the current visitor is considered logged in.
 */
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

/**
 * Redirects unauthenticated visitors away from protected pages to the login screen.
 * @returns {void}
 */
function protectThisPage() {
  const currentPage = window.location.pathname;
  if (isPublicPage(currentPage)) return;
  if (!isUserLoggedIn()) {
    window.location.replace(getPagePath("index.html"));
  }
}

/**
 * Determines whether the given pathname belongs to a page accessible without authentication.
 * @param {string} pathname - Current page pathname from window.location.
 * @returns {boolean} Whether the page can be viewed without a stored session.
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
 * Clears the stored session, signs out of Firebase, and redirects to the login page.
 * @param {Event} [event] - Optional click event whose default action and propagation should be suppressed.
 * @returns {void}
 */
function logout(event) {
  event?.preventDefault();
  event?.stopPropagation();
  clearUserSession();
  safeFirebaseLogout();
  redirectToLogin();
}

/**
 * Removes the serialized user session from localStorage.
 * @returns {void}
 */
function clearUserSession() {
  localStorage.removeItem("user");
}

/**
 * Attempts a Firebase sign-out without throwing when Firebase is unavailable or fails.
 * @returns {void}
 */
function safeFirebaseLogout() {
  try {
    if (typeof window.firebaseLogout === "function") window.firebaseLogout();
  } catch (e) {
    console.warn("Firebase logout failed (not critical):", e);
  }
}

/**
 * Replaces the current browser location with the login page URL.
 * @returns {void}
 */
function redirectToLogin() {
  window.location.replace(getPagePath("index.html"));
}

/**
 * Navigates to the summary page when logged in, otherwise to the login page.
 * @returns {void}
 */
function navigateToAppHome() {
  window.location.href = getPagePath(isUserLoggedIn() ? "summary.html" : "index.html");
}

/**
 * Navigates the browser to the help page.
 * @returns {void}
 */
function navigateToHelp() {
  window.location.href = getPagePath("help.html");
}

/**
 * Builds a relative path to an HTML file, accounting for whether the current page lives under public/.
 * @param {string} fileName - Target HTML file name such as "summary.html".
 * @returns {string} Relative URL path suitable for window.location assignment.
 */
function getPagePath(fileName) {
  const normalizedPath = String(window.location.pathname || "").replace(/\\/g, "/");
  const inPublicFolder = normalizedPath.includes("/public/");
  return `${inPublicFolder ? "../" : "./"}${fileName}`;
}

/**
 * Redirects bare folder-root URLs (without an HTML file) to the login page.
 * @returns {void}
 */
function redirectBareRootToLogin() {
  const path = String(window.location.pathname || "").replace(/\\/g, "/");
  if (/\.html$/i.test(path)) return;
  if (path === "/" || path.endsWith("/")) {
    window.location.replace(getPagePath("index.html"));
  }
}

/**
 * Returns from the help page to summary when logged in, otherwise to the login page.
 * @returns {void}
 */
function navigateFromHelpBack() {
  if (isUserLoggedIn()) {
    window.location.href = getPagePath("summary.html");
    return;
  }
  window.location.href = getPagePath("index.html");
}

/**
 * Updates mobile footer home links to point to summary or login depending on session state.
 * @returns {void}
 */
function initSessionAwareNavigation() {
  const loggedIn = isUserLoggedIn();
  document.querySelectorAll("[data-app-home-link]").forEach((link) => {
    link.href = getPagePath(loggedIn ? "summary.html" : "index.html");
    link.textContent = loggedIn ? "Summary" : "Log In";
  });
}

/**
 * Re-validates session state when the page is restored from the back-forward cache.
 * @param {PageTransitionEvent} event - Pageshow event indicating whether the page was persisted.
 * @returns {void}
 */
function handlePageshowSessionCheck(event) {
  const currentPage = window.location.pathname;
  initSessionAwareNavigation();
  if (!event.persisted || isPublicPage(currentPage)) return;
  if (!isUserLoggedIn()) {
    window.location.replace(getPagePath("index.html"));
  }
}

redirectBareRootToLogin();
protectThisPage();

document.addEventListener("DOMContentLoaded", initSessionAwareNavigation);

window.addEventListener("pageshow", handlePageshowSessionCheck);
