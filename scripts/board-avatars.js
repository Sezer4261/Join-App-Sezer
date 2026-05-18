/**
 * Renders all avatars.
 * @returns {void} Result.
 */
function renderAllAvatars() {
  const filteredTasks = getFilteredTasks();
  for (let i = 0; i < filteredTasks.length; i++) {
    renderAvatar(filteredTasks[i]);
  }
}

/**
 * Renders avatar.
 * @param {Object} task - Task object.
 * @returns {void} Result.
 */
/**
 * Appends avatar elements for visible contacts.
 * @param {HTMLElement} container - Avatar container.
 * @param {string[]} contacts - Contact names.
 * @param {number} maxVisible - Max avatars to show.
 * @returns {void} Result.
 */
function appendVisibleAvatars(container, contacts, maxVisible) {
    const visible = contacts.slice(0, maxVisible);
    for (let i = 0; i < visible.length; i++) {
        if (!visible[i]) continue;
        container.innerHTML += getAvatarMarkup(getContactInitialsFromName(visible[i]), getRandomColor());
    }
}

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
 * Returns random color.
 * @returns {*} Result.
 */
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}
