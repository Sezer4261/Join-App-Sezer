/** @file Summary page greeting and task statistics. */

/**
 * Navigates the browser to the kanban board page.
 * @returns {void}
 */
function navigateToBoard() {
    window.location.href = "board.html";
}

/**
 * Sets the text content of a DOM element identified by its id when the element exists.
 * @param {string} id - DOM id of the element whose text content will be updated.
 * @param {string} value - Text to assign to the element's textContent property.
 * @returns {void}
 */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/**
 * Returns a time-of-day greeting string based on the current local hour.
 * @param {boolean} withComma - Whether the greeting should end with a comma instead of an exclamation mark.
 * @returns {string} Localized greeting phrase such as "Good morning," or "Good evening!".
 */
function getGreetingByTime(withComma) {
    const hour = new Date().getHours();
    const suffix = withComma ? "," : "!";

    if (hour < 12) return `Good morning${suffix}`;
    if (hour < 18) return `Good afternoon${suffix}`;
    return `Good evening${suffix}`;
}

/**
 * Reads and parses the stored user session JSON from localStorage.
 * @returns {Object|null} Parsed session object, or null when missing or invalid.
 */
function getStoredSession() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Looks up a registered user's display name in Firebase by email address.
 * @param {string} email - Email address used to find the matching user record.
 * @returns {Promise<string>} Resolved display name, or an empty string when not found.
 */
async function fetchUserNameByEmail(email) {
    if (!email) return "";
    try {
        const response = await fetch(`${BASE_URL}/users.json`);
        if (!response.ok) return "";
        const data = await response.json();
        const user = Object.values(data || {}).find(u => u.email === email);
        return (user && user.name) ? String(user.name) : "";
    } catch (e) {
        console.error("Fehler beim Laden des Usernamens:", e);
        return "";
    }
}

/**
 * Renders the welcome greeting and username on the summary page for the current session.
 * @returns {Promise<void>}
 */
async function renderWelcome() {
    const session = getStoredSession();
    if (isGuestSession(session)) {
        renderGuestWelcome();
        return;
    }
    setText("welcome-msg", getGreetingByTime(true));
    const name = await resolveUserName(session);
    setText("username-field", name);
}

/**
 * Determines whether the session represents a guest user or is absent entirely.
 * @param {Object|null} session - Parsed session object from localStorage.
 * @returns {boolean} Whether the visitor should be treated as a guest.
 */
function isGuestSession(session) {
    return !session || session.mode === "guest";
}

/**
 * Renders the welcome section with a generic greeting and no username for guest users.
 * @returns {void}
 */
function renderGuestWelcome() {
    setText("welcome-msg", getGreetingByTime(false));
    setText("username-field", "");
}

/**
 * Resolves the display name from Firebase first, then falls back to session data.
 * @param {Object} session - Parsed authenticated user session object.
 * @returns {Promise<string>} Best available display name for the welcome header.
 */
async function resolveUserName(session) {
    const nameFromDb = await fetchUserNameByEmail(session.email);
    return nameFromDb || session.displayName || "User";
}

/**
 * Removes mobile welcome overlay classes and restores default aside visibility on desktop.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @returns {void}
 */
function resetMobileOverlayToDefault(aside, welcomeBox) {
    aside.classList.remove("is-visible");
    aside.classList.remove("mobile-welcome-overlay");
    aside.style.display = "";
    welcomeBox.style.display = "";
}

/**
 * Resets the mobile overlay when the viewport grows beyond the mobile breakpoint.
 * @param {MediaQueryListEvent} event - Media query change event from matchMedia.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @returns {void}
 */
function handleMobileWelcomeOverlayMqChange(event, aside, welcomeBox) {
    if (!event.matches) resetMobileOverlayToDefault(aside, welcomeBox);
}

/**
 * Registers a one-time media query listener that resets the overlay on viewport resize.
 * @param {MediaQueryList} mq - Media query list for the mobile breakpoint.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @returns {void}
 */
function initMobileOverlayMqListener(mq, aside, welcomeBox) {
    if (window.mobileWelcomeOverlayMqListenerAdded) return;
    window.mobileWelcomeOverlayMqListenerAdded = true;
    mq.addEventListener("change", (event) => handleMobileWelcomeOverlayMqChange(event, aside, welcomeBox));
}

/**
 * Hides the aside and removes overlay classes after the fade-out transition completes.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @param {Function} onTransitionEnd - Transitionend listener reference to remove after cleanup.
 * @returns {void}
 */
