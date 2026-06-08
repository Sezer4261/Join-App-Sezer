/** @file Edit task modal open, save, and delete handling. */

/**
 * Copies subtasks and contacts from the task into edit-modal working state.
 * @param {Object} task - Task being edited whose lists seed the form state.
 * @returns {void}
 */
function setupEditModalContent(task) {
  editSubtasks = Array.isArray(task.subtasks) ? task.subtasks.map(st => ({ ...st })) : [];
  selectedContacts = Array.isArray(task.contacts) ? [...task.contacts] : [];
  window.editingEditSubtaskIndex = null;
}

/**
 * Initializes validation, contacts, subtasks, and dropdown handlers for the edit form.
 * @returns {Promise<void>} Resolves after contacts load and UI wiring complete.
 */
async function initEditModalHandlers() {
  applyTodayMinDateForEdit();
  initEditFormBlurValidation();
  await loadContacts();
  renderEditAssignedContacts();
  renderEditSubtasks();
  initEditDropdownClose();
  initEditSubtaskEnter();
}

/**
 * Replaces the open modal content with the edit form for the given task.
 * @param {string} id - Identifier of the task to edit.
 * @returns {Promise<void>} Resolves after the edit form is rendered and initialized.
 */
async function openEditTaskModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  activeTask = task;
  setupEditModalContent(task);
  const modal = document.getElementById("task-modal");
  if (!modal) return;
  const modalContent = modal.querySelector(".modal-content");
  if (!modalContent) return;
  modalContent.innerHTML = generateEditTaskTemplate(task);
  await initEditModalHandlers();
}

/**
 * Validates the edit title field when it loses focus.
 * @param {HTMLElement} titleInput - Title input element to validate.
 * @returns {void}
 */
function handleEditTitleBlur(titleInput) {
  validateEditRequiredInput(titleInput, 'edit-title-error');
}

/**
 * Opens the native date picker when supported on the edit due-date input.
 * @param {HTMLElement} dateInput - Due-date input element to open the picker for.
 * @returns {void}
 */
function handleEditDatePickerClick(dateInput) {
  try { dateInput.showPicker(); } catch (_) {}
}

/**
 * Validates the hidden category value when the category select loses focus.
 * @param {HTMLElement} categorySelect - Visible category dropdown trigger element.
 * @returns {void}
 */
function handleEditCategoryBlur(categorySelect) {
  validateEditRequiredInput(document.getElementById('edit-category'), 'edit-category-error', categorySelect);
}

/**
 * Clears the subtask input error message while the user types.
 * @returns {void}
 */
function handleEditSubtaskInputInput() {
  setEditSubtaskError('');
}

/**
 * Adds a new subtask when Enter is pressed in the subtask input.
 * @param {KeyboardEvent} event - Keydown event on the subtask input.
 * @returns {void}
 */
