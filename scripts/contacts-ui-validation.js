let contactDialogFieldErrors = {};

const ADD_CONTACT_FIELD_IDS = ['ac-name', 'ac-email', 'ac-phone'];
const EDIT_CONTACT_FIELD_IDS = ['edit-name', 'edit-email', 'edit-phone'];

/**
 * Returns the error span id for a given input id.
 * @param {string} fieldId - Input id.
 * @returns {string} Span id.
 */
function getContactErrorSpanId(fieldId) {
  return `${fieldId}-error`;
}

/**
 * Sets inline error text.
 * @param {string} spanId - Span id.
 * @param {string} value - Text.
 * @returns {void} Result.
 */
function setContactErrorText(spanId, value) {
  const el = document.getElementById(spanId);
  if (el) el.textContent = value;
}

/**
 * Applies inline validation state to a contact dialog field.
 * @param {string} fieldId - Input id.
 * @param {HTMLElement|null} input - Input element.
 * @param {string} message - Error message (empty to clear).
 * @returns {void} Result.
 */
function applyContactFieldError(fieldId, input, spanId, message) {
  contactDialogFieldErrors[fieldId] = message;
  input?.classList.add('input-error');
  input?.closest('.ac-field')?.classList.add('input-error');
  setContactErrorText(spanId, message);
}
/**
 * Clears an inline validation error for a contact dialog field.
 * @param {string} fieldId - Field id.
 * @param {HTMLElement|null} input - Input element.
 * @param {string} spanId - Error span id.
 * @returns {void} Result.
 */
function clearContactFieldError(fieldId, input, spanId) {
  delete contactDialogFieldErrors[fieldId];
  input?.classList.remove('input-error');
  input?.closest('.ac-field')?.classList.remove('input-error');
  setContactErrorText(spanId, '');
}
function applyContactInlineValidation(fieldId, input, message) {
  const spanId = getContactErrorSpanId(fieldId);
  if (message) { applyContactFieldError(fieldId, input, spanId, message); return; }
  clearContactFieldError(fieldId, input, spanId);
}

/**
 * Clears all inline error messages for the given field ids.
 * @param {string[]} fieldIds - Field ids.
 * @returns {void} Result.
 */
function clearAllContactInlineErrors(fieldIds) {
  (fieldIds || []).forEach((id) => {
    const input = document.getElementById(id);
    applyContactInlineValidation(id, input, '');
  });
}

/**
 * Shows only the focused field's error message (signup behavior).
 * @param {string} fieldId - Field id.
 * @param {string[]} fieldIds - All field ids of the dialog.
 * @returns {void} Result.
 */
function showContactFieldErrorMessage(fieldId, fieldIds) {
  (fieldIds || []).forEach((id) => setContactErrorText(getContactErrorSpanId(id), ''));
  const message = contactDialogFieldErrors[fieldId];
  if (message) {
    setContactErrorText(getContactErrorSpanId(fieldId), message);
  }
}

/**
 * Validates a contact dialog field.
 * @param {string} fieldId - Field id.
 * @param {string} value - Raw value.
 * @returns {{ isValid: boolean, normalizedValue?: string, error: string }} Result.
 */
function validateContactDialogField(fieldId, value) {
  if (fieldId === 'ac-name' || fieldId === 'edit-name') {
    const c = validateContactNameInput(value);
    return { isValid: c.isValid, normalizedValue: c.normalizedName, error: c.error };
  }
  if (fieldId === 'ac-email' || fieldId === 'edit-email') {
    const c = validateEmailLikeSignup(value);
    return { isValid: c.isValid, normalizedValue: c.normalizedEmail, error: c.error };
  }
  if (fieldId === 'ac-phone' || fieldId === 'edit-phone') {
    const c = validateContactPhoneNumber(value);
    return { isValid: c.isValid, normalizedValue: c.normalizedPhone, error: c.error };
  }
  return { isValid: true, normalizedValue: value, error: '' };
}

/**
 * Validates a field on blur and updates the inline message.
 * @param {string} fieldId - Field id.
 * @returns {void} Result.
 */
function validateContactDialogFieldOnBlur(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  const check = validateContactDialogField(fieldId, input.value ?? '');
  applyContactInlineValidation(fieldId, input, check.isValid ? '' : (check.error || 'Invalid input.'));
  if (check.isValid && typeof check.normalizedValue === 'string') {
    input.value = check.normalizedValue;
  }
}

/**
 * Clears an existing error once the field becomes valid again.
 * @param {string} fieldId - Field id.
 * @returns {void} Result.
 */
function clearContactDialogFieldErrorIfResolved(fieldId) {
  if (!contactDialogFieldErrors[fieldId]) return;
  const input = document.getElementById(fieldId);
  if (!input) return;
  const check = validateContactDialogField(fieldId, input.value ?? '');
  if (check.isValid) {
    applyContactInlineValidation(fieldId, input, '');
  }
}

/**
 * Shows the first submit error like signup: highlight + message + focus.
 * @param {string} fieldId - Field id.
 * @param {string} message - Message.
 * @param {string[]} allFieldIds - Dialog field ids.
 * @returns {void} Result.
 */
function showContactSubmitError(fieldId, message, allFieldIds) {
  clearAllContactInlineErrors(allFieldIds);
  const input = document.getElementById(fieldId);
  applyContactInlineValidation(fieldId, input, message || 'Invalid input.');
  input?.focus();
}

