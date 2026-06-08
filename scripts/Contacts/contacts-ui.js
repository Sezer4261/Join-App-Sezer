/** @file Contact dialog open/close and scroll lock UI. */
const CONTACT_DIALOG_OPEN_CLASS = "contact-dialog-open";

/**
 * Locks or unlocks page scroll while a contact dialog is open.
 * @param {boolean} locked - Whether page scroll should be prevented while a dialog is visible.
 * @returns {void}
 */
function setContactDialogScrollLock(locked) {
  document.body.classList.toggle(CONTACT_DIALOG_OPEN_CLASS, locked);
  if (locked) lockPageScrollForOverlay();
  else unlockPageScrollForOverlay();
}

/**
 * Captures scroll positions and returns a restore function.
 * @returns {Function} Callback that restores the captured contact panel scroll positions.
 */
function captureContactPanelScrollPositions() {
  const scrollEl = document.querySelector(".contact-scroll");
  const detailsEl = document.querySelector(".contact-div-right");
  const scrollTop = scrollEl?.scrollTop ?? 0;
  const detailsTop = detailsEl?.scrollTop ?? 0;
  return () => {
    if (scrollEl) scrollEl.scrollTop = scrollTop;
    if (detailsEl) detailsEl.scrollTop = detailsTop;
  };
}

/**
 * Binds close and backdrop-click handlers on a contact dialog.
 * @param {HTMLDialogElement} dialog - Dialog element whose lifecycle events should be wired up.
 * @param {Function} onClose - Handler invoked when the dialog should close.
 * @returns {void}
 */
function bindContactDialogEvents(dialog, onClose) {
  dialog.addEventListener("close", () => {
    setContactDialogScrollLock(false);
    if (dialog.id === "add-contact-dialog") clearAddContactForm();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) onClose();
  });
  const dialogContent = dialog.querySelector(".ac-dialog-content");
  if (dialogContent) {
    dialogContent.addEventListener("click", (event) => event.stopPropagation());
  }
}

/**
 * Opens a contact dialog with scroll lock and position restore.
 * @param {HTMLDialogElement} dialog - Dialog element to display as a modal.
 * @returns {void}
 */
function openContactDialog(dialog) {
  const restoreScroll = captureContactPanelScrollPositions();
  dialog.classList.remove("closing");
  setContactDialogScrollLock(true);
  dialog.showModal();
  restoreScroll();
  requestAnimationFrame(restoreScroll);
}

/**
 * Opens the add-contact dialog and initializes validation.
 * @returns {void}
 */
function openAddContactDialog() {
  const dialog = ensureAddContactDialog();
  clearAddContactForm();
  const formWrap = dialog.querySelector(".ac-formwrap");
  if (formWrap) formWrap.scrollTop = 0;
  openContactDialog(dialog);
  initAddContactDialogValidation(dialog);
  updateAddContactSubmitState(dialog);
}

/**
 * Returns whether the add-contact dialog markup is outdated.
 * @param {HTMLDialogElement|null} dialog - Existing add-contact dialog element to inspect.
 * @returns {boolean} Whether the dialog uses an outdated template and should be recreated.
 */
function isStaleAddContactDialog(dialog) {
  return dialog && !dialog.querySelector(".ac-avatar-on-divider");
}

/**
 * Inserts and wires up the add-contact dialog in the DOM.
 * @returns {HTMLDialogElement} Newly created add-contact dialog element.
 */
function createAddContactDialog() {
  document.body.insertAdjacentHTML("beforeend", getDialogAddContact());
  const dialog = document.getElementById("add-contact-dialog");
  const closeBtn = dialog.querySelector(".ac-close");
  closeBtn.addEventListener("click", closeAddContactDialogWithAnimation);
  bindContactDialogEvents(dialog, closeAddContactDialogWithAnimation);
  return dialog;
}

/**
 * Returns the existing add-contact dialog or creates one.
 * @returns {HTMLDialogElement} Ready-to-use add-contact dialog element.
 */
function ensureAddContactDialog() {
  let dialog = document.getElementById("add-contact-dialog");
  if (isStaleAddContactDialog(dialog)) { dialog.remove(); dialog = null; }
  if (!dialog) dialog = createAddContactDialog();
  return dialog;
}

/**
 * Closes the add-contact dialog with a fade-out animation.
 * @returns {void}
 */
