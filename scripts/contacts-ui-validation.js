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
function applyContactInlineValidation(fieldId, input, message) {
  const spanId = getContactErrorSpanId(fieldId);
  const fieldContainer = input?.closest('.ac-field');

  if (message) {
    contactDialogFieldErrors[fieldId] = message;
    input?.classList.add('input-error');
    fieldContainer?.classList.add('input-error');
    setContactErrorText(spanId, message);
    return;
  }

  delete contactDialogFieldErrors[fieldId];
  input?.classList.remove('input-error');
  fieldContainer?.classList.remove('input-error');
  setContactErrorText(spanId, '');
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
    const check = validateContactNameInput(value);
    return { isValid: check.isValid, normalizedValue: check.normalizedName, error: check.error };
  }
  if (fieldId === 'ac-email' || fieldId === 'edit-email') {
    const check = validateEmailLikeSignup(value);
    return { isValid: check.isValid, normalizedValue: check.normalizedEmail, error: check.error };
  }
  if (fieldId === 'ac-phone' || fieldId === 'edit-phone') {
    const check = validateContactPhoneNumber(value);
    return { isValid: check.isValid, normalizedValue: check.normalizedPhone, error: check.error };
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
function updateAddContactSubmitState(dialog) {
  if (!dialog) return;
  const nameInput = dialog.querySelector('#ac-name');
  const emailInput = dialog.querySelector('#ac-email');
  const phoneInput = dialog.querySelector('#ac-phone');
  const submitBtn = dialog.querySelector('[data-ac-submit]');
  if (!submitBtn) return;

  const nameCheck = validateContactNameInput(nameInput?.value ?? "");
  if (nameInput && typeof nameInput.setCustomValidity === "function") {
    nameInput.setCustomValidity(nameCheck.isValid ? "" : nameCheck.error);
  }

  const emailCheck = validateEmailLikeSignup(emailInput?.value ?? "");
  if (emailInput && typeof emailInput.setCustomValidity === "function") {
    emailInput.setCustomValidity(emailCheck.isValid ? "" : emailCheck.error);
  }

  const phoneCheck = validateContactPhoneNumber(phoneInput?.value ?? "");
  if (phoneInput && typeof phoneInput.setCustomValidity === "function") {
    phoneInput.setCustomValidity(phoneCheck.isValid ? "" : phoneCheck.error);
  }
  const isValid = (
    nameCheck.isValid &&
    emailCheck.isValid &&
    phoneCheck.isValid
  );
  submitBtn.disabled = !isValid;
  submitBtn.setAttribute('aria-disabled', String(!isValid));
}

/**
 * Initializes add contact dialog validation.
 * @param {HTMLElement} dialog - Dialog element.
 * @returns {void} Result.
 */
function initAddContactDialogValidation(dialog) {
  if (!dialog || dialog.dataset.acValidationInit === '1') return;
  const fields = ADD_CONTACT_FIELD_IDS
    .map((id) => dialog.querySelector(`#${id}`))
    .filter(Boolean);

  const handler = () => updateAddContactSubmitState(dialog);

  fields.forEach((field) => {
    field.addEventListener('focus', () => showContactFieldErrorMessage(field.id, ADD_CONTACT_FIELD_IDS));
    field.addEventListener('input', () => {
      clearContactDialogFieldErrorIfResolved(field.id);
      handler();
    });
    field.addEventListener('change', () => {
      clearContactDialogFieldErrorIfResolved(field.id);
      handler();
    });
    field.addEventListener('blur', () => {
      validateContactDialogFieldOnBlur(field.id);
      handler();
    });
  });

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
function updateEditContactSubmitState(dialog) {
  if (!dialog) return;
  const nameInput = dialog.querySelector('#edit-name');
  const emailInput = dialog.querySelector('#edit-email');
  const phoneInput = dialog.querySelector('#edit-phone');
  const submitBtn = dialog.querySelector('[data-edit-submit]');
  if (!submitBtn) return;

  const nameCheck = validateContactNameInput(nameInput?.value ?? "");
  if (nameInput && typeof nameInput.setCustomValidity === "function") {
    nameInput.setCustomValidity(nameCheck.isValid ? "" : nameCheck.error);
  }

  const emailCheck = validateEmailLikeSignup(emailInput?.value ?? "");
  if (emailInput && typeof emailInput.setCustomValidity === "function") {
    emailInput.setCustomValidity(emailCheck.isValid ? "" : emailCheck.error);
  }

  const phoneCheck = validateContactPhoneNumber(phoneInput?.value ?? "");
  if (phoneInput && typeof phoneInput.setCustomValidity === "function") {
    phoneInput.setCustomValidity(phoneCheck.isValid ? "" : phoneCheck.error);
  }
  const isValid = (
    nameCheck.isValid &&
    emailCheck.isValid &&
    phoneCheck.isValid
  );
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
  const fields = EDIT_CONTACT_FIELD_IDS
    .map((id) => dialog.querySelector(`#${id}`))
    .filter(Boolean);

  const handler = () => updateEditContactSubmitState(dialog);

  fields.forEach((field) => {
    field.addEventListener('focus', () => showContactFieldErrorMessage(field.id, EDIT_CONTACT_FIELD_IDS));
    field.addEventListener('input', () => {
      clearContactDialogFieldErrorIfResolved(field.id);
      handler();
    });
    field.addEventListener('change', () => {
      clearContactDialogFieldErrorIfResolved(field.id);
      handler();
    });
    field.addEventListener('blur', () => {
      validateContactDialogFieldOnBlur(field.id);
      handler();
    });
  });

  bindContactValidationReset(dialog, handler, '#edit-contact-form', EDIT_CONTACT_FIELD_IDS);
  dialog.dataset.editValidationInit = '1';
  handler();
}
