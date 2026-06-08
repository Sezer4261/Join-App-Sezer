/** @file Subtask list rendering in edit task modal. */

/**
 * Rebuilds the edit subtask list from the in-memory editSubtasks array.
 * @returns {void}
 */
function renderEditSubtasks() {
  const area = document.getElementById("edit-subtask-area");
  if (!area) return;
  area.innerHTML = "";
  editSubtasks.forEach((st, i) => appendEditSubtask(area, st, i));
}

/**
 * Appends one subtask row in either view or inline-edit mode.
 * @param {HTMLElement} area - Container element receiving the subtask markup.
 * @param {Object} subtask - Subtask object with title and done state.
 * @param {number} index - Position of the subtask within editSubtasks.
 * @returns {void}
 */
function appendEditSubtask(area, subtask, index) {
  const isEditing = window.editingEditSubtaskIndex === index;
  const markup = isEditing
    ? getEditSubtaskEditMarkup(subtask, index)
    : getEditSubtaskItemMarkup(subtask, index);
  area.innerHTML += markup;
}

/**
 * Reads the subtask input, validates it, and appends a new subtask to the list.
 * @returns {void}
 */
function addEditSubtask() {
  const input = document.getElementById("edit-subtask-input");
  if (!input) return;
  const value = input.value.trim();
  if (!value) {
    setEditSubtaskError('Subtasks must not be empty.');
    return;
  }
  editSubtasks.push({ title: value, done: false });
  input.value = "";
  setEditSubtaskError('');
  renderEditSubtasks();
}

/**
 * Keeps the inline-edit index consistent after a subtask is removed.
 * @param {number} removedIndex - Index of the subtask that was deleted.
 * @returns {void}
 */
function adjustEditingIndexAfterDelete(removedIndex) {
  if (window.editingEditSubtaskIndex === removedIndex) {
    window.editingEditSubtaskIndex = null;
  } else if (typeof window.editingEditSubtaskIndex === "number" && removedIndex < window.editingEditSubtaskIndex) {
    window.editingEditSubtaskIndex -= 1;
  }
}

/**
 * Removes a subtask from the edit list and refreshes the subtask area.
 * @param {number} i - Index of the subtask to delete.
 * @returns {void}
 */
function deleteEditSubtask(i) {
  editSubtasks.splice(i, 1);
  adjustEditingIndexAfterDelete(i);
  renderEditSubtasks();
}

/**
 * Clears the new-subtask input and removes any validation error styling.
 * @returns {void}
 */
function clearEditSubtaskInput() {
  const input = document.getElementById("edit-subtask-input");
  if (!input) return;
  input.value = "";
  input.focus();
  setEditSubtaskError('');
}

/**
 * Switches a subtask row into inline-edit mode and focuses its input.
 * @param {number} i - Index of the subtask to edit.
 * @returns {void}
 */
function editEditSubtask(i) {
  window.editingEditSubtaskIndex = i;
  renderEditSubtasks();
  const input = document.getElementById(`edit-subtask-edit-${i}`);
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

/**
 * Saves the trimmed title from an inline-edited subtask row.
 * @param {number} i - Index of the subtask being saved.
 * @returns {void}
 */
function saveEditedEditSubtask(i) {
  const input = document.getElementById(`edit-subtask-edit-${i}`);
  if (!input) return;
  const value = input.value.trim();
  if (!value) {
    setEditSubtaskError('Subtasks must not be empty.', input);
    return;
  }
  editSubtasks[i].title = value;
  window.editingEditSubtaskIndex = null;
  renderEditSubtasks();
  setEditSubtaskError('');
}

/**
 * Shows or clears the edit subtask validation message and input highlight.
 * @param {string} message - Error text to display, or empty string to clear.
 * @param {HTMLElement} [inputEl] - Input to highlight; defaults to the new-subtask input.
 * @returns {void}
 */
function setEditSubtaskError(message, inputEl) {
  const errorEl = document.getElementById('edit-subtask-error');
  if (errorEl) {
    errorEl.textContent = message || '';
  }
  const input = inputEl || document.getElementById('edit-subtask-input');
  if (input) input.classList.toggle('input-error', !!message);
}
