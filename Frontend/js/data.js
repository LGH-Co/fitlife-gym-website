const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

const WORKOUT_PROGRAMS = [
  'Powerlifting 101', 'HIIT', 'Yoga', 'Zumba',
  'Mobility Fix', 'Boxing', 'Swim Endurance'
];

let members = [
  {
    id: 'M001', rfid: 'M001', name: 'John Smith', contact: 'john@example.com',
    plan: 'Gold', status: 'active', expiry: '4/7/2026',
    height: 175, weight: 75, bmi: 24.5, targetWeight: 70,
    metricsUpdatedAt: '2/10/2026',
    loggedIn: false, loginTime: null,
    sessions: [
      { program: 'Yoga',             time: '08:00 AM', trainer: 'Alex Martinez', status: 'Scheduled' },
      { program: 'Strength Training',time: '10:00 AM', trainer: 'Ryan Cooper',   status: 'Scheduled' }
    ]
  },
  {
    id: 'M002', rfid: 'M002', name: 'Sarah Johnson', contact: 'sarah@example.com',
    plan: 'Silver', status: 'active', expiry: '3/8/2026',
    height: 162, weight: 62, bmi: 22.8, targetWeight: 58,
    metricsUpdatedAt: '2/5/2026',
    loggedIn: false, loginTime: null, sessions: []
  },
  {
    id: 'M003', rfid: 'M003', name: 'Michael Brown', contact: 'michael@example.com',
    plan: 'Gold', status: 'active', expiry: '4/22/2026',
    height: 180, weight: 80, bmi: 24.7, targetWeight: 75,
    metricsUpdatedAt: '2/14/2026',
    loggedIn: false, loginTime: null,
    sessions: [
      { program: 'HIIT', time: '06:00 PM', trainer: 'Jessica Lee', status: 'Scheduled' }
    ]
  },
  {
    id: 'M004', rfid: 'M004', name: 'Emily Davis', contact: 'emily@example.com',
    plan: 'Silver', status: 'active', expiry: '2/26/2026',
    height: 158, weight: 58, bmi: 22.1, targetWeight: 55,
    metricsUpdatedAt: '1/28/2026',
    loggedIn: false, loginTime: null, sessions: []
  },
  {
    id: 'M005', rfid: 'M005', name: 'David Wilson', contact: 'david@example.com',
    plan: 'Silver', status: 'banned', expiry: '2/11/2026',
    height: 178, weight: 85, bmi: 26.8, targetWeight: 78,
    metricsUpdatedAt: '1/15/2026',
    loggedIn: false, loginTime: null, sessions: []
  },
  {
    id: 'M006', rfid: 'M006', name: 'Lance', contact: 'lance@example.com',
    plan: 'Silver', status: 'active', expiry: '3/23/2026',
    height: 170, weight: 70, bmi: 22.0, targetWeight: 68,
    metricsUpdatedAt: '2/18/2026',
    loggedIn: false, loginTime: null, sessions: []
  }
];

let trainers = [
  {
    id: 'T001', rfid: 'T001', name: 'Alex Martinez', specialization: 'Yoga',
    ratePerSession: 60, loggedIn: false, clockInTime: null,
    sessions: [{ program: 'Yoga', time: '08:00 AM', client: 'John Smith', month: 2, year: 2026 }],
    totalSessions: 1, earningsByMonth: { '2026-2': 60 }
  },
  {
    id: 'T002', rfid: 'T002', name: 'Jessica Lee', specialization: 'HIIT',
    ratePerSession: 70, loggedIn: false, clockInTime: null,
    sessions: [{ program: 'HIIT', time: '06:00 PM', client: 'Michael Brown', month: 2, year: 2026 }],
    totalSessions: 1, earningsByMonth: { '2026-2': 70 }
  },
  {
    id: 'T003', rfid: 'T003', name: 'Ryan Cooper', specialization: 'Powerlifting 101',
    ratePerSession: 65, loggedIn: false, clockInTime: null,
    sessions: [{ program: 'Powerlifting 101', time: '10:00 AM', client: 'John Smith', month: 2, year: 2026 }],
    totalSessions: 1, earningsByMonth: { '2026-2': 65 }
  }
];

const retentionData = [
  { month: 'Jan', rate: 92 }, { month: 'Feb', rate: 88 },
  { month: 'Mar', rate: 91 }, { month: 'Apr', rate: 90 },
  { month: 'May', rate: 93 }, { month: 'Jun', rate: 94 }
];

const peakHoursData = [
  { hour: '6 AM',  count: 28 }, { hour: '8 AM',  count: 45 },
  { hour: '10 AM', count: 31 }, { hour: '12 PM', count: 33 },
  { hour: '2 PM',  count: 20 }, { hour: '4 PM',  count: 38 },
  { hour: '6 PM',  count: 58 }, { hour: '8 PM',  count: 46 }
];

function getTrainerEarnings(trainer, filterMonth) {
  if (filterMonth === 'all') return trainer.totalSessions * trainer.ratePerSession;
  return trainer.earningsByMonth[filterMonth] || 0;
}

function getFilteredSessions(trainer, filterMonth) {
  if (filterMonth === 'all') return trainer.totalSessions;
  const [year, month] = filterMonth.split('-').map(Number);
  return trainer.sessions.filter(s => s.month === month && s.year === year).length;
}