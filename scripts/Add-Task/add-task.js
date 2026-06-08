/** @file Add-task page rendering and form submission. */

/**
 * Initializes event handlers after the add-task form is rendered.
 * @returns {void} Nothing is returned after dropdown, validation, and subtask handlers are wired up.
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
 * @returns {void} Nothing is returned after the stored status is applied or no value exists.
 */
function applyPendingBoardStatusFromSession() {
  const pendingStatus = sessionStorage.getItem("addTaskBoardStatus");
  if (!pendingStatus) return;
  window.currentBoardStatus = pendingStatus;
  sessionStorage.removeItem("addTaskBoardStatus");
}

/**
 * Loads contacts and resets the add-task contact selection UI.
 * @returns {Promise<void>} A promise that resolves after contacts are loaded and the selection UI is reset.
 */
async function prepareAddTaskContacts() {
  await loadContacts();
  resetSelectedContacts();
  selectContacts();
  renderSelectedAvatars();
}

/**
 * Renders and initializes the add-task form content.
 * @returns {Promise<void>} A promise that resolves after the form is prepared and handlers are initialized.
 */
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
 * @param {HTMLElement} titleInput - Text input element for the task title.
 * @returns {void} Nothing is returned after blur and input listeners are registered.
 */
function bindAddTaskTitleFieldListeners(titleInput) {
  titleInput?.addEventListener('blur', validateTitleField);
  titleInput?.addEventListener('input', clearTitleErrorOnValidInput);
  titleInput?.addEventListener('input', updateCreateButtonState);
}

/**
 * Binds validation listeners for the add-task date field.
 * @param {HTMLElement} dateInput - Date input element for the task due date.
 * @returns {void} Nothing is returned after blur, input, and change listeners are registered.
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
 * @param {PointerEvent} event - Pointer event from the due date input.
 * @param {HTMLElement} dateInput - Date input element that should open the picker.
 * @returns {void} Nothing is returned after the custom picker is opened or the event is ignored.
 */
function handleAddTaskDateInputPointerDown(event, dateInput) {
  if (!shouldUseCustomAddTaskDatePicker()) return;
  event.preventDefault();
  openAddTaskDatePicker(dateInput);
}

/**
 * Handles click on the add-task date input for the native picker.
 * @param {HTMLElement} dateInput - Date input element that should open the picker.
 * @returns {void} Nothing is returned after the native picker is opened or the event is ignored.
 */
function handleAddTaskDateInputClick(dateInput) {
  if (shouldUseCustomAddTaskDatePicker()) return;
  openAddTaskDatePicker(dateInput);
}

/**
 * Handles keyboard activation of the add-task date picker.
 * @param {KeyboardEvent} event - Keyboard event from the due date input.
 * @param {HTMLElement} dateInput - Date input element that should open the picker.
 * @returns {void} Nothing is returned after the picker is opened or the key press is ignored.
 */
