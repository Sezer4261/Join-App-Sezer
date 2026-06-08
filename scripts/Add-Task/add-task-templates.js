/** @file HTML templates for the add-task form. */

/**
 * Returns the header HTML for the add-task form.
 * @returns {string} HTML markup for the add-task dialog header and close button.
 */
function getAddTaskHeaderHTML() {
  return /*html*/ `<div class="add-task-header"><h1>Add Task</h1><span class="close-btn" onclick="closeAddTaskDialog()">x</span></div>`;
}

/**
 * Returns the left column fields for the add-task form.
 * @returns {string} HTML markup for the title, description, and due date fields.
 */
function getAddTaskFormLeftHTML() {
  return /*html*/ `
    <div class="form-left">
      <label><span>Title<span class="req">*</span></span><input type="text" placeholder="Enter a title" id="title"><div class="error-message" id="title-error"></div></label>
      <label>Description<textarea placeholder="Enter a Description" id="description"></textarea></label>
      <label><span>Due date<span class="req">*</span></span><input type="date" id="date"><div class="error-message" id="date-error"></div></label>
    </div>
    <div class="form-separator" aria-hidden="true"></div>
  `;
}

/**
 * Returns the priority section for the add-task form.
 * @returns {string} HTML markup for the urgent, medium, and low priority radio options.
 */
function getAddTaskPriorityHTML() {
  return /*html*/ `
    <div class="priority"><span>Priority</span><div class="priority-options">
      <input type="radio" id="urgent" name="priority" value="urgent">
      <label for="urgent" class="urgent priority-btn">Urgent ${URGENT_ICON}</label>
      <input type="radio" id="medium" name="priority" value="medium" checked>
      <label for="medium" class="medium priority-btn">Medium ${MEDIUM_ICON}</label>
      <input type="radio" id="low" name="priority" value="low">
      <label for="low" class="low priority-btn">Low ${LOW_ICON}</label>
    </div></div>
  `;
}

/**
 * Returns the contacts dropdown section for the add-task form.
 * @returns {string} HTML markup for the assigned-to contact selector and avatar container.
 */
function getAddTaskContactsHTML() {
  return /*html*/ `
    <div class="assigned-to-label">Assigned to
      <div id="select-contacts" class="custom-select" tabindex="0" onclick="toggleDropdown(event)">
        <span>Select contacts to assign<img src="./assets/icons/arrow-drop-down.svg" alt="" class="dropdown-arrow"></span>
        <div id="dropdown-contacts" class="dropdown-content" onclick="event.stopPropagation()"></div>
      </div>
      <div id="selected-avatars" class="avatar-container"></div>
    </div>
  `;
}

/**
 * Returns the category section for the add-task form.
 * @returns {string} HTML markup for the category custom select and hidden input field.
 */
function getAddTaskCategoryHTML() {
  return /*html*/ `
    <label class="category"><span>Category<span class="req">*</span></span>
      <div id="category-select" tabindex="0" class="custom-select">
        <span onclick="toggleAddCategoryDropdown(event)">Select task category<img src="./assets/icons/arrow-drop-down.svg" alt="" class="dropdown-arrow"></span>
        <div id="category-dropdown" class="dropdown-content" onclick="event.stopPropagation()">${generateAddCategoryOptions()}</div>
      </div>
      <input type="hidden" id="category">
      <div class="error-message" id="category-error"></div>
    </label>
  `;
}

/**
 * Returns the subtasks section for the add-task form.
 * @returns {string} HTML markup for the subtask input, actions, error area, and list container.
 */
function getAddTaskSubtasksHTML() {
  return /*html*/ `
    <label>Subtasks
      <div class="subtasks"><input type="text" id="subtask" placeholder="Add new subtask">
        <div class="subtask-input-actions">
          <button type="button" class="subtask-icon-btn" onclick="clearSubtaskInput()" aria-label="Clear subtask"><img src="./assets/icons/iconoir-cancel.svg" alt=""></button>
          <div class="subtask-input-separator"></div>
          <button type="button" class="subtask-icon-btn" onclick="addSubtask()" aria-label="Add subtask"><img src="./assets/icons/checkmark.svg" alt=""></button>
        </div></div>
      <div class="error-message" id="subtask-error"></div>
      <ul id="subtask-area" class="subtask-list"></ul>
    </label>
  `;
}

/**
 * Returns the footer section for the add-task form.
 * @param {string} clearLabel - Visible label text for the clear or cancel button.
 * @param {string} clearOnClick - Inline onclick handler string executed when the clear button is pressed.
 * @returns {string} HTML markup for the required-field note and form action buttons.
 */
function getAddTaskFooterHTML(clearLabel, clearOnClick) {
  return /*html*/ `
    <div class="form-footer"><p class="note note-outside"><span class="req">*</span>This field is required</p>
      <div class="actions">
        <button type="reset" class="clear" onclick="${clearOnClick}" form="add-task-form">${clearLabel}</button>
        <button type="submit" id="create-task-btn" class="create" form="add-task-form">Create Task <img src="assets/icons/vector-5.svg" alt=""></button>
      </div>
    </div>
  `;
}

/**
 * Returns clear-button options based on the add-task presentation variant.
 * @param {Object} [options={}] - Configuration object that may specify the dialog variant.
 * @returns {{clearLabel: string, clearOnClick: string}} Labels and handlers used by the footer clear button.
 */
