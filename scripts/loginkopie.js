/**
 * login - This function handles the login process by verifying the user's credentials (email and password) and then processes the login if the credentials are valid.
 * 
 * 1. Sends a GET request to the backend to fetch all contacts.
 * 2. Searches for the contact that matches the entered email and password.
 * 3. If a match is found, it calls the `processLogin` function to handle the login.
 * 4. If an error occurs during the process, it shows an alert message.
 * 
 * @throws {Error} If there is an issue with the fetch request or any other operation, an error alert is shown.
 * 
 * Example:
 * ```js
 * login();
 * ```
 */
async function login() {
    try {
        console.log("Login gestartet");

        const response = await fetch(`${BASE_URL}/users.json`);
        if (!response.ok) throw new Error(`HTTP-Error! Status: ${response.status}`);
        const userAsJson = await response.json();
        console.log("Daten geladen:", userAsJson);

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        console.log("E-Mail:", email, "Passwort:", password);

        const signedUpUser = Object.values(userAsJson || {}).find(
            u => u.email === email && u.password === password
        );
        console.log("Gefundener User:", signedUpUser);

        processLogin(signedUpUser);
    } catch (error) {
        console.error("Fehler im Login:", error);
        alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    }
}

function processLogin(signedUpUser) {
    if (signedUpUser) {
        console.log("Login erfolgreich, weiterleiten...");
        window.location.href = "summary.html";
    } else {
        alert("E-Mail oder Passwort ist falsch!");
    }
}



/**
 * Processes the login for a signed-up contact. If the login is successful, displays a success popup, 
 * updates the user data, and redirects to the summary page. If the login fails, shows an alert.
 * 
 * @param {Object} signedUpContact - The contact object containing the details of the signed-up user.
 * @param {string} signedUpContact.name - The name of the signed-up user.
 * @returns {void}
 */
async function processLogin(signedUpContact) {
  if (signedUpContact) {
    let popup = document.getElementById('task-created-popup');
    popup.classList.add('show');
    setTimeout(() => {
      popup.classList.remove('show');
      putData('currentUser', { name: signedUpContact.name })
      window.location.href = "summary.html";
    }, 1500);
  } else {
    let popup = document.getElementById('task-created-popup2');
    popup.classList.add('show');
    setTimeout(() => {
      popup.classList.remove('show');
    }, 1500);
  }
}

/**
 * This function is used to get logged in in the Application
 * 
 */
function login() {
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let user = users.find( u => u.email == email.value && u.password == password.value);
    console.log(user);
    if(user){
        console.log('User gefunden!')
    }
}

const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get('msg');

if(msg){
    msgBox.innerHTML = msg;
} else{
    //display: none;
}


// TESTCODE:

'use strict';

/**
 * login.js – Frontend-only (ohne Firebase)
 * Ziel: Checklisten-konformes Login inkl. Validation, UI-Feedback, Gast-Login,
 * Button-Disable während Loading, Redirect, keine Konsole, MPA-kompatibel.
 * IDs im HTML erforderlich: #login-form, #email, #password, #login-btn,
 * #guest-btn, #msg
 */


// ------------------------------ Mock Auth Adapter ------------------------------
/**
 * Mini-Adapter zum Entwickeln/Stylen ohne Backend. Später durch Firebase ersetzen.
 * Keine Speicherung, nur Promise-basierte Simulation.
 */
const authAdapter = (() => {
  /** @returns {Promise<{uid:string}>} */
  function signInEmailPassword(email, password) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const ok = email === 'demo@join.app' && password === '123456';
        ok ? resolve({ uid: 'demo' }) : reject({ code: 'auth/invalid-credentials' });
      }, 350);
    });
  }

  /** @returns {Promise<{uid:string}>} */
  function signInGuest() {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve({ uid: 'guest' }), 250);
    });
  }

  return { signInEmailPassword, signInGuest };
})();


// ------------------------------ DOM Accessors ------------------------------
/** @returns {HTMLFormElement|null} */
function getForm() { return /** @type {HTMLFormElement|null} */ (document.getElementById('login-form')); }

/** @returns {HTMLInputElement|null} */
function getEmailInput() { return /** @type {HTMLInputElement|null} */ (document.getElementById('email')); }

/** @returns {HTMLInputElement|null} */
function getPasswordInput() { return /** @type {HTMLInputElement|null} */ (document.getElementById('password')); }

/** @returns {HTMLButtonElement|null} */
function getLoginBtn() { return /** @type {HTMLButtonElement|null} */ (document.getElementById('login-btn')); }

