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
 * Finds the topmost task card under the pointer, excluding the dragged card.
 * @param {number} x - Pointer X coordinate in viewport pixels.
 * @param {number} y - Pointer Y coordinate in viewport pixels.
 * @returns {HTMLElement|null} Matching task card element, or null when none is hit.
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
 * Determines target column status and insert position from pointer coordinates.
 * @param {number} x - Pointer X coordinate in viewport pixels.
 * @param {number} y - Pointer Y coordinate in viewport pixels.
 * @param {string} fallbackStatus - Status used when no task card is under the pointer.
 * @returns {{ status: string, anchorTaskId: number|null, insertAfter: boolean }} Resolved drop placement.
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

/**
 * Assigns evenly spaced order values to tasks in their current list sequence.
 * @param {Array} orderedTasks - Tasks in the desired display order within one column.
 * @returns {void}
 */
function assignSequentialTaskOrder(orderedTasks) {
  orderedTasks.forEach((task, index) => {
    task.order = (index + 1) * TASK_ORDER_STEP;
  });
}

/**
 * Persists order updates for every task in the affected column statuses.
 * @param {string[]} affectedStatuses - Kanban status labels whose tasks may have changed order.
 * @returns {void}
 */
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
 * Calculates where a dragged task should be inserted within a target column.
 * @param {Array} targetColumnTasks - Tasks in the destination column excluding the dragged task.
 * @param {number|null} anchorTaskId - Task id used as the relative insertion anchor.
 * @param {boolean} insertAfter - Whether to place the dragged task after the anchor.
 * @returns {number} Zero-based index at which the dragged task should be spliced in.
 */
function getTargetColumnInsertIndex(targetColumnTasks, anchorTaskId, insertAfter) {
  let insertIndex = targetColumnTasks.length;
  if (anchorTaskId === null) return insertIndex;
  const anchorIndex = targetColumnTasks.findIndex((task) => task.id === anchorTaskId);
  if (anchorIndex !== -1) insertIndex = insertAfter ? anchorIndex + 1 : anchorIndex;
  return insertIndex;
}

/**
 * Reorders affected columns after a move and persists the new order values.
 * @param {Object} draggedTask - Task that changed column or position.
 * @param {string} sourceStatus - Original kanban status before the move.
 * @param {string} targetStatus - Destination kanban status after the move.
 * @param {Array} targetColumnTasks - Reordered task list for the destination column.
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
 * Moves a task to a target column and inserts it relative to an optional anchor task.
 * @param {number|string} taskId - Identifier of the task being moved.
 * @param {string} targetStatus - Destination kanban status label.
 * @param {number|null} [anchorTaskId=null] - Task id used to position the insertion.
 * @param {boolean} [insertAfter=false] - Whether to insert after the anchor task.
 * @returns {void}
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
 * Resolves the board column element id under the given pointer coordinates.
 * @param {number} x - Pointer X coordinate in viewport pixels.
 * @param {number} y - Pointer Y coordinate in viewport pixels.
 * @returns {string|null} Column DOM id when a board column is hit, otherwise null.
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
