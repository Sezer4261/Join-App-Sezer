/**
 * Creates task card.
 * @param {Object} task - Task object.
 * @returns {string} Result.
 */
function createTaskCard(task) {
  return /*html*/ `
    <div class="task-card"
      draggable="true"
      ondragstart="startDrag(${task.id})"
      onclick="openModal(${task.id})">
      <h2 class="task-category" style="background-color: ${task.category === "User Story" ? "#0038FF" : "#1FD7C1"}">${task.category}</h2>
      <h3>${highlightText(task.title)}</h3>
      <span>${highlightText(task.description)}</span>
      <div class="subtask-card">
        ${renderSubtaskProgress(task)}
      </div>
      <div class="task-footer">
        <div class="avatar-container" id="avatars-${task.id}"></div>
        <div>${getPriorityIcon(task.priority)}</div>
      </div>
    </div>
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
    return `<div>0/0</div>`;
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
