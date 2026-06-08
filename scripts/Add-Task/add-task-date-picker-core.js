/** @file Add-task date picker state, rendering, and positioning. */

const ADD_TASK_DATE_PICKER_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const ADD_TASK_DATE_PICKER_WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const addTaskDatePickerState = {
  popup: null,
  title: null,
  grid: null,
  activeInput: null,
  viewDate: null,
  globalHandlersBound: false,
};

/**
 * Parses an ISO date string into a Date object.
 * @param {string} value - ISO date string in yyyy-mm-dd format.
 * @returns {Date|null} Parsed local Date object, or null when the value is empty or invalid.
 */
function parseAddTaskDateValue(value) {
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) return null;
  const [year, month, day] = normalizedValue.split('-').map(Number);
  if (!year || !month || !day) return null;
  const parsedDate = new Date(year, month - 1, day);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return parsedDate;
}

/**
 * Formats a Date object as an ISO date string.
 * @param {Date} date - Local Date object to convert for the date input value.
 * @returns {string} Date formatted as a yyyy-mm-dd string.
 */
function formatAddTaskDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the minimum selectable date value for the date picker.
 * @param {HTMLElement} dateInput - Due date input whose min attribute or fallback is read.
 * @returns {string} Earliest allowed date as a yyyy-mm-dd string.
 */
function getAddTaskDatePickerMinValue(dateInput) {
  return String(dateInput?.min || getTodayDateString()).trim();
}

/**
 * Resolves the initial calendar view date from the date input.
 * @param {HTMLElement} dateInput - Due date input whose current or minimum value seeds the calendar month.
 * @returns {Date} Date object representing the month initially shown in the picker.
 */
function getAddTaskDatePickerInitialDate(dateInput) {
  return parseAddTaskDateValue(dateInput?.value)
    || parseAddTaskDateValue(getAddTaskDatePickerMinValue(dateInput))
    || new Date();
}

/**
 * Stores popup element references in add-task date picker state.
 * @param {HTMLElement} popup - Root popup element whose title and grid nodes are cached.
 * @returns {void} Nothing is returned after the popup references are saved in state.
 */
function cacheAddTaskDatePickerPopupElements(popup) {
  addTaskDatePickerState.popup = popup;
  addTaskDatePickerState.title = popup.querySelector('.add-task-date-picker__title');
  addTaskDatePickerState.grid = popup.querySelector('.add-task-date-picker__grid');
}

/**
 * Creates and caches the add-task date picker popup element.
 * @returns {HTMLElement} Newly created popup element with listeners attached.
 */
function createAddTaskDatePickerPopup() {
  const popup = document.createElement('div');
  popup.className = 'add-task-date-picker-popup';
  popup.hidden = true;
  popup.innerHTML = getAddTaskDatePickerPopupMarkup(ADD_TASK_DATE_PICKER_WEEKDAYS);
  popup.addEventListener('click', handleAddTaskDatePickerClick);
  popup.addEventListener('pointerup', handleAddTaskDatePickerPointerUp);
  cacheAddTaskDatePickerPopupElements(popup);
  return popup;
}

/**
 * Mounts the date picker popup under the dialog or document body.
 * @param {HTMLElement} dateInput - Due date input used to locate the nearest dialog parent.
 * @returns {void} Nothing is returned after the popup is appended to the correct parent.
 */
function mountAddTaskDatePickerPopup(dateInput) {
  const popupParent = dateInput?.closest('dialog') || document.body;
  if (addTaskDatePickerState.popup.parentElement !== popupParent) {
    popupParent.appendChild(addTaskDatePickerState.popup);
  }
}

/**
 * Ensures the add-task date picker popup exists and is mounted.
 * @param {HTMLElement} dateInput - Due date input that will own the active picker instance.
 * @returns {HTMLElement} Popup element ready to be shown for the given input.
 */
