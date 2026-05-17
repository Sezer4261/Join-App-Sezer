/**
 * Opens edit task modal.
 * @param {string} id - Identifier.
 * @returns {Promise<*>} Result.
 */
async function openEditTaskModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  activeTask = task;
  editSubtasks = Array.isArray(task.subtasks) ? task.subtasks.map(st => ({ ...st })) : [];
  selectedContacts = Array.isArray(task.contacts) ? [...task.contacts] : [];
  window.editingEditSubtaskIndex = null;
  const modal = document.getElementById("task-modal");
  if (!modal) return;
  const modalContent = modal.querySelector(".modal-content");
  if (!modalContent) return;
  modalContent.innerHTML = generateEditTaskTemplate(task);
  applyTodayMinDateForEdit();
  initEditFormBlurValidation();
  await loadContacts();
  renderEditAssignedContacts();
  renderEditSubtasks();
  initEditDropdownClose();
  initEditSubtaskEnter();
}

/**
 * Initializes blur validation handlers for the edit form.
 * @returns {void} Result.
 */
function initEditFormBlurValidation() {
  const form = document.getElementById('edit-task-form');
  if (!form || form.dataset.blurValidationInit === '1') return;

  const titleInput = document.getElementById('edit-title');
  const dateInput = document.getElementById('edit-date');
  const categorySelect = document.getElementById('edit-category-select');

  titleInput?.addEventListener('blur', () => {
    validateEditRequiredInput(titleInput, 'edit-title-error');
  });
  dateInput?.addEventListener('blur', () => {
    validateEditDateField();
  });
  dateInput?.addEventListener('input', clearEditDateErrorOnValidInput);
  dateInput?.addEventListener('change', clearEditDateErrorOnValidInput);
  dateInput?.addEventListener('click', () => {
    try { dateInput.showPicker(); } catch (_) {}
  });
  categorySelect?.addEventListener('blur', () => {
    const categoryInput = document.getElementById('edit-category');
    validateEditRequiredInput(categoryInput, 'edit-category-error', categorySelect);
  });

  form.dataset.blurValidationInit = '1';
}

/**
 * Enables creating an edit-subtask via Enter key.
 * Prevents submitting the edit form.
 * @returns {void} Result.
 */
function initEditSubtaskEnter() {
  const input = document.getElementById('edit-subtask-input');
  if (!input) return;
  if (input.dataset && input.dataset.enterHandlerAdded === 'true') return;
  if (input.dataset) input.dataset.enterHandlerAdded = 'true';

  input.addEventListener('input', () => {
    setEditSubtaskError('');
  });

  input.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key !== 'Enter') return;
    if (event.shiftKey) return;
    event.preventDefault();
    event.stopPropagation();
    addEditSubtask();
  });
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
  if (label) {
    label.childNodes[0].textContent = value + " ";
  }
  const dropdown = document.getElementById("edit-category-dropdown");
  if (dropdown) dropdown.classList.remove("show");
}

/**
 * Initializes edit dropdown close.
 * @returns {void} Result.
 */
function initEditDropdownClose() {
  if (window.editDropdownHandlerAdded) return;
  window.editDropdownHandlerAdded = true;
  document.addEventListener(
    "click",
    (event) => {
      const selectContacts = document.getElementById("select-contacts");
      const contactsDropdown = document.getElementById("dropdown-contacts");
      const categorySelect = document.getElementById("edit-category-select");
      const categoryDropdown = document.getElementById("edit-category-dropdown");

      const target = event.target;
      const clickedInside =
        (selectContacts && selectContacts.contains(target)) ||
        (contactsDropdown && contactsDropdown.contains(target)) ||
        (categorySelect && categorySelect.contains(target)) ||
        (categoryDropdown && categoryDropdown.contains(target));

      if (clickedInside) return;

      if (contactsDropdown) contactsDropdown.classList.remove("show");
      if (categoryDropdown) categoryDropdown.classList.remove("show");
    },
    true
  );
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
