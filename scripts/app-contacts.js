/** @file Contact list loading from Firebase. */

/** @returns {Promise<void>} */
async function loadContacts() {
  try {
    const data = await fetchContactsData();
    contacts = data ? mapContactsData(data) : [];
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
}

/** @returns {Promise<object|null>} */
async function fetchContactsData() {
  const response = await fetch(`${BASE_URL}/contacts.json`);
  return await response.json();
}

/**
 * @param {object} data
 * @returns {Array}
 */
function mapContactsData(data) {
  return Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
}
