/** @file Shared UI helpers used across pages. */

/** @returns {string} */
function getRandomInitialsColorClass() {
  return INITIALS_COLOR_CLASSES[Math.floor(Math.random() * INITIALS_COLOR_CLASSES.length)];
}

/**
 * @param {number} hiddenCount
 * @returns {string}
 */
function formatHiddenBoardTasksLabel(hiddenCount) {
  if (hiddenCount === 1) return "1 more task";
  return `${hiddenCount} more tasks`;
}

/** Prevents layout shift when modals hide the page scrollbar. */
function lockPageScrollForOverlay() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
  document.documentElement.style.overflow = "hidden";
}

/** Restores page scroll after a modal closes. */
function unlockPageScrollForOverlay() {
  document.body.style.paddingRight = "";
  document.documentElement.style.overflow = "";
}

/**
 * @param {Event} event
 * @returns {void}
 */
function toggleProfileMenu(event) {
  event.stopPropagation();
  document.getElementById("profile-menu")?.classList.toggle("active");
}

document.addEventListener("click", (event) => {
  const menu = document.getElementById("profile-menu");
  const profileContainer = document.querySelector(".user-profile-container");
  if (menu && profileContainer && !profileContainer.contains(event.target)) {
    menu.classList.remove("active");
  }
});
