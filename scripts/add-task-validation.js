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
 * @returns {boolean} Result.
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
 * @returns {boolean} Result.
 */
function validateCategoryField() {
  const input = document.getElementById('category');
  const highlightEl = document.getElementById('category-select');
  return validateRequiredInput(input, 'category-error', highlightEl);
}

/**
 * Validates required input.
 * @param {HTMLElement} input - Input element.
 * @param {string} errorId - Error element id.
 * @param {HTMLElement} highlightElement - Element to highlight (defaults to input).
 * @returns {boolean} Result.
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
