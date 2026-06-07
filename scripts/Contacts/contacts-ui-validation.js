/** @file Inline validation for contact form fields. */
let contactDialogFieldErrors = {};

const ADD_CONTACT_FIELD_IDS = ["ac-name", "ac-email", "ac-phone"];
const EDIT_CONTACT_FIELD_IDS = ["edit-name", "edit-email", "edit-phone"];

function getContactErrorSpanId(fieldId) {
  return `${fieldId}-error`;
}

function setContactErrorText(spanId, value) {
  const el = document.getElementById(spanId);
  if (el) el.textContent = value;
}

function applyContactFieldError(fieldId, input, spanId, message) {
  contactDialogFieldErrors[fieldId] = message;
  input?.classList.add("input-error");
  input?.closest(".ac-field")?.classList.add("input-error");
  setContactErrorText(spanId, message);
}

function clearContactFieldError(fieldId, input, spanId) {
  delete contactDialogFieldErrors[fieldId];
  input?.classList.remove("input-error");
  input?.closest(".ac-field")?.classList.remove("input-error");
  setContactErrorText(spanId, "");
}

function applyContactInlineValidation(fieldId, input, message) {
  const spanId = getContactErrorSpanId(fieldId);
  if (message) {
    applyContactFieldError(fieldId, input, spanId, message);
    return;
  }
  clearContactFieldError(fieldId, input, spanId);
}

function clearAllContactInlineErrors(fieldIds) {
  (fieldIds || []).forEach((id) => {
    const input = document.getElementById(id);
    applyContactInlineValidation(id, input, "");
  });
}

function showContactFieldErrorMessage(fieldId, fieldIds) {
  const message = contactDialogFieldErrors[fieldId];
  if (message) setContactErrorText(getContactErrorSpanId(fieldId), message);
}

/**
 * Validates a contact name field value.
 * @param {string} value - Field value.
 * @returns {{isValid: boolean, normalizedValue: string, error: string}} Result.
 */
function validateContactNameField(value) {
  const c = validateContactNameInput(value);
  return { isValid: c.isValid, normalizedValue: c.normalizedName, error: c.error };
}

/**
 * Validates a contact email field value.
 * @param {string} value - Field value.
 * @returns {{isValid: boolean, normalizedValue: string, error: string}} Result.
 */
function validateContactEmailField(value) {
  const c = validateEmailLikeSignup(value);
  return { isValid: c.isValid, normalizedValue: c.normalizedEmail, error: c.error };
}

/**
 * Validates a contact phone field value.
 * @param {string} value - Field value.
 * @returns {{isValid: boolean, normalizedValue: string, error: string}} Result.
 */
function validateContactPhoneField(value) {
  const c = validateContactPhoneNumber(value);
  return { isValid: c.isValid, normalizedValue: c.normalizedPhone, error: c.error };
}

function validateContactDialogField(fieldId, value) {
  if (fieldId === "ac-name" || fieldId === "edit-name") return validateContactNameField(value);
  if (fieldId === "ac-email" || fieldId === "edit-email") return validateContactEmailField(value);
  if (fieldId === "ac-phone" || fieldId === "edit-phone") return validateContactPhoneField(value);
  return { isValid: true, normalizedValue: value, error: "" };
}

function validateContactDialogFieldOnBlur(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  const check = validateContactDialogField(fieldId, input.value ?? "");
  applyContactInlineValidation(fieldId, input, check.isValid ? "" : (check.error || "Invalid input."));
  if (check.isValid && typeof check.normalizedValue === "string") input.value = check.normalizedValue;
}

function clearContactDialogFieldErrorIfResolved(fieldId) {
  if (!contactDialogFieldErrors[fieldId]) return;
  const input = document.getElementById(fieldId);
  if (!input) return;
  const check = validateContactDialogField(fieldId, input.value ?? "");
  if (check.isValid) applyContactInlineValidation(fieldId, input, "");
}

function showContactSubmitError(fieldId, message, allFieldIds) {
  clearAllContactInlineErrors(allFieldIds);
  const input = document.getElementById(fieldId);
  applyContactInlineValidation(fieldId, input, message || "Invalid input.");
  input?.focus();
}

function applyContactFieldValidity(input, check) {
  if (input && typeof input.setCustomValidity === "function") {
    input.setCustomValidity(check.isValid ? "" : check.error);
  }
  return check.isValid;
}

