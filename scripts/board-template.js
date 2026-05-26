/**
 * Creates task card.
 * @param {Object} task - Task object.
 * @returns {string} Result.
 */
/**
 * Returns the inner HTML body of a task card.
 * @param {Object} task - Task object.
 * @returns {string} Result.
 */
function getTaskCardBody(task) {
    const catColor = task.category === "User Story" ? "#0038FF" : "#1FD7C1";
    return /*html*/ `
      <h2 class="task-category" style="background-color: ${catColor}">${task.category}</h2>
      <h3>${highlightText(task.title)}</h3>
      <span>${highlightText(task.description)}</span>
      <div class="subtask-card">${renderSubtaskProgress(task)}</div>
      <div class="task-footer">
        <div class="avatar-container" id="avatars-${task.id}"></div>
        <div>${getPriorityIcon(task.priority)}</div>
      </div>
    `;
}

/**
 * Creates a draggable task card HTML string for the given task.
 * @param {Object} task - Task object.
 * @returns {string} HTML string for the task card.
 */
function createTaskCard(task) {
    return /*html*/ `
      <div class="task-card" draggable="true" data-task-id="${task.id}"
        ondragstart="startDrag(${task.id})"
        onclick="openModal(${task.id})">
        ${getTaskCardBody(task)}
      </div>
    `;
}

/**
 * Creates the compact overview toggle card for a board column.
 * @param {string} columnId - Column element id.
 * @param {number} visibleLimit - Number of visible tasks before collapsing.
 * @param {boolean} expanded - Whether the column is expanded.
 * @returns {string} HTML string.
 */
function createTaskSummaryCard(columnId, visibleLimit, expanded) {
  const title = expanded ? 'Show less' : `${visibleLimit}+`;
  const subtitle = expanded ? 'Collapse column' : '';
  return /*html*/ `
    <button type="button"
      class="task-card task-card-summary"
      onclick="toggleBoardColumnExpansion('${columnId}')"
      aria-expanded="${expanded}">
      <span class="task-card-summary-title">${title}</span>
      ${subtitle ? `<span class="task-card-summary-subtitle">${subtitle}</span>` : ''}
    </button>
  `;
}
/**
 * Returns priority icon.
 * @param {*} priority - Parameter.
 * @returns {string} Result.
 */
function getPriorityIcon(priority) {
  if (priority === "urgent") return '<img src="./assets/img/category-urgent.svg">';
  if (priority === "medium") return '<img src="./assets/icons/medium-orange.svg">';
  return '<img src="./assets/img/category-low.svg">';
}
/**
 * Renders subtask progress.
 * @param {Object} task - Task object.
 * @returns {string} Result.
 */
function renderSubtaskProgress(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return "";
  }
  const done = task.subtasks.filter(st => st.done).length;
  const total = task.subtasks.length;
  const percent = Math.round((done / total) * 100);
  return /*html*/ `
    <div class="subtask-progress-bar">
      <div class="subtask-progress-fill" style="width:${percent}%"></div>
    </div>
    <div>${done}/${total}</div>
  `;
}
/**
 * Returns avatar markup.
 * @param {*} initials - Parameter.
 * @param {*} color - Parameter.
 * @returns {string} Result.
 */
function getAvatarMarkup(initials, color, isMore = false) {
  const extraClass = isMore ? ' avatar-more' : '';
  return /*html*/ `
    <div class="avatar${extraClass}" style="background-color: ${color};">
      ${initials}
    </div>
  `;
}
