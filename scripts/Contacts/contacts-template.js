/** @file HTML templates for contact dialogs and panels. */

/**
 * Returns the hero section for the add-contact dialog.
 * @returns {string} Result.
 */
function getAddContactDialogHeroHTML() {
  return `
    <div class="ac-hero">
      <div class="ac-brand"><img class="ac-logo" src="./assets/img/join-logo-white.svg" alt="Join Logo"></div>
      <div class="ac-hero-heading">
        <h2 id="ac-title" class="ac-title">Add contact</h2>
        <span class="ac-underline" aria-hidden="true"></span>
      </div>
      <p class="ac-subtitle">Tasks are better with a team!</p>
    </div>
  `;
}

/**
 * Returns the form fields for the add-contact dialog.
 * @returns {string} Result.
 */
function getAddContactFormHTML() {
  return `
    <form onsubmit="addContact(event)" id="add-contact-form" class="ac-form" novalidate>
      <div class="ac-input-wrapper"><div class="ac-field"><input class="input-focus" id="ac-name" type="text" placeholder="Name" required><img src="./assets/icons/person.svg"></div><span class="error-message" id="ac-name-error"></span></div>
      <div class="ac-input-wrapper"><div class="ac-field"><input class="input-focus" id="ac-email" type="email" placeholder="Email" required><img src="./assets/icons/mail.svg"></div><span class="error-message" id="ac-email-error"></span></div>
      <div class="ac-input-wrapper"><div class="ac-field"><input class="input-focus" id="ac-phone" name="phone" type="tel" placeholder="Phone" required><img src="./assets/img/call.png"></div><span class="error-message" id="ac-phone-error"></span></div>
      <div class="ac-actions">
        <button onclick="closeAddContactDialogWithAnimation()" type="button" class="btn btn-ghost responsive-close-btn" data-ac-cancel aria-label="Cancel"><span>Cancel</span><span class="btn-x">×</span></button>
        <button type="submit" class="btn btn-primary" data-ac-submit aria-label="Create contact"><span>Create contact</span><span class="btn-check" aria-hidden="true"><svg width="18" height="14" viewBox="0 0 18 14"><path d="M1 7l5 5L17 1" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
      </div>
    </form>
  `;
}

/**
 * Returns the inner add-contact dialog body markup.
 * @returns {string} Result.
 */
function getAddContactDialogBodyHTML() {
  return `
        <div class="ac">
            ${getAddContactDialogHeroHTML()}
            <button type="button" class="ac-close" aria-label="Close">×</button>
            <div class="ac-avatar ac-avatar-on-divider ac-avatar-add-empty" aria-label="Avatar placeholder">
                <img src="./assets/icons/person.svg" alt="">
            </div>
            <div class="ac-formwrap">${getAddContactFormHTML()}</div>
        </div>`;
}

/**
 * Returns the full add-contact dialog markup.
 * @returns {string} Result.
 */
function getDialogAddContact() {
  return `<dialog id="add-contact-dialog" class="ac-dialog" role="dialog" aria-modal="true" aria-labelledby="ac-title">${getAddContactDialogBodyHTML()}</dialog>`;
}

/**
 * Returns a letter group header for the contacts list.
 * @param {string} firstLetter - Group letter.
 * @returns {string} Result.
 */
function getHeaderLetter(firstLetter) {
  return `
    <h3 class="contact-group-letter">${firstLetter}</h3>
    <hr>
  `;
}

/**
 * Returns a single contact list item body.
 * @param {string} contactDataName - Contact name.
 * @param {string} contactDataMail - Contact email.
 * @param {string} contactNameInitials - Contact initials.
 * @returns {string} Result.
 */
function getContactItem(contactDataName, contactDataMail, contactNameInitials) {
  return `
    <div class="contact-name-wrapper">
        <div class="contact-initials">${contactNameInitials}</div>
        <div>
            <div>${contactDataName}</div>
            <span class=contact-data-mail>${contactDataMail}</span>
        </div>
    </div>
  `;
}

/**
 * Wraps contact item content in a clickable list row.
 * @param {string} contactId - Contact id.
 * @param {string} contactDataPhone - Contact phone.
 * @param {string} content - Inner HTML.
 * @returns {string} Result.
 */
function getContactItemWrapper(contactId, contactDataPhone, content) {
  return `
    <div class="contact-item" data-id="${contactId}" data-phone="${contactDataPhone}">
      ${content}
    </div>
  `;
}

