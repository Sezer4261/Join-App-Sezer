/**
 * Executes start drag logic.
 * @param {string} id - Identifier.
 * @returns {void} Result.
 */
function startDrag(id) {
  draggedTaskId = id;
}

const TASK_ORDER_STEP = 1024;

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
  // Only remove if leaving to outside the column entirely
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

// ── Touch Drag & Drop ────────────────────────────────────────────────────────

let touchDragClone = null;
let touchDragOffsetX = 0;
let touchDragOffsetY = 0;

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

let longPressTimer;

clearTimeout(longPressTimer);

/**
 * Determines if the mobile drop overlay should be shown based on layout.
 * Shows overlay for vertical stacked column layouts (typically ≤620px).
 * @returns {boolean} Result.
 */
function shouldShowMobileDropOverlay() {
  // Check if columns are vertically stacked (not horizontally scrolling)
  const boardColumns = document.querySelector('.board-columns');
  if (!boardColumns) return false;
  const style = window.getComputedStyle(boardColumns);
  // If flex-direction is column (vertical stacking), show overlay
  return style.flexDirection === 'column' || window.innerWidth <= 620;
}

/**
 * Activates touch drag: records the dragged task, creates the visual clone
 * and shows the mobile drop overlay on small screens.
 * @param {HTMLElement} card - Task card element.
 * @param {Touch} touch - The initiating touch point.
 * @param {DOMRect} rect - Bounding rect of the card.
 * @returns {void} Result.
 */
function activateTouchDrag(card, touch, rect) {
  draggedTaskId = parseInt(card.dataset.taskId, 10);
  touchDragOffsetX = touch.clientX - rect.left;
  touchDragOffsetY = touch.clientY - rect.top;
  touchDragClone = createTouchDragClone(card, rect);
  document.body.appendChild(touchDragClone);
  card.style.opacity = '0.3';
  if (shouldShowMobileDropOverlay()) {
    const overlay = document.getElementById('mobile-drop-overlay');
    if (overlay) overlay.classList.add('active');
  }
}

/**
 * Handles touchstart on a task card to start the long-press drag timer.
 * @param {TouchEvent} event - Browser touch event.
 * @returns {void} Result.
 */
function onTouchStart(event) {
  const card = event.currentTarget;
  const touch = event.touches[0];
  const rect = card.getBoundingClientRect();
  longPressTimer = setTimeout(() => activateTouchDrag(card, touch, rect), 500);
}

/**
 * Highlights the mobile drop button that the user's finger is currently over.
 * @param {HTMLElement|null} overlay - The mobile drop overlay element.
 * @param {Touch} touch - Current touch point.
 * @returns {void} Result.
 */
function updateMobileDropHighlights(overlay, touch) {
  if (!overlay || !overlay.classList.contains('active')) return;
  overlay.querySelectorAll('.mobile-drop-btn').forEach(btn => {
    const r = btn.getBoundingClientRect();
    const over = touch.clientX >= r.left && touch.clientX <= r.right &&
                 touch.clientY >= r.top  && touch.clientY <= r.bottom;
    btn.classList.toggle('drop-active', over);
  });
}

/**
 * Moves the drag clone to follow the finger and highlights the column below.
 * @param {TouchEvent} event - Browser touch event.
 * @returns {void} Result.
 */
function onTouchMove(event) {
  if (!touchDragClone) return;
  event.preventDefault();
  const touch = event.touches[0];
  touchDragClone.style.left = (touch.clientX - touchDragOffsetX) + 'px';
  touchDragClone.style.top  = (touch.clientY - touchDragOffsetY) + 'px';
  document.querySelectorAll('.board-column').forEach(c => c.classList.remove('drag-over'));
  const colId = getColumnIdAtPoint(touch.clientX, touch.clientY);
  if (colId) document.getElementById(colId).classList.add('drag-over');
  updateMobileDropHighlights(document.getElementById('mobile-drop-overlay'), touch);
}

/**
 * Applies a successful touch drop to the target column, or restores card.
 * @param {string|null} colId - Target column id.
 * @returns {void} Result.
 */
function applyTouchDrop(colId) {
  if (!colId || !COLUMN_STATUS[colId]) {
    document.querySelectorAll('.task-card').forEach(c => c.style.opacity = '');
    return;
  }
  moveTaskToPlacement(draggedTaskId, COLUMN_STATUS[colId]);
  renderBoard();
  initTouchDrag();
}

/**
 * Reads which mobile drop button the touch ended on, then dismisses the overlay.
 * @param {HTMLElement|null} overlay - The mobile drop overlay element.
 * @param {Touch} touch - The final touch point.
 * @returns {string|null} Column id of the chosen button, or null.
 */
function getMobileDropColId(overlay, touch) {
  if (!overlay || !overlay.classList.contains('active')) return null;
  let colId = null;
  overlay.querySelectorAll('.mobile-drop-btn').forEach(btn => {
    const r = btn.getBoundingClientRect();
    if (touch.clientX >= r.left && touch.clientX <= r.right &&
        touch.clientY >= r.top  && touch.clientY <= r.bottom) {
      colId = btn.dataset.col;
    }
  });
  overlay.classList.remove('active');
  overlay.querySelectorAll('.mobile-drop-btn').forEach(b => b.classList.remove('drop-active'));
  return colId;
}

/**
 * Handles touchend: clears the long-press timer, suppresses the synthetic click,
 * and applies the drop to the target column.
 * @param {TouchEvent} event - Browser touch event.
 * @returns {void} Result.
 */
function onTouchEnd(event) {
  clearTimeout(longPressTimer);
  if (!touchDragClone) return;
  // Suppress only the immediate synthetic click the browser fires after touchend
  // (arrives within ~50 ms). Real user clicks take longer and must not be blocked.
  const dragEndTime = Date.now();
  document.addEventListener('click', (e) => {
    if (Date.now() - dragEndTime < 350) e.stopImmediatePropagation();
  }, { capture: true, once: true });
  const touch = event.changedTouches[0];
  document.querySelectorAll('.board-column').forEach(c => c.classList.remove('drag-over'));
  const mobileColId = getMobileDropColId(document.getElementById('mobile-drop-overlay'), touch);
  if (mobileColId) {
    applyTouchDrop(mobileColId);
  } else {
    const fallbackColId = getColumnIdAtPoint(touch.clientX, touch.clientY);
    const fallbackStatus = COLUMN_STATUS[fallbackColId] || null;
    const placement = getTaskMovePlacementFromPoint(touch.clientX, touch.clientY, fallbackStatus);
    if (placement.status) moveTaskToPlacement(draggedTaskId, placement.status, placement.anchorTaskId, placement.insertAfter);
    renderBoard();
    initTouchDrag();
  }
  touchDragClone.remove();
  touchDragClone = null;
  draggedTaskId = null;
}

/**
 * Attaches touch drag listeners to every task card on the board.
 * @returns {void} Result.
 */
function initTouchDrag() {
  document.querySelectorAll('.task-card:not(.task-card-summary)').forEach(card => {
    const id = card.dataset.taskId || card.getAttribute('ondragstart')?.match(/\d+/)?.[0];
    if (!id) return;
    card.dataset.taskId = id;
    card.removeEventListener('touchstart', onTouchStart);
    card.removeEventListener('touchmove',  onTouchMove);
    card.removeEventListener('touchend',   onTouchEnd);
    card.addEventListener('touchstart', onTouchStart, { passive: true });
    card.addEventListener('touchmove',  onTouchMove,  { passive: false });
    card.addEventListener('touchend',   onTouchEnd,   { passive: true });
    card.addEventListener('contextmenu', e => e.preventDefault());
  });
}
