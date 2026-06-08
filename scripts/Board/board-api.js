/** @file Firebase task loading and persistence for board. */

/**
 * Fetches all tasks from Firebase, loads contacts, and renders the board.
 * @returns {Promise<void>} Resolves when loading and initial render complete.
 */
async function loadTasks() {
  try {
    const response = await fetch(`${BASE_URL}/tasks.json`);
    const data = await response.json();
    tasks = data ? Object.entries(data).map(([id, task]) => ({ firebaseId: id, ...task })) : [];
  } catch (error) {
    console.error("Fehler beim Laden der Tasks:", error);
  }

  await loadContacts();
  
  renderBoard();
}

/**
 * Writes the full task payload to Firebase under its stored document id.
 * @param {Object} task - Task to persist, including firebaseId and field values.
 * @returns {Promise<void>} Resolves when the PUT request finishes.
 */
async function updateTask(task) {
  try {
    const { firebaseId, ...taskData } = task;
    await fetch(`${BASE_URL}/tasks/${firebaseId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
  } catch (error) {
    console.error("Fehler beim Updaten des Tasks:", error);
  }
}

/**
 * Removes the active task from Firebase and refreshes the board UI.
 * @returns {Promise<void>} Resolves after delete, modal close, and re-render.
 */
async function deleteTask() {
  if (!activeTask) return;
  try {
    await fetch(`${BASE_URL}/tasks/${activeTask.firebaseId}.json`, { method: "DELETE" });
    tasks = tasks.filter(t => t.firebaseId !== activeTask.firebaseId);
    closeModal();
    renderBoard();
  } catch (error) {
    console.error("Fehler beim Löschen des Tasks:", error);
  }
}
