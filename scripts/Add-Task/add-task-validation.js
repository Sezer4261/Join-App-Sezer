/** @file Form validation for the add-task page. */

/**
 * Validates all required add-task form fields and clears previous errors first.
 * @returns {boolean} True when every required field passes validation, otherwise false.
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
 * Clears validation error messages for all required fields.
 * @returns {void} Nothing is returned after the error elements are emptied.
 */
function clearValidationErrors() {
  setErrorText('title-error', '');
  setErrorText('date-error', '');
  setErrorText('category-error', '');
}

/**
 * Sets the text content of a validation error element.
 * @param {string} id - DOM id of the error message element to update.
 * @param {string} value - Error message text to display, or an empty string to clear it.
 * @returns {void} Nothing is returned after the error text is written.
 */
function setErrorText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/**
 * Validates the add-task title field against the required-input rule.
 * @returns {boolean} True when the title field contains a non-empty trimmed value, otherwise false.
 */
function validateTitleField() {
  const input = document.getElementById('title');
  return validateRequiredInput(input, 'title-error');
}

/**
 * Clears the title error while typing as soon as the input becomes valid.
 * @returns {void} Nothing is returned after the error state is cleared or left unchanged.
 */
function clearTitleErrorOnValidInput() {
  const input = document.getElementById('title');
  if (!input) return;
  if (!String(input.value || '').trim()) return;
  setErrorText('title-error', '');
  input.classList.remove('input-error');
}

/**
 * Validates the add-task due date field for presence and a non-past value.
 * @returns {boolean} True when the date is present and not before today, otherwise false.
 */
function validateDateField() {
  const input = document.getElementById('date');
  if (!validateRequiredInput(input, 'date-error')) return false;
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
 * Clears the date error while typing as soon as the input is valid and not in the past.
 * @returns {void} Nothing is returned after the error state is cleared or left unchanged.
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
 * Applies today's date as the minimum selectable due date on the date input.
 * @returns {void} Nothing is returned after the min attribute is set.
 */
function applyTodayMinDate() {
  const dateInput = document.getElementById('date');
  if (!dateInput) return;
  dateInput.min = getTodayDateString();
}

/**
 * Returns today's local date formatted for HTML date inputs.
 * @returns {string} Today's date as a yyyy-mm-dd string in the local timezone.
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates the add-task category field against the required-input rule.
 * @returns {boolean} True when a category has been selected, otherwise false.
 */
function validateCategoryField() {
  const input = document.getElementById('category');
  const highlightEl = document.getElementById('category-select');
  return validateRequiredInput(input, 'category-error', highlightEl);
}

/**
 * Validates that a required input has a non-empty trimmed value.
 * @param {HTMLElement} input - Form input element whose value is checked.
 * @param {string} errorId - DOM id of the error message element to update on failure.
 * @param {HTMLElement} [highlightElement=input] - Element that receives the input-error class when validation fails.
 * @returns {boolean} True when the input contains a non-empty trimmed value, otherwise false.
 */
function validateRequiredInput(input, errorId, highlightElement = input) {
  if (!input || !input.value.trim()) {
    setErrorText(errorId, 'This field is required');
    input?.classList.add('input-error');
    if (highlightElement && highlightElement !== input)
      highlightElement.classList.add('input-error');
    return false;
  }
  input.classList.remove('input-error');
  if (highlightElement && highlightElement !== input)
    highlightElement.classList.remove('input-error');
  return true;
}
