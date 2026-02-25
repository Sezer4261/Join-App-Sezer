/**
 * Returns board template.
 * @returns {string} Result.
 */
function getBoardTemplate() {
  return /*html*/ `
    <div class="board-header">
      <h1>Board</h1>
      <img src="./assets/icons/plus add task mobile.svg" alt="Add Task Button" class="add-task-mobile-btn" onclick="showAddTaskDialog()">
      <div class="board-actions">
        <div class="board-search">
          <input id="search-task" type="text" placeholder="Find Task">
          <button id="search-clear" class="search-clear" type="button" aria-label="Clear search">×</button>
          <div class="search-divider"></div>
          <span class="search-highlight">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
            </svg>
          </span>
        </div>
        <button class="add-task-btn" onclick="showAddTaskDialog()">Add Task +</button>
      </div>
    </div>
    <div class="board-columns">
      ${getBoardColumnsMarkup()}
    </div>
  `;
}
/**
 * Returns board columns markup.
 * @returns {string} Result.
 */
function getBoardColumnsMarkup() {
  return getBoardColumnConfigs().map(getBoardColumn).join("");
}
/**
 * Returns board column configs.
 * @returns {string} Result.
 */
function getBoardColumnConfigs() {
  return [
    { id: "todo-column", title: "To Do", status: "To Do", showAdd: true },
    { id: "inprogress-column", title: "In Progress", status: "In Progress", showAdd: true },
    { id: "awaiting-column", title: "Await Feedback", status: "Await Feedback", showAdd: true },
    { id: "done-column", title: "Done", status: "Done", showAdd: false },
  ];
}
/**
 * Returns board column.
 * @param {*} config - Parameter.
 * @returns {string} Result.
 */
function getBoardColumn(config) {
  return /*html*/ `
    <div class="board-column"
      id="${config.id}"
      ondragover="allowDrop(event)"
      ondrop="dropTask(event, '${config.status}')">
      <div class="column-header">
        <h2 class="column-title">${config.title}</h2>
        ${config.showAdd ? `<img src="./assets/icons/plus button.svg" alt="Add Task Button" width="30" height="30" onclick="showAddTaskDialog()">` : ""}
      </div>
      <div class="no-tasks">
        <span>No tasks To do</span>
      </div>
    </div>
  `;
}
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
      <span>${highlightText(task.description.substring(0, 50))}...</span>
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
  if (priority === "urgent") return '<img src="./assets/img/Category_Urgent.svg">';
  if (priority === "medium") return '<img src="./assets/icons/medium_orange.svg">';
  return '<img src="./assets/img/Category_Low.svg">';
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
function getAvatarMarkup(initials, color) {
  return /*html*/ `
    <div class="avatar" style="background-color: ${color};">
      ${initials}
    </div>
  `;
}
