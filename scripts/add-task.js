/**
 * Renders add task.
 * @returns {Promise<*>} Result.
 */
/**
 * Initializes event handlers after add-task form is rendered.
 * @returns {void} Result.
 */
function initAddTaskHandlers() {
  initAddDropdownClose();
  initAddTaskBlurValidation();
  initAddSubtaskEnter();
  showSubtasks();
  updateCreateButtonState();
}

async function renderAddTask() {
  const content = document.getElementById('add-task-content');
  if (!content) return;
  setAddTaskActionButtonsDisabled(false);
  applyTodayMinDate();
  await loadContacts();
  resetSelectedContacts();
  selectContacts();
  renderSelectedAvatars();
  initAddTaskHandlers();
}

/**
 * Initializes add task blur validation handlers.
 * @returns {void} Result.
 */
/**
 * Binds blur/change/click handlers for title, date, and category fields.
 * @param {HTMLElement} titleInput - Title input.
 * @param {HTMLElement} dateInput - Date input.
 * @param {HTMLElement} categorySelect - Category select.
 * @returns {void} Result.
 */
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
  document.addEventListener('focusin', handleAddTaskDatePickerFocusIn, true);
  document.addEventListener('keydown', handleAddTaskDatePickerGlobalKeydown);
  window.addEventListener('resize', updateAddTaskDatePickerPosition);
  window.addEventListener('scroll', updateAddTaskDatePickerPosition, true);
  addTaskDatePickerState.globalHandlersBound = true;
}

