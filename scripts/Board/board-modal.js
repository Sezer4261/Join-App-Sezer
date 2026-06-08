/** @file Task detail modal open and close behavior. */

/**
 * Builds a dialog element populated with the task detail template.
 * @param {Object} task - Task whose data fills the modal content.
 * @returns {HTMLElement} Newly created modal dialog element.
 */
function createModalElement(task) {
    const modal = document.createElement("dialog");
    modal.id = "task-modal";
    modal.className = "modal";
    modal.innerHTML = getTaskModalTemplate(task);
    return modal;
}

/**
 * Closes the task modal when the user clicks the dialog backdrop.
 * @param {MouseEvent} event - Click event on the modal dialog.
 * @returns {void}
 */
function handleModalBackdropClick(event) {
    if (event.target === event.currentTarget) closeModal();
}

/**
 * Prevents the native dialog cancel event and closes the modal instead.
 * @param {Event} event - Cancel event from the dialog element.
 * @returns {void}
 */
function handleModalCancel(event) {
    event.preventDefault();
    closeModal();
}

/**
 * Stops click propagation from modal content so backdrop clicks do not close it.
 * @param {MouseEvent} event - Click event inside the modal content panel.
 * @returns {void}
 */
function handleModalContentClick(event) {
    event.stopPropagation();
}

/**
 * Attaches backdrop, cancel, and content click handlers to the modal.
 * @param {HTMLElement} modal - Modal dialog element to wire up.
 * @returns {void}
 */
function bindModalEvents(modal) {
    modal.addEventListener("click", handleModalBackdropClick);
    modal.addEventListener("cancel", handleModalCancel);
    const content = modal.querySelector(".modal-content");
    if (content) content.addEventListener("click", handleModalContentClick);
}

/**
 * Defers subtask rendering and runs the slide-in open animation.
 * @param {HTMLElement} modal - Open modal dialog element.
 * @param {Object} task - Task whose subtasks should be rendered in the modal.
 * @returns {void}
 */
function animateModalOpen(modal, task) {
    const content = modal.querySelector(".modal-content");
    setTimeout(() => updateModalSubtasks(task), 0);
    setTimeout(() => {
        if (content) {
            content.style.opacity = "1";
            content.style.transform = "translateX(0)";
        }
    }, 10);
}

/**
 * Opens the read-only task detail modal for the given task id.
 * @param {string} id - Identifier of the task to display.
 * @returns {void}
 */
function openModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    activeTask = task;
    const oldModal = document.getElementById("task-modal");
    if (oldModal) oldModal.remove();
    const modal = createModalElement(task);
    document.body.appendChild(modal);
    lockPageScrollForOverlay();
    modal.showModal();
    bindModalEvents(modal);
    animateModalOpen(modal, task);
}

/**
 * Toggles a subtask checkbox, persists the task, and refreshes board and modal UI.
 * @param {number} taskId - Identifier of the parent task.
 * @param {number} subIndex - Zero-based index of the subtask within the task.
 * @param {HTMLInputElement} checkbox - Checkbox whose checked state reflects completion.
 * @returns {Promise<void>} Resolves after Firebase update and UI refresh.
 */
async function toggleSubtaskDone(taskId, subIndex, checkbox) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.subtasks[subIndex].done = checkbox.checked;
  await updateTask(task);
  renderBoard();
  updateModalSubtasks(task);
}

/**
 * Re-renders the subtask checklist inside the currently open task modal.
 * @param {Object} task - Task whose subtasks should appear in the modal.
 * @returns {void}
 */
function updateModalSubtasks(task) {
  const modal = document.getElementById("task-modal");
  if (!modal) return;
  const subtaskContainer = modal.querySelector(".modal-subtasks");
  if (!subtaskContainer) return;
  subtaskContainer.innerHTML = generateModalSubtasks(task);
}

/**
 * Begins the slide-out opacity and transform transition on modal content.
 * @param {HTMLElement} modalContent - Inner panel element that animates on close.
 * @returns {void}
 */
function startModalCloseTransition(modalContent) {
    requestAnimationFrame(() => {
        modalContent.style.opacity = "0";
        modalContent.style.transform = "translateX(100%)";
    });
}

/**
 * Runs cleanup if the close transition does not emit transitionend within 400 ms.
 * @param {HTMLElement} modalContent - Inner panel element being animated closed.
 * @param {Function} onTransitionEnd - Transition-end listener to detach on fallback.
 * @param {Function} cleanup - Callback that removes the modal and unlocks scroll.
 * @returns {void}
 */
function scheduleModalCloseFallback(modalContent, onTransitionEnd, cleanup) {
    setTimeout(() => {
        modalContent.removeEventListener("transitionend", onTransitionEnd);
        cleanup();
    }, 400);
}

/**
 * Plays the slide-out close animation and invokes cleanup when it finishes.
 * @param {HTMLElement} modalContent - Inner panel element being animated closed.
 * @param {Function} cleanup - Callback that removes the modal and unlocks scroll.
 * @returns {void}
 */
function runModalCloseAnimation(modalContent, cleanup) {
    const onTransitionEnd = (event) => {
        if (event && event.target !== modalContent) return;
        modalContent.removeEventListener("transitionend", onTransitionEnd);
        cleanup();
    };
    modalContent.addEventListener("transitionend", onTransitionEnd);
    startModalCloseTransition(modalContent);
    scheduleModalCloseFallback(modalContent, onTransitionEnd, cleanup);
}

/**
 * Closes the task detail modal with a slide-out animation and clears activeTask.
 * @returns {void}
 */
function closeModal() {
    const modal = document.getElementById("task-modal");
    if (!modal) { activeTask = null; return; }
    if (modal.dataset.closing === "true") return;
    modal.dataset.closing = "true";
    const modalContent = modal.querySelector(".modal-content");
    const cleanup = () => { if (modal?.parentNode) { modal.close(); modal.remove(); } unlockPageScrollForOverlay(); activeTask = null; };
    if (!modalContent) { cleanup(); return; }
    runModalCloseAnimation(modalContent, cleanup);
}
