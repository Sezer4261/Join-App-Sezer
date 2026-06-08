/** @file Native HTML5 drag-and-drop on wide board layouts. */

/**
 * Records the task id being dragged so drop handlers can resolve the source card.
 * @param {string|number} id - Identifier of the task card that started dragging.
 * @returns {void}
 */
function startDrag(id) {
  draggedTaskId = id;
}

/**
 * Enables dropping on a column by cancelling the browser's default drag-over behavior.
 * @param {DragEvent} event - Drag-over event on a board column.
 * @returns {void}
 */
function allowDrop(event) {
  event.preventDefault();
}

/**
 * Applies a drag-over highlight to the column entered by the dragged task.
 * @param {DragEvent} event - Drag-enter event on a board column.
 * @param {string} colId - DOM id of the column receiving the drag.
 * @returns {void}
 */
function dragEnterColumn(event, colId) {
  event.preventDefault();
  document.querySelectorAll(".board-column").forEach((c) => c.classList.remove("drag-over"));
  document.getElementById(colId)?.classList.add("drag-over");
}

/**
 * Removes the drag-over highlight when the pointer leaves a column entirely.
 * @param {DragEvent} event - Drag-leave event on a board column.
 * @param {string} colId - DOM id of the column being left.
 * @returns {void}
 */
function dragLeaveColumn(event, colId) {
  const col = document.getElementById(colId);
  if (col && !col.contains(event.relatedTarget)) col.classList.remove("drag-over");
}

/**
 * Drops the dragged task into a column at the pointer position and re-renders the board.
 * @param {DragEvent} event - Drop event on a board column.
 * @param {string} newStatus - Kanban status label for the target column.
 * @returns {void}
 */
function dropTask(event, newStatus) {
  event.preventDefault();
  document.querySelectorAll(".board-column").forEach((c) => c.classList.remove("drag-over"));
  const placement = getTaskMovePlacementFromPoint(event.clientX, event.clientY, newStatus);
  moveTaskToPlacement(draggedTaskId, placement.status, placement.anchorTaskId, placement.insertAfter);
  draggedTaskId = null;
  renderBoard();
}