function isInsideActiveAddTaskDatePicker(target) {
  const { popup, activeInput } = addTaskDatePickerState;
  if (!activeInput) return false;
  const dateLabel = activeInput.closest('label');
  return !!(
    popup?.contains(target)
    || activeInput === target
    || dateLabel?.contains(target)
  );
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

function handleAddTaskDatePickerOutsidePointerDown(event) {
  const { popup, activeInput } = addTaskDatePickerState;
  if (!activeInput) return;
  if (popup && !popup.hidden && isInsideActiveAddTaskDatePicker(event.target)) return;
  if (!popup && isInsideActiveAddTaskDatePicker(event.target)) return;
  closeAddTaskDatePicker({ blurActiveInput: true });
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
  addTaskDatePickerState.viewDate = new Date(getAddTaskDatePickerInitialDate(dateInput).getFullYear(), getAddTaskDatePickerInitialDate(dateInput).getMonth(), 1);
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

function bindAddTaskFieldListeners(titleInput, dateInput, categorySelect) {
  titleInput?.addEventListener('blur', validateTitleField);
  titleInput?.addEventListener('input', clearTitleErrorOnValidInput);
  titleInput?.addEventListener('input', updateCreateButtonState);
  dateInput?.addEventListener('blur', validateDateField);
  dateInput?.addEventListener('input', clearDateErrorOnValidInput);
  dateInput?.addEventListener('input', updateCreateButtonState);
  dateInput?.addEventListener('change', clearDateErrorOnValidInput);
  dateInput?.addEventListener('change', updateCreateButtonState);
  const dateLabel = dateInput?.closest('label');
  updateAddTaskDateInputMode(dateInput);
  dateInput?.addEventListener('pointerdown', (event) => {
    if (!shouldUseCustomAddTaskDatePicker()) return;
    event.preventDefault();
    openAddTaskDatePicker(dateInput);
  });
  dateInput?.addEventListener('click', () => {
    if (shouldUseCustomAddTaskDatePicker()) return;
    openAddTaskDatePicker(dateInput);
  });
  dateInput?.addEventListener('keydown', (event) => {
    if (!shouldUseCustomAddTaskDatePicker()) return;
    if (!['Enter', ' ', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    openAddTaskDatePicker(dateInput);
  });
  dateLabel?.addEventListener('pointerdown', (event) => {
    if (!dateInput || event.target === dateInput || event.target?.id === 'date-error' || !shouldUseCustomAddTaskDatePicker()) return;
    event.preventDefault();
    openAddTaskDatePicker(dateInput);
  });
  dateLabel?.addEventListener('click', (event) => {
    if (!dateInput || event.target === dateInput || event.target?.id === 'date-error' || shouldUseCustomAddTaskDatePicker()) return;
    openAddTaskDatePicker(dateInput);
  });
  categorySelect?.addEventListener('blur', validateCategoryField);
  categorySelect?.addEventListener('change', updateCreateButtonState);
}

/**
 * Initializes blur/change validation listeners for the add-task form fields.
 * @returns {void} Result.
 */
function initAddTaskBlurValidation() {
  const form = document.getElementById('add-task-form');
  if (!form || form.dataset.blurValidationInit === '1') return;
  bindAddTaskFieldListeners(
    document.getElementById('title'),
    document.getElementById('date'),
    document.getElementById('category-select')
  );
  form.dataset.blurValidationInit = '1';
}

/**
 * Returns whether all required add-task form fields are filled.
 * @returns {boolean} Result.
 */
function isAddTaskFormComplete() {
  const titleInput = document.getElementById('title');
  const dateInput = document.getElementById('date');
  const categoryInput = document.getElementById('category');
  const hasTitle = titleInput && String(titleInput.value || '').trim().length > 0;
  const hasDate = dateInput && String(dateInput.value || '').trim().length > 0;
  const hasCategory = categoryInput && String(categoryInput.value || '').trim().length > 0;
  return hasTitle && hasDate && hasCategory;
}

/**
 * Updates the disabled state of the create-task button based on form completeness.
 * @returns {void} Result.
 */
function updateCreateButtonState() {
  const btn = document.getElementById('create-task-btn');
  if (!btn) return;
  btn.disabled = !isAddTaskFormComplete();
}

/**
 * Executes reset selected contacts logic.
 * @returns {void} Result.
 */
function resetSelectedContacts() {
  selectedContacts = [];
}

/**
 * Builds a task data object from the current add-task form values.
 * @returns {Object} Task data object ready for saving.
 */
function generateTaskFromForm() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const dueDate = document.getElementById('date').value.trim();
  const priority = document.querySelector('input[name="priority"]:checked').value;
  const category = document.getElementById('category').value.trim();
  return {
    id: Date.now(),
    title,
    description,
    dueDate,
    priority,
    contacts: [...selectedContacts],
    category,
    subtasks: [...subtasks],
    status: window.currentBoardStatus || "To Do",
    order: Date.now(),
  };
}

/**
 * Saves to array.
 * @param {Event} event - Browser event.
 * @returns {Promise<*>} Result.
 */
async function saveToArray(event) {
  event.preventDefault();
  if (!validateForm()) return;
  const task = generateTaskFromForm();
  const result = await saveTask(task);
  if (result) {
    handleSaveSuccess();
    return;
  }
  handleSaveFailure();
}

/**
 * Executes handle save success logic.
 * @returns {void} Result.
 */
/**
 * Handles post-save navigation (close dialog or redirect).
 * @returns {void} Result.
 */
function schedulePostSaveNavigation() {
  if (typeof closeAddTaskDialog === "function") {
    setTimeout(async () => { closeAddTaskDialog(); await loadTasks(); }, 1500);
  } else {
    setTimeout(() => { window.location.href = "board.html"; }, 1500);
  }
}

function handleSaveSuccess() {
  closeAddTaskDatePicker();
  setAddTaskActionButtonsDisabled(true);
  showMessage("Task added to board", "success", { iconSrc: "./assets/icons/vector-board.svg", iconAlt: "Board" });
  subtasks.length = 0;
  selectedContacts.length = 0;
  showSubtasks();
  document.getElementById('add-task-form').reset();
  schedulePostSaveNavigation();
}

/**
 * Executes handle save failure logic.
 * @returns {void} Result.
 */
function handleSaveFailure() {
  showMessage("Task could not be saved", "error");
}

/**
 * Enables or disables add-task action buttons.
 * @param {boolean} disabled - Whether buttons should be disabled.
 * @returns {void} Result.
 */
function setAddTaskActionButtonsDisabled(disabled) {
  const buttons = document.querySelectorAll('#add-task-form ~ .form-footer .clear, #add-task-form ~ .form-footer .create, .actions .clear[form="add-task-form"], .actions .create[form="add-task-form"]');
  buttons.forEach((button) => {
    button.disabled = !!disabled;
    button.setAttribute('aria-disabled', disabled ? 'true' : 'false');
  });
}

/**
 * Saves task.
 * @param {Object} task - Task object.
 * @returns {Promise<*>} Result.
 */
async function saveTask(task) {
  try {
    const response = await fetch(`${BASE_URL}/tasks.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    return await response.json();
  } catch (error) {
    console.error("Fehler beim Speichern des Tasks:", error);
  }
}

/**
 * Clears form.
 * @returns {void} Result.
 */
/**
 * Clears category UI fields.
 * @returns {void} Result.
 */
function clearFormCategoryUI() {
  const categoryInput = document.getElementById('category');
  const categorySelect = document.getElementById('category-select');
  if (categoryInput) categoryInput.value = '';
  if (categorySelect) {
    const label = categorySelect.querySelector('span');
    if (label) label.childNodes[0].textContent = 'Select task category ';
  }
}

/**
 * Clears contacts dropdown checkboxes and resets selected avatars.
 * @returns {void} Result.
 */
function clearFormContactsDropdown() {
  const dropdown = document.getElementById('dropdown-contacts');
  if (dropdown) dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
  selectedContacts = [];
  renderSelectedAvatars();
}

/**
 * Clears subtasks array and re-renders subtask area.
 * @returns {void} Result.
 */
function clearFormSubtasks() {
  if (Array.isArray(subtasks)) subtasks.length = 0;
  showSubtasks();
  updateCreateButtonState();
}

/**
 * Resets the add-task form and clears all validation errors and selections.
 * @returns {void} Result.
 */
function clearForm() {
  const form = document.getElementById('add-task-form');
  if (form) form.reset();
  clearValidationErrors();
  if (typeof setSubtaskError === 'function') setSubtaskError('');
  ['title', 'date', 'category'].forEach(id => document.getElementById(id)?.classList.remove('input-error'));
  document.getElementById('category-select')?.classList.remove('input-error');
  clearFormCategoryUI();
  clearFormContactsDropdown();
  clearFormSubtasks();
}
