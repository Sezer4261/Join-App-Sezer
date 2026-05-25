/**
 * Renders add task.
 * @returns {Promise<*>} Result.
 */
/**
 * Initializes event handlers after add-task form is rendered.
 * @returns {void} Result.
 */
function initAddTaskHandlers() {
  initAddDropdownClose();
  initAddTaskBlurValidation();
  initAddSubtaskEnter();
  showSubtasks();
  updateCreateButtonState();
}

async function renderAddTask() {
  const content = document.getElementById('add-task-content');
  if (!content) return;
  setAddTaskActionButtonsDisabled(false);
  applyTodayMinDate();
  await loadContacts();
  resetSelectedContacts();
  selectContacts();
  renderSelectedAvatars();
  initAddTaskHandlers();
}

/**
 * Initializes add task blur validation handlers.
 * @returns {void} Result.
 */
/**
 * Binds blur/change/click handlers for title, date, and category fields.
 * @param {HTMLElement} titleInput - Title input.
 * @param {HTMLElement} dateInput - Date input.
 * @param {HTMLElement} categorySelect - Category select.
 * @returns {void} Result.
 */
function bindAddTaskFieldListeners(titleInput, dateInput, categorySelect) {
  titleInput?.addEventListener('blur', validateTitleField);
  titleInput?.addEventListener('input', clearTitleErrorOnValidInput);
  titleInput?.addEventListener('input', updateCreateButtonState);
  dateInput?.addEventListener('blur', validateDateField);
  dateInput?.addEventListener('input', clearDateErrorOnValidInput);
  dateInput?.addEventListener('input', updateCreateButtonState);
  dateInput?.addEventListener('change', clearDateErrorOnValidInput);
  dateInput?.addEventListener('change', updateCreateButtonState);
  dateInput?.addEventListener('click', () => { try { dateInput.showPicker(); } catch (_) {} });
  categorySelect?.addEventListener('blur', validateCategoryField);
  categorySelect?.addEventListener('change', updateCreateButtonState);
}

/**
 * Initializes blur/change validation listeners for the add-task form fields.
 * @returns {void} Result.
 */
function initAddTaskBlurValidation() {
  const form = document.getElementById('add-task-form');
  if (!form || form.dataset.blurValidationInit === '1') return;
  bindAddTaskFieldListeners(
    document.getElementById('title'),
    document.getElementById('date'),
    document.getElementById('category-select')
  );
  form.dataset.blurValidationInit = '1';
}

/**
 * Returns whether all required add-task form fields are filled.
 * @returns {boolean} Result.
 */
function isAddTaskFormComplete() {
  const titleInput = document.getElementById('title');
  const dateInput = document.getElementById('date');
  const categoryInput = document.getElementById('category');
  const hasTitle = titleInput && String(titleInput.value || '').trim().length > 0;
  const hasDate = dateInput && String(dateInput.value || '').trim().length > 0;
  const hasCategory = categoryInput && String(categoryInput.value || '').trim().length > 0;
  return hasTitle && hasDate && hasCategory;
}

/**
 * Updates the disabled state of the create-task button based on form completeness.
 * @returns {void} Result.
 */
function updateCreateButtonState() {
  const btn = document.getElementById('create-task-btn');
  if (!btn) return;
  btn.disabled = !isAddTaskFormComplete();
}

/**
 * Executes reset selected contacts logic.
 * @returns {void} Result.
 */
function resetSelectedContacts() {
  selectedContacts = [];
}

/**
 * Builds a task data object from the current add-task form values.
 * @returns {Object} Task data object ready for saving.
 */
function generateTaskFromForm() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const dueDate = document.getElementById('date').value.trim();
  const priority = document.querySelector('input[name="priority"]:checked').value;
  const category = document.getElementById('category').value.trim();
  return {
    id: Date.now(),
    title,
    description,
    dueDate,
    priority,
    contacts: [...selectedContacts],
    category,
    subtasks: [...subtasks],
    status: window.currentBoardStatus || "To Do",
  };
}

