const CONTACT_DIALOG_OPEN_CLASS = "contact-dialog-open";

function setContactDialogScrollLock(locked) {
  document.body.classList.toggle(CONTACT_DIALOG_OPEN_CLASS, locked);
}

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

function bindContactDialogEvents(dialog, onClose) {
  dialog.addEventListener("close", () => setContactDialogScrollLock(false));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) onClose();
  });
  const dialogContent = dialog.querySelector(".ac-dialog-content");
  if (dialogContent) {
    dialogContent.addEventListener("click", (event) => event.stopPropagation());
  }
}

function openContactDialog(dialog) {
  const restoreScroll = captureContactPanelScrollPositions();
  dialog.classList.remove("closing");
  setContactDialogScrollLock(true);
  dialog.showModal();
  restoreScroll();
  requestAnimationFrame(restoreScroll);
}

function openAddContactDialog() {
  const dialog = ensureAddContactDialog();
  openContactDialog(dialog);
  contactDialogFieldErrors = {};
  clearAllContactInlineErrors(ADD_CONTACT_FIELD_IDS);
  initAddContactDialogValidation(dialog);
  updateAddContactSubmitState(dialog);
}

function ensureAddContactDialog() {
  let dialog = document.getElementById("add-contact-dialog");
  if (!dialog) {
    document.body.insertAdjacentHTML("beforeend", getDialogAddContact());
    dialog = document.getElementById("add-contact-dialog");
    const closeBtn = dialog.querySelector(".ac-close");
    closeBtn.addEventListener("click", closeAddContactDialogWithAnimation);
    bindContactDialogEvents(dialog, closeAddContactDialogWithAnimation);
  }
  return dialog;
}

function closeAddContactDialogWithAnimation() {
  const dialog = document.getElementById("add-contact-dialog");
  if (!dialog) return;
  dialog.classList.add("closing");
  setTimeout(() => dialog.close(), DIALOG_CLOSE_MS);
}

function getContactsToastAnchor() {
  const details = document.getElementById("contact-details");
  if (details?.parentElement) return details.parentElement;
  return document.querySelector(".contact-section-right .contact-div-right")
    || document.querySelector(".contact-section-right");
}

function showContactsToast(message, durationMs = 2600) {
  document.getElementById("contacts-toast")?.remove();
  const anchor = getContactsToastAnchor();
  if (!anchor) return;
  anchor.insertAdjacentHTML("beforeend", getContactsToastTemplate(message));
  const toast = document.getElementById("contacts-toast");
  if (!toast) return;
  requestAnimationFrame(() => {
    toast.classList.add("contacts-toast-visible");
    toast.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
  window.setTimeout(() => {
    toast.classList.remove("contacts-toast-visible");
    window.setTimeout(() => toast.remove(), 220);
  }, durationMs);
}

function toggleContactMoreMenu(event) {
  event?.stopPropagation();
  const menu = document.getElementById("contact-more-menu");
  if (!menu) return;
  menu.classList.toggle("is-open");
  initContactMoreMenuAutoClose();
}

function closeContactMoreMenu() {
  document.getElementById("contact-more-menu")?.classList.remove("is-open");
}

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
