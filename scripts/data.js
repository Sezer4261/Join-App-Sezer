const tasks = [
    {
        id: 1,
        title: "Fix API Endpoint Bug",
        description: "Resolve the incorrect response from /tasks endpoint before release.",
        priority: "urgent",
        status: "await-feedback",
        assignedTo: [
            { name: "Alex", avatar: "assets/avatar1.jpg" },
            { name: "Sam", avatar: "assets/avatar2.jpg" }
        ]
    },
    {
        id: 2,
        title: "Create Login Page",
        description: "Implement login UI and connect to authentication API.",
        priority: "medium",
        status: "todo",
        assignedTo: [
            { name: "Maria", avatar: "assets/avatar3.jpg" }
        ]
    },
    {
        id: 3,
        title: "Design Dashboard",
        description: "Prepare layout and styles for the main dashboard page.",
        priority: "low",
        status: "in-progress",
        assignedTo: [
            { name: "Chris", avatar: "assets/avatar4.jpg" },
            { name: "Alex", avatar: "assets/avatar1.jpg" }
        ]
    },
    {
        id: 4,
        title: "Deploy to Production",
        description: "Finalize build and push to production server.",
        priority: "urgent",
        status: "done",
        assignedTo: [
            { name: "Sam", avatar: "assets/avatar2.jpg" }
        ]
    }
];
