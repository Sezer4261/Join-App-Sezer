/**
 * Executes start drag logic.
 * @param {string} id - Identifier.
 * @returns {void} Result.
 */
function startDrag(id) {
  draggedTaskId = id;
}

const TASK_ORDER_STEP = 1024;
const LONG_PRESS_MS = 800;
const LONG_PRESS_MOVE_TOLERANCE = 12;

/**
 * Executes allow drop logic.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function allowDrop(event) {
  event.preventDefault();
}

/**
 * Highlights the column when a dragged card enters it.
 * @param {DragEvent} event - Browser drag event.
 * @param {string} colId - Target column element id.
 * @returns {void} Result.
 */
function dragEnterColumn(event, colId) {
  event.preventDefault();
  document.querySelectorAll('.board-column').forEach(c => c.classList.remove('drag-over'));
  const col = document.getElementById(colId);
  if (col) col.classList.add('drag-over');
}

/**
 * Removes the drag-over highlight when the dragged card leaves a column.
 * @param {DragEvent} event - Browser drag event.
 * @param {string} colId - Column element id.
 * @returns {void} Result.
 */
function dragLeaveColumn(event, colId) {
  const col = document.getElementById(colId);
  if (col && !col.contains(event.relatedTarget)) {
    col.classList.remove('drag-over');
  }
}

/**
 * Executes drop task logic.
 * @param {Event} event - Browser event.
 * @param {*} newStatus - Parameter.
 * @returns {void} Result.
 */
function dropTask(event, newStatus) {
  event.preventDefault();
  document.querySelectorAll('.board-column').forEach(c => c.classList.remove('drag-over'));
  const placement = getTaskMovePlacementFromPoint(event.clientX, event.clientY, newStatus);
  moveTaskToPlacement(draggedTaskId, placement.status, placement.anchorTaskId, placement.insertAfter);
  draggedTaskId = null;
  renderBoard();
}

// ── Long-press drag (≤620px stacked layout) ────────────────────────────────────

let touchDragClone = null;
let touchDragOffsetX = 0;
let touchDragOffsetY = 0;
let longPressTimer = null;
let longPressCard = null;
let longPressStartX = 0;
let longPressStartY = 0;
let dragSourceCard = null;
let suppressClickUntil = 0;
let lastTouchStartTime = 0;

const COLUMN_STATUS = {
  'todo-column':       'To Do',
  'inprogress-column': 'In Progress',
  'awaiting-column':   'Await Feedback',
  'done-column':       'Done',
};

/**
 * Returns the task card under the given screen coordinates.
 * @param {number} x - Horizontal screen coordinate.
 * @param {number} y - Vertical screen coordinate.
 * @returns {HTMLElement|null} Result.
 */
function getTaskCardAtPoint(x, y) {
  const elements = document.elementsFromPoint(x, y);
  for (const element of elements) {
    const card = element.closest?.('.task-card[data-task-id]');
    if (!card || card.classList.contains('task-card-summary')) continue;
    if (parseInt(card.dataset.taskId, 10) === draggedTaskId) continue;
    return card;
  }
  return null;
}

/**
 * Returns the intended move placement for the dragged task.
 * @param {number} x - Horizontal screen coordinate.
 * @param {number} y - Vertical screen coordinate.
 * @param {string} fallbackStatus - Target status when no anchor task is hit.
 * @returns {{status: string, anchorTaskId: number|null, insertAfter: boolean}} Result.
 */
function getTaskMovePlacementFromPoint(x, y, fallbackStatus) {
  const targetCard = getTaskCardAtPoint(x, y);
  if (!targetCard) {
    return { status: fallbackStatus, anchorTaskId: null, insertAfter: false };
  }
  const rect = targetCard.getBoundingClientRect();
  const targetColumn = targetCard.closest('.board-column');
  return {
    status: COLUMN_STATUS[targetColumn?.id] || fallbackStatus,
    anchorTaskId: parseInt(targetCard.dataset.taskId, 10),
    insertAfter: y > rect.top + rect.height / 2,
  };
}

/**
 * Applies sequential order values to the given tasks.
 * @param {Array} orderedTasks - Ordered task list.
 * @returns {void} Result.
 */
function assignSequentialTaskOrder(orderedTasks) {
  orderedTasks.forEach((task, index) => {
    task.order = (index + 1) * TASK_ORDER_STEP;
  });
}