const CONTACT_EDIT_SVG = `<svg width="24" height="24" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="mask0-357207-6165" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="33" height="32"><rect x="0.5" width="32" height="32" fill="#D9D9D9"/></mask><g mask="url(#mask0-357207-6165)"><path class="edit-svg-path" d="M7.16667 25.3332H9.03333L20.5333 13.8332L18.6667 11.9665L7.16667 23.4665V25.3332ZM26.2333 11.8998L20.5667 6.29984L22.4333 4.43317C22.9444 3.92206 23.5722 3.6665 24.3167 3.6665C25.0611 3.6665 25.6889 3.92206 26.2 4.43317L28.0667 6.29984C28.5778 6.81095 28.8444 7.42761 28.8667 8.14984C28.8889 8.87206 28.6444 9.48873 28.1333 9.99984L26.2333 11.8998ZM24.3 13.8665L10.1667 27.9998H4.5V22.3332L18.6333 8.19984L24.3 13.8665Z"/></g></svg>`;
const CONTACT_DELETE_SVG = `<svg width="24" height="24" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path class="delete-svg-path" d="M10 27C9.175 27 8.47917 26.6958 7.9125 26.0875C7.34583 25.4792 7.0625 24.7833 7.0625 24V7H5C4.71667 7 4.47917 6.90417 4.2875 6.7125C4.09583 6.52083 4 6.28333 4 6C4 5.71667 4.09583 5.47917 4.2875 5.2875C4.47917 5.09583 4.71667 5 5 5H13V4C13 3.71667 13.0958 3.47917 13.2875 3.2875C13.4792 3.09583 13.7167 3 14 3H19C19.2833 3 19.5208 3.09583 19.7125 3.2875C19.9042 3.47917 20 3.71667 20 4V5H28C28.2833 5 28.5208 5.09583 28.7125 5.2875C28.9042 5.47917 29 5.71667 29 6C29 6.28333 28.9042 6.52083 28.7125 6.7125C28.5208 6.90417 28.2833 7 28 7H25.9375V24C25.9375 24.7833 25.6542 25.4792 25.0875 26.0875C24.5208 26.6958 23.825 27 23 27H10ZM10 7V24H23V7H10ZM13 22C13 22.2833 13.0958 22.5208 13.2875 22.7125C13.4792 22.9042 13.7167 23 14 23C14.2833 23 14.5208 22.9042 14.7125 22.7125C14.9042 22.5208 15 22.2833 15 22V11C15 10.7167 14.9042 10.4792 14.7125 10.2875C14.5208 10.0958 14.2833 10 14 10C13.7167 10 13.4792 10.0958 13.2875 10.2875C13.0958 10.4792 13 10.7167 13 11V22ZM18 22C18 22.2833 18.0958 22.5208 18.2875 22.7125C18.4792 22.9042 18.7167 23 19 23C19.2833 23 19.5208 22.9042 19.7125 22.7125C19.9042 22.5208 20 22.2833 20 22V11C20 10.7167 19.9042 10.4792 19.7125 10.2875C19.5208 10.0958 19.2833 10 19 10C18.7167 10 18.4792 10.0958 18.2875 10.2875C18.0958 10.4792 18 10.7167 18 11V22Z" fill="#2A3647"/></g></svg>`;

/**
 * Returns the overflow menu for a contact detail view.
 * @param {string} id - Contact id.
 * @param {string} name - Contact name.
 * @param {string} email - Contact email.
 * @param {string} phone - Contact phone.
 * @param {string} initials - Contact initials.
 * @returns {string} Result.
 */
function getContactMoreMenuHTML(id, name, email, phone, initials) {
  return `
    <div class="contact-more">
      <button class="contact-more-btn" onclick="toggleContactMoreMenu(event)" aria-label="More actions"><img src="./assets/icons/more-vert.svg" alt="More"></button>
      <div class="contact-more-menu" id="contact-more-menu">
        <button type="button" onclick="closeContactMoreMenu(); openEditContactDialog('${id}','${name}','${email}','${phone}','${initials}')">${CONTACT_EDIT_SVG}<span>Edit</span></button>
        <button type="button" onclick="closeContactMoreMenu(); deleteContact('${id}')">${CONTACT_DELETE_SVG}<span>Delete</span></button>
      </div>
    </div>
  `;
}

/**
 * Returns the large header block for a contact detail view.
 * @param {string} id - Contact id.
 * @param {string} name - Contact name.
 * @param {string} email - Contact email.
 * @param {string} phone - Contact phone.
 * @param {string} initials - Contact initials.
 * @returns {string} Result.
 */
