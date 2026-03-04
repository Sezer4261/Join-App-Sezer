/**
 * Executes navigate to board logic.
 * @returns {void} Result.
 */
function navigateToBoard() {
    window.location.href = "board.html";
}

/**
 * Sets text.
 * @param {string} id - Identifier.
 * @param {string} value - Value.
 * @returns {void} Result.
 */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/**
 * Returns greeting by time.
 * @param {*} withComma - Parameter.
 * @returns {*} Result.
 */
function getGreetingByTime(withComma) {
    const hour = new Date().getHours();
    const suffix = withComma ? "," : "!";

    if (hour < 12) return `Good morning${suffix}`;
    if (hour < 18) return `Good afternoon${suffix}`;
    return `Good evening${suffix}`;
}

/**
 * Returns stored session.
 * @returns {*} Result.
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
 * Fetches user name by email.
 * @param {string} email - Email address.
 * @returns {Promise<*>} Result.
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
 * Renders welcome.
 * @returns {Promise<*>} Result.
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
 * Checks whether guest session.
 * @param {*} session - Parameter.
 * @returns {boolean} Result.
 */
function isGuestSession(session) {
    return !session || session.mode === "guest";
}

/**
 * Renders guest welcome.
 * @returns {void} Result.
 */
function renderGuestWelcome() {
    setText("welcome-msg", getGreetingByTime(false));
    setText("username-field", "");
}

/**
 * Executes resolve user name logic.
 * @param {*} session - Parameter.
 * @returns {Promise<*>} Result.
 */
async function resolveUserName(session) {
    const nameFromDb = await fetchUserNameByEmail(session.email);
    return nameFromDb || session.displayName || "User";
}

/**
 * Shows the mobile welcome overlay (<900px) for 1.5s,
 * then fades it out and removes it from the layout.
 * @returns {void} Result.
 */
function showMobileWelcomeOverlay() {
    const mq = window.matchMedia("(max-width: 900px)");

    const welcomeBox = document.getElementById("welcome-msg-box");
    if (!welcomeBox) return;

    const aside = welcomeBox.closest("aside");
    if (!aside) return;

    const resetToDefault = () => {
        aside.classList.remove("is-visible");
        aside.classList.remove("mobile-welcome-overlay");
        aside.style.display = "";
        welcomeBox.style.display = "";
    };

    if (!window.mobileWelcomeOverlayMqListenerAdded) {
        window.mobileWelcomeOverlayMqListenerAdded = true;
        mq.addEventListener("change", (event) => {
            if (!event.matches) resetToDefault();
        });
    }

    if (!mq.matches) {
        resetToDefault();
        return;
    }

    aside.classList.add("mobile-welcome-overlay");
    aside.style.display = "flex";

    welcomeBox.style.display = "flex";

    aside.classList.remove("is-visible");
    requestAnimationFrame(() => aside.classList.add("is-visible"));

    const hide = () => {
        aside.classList.remove("is-visible");
    };

    const cleanup = () => {
        if (aside.classList.contains("is-visible")) return;
        aside.style.display = "none";
        welcomeBox.style.display = "";
        aside.classList.remove("mobile-welcome-overlay");
        aside.removeEventListener("transitionend", onTransitionEnd);
    };

    const onTransitionEnd = (event) => {
        if (event.propertyName !== "opacity") return;
        cleanup();
    };

    aside.addEventListener("transitionend", onTransitionEnd);

    setTimeout(hide, 1500);
    setTimeout(cleanup, 2300);
}

/**
 * Fetches tasks.
 * @returns {Promise<*>} Result.
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
 * Updates dashboard.
 * @returns {Promise<*>} Result.
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
 * Executes apply dashboard stats logic.
 * @param {*} tasks - Parameter.
 * @returns {void} Result.
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
 * Returns dashboard stats.
 * @param {*} tasks - Parameter.
 * @returns {*} Result.
 */
function getDashboardStats(tasks) {
    const urgentTasks = tasks.filter(t => t.priority === "urgent" && t.status !== "Done");
    const earliestUrgentDueDate = getEarliestDueDate(urgentTasks);

    return {
        todoCount: tasks.filter(t => t.status === "To Do").length,
        doneCount: tasks.filter(t => t.status === "Done").length,
        inProgressCount: tasks.filter(t => t.status === "In Progress").length,
        awaitingFeedbackCount: tasks.filter(t => t.status === "Await Feedback").length,
        urgentCount: urgentTasks.length,
        earliestUrgentDueDate,
        totalTasks: tasks.length
    };
}

/**
 * Parses a task due date string into a Date without timezone shifting.
 * Supports the app's ISO format (YYYY-MM-DD) and a few common fallbacks.
 * @param {string} dueDate - Due date string.
 * @returns {Date|null} Result.
 */
function parseTaskDueDate(dueDate) {
    if (!dueDate || typeof dueDate !== "string") return null;
    const value = dueDate.trim();
    if (!value) return null;

    const isoMatch = /^\d{4}-\d{2}-\d{2}$/.exec(value);
    if (isoMatch) {
        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const deDotMatch = /^\d{2}\.\d{2}\.\d{4}$/.exec(value);
    if (deDotMatch) {
        const [day, month, year] = value.split(".").map(Number);
        const date = new Date(year, month - 1, day);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const slashMatch = /^\d{2}\/\d{2}\/\d{4}$/.exec(value);
    if (slashMatch) {
        const [day, month, year] = value.split("/").map(Number);
        const date = new Date(year, month - 1, day);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Returns the earliest due date among a list of tasks.
 * @param {Array<Object>} tasks - Task list.
 * @returns {Date|null} Result.
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
 * Formats the dashboard due date string.
 * @param {Date|null} date - Date.
 * @returns {string} Result.
 */
function formatDashboardDueDate(date) {
    if (!date) return "—";
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric"
    }).format(date);
}

document.addEventListener("DOMContentLoaded", async () => {
    await renderWelcome();
    showMobileWelcomeOverlay();
    await updateDashboard();
});

document.addEventListener("click", (e) => {
    const card = e.target.closest(".kpi-card, .deadline-card, .task-summary-card");
    if (card) navigateToBoard();
});
