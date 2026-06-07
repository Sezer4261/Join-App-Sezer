/** @file Contact create, update, delete, and validation. */
/**
 * Validates a contact field and returns the normalized value or null on failure.
 * @param {*} rawValue - Raw field value.
 * @param {string} fieldId - Field id for error display.
 * @param {string[]} fields - All field ids.
 * @param {Function} validator - Validator function.
 * @param {string} normalizedProp - Property name on the check result.
 * @returns {*|null} Normalized value or null when invalid.
 */
function runContactFieldValidation(rawValue, fieldId, fields, validator, normalizedProp) {
  const check = validator(rawValue);
  if (!check.isValid) {
    showContactSubmitError?.(fieldId, check.error, fields);
    return null;
  }
  return check[normalizedProp];
}

/**
 * Validates and normalizes all fields on a new contact object.
 * @param {Object} contact - Contact object to mutate.
 * @param {string[]} fields - Field ids for error display.
 * @returns {boolean} True when all fields are valid.
 */
function validateAndNormalizeNewContact(contact, fields) {
  let value = runContactFieldValidation(contact.name, "ac-name", fields, validateContactNameInput, "normalizedName");
  if (value === null) return false;
  contact.name = value;
  value = runContactFieldValidation(contact.email, "ac-email", fields, validateEmailLikeSignup, "normalizedEmail");
  if (value === null) return false;
  contact.email = value;
  value = runContactFieldValidation(contact.phone, "ac-phone", fields, validateContactPhoneNumber, "normalizedPhone");
  if (value === null) return false;
  contact.phone = value;
  return true;
}

/**
 * Persists a new contact and refreshes the UI.
 * @param {Object} contact - Contact to save.
 * @returns {Promise<void>} Result.
 */
async function performAddContactSave(contact) {
  const saved = await saveContact(contact);
  if (!saved) return;
  await renderContactGroup();
  const contactId = saved.name
    || contacts.find((c) => c.email === contact.email && c.name === contact.name)?.id;
  document.getElementById("add-contact-dialog")?.close();
  document.getElementById("add-contact-form")?.reset();
  if (contactId) showContactInDetailsPanel(contactId, contact);
  setTimeout(() => showContactsToast("You have created a contact"), 0);
}

/**
 * Handles add-contact form submission.
 * @param {Event} event - Submit event.
 * @returns {Promise<void>} Result.
 */
async function addContact(event) {
  event.preventDefault();
  const contact = generateObjFromContact();
  const fields = ["ac-name", "ac-email", "ac-phone"];
  if (!validateAndNormalizeNewContact(contact, fields)) return;
  if (!isContactComplete(contact)) {
    alert("Bitte alle Felder ausfüllen!");
    return;
  }
  await performAddContactSave(contact);
}

/**
 * Returns whether all required contact fields are filled.
 * @param {Object} contact - Contact object.
 * @returns {boolean} Result.
 */
function isContactComplete(contact) {
  return contact.name && contact.email && contact.phone;
}

/**
 * POSTs a new contact to the API.
 * @param {Object} contact - Contact payload.
 * @returns {Promise<Object|undefined>} Saved contact or undefined on error.
 */
async function saveContact(contact) {
  try {
    const response = await fetch(`${BASE_URL}/contacts.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    return await response.json();
  } catch (error) {
    console.error("Fehler beim Speichern des Kontakts:", error);
  }
}

/**
 * Reads add-contact form values into an object.
 * @returns {Object} Contact object.
 */
function generateObjFromContact() {
  return {
    name: document.getElementById("ac-name").value,
    email: document.getElementById("ac-email").value,
    phone: document.getElementById("ac-phone").value,
  };
}

/**
 * Fetches a single contact by id.
 * @param {string} contactId - Contact identifier.
 * @returns {Promise<Object|null>} Contact or null on error.
 */
async function fetchContactDetails(contactId) {
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`);
    if (!response.ok) throw new Error("Fehler beim Abrufen der Kontaktdaten.");
    return await response.json();
  } catch (error) {
    console.error("Fehler beim Abrufen der Kontaktdaten:", error);
    return null;
  }
}

/**
 * Handles a successful contact delete response.
 * @returns {Promise<void>} Result.
 */
async function handleContactDeleteSuccess() {
  await renderContactGroup();
  refreshContactDetails();
  setTimeout(() => showContactsToast("Contact successfully deleted"), 0);
}

/**
 * Deletes a contact and refreshes the UI.
 * @param {string} contactId - Contact identifier.
 * @returns {Promise<void>} Result.
 */
async function deleteContact(contactId) {
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, { method: "DELETE" });
    if (response.ok) { await handleContactDeleteSuccess(); return; }
    console.error("Fehler beim Löschen des Kontakts.");
  } catch (error) {
    console.error("Fehler beim Löschen des Kontakts:", error);
  }
  refreshContactDetails();
}

/**
 * Reads current values from the edit-contact form fields.
 * @returns {Object} Contact object with raw field values.
 */
function readEditContactFormValues() {
  return {
    name: document.getElementById("edit-name").value,
    email: document.getElementById("edit-email").value,
    phone: document.getElementById("edit-phone").value,
  };
}

/**
 * Validates edit-contact fields and returns the updated contact object.
 * @param {string[]} fields - Field ids for error display.
 * @returns {Object|null} Updated contact or null when invalid.
 */
function validateAndBuildUpdatedContact(fields) {
  const contact = readEditContactFormValues();
  const name = runContactFieldValidation(contact.name, "edit-name", fields, validateContactNameInput, "normalizedName");
  if (name === null) return null;
  contact.name = name;
  const email = runContactFieldValidation(contact.email, "edit-email", fields, validateEmailLikeSignup, "normalizedEmail");
  if (email === null) return null;
  contact.email = email;
  const phone = runContactFieldValidation(contact.phone, "edit-phone", fields, validateContactPhoneNumber, "normalizedPhone");
  if (phone === null) return null;
  contact.phone = phone;
  return contact;
}

/**
 * Refreshes UI after a contact was updated successfully.
 * @returns {Promise<void>} Result.
 */
async function refreshAfterContactUpdate() {
  await renderContactGroup();
  closeEditContactDialog();
  refreshContactDetails();
}

/**
 * Persists an updated contact to the API.
 * @param {string} contactId - Contact identifier.
 * @param {Object} updatedContact - Validated contact data.
 * @returns {Promise<boolean>} True when saved successfully.
 */
async function persistUpdatedContact(contactId, updatedContact) {
  const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedContact),
  });
  if (!response.ok) { console.error("Fehler beim Aktualisieren des Kontakts."); return false; }
  await refreshAfterContactUpdate();
  return true;
}

/**
 * Handles edit-contact form submission.
 * @param {Event} event - Submit event.
 * @param {string} contactId - Contact identifier.
 * @returns {Promise<void>} Result.
 */
async function updateContact(event, contactId) {
  event.preventDefault();
  const fields = ["edit-name", "edit-email", "edit-phone"];
  const updatedContact = validateAndBuildUpdatedContact(fields);
  if (!updatedContact) return;
  try {
    await persistUpdatedContact(contactId, updatedContact);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Kontakts:", error);
  }
}
