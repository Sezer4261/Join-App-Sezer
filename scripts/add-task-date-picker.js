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

function ensureAddTaskDatePickerPopup(dateInput) {
  ensureAddTaskDatePickerGlobalHandlers();

  if (!addTaskDatePickerState.popup) {
    const popup = document.createElement('div');
    popup.className = 'add-task-date-picker-popup';
    popup.hidden = true;
    popup.innerHTML = `
      <div class="add-task-date-picker__header">
        <button type="button" class="add-task-date-picker__nav" data-action="previous-month" aria-label="Previous month">&#8249;</button>
        <div class="add-task-date-picker__title" aria-live="polite"></div>
        <button type="button" class="add-task-date-picker__nav" data-action="next-month" aria-label="Next month">&#8250;</button>
      </div>
      <div class="add-task-date-picker__weekdays">${ADD_TASK_DATE_PICKER_WEEKDAYS.map((day) => `<span>${day}</span>`).join('')}</div>
      <div class="add-task-date-picker__grid" role="grid"></div>
    `;
    popup.addEventListener('click', handleAddTaskDatePickerClick);
    popup.addEventListener('pointerup', handleAddTaskDatePickerPointerUp);
    addTaskDatePickerState.popup = popup;
    addTaskDatePickerState.title = popup.querySelector('.add-task-date-picker__title');
    addTaskDatePickerState.grid = popup.querySelector('.add-task-date-picker__grid');
  }

  const popupParent = dateInput?.closest('dialog') || document.body;
  if (addTaskDatePickerState.popup.parentElement !== popupParent) {
    popupParent.appendChild(addTaskDatePickerState.popup);
  }

  return addTaskDatePickerState.popup;
}

function updateAddTaskDateInputMode(dateInput) {
  if (!dateInput) return;
  const useCustomPicker = shouldUseCustomAddTaskDatePicker();
  dateInput.readOnly = useCustomPicker;
  dateInput.setAttribute('aria-haspopup', 'dialog');
  dateInput.setAttribute('aria-expanded', addTaskDatePickerState.activeInput === dateInput ? 'true' : 'false');
}

function renderAddTaskDatePicker() {
  const { activeInput, title, grid, viewDate } = addTaskDatePickerState;
  if (!activeInput || !title || !grid || !viewDate) return;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  title.textContent = `${ADD_TASK_DATE_PICKER_MONTHS[month]} ${year}`;

  const selectedValue = String(activeInput.value || '').trim();
  const minValue = getAddTaskDatePickerMinValue(activeInput);
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);

  grid.innerHTML = Array.from({ length: 42 }, (_, index) => {
    const dayDate = new Date(gridStart);
    dayDate.setDate(gridStart.getDate() + index);
    const dayValue = formatAddTaskDateValue(dayDate);
    const isCurrentMonth = dayDate.getMonth() === month;
    const isToday = dayValue === getTodayDateString();
    const isSelected = dayValue === selectedValue;
    const isDisabled = dayValue < minValue;
    const classNames = [
      'add-task-date-picker__day',
      isCurrentMonth ? '' : 'is-outside-month',
      isToday ? 'is-today' : '',
      isSelected ? 'is-selected' : '',
    ].filter(Boolean).join(' ');
    return `
      <button
        type="button"
        class="${classNames}"
        data-date="${dayValue}"
        ${isDisabled ? 'disabled' : ''}
        aria-pressed="${isSelected ? 'true' : 'false'}"
      >${dayDate.getDate()}</button>
    `;
  }).join('');
}

function updateAddTaskDatePickerPosition() {
  const { popup, activeInput } = addTaskDatePickerState;
  if (!popup || popup.hidden || !activeInput) return;
  const rect = activeInput.getBoundingClientRect();
  popup.style.width = `${Math.round(rect.width)}px`;
  popup.style.left = `${Math.round(rect.left)}px`;
  popup.style.top = `${Math.round(rect.bottom + 8)}px`;

  const popupRect = popup.getBoundingClientRect();
  const maxLeft = Math.max(12, window.innerWidth - popupRect.width - 12);
  if (rect.left > maxLeft) popup.style.left = `${Math.round(maxLeft)}px`;

  const fitsBelow = rect.bottom + popupRect.height + 20 <= window.innerHeight;
  if (!fitsBelow) {
    popup.style.top = `${Math.max(12, Math.round(rect.top - popupRect.height - 8))}px`;
  }
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

function handleAddTaskDatePickerClick(event) {
  event.stopPropagation();
  event.preventDefault();

  const actionButton = event.target.closest('[data-action]');
  if (actionButton) {
    const monthOffset = actionButton.dataset.action === 'previous-month' ? -1 : 1;
    const currentViewDate = addTaskDatePickerState.viewDate || new Date();
    addTaskDatePickerState.viewDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + monthOffset, 1);
    renderAddTaskDatePicker();
    updateAddTaskDatePickerPosition();
    return;
  }

  const dayButton = event.target.closest('[data-date]');
  if (!dayButton || dayButton.disabled) return;
  setAddTaskDatePickerValue(dayButton.dataset.date);
}

function handleAddTaskDatePickerPointerUp(event) {
  const dayButton = event.target.closest('[data-date]');
  if (!dayButton || dayButton.disabled) return;
  event.stopPropagation();
  event.preventDefault();
}

function handleAddTaskDatePickerOutsidePointerDown(event) {
  const { popup, activeInput } = addTaskDatePickerState;
  if (!activeInput) return;

  if (popup && !popup.hidden && isInsideActiveAddTaskDatePicker(event.target)) {
    event.stopPropagation();
    return;
  }
  if (!popup && isInsideActiveAddTaskDatePicker(event.target)) {
    event.stopPropagation();
    return;
  }

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

function openAddTaskDatePicker(dateInput) {
  if (!dateInput) return;
  ensureAddTaskDatePickerGlobalHandlers();
  if (
    shouldUseCustomAddTaskDatePicker()
    && addTaskDatePickerState.activeInput === dateInput
    && addTaskDatePickerState.popup
    && !addTaskDatePickerState.popup.hidden
  ) {
    closeAddTaskDatePicker();
    return;
  }
  updateAddTaskDateInputMode(dateInput);
  if (shouldUseCustomAddTaskDatePicker()) {
    openCustomAddTaskDatePicker(dateInput);
    return;
  }
  addTaskDatePickerState.activeInput = dateInput;
  addTaskDatePickerState.viewDate = null;
  updateAddTaskDateInputMode(dateInput);
  try {
    dateInput.showPicker();
    return;
  } catch (_) {}
  dateInput.focus({ preventScroll: true });
}