/** @returns {HTMLButtonElement|null} */
function getGuestBtn() { return /** @type {HTMLButtonElement|null} */ (document.getElementById('guest-btn')); }

/** @returns {HTMLElement|null} */
function getMsgBox() { return document.getElementById('msg'); }


// ------------------------------ UI Helpers ------------------------------
/** @param {boolean} isLoading */
function setLoading(isLoading) {
  const loginBtn = getLoginBtn();
  const guestBtn = getGuestBtn();
  const form = getForm();
  if (loginBtn) loginBtn.disabled = isLoading;
  if (guestBtn) guestBtn.disabled = isLoading;
  if (form) form.setAttribute('aria-busy', String(isLoading));
}


/** @param {string} text */
function showMessage(text) {
  const box = getMsgBox();
  if (!box) return;
  box.textContent = text;
  box.hidden = !text;
  box.setAttribute('role', 'status');
  box.setAttribute('aria-live', 'polite');
}


function clearMessage() { showMessage(''); }


// ------------------------------ Validation ------------------------------
/** @param {string} email */
function isEmail(email) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email); }


/**
 * Prüft die Eingaben ohne HTML5-Standardvalidation (Checkliste-Vorgabe).
 * @param {string} email
 * @param {string} password
 * @returns {{ok:true}|{ok:false,msg:string}}
 */
function validateLoginForm(email, password) {
  if (!email || !password) return { ok: false, msg: 'E-Mail und Passwort eingeben.' };
  if (!isEmail(email)) return { ok: false, msg: 'E-Mail ist ungültig.' };
  if (password.length < 6) return { ok: false, msg: 'Passwort zu kurz (min. 6 Zeichen).' };
  return { ok: true };
}


/** @param {{code?:string}|Error} err */
function mapAuthError(err) {
  if (typeof err === 'object' && 'code' in err) {
    if (err.code === 'auth/invalid-credentials') return 'E-Mail oder Passwort falsch.';
  }
  return 'Login fehlgeschlagen. Bitte erneut versuchen.';
}


// ------------------------------ Controller ------------------------------
/**
 * Führt den eigentlichen Login-Flow aus (Validation → Auth → Redirect).
 * Getrennt, damit Click/Submit denselben Pfad nutzen.
 */
async function performLoginFlow() {
  const emailInput = getEmailInput();
  const pwInput = getPasswordInput();
  if (!emailInput || !pwInput) return;

  clearMessage();
  const email = emailInput.value.trim();
  const pw = pwInput.value;
  const v = validateLoginForm(email, pw);
  if (!v.ok) return showMessage(v.msg);

  setLoading(true);
  try {
    await authAdapter.signInEmailPassword(email, pw);
    redirectToApp();
  } catch (e) {
    showMessage(mapAuthError(/** @type {any} */(e)));
  } finally {
    setLoading(false);
  }
}


/** Weiterleitung nach erfolgreichem Login (MPA-konform). */
function redirectToApp() { window.location.href = 'summary.html'; }


/** Gast-Login laut Checkliste (kann alle Funktionen testen). */
async function handleGuestLogin() {
  clearMessage();
  setLoading(true);
  try {
    await authAdapter.signInGuest();
    redirectToApp();
  } catch (_) {
    showMessage('Gast-Login fehlgeschlagen.');
  } finally {
    setLoading(false);
  }
}


/** @param {SubmitEvent} e */
function onFormSubmit(e) { e.preventDefault(); performLoginFlow(); }


/** @param {MouseEvent} e */
function onLoginClick(e) { e.preventDefault(); performLoginFlow(); }


/** @param {MouseEvent} e */
function onGuestClick(e) { e.preventDefault(); handleGuestLogin(); }


// ------------------------------ Init ------------------------------
/**
 * Initialisiert Seite: HTML5-Validation aus, Events binden, URL-Message zeigen.
 */
function initLoginPage() {
  const form = getForm();
  if (form) {
    form.setAttribute('novalidate', 'novalidate');
    form.addEventListener('submit', onFormSubmit);
  }

  const loginBtn = getLoginBtn();
  if (loginBtn) loginBtn.addEventListener('click', onLoginClick);

  const guestBtn = getGuestBtn();
  if (guestBtn) guestBtn.addEventListener('click', onGuestClick);

  const urlMsg = new URLSearchParams(window.location.search).get('msg') || '';
  if (urlMsg) showMessage(urlMsg);
}


document.addEventListener('DOMContentLoaded', initLoginPage);






function navigateToSignup() {
     window.location.href = "signup.html";
}