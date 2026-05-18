/**
 * Adds contact.
 * @param {Event} event - Browser event.
 * @returns {Promise<*>} Result.
 */
/**
 * Validates all fields for a new contact. Returns null if valid, otherwise shows error.
 * @param {Object} contact - Contact object (mutated on success).
 * @param {string[]} fields - Field IDs for error context.
 * @returns {boolean} True if valid.
 */
function validateAndNormalizeNewContact(contact, fields) {
  const nameCheck = validateContactNameInput(contact.name);
  if (!nameCheck.isValid) { showContactSubmitError?.('ac-name', nameCheck.error, fields); return false; }
  contact.name = nameCheck.normalizedName;
  const emailCheck = validateEmailLikeSignup(contact.email);
  if (!emailCheck.isValid) { showContactSubmitError?.('ac-email', emailCheck.error, fields); return false; }
  contact.email = emailCheck.normalizedEmail;
  const phoneCheck = validateContactPhoneNumber(contact.phone);
  if (!phoneCheck.isValid) { showContactSubmitError?.('ac-phone', phoneCheck.error, fields); return false; }
  contact.phone = phoneCheck.normalizedPhone;
  return true;
}

/**
 * Performs the save and post-save actions after contact validation.
 * @param {Object} contact - Contact object.
 * @returns {Promise<void>} Result.
 */
async function performAddContactSave(contact) {
  const saved = await saveContact(contact);
  if (!saved) return;
  await renderContactGroup();
  document.getElementById("add-contact-dialog")?.close();
  document.getElementById('add-contact-form')?.reset();
  setTimeout(() => showContactsToast('Contact successfully created'), 0);
}

async function addContact(event) {
  event.preventDefault();
  const contact = generateObjFromContact();
  const fields = ['ac-name', 'ac-email', 'ac-phone'];
  if (!validateAndNormalizeNewContact(contact, fields)) return;
  if (!isContactComplete(contact)) { alert("Bitte alle Felder ausfüllen!"); return; }
  await performAddContactSave(contact);
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
    const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, { method: "DELETE" });
    if (response.ok) { await renderContactGroup(); }
    else { console.error("Fehler beim Löschen des Kontakts."); }
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
/**
 * Validates and normalizes edit contact fields. Returns null if invalid.
 * @param {string[]} fields - Field IDs for error context.
 * @returns {{name: string, email: string, phone: string}|null} Result.
 */
function validateAndBuildUpdatedContact(fields) {
  const rawName = document.getElementById('edit-name').value;
  const nameCheck = validateContactNameInput(rawName);
  if (!nameCheck.isValid) { showContactSubmitError?.('edit-name', nameCheck.error, fields); return null; }
  const contact = { name: nameCheck.normalizedName, email: document.getElementById('edit-email').value, phone: document.getElementById('edit-phone').value };
  const emailCheck = validateEmailLikeSignup(contact.email);
  if (!emailCheck.isValid) { showContactSubmitError?.('edit-email', emailCheck.error, fields); return null; }
  contact.email = emailCheck.normalizedEmail;
  const phoneCheck = validateContactPhoneNumber(contact.phone);
  if (!phoneCheck.isValid) { showContactSubmitError?.('edit-phone', phoneCheck.error, fields); return null; }
  contact.phone = phoneCheck.normalizedPhone;
  return contact;
}

async function updateContact(event, contactId) {
  event.preventDefault();
  const fields = ['edit-name', 'edit-email', 'edit-phone'];
  const updatedContact = validateAndBuildUpdatedContact(fields);
  if (!updatedContact) return;
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedContact)
    });
    if (!response.ok) { console.error("Fehler beim Aktualisieren des Kontakts."); return; }
    await renderContactGroup();
    closeEditContactDialog();
    refreshContactDetails();
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Kontakts:", error);
  }
}
