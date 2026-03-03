/**
 * Adds contact.
 * @param {Event} event - Browser event.
 * @returns {Promise<*>} Result.
 */
async function addContact(event) {
  event.preventDefault();
  const contact = generateObjFromContact();
  if (!isContactComplete(contact)) {
    alert("Bitte alle Felder ausfüllen!");
    return;
  }
  const saved = await saveContact(contact);
  if (!saved) return;
  await renderContactGroup();
  const dialog = document.getElementById("add-contact-dialog");
  if (dialog) dialog.close();
  const form = document.getElementById('add-contact-form');
  if (form) form.reset();
  setTimeout(() => showContactsToast('Contact successfully created'), 0);
}

/**
 * Checks whether contact complete.
 * @param {Object} contact - Contact object.
 * @returns {boolean} Result.
 */
function isContactComplete(contact) {
  return contact.name && contact.email && contact.phone;
}

/**
 * Saves contact.
 * @param {Object} contact - Contact object.
 * @returns {Promise<*>} Result.
 */
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

/**
 * Generates obj from contact.
 * @returns {*} Result.
 */
function generateObjFromContact() {
  const name = document.getElementById('ac-name').value;
  const email = document.getElementById('ac-email').value;
  const phone = document.getElementById('ac-phone').value;
  return { name, email, phone };
}

/**
 * Fetches contact details.
 * @param {string} contactId - Contact identifier.
 * @returns {Promise<*>} Result.
 */
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

// delete contact
/**
 * Deletes contact.
 * @param {string} contactId - Contact identifier.
 * @returns {Promise<*>} Result.
 */
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

/**
 * Updates contact.
 * @param {Event} event - Browser event.
 * @param {string} contactId - Contact identifier.
 * @returns {Promise<*>} Result.
 */
async function updateContact(event, contactId) {
  event.preventDefault();
  const updatedContact = {
    name: document.getElementById('edit-name').value,
    email: document.getElementById('edit-email').value,
    phone: document.getElementById('edit-phone').value
  };
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedContact),
    });
    if (!response.ok) {
      console.error("Fehler beim Aktualisieren des Kontakts.");
      return;
    }
    await renderContactGroup();
    closeEditContactDialog();
    refreshContactDetails();
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Kontakts:", error);
  }
}
