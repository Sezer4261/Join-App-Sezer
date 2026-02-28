let colors = [
  "#f4b400", // Gelb
  "#9333ea", // Lila
  "#ef4444", // Rot
  "#f97316"  // Orange
];

let boardSearchTerm = "";

/**
 * Renders board.
 * @returns {void} Result.
 */
function renderBoard() {
  const content = document.getElementById("board-content");
  content.innerHTML = getBoardTemplate();
  initBoardSearch();
  renderTasksIntoColumns();
  updateNoTaskPlaceholders();
  renderAllAvatars();
}

/**
 * Initializes board search.
 * @returns {void} Result.
 */
function initBoardSearch() {
  const input = document.getElementById("search-task");
  const clearBtn = document.getElementById("search-clear");
  if (!input) return;
  input.value = boardSearchTerm;
  input.oninput = () => updateBoardSearch(input, clearBtn);
  if (clearBtn) {
    clearBtn.onclick = () => clearBoardSearch(input, clearBtn);
    clearBtn.style.visibility = boardSearchTerm ? "visible" : "hidden";
  }
}

/**
 * Updates board search.
 * @param {HTMLElement} input - Input element.
 * @param {*} clearBtn - Parameter.
 * @returns {void} Result.
 */
function updateBoardSearch(input, clearBtn) {
  boardSearchTerm = input.value.trim();
  clearTaskCards();
  renderTasksIntoColumns();
  updateNoTaskPlaceholders();
  renderAllAvatars();
  if (clearBtn) clearBtn.style.visibility = boardSearchTerm ? "visible" : "hidden";
}

/**
 * Clears board search.
 * @param {HTMLElement} input - Input element.
 * @param {*} clearBtn - Parameter.
 * @returns {void} Result.
 */
function clearBoardSearch(input, clearBtn) {
  boardSearchTerm = "";
  input.value = "";
  clearTaskCards();
  renderTasksIntoColumns();
  updateNoTaskPlaceholders();
  renderAllAvatars();
  if (clearBtn) clearBtn.style.visibility = boardSearchTerm ? "visible" : "hidden";
  input.focus();
}

/**
 * Clears task cards.
 * @returns {void} Result.
 */
function clearTaskCards() {
  const cards = document.querySelectorAll(".task-card");
  cards.forEach((card) => card.remove());
}

/**
 * Renders tasks into columns.
 * @returns {void} Result.
 */
function renderTasksIntoColumns() {
  const filteredTasks = getFilteredTasks();
  for (let i = 0; i < filteredTasks.length; i++) {
    const task = filteredTasks[i];
    const column = getColumnByStatus(task.status);
    if (!column) continue;
    column.innerHTML += createTaskCard(task);
  }
}

/**
 * Returns column by status.
 * @param {string} status - Status value.
 * @returns {*} Result.
 */
function getColumnByStatus(status) {
  if (status === "To Do") return document.getElementById("todo-column");
  if (status === "In Progress") return document.getElementById("inprogress-column");
  if (status === "Await Feedback") return document.getElementById("awaiting-column");
  if (status === "Done") return document.getElementById("done-column");
  return null;
}

/**
 * Renders all avatars.
 * @returns {void} Result.
 */
function renderAllAvatars() {
  const filteredTasks = getFilteredTasks();
  for (let i = 0; i < filteredTasks.length; i++) {
    renderAvatar(filteredTasks[i]);
  }
}

/**
 * Returns filtered tasks.
 * @returns {*} Result.
 */
function getFilteredTasks() {
  const term = boardSearchTerm.toLowerCase();
  if (!term) return tasks;
  return tasks.filter((task) => {
    const contactsText = Array.isArray(task.contacts) ? task.contacts.join(" ") : "";
    const subtasksText = Array.isArray(task.subtasks) ? task.subtasks.map(st => st.title || "").join(" ") : "";
    const haystack = [task.title, task.description, task.category, task.priority, task.status, task.dueDate, contactsText, subtasksText].join(" ").toLowerCase();
    return haystack.includes(term);
  });
}

/**
 * Executes highlight text logic.
 * @param {*} text - Parameter.
 * @returns {void} Result.
 */
function highlightText(text) {
  if (!boardSearchTerm) return text;
  if (!text) return "";
  const escaped = escapeRegExp(boardSearchTerm);
  const regex = new RegExp(escaped, "gi");
  return text.replace(regex, (match) => `<mark class="search-highlight">${match}</mark>`);
}

/**
 * Executes escape reg exp logic.
 * @param {string} value - Value.
 * @returns {void} Result.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Loads tasks.
 * @returns {Promise<*>} Result.
 */
