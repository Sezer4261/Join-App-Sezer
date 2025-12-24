let BASE_URL = "https://join-app-firebase-default-rtdb.europe-west1.firebasedatabase.app";
let tasks = [
    {
    id: 1,
    type: "User Story",
    title: "Kochwelt Page & Recipe Recommender",
    description: "Build start page with recipe recommendation.",
    dueDate: "10/05/2023",
    priority: "Medium =",
    status: "In Progress",
    assigned: [
      { name: "Emmanuel Mauer", initials: "EM", color: "#00bfa5" },
      { name: "Marcel Bauer", initials: "MB", color: "#673ab7" },
      { name: "Anton Mayer", initials: "AM", color: "#1e88e5" }
    ],
    subtasks: [
      { text: "Implement Recipe Recommendation", done: true },
      { text: "Start Page Layout", done: false }
    ]
  },
  {
    id: 2,
    type: "Task",
    title: "Backend API Setup",
    description: "Initialize project and build authentication routes.",
    dueDate: "15/05/2023",
    priority: "Urgent ⬆",
    status: "To Do",
    assigned: [
      { name: "Lisa Schmidt", initials: "LS", color: "#ef6c00" }
    ],
    subtasks: [
      { text: "Setup Express", done: false },
      { text: "Create User Model", done: false }
    ]
  },
  {
    id: 3,
    type: "Bug",
    title: "Fix Login Issue",
    description: "Resolve bug where users cannot log in with Safari.",
    dueDate: "12/05/2023",
    priority: "Low ⬇",
    status: "Done",
    assigned: [
      { name: "Tom Becker", initials: "TB", color: "#c2185b" }
    ],
    subtasks: [
      { text: "Reproduce issue", done: true },
      { text: "Fix session handling", done: true }
    ]
  }
];
let columns = ["To Do", "In Progress", "Await Feedback", "Done"];
let draggedTaskId = null;
let activeTask = null; // Aktives Modal-Task
let users = [
    {'email': 'erik@test.de', 'password': 'test1234'}
];

function showMessage(message, type = "success") {
  let box = document.getElementById("msgBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "msgBox";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }

  // Content (text left, icon right)
  box.innerHTML = "";
  const textEl = document.createElement("span");
  textEl.textContent = message;
  box.appendChild(textEl);

  const iconWrap = document.createElement("span");
  const icon = document.createElement("img");
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  icon.src = type === "success" ? "./assets/icons/vector_board.svg" : "./assets/icons/checkmark.svg";
  iconWrap.appendChild(icon);
  box.appendChild(iconWrap);

  box.className = `msgBox ${type}`;

  // Layout: centered pill like screenshot
  box.style.position = "fixed";
  box.style.left = "50%";
  box.style.top = "50%";
  box.style.transform = "translate(-50%, -50%)";
  box.style.zIndex = "9999";

  box.style.display = "flex";
  box.style.alignItems = "center";
  box.style.justifyContent = "space-between";
  box.style.gap = "22px";

  box.style.minWidth = "280px";
  box.style.maxWidth = "min(520px, calc(100vw - 32px))";
  box.style.padding = "18px 22px";
  box.style.borderRadius = "18px";

  box.style.color = "#fff";
  box.style.fontSize = "18px";
  box.style.fontWeight = "400";
  box.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.22)";

  // Don't block UI interactions beneath the toast
  box.style.pointerEvents = "none";

  // Background
  if (type === "error") {
    box.style.background = "var(--urgent, #ff3d00)";
  } else {
    box.style.background = "var(--sidebar-bg, #2a3647)";
  }

  // Icon: small rounded square with white border
  iconWrap.style.width = "34px";
  iconWrap.style.height = "34px";
  iconWrap.style.border = "2px solid rgba(255, 255, 255, 0.9)";
  iconWrap.style.borderRadius = "8px";
  iconWrap.style.display = "flex";
  iconWrap.style.alignItems = "center";
  iconWrap.style.justifyContent = "center";
  iconWrap.style.flexShrink = "0";

  icon.style.width = "18px";
  icon.style.height = "18px";
  // Make SVGs appear white-ish regardless of original fill
  icon.style.filter = "brightness(0) invert(1)";

  box.style.display = "flex";

  window.clearTimeout(box._hideTimeout);
  box._hideTimeout = window.setTimeout(() => {
    box.style.display = "none";
  }, 3000);
}
