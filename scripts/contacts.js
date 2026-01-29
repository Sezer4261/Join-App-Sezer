// let contacts = [
//     { id: 1, name: "Alex Johnson", email: "alex@example.com", phone: "+49 123 456789", avatar: "assets/avatar1.jpg" },
//     { id: 2, name: "Maria Gomez", email: "maria@example.com", phone: "+49 987 654321", avatar: "assets/avatar3.jpg" },
//     { id: 3, name: "Chris Müller", email: "chris@example.com", phone: "+49 555 123456", avatar: "assets/avatar4.jpg" }
// ];



function closeOverlay() {
  document.getElementById("contact-overlay").classList.add("hidden");
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function updateAddContactSubmitState(dialog) {
  if (!dialog) return;

  const nameInput = dialog.querySelector('#ac-name');
  const emailInput = dialog.querySelector('#ac-email');
  const phoneInput = dialog.querySelector('#ac-phone');
  const submitBtn = dialog.querySelector('[data-ac-submit]');

  if (!submitBtn) return;

  const isValid =
    isNonEmptyString(nameInput?.value ?? '') &&
    isNonEmptyString(emailInput?.value ?? '') &&
    isNonEmptyString(phoneInput?.value ?? '');

  submitBtn.disabled = !isValid;
  submitBtn.setAttribute('aria-disabled', String(!isValid));
}

function initAddContactDialogValidation(dialog) {
  if (!dialog || dialog.dataset.acValidationInit === '1') return;

  const fields = [
    dialog.querySelector('#ac-name'),
    dialog.querySelector('#ac-email'),
    dialog.querySelector('#ac-phone'),
  ].filter(Boolean);

  const form = dialog.querySelector('#add-contact-form');
  const handler = () => updateAddContactSubmitState(dialog);

  fields.forEach((field) => {
    field.addEventListener('input', handler);
    field.addEventListener('change', handler);
    field.addEventListener('blur', handler);
  });

  if (form) {
    form.addEventListener('reset', () => {
      // Wait for the browser to clear values
      setTimeout(handler, 0);
    });
  }

  dialog.dataset.acValidationInit = '1';
  handler();
}

function openAddContactDialog() {
  let dialog = document.getElementById("add-contact-dialog");

  if (!dialog) {
    document.body.insertAdjacentHTML("beforeend", getDialogAddContact());
    dialog = document.getElementById("add-contact-dialog");

    const closeBtn = dialog.querySelector(".ac__close");
    closeBtn.addEventListener("click", () => closeAddContactDialogWithAnimation());

    // Dialog schließen bei Klick außerhalb des Inhalts
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) {
        closeAddContactDialogWithAnimation();
      }
    });

    // Verhindere Event-Bubbling im Dialog-Inhalt
    const dialogContent = dialog.querySelector(".ac-dialog-content");
    if (dialogContent) {
      dialogContent.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }
  }

  // Entferne closing-Klasse falls noch vorhanden
  dialog.classList.remove('closing');
  dialog.showModal();

  initAddContactDialogValidation(dialog);
  updateAddContactSubmitState(dialog);

  if (typeof openAddContact === "function") {
    openAddContact();
  }
}

// NEU: Schließt Add Contact Dialog mit Animation
function closeAddContactDialogWithAnimation() {
  const dialog = document.getElementById("add-contact-dialog");
  if (dialog) {
    dialog.classList.add('closing');
    
    setTimeout(() => {
      dialog.close();
    }, 300);
  }
}

async function addContact(event) {
  event.preventDefault();
  const contact = generateObjFromContact();

  // Validierung: Alle Felder müssen ausgefüllt sein
  if (!contact.name || !contact.email || !contact.phone) {
    alert("Bitte alle Felder ausfüllen!");
    return;
  }

  const saved = await saveContact(contact);
  if (saved) {
    await renderContactGroup(); // Liste direkt aktualisieren
    const dialog = document.getElementById("add-contact-dialog");
    const form = document.getElementById('add-contact-form');
    dialog.close();
    form.reset();
    setTimeout(() => showContactsToast('Contact successfully created'), 0);
  }
}

