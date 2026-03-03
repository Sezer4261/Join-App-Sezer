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
  await loadContacts();
  renderEditAssignedContacts();
  renderEditSubtasks();
  initEditDropdownClose();
  initEditSubtaskEnter();
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
 * Sets edit error text.
 * @param {string} id - Identifier.
 * @param {string} value - Value.
 * @returns {void} Result.
 */
function setEditErrorText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/**
 * Clears edit validation errors.
 * @returns {void} Result.
 */
function clearEditValidationErrors() {
  setEditErrorText('edit-title-error', '');
  setEditErrorText('edit-date-error', '');
  setEditErrorText('edit-category-error', '');
}

/**
 * Validates required input in edit form.
 * @param {HTMLElement} input - Input element.
 * @param {string} errorId - Error element id.
 * @param {HTMLElement} highlightElement - Element to highlight (defaults to input).
 * @returns {boolean} Result.
 */
function validateEditRequiredInput(input, errorId, highlightElement = input) {
  const value = input ? String(input.value ?? '').trim() : '';
  if (!input || !value) {
    setEditErrorText(errorId, 'This field is required');
    input?.classList.add('input-error');
    if (highlightElement && highlightElement !== input) {
      highlightElement.classList.add('input-error');
    }
    return false;
  }
  input.classList.remove('input-error');
  if (highlightElement && highlightElement !== input) {
    highlightElement.classList.remove('input-error');
  }
  return true;
}

/**
 * Scrolls edit form to the given element (inside overflow container).
 * @param {HTMLElement|null} target - Target element.
 * @returns {void} Result.
 */
function scrollEditFormTo(target) {
  if (!target) return;
  const scrollContainer = document.querySelector('#edit-task-form .edit-form-scroll');
  if (!scrollContainer) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const containerRect = scrollContainer.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const offsetTop = targetRect.top - containerRect.top + scrollContainer.scrollTop - 16;
  scrollContainer.scrollTo({ top: offsetTop, behavior: 'smooth' });
}

/**
 * Validates edit form.
 * @returns {boolean} Result.
 */
function validateEditForm() {
  clearEditValidationErrors();
  const titleInput = document.getElementById('edit-title');
  const dateInput = document.getElementById('edit-date');
  const categoryInput = document.getElementById('edit-category');
  const categorySelect = document.getElementById('edit-category-select');

  const invalid = [];

  if (!validateEditRequiredInput(titleInput, 'edit-title-error')) {
    invalid.push({ errorId: 'edit-title-error', focusEl: titleInput });
  }

  if (!validateEditRequiredInput(dateInput, 'edit-date-error')) {
    invalid.push({ errorId: 'edit-date-error', focusEl: dateInput });
  }

  if (!validateEditRequiredInput(categoryInput, 'edit-category-error', categorySelect)) {
    invalid.push({ errorId: 'edit-category-error', focusEl: categorySelect });
  }

  if (invalid.length > 0) {
    const first = invalid[0];
    const errorEl = document.getElementById(first.errorId);
    scrollEditFormTo(errorEl || first.focusEl);
    try {
      first.focusEl?.focus?.();
    } catch (e) {
      // ignore focus errors
    }
    return false;
  }

  return true;
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
 * Renders edit subtasks.
 * @returns {void} Result.
 */
function renderEditSubtasks() {
  const area = document.getElementById("edit-subtask-area");
  if (!area) return;
  area.innerHTML = "";
  editSubtasks.forEach((st, i) => appendEditSubtask(area, st, i));
}

/**
 * Executes append edit subtask logic.
 * @param {*} area - Parameter.
 * @param {Object} subtask - Subtask object.
 * @param {number} index - Index.
 * @returns {void} Result.
 */
function appendEditSubtask(area, subtask, index) {
  const isEditing = window.editingEditSubtaskIndex === index;
  const markup = isEditing
    ? getEditSubtaskEditMarkup(subtask, index)
    : getEditSubtaskItemMarkup(subtask, index);
  area.innerHTML += markup;
}

/**
 * Adds edit subtask.
 * @returns {void} Result.
 */
function addEditSubtask() {
  const input = document.getElementById("edit-subtask-input");
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;
  editSubtasks.push({ title: value, done: false });
  input.value = "";
  renderEditSubtasks();
}

/**
 * Deletes edit subtask.
 * @param {number} i - Index.
 * @returns {void} Result.
 */
function deleteEditSubtask(i) {
  editSubtasks.splice(i, 1);
  if (window.editingEditSubtaskIndex === i) {
    window.editingEditSubtaskIndex = null;
  } else if (typeof window.editingEditSubtaskIndex === "number" && i < window.editingEditSubtaskIndex) {
    window.editingEditSubtaskIndex -= 1;
  }
  renderEditSubtasks();
}

/**
 * Clears edit subtask input.
 * @returns {void} Result.
 */
function clearEditSubtaskInput() {
  const input = document.getElementById("edit-subtask-input");
  if (!input) return;
  input.value = "";
  input.focus();
}

/**
 * Executes edit edit subtask logic.
 * @param {number} i - Index.
 * @returns {void} Result.
 */
function editEditSubtask(i) {
  window.editingEditSubtaskIndex = i;
  renderEditSubtasks();
  const input = document.getElementById(`edit-subtask-edit-${i}`);
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

/**
 * Saves edited edit subtask.
 * @param {number} i - Index.
 * @returns {void} Result.
 */
function saveEditedEditSubtask(i) {
  const input = document.getElementById(`edit-subtask-edit-${i}`);
  if (!input) return;
  const value = input.value.trim();
  if (!value) {
    alert("Bitte eine Subtask beschreiben!");
    return;
  }
  editSubtasks[i].title = value;
  window.editingEditSubtaskIndex = null;
  renderEditSubtasks();
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
