/** @file Toast notification display helper. */

/**
 * Returns the existing toast container or creates one and appends it to the document body.
 * @returns {HTMLElement} The DOM element that stacks and displays toast notifications.
 */
function getOrCreateToastContainer() {
    let container = document.getElementById('toast-container');
    if (container) return container;
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

/**
 * Builds a styled toast element containing the given message text.
 * @param {string} message - User-facing text shown inside the toast notification.
 * @returns {HTMLElement} A newly created toast element ready to be appended to the container.
 */
function createToastElement(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    return toast;
}

/**
 * Displays a toast notification that automatically disappears after five seconds.
 * @param {string} message - User-facing text shown inside the toast notification.
 * @returns {void}
 */
function showToast(message) {
    const container = getOrCreateToastContainer();
    const toast = createToastElement(message);
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}