/**
 * Persists the changed task order for the affected columns.
 * @param {Array} affectedStatuses - Board status list.
 * @returns {void} Result.
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
 * Moves the given task to a concrete position in the target column.
 * @param {number|string} taskId - Dragged task id.
 * @param {string} targetStatus - Target column status.
 * @param {number|null} anchorTaskId - Neighbor task id.
 * @param {boolean} insertAfter - Whether to insert after the anchor task.
 * @returns {void} Result.
 */
function moveTaskToPlacement(taskId, targetStatus, anchorTaskId = null, insertAfter = false) {
  const draggedTask = tasks.find((task) => task.id === taskId);
  if (!draggedTask) return;
  const sourceStatus = draggedTask.status;
  draggedTask.status = targetStatus;

  const targetColumnTasks = getTasksForStatusInDisplayOrder(tasks, targetStatus)
    .filter((task) => task.id !== draggedTask.id);
  let insertIndex = targetColumnTasks.length;

  if (anchorTaskId !== null) {
    const anchorIndex = targetColumnTasks.findIndex((task) => task.id === anchorTaskId);
    if (anchorIndex !== -1) insertIndex = insertAfter ? anchorIndex + 1 : anchorIndex;
  }

  targetColumnTasks.splice(insertIndex, 0, draggedTask);
  assignSequentialTaskOrder(targetColumnTasks);

  const affectedStatuses = [targetStatus];
  if (sourceStatus !== targetStatus) {
    assignSequentialTaskOrder(getTasksForStatusInDisplayOrder(tasks, sourceStatus));
    affectedStatuses.push(sourceStatus);
  }

  persistColumnTaskOrderChanges(affectedStatuses);
}

/**
 * Returns the board column id whose element is at the given screen coordinates.
 * @param {number} x - Horizontal screen coordinate.
 * @param {number} y - Vertical screen coordinate.
 * @returns {string|null} Column id, or null if none found.
 */
function getColumnIdAtPoint(x, y) {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    if (el.id && COLUMN_STATUS[el.id]) return el.id;
    const col = el.closest('[id]');
    if (col && COLUMN_STATUS[col.id]) return col.id;
  }
  return null;
}

/**
 * Creates a drag clone element positioned at rect.
 * @param {HTMLElement} card - Source card.
 * @param {DOMRect} rect - Bounding rect.
 * @returns {HTMLElement} Result.
 */
function createTouchDragClone(card, rect) {
  const clone = card.cloneNode(true);
  clone.style.cssText = `
    position: fixed;
    left: ${rect.left}px; top: ${rect.top}px;
    width: ${rect.width}px; opacity: 0.85;
    pointer-events: none; z-index: 9999;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    border-radius: 12px; transition: none;
  `;
  return clone;
}

/**
 * True when board uses stacked columns (mobile overlay drag).
 * @returns {boolean} Result.
 */
function isStackedBoardLayout() {
  if (window.innerWidth <= 620) return true;
  const boardColumns = document.querySelector('.board-columns');
  if (!boardColumns) return false;
  return window.getComputedStyle(boardColumns).flexDirection === 'column';
}

/**
 * Enables native HTML5 drag only on wider layouts.
 * @returns {void} Result.
 */
function updateTaskCardDraggable() {
  const useNativeDrag = !isStackedBoardLayout();
  document.querySelectorAll('.task-card:not(.task-card-summary)').forEach((card) => {
    card.draggable = useNativeDrag;
  });
}

/**
 * Clears the long-press timer only.
 * @returns {void} Result.
 */
function clearLongPressTimer() {
  clearTimeout(longPressTimer);
  longPressTimer = null;
}

/**
 * Resets all long-press / drag state.
 * @returns {void} Result.
 */
function resetLongPressState() {
  clearLongPressTimer();
  longPressCard = null;
}

/**
 * Activates long-press drag and shows the drop overlay.
 * @param {HTMLElement} card - Task card element.
 * @param {number} clientX - Pointer X.
 * @param {number} clientY - Pointer Y.
 * @param {DOMRect} rect - Card bounds.
 * @returns {void} Result.
 */
function activateLongPressDrag(card, clientX, clientY, rect) {
  draggedTaskId = parseInt(card.dataset.taskId, 10);
  dragSourceCard = card;
  touchDragOffsetX = clientX - rect.left;
  touchDragOffsetY = clientY - rect.top;
  touchDragClone = createTouchDragClone(card, rect);
  document.body.appendChild(touchDragClone);
  card.style.opacity = '0.3';
  const overlay = document.getElementById('mobile-drop-overlay');
  if (overlay) overlay.classList.add('active');
  updateDragAtPoint(clientX, clientY);
}