/**
 * Saves to array.
 * @param {Event} event - Browser event.
 * @returns {Promise<*>} Result.
 */
async function saveToArray(event) {
  event.preventDefault();
  if (!validateForm()) return;
  const task = generateTaskFromForm();
  const result = await saveTask(task);
  if (result) {
    handleSaveSuccess();
    return;
  }
  handleSaveFailure();
}

/**
 * Executes handle save success logic.
 * @returns {void} Result.
 */
/**
 * Handles post-save navigation (close dialog or redirect).
 * @returns {void} Result.
 */
function schedulePostSaveNavigation() {
  if (typeof closeAddTaskDialog === "function") {
    setTimeout(async () => { closeAddTaskDialog(); await loadTasks(); }, 1500);
  } else {
    setTimeout(() => { window.location.href = "board.html"; }, 1500);
  }
}

function handleSaveSuccess() {
  setAddTaskActionButtonsDisabled(true);
  showMessage("Task added to board", "success", { iconSrc: "./assets/icons/vector-board.svg", iconAlt: "Board" });
  subtasks.length = 0;
  selectedContacts.length = 0;
  showSubtasks();
  document.getElementById('add-task-form').reset();
  schedulePostSaveNavigation();
}

/**
 * Executes handle save failure logic.
 * @returns {void} Result.
 */
function handleSaveFailure() {
  showMessage("Task could not be saved", "error");
}

/**
 * Enables or disables add-task action buttons.
 * @param {boolean} disabled - Whether buttons should be disabled.
 * @returns {void} Result.
 */
function setAddTaskActionButtonsDisabled(disabled) {
  const buttons = document.querySelectorAll('#add-task-form ~ .form-footer .clear, #add-task-form ~ .form-footer .create, .actions .clear[form="add-task-form"], .actions .create[form="add-task-form"]');
  buttons.forEach((button) => {
    button.disabled = !!disabled;
    button.setAttribute('aria-disabled', disabled ? 'true' : 'false');
  });
}

/**
 * Saves task.
 * @param {Object} task - Task object.
 * @returns {Promise<*>} Result.
 */
async function saveTask(task) {
  try {
    const response = await fetch(`${BASE_URL}/tasks.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    return await response.json();
  } catch (error) {
    console.error("Fehler beim Speichern des Tasks:", error);
  }
}

/**
 * Clears form.
 * @returns {void} Result.
 */
/**
 * Clears category UI fields.
 * @returns {void} Result.
 */
function clearFormCategoryUI() {
  const categoryInput = document.getElementById('category');
  const categorySelect = document.getElementById('category-select');
  if (categoryInput) categoryInput.value = '';
  if (categorySelect) {
    const label = categorySelect.querySelector('span');
    if (label) label.childNodes[0].textContent = 'Select task category ';
  }
}

/**
 * Clears contacts dropdown checkboxes and resets selected avatars.
 * @returns {void} Result.
 */
function clearFormContactsDropdown() {
  const dropdown = document.getElementById('dropdown-contacts');
  if (dropdown) dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
  selectedContacts = [];
  renderSelectedAvatars();
}

/**
 * Clears subtasks array and re-renders subtask area.
 * @returns {void} Result.
 */
function clearFormSubtasks() {
  if (Array.isArray(subtasks)) subtasks.length = 0;
  showSubtasks();
  updateCreateButtonState();
}

/**
 * Resets the add-task form and clears all validation errors and selections.
 * @returns {void} Result.
 */
function clearForm() {
  const form = document.getElementById('add-task-form');
  if (form) form.reset();
  clearValidationErrors();
  if (typeof setSubtaskError === 'function') setSubtaskError('');
  ['title', 'date', 'category'].forEach(id => document.getElementById(id)?.classList.remove('input-error'));
  document.getElementById('category-select')?.classList.remove('input-error');
  clearFormCategoryUI();
  clearFormContactsDropdown();
  clearFormSubtasks();
}
