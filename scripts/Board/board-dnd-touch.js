/** @file Long-press and touch drag for stacked board layouts. */

const LONG_PRESS_MS = 800;
const LONG_PRESS_MOVE_TOLERANCE = 12;

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

/**
 * Creates a fixed-position visual clone of a task card for touch dragging.
 * @param {HTMLElement} card - Source task card element being dragged.
 * @param {DOMRect} rect - Bounding rectangle used to position the clone.
 * @returns {HTMLElement} Detached clone element appended during an active drag.
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
 * Determines whether the board is currently in stacked single-column layout.
 * @returns {boolean} True when stacked layout is active on narrow or column-flex viewports.
 */
function isStackedBoardLayout() {
  if (window.innerWidth <= 620) return true;
  const boardColumns = document.querySelector(".board-columns");
  if (!boardColumns) return false;
  return window.getComputedStyle(boardColumns).flexDirection === "column";
}

/**
 * Enables native HTML5 drag only when the board is not in stacked layout.
 * @returns {void}
 */
function updateTaskCardDraggable() {
  const useNativeDrag = !isStackedBoardLayout();
  document.querySelectorAll(".task-card:not(.task-card-summary)").forEach((card) => {
    card.draggable = useNativeDrag;
  });
}

/**
 * Cancels any pending long-press timer without resetting card tracking state.
 * @returns {void}
 */
function clearLongPressTimer() {
  clearTimeout(longPressTimer);
  longPressTimer = null;
}

/**
 * Clears the long-press timer and drops the card currently awaiting long press.
 * @returns {void}
 */
function resetLongPressState() {
  clearLongPressTimer();
  longPressCard = null;
}

/**
 * Starts a touch drag after long press by cloning the card and showing drop UI.
 * @param {HTMLElement} card - Source task card entering drag mode.
 * @param {number} clientX - Pointer X coordinate where the drag started.
 * @param {number} clientY - Pointer Y coordinate where the drag started.
 * @param {DOMRect} rect - Bounding rectangle of the source card.
 * @returns {void}
 */
function activateLongPressDrag(card, clientX, clientY, rect) {
  draggedTaskId = parseInt(card.dataset.taskId, 10);
  dragSourceCard = card;
  touchDragOffsetX = clientX - rect.left;
  touchDragOffsetY = clientY - rect.top;
  touchDragClone = createTouchDragClone(card, rect);
  document.body.appendChild(touchDragClone);
  card.style.opacity = "0.3";
  document.getElementById("mobile-drop-overlay")?.classList.add("active");
  updateDragAtPoint(clientX, clientY);
}

/**
 * Moves the drag clone and updates column and mobile drop highlights at a point.
 * @param {number} clientX - Current pointer X coordinate during the drag.
 * @param {number} clientY - Current pointer Y coordinate during the drag.
 * @returns {void}
 */
function updateDragAtPoint(clientX, clientY) {
  if (!touchDragClone) return;
  touchDragClone.style.left = `${clientX - touchDragOffsetX}px`;
  touchDragClone.style.top = `${clientY - touchDragOffsetY}px`;
  document.querySelectorAll(".board-column").forEach((c) => c.classList.remove("drag-over"));
  const colId = getColumnIdAtPoint(clientX, clientY);
  if (colId) document.getElementById(colId)?.classList.add("drag-over");
  updateMobileDropHighlights(document.getElementById("mobile-drop-overlay"), clientX, clientY);
}

/**
 * Highlights mobile drop buttons when the pointer is over their bounds.
 * @param {HTMLElement|null} overlay - Mobile drop overlay hosting target buttons.
 * @param {number} clientX - Current pointer X coordinate during the drag.
 * @param {number} clientY - Current pointer Y coordinate during the drag.
 * @returns {void}
 */
function updateMobileDropHighlights(overlay, clientX, clientY) {
  if (!overlay?.classList.contains("active")) return;
  overlay.querySelectorAll(".mobile-drop-btn").forEach((btn) => {
    const r = btn.getBoundingClientRect();
    const over = clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    btn.classList.toggle("drop-active", over);
  });
}

/**
 * Moves the dragged task into the column selected from the mobile drop overlay.
 * @param {string|null} colId - Target column DOM id from a mobile drop button.
 * @returns {void}
 */
