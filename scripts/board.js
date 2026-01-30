// Farbpalette für zufällige Auswahl
let colors = [
  "#f4b400", // Gelb
  "#9333ea", // Lila
  "#ef4444", // Rot
  "#f97316"  // Orange
];


document.addEventListener("DOMContentLoaded", async () => {
  await loadTasks();
  renderBoard();
});

/** Tasks aus Firebase laden */
async function loadTasks() {
  try {
    const response = await fetch(`${BASE_URL}/tasks.json`);
    const data = await response.json();
    tasks = data ? Object.entries(data).map(([id, task]) => ({ firebaseId: id, ...task })) : [];
  } catch (error) {
    console.error("Fehler beim Laden der Tasks:", error);
  }
}

/** Task in Firebase updaten */
async function updateTask(task) {
  try {
    const { firebaseId, ...taskData } = task;

    await fetch(`${BASE_URL}/tasks/${firebaseId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
  } catch (error) {
    console.error("Fehler beim Updaten des Tasks:", error);
  }
}

/** Task in Firebase löschen */
async function deleteTask() {
  if (!activeTask) return;

  try {
    await fetch(`${BASE_URL}/tasks/${activeTask.firebaseId}.json`, {
      method: "DELETE"
    });
    tasks = tasks.filter(t => t.firebaseId !== activeTask.firebaseId);
    closeModal();
    renderBoard();
  } catch (error) {
    console.error("Fehler beim Löschen des Tasks:", error);
  }
}

/** Board rendern */
function renderBoard() {
  const content = document.getElementById("board-content");
  let html = `
    <div class="board-header">
      <h1>Board</h1>
      <div class="board-actions">
        <div class="board-search">
          <input type="text" placeholder="Find Task">
          <!-- Lupe als Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
          </svg>
        </div>
        <button class="add-task-btn">Add Task +</button>
      </div>
    </div>
    
    <div class="board-columns">
  `;

  columns.forEach(col => {
    html += `
      <div class="board-column" 
           ondragover="allowDrop(event)" 
           ondrop="dropTask(event, '${col}')">
        <h2>${col}</h2>
        ${tasks
        .filter(t => t.status === col)
        .map(task => `
            <div class="task-card" 
                 draggable="true" 
                 ondragstart="startDrag(${task.id})"
                 onclick="openModal(${task.id})">
              <h2 class="task-category" style="background-color: ${task.category === "User Story"
            ? "#0038FF" // blau für User Story
            : "#1FD7C1" // Türkis für Technical Task
          }">${task.category}</h2>
              <h3>${task.title}</h3>
              <span>${task.description.substring(0, 50)}...</span>
              <div class="subtask-card"> 
                <div class="subtask-progress"></div>
                <div class="subtask-card">
                  ${renderSubtaskProgress(task)}
                </div>
              </div>
              <div class="task-footer">
                <div class="avatar-container" id="avatars-${task.id}"></div>
                <div>${task.priority === "urgent"
            ? '<img src="./assets/img/Category_Urgent.svg" alt="Urgent">'
            : task.priority === "medium"
              ? '<img src="./assets/icons/medium_orange.svg" alt="Medium" color="orange">'
              : '<img src="./assets/img/Category_Low.svg" alt="Low">'
          }
                </div>
              </div>
            </div>
          `).join('')}
      </div>
    `;
  });

  html += `</div>`;
  content.innerHTML = html;
  // nach dem Rendern: für alle Tasks Avatare setzen
  for (let i = 0; i < tasks.length; i++) {
    renderAvatar(tasks[i]);
  }
}

//Funktion um Avatare zu rendern
function renderAvatar(task) {
  let container = document.getElementById(`avatars-${task.id}`);
  if (!container) return;

  container.innerHTML = "";

  // Array aus Firebase
  let contacts = Array.isArray(task.contacts) ? task.contacts : [];

  for (let i = 0; i < contacts.length; i++) {
    const name = contacts[i];
    if (!name) continue;

    const initials = name.split(" ").map(n => n[0]).join("");

    container.innerHTML += /*html*/`
      <div class="avatar" style="background-color: ${getRandomColor()};">
        ${initials}
      </div>
    `;
  }
}

function renderSubtaskProgress(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return `<div>0/0</div>`;
  }

  const done = task.subtasks.filter(st => st.done).length;
  const total = task.subtasks.length;
  const percent = Math.round((done / total) * 100);

  return `
    <div class="subtask-progress-bar">
      <div class="subtask-progress-fill" style="width:${percent}%"></div>
    </div>
    <div>${done}/${total}</div>
  `;
}


// Hilfsfunktion: Zufällige Farbe zurückgeben
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

/** Drag starten */
function startDrag(id) {
  draggedTaskId = id;
}

/** Drop erlauben */
function allowDrop(event) {
  event.preventDefault();
}

/** Task ablegen und in Firebase speichern */
function dropTask(event, newStatus) {
  event.preventDefault();

  const task = tasks.find(t => t.id === draggedTaskId);
  if (!task) return;

  task.status = newStatus;
  updateTask(task);

  renderBoard();
}

/** Modal dynamisch ins DOM rendern */
function openModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  activeTask = task;

  // Falls schon ein Modal existiert, vorher entfernen
  const oldModal = document.getElementById("taskModal");
  if (oldModal) oldModal.remove();

  // Neues Modal erzeugen
  const modal = document.createElement("div");
  modal.id = "taskModal";
  modal.className = "modal";

  modal.innerHTML = /*html*/`
    <div class="modal-content">
      <span class="close" onclick="closeModal()">&times;</span>
      <div class="task-category" style="background-color: ${task.category === "User Story"
            ? "#0038FF" // blau für User Story
            : "#1FD7C1" // Türkis für Technical Task
          }">${task.category}</div>
      <div class="modal-title"><h2>${task.title}</h2></div>
      <div class="modal-description">${task.description}</div>
      <div class="modal-date"><strong>Due date:</strong> ${task.dueDate}</div>
      <div class="modal-priority"><strong>Priority:</strong> <div>${task.priority}</div> ${task.priority === "urgent"
            ? '<img src="./assets/img/Category_Urgent.svg" alt="Urgent">'
            : task.priority === "medium"
              ? '<img src="./assets/icons/medium_orange.svg" alt="Medium" color="orange">'
              : '<img src="./assets/img/Category_Low.svg" alt="Low">'
          }</div>
      <div class="modal-contacts">
        <strong>Assigned To:</strong>
        <div>
          ${task.contacts && task.contacts.length
          ? task.contacts.join(", ")
          : "—"}
        </div>
      </div>
      <div class="modal-subtasks-area">
        <span>Subtasks</span>
        <div class="modal-progress-wrapper">
          <div class="subtask-progress-bar">
            <div class="subtask-progress-fill modal-subtask-progress-fill"></div>
          </div>
          <span class="modal-subtask-progress-text"></span>
        </div>
        <div class="modal-subtasks">
          ${generateModalSubtasks(task)}
        </div>
      </div>

      <div class="modal-actions">
        <div class="modal-delete" onclick="deleteTask()">
          <img src="./assets/icons/delete.svg" alt="Delete">
          <span>Delete</span>
        </div>
        <div class="action-separator"></div>
        <div class="modal-edit" onclick="openEditTaskModal(${id})">
          <img src="./assets/icons/edit.svg" alt="Edit">
          <span>Edit</span>
        </div>
      </div>
    </div>
  `;
  modal.style.display = "flex";
  document.body.appendChild(modal);

  setTimeout(() => updateModalSubtasks(task), 0);

  setTimeout(() => {
  const modalContent = modal.querySelector(".modal-content");
  modalContent.style.transform = "translateX(0)";
}, 10);
}

function generateModalSubtasks(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return "<span>No subtasks</span>";
  }

  return task.subtasks.map((st, i) => `
    <label class="modal-subtask">
      <input type="checkbox"
             ${st.done ? "checked" : ""}
             onchange="toggleSubtaskDone(${task.id}, ${i}, this)">
      <span>${st.title}</span>
    </label>
  `).join("");
}

async function toggleSubtaskDone(taskId, subIndex, checkbox) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.subtasks[subIndex].done = checkbox.checked;

  await updateTask(task);  
  renderBoard();            
  updateModalSubtasks(task);
}

function updateModalSubtasks(task) {
  const modal = document.getElementById("taskModal");
  if (!modal) return;

  const subtaskContainer = modal.querySelector(".modal-subtasks");
  if (!subtaskContainer) return;

  subtaskContainer.innerHTML = generateModalSubtasks(task);

  // optional: Fortschrittsanzeige im Modal, falls vorhanden
  const progressText = modal.querySelector(".modal-subtask-progress-text");
  const progressBar = modal.querySelector(".modal-subtask-progress-fill");

  if (progressText && progressBar) {
    const done = task.subtasks.filter(st => st.done).length;
    const total = task.subtasks.length;
    const percent = total ? Math.round((done / total) * 100) : 0;

    progressText.innerText = `${done}/${total}`;
    progressBar.style.width = `${percent}%`;
  }
}

function editSubtask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const modal = document.getElementById("taskModal");
  if (!modal) return;

  const modalContent = modal.querySelector(".modal-content");

  modalContent.innerHTML = /*html*/`
    <form class="task-form" id="editTaskForm" onsubmit="saveEditedTask(event, ${id})">

      <div class="form-left">

        <label>
          <span>
            Title<span class="req">*</span>
          </span>
          <input type="text" id="title" placeholder="Enter a title" value="${task.title}" required>
        </label>

        <label>
          Description
          <textarea id="description" placeholder="Enter a Description">${task.description}</textarea>
        </label>

        <label>
          <span>
            Due date<span class="req">*</span>
          </span>
          <input type="date" id="date" value="${task.dueDate}" required>
        </label>

      </div>

      <div class="form-right">

        <div class="priority">
          <span>Priority</span>
          <div class="priority-options">

            <input type="radio" id="urgent" name="priority" value="urgent" ${task.priority === "urgent" ? "checked" : ""}>
            <label for="urgent" class="urgent priority-btn">Urgent
              <img src="./assets/img/Category_Urgent.svg">
            </label>

            <input type="radio" id="medium" name="priority" value="medium" ${task.priority === "medium" ? "checked" : ""}>
            <label for="medium" class="medium priority-btn">Medium
              <img src="./assets/icons/medium_orange.svg">
            </label>

            <input type="radio" id="low" name="priority" value="low" ${task.priority === "low" ? "checked" : ""}>
            <label for="low" class="low priority-btn">Low
              <img src="./assets/img/Category_Low.svg">
            </label>

          </div>
        </div>

        <label>
          <span>Assigned to</span>
          <input type="text" disabled value="${task.contacts.join(", ")}">
        </label>

        <label>
          <span>
            Category<span class="req">*</span>
          </span>
          <select id="category" required>
            <option value="Technical Task" ${task.category === "Technical Task" ? "selected" : ""}>Technical task</option>
            <option value="User Story" ${task.category === "User Story" ? "selected" : ""}>User Story</option>
          </select>
        </label>

        <label>
          Subtasks
          <div class="subtasks">
            <input type="text" id="subtask" placeholder="Add new subtask">
            <button type="button" class="plus" onclick="addSubtaskToEdit()">+</button>
          </div>

          <ul id="subtaskArea" class="subtask-list">
            ${task.subtasks.map(st => `<li>${st}</li>`).join("")}
          </ul>
        </label>

        <div class="actions">
          <button type="button" class="clear" onclick="closeModal()">Cancel ✕</button>
          <button type="submit" class="create">Save Task ▾</button>
        </div>

      </div>

    </form>
  `;
}

function openEditTaskModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  activeTask = task;

  const modal = document.getElementById("taskModal");
  const modalContent = modal.querySelector(".modal-content");

  // lokale Kopien für Edit
  editSubtasks = task.subtasks.map(st => ({ ...st }));
  selectedContacts = [...task.contacts];

  modalContent.innerHTML = generateEditTaskTemplate(task);

  renderEditAssignedContacts(); 
  renderEditSubtasks();
}



/** Modal schließen */
function closeModal() {
  const modal = document.getElementById("taskModal");
  if (modal) modal.remove();
  activeTask = null;
}

function generateEditTaskTemplate(task) {
  return /*html*/`
    <h1>Edit Task</h1>

    <form class="edit-task-form" onsubmit="saveEditedTask(event, ${task.id})">

  <div class="edit-form-scroll">

    <label class="edit-label">
      <span>Title<span class="req">*</span></span>
      <input class="edit-input" type="text" id="edit-title" value="${task.title}" required>
    </label>

    <label class="edit-label">
      Description
      <textarea class="edit-textarea" id="edit-description">${task.description}</textarea>
    </label>

    <label class="edit-label">
      <span>Due date<span class="req">*</span></span>
      <input class="edit-input" type="date" id="edit-date" value="${task.dueDate}" required>
    </label>

    <!-- Priority -->
    <div class="edit-priority">
      <span>Priority</span>
      <div class="edit-priority-options">
        <label><input type="radio" name="edit-priority" value="urgent" ${task.priority==="urgent"?"checked":""}> Urgent</label>
        <label><input type="radio" name="edit-priority" value="medium" ${task.priority==="medium"?"checked":""}> Medium</label>
        <label><input type="radio" name="edit-priority" value="low" ${task.priority==="low"?"checked":""}> Low</label>
      </div>
    </div>

    <!-- Assigned -->
    <div class="edit-assigned">
      <span>Assigned to</span>

      <div id="selectContacts" class="edit-custom-select">
        <span onclick="toggleDropdown(event)">Select contacts</span>
        <div id="dropdownContacts" class="edit-dropdown"></div>
      </div>

      <div id="selectedAvatars" class="edit-avatar-container"></div>
    </div>

    <!-- Category -->
    <label class="edit-label">
      <span>Category<span class="req">*</span></span>
      <select class="edit-select" id="edit-category" required>
        <option value="Technical Task" ${task.category==="Technical Task"?"selected":""}>Technical Task</option>
        <option value="User Story" ${task.category==="User Story"?"selected":""}>User Story</option>
      </select>
    </label>

    <!-- Subtasks -->
    <div class="edit-subtasks">
      <span>Subtasks</span>

      <div class="edit-subtask-input-row">
        <input id="edit-subtask-input" placeholder="Add new subtask">
        <button type="button" onclick="addEditSubtask()">+</button>
      </div>

      <ul id="editSubtaskArea" class="edit-subtask-list"></ul>
    </div>

  </div>

  <div class="edit-actions">
    <button type="button" class="edit-cancel" onclick="openModal(${task.id})">Cancel</button>
    <button type="submit" class="edit-save">Save</button>
  </div>

</form>

  `;
}

function renderEditAssignedContacts() {
  const dropdown = document.getElementById("dropdownContacts");
  if (!dropdown) return;

  dropdown.innerHTML = generateAssignedContacts(contacts);
  renderSelectedAvatars();
}

function renderEditSubtasks() {
  const area = document.getElementById("editSubtaskArea");
  if (!area) return;

  area.innerHTML = "";

  editSubtasks.forEach((st, i) => {
    area.innerHTML += `
      <li class="subtask">
        <input value="${st.title}" oninput="editSubtasks[${i}].title=this.value">
        <div class="subtask-actions">
          <img src="./assets/icons/delete.svg" onclick="deleteEditSubtask(${i})">
        </div>
      </li>
    `;
  });
}

function addEditSubtask() {
  const input = document.getElementById("edit-subtask-input");
  if (!input.value.trim()) return;

  editSubtasks.push({ title: input.value.trim(), done: false });
  input.value = "";
  renderEditSubtasks();
}

function deleteEditSubtask(i) {
  editSubtasks.splice(i,1);
  renderEditSubtasks();
}

async function saveEditedTask(event, id) {
  event.preventDefault();

  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.title = document.getElementById("edit-title").value.trim();
  task.description = document.getElementById("edit-description").value.trim();
  task.dueDate = document.getElementById("edit-date").value;
  task.category = document.getElementById("edit-category").value;

  task.priority = document.querySelector('input[name="edit-priority"]:checked').value;

  task.contacts = [...selectedContacts];
  task.subtasks = editSubtasks.map(st => ({ ...st }));

  await updateTask(task);

  renderBoard();
  openModal(id);
}
