/** @file HTML templates for edit task modal. */

/**
 * Builds the title, description, and due-date fields for the edit task form.
 * @param {Object} task - Task whose current values prefill the top form fields.
 * @returns {string} HTML fragment for the upper edit form section.
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
 * Builds the priority radio-button group for the edit task form.
 * @param {Object} task - Task whose current priority selects the checked radio option.
 * @returns {string} HTML fragment for the priority selector section.
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
 * Builds the assigned-contacts picker section for the edit task form.
 * @returns {string} HTML fragment for the contacts dropdown and avatar container.
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
 * Builds the category dropdown section for the edit task form.
 * @param {Object} task - Task whose current category preselects the hidden input value.
 * @returns {string} HTML fragment for the category selector and error container.
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
 * Builds the subtask input and list container for the edit task form.
 * @returns {string} HTML fragment for the subtask editor section.
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
 * Builds the cancel and save action bar for the edit task form.
 * @returns {string} HTML fragment for the edit form footer actions.
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
 * Assembles the complete edit-task form template with all field sections.
 * @param {Object} task - Task whose id and values populate the edit form.
 * @returns {string} Full HTML markup for the edit task modal form.
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
 * Builds dropdown option rows for the edit form category selector.
 * @param {string} current - Currently selected category used to render available choices.
 * @returns {string} HTML fragment containing all category dropdown items.
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
 * Returns list-item markup for a saved subtask in view mode.
 * @param {Object} subtask - Subtask object whose title is displayed in the row.
 * @param {number} index - Zero-based index passed to edit and delete handlers.
 * @returns {string} HTML fragment for one subtask list item.
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
 * Returns inline save and delete buttons for a subtask in edit mode.
 * @param {number} index - Zero-based index passed to save and delete handlers.
 * @returns {string} HTML fragment for subtask inline action buttons.
 */
function getEditSubtaskEditActionsHTML(index) {
  return /*html*/ `<div class="subtask-input-actions">
    <button type="button" class="subtask-icon-btn" onclick="deleteEditSubtask(${index})" aria-label="Delete subtask"><img src="./assets/icons/delete.svg" alt=""></button>
    <div class="subtask-input-separator"></div>
    <button type="button" class="subtask-icon-btn" onclick="saveEditedEditSubtask(${index})" aria-label="Save subtask"><img src="./assets/icons/checkmark.svg" alt=""></button>
  </div>`;
}

/**
 * Returns list-item markup for a subtask being edited inline.
 * @param {Object} subtask - Subtask object whose title prefills the edit input.
 * @param {number} index - Zero-based index used for input and action element ids.
 * @returns {string} HTML fragment for one inline-edit subtask row.
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
