/** @file HTML templates for board task cards. */

/**
 * Resolves the category badge color and CSS class for a task card.
 * @param {Object} task - Task whose category distinguishes user stories from technical tasks.
 * @returns {{color: string, className: string}} Inline color and class name for the category badge.
 */
function getTaskCategoryStyle(task) {
  const isUserStory = task.category === "User Story";
  return {
    color: isUserStory ? "#0038FF" : "#1FD7C1",
    className: isUserStory ? "task-category--user-story" : "task-category--technical-task",
  };
}

/**
 * Builds the inner markup for a task card including title, description, and footer.
 * @param {Object} task - Task whose fields populate the card body.
 * @returns {string} HTML fragment for the card interior.
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
 * Returns a draggable task card element wired to board drag and modal handlers.
 * @param {Object} task - Task to render as a board card.
 * @returns {string} HTML markup for one task card.
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
 * Returns the expand/collapse summary button shown when a column hides extra tasks.
 * @param {string} columnId - DOM id of the board column owning the summary card.
 * @param {number} hiddenCount - Number of tasks hidden behind the summary.
 * @param {boolean} expanded - Whether the column currently shows all tasks.
 * @returns {string} HTML markup for the column summary button.
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
 * Returns the priority icon image markup matching the task priority level.
 * @param {string} priority - Priority label such as urgent, medium, or low.
 * @returns {string} HTML img element for the matching priority icon.
 */
function getPriorityIcon(priority) {
  if (priority === "urgent") return '<img src="./assets/img/category-urgent.svg">';
  if (priority === "medium") return '<img src="./assets/icons/medium-orange.svg">';
  return '<img src="./assets/img/category-low.svg">';
}

/**
 * Returns a progress bar and completion count when the task has subtasks.
 * @param {Object} task - Task whose subtask completion state drives the bar width.
 * @returns {string} Subtask progress markup, or an empty string when none exist.
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
 * Returns a circular avatar element with initials and optional overflow styling.
 * @param {string} initials - Short text shown inside the avatar circle.
 * @param {string} color - Background color applied to the avatar.
 * @param {boolean} [isMore=false] - Whether this avatar represents hidden additional contacts.
 * @returns {string} HTML markup for one avatar circle.
 */
function getAvatarMarkup(initials, color, isMore = false) {
  const extraClass = isMore ? " avatar-more" : "";
  return /*html*/ `
    <div class="avatar${extraClass}" style="background-color: ${color};">
      ${initials}
    </div>
  `;
}
