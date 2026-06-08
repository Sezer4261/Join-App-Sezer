/** @file Summary page dashboard KPIs and task statistics. */

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
