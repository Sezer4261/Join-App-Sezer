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
  const box = document.getElementById("msgBox");
  box.textContent = message;
  box.className = type;
  box.style.display = "block";

  setTimeout(() => {
    box.style.display = "none";
  }, 3000);
}