function handleAddTaskDateInputKeydown(event, dateInput) {
  if (!shouldUseCustomAddTaskDatePicker()) return;
  if (!['Enter', ' ', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  openAddTaskDatePicker(dateInput);
}

/**
 * Handles pointerdown on the bound add-task date input element.
 * @param {PointerEvent} event - Pointer event whose currentTarget is the due date input.
 * @returns {void} Nothing is returned after the pointerdown handler delegates to the date input logic.
 */
function handleAddTaskDateInputPointerDownFromEvent(event) {
  handleAddTaskDateInputPointerDown(event, /** @type {HTMLElement} */ (event.currentTarget));
}

/**
 * Handles click on the bound add-task date input element.
 * @param {MouseEvent} event - Click event whose currentTarget is the due date input.
 * @returns {void} Nothing is returned after the click handler delegates to the date input logic.
 */
function handleAddTaskDateInputClickFromEvent(event) {
  handleAddTaskDateInputClick(/** @type {HTMLElement} */ (event.currentTarget));
}

/**
 * Handles keydown on the bound add-task date input element.
 * @param {KeyboardEvent} event - Keyboard event whose currentTarget is the due date input.
 * @returns {void} Nothing is returned after the keydown handler delegates to the date input logic.
 */
function handleAddTaskDateInputKeydownFromEvent(event) {
  handleAddTaskDateInputKeydown(event, /** @type {HTMLElement} */ (event.currentTarget));
}

/**
 * Binds custom date picker open handlers for the add-task date input.
 * @param {HTMLElement} dateInput - Date input element that should open the picker on interaction.
 * @returns {void} Nothing is returned after pointer, click, and keydown listeners are registered.
 */
function bindAddTaskDatePickerListeners(dateInput) {
  dateInput?.addEventListener('pointerdown', handleAddTaskDateInputPointerDownFromEvent);
  dateInput?.addEventListener('click', handleAddTaskDateInputClickFromEvent);
  dateInput?.addEventListener('keydown', handleAddTaskDateInputKeydownFromEvent);
}

/**
 * Handles pointerdown on the due date label to open the custom date picker.
 * @param {PointerEvent} event - Pointer event from the wrapping due date label.
 * @returns {void} Nothing is returned after the custom picker is opened or the event is ignored.
 */
function handleAddTaskDateLabelPointerDown(event) {
  const dateInput = /** @type {HTMLElement|null} */ (event.currentTarget.querySelector('#date'));
  if (!dateInput || event.target === dateInput || event.target?.id === 'date-error' || !shouldUseCustomAddTaskDatePicker()) return;
  event.preventDefault();
  openAddTaskDatePicker(dateInput);
}

/**
 * Handles click on the due date label to open the native date picker.
 * @param {MouseEvent} event - Click event from the wrapping due date label.
 * @returns {void} Nothing is returned after the native picker is opened or the event is ignored.
 */
function handleAddTaskDateLabelClick(event) {
  const dateInput = /** @type {HTMLElement|null} */ (event.currentTarget.querySelector('#date'));
  if (!dateInput || event.target === dateInput || event.target?.id === 'date-error' || shouldUseCustomAddTaskDatePicker()) return;
  openAddTaskDatePicker(dateInput);
}

/**
 * Binds label click handlers that open the add-task date picker.
 * @param {HTMLElement} dateInput - Date input element wrapped by the label listeners.
 * @param {HTMLElement|null} dateLabel - Label element that surrounds the due date field.
 * @returns {void} Nothing is returned after pointer and click listeners are registered on the label.
 */
function bindAddTaskDateLabelListeners(dateInput, dateLabel) {
  dateLabel?.addEventListener('pointerdown', handleAddTaskDateLabelPointerDown);
  dateLabel?.addEventListener('click', handleAddTaskDateLabelClick);
}

/**
 * Binds blur, change, and picker handlers for the add-task date field.
 * @param {HTMLElement} dateInput - Date input element for the task due date.
 * @returns {void} Nothing is returned after validation and picker listeners are registered.
 */
function bindAddTaskDateFieldListeners(dateInput) {
  bindAddTaskDateValidationListeners(dateInput);
  updateAddTaskDateInputMode(dateInput);
  bindAddTaskDatePickerListeners(dateInput);
  bindAddTaskDateLabelListeners(dateInput, dateInput?.closest('label'));
}

/**
 * Binds validation listeners for the add-task category field.
 * @param {HTMLElement} categorySelect - Custom-select element for the task category.
 * @returns {void} Nothing is returned after blur and change listeners are registered.
 */
function bindAddTaskCategoryFieldListeners(categorySelect) {
  categorySelect?.addEventListener('blur', validateCategoryField);
  categorySelect?.addEventListener('change', updateCreateButtonState);
}

/**
 * Binds blur, change, and click handlers for title, date, and category fields.
 * @param {HTMLElement} titleInput - Text input element for the task title.
 * @param {HTMLElement} dateInput - Date input element for the task due date.
 * @param {HTMLElement} categorySelect - Custom-select element for the task category.
 * @returns {void} Nothing is returned after listeners are registered on all three fields.
 */
function bindAddTaskFieldListeners(titleInput, dateInput, categorySelect) {
  bindAddTaskTitleFieldListeners(titleInput);
  bindAddTaskDateFieldListeners(dateInput);
  bindAddTaskCategoryFieldListeners(categorySelect);
}

/**
 * Initializes blur and change validation listeners for the add-task form fields.
 * @returns {void} Nothing is returned after one-time field listeners are registered.
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
 * @returns {boolean} True when title, due date, and category all contain values, otherwise false.
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
 * @returns {void} Nothing is returned after the create button enabled state is synchronized.
 */
function updateCreateButtonState() {
  const btn = document.getElementById('create-task-btn');
  if (!btn) return;
  btn.disabled = !isAddTaskFormComplete();
}

/**
 * Clears the selected contacts array.
 * @returns {void} Nothing is returned after the in-memory contact selection is emptied.
 */
function resetSelectedContacts() {
  selectedContacts = [];
}

/**
 * Reads raw add-task form field values from the DOM.
 * @returns {Object} Plain object containing trimmed title, description, due date, priority, and category values.
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
 * @returns {Object} Task object containing form values, contacts, subtasks, status, and ordering metadata.
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
 * Validates and saves the add-task form data to the backend.
 * @param {Event} event - Form submit event that triggered the save attempt.
 * @returns {Promise<void>} A promise that resolves after validation and save handling complete.
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
 * Handles post-save navigation by closing the dialog or redirecting to the board.
 * @returns {void} Nothing is returned after the delayed navigation action is scheduled.
 */
function schedulePostSaveNavigation() {
  if (typeof closeAddTaskDialog === "function") {
    setTimeout(async () => { closeAddTaskDialog(); await loadTasks(); }, 1500);
  } else {
    setTimeout(() => { window.location.href = "board.html"; }, 1500);
  }
}

/**
 * Handles successful task save by showing a message and resetting form state.
 * @returns {void} Nothing is returned after the success UI flow and form reset are triggered.
 */
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
 * Handles failed task save by showing an error message.
 * @returns {void} Nothing is returned after the save error message is displayed.
 */
function handleSaveFailure() {
  showMessage("Task could not be saved", "error");
}

/**
 * Enables or disables add-task action buttons.
 * @param {boolean} disabled - Whether the clear and create buttons should be disabled.
 * @returns {void} Nothing is returned after the footer action buttons are updated.
 */
function setAddTaskActionButtonsDisabled(disabled) {
  const buttons = document.querySelectorAll('#add-task-form ~ .form-footer .clear, #add-task-form ~ .form-footer .create, .actions .clear[form="add-task-form"], .actions .create[form="add-task-form"]');
  buttons.forEach((button) => {
    button.disabled = !!disabled;
    button.setAttribute('aria-disabled', disabled ? 'true' : 'false');
  });
}

/**
 * Persists a task object to the backend API.
 * @param {Object} task - Task object serialized and sent to the tasks endpoint.
 * @returns {Promise<*|undefined>} Parsed JSON response from the API, or undefined when the request fails.
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
 * Clears category UI fields after the form is reset.
 * @returns {void} Nothing is returned after the hidden category value and label are restored.
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
 * @returns {void} Nothing is returned after contact selections and avatar markup are cleared.
 */
function clearFormContactsDropdown() {
  const dropdown = document.getElementById('dropdown-contacts');
  if (dropdown) dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
  selectedContacts = [];
  renderSelectedAvatars();
}

/**
 * Clears the subtasks array and re-renders the subtask area.
 * @returns {void} Nothing is returned after subtasks are removed and the create button state is refreshed.
 */
function clearFormSubtasks() {
  if (Array.isArray(subtasks)) subtasks.length = 0;
  showSubtasks();
  updateCreateButtonState();
}

/**
 * Resets the add-task form and clears all validation errors and selections.
 * @returns {void} Nothing is returned after the form, errors, contacts, and subtasks are reset.
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
