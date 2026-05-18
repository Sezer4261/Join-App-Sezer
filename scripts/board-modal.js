/**
 * Opens modal.
 * @param {string} id - Identifier.
 * @returns {void} Result.
 */
/**
 * Creates and returns the modal DOM element.
 * @param {Object} task - Task object.
 * @returns {HTMLElement} Result.
 */
function createModalElement(task) {
    const modal = document.createElement("div");
    modal.id = "task-modal";
    modal.className = "modal";
    modal.innerHTML = getTaskModalTemplate(task);
    return modal;
}

/**
 * Binds backdrop and content click events to the modal.
 * @param {HTMLElement} modal - Modal element.
 * @returns {void} Result.
 */
function bindModalEvents(modal) {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });
    const content = modal.querySelector(".modal-content");
    if (content) content.addEventListener("click", (e) => e.stopPropagation());
}

/**
 * Triggers open animation and subtask update.
 * @param {HTMLElement} modal - Modal element.
 * @param {Object} task - Task object.
 * @returns {void} Result.
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

function openModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    activeTask = task;
    const oldModal = document.getElementById("task-modal");
    if (oldModal) oldModal.remove();
    const modal = createModalElement(task);
    document.body.appendChild(modal);
    modal.style.display = "flex";
    bindModalEvents(modal);
    animateModalOpen(modal, task);
}

/**
 * Toggles subtask done.
 * @param {number} taskId - Task identifier.
 * @param {number} subIndex - Subtask index.
 * @param {HTMLInputElement} checkbox - Checkbox element.
 * @returns {Promise<*>} Result.
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
 * Updates modal subtasks.
 * @param {Object} task - Task object.
 * @returns {void} Result.
 */
function updateModalSubtasks(task) {
  const modal = document.getElementById("task-modal");
  if (!modal) return;
  const subtaskContainer = modal.querySelector(".modal-subtasks");
  if (!subtaskContainer) return;
  subtaskContainer.innerHTML = generateModalSubtasks(task);
}

/**
 * Closes modal.
 * @returns {void} Result.
 */
/**
 * Runs the slide-out closing animation, calling cleanup on completion.
 * @param {HTMLElement} modalContent - Modal content element.
 * @param {Function} cleanup - Cleanup function.
 * @returns {void} Result.
 */
function runModalCloseAnimation(modalContent, cleanup) {
    const onTransitionEnd = (event) => {
        if (event && event.target !== modalContent) return;
        modalContent.removeEventListener("transitionend", onTransitionEnd);
        cleanup();
    };
    modalContent.addEventListener("transitionend", onTransitionEnd);
    requestAnimationFrame(() => {
        modalContent.style.opacity = "0";
        modalContent.style.transform = "translateX(100%)";
    });
    setTimeout(() => {
        modalContent.removeEventListener("transitionend", onTransitionEnd);
        cleanup();
    }, 400);
}

function closeModal() {
    const modal = document.getElementById("task-modal");
    if (!modal) { activeTask = null; return; }
    if (modal.dataset.closing === "true") return;
    modal.dataset.closing = "true";
    const modalContent = modal.querySelector(".modal-content");
    const cleanup = () => { if (modal?.parentNode) modal.remove(); activeTask = null; };
    if (!modalContent) { cleanup(); return; }
    runModalCloseAnimation(modalContent, cleanup);
}
