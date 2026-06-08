/** @file Contact list selection and details panel rendering. */

/**
 * Renders the contact details panel for the given contact.
 * @param {Object} contactData - Contact record containing name, email, and phone.
 * @param {string} contactId - Unique identifier of the contact being displayed.
 * @returns {void}
 */
function renderContactDetailsPanel(contactData, contactId) {
  const container = document.getElementById("contact-details");
  if (!container) return;
  const initials = getContactInitialsFromName(contactData.name);
  const phone = contactData.phone || "";
  container.innerHTML = getContactDetailsTemplate(initials, contactData.name, contactData.email, phone, contactId);
  initContactMoreMenuAutoClose();
  if (window.innerWidth <= CONTACT_MOBILE_BREAKPOINT) {
    document.querySelector(".wrapper")?.classList.add("show-contact-details");
  }
}

/**
 * Selects a contact in the list and shows its details.
 * @param {string} contactId - Unique identifier of the contact to select.
 * @param {Object} contactData - Contact record to render in the details panel.
 * @returns {void}
 */
function showContactInDetailsPanel(contactId, contactData) {
  if (!contactId || !contactData) return;
  document.querySelectorAll(".contact-area, .contact-item").forEach((el) => el.classList.remove("selected"));
  const listItem = document.querySelector(`.contact-item[data-id="${CSS.escape(contactId)}"]`);
  listItem?.classList.add("selected");
  renderContactDetailsPanel(contactData, contactId);
  listItem?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

/**
 * Handles a click on a contact list item.
 * @param {Event} event - Click event from the selected contact row.
 * @returns {Promise<void>}
 */
async function handleContactClick(event) {
  const clickedContact = event.currentTarget;
  document.querySelectorAll(".contact-area, .contact-item").forEach((c) => c.classList.remove("selected"));
  clickedContact.classList.add("selected");
  const contactId = clickedContact.dataset.id;
  const contactData = await fetchContactDetails(contactId);
  if (!contactData) {
    console.error("Kontakt konnte nicht geladen werden.");
    return;
  }
  renderContactDetailsPanel(contactData, contactId);
}

/**
 * Attaches click listeners to all contact list items.
 * @returns {void}
 */
function addContactClickListeners() {
  document.querySelectorAll(".contact-item[data-id], .contact-area[data-id]").forEach((contact) => {
    contact.addEventListener("click", handleContactClick);
  });
}

/**
 * Loads contacts and renders the full contact list.
 * @returns {Promise<void>}
 */
async function renderContactGroup() {
  await loadContacts();
  const contactListRef = document.getElementById("contact-list");
  contactListRef.innerHTML = "";
  renderContactEntries(contactListRef, contacts);
  colorizeContactInitials();
  addContactClickListeners();
}

/**
 * Appends a single contact entry and optional letter header.
 * @param {HTMLElement} contactListRef - Container element that holds the contact list.
 * @param {Object} contact - Contact record to append to the list.
 * @param {string} currentLetter - Letter group currently being rendered.
 * @returns {string} Updated group letter after the entry is appended.
 */
function appendContactEntry(contactListRef, contact, currentLetter) {
  const firstLetter = (contact.name || "Unnamed").charAt(0).toUpperCase();
  if (currentLetter !== firstLetter) {
    contactListRef.innerHTML += getHeaderLetter(firstLetter);
    currentLetter = firstLetter;
  }
  const name = contact.name || "Unnamed";
  contactListRef.innerHTML += getContactItemWrapper(
    contact.id,
    contact.phone,
    getContactItem(name, contact.email, getContactInitialsFromName(name))
  );
  return currentLetter;
}

/**
 * Renders all contact entries sorted by name.
 * @param {HTMLElement} contactListRef - Container element that holds the contact list.
 * @param {Object[]} contactsData - Array of contact records to render.
 * @returns {void}
 */
function renderContactEntries(contactListRef, contactsData) {
  let currentLetter = "";
  contactsData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  for (let i = 0; i < contactsData.length; i++) {
    currentLetter = appendContactEntry(contactListRef, contactsData[i], currentLetter);
  }
}

/**
 * Clears the contact details panel and hides mobile overlay.
 * @returns {void}
 */
function refreshContactDetails() {
  const contactDetailsContainerRef = document.getElementById("contact-details");
  contactDetailsContainerRef.innerHTML = "";
  if (window.innerWidth <= CONTACT_MOBILE_BREAKPOINT) {
    document.querySelector(".wrapper")?.classList.remove("show-contact-details");
  }
}

/**
 * Assigns a random color class to each contact initials badge.
 * @returns {void}
 */
function colorizeContactInitials() {
  document.querySelectorAll(".contact-initials").forEach((el) => {
    el.classList.remove(...INITIALS_COLOR_CLASSES);
    el.classList.add(getRandomInitialsColorClass());
  });
}
