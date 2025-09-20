let contacts = [
    { id: 1, name: "Alex Johnson", email: "alex@example.com", phone: "+49 123 456789", avatar: "assets/avatar1.jpg" },
    { id: 2, name: "Maria Gomez", email: "maria@example.com", phone: "+49 987 654321", avatar: "assets/avatar3.jpg" },
    { id: 3, name: "Chris Müller", email: "chris@example.com", phone: "+49 555 123456", avatar: "assets/avatar4.jpg" }
];



/** Neues Task-Objekt anlegen und in Firebase speichern */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".task-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = form.querySelector('input[placeholder="Enter a title"]').value.trim();
    const description = form.querySelector("textarea").value.trim();
    const dueDate = form.querySelector('input[type="date"]').value.trim();
    const priority = form.querySelector('input[name="priority"]:checked').value;
    const category = form.querySelectorAll("select")[1].value;
    const contact = document.getElementById('selectContacts').value;

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
      contact,
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

function selectContacts() {
  let select = document.getElementById('selectContacts');

  select.innerHTML = '';
  select.innerHTML += /*html*/ `
      <option>Select contacts to assign</option>
    `;
  for (let i = 0; i < contacts.length; i++) {
    select.innerHTML += /*html*/ `
      <option>${contacts[i].name}</option>
    `;
  }
} 
