/** @file Board add-task dialog and responsive navigation. */
const BOARD_ADD_TASK_PAGE_MAX_WIDTH = 820;

/**
 * Determines whether narrow viewports should navigate to the add-task page instead of a dialog.
 * @returns {boolean} True when the viewport width prefers page navigation.
 */
function shouldNavigateToBoardAddTaskPage() {
  return window.innerWidth <= BOARD_ADD_TASK_PAGE_MAX_WIDTH;
}

/**
 * Opens the add-task dialog on desktop or routes to the add-task page on narrow screens.
 * @param {string} [status="To Do"] - Board column status preselected for the new task.
 * @returns {void}
 */
function openBoardAddTask(status = "To Do") {
  if (shouldNavigateToBoardAddTaskPage()) {
    sidebarHighlightingAddTask(status);
    return;
  }
  showAddTaskDialog(status);
}

/**
 * Closes the add-task dialog when the user clicks the dialog backdrop.
 * @param {MouseEvent} event - Click event on the dialog overlay.
 * @returns {void}
 */
function handleAddTaskDialogBackdropClick(event) {
  if (event.target !== event.currentTarget) return;
  event.stopPropagation();
  closeAddTaskDialog();
}

/**
 * Prevents the native dialog cancel event and closes the add-task dialog instead.
 * @param {Event} event - Cancel event from the dialog element.
 * @returns {void}
 */
function handleAddTaskDialogCancel(event) {
  event.preventDefault();
  closeAddTaskDialog();
}

/**
 * Registers backdrop and cancel handlers on the add-task dialog overlay once.
 * @param {HTMLElement} dialogOverlay - Dialog element that hosts the add-task form.
 * @returns {void}
 */
function initAddTaskDialogBackdropHandler(dialogOverlay) {
  if (window.addTaskDialogBackdropHandlerAdded) return;
  window.addTaskDialogBackdropHandlerAdded = true;
  dialogOverlay.addEventListener("click", handleAddTaskDialogBackdropClick);
  dialogOverlay.addEventListener("cancel", handleAddTaskDialogCancel);
}

/**
 * Injects add-task dialog markup and starts the open animation.
 * @param {HTMLElement} modalContent - Inner content container inside the dialog.
 * @returns {void}
 */
function renderAddTaskDialogMarkup(modalContent) {
  modalContent.innerHTML = generateAddTask({ variant: "dialog" });
  if (typeof applyTodayMinDate === "function") applyTodayMinDate();
  void modalContent.offsetWidth;
  requestAnimationFrame(() => modalContent.classList.add("is-open"));
}

/**
 * Loads contacts and wires validation and subtask handlers inside the dialog form.
 * @returns {Promise<void>} Resolves after contacts load and handlers are attached.
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
 * Renders the add-task form inside the dialog and initializes its handlers.
 * @param {HTMLElement} modalContent - Inner content container inside the dialog.
 * @returns {Promise<void>} Resolves after markup render and handler setup.
 */
async function initAddTaskDialogContent(modalContent) {
  renderAddTaskDialogMarkup(modalContent);
  await initAddTaskDialogFormHandlers();
}

/**
 * Opens the centered add-task dialog and prepares the form for the given column status.
 * @param {string} [status="To Do"] - Board column status stored for the new task.
 * @returns {Promise<void>} Resolves after the dialog is visible and initialized.
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
 * Finishes the close animation and runs cleanup when the content panel transition ends.
 * @param {TransitionEvent} event - Transition-end event from the content panel.
 * @param {HTMLElement} modalContent - Content element whose close animation completed.
 * @param {Function} onTransitionEnd - Listener to remove after the transition.
 * @param {Function} cleanup - Callback that finalizes dialog teardown.
 * @returns {void}
 */
function handleAddTaskDialogTransitionEnd(event, modalContent, onTransitionEnd, cleanup) {
  if (event && event.target !== modalContent) return;
  modalContent.removeEventListener("transitionend", onTransitionEnd);
  cleanup();
}

/**
 * Plays the slide-out close animation and invokes cleanup when it completes or times out.
 * @param {HTMLElement} modalContent - Content element being animated closed.
 * @param {Function} cleanup - Callback that finalizes dialog teardown.
 * @returns {void}
 */
function runAddTaskDialogCloseAnimation(modalContent, cleanup) {
  const onTransitionEnd = (event) => handleAddTaskDialogTransitionEnd(event, modalContent, onTransitionEnd, cleanup);
  modalContent.addEventListener("transitionend", onTransitionEnd);
  requestAnimationFrame(() => modalContent.classList.remove("is-open"));
  setTimeout(() => {
    modalContent.removeEventListener("transitionend", onTransitionEnd);
    cleanup();
  }, 400);
}

/**
 * Closes the dialog element, unlocks scroll, and clears the closing guard flag.
 * @param {HTMLDialogElement} dialogOverlay - Dialog element to close.
 * @returns {void}
 */
function finalizeAddTaskDialogClose(dialogOverlay) {
  dialogOverlay.close();
  unlockPageScrollForOverlay();
  dialogOverlay.dataset.closing = "false";
}

/**
 * Closes the board add-task dialog with a slide-out animation when content is present.
 * @returns {void}
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
