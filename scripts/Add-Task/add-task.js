/** @file Add-task page rendering and form submission. */
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

/**
 * Applies pending board status from session storage when navigating from the board.
 * @returns {void}
 */
function applyPendingBoardStatusFromSession() {
  const pendingStatus = sessionStorage.getItem("addTaskBoardStatus");
  if (!pendingStatus) return;
  window.currentBoardStatus = pendingStatus;
  sessionStorage.removeItem("addTaskBoardStatus");
}

/**
 * Loads contacts and resets the add-task contact selection UI.
 * @returns {Promise<void>}
 */
async function prepareAddTaskContacts() {
  await loadContacts();
  resetSelectedContacts();
  selectContacts();
  renderSelectedAvatars();
}

async function renderAddTask() {
  const content = document.getElementById('add-task-content');
  if (!content) return;
  applyPendingBoardStatusFromSession();
  setAddTaskActionButtonsDisabled(false);
  applyTodayMinDate();
  await prepareAddTaskContacts();
  initAddTaskHandlers();
}

/**
 * Binds validation and state listeners for the add-task title field.
 * @param {HTMLElement} titleInput - Title input.
 * @returns {void}
 */
function bindAddTaskTitleFieldListeners(titleInput) {
  titleInput?.addEventListener('blur', validateTitleField);
  titleInput?.addEventListener('input', clearTitleErrorOnValidInput);
  titleInput?.addEventListener('input', updateCreateButtonState);
}

/**
 * Binds validation listeners for the add-task date field.
 * @param {HTMLElement} dateInput - Date input.
 * @returns {void}
 */
function bindAddTaskDateValidationListeners(dateInput) {
  dateInput?.addEventListener('blur', validateDateField);
  dateInput?.addEventListener('input', clearDateErrorOnValidInput);
  dateInput?.addEventListener('input', updateCreateButtonState);
  dateInput?.addEventListener('change', clearDateErrorOnValidInput);
  dateInput?.addEventListener('change', updateCreateButtonState);
}

/**
 * Handles pointerdown on the add-task date input for the custom picker.
 * @param {PointerEvent} event - Pointer event.
 * @param {HTMLElement} dateInput - Date input.
 * @returns {void}
 */
function handleAddTaskDateInputPointerDown(event, dateInput) {
  if (!shouldUseCustomAddTaskDatePicker()) return;
  event.preventDefault();
  openAddTaskDatePicker(dateInput);
}

/**
 * Handles click on the add-task date input for the native picker.
 * @param {HTMLElement} dateInput - Date input.
 * @returns {void}
 */
function handleAddTaskDateInputClick(dateInput) {
  if (shouldUseCustomAddTaskDatePicker()) return;
  openAddTaskDatePicker(dateInput);
}

/**
 * Handles keyboard activation of the add-task date picker.
 * @param {KeyboardEvent} event - Keyboard event.
 * @param {HTMLElement} dateInput - Date input.
 * @returns {void}
 */
function handleAddTaskDateInputKeydown(event, dateInput) {
  if (!shouldUseCustomAddTaskDatePicker()) return;
  if (!['Enter', ' ', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  openAddTaskDatePicker(dateInput);
}

/**
 * Binds custom date picker open handlers for the add-task date input.
 * @param {HTMLElement} dateInput - Date input.
 * @returns {void}
 */
function bindAddTaskDatePickerListeners(dateInput) {
  dateInput?.addEventListener('pointerdown', (event) => handleAddTaskDateInputPointerDown(event, dateInput));
  dateInput?.addEventListener('click', () => handleAddTaskDateInputClick(dateInput));
  dateInput?.addEventListener('keydown', (event) => handleAddTaskDateInputKeydown(event, dateInput));
}

/**
 * Binds label click handlers that open the add-task date picker.
 * @param {HTMLElement} dateInput - Date input.
 * @param {HTMLElement|null} dateLabel - Wrapping label element.
 * @returns {void}
 */
function bindAddTaskDateLabelListeners(dateInput, dateLabel) {
  dateLabel?.addEventListener('pointerdown', (event) => {
    if (!dateInput || event.target === dateInput || event.target?.id === 'date-error' || !shouldUseCustomAddTaskDatePicker()) return;
    event.preventDefault();
    openAddTaskDatePicker(dateInput);
  });
  dateLabel?.addEventListener('click', (event) => {
    if (!dateInput || event.target === dateInput || event.target?.id === 'date-error' || shouldUseCustomAddTaskDatePicker()) return;
    openAddTaskDatePicker(dateInput);
  });
}

/**
 * Binds blur/change/click handlers for the add-task date field.
 * @param {HTMLElement} dateInput - Date input.
 * @returns {void}
 */
function bindAddTaskDateFieldListeners(dateInput) {
  bindAddTaskDateValidationListeners(dateInput);
  updateAddTaskDateInputMode(dateInput);
  bindAddTaskDatePickerListeners(dateInput);
  bindAddTaskDateLabelListeners(dateInput, dateInput?.closest('label'));
}

/**
 * Binds validation listeners for the add-task category field.
 * @param {HTMLElement} categorySelect - Category select.
 * @returns {void}
 */
function bindAddTaskCategoryFieldListeners(categorySelect) {
  categorySelect?.addEventListener('blur', validateCategoryField);
  categorySelect?.addEventListener('change', updateCreateButtonState);
}

/**
 * Binds blur/change/click handlers for title, date, and category fields.
 * @param {HTMLElement} titleInput - Title input.
 * @param {HTMLElement} dateInput - Date input.
 * @param {HTMLElement} categorySelect - Category select.
 * @returns {void} Result.
 */
function bindAddTaskFieldListeners(titleInput, dateInput, categorySelect) {
  bindAddTaskTitleFieldListeners(titleInput);
  bindAddTaskDateFieldListeners(dateInput);
  bindAddTaskCategoryFieldListeners(categorySelect);
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
 * Reads raw add-task form field values.
 * @returns {Object} Form values keyed by field name.
 */
function readAddTaskFormValues() {
  return {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    dueDate: document.getElementById("date").value.trim(),
    priority: document.querySelector('input[name="priority"]:checked').value,
    category: document.getElementById("category").value.trim(),
  };
}

/**
 * Builds a task data object from the current add-task form values.
 * @returns {Object} Task data object ready for saving.
 */
function generateTaskFromForm() {
  const form = readAddTaskFormValues();
  return {
    id: Date.now(),
    ...form,
    contacts: [...selectedContacts],
    subtasks: [...subtasks],
    status: window.currentBoardStatus || "To Do",
    order: Date.now(),
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
  closeAddTaskDatePicker();
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
