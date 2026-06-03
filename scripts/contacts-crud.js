function validateAndNormalizeNewContact(contact, fields) {
  const nameCheck = validateContactNameInput(contact.name);
  if (!nameCheck.isValid) {
    showContactSubmitError?.("ac-name", nameCheck.error, fields);
    return false;
  }
  contact.name = nameCheck.normalizedName;
  const emailCheck = validateEmailLikeSignup(contact.email);
  if (!emailCheck.isValid) {
    showContactSubmitError?.("ac-email", emailCheck.error, fields);
    return false;
  }
  contact.email = emailCheck.normalizedEmail;
  const phoneCheck = validateContactPhoneNumber(contact.phone);
  if (!phoneCheck.isValid) {
    showContactSubmitError?.("ac-phone", phoneCheck.error, fields);
    return false;
  }
  contact.phone = phoneCheck.normalizedPhone;
  return true;
}

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

function isContactComplete(contact) {
  return contact.name && contact.email && contact.phone;
}

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

function generateObjFromContact() {
  return {
    name: document.getElementById("ac-name").value,
    email: document.getElementById("ac-email").value,
    phone: document.getElementById("ac-phone").value,
  };
}

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

async function deleteContact(contactId) {
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, { method: "DELETE" });
    if (response.ok) {
      await renderContactGroup();
      refreshContactDetails();
      setTimeout(() => showContactsToast("Contact successfully deleted"), 0);
      return;
    }
    console.error("Fehler beim Löschen des Kontakts.");
  } catch (error) {
    console.error("Fehler beim Löschen des Kontakts:", error);
  }
  refreshContactDetails();
}

function validateAndBuildUpdatedContact(fields) {
  const nameCheck = validateContactNameInput(document.getElementById("edit-name").value);
  if (!nameCheck.isValid) {
    showContactSubmitError?.("edit-name", nameCheck.error, fields);
    return null;
  }
  const contact = {
    name: nameCheck.normalizedName,
    email: document.getElementById("edit-email").value,
    phone: document.getElementById("edit-phone").value,
  };
  const emailCheck = validateEmailLikeSignup(contact.email);
  if (!emailCheck.isValid) {
    showContactSubmitError?.("edit-email", emailCheck.error, fields);
    return null;
  }
  contact.email = emailCheck.normalizedEmail;
  const phoneCheck = validateContactPhoneNumber(contact.phone);
  if (!phoneCheck.isValid) {
    showContactSubmitError?.("edit-phone", phoneCheck.error, fields);
    return null;
  }
  contact.phone = phoneCheck.normalizedPhone;
  return contact;
}

async function updateContact(event, contactId) {
  event.preventDefault();
  const fields = ["edit-name", "edit-email", "edit-phone"];
  const updatedContact = validateAndBuildUpdatedContact(fields);
  if (!updatedContact) return;
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
