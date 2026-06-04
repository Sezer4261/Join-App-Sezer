/** @file Login page intro logo animation. */

window.addEventListener("DOMContentLoaded", () => {
  initIntroAlignment();
  scheduleIntroOverlayRemoval();
});

window.addEventListener("load", () => alignIntroLogo());
window.addEventListener("resize", () => alignIntroLogo());

function initIntroAlignment() {
  requestAnimationFrame(() => alignIntroLogo());
}

/**
 * @param {HTMLElement|null} introOverlay
 * @param {DOMRect} headerRect
 */
function applyLogoOverlaySize(introOverlay, headerRect) {
  if (!introOverlay) return;
  introOverlay.style.setProperty("--logo-target-width", `${headerRect.width}px`);
  introOverlay.style.setProperty("--logo-target-height", `${headerRect.height}px`);
}

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
 * @param {DOMRect} introRect
 * @param {DOMRect} headerRect
 */
function getCenterDeltaX(introRect, headerRect) {
  return (headerRect.left + headerRect.width / 2) - (introRect.left + introRect.width / 2);
}

/**
 * @param {DOMRect} introRect
 * @param {DOMRect} headerRect
 */
function getCenterDeltaY(introRect, headerRect) {
  return (headerRect.top + headerRect.height / 2) - (introRect.top + introRect.height / 2);
}

function scheduleIntroOverlayRemoval() {
  setTimeout(() => removeIntroOverlay(), 2000);
}

function removeIntroOverlay() {
  document.getElementById("intro-overlay")?.remove();
}
