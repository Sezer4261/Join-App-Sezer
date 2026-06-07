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

let pageScrollLockY = 0;

/** Prevents layout shift when modals open without clipping page content. */
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

/** Restores page scroll after a modal closes. */
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

/**
 * Returns the profile badge initial from the stored session.
 * @param {Object} session - Parsed user session object.
 * @returns {string} Single-character badge label.
 */
function getProfileBadgeInitial(session) {
  if (session.mode === "guest") return "G";
  const label = session.displayName || session.email || "";
  return label.charAt(0).toUpperCase() || "U";
}

/** @returns {void} */
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
