/**
 * Returns the header HTML for the add-task form.
 * @returns {string} Result.
 */
function getAddTaskHeaderHTML() {
  return /*html*/ `<div class="add-task-header"><h1>Add Task</h1><span class="close-btn" onclick="closeAddTaskDialog()">x</span></div>`;
}

/**
 * Returns the left column (title, description, date) for the add-task form.
 * @returns {string} Result.
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
 * @returns {string} Result.
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
 * @returns {string} Result.
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
 * @returns {string} Result.
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
 * @returns {string} Result.
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
 * Returns the footer (note + actions) for the add-task form.
 * @param {string} clearLabel - Label for the clear button.
 * @param {string} clearOnClick - onclick handler string.
 * @returns {string} Result.
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

function generateAddTask(options = {}) {
  const isDialog = options && options.variant === 'dialog';
  const clearLabel = isDialog ? 'Cancel x' : 'Clear x';
  const clearOnClick = isDialog ? 'clearForm(); closeAddTaskDialog()' : 'clearForm()';
  return /*html*/ `
    ${getAddTaskHeaderHTML()}
    <div class="form-scroll">
      <form class="task-form" id="add-task-form" novalidate onsubmit="saveToArray(event)">
        ${getAddTaskFormLeftHTML()}
        <div class="form-right">
          ${getAddTaskPriorityHTML()}
          ${getAddTaskContactsHTML()}
          ${getAddTaskCategoryHTML()}
          ${getAddTaskSubtasksHTML()}
        </div>
      </form>
    </div>
    ${getAddTaskFooterHTML(clearLabel, clearOnClick)}
  `;
}

/**
 * Generates add category options.
 * @returns {string} Result.
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
 * Generates assigned contacts.
 * @param {*} contacts - Parameter.
 * @returns {string} Result.
 */
/**
 * Returns HTML for a single contact in the assigned contacts dropdown.
 * @param {Object} contact - Contact object.
 * @param {number} i - Index.
 * @returns {string} Result.
 */
function getAssignedContactItemHTML(contact, i) {
  const isChecked = selectedContacts.includes(contact.name);
  const colorClass = typeof getContactColorClass === 'function' ? getContactColorClass(contact.name) : '';
  return /*html*/ `
    <label class="dropdown-item">
      <div class="dropdown-avatar ${colorClass}">${getContactInitialsFromName(contact.name)}</div>
      <span class="dropdown-name">${contact.name}</span>
      <input type="checkbox" id="contact-${i}" value="${contact.name}" class="contact-checkbox"
        onchange="toggleContactSelection('${contact.name}', this)" ${isChecked ? "checked" : ""}>
    </label>
  `;
}

function generateAssignedContacts(contacts) {
  return contacts.map((contact, i) => getAssignedContactItemHTML(contact, i)).join("");
}

/**
 * Returns selected avatar markup.
 * @param {*} initials - Parameter.
 * @returns {string} Result.
 */
function getSelectedAvatarMarkup(initials, colorClass = '') {
  const cls = colorClass ? `avatar ${colorClass}` : 'avatar';
  return `<div class="${cls}">${initials}</div>`;
}

/**
 * Returns selected avatar +x markup.
 * @param {number} count - Remaining count.
 * @returns {string} Result.
 */
function getSelectedAvatarMoreMarkup(count) {
  return `<div class="avatar avatar-more">+${count}</div>`;
}