function closeAddContactDialogWithAnimation() {
  const dialog = document.getElementById("add-contact-dialog");
  if (!dialog) return;
  dialog.classList.add("closing");
  setTimeout(() => dialog.close(), DIALOG_CLOSE_MS);
}

/**
 * Returns the DOM element used to anchor contact toasts.
 * @returns {HTMLElement|null} Parent container where contact toasts should be inserted.
 */
function getContactsToastAnchor() {
  const details = document.getElementById("contact-details");
  if (details?.parentElement) return details.parentElement;
  return document.querySelector(".contact-section-right .contact-div-right")
    || document.querySelector(".contact-section-right");
}

/**
 * Animates the contacts toast in and schedules its removal.
 * @param {HTMLElement} toast - Toast element to reveal and later remove.
 * @param {number} durationMs - Number of milliseconds the toast stays visible.
 * @returns {void}
 */
function revealContactsToast(toast, durationMs) {
  requestAnimationFrame(() => {
    toast.classList.add("contacts-toast-visible");
    toast.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
  window.setTimeout(() => {
    toast.classList.remove("contacts-toast-visible");
    window.setTimeout(() => toast.remove(), 220);
  }, durationMs);
}

/**
 * Shows a toast notification on the contacts page.
 * @param {string} message - User-facing text shown inside the toast.
 * @param {number} [durationMs=2600] - Number of milliseconds the toast stays visible.
 * @returns {void}
 */
function showContactsToast(message, durationMs = 2600) {
  document.getElementById("contacts-toast")?.remove();
  const anchor = getContactsToastAnchor();
  if (!anchor) return;
  anchor.insertAdjacentHTML("beforeend", getContactsToastTemplate(message));
  const toast = document.getElementById("contacts-toast");
  if (!toast) return;
  revealContactsToast(toast, durationMs);
}

/**
 * Toggles the contact overflow menu open state.
 * @param {Event} [event] - Click event that triggered the menu toggle.
 * @returns {void}
 */
function toggleContactMoreMenu(event) {
  event?.stopPropagation();
  const menu = document.getElementById("contact-more-menu");
  if (!menu) return;
  menu.classList.toggle("is-open");
  initContactMoreMenuAutoClose();
}

/**
 * Closes the contact overflow menu.
 * @returns {void}
 */
function closeContactMoreMenu() {
  document.getElementById("contact-more-menu")?.classList.remove("is-open");
}

/**
 * Registers a one-time document click handler to close the overflow menu.
 * @returns {void}
 */
function initContactMoreMenuAutoClose() {
  if (document.body.dataset.contactMoreInit === "1") return;
  document.addEventListener("click", (event) => {
    const menu = document.getElementById("contact-more-menu");
    const button = document.querySelector(".contact-more-btn");
    if (!menu || !button) return;
    if (menu.classList.contains("is-open") && !menu.contains(event.target) && !button.contains(event.target)) {
      menu.classList.remove("is-open");
    }
  });
  document.body.dataset.contactMoreInit = "1";
}

/**
 * Opens the edit-contact dialog for the given contact.
 * @param {string} id - Unique identifier of the contact being edited.
 * @param {string} name - Current contact name used to prefill the form.
 * @param {string} email - Current email address used to prefill the form.
 * @param {string} phone - Current phone number used to prefill the form.
 * @param {string} initials - Initials rendered in the edit dialog avatar badge.
 * @returns {void}
 */
function openEditContactDialog(id, name, email, phone, initials) {
  const container = document.getElementById("edit-contact-dialog-container");
  if (!container) return;
  container.innerHTML = getEditContactDialog(id, name, email, phone, initials);
  const dialog = document.getElementById("edit-contact-dialog");
  if (!dialog) return;
  contactDialogFieldErrors = {};
  bindContactDialogEvents(dialog, closeEditContactDialog);
  openContactDialog(dialog);
  initEditContactDialogValidation(dialog);
  updateEditContactSubmitState(dialog);
}

/**
 * Closes and removes the edit-contact dialog with animation.
 * @returns {void}
 */
function closeEditContactDialog() {
  const dialog = document.getElementById("edit-contact-dialog");
  if (!dialog) return;
  dialog.classList.add("closing");
  setTimeout(() => {
    dialog.close();
    dialog.remove();
  }, DIALOG_CLOSE_MS);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ensureAddContactDialog, { once: true });
} else {
  ensureAddContactDialog();
}
