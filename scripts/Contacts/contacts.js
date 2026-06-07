/** @file Contact list selection and details panel rendering. */
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

function showContactInDetailsPanel(contactId, contactData) {
  if (!contactId || !contactData) return;
  document.querySelectorAll(".contact-area, .contact-item").forEach((el) => el.classList.remove("selected"));
  const listItem = document.querySelector(`.contact-item[data-id="${CSS.escape(contactId)}"]`);
  listItem?.classList.add("selected");
  renderContactDetailsPanel(contactData, contactId);
  listItem?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

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

function addContactClickListeners() {
  document.querySelectorAll(".contact-item[data-id], .contact-area[data-id]").forEach((contact) => {
    contact.addEventListener("click", handleContactClick);
  });
}

async function renderContactGroup() {
  await loadContacts();
  const contactListRef = document.getElementById("contact-list");
  contactListRef.innerHTML = "";
  renderContactEntries(contactListRef, contacts);
  colorizeContactInitials();
  addContactClickListeners();
}

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

function renderContactEntries(contactListRef, contactsData) {
  let currentLetter = "";
  contactsData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  for (let i = 0; i < contactsData.length; i++) {
    currentLetter = appendContactEntry(contactListRef, contactsData[i], currentLetter);
  }
}

function refreshContactDetails() {
  const contactDetailsContainerRef = document.getElementById("contact-details");
  contactDetailsContainerRef.innerHTML = "";
  if (window.innerWidth <= CONTACT_MOBILE_BREAKPOINT) {
    document.querySelector(".wrapper")?.classList.remove("show-contact-details");
  }
}

function colorizeContactInitials() {
  document.querySelectorAll(".contact-initials").forEach((el) => {
    el.classList.remove(...INITIALS_COLOR_CLASSES);
    el.classList.add(getRandomInitialsColorClass());
  });
}
