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
document.addEventListener("DOMContentLoaded", updateDashboard);

// Delegate clicks, funktioniert auch bei dynamisch gerenderten Karten
document.addEventListener("click", (e) => {
    const card = e.target.closest(".kpi-card, .deadline-card, .task-summary-card");
    if (card) navigateToBoard();
});