function applyLongPressDrop(colId) {
  if (!colId || !COLUMN_STATUS[colId]) {
    document.querySelectorAll(".task-card").forEach((c) => { c.style.opacity = ""; });
    return;
  }
  moveTaskToPlacement(draggedTaskId, COLUMN_STATUS[colId]);
  renderBoard();
  initTouchDrag();
}

/**
 * Resolves which mobile drop button column is under the pointer and clears overlay state.
 * @param {HTMLElement|null} overlay - Mobile drop overlay hosting target buttons.
 * @param {number} clientX - Drop pointer X coordinate.
 * @param {number} clientY - Drop pointer Y coordinate.
 * @returns {string|null} Target column DOM id when a button is hit, otherwise null.
 */
function getMobileDropColId(overlay, clientX, clientY) {
  if (!overlay?.classList.contains("active")) return null;
  let colId = null;
  overlay.querySelectorAll(".mobile-drop-btn").forEach((btn) => {
    const r = btn.getBoundingClientRect();
    if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
      colId = btn.dataset.col;
    }
  });
  overlay.classList.remove("active");
  overlay.querySelectorAll(".mobile-drop-btn").forEach((b) => b.classList.remove("drop-active"));
  return colId;
}

/**
 * Drops a long-press drag at pointer coordinates when no mobile overlay target is selected.
 * @param {number} clientX - Drop pointer X coordinate.
 * @param {number} clientY - Drop pointer Y coordinate.
 * @returns {void}
 */
function applyLongPressDropAtPoint(clientX, clientY) {
  const fallbackColId = getColumnIdAtPoint(clientX, clientY);
  const placement = getTaskMovePlacementFromPoint(clientX, clientY, COLUMN_STATUS[fallbackColId] || null);
  if (placement.status) {
    moveTaskToPlacement(draggedTaskId, placement.status, placement.anchorTaskId, placement.insertAfter);
  }
  renderBoard();
  initTouchDrag();
}

/**
 * Restores source card opacity and clears all touch-drag transient state.
 * @returns {void}
 */
function cleanupLongPressDrag() {
  if (dragSourceCard) dragSourceCard.style.opacity = "";
  touchDragClone.remove();
  touchDragClone = null;
  dragSourceCard = null;
  draggedTaskId = null;
  resetLongPressState();
}

/**
 * Completes a long-press drag at the given coordinates and cleans up drag UI.
 * @param {number} clientX - Final drop pointer X coordinate.
 * @param {number} clientY - Final drop pointer Y coordinate.
 * @returns {void}
 */
function finishLongPressDrag(clientX, clientY) {
  if (!touchDragClone) return;
  suppressClickUntil = Date.now() + 400;
  document.querySelectorAll(".board-column").forEach((c) => c.classList.remove("drag-over"));
  const mobileColId = getMobileDropColId(document.getElementById("mobile-drop-overlay"), clientX, clientY);
  if (mobileColId) applyLongPressDrop(mobileColId);
  else applyLongPressDropAtPoint(clientX, clientY);
  cleanupLongPressDrag();
}

/**
 * Begins tracking a long press on a task card in stacked layout mode.
 * @param {HTMLElement} card - Task card awaiting the long-press threshold.
 * @param {number} clientX - Pointer X coordinate where the press started.
 * @param {number} clientY - Pointer Y coordinate where the press started.
 * @returns {void}
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
 * Cancels an in-progress long press when the pointer moves beyond the tolerance radius.
 * @param {number} clientX - Current pointer X coordinate during the press.
 * @param {number} clientY - Current pointer Y coordinate during the press.
 * @returns {void}
 */
function maybeCancelLongPressOnMove(clientX, clientY) {
  if (!longPressCard || touchDragClone) return;
  if (Math.hypot(clientX - longPressStartX, clientY - longPressStartY) > LONG_PRESS_MOVE_TOLERANCE) {
    resetLongPressState();
  }
}

/**
 * Starts long-press tracking when a touch begins on a task card.
 * @param {TouchEvent} event - Touchstart event on a task card.
 * @returns {void}
 */
function onTouchStart(event) {
  if (!isStackedBoardLayout()) return;
  lastTouchStartTime = Date.now();
  const touch = event.touches[0];
  beginLongPress(event.currentTarget, touch.clientX, touch.clientY);
}

/**
 * Updates or cancels long-press drag while the user moves a touch point.
 * @param {TouchEvent} event - Touchmove event on a task card.
 * @returns {void}
 */
