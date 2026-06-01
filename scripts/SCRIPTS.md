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
| `board-dnd.js` | Drag & Drop |
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
| `login.js` / `register*.js` / `toast.js` | Auth & Registrierung |

## Add-Task-Ladereihenfolge (`board.html`, `add-task.html`)

1. `form-icons.js`
2. `add-task-validation.js`
3. `add-task-contacts.js`
4. `add-task-templates.js`
5. `add-task-subtask-templates.js`
6. `add-task-date-picker.js`
7. `add-task-subtasks.js`
8. `add-task.js`

Danach (nur Board): Board-Templates → State → Render → …

## Bekannte Ausnahmen

- `board-template.js` ruft `highlightText()` aus `board-render.js` auf (Template ↔ Render).
- `board-modal-templates.js`: `generateModalSubtasks` baut HTML und nutzt `getRandomColor()`.
- `contacts-template.js` enthält zusätzlich `CONTACT_EDIT_SVG` / `CONTACT_DELETE_SVG` (Contacts-spezifisch).