async function saveContact(contact) {
  try {
    const response = await fetch(`${BASE_URL}/contacts.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    });
    return await response.json();
  } catch (error) {
    console.error("Fehler beim Speichern des Kontakts:", error);
  }
}

async function loadContacts() {
  try {
    const response = await fetch(`${BASE_URL}/contacts.json`);
    const data = await response.json();

    if (!data) {
      contacts = [];
      return;
    }

    contacts = Object.entries(data).map(([key, value]) => ({
      id: key,
      ...value
    }));

  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}
function showContactsToast(message, durationMs = 2200) {
  const old = document.getElementById('contacts-toast');
  if (old) old.remove();

  document.body.insertAdjacentHTML('beforeend', getContactsToastTemplate(message));

  const toast = document.getElementById('contacts-toast');
  if (!toast) return;

  // Animate in (CSS übernimmt Transition)
  requestAnimationFrame(() => {
    toast.classList.add('contacts-toast--visible');
  });

  // Auto-hide + remove
  window.setTimeout(() => {
    toast.classList.remove('contacts-toast--visible');
    window.setTimeout(() => toast.remove(), 220);
  }, durationMs);
}

function resetInputFieldsFromContactDialog() {
  closeAddContactDialogWithAnimation(); // Nutze die Animation statt sofort zu schließen
}

function generateObjFromContact() {
  const name = document.getElementById('ac-name').value;
  const email = document.getElementById('ac-email').value;
  const phone = document.getElementById('ac-phone').value;

  return {
    name,
    email,
    phone
  };
}

// ab hier ki agent
async function handleContactClick(event) {
  const clickedContact = event.currentTarget;

  // Remove selected class from all contacts
  document.querySelectorAll('.contact-area, .contact-item').forEach(contact => {
    contact.classList.remove('selected');
  });

  // Add selected class to clicked contact
  clickedContact.classList.add('selected');

  // Fetch contact data from the database
  const contactId = clickedContact.dataset.id; // Ensure each contact has a unique ID in the dataset
  console.log('clickedContact', clickedContact);
  console.log('contactId', contactId);

  const contactData = await fetchContactDetails(contactId);

  if (!contactData) {
    console.error("Kontakt konnte nicht geladen werden.");
    return;
  }

  // Render contact details
  const contactDetailsContainer = document.getElementById('contact-details');
  const initials = contactData.name.split(" ").map(n => n[0]).join("");
  const name = contactData.name;
  const email = contactData.email;
  const phone = contactData.phone || ''; // kein "N/A" mehr
  const id = contactId; // Die ID kommt aus dem Dataset

  contactDetailsContainer.innerHTML = getContactDetailsTemplate(initials, name, email, phone, id);
}

async function fetchContactDetails(contactId) {
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`);
    if (!response.ok) {
      throw new Error("Fehler beim Abrufen der Kontaktdaten.");
    }
    return await response.json();
  } catch (error) {
    console.error("Fehler beim Abrufen der Kontaktdaten:", error);
    return null;
  }
}

function addContactClickListeners() {
  // Attach click listeners only to elements that have a data-id attribute
  // This ensures the handler's event.currentTarget will contain the contact ID
  document.querySelectorAll('.contact-item[data-id], .contact-area[data-id]').forEach(contact => {
    contact.addEventListener('click', handleContactClick);
  });
}

async function renderContactGroup() {
  await loadContacts();
  const contactListRef = document.getElementById('contact-list');
  contactListRef.innerHTML = '';
  let currentLetter = '';

  iterateContactEntries(contactListRef, contacts, currentLetter);

  colorizeContactInitials();
  addContactClickListeners();
}

