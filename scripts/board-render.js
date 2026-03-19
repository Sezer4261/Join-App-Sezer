/**
 * Renders board.
 * @returns {void} Result.
 */
function renderBoard() {
  initBoardSearch();
  clearTaskCards();
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
    const wrapper = column.querySelector(".task-wrapper");
    (wrapper || column).innerHTML += createTaskCard(task);
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
