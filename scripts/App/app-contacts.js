/** @file Contact list loading from Firebase. */

/**
 * Fetches contacts from Firebase and replaces the global contacts array with the result.
 * @returns {Promise<void>}
 */
async function loadContacts() {
  try {
    const data = await fetchContactsData();
    contacts = data ? mapContactsData(data) : [];
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
}

/**
 * Requests the raw contacts collection from the Firebase Realtime Database REST API.
 * @returns {Promise<object|null>} Parsed contacts object keyed by Firebase id, or null when empty.
 */
async function fetchContactsData() {
  const response = await fetch(`${BASE_URL}/contacts.json`);
  return await response.json();
}

/**
 * Converts a Firebase contacts map into an array of records that include their database id.
 * @param {object} data - Raw contacts object keyed by Firebase push id.
 * @returns {Array<object>} Contact records with an added id property for each entry.
 */
function mapContactsData(data) {
  return Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
}
