let contactDetailsOverflowTimeoutId;

/**
 * Temporarily hides horizontal overflow while contact details slide in.
 * @returns {void} Result.
 */
function suppressHorizontalOverflowDuringDetailsAnimation() {
  const detailsSection = document.querySelector('.contact-section-right');
  if (!detailsSection) return;

  detailsSection.style.overflowX = 'hidden';
  window.clearTimeout(contactDetailsOverflowTimeoutId);
  contactDetailsOverflowTimeoutId = window.setTimeout(() => {
    detailsSection.style.overflowX = '';
  }, 320);
}

/**
 * Executes handle contact click logic.
 * @param {Event} event - Browser event.
 * @returns {Promise<*>} Result.
 */
/**
 * Renders the contact details panel for the given contact.
 * @param {Object} contactData - Contact data object.
 * @param {string} contactId - Contact ID.
 * @returns {void} Result.
 */
function renderContactDetailsPanel(contactData, contactId) {
  const container = document.getElementById('contact-details');
  const initials = getContactInitialsFromName(contactData.name);
  const phone = contactData.phone || '';
  container.innerHTML = getContactDetailsTemplate(initials, contactData.name, contactData.email, phone, contactId);
  suppressHorizontalOverflowDuringDetailsAnimation();
  initContactMoreMenuAutoClose();
  if (window.innerWidth <= 780) document.querySelector('.wrapper').classList.add('show-contact-details');
}

async function handleContactClick(event) {
  const clickedContact = event.currentTarget;
  document.querySelectorAll('.contact-area, .contact-item').forEach(c => c.classList.remove('selected'));
  clickedContact.classList.add('selected');
  const contactId = clickedContact.dataset.id;
  const contactData = await fetchContactDetails(contactId);
  if (!contactData) { console.error("Kontakt konnte nicht geladen werden."); return; }
  renderContactDetailsPanel(contactData, contactId);
}

/**
 * Adds contact click listeners.
 * @returns {void} Result.
 */
function addContactClickListeners() {
  document.querySelectorAll('.contact-item[data-id], .contact-area[data-id]').forEach(contact => {
    contact.addEventListener('click', handleContactClick);
  });
}

/**
 * Renders contact group.
 * @returns {Promise<*>} Result.
 */
async function renderContactGroup() {
  await loadContacts();
  const contactListRef = document.getElementById('contact-list');
  contactListRef.innerHTML = '';
  renderContactEntries(contactListRef, contacts);
  colorizeContactInitials();
  addContactClickListeners();
}

/**
 * Renders contact entries.
 * @param {*} contactListRef - Parameter.
 * @param {*} contactsData - Parameter.
 * @returns {void} Result.
 */
/**
 * Appends header and contact item for a single contact entry.
 * @param {HTMLElement} contactListRef - Contact list container.
 * @param {Object} contact - Contact object.
 * @param {string} currentLetter - Current group letter (mutated by caller via return).
 * @returns {string} Updated current letter.
 */
function appendContactEntry(contactListRef, contact, currentLetter) {
  const firstLetter = (contact.name || 'Unnamed').charAt(0).toUpperCase();
  if (currentLetter !== firstLetter) {
    contactListRef.innerHTML += getHeaderLetter(firstLetter);
    currentLetter = firstLetter;
  }
  const name = contact.name || 'Unnamed';
  contactListRef.innerHTML += getContactItemWrapper(contact.id, contact.phone, getContactItem(name, contact.email, getContactInitialsFromName(name)));
  return currentLetter;
}

function renderContactEntries(contactListRef, contactsData) {
  let currentLetter = '';
  contactsData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  for (let i = 0; i < contactsData.length; i++) {
    currentLetter = appendContactEntry(contactListRef, contactsData[i], currentLetter);
  }
}

/**
 * Executes refresh contact details logic.
 * @returns {void} Result.
 */
function refreshContactDetails() {
  const contactDetailsContainerRef = document.getElementById('contact-details');
  contactDetailsContainerRef.innerHTML = '';
  if (window.innerWidth <= 780) {
    document.querySelector('.wrapper').classList.remove('show-contact-details');
  }
}

/**
 * Executes colorize contact initials logic.
 * @returns {void} Result.
 */
function colorizeContactInitials() {
  const initialsElements = document.querySelectorAll('.contact-initials');
  initialsElements.forEach(el => {
    el.classList.remove('bg-blue', 'bg-green', 'bg-purple', 'bg-orange', 'bg-pink', 'bg-red', 'bg-teal', 'bg-brown');
    el.classList.add(getRandomInitialsColorClass());
  });
}

/**
 * Returns random initials color class.
 * @returns {*} Result.
 */
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
