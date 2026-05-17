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
 * Applies today's date as minimum selectable due date for edit form.
 * @returns {void} Result.
 */
function applyTodayMinDateForEdit() {
  const dateInput = document.getElementById('edit-date');
  if (!dateInput) return;
  dateInput.min = getTodayDateStringForEdit();
}

/**
 * Returns today's local date in yyyy-mm-dd for edit form.
 * @returns {string} Result.
 */
function getTodayDateStringForEdit() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates edit due date field.
 * @returns {boolean} Result.
 */
function validateEditDateField() {
  const input = document.getElementById('edit-date');
  if (!validateEditRequiredInput(input, 'edit-date-error')) {
    return false;
  }

  const today = getTodayDateStringForEdit();
  const selectedDate = String(input.value || '').trim();
  if (selectedDate < today) {
    setEditErrorText('edit-date-error', 'Please select a future date');
    input.classList.add('input-error');
    return false;
  }

  setEditErrorText('edit-date-error', '');
  input.classList.remove('input-error');
  return true;
}

/**
 * Clears edit date error while typing as soon as input is valid and not in the past.
 * @returns {void} Result.
 */
function clearEditDateErrorOnValidInput() {
  const input = document.getElementById('edit-date');
  if (!input) return;
  const selectedDate = String(input.value || '').trim();
  if (!selectedDate) return;
  if (selectedDate < getTodayDateStringForEdit()) return;
  setEditErrorText('edit-date-error', '');
  input.classList.remove('input-error');
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

  if (!validateEditDateField()) {
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