function getContactHeaderLargeHTML(id, name, email, phone, initials) {
  return `
    <div class="contact-header-large">
      <div class="contact-avatar-large"><div class="contact-initials-large">${initials}</div></div>
      <div class="contact-main-info"><h2 class="contact-name-large">${name}</h2>
        <div class="contact-actions">
          <button class="contact-action-btn" onclick="openEditContactDialog('${id}','${name}','${email}','${phone}','${initials}')">${CONTACT_EDIT_SVG}<span class="edit-label">Edit</span></button>
          <button class="contact-action-btn" onclick="deleteContact('${id}')">${CONTACT_DELETE_SVG}<span class="delete-label">Delete</span></button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Returns the phone section for contact details when a phone exists.
 * @param {string} phone - Contact phone.
 * @returns {string} Result.
 */
function getContactDetailsPhoneSection(phone) {
  return phone ? `<div class="contact-info-phone"><p><strong>Phone</strong></p><p>${phone}</p></div>` : "";
}

/**
 * Returns the contact information block for the detail view.
 * @param {string} email - Contact email.
 * @param {string} phoneSection - Phone section HTML.
 * @returns {string} Result.
 */
function getContactDetailsInfoHTML(email, phoneSection) {
  return `
        <h3 class="contact-information-h3">Contact Information</h3>
        <div class="contact-info-details">
          <div class="contact-info-email"><p><strong>Email</strong></p><a class="contact-email" href="mailto:${email}">${email}</a></div>
          ${phoneSection}
        </div>
  `;
}

/**
 * Returns the full contact details panel template.
 * @param {string} initials - Contact initials.
 * @param {string} name - Contact name.
 * @param {string} email - Contact email.
 * @param {string} phone - Contact phone.
 * @param {string} id - Contact id.
 * @returns {string} Result.
 */
function getContactDetailsTemplate(initials, name, email, phone, id) {
  const phoneSection = getContactDetailsPhoneSection(phone);
  return `
    <div class="contact-details-container">
      <img src="./assets/img/arrow-left-line.svg" alt="Back to contacts" class="contact-back-btn" onclick="document.querySelector('.wrapper').classList.remove('show-contact-details'); return false;">
      ${getContactMoreMenuHTML(id, name, email, phone, initials)}
      ${getContactHeaderLargeHTML(id, name, email, phone, initials)}
      <div class="contact-info">
        ${getContactDetailsInfoHTML(email, phoneSection)}
      </div>
    </div>
    <div id="edit-contact-dialog-container"></div>
  `;
}

/**
 * Returns the form fields for the edit-contact dialog.
 * @param {string} id - Contact id.
 * @param {string} name - Contact name.
 * @param {string} email - Contact email.
 * @param {string} phone - Contact phone.
 * @returns {string} Result.
 */
function getEditContactFormHTML(id, name, email, phone) {
  return `
    <form onsubmit="updateContact(event, '${id}')" id="edit-contact-form" class="ac-form" novalidate>
      <div class="ac-input-wrapper"><div class="ac-field"><input class="input-focus" id="edit-name" type="text" placeholder="Name" value="${name}" required><img src="./assets/icons/person.svg"></div><span class="error-message" id="edit-name-error"></span></div>
      <div class="ac-input-wrapper"><div class="ac-field"><input class="input-focus" id="edit-email" type="email" placeholder="Email" value="${email}" required><img src="./assets/icons/mail.svg"></div><span class="error-message" id="edit-email-error"></span></div>
      <div class="ac-input-wrapper"><div class="ac-field"><input class="input-focus" id="edit-phone" name="phone" type="tel" placeholder="Phone" value="${phone || ""}" required><img src="./assets/img/call.png"></div><span class="error-message" id="edit-phone-error"></span></div>
      <div class="ac-actions">
        <button type="button" class="btn btn-ghost" onclick="closeEditContactDialog(); deleteContact('${id}')" aria-label="Delete contact"><span>Delete</span></button>
        <button type="button" class="btn btn-ghost" data-edit-clear onclick="clearEditContactForm()" aria-label="Clear form"><span>Clear</span></button>
        <button type="submit" class="btn btn-primary" data-edit-submit aria-label="Save contact"><span>Save</span><span class="btn-check" aria-hidden="true"><svg width="18" height="14" viewBox="0 0 18 14"><path d="M1 7l5 5L17 1" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
      </div>
    </form>
  `;
}

/**
 * Returns the hero section for the edit-contact dialog.
 * @returns {string} Result.
 */
function getEditContactDialogHeroHTML() {
  return `
        <div class="ac-hero">
          <div class="ac-brand"><img class="ac-logo" src="./assets/img/join-logo-white.svg" alt="Join Logo"></div>
          <div class="ac-hero-heading">
            <h2 class="ac-title">Edit contact</h2>
            <span class="ac-underline" aria-hidden="true"></span>
          </div>
        </div>
  `;
}

/**
 * Returns the full edit-contact dialog markup.
 * @param {string} id - Contact id.
 * @param {string} name - Contact name.
 * @param {string} email - Contact email.
 * @param {string} phone - Contact phone.
 * @param {string} initials - Contact initials.
 * @returns {string} Result.
 */
function getEditContactDialog(id, name, email, phone, initials) {
  return `
    <dialog id="edit-contact-dialog" class="ac-dialog">
      <div class="ac ac-dialog-content">
        ${getEditContactDialogHeroHTML()}
        <button type="button" class="ac-close" aria-label="Close" onclick="closeEditContactDialog()">×</button>
        <div class="ac-avatar ac-avatar-on-divider ac-avatar-edit-split" aria-label="Avatar placeholder"><div class="contact-avatar-large"><div class="contact-initials-large">${initials}</div></div></div>
        <div class="ac-formwrap">
          ${getEditContactFormHTML(id, name, email, phone)}
        </div>
      </div>
    </dialog>
  `;
}

/**
 * Returns a toast notification for the contacts page.
 * @param {string} message - Toast message.
 * @returns {string} Result.
 */
function getContactsToastTemplate(message) {
  return `<div id="contacts-toast" class="contacts-toast" role="status" aria-live="polite">${message}</div>`;
}
