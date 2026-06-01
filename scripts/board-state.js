let tasks = [];
let editSubtasks = [];
let expandedBoardColumns = new Set();
let boardResponsiveHandlerAdded = false;
let lastBoardCompactLimit = 0;

let colors = [
  "#f4b400",
  "#9333ea",
  "#ef4444",
  "#f97316"
];

let boardSearchTerm = "";
