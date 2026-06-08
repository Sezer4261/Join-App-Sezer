/** @file Board columns and task card rendering. */

/**
 * Reads the numeric order field from a task when it is a finite number.
 * @param {Object} task - Task object that may contain an order property.
 * @returns {number|null} Parsed order value, or null when order is missing or invalid.
 */
function getTaskOrderValue(task) {
  const value = Number(task?.order);
  return Number.isFinite(value) ? value : null;
}

/**
 * Sorts tasks by order value while preserving original array index as a tiebreaker.
 * @param {Array} taskList - Tasks to order for display within one column.
 * @returns {Array} New array of tasks sorted for board display.
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
 * Returns tasks for one status column sorted in board display order.
 * @param {Array} taskList - Full task collection to filter and sort.
 * @param {string} status - Kanban status label matching the target column.
 * @returns {Array} Tasks belonging to the status in display order.
 */
function getTasksForStatusInDisplayOrder(taskList, status) {
  return getTasksInDisplayOrder(taskList.filter((task) => task.status === status));
}

/**
 * Determines whether task wrappers should use horizontal scrolling on compact widths.
 * @returns {boolean} True when the viewport is at or below the compact medium breakpoint.
 */
function shouldUseHorizontalTaskScroll() {
  return window.innerWidth <= BOARD_COMPACT_MEDIUM_MAX;
}

/**
 * Toggles the horizontal-scroll layout class on every column task wrapper.
 * @returns {void}
 */
function syncBoardTaskWrapperScrollLayout() {
  const useHorizontal = shouldUseHorizontalTaskScroll();
  document.querySelectorAll(".task-wrapper").forEach((wrapper) => {
    wrapper.classList.toggle("task-wrapper--horizontal-scroll", useHorizontal);
  });
}

/**
 * Re-renders the full board including search setup and touch-drag initialization.
 * @returns {void}
 */
function renderBoard() {
  initBoardSearch();
  initBoardResponsiveCompactMode();
  refreshTaskView();
  if (typeof initTouchDrag === "function") initTouchDrag();
}

/**
 * Registers the board resize listener once for compact layout recalculation.
 * @returns {void}
 */
function initBoardResponsiveCompactMode() {
  if (boardResponsiveHandlerAdded) return;
  boardResponsiveHandlerAdded = true;
  lastBoardCompactLimit = getCompactBoardVisibleTaskLimit();
  window.addEventListener("resize", handleBoardResponsiveResize, { passive: true });
}

/**
 * Reacts to viewport resize by syncing scroll layout and refreshing collapsed columns.
 * @returns {void}
 */
function handleBoardResponsiveResize() {
  syncBoardTaskWrapperScrollLayout();
  const nextCompactLimit = getCompactBoardVisibleTaskLimit();
  if (nextCompactLimit === lastBoardCompactLimit) {
    if (typeof initTouchDrag === "function") initTouchDrag();
    return;
  }
  lastBoardCompactLimit = nextCompactLimit;
  if (!nextCompactLimit) expandedBoardColumns.clear();
  refreshTaskView();
  if (typeof initTouchDrag === "function") initTouchDrag();
}

/**
 * Determines whether compact column preview mode should be active.
 * @returns {boolean} True when search is empty and the viewport is wide enough for preview mode.
 */
function shouldUseCompactBoardTaskPreview() {
  return !boardSearchTerm && window.innerWidth >= BOARD_COMPACT_MIN_WIDTH;
}

/**
 * Returns how many tasks each column may show before collapsing in compact mode.
 * @returns {number} Visible task limit per column, or 0 when compact preview is disabled.
 */
function getCompactBoardVisibleTaskLimit() {
  if (!shouldUseCompactBoardTaskPreview()) return 0;
  return window.innerWidth <= BOARD_COMPACT_MEDIUM_MAX
    ? BOARD_COMPACT_MEDIUM_VISIBLE
    : BOARD_COMPACT_DESKTOP_VISIBLE;
}