function iterateContactEntries(contactListRef, contactsData, currentLetter) {
  contactsData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  for (let i = 0; i < contactsData.length; i++) {
    const contactDataName = contactsData[i].name || 'Unnamed';
    const contactDataMail = contactsData[i].email;
    const contactDataPhone = contactsData[i].phone;
    const contactId = contactsData[i].id;
    const firstLetter = contactDataName.charAt(0).toUpperCase();

    if (currentLetter !== firstLetter) {
      currentLetter = firstLetter;
      contactListRef.innerHTML += getHeaderLetter(firstLetter);
    }
    const contactNameInitials = contactDataName.split(" ").map(n => n[0]).join("");
    contactListRef.innerHTML += `
            <div class="contact-item" data-id="${contactId}" data-phone="${contactDataPhone}">
                ${getContactItem(contactDataName, contactDataMail, contactNameInitials)}
            </div>
        `;
  }
}

async function loadContactsForContactGroup() {
  try {
    const response = await fetch(`${BASE_URL}/contacts.json`);
    const data = await response.json();
    if (!data) return [];
    return Object.entries(data).map(([key, value]) => ({
      id: key,
      ...value
    }));
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
    return [];
  }

}

function refreshContactDetails() {
  const contactDetailsContainerRef = document.getElementById('contact-details');
  contactDetailsContainerRef.innerHTML = '';

}

function colorizeContactInitials() {
  const initialsElements = document.querySelectorAll('.contact-initials');
  initialsElements.forEach(el => {
    el.classList.remove('bg-blue', 'bg-green', 'bg-purple', 'bg-orange', 'bg-pink', 'bg-red', 'bg-teal', 'bg-brown');
    el.classList.add(getRandomInitialsColorClass());
  });
}

function getRandomInitialsColorClass() {
  const colorClasses = [
    'bg-blue',
    'bg-green',
    'bg-purple',
    'bg-orange',
    'bg-pink',
    'bg-red',
    'bg-teal',
    'bg-brown'
  ];
  return colorClasses[Math.floor(Math.random() * colorClasses.length)];
}

// delete contact
async function deleteContact(contactId) {
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
      method: "DELETE"
    });
    if (response.ok) {
      await renderContactGroup();
    } else {
      console.error("Fehler beim Löschen des Kontakts.");
    }
  } catch (error) {
    console.error("Fehler beim Löschen des Kontakts:", error);
  }
  refreshContactDetails();
}

// update contact
async function updateContact(event, contactId) {
  event.preventDefault();
  const name = document.getElementById('edit-name').value;
  const email = document.getElementById('edit-email').value;
  const phone = document.getElementById('edit-phone').value;

  const updatedContact = { name, email, phone };

  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedContact),
    });
    if (response.ok) {
      await renderContactGroup();
      closeEditContactDialog();
      refreshContactDetails();
    } else {
      console.error("Fehler beim Aktualisieren des Kontakts.");
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Kontakts:", error);
  }
}

// Öffnet den Edit-Dialog mit vorausgefüllten Daten
function openEditContactDialog(id, name, email, phone, initials) {
  const container = document.getElementById('edit-contact-dialog-container');
  if (!container) return;

  container.innerHTML = getEditContactDialog(id, name, email, phone, initials);
  const dialog = document.getElementById('edit-contact-dialog');
  if (!dialog) return;

  // Dialog schließen bei Klick außerhalb des Inhalts (Backdrop) und aus dem DOM entfernen
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) {
      closeEditContactDialog();
    }
  });

  // Event-Bubbling im Content verhindern
  const dialogContent = dialog.querySelector('.ac-dialog-content');
  if (dialogContent) {
    dialogContent.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  // Entferne closing-Klasse falls noch vorhanden
  dialog.classList.remove('closing');
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

// NEU: Schließt den Edit-Dialog mit Animation
function closeEditContactDialog() {
  const dialog = document.getElementById('edit-contact-dialog');
  if (dialog) {
    // Closing-Animation abspielen
    dialog.classList.add('closing');
    
    // Nach der Animation Dialog schließen und aus DOM entfernen
    setTimeout(() => {
      dialog.close();
      dialog.remove();
    }, 300); // 300ms = Dauer der Animation
  }
}