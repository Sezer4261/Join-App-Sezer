/** @file Contact dropdown and assigned contacts for add-task. */

/**
 * Renders the contacts dropdown with all available contacts.
 * @returns {void} Nothing is returned after the dropdown content is rebuilt.
 */
function selectContacts() {
  let select = document.getElementById('dropdown-contacts');
  select.innerHTML = generateAssignedContacts(contacts);
}

/**
 * Closes all dropdowns except the given one, then toggles it.
 * @param {HTMLElement|null} dropdown - Dropdown panel to toggle, or null to fall back to the contacts dropdown.
 * @returns {void} Nothing is returned after the target dropdown visibility is toggled.
 */
function toggleOrFallbackDropdown(dropdown) {
  if (dropdown) { dropdown.classList.toggle("show"); return; }
  document.getElementById("dropdown-contacts")?.classList.toggle("show");
}

/**
 * Returns whether the select trigger belongs to the mobile edit-task form.
 * @param {HTMLElement} select - Custom-select element that opens the dropdown.
 * @returns {boolean} True when the select is inside the edit-task form on a narrow viewport, otherwise false.
 */
function isMobileEditTaskSelect(select) {
  return select.closest('.edit-task-form') && window.matchMedia('(max-width: 320px)').matches;
}

/**
 * Walks up the DOM to find the nearest scrollable ancestor.
 * @param {HTMLElement|null} start - Element from which the upward search begins.
 * @returns {HTMLElement|null} First ancestor with vertical scrolling enabled, or null when none is found.
 */
