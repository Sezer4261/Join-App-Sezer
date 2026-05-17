/**
 * Renders add task.
 * @returns {Promise<*>} Result.
 */
async function renderAddTask() {
  const content = document.getElementById('add-task-content');
  if (!content) return;
  setAddTaskActionButtonsDisabled(false);
  applyTodayMinDate();
  await loadContacts();
  resetSelectedContacts();
  selectContacts();
  renderSelectedAvatars();
  initAddDropdownClose();
  initAddTaskBlurValidation();
  initAddSubtaskEnter();
  showSubtasks();
  updateCreateButtonState();
}

/**
 * Initializes add task blur validation handlers.
 * @returns {void} Result.
 */
function initAddTaskBlurValidation() {
  const form = document.getElementById('add-task-form');
  if (!form || form.dataset.blurValidationInit === '1') return;

  const titleInput = document.getElementById('title');
  const dateInput = document.getElementById('date');
  const categorySelect = document.getElementById('category-select');

  titleInput?.addEventListener('blur', validateTitleField);
  titleInput?.addEventListener('input', clearTitleErrorOnValidInput);
  titleInput?.addEventListener('input', updateCreateButtonState);
  dateInput?.addEventListener('blur', validateDateField);
  dateInput?.addEventListener('input', clearDateErrorOnValidInput);
  dateInput?.addEventListener('input', updateCreateButtonState);
  dateInput?.addEventListener('change', clearDateErrorOnValidInput);
  dateInput?.addEventListener('change', updateCreateButtonState);
  dateInput?.addEventListener('click', () => {
    try { dateInput.showPicker(); } catch (_) {}
  });
  categorySelect?.addEventListener('blur', validateCategoryField);
  categorySelect?.addEventListener('change', updateCreateButtonState);

  form.dataset.blurValidationInit = '1';
}

/**
 * Updates create button disabled state.
 * @returns {void} Result.
 */
function updateCreateButtonState() {
  const btn = document.getElementById('create-task-btn');
  if (!btn) return;
  
  const titleInput = document.getElementById('title');
  const dateInput = document.getElementById('date');
  const categoryInput = document.getElementById('category');
  
  const hasTitle = titleInput && String(titleInput.value || '').trim().length > 0;
  const hasDate = dateInput && String(dateInput.value || '').trim().length > 0;
  const hasCategory = categoryInput && String(categoryInput.value || '').trim().length > 0;
  
  const isFormValid = hasTitle && hasDate && hasCategory;
  btn.disabled = !isFormValid;
}

/**
 * Executes reset selected contacts logic.
 * @returns {void} Result.
 */
function resetSelectedContacts() {
  selectedContacts = [];
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
function handleSaveSuccess() {
  setAddTaskActionButtonsDisabled(true);
  showMessage("Task added to board", "success", {
    iconSrc: "./assets/icons/vector-board.svg",
    iconAlt: "Board"
  });
  subtasks.length = 0;
  selectedContacts.length = 0;
  showSubtasks();
  document.getElementById('add-task-form').reset();
  if (typeof closeAddTaskDialog === "function") {
    setTimeout(async () => {
      closeAddTaskDialog();
      await loadTasks();
    }, 1500);
  } else {
    setTimeout(() => { window.location.href = "board.html"; }, 1500);
  }
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
function clearForm() {
  const form = document.getElementById('add-task-form');
  if (form) {
    form.reset();
  }
  clearValidationErrors();
  if (typeof setSubtaskError === 'function') {
    setSubtaskError('');
  }
  const titleInput = document.getElementById('title');
  const dateInput = document.getElementById('date');
  const categoryInput = document.getElementById('category');
  const categorySelect = document.getElementById('category-select');
  titleInput?.classList.remove('input-error');
  dateInput?.classList.remove('input-error');
  categoryInput?.classList.remove('input-error');
  categorySelect?.classList.remove('input-error');

  if (categoryInput) {
    categoryInput.value = '';
  }
  if (categorySelect) {
    const label = categorySelect.querySelector('span');
    if (label) {
      label.childNodes[0].textContent = 'Select task category ';
    }
  }

  const dropdown = document.getElementById('dropdown-contacts');
  if (dropdown) {
    dropdown.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
    });
  }

  selectedContacts = [];
  renderSelectedAvatars();

  if (Array.isArray(subtasks)) {
    subtasks.length = 0;
  }
  showSubtasks();
  updateCreateButtonState();
}
