/**
 * Legacy entry point for board add-task actions — navigates to the add-task page.
 * @param {string} [status="To Do"] - Board column status.
 * @returns {void} Result.
 */
function showAddTaskDialog(status = "To Do") {
  sidebarHighlightingAddTask(status);
}
