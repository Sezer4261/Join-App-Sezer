/** @file Validation for edit task modal fields. */

/**
 * Writes a validation message into an edit-form error element by id.
 * @param {string} id - DOM id of the error message container.
 * @param {string} value - Error text to display, or empty string to clear.
 * @returns {void}
 */
function setEditErrorText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/**
 * Clears all inline validation messages on the edit task form.
 * @returns {void}
 */
function clearEditValidationErrors() {
  setEditErrorText('edit-title-error', '');
  setEditErrorText('edit-date-error', '');
  setEditErrorText('edit-category-error', '');
}

/**
 * Ensures a required edit-form input has non-empty trimmed content.
 * @param {HTMLElement} input - Input element whose value is validated.
 * @param {string} errorId - DOM id of the error message container for this field.
 * @param {HTMLElement} [highlightElement=input] - Element receiving the input-error class.
 * @returns {boolean} True when the field contains a non-empty value.
 */
function validateEditRequiredInput(input, errorId, highlightElement = input) {
  const value = input ? String(input.value ?? '').trim() : '';
  if (!input || !value) {
    setEditErrorText(errorId, 'This field is required');
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

/**
 * Sets the edit due-date input minimum to today's date in local format.
 * @returns {void}
 */
function applyTodayMinDateForEdit() {
  const dateInput = document.getElementById('edit-date');
  if (!dateInput) return;
  dateInput.min = getTodayDateString();
}

/**
 * Validates that the edit due-date field is present and not in the past.
 * @returns {boolean} True when the selected date is today or later.
 */
function validateEditDateField() {
  const input = document.getElementById('edit-date');
  if (!validateEditRequiredInput(input, 'edit-date-error')) return false;
  const today = getTodayDateString();
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
 * Clears the due-date error while the user types a valid future date.
 * @returns {void}
 */
function clearEditDateErrorOnValidInput() {
  const input = document.getElementById('edit-date');
  if (!input) return;
  const selectedDate = String(input.value || '').trim();
  if (!selectedDate) return;
  if (selectedDate < getTodayDateString()) return;
  setEditErrorText('edit-date-error', '');
  input.classList.remove('input-error');
}

/**
 * Scrolls the edit form so the given field or error message is visible.
 * @param {HTMLElement|null} target - Element to bring into view inside the form.
 * @returns {void}
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
 * Runs field validators and collects descriptors for every invalid edit input.
 * @returns {Array<{errorId: string, focusEl: HTMLElement}>} Invalid fields in validation order.
 */
function collectEditFormErrors() {
  const titleInput = document.getElementById('edit-title');
  const dateInput = document.getElementById('edit-date');
  const categoryInput = document.getElementById('edit-category');
  const categorySelect = document.getElementById('edit-category-select');
  const invalid = [];
  if (!validateEditRequiredInput(titleInput, 'edit-title-error'))
    invalid.push({ errorId: 'edit-title-error', focusEl: titleInput });
  if (!validateEditDateField())
    invalid.push({ errorId: 'edit-date-error', focusEl: dateInput });
  if (!validateEditRequiredInput(categoryInput, 'edit-category-error', categorySelect))
    invalid.push({ errorId: 'edit-category-error', focusEl: categorySelect });
  return invalid;
}

/**
 * Validates the full edit form and scrolls focus to the first failing field.
 * @returns {boolean} True when every edit-form field passes validation.
 */
function validateEditForm() {
  clearEditValidationErrors();
  const invalid = collectEditFormErrors();
  if (invalid.length === 0) return true;
  const first = invalid[0];
  const errorEl = document.getElementById(first.errorId);
  scrollEditFormTo(errorEl || first.focusEl);
  try { first.focusEl?.focus?.(); } catch (e) { /* ignore */ }
  return false;
}
