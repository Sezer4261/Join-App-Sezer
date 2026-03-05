/**
 * Builds a page path that works from root pages and /public pages.
 * @param {string} fileName - Target HTML file.
 * @returns {string} Context-safe relative path.
 */
function getNavPath(fileName) {
    const inPublicFolder = window.location.pathname.includes('/public/');
    return `${inPublicFolder ? '../' : './'}${fileName}`;
}

/**
 * Executes sidebar highlighting summary logic.
 * @returns {void} Result.
 */
function sidebarHighlightingSummary() {
    window.location.href = getNavPath("summary.html");
}

/**
 * Executes sidebar highlighting add task logic.
 * @returns {void} Result.
 */
function sidebarHighlightingAddTask() {
    window.location.href = getNavPath("add-task.html");
}

/**
 * Executes sidebar highlighting board logic.
 * @returns {void} Result.
 */
function sidebarHighlightingBoard() {
    window.location.href = getNavPath("board.html");
}

/**
 * Executes sidebar highlighting contacts logic.
 * @returns {void} Result.
 */
function sidebarHighlightingContacts() {
    window.location.href = getNavPath("contacts.html");

}

/**
 * Opens log in side.
 * @returns {void} Result.
 */
function openLogInSide() {
    window.location.href = getNavPath("index.html");
}

/**
 * Executes navigate to legal notice logic.
 * @returns {void} Result.
 */
function navigateToLegalNotice() {
    window.location.href = getNavPath("legal-notice.html");
}

/**
 * Executes navigate to privacy policy logic.
 * @returns {void} Result.
 */
function navigateToPrivacyPolicy() {
    window.location.href = getNavPath("privacy-policy.html");
}
