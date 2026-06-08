/** @file Contact and signup field validation helpers. */

/**
 * Trims and collapses whitespace in a contact name.
 * @param {string} name - Raw name input from the form field.
 * @returns {string} Trimmed name with consecutive spaces collapsed to one.
 */
function normalizeContactNameInput(name) {
  return String(name ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Derives up to two initials from a contact name.
 * @param {string} name - Full contact name used to derive initials.
 * @returns {string} One or two uppercase initials, or an empty string when no letters are found.
 */
function getContactInitialsFromName(name) {
  const normalizedName = normalizeContactNameInput(name);
  if (!normalizedName) return "";
  const parts = normalizedName.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  const firstPart = String(parts[0] ?? "");
  const lastPart = String(parts[parts.length - 1] ?? "");
  const firstLetter = (firstPart.match(/[\p{L}]/u) || [""])[0];
  const lastLetter = (lastPart.match(/[\p{L}]/u) || [""])[0];
  const raw = (firstLetter + (parts.length > 1 ? lastLetter : "")).toUpperCase();
  return raw.slice(0, 2);
}

/**
 * Validates basic name length and part-count constraints.
 * @param {string} normalizedName - Trimmed and whitespace-normalized contact name.
 * @returns {Object|null} Validation error object, or null when basic checks pass.
 */
function checkContactNameBasics(normalizedName) {
  if (!normalizedName) return { isValid: false, error: "Please enter a name.", reason: "required" };
  if (normalizedName.length > 20) return { isValid: false, error: "Maximum 20 characters allowed.", reason: "too_long" };
  const parts = normalizedName.split(" ").filter(Boolean);
  if (parts.length > 3) return { isValid: false, error: "Maximum 3 name parts allowed.", reason: "too_many_parts" };
  return null;
}

/**
 * Validates each name part for allowed characters and minimum length.
 * @param {string[]} parts - Individual words split from the contact name.
 * @returns {Object|null} Validation error object, or null when all parts are valid.
 */
function checkContactNamePartValidity(parts) {
  const partPattern = /^[\p{L}]+(?:-[\p{L}]+)*$/u;
  for (const part of parts) {
    if (!partPattern.test(part)) return { isValid: false, error: "Please use only letters.", reason: "invalid_chars" };
    if (part.replace(/-/g, "").length < 2) return { isValid: false, error: "Names have more than 1 letter.", reason: "part_too_short" };
  }
  return null;
}

/**
 * Validates and normalizes a contact name input.
 * @param {string} name - Raw name input from the form field.
 * @returns {{isValid: boolean, normalizedName: string, initials: string, error: string}} Validation result with normalized name and derived initials.
 */
function validateContactNameInput(name) {
  const normalizedName = normalizeContactNameInput(name);
  const basicError = checkContactNameBasics(normalizedName);
  if (basicError) return { ...basicError, normalizedName, initials: "" };
  const parts = normalizedName.split(" ").filter(Boolean);
  const partError = checkContactNamePartValidity(parts);
  if (partError) return { ...partError, normalizedName, initials: "" };
  const totalLetters = normalizedName.replace(/[^\p{L}]/gu, "").length;
  if (totalLetters < 2) {
    return { isValid: false, normalizedName, initials: "", error: "Names have more than 1 letter.", reason: "too_few_letters" };
  }
  return { isValid: true, normalizedName, initials: getContactInitialsFromName(normalizedName), error: "" };
}

/**
 * Builds the strict email validation pattern used at signup.
 * @returns {RegExp} Regular expression that enforces signup email format rules.
 */
function buildStrictEmailPattern() {
  const localLabel = "[A-Za-zÄÖÜäöüß0-9]+(?:(?:-+|_(?!_))[A-Za-zÄÖÜäöüß0-9]+)*";
  const domainLabel = "[A-Za-zÄÖÜäöüß0-9]+(?:-[A-Za-zÄÖÜäöüß0-9]+)*";
  const tldLabel = "[A-Za-zÄÖÜäöüß]{2,}";
  return new RegExp(
    `^(?!.*\\.\\.)${localLabel}(?:\\.${localLabel})*@${domainLabel}(?:\\.${domainLabel})*\\.${tldLabel}$`,
    "u"
  );
}

/**
 * Validates an email address using signup rules.
 * @param {string} email - Raw email input from the form field.
 * @returns {{isValid: boolean, normalizedEmail: string, error: string, reason?: string}} Validation result with a lowercased email when valid.
 */
function validateEmailLikeSignup(email) {
  const trimmedEmail = String(email ?? "").trim();
  if (!trimmedEmail) return { isValid: false, normalizedEmail: trimmedEmail, error: "Please enter an email address.", reason: "required" };
  const normalizedEmail = trimmedEmail.toLowerCase();
  if (normalizedEmail.length > 254) return { isValid: false, normalizedEmail, error: "Email address is too long.", reason: "too_long" };
  if (!buildStrictEmailPattern().test(normalizedEmail)) return { isValid: false, normalizedEmail, error: "Please enter a valid email address.", reason: "pattern" };
  return { isValid: true, normalizedEmail, error: "" };
}

/**
 * Validates a contact phone number.
 * @param {string|number} phone - Raw phone input from the form field.
 * @returns {{isValid: boolean, normalizedPhone: string, error: string}} Validation result with a trimmed digit-only phone when valid.
 */
function validateContactPhoneNumber(phone) {
  const normalizedPhone = String(phone ?? "").trim();
  if (!normalizedPhone) return { isValid: false, normalizedPhone, error: "Please enter a phone number." };
  if (!/^\d+$/.test(normalizedPhone)) return { isValid: false, normalizedPhone, error: "Please enter digits only." };
  if (!/^\d{6,15}$/.test(normalizedPhone)) return { isValid: false, normalizedPhone, error: "Must be 6 to 15 digits long." };
  return { isValid: true, normalizedPhone, error: "" };
}
