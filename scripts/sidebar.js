function sidebarHighlightingSummary() {
    window.location.href = "summary.html";

    document.getElementById("summary-li").classList = "highlighted";
    document.getElementById("add-task-li").classList = "sidebar-li-hover-effect";
    document.getElementById("board-li").classList = "sidebar-li-hover-effect";
    document.getElementById("contacts-li").classList = "sidebar-li-hover-effect";

    document.getElementById("privacy-policy-div").classList = "sidebar-footer-link-hover-effect";
    document.getElementById("legal-notice-div").classList = "sidebar-footer-link-hover-effect";
}

function sidebarHighlightingAddTask() {
    window.location.href = "addTask.html";

    document.getElementById("summary-li").classList = "sidebar-li-hover-effect";
    document.getElementById("add-task-li").classList = "highlighted";
    document.getElementById("board-li").classList = "sidebar-li-hover-effect";
    document.getElementById("contacts-li").classList = "sidebar-li-hover-effect";

    document.getElementById("privacy-policy-div").classList = "sidebar-footer-link-hover-effect";
    document.getElementById("legal-notice-div").classList = "sidebar-footer-link-hover-effect";
}

function sidebarHighlightingBoard() {
    window.location.href = "board.html";

    document.getElementById("summary-li").classList = "sidebar-li-hover-effect";
    document.getElementById("add-task-li").classList = "sidebar-li-hover-effect";
    document.getElementById("board-li").classList = "highlighted";
    document.getElementById("contacts-li").classList = "sidebar-li-hover-effect";

    document.getElementById("privacy-policy-div").classList = "sidebar-footer-link-hover-effect";
    document.getElementById("legal-notice-div").classList = "sidebar-footer-link-hover-effect";
}

function sidebarHighlightingContacts() {
    document.getElementById("summary-li").classList = "sidebar-li-hover-effect";
    document.getElementById("add-task-li").classList = "sidebar-li-hover-effect";
    document.getElementById("board-li").classList = "sidebar-li-hover-effect";
    document.getElementById("contacts-li").classList = "highlighted";

    document.getElementById("privacy-policy-div").classList = "sidebar-footer-link-hover-effect";
    document.getElementById("legal-notice-div").classList = "sidebar-footer-link-hover-effect";
}

function sidebarHighlightingPrivacyPolicy() {
    document.getElementById("summary-li").classList = "sidebar-li-hover-effect";
    document.getElementById("add-task-li").classList = "sidebar-li-hover-effect";
    document.getElementById("board-li").classList = "sidebar-li-hover-effect";
    document.getElementById("contacts-li").classList = "sidebar-li-hover-effect";

    document.getElementById("privacy-policy-div").classList = "highlighted";
    document.getElementById("legal-notice-div").classList = "sidebar-footer-link-hover-effect";
}

function sidebarHighlightingLegalNotice() {
    document.getElementById("summary-li").classList = "sidebar-li-hover-effect";
    document.getElementById("add-task-li").classList = "sidebar-li-hover-effect";
    document.getElementById("board-li").classList = "sidebar-li-hover-effect";
    document.getElementById("contacts-li").classList = "sidebar-li-hover-effect";

    document.getElementById("privacy-policy-div").classList = "sidebar-footer-link-hover-effect";
    document.getElementById("legal-notice-div").classList = "highlighted";
}

