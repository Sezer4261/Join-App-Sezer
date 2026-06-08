/** @file Add-task date picker event handlers and public open API. */

/**
 * Binds global document and window handlers for the add-task date picker.
 * @returns {void} Nothing is returned after the one-time global listeners are registered.
 */
function ensureAddTaskDatePickerGlobalHandlers() {
  if (addTaskDatePickerState.globalHandlersBound) return;
  document.addEventListener('pointerdown', handleAddTaskDatePickerOutsidePointerDown, true);
  document.addEventListener('pointerup', handleAddTaskDatePickerOutsidePointerUp, true);
  document.addEventListener('keydown', handleAddTaskDatePickerGlobalKeydown);
  window.addEventListener('resize', updateAddTaskDatePickerPosition);
  window.addEventListener('scroll', updateAddTaskDatePickerPosition, true);
  addTaskDatePickerState.globalHandlersBound = true;
}

/**
 * Returns whether the target is inside the active date picker or its input.
 * @param {EventTarget|null} target - DOM node that received the user interaction.
 * @returns {boolean} True when the target lies within the active picker, input, label, or date error area.
 */
function isInsideActiveAddTaskDatePicker(target) {
  const { popup, activeInput } = addTaskDatePickerState;
  if (!activeInput) return false;
  if (popup?.contains(target)) return true;
  if (activeInput === target) return true;
  const dateLabel = activeInput.closest('label');
  if (dateLabel?.contains(target)) return true;
  const errorSpan = document.getElementById('date-error');
  if (errorSpan?.contains(target)) return true;
  return false;
}

/**
 * Returns whether the custom add-task date picker should be used.
 * @returns {boolean} True when the device reports a fine pointer and the custom calendar should open.
 */
function shouldUseCustomAddTaskDatePicker() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches;
}

/**
 * Handles month navigation inside the add-task date picker.
 * @param {HTMLElement} actionButton - Previous-month or next-month navigation button that was clicked.
 * @returns {void} Nothing is returned after the visible month and popup position are refreshed.
 */
function handleAddTaskDatePickerMonthNav(actionButton) {
  const monthOffset = actionButton.dataset.action === "previous-month" ? -1 : 1;
  const currentViewDate = addTaskDatePickerState.viewDate || new Date();
  addTaskDatePickerState.viewDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + monthOffset, 1);
  renderAddTaskDatePicker();
  updateAddTaskDatePickerPosition();
}

/**
 * Handles clicks inside the add-task date picker popup.
 * @param {Event} event - Click event originating inside the date picker popup.
 * @returns {void} Nothing is returned after month navigation or date selection is handled.
 */
function handleAddTaskDatePickerClick(event) {
  event.stopPropagation();
  event.preventDefault();
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) { handleAddTaskDatePickerMonthNav(actionButton); return; }
  const dayButton = event.target.closest("[data-date]");
  if (!dayButton || dayButton.disabled) return;
  setAddTaskDatePickerValue(dayButton.dataset.date);
}

/**
 * Prevents pointer-up propagation on day buttons in the date picker.
 * @param {Event} event - Pointer event originating on a calendar day button.
 * @returns {void} Nothing is returned after the event is stopped when a valid day button is targeted.
 */
function handleAddTaskDatePickerPointerUp(event) {
  const dayButton = event.target.closest('[data-date]');
  if (!dayButton || dayButton.disabled) return;
  event.stopPropagation();
  event.preventDefault();
}

/**
 * Returns whether an outside pointer event should keep the date picker open.
 * @param {Event} event - Pointer event that may have occurred outside the picker.
 * @param {HTMLElement|null} popup - Date picker popup element, which may still be hidden during creation.
 * @returns {boolean} True when the event target is considered inside the active picker context.
 */
function shouldKeepAddTaskDatePickerOpen(event, popup) {
  if (popup && !popup.hidden && isInsideActiveAddTaskDatePicker(event.target)) return true;
  return !popup && isInsideActiveAddTaskDatePicker(event.target);
}

/**
 * Closes the date picker when the user clicks outside it.
 * @param {Event} event - Captured pointerdown event evaluated against the active picker.
 * @returns {void} Nothing is returned after the picker closes or the event is allowed to continue.
 */
