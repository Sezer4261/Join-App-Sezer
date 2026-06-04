# Script-Dateien – Aufteilung

Alle Skripte nutzen **globale Funktionen** (keine ES-Module). Die Ladereihenfolge in den HTML-Dateien muss Abhängigkeiten einhalten.

## Konvention

| Suffix / Name | Inhalt |
|---------------|--------|
| `*-templates.js` | Nur HTML-/SVG-Strings (`/*html*/`, Template-Funktionen) |
| `form-icons.js` | Gemeinsame SVG-Konstanten (Priority-Icons) |
| `*-validation.js` | Validierung, Fehlermeldungen |
| `*-state.js` | Formular-/UI-Zustand |
| Sonstige `.js` | Logik, Events, API, DOM-Updates |

## Übersicht

| Datei | Rolle |
|-------|--------|
| `form-icons.js` | SVG: `URGENT_ICON`, `MEDIUM_ICON`, `LOW_ICON` |
| `add-task-templates.js` | Add-Task-Formular-HTML, Kategorie-Dropdown, Kontakt-Dropdown |
| `add-task-subtask-templates.js` | Subtask-Listen-HTML |
| `add-task-date-picker.js` | Custom Date-Picker (Add Task) |
| `add-task-validation.js` | Add-Task-Validierung |
| `add-task-contacts.js` | Kontakte zuweisen (Dropdown, Avatare) |
| `add-task-subtasks.js` | Subtask-Logik |
| `add-task.js` | Add-Task-Orchestrierung, Speichern, Formular-Listener |
| `board-template.js` | Task-Karten-HTML |
| `board-modal-templates.js` | Task-Modal-HTML |
| `board-modal-edit-templates.js` | Bearbeiten-Modal-HTML |
| `board-state.js` | Board-Zustand (`tasks`, Suche, …) |
| `board-render.js` | Board rendern, Suche |
| `board-avatars.js` | Avatar-Farben |
| `board-api.js` | Firebase Tasks |
| `app-globals.js` | Globale Variablen, Konstanten |
| `contact-validation.js` | Namens-/E-Mail-/Telefon-Validierung |
| `message-box.js` | Zentrale Statusmeldung |
| `app-contacts.js` | Kontakte aus Firebase laden |
| `app-ui.js` | Scroll-Lock, Profilmenü, Board-Labels |
| `app-auth.js` | Auth-Guard, Logout, Session |
| `board-dnd-order.js` | DnD: Reihenfolge, Spalten-Placement |
| `board-dnd-desktop.js` | DnD: HTML5 Drag (Desktop) |
| `board-dnd-touch.js` | DnD: Touch / Long-Press |
| `board-modal.js` | Task-Modal öffnen/schließen |
| `board-edit-validation.js` | Edit-Validierung |
| `board-edit-subtasks.js` | Edit-Subtasks |
| `board-edit.js` | Task bearbeiten |
| `board-addtask-dialog.js` | Add-Task-Dialog auf dem Board |
| `contacts-template.js` | Contacts-HTML |
| `contacts-ui-validation.js` | Contacts-Validierung |
| `contacts-ui.js` | Contacts-UI (Dialoge, Toast) |
| `contacts-crud.js` | Contacts CRUD |
| `contacts.js` | Kontaktliste rendern |
| `sidebar.js` | Navigation |
| `summary.js` | Summary-Seite |
| `login-intro.js` / `login-form.js` / `login-auth.js` | Login |
| `register*.js` / `toast.js` | Registrierung & Toasts |

## Add-Task-Ladereihenfolge (`board.html`, `add-task.html`)

1. `form-icons.js`
2. `add-task-validation.js`
3. `add-task-contacts.js`
4. `add-task-templates.js`
5. `add-task-subtask-templates.js`
6. `add-task-date-picker.js`
7. `add-task-subtasks.js`
8. `add-task.js`

Danach (nur Board): Board-Templates → State → Render → API → `board-dnd-order.js` → `board-dnd-desktop.js` → `board-dnd-touch.js` → Modal/Edit …

## App-Core (`firebase.js` + geschützte Seiten)

1. `app-globals.js`
2. `contact-validation.js`
3. `message-box.js`
4. `app-contacts.js`
5. `app-ui.js`
6. `app-auth.js`

Login (`index.html`): `app-globals.js` → `app-auth.js` → `toast.js` → `login-intro.js` → `login-form.js` → `login-auth.js`

## Bekannte Ausnahmen

- `board-template.js` ruft `highlightText()` aus `board-render.js` auf (Template ↔ Render).
- `board-modal-templates.js`: `generateModalSubtasks` baut HTML und nutzt `getRandomColor()`.
- `contacts-template.js` enthält zusätzlich `CONTACT_EDIT_SVG` / `CONTACT_DELETE_SVG` (Contacts-spezifisch).
