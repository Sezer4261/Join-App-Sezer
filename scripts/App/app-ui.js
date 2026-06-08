/** @file Shared UI helpers used across pages. */

/**
 * Picks a random color class from the shared initials palette for contact badges.
 * @returns {string} CSS class name applied to initials avatar elements.
 */
function getRandomInitialsColorClass() {
  return INITIALS_COLOR_CLASSES[Math.floor(Math.random() * INITIALS_COLOR_CLASSES.length)];
}

/**
 * Builds the compact-view label shown when additional board tasks are hidden.
 * @param {number} hiddenCount - Number of tasks not currently visible in the column.
 * @returns {string} Singular or plural label such as "1 more task" or "3 more tasks".
 */
function formatHiddenBoardTasksLabel(hiddenCount) {
  if (hiddenCount === 1) return "1 more task";
  return `${hiddenCount} more tasks`;
}

let pageScrollLockY = 0;

/**
 * Locks page scrolling while an overlay is open to prevent layout shift from the scrollbar disappearing.
 * @returns {void}
 */
function lockPageScrollForOverlay() {
  pageScrollLockY = window.scrollY;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${pageScrollLockY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

/**
 * Restores normal page scrolling and the previous scroll position after an overlay closes.
 * @returns {void}
 */
function unlockPageScrollForOverlay() {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, pageScrollLockY);
}

/**
 * Toggles the profile dropdown menu open or closed when the profile trigger is clicked.
 * @param {Event} event - Click event from the profile trigger button.
 * @returns {void}
 */
function toggleProfileMenu(event) {
  event.stopPropagation();
  document.getElementById("profile-menu")?.classList.toggle("active");
}

/**
 * Closes the profile dropdown when the user clicks outside the profile container.
 * @param {Event} event - Click event bubbled from anywhere on the document.
 * @returns {void}
 */
function handleDocumentClickCloseProfileMenu(event) {
  const menu = document.getElementById("profile-menu");
  const profileContainer = document.querySelector(".user-profile-container");
  if (menu && profileContainer && !profileContainer.contains(event.target)) {
    menu.classList.remove("active");
  }
}

document.addEventListener("click", handleDocumentClickCloseProfileMenu);

/**
 * Derives the single-character label shown in the profile badge from the stored session.
 * @param {Object} session - Parsed user session object from localStorage.
 * @returns {string} Uppercase initial letter, "G" for guests, or "U" as fallback.
 */
function getProfileBadgeInitial(session) {
  if (session.mode === "guest") return "G";
  const label = session.displayName || session.email || "";
  return label.charAt(0).toUpperCase() || "U";
}

/**
 * Reads the stored session and sets the profile badge text on page load.
 * @returns {void}
 */
function initUserProfileBadge() {
  const el = document.getElementById("user-profile");
  if (!el) return;
  try {
    const session = JSON.parse(localStorage.getItem("user") || "null");
    if (!session) return;
    el.textContent = getProfileBadgeInitial(session);
  } catch (_) {
    /* ignore invalid session JSON */
  }
}

document.addEventListener("DOMContentLoaded", initUserProfileBadge);