/**
 * Updates clone position and drop highlights.
 * @param {number} clientX - Pointer X.
 * @param {number} clientY - Pointer Y.
 * @returns {void} Result.
 */
function updateDragAtPoint(clientX, clientY) {
  if (!touchDragClone) return;
  touchDragClone.style.left = (clientX - touchDragOffsetX) + 'px';
  touchDragClone.style.top = (clientY - touchDragOffsetY) + 'px';
  document.querySelectorAll('.board-column').forEach(c => c.classList.remove('drag-over'));
  const colId = getColumnIdAtPoint(clientX, clientY);
  if (colId) document.getElementById(colId)?.classList.add('drag-over');
  updateMobileDropHighlights(document.getElementById('mobile-drop-overlay'), clientX, clientY);
}

/**
 * Highlights the mobile drop button under the pointer.
 * @param {HTMLElement|null} overlay - Overlay element.
 * @param {number} clientX - Pointer X.
 * @param {number} clientY - Pointer Y.
 * @returns {void} Result.
 */
function updateMobileDropHighlights(overlay, clientX, clientY) {
  if (!overlay || !overlay.classList.contains('active')) return;
  overlay.querySelectorAll('.mobile-drop-btn').forEach(btn => {
    const r = btn.getBoundingClientRect();
    const over = clientX >= r.left && clientX <= r.right &&
                 clientY >= r.top && clientY <= r.bottom;
    btn.classList.toggle('drop-active', over);
  });
}

/**
 * Applies drop to a column from the overlay.
 * @param {string|null} colId - Target column id.
 * @returns {void} Result.
 */
function applyLongPressDrop(colId) {
  if (!colId || !COLUMN_STATUS[colId]) {
    document.querySelectorAll('.task-card').forEach(c => { c.style.opacity = ''; });
    return;
  }
  moveTaskToPlacement(draggedTaskId, COLUMN_STATUS[colId]);
  renderBoard();
  initTouchDrag();
}

/**
 * Reads overlay button under point and hides overlay.
 * @param {HTMLElement|null} overlay - Overlay element.
 * @param {number} clientX - Pointer X.
 * @param {number} clientY - Pointer Y.
 * @returns {string|null} Column id or null.
 */
function getMobileDropColId(overlay, clientX, clientY) {
  if (!overlay || !overlay.classList.contains('active')) return null;
  let colId = null;
  overlay.querySelectorAll('.mobile-drop-btn').forEach(btn => {
    const r = btn.getBoundingClientRect();
    if (clientX >= r.left && clientX <= r.right &&
        clientY >= r.top && clientY <= r.bottom) {
      colId = btn.dataset.col;
    }
  });
  overlay.classList.remove('active');
  overlay.querySelectorAll('.mobile-drop-btn').forEach(b => b.classList.remove('drop-active'));
  return colId;
}

/**
 * Ends drag and applies drop at the given coordinates.
 * @param {number} clientX - Pointer X.
 * @param {number} clientY - Pointer Y.
 * @returns {void} Result.
 */
function finishLongPressDrag(clientX, clientY) {
  if (!touchDragClone) return;

  suppressClickUntil = Date.now() + 400;
  document.querySelectorAll('.board-column').forEach(c => c.classList.remove('drag-over'));

  const mobileColId = getMobileDropColId(
    document.getElementById('mobile-drop-overlay'),
    clientX,
    clientY
  );

  if (mobileColId) {
    applyLongPressDrop(mobileColId);
  } else {
    const fallbackColId = getColumnIdAtPoint(clientX, clientY);
    const fallbackStatus = COLUMN_STATUS[fallbackColId] || null;
    const placement = getTaskMovePlacementFromPoint(clientX, clientY, fallbackStatus);
    if (placement.status) {
      moveTaskToPlacement(draggedTaskId, placement.status, placement.anchorTaskId, placement.insertAfter);
    }
    renderBoard();
    initTouchDrag();
  }

  if (dragSourceCard) dragSourceCard.style.opacity = '';
  touchDragClone.remove();
  touchDragClone = null;
  dragSourceCard = null;
  draggedTaskId = null;
  resetLongPressState();
}

/**
 * Starts long-press timer for a card.
 * @param {HTMLElement} card - Task card.
 * @param {number} clientX - Start X.
 * @param {number} clientY - Start Y.
 * @returns {void} Result.
 */
