const BASE_URL =
    "https://join-app-firebase-default-rtdb.europe-west1.firebasedatabase.app";

function navigateToHelp() {
    window.location.href = "help.html";
}

function navigateToBoard() {
    window.location.href = "board.html";
}

// kleines Hilfs-Utility, damit wir nicht dauernd getElementById + innerText schreiben
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// ---- NEW: Welcome + Username ----
function getGreetingByTime(withComma) {
    const hour = new Date().getHours();
    const suffix = withComma ? "," : "!";

    if (hour < 12) return `Good morning${suffix}`;
    if (hour < 18) return `Good afternoon${suffix}`;
    return `Good evening${suffix}`;
}

function getStoredSession() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

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

async function renderWelcome() {
    const session = getStoredSession();
    const isGuest = !session || session.mode === "guest";

    // Guest: "Good ...!" + Username leer
    if (isGuest) {
        setText("welcome-msg", getGreetingByTime(false));
        setText("username-field", "");
        return;
    }

    // User: "Good ...," + Username aus DB
    setText("welcome-msg", getGreetingByTime(true));

    const nameFromDb = await fetchUserNameByEmail(session.email);
    const name = nameFromDb || session.displayName || "User";
    setText("username-field", name);
}
// ---- /NEW ----

// Tasks aus Firebase holen
async function fetchTasks() {
    const response = await fetch(`${BASE_URL}/tasks.json`);
    if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
    }

    const data = await response.json();
    return Object.values(data || {});
}

// Dashboard-Werte aktualisieren
async function updateDashboard() {
    try {
        const tasks = await fetchTasks();

        const todoCount = tasks.filter(t => t.status === "To Do").length;
        const doneCount = tasks.filter(t => t.status === "Done").length;
        const inProgressCount = tasks.filter(t => t.status === "In Progress").length;
        const awaitingFeedbackCount = tasks.filter(t => t.status === "Await Feedback").length;
        const urgentCount = tasks.filter(t => t.priority === "urgent").length;
        const totalTasks = tasks.length;

        setText("total-to-do", todoCount);
        setText("total-done", doneCount);
        setText("total-tasks-progress", inProgressCount);
        setText("total-awaiting-feedback", awaitingFeedbackCount);
        setText("total-urgent", urgentCount);
        setText("total-tasks-board", totalTasks);
    } catch (error) {
        console.error("Fehler beim Abrufen der Dashboard-Daten:", error);
    }
}

// Beim Laden der Seite aufrufen
document.addEventListener("DOMContentLoaded", async () => {
    await renderWelcome();
    await updateDashboard();
});

// Delegate clicks, funktioniert auch bei dynamisch gerenderten Karten
document.addEventListener("click", (e) => {
    const card = e.target.closest(".kpi-card, .deadline-card, .task-summary-card");
    if (card) navigateToBoard();
});

