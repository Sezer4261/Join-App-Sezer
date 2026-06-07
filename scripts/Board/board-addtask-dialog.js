/** @file Board add-task dialog and responsive navigation. */
const BOARD_ADD_TASK_PAGE_MAX_WIDTH = 820;

/**
 * Whether board add-task actions should navigate to the add-task page (responsive).
 * @returns {boolean} Result.
 */
function shouldNavigateToBoardAddTaskPage() {
  return window.innerWidth <= BOARD_ADD_TASK_PAGE_MAX_WIDTH;
}

/**
 * Opens add-task dialog on desktop or navigates to add-task page on responsive viewports.
 * @param {string} [status="To Do"] - Board column status.
 * @returns {void} Result.
 */
function openBoardAddTask(status = "To Do") {
  if (shouldNavigateToBoardAddTaskPage()) {
    sidebarHighlightingAddTask(status);
    return;
  }
  showAddTaskDialog(status);
}

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
 * Renders add-task dialog markup and runs the open animation.
 * @param {HTMLElement} modalContent - Modal content element.
 * @returns {void}
 */
function renderAddTaskDialogMarkup(modalContent) {
  modalContent.innerHTML = generateAddTask({ variant: "dialog" });
  if (typeof applyTodayMinDate === "function") applyTodayMinDate();
  void modalContent.offsetWidth;
  requestAnimationFrame(() => modalContent.classList.add("is-open"));
}

/**
 * Initializes contacts and form handlers inside the add-task dialog.
 * @returns {Promise<void>}
 */
async function initAddTaskDialogFormHandlers() {
  await loadContacts();
  selectedContacts = [];
  selectContacts();
  renderSelectedAvatars();
  if (typeof initAddDropdownClose === "function") initAddDropdownClose();
  if (typeof initAddTaskBlurValidation === "function") initAddTaskBlurValidation();
  if (typeof initAddSubtaskEnter === "function") initAddSubtaskEnter();
}

/**
 * Renders the add task form, triggers animation, and loads contacts.
 * @param {HTMLElement} modalContent - Modal content element.
 * @returns {Promise<void>} Result.
 */
async function initAddTaskDialogContent(modalContent) {
  renderAddTaskDialogMarkup(modalContent);
  await initAddTaskDialogFormHandlers();
}

/**
 * Shows the centered add-task dialog on the board.
 * @param {string} [status="To Do"] - Board column status.
 * @returns {Promise<void>} Result.
 */
async function showAddTaskDialog(status = "To Do") {
  window.currentBoardStatus = status;
  const modalContent = document.getElementById("add-task-dialog-message");
  const dialogOverlay = document.getElementById("add-task-dialog");
  if (!dialogOverlay || !modalContent) return;
  dialogOverlay.dataset.closing = "false";
  if (!dialogOverlay.open) dialogOverlay.showModal();
  lockPageScrollForOverlay();
  modalContent.classList.remove("is-open");
  initAddTaskDialogBackdropHandler(dialogOverlay);
  await initAddTaskDialogContent(modalContent);
}

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

/**
 * Cleans up the add-task dialog after close animation.
 * @param {HTMLDialogElement} dialogOverlay - Dialog element.
 * @returns {void}
 */
function finalizeAddTaskDialogClose(dialogOverlay) {
  dialogOverlay.close();
  unlockPageScrollForOverlay();
  dialogOverlay.dataset.closing = "false";
}

/**
 * Closes the board add-task dialog.
 * @returns {void} Result.
 */
function closeAddTaskDialog() {
  const dialogOverlay = document.getElementById("add-task-dialog");
  const modalContent = document.getElementById("add-task-dialog-message");
  if (!dialogOverlay) return;
  if (dialogOverlay.dataset.closing === "true") return;
  dialogOverlay.dataset.closing = "true";
  const cleanup = () => finalizeAddTaskDialogClose(dialogOverlay);
  if (!modalContent) { cleanup(); return; }
  runAddTaskDialogCloseAnimation(modalContent, cleanup);
}