function handleAddTaskDatePickerOutsidePointerDown(event) {
  const { popup, activeInput } = addTaskDatePickerState;
  if (!activeInput) return;
  if (shouldKeepAddTaskDatePickerOpen(event, popup)) { event.stopPropagation(); return; }
  closeAddTaskDatePicker({ blurActiveInput: true });
}

/**
 * Stops pointer-up propagation for day buttons handled outside the popup click listener.
 * @param {Event} event - Captured pointerup event evaluated against the active picker.
 * @returns {void} Nothing is returned after propagation is stopped for valid day button targets.
 */
function handleAddTaskDatePickerOutsidePointerUp(event) {
  const { popup, activeInput } = addTaskDatePickerState;
  if (!activeInput || !popup || popup.hidden) return;
  const dayButton = event.target.closest('[data-date]');
  if (!dayButton || dayButton.disabled) return;
  event.stopPropagation();
}

/**
 * Closes the date picker when focus moves outside it.
 * @param {Event} event - Focusin event evaluated against the active picker context.
 * @returns {void} Nothing is returned after the picker closes when focus leaves its context.
 */
function handleAddTaskDatePickerFocusIn(event) {
  const { activeInput } = addTaskDatePickerState;
  if (!activeInput) return;
  if (isInsideActiveAddTaskDatePicker(event.target)) return;
  closeAddTaskDatePicker();
}

/**
 * Closes the date picker when the Escape key is pressed.
 * @param {KeyboardEvent} event - Keydown event inspected for the Escape key.
 * @returns {void} Nothing is returned after the picker closes on Escape or the event is ignored.
 */
function handleAddTaskDatePickerGlobalKeydown(event) {
  if (event.key === 'Escape') closeAddTaskDatePicker();
}

/**
 * Opens the custom calendar popup for the add-task date input.
 * @param {HTMLElement} dateInput - Due date input that should own the open picker.
 * @returns {void} Nothing is returned after the custom calendar is shown and focused.
 */
function openCustomAddTaskDatePicker(dateInput) {
  const popup = ensureAddTaskDatePickerPopup(dateInput);
  addTaskDatePickerState.activeInput = dateInput;
  const initialDate = getAddTaskDatePickerInitialDate(dateInput);
  addTaskDatePickerState.viewDate = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  updateAddTaskDateInputMode(dateInput);
  popup.hidden = false;
  renderAddTaskDatePicker();
  updateAddTaskDatePickerPosition();
  dateInput.focus({ preventScroll: true });
}

/**
 * Returns whether the custom date picker is open for the given input.
 * @param {HTMLElement} dateInput - Due date input being checked for an active custom picker.
 * @returns {boolean} True when the custom picker is open and bound to the given input.
 */
function isAddTaskDatePickerOpenForInput(dateInput) {
  return shouldUseCustomAddTaskDatePicker()
    && addTaskDatePickerState.activeInput === dateInput
    && addTaskDatePickerState.popup
    && !addTaskDatePickerState.popup.hidden;
}

/**
 * Opens the native browser date picker for the add-task date input.
 * @param {HTMLElement} dateInput - Due date input that should display the native picker.
 * @returns {void} Nothing is returned after the native picker is shown or the input is focused.
 */
function openNativeAddTaskDatePicker(dateInput) {
  addTaskDatePickerState.activeInput = dateInput;
  addTaskDatePickerState.viewDate = null;
  updateAddTaskDateInputMode(dateInput);
  try {
    dateInput.showPicker();
    return;
  } catch (_) {}
  dateInput.focus({ preventScroll: true });
}

/**
 * Opens the add-task date picker using the custom or native implementation for the device.
 * @param {HTMLElement} dateInput - Due date input that should receive the picker interaction.
 * @returns {void} Nothing is returned after the appropriate picker is opened or toggled closed.
 */
function openAddTaskDatePicker(dateInput) {
  if (!dateInput) return;
  ensureAddTaskDatePickerGlobalHandlers();
  if (isAddTaskDatePickerOpenForInput(dateInput)) {
    closeAddTaskDatePicker();
    return;
  }
  updateAddTaskDateInputMode(dateInput);
  if (shouldUseCustomAddTaskDatePicker()) {
    openCustomAddTaskDatePicker(dateInput);
    return;
  }
  openNativeAddTaskDatePicker(dateInput);
}
