/** @file Centered status message overlay (success / error). */

/**
 * Shows a centered status message overlay with the given style and optional icon.
 * @param {string} message - User-facing text displayed in the overlay.
 * @param {"success"|"error"} [type] - Visual style that controls background color and CSS class.
 * @param {{ iconSrc?: string, iconAlt?: string }} [options] - Optional icon image source and alt text.
 * @returns {void}
 */
function showMessage(message, type = "success", options = {}) {
  const box = getOrCreateMessageBox();
  setMessageBoxContent(box, message, options);
  setMessageBoxType(box, type);
  setMessageBoxBaseStyles(box);
  setMessageBoxLayoutStyles(box);
  setMessageBoxColors(box, type);
  scheduleMessageHide(box);
}

/**
 * Returns the existing message box overlay or creates and appends a new one to the document body.
 * @returns {HTMLElement} The overlay element used to display status messages.
 */
function getOrCreateMessageBox() {
  let box = document.getElementById("msg-box");
  if (!box) {
    box = document.createElement("div");
    box.id = "msg-box";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }
  return box;
}

/**
 * Clears the message box and sets its text content, optionally appending an icon.
 * @param {HTMLElement} box - Overlay element whose content will be updated.
 * @param {string} message - User-facing text displayed in the overlay.
 * @param {{ iconSrc?: string, iconAlt?: string }} [options] - Optional icon image source and alt text.
 * @returns {void}
 */
function setMessageBoxContent(box, message, options = {}) {
  box.innerHTML = "";
  const textEl = document.createElement("span");
  textEl.textContent = message;
  box.appendChild(textEl);
  if (options?.iconSrc) appendMessageIcon(box, options);
}

/**
 * Appends an icon image to the right of the message box text.
 * @param {HTMLElement} box - Overlay element that will receive the icon.
 * @param {{ iconSrc: string, iconAlt?: string }} options - Icon image URL and optional accessibility label.
 * @returns {void}
 */
function appendMessageIcon(box, options) {
  const iconEl = document.createElement("img");
  iconEl.src = options.iconSrc;
  iconEl.alt = options.iconAlt || "";
  iconEl.style.width = "24px";
  iconEl.style.height = "24px";
  iconEl.style.flex = "0 0 auto";
  box.appendChild(iconEl);
}

/**
 * Applies the CSS class that reflects the message type (success or error).
 * @param {HTMLElement} box - Overlay element whose class name will be updated.
 * @param {string} type - Message category used to pick the CSS modifier class.
 * @returns {void}
 */
function setMessageBoxType(box, type) {
  box.className = `msgBox ${type}`;
}

/**
 * Positions the message box fixed at the center of the viewport with a high z-index.
 * @param {HTMLElement} box - Overlay element whose positioning styles will be applied.
 * @returns {void}
 */
function setMessageBoxBaseStyles(box) {
  box.style.position = "fixed";
  box.style.left = "50%";
  box.style.top = "50%";
  box.style.transform = "translate(-50%, -50%)";
  box.style.zIndex = "9999";
}

/**
 * Applies flexbox alignment styles so icon and text are centered within the overlay.
 * @param {HTMLElement} box - Overlay element whose flex layout styles will be applied.
 * @returns {void}
 */
function setMessageBoxFlexStyles(box) {
  box.style.display = "flex";
  box.style.alignItems = "center";
  box.style.justifyContent = "center";
  box.style.gap = "10px";
}

/**
 * Applies width, padding, typography, and shadow styles to the message box.
 * @param {HTMLElement} box - Overlay element whose size and typography styles will be applied.
 * @returns {void}
 */
function setMessageBoxSizeStyles(box) {
  box.style.minWidth = "280px";
  box.style.maxWidth = "min(520px, calc(100vw - 32px))";
  box.style.padding = "18px 22px";
  box.style.borderRadius = "18px";
  box.style.color = "#fff";
  box.style.fontSize = "18px";
  box.style.fontWeight = "400";
  box.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.22)";
  box.style.pointerEvents = "none";
}

/**
 * Applies both flex layout and size/typography styles to the message box.
 * @param {HTMLElement} box - Overlay element that receives the combined layout styles.
 * @returns {void}
 */
function setMessageBoxLayoutStyles(box) {
  setMessageBoxFlexStyles(box);
  setMessageBoxSizeStyles(box);
}

/**
 * Sets the overlay background color based on whether the message is a success or error.
 * @param {HTMLElement} box - Overlay element whose background color will be updated.
 * @param {string} type - Message category that determines which theme color is used.
 * @returns {void}
 */
function setMessageBoxColors(box, type) {
  box.style.background = type === "error" ? "var(--urgent, #ff3d00)" : "var(--sidebar-bg, #2a3647)";
}

/**
 * Schedules the message box to hide after a short delay, clearing any previous hide timer.
 * @param {HTMLElement} box - Overlay element that will be hidden after the delay.
 * @returns {void}
 */
function scheduleMessageHide(box) {
  window.clearTimeout(box._hideTimeout);
  box._hideTimeout = window.setTimeout(() => {
    box.style.display = "none";
  }, 1500);
}