function findScrollableParent(start) {
  let current = start;
  while (current) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Resolves the scroll container that should stay stable while toggling a dropdown.
 * @param {HTMLElement|null} select - Custom-select element that opens the dropdown.
 * @returns {HTMLElement|null} Scroll container element used to preserve scroll position during toggle.
 */
function getDropdownScrollContainer(select) {
  if (!select) return null;
  if (isMobileEditTaskSelect(select)) return select.closest('.modal-content');
  return findScrollableParent(select.parentElement) || document.scrollingElement || document.documentElement;
}

/**
 * Returns the visible vertical bounds of the given scroll container.
 * @param {HTMLElement|null} scrollContainer - Scrollable element whose viewport is measured.
 * @returns {{top: number, bottom: number}} Top and bottom Y coordinates of the visible scroll area.
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
 * Resets edit-task dropdown positioning styles when the panel is closed.
 * @param {HTMLElement} dropdown - Dropdown panel whose positioning classes and styles are cleared.
 * @returns {void} Nothing is returned after the dropdown layout state is reset.
 */
function resetEditTaskDropdownPosition(dropdown) {
  dropdown.classList.remove('open-up');
  dropdown.style.maxHeight = '';
}

/**
 * Applies open-up direction and max-height to the edit-task dropdown.
 * @param {HTMLElement} select - Custom-select trigger that anchors the dropdown.
 * @param {HTMLElement} dropdown - Dropdown panel whose direction and height are adjusted.
 * @returns {void} Nothing is returned after the dropdown layout is calculated and applied.
 */
function applyEditTaskDropdownLayout(select, dropdown) {
  const modalContent = select.closest('.modal-content') || select.closest('#task-modal') || document.body;
  const modalRect = modalContent.getBoundingClientRect();
  const selectRect = select.getBoundingClientRect();
  const gap = 6;
  const padding = 12;
  const availableBelow = modalRect.bottom - (selectRect.bottom + gap) - padding;
  const availableAbove = (selectRect.top - gap) - modalRect.top - padding;
  const shouldOpenUp = availableBelow < 140 && availableAbove > availableBelow;
  dropdown.classList.toggle('open-up', shouldOpenUp);
  const available = Math.max(80, Math.floor(shouldOpenUp ? availableAbove : availableBelow));
  dropdown.style.maxHeight = `${Math.min(180, available)}px`;
}

/**
 * Positions the edit-task dropdown so it stays inside the modal.
 * @param {HTMLElement|null} select - Custom-select trigger that anchors the dropdown.
 * @param {HTMLElement|null} dropdown - Dropdown panel to position or reset.
 * @returns {void} Nothing is returned after the dropdown is positioned or reset.
 */
function positionEditTaskDropdown(select, dropdown) {
  if (!select || !dropdown) return;
  if (!select.closest('.edit-task-form')) return;
  if (!dropdown.classList.contains('show')) { resetEditTaskDropdownPosition(dropdown); return; }
  applyEditTaskDropdownLayout(select, dropdown);
}

/**
 * Computes scroll delta needed to keep the select trigger visible in the viewport.
 * @param {DOMRect} selectRect - Bounding rectangle of the dropdown trigger element.
 * @param {{top: number, bottom: number}} viewport - Visible top and bottom bounds of the scroll container.
 * @param {number} topPadding - Minimum padding in pixels between the trigger and the top of the viewport.
 * @returns {number} Number of pixels to add to scrollTop, or zero when no adjustment is needed.
 */
function computeSelectScrollDelta(selectRect, viewport, topPadding) {
  if (selectRect.top < viewport.top + topPadding) {
    return selectRect.top - (viewport.top + topPadding);
  }
  return 0;
}

/**
 * Keeps the mobile board edit dropdown within the visible scroll area.
 * @param {HTMLElement|null} select - Custom-select trigger that opened the dropdown.
 * @param {HTMLElement|null} dropdown - Dropdown panel that may need repositioning or scrolling into view.
 * @param {HTMLElement|null} scrollContainer - Scrollable ancestor that should remain stable while adjusting visibility.
 * @returns {void} Nothing is returned after the dropdown is scrolled or repositioned as needed.
 */
function keepMobileEditDropdownVisible(select, dropdown, scrollContainer) {
  if (!select || !dropdown || !scrollContainer || !dropdown.classList.contains('show')) return;
  if (!isMobileEditTaskSelect(select)) return;
  const viewport = getScrollContainerViewport(scrollContainer);
  const selectRect = select.getBoundingClientRect();
  const dropdownRect = dropdown.getBoundingClientRect();
  const delta = computeSelectScrollDelta(selectRect, viewport, 12);
  const overflowBelow = dropdownRect.bottom - (viewport.bottom - 12);
  if (overflowBelow > 0) { positionEditTaskDropdown(select, dropdown); return; }
  if (delta !== 0) scrollContainer.scrollTop += delta;
}

/**
 * Resolves custom-select and dropdown elements from a toggle event.
 * @param {Event|null} event - Browser event that triggered the dropdown toggle.
 * @returns {{select: HTMLElement|null, dropdown: HTMLElement|null, trigger: *}} Matched select trigger, dropdown panel, and original event target.
 */
function resolveToggleDropdownElements(event) {
  const trigger = event?.currentTarget || event?.target;
  const select = trigger?.closest?.(".custom-select") ?? null;
  const dropdown = select?.querySelector(".dropdown-content") ?? null;
  return { select, dropdown, trigger };
}

/**
 * Closes all open dropdown panels except the given one.
 * @param {HTMLElement} dropdown - Dropdown panel that should remain open while others close.
 * @returns {void} Nothing is returned after all other open dropdowns are hidden.
 */
function closeOtherDropdowns(dropdown) {
  document.querySelectorAll(".dropdown-content.show").forEach((d) => {
    if (d !== dropdown) d.classList.remove("show");
  });
}

/**
 * Restores scroll position and repositions the dropdown after toggle.
 * @param {HTMLElement} select - Custom-select trigger that was toggled.
 * @param {HTMLElement} dropdown - Dropdown panel whose position may need adjustment.
 * @param {HTMLElement} scrollContainer - Scrollable ancestor whose scrollTop should be restored.
 * @param {number} previousScrollTop - Scroll position captured before the dropdown was toggled.
 * @returns {void} Nothing is returned after the scroll position and dropdown layout are restored.
 */
function restoreDropdownAfterToggle(select, dropdown, scrollContainer, previousScrollTop) {
  requestAnimationFrame(() => {
    scrollContainer.scrollTop = previousScrollTop;
    positionEditTaskDropdown(select, dropdown);
    keepMobileEditDropdownVisible(select, dropdown, scrollContainer);
  });
}

/**
 * Toggles the contacts dropdown for the clicked custom-select trigger.
 * @param {Event} event - Browser event from the dropdown trigger interaction.
 * @returns {void} Nothing is returned after the dropdown is toggled and scroll position is preserved.
 */
function toggleDropdown(event) {
  if (event) { event.stopPropagation(); event.preventDefault(); }
  const { select, dropdown, trigger } = resolveToggleDropdownElements(event);
  if (!select) { console.warn("toggleDropdown: Could not find .custom-select element", { trigger }); return; }
  if (!dropdown) { console.warn("toggleDropdown: Could not find .dropdown-content element", { select }); return; }
  const scrollContainer = getDropdownScrollContainer(select);
  const previousScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
  closeOtherDropdowns(dropdown);
  toggleOrFallbackDropdown(dropdown);
  if (scrollContainer) restoreDropdownAfterToggle(select, dropdown, scrollContainer, previousScrollTop);
}

/**
 * Toggles the add-task category dropdown and closes the contacts dropdown.
 * @param {Event} event - Browser event from the category dropdown trigger.
 * @returns {void} Nothing is returned after the category dropdown visibility is toggled.
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
 * Sets the add-task category value and updates the related UI state.
 * @param {string} value - Category name selected from the dropdown.
 * @returns {void} Nothing is returned after the category value, label, and button state are updated.
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
 * Updates the visible label on the category select.
 * @param {HTMLElement} select - Category custom-select element whose label text is updated.
 * @param {string} value - Selected category name shown in the trigger label.
 * @returns {void} Nothing is returned after the visible category label is refreshed.
 */
function updateAddCategoryLabel(select, value) {
  const label = select.querySelector("span");
  if (label) {
    label.childNodes[0].textContent = value + " ";
  }
}

/**
 * Closes the add-task category dropdown panel.
 * @returns {void} Nothing is returned after the category dropdown is hidden.
 */
function closeAddCategoryDropdown() {
  const dropdown = document.getElementById("category-dropdown");
  if (dropdown) dropdown.classList.remove("show");
}

/**
 * Handles outside clicks to close add-task dropdown panels.
 * @param {Event} event - Document click event that may have occurred outside the dropdowns.
 * @returns {void} Nothing is returned after open dropdowns are closed when the click is outside.
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

/**
 * Registers a document click handler to close add-task dropdowns on outside click.
 * @returns {void} Nothing is returned after the global outside-click listener is registered once.
 */
function initAddDropdownClose() {
  if (window.addDropdownHandlerAdded) return;
  window.addDropdownHandlerAdded = true;
  document.addEventListener("click", handleAddDropdownOutsideClick, true);
}

/**
 * Closes all add-task dropdown panels.
 * @returns {void} Nothing is returned after the contacts and category dropdowns are hidden.
 */
function closeAddDropdowns() {
  const contactsDropdown = document.getElementById("dropdown-contacts");
  if (contactsDropdown) contactsDropdown.classList.remove("show");
  const categoryDropdown = document.getElementById("category-dropdown");
  if (categoryDropdown) categoryDropdown.classList.remove("show");
}

/**
 * Toggles a contact in the selected contacts list.
 * @param {string} name - Display name of the contact being selected or deselected.
 * @param {HTMLInputElement} checkbox - Checkbox element that reflects the contact selection state.
 * @returns {void} Nothing is returned after the selection list and avatars are updated.
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
 * Updates the assigned-to label visibility based on selected contacts.
 * @param {HTMLElement|null} assignedBlock - Assigned-to label wrapper that shows or hides avatar spacing.
 * @returns {void} Nothing is returned after the has-avatars class is toggled.
 */
function updateAssignedAvatarsVisibility(assignedBlock) {
  if (assignedBlock) assignedBlock.classList.toggle('has-avatars', selectedContacts.length > 0);
}

/**
 * Renders selected contact avatars in the assigned-to area.
 * @returns {void} Nothing is returned after the avatar container is rebuilt.
 */
function renderSelectedAvatars() {
  const container = document.getElementById("selected-avatars");
  updateAssignedAvatarsVisibility(document.querySelector('.assigned-to-label'));
  container.innerHTML = "";
  const maxVisible = 4;
  const total = selectedContacts.length;
  selectedContacts.slice(0, maxVisible).forEach((name) => appendSelectedAvatar(container, name));
  if (total > maxVisible) container.innerHTML += getSelectedAvatarMoreMarkup(total - maxVisible);
}

/**
 * Appends a single selected contact avatar to the container.
 * @param {HTMLElement} container - Avatar container that receives the new avatar markup.
 * @param {string} name - Display name of the contact whose avatar is rendered.
 * @returns {void} Nothing is returned after the avatar HTML is appended.
 */
function appendSelectedAvatar(container, name) {
  const initials = getContactInitialsFromName(name);
  const colorClass = getContactColorClass(name);
  container.innerHTML += getSelectedAvatarMarkup(initials, colorClass);
}

/**
 * Computes a deterministic hash index for the contact key.
 * @param {string} key - Normalized contact name used as the hash input.
 * @returns {number} Non-negative hash value derived from the contact key.
 */
function computeContactHash(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 2147483647;
  return hash;
}

/**
 * Returns a deterministic color class for a contact name.
 * @param {string} name - Display name used to pick a stable avatar color.
 * @returns {string} CSS class name from INITIALS_COLOR_CLASSES assigned to the contact.
 */
function getContactColorClass(name) {
  const key = String(name || '').trim().toLowerCase();
  const index = key ? Math.abs(computeContactHash(key)) % INITIALS_COLOR_CLASSES.length : 0;
  return INITIALS_COLOR_CLASSES[index];
}