function handleEditSubtaskKeydown(event) {
  if (event.isComposing || event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  event.stopPropagation();
  addEditSubtask();
}

/**
 * Binds blur, input, and picker listeners for the main edit form fields.
 * @param {HTMLElement} titleInput - Title input element.
 * @param {HTMLElement} dateInput - Due-date input element.
 * @param {HTMLElement} categorySelect - Category dropdown trigger element.
 * @returns {void}
 */
function bindEditFormFieldListeners(titleInput, dateInput, categorySelect) {
  titleInput?.addEventListener('blur', () => handleEditTitleBlur(titleInput));
  dateInput?.addEventListener('blur', () => validateEditDateField());
  dateInput?.addEventListener('input', clearEditDateErrorOnValidInput);
  dateInput?.addEventListener('change', clearEditDateErrorOnValidInput);
  dateInput?.addEventListener('click', () => handleEditDatePickerClick(dateInput));
  categorySelect?.addEventListener('blur', () => handleEditCategoryBlur(categorySelect));
}

/**
 * Registers blur validation handlers on the edit form exactly once.
 * @returns {void}
 */
function initEditFormBlurValidation() {
  const form = document.getElementById('edit-task-form');
  if (!form || form.dataset.blurValidationInit === '1') return;
  bindEditFormFieldListeners(
    document.getElementById('edit-title'),
    document.getElementById('edit-date'),
    document.getElementById('edit-category-select')
  );
  form.dataset.blurValidationInit = '1';
}

/**
 * Wires input and Enter-key handlers on the new-subtask input field.
 * @param {HTMLElement} input - Subtask text input element.
 * @returns {void}
 */
function bindEditSubtaskKeydownHandler(input) {
  input.addEventListener('input', handleEditSubtaskInputInput);
  input.addEventListener('keydown', handleEditSubtaskKeydown);
}

/**
 * Enables creating edit subtasks via Enter key on the subtask input.
 * @returns {void}
 */
function initEditSubtaskEnter() {
  const input = document.getElementById('edit-subtask-input');
  if (!input) return;
  if (input.dataset && input.dataset.enterHandlerAdded === 'true') return;
  if (input.dataset) input.dataset.enterHandlerAdded = 'true';
  bindEditSubtaskKeydownHandler(input);
}

/**
 * Rebuilds the assigned-contacts dropdown and selected avatar chips in the edit form.
 * @returns {void}
 */
function renderEditAssignedContacts() {
  const dropdown = document.getElementById("dropdown-contacts");
  if (!dropdown) return;
  dropdown.innerHTML = generateAssignedContacts(contacts);
  renderSelectedAvatars();
}

/**
 * Opens the edit category dropdown and closes the contacts dropdown.
 * @param {Event} event - Click event on the category select trigger.
 * @returns {void}
 */
function toggleEditCategoryDropdown(event) {
  event.stopPropagation();
  const contactsDropdown = document.getElementById("dropdown-contacts");
  if (contactsDropdown) contactsDropdown.classList.remove("show");
  
  const dropdown = document.getElementById("edit-category-dropdown");
  if (!dropdown) return;
  dropdown.classList.toggle("show");
}

/**
 * Sets the selected category value and updates the visible select label.
 * @param {string} value - Category label chosen from the dropdown.
 * @returns {void}
 */
function setEditCategory(value) {
  const input = document.getElementById("edit-category");
  const select = document.getElementById("edit-category-select");
  if (!input || !select) return;
  input.value = value;
  input.classList.remove('input-error');
  select.classList.remove('input-error');
  setEditErrorText('edit-category-error', '');
  const label = select.querySelector("span");
  if (label) label.childNodes[0].textContent = value + " ";
  document.getElementById("edit-category-dropdown")?.classList.remove("show");
}

/**
 * Closes edit form dropdowns when the user clicks outside their triggers.
 * @param {Event} event - Document click event used for outside-click detection.
 * @returns {void}
 */
function handleEditDropdownOutsideClick(event) {
  const target = event.target;
  const selectContacts = document.getElementById("select-contacts");
  const contactsDropdown = document.getElementById("dropdown-contacts");
  const categorySelect = document.getElementById("edit-category-select");
  const categoryDropdown = document.getElementById("edit-category-dropdown");
  const clickedInside =
    selectContacts?.contains(target) || contactsDropdown?.contains(target) ||
    categorySelect?.contains(target) || categoryDropdown?.contains(target);
  if (clickedInside) return;
  contactsDropdown?.classList.remove("show");
  categoryDropdown?.classList.remove("show");
}

/**
 * Registers a single document listener that closes edit dropdowns on outside click.
 * @returns {void}
 */
function initEditDropdownClose() {
  if (window.editDropdownHandlerAdded) return;
  window.editDropdownHandlerAdded = true;
  document.addEventListener("click", handleEditDropdownOutsideClick, true);
}

/**
 * Validates, saves edited task fields to Firebase, and reopens the detail modal.
 * @param {Event} event - Form submit event to cancel default navigation.
 * @param {string} id - Identifier of the task being saved.
 * @returns {Promise<void>} Resolves after persistence and UI refresh.
 */
async function saveEditedTask(event, id) {
  event.preventDefault();
  if (!validateEditForm()) return;
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  updateTaskFromEditForm(task);
  await updateTask(task);
  renderBoard();
  openModal(id);
}

/**
 * Copies current edit form field values into the in-memory task object.
 * @param {Object} task - Task object receiving updated field values from the form.
 * @returns {void}
 */
function updateTaskFromEditForm(task) {
  const titleEl = document.getElementById("edit-title");
  const descEl = document.getElementById("edit-description");
  task.title = titleEl ? titleEl.value.trim() : "";
  task.description = descEl ? descEl.value.trim() : "";
  task.dueDate = document.getElementById("edit-date").value;
  task.category = document.getElementById("edit-category").value;
  task.priority = document.querySelector('input[name="edit-priority"]:checked').value;
  task.contacts = [...selectedContacts];
  task.subtasks = editSubtasks.map(st => ({ ...st }));
}
