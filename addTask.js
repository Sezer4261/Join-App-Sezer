function addTask(event) {
  event.preventDefault();

  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-desc").value;
  const priority = document.getElementById("task-priority").value;

  const newTask = {
    title,
    description,
    priority,
    status: "to-do"
  };

  tasks.push(newTask);
  saveTasks();

  document.getElementById("add-task-form").reset();
  alert("Task added successfully!");
}
