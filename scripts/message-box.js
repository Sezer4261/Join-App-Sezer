/** @file Centered status message overlay (success / error). */

/**
 * @param {string} message
 * @param {"success"|"error"} [type]
 * @param {{ iconSrc?: string, iconAlt?: string }} [options]
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

/** @returns {HTMLElement} */
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
 * @param {HTMLElement} box
 * @param {string} message
 * @param {{ iconSrc?: string, iconAlt?: string }} [options]
 */
function setMessageBoxContent(box, message, options = {}) {
  box.innerHTML = "";
  const textEl = document.createElement("span");
  textEl.textContent = message;
  box.appendChild(textEl);
  if (options?.iconSrc) appendMessageIcon(box, options);
}

/**
 * @param {HTMLElement} box
 * @param {{ iconSrc: string, iconAlt?: string }} options
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
 * @param {HTMLElement} box
 * @param {string} type
 */
function setMessageBoxType(box, type) {
  box.className = `msgBox ${type}`;
}

/** @param {HTMLElement} box */
function setMessageBoxBaseStyles(box) {
  box.style.position = "fixed";
  box.style.left = "50%";
  box.style.top = "50%";
  box.style.transform = "translate(-50%, -50%)";
  box.style.zIndex = "9999";
}

/** @param {HTMLElement} box */
function setMessageBoxFlexStyles(box) {
  box.style.display = "flex";
  box.style.alignItems = "center";
  box.style.justifyContent = "center";
  box.style.gap = "10px";
}

/** @param {HTMLElement} box */
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

/** @param {HTMLElement} box */
function setMessageBoxLayoutStyles(box) {
  setMessageBoxFlexStyles(box);
  setMessageBoxSizeStyles(box);
}

/**
 * @param {HTMLElement} box
 * @param {string} type
 */
function setMessageBoxColors(box, type) {
  box.style.background = type === "error" ? "var(--urgent, #ff3d00)" : "var(--sidebar-bg, #2a3647)";
}

/** @param {HTMLElement} box */
function scheduleMessageHide(box) {
  window.clearTimeout(box._hideTimeout);
  box._hideTimeout = window.setTimeout(() => {
    box.style.display = "none";
  }, 1500);
}
