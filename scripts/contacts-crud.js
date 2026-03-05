/**
 * Adds contact.
 * @param {Event} event - Browser event.
 * @returns {Promise<*>} Result.
 */
async function addContact(event) {
  event.preventDefault();
  const contact = generateObjFromContact();

  const nameCheck = validateContactNameInput(contact.name);
  if (!nameCheck.isValid) {
    const nameEl = document.getElementById('ac-name');
    if (nameEl && typeof nameEl.reportValidity === 'function') {
      nameEl.setCustomValidity(nameCheck.error);
      nameEl.reportValidity();
      nameEl.setCustomValidity('');
    }
    if (typeof showMessage === 'function') {
      showMessage(nameCheck.error, 'error');
    } else {
      alert(nameCheck.error);
    }
    return;
  }
  contact.name = nameCheck.normalizedName;

  const emailCheck = validateEmailLikeSignup(contact.email);
  if (!emailCheck.isValid) {
    const emailEl = document.getElementById('ac-email');
    if (emailEl && typeof emailEl.reportValidity === 'function') {
      emailEl.setCustomValidity(emailCheck.error);
      emailEl.reportValidity();
      emailEl.setCustomValidity('');
    }
    if (typeof showMessage === 'function') {
      showMessage(emailCheck.error, 'error');
    } else {
      alert(emailCheck.error);
    }
    return;
  }
  contact.email = emailCheck.normalizedEmail;

  const phoneCheck = validateContactPhoneNumber(contact.phone);
  if (!phoneCheck.isValid) {
    const phoneEl = document.getElementById('ac-phone');
    if (phoneEl && typeof phoneEl.reportValidity === 'function') {
      phoneEl.setCustomValidity(phoneCheck.error);
      phoneEl.reportValidity();
      phoneEl.setCustomValidity('');
    }
    if (typeof showMessage === 'function') {
      showMessage(phoneCheck.error, 'error');
    } else {
      alert(phoneCheck.error);
    }
    return;
  }
  contact.phone = phoneCheck.normalizedPhone;

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

  const rawName = document.getElementById('edit-name').value;
  const nameCheck = validateContactNameInput(rawName);
  if (!nameCheck.isValid) {
    const nameEl = document.getElementById('edit-name');
    if (nameEl && typeof nameEl.reportValidity === 'function') {
      nameEl.setCustomValidity(nameCheck.error);
      nameEl.reportValidity();
      nameEl.setCustomValidity('');
    }
    if (typeof showMessage === 'function') {
      showMessage(nameCheck.error, 'error');
    } else {
      alert(nameCheck.error);
    }
    return;
  }

  const updatedContact = {
    name: nameCheck.normalizedName,
    email: document.getElementById('edit-email').value,
    phone: document.getElementById('edit-phone').value
  };

  const emailCheck = validateEmailLikeSignup(updatedContact.email);
  if (!emailCheck.isValid) {
    const emailEl = document.getElementById('edit-email');
    if (emailEl && typeof emailEl.reportValidity === 'function') {
      emailEl.setCustomValidity(emailCheck.error);
      emailEl.reportValidity();
      emailEl.setCustomValidity('');
    }
    if (typeof showMessage === 'function') {
      showMessage(emailCheck.error, 'error');
    } else {
      alert(emailCheck.error);
    }
    return;
  }
  updatedContact.email = emailCheck.normalizedEmail;

  const phoneCheck = validateContactPhoneNumber(updatedContact.phone);
  if (!phoneCheck.isValid) {
    const phoneEl = document.getElementById('edit-phone');
    if (phoneEl && typeof phoneEl.reportValidity === 'function') {
      phoneEl.setCustomValidity(phoneCheck.error);
      phoneEl.reportValidity();
      phoneEl.setCustomValidity('');
    }
    if (typeof showMessage === 'function') {
      showMessage(phoneCheck.error, 'error');
    } else {
      alert(phoneCheck.error);
    }
    return;
  }
  updatedContact.phone = phoneCheck.normalizedPhone;
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
      method: "PUT",
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
