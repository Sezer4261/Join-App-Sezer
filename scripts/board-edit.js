/**
 * Opens edit task modal.
 * @param {string} id - Identifier.
 * @returns {Promise<*>} Result.
 */
/**
 * Sets up the edit modal content from task data.
 * @param {Object} task - Task object.
 * @returns {void} Result.
 */
function setupEditModalContent(task) {
  editSubtasks = Array.isArray(task.subtasks) ? task.subtasks.map(st => ({ ...st })) : [];
  selectedContacts = Array.isArray(task.contacts) ? [...task.contacts] : [];
  window.editingEditSubtaskIndex = null;
}

/**
 * Initializes all handlers after loading the edit form.
 * @returns {Promise<void>} Result.
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
 * Initializes blur validation handlers for the edit form.
 * @returns {void} Result.
 */
/**
 * Binds all blur/change listeners for the edit form fields.
 * @param {HTMLElement} titleInput - Title input.
 * @param {HTMLElement} dateInput - Date input.
 * @param {HTMLElement} categorySelect - Category select.
 * @returns {void} Result.
 */
function bindEditFormFieldListeners(titleInput, dateInput, categorySelect) {
  titleInput?.addEventListener('blur', () => validateEditRequiredInput(titleInput, 'edit-title-error'));
  dateInput?.addEventListener('blur', () => validateEditDateField());
  dateInput?.addEventListener('input', clearEditDateErrorOnValidInput);
  dateInput?.addEventListener('change', clearEditDateErrorOnValidInput);
  dateInput?.addEventListener('click', () => { try { dateInput.showPicker(); } catch (_) {} });
  categorySelect?.addEventListener('blur', () => {
    validateEditRequiredInput(document.getElementById('edit-category'), 'edit-category-error', categorySelect);
  });
}

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
 * Enables creating an edit-subtask via Enter key.
 * Prevents submitting the edit form.
 * @returns {void} Result.
 */
/**
 * Binds keydown handler for the subtask input.
 * @param {HTMLElement} input - Subtask input element.
 * @returns {void} Result.
 */
function bindEditSubtaskKeydownHandler(input) {
  input.addEventListener('input', () => setEditSubtaskError(''));
  input.addEventListener('keydown', (event) => {
    if (event.isComposing || event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    event.stopPropagation();
    addEditSubtask();
  });
}

function initEditSubtaskEnter() {
  const input = document.getElementById('edit-subtask-input');
  if (!input) return;
  if (input.dataset && input.dataset.enterHandlerAdded === 'true') return;
  if (input.dataset) input.dataset.enterHandlerAdded = 'true';
  bindEditSubtaskKeydownHandler(input);
}

/**
 * Renders edit assigned contacts.
 * @returns {void} Result.
 */
function renderEditAssignedContacts() {
  const dropdown = document.getElementById("dropdown-contacts");
  if (!dropdown) return;
  dropdown.innerHTML = generateAssignedContacts(contacts);
  renderSelectedAvatars();
}

/**
 * Toggles edit category dropdown.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function toggleEditCategoryDropdown(event) {
  event.stopPropagation();
  // Close other dropdowns first
  const contactsDropdown = document.getElementById("dropdown-contacts");
  if (contactsDropdown) contactsDropdown.classList.remove("show");
  
  const dropdown = document.getElementById("edit-category-dropdown");
  if (!dropdown) return;
  dropdown.classList.toggle("show");
}

/**
 * Sets edit category.
 * @param {string} value - Value.
 * @returns {void} Result.
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
 * Initializes edit dropdown close.
 * @returns {void} Result.
 */
/**
 * Handles outside-click to close edit form dropdowns.
 * @param {Event} event - Click event.
 * @returns {void} Result.
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

function initEditDropdownClose() {
  if (window.editDropdownHandlerAdded) return;
  window.editDropdownHandlerAdded = true;
  document.addEventListener("click", handleEditDropdownOutsideClick, true);
}

/**
 * Saves edited task.
 * @param {Event} event - Browser event.
 * @param {string} id - Identifier.
 * @returns {Promise<*>} Result.
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
 * Updates task from edit form.
 * @param {Object} task - Task object.
 * @returns {void} Result.
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
