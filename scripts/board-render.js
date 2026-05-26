const BOARD_COLUMN_CONFIGS = [
  { id: "todo-column", status: "To Do" },
  { id: "inprogress-column", status: "In Progress" },
  { id: "awaiting-column", status: "Await Feedback" },
  { id: "done-column", status: "Done" }
];

const COMPACT_BOARD_MEDIUM_VISIBLE_TASKS = 2;
const COMPACT_BOARD_DESKTOP_VISIBLE_TASKS = 4;

/**
 * Returns the numeric task order if present.
 * @param {Object} task - Task object.
 * @returns {number|null} Result.
 */
function getTaskOrderValue(task) {
  const value = Number(task?.order);
  return Number.isFinite(value) ? value : null;
}

/**
 * Returns the given tasks in stable display order.
 * @param {Array} taskList - Task list.
 * @returns {Array} Ordered task list.
 */
function getTasksInDisplayOrder(taskList) {
  return taskList
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const aOrder = getTaskOrderValue(a.task);
      const bOrder = getTaskOrderValue(b.task);
      if (aOrder !== null && bOrder !== null && aOrder !== bOrder) return aOrder - bOrder;
      return a.index - b.index;
    })
    .map(({ task }) => task);
}

/**
 * Returns all tasks for the given column status in display order.
 * @param {Array} taskList - Task list.
 * @param {string} status - Board status.
 * @returns {Array} Ordered task list for the status.
 */
function getTasksForStatusInDisplayOrder(taskList, status) {
  return getTasksInDisplayOrder(taskList.filter((task) => task.status === status));
}

/**
 * Renders board.
 * @returns {void} Result.
 */
function renderBoard() {
  initBoardSearch();
  initBoardResponsiveCompactMode();
  refreshTaskView();
  if (typeof initTouchDrag === 'function') initTouchDrag();
}

/**
 * Registers the resize handler for compact board rendering.
 * @returns {void} Result.
 */
function initBoardResponsiveCompactMode() {
  if (boardResponsiveHandlerAdded) return;
  boardResponsiveHandlerAdded = true;
  lastBoardCompactLimit = getCompactBoardVisibleTaskLimit();
  window.addEventListener("resize", handleBoardResponsiveResize, { passive: true });
}

/**
 * Re-renders the board when the compact preview mode changes.
 * @returns {void} Result.
 */
function handleBoardResponsiveResize() {
  const nextCompactLimit = getCompactBoardVisibleTaskLimit();
  if (nextCompactLimit === lastBoardCompactLimit) return;
  lastBoardCompactLimit = nextCompactLimit;
  if (!nextCompactLimit) expandedBoardColumns.clear();
  refreshTaskView();
  if (typeof initTouchDrag === 'function') initTouchDrag();
}

/**
 * Returns whether the board should show compact task previews per column.
 * @returns {boolean} Result.
 */
function shouldUseCompactBoardTaskPreview() {
  return !boardSearchTerm && window.innerWidth >= 621;
}

/**
 * Returns the number of visible tasks per compact board column for the current width.
 * @returns {number} Result.
 */
function getCompactBoardVisibleTaskLimit() {
  if (!shouldUseCompactBoardTaskPreview()) return 0;
  return window.innerWidth <= 1140
    ? COMPACT_BOARD_MEDIUM_VISIBLE_TASKS
    : COMPACT_BOARD_DESKTOP_VISIBLE_TASKS;
}

/**
 * Toggles a compact column between collapsed and expanded state.
 * @param {string} columnId - Column id.
 * @returns {void} Result.
 */
function toggleBoardColumnExpansion(columnId) {
  if (expandedBoardColumns.has(columnId)) {
    expandedBoardColumns.delete(columnId);
  } else {
    expandedBoardColumns.add(columnId);
  }
  refreshTaskView();
  if (typeof initTouchDrag === 'function') initTouchDrag();
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
    clearBtn.classList.toggle("search-clear--visible", !!boardSearchTerm);
  }
}

/**
 * Clears all task cards and re-renders them with the current search filter.
 * @returns {void} Result.
 */
function refreshTaskView() {
  clearTaskCards();
  renderTasksIntoColumns();
  updateNoTaskPlaceholders();
  renderAllAvatars();
}

/**
 * Updates the active search term and refreshes the board task view.
 * @param {HTMLElement} input - Search input element.
 * @param {HTMLElement} clearBtn - Clear button element.
 * @returns {void} Result.
 */
function updateBoardSearch(input, clearBtn) {
  boardSearchTerm = input.value.trim();
  refreshTaskView();
  if (clearBtn) clearBtn.classList.toggle("search-clear--visible", !!boardSearchTerm);
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
  refreshTaskView();
  if (clearBtn) clearBtn.classList.toggle("search-clear--visible", !!boardSearchTerm);
  input.focus();
}

/**
 * Clears task cards.
 * @returns {void} Result.
 */
function clearTaskCards() {
  const cards = document.querySelectorAll(".task-card, .task-card-summary");
  cards.forEach((card) => card.remove());
}

/**
 * Renders tasks into columns.
 * @returns {void} Result.
 */
function renderTasksIntoColumns() {
  const filteredTasks = getFilteredTasks();
  const compactVisibleLimit = getCompactBoardVisibleTaskLimit();
  BOARD_COLUMN_CONFIGS.forEach((columnConfig) => renderTasksForColumn(columnConfig, filteredTasks, compactVisibleLimit));
}

/**
 * Renders one board column including the compact +N summary card.
 * @param {{id: string, status: string}} columnConfig - Column config.
 * @param {Array} filteredTasks - Filtered task list.
 * @param {number} compactVisibleLimit - Number of visible tasks in compact mode, or 0 when disabled.
 * @returns {void} Result.
 */
function renderTasksForColumn(columnConfig, filteredTasks, compactVisibleLimit) {
  const column = document.getElementById(columnConfig.id);
  const wrapper = column?.querySelector(".task-wrapper");
  if (!wrapper) return;
  const columnTasks = getTasksForStatusInDisplayOrder(filteredTasks, columnConfig.status);
  const shouldCollapse = compactVisibleLimit > 0 && columnTasks.length > compactVisibleLimit;
  const expanded = shouldCollapse && expandedBoardColumns.has(columnConfig.id);
  const visibleTasks = shouldCollapse && !expanded
    ? columnTasks.slice(0, compactVisibleLimit)
    : columnTasks;
  for (let i = 0; i < visibleTasks.length; i++) {
    wrapper.insertAdjacentHTML("beforeend", createTaskCard(visibleTasks[i]));
  }
  if (shouldCollapse) {
    wrapper.insertAdjacentHTML(
      "beforeend",
      createTaskSummaryCard(columnConfig.id, compactVisibleLimit, expanded)
    );
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
  return text.replace(regex, (match) => `<mark class="search-term-highlight">${match}</mark>`);
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
/**
 * Updates placeholder visibility for a single column.
 * @param {{id: string, status: string}} column - Column config.
 * @param {Array} filteredTasks - Filtered task list.
 * @returns {void} Result.
 */
function updateColumnPlaceholder(column, filteredTasks) {
    const el = document.getElementById(column.id);
    if (!el) return;
    const placeholder = el.querySelector(".no-tasks");
    if (!placeholder) return;
    placeholder.style.display = filteredTasks.some(t => t.status === column.status) ? "none" : "flex";
}

function updateNoTaskPlaceholders() {
    const filteredTasks = getFilteredTasks();
  BOARD_COLUMN_CONFIGS.forEach(col => updateColumnPlaceholder(col, filteredTasks));
}