function cleanupMobileOverlay(aside, welcomeBox, onTransitionEnd) {
    if (aside.classList.contains("is-visible")) return;
    aside.style.display = "none";
    welcomeBox.style.display = "";
    aside.classList.remove("mobile-welcome-overlay");
    aside.removeEventListener("transitionend", onTransitionEnd);
}

/**
 * Handles the opacity transition end event to finalize mobile overlay cleanup.
 * @param {TransitionEvent} event - Transitionend event from the aside element.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @param {Function} onTransitionEnd - Same listener reference passed to removeEventListener.
 * @returns {void}
 */
function handleMobileOverlayTransitionEnd(event, aside, welcomeBox, onTransitionEnd) {
    if (event.propertyName !== "opacity") return;
    cleanupMobileOverlay(aside, welcomeBox, onTransitionEnd);
}

/**
 * Schedules the overlay hide animation and fallback cleanup timeouts.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @returns {void}
 */
function scheduleMobileOverlayHide(aside, welcomeBox) {
    const onTransitionEnd = (event) => handleMobileOverlayTransitionEnd(event, aside, welcomeBox, onTransitionEnd);
    aside.addEventListener("transitionend", onTransitionEnd);
    setTimeout(() => aside.classList.remove("is-visible"), 1500);
    setTimeout(() => cleanupMobileOverlay(aside, welcomeBox, onTransitionEnd), 2300);
}

/**
 * Applies overlay classes and triggers the fade-in animation on mobile viewports.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @returns {void}
 */
function showMobileOverlayAnimation(aside, welcomeBox) {
    aside.classList.add("mobile-welcome-overlay");
    aside.style.display = "flex";
    welcomeBox.style.display = "flex";
    aside.classList.remove("is-visible");
    requestAnimationFrame(() => aside.classList.add("is-visible"));
    scheduleMobileOverlayHide(aside, welcomeBox);
}

/**
 * Shows the animated mobile welcome overlay when the viewport is under 900px wide.
 * @returns {void}
 */
function showMobileWelcomeOverlay() {
    const mq = window.matchMedia("(max-width: 900px)");
    const welcomeBox = document.getElementById("welcome-msg-box");
    if (!welcomeBox) return;
    const aside = welcomeBox.closest("aside");
    if (!aside) return;
    initMobileOverlayMqListener(mq, aside, welcomeBox);
    if (!mq.matches) { resetMobileOverlayToDefault(aside, welcomeBox); return; }
    showMobileOverlayAnimation(aside, welcomeBox);
}

/**
 * Fetches all tasks from the Firebase Realtime Database REST API.
 * @returns {Promise<Array>} Array of task objects parsed from the Firebase response.
 */
async function fetchTasks() {
    const response = await fetch(`${BASE_URL}/tasks.json`);
    if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
    }

    const data = await response.json();
    return Object.values(data || {});
}

/**
 * Loads tasks from Firebase and writes aggregated KPI values to the dashboard DOM.
 * @returns {Promise<void>}
 */
async function updateDashboard() {
    try {
        const tasks = await fetchTasks();
        applyDashboardStats(tasks);
    } catch (error) {
        console.error("Fehler beim Abrufen der Dashboard-Daten:", error);
    }
}

/**
 * Writes computed task statistics into the summary page KPI elements.
 * @param {Array<Object>} tasks - Full list of task objects from Firebase.
 * @returns {void}
 */
function applyDashboardStats(tasks) {
    const stats = getDashboardStats(tasks);
    setText("total-to-do", stats.todoCount);
    setText("total-done", stats.doneCount);
    setText("total-tasks-progress", stats.inProgressCount);
    setText("total-awaiting-feedback", stats.awaitingFeedbackCount);
    setText("total-urgent", stats.urgentCount);
    setText("total-tasks-board", stats.totalTasks);
    setText("due-date", formatDashboardDueDate(stats.earliestUrgentDueDate));
}

/**
 * Counts tasks grouped by their board status column.
 * @param {Array<Object>} tasks - Full list of task objects from Firebase.
 * @returns {Object} Status count properties for each board column.
 */
function getTaskStatusCounts(tasks) {
    return {
        todoCount: tasks.filter(t => t.status === "To Do").length,
        doneCount: tasks.filter(t => t.status === "Done").length,
        inProgressCount: tasks.filter(t => t.status === "In Progress").length,
        awaitingFeedbackCount: tasks.filter(t => t.status === "Await Feedback").length
    };
}

/**
 * Computes all dashboard KPI values from a task list, including urgent task metrics.
 * @param {Array<Object>} tasks - Full list of task objects from Firebase.
 * @returns {Object} Aggregated counts and earliest urgent due date for the dashboard.
 */
