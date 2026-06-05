function getTaskOrderValue(task) {
  const value = Number(task?.order);
  return Number.isFinite(value) ? value : null;
}

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

function getTasksForStatusInDisplayOrder(taskList, status) {
  return getTasksInDisplayOrder(taskList.filter((task) => task.status === status));
}

function shouldUseHorizontalTaskScroll() {
  return window.innerWidth <= BOARD_COMPACT_MEDIUM_MAX;
}

function syncBoardTaskWrapperScrollLayout() {
  const useHorizontal = shouldUseHorizontalTaskScroll();
  document.querySelectorAll(".task-wrapper").forEach((wrapper) => {
    wrapper.classList.toggle("task-wrapper--horizontal-scroll", useHorizontal);
  });
}

function renderBoard() {
  initBoardSearch();
  initBoardResponsiveCompactMode();
  refreshTaskView();
  if (typeof initTouchDrag === "function") initTouchDrag();
}

function initBoardResponsiveCompactMode() {
  if (boardResponsiveHandlerAdded) return;
  boardResponsiveHandlerAdded = true;
  lastBoardCompactLimit = getCompactBoardVisibleTaskLimit();
  window.addEventListener("resize", handleBoardResponsiveResize, { passive: true });
}

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

function shouldUseCompactBoardTaskPreview() {
  return !boardSearchTerm && window.innerWidth >= BOARD_COMPACT_MIN_WIDTH;
}

function getCompactBoardVisibleTaskLimit() {
  if (!shouldUseCompactBoardTaskPreview()) return 0;
  return window.innerWidth <= BOARD_COMPACT_MEDIUM_MAX
    ? BOARD_COMPACT_MEDIUM_VISIBLE
    : BOARD_COMPACT_DESKTOP_VISIBLE;
}

function toggleBoardColumnExpansion(columnId) {
  if (expandedBoardColumns.has(columnId)) {
    expandedBoardColumns.delete(columnId);
  } else {
    expandedBoardColumns.add(columnId);
  }
  refreshTaskView();
  if (typeof initTouchDrag === "function") initTouchDrag();
}

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

function refreshTaskView() {
  clearTaskCards();
  renderTasksIntoColumns();
  updateNoTaskPlaceholders();
  renderAllAvatars();
}

function updateBoardSearch(input, clearBtn) {
  boardSearchTerm = input.value.trim();
  refreshTaskView();
  if (clearBtn) clearBtn.classList.toggle("search-clear--visible", !!boardSearchTerm);
}

function clearBoardSearch(input, clearBtn) {
  boardSearchTerm = "";
  input.value = "";
  refreshTaskView();
  if (clearBtn) clearBtn.classList.toggle("search-clear--visible", !!boardSearchTerm);
  input.focus();
}

function clearTaskCards() {
  document.querySelectorAll(".task-card, .task-card-summary").forEach((card) => card.remove());
}

function renderTasksIntoColumns() {
  const filteredTasks = getFilteredTasks();
  const compactVisibleLimit = getCompactBoardVisibleTaskLimit();
  BOARD_COLUMN_CONFIGS.forEach((columnConfig) => renderTasksForColumn(columnConfig, filteredTasks, compactVisibleLimit));
  syncBoardTaskWrapperScrollLayout();
}

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
    const hiddenCount = columnTasks.length - compactVisibleLimit;
    wrapper.insertAdjacentHTML("beforeend", createTaskSummaryCard(columnConfig.id, hiddenCount, expanded));
  }
}

function getFilteredTasks() {
  const term = boardSearchTerm.toLowerCase();
  if (!term) return tasks;
  return tasks.filter((task) => {
    const contactsText = Array.isArray(task.contacts) ? task.contacts.join(" ") : "";
    const subtasksText = Array.isArray(task.subtasks) ? task.subtasks.map((st) => st.title || "").join(" ") : "";
    const haystack = [task.title, task.description, task.category, task.priority, task.status, task.dueDate, contactsText, subtasksText].join(" ").toLowerCase();
    return haystack.includes(term);
  });
}

function highlightText(text) {
  if (!boardSearchTerm) return text;
  if (!text) return "";
  const escaped = escapeRegExp(boardSearchTerm);
  const regex = new RegExp(escaped, "gi");
  return text.replace(regex, (match) => `<mark class="search-term-highlight">${match}</mark>`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateColumnPlaceholder(column, filteredTasks) {
  const el = document.getElementById(column.id);
  if (!el) return;
  const placeholder = el.querySelector(".no-tasks");
  if (!placeholder) return;
  placeholder.style.display = filteredTasks.some((t) => t.status === column.status) ? "none" : "flex";
}

function updateNoTaskPlaceholders() {
  const filteredTasks = getFilteredTasks();
  BOARD_COLUMN_CONFIGS.forEach((col) => updateColumnPlaceholder(col, filteredTasks));
}
