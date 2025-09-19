let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderBoard() {
  const columns = {
    "to-do": document.getElementById("to-do"),
    "in-progress": document.getElementById("in-progress"),
    "await-feedback": document.getElementById("await-feedback"),
    "done": document.getElementById("done")
  };

  for (let col in columns) {
    columns[col].innerHTML = "";
  }

  tasks.forEach((task, index) => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.draggable = true;
    card.ondragstart = (e) => dragTask(e, index);

    card.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <span class="priority ${task.priority}">${task.priority}</span>
      <div class="task-actions">
        <button onclick="openEditTask(${index})">✏️</button>
        <button onclick="deleteTask(${index})">🗑️</button>
      </div>
    `;
    columns[task.status].appendChild(card);
  });

  updateSummary();
}

function allowDrop(e) {
  e.preventDefault();
}

function dragTask(e, index) {
  e.dataTransfer.setData("taskIndex", index);
}

function dropTask(e, newStatus) {
  e.preventDefault();
  const index = e.dataTransfer.getData("taskIndex");
  tasks[index].status = newStatus;
  saveTasks();
  renderBoard();
}

function openEditTask(index) {
  const task = tasks[index];
  const overlay = document.getElementById("overlay");
  overlay.innerHTML = `
    <div class="overlay-content">
      <h2>Edit Task</h2>
      <input id="edit-title" value="${task.title}">
      <textarea id="edit-desc">${task.description}</textarea>
      <select id="edit-priority">
        <option value="urgent" ${task.priority === "urgent" ? "selected" : ""}>Urgent</option>
        <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Medium</option>
        <option value="low" ${task.priority === "low" ? "selected" : ""}>Low</option>
      </select>
      <button onclick="saveEdit(${index})">Save</button>
      <button onclick="closeOverlay()">Cancel</button>
    </div>
  `;
  overlay.style.display = "flex";
}

function saveEdit(index) {
  tasks[index].title = document.getElementById("edit-title").value;
  tasks[index].description = document.getElementById("edit-desc").value;
  tasks[index].priority = document.getElementById("edit-priority").value;
  saveTasks();
  closeOverlay();
  renderBoard();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderBoard();
}

function closeOverlay() {
  document.getElementById("overlay").style.display = "none";
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderBoard();
}

document.addEventListener("DOMContentLoaded", renderBoard);
