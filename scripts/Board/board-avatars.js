/** @file Assigned contact avatar rendering on board. */

/**
 * Renders avatar stacks for every task currently visible after search filtering.
 * @returns {void}
 */
function renderAllAvatars() {
  const filteredTasks = getFilteredTasks();
  for (let i = 0; i < filteredTasks.length; i++) {
    renderAvatar(filteredTasks[i]);
  }
}

/**
 * Appends up to maxVisible contact avatar circles into the given container.
 * @param {HTMLElement} container - Task card avatar wrapper element.
 * @param {string[]} contacts - Assigned contact display names.
 * @param {number} maxVisible - Maximum number of individual avatars to show.
 * @returns {void}
 */
function appendVisibleAvatars(container, contacts, maxVisible) {
    const visible = contacts.slice(0, maxVisible);
    for (let i = 0; i < visible.length; i++) {
        if (!visible[i]) continue;
        container.innerHTML += getAvatarMarkup(getContactInitialsFromName(visible[i]), getRandomColor());
    }
}

/**
 * Builds the avatar stack for a single task card, including a +N overflow badge.
 * @param {Object} task - Task whose contacts determine the avatar display.
 * @returns {void}
 */
function renderAvatar(task) {
    const container = document.getElementById(`avatars-${task.id}`);
    if (!container) return;
    container.innerHTML = "";
    const contacts = Array.isArray(task.contacts) ? task.contacts : [];
    const maxVisible = 3;
    appendVisibleAvatars(container, contacts, maxVisible);
    if (contacts.length > maxVisible)
        container.innerHTML += getAvatarMarkup(`+${contacts.length - maxVisible}`, "#2a3647", true);
}

/**
 * Picks a random background color from the shared avatar palette.
 * @returns {string} Hex color string for an avatar circle.
 */
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}