async function loadTasks() {
  try {
    const response = await fetch(`${BASE_URL}/tasks.json`);
    const data = await response.json();
    tasks = data ? Object.entries(data).map(([id, task]) => ({ firebaseId: id, ...task })) : [];
  } catch (error) {
    console.error("Fehler beim Laden der Tasks:", error);
  }
  renderBoard();
}

/**
 * Updates task.
 * @param {Object} task - Task object.
 * @returns {Promise<*>} Result.
 */
async function updateTask(task) {
  try {
    const { firebaseId, ...taskData } = task;
    await fetch(`${BASE_URL}/tasks/${firebaseId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
  } catch (error) {
    console.error("Fehler beim Updaten des Tasks:", error);
  }
}

/**
 * Deletes task.
 * @returns {Promise<*>} Result.
 */
async function deleteTask() {
  if (!activeTask) return;
  try {
    await fetch(`${BASE_URL}/tasks/${activeTask.firebaseId}.json`, { method: "DELETE" });
    tasks = tasks.filter(t => t.firebaseId !== activeTask.firebaseId);
    closeModal();
    renderBoard();
  } catch (error) {
    console.error("Fehler beim Löschen des Tasks:", error);
  }
}

/**
 * Renders avatar.
 * @param {Object} task - Task object.
 * @returns {void} Result.
 */
function renderAvatar(task) {
  let container = document.getElementById(`avatars-${task.id}`);
  if (!container) return;
  container.innerHTML = "";
  let contacts = Array.isArray(task.contacts) ? task.contacts : [];
  for (let i = 0; i < contacts.length; i++) {
    const name = contacts[i];
    if (!name) continue;
    const initials = name.split(" ").map(n => n[0]).join("");
    container.innerHTML += getAvatarMarkup(initials, getRandomColor());
  }
}

/**
 * Returns random color.
 * @returns {*} Result.
 */
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Executes start drag logic.
 * @param {string} id - Identifier.
 * @returns {void} Result.
 */
function startDrag(id) {
  draggedTaskId = id;
}

/**
 * Executes allow drop logic.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function allowDrop(event) {
  event.preventDefault();
}

/**
 * Executes drop task logic.
 * @param {Event} event - Browser event.
 * @param {*} newStatus - Parameter.
 * @returns {void} Result.
 */
function dropTask(event, newStatus) {
  event.preventDefault();
  const task = tasks.find(t => t.id === draggedTaskId);
  if (!task) return;
  task.status = newStatus;
  updateTask(task);
  renderBoard();
}

/**
 * Opens modal.
 * @param {string} id - Identifier.
 * @returns {void} Result.
 */
function openModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  activeTask = task;
  const oldModal = document.getElementById("taskModal");
  if (oldModal) oldModal.remove();
  const modal = document.createElement("div");
  modal.id = "taskModal"; modal.className = "modal";
  modal.innerHTML = getTaskModalTemplate(task);
  document.body.appendChild(modal); modal.style.display = "flex";

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
  const modal = document.getElementById("taskModal");
  if (!modal) return;
  const subtaskContainer = modal.querySelector(".modal-subtasks");
  if (!subtaskContainer) return;
  subtaskContainer.innerHTML = generateModalSubtasks(task);
}

/**
 * Opens edit task modal.
 * @param {string} id - Identifier.
 * @returns {Promise<*>} Result.
 */
async function openEditTaskModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  activeTask = task;
  editSubtasks = Array.isArray(task.subtasks) ? task.subtasks.map(st => ({ ...st })) : [];
  selectedContacts = Array.isArray(task.contacts) ? [...task.contacts] : [];
  window.editingEditSubtaskIndex = null;
  const modal = document.getElementById("taskModal");
  if (!modal) return;
  const modalContent = modal.querySelector(".modal-content");
  if (!modalContent) return;
  modalContent.innerHTML = generateEditTaskTemplate(task);
  await loadContacts();
  renderEditAssignedContacts();
  renderEditSubtasks();
  initEditDropdownClose();
}

/**
 * Renders edit assigned contacts.
 * @returns {void} Result.
 */
function renderEditAssignedContacts() {
  const dropdown = document.getElementById("dropdownContacts");
  if (!dropdown) return;
  dropdown.innerHTML = generateAssignedContacts(contacts);
  renderSelectedAvatars();
}

/**
 * Toggles edit category dropdown.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function toggleEditCategoryDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById("editCategoryDropdown");
  if (!dropdown) return;
  dropdown.classList.toggle("show");
}

/**
 * Sets edit category.
 * @param {string} value - Value.
 * @returns {void} Result.
 */
function setEditCategory(value) {
  const input = document.getElementById("edit-category");
  const select = document.getElementById("editCategorySelect");
  if (!input || !select) return;
  input.value = value;
  input.classList.remove('input-error');
  select.classList.remove('input-error');
  setEditErrorText('editCategoryError', '');
  const label = select.querySelector("span");
  if (label) {
    label.childNodes[0].textContent = value + " ";
  }
  const dropdown = document.getElementById("editCategoryDropdown");
  if (dropdown) dropdown.classList.remove("show");
}

/**
 * Sets edit error text.
 * @param {string} id - Identifier.
 * @param {string} value - Value.
 * @returns {void} Result.
 */
function setEditErrorText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/**
 * Clears edit validation errors.
 * @returns {void} Result.
 */
function clearEditValidationErrors() {
  setEditErrorText('editTitleError', '');
  setEditErrorText('editDateError', '');
  setEditErrorText('editCategoryError', '');
}

/**
 * Validates required input in edit form.
 * @param {HTMLElement} input - Input element.
 * @param {string} errorId - Error element id.
 * @param {HTMLElement} highlightElement - Element to highlight (defaults to input).
 * @returns {boolean} Result.
 */
function validateEditRequiredInput(input, errorId, highlightElement = input) {
  const value = input ? String(input.value ?? '').trim() : '';
  if (!input || !value) {
    setEditErrorText(errorId, 'This field is required');
    input?.classList.add('input-error');
    if (highlightElement && highlightElement !== input) {
      highlightElement.classList.add('input-error');
    }
    return false;
  }
  input.classList.remove('input-error');
  if (highlightElement && highlightElement !== input) {
    highlightElement.classList.remove('input-error');
  }
  return true;
}

/**
 * Scrolls edit form to the given element (inside overflow container).
 * @param {HTMLElement|null} target - Target element.
 * @returns {void} Result.
 */
function scrollEditFormTo(target) {
  if (!target) return;
  const scrollContainer = document.querySelector('#editTaskForm .edit-form-scroll');
  if (!scrollContainer) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const containerRect = scrollContainer.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const offsetTop = targetRect.top - containerRect.top + scrollContainer.scrollTop - 16;
  scrollContainer.scrollTo({ top: offsetTop, behavior: 'smooth' });
}

/**
 * Validates edit form.
 * @returns {boolean} Result.
 */
function validateEditForm() {
  clearEditValidationErrors();
  const titleInput = document.getElementById('edit-title');
  const dateInput = document.getElementById('edit-date');
  const categoryInput = document.getElementById('edit-category');
  const categorySelect = document.getElementById('editCategorySelect');

  const invalid = [];

  if (!validateEditRequiredInput(titleInput, 'editTitleError')) {
    invalid.push({ errorId: 'editTitleError', focusEl: titleInput });
  }

  if (!validateEditRequiredInput(dateInput, 'editDateError')) {
    invalid.push({ errorId: 'editDateError', focusEl: dateInput });
  }

  if (!validateEditRequiredInput(categoryInput, 'editCategoryError', categorySelect)) {
    invalid.push({ errorId: 'editCategoryError', focusEl: categorySelect });
  }

  if (invalid.length > 0) {
    const first = invalid[0];
    const errorEl = document.getElementById(first.errorId);
    scrollEditFormTo(errorEl || first.focusEl);
    try {
      first.focusEl?.focus?.();
    } catch (e) {
      // ignore focus errors
    }
    return false;
  }

  return true;
}

/**
 * Initializes edit dropdown close.
 * @returns {void} Result.
 */
function initEditDropdownClose() {
  if (window.editDropdownHandlerAdded) return;
  window.editDropdownHandlerAdded = true;
  document.addEventListener("click", () => {
    const contactsDropdown = document.getElementById("dropdownContacts");
    if (contactsDropdown) contactsDropdown.classList.remove("show");
    const categoryDropdown = document.getElementById("editCategoryDropdown");
    if (categoryDropdown) categoryDropdown.classList.remove("show");
  });
}

/**
 * Renders edit subtasks.
 * @returns {void} Result.
 */
function renderEditSubtasks() {
  const area = document.getElementById("editSubtaskArea");
  if (!area) return;
  area.innerHTML = "";
  editSubtasks.forEach((st, i) => appendEditSubtask(area, st, i));
}

/**
 * Executes append edit subtask logic.
 * @param {*} area - Parameter.
 * @param {Object} subtask - Subtask object.
 * @param {number} index - Index.
 * @returns {void} Result.
 */
function appendEditSubtask(area, subtask, index) {
  const isEditing = window.editingEditSubtaskIndex === index;
  const markup = isEditing
    ? getEditSubtaskEditMarkup(subtask, index)
    : getEditSubtaskItemMarkup(subtask, index);
  area.innerHTML += markup;
}

/**
 * Adds edit subtask.
 * @returns {void} Result.
 */
function addEditSubtask() {
  const input = document.getElementById("edit-subtask-input");
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;
  editSubtasks.push({ title: value, done: false });
  input.value = "";
  renderEditSubtasks();
}

/**
 * Deletes edit subtask.
 * @param {number} i - Index.
 * @returns {void} Result.
 */
function deleteEditSubtask(i) {
  editSubtasks.splice(i, 1);
  if (window.editingEditSubtaskIndex === i) {
    window.editingEditSubtaskIndex = null;
  } else if (typeof window.editingEditSubtaskIndex === "number" && i < window.editingEditSubtaskIndex) {
    window.editingEditSubtaskIndex -= 1;
  }
  renderEditSubtasks();
}

/**
 * Clears edit subtask input.
 * @returns {void} Result.
 */
function clearEditSubtaskInput() {
  const input = document.getElementById("edit-subtask-input");
  if (!input) return;
  input.value = "";
  input.focus();
}

/**
 * Executes edit edit subtask logic.
 * @param {number} i - Index.
 * @returns {void} Result.
 */
function editEditSubtask(i) {
  window.editingEditSubtaskIndex = i;
  renderEditSubtasks();
  const input = document.getElementById(`edit-subtask-edit-${i}`);
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

/**
 * Saves edited edit subtask.
 * @param {number} i - Index.
 * @returns {void} Result.
 */
function saveEditedEditSubtask(i) {
  const input = document.getElementById(`edit-subtask-edit-${i}`);
  if (!input) return;
  const value = input.value.trim();
  if (!value) {
    alert("Bitte eine Subtask beschreiben!");
    return;
  }
  editSubtasks[i].title = value;
  window.editingEditSubtaskIndex = null;
  renderEditSubtasks();
}

/**
 * Saves edited task.
 * @param {Event} event - Browser event.
 * @param {string} id - Identifier.
 * @returns {Promise<*>} Result.
 */
async function saveEditedTask(event, id) {
  event.preventDefault();
  if (!validateEditForm()) return;
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  updateTaskFromEditForm(task);
  await updateTask(task);
  renderBoard();
  openModal(id);
}

/**
 * Updates task from edit form.
 * @param {Object} task - Task object.
 * @returns {void} Result.
 */
function updateTaskFromEditForm(task) {
  const titleEl = document.getElementById("edit-title");
  const descEl = document.getElementById("edit-description");
  task.title = titleEl ? titleEl.value.trim() : "";
  task.description = descEl ? descEl.value.trim() : "";
  task.dueDate = document.getElementById("edit-date").value;
  task.category = document.getElementById("edit-category").value;
  task.priority = document.querySelector('input[name="edit-priority"]:checked').value;
  task.contacts = [...selectedContacts];
  task.subtasks = editSubtasks.map(st => ({ ...st }));
}

/**
 * Shows add task dialog.
 * @returns {Promise<*>} Result.
 */
async function showAddTaskDialog() {
  const modalContent = document.getElementById("addTask-dialog-message");
  document.getElementById("addTask-dialog").classList.remove("d-none");
  modalContent.innerHTML = generateAddTask();
  await loadContacts();
  selectedContacts = [];
  selectContacts();
  renderSelectedAvatars();
  if (typeof initAddDropdownClose === "function") initAddDropdownClose();
}

/**
 * Closes add task dialog.
 * @returns {void} Result.
 */
function closeAddTaskDialog() {
  document.getElementById("addTask-dialog").classList.add("d-none");
}

/**
 * Updates no task placeholders.
 * @returns {void} Result.
 */
function updateNoTaskPlaceholders() {
  const filteredTasks = getFilteredTasks();
  const columns = [
    { id: "todo-column", status: "To Do" },
    { id: "inprogress-column", status: "In Progress" },
    { id: "awaiting-column", status: "Await Feedback" },
    { id: "done-column", status: "Done" }
  ];
  for (let i = 0; i < columns.length; i++) {
    const columnElement = document.getElementById(columns[i].id);
    if (!columnElement) continue;
    const placeholder = columnElement.querySelector(".no-tasks");
    if (!placeholder) continue;
    placeholder.style.display = filteredTasks.some(task => task.status === columns[i].status) ? "none" : "flex";
  }
}

/**
 * Closes modal.
 * @returns {void} Result.
 */
function closeModal() {
  const modal = document.getElementById("taskModal");
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
