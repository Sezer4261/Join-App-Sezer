/** @file HTML templates for add-task subtask list items. */

/**
 * Generates HTML for a subtask list item at the given index.
 * @param {number} index - Zero-based index of the subtask in the list.
 * @returns {string} HTML markup for either the edit or display view of the subtask.
 */
function generateSubtasks(index) {
  return isEditingSubtask(index) ? getSubtaskEditItem(index) : getSubtaskItem(index);
}

/**
 * Checks whether the subtask at the given index is in edit mode.
 * @param {number} index - Zero-based index of the subtask in the list.
 * @returns {boolean} True when the subtask is currently being edited, otherwise false.
 */
function isEditingSubtask(index) {
  return window.editingSubtaskIndex === index;
}

/**
 * Returns the input-actions row for a subtask in edit mode.
 * @param {number} index - Zero-based index of the subtask in the list.
 * @returns {string} HTML markup for the delete and save action buttons.
 */
function getSubtaskEditActionsHTML(index) {
  return /*html*/ `<div class="subtask-input-actions">
    <button type="button" class="subtask-icon-btn" onclick="deleteSubtask(${index})" aria-label="Delete subtask"><img src="./assets/icons/delete.svg" alt=""></button>
    <div class="subtask-input-separator"></div>
    <button type="button" class="subtask-icon-btn" onclick="saveEditedSubtask(${index})" aria-label="Save subtask"><img src="./assets/icons/checkmark.svg" alt=""></button>
  </div>`;
}

/**
 * Returns HTML for a subtask list item in edit mode.
 * @param {number} index - Zero-based index of the subtask in the list.
 * @returns {string} HTML markup for the editable subtask row with its action buttons.
 */
function getSubtaskEditItem(index) {
  return /*html*/ `
    <li class="subtask subtask-edit">
      <input type="text" id="subtask-edit-${index}" class="subtask-edit-input"
        value="${subtasks[index].title}" pattern=".*\\S.*" placeholder="Edit subtask">
      ${getSubtaskEditActionsHTML(index)}
    </li>
  `;
}

/**
 * Returns HTML for a subtask list item in display mode.
 * @param {number} index - Zero-based index of the subtask in the list.
 * @returns {string} HTML markup for the read-only subtask row with edit and delete controls.
 */
function getSubtaskItem(index) {
  return /*html*/ `
    <li class="subtask">
      <span>${subtasks[index].title}</span>
      <div class="subtask-actions">
        <img src="./assets/icons/edit.svg" alt="Edit" onclick="editSubtask(${index})">
        <div class="action-separator"></div>
        <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtask(${index})">
      </div>
    </li>
  `;
}
