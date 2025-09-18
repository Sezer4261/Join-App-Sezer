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
              <h2 class="task-category">${task.category}</h2>
              <h3>${task.title}</h3>
              <span>${task.description.substring(0, 50)}...</span>
              <span>Due: ${task.dueDate}</span>
              <div>Hier stehen subtasks </div>
              <div class="task-footer">
                <div>Contacts</div>
                <div>Priority</div>
              </div>
            </div>
          `).join('')}
      </div>
    `;
  });

  html += `</div>`;
  content.innerHTML = html;
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

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal()">&times;</span>
      <h2>${task.title}</h2>
      <p>${task.description}</p>
      <p><strong>Due date:</strong> ${task.dueDate}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Category:</strong> ${task.category}</p>

      <div class="modal-actions">
        <button onclick="deleteTask()">🗑 Delete</button>
        <button onclick="closeModal()">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

/** Modal schließen */
function closeModal() {
  const modal = document.getElementById("taskModal");
  if (modal) modal.remove();
  activeTask = null;
}