/**
 * Updates add contact submit state.
 * @param {HTMLElement} dialog - Dialog element.
 * @returns {void} Result.
 */
function applyContactFieldValidity(input, check) {
  if (input && typeof input.setCustomValidity === 'function') {
    input.setCustomValidity(check.isValid ? '' : check.error);
  }
  return check.isValid;
}
/**
 * Validates all add-contact dialog fields and updates their custom validity.
 * @param {HTMLElement} dialog - Dialog element.
 * @returns {boolean} Whether all fields are valid.
 */
function computeAddContactValidity(dialog) {
  const n = dialog.querySelector('#ac-name');
  const e = dialog.querySelector('#ac-email');
  const p = dialog.querySelector('#ac-phone');
  const nc = validateContactNameInput(n?.value ?? '');
  const ec = validateEmailLikeSignup(e?.value ?? '');
  const pc = validateContactPhoneNumber(p?.value ?? '');
  return applyContactFieldValidity(n, nc) & applyContactFieldValidity(e, ec) & applyContactFieldValidity(p, pc);
}
function updateAddContactSubmitState(dialog) {
  if (!dialog) return;
  const submitBtn = dialog.querySelector('[data-ac-submit]');
  if (!submitBtn) return;
  const isValid = !!computeAddContactValidity(dialog);
  submitBtn.disabled = !isValid;
  submitBtn.setAttribute('aria-disabled', String(!isValid));
}

/**
 * Initializes add contact dialog validation.
 * @param {HTMLElement} dialog - Dialog element.
 * @returns {void} Result.
 */
function bindContactFieldListeners(field, fieldIds, handler) {
  field.addEventListener('focus', () => showContactFieldErrorMessage(field.id, fieldIds));
  field.addEventListener('input', () => { clearContactDialogFieldErrorIfResolved(field.id); handler(); });
  field.addEventListener('change', () => { clearContactDialogFieldErrorIfResolved(field.id); handler(); });
  field.addEventListener('blur', () => { validateContactDialogFieldOnBlur(field.id); handler(); });
}
function initAddContactDialogValidation(dialog) {
  if (!dialog || dialog.dataset.acValidationInit === '1') return;
  const handler = () => updateAddContactSubmitState(dialog);
  ADD_CONTACT_FIELD_IDS.map((id) => dialog.querySelector(`#${id}`)).filter(Boolean)
    .forEach((field) => bindContactFieldListeners(field, ADD_CONTACT_FIELD_IDS, handler));
  bindContactValidationReset(dialog, handler, '#add-contact-form', ADD_CONTACT_FIELD_IDS);
  dialog.dataset.acValidationInit = '1';
  handler();
}

/**
 * Executes bind contact validation reset logic.
 * @param {HTMLElement} dialog - Dialog element.
 * @param {Function} handler - Handler.
 * @param {string} formSelector - Form selector.
 * @param {string[]} fieldIds - Dialog field ids.
 * @returns {void} Result.
 */
function bindContactValidationReset(dialog, handler, formSelector, fieldIds) {
  const form = dialog.querySelector(formSelector);
  if (!form) return;
  form.addEventListener('reset', () => {
    contactDialogFieldErrors = {};
    clearAllContactInlineErrors(fieldIds);
    setTimeout(handler, 0);
  });
}

/**
 * Updates edit contact submit state.
 * @param {HTMLElement} dialog - Dialog element.
 * @returns {void} Result.
 */
/**
 * Validates all edit-contact dialog fields and updates their custom validity.
 * @param {HTMLElement} dialog - Dialog element.
 * @returns {boolean} Whether all fields are valid.
 */
function computeEditContactValidity(dialog) {
  const n = dialog.querySelector('#edit-name');
  const e = dialog.querySelector('#edit-email');
  const p = dialog.querySelector('#edit-phone');
  const nc = validateContactNameInput(n?.value ?? '');
  const ec = validateEmailLikeSignup(e?.value ?? '');
  const pc = validateContactPhoneNumber(p?.value ?? '');
  return applyContactFieldValidity(n, nc) & applyContactFieldValidity(e, ec) & applyContactFieldValidity(p, pc);
}
function updateEditContactSubmitState(dialog) {
  if (!dialog) return;
  const submitBtn = dialog.querySelector('[data-edit-submit]');
  if (!submitBtn) return;
  const isValid = !!computeEditContactValidity(dialog);
  submitBtn.disabled = !isValid;
  submitBtn.setAttribute('aria-disabled', String(!isValid));
}

/**
 * Initializes edit contact dialog validation.
 * @param {HTMLElement} dialog - Dialog element.
 * @returns {void} Result.
 */
function initEditContactDialogValidation(dialog) {
  if (!dialog || dialog.dataset.editValidationInit === '1') return;
  const handler = () => updateEditContactSubmitState(dialog);
  EDIT_CONTACT_FIELD_IDS.map((id) => dialog.querySelector(`#${id}`)).filter(Boolean)
    .forEach((field) => bindContactFieldListeners(field, EDIT_CONTACT_FIELD_IDS, handler));
  bindContactValidationReset(dialog, handler, '#edit-contact-form', EDIT_CONTACT_FIELD_IDS);
  dialog.dataset.editValidationInit = '1';
  handler();
}
