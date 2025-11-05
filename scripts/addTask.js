// let contacts = [
//   { id: 1, name: "Alex Johnson", email: "alex@example.com", phone: "+49 123 456789", avatar: "assets/avatar1.jpg" },
//   { id: 2, name: "Maria Gomez", email: "maria@example.com", phone: "+49 987 654321", avatar: "assets/avatar3.jpg" },
//   { id: 3, name: "Chris Müller", email: "chris@example.com", phone: "+49 555 123456", avatar: "assets/avatar4.jpg" }
// ];

let contacts = [];
let selectedContacts = [];

let subtasks = [];

/** Task rendern */
async function renderAddTask() {
  let content = document.getElementById('addTaskContent');
  content.innerHTML = '';
  content.innerHTML += generateAddTask();

  // Kontakte laden und Dropdown aktualisieren
  await loadContacts();
  selectedContacts = []; // sicherstellen, dass keine Auswahl beim Laden existiert
  selectContacts();
  renderSelectedAvatars(); // Avatare leer beim Laden
}

async function saveToArray(event) {
  event.preventDefault();
  const task = generateTaskFromForm();

  await saveTask(task);
  alert("Task erfolgreich erstellt!");
  subtasks.length = 0;
  showSubtasks();
  document.getElementById('addTaskForm').reset();
}

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

/** Dropdown mit Kontakten füllen */
function selectContacts() {
  let select = document.getElementById('dropdownContacts');
  select.innerHTML = '';
  select.innerHTML += generateAssignedContacts(contacts);
}

/** Dropdown öffnen/schließen */
function toggleDropdown(event) {
  event.stopPropagation();
  document.getElementById("dropdownContacts").classList.toggle("show");
}

// function generateAssignedContacts(contacts) {
//   let content = "";
//   for (let i = 0; i < contacts.length; i++) {
//     content += /*html*/ `
//       <label class="dropdown-item">
//         <input 
//           type="checkbox" 
//           id="contact-${i}"       
//           value="${contacts[i].name}" 
//           ${selectedContacts.includes(contacts[i].name) ? 'checked="checked"' : ''}
//           onchange="toggleContactSelection(this, '${contacts[i].name}')"
//         >
//         <label for="contact-${i}">${contacts[i].name}</label>
//       </label>
//     `;
//   }
// }

/** Checkbox Umschalten */
function toggleContactSelection(name, checkbox) {
  if (checkbox.checked) {
    if (!selectedContacts.includes(name)) selectedContacts.push(name);
  } else {
    selectedContacts = selectedContacts.filter(c => c !== name);
  }
  renderSelectedAvatars();
}

/** Avatare der ausgewählten Kontakte rendern */
function renderSelectedAvatars() {
  const container = document.getElementById("selectedAvatars");
  container.innerHTML = "";
  selectedContacts.forEach(name => {
    const initials = name.split(" ").map(n => n[0]).join("");
    container.innerHTML += `<div class="avatar">${initials}</div>`;
  });
}

function showSubtasks() {
  let subtaskArea = document.getElementById('subtaskArea');

  subtaskArea.innerHTML = '';
  for (let i = 0; i < subtasks.length; i++) {
    subtaskArea.innerHTML += generateSubtasks(i);
  }
}

function addSubtask() {
  let subtask = document.getElementById('subtask').value;

  subtasks.push(subtask);
  showSubtasks();
  document.getElementById('subtask').value = '';
}

function editSubtask(i) {

}

function deleteSubtask(i) {
  subtasks.splice(i, 1);
  showSubtasks();
}




