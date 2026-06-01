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
/**
 * Closes all dropdowns except the given one, then toggles it.
 * @param {HTMLElement|null} dropdown - Target dropdown element.
 * @returns {void} Result.
 */
function toggleOrFallbackDropdown(dropdown) {
  if (dropdown) { dropdown.classList.toggle("show"); return; }
  document.getElementById("dropdown-contacts")?.classList.toggle("show");
}

/**
 * Resolves the scroll container that should stay stable while toggling a dropdown.
 * @param {HTMLElement|null} select - Dropdown trigger element.
 * @returns {HTMLElement|null} Result.
 */
function getDropdownScrollContainer(select) {
  if (!select) return null;
  if (select.closest('.edit-task-form') && window.matchMedia('(max-width: 320px)').matches) {
    return select.closest('.modal-content');
  }

  let current = select.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }

  return document.scrollingElement || document.documentElement;
}

/**
 * Returns the visible vertical bounds of the given scroll container.
 * @param {HTMLElement|null} scrollContainer - Scroll container element.
 * @returns {{top:number,bottom:number}} Result.
 */
function getScrollContainerViewport(scrollContainer) {
  const root = document.scrollingElement || document.documentElement;
  if (!scrollContainer || scrollContainer === root || scrollContainer === document.documentElement || scrollContainer === document.body) {
    return { top: 0, bottom: window.innerHeight };
  }
  const rect = scrollContainer.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom };
}

/**
 * Keeps the mobile board edit dropdown within the visible scroll area.
 * @param {HTMLElement|null} select - Dropdown trigger element.
 * @param {HTMLElement|null} dropdown - Dropdown panel element.
 * @param {HTMLElement|null} scrollContainer - Scroll container element.
 * @returns {void} Result.
 */
function keepMobileEditDropdownVisible(select, dropdown, scrollContainer) {
  if (!select || !dropdown || !scrollContainer) return;
  if (!dropdown.classList.contains('show')) return;
  if (!select.closest('.edit-task-form') || !window.matchMedia('(max-width: 320px)').matches) return;

  const viewport = getScrollContainerViewport(scrollContainer);
  const selectRect = select.getBoundingClientRect();
  const dropdownRect = dropdown.getBoundingClientRect();
  const topPadding = 12;
  const bottomPadding = 12;
  let delta = 0;

  if (selectRect.top < viewport.top + topPadding) {
    delta += selectRect.top - (viewport.top + topPadding);
  }

  const overflowBelow = dropdownRect.bottom - (viewport.bottom - bottomPadding);
  if (overflowBelow > 0) {
    delta += overflowBelow;
  }

  if (delta !== 0) {
    scrollContainer.scrollTop += delta;
  }
}

/**
 * Toggles the contacts dropdown for the clicked custom-select trigger.
 * Closes all other open dropdowns first.
 * @param {Event} event - Browser event.
 * @returns {void} Result.
 */
function toggleDropdown(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  
  const trigger = event?.currentTarget || event?.target;
  const select = trigger?.closest?.(".custom-select") ?? null;
  
  if (!select) {
    console.warn("toggleDropdown: Could not find .custom-select element", { trigger });
    return;
  }
  
  const dropdown = select.querySelector(".dropdown-content");
  if (!dropdown) {
    console.warn("toggleDropdown: Could not find .dropdown-content element", { select });
    return;
  }
  
  const scrollContainer = getDropdownScrollContainer(select);
  const previousScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
  document.querySelectorAll(".dropdown-content.show").forEach(d => { if (d !== dropdown) d.classList.remove("show"); });
  toggleOrFallbackDropdown(dropdown);

  if (!scrollContainer) return;
  requestAnimationFrame(() => {
    scrollContainer.scrollTop = previousScrollTop;
    keepMobileEditDropdownVisible(select, dropdown, scrollContainer);
  });
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
/**
 * Handles outside clicks to close add task dropdowns.
 * @param {Event} event - Click event.
 * @returns {void} Result.
 */
function handleAddDropdownOutsideClick(event) {
  const target = event.target;
  const clickedInside =
    document.getElementById("select-contacts")?.contains(target) ||
    document.getElementById("dropdown-contacts")?.contains(target) ||
    document.getElementById("category-select")?.contains(target) ||
    document.getElementById("category-dropdown")?.contains(target);
  if (!clickedInside) closeAddDropdowns();
}

function initAddDropdownClose() {
  if (window.addDropdownHandlerAdded) return;
  window.addDropdownHandlerAdded = true;
  document.addEventListener("click", handleAddDropdownOutsideClick, true);
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
/**
 * Computes a deterministic hash index for the contact key.
 * @param {string} key - Normalized contact key.
 * @returns {number} Result.
 */
function computeContactHash(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 2147483647;
  return hash;
}

function getContactColorClass(name) {
  const classes = ['bg-blue','bg-green','bg-purple','bg-orange','bg-pink','bg-red','bg-teal','bg-brown'];
  const key = String(name || '').trim().toLowerCase();
  const index = key ? Math.abs(computeContactHash(key)) % classes.length : 0;
  return classes[index];
}