function onTouchMove(event) {
  const touch = event.touches[0];
  maybeCancelLongPressOnMove(touch.clientX, touch.clientY);
  if (!touchDragClone) return;
  event.preventDefault();
  updateDragAtPoint(touch.clientX, touch.clientY);
}

/**
 * Finishes or cancels long-press drag when the touch ends.
 * @param {TouchEvent} event - Touchend event on a task card.
 * @returns {void}
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

/**
 * Starts long-press tracking when the primary mouse button is pressed on a card.
 * @param {MouseEvent} event - Mousedown event on a task card.
 * @returns {void}
 */
function onMouseDown(event) {
  if (!isStackedBoardLayout() || event.button !== 0) return;
  if (Date.now() - lastTouchStartTime < 600) return;
  beginLongPress(event.currentTarget, event.clientX, event.clientY);
  document.addEventListener("mousemove", onDocumentMouseMove);
  document.addEventListener("mouseup", onDocumentMouseUp);
}

/**
 * Updates an active touch drag while the mouse moves during a synthetic drag.
 * @param {MouseEvent} event - Mousemove event on the document during drag.
 * @returns {void}
 */
function onDocumentMouseMove(event) {
  maybeCancelLongPressOnMove(event.clientX, event.clientY);
  if (!touchDragClone) return;
  event.preventDefault();
  updateDragAtPoint(event.clientX, event.clientY);
}

/**
 * Finishes or cancels long-press drag when the mouse button is released.
 * @param {MouseEvent} event - Mouseup event on the document during drag.
 * @returns {void}
 */
function onDocumentMouseUp(event) {
  document.removeEventListener("mousemove", onDocumentMouseMove);
  document.removeEventListener("mouseup", onDocumentMouseUp);
  clearLongPressTimer();
  if (touchDragClone) finishLongPressDrag(event.clientX, event.clientY);
  else resetLongPressState();
}

/**
 * Suppresses stray click events fired immediately after a touch drag completes.
 * @param {MouseEvent} event - Captured click event on a task card.
 * @returns {void}
 */
function onCardClickCapture(event) {
  if (Date.now() < suppressClickUntil) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}

/**
 * Prevents the browser context menu from opening on long-pressed task cards.
 * @param {MouseEvent} event - Contextmenu event on a task card.
 * @returns {void}
 */
function preventCardContextMenu(event) {
  event.preventDefault();
}

/**
 * Detaches all touch-drag listeners previously bound to a task card.
 * @param {HTMLElement} card - Task card element to unbind from touch drag handlers.
 * @returns {void}
 */
function removeTouchDragListenersFromCard(card) {
  card.removeEventListener("touchstart", onTouchStart);
  card.removeEventListener("touchmove", onTouchMove);
  card.removeEventListener("touchend", onTouchEnd);
  card.removeEventListener("mousedown", onMouseDown);
  card.removeEventListener("click", onCardClickCapture, true);
  card.removeEventListener("contextmenu", preventCardContextMenu);
}

/**
 * Attaches touch, mouse, and click handlers needed for long-press dragging.
 * @param {HTMLElement} card - Task card element to bind to touch drag handlers.
 * @returns {void}
 */
function addTouchDragListenersToCard(card) {
  card.addEventListener("touchstart", onTouchStart, { passive: true });
  card.addEventListener("touchmove", onTouchMove, { passive: false });
  card.addEventListener("touchend", onTouchEnd, { passive: true });
  card.addEventListener("mousedown", onMouseDown);
  card.addEventListener("click", onCardClickCapture, true);
  card.addEventListener("contextmenu", preventCardContextMenu);
}

/**
 * Ensures a task id is present and refreshes touch-drag listeners on one card.
 * @param {HTMLElement} card - Task card element to prepare for touch dragging.
 * @returns {void}
 */
function bindTouchDragListenersToCard(card) {
  const id = card.dataset.taskId || card.getAttribute("ondragstart")?.match(/\d+/)?.[0];
  if (!id) return;
  card.dataset.taskId = id;
  removeTouchDragListenersFromCard(card);
  addTouchDragListenersToCard(card);
}

/**
 * Refreshes draggable state and touch-drag listeners on every board task card.
 * @returns {void}
 */
function initTouchDrag() {
  updateTaskCardDraggable();
  document.querySelectorAll(".task-card:not(.task-card-summary)").forEach(bindTouchDragListenersToCard);
}
