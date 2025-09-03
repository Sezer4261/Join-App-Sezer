const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_PROJECT.appspot.com",
  messagingSenderId: "DEIN_SENDER_ID",
  appId: "DEIN_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function loadContacts() {
  const contactsContainer = document.getElementById("contacts-container");
  contactsContainer.innerHTML = "";
  const snapshot = await db.collection("contacts").orderBy("name").get();
  snapshot.forEach((doc) => {
    const contact = doc.data();
    contactsContainer.innerHTML += `
      <div class="contact-item" onclick="openContact('${doc.id}')">
        <div class="avatar">${contact.name.charAt(0).toUpperCase()}</div>
        <div class="contact-info">
          <h4>${contact.name}</h4>
          <p>${contact.email}</p>
          <p>${contact.phone}</p>
        </div>
      </div>
    `;
  });
}

async function addContact(event) {
  event.preventDefault();
  const name = document.getElementById("contact-name").value;
  const email = document.getElementById("contact-email").value;
  const phone = document.getElementById("contact-phone").value;
  await db.collection("contacts").add({ name, email, phone });
  document.getElementById("add-contact-form").reset();
  loadContacts();
}

async function openContact(id) {
  const doc = await db.collection("contacts").doc(id).get();
  const contact = doc.data();
  document.getElementById("overlay").innerHTML = `
    <div class="overlay-content">
      <h2>Edit Contact</h2>
      <form onsubmit="updateContact('${id}'); return false;">
        <input id="edit-name" value="${contact.name}">
        <input id="edit-email" value="${contact.email}">
        <input id="edit-phone" value="${contact.phone}">
        <button type="submit">Save</button>
        <button type="button" onclick="deleteContact('${id}')">Delete</button>
      </form>
      <button onclick="closeOverlay()">Close</button>
    </div>
  `;
  document.getElementById("overlay").style.display = "flex";
}

async function updateContact(id) {
  const name = document.getElementById("edit-name").value;
  const email = document.getElementById("edit-email").value;
  const phone = document.getElementById("edit-phone").value;
  await db.collection("contacts").doc(id).update({ name, email, phone });
  closeOverlay();
  loadContacts();
}

async function deleteContact(id) {
  await db.collection("contacts").doc(id).delete();
  closeOverlay();
  loadContacts();
}

function closeOverlay() {
  document.getElementById("overlay").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  loadContacts();
  document.getElementById("add-contact-form").addEventListener("submit", addContact);
});