function computeAddContactValidity(dialog) {
  const n = dialog.querySelector("#ac-name");
  const e = dialog.querySelector("#ac-email");
  const p = dialog.querySelector("#ac-phone");
  const nc = validateContactNameInput(n?.value ?? "");
  const ec = validateEmailLikeSignup(e?.value ?? "");
  const pc = validateContactPhoneNumber(p?.value ?? "");
  return applyContactFieldValidity(n, nc) & applyContactFieldValidity(e, ec) & applyContactFieldValidity(p, pc);
}

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
 * @param {HTMLInputElement} field - Input element.
 * @param {Function} handler - State update handler.
 * @returns {void} Result.
 */
function handleContactFieldInput(field, handler) {
  const check = validateContactDialogField(field.id, field.value ?? "");
  if (!check.isValid) applyContactInlineValidation(field.id, field, check.error);
  else clearContactDialogFieldErrorIfResolved(field.id);
  handler();
}

function bindContactFieldListeners(field, fieldIds, handler) {
  field.addEventListener("focus", () => showContactFieldErrorMessage(field.id, fieldIds));
  field.addEventListener("input", () => handleContactFieldInput(field, handler));
  field.addEventListener("change", () => { clearContactDialogFieldErrorIfResolved(field.id); handler(); });
  field.addEventListener("blur", () => { validateContactDialogFieldOnBlur(field.id); handler(); });
}

function initAddContactDialogValidation(dialog) {
  if (!dialog || dialog.dataset.acValidationInit === "1") return;
  const handler = () => updateAddContactSubmitState(dialog);
  ADD_CONTACT_FIELD_IDS.map((id) => dialog.querySelector(`#${id}`)).filter(Boolean)
    .forEach((field) => bindContactFieldListeners(field, ADD_CONTACT_FIELD_IDS, handler));
  bindContactValidationReset(dialog, handler, "#add-contact-form", ADD_CONTACT_FIELD_IDS);
  dialog.dataset.acValidationInit = "1";
  handler();
}

function bindContactValidationReset(dialog, handler, formSelector, fieldIds) {
  const form = dialog.querySelector(formSelector);
  if (!form) return;
  form.addEventListener("reset", () => {
    contactDialogFieldErrors = {};
    clearAllContactInlineErrors(fieldIds);
    setTimeout(handler, 0);
  });
}

function computeEditContactValidity(dialog) {
  const n = dialog.querySelector("#edit-name");
  const e = dialog.querySelector("#edit-email");
  const p = dialog.querySelector("#edit-phone");
  const nc = validateContactNameInput(n?.value ?? "");
  const ec = validateEmailLikeSignup(e?.value ?? "");
  const pc = validateContactPhoneNumber(p?.value ?? "");
  return applyContactFieldValidity(n, nc) & applyContactFieldValidity(e, ec) & applyContactFieldValidity(p, pc);
}

function updateEditContactSubmitState(dialog) {
  if (!dialog) return;
  const submitBtn = dialog.querySelector("[data-edit-submit]");
  if (!submitBtn) return;
  const isValid = !!computeEditContactValidity(dialog);
  submitBtn.disabled = !isValid;
  submitBtn.setAttribute("aria-disabled", String(!isValid));
}

function initEditContactDialogValidation(dialog) {
  if (!dialog || dialog.dataset.editValidationInit === "1") return;
  const handler = () => updateEditContactSubmitState(dialog);
  EDIT_CONTACT_FIELD_IDS.map((id) => dialog.querySelector(`#${id}`)).filter(Boolean)
    .forEach((field) => bindContactFieldListeners(field, EDIT_CONTACT_FIELD_IDS, handler));
  bindContactValidationReset(dialog, handler, "#edit-contact-form", EDIT_CONTACT_FIELD_IDS);
  dialog.dataset.editValidationInit = "1";
  handler();
}

function resetContactDialogFieldState(fieldIds) {
  contactDialogFieldErrors = {};
  clearAllContactInlineErrors(fieldIds);
  (fieldIds || []).forEach((id) => {
    document.getElementById(id)?.setCustomValidity?.("");
  });
}

function clearAddContactForm() {
  const dialog = document.getElementById("add-contact-dialog");
  const form = dialog?.querySelector("#add-contact-form");
  if (!form) return;
  form.reset();
  resetContactDialogFieldState(ADD_CONTACT_FIELD_IDS);
  if (dialog) updateAddContactSubmitState(dialog);
}

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
