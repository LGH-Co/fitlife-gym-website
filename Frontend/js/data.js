// Mock Database Simulation
export const members = [
    { id: "M001", name: "John Smith", plan: "Gold", status: "Active", expiry: "4/7/2026", weight: "75 kg", bmi: 24.5 },
    { id: "M002", name: "Sarah Johnson", plan: "Silver", status: "Active", expiry: "3/8/2026", weight: "62 kg", bmi: 22.8 },
    { id: "M003", name: "Michael Brown", plan: "Gold", status: "Active", expiry: "4/22/2026", weight: "80 kg", bmi: 24.7 }
];

export const trainers = [
    { id: "T001", name: "Alex Martinez", specialization: "Yoga", rate: 60, totalSessions: 8, earnings: 500, todaySession: { class: "Yoga", time: "08:00 AM", client: "John Smith" } },
    { id: "T002", name: "Jessica Lee", specialization: "HIIT", rate: 70, totalSessions: 1, earnings: 570, todaySession: { class: "HIIT", time: "06:00 PM", client: "Michael Brown" } }
];