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
    await fetch(`${BASE_URL}/tasks/${task.firebaseId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
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
                <div>${0}/${task.subtasks ? task.subtasks.length : 0}</div>
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
  container.innerHTML = ""; // leeren, falls schon Inhalte drin sind
  // immer in Array verwandeln
  let contacts = Array.isArray(task.contact) ? task.contact : [task.contact];

  for (let i = 0; i < contacts.length; i++) {
    const name = contacts[i];
    const initials = name.split(" ").map(n => n[0]).join("");
    if (!name) continue; // überspringen, falls leer
    container.innerHTML += /*html*/`
      <div class="avatar" style="background-color: ${getRandomColor()};">${initials}</div>
    `;
  }
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
      <div class="modal-contacts"><strong>Assigned To:</strong> <div>${task.contact}</div></div>
      <div class="modal-subtasks-area">
        <span>Subtasks</span>
        <div class="modal-subtasks">
          <div> ${task.subtasks}</div>
        </div>
      </div>
      <div class="modal-actions">
        <div class="modal-delete" onclick="deleteTask()">
          <img src="./assets/icons/delete.svg" alt="Delete">
          <span>Delete</span>
        </div>
        <div class="action-separator"></div>
        <div class="modal-edit">
          <img src="./assets/icons/edit.svg" alt="Edit" onclick="editSubtask(${id})">
          <span>Edit</span>
        </div>
      </div>
    </div>
  `;
  modal.style.display = "flex";
  document.body.appendChild(modal);

  setTimeout(() => {
  const modalContent = modal.querySelector(".modal-content");
  modalContent.style.transform = "translateX(0)";
}, 10);
}

/** Modal schließen */
function closeModal() {
  const modal = document.getElementById("taskModal");
  if (modal) modal.remove();
  activeTask = null;
}