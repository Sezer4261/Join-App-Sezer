/** @file Calendar date picker for add-task due date. */
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

function ensureAddTaskDatePickerGlobalHandlers() {
  if (addTaskDatePickerState.globalHandlersBound) return;
  document.addEventListener('pointerdown', handleAddTaskDatePickerOutsidePointerDown, true);
  document.addEventListener('pointerup', handleAddTaskDatePickerOutsidePointerUp, true);
  document.addEventListener('keydown', handleAddTaskDatePickerGlobalKeydown);
  window.addEventListener('resize', updateAddTaskDatePickerPosition);
  window.addEventListener('scroll', updateAddTaskDatePickerPosition, true);
  addTaskDatePickerState.globalHandlersBound = true;
}

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

function shouldUseCustomAddTaskDatePicker() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches;
}

function parseAddTaskDateValue(value) {
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) return null;
  const [year, month, day] = normalizedValue.split('-').map(Number);
  if (!year || !month || !day) return null;
  const parsedDate = new Date(year, month - 1, day);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return parsedDate;
}

function formatAddTaskDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getAddTaskDatePickerMinValue(dateInput) {
  return String(dateInput?.min || getTodayDateString()).trim();
}

function getAddTaskDatePickerInitialDate(dateInput) {
  return parseAddTaskDateValue(dateInput?.value)
    || parseAddTaskDateValue(getAddTaskDatePickerMinValue(dateInput))
    || new Date();
}

/**
 * Returns the inner HTML markup for the add-task date picker popup.
 * @returns {string}
 */
function getAddTaskDatePickerPopupMarkup() {
  return `
      <div class="add-task-date-picker__header">
        <button type="button" class="add-task-date-picker__nav" data-action="previous-month" aria-label="Previous month">&#8249;</button>
        <div class="add-task-date-picker__title" aria-live="polite"></div>
        <button type="button" class="add-task-date-picker__nav" data-action="next-month" aria-label="Next month">&#8250;</button>
      </div>
      <div class="add-task-date-picker__weekdays">${ADD_TASK_DATE_PICKER_WEEKDAYS.map((day) => `<span>${day}</span>`).join('')}</div>
      <div class="add-task-date-picker__grid" role="grid"></div>
    `;
}

/**
 * Stores popup element references in add-task date picker state.
 * @param {HTMLElement} popup - Popup root element.
 * @returns {void}
 */
function cacheAddTaskDatePickerPopupElements(popup) {
  addTaskDatePickerState.popup = popup;
  addTaskDatePickerState.title = popup.querySelector('.add-task-date-picker__title');
  addTaskDatePickerState.grid = popup.querySelector('.add-task-date-picker__grid');
}

/**
 * Creates and caches the add-task date picker popup element.
 * @returns {HTMLElement}
 */
function createAddTaskDatePickerPopup() {
  const popup = document.createElement('div');
  popup.className = 'add-task-date-picker-popup';
  popup.hidden = true;
  popup.innerHTML = getAddTaskDatePickerPopupMarkup();
  popup.addEventListener('click', handleAddTaskDatePickerClick);
  popup.addEventListener('pointerup', handleAddTaskDatePickerPointerUp);
  cacheAddTaskDatePickerPopupElements(popup);
  return popup;
}

/**
 * Mounts the date picker popup under the dialog or document body.
 * @param {HTMLElement} dateInput - Date input element.
 * @returns {void}
 */
function mountAddTaskDatePickerPopup(dateInput) {
  const popupParent = dateInput?.closest('dialog') || document.body;
  if (addTaskDatePickerState.popup.parentElement !== popupParent) {
    popupParent.appendChild(addTaskDatePickerState.popup);
  }
}

/**
 * Ensures the add-task date picker popup exists and is mounted.
 * @param {HTMLElement} dateInput - Date input element.
 * @returns {HTMLElement}
 */
function ensureAddTaskDatePickerPopup(dateInput) {
  ensureAddTaskDatePickerGlobalHandlers();
  if (!addTaskDatePickerState.popup) createAddTaskDatePickerPopup();
  mountAddTaskDatePickerPopup(dateInput);
  return addTaskDatePickerState.popup;
}

function updateAddTaskDateInputMode(dateInput) {
  if (!dateInput) return;
  const useCustomPicker = shouldUseCustomAddTaskDatePicker();
  dateInput.readOnly = useCustomPicker;
  dateInput.setAttribute('aria-haspopup', 'dialog');
  dateInput.setAttribute('aria-expanded', addTaskDatePickerState.activeInput === dateInput ? 'true' : 'false');
}

/**
 * Builds CSS class names for an add-task date picker day button.
 * @param {Date} dayDate - Calendar day date.
 * @param {number} month - Visible month index.
 * @param {string} selectedValue - Currently selected date value.
 * @returns {string}
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
 * Builds HTML for a single day button in the add-task date picker.
 * @param {Date} dayDate - Calendar day date.
 * @param {number} month - Visible month index.
 * @param {string} selectedValue - Currently selected date value.
 * @param {string} minValue - Minimum selectable date value.
 * @returns {string}
 */