function ensureAddTaskDatePickerPopup(dateInput) {
  ensureAddTaskDatePickerGlobalHandlers();
  if (!addTaskDatePickerState.popup) createAddTaskDatePickerPopup();
  mountAddTaskDatePickerPopup(dateInput);
  return addTaskDatePickerState.popup;
}

/**
 * Updates the date input mode and aria attributes for the picker.
 * @param {HTMLElement} dateInput - Due date input whose readonly and aria-expanded state are synchronized.
 * @returns {void} Nothing is returned after the input accessibility attributes are updated.
 */
function updateAddTaskDateInputMode(dateInput) {
  if (!dateInput) return;
  const useCustomPicker = shouldUseCustomAddTaskDatePicker();
  dateInput.readOnly = useCustomPicker;
  dateInput.setAttribute('aria-haspopup', 'dialog');
  dateInput.setAttribute('aria-expanded', addTaskDatePickerState.activeInput === dateInput ? 'true' : 'false');
}

/**
 * Builds CSS class names for an add-task date picker day button.
 * @param {Date} dayDate - Calendar date represented by the day button.
 * @param {number} month - Zero-based index of the month currently displayed in the picker.
 * @param {string} selectedValue - ISO date string currently selected in the due date input.
 * @returns {string} Space-separated CSS class names applied to the day button.
 */
function getAddTaskDatePickerDayClassNames(dayDate, month, selectedValue) {
  const dayValue = formatAddTaskDateValue(dayDate);
  const isCurrentMonth = dayDate.getMonth() === month;
  const isToday = dayValue === getTodayDateString();
  const isSelected = dayValue === selectedValue;
  return [
    'add-task-date-picker__day',
    isCurrentMonth ? '' : 'is-outside-month',
    isToday ? 'is-today' : '',
    isSelected ? 'is-selected' : '',
  ].filter(Boolean).join(' ');
}

/**
 * Formats a day button element for the add-task date picker grid.
 * @param {Date} dayDate - Calendar date shown as the button label.
 * @param {string} dayValue - ISO date string stored in the button data-date attribute.
 * @param {string} classNames - CSS class names applied to the rendered button.
 * @param {boolean} isSelected - Whether the day matches the currently selected due date.
 * @param {boolean} isDisabled - Whether the day falls before the minimum selectable date.
 * @returns {string} HTML markup for one calendar day button.
 */
function formatAddTaskDatePickerDayButton(dayDate, dayValue, classNames, isSelected, isDisabled) {
  return `<button type="button" class="${classNames}" data-date="${dayValue}" ${isDisabled ? 'disabled' : ''} aria-pressed="${isSelected ? 'true' : 'false'}">${dayDate.getDate()}</button>`;
}

/**
 * Builds HTML for a single day button in the add-task date picker.
 * @param {Date} dayDate - Calendar date represented by the day button.
 * @param {number} month - Zero-based index of the month currently displayed in the picker.
 * @param {string} selectedValue - ISO date string currently selected in the due date input.
 * @param {string} minValue - Earliest selectable ISO date string for disabling past days.
 * @returns {string} HTML markup for one rendered calendar day button.
 */
function buildAddTaskDatePickerDayHtml(dayDate, month, selectedValue, minValue) {
  const dayValue = formatAddTaskDateValue(dayDate);
  const isSelected = dayValue === selectedValue;
  const isDisabled = dayValue < minValue;
  const classNames = getAddTaskDatePickerDayClassNames(dayDate, month, selectedValue);
  return formatAddTaskDatePickerDayButton(dayDate, dayValue, classNames, isSelected, isDisabled);
}

/**
 * Renders the day grid for the add-task date picker.
 * @param {HTMLElement} grid - Grid container that receives the generated day buttons.
 * @param {number} year - Four-digit year of the month being rendered.
 * @param {number} month - Zero-based index of the month being rendered.
 * @param {string} selectedValue - ISO date string currently selected in the due date input.
 * @param {string} minValue - Earliest selectable ISO date string for disabling past days.
 * @returns {void} Nothing is returned after the six-week day grid is written.
 */
