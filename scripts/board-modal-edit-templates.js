// ── Edit-task modal templates ─────────────────────────────────────────────────
// All HTML generation for the inline edit form inside the task modal.
// Depends on: URGENT_ICON, MEDIUM_ICON, LOW_ICON (add-task-templates.js)

/**
 * Returns title, description, and due-date labels for the edit form.
 * @param {Object} task - Task object.
 * @returns {string} HTML string.
 */
function getEditFormTopHTML(task) {
  return /*html*/ `
    <label class="edit-label"><span>Title<span class="req">*</span></span>
      <input class="edit-input" type="text" id="edit-title" value="${task.title}">
      <div class="error-message" id="edit-title-error"></div></label>
    <label class="edit-label"><span>Description</span>
      <textarea class="edit-textarea" id="edit-description">${task.description}</textarea></label>
    <label class="edit-label"><span>Due date<span class="req">*</span></span>
      <input class="edit-input" type="date" id="edit-date" value="${task.dueDate}">
      <div class="error-message" id="edit-date-error"></div></label>
  `;
}

/**
 * Returns priority radio-button group for the edit form.
 * @param {Object} task - Task object.
 * @returns {string} HTML string.
 */
function getEditFormPriorityHTML(task) {
  return /*html*/ `
    <div class="priority"><span>Priority</span>
      <div class="priority-options">
        <input type="radio" id="edit-urgent" name="edit-priority" value="urgent" ${task.priority === "urgent" ? "checked" : ""}><label for="edit-urgent" class="urgent priority-btn">Urgent ${URGENT_ICON}</label>
        <input type="radio" id="edit-medium" name="edit-priority" value="medium" ${task.priority === "medium" ? "checked" : ""}><label for="edit-medium" class="medium priority-btn">Medium ${MEDIUM_ICON}</label>
        <input type="radio" id="edit-low" name="edit-priority" value="low" ${task.priority === "low" ? "checked" : ""}><label for="edit-low" class="low priority-btn">Low ${LOW_ICON}</label>
      </div>
    </div>
  `;
}

/**
 * Returns the assigned-contacts section for the edit form.
 * @returns {string} HTML string.
 */
function getEditFormAssignedHTML() {
  return /*html*/ `
    <div class="edit-assigned"><span>Assigned to</span>
      <div id="select-contacts" tabindex="0" class="custom-select" onclick="toggleDropdown(event)">
        <span>Select contacts
          <img src="./assets/icons/arrow-drop-down.svg" alt="" class="dropdown-arrow"></span>
        <div id="dropdown-contacts" class="dropdown-content" onclick="event.stopPropagation()"></div>
      </div>
      <div id="selected-avatars" class="edit-avatar-container"></div>
    </div>
  `;
}

/**
 * Returns the category dropdown section for the edit form.
 * @param {Object} task - Task object.
 * @returns {string} HTML string.
 */
function getEditFormCategoryHTML(task) {
  return /*html*/ `
    <div class="edit-label"><span>Category<span class="req">*</span></span>
      <div id="edit-category-select" tabindex="0" class="custom-select" onclick="toggleEditCategoryDropdown(event)">
        <span>${task.category ? task.category + " " : "Select task category "}
          <img src="./assets/icons/arrow-drop-down.svg" alt="" class="dropdown-arrow"></span>
        <div id="edit-category-dropdown" class="dropdown-content" onclick="event.stopPropagation()">${generateEditCategoryOptions(task.category)}</div>
      </div>
      <input type="hidden" id="edit-category" value="${task.category || ''}">
      <div class="error-message" id="edit-category-error"></div>
    </div>
  `;
}

/**
 * Returns the subtasks section for the edit form.
 * @returns {string} HTML string.
 */
