/**
 * Executes select contacts logic.
 * @returns {void} Result.
 */
function selectContacts() {
  let select = document.getElementById('dropdown-contacts');
  select.innerHTML = generateAssignedContacts(contacts);
}

/**
 * Toggles dropdown.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function toggleDropdown(event) {
  if (event) {
    event.stopPropagation();
  }
  const trigger = event?.currentTarget || event?.target;
  const select = trigger?.closest?.(".custom-select");
  const dropdown = select?.querySelector?.(".dropdown-content");

  const allDropdowns = document.querySelectorAll(".dropdown-content.show");
  allDropdowns.forEach((d) => {
    if (d !== dropdown) {
      d.classList.remove("show");
    }
  });

  if (dropdown) {
    dropdown.classList.toggle("show");
    return;
  }
  const fallback = document.getElementById("dropdown-contacts");
  if (fallback) {
    fallback.classList.toggle("show");
  }
}

/**
 * Toggles add category dropdown.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function toggleAddCategoryDropdown(event) {
  event.stopPropagation();
  const contactsDropdown = document.getElementById("dropdown-contacts");
  if (contactsDropdown) contactsDropdown.classList.remove("show");

  const dropdown = document.getElementById("category-dropdown");
  if (!dropdown) return;
  dropdown.classList.toggle("show");
}

/**
 * Sets add category.
 * @param {string} value - Value.
 * @returns {void} Result.
 */
function setAddCategory(value) {
  const input = document.getElementById("category");
  const select = document.getElementById("category-select");
  if (!input || !select) return;
  input.value = value;
  input.classList.remove('input-error');
  select.classList.remove('input-error');
  setErrorText('category-error', '');
  updateAddCategoryLabel(select, value);
  closeAddCategoryDropdown();
  updateCreateButtonState();
}

/**
 * Updates add category label.
 * @param {HTMLElement} select - Select element.
 * @param {string} value - Value.
 * @returns {void} Result.
 */
function updateAddCategoryLabel(select, value) {
  const label = select.querySelector("span");
  if (label) {
    label.childNodes[0].textContent = value + " ";
  }
}

/**
 * Closes add category dropdown.
 * @returns {void} Result.
 */
function closeAddCategoryDropdown() {
  const dropdown = document.getElementById("category-dropdown");
  if (dropdown) dropdown.classList.remove("show");
}

/**
 * Initializes add dropdown close.
 * @returns {void} Result.
 */
function initAddDropdownClose() {
  if (window.addDropdownHandlerAdded) return;
  window.addDropdownHandlerAdded = true;
  document.addEventListener(
    "click",
    (event) => {
      const selectContacts = document.getElementById("select-contacts");
      const contactsDropdown = document.getElementById("dropdown-contacts");
      const categorySelect = document.getElementById("category-select");
      const categoryDropdown = document.getElementById("category-dropdown");

      const target = event.target;
      const clickedInside =
        (selectContacts && selectContacts.contains(target)) ||
        (contactsDropdown && contactsDropdown.contains(target)) ||
        (categorySelect && categorySelect.contains(target)) ||
        (categoryDropdown && categoryDropdown.contains(target));

      if (clickedInside) return;
      closeAddDropdowns();
    },
    true
  );
}

/**
 * Closes add dropdowns.
 * @returns {void} Result.
 */
function closeAddDropdowns() {
  const contactsDropdown = document.getElementById("dropdown-contacts");
  if (contactsDropdown) contactsDropdown.classList.remove("show");
  const categoryDropdown = document.getElementById("category-dropdown");
  if (categoryDropdown) categoryDropdown.classList.remove("show");
}

/**
 * Toggles contact selection.
 * @param {string} name - Name.
 * @param {HTMLInputElement} checkbox - Checkbox element.
 * @returns {void} Result.
 */
function toggleContactSelection(name, checkbox) {
  if (checkbox.checked) {
    selectedContacts.push(name);
  } else {
    selectedContacts = selectedContacts.filter(c => c !== name);
  }
  renderSelectedAvatars();
}

/**
 * Renders selected avatars.
 * @returns {void} Result.
 */
function renderSelectedAvatars() {
  const container = document.getElementById("selected-avatars");
  const assignedBlock = document.querySelector('.assigned-to-label');
  if (assignedBlock) {
    assignedBlock.classList.toggle('has-avatars', selectedContacts.length > 0);
  }
  container.innerHTML = "";
  const maxVisible = 4;
  const total = selectedContacts.length;
  const visible = selectedContacts.slice(0, maxVisible);
  visible.forEach(name => appendSelectedAvatar(container, name));
  if (total > maxVisible) {
    container.innerHTML += getSelectedAvatarMoreMarkup(total - maxVisible);
  }
}

/**
 * Executes append selected avatar logic.
 * @param {HTMLElement} container - Container element.
 * @param {string} name - Name.
 * @returns {void} Result.
 */
function appendSelectedAvatar(container, name) {
  const initials = getContactInitialsFromName(name);
  const colorClass = getContactColorClass(name);
  container.innerHTML += getSelectedAvatarMarkup(initials, colorClass);
}

/**
 * Returns contact color class based on name.
 * @param {string} name - Contact name.
 * @returns {string} Result.
 */
function getContactColorClass(name) {
  const classes = [
    'bg-blue',
    'bg-green',
    'bg-purple',
    'bg-orange',
    'bg-pink',
    'bg-red',
    'bg-teal',
    'bg-brown'
  ];
  const key = String(name || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 2147483647;
  }
  const index = key ? Math.abs(hash) % classes.length : 0;
  return classes[index];
}
