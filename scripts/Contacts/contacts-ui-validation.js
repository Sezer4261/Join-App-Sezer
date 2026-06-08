/** @file Inline validation for contact form fields. */
let contactDialogFieldErrors = {};

const ADD_CONTACT_FIELD_IDS = ["ac-name", "ac-email", "ac-phone"];
const EDIT_CONTACT_FIELD_IDS = ["edit-name", "edit-email", "edit-phone"];

/**
 * Returns the error span id for a contact field.
 * @param {string} fieldId - Input element id whose error span should be resolved.
 * @returns {string} Id of the error message span associated with the field.
 */
function getContactErrorSpanId(fieldId) {
  return `${fieldId}-error`;
}

/**
 * Sets the text content of a contact error span.
 * @param {string} spanId - Id of the error message span to update.
 * @param {string} value - Error message text to display, or an empty string to clear it.
 * @returns {void}
 */
function setContactErrorText(spanId, value) {
  const el = document.getElementById(spanId);
  if (el) el.textContent = value;
}

/**
 * Applies an inline error state to a contact form field.
 * @param {string} fieldId - Input element id whose validation state should be updated.
 * @param {HTMLInputElement|null} input - Input element receiving the error styling.
 * @param {string} spanId - Id of the error message span to populate.
 * @param {string} message - Validation error message to show to the user.
 * @returns {void}
 */
function applyContactFieldError(fieldId, input, spanId, message) {
  contactDialogFieldErrors[fieldId] = message;
  input?.classList.add("input-error");
  input?.closest(".ac-field")?.classList.add("input-error");
  setContactErrorText(spanId, message);
}

/**
 * Clears the inline error state for a contact form field.
 * @param {string} fieldId - Input element id whose validation state should be cleared.
 * @param {HTMLInputElement|null} input - Input element from which error styling should be removed.
 * @param {string} spanId - Id of the error message span to clear.
 * @returns {void}
 */
function clearContactFieldError(fieldId, input, spanId) {
  delete contactDialogFieldErrors[fieldId];
  input?.classList.remove("input-error");
  input?.closest(".ac-field")?.classList.remove("input-error");
  setContactErrorText(spanId, "");
}

/**
 * Applies or clears inline validation for a contact field.
 * @param {string} fieldId - Input element id whose validation state should be updated.
 * @param {HTMLInputElement|null} input - Input element receiving validation styling.
 * @param {string} message - Validation error message to show, or an empty string to clear errors.
 * @returns {void}
 */
function applyContactInlineValidation(fieldId, input, message) {
  const spanId = getContactErrorSpanId(fieldId);
  if (message) {
    applyContactFieldError(fieldId, input, spanId, message);
    return;
  }
  clearContactFieldError(fieldId, input, spanId);
}

/**
 * Clears inline errors for all given contact field ids.
 * @param {string[]} fieldIds - Input element ids whose inline errors should be cleared.
 * @returns {void}
 */
function clearAllContactInlineErrors(fieldIds) {
  (fieldIds || []).forEach((id) => {
    const input = document.getElementById(id);
    applyContactInlineValidation(id, input, "");
  });
}

/**
 * Re-displays a stored error message for a contact field on focus.
 * @param {string} fieldId - Input element id whose stored error should be shown again.
 * @param {string[]} fieldIds - All field ids in the dialog, used for error coordination.
 * @returns {void}
 */
function showContactFieldErrorMessage(fieldId, fieldIds) {
  const message = contactDialogFieldErrors[fieldId];
  if (message) setContactErrorText(getContactErrorSpanId(fieldId), message);
}

/**
 * Validates a contact name field value.
 * @param {string} value - Raw name value read from the input field.
 * @returns {{isValid: boolean, normalizedValue: string, error: string}} Validation result with a normalized name when valid.
 */
function validateContactNameField(value) {
  const c = validateContactNameInput(value);
  return { isValid: c.isValid, normalizedValue: c.normalizedName, error: c.error };
}

/**
 * Validates a contact email field value.
 * @param {string} value - Raw email value read from the input field.
 * @returns {{isValid: boolean, normalizedValue: string, error: string}} Validation result with a normalized email when valid.
 */
function validateContactEmailField(value) {
  const c = validateEmailLikeSignup(value);
  return { isValid: c.isValid, normalizedValue: c.normalizedEmail, error: c.error };
}

/**
 * Validates a contact phone field value.
 * @param {string} value - Raw phone value read from the input field.
 * @returns {{isValid: boolean, normalizedValue: string, error: string}} Validation result with a normalized phone when valid.
 */
function validateContactPhoneField(value) {
  const c = validateContactPhoneNumber(value);
  return { isValid: c.isValid, normalizedValue: c.normalizedPhone, error: c.error };
}

/**
 * Dispatches validation to the correct field validator.
 * @param {string} fieldId - Input element id that determines which validator to use.
 * @param {string} value - Raw field value to validate.
 * @returns {{isValid: boolean, normalizedValue: string, error: string}} Validation result for the requested field.
 */
