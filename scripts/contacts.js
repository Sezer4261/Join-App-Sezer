// let contacts = [
//     { id: 1, name: "Alex Johnson", email: "alex@example.com", phone: "+49 123 456789", avatar: "assets/avatar1.jpg" },
//     { id: 2, name: "Maria Gomez", email: "maria@example.com", phone: "+49 987 654321", avatar: "assets/avatar3.jpg" },
//     { id: 3, name: "Chris Müller", email: "chris@example.com", phone: "+49 555 123456", avatar: "assets/avatar4.jpg" }
// ];



function closeOverlay() {
  document.getElementById("contact-overlay").classList.add("hidden");
}

function openAddContactDialog() {
  let dialog = document.getElementById("add-contact-dialog");

  if (!dialog) {
    document.body.insertAdjacentHTML("beforeend", getDialogAddContact());
    dialog = document.getElementById("add-contact-dialog");

    const closeBtn = dialog.querySelector(".ac__close");
    const cancelBtn = dialog.querySelector("[data-ac-cancel]");
    [closeBtn, cancelBtn].forEach(btn =>
      btn.addEventListener("click", () => dialog.close())
    );

    dialog.addEventListener("cancel", e => {
      e.preventDefault();
      dialog.close();
    });
  }

  dialog.showModal();

  if (typeof openAddContact === "function") {
    openAddContact();
  }
}

async function addContact(event) {
  event.preventDefault();
  const contact = generateObjFromContact();

  await saveContact(contact);
  alert("Task erfolgreich erstellt!");
  document.getElementById('add-contact-form').reset();
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

function resetInputFieldsFromContactDialog() {
  document.getElementById('add-contact-form').reset();
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
  const phone = contactData.phone || 'N/A'; // Fallback für Telefonnummer

  contactDetailsContainer.innerHTML = getContactDetailsTemplate(initials, name, email, phone);
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