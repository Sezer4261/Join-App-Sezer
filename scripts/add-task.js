let tasks = [];

function addTask(e) {
    e.preventDefault();
    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-description").value;
    const priority = document.getElementById("task-priority").value;
    const dueDate = document.getElementById("task-due-date").value;
    const assigned = document.getElementById("task-assigned").value;

    const newTask = {
        id: Date.now(),
        title,
        description,
        priority,
        dueDate,
        assigned
    };

    tasks.push(newTask);
    alert("Task added successfully!");
    document.getElementById("task-form").reset();
}
