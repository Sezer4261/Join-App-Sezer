const tasks = [
  {
    id: 1,
    type: "User Story",
    title: "Kochwelt Page & Recipe Recommender",
    description: "Build start page with recipe recommendation.",
    dueDate: "10/05/2023",
    priority: "Medium =",
    status: "In Progress",
    assigned: [
      { name: "Emmanuel Mauer", initials: "EM", color: "#00bfa5" },
      { name: "Marcel Bauer", initials: "MB", color: "#673ab7" },
      { name: "Anton Mayer", initials: "AM", color: "#1e88e5" }
    ],
    subtasks: [
      { text: "Implement Recipe Recommendation", done: true },
      { text: "Start Page Layout", done: false }
    ]
  },
  {
    id: 2,
    type: "Task",
    title: "Backend API Setup",
    description: "Initialize project and build authentication routes.",
    dueDate: "15/05/2023",
    priority: "Urgent ⬆",
    status: "To Do",
    assigned: [
      { name: "Lisa Schmidt", initials: "LS", color: "#ef6c00" }
    ],
    subtasks: [
      { text: "Setup Express", done: false },
      { text: "Create User Model", done: false }
    ]
  },
  {
    id: 3,
    type: "Bug",
    title: "Fix Login Issue",
    description: "Resolve bug where users cannot log in with Safari.",
    dueDate: "12/05/2023",
    priority: "Low ⬇",
    status: "Done",
    assigned: [
      { name: "Tom Becker", initials: "TB", color: "#c2185b" }
    ],
    subtasks: [
      { text: "Reproduce issue", done: true },
      { text: "Fix session handling", done: true }
    ]
  }
];

// Spalten
const columns = ["To Do", "In Progress", "Done"];

function renderBoard() {
  const content = document.getElementById("board-content");

  let html = `<div class="board-columns">`;

  columns.forEach(col => {
    html += `
      <div class="board-column" 
           ondragover="allowDrop(event)" 
           ondrop="drop(event, '${col}')"
           ondragleave="leaveDrop(event)">
        <h2>${col}</h2>
        ${tasks
          .filter(t => t.status === col)
          .map(task => `
            <div class="task-card" 
                 draggable="true" 
                 ondragstart="drag(event, ${task.id})"
                 onclick="openModal(${task.id})">
              <span class="tag ${getTagColor(task.type)}">${task.type}</span>
              <h3>${task.title}</h3>
              <p>${task.description.substring(0, 50)}...</p>
            </div>
          `).join('')}
      </div>
    `;
  });

  html += `</div>`;
  content.innerHTML = html;
}

function getTagColor(type) {
  switch(type) {
    case "User Story": return "blue";
    case "Task": return "green";
    case "Bug": return "red";
    default: return "blue";
  }
}

function openModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  const modalBody = document.getElementById("modal-body");

  modalBody.innerHTML = `
    <span class="tag ${getTagColor(task.type)}">${task.type}</span>
    <h2>${task.title}</h2>
    <p>${task.description}</p>
    <p><strong>Due date:</strong> ${task.dueDate}</p>
    <p><strong>Priority:</strong> ${task.priority}</p>

    <h3>Assigned To:</h3>
    <div class="assigned-users">
      ${task.assigned.map(user => `
        <div class="assigned-user">
          <div class="avatar" style="background:${user.color}">${user.initials}</div>
          ${user.name}
        </div>`).join('')}
    </div>

    <h3>Subtasks</h3>
    <div class="subtasks">
      ${task.subtasks.map(st => `
        <label>
          <input type="checkbox" ${st.done ? "checked" : ""}>
          ${st.text}
        </label>`).join('')}
    </div>

    <div class="modal-actions">
      <button class="delete-btn">🗑 Delete</button>
      <button class="edit-btn">✏️ Edit</button>
    </div>
  `;

  document.getElementById("taskModal").style.display = "block";
}

function closeModal() {
  document.getElementById("taskModal").style.display = "none";
};

window.addEventListener("click", (event) => {
  if (event.target.id === "taskModal") {
    document.getElementById("taskModal").style.display = "none";
  }
});

// Drag & Drop Functions
let draggedTaskId = null;

function drag(event, taskId) {
  draggedTaskId = taskId;
}

function allowDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function leaveDrop(event) {
  event.currentTarget.classList.remove("drag-over");
}

function drop(event, newStatus) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");

  const task = tasks.find(t => t.id === draggedTaskId);
  if (task) {
    task.status = newStatus;
  }

  renderBoard();
}
