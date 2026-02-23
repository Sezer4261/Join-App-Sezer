function getBoardTemplate() {
  return /*html*/`
    <div class="board-header">
      <h1>Board</h1>
      <img src="./assets/icons/plus add task mobile.svg" alt="Add Task Button" class="add-task-mobile-btn" onclick="showAddTaskDialog()">
      <div class="board-actions">
        <div class="board-search">
          <input id="search-task" type="text" placeholder="Find Task">
          <button id="search-clear" class="search-clear" type="button" aria-label="Clear search">×</button>
          <div class="search-divider"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
          </svg>
        </div>
        <button class="add-task-btn" onclick="showAddTaskDialog()">Add Task +</button>
      </div>
    </div>
    <div class="board-columns">
        <div class="board-column"
            id="todo-column"
            ondragover="allowDrop(event)"
            ondrop="dropTask(event, 'To Do')">
            <div class="column-header">
                <h2>To Do</h2>
                <img src="./assets/icons/plus button.svg" alt="Add Task Button" width="30" height="30" onclick="showAddTaskDialog()">
            </div>
            <div class="no-tasks">
                <span>No tasks To do</span>
            </div>
        </div> 
        <div class="board-column"
            id="inprogress-column"
            ondragover="allowDrop(event)"
            ondrop="dropTask(event, 'In Progress')">
            <div class="column-header">
                <h2>In Progress</h2>
                <img src="./assets/icons/plus button.svg" alt="Add Task Button" width="30" height="30" onclick="showAddTaskDialog()">
            </div>
            <div class="no-tasks">
                <span>No tasks To do</span>
            </div>
        </div> 
        <div class="board-column"
            id="awaiting-column"
            ondragover="allowDrop(event)"
            ondrop="dropTask(event, 'Await Feedback')">
            <div class="column-header">
                <h2>Await Feedback</h2>
                <img src="./assets/icons/plus button.svg" alt="Add Task Button" width="30" height="30" onclick="showAddTaskDialog()">
            </div>
            <div class="no-tasks">
                <span>No tasks To do</span>
            </div>
        </div> 
        <div class="board-column"
            id="done-column"
            ondragover="allowDrop(event)"
            ondrop="dropTask(event, 'Done')">
            <div class="column-header">
                <h2>Done</h2>
            </div>
            <div class="no-tasks">
                <span>No tasks To do</span>
            </div>
        </div> 
    </div> 
  `;
}

function createTaskCard(task) {
  return /*html*/`
    <div class="task-card"
      draggable="true"
      ondragstart="startDrag(${task.id})"
      onclick="openModal(${task.id})">

      <h2 class="task-category" style="background-color: ${
        task.category === "User Story" ? "#0038FF" : "#1FD7C1"
      }">${task.category}</h2>

      <h3>${highlightText(task.title)}</h3>
      <span>${highlightText(task.description.substring(0, 50))}...</span>

      <div class="subtask-card">
        ${renderSubtaskProgress(task)}
      </div>

      <div class="task-footer">
        <div class="avatar-container" id="avatars-${task.id}"></div>
        <div>
          ${
            task.priority === "urgent"
              ? '<img src="./assets/img/Category_Urgent.svg">'
              : task.priority === "medium"
                ? '<img src="./assets/icons/medium_orange.svg">'
                : '<img src="./assets/img/Category_Low.svg">'
          }
        </div>
      </div>
    </div>
  `;
}
