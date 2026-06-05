/** @file Login submission and session handling. */

async function login() {
  try {
    clearLoginErrors();
    const credentials = getLoginCredentials();
    if (!validateLoginCredentials(credentials)) return;
    const signedUpUser = await findSignedUpUser(credentials.email, credentials.password);
    handleLoginResult(credentials, signedUpUser);
  } catch (error) {
    showLoginError("An error occurred. Please try again later.");
  }
}

function validateLoginCredentials({ email, password }) {
  if (!email || !password) {
    showLoginError("Please fill in all fields.");
    return false;
  }
  if (!isValidEmail(email)) {
    showLoginError("Please enter a valid email address.");
    return false;
  }
  return true;
}

function handleLoginResult(credentials, signedUpUser) {
  if (signedUpUser) {
    storeUserSession(credentials.email, signedUpUser);
    showToast("You logged in successfully");
    setTimeout(() => { window.location.href = getPagePath("summary.html"); }, 300);
    return;
  }
  showLoginError("Check your email and password. Please try again.");
}

function clearLoginErrors() {
  document.getElementById("login-email")?.classList.remove("input-error");
  document.getElementById("login-password")?.classList.remove("input-error");
}

function getLoginCredentials() {
  return {
    email: document.getElementById("login-email").value.trim(),
    password: document.getElementById("login-password").value.trim(),
  };
}

async function findSignedUpUser(email, password) {
  const response = await fetch(`${BASE_URL}/users.json`);
  if (!response.ok) throw new Error(`HTTP-Error! Status: ${response.status}`);
  const userAsJson = await response.json();
  return Object.values(userAsJson || {}).find((u) => u.email === email && u.password === password);
}

function storeUserSession(email, signedUpUser) {
  localStorage.setItem("user", JSON.stringify({
    mode: "user",
    email,
    displayName: signedUpUser.name || "",
  }));
}

function showLoginError(message) {
  removeLoginError();
  appendLoginError(message);
  markLoginInputsError();
}

function navigateToSignup() {
  window.location.href = "signup.html";
}

function guestLogin() {
  localStorage.setItem("user", JSON.stringify({ mode: "guest" }));
  showToast("You logged in successfully");
  setTimeout(() => { window.location.href = getPagePath("summary.html"); }, 300);
}
