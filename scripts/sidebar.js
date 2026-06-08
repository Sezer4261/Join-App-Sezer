/** @file Sidebar navigation highlighting. */

/**
 * Navigates the browser to the summary dashboard page.
 * @returns {void}
 */
function sidebarHighlightingSummary() {
    window.location.href = getPagePath("summary.html");
}

/**
 * Navigates to the add-task page and optionally stores a board column status for pre-selection.
 * @param {string} [status] - Board column label (e.g. "To Do") to pre-select when the add-task form opens.
 * @returns {void}
 */
function sidebarHighlightingAddTask(status) {
    if (status) {
        sessionStorage.setItem("addTaskBoardStatus", status);
    }
    window.location.href = getPagePath("add-task.html");
}

/**
 * Navigates the browser to the kanban board page.
 * @returns {void}
 */
function sidebarHighlightingBoard() {
    window.location.href = getPagePath("board.html");
}

/**
 * Navigates the browser to the contacts management page.
 * @returns {void}
 */
function sidebarHighlightingContacts() {
    window.location.href = getPagePath("contacts.html");
}

/**
 * Navigates the browser to the login page from the sidebar.
 * @returns {void}
 */
function openLogInSide() {
    window.location.href = getPagePath("index.html");
}

/**
 * Navigates the browser to the legal notice page.
 * @returns {void}
 */
function navigateToLegalNotice() {
    window.location.href = getPagePath("legal-notice.html");
}

/**
 * Navigates the browser to the privacy policy page.
 * @returns {void}
 */
function navigateToPrivacyPolicy() {
    window.location.href = getPagePath("privacy-policy.html");
}