function getAddTaskClearOptions(options = {}) {
  const isDialog = options && options.variant === 'dialog';
  return {
    clearLabel: isDialog ? 'Cancel x' : 'Clear x',
    clearOnClick: isDialog ? 'clearForm(); closeAddTaskDialog()' : 'clearForm()',
  };
}

/**
 * Returns the right column fields for the add-task form.
 * @returns {string} HTML markup for priority, contacts, category, and subtasks sections.
 */
function getAddTaskFormRightHTML() {
  return /*html*/ `
        <div class="form-right">
          ${getAddTaskPriorityHTML()}
          ${getAddTaskContactsHTML()}
          ${getAddTaskCategoryHTML()}
          ${getAddTaskSubtasksHTML()}
        </div>
  `;
}

/**
 * Returns the scrollable form body for the add-task form.
 * @returns {string} HTML markup for the scrollable wrapper and add-task form element.
 */
function getAddTaskFormBodyHTML() {
  return /*html*/ `
    <div class="form-scroll">
      <form class="task-form" id="add-task-form" novalidate onsubmit="saveToArray(event)">
        ${getAddTaskFormLeftHTML()}
        ${getAddTaskFormRightHTML()}
      </form>
    </div>
  `;
}

/**
 * Generates the full add-task form markup.
 * @param {Object} [options={}] - Configuration object that may specify the dialog variant.
 * @returns {string} Complete HTML markup for the add-task header, form body, and footer.
 */
function generateAddTask(options = {}) {
  const { clearLabel, clearOnClick } = getAddTaskClearOptions(options);
  return /*html*/ `
    ${getAddTaskHeaderHTML()}
    ${getAddTaskFormBodyHTML()}
    ${getAddTaskFooterHTML(clearLabel, clearOnClick)}
  `;
}

/**
 * Generates add category dropdown option items.
 * @returns {string} HTML markup for each selectable task category in the dropdown.
 */
function generateAddCategoryOptions() {
  const categories = ["Technical Task", "User Story"];
  return categories.map((cat) => /*html*/ `
    <div class="dropdown-item" onclick="setAddCategory('${cat}')">
      <span class="dropdown-name">${cat}</span>
    </div>
  `).join("");
}

/**
 * Returns HTML for a single contact in the assigned contacts dropdown.
 * @param {Object} contact - Contact object containing at least a display name.
 * @param {number} index - Zero-based index of the contact in the contacts list.
 * @returns {string} HTML markup for one contact row with avatar, name, and checkbox.
 */
function getAssignedContactItemHTML(contact, index) {
  const isChecked = selectedContacts.includes(contact.name);
  const colorClass = typeof getContactColorClass === 'function' ? getContactColorClass(contact.name) : '';
  return /*html*/ `
    <label class="dropdown-item">
      <div class="dropdown-avatar ${colorClass}">${getContactInitialsFromName(contact.name)}</div>
      <span class="dropdown-name">${contact.name}</span>
      <input type="checkbox" id="contact-${index}" value="${contact.name}" class="contact-checkbox"
        onchange="toggleContactSelection('${contact.name}', this)" ${isChecked ? "checked" : ""}>
    </label>
  `;
}

/**
 * Generates assigned contacts dropdown items from a contact list.
 * @param {Array<Object>} contacts - Array of contact objects to render in the dropdown.
 * @returns {string} Combined HTML markup for all contact dropdown rows.
 */
function generateAssignedContacts(contacts) {
  return contacts.map((contact, index) => getAssignedContactItemHTML(contact, index)).join("");
}

/**
 * Returns selected avatar markup for one assigned contact.
 * @param {string} initials - Two-letter initials shown inside the avatar circle.
 * @param {string} [colorClass=''] - Optional CSS class that sets the avatar background color.
 * @returns {string} HTML markup for a single selected-contact avatar.
 */
function getSelectedAvatarMarkup(initials, colorClass = '') {
  const cls = colorClass ? `avatar ${colorClass}` : 'avatar';
  return `<div class="${cls}">${initials}</div>`;
}

/**
 * Returns selected avatar overflow markup when more contacts are assigned than can be shown.
 * @param {number} count - Number of additional assigned contacts not rendered as individual avatars.
 * @returns {string} HTML markup for the +N overflow avatar indicator.
 */
function getSelectedAvatarMoreMarkup(count) {
  return `<div class="avatar avatar-more">+${count}</div>`;
}

/**
 * Returns the inner HTML markup for the add-task date picker popup.
 * @param {string[]} weekdays - Short weekday labels displayed above the calendar grid.
 * @returns {string} HTML markup for the date picker header, weekday row, and day grid container.
 */
function getAddTaskDatePickerPopupMarkup(weekdays) {
  return `
      <div class="add-task-date-picker__header">
        <button type="button" class="add-task-date-picker__nav" data-action="previous-month" aria-label="Previous month">&#8249;</button>
        <div class="add-task-date-picker__title" aria-live="polite"></div>
        <button type="button" class="add-task-date-picker__nav" data-action="next-month" aria-label="Next month">&#8250;</button>
      </div>
      <div class="add-task-date-picker__weekdays">${weekdays.map((day) => `<span>${day}</span>`).join('')}</div>
      <div class="add-task-date-picker__grid" role="grid"></div>
    `;
}
