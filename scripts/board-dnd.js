/**
 * Executes start drag logic.
 * @param {string} id - Identifier.
 * @returns {void} Result.
 */
function startDrag(id) {
  draggedTaskId = id;
}

/**
 * Executes allow drop logic.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function allowDrop(event) {
  event.preventDefault();
}

function dragEnterColumn(event, colId) {
  event.preventDefault();
  document.querySelectorAll('.board-column').forEach(c => c.classList.remove('drag-over'));
  const col = document.getElementById(colId);
  if (col) col.classList.add('drag-over');
}

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
  const task = tasks.find(t => t.id === draggedTaskId);
  if (!task) return;
  task.status = newStatus;
  updateTask(task);
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

function onTouchStart(event) {
  const card = event.currentTarget;
  const touch = event.touches[0];
  const rect = card.getBoundingClientRect();
  draggedTaskId = parseInt(card.dataset.taskId, 10);
  touchDragOffsetX = touch.clientX - rect.left;
  touchDragOffsetY = touch.clientY - rect.top;
  touchDragClone = createTouchDragClone(card, rect);
  document.body.appendChild(touchDragClone);
  card.style.opacity = '0.3';
}

function onTouchMove(event) {
  if (!touchDragClone) return;
  event.preventDefault();
  const touch = event.touches[0];
  touchDragClone.style.left = (touch.clientX - touchDragOffsetX) + 'px';
  touchDragClone.style.top  = (touch.clientY - touchDragOffsetY) + 'px';

  // Highlight column under finger
  document.querySelectorAll('.board-column').forEach(c => c.classList.remove('drag-over'));
  const colId = getColumnIdAtPoint(touch.clientX, touch.clientY);
  if (colId) document.getElementById(colId).classList.add('drag-over');
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
  const task = tasks.find(t => t.id === draggedTaskId);
  if (!task) return;
  task.status = COLUMN_STATUS[colId];
  updateTask(task);
  renderBoard();
  initTouchDrag();
}

function onTouchEnd(event) {
  if (!touchDragClone) return;
  const touch = event.changedTouches[0];
  document.querySelectorAll('.board-column').forEach(c => c.classList.remove('drag-over'));
  applyTouchDrop(getColumnIdAtPoint(touch.clientX, touch.clientY));
  touchDragClone.remove();
  touchDragClone = null;
  draggedTaskId = null;
}

function initTouchDrag() {
  document.querySelectorAll('.task-card').forEach(card => {
    const id = card.getAttribute('ondragstart')?.match(/\d+/)?.[0];
    if (!id) return;
    card.dataset.taskId = id;
    card.removeEventListener('touchstart', onTouchStart);
    card.removeEventListener('touchmove',  onTouchMove);
    card.removeEventListener('touchend',   onTouchEnd);
    card.addEventListener('touchstart', onTouchStart, { passive: true });
    card.addEventListener('touchmove',  onTouchMove,  { passive: false });
    card.addEventListener('touchend',   onTouchEnd,   { passive: true });
  });
}
