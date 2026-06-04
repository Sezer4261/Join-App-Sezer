/** @file Native HTML5 drag-and-drop on wide board layouts. */

/**
 * @param {string|number} id
 */
function startDrag(id) {
  draggedTaskId = id;
}

/** @param {DragEvent} event */
function allowDrop(event) {
  event.preventDefault();
}

/**
 * @param {DragEvent} event
 * @param {string} colId
 */
function dragEnterColumn(event, colId) {
  event.preventDefault();
  document.querySelectorAll(".board-column").forEach((c) => c.classList.remove("drag-over"));
  document.getElementById(colId)?.classList.add("drag-over");
}

/**
 * @param {DragEvent} event
 * @param {string} colId
 */
function dragLeaveColumn(event, colId) {
  const col = document.getElementById(colId);
  if (col && !col.contains(event.relatedTarget)) col.classList.remove("drag-over");
}

/**
 * @param {DragEvent} event
 * @param {string} newStatus
 */
function dropTask(event, newStatus) {
  event.preventDefault();
  document.querySelectorAll(".board-column").forEach((c) => c.classList.remove("drag-over"));
  const placement = getTaskMovePlacementFromPoint(event.clientX, event.clientY, newStatus);
  moveTaskToPlacement(draggedTaskId, placement.status, placement.anchorTaskId, placement.insertAfter);
  draggedTaskId = null;
  renderBoard();
}
