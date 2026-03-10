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
async function handleContactClick(event) {
  const clickedContact = event.currentTarget;
  document.querySelectorAll('.contact-area, .contact-item').forEach(contact => contact.classList.remove('selected'));
  clickedContact.classList.add('selected');
  const contactId = clickedContact.dataset.id;
  const contactData = await fetchContactDetails(contactId);
  if (!contactData) {
    console.error("Kontakt konnte nicht geladen werden.");
    return;
  }
  const container = document.getElementById('contact-details');
  const initials = getContactInitialsFromName(contactData.name);
  const phone = contactData.phone || '';
  container.innerHTML = getContactDetailsTemplate(initials, contactData.name, contactData.email, phone, contactId);
  suppressHorizontalOverflowDuringDetailsAnimation();
  initContactMoreMenuAutoClose();
  if (window.innerWidth <= 780) document.querySelector('.wrapper').classList.add('show-contact-details');
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
function renderContactEntries(contactListRef, contactsData) {
  let currentLetter = '';
  contactsData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  for (let i = 0; i < contactsData.length; i++) {
    const contact = contactsData[i];
    const firstLetter = (contact.name || 'Unnamed').charAt(0).toUpperCase();
    if (currentLetter !== firstLetter) {
      currentLetter = firstLetter;
      contactListRef.innerHTML += getHeaderLetter(firstLetter);
    }
    const name = contact.name || 'Unnamed';
    const initials = getContactInitialsFromName(name);
    const content = getContactItem(name, contact.email, initials);
    contactListRef.innerHTML += getContactItemWrapper(contact.id, contact.phone, content);
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
