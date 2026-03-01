/**
 * Executes navigate to help logic.
 * @returns {void} Result.
 */
function navigateToHelp() {
    window.location.href = "help.html";
}

/**
 * Executes navigate to board logic.
 * @returns {void} Result.
 */
function navigateToBoard() {
    window.location.href = "board.html";
}

// kleines Hilfs-Utility, damit wir nicht dauernd getElementById + innerText schreiben
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

// ---- NEW: Welcome + Username ----
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

// ---- /NEW ----

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

    // If we switch back to desktop width, the welcome box must remain visible.
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

    // Ensure the welcome content is available even though it's hidden by default on mobile.
    welcomeBox.style.display = "flex";

    // Start hidden, then fade in.
    aside.classList.remove("is-visible");
    requestAnimationFrame(() => aside.classList.add("is-visible"));

    const hide = () => {
        aside.classList.remove("is-visible");
    };

    const cleanup = () => {
        // Only cleanup after fade-out.
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
    // Fallback in case transitionend doesn't fire.
    setTimeout(cleanup, 2300);
}

// Tasks aus Firebase holen
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

// Dashboard-Werte aktualisieren
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
}

/**
 * Returns dashboard stats.
 * @param {*} tasks - Parameter.
 * @returns {*} Result.
 */
function getDashboardStats(tasks) {
    return {
        todoCount: tasks.filter(t => t.status === "To Do").length,
        doneCount: tasks.filter(t => t.status === "Done").length,
        inProgressCount: tasks.filter(t => t.status === "In Progress").length,
        awaitingFeedbackCount: tasks.filter(t => t.status === "Await Feedback").length,
        urgentCount: tasks.filter(t => t.priority === "urgent").length,
        totalTasks: tasks.length
    };
}

// Beim Laden der Seite aufrufen
document.addEventListener("DOMContentLoaded", async () => {
    await renderWelcome();
    showMobileWelcomeOverlay();
    await updateDashboard();
});

// Delegate clicks, funktioniert auch bei dynamisch gerenderten Karten
document.addEventListener("click", (e) => {
    const card = e.target.closest(".kpi-card, .deadline-card, .task-summary-card");
    if (card) navigateToBoard();
});
