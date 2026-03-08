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
function renderAvatar(task) {
  let container = document.getElementById(`avatars-${task.id}`);
  if (!container) return;
  container.innerHTML = "";
  let contacts = Array.isArray(task.contacts) ? task.contacts : [];
  const maxVisible = 3;
  const visible = contacts.slice(0, maxVisible);
  for (let i = 0; i < visible.length; i++) {
    const name = visible[i];
    if (!name) continue;
    const initials = getContactInitialsFromName(name);
    container.innerHTML += getAvatarMarkup(initials, getRandomColor());
  }
  if (contacts.length > maxVisible) {
    container.innerHTML += getAvatarMarkup(`+${contacts.length - maxVisible}`, "#2a3647", true);
  }
}

/**
 * Returns random color.
 * @returns {*} Result.
 */
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}
