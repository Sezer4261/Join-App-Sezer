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

/** Validierung des Formulars durchführen */
function validateForm() {
  // Error Container leeren
  document.getElementById('titleError').textContent = '';
  document.getElementById('dateError').textContent = '';
  document.getElementById('categoryError').textContent = '';

  let isValid = true;

  // Titel validieren
  const titleInput = document.getElementById('title');
  if (!titleInput.value.trim()) {
    document.getElementById('titleError').textContent = 'This field is required';
    titleInput.classList.add('input-error');
    isValid = false;
  } else {
    titleInput.classList.remove('input-error');
  }

  // Datum validieren
  const dateInput = document.getElementById('date');
  if (!dateInput.value.trim()) {
    document.getElementById('dateError').textContent = 'This field is required';
    dateInput.classList.add('input-error');
    isValid = false;
  } else {
    dateInput.classList.remove('input-error');
  }

  // Kategorie validieren
  const categorySelect = document.getElementById('category');
  if (!categorySelect.value.trim()) {
    document.getElementById('categoryError').textContent = 'This field is required';
    categorySelect.classList.add('input-error');
    isValid = false;
  } else {
    categorySelect.classList.remove('input-error');
  }

  return isValid;
}

async function saveToArray(event) {
  event.preventDefault();

  // Validierung durchführen
  if (!validateForm()) {
    return; // Formulareintrag stoppen, wenn Validierung fehlschlägt
  }

  const task = generateTaskFromForm();

  const result = await saveTask(task);
  if (result) {
    showMessage("Task added to board", "success");
    subtasks.length = 0;
    selectedContacts.length = 0;
    showSubtasks();
    document.getElementById('addTaskForm').reset();
    // Neu: nach dem Toast zur Board-Seite weiterleiten
    setTimeout(() => { window.location.href = "board.html"; }, 1500);
  } else {
    showMessage("Task could not be saved", "error");
  }
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
  select.innerHTML = generateAssignedContacts(contacts);
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
    selectedContacts.push(name);
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
  if (subtask) {
    subtasks.push({
      title: subtask,
      done: false
    });
    showSubtasks();
    document.getElementById('subtask').value = '';
  } else {
    alert("Bitte eine Subtask beschreiben!")
  }

}

function editSubtask(i) {

}

function deleteSubtask(i) {
  subtasks.splice(i, 1);
  showSubtasks();
}

function clearForm() {
  selectedContacts = [];
  renderSelectedAvatars();
}




