/**
 * Enables creating a subtask via Enter key.
 * Prevents submitting the main task form.
 * @returns {void} Result.
 */
/**
 * Binds keydown handler for the subtask input.
 * @param {HTMLElement} input - Subtask input element.
 * @returns {void} Result.
 */
function bindSubtaskKeydownHandler(input) {
  input.addEventListener('input', () => setSubtaskError(''));
  input.addEventListener('keydown', (event) => {
    if (event.isComposing || event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    event.stopPropagation();
    const value = String(input.value || '').trim();
    if (!value) { setSubtaskError('Subtasks must not be empty.'); return; }
    subtasks.push({ title: value, done: false });
    showSubtasks();
    input.value = '';
    setSubtaskError('');
  });
}

/**
 * Initializes the Enter key handler on the subtask input field.
 * @returns {void} Result.
 */
function initAddSubtaskEnter() {
  const input = document.getElementById('subtask');
  if (!input) return;
  if (input.dataset && input.dataset.enterHandlerAdded === 'true') return;
  if (input.dataset) input.dataset.enterHandlerAdded = 'true';
  bindSubtaskKeydownHandler(input);
}

/**
 * Shows subtasks.
 * @returns {void} Result.
 */
/**
 * Applies visibility styles to the subtask area based on count.
 * @param {HTMLElement} subtaskArea - Subtask area element.
 * @returns {void} Result.
 */
function applySubtaskAreaVisibility(subtaskArea) {
  if (subtasks.length === 0) {
    subtaskArea.style.cssText = 'display:none;height:0;min-height:0;visibility:hidden';
  } else {
    subtaskArea.style.cssText = '';
  }
}

function showSubtasks() {
  const subtaskArea = document.getElementById('subtask-area');
  subtaskArea.innerHTML = '';
  for (let i = 0; i < subtasks.length; i++) subtaskArea.innerHTML += generateSubtasks(i);
  applySubtaskAreaVisibility(subtaskArea);
}

/**
 * Adds subtask.
 * @returns {void} Result.
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
 * Clears subtask input.
 * @returns {void} Result.
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
 * Executes edit subtask logic.
 * @param {number} i - Index.
 * @returns {void} Result.
 */
function editSubtask(i) {
  setEditingSubtask(i);
}

/**
 * Deletes subtask.
 * @param {number} i - Index.
 * @returns {void} Result.
 */
function deleteSubtask(i) {
  subtasks.splice(i, 1);
  if (window.editingSubtaskIndex === i) {
    window.editingSubtaskIndex = null;
  }
  showSubtasks();
}

/**
 * Sets editing subtask.
 * @param {number} i - Index.
 * @returns {void} Result.
 */
function setEditingSubtask(i) {
  window.editingSubtaskIndex = i;
  showSubtasks();
  focusSubtaskEditInput(i);
}

/**
 * Executes focus subtask edit input logic.
 * @param {number} i - Index.
 * @returns {void} Result.
 */
function focusSubtaskEditInput(i) {
  const input = document.getElementById(`subtask-edit-${i}`);
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

/**
 * Executes cancel edit subtask logic.
 * @returns {void} Result.
 */
function cancelEditSubtask() {
  window.editingSubtaskIndex = null;
  showSubtasks();
  setSubtaskError('');
}

/**
 * Saves edited subtask.
 * @param {number} i - Index.
 * @returns {void} Result.
 */
function saveEditedSubtask(i) {
  const input = document.getElementById(`subtask-edit-${i}`);
  if (!input) return;
  const value = input.value.trim();
  if (!value) {
    setSubtaskError('Subtasks must not be empty.', input);
    return;
  }
  subtasks[i].title = value;
  window.editingSubtaskIndex = null;
  showSubtasks();
  setSubtaskError('');
}

/**
 * Sets subtask error message.
 * @param {string} message - Message text.
 * @param {HTMLElement} [inputEl] - Optional input to highlight.
 * @returns {void} Result.
 */
function setSubtaskError(message, inputEl) {
  const errorEl = document.getElementById('subtask-error');
  if (errorEl) {
    errorEl.textContent = message || '';
  }
  const input = inputEl || document.getElementById('subtask');
  if (input) input.classList.toggle('input-error', !!message);
}
