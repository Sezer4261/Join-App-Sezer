/**
 * Shows add task dialog.
 * @returns {Promise<*>} Result.
 */
async function showAddTaskDialog() {
  const modalContent = document.getElementById("add-task-dialog-message");
  const dialogOverlay = document.getElementById("add-task-dialog");
  if (!dialogOverlay || !modalContent) return;

  dialogOverlay.dataset.closing = "false";
  dialogOverlay.classList.remove("d-none");

  modalContent.classList.remove("is-open");

  if (!window.addTaskDialogBackdropHandlerAdded) {
    window.addTaskDialogBackdropHandlerAdded = true;
    dialogOverlay.addEventListener("click", (event) => {
      // Close only on real backdrop clicks. Using contains(event.target) can break
      // when inner click handlers re-render/remove the original target node.
      if (event.target !== dialogOverlay) return;
      event.stopPropagation();
      closeAddTaskDialog();
    });
  }

  modalContent.innerHTML = generateAddTask({ variant: "dialog" });
  // force reflow so the transition runs every time
  void modalContent.offsetWidth;
  requestAnimationFrame(() => modalContent.classList.add("is-open"));
  await loadContacts();
  selectedContacts = [];
  selectContacts();
  renderSelectedAvatars();
  if (typeof initAddDropdownClose === "function") initAddDropdownClose();
  if (typeof initAddSubtaskEnter === "function") initAddSubtaskEnter();
}

/**
 * Closes add task dialog.
 * @returns {void} Result.
 */
function closeAddTaskDialog() {
  const dialogOverlay = document.getElementById("add-task-dialog");
  const modalContent = document.getElementById("add-task-dialog-message");
  if (!dialogOverlay) return;

  if (dialogOverlay.dataset.closing === "true") return;
  dialogOverlay.dataset.closing = "true";

  const cleanup = () => {
    dialogOverlay.classList.add("d-none");
    dialogOverlay.dataset.closing = "false";
  };

  if (!modalContent) {
    cleanup();
    return;
  }

  const onTransitionEnd = (event) => {
    if (event && event.target !== modalContent) return;
    modalContent.removeEventListener("transitionend", onTransitionEnd);
    cleanup();
  };

  modalContent.addEventListener("transitionend", onTransitionEnd);

  requestAnimationFrame(() => {
    modalContent.classList.remove("is-open");
  });

  setTimeout(() => {
    modalContent.removeEventListener("transitionend", onTransitionEnd);
    cleanup();
  }, 400);
}
