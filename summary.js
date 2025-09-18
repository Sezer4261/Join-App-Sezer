function updateSummary() {
  document.getElementById("total-to-do").innerText = tasks.filter(t => t.status === "to-do").length;
  document.getElementById("total-done").innerText = tasks.filter(t => t.status === "done").length;
  document.getElementById("total-urgent").innerText = tasks.filter(t => t.priority === "urgent").length;
  document.getElementById("total-tasks-board").innerText = tasks.length;
  document.getElementById("total-tasks-progress").innerText = tasks.filter(t => t.status === "in-progress").length;
  document.getElementById("total-awaiting-feedback").innerText = tasks.filter(t => t.status === "await-feedback").length;

  const urgentTasks = tasks.filter(t => t.priority === "urgent");
  if (urgentTasks.length > 0) {
    const closestDeadline = new Date();
    closestDeadline.setDate(closestDeadline.getDate() + 7);
    document.getElementById("due-date").innerText = closestDeadline.toDateString();
  } else {
    document.getElementById("due-date").innerText = "No urgent tasks";
  }
}

document.addEventListener("DOMContentLoaded", updateSummary);