/**
 * Formats a day button element for the add-task date picker grid.
 * @param {Date} dayDate - Calendar day date.
 * @param {string} dayValue - ISO date value for the day.
 * @param {string} classNames - CSS class names for the button.
 * @param {boolean} isSelected - Whether the day is selected.
 * @param {boolean} isDisabled - Whether the day is disabled.
 * @returns {string}
 */
function formatAddTaskDatePickerDayButton(dayDate, dayValue, classNames, isSelected, isDisabled) {
  return `<button type="button" class="${classNames}" data-date="${dayValue}" ${isDisabled ? 'disabled' : ''} aria-pressed="${isSelected ? 'true' : 'false'}">${dayDate.getDate()}</button>`;
}

function buildAddTaskDatePickerDayHtml(dayDate, month, selectedValue, minValue) {
  const dayValue = formatAddTaskDateValue(dayDate);
  const isSelected = dayValue === selectedValue;
  const isDisabled = dayValue < minValue;
  const classNames = getAddTaskDatePickerDayClassNames(dayDate, month, selectedValue);
  return formatAddTaskDatePickerDayButton(dayDate, dayValue, classNames, isSelected, isDisabled);
}

/**
 * Renders the day grid for the add-task date picker.
 * @param {HTMLElement} grid - Grid container element.
 * @param {number} year - Visible year.
 * @param {number} month - Visible month index.
 * @param {string} selectedValue - Currently selected date value.
 * @param {string} minValue - Minimum selectable date value.
 * @returns {void}
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
 * @returns {void}
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
 * @param {DOMRect} rect - Input bounding rect.
 * @param {DOMRect} popupRect - Popup bounding rect.
 * @returns {void}
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
 * @returns {void}
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

function closeAddTaskDatePicker(options = {}) {
  const { blurActiveInput = false } = options;
  const { popup, activeInput } = addTaskDatePickerState;
  if (popup) popup.hidden = true;
  if (activeInput) activeInput.setAttribute('aria-expanded', 'false');
  if (blurActiveInput && activeInput === document.activeElement) activeInput.blur();
  addTaskDatePickerState.activeInput = null;
  addTaskDatePickerState.viewDate = null;
}

function setAddTaskDatePickerValue(dateValue) {
  const { activeInput } = addTaskDatePickerState;
  if (!activeInput) return;
  activeInput.value = dateValue;
  activeInput.dispatchEvent(new Event('input', { bubbles: true }));
  activeInput.dispatchEvent(new Event('change', { bubbles: true }));
  activeInput.focus({ preventScroll: true });
  closeAddTaskDatePicker();
}

/**
 * Handles month navigation inside the add-task date picker.
 * @param {HTMLElement} actionButton - Previous/next month button.
 * @returns {void}
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
 * @param {Event} event - Click event.
 * @returns {void}
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

function handleAddTaskDatePickerPointerUp(event) {
  const dayButton = event.target.closest('[data-date]');
  if (!dayButton || dayButton.disabled) return;
  event.stopPropagation();
  event.preventDefault();
}

/**
 * Returns whether an outside pointer event should stay inside the date picker.
 * @param {Event} event - Pointer event.
 * @param {HTMLElement|null} popup - Date picker popup element.
 * @returns {boolean} Result.
 */
function shouldKeepAddTaskDatePickerOpen(event, popup) {
  if (popup && !popup.hidden && isInsideActiveAddTaskDatePicker(event.target)) return true;
  return !popup && isInsideActiveAddTaskDatePicker(event.target);
}

/**
 * Closes the date picker when the user clicks outside it.
 * @param {Event} event - Pointer event.
 * @returns {void}
 */
function handleAddTaskDatePickerOutsidePointerDown(event) {
  const { popup, activeInput } = addTaskDatePickerState;
  if (!activeInput) return;
  if (shouldKeepAddTaskDatePickerOpen(event, popup)) { event.stopPropagation(); return; }
  closeAddTaskDatePicker({ blurActiveInput: true });
}

function handleAddTaskDatePickerOutsidePointerUp(event) {
  const { popup, activeInput } = addTaskDatePickerState;
  if (!activeInput || !popup || popup.hidden) return;

  const dayButton = event.target.closest('[data-date]');
  if (!dayButton || dayButton.disabled) return;

  event.stopPropagation();
}

function handleAddTaskDatePickerFocusIn(event) {
  const { activeInput } = addTaskDatePickerState;
  if (!activeInput) return;
  if (isInsideActiveAddTaskDatePicker(event.target)) return;
  closeAddTaskDatePicker();
}

function handleAddTaskDatePickerGlobalKeydown(event) {
  if (event.key === 'Escape') closeAddTaskDatePicker();
}

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
 * Whether the custom date picker is already open for the given input.
 * @param {HTMLElement} dateInput - Date input element.
 * @returns {boolean}
 */
function isAddTaskDatePickerOpenForInput(dateInput) {
  return shouldUseCustomAddTaskDatePicker()
    && addTaskDatePickerState.activeInput === dateInput
    && addTaskDatePickerState.popup
    && !addTaskDatePickerState.popup.hidden;
}

/**
 * Opens the native browser date picker for the add-task date input.
 * @param {HTMLElement} dateInput - Date input element.
 * @returns {void}
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
 * Opens the add-task date picker (custom or native depending on device).
 * @param {HTMLElement} dateInput - Date input element.
 * @returns {void}
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
