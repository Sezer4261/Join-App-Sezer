/**
 * Enables creating a subtask via Enter key.
 * Prevents submitting the main task form.
 * @returns {void} Result.
 */
function initAddSubtaskEnter() {
  const input = document.getElementById('subtask');
  if (!input) return;
  if (input.dataset && input.dataset.enterHandlerAdded === 'true') return;
  if (input.dataset) input.dataset.enterHandlerAdded = 'true';

  input.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key !== 'Enter') return;
    if (event.shiftKey) return;
    event.preventDefault();
    event.stopPropagation();

    const value = String(input.value || '').trim();
    if (!value) return;
    subtasks.push({ title: value, done: false });
    showSubtasks();
    input.value = '';
  });
}

/**
 * Shows subtasks.
 * @returns {void} Result.
 */
function showSubtasks() {
  let subtaskArea = document.getElementById('subtask-area');
  subtaskArea.innerHTML = '';
  for (let i = 0; i < subtasks.length; i++) {
    subtaskArea.innerHTML += generateSubtasks(i);
  }
}

/**
 * Adds subtask.
 * @returns {void} Result.
 */
function addSubtask() {
  let subtask = document.getElementById('subtask').value;
  if (subtask) {
    subtasks.push({ title: subtask, done: false });
    showSubtasks();
    document.getElementById('subtask').value = '';
  } else {
    alert("Bitte eine Subtask beschreiben!");
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
    alert("Bitte eine Subtask beschreiben!");
    return;
  }
  subtasks[i].title = value;
  window.editingSubtaskIndex = null;
  showSubtasks();
}
