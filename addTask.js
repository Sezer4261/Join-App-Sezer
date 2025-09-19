let tasks = [];
let currentPriority = "";

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  populateAssignedContacts();
  hookForm();
  hookPriorityButtons();
  updatePreview();
});

function hookForm() {
  const form = document.getElementById("add-task-form");
  if (form) form.addEventListener("submit", handleAddTask);
  const inputs = ["task-title", "task-desc", "task-due-date", "task-subtasks"];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updatePreview);
  });
  const assigned = document.getElementById("task-assigned");
  if (assigned) assigned.addEventListener("change", updatePreview);
  const category = document.getElementById("task-category");
  if (category) category.addEventListener("change", updatePreview);
}

function hookPriorityButtons() {
  const urgent = document.getElementById("prio-urgent");
  const medium = document.getElementById("prio-medium");
  const low = document.getElementById("prio-low");
  if (urgent) urgent.addEventListener("click", () => setPriority("urgent"));
  if (medium) medium.addEventListener("click", () => setPriority("medium"));
  if (low) low.addEventListener("click", () => setPriority("low"));
}

function setPriority(p) {
  currentPriority = p;
  document.querySelectorAll(".prio-btn").forEach(b => b.classList.remove("active"));
  const el = document.getElementById("prio-" + p);
  if (el) el.classList.add("active");
  updatePreview();
}

function handleAddTask(e) {
  e.preventDefault();
  const title = document.getElementById("task-title").value.trim();
  const desc = document.getElementById("task-desc").value.trim();
  const dueDate = document.getElementById("task-due-date").value;
  const assignedTo = document.getElementById("task-assigned").value;
  const category = document.getElementById("task-category").value;
  const subtasksInput = document.getElementById("task-subtasks").value;

  if (!title || !desc || !dueDate) {
    alert("Please fill Title, Description and Due Date.");
    return;
  }

  const subtasks = subtasksInput
    ? subtasksInput.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const task = {
    id: Date.now(),
    title,
    desc,
    dueDate,
    priority: currentPriority || "low",
    assignedTo,
    category,
    subtasks,
    status: "to-do"
  };

  tasks.push(task);
  saveTasks();
  safeTriggerBoardUpdate();

  document.getElementById("add-task-form").reset();
  currentPriority = "";
  document.querySelectorAll(".prio-btn").forEach(b => b.classList.remove("active"));
  updatePreview();
  alert("Task added.");
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("tasks");
  if (saved) tasks = JSON.parse(saved);
}

function populateAssignedContacts() {
  const select = document.getElementById("task-assigned");
  if (!select) return;

  select.innerHTML = '<option value="">Select contact</option>';
  let contacts = [];
  try {
    const c = localStorage.getItem("contacts");
    if (c) contacts = JSON.parse(c);
  } catch (err) {
    contacts = [];
  }
  contacts.forEach(ct => {
    const opt = document.createElement("option");
    opt.value = ct.email || ct.name || ct.phone || "";
    opt.textContent = ct.name || ct.email || ct.phone || "Contact";
    select.appendChild(opt);
  });
}

function updatePreview() {
  const title = document.getElementById("task-title").value.trim();
  const desc = document.getElementById("task-desc").value.trim();
  const due = document.getElementById("task-due-date").value;
  const subs = document.getElementById("task-subtasks").value;

  document.getElementById("preview-title").textContent = title || "No title";
  document.getElementById("preview-desc").textContent = desc || "No description";
  document.getElementById("preview-due").textContent = due ? `Due: ${formatDate(due)}` : "-";

  const prioLabel = document.getElementById("preview-prio");
  prioLabel.textContent = currentPriority ? currentPriority.toUpperCase() : "NONE";
  prioLabel.className = "prio-label " + (currentPriority || "none");

  const ul = document.getElementById("preview-subtasks");
  ul.innerHTML = "";
  if (subs) {
    subs.split(",").map(s => s.trim()).filter(Boolean).forEach(sub => {
      const li = document.createElement("li");
      li.textContent = sub;
      ul.appendChild(li);
    });
  }
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

function safeTriggerBoardUpdate() {
  if (typeof saveTasks === "function" && typeof renderBoard === "function") {
    try {
      window.saveTasks && window.saveTasks();
      window.renderBoard && window.renderBoard();
      window.updateSummary && window.updateSummary();
      return;
    } catch (err) { /* ignore */ }
  }
  saveTasks();
  if (typeof updateSummary === "function") updateSummary();
}