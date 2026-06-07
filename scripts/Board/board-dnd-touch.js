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
 * @param {HTMLElement} card
 * @param {DOMRect} rect
 * @returns {HTMLElement}
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

/** @returns {boolean} */
function isStackedBoardLayout() {
  if (window.innerWidth <= 620) return true;
  const boardColumns = document.querySelector(".board-columns");
  if (!boardColumns) return false;
  return window.getComputedStyle(boardColumns).flexDirection === "column";
}

function updateTaskCardDraggable() {
  const useNativeDrag = !isStackedBoardLayout();
  document.querySelectorAll(".task-card:not(.task-card-summary)").forEach((card) => {
    card.draggable = useNativeDrag;
  });
}

function clearLongPressTimer() {
  clearTimeout(longPressTimer);
  longPressTimer = null;
}

function resetLongPressState() {
  clearLongPressTimer();
  longPressCard = null;
}

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

function updateDragAtPoint(clientX, clientY) {
  if (!touchDragClone) return;
  touchDragClone.style.left = `${clientX - touchDragOffsetX}px`;
  touchDragClone.style.top = `${clientY - touchDragOffsetY}px`;
  document.querySelectorAll(".board-column").forEach((c) => c.classList.remove("drag-over"));
  const colId = getColumnIdAtPoint(clientX, clientY);
  if (colId) document.getElementById(colId)?.classList.add("drag-over");
  updateMobileDropHighlights(document.getElementById("mobile-drop-overlay"), clientX, clientY);
}

function updateMobileDropHighlights(overlay, clientX, clientY) {
  if (!overlay?.classList.contains("active")) return;
  overlay.querySelectorAll(".mobile-drop-btn").forEach((btn) => {
    const r = btn.getBoundingClientRect();
    const over = clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    btn.classList.toggle("drop-active", over);
  });
}

function applyLongPressDrop(colId) {
  if (!colId || !COLUMN_STATUS[colId]) {
    document.querySelectorAll(".task-card").forEach((c) => { c.style.opacity = ""; });
    return;
  }
  moveTaskToPlacement(draggedTaskId, COLUMN_STATUS[colId]);
  renderBoard();
  initTouchDrag();
}

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
 * Applies a long-press drop at the given coordinates when no mobile overlay target exists.
 * @param {number} clientX - Drop X coordinate.
 * @param {number} clientY - Drop Y coordinate.
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
 * Cleans up DOM and state after a long-press drag ends.
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

function finishLongPressDrag(clientX, clientY) {
  if (!touchDragClone) return;
  suppressClickUntil = Date.now() + 400;
  document.querySelectorAll(".board-column").forEach((c) => c.classList.remove("drag-over"));
  const mobileColId = getMobileDropColId(document.getElementById("mobile-drop-overlay"), clientX, clientY);
  if (mobileColId) applyLongPressDrop(mobileColId);
  else applyLongPressDropAtPoint(clientX, clientY);
  cleanupLongPressDrag();
}

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

function maybeCancelLongPressOnMove(clientX, clientY) {
  if (!longPressCard || touchDragClone) return;
  if (Math.hypot(clientX - longPressStartX, clientY - longPressStartY) > LONG_PRESS_MOVE_TOLERANCE) {
    resetLongPressState();
  }
}

function onTouchStart(event) {
  if (!isStackedBoardLayout()) return;
  lastTouchStartTime = Date.now();
  const touch = event.touches[0];
  beginLongPress(event.currentTarget, touch.clientX, touch.clientY);
}

function onTouchMove(event) {
  const touch = event.touches[0];
  maybeCancelLongPressOnMove(touch.clientX, touch.clientY);
  if (!touchDragClone) return;
  event.preventDefault();
  updateDragAtPoint(touch.clientX, touch.clientY);
}

function onTouchEnd(event) {
  clearLongPressTimer();
  if (touchDragClone) {
    const touch = event.changedTouches[0];
    finishLongPressDrag(touch.clientX, touch.clientY);
    return;
  }
  resetLongPressState();
}

function onMouseDown(event) {
  if (!isStackedBoardLayout() || event.button !== 0) return;
  if (Date.now() - lastTouchStartTime < 600) return;
  beginLongPress(event.currentTarget, event.clientX, event.clientY);
  document.addEventListener("mousemove", onDocumentMouseMove);
  document.addEventListener("mouseup", onDocumentMouseUp);
}

function onDocumentMouseMove(event) {
  maybeCancelLongPressOnMove(event.clientX, event.clientY);
  if (!touchDragClone) return;
  event.preventDefault();
  updateDragAtPoint(event.clientX, event.clientY);
}

function onDocumentMouseUp(event) {
  document.removeEventListener("mousemove", onDocumentMouseMove);
  document.removeEventListener("mouseup", onDocumentMouseUp);
  clearLongPressTimer();
  if (touchDragClone) finishLongPressDrag(event.clientX, event.clientY);
  else resetLongPressState();
}

function onCardClickCapture(event) {
  if (Date.now() < suppressClickUntil) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}

/**
 * Removes existing touch-drag listeners from a task card.
 * @param {HTMLElement} card - Task card element.
 * @returns {void}
 */
function removeTouchDragListenersFromCard(card) {
  card.removeEventListener("touchstart", onTouchStart);
  card.removeEventListener("touchmove", onTouchMove);
  card.removeEventListener("touchend", onTouchEnd);
  card.removeEventListener("mousedown", onMouseDown);
  card.removeEventListener("click", onCardClickCapture, true);
}

/**
 * Attaches touch-drag listeners to a task card.
 * @param {HTMLElement} card - Task card element.
 * @returns {void}
 */
function addTouchDragListenersToCard(card) {
  card.addEventListener("touchstart", onTouchStart, { passive: true });
  card.addEventListener("touchmove", onTouchMove, { passive: false });
  card.addEventListener("touchend", onTouchEnd, { passive: true });
  card.addEventListener("mousedown", onMouseDown);
  card.addEventListener("click", onCardClickCapture, true);
  card.addEventListener("contextmenu", (e) => e.preventDefault());
}

/**
 * Binds touch, mouse, and click handlers to a single task card.
 * @param {HTMLElement} card - Task card element.
 * @returns {void}
 */
function bindTouchDragListenersToCard(card) {
  const id = card.dataset.taskId || card.getAttribute("ondragstart")?.match(/\d+/)?.[0];
  if (!id) return;
  card.dataset.taskId = id;
  removeTouchDragListenersFromCard(card);
  addTouchDragListenersToCard(card);
}

/** Attaches touch and long-press handlers to task cards. */
function initTouchDrag() {
  updateTaskCardDraggable();
  document.querySelectorAll(".task-card:not(.task-card-summary)").forEach(bindTouchDragListenersToCard);
}
