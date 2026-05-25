/**
 * Shows add task dialog.
 * @returns {Promise<*>} Result.
 */
/**
 * Registers the backdrop click handler once.
 * @param {HTMLElement} dialogOverlay - Dialog overlay element.
 * @returns {void} Result.
 */
function initAddTaskDialogBackdropHandler(dialogOverlay) {
  if (window.addTaskDialogBackdropHandlerAdded) return;
  window.addTaskDialogBackdropHandlerAdded = true;
  dialogOverlay.addEventListener("click", (event) => {
    if (event.target !== dialogOverlay) return;
    event.stopPropagation();
    closeAddTaskDialog();
  });
  dialogOverlay.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeAddTaskDialog();
  });
}

/**
 * Renders the add task form, triggers animation, and loads contacts.
 * @param {HTMLElement} modalContent - Modal content element.
 * @returns {Promise<void>} Result.
 */
async function initAddTaskDialogContent(modalContent) {
  modalContent.innerHTML = generateAddTask({ variant: "dialog" });
  if (typeof applyTodayMinDate === "function") applyTodayMinDate();
  void modalContent.offsetWidth;
  requestAnimationFrame(() => modalContent.classList.add("is-open"));
  await loadContacts();
  selectedContacts = [];
  selectContacts();
  renderSelectedAvatars();
  if (typeof initAddDropdownClose === "function") initAddDropdownClose();
  if (typeof initAddTaskBlurValidation === "function") initAddTaskBlurValidation();
  if (typeof initAddSubtaskEnter === "function") initAddSubtaskEnter();
}

async function showAddTaskDialog(status = "To Do") {
  window.currentBoardStatus = status;
  const modalContent = document.getElementById("add-task-dialog-message");
  const dialogOverlay = document.getElementById("add-task-dialog");
  if (!dialogOverlay || !modalContent) return;
  dialogOverlay.dataset.closing = "false";
  if (!dialogOverlay.open) dialogOverlay.showModal();
  document.documentElement.style.overflow = 'hidden';
  modalContent.classList.remove("is-open");
  initAddTaskDialogBackdropHandler(dialogOverlay);
  await initAddTaskDialogContent(modalContent);
}

/**
 * Closes add task dialog.
 * @returns {void} Result.
 */
/**
 * Runs the slide-out close animation for the add task dialog.
 * @param {HTMLElement} modalContent - Content element.
 * @param {Function} cleanup - Cleanup callback.
 * @returns {void} Result.
 */
function runAddTaskDialogCloseAnimation(modalContent, cleanup) {
  const onTransitionEnd = (event) => {
    if (event && event.target !== modalContent) return;
    modalContent.removeEventListener("transitionend", onTransitionEnd);
    cleanup();
  };
  modalContent.addEventListener("transitionend", onTransitionEnd);
  requestAnimationFrame(() => modalContent.classList.remove("is-open"));
  setTimeout(() => {
    modalContent.removeEventListener("transitionend", onTransitionEnd);
    cleanup();
  }, 400);
}

function closeAddTaskDialog() {
  const dialogOverlay = document.getElementById("add-task-dialog");
  const modalContent = document.getElementById("add-task-dialog-message");
  if (!dialogOverlay) return;
  if (dialogOverlay.dataset.closing === "true") return;
  dialogOverlay.dataset.closing = "true";
  const cleanup = () => {
    dialogOverlay.close();
    document.documentElement.style.overflow = '';
    dialogOverlay.dataset.closing = "false";
  };
  if (!modalContent) { cleanup(); return; }
  runAddTaskDialogCloseAnimation(modalContent, cleanup);
}
