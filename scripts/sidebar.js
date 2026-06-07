/** @file Sidebar navigation highlighting. */
/**
 * Executes sidebar highlighting summary logic.
 * @returns {void} Result.
 */
function sidebarHighlightingSummary() {
    window.location.href = getPagePath("summary.html");
}

/**
 * Navigates to the add-task page, optionally pre-selecting a board column status.
 * @param {string} [status] - Board column status (e.g. "To Do", "In Progress").
 * @returns {void} Result.
 */
function sidebarHighlightingAddTask(status) {
    if (status) {
        sessionStorage.setItem("addTaskBoardStatus", status);
    }
    window.location.href = getPagePath("add-task.html");
}

/**
 * Executes sidebar highlighting board logic.
 * @returns {void} Result.
 */
function sidebarHighlightingBoard() {
    window.location.href = getPagePath("board.html");
}

/**
 * Executes sidebar highlighting contacts logic.
 * @returns {void} Result.
 */
function sidebarHighlightingContacts() {
    window.location.href = getPagePath("contacts.html");

}

/**
 * Opens log in side.
 * @returns {void} Result.
 */
function openLogInSide() {
    window.location.href = getPagePath("index.html");
}

/**
 * Executes navigate to legal notice logic.
 * @returns {void} Result.
 */
function navigateToLegalNotice() {
    window.location.href = getPagePath("legal-notice.html");
}

/**
 * Executes navigate to privacy policy logic.
 * @returns {void} Result.
 */
function navigateToPrivacyPolicy() {
    window.location.href = getPagePath("privacy-policy.html");
}
