/** @file Task reordering and column placement for board drag-and-drop. */

const TASK_ORDER_STEP = 1024;

/** @type {Record<string, string>} */
const COLUMN_STATUS = {
  "todo-column": "To Do",
  "inprogress-column": "In Progress",
  "awaiting-column": "Await Feedback",
  "done-column": "Done",
};

/**
 * @param {number} x
 * @param {number} y
 * @returns {HTMLElement|null}
 */
function getTaskCardAtPoint(x, y) {
  const elements = document.elementsFromPoint(x, y);
  for (const element of elements) {
    const card = element.closest?.(".task-card[data-task-id]");
    if (!card || card.classList.contains("task-card-summary")) continue;
    if (parseInt(card.dataset.taskId, 10) === draggedTaskId) continue;
    return card;
  }
  return null;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {string} fallbackStatus
 */
function getTaskMovePlacementFromPoint(x, y, fallbackStatus) {
  const targetCard = getTaskCardAtPoint(x, y);
  if (!targetCard) return { status: fallbackStatus, anchorTaskId: null, insertAfter: false };
  const rect = targetCard.getBoundingClientRect();
  const targetColumn = targetCard.closest(".board-column");
  return {
    status: COLUMN_STATUS[targetColumn?.id] || fallbackStatus,
    anchorTaskId: parseInt(targetCard.dataset.taskId, 10),
    insertAfter: y > rect.top + rect.height / 2,
  };
}

/** @param {Array} orderedTasks */
function assignSequentialTaskOrder(orderedTasks) {
  orderedTasks.forEach((task, index) => {
    task.order = (index + 1) * TASK_ORDER_STEP;
  });
}

/** @param {string[]} affectedStatuses */
function persistColumnTaskOrderChanges(affectedStatuses) {
  const seenFirebaseIds = new Set();
  const changedTasks = [];
  affectedStatuses.forEach((status) => {
    getTasksForStatusInDisplayOrder(tasks, status).forEach((task) => {
      if (!task?.firebaseId || seenFirebaseIds.has(task.firebaseId)) return;
      seenFirebaseIds.add(task.firebaseId);
      changedTasks.push(task);
    });
  });
  changedTasks.forEach((task) => updateTask(task));
}

/**
 * Resolves the insert index for a task within a target column.
 * @param {Array} targetColumnTasks - Tasks in the target column excluding the dragged task.
 * @param {number|null} anchorTaskId - Anchor task id for relative placement.
 * @param {boolean} insertAfter - Whether to insert after the anchor task.
 * @returns {number}
 */
function getTargetColumnInsertIndex(targetColumnTasks, anchorTaskId, insertAfter) {
  let insertIndex = targetColumnTasks.length;
  if (anchorTaskId === null) return insertIndex;
  const anchorIndex = targetColumnTasks.findIndex((task) => task.id === anchorTaskId);
  if (anchorIndex !== -1) insertIndex = insertAfter ? anchorIndex + 1 : anchorIndex;
  return insertIndex;
}

/**
 * Reorders source and target columns after a task move and persists changes.
 * @param {Object} draggedTask - Moved task object.
 * @param {string} sourceStatus - Original column status.
 * @param {string} targetStatus - Destination column status.
 * @param {Array} targetColumnTasks - Reordered tasks in the target column.
 * @returns {void}
 */
function finalizeTaskColumnReorder(draggedTask, sourceStatus, targetStatus, targetColumnTasks) {
  assignSequentialTaskOrder(targetColumnTasks);
  const affectedStatuses = [targetStatus];
  if (sourceStatus !== targetStatus) {
    assignSequentialTaskOrder(getTasksForStatusInDisplayOrder(tasks, sourceStatus));
    affectedStatuses.push(sourceStatus);
  }
  persistColumnTaskOrderChanges(affectedStatuses);
}

/**
 * @param {number|string} taskId
 * @param {string} targetStatus
 * @param {number|null} [anchorTaskId]
 * @param {boolean} [insertAfter]
 */
function moveTaskToPlacement(taskId, targetStatus, anchorTaskId = null, insertAfter = false) {
  const draggedTask = tasks.find((task) => task.id === taskId);
  if (!draggedTask) return;
  const sourceStatus = draggedTask.status;
  draggedTask.status = targetStatus;
  const targetColumnTasks = getTasksForStatusInDisplayOrder(tasks, targetStatus)
    .filter((task) => task.id !== draggedTask.id);
  const insertIndex = getTargetColumnInsertIndex(targetColumnTasks, anchorTaskId, insertAfter);
  targetColumnTasks.splice(insertIndex, 0, draggedTask);
  finalizeTaskColumnReorder(draggedTask, sourceStatus, targetStatus, targetColumnTasks);
}

/**
 * @param {number} x
 * @param {number} y
 * @returns {string|null}
 */
function getColumnIdAtPoint(x, y) {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    if (el.id && COLUMN_STATUS[el.id]) return el.id;
    const col = el.closest("[id]");
    if (col && COLUMN_STATUS[col.id]) return col.id;
  }
  return null;
}