function validateContactDialogField(fieldId, value) {
  if (fieldId === "ac-name" || fieldId === "edit-name") return validateContactNameField(value);
  if (fieldId === "ac-email" || fieldId === "edit-email") return validateContactEmailField(value);
  if (fieldId === "ac-phone" || fieldId === "edit-phone") return validateContactPhoneField(value);
  return { isValid: true, normalizedValue: value, error: "" };
}

/**
 * Validates a contact field on blur and normalizes valid input.
 * @param {string} fieldId - Input element id to validate when focus leaves the field.
 * @returns {void}
 */
function validateContactDialogFieldOnBlur(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  const check = validateContactDialogField(fieldId, input.value ?? "");
  applyContactInlineValidation(fieldId, input, check.isValid ? "" : (check.error || "Invalid input."));
  if (check.isValid && typeof check.normalizedValue === "string") input.value = check.normalizedValue;
}

/**
 * Clears a field error when the current value becomes valid.
 * @param {string} fieldId - Input element id whose stored error should be cleared if resolved.
 * @returns {void}
 */
function clearContactDialogFieldErrorIfResolved(fieldId) {
  if (!contactDialogFieldErrors[fieldId]) return;
  const input = document.getElementById(fieldId);
  if (!input) return;
  const check = validateContactDialogField(fieldId, input.value ?? "");
  if (check.isValid) applyContactInlineValidation(fieldId, input, "");
}

/**
 * Shows a submit-time error on a contact field and focuses it.
 * @param {string} fieldId - Input element id that should receive the submit error.
 * @param {string} message - Validation error message to display on submit.
 * @param {string[]} allFieldIds - All field ids in the dialog whose errors should be cleared first.
 * @returns {void}
 */
function showContactSubmitError(fieldId, message, allFieldIds) {
  clearAllContactInlineErrors(allFieldIds);
  const input = document.getElementById(fieldId);
  applyContactInlineValidation(fieldId, input, message || "Invalid input.");
  input?.focus();
}

/**
 * Sets custom validity on an input from a validation check.
 * @param {HTMLInputElement|null} input - Input element whose browser validity state should be updated.
 * @param {{isValid: boolean, error: string}} check - Validation result used to set custom validity.
 * @returns {boolean} Whether the field passed validation.
 */
function applyContactFieldValidity(input, check) {
  if (input && typeof input.setCustomValidity === "function") {
    input.setCustomValidity(check.isValid ? "" : check.error);
  }
  return check.isValid;
}

/**
 * Computes whether all add-contact fields are valid.
 * @param {HTMLDialogElement} dialog - Add-contact dialog containing the fields to validate.
 * @returns {boolean} Whether every add-contact field currently passes validation.
 */
function computeAddContactValidity(dialog) {
  const n = dialog.querySelector("#ac-name");
  const e = dialog.querySelector("#ac-email");
  const p = dialog.querySelector("#ac-phone");
  const nc = validateContactNameInput(n?.value ?? "");
  const ec = validateEmailLikeSignup(e?.value ?? "");
  const pc = validateContactPhoneNumber(p?.value ?? "");
  return applyContactFieldValidity(n, nc) & applyContactFieldValidity(e, ec) & applyContactFieldValidity(p, pc);
}

/**
 * Enables or disables the add-contact submit button.
 * @param {HTMLDialogElement} dialog - Add-contact dialog whose submit button state should be updated.
 * @returns {void}
 */
function updateAddContactSubmitState(dialog) {
  if (!dialog) return;
  const submitBtn = dialog.querySelector("[data-ac-submit]");
  if (!submitBtn) return;
  const isValid = !!computeAddContactValidity(dialog);
  submitBtn.disabled = !isValid;
  submitBtn.setAttribute("aria-disabled", String(!isValid));
}

/**
 * Handles input events for a contact dialog field.
 * @param {HTMLInputElement} field - Input element whose value changed.
 * @param {Function} handler - Callback invoked after inline validation state is updated.
 * @returns {void}
 */
function handleContactFieldInput(field, handler) {
  const check = validateContactDialogField(field.id, field.value ?? "");
  if (!check.isValid) applyContactInlineValidation(field.id, field, check.error);
  else clearContactDialogFieldErrorIfResolved(field.id);
  handler();
}

/**
 * Binds focus, input, change, and blur listeners on a contact field.
 * @param {HTMLInputElement} field - Input element that should receive validation listeners.
 * @param {string[]} fieldIds - All field ids in the dialog for error coordination.
 * @param {Function} handler - Callback invoked when the field state affects submit availability.
 * @returns {void}
 */
function bindContactFieldListeners(field, fieldIds, handler) {
  field.addEventListener("focus", () => showContactFieldErrorMessage(field.id, fieldIds));
  field.addEventListener("input", () => handleContactFieldInput(field, handler));
  field.addEventListener("change", () => { clearContactDialogFieldErrorIfResolved(field.id); handler(); });
  field.addEventListener("blur", () => { validateContactDialogFieldOnBlur(field.id); handler(); });
}

