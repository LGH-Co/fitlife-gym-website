// Data extracted from PDF [cite: 18-48, 69]
export const members = [
    { id: "M001", name: "John Smith", plan: "Gold", status: "active", expiry: "4/7/2026", weight: "75 kg", bmi: 24.5, sessions: [{name: "Yoga", time: "08:00 AM"}, {name: "Strength Training", time: "10:00 AM"}] },
    { id: "M002", name: "Sarah Johnson", plan: "Silver", status: "active", expiry: "3/8/2026", weight: "62 kg", bmi: 22.8, sessions: [] },
    { id: "M003", name: "Michael Brown", plan: "Gold", status: "inactive", expiry: "4/22/2026", weight: "80 kg", bmi: 24.7, sessions: [] },
    { id: "M004", name: "Emily Davis", plan: "Gold", status: "active", expiry: "2/26/2026", weight: "50 kg", bmi: 22.1, sessions: [] },
    { id: "M005", name: "David Wilson", plan: "Silver", status: "inactive", expiry: "2/11/2026", weight: "85 kg", bmi: 26.8, sessions: [] },
    { id: "M006", name: "Lance", plan: "Silver", status: "inactive", expiry: "3/23/2026", weight: "70 kg", bmi: 22.0, sessions: [] }
];

export const trainers = [
    { id: "T001", name: "Alex Martinez", specialization: "Yoga", rate: 60, earnings: 500, todaySession: { class: "Yoga", time: "08:00 AM", client: "John Smith" } },
    { id: "T002", name: "Jessica Lee", specialization: "HIIT", rate: 70, earnings: 570, todaySession: { class: "HIIT", time: "06:00 PM", client: "Michael Brown" } },
    { id: "T003", name: "Ryan Cooper", specialization: "Strength Training", rate: 65, earnings: 565, todaySession: null }
];