/**
 * Returns task modal template.
 * @param {Object} task - Task object.
 * @returns {string} Result.
 */
function getTaskModalTemplate(task) {
  return /*html*/ `
    <div class="modal-content">
      <span class="close" onclick="closeModal()">&times;</span>
      <div class="task-category" style="background-color: ${task.category === "User Story" ? "#0038FF" : "#1FD7C1"}">${task.category}</div>
      <div class="modal-title"><h2>${task.title}</h2></div>
      <div class="modal-description">${task.description}</div>
      <div class="modal-date"><span class="modal-titles-task">Due date:</span> ${task.dueDate}</div>
      <div class="modal-priority">
        <span class="modal-titles-task">Priority:</span>
        <div>${task.priority}</div>
        ${task.priority === "urgent" ? '<img src="./assets/img/Category_Urgent.svg" alt="Urgent">'
      : task.priority === "medium" ? '<img src="./assets/icons/medium_orange.svg" alt="Medium">'
        : '<img src="./assets/img/Category_Low.svg" alt="Low">'}
      </div>
      <div class="modal-contacts">
        <span class="modal-titles-task">Assigned To:</span>
        <div class="modal-contacts-list">
          ${generateModalAssignedContacts(task)}
        </div>
      </div>
      <div class="modal-subtasks-area">
        <span class="modal-titles-task">Subtasks</span>
        <div class="modal-subtasks">
          ${generateModalSubtasks(task)}
        </div>
      </div>
      <div class="modal-actions">
        <div class="modal-delete" onclick="deleteTask()">
          <svg width="24" height="24" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path class="delete-svg-path"
                d="M10 27C9.175 27 8.47917 26.6958 7.9125 26.0875C7.34583 25.4792 7.0625 24.7833 7.0625 24V7H5C4.71667 7 4.47917 6.90417 4.2875 6.7125C4.09583 6.52083 4 6.28333 4 6C4 5.71667 4.09583 5.47917 4.2875 5.2875C4.47917 5.09583 4.71667 5 5 5H13V4C13 3.71667 13.0958 3.47917 13.2875 3.2875C13.4792 3.09583 13.7167 3 14 3H19C19.2833 3 19.5208 3.09583 19.7125 3.2875C19.9042 3.47917 20 3.71667 20 4V5H28C28.2833 5 28.5208 5.09583 28.7125 5.2875C28.9042 5.47917 29 5.71667 29 6C29 6.28333 28.9042 6.52083 28.7125 6.7125C28.5208 6.90417 28.2833 7 28 7H25.9375V24C25.9375 24.7833 25.6542 25.4792 25.0875 26.0875C24.5208 26.6958 23.825 27 23 27H10ZM10 7V24H23V7H10ZM13 22C13 22.2833 13.0958 22.5208 13.2875 22.7125C13.4792 22.9042 13.7167 23 14 23C14.2833 23 14.5208 22.9042 14.7125 22.7125C14.9042 22.5208 15 22.2833 15 22V11C15 10.7167 14.9042 10.4792 14.7125 10.2875C14.5208 10.0958 14.2833 10 14 10C13.7167 10 13.4792 10.0958 13.2875 10.2875C13.0958 10.4792 13 10.7167 13 11V22ZM18 22C18 22.2833 18.0958 22.5208 18.2875 22.7125C18.4792 22.9042 18.7167 23 19 23C19.2833 23 19.5208 22.9042 19.7125 22.7125C19.9042 22.5208 20 22.2833 20 22V11C20 10.7167 19.9042 10.4792 19.7125 10.2875C19.5208 10.0958 19.2833 10 19 10C18.7167 10 18.4792 10.0958 18.2875 10.2875C18.0958 10.4792 18 10.7167 18 11V22Z"
                fill="#2A3647"></path>
            </g>
          </svg>
  <span class="modal-action-delete-text">Delete</span>
</div>
<div class="action-separator"></div>
<div class="modal-edit" onclick="openEditTaskModal(${task.id})">
  <svg width="24" height="24" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_357207_6165" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="33" height="32">
      <rect x="0.5" width="32" height="32" fill="#D9D9D9"></rect>
    </mask>
    <g mask="url(#mask0_357207_6165)">
      <path class="edit-svg-path"
        d="M7.16667 25.3332H9.03333L20.5333 13.8332L18.6667 11.9665L7.16667 23.4665V25.3332ZM26.2333 11.8998L20.5667 6.29984L22.4333 4.43317C22.9444 3.92206 23.5722 3.6665 24.3167 3.6665C25.0611 3.6665 25.6889 3.92206 26.2 4.43317L28.0667 6.29984C28.5778 6.81095 28.8444 7.42761 28.8667 8.14984C28.8889 8.87206 28.6444 9.48873 28.1333 9.99984L26.2333 11.8998ZM24.3 13.8665L10.1667 27.9998H4.5V22.3332L18.6333 8.19984L24.3 13.8665Z">
      </path>
    </g>
  </svg>
          <span class="modal-action-edit-text">Edit</span>
        </div>
      </div>
    </div>
  `;
}
/**
 * Generates modal assigned contacts.
 * @param {Object} task - Task object.
 * @returns {string} Result.
 */
