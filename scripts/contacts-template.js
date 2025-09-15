function getHTMLContactGroup(letter, initials, contactName, email) {
    return `
        <div class="contact-card">
            <h2 class="contact-group-letter">${letter}</h2>
            <div class="dividing-line"></div>
            
            <div class="contact-area">
                <div class="contact-avatar">
                    <span class="avatar-placeholder">${initials}</span>
                </div>

                <div class="contact-details">
                    <h3 class="contact-name">${contactName}</h3>
                    <a href="mailto:${email}" class="contact-email">${email}</a>
                </div>
            </div>
        </div>
                `
}