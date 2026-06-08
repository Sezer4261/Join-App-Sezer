/** @file Login page intro logo animation. */

/**
 * Activates intro CSS classes and starts logo alignment when the login page loads.
 * @returns {void}
 */
function initLoginIntroPage() {
  document.documentElement.classList.add("intro-active");
  document.body.classList.add("intro-active");
  initIntroAlignment();
  scheduleIntroOverlayRemoval();
}

window.addEventListener("DOMContentLoaded", initLoginIntroPage);

window.addEventListener("load", () => alignIntroLogo());
window.addEventListener("resize", () => alignIntroLogo());

/**
 * Schedules the first intro logo alignment pass on the next animation frame.
 * @returns {void}
 */
function initIntroAlignment() {
  requestAnimationFrame(() => alignIntroLogo());
}

/**
 * Sets CSS custom properties on the intro overlay for the target logo dimensions.
 * @param {HTMLElement|null} introOverlay - Full-screen intro overlay element, if present.
 * @param {DOMRect} headerRect - Bounding rectangle of the header logo used as the animation target.
 * @returns {void}
 */
function applyLogoOverlaySize(introOverlay, headerRect) {
  if (!introOverlay) return;
  introOverlay.style.setProperty("--logo-target-width", `${headerRect.width}px`);
  introOverlay.style.setProperty("--logo-target-height", `${headerRect.height}px`);
}

/**
 * Computes and applies CSS offset variables so the intro logo animates toward the header logo.
 * @returns {void}
 */
function alignIntroLogo() {
  const introLogo = document.getElementById("intro-logo");
  const headerLogo = document.querySelector(".header-left img");
  if (!introLogo || !headerLogo) return;
  const introRect = introLogo.getBoundingClientRect();
  const headerRect = headerLogo.getBoundingClientRect();
  introLogo.style.setProperty("--logo-dx", `${getCenterDeltaX(introRect, headerRect)}px`);
  introLogo.style.setProperty("--logo-dy", `${getCenterDeltaY(introRect, headerRect)}px`);
  applyLogoOverlaySize(document.getElementById("intro-overlay"), headerRect);
}

/**
 * Computes the horizontal pixel offset needed to center-align the intro logo with the header logo.
 * @param {DOMRect} introRect - Bounding rectangle of the intro splash logo.
 * @param {DOMRect} headerRect - Bounding rectangle of the header logo.
 * @returns {number} Horizontal delta in pixels between the two logo center points.
 */
function getCenterDeltaX(introRect, headerRect) {
  return (headerRect.left + headerRect.width / 2) - (introRect.left + introRect.width / 2);
}

/**
 * Computes the vertical pixel offset needed to center-align the intro logo with the header logo.
 * @param {DOMRect} introRect - Bounding rectangle of the intro splash logo.
 * @param {DOMRect} headerRect - Bounding rectangle of the header logo.
 * @returns {number} Vertical delta in pixels between the two logo center points.
 */
function getCenterDeltaY(introRect, headerRect) {
  return (headerRect.top + headerRect.height / 2) - (introRect.top + introRect.height / 2);
}

/**
 * Schedules removal of the intro overlay after the splash animation completes.
 * @returns {void}
 */
function scheduleIntroOverlayRemoval() {
  setTimeout(() => removeIntroOverlay(), 2000);
}

/**
 * Removes the intro overlay element and deactivates intro-related CSS classes on html and body.
 * @returns {void}
 */
function removeIntroOverlay() {
  document.getElementById("intro-overlay")?.remove();
  document.documentElement.classList.remove("intro-active");
  document.body.classList.remove("intro-active");
}
