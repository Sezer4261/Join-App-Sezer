/** @file Subtask creation and management in add-task form. */

/**
 * Clears the subtask input error message when the user starts typing.
 * @returns {void} Nothing is returned after the error message is cleared.
 */
function handleSubtaskInputClearError() {
  setSubtaskError('');
}

/**
 * Adds a subtask when Enter is pressed in the subtask input field.
 * @param {KeyboardEvent} event - Keyboard event from the subtask input.
 * @returns {void} Nothing is returned after the subtask is added or the error state is updated.
 */
function handleSubtaskInputKeydown(event) {
  const input = /** @type {HTMLInputElement} */ (event.currentTarget);
  if (event.isComposing || event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  event.stopPropagation();
  const value = String(input.value || '').trim();
  if (!value) { setSubtaskError('Subtasks must not be empty.'); return; }
  subtasks.push({ title: value, done: false });
  showSubtasks();
  input.value = '';
  setSubtaskError('');
}

/**
 * Binds input and keydown handlers for the subtask input field.
 * @param {HTMLElement} input - Subtask text input element to attach listeners to.
 * @returns {void} Nothing is returned after the event listeners are registered.
 */
function bindSubtaskKeydownHandler(input) {
  input.addEventListener('input', handleSubtaskInputClearError);
  input.addEventListener('keydown', handleSubtaskInputKeydown);
}

/**
 * Initializes the Enter key handler on the subtask input field.
 * @returns {void} Nothing is returned after the handler is registered or skipped.
 */
function initAddSubtaskEnter() {
  const input = document.getElementById('subtask');
  if (!input) return;
  if (input.dataset && input.dataset.enterHandlerAdded === 'true') return;
  if (input.dataset) input.dataset.enterHandlerAdded = 'true';
  bindSubtaskKeydownHandler(input);
}

/**
 * Applies visibility styles to the subtask area based on how many subtasks exist.
 * @param {HTMLElement} subtaskArea - Container element that holds the rendered subtask list.
 * @returns {void} Nothing is returned after the visibility styles are applied.
 */
function applySubtaskAreaVisibility(subtaskArea) {
  if (subtasks.length === 0) {
    subtaskArea.style.cssText = 'display:none;height:0;min-height:0;visibility:hidden';
  } else {
    subtaskArea.style.cssText = '';
  }
}

/**
 * Renders all subtasks into the subtask list area.
 * @returns {void} Nothing is returned after the subtask list is rebuilt.
 */
function showSubtasks() {
  const subtaskArea = document.getElementById('subtask-area');
  subtaskArea.innerHTML = '';
  for (let i = 0; i < subtasks.length; i++) subtaskArea.innerHTML += generateSubtasks(i);
  applySubtaskAreaVisibility(subtaskArea);
}

/**
 * Adds a subtask from the current value of the subtask input field.
 * @returns {void} Nothing is returned after the subtask is added or an error is shown.
 */
function addSubtask() {
  const input = document.getElementById('subtask');
  if (!input) return;
  const subtask = String(input.value || '').trim();
  if (subtask) {
    subtasks.push({ title: subtask, done: false });
    showSubtasks();
    input.value = '';
    setSubtaskError('');
  } else {
    setSubtaskError('Subtasks must not be empty.');
  }
}

/**
 * Clears the subtask input field and any associated error state.
 * @returns {void} Nothing is returned after the input is reset and focused.
 */
function clearSubtaskInput() {
  const input = document.getElementById('subtask');
  if (input) {
    input.value = '';
    input.focus();
  }
  setSubtaskError('');
}

/**
 * Enters edit mode for the subtask at the given index.
 * @param {number} index - Zero-based index of the subtask in the list.
 * @returns {void} Nothing is returned after edit mode is activated.
 */
function editSubtask(index) {
  setEditingSubtask(index);
}

/**
 * Deletes the subtask at the given index and refreshes the list.
 * @param {number} index - Zero-based index of the subtask in the list.
 * @returns {void} Nothing is returned after the subtask is removed and the list is re-rendered.
 */
function deleteSubtask(index) {
  subtasks.splice(index, 1);
  if (window.editingSubtaskIndex === index) {
    window.editingSubtaskIndex = null;
  }
  showSubtasks();
}

/**
 * Sets the subtask at the given index into edit mode and focuses its input.
 * @param {number} index - Zero-based index of the subtask in the list.
 * @returns {void} Nothing is returned after the edit UI is shown and focused.
 */
function setEditingSubtask(index) {
  window.editingSubtaskIndex = index;
  showSubtasks();
  focusSubtaskEditInput(index);
}

/**
 * Focuses the edit input for the subtask at the given index.
 * @param {number} index - Zero-based index of the subtask in the list.
 * @returns {void} Nothing is returned after the cursor is placed at the end of the input.
 */
function focusSubtaskEditInput(index) {
  const input = document.getElementById(`subtask-edit-${index}`);
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

/**
 * Cancels subtask editing and re-renders the list in display mode.
 * @returns {void} Nothing is returned after edit mode is cleared and the list is refreshed.
 */
function cancelEditSubtask() {
  window.editingSubtaskIndex = null;
  showSubtasks();
  setSubtaskError('');
}

/**
 * Saves the edited title for the subtask at the given index.
 * @param {number} index - Zero-based index of the subtask in the list.
 * @returns {void} Nothing is returned after the title is saved or a validation error is shown.
 */
function saveEditedSubtask(index) {
  const input = document.getElementById(`subtask-edit-${index}`);
  if (!input) return;
  const value = input.value.trim();
  if (!value) {
    setSubtaskError('Subtasks must not be empty.', input);
    return;
  }
  subtasks[index].title = value;
  window.editingSubtaskIndex = null;
  showSubtasks();
  setSubtaskError('');
}

/**
 * Sets the subtask error message and optionally highlights the related input.
 * @param {string} message - Error message text to display, or an empty string to clear it.
 * @param {HTMLElement} [inputEl] - Input element to highlight when an error is present.
 * @returns {void} Nothing is returned after the error message and highlight state are updated.
 */
function setSubtaskError(message, inputEl) {
  const errorEl = document.getElementById('subtask-error');
  if (errorEl) {
    errorEl.textContent = message || '';
  }
  const input = inputEl || document.getElementById('subtask');
  if (input) input.classList.toggle('input-error', !!message);
}