/**
 * Toggles whether a board column shows all tasks or only the compact preview subset.
 * @param {string} columnId - DOM id of the column whose expansion state changes.
 * @returns {void}
 */
function toggleBoardColumnExpansion(columnId) {
  if (expandedBoardColumns.has(columnId)) {
    expandedBoardColumns.delete(columnId);
  } else {
    expandedBoardColumns.add(columnId);
  }
  refreshTaskView();
  if (typeof initTouchDrag === "function") initTouchDrag();
}

/**
 * Syncs the search input value and wires input and clear-button handlers.
 * @returns {void}
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
 * Clears existing cards and re-renders tasks, placeholders, and avatars.
 * @returns {void}
 */
function refreshTaskView() {
  clearTaskCards();
  renderTasksIntoColumns();
  updateNoTaskPlaceholders();
  renderAllAvatars();
}

/**
 * Stores the trimmed search term and refreshes the filtered task view.
 * @param {HTMLInputElement} input - Search input whose value becomes the filter term.
 * @param {HTMLElement|null} clearBtn - Clear button whose visibility reflects the active term.
 * @returns {void}
 */
function updateBoardSearch(input, clearBtn) {
  boardSearchTerm = input.value.trim();
  refreshTaskView();
  if (clearBtn) clearBtn.classList.toggle("search-clear--visible", !!boardSearchTerm);
}

/**
 * Clears the board search term, re-renders tasks, and returns focus to the input.
 * @param {HTMLInputElement} input - Search input to reset and focus.
 * @param {HTMLElement|null} clearBtn - Clear button to hide after the term is cleared.
 * @returns {void}
 */
function clearBoardSearch(input, clearBtn) {
  boardSearchTerm = "";
  input.value = "";
  refreshTaskView();
  if (clearBtn) clearBtn.classList.toggle("search-clear--visible", !!boardSearchTerm);
  input.focus();
}

/**
 * Removes every rendered task card and summary card from the board DOM.
 * @returns {void}
 */
function clearTaskCards() {
  document.querySelectorAll(".task-card, .task-card-summary").forEach((card) => card.remove());
}

/**
 * Renders filtered tasks into all configured board columns.
 * @returns {void}
 */
function renderTasksIntoColumns() {
  const filteredTasks = getFilteredTasks();
  const compactVisibleLimit = getCompactBoardVisibleTaskLimit();
  BOARD_COLUMN_CONFIGS.forEach((columnConfig) => renderTasksForColumn(columnConfig, filteredTasks, compactVisibleLimit));
  syncBoardTaskWrapperScrollLayout();
}

/**
 * Computes which tasks are visible and whether a column needs a summary card.
 * @param {Array} columnTasks - Tasks already filtered to one column status.
 * @param {number} compactVisibleLimit - Maximum tasks shown before collapsing the column.
 * @param {string} columnId - DOM id of the column being evaluated.
 * @returns {{ visibleTasks: Array, shouldCollapse: boolean, expanded: boolean }} Column visibility state for rendering.
 */
function getColumnVisibleTasks(columnTasks, compactVisibleLimit, columnId) {
  const shouldCollapse = compactVisibleLimit > 0 && columnTasks.length > compactVisibleLimit;
  const expanded = shouldCollapse && expandedBoardColumns.has(columnId);
  const visibleTasks = shouldCollapse && !expanded
    ? columnTasks.slice(0, compactVisibleLimit)
    : columnTasks;
  return { visibleTasks, shouldCollapse, expanded };
}

/**
 * Appends visible task cards and an optional summary card into a column wrapper.
 * @param {HTMLElement} wrapper - Column task wrapper receiving the card markup.
 * @param {Array} visibleTasks - Task objects to render as cards in this pass.
 * @param {boolean} shouldCollapse - Whether the column hides tasks behind a summary card.
 * @param {number} hiddenCount - Number of tasks hidden when the column is collapsed.
 * @param {string} columnId - DOM id of the column receiving the cards.
 * @param {boolean} expanded - Whether the column currently shows all of its tasks.
 * @returns {void}
 */
