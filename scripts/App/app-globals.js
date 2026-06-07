/** @file Shared application state and layout constants. */

let BASE_URL = "https://join-app-firebase-default-rtdb.europe-west1.firebasedatabase.app";

/** @type {{ id: string, status: string }[]} */
const BOARD_COLUMN_CONFIGS = [
  { id: "todo-column", status: "To Do" },
  { id: "inprogress-column", status: "In Progress" },
  { id: "awaiting-column", status: "Await Feedback" },
  { id: "done-column", status: "Done" }
];

const DIALOG_CLOSE_MS = 300;
const CONTACT_DETAILS_ANIM_MS = 320;
const CONTACT_MOBILE_BREAKPOINT = 780;
const BOARD_COMPACT_MIN_WIDTH = 621;
const BOARD_COMPACT_MEDIUM_MAX = 1140;
const BOARD_COMPACT_MEDIUM_VISIBLE = 2;
const BOARD_COMPACT_DESKTOP_VISIBLE = 4;

/** @type {string[]} */
const INITIALS_COLOR_CLASSES = [
  "bg-blue", "bg-green", "bg-purple", "bg-orange",
  "bg-pink", "bg-red", "bg-teal", "bg-brown"
];

let draggedTaskId = null;
let activeTask = null;
let users = [{ email: "erik@test.de", password: "test1234" }];
let contacts = [];
let selectedContacts = [];
let subtasks = [];