function getDashboardStats(tasks) {
    const urgentTasks = tasks.filter(t => {
        if (t.priority !== "urgent" || t.status === "Done") return false;
        const due = parseTaskDueDate(t.dueDate);
        return Boolean(due && isStrictlyFutureDate(due));
    });
    const counts = getTaskStatusCounts(tasks);
    return {
        ...counts,
        urgentCount: urgentTasks.length,
        earliestUrgentDueDate: getEarliestFutureDueDate(urgentTasks),
        totalTasks: tasks.length
    };
}

/**
 * Returns whether a date falls strictly after today at midnight local time.
 * @param {Date} date - Date instance to compare against today's start.
 * @returns {boolean} Whether the date is in the future relative to today.
 */
function isStrictlyFutureDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() > today.getTime();
}

/**
 * Parses an ISO YYYY-MM-DD date string into a local Date without timezone shifting.
 * @param {string} value - Trimmed ISO date string in YYYY-MM-DD format.
 * @returns {Date|null} Parsed local date, or null when the components are invalid.
 */
function parseIsoDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Parses a DD.MM.YYYY date string into a local Date without timezone shifting.
 * @param {string} value - Trimmed date string in DD.MM.YYYY format.
 * @returns {Date|null} Parsed local date, or null when the components are invalid.
 */
function parseDotDate(value) {
    const [day, month, year] = value.split(".").map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Parses a DD/MM/YYYY date string into a local Date without timezone shifting.
 * @param {string} value - Trimmed date string in DD/MM/YYYY format.
 * @returns {Date|null} Parsed local date, or null when the components are invalid.
 */
function parseSlashDate(value) {
    const [day, month, year] = value.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Parses common European or US date string formats using dot, slash, or native parsing.
 * @param {string} value - Trimmed date string in a supported display format.
 * @returns {Date|null} Parsed local date, or null when no format matches.
 */
function parseFallbackDate(value) {
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return parseDotDate(value);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return parseSlashDate(value);
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Parses a task due date string into a local Date, supporting ISO and display formats.
 * @param {string} dueDate - Raw due date string stored on the task object.
 * @returns {Date|null} Parsed local date, or null when the value is empty or unparseable.
 */
function parseTaskDueDate(dueDate) {
    if (!dueDate || typeof dueDate !== "string") return null;
    const value = dueDate.trim();
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseIsoDate(value);
    return parseFallbackDate(value);
}

/**
 * Finds the earliest due date among all tasks regardless of whether it is in the future.
 * @param {Array<Object>} tasks - Task list whose dueDate fields will be compared.
 * @returns {Date|null} Earliest parsed due date, or null when no valid dates exist.
 */
function getEarliestDueDate(tasks) {
    let earliest = null;
    for (const task of tasks) {
        const date = parseTaskDueDate(task.dueDate);
        if (!date) continue;
        if (!earliest || date.getTime() < earliest.getTime()) earliest = date;
    }
    return earliest;
}

/**
 * Finds the earliest due date that is strictly after today among the given tasks.
 * @param {Array<Object>} tasks - Task list whose dueDate fields will be compared.
 * @returns {Date|null} Earliest future due date, or null when none qualify.
 */
function getEarliestFutureDueDate(tasks) {
    let earliest = null;
    for (const task of tasks) {
        const date = parseTaskDueDate(task.dueDate);
        if (!date || !isStrictlyFutureDate(date)) continue;
        if (!earliest || date.getTime() < earliest.getTime()) earliest = date;
    }
    return earliest;
}

/**
 * Formats a due date for display in the dashboard deadline card.
 * @param {Date|null} date - Due date to format, or null when no urgent date exists.
 * @returns {string} Human-readable date string such as "June 08, 2026", or a fallback label.
 */
function formatDashboardDueDate(date) {
    if (!date) return "No Urgent Date";
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric"
    }).format(date);
}

/**
 * Initializes the summary page by rendering the welcome section and loading dashboard KPIs.
 * @returns {Promise<void>}
 */
async function initSummaryPage() {
    await renderWelcome();
    showMobileWelcomeOverlay();
    await updateDashboard();
}

/**
 * Navigates to the board page when the user clicks a KPI or summary card.
 * @param {Event} event - Click event that may originate from a dashboard card element.
 * @returns {void}
 */
function handleSummaryCardClick(event) {
    const card = event.target.closest(".kpi-card, .deadline-card, .task-summary-card");
    if (card) navigateToBoard();
}

document.addEventListener("DOMContentLoaded", initSummaryPage);

document.addEventListener("click", handleSummaryCardClick);
