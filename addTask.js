const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-task-form");
  const subtaskInput = document.getElementById("subtask-input");
  const subtaskList = document.getElementById("subtask-list");
  let subtasks = [];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-desc").value;
    const category = document.getElementById("task-category").value;
    const dueDate = document.getElementById("task-date").value;
    const priority = document.querySelector('input[name="priority"]:checked')?.value || "medium";

    const task = { title, description, category, dueDate, priority, subtasks, status: "todo" };
    await db.collection("tasks").add(task);

    form.reset();
    subtasks = [];
    subtaskList.innerHTML = "";
    alert("Task hinzugefügt!");
  });

  document.getElementById("add-subtask-btn").addEventListener("click", () => {
    const subtaskText = subtaskInput.value.trim();
    if (subtaskText) {
      subtasks.push({ text: subtaskText, done: false });
      renderSubtasks();
      subtaskInput.value = "";
    }
  });

  function renderSubtasks() {
    subtaskList.innerHTML = "";
    subtasks.forEach((s, i) => {
      const li = document.createElement("li");
      li.textContent = s.text;
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "x";
      removeBtn.onclick = () => {
        subtasks.splice(i, 1);
        renderSubtasks();
      };
      li.appendChild(removeBtn);
      subtaskList.appendChild(li);
    });
  }
});
