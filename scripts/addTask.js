/** Neues Task-Objekt anlegen und in Firebase speichern */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".task-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = form.querySelector('input[placeholder="Enter a title"]').value.trim();
    const description = form.querySelector("textarea").value.trim();
    const dueDate = form.querySelector('input[placeholder="dd/mm/yyyy"]').value.trim();
    const priority = form.querySelector('input[name="priority"]:checked').value;
    const category = form.querySelectorAll("select")[1].value;

    if (!title || !dueDate || category === "Select task category") {
      alert("Bitte fülle alle Pflichtfelder (*) aus.");
      return;
    }

    const task = {
      id: Date.now(),
      title,
      description,
      dueDate,
      priority,
      category,
      status: "To Do", // Default
    };

    await saveTask(task);

    alert("Task erfolgreich erstellt!");
    form.reset();
  });
});

/** Task in Firebase speichern */
async function saveTask(task) {
  try {
    const response = await fetch(`${BASE_URL}/tasks.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    return await response.json();
  } catch (error) {
    console.error("Fehler beim Speichern des Tasks:", error);
  }
}
