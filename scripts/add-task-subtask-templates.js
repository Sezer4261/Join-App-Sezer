/**
 * HTML templates for add-task subtask list items.
 */

/**
 * Generates subtasks.
 * @param {number} i - Index.
 * @returns {string} Result.
 */
function generateSubtasks(i) {
  return isEditingSubtask(i) ? getSubtaskEditItem(i) : getSubtaskItem(i);
}

/**
 * Checks whether editing subtask.
 * @param {number} i - Index.
 * @returns {boolean} Result.
 */
function isEditingSubtask(i) {
  return window.editingSubtaskIndex === i;
}

/**
 * Returns the input-actions row for a subtask in edit mode.
 * @param {number} i - Subtask index.
 * @returns {string} Result.
 */
function getSubtaskEditActionsHTML(i) {
  return /*html*/ `<div class="subtask-input-actions">
    <button type="button" class="subtask-icon-btn" onclick="deleteSubtask(${i})" aria-label="Delete subtask"><img src="./assets/icons/delete.svg" alt=""></button>
    <div class="subtask-input-separator"></div>
    <button type="button" class="subtask-icon-btn" onclick="saveEditedSubtask(${i})" aria-label="Save subtask"><img src="./assets/icons/checkmark.svg" alt=""></button>
  </div>`;
}

/**
 * Returns subtask edit item.
 * @param {number} i - Index.
 * @returns {string} Result.
 */
function getSubtaskEditItem(i) {
  return /*html*/ `
    <li class="subtask subtask-edit">
      <input type="text" id="subtask-edit-${i}" class="subtask-edit-input"
        value="${subtasks[i].title}" pattern=".*\\S.*" placeholder="Edit subtask">
      ${getSubtaskEditActionsHTML(i)}
    </li>
  `;
}

/**
 * Returns subtask item.
 * @param {number} i - Index.
 * @returns {string} Result.
 */
function getSubtaskItem(i) {
  return /*html*/ `
    <li class="subtask">
      <span>${subtasks[i].title}</span>
      <div class="subtask-actions">
        <img src="./assets/icons/edit.svg" alt="Edit" onclick="editSubtask(${i})">
        <div class="action-separator"></div>
        <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtask(${i})">
      </div>
    </li>
  `;
}
