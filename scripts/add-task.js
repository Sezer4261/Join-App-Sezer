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
  dateInput?.addEventListener('blur', validateDateField);
  dateInput?.addEventListener('input', clearDateErrorOnValidInput);
  dateInput?.addEventListener('change', clearDateErrorOnValidInput);
  categorySelect?.addEventListener('blur', validateCategoryField);

  form.dataset.blurValidationInit = '1';
}

/**
 * Executes reset selected contacts logic.
 * @returns {void} Result.
 */
function resetSelectedContacts() {
  selectedContacts = [];
}

/**
 * Validates form.
 * @returns {void} Result.
 */
function validateForm() {
  clearValidationErrors();
  let isValid = true;
  isValid = validateTitleField() && isValid;
  isValid = validateDateField() && isValid;
  isValid = validateCategoryField() && isValid;
  return isValid;
}

/**
 * Clears validation errors.
 * @returns {void} Result.
 */
function clearValidationErrors() {
  setErrorText('title-error', '');
  setErrorText('date-error', '');
  setErrorText('category-error', '');
}

/**
 * Sets error text.
 * @param {string} id - Identifier.
 * @param {string} value - Value.
 * @returns {void} Result.
 */
function setErrorText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/**
 * Validates title field.
 * @returns {void} Result.
 */
function validateTitleField() {
  const input = document.getElementById('title');
  return validateRequiredInput(input, 'title-error');
}

/**
 * Clears title error while typing as soon as input is valid.
 * @returns {void} Result.
 */
function clearTitleErrorOnValidInput() {
  const input = document.getElementById('title');
  if (!input) return;
  if (!String(input.value || '').trim()) return;
  setErrorText('title-error', '');
  input.classList.remove('input-error');
}

/**
 * Validates date field.
 * @returns {void} Result.
 */
function validateDateField() {
  const input = document.getElementById('date');
  if (!validateRequiredInput(input, 'date-error')) {
    return false;
  }

  const today = getTodayDateString();
  const selectedDate = String(input.value || '').trim();
  if (selectedDate < today) {
    setErrorText('date-error', 'Please select a future date');
    input.classList.add('input-error');
    return false;
  }

  setErrorText('date-error', '');
  input.classList.remove('input-error');
  return true;
}

/**
 * Clears date error while typing as soon as input is valid and not in the past.
 * @returns {void} Result.
 */
function clearDateErrorOnValidInput() {
  const input = document.getElementById('date');
  if (!input) return;
  const selectedDate = String(input.value || '').trim();
  if (!selectedDate) return;
  if (selectedDate < getTodayDateString()) return;
  setErrorText('date-error', '');
  input.classList.remove('input-error');
}

/**
 * Applies today's date as minimum selectable due date.
 * @returns {void} Result.
 */
function applyTodayMinDate() {
  const dateInput = document.getElementById('date');
  if (!dateInput) return;
  dateInput.min = getTodayDateString();
}

/**
 * Returns today's local date in yyyy-mm-dd.
 * @returns {string} Result.
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates category field.
 * @returns {void} Result.
 */
function validateCategoryField() {
  const input = document.getElementById('category');
  const highlightEl = document.getElementById('category-select');
  return validateRequiredInput(input, 'category-error', highlightEl);
}

/**
 * Validates required input.
 * @param {HTMLElement} input - Input element.
 * @param {*} errorId - Parameter.
 * @returns {void} Result.
 */