function beginLongPress(card, clientX, clientY) {
  if (!isStackedBoardLayout()) return;

  resetLongPressState();
  longPressCard = card;
  longPressStartX = clientX;
  longPressStartY = clientY;

  longPressTimer = setTimeout(() => {
    if (longPressCard !== card) return;
    const rect = card.getBoundingClientRect();
    activateLongPressDrag(card, longPressStartX, longPressStartY, rect);
    longPressCard = null;
  }, LONG_PRESS_MS);
}

/**
 * Cancels long-press if the pointer moved too far before activation.
 * @param {number} clientX - Current X.
 * @param {number} clientY - Current Y.
 * @returns {void} Result.
 */
function maybeCancelLongPressOnMove(clientX, clientY) {
  if (!longPressCard || touchDragClone) return;
  const dx = clientX - longPressStartX;
  const dy = clientY - longPressStartY;
  if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_TOLERANCE) {
    resetLongPressState();
  }
}

// ── Touch handlers (phones / touch emulation) ─────────────────────────────────

/**
 * @param {TouchEvent} event
 */
function onTouchStart(event) {
  if (!isStackedBoardLayout()) return;
  lastTouchStartTime = Date.now();
  const card = event.currentTarget;
  const touch = event.touches[0];
  beginLongPress(card, touch.clientX, touch.clientY);
}

/**
 * @param {TouchEvent} event
 */
function onTouchMove(event) {
  const touch = event.touches[0];
  maybeCancelLongPressOnMove(touch.clientX, touch.clientY);
  if (!touchDragClone) return;
  event.preventDefault();
  updateDragAtPoint(touch.clientX, touch.clientY);
}

/**
 * @param {TouchEvent} event
 */
function onTouchEnd(event) {
  clearLongPressTimer();
  if (touchDragClone) {
    const touch = event.changedTouches[0];
    finishLongPressDrag(touch.clientX, touch.clientY);
    return;
  }
  resetLongPressState();
}

// ── Mouse handlers (DevTools responsive with mouse) ───────────────────────────

/**
 * @param {MouseEvent} event
 */
function onMouseDown(event) {
  if (!isStackedBoardLayout()) return;
  if (event.button !== 0) return;
  // Ignore synthetic mouse events after touch (mobile browsers).
  if (Date.now() - lastTouchStartTime < 600) return;
  beginLongPress(event.currentTarget, event.clientX, event.clientY);
  document.addEventListener('mousemove', onDocumentMouseMove);
  document.addEventListener('mouseup', onDocumentMouseUp);
}

/**
 * @param {MouseEvent} event
 */
function onDocumentMouseMove(event) {
  maybeCancelLongPressOnMove(event.clientX, event.clientY);
  if (!touchDragClone) return;
  event.preventDefault();
  updateDragAtPoint(event.clientX, event.clientY);
}

/**
 * @param {MouseEvent} event
 */
function onDocumentMouseUp(event) {
  document.removeEventListener('mousemove', onDocumentMouseMove);
  document.removeEventListener('mouseup', onDocumentMouseUp);
  clearLongPressTimer();
  if (touchDragClone) {
    finishLongPressDrag(event.clientX, event.clientY);
    return;
  }
  resetLongPressState();
}

/**
 * Prevents opening the task modal right after a drag.
 * @param {MouseEvent} event
 */
function onCardClickCapture(event) {
  if (Date.now() < suppressClickUntil) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}

/**
 * Attaches long-press drag listeners to task cards.
 * @returns {void} Result.
 */
function initTouchDrag() {
  updateTaskCardDraggable();

  document.querySelectorAll('.task-card:not(.task-card-summary)').forEach(card => {
    const id = card.dataset.taskId || card.getAttribute('ondragstart')?.match(/\d+/)?.[0];
    if (!id) return;
    card.dataset.taskId = id;

    card.removeEventListener('touchstart', onTouchStart);
    card.removeEventListener('touchmove', onTouchMove);
    card.removeEventListener('touchend', onTouchEnd);
    card.removeEventListener('mousedown', onMouseDown);
    card.removeEventListener('click', onCardClickCapture, true);

    card.addEventListener('touchstart', onTouchStart, { passive: true });
    card.addEventListener('touchmove', onTouchMove, { passive: false });
    card.addEventListener('touchend', onTouchEnd, { passive: true });
    card.addEventListener('mousedown', onMouseDown);
    card.addEventListener('click', onCardClickCapture, true);
    card.addEventListener('contextmenu', e => e.preventDefault());
  });
}
