/**
 * Opens modal.
 * @param {string} id - Identifier.
 * @returns {void} Result.
 */
function openModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  activeTask = task;
  const oldModal = document.getElementById("task-modal");
  if (oldModal) oldModal.remove();
  const modal = document.createElement("div");
  modal.id = "task-modal";
  modal.className = "modal";
  modal.innerHTML = getTaskModalTemplate(task);
  document.body.appendChild(modal);
  modal.style.display = "flex";

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  const modalContent = modal.querySelector(".modal-content");
  if (modalContent) {
    modalContent.addEventListener("click", (event) => event.stopPropagation());
  }

  setTimeout(() => updateModalSubtasks(task), 0);
  setTimeout(() => {
    if (modalContent) {
      modalContent.style.opacity = "1";
      modalContent.style.transform = "translateX(0)";
    }
  }, 10);
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
function closeModal() {
  const modal = document.getElementById("task-modal");
  if (!modal) {
    activeTask = null;
    return;
  }

  if (modal.dataset.closing === "true") return;
  modal.dataset.closing = "true";

  const modalContent = modal.querySelector(".modal-content");
  const cleanup = () => {
    if (modal && modal.parentNode) modal.remove();
    activeTask = null;
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
    modalContent.style.opacity = "0";
    modalContent.style.transform = "translateX(100%)";
  });

  setTimeout(() => {
    modalContent.removeEventListener("transitionend", onTransitionEnd);
    cleanup();
  }, 400);
}