function generateModalAssignedContacts(task) {
  if (!task.contacts || task.contacts.length === 0) {
    return "—";
  }
  return task.contacts.map((name) => {
    if (!name) return "";
    const initials = name.split(" ").map(n => n[0]).join("");
    return /*html*/ `
      <div class="modal-contact">
        <div class="avatar" style="background-color: ${getRandomColor()};">
          ${initials}
        </div>
        <span>${name}</span>
      </div>
    `;
  }).join("");
}
/**
 * Generates modal subtasks.
 * @param {Object} task - Task object.
 * @returns {string} Result.
 */
function generateModalSubtasks(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return "<span>No subtasks</span>";
  }
  return task.subtasks.map((st, i) => /*html*/ `
    <label class="modal-subtask">
      <input type="checkbox"
             ${st.done ? "checked" : ""}
             onchange="toggleSubtaskDone(${task.id}, ${i}, this)">
      <span>${st.title}</span>
    </label>
  `).join("");
}
/**
 * Generates edit task template.
 * @param {Object} task - Task object.
 * @returns {string} Result.
 */
function generateEditTaskTemplate(task) {
  return /*html*/ `
    <form class="edit-task-form" id="editTaskForm" onsubmit="saveEditedTask(event, ${task.id})">
      <div class="edit-form-scroll">
        <label class="edit-label">
          <span>Title<span class="req">*</span></span>
          <input class="edit-input" type="text" id="edit-title" value="${task.title}" required>
        </label>
        <label class="edit-label">
          <span>Description</span>
          <textarea class="edit-textarea" id="edit-description">${task.description}</textarea>
        </label>
        <label class="edit-label">
          <span>Due date<span class="req">*</span></span>
          <input class="edit-input" type="date" id="edit-date" value="${task.dueDate}" required>
        </label>
        <div class="priority">
          <span>Priority</span>
          <div class="priority-options">
            <input type="radio" id="edit-urgent" name="edit-priority" value="urgent" ${task.priority === "urgent" ? "checked" : ""}>
            <label for="edit-urgent" class="urgent priority-btn">Urgent ${URGENT_ICON}</label>
            <input type="radio" id="edit-medium" name="edit-priority" value="medium" ${task.priority === "medium" ? "checked" : ""}>
            <label for="edit-medium" class="medium priority-btn">Medium ${MEDIUM_ICON}</label>
            <input type="radio" id="edit-low" name="edit-priority" value="low" ${task.priority === "low" ? "checked" : ""}>
            <label for="edit-low" class="low priority-btn">Low ${LOW_ICON}</label>
          </div>
        </div>
        <div class="edit-assigned">
          <span>Assigned to</span>
          <div id="selectContacts" class="custom-select">
            <span onclick="toggleDropdown(event)">Select contacts
              <img src="./assets/icons/arrow_drop_down.svg" alt="" class="dropdown-arrow">
            </span>
            <div id="dropdownContacts" class="dropdown-content" onclick="event.stopPropagation()"></div>
          </div>
          <div id="selectedAvatars" class="edit-avatar-container"></div>
        </div>
        <div class="edit-label">
          <span>Category<span class="req">*</span></span>
          <div id="editCategorySelect" class="custom-select">
            <span onclick="toggleEditCategoryDropdown(event)">
              ${task.category ? task.category + " " : "Select task category "}
              <img src="./assets/icons/arrow_drop_down.svg" alt="" class="dropdown-arrow">
            </span>
            <div id="editCategoryDropdown" class="dropdown-content" onclick="event.stopPropagation()">
              ${generateEditCategoryOptions(task.category)}
            </div>
          </div>
          <input type="hidden" id="edit-category" value="${task.category || ''}">
        </div>
        <div class="edit-subtasks">
          <span>Subtasks</span>
          <div class="subtasks">
            <input type="text" id="edit-subtask-input" placeholder="Add new subtask">
            <div class="subtask-input-actions">
              <button type="button" class="subtask-icon-btn" onclick="clearEditSubtaskInput()" aria-label="Clear subtask">
                <img src="./assets/icons/iconoir_cancel.svg" alt="">
              </button>
              <div class="subtask-input-separator"></div>
              <button type="button" class="subtask-icon-btn" onclick="addEditSubtask()" aria-label="Add subtask">
                <img src="./assets/icons/checkmark.svg" alt="">
              </button>
            </div>
          </div>
          <ul id="editSubtaskArea" class="subtask-list"></ul>
        </div>
      </div>
      <div class="edit-actions">
        <button type="button" class="edit-cancel" onclick="openModal(${task.id})">Cancel</button>
        <button type="submit" class="edit-save">OK</button>
      </div>
    </form>
  `;
}
/**
 * Generates edit category options.
 * @param {*} current - Parameter.
 * @returns {string} Result.
 */
