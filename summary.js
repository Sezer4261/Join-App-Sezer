const db = firebase.firestore();

async function loadSummary() {
  const tasksSnapshot = await db.collection("tasks").get();
  const tasks = tasksSnapshot.docs.map(doc => doc.data());

  document.getElementById("total-to-do").innerText = tasks.filter(t => t.status === "to-do").length;
  document.getElementById("total-done").innerText = tasks.filter(t => t.status === "done").length;
  document.getElementById("total-tasks-board").innerText = tasks.length;
  document.getElementById("total-tasks-progress").innerText = tasks.filter(t => t.status === "in-progress").length;
  document.getElementById("total-awaiting-feedback").innerText = tasks.filter(t => t.status === "awaiting-feedback").length;

  const urgentTasks = tasks.filter(t => t.priority === "urgent");
  document.getElementById("total-urgent").innerText = urgentTasks.length;

  if (urgentTasks.length > 0) {
    const deadlines = urgentTasks.map(t => new Date(t.dueDate));
    const nextDeadline = new Date(Math.min(...deadlines));
    document.getElementById("due-date").innerText = nextDeadline.toDateString();
  } else {
    document.getElementById("due-date").innerText = "No urgent deadlines";
  }

  document.getElementById("username-field").innerText = localStorage.getItem("username") || "User";
}

document.addEventListener("DOMContentLoaded", loadSummary);
