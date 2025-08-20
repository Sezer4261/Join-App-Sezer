let contacts = [
    { id: 1, name: "Alex Johnson", email: "alex@example.com", phone: "+49 123 456789", avatar: "assets/avatar1.jpg" },
    { id: 2, name: "Maria Gomez", email: "maria@example.com", phone: "+49 987 654321", avatar: "assets/avatar3.jpg" },
    { id: 3, name: "Chris Müller", email: "chris@example.com", phone: "+49 555 123456", avatar: "assets/avatar4.jpg" }
];

function loadContacts() {
    const list = document.getElementById("contacts-list");
    list.innerHTML = "";
    contacts.forEach(contact => {
        const item = document.createElement("div");
        item.classList.add("contact-item");
        item.innerHTML = `
            <img class="avatar" src="${contact.avatar}" alt="${contact.name}">
            <div class="contact-info">
                <h4>${contact.name}</h4>
                <p>${contact.email}</p>
            </div>
        `;
        item.addEventListener("click", () => showContactDetails(contact.id));
        list.appendChild(item);
    });
}

function showContactDetails(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    const details = document.getElementById("contact-details");
    details.innerHTML = `
        <div class="contact-details-card">
            <img class="avatar-large" src="${contact.avatar}" alt="${contact.name}">
            <h2>${contact.name}</h2>
            <p>Email: ${contact.email}</p>
            <p>Phone: ${contact.phone}</p>
            <div class="overlay-actions">
                <button class="btn btn-edit" onclick="editContact(${contact.id})">Edit</button>
                <button class="btn btn-delete" onclick="deleteContact(${contact.id})">Delete</button>
            </div>
        </div>
    `;
}

function openAddContact() {
    const overlay = document.getElementById("contact-overlay");
    const content = document.getElementById("contact-overlay-content");
    content.innerHTML = `
        <h2>Add Contact</h2>
        <form onsubmit="addContact(event)">
            <input type="text" id="new-name" placeholder="Name" required>
            <input type="email" id="new-email" placeholder="Email" required>
            <input type="tel" id="new-phone" placeholder="Phone" required>
            <input type="text" id="new-avatar" placeholder="Avatar URL" required>
            <button type="submit" class="btn btn-primary">Add</button>
            <button type="button" class="btn btn-secondary" onclick="closeOverlay()">Cancel</button>
        </form>
    `;
    overlay.classList.remove("hidden");
}

function addContact(e) {
    e.preventDefault();
    const name = document.getElementById("new-name").value;
    const email = document.getElementById("new-email").value;
    const phone = document.getElementById("new-phone").value;
    const avatar = document.getElementById("new-avatar").value;
    const newContact = {
        id: Date.now(),
        name,
        email,
        phone,
        avatar
    };
    contacts.push(newContact);
    closeOverlay();
    loadContacts();
}

function editContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    const overlay = document.getElementById("contact-overlay");
    const content = document.getElementById("contact-overlay-content");
    content.innerHTML = `
        <h2>Edit Contact</h2>
        <form onsubmit="updateContact(event, ${id})">
            <input type="text" id="edit-name" value="${contact.name}" required>
            <input type="email" id="edit-email" value="${contact.email}" required>
            <input type="tel" id="edit-phone" value="${contact.phone}" required>
            <input type="text" id="edit-avatar" value="${contact.avatar}" required>
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" onclick="closeOverlay()">Cancel</button>
        </form>
    `;
    overlay.classList.remove("hidden");
}

function updateContact(e, id) {
    e.preventDefault();
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    contact.name = document.getElementById("edit-name").value;
    contact.email = document.getElementById("edit-email").value;
    contact.phone = document.getElementById("edit-phone").value;
    contact.avatar = document.getElementById("edit-avatar").value;
    closeOverlay();
    loadContacts();
}

function deleteContact(id) {
    contacts = contacts.filter(c => c.id !== id);
    document.getElementById("contact-details").innerHTML = `<p>Select a contact to view details</p>`;
    loadContacts();
}

function closeOverlay() {
    document.getElementById("contact-overlay").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", loadContacts);
