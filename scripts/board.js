let currentOverlayTaskId = null;

function loadBoard() {
    const columns = {
        "todo": document.getElementById("todo"),
        "in-progress": document.getElementById("in-progress"),
        "await-feedback": document.getElementById("await-feedback"),
        "done": document.getElementById("done")
    };

    Object.values(columns).forEach(col => col.innerHTML = "");

    tasks.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.classList.add("task-card");
        taskCard.draggable = true;
        taskCard.addEventListener("dragstart", e => dragStart(e, task.id));

        const titleEl = document.createElement("div");
        titleEl.classList.add("task-title");
        titleEl.textContent = task.title;
        titleEl.addEventListener("click", () => openOverlay(task.id));

        const priorityEl = document.createElement("span");
        priorityEl.classList.add("priority-badge", `priority-${task.priority}`);
        priorityEl.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

        const avatarsEl = document.createElement("div");
        avatarsEl.classList.add("avatar-group");
        avatarsEl.innerHTML = task.assignedTo.map(user => `<img class="avatar" src="${user.avatar}" alt="${user.name}">`).join('');

        taskCard.appendChild(titleEl);
        taskCard.appendChild(priorityEl);
        taskCard.appendChild(avatarsEl);

        columns[task.status].appendChild(taskCard);
    });
}

function dragStart(e, taskId) {
    e.dataTransfer.setData("text/plain", taskId);
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e, newStatus) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const task = tasks.find(t => t.id == taskId);
    if (task) {
        task.status = newStatus;
        loadBoard();
    }
}

function openOverlay(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    currentOverlayTaskId = taskId;

    const overlayContent = document.getElementById("overlay-content");
    overlayContent.innerHTML = `
        <h2>${task.title}</h2>
        <p>${task.description}</p>
        <div class="overlay-footer">
            <span class="priority-badge priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
            <div class="avatar-group">
                ${task.assignedTo.map(user => `<img class="avatar" src="${user.avatar}" alt="${user.name}">`).join('')}
            </div>
        </div>
        <div class="overlay-actions">
            <button class="btn btn-edit" onclick="editTask()">Edit</button>
            <button class="btn btn-delete" onclick="deleteTask()">Delete</button>
            <button class="btn btn-secondary" onclick="closeOverlay()">Close</button>
        </div>
    `;

    document.getElementById("task-overlay").classList.remove("hidden");
}

function closeOverlay() {
    document.getElementById("task-overlay").classList.add("hidden");
}

function editTask() {
    const task = tasks.find(t => t.id === currentOverlayTaskId);
    if (!task) return;

    const newTitle = prompt("Edit Title:", task.title);
    const newDesc = prompt("Edit Description:", task.description);
    const newPriority = prompt("Edit Priority (urgent, medium, low):", task.priority);

    if (newTitle) task.title = newTitle;
    if (newDesc) task.description = newDesc;
    if (newPriority) task.priority = newPriority.toLowerCase();

    loadBoard();
    closeOverlay();
}

function deleteTask() {
    const index = tasks.findIndex(t => t.id === currentOverlayTaskId);
    if (index > -1) {
        tasks.splice(index, 1);
        loadBoard();
        closeOverlay();
    }
}

document.addEventListener("DOMContentLoaded", loadBoard);