function generateEditCategoryOptions(current) {
  const categories = ["Technical Task", "User Story"];
  return categories.map((cat) => /*html*/ `
    <div class="dropdown-item" onclick="setEditCategory('${cat}')">
      <span class="dropdown-name">${cat}</span>
    </div>
  `).join("");
}
/**
 * Returns edit subtask item markup.
 * @param {Object} subtask - Subtask object.
 * @param {number} index - Index.
 * @returns {string} Result.
 */
function getEditSubtaskItemMarkup(subtask, index) {
  return /*html*/ `
    <li class="subtask">
      <span>${subtask.title}</span>
      <div class="subtask-actions">
        <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteEditSubtask(${index})">
        <div class="action-separator"></div>
        <img src="./assets/icons/edit.svg" alt="Edit" onclick="editEditSubtask(${index})">
      </div>
    </li>
  `;
}
/**
 * Returns edit subtask edit markup.
 * @param {Object} subtask - Subtask object.
 * @param {number} index - Index.
 * @returns {string} Result.
 */
function getEditSubtaskEditMarkup(subtask, index) {
  return /*html*/ `
    <li class="subtask subtask-edit">
      <input
        type="text"
        id="edit-subtask-edit-${index}"
        class="subtask-edit-input"
        value="${subtask.title}"
        placeholder="Edit subtask"
      >
      <div class="subtask-input-actions">
        <button type="button" class="subtask-icon-btn" onclick="deleteEditSubtask(${index})" aria-label="Delete subtask">
          <img src="./assets/icons/delete.svg" alt="">
        </button>
        <div class="subtask-input-separator"></div>
        <button type="button" class="subtask-icon-btn" onclick="saveEditedEditSubtask(${index})" aria-label="Save subtask">
          <img src="./assets/icons/checkmark.svg" alt="">
        </button>
      </div>
    </li>
  `;
}
