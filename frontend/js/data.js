// frontend/js/data.js

const WORKOUT_PROGRAMS = [
  'Powerlifting 101', 'HIIT', 'Yoga', 'Zumba',
  'Mobility Fix', 'Boxing', 'Swim Endurance'
];

// We will eventually replace these with your MongoDB Cloud data!
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

// 1. Initialize empty arrays
let members = [];
let trainers = [];
let classesData = []; // NEW: Array to hold your class schedule

// 2. Fetch and map Members from MySQL
async function loadMembers() {
    try {
        const res = await fetch('http://localhost/fitlife-gym/backend/api/get_members.php');
        const json = await res.json();
        if (json.status === 'success') {
            members = json.data.map(dbM => ({
                id: 'M' + dbM.member_id.toString().padStart(3, '0'),
                rfid: dbM.rfid.toString(),
                
                // Keep raw data isolated for the Edit Modal
                firstName: dbM.first_name,
                lastName: dbM.last_name,
                phone: dbM.phone || '', // Handle nulls safely if phone is empty
                email: dbM.email,
                
                // Combined string for the Main Table display
                name: `${dbM.first_name} ${dbM.last_name}`,
                contact: `${dbM.email} | ${dbM.phone || 'No Phone'}`, 
                
                // Defaulting to the new DB plans
                plan: 'Basic - 1 Month', 
                status: 'active',
                expiry: '12/31/2026',
                height: 170, weight: 70, bmi: 24.2, targetWeight: 65,
                metricsUpdatedAt: dbM.join_date,
                loggedIn: false, loginTime: null, sessions: []
            }));
            console.log("🟢 Members Loaded with expanded fields:", members.length);
        }
    } catch (e) { console.error("🔴 Failed to load members:", e); }
}

// 3. Fetch and map Trainers from MySQL
async function loadTrainers() {
    try {
        const res = await fetch('http://localhost/fitlife-gym/backend/api/get_trainers.php');
        const json = await res.json();
        if (json.status === 'success') {
            trainers = json.data.map(dbT => ({
                id: 'T' + dbT.trainer_id.toString().padStart(3, '0'),
                rfid: dbT.rfid.toString(),
                name: `${dbT.first_name} ${dbT.last_name}`,
                specialization: dbT.specialization,
                ratePerSession: 60,
                loggedIn: false, clockInTime: null,
                sessions: [], totalSessions: 0, earningsByMonth: {}
            }));
            console.log("🟢 Trainers Loaded:", trainers.length);
        }
    } catch (e) { console.error("🔴 Failed to load trainers:", e); }
}

// 4. NEW: Fetch and map Classes from MySQL
async function loadClasses() {
    try {
        const res = await fetch('http://localhost/fitlife-gym/backend/api/get_classes.php');
        const json = await res.json();
        if (json.status === 'success') {
            classesData = json.data.map(dbC => ({
                id: dbC.class_id,
                name: dbC.class_name,
                trainer: `${dbC.trainer_first} ${dbC.trainer_last}`,
                startsAt: new Date(dbC.starts_at).toLocaleString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric', 
                    hour: 'numeric', minute: '2-digit', hour12: true 
                }),
                duration: dbC.duration_minutes,
                capacity: dbC.capacity,
                location: dbC.location
            }));
            console.log("🟢 Classes Loaded:", classesData.length);
        }
    } catch (e) { console.error("🔴 Failed to load classes:", e); }
}

// Utility functions for UI
function getTrainerEarnings(trainer, filterMonth) {
  if (filterMonth === 'all') return trainer.totalSessions * trainer.ratePerSession;
  return trainer.earningsByMonth[filterMonth] || 0;
}

function getFilteredSessions(trainer, filterMonth) {
  if (filterMonth === 'all') return trainer.totalSessions;
  const [year, month] = filterMonth.split('-').map(Number);
  return trainer.sessions.filter(s => s.month === month && s.year === year).length;
}

// 5. UPDATED: Load everything as soon as the script runs
Promise.all([loadMembers(), loadTrainers(), loadClasses()]).then(() => {
    console.log("✅ All Live Database Systems Connected!");
});