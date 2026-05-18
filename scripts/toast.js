/**
 * Returns or creates the toast container element.
 * @returns {HTMLElement} Result.
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
 * Creates a toast element.
 * @param {string} message - Toast message text.
 * @returns {HTMLElement} Result.
 */
function createToastElement(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    return toast;
}

/**
 * Shows a toast notification.
 * @param {string} message - Toast message text.
 * @returns {void} Result.
 */
function showToast(message) {
    const container = getOrCreateToastContainer();
    const toast = createToastElement(message);
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}
