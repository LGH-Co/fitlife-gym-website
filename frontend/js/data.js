// frontend/js/data.js

const WORKOUT_PROGRAMS = [
  'Powerlifting 101', 'HIIT', 'Yoga', 'Zumba',
  'Mobility Fix', 'Boxing', 'Swim Endurance'
];

// We will eventually replace these with your MongoDB Cloud data!
let retentionData = [
  { month: 'Jan', rate: 92 }, { month: 'Feb', rate: 88 },
  { month: 'Mar', rate: 91 }, { month: 'Apr', rate: 90 },
  { month: 'May', rate: 93 }, { month: 'Jun', rate: 94 }
];

let peakHoursData = [
  { hour: '6 AM',  count: 28 }, { hour: '8 AM',  count: 45 },
  { hour: '10 AM', count: 31 }, { hour: '12 PM', count: 33 },
  { hour: '2 PM',  count: 20 }, { hour: '4 PM',  count: 38 },
  { hour: '6 PM',  count: 58 }, { hour: '8 PM',  count: 46 }
];

// 1. Initialize empty arrays
let members = [];
let trainers = [];
let classesData = []; 
let paymentsData = [];
let payoutsData = [];
let auditLogsData = [];

// 2. Fetch and map Members from MySQL
async function loadMembers() {
    try {
        const res = await fetch('http://localhost/fitlife-gym/backend/api/get_members.php');
        const json = await res.json();
        
        if (json.status === 'success') {
            // PHP is already formatting the data perfectly. 
            // We just ensure IDs are strings so your Edit/Delete buttons don't break.
            members = json.data.map(m => ({
                ...m,
                id: String(m.id),
                memberId: String(m.memberId)
            }));
            
            console.log("🟢 Members Loaded:", members.length);
            
            // Auto-refresh the table instantly if you are on the Members tab
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab && activeTab.dataset.tab === 'members') {
                if (typeof renderAdminView === 'function') renderAdminView('members');
            }
        } else {
            console.error("🔴 Backend Error:", json.message);
        }
    } catch (e) { 
        console.error("🔴 Failed to parse members JSON:", e); 
    }
}

// 3. Fetch and map Trainers from MySQL
async function loadTrainers() {
    try {
        const res = await fetch('http://localhost/fitlife-gym/backend/api/get_trainers.php');
        const json = await res.json();
        if (json.status === 'success') {
            trainers = json.data.map(dbT => ({
                trainerId: dbT.trainer_id,
                id: 'T' + dbT.trainer_id.toString().padStart(3, '0'),
                rfid: dbT.rfid.toString(),
                name: `${dbT.first_name} ${dbT.last_name}`,
                phone: dbT.phone || '',
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
                classId: dbC.class_id,
                id: dbC.class_id,
                name: dbC.class_name,
                trainer: `${dbC.trainer_first} ${dbC.trainer_last}`,
                startsAt: new Date(dbC.starts_at).toLocaleString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric', 
                    hour: 'numeric', minute: '2-digit', hour12: true 
                }),
                duration: dbC.duration_minutes,
                capacity: dbC.capacity,
                bookedCount: dbC.booked_count,
                location: dbC.location
            }));
            console.log("🟢 Classes Loaded:", classesData.length);
        }
    } catch (e) { console.error("🔴 Failed to load classes:", e); }
}

// 5. Fetch and Aggregate Attendance Logs from MongoDB Cloud
async function loadAttendanceData() {
    try {
        const res = await fetch('http://localhost/fitlife-gym/backend/api/get_attendance.php');
        const json = await res.json();
        
        if (json.status === 'success' && json.data) {
            const logs = json.data;
            
            // Create empty bins for our dashboard chart
            let hourCounts = { '6 AM': 0, '8 AM': 0, '10 AM': 0, '12 PM': 0, '2 PM': 0, '4 PM': 0, '6 PM': 0, '8 PM': 0 };

            // Loop through every single MongoDB log
            logs.forEach(log => {
                // Safely extract the timestamp (handling different MongoDB date formats)
                let logDateStr = log.timestamp || log.check_in_time || log.date || log.created_at;
                
                // If MongoDB returned an extended JSON $date object, extract the string
                if (logDateStr && typeof logDateStr === 'object' && logDateStr.$date) {
                    logDateStr = logDateStr.$date;
                }
                
                if (!logDateStr) return; 

                // Convert to a JS Date object and extract the hour (0-23)
                const dateObj = new Date(logDateStr);
                const hour = dateObj.getHours();

                // Sort the check-in into the correct UI bucket
                if      (hour >= 5  && hour < 7)  hourCounts['6 AM']++;
                else if (hour >= 7  && hour < 9)  hourCounts['8 AM']++;
                else if (hour >= 9  && hour < 11) hourCounts['10 AM']++;
                else if (hour >= 11 && hour < 13) hourCounts['12 PM']++;
                else if (hour >= 13 && hour < 15) hourCounts['2 PM']++;
                else if (hour >= 15 && hour < 17) hourCounts['4 PM']++;
                else if (hour >= 17 && hour < 19) hourCounts['6 PM']++;
                else if (hour >= 19 || hour < 5)  hourCounts['8 PM']++;
            });

            // Overwrite the global peakHoursData array with our live MongoDB calculations!
            peakHoursData = Object.keys(hourCounts).map(hourLabel => ({
                hour: hourLabel,
                count: hourCounts[hourLabel]
            }));

            console.log("🟢 MongoDB Attendance Analyzed! Total logs:", logs.length);
        }
    } catch (e) { 
        console.error("🔴 Failed to load MongoDB attendance:", e); 
    }
}
// 6. Fetch Member Payments
async function loadPayments() {
  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/get_payments.php');
    const json = await res.json();
    if (json.status === 'success') {
      paymentsData = json.data;
    }
  } catch (e) { console.error("Error loading payments:", e); }
}

async function loadPayouts() {
  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/get_payouts.php');
    const json = await res.json();
    if (json.status === 'success') {
      payoutsData = json.data;
    }
  } catch (e) { console.error("Error loading payouts:", e); }
}

// 8. Fetch Forensic Audit Logs from MongoDB
async function loadAuditLogs() {
    try {
        const res = await fetch('http://localhost/fitlife-gym/backend/api/get_audit_logs.php');
        const json = await res.json();
        if (json.status === 'success') {
            // Map the MongoDB keys to the UI keys
            auditLogsData = json.data.map(log => ({
                timestamp: log.timestamp,
                admin: log.admin || log.actor_id,
                action: log.action,
                target: log.target || log.target_rfid,
                details: log.details
            }));
            console.log("🟢 Forensic Logs Loaded:", auditLogsData.length);
        }
    } catch (e) { console.error("🔴 Failed to load audit logs:", e); }
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

function formatPhpCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(Number(value) || 0);
}
// Load all data sources as soon as the script runs
Promise.all([
    loadMembers(), 
    loadTrainers(), 
    loadClasses(), 
    loadAttendanceData(),
    loadPayments(), 
    loadPayouts(),
    loadAuditLogs()
]).then(() => {
    console.log("✅ All Live Database Systems Connected!");
});