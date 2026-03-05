/**
 * Checks whether non empty string.
 * @param {string} value - Value.
 * @returns {boolean} Result.
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
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
  const fields = [
    dialog.querySelector('#ac-name'),
    dialog.querySelector('#ac-email'),
    dialog.querySelector('#ac-phone'),
  ].filter(Boolean);
  const handler = () => updateAddContactSubmitState(dialog);
  bindContactValidationFields(fields, handler);
  bindContactValidationReset(dialog, handler, '#add-contact-form');
  dialog.dataset.acValidationInit = '1';
  handler();
}

/**
 * Executes bind contact validation fields logic.
 * @param {*} fields - Parameter.
 * @param {*} handler - Parameter.
 * @returns {void} Result.
 */
function bindContactValidationFields(fields, handler) {
  fields.forEach((field) => {
    field.addEventListener('input', handler);
    field.addEventListener('change', handler);
    field.addEventListener('blur', handler);
  });
}

/**
 * Executes bind contact validation reset logic.
 * @param {HTMLElement} dialog - Dialog element.
 * @param {*} handler - Parameter.
 * @param {*} formSelector - Parameter.
 * @returns {void} Result.
 */
function bindContactValidationReset(dialog, handler, formSelector) {
  const form = dialog.querySelector(formSelector);
  if (!form) return;
  form.addEventListener('reset', () => {
    setTimeout(handler, 0);
  });
}

/**
 * Opens add contact dialog.
 * @returns {void} Result.
 */
function openAddContactDialog() {
  let dialog = ensureAddContactDialog();
  dialog.classList.remove('closing');
  dialog.showModal();
  initAddContactDialogValidation(dialog);
  updateAddContactSubmitState(dialog);
  if (typeof openAddContact === "function") {
    openAddContact();
  }
}

/**
 * Executes ensure add contact dialog logic.
 * @returns {void} Result.
 */
function ensureAddContactDialog() {
  let dialog = document.getElementById("add-contact-dialog");
  if (!dialog) {
    document.body.insertAdjacentHTML("beforeend", getDialogAddContact());
    dialog = document.getElementById("add-contact-dialog");
    bindAddContactDialogEvents(dialog);
  }
  return dialog;
}

/**
 * Executes bind add contact dialog events logic.
 * @param {HTMLElement} dialog - Dialog element.
 * @returns {void} Result.
 */
function bindAddContactDialogEvents(dialog) {
  const closeBtn = dialog.querySelector(".ac-close");
  closeBtn.addEventListener("click", () => closeAddContactDialogWithAnimation());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeAddContactDialogWithAnimation();
    }
  });
  const dialogContent = dialog.querySelector(".ac-dialog-content");
  if (dialogContent) {
    dialogContent.addEventListener("click", (e) => e.stopPropagation());
  }
}

// NEU: Schließt Add Contact Dialog mit Animation
/**
 * Closes add contact dialog with animation.
 * @returns {void} Result.
 */
function closeAddContactDialogWithAnimation() {
  const dialog = document.getElementById("add-contact-dialog");
  if (dialog) {
    dialog.classList.add('closing');
    setTimeout(() => {
      dialog.close();
    }, 300);
  }
}

/**
 * Shows contacts toast.
 * @param {string} message - Message text.
 * @param {*} durationMs - Parameter.
 * @returns {void} Result.
 */
function showContactsToast(message, durationMs = 2200) {
  const old = document.getElementById('contacts-toast');
  if (old) old.remove();
  document.body.insertAdjacentHTML('beforeend', getContactsToastTemplate(message));
  const toast = document.getElementById('contacts-toast');
  if (!toast) return;
  requestAnimationFrame(() => toast.classList.add('contacts-toast-visible'));
  window.setTimeout(() => {
    toast.classList.remove('contacts-toast-visible');
    window.setTimeout(() => toast.remove(), 220);
  }, durationMs);
}

/**
 * Toggles contact more menu.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function toggleContactMoreMenu(event) {
  if (event) {
    event.stopPropagation();
  }
  const menu = document.getElementById('contact-more-menu');
  if (!menu) return;
  menu.classList.toggle('is-open');
  initContactMoreMenuAutoClose();
}

/**
 * Closes contact more menu.
 * @returns {void} Result.
 */
function closeContactMoreMenu() {
  const menu = document.getElementById('contact-more-menu');
  if (menu) {
    menu.classList.remove('is-open');
  }
}

/**
 * Initializes contact more menu auto close.
 * @returns {void} Result.
 */
function initContactMoreMenuAutoClose() {
  if (document.body.dataset.contactMoreInit === '1') return;
  document.addEventListener('click', (event) => {
    const menu = document.getElementById('contact-more-menu');
    const button = document.querySelector('.contact-more-btn');
    if (!menu || !button) return;
    if (menu.classList.contains('is-open') && !menu.contains(event.target) && !button.contains(event.target)) {
      menu.classList.remove('is-open');
    }
  });
  document.body.dataset.contactMoreInit = '1';
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
  const fields = [
    dialog.querySelector('#edit-name'),
    dialog.querySelector('#edit-email'),
    dialog.querySelector('#edit-phone'),
  ].filter(Boolean);
  const handler = () => updateEditContactSubmitState(dialog);
  bindContactValidationFields(fields, handler);
  bindContactValidationReset(dialog, handler, '#edit-contact-form');
  dialog.dataset.editValidationInit = '1';
  handler();
}

/**
 * Opens edit contact dialog.
 * @param {string} id - Identifier.
 * @param {string} name - Name.
 * @param {string} email - Email address.
 * @param {string} phone - Phone number.
 * @param {*} initials - Parameter.
 * @returns {void} Result.
 */
function openEditContactDialog(id, name, email, phone, initials) {
  const container = document.getElementById('edit-contact-dialog-container');
  if (!container) return;
  container.innerHTML = getEditContactDialog(id, name, email, phone, initials);
  const dialog = document.getElementById('edit-contact-dialog');
  if (!dialog) return;
  bindEditContactDialogEvents(dialog);
  showEditContactDialog(dialog);
  initEditContactDialogValidation(dialog);
  updateEditContactSubmitState(dialog);
}

/**
 * Executes bind edit contact dialog events logic.
 * @param {HTMLElement} dialog - Dialog element.
 * @returns {void} Result.
 */
function bindEditContactDialogEvents(dialog) {
  dialog.addEventListener('click', (e) => handleEditDialogBackdropClick(e, dialog));
  const dialogContent = dialog.querySelector('.ac-dialog-content');
  if (dialogContent) {
    dialogContent.addEventListener('click', (e) => e.stopPropagation());
  }
}

/**
 * Executes handle edit dialog backdrop click logic.
 * @param {Event} event - Browser event.
 * @param {HTMLElement} dialog - Dialog element.
 * @returns {void} Result.
 */
function handleEditDialogBackdropClick(event, dialog) {
  if (event.target === dialog) {
    closeEditContactDialog();
  }
}

/**
 * Shows edit contact dialog.
 * @param {HTMLElement} dialog - Dialog element.
 * @returns {void} Result.
 */
function showEditContactDialog(dialog) {
  dialog.classList.remove('closing');
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

/**
 * Closes edit contact dialog.
 * @returns {void} Result.
 */
function closeEditContactDialog() {
  const dialog = document.getElementById('edit-contact-dialog');
  if (dialog) {
    dialog.classList.add('closing');
    setTimeout(() => {
      dialog.close();
      dialog.remove();
    }, 300);
  }
}