/**
 * Initializes inline validation for the add-contact dialog.
 * @param {HTMLDialogElement} dialog - Add-contact dialog whose fields should receive validation listeners.
 * @returns {void}
 */
function initAddContactDialogValidation(dialog) {
  if (!dialog || dialog.dataset.acValidationInit === "1") return;
  const handler = () => updateAddContactSubmitState(dialog);
  ADD_CONTACT_FIELD_IDS.map((id) => dialog.querySelector(`#${id}`)).filter(Boolean)
    .forEach((field) => bindContactFieldListeners(field, ADD_CONTACT_FIELD_IDS, handler));
  bindContactValidationReset(dialog, handler, "#add-contact-form", ADD_CONTACT_FIELD_IDS);
  dialog.dataset.acValidationInit = "1";
  handler();
}

/**
 * Resets validation state when a contact form is reset.
 * @param {HTMLDialogElement} dialog - Dialog containing the form whose reset event should be handled.
 * @param {Function} handler - Callback invoked after validation state is cleared.
 * @param {string} formSelector - CSS selector used to find the form inside the dialog.
 * @param {string[]} fieldIds - Input element ids whose inline errors should be cleared on reset.
 * @returns {void}
 */
function bindContactValidationReset(dialog, handler, formSelector, fieldIds) {
  const form = dialog.querySelector(formSelector);
  if (!form) return;
  form.addEventListener("reset", () => {
    contactDialogFieldErrors = {};
    clearAllContactInlineErrors(fieldIds);
    setTimeout(handler, 0);
  });
}

/**
 * Computes whether all edit-contact fields are valid.
 * @param {HTMLDialogElement} dialog - Edit-contact dialog containing the fields to validate.
 * @returns {boolean} Whether every edit-contact field currently passes validation.
 */
function computeEditContactValidity(dialog) {
  const n = dialog.querySelector("#edit-name");
  const e = dialog.querySelector("#edit-email");
  const p = dialog.querySelector("#edit-phone");
  const nc = validateContactNameInput(n?.value ?? "");
  const ec = validateEmailLikeSignup(e?.value ?? "");
  const pc = validateContactPhoneNumber(p?.value ?? "");
  return applyContactFieldValidity(n, nc) & applyContactFieldValidity(e, ec) & applyContactFieldValidity(p, pc);
}

/**
 * Enables or disables the edit-contact submit button.
 * @param {HTMLDialogElement} dialog - Edit-contact dialog whose submit button state should be updated.
 * @returns {void}
 */
function updateEditContactSubmitState(dialog) {
  if (!dialog) return;
  const submitBtn = dialog.querySelector("[data-edit-submit]");
  if (!submitBtn) return;
  const isValid = !!computeEditContactValidity(dialog);
  submitBtn.disabled = !isValid;
  submitBtn.setAttribute("aria-disabled", String(!isValid));
}

/**
 * Initializes inline validation for the edit-contact dialog.
 * @param {HTMLDialogElement} dialog - Edit-contact dialog whose fields should receive validation listeners.
 * @returns {void}
 */
function initEditContactDialogValidation(dialog) {
  if (!dialog || dialog.dataset.editValidationInit === "1") return;
  const handler = () => updateEditContactSubmitState(dialog);
  EDIT_CONTACT_FIELD_IDS.map((id) => dialog.querySelector(`#${id}`)).filter(Boolean)
    .forEach((field) => bindContactFieldListeners(field, EDIT_CONTACT_FIELD_IDS, handler));
  bindContactValidationReset(dialog, handler, "#edit-contact-form", EDIT_CONTACT_FIELD_IDS);
  dialog.dataset.editValidationInit = "1";
  handler();
}

/**
 * Clears all validation state for the given contact field ids.
 * @param {string[]} fieldIds - Input element ids whose errors and custom validity should be reset.
 * @returns {void}
 */
function resetContactDialogFieldState(fieldIds) {
  contactDialogFieldErrors = {};
  clearAllContactInlineErrors(fieldIds);
  (fieldIds || []).forEach((id) => {
    document.getElementById(id)?.setCustomValidity?.("");
  });
}

/**
 * Resets the add-contact form and validation state.
 * @returns {void}
 */
function clearAddContactForm() {
  const dialog = document.getElementById("add-contact-dialog");
  const form = dialog?.querySelector("#add-contact-form");
  if (!form) return;
  form.reset();
  resetContactDialogFieldState(ADD_CONTACT_FIELD_IDS);
  if (dialog) updateAddContactSubmitState(dialog);
}

/**
 * Clears the edit-contact form fields and validation state.
 * @returns {void}
 */
function clearEditContactForm() {
  const dialog = document.getElementById("edit-contact-dialog");
  if (!dialog) return;
  EDIT_CONTACT_FIELD_IDS.forEach((id) => {
    const input = dialog.querySelector(`#${id}`);
    if (input) input.value = "";
  });
  resetContactDialogFieldState(EDIT_CONTACT_FIELD_IDS);
  updateEditContactSubmitState(dialog);
}