function validateRequiredInput(input, errorId, highlightElement = input) {
  if (!input || !input.value.trim()) {
    setErrorText(errorId, 'This field is required');
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
  setTimeout(() => { window.location.href = "board.html"; }, 1500);
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
 * Executes select contacts logic.
 * @returns {void} Result.
 */
function selectContacts() {
  let select = document.getElementById('dropdown-contacts');
  select.innerHTML = generateAssignedContacts(contacts);
}

/**
 * Toggles dropdown.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function toggleDropdown(event) {
  if (event) {
    event.stopPropagation();
  }
  const trigger = event?.currentTarget || event?.target;
  const select = trigger?.closest?.(".custom-select");
  const dropdown = select?.querySelector?.(".dropdown-content");
  if (dropdown) {
    dropdown.classList.toggle("show");
    return;
  }
  const fallback = document.getElementById("dropdown-contacts");
  if (fallback) {
    fallback.classList.toggle("show");
  }
}

/**
 * Toggles add category dropdown.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function toggleAddCategoryDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById("category-dropdown");
  if (!dropdown) return;
  dropdown.classList.toggle("show");
}

/**
 * Sets add category.
 * @param {string} value - Value.
 * @returns {void} Result.
 */
function setAddCategory(value) {
  const input = document.getElementById("category");
  const select = document.getElementById("category-select");
  if (!input || !select) return;
  input.value = value;
  input.classList.remove('input-error');
  select.classList.remove('input-error');
  setErrorText('category-error', '');
  updateAddCategoryLabel(select, value);
  closeAddCategoryDropdown();
}

/**
 * Updates add category label.
 * @param {*} select - Parameter.
 * @param {string} value - Value.
 * @returns {void} Result.
 */
function updateAddCategoryLabel(select, value) {
  const label = select.querySelector("span");
  if (label) {
    label.childNodes[0].textContent = value + " ";
  }
}

/**
 * Closes add category dropdown.
 * @returns {void} Result.
 */
function closeAddCategoryDropdown() {
  const dropdown = document.getElementById("category-dropdown");
  if (dropdown) dropdown.classList.remove("show");
}

/**
 * Initializes add dropdown close.
 * @returns {void} Result.
 */
function initAddDropdownClose() {
  if (window.addDropdownHandlerAdded) return;
  window.addDropdownHandlerAdded = true;
  document.addEventListener(
    "click",
    (event) => {
      const selectContacts = document.getElementById("select-contacts");
      const contactsDropdown = document.getElementById("dropdown-contacts");
      const categorySelect = document.getElementById("category-select");
      const categoryDropdown = document.getElementById("category-dropdown");

      const target = event.target;
      const clickedInside =
        (selectContacts && selectContacts.contains(target)) ||
        (contactsDropdown && contactsDropdown.contains(target)) ||
        (categorySelect && categorySelect.contains(target)) ||
        (categoryDropdown && categoryDropdown.contains(target));

      if (clickedInside) return;
      closeAddDropdowns();
    },
    true
  );
}

/**
 * Closes add dropdowns.
 * @returns {void} Result.
 */
function closeAddDropdowns() {
  const contactsDropdown = document.getElementById("dropdown-contacts");
  if (contactsDropdown) contactsDropdown.classList.remove("show");
  const categoryDropdown = document.getElementById("category-dropdown");
  if (categoryDropdown) categoryDropdown.classList.remove("show");
}

/**
 * Toggles contact selection.
 * @param {string} name - Name.
 * @param {HTMLInputElement} checkbox - Checkbox element.
 * @returns {void} Result.
 */
function toggleContactSelection(name, checkbox) {
  if (checkbox.checked) {
    selectedContacts.push(name);
  } else {
    selectedContacts = selectedContacts.filter(c => c !== name);
  }
  renderSelectedAvatars();
}

/**
 * Renders selected avatars.
 * @returns {void} Result.
 */
function renderSelectedAvatars() {
  const container = document.getElementById("selected-avatars");
  const assignedBlock = document.querySelector('.assigned-to-label');
  if (assignedBlock) {
    assignedBlock.classList.toggle('has-avatars', selectedContacts.length > 0);
  }
  container.innerHTML = "";
  const maxVisible = 4;
  const total = selectedContacts.length;
  const visible = selectedContacts.slice(0, maxVisible);
  visible.forEach(name => appendSelectedAvatar(container, name));
  if (total > maxVisible) {
    container.innerHTML += getSelectedAvatarMoreMarkup(total - maxVisible);
  }
}

/**
 * Executes append selected avatar logic.
 * @param {HTMLElement} container - Container element.
 * @param {string} name - Name.
 * @returns {void} Result.
 */
function appendSelectedAvatar(container, name) {
  const initials = getContactInitialsFromName(name);
  const colorClass = getContactColorClass(name);
  container.innerHTML += getSelectedAvatarMarkup(initials, colorClass);
}

/**
 * Returns contact color class based on name.
 * @param {string} name - Contact name.
 * @returns {string} Result.
 */
function getContactColorClass(name) {
  const classes = [
    'bg-blue',
    'bg-green',
    'bg-purple',
    'bg-orange',
    'bg-pink',
    'bg-red',
    'bg-teal',
    'bg-brown'
  ];
  const key = String(name || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 2147483647;
  }
  const index = key ? Math.abs(hash) % classes.length : 0;
  return classes[index];
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
}
