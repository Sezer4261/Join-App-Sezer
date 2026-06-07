/** @file HTML templates for board task cards. */

/**
 * Returns category color and class for a task card.
 * @param {Object} task - Task object.
 * @returns {{color: string, className: string}} Category style.
 */
function getTaskCategoryStyle(task) {
  const isUserStory = task.category === "User Story";
  return {
    color: isUserStory ? "#0038FF" : "#1FD7C1",
    className: isUserStory ? "task-category--user-story" : "task-category--technical-task",
  };
}

/**
 * Returns the inner body markup for a task card.
 * @param {Object} task - Task object.
 * @returns {string} Result.
 */
function getTaskCardBody(task) {
  const { color: catColor, className: catClass } = getTaskCategoryStyle(task);
  return /*html*/ `
      <h2 class="task-category ${catClass}" style="background-color: ${catColor}">${task.category}</h2>
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
 * Returns a draggable task card for the board.
 * @param {Object} task - Task object.
 * @returns {string} Result.
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
 * Returns a summary card for collapsed board columns.
 * @param {string} columnId - Column id.
 * @param {number} hiddenCount - Number of hidden tasks.
 * @param {boolean} expanded - Whether the column is expanded.
 * @returns {string} Result.
 */
function createTaskSummaryCard(columnId, hiddenCount, expanded) {
  const title = expanded ? "Show less" : formatHiddenBoardTasksLabel(hiddenCount);
  const subtitle = expanded ? "Collapse column" : "Click to show all";
  return /*html*/ `
    <button type="button"
      class="task-card task-card-summary"
      onclick="toggleBoardColumnExpansion('${columnId}')"
      aria-expanded="${expanded}">
      <span class="task-card-summary-title">${title}</span>
      <span class="task-card-summary-subtitle">${subtitle}</span>
    </button>
  `;
}

/**
 * Returns the priority icon markup for a task.
 * @param {string} priority - Task priority.
 * @returns {string} Result.
 */
function getPriorityIcon(priority) {
  if (priority === "urgent") return '<img src="./assets/img/category-urgent.svg">';
  if (priority === "medium") return '<img src="./assets/icons/medium-orange.svg">';
  return '<img src="./assets/img/category-low.svg">';
}

/**
 * Returns subtask progress bar markup for a task card.
 * @param {Object} task - Task object.
 * @returns {string} Result.
 */
function renderSubtaskProgress(task) {
  if (!task.subtasks || task.subtasks.length === 0) return "";
  const done = task.subtasks.filter((st) => st.done).length;
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
 * Returns avatar circle markup for task cards.
 * @param {string} initials - Avatar initials.
 * @param {string} color - Background color.
 * @param {boolean} [isMore=false] - Whether this is a +N overflow avatar.
 * @returns {string} Result.
 */
function getAvatarMarkup(initials, color, isMore = false) {
  const extraClass = isMore ? " avatar-more" : "";
  return /*html*/ `
    <div class="avatar${extraClass}" style="background-color: ${color};">
      ${initials}
    </div>
  `;
}
