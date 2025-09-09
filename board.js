let tasks = [
  {
    id: 1,
    title: "Design Login Page",
    description: "Create responsive login & signup design",
    category: "Todo",
    assignedTo: "Erik",
    dueDate: "2025-09-12",
    priority: "High"
  },
  {
    id: 2,
    title: "Implement Contacts",
    description: "Add CRUD for contacts with Firebase",
    category: "In Progress",
    assignedTo: "Kontra",
    dueDate: "2025-09-10",
    priority: "Medium"
  },
  {
    id: 3,
    title: "Fix Board Layout",
    description: "Adjust styling and responsive issues",
    category: "Feedback",
    assignedTo: "Team",
    dueDate: "2025-09-09",
    priority: "Low"
  }
];

function loadTasks() {
  clearColumns();
  tasks.forEach(task => renderTask(task));
}

function clearColumns() {
  document.getElementById("todo").innerHTML = "";
  document.getElementById("in-progress").innerHTML = "";
  document.getElementById("feedback").innerHTML = "";
  document.getElementById("done").innerHTML = "";
}

function renderTask(task) {
  const card = document.createElement("div");
  card.classList.add("task-card");
  card.setAttribute("draggable", "true");
  card.setAttribute("ondragstart", `drag(event, ${task.id})`);
  card.innerHTML = `
    <h4>${task.title}</h4>
    <p>${task.description}</p>
    <small>Assigned to: ${task.assignedTo}</small><br>
    <small>Due: ${task.dueDate}</small><br>
    <span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>
  `;
  card.onclick = () => openTask(task.id);

  document.getElementById(task.category.toLowerCase().replace(" ", "-")).appendChild(card);
}

let draggedTaskId = null;

function drag(event, taskId) {
  draggedTaskId = taskId;
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event, newCategory) {
  event.preventDefault();
  let task = tasks.find(t => t.id === draggedTaskId);
  if (task) {
    task.category = newCategory;
    loadTasks();
  }
}

function openTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const overlay = document.getElementById("overlay");
  overlay.innerHTML = `
    <div class="overlay-content">
      <h2>${task.title}</h2>
      <p>${task.description}</p>
      <p><strong>Assigned:</strong> ${task.assignedTo}</p>
      <p><strong>Due:</strong> ${task.dueDate}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <button onclick="editTask(${task.id})">Edit</button>
      <button onclick="deleteTask(${task.id})">Delete</button>
      <button onclick="closeOverlay()">Close</button>
    </div>
  `;
  overlay.style.display = "flex";
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const overlay = document.getElementById("overlay");
  overlay.innerHTML = `
    <div class="overlay-content">
      <h2>Edit Task</h2>
      <input id="edit-title" value="${task.title}">
      <textarea id="edit-description">${task.description}</textarea>
      <input id="edit-assigned" value="${task.assignedTo}">
      <input type="date" id="edit-dueDate" value="${task.dueDate}">
      <select id="edit-priority">
        <option ${task.priority === "High" ? "selected" : ""}>High</option>
        <option ${task.priority === "Medium" ? "selected" : ""}>Medium</option>
        <option ${task.priority === "Low" ? "selected" : ""}>Low</option>
      </select>
      <button onclick="saveTask(${task.id})">Save</button>
      <button onclick="closeOverlay()">Cancel</button>
    </div>
  `;
}

function saveTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.title = document.getElementById("edit-title").value;
  task.description = document.getElementById("edit-description").value;
  task.assignedTo = document.getElementById("edit-assigned").value;
  task.dueDate = document.getElementById("edit-dueDate").value;
  task.priority = document.getElementById("edit-priority").value;

  closeOverlay();
  loadTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  closeOverlay();
  loadTasks();
}

function closeOverlay() {
  document.getElementById("overlay").style.display = "none";
}
