# Script-Dateien – Aufteilung

Alle Skripte nutzen **globale Funktionen** (keine ES-Module). Die Ladereihenfolge in den HTML-Dateien muss Abhängigkeiten einhalten.

## Ordnerstruktur

| Ordner | Inhalt |
|--------|--------|
| `scripts/App/` | `app-globals.js`, `app-auth.js`, `app-ui.js`, `app-contacts.js` |
| `scripts/Board/` | Board, Modal, DnD, Templates (`board-*.js`) |
| `scripts/Contacts/` | Kontakte CRUD, UI, Validierung, Templates |
| `scripts/Add-Task/` | Add-Task-Formular, Validierung, Date-Picker, Subtasks |
| `scripts/Login/` | Login Intro, Formular, Auth |
| `scripts/Register/` | Registrierung, Passwort-Sichtbarkeit, Formular |
| `scripts/` (Root) | `form-icons.js`, `message-box.js`, `sidebar.js`, `summary-welcome.js`, `summary.js`, `toast.js` |

## Konvention

| Suffix / Name | Inhalt |
|---------------|--------|
| `*-templates.js` | Nur HTML-/SVG-Strings (`/*html*/`, Template-Funktionen) |
| `form-icons.js` | Gemeinsame SVG-Konstanten (Priority-Icons) |
| `*-validation.js` | Validierung, Fehlermeldungen |
| `*-state.js` | Formular-/UI-Zustand |
| Sonstige `.js` | Logik, Events, API, DOM-Updates |

## Add-Task-Ladereihenfolge (`board.html`, `add-task.html`)

1. `scripts/form-icons.js`
2. `scripts/Add-Task/add-task-validation.js`
3. `scripts/Add-Task/add-task-contacts.js`
4. `scripts/Add-Task/add-task-templates.js`
5. `scripts/Add-Task/add-task-subtask-templates.js`
6. `scripts/Add-Task/add-task-date-picker-core.js`
7. `scripts/Add-Task/add-task-date-picker.js`
8. `scripts/Add-Task/add-task-subtasks.js`
9. `scripts/Add-Task/add-task.js`

Danach (nur Board): `scripts/Board/board-*` in der Reihenfolge wie in `board.html`

## Summary-Ladereihenfolge (`summary.html`, `contacts.html`)

1. `scripts/summary-welcome.js`
2. `scripts/summary.js`

## App-Core (`firebase.js` + geschützte Seiten)

1. `scripts/App/app-globals.js`
2. `scripts/Contacts/contact-validation.js`
3. `scripts/message-box.js`
4. `scripts/App/app-contacts.js`
5. `scripts/App/app-ui.js`
6. `scripts/App/app-auth.js`

Login (`index.html`): `scripts/App/app-globals.js` → `scripts/App/app-auth.js` → `scripts/toast.js` → `scripts/Login/login-intro.js` → `scripts/Login/login-form.js` → `scripts/Login/login-auth.js`

## Bekannte Ausnahmen

- `Board/board-template.js` ruft `highlightText()` aus `Board/board-render.js` auf (Template ↔ Render).
- `Board/board-modal-templates.js`: `generateModalSubtasks` baut HTML und nutzt `getRandomColor()`.
- `Contacts/contacts-template.js` enthält zusätzlich `CONTACT_EDIT_SVG` / `CONTACT_DELETE_SVG` (Contacts-spezifisch).