function appendColumnTaskCards(wrapper, visibleTasks, shouldCollapse, hiddenCount, columnId, expanded) {
  for (let i = 0; i < visibleTasks.length; i++) {
    wrapper.insertAdjacentHTML("beforeend", createTaskCard(visibleTasks[i]));
  }
  if (shouldCollapse) {
    wrapper.insertAdjacentHTML("beforeend", createTaskSummaryCard(columnId, hiddenCount, expanded));
  }
}

/**
 * Renders all visible tasks for a single configured board column.
 * @param {Object} columnConfig - Column definition with id and status properties.
 * @param {Array} filteredTasks - Tasks already filtered by the active search term.
 * @param {number} compactVisibleLimit - Maximum tasks shown before collapsing the column.
 * @returns {void}
 */
function renderTasksForColumn(columnConfig, filteredTasks, compactVisibleLimit) {
  const column = document.getElementById(columnConfig.id);
  const wrapper = column?.querySelector(".task-wrapper");
  if (!wrapper) return;
  const columnTasks = getTasksForStatusInDisplayOrder(filteredTasks, columnConfig.status);
  const { visibleTasks, shouldCollapse, expanded } = getColumnVisibleTasks(columnTasks, compactVisibleLimit, columnConfig.id);
  const hiddenCount = columnTasks.length - compactVisibleLimit;
  appendColumnTaskCards(wrapper, visibleTasks, shouldCollapse, hiddenCount, columnConfig.id, expanded);
}

/**
 * Concatenates searchable task fields into one lowercase lookup string.
 * @param {Object} task - Task whose title, metadata, contacts, and subtasks are indexed.
 * @returns {string} Lowercase haystack used for board search matching.
 */
function buildTaskSearchHaystack(task) {
  const contactsText = Array.isArray(task.contacts) ? task.contacts.join(" ") : "";
  const subtasksText = Array.isArray(task.subtasks) ? task.subtasks.map((st) => st.title || "").join(" ") : "";
  return [task.title, task.description, task.category, task.priority, task.status, task.dueDate, contactsText, subtasksText].join(" ").toLowerCase();
}

/**
 * Returns the full task list or only tasks matching the current search term.
 * @returns {Array} Tasks visible on the board after applying the active search filter.
 */
function getFilteredTasks() {
  const term = boardSearchTerm.toLowerCase();
  if (!term) return tasks;
  return tasks.filter((task) => buildTaskSearchHaystack(task).includes(term));
}

/**
 * Wraps occurrences of the active search term in highlight markup.
 * @param {string} text - Source text displayed on a task card.
 * @returns {string} Original text or HTML with matched terms wrapped in mark elements.
 */
function highlightText(text) {
  if (!boardSearchTerm) return text;
  if (!text) return "";
  const escaped = escapeRegExp(boardSearchTerm);
  const regex = new RegExp(escaped, "gi");
  return text.replace(regex, (match) => `<mark class="search-term-highlight">${match}</mark>`);
}

/**
 * Escapes characters that would otherwise be treated as regex syntax.
 * @param {string} value - Raw user search text to sanitize for RegExp construction.
 * @returns {string} Escaped string safe to embed inside a regular expression.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Shows or hides the empty-column placeholder based on filtered task presence.
 * @param {Object} column - Column configuration with id and status properties.
 * @param {Array} filteredTasks - Tasks already filtered by the active search term.
 * @returns {void}
 */
function updateColumnPlaceholder(column, filteredTasks) {
  const el = document.getElementById(column.id);
  if (!el) return;
  const placeholder = el.querySelector(".no-tasks");
  if (!placeholder) return;
  placeholder.style.display = filteredTasks.some((t) => t.status === column.status) ? "none" : "flex";
}

/**
 * Updates empty-state placeholders for every configured board column.
 * @returns {void}
 */
function updateNoTaskPlaceholders() {
  const filteredTasks = getFilteredTasks();
  BOARD_COLUMN_CONFIGS.forEach((col) => updateColumnPlaceholder(col, filteredTasks));
}
