let tasks = [];
let editSubtasks = [];
let expandedBoardColumns = new Set();
let boardResponsiveHandlerAdded = false;
let lastBoardCompactLimit = 0;

let colors = [
  "#f4b400", // Gelb
  "#9333ea", // Lila
  "#ef4444", // Rot
  "#f97316"  // Orange
];

let boardSearchTerm = "";