function renderAddTaskDatePickerGrid(grid, year, month, selectedValue, minValue) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  grid.innerHTML = Array.from({ length: 42 }, (_, index) => {
    const dayDate = new Date(gridStart);
    dayDate.setDate(gridStart.getDate() + index);
    return buildAddTaskDatePickerDayHtml(dayDate, month, selectedValue, minValue);
  }).join('');
}

/**
 * Renders the add-task date picker month title and day grid.
 * @returns {void} Nothing is returned after the visible month title and day buttons are refreshed.
 */
function renderAddTaskDatePicker() {
  const { activeInput, title, grid, viewDate } = addTaskDatePickerState;
  if (!activeInput || !title || !grid || !viewDate) return;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  title.textContent = `${ADD_TASK_DATE_PICKER_MONTHS[month]} ${year}`;
  const selectedValue = String(activeInput.value || '').trim();
  const minValue = getAddTaskDatePickerMinValue(activeInput);
  renderAddTaskDatePickerGrid(grid, year, month, selectedValue, minValue);
}

/**
 * Clamps the date picker horizontally and flips it above the input when needed.
 * @param {DOMRect} rect - Bounding rectangle of the active due date input.
 * @param {DOMRect} popupRect - Bounding rectangle of the open date picker popup.
 * @returns {void} Nothing is returned after the popup top and left positions are adjusted.
 */
function clampAddTaskDatePickerPosition(rect, popupRect) {
  const { popup } = addTaskDatePickerState;
  if (!popup) return;
  const maxLeft = Math.max(12, window.innerWidth - popupRect.width - 12);
  if (rect.left > maxLeft) popup.style.left = `${Math.round(maxLeft)}px`;
  const fitsBelow = rect.bottom + popupRect.height + 20 <= window.innerHeight;
  if (!fitsBelow) popup.style.top = `${Math.max(12, Math.round(rect.top - popupRect.height - 8))}px`;
}

/**
 * Positions the add-task date picker popup below the active input.
 * @returns {void} Nothing is returned after the popup size and screen position are updated.
 */
function updateAddTaskDatePickerPosition() {
  const { popup, activeInput } = addTaskDatePickerState;
  if (!popup || popup.hidden || !activeInput) return;
  const rect = activeInput.getBoundingClientRect();
  popup.style.width = `${Math.round(rect.width)}px`;
  popup.style.left = `${Math.round(rect.left)}px`;
  popup.style.top = `${Math.round(rect.bottom + 8)}px`;
  clampAddTaskDatePickerPosition(rect, popup.getBoundingClientRect());
}

/**
 * Closes the add-task date picker and resets its state.
 * @param {Object} [options={}] - Optional close behavior flags.
 * @param {boolean} [options.blurActiveInput=false] - Whether the active input should lose focus when closing.
 * @returns {void} Nothing is returned after the popup is hidden and active state is cleared.
 */
function closeAddTaskDatePicker(options = {}) {
  const { blurActiveInput = false } = options;
  const { popup, activeInput } = addTaskDatePickerState;
  if (popup) popup.hidden = true;
  if (activeInput) activeInput.setAttribute('aria-expanded', 'false');
  if (blurActiveInput && activeInput === document.activeElement) activeInput.blur();
  addTaskDatePickerState.activeInput = null;
  addTaskDatePickerState.viewDate = null;
}

/**
 * Sets the date picker value on the active input and closes the picker.
 * @param {string} dateValue - ISO date string written to the due date input.
 * @returns {void} Nothing is returned after the input value is updated and the picker closes.
 */
function setAddTaskDatePickerValue(dateValue) {
  const { activeInput } = addTaskDatePickerState;
  if (!activeInput) return;
  activeInput.value = dateValue;
  activeInput.dispatchEvent(new Event('input', { bubbles: true }));
  activeInput.dispatchEvent(new Event('change', { bubbles: true }));
  activeInput.focus({ preventScroll: true });
  closeAddTaskDatePicker();
}
