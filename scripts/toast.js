/**
 * Shows a toast notification.
 * @param {string} message - Toast message text.
 * @returns {void} Result.
 */
function showToast(message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    toastContainer.appendChild(toast);

    // Remove toast after animation completes (5 seconds)
    setTimeout(() => {
        toast.remove();
    }, 5000);
}