function getEditFormSubtasksHTML() {
  return /*html*/ `
    <div class="edit-subtasks"><span>Subtasks</span>
      <div class="subtasks"><input type="text" id="edit-subtask-input" placeholder="Add new subtask">
        <div class="subtask-input-actions">
          <button type="button" class="subtask-icon-btn" onclick="clearEditSubtaskInput()" aria-label="Clear subtask"><img src="./assets/icons/iconoir-cancel.svg" alt=""></button>
          <div class="subtask-input-separator"></div>
          <button type="button" class="subtask-icon-btn" onclick="addEditSubtask()" aria-label="Add subtask"><img src="./assets/icons/checkmark.svg" alt=""></button>
        </div></div>
      <div class="error-message" id="edit-subtask-error"></div>
      <ul id="edit-subtask-area" class="subtask-list"></ul>
    </div>
  `;
}

/**
 * Returns the submit/close action bar for the edit form.
 * @returns {string} HTML string.
 */
function getEditFormActionsHTML() {
  return /*html*/ `
    <div class="edit-actions">
      <div class="edit-x-close" onclick="closeModal()">
        <button type="button" class="edit-cancel">x</button>
      </div>
      <button type="submit" class="edit-save">Ok <img src="assets/icons/vector-5.svg"></button>
    </div>
  `;
}

/**
 * Assembles the complete edit-task form template.
 * @param {Object} task - Task object.
 * @returns {string} HTML string.
 */
function generateEditTaskTemplate(task) {
  return /*html*/ `
    <form class="edit-task-form" id="edit-task-form" novalidate onsubmit="saveEditedTask(event, ${task.id})">
      <div class="edit-form-scroll">
        ${getEditFormTopHTML(task)}
        ${getEditFormPriorityHTML(task)}
        ${getEditFormAssignedHTML()}
        ${getEditFormCategoryHTML(task)}
        ${getEditFormSubtasksHTML()}
        ${getEditFormActionsHTML()}
      </div>
    </form>
  `;
}

/**
 * Generates the category dropdown options for the edit form.
 * @param {string} current - Currently selected category value.
 * @returns {string} HTML string.
 */
function generateEditCategoryOptions(current) {
  const categories = ["Technical Task", "User Story"];
  return categories.map((cat) => /*html*/ `
    <div class="dropdown-item" onclick="setEditCategory('${cat}')">
      <span class="dropdown-name">${cat}</span>
    </div>
  `).join("");
}

/**
 * Returns the list-item markup for a saved edit subtask.
 * @param {Object} subtask - Subtask object.
 * @param {number} index - Subtask index.
 * @returns {string} HTML string.
 */
function getEditSubtaskItemMarkup(subtask, index) {
  return /*html*/ `
    <li class="subtask">
      <span>${subtask.title}</span>
      <div class="subtask-actions">
        <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteEditSubtask(${index})">
        <div class="action-separator"></div>
        <img src="./assets/icons/edit.svg" alt="Edit" onclick="editEditSubtask(${index})">
      </div>
    </li>
  `;
}

/**
 * Returns the inline action buttons for an edit-subtask in edit mode.
 * @param {number} index - Subtask index.
 * @returns {string} HTML string.
 */
function getEditSubtaskEditActionsHTML(index) {
  return /*html*/ `<div class="subtask-input-actions">
    <button type="button" class="subtask-icon-btn" onclick="deleteEditSubtask(${index})" aria-label="Delete subtask"><img src="./assets/icons/delete.svg" alt=""></button>
    <div class="subtask-input-separator"></div>
    <button type="button" class="subtask-icon-btn" onclick="saveEditedEditSubtask(${index})" aria-label="Save subtask"><img src="./assets/icons/checkmark.svg" alt=""></button>
  </div>`;
}

/**
 * Returns the list-item markup for an edit-subtask in inline-edit mode.
 * @param {Object} subtask - Subtask object.
 * @param {number} index - Subtask index.
 * @returns {string} HTML string.
 */
function getEditSubtaskEditMarkup(subtask, index) {
  return /*html*/ `
    <li class="subtask subtask-edit">
      <input type="text" id="edit-subtask-edit-${index}"
        class="subtask-edit-input" value="${subtask.title}" placeholder="Edit subtask">
      ${getEditSubtaskEditActionsHTML(index)}
    </li>
  `;
}
