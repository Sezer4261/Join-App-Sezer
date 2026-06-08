/** @file Summary page welcome greeting and mobile overlay. */

/**
 * Navigates the browser to the kanban board page.
 * @returns {void}
 */
function navigateToBoard() {
    window.location.href = "board.html";
}

/**
 * Sets the text content of a DOM element identified by its id when the element exists.
 * @param {string} id - DOM id of the element whose text content will be updated.
 * @param {string} value - Text to assign to the element's textContent property.
 * @returns {void}
 */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/**
 * Returns a time-of-day greeting string based on the current local hour.
 * @param {boolean} withComma - Whether the greeting should end with a comma instead of an exclamation mark.
 * @returns {string} Localized greeting phrase such as "Good morning," or "Good evening!".
 */
function getGreetingByTime(withComma) {
    const hour = new Date().getHours();
    const suffix = withComma ? "," : "!";

    if (hour < 12) return `Good morning${suffix}`;
    if (hour < 18) return `Good afternoon${suffix}`;
    return `Good evening${suffix}`;
}

/**
 * Reads and parses the stored user session JSON from localStorage.
 * @returns {Object|null} Parsed session object, or null when missing or invalid.
 */
function getStoredSession() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Looks up a registered user's display name in Firebase by email address.
 * @param {string} email - Email address used to find the matching user record.
 * @returns {Promise<string>} Resolved display name, or an empty string when not found.
 */
async function fetchUserNameByEmail(email) {
    if (!email) return "";
    try {
        const response = await fetch(`${BASE_URL}/users.json`);
        if (!response.ok) return "";
        const data = await response.json();
        const user = Object.values(data || {}).find(u => u.email === email);
        return (user && user.name) ? String(user.name) : "";
    } catch (e) {
        console.error("Fehler beim Laden des Usernamens:", e);
        return "";
    }
}

/**
 * Renders the welcome greeting and username on the summary page for the current session.
 * @returns {Promise<void>}
 */
async function renderWelcome() {
    const session = getStoredSession();
    if (isGuestSession(session)) {
        renderGuestWelcome();
        return;
    }
    setText("welcome-msg", getGreetingByTime(true));
    const name = await resolveUserName(session);
    setText("username-field", name);
}

/**
 * Determines whether the session represents a guest user or is absent entirely.
 * @param {Object|null} session - Parsed session object from localStorage.
 * @returns {boolean} Whether the visitor should be treated as a guest.
 */
function isGuestSession(session) {
    return !session || session.mode === "guest";
}

/**
 * Renders the welcome section with a generic greeting and no username for guest users.
 * @returns {void}
 */
function renderGuestWelcome() {
    setText("welcome-msg", getGreetingByTime(false));
    setText("username-field", "");
}

/**
 * Resolves the display name from Firebase first, then falls back to session data.
 * @param {Object} session - Parsed authenticated user session object.
 * @returns {Promise<string>} Best available display name for the welcome header.
 */
async function resolveUserName(session) {
    const nameFromDb = await fetchUserNameByEmail(session.email);
    return nameFromDb || session.displayName || "User";
}

/**
 * Removes mobile welcome overlay classes and restores default aside visibility on desktop.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @returns {void}
 */
function resetMobileOverlayToDefault(aside, welcomeBox) {
    aside.classList.remove("is-visible");
    aside.classList.remove("mobile-welcome-overlay");
    aside.style.display = "";
    welcomeBox.style.display = "";
}

/**
 * Resets the mobile overlay when the viewport grows beyond the mobile breakpoint.
 * @param {MediaQueryListEvent} event - Media query change event from matchMedia.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @returns {void}
 */
function handleMobileWelcomeOverlayMqChange(event, aside, welcomeBox) {
    if (!event.matches) resetMobileOverlayToDefault(aside, welcomeBox);
}

/**
 * Registers a one-time media query listener that resets the overlay on viewport resize.
 * @param {MediaQueryList} mq - Media query list for the mobile breakpoint.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @returns {void}
 */
function initMobileOverlayMqListener(mq, aside, welcomeBox) {
    if (window.mobileWelcomeOverlayMqListenerAdded) return;
    window.mobileWelcomeOverlayMqListenerAdded = true;
    mq.addEventListener("change", (event) => handleMobileWelcomeOverlayMqChange(event, aside, welcomeBox));
}

/**
 * Hides the aside and removes overlay classes after the fade-out transition completes.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @param {Function} onTransitionEnd - Transitionend listener reference to remove after cleanup.
 * @returns {void}
 */
function cleanupMobileOverlay(aside, welcomeBox, onTransitionEnd) {
    if (aside.classList.contains("is-visible")) return;
    aside.style.display = "none";
    welcomeBox.style.display = "";
    aside.classList.remove("mobile-welcome-overlay");
    aside.removeEventListener("transitionend", onTransitionEnd);
}

/**
 * Handles the opacity transition end event to finalize mobile overlay cleanup.
 * @param {TransitionEvent} event - Transitionend event from the aside element.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @param {Function} onTransitionEnd - Same listener reference passed to removeEventListener.
 * @returns {void}
 */
function handleMobileOverlayTransitionEnd(event, aside, welcomeBox, onTransitionEnd) {
    if (event.propertyName !== "opacity") return;
    cleanupMobileOverlay(aside, welcomeBox, onTransitionEnd);
}

/**
 * Schedules the overlay hide animation and fallback cleanup timeouts.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @returns {void}
 */
function scheduleMobileOverlayHide(aside, welcomeBox) {
    const onTransitionEnd = (event) => handleMobileOverlayTransitionEnd(event, aside, welcomeBox, onTransitionEnd);
    aside.addEventListener("transitionend", onTransitionEnd);
    setTimeout(() => aside.classList.remove("is-visible"), 1500);
    setTimeout(() => cleanupMobileOverlay(aside, welcomeBox, onTransitionEnd), 2300);
}

/**
 * Applies overlay classes and triggers the fade-in animation on mobile viewports.
 * @param {HTMLElement} aside - Sidebar aside element that hosts the welcome overlay.
 * @param {HTMLElement} welcomeBox - Welcome message container inside the aside.
 * @returns {void}
 */
function showMobileOverlayAnimation(aside, welcomeBox) {
    aside.classList.add("mobile-welcome-overlay");
    aside.style.display = "flex";
    welcomeBox.style.display = "flex";
    aside.classList.remove("is-visible");
    requestAnimationFrame(() => aside.classList.add("is-visible"));
    scheduleMobileOverlayHide(aside, welcomeBox);
}

/**
 * Shows the animated mobile welcome overlay when the viewport is under 900px wide.
 * @returns {void}
 */
function showMobileWelcomeOverlay() {
    const mq = window.matchMedia("(max-width: 900px)");
    const welcomeBox = document.getElementById("welcome-msg-box");
    if (!welcomeBox) return;
    const aside = welcomeBox.closest("aside");
    if (!aside) return;
    initMobileOverlayMqListener(mq, aside, welcomeBox);
    if (!mq.matches) { resetMobileOverlayToDefault(aside, welcomeBox); return; }
    showMobileOverlayAnimation(aside, welcomeBox);
}
