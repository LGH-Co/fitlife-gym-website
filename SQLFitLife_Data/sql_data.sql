USE fitlife_gym;

CREATE TABLE IF NOT EXISTS members (
    member_id INT PRIMARY KEY,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    join_date DATE,
    rfid VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS member_workout_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    program_name VARCHAR(100),
    exercises TEXT,
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

CREATE TABLE IF NOT EXISTS health_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    rfid VARCHAR(50),
    blood_type VARCHAR(5),
    conditions TEXT,
    allergies TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

CREATE TABLE IF NOT EXISTS body_metrics (
    metric_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    date DATE,
    rfid VARCHAR(50),
    weight_kg DECIMAL(5,2),
    body_fat_pct DECIMAL(5,2),
    muscle_mass_kg DECIMAL(5,2),
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

CREATE TABLE IF NOT EXISTS attendance_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NULL,
    staff_id INT NULL,
    trainer_id INT NULL,
    role VARCHAR(50),
    rfid VARCHAR(50),
    action VARCHAR(50),
    timestamp DATETIME,
    status VARCHAR(50),
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

CREATE TABLE IF NOT EXISTS trainers (
    trainer_id INT PRIMARY KEY,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    hire_date DATE
);

CREATE TABLE IF NOT EXISTS service_type (
    service_type_id INT PRIMARY KEY,
    service_name VARCHAR(50),
    description TEXT
);

CREATE TABLE IF NOT EXISTS membership_type (
    membership_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50),
    monthly_fee DECIMAL(10, 2),
    perks TEXT
);

CREATE TABLE IF NOT EXISTS membership_plan (
    membership_plan_id INT AUTO_INCREMENT PRIMARY KEY,
    membership_type_id INT,
    plan_name VARCHAR(50),
    duration_months INT,
    price DECIMAL(10, 2),
    FOREIGN KEY (membership_type_id) REFERENCES membership_type(membership_type_id)
);

CREATE TABLE IF NOT EXISTS membership (
    membership_id INT PRIMARY KEY,
    member_id INT,
    membership_plan_id INT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20),
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (membership_plan_id) REFERENCES membership_plan(membership_plan_id)
);

CREATE TABLE IF NOT EXISTS classes (
    class_id INT PRIMARY KEY,
    class_name VARCHAR(100),
    service_type_id INT,
    trainer_id INT,
    starts_at DATETIME,
    duration_minutes INT,
    capacity INT,
    location VARCHAR(100),
    FOREIGN KEY (service_type_id) REFERENCES service_type(service_type_id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT PRIMARY KEY,
    member_id INT,
    class_id INT,
    booked_at DATETIME,
    status VARCHAR(20),
    notes TEXT,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    trainer_id INT,
    service_type_id INT,
    starts_at DATETIME,
    ends_at DATETIME,
    status VARCHAR(20),
    notes TEXT,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id),
    FOREIGN KEY (service_type_id) REFERENCES service_type(service_type_id)
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id INT PRIMARY KEY,
    member_id INT,
    membership_id INT,
    booking_id INT,
    session_id INT,
    amount DECIMAL(10, 2),
    payment_date DATE,
    method VARCHAR(50),
    reference_no VARCHAR(50),
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (membership_id) REFERENCES membership(membership_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS trainer_payouts (
    payout_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT,
    amount DECIMAL(10, 2),
    payout_date DATE,
    period_start DATE,
    period_end DATE,
    status VARCHAR(20),
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
);

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE attendance_logs;
TRUNCATE TABLE body_metrics;
TRUNCATE TABLE health_history;
TRUNCATE TABLE member_workout_details;
TRUNCATE TABLE trainer_payouts;
TRUNCATE TABLE payments;
TRUNCATE TABLE sessions;
TRUNCATE TABLE bookings;
TRUNCATE TABLE classes;
TRUNCATE TABLE membership;
TRUNCATE TABLE membership_plan;
TRUNCATE TABLE membership_type;
TRUNCATE TABLE service_type;
TRUNCATE TABLE trainers;
TRUNCATE TABLE members;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO membership_type (type_name, monthly_fee, perks) VALUES
('Gold', 2500.00, 'Unlimited classes, Priority booking'),
('Silver', 1500.00, 'Limited classes, Standard booking');

INSERT INTO membership_plan (membership_type_id, plan_name, duration_months, price) VALUES
(1,'Monthly',1,2500.00),
(2,'Monthly',1,1500.00),
(1,'Annual',12,30000.00),
(2,'Annual',12,18000.00);

INSERT INTO members (member_id, full_name, phone, email, join_date, rfid) VALUES
(1,'Dingdong Dantes','0917-100-0001','dingdongdantes@example.com','2024-01-15','2024-140210'),
(2,'Marian Rivera','0917-100-0002','marianrivera@example.com','2024-02-01','2024-140125'),
(3,'Ogie Alcasid','0917-100-0003','ogiealcasid@example.com','2024-06-01','2024-140144'),
(4,'Regine Velasquez','0917-100-0004','reginevelasquez@example.com','2024-03-10','2023-340006'),
(5,'Vhong Navarro','0917-100-0005','vhongnavarro@example.com','2024-07-01','2024-140121'),
(6,'Anne Curtis','0917-100-0006','annecurtis@example.com','2024-05-20','2024-140253'),
(7,'Jhong Hilario','0917-100-0007','jhonghilario@example.com','2024-08-15','2024-140997'),
(8,'Vice Ganda','0917-100-0008','viceganda@example.com','2024-01-01','2023-140108'),
(9,'Karylle Yuzon','0917-100-0009','karylleyuzon@example.com','2024-09-01','2024-140009'),
(10,'Teddy Corpuz','0917-100-0010','teddycorpuz@example.com','2023-12-01','2024-140210'),
(11,'Jugs Jugueta','0917-100-0011','jugsjugueta@example.com','2024-01-01','2023-140111'),
(12,'Ryan Bang','0917-100-0012','ryanbang@example.com','2024-11-01','2024-140212'),
(13,'Ion Perez','0917-100-0013','ionperez@example.com','2024-10-15','2024-140013'),
(14,'Jackie Gonzaga','0917-100-0014','jackiegonzaga@example.com','2024-02-14','2023-140114'),
(15,'Lassy Marquez','0917-100-0015','lassymarquez@example.com','2024-05-01','2024-140215'),
(16,'MC Muah','0917-100-0016','mcmuah@example.com','2024-05-01','2024-140116'),
(17,'Cianne Dominguez','0917-100-0017','ciannedominguez@example.com','2024-12-01','2023-140017'),
(18,'Kim Chiu','0917-100-0018','kimchiu@example.com','2024-06-15','2024-140118'),
(19,'Paulo Avelino','0917-100-0019','pauloavelino@example.com','2024-06-20','2024-140219'),
(20,'JM De Guzman','0917-100-0020','jmdeguzman@example.com','2024-01-10','2023-140020'),
(21,'Barbie Forteza','0917-100-0021','barbieforteza@example.com','2024-08-01','2024-140121'),
(22,'David Licauco','0917-100-0022','davidlicauco@example.com','2024-09-01','2024-140022'),
(23,'Jak Roberto','0917-100-0023','jakroberto@example.com','2024-02-01','2023-140223'),
(24,'Ruru Madrid','0917-100-0024','rurumadrid@example.com','2024-03-01','2024-140124'),
(25,'Bianca Umali','0917-100-0025','biancaumali@example.com','2024-04-01','2024-140025');

INSERT INTO member_workout_details (member_id, program_name, exercises) VALUES
(1, 'Weight Loss', 'Treadmill (20 mins), Squats (3 sets, 15 reps)'),
(2, 'Muscle Gain', 'Bench Press (4 sets, 10 reps), Deadlift (3 sets, 8 reps)'),
(3, 'Cardio Blast', 'Jump Rope (15 mins)'),
(4, 'Yoga Flow', 'Sun Salutation (10 reps)'),
(5, 'Powerlifting', 'Back Squat (5 sets, 5 reps)'),
(6, 'Full Body', 'Pushups (3 sets, 20 reps)'),
(7, 'Endurance', 'Cycling (45 mins)'),
(8, 'Abs Core', 'Plank (3 mins)'),
(9, 'Boxer Routine', 'Heavy Bag (15 mins)'),
(10, 'Senior Fit', 'Walking (30 mins)'),
(11, 'HIIT', 'Burpees (4 sets, 20 reps)'),
(12, 'Leg Day', 'Leg Press (4 sets, 12 reps)'),
(13, 'Pull Day', 'Pullups (3 sets, 8 reps)'),
(14, 'Push Day', 'Shoulder Press (3 sets, 10 reps)'),
(15, 'Swimming', 'Laps (20 mins)'),
(16, 'Marathon Prep', 'Run (10km)'),
(17, 'Calisthenics', 'Muscle Ups (3 sets, 5 reps)'),
(18, 'Quick Burn', 'Jumping Jacks (100 reps)'),
(19, 'Rehab', 'Stretching (15 mins)'),
(20, 'Zumba', 'Dance (60 mins)'),
(21, 'Hypertrophy', 'Bicep Curls (4 sets, 15 reps)'),
(22, 'Explosive', 'Box Jumps (3 sets, 10 reps)'),
(23, 'Kettlebell', 'Swings (4 sets, 20 reps)'),
(24, 'Pilates', 'Mat work (45 mins)'),
(25, 'Arm Day', 'Tricep Dips (3 sets, 12 reps)');

INSERT INTO health_history (member_id, rfid, blood_type, conditions, allergies, emergency_contact_name, emergency_contact_phone) VALUES
(1, '2024-140210', 'O+', 'Asthma', 'Peanuts', 'Marian Rivera', '09171000002'),
(2, '2024-140125', 'A-', 'None', 'None', 'Dingdong Dantes', '09171000001'),
(3, '2024-140144', 'B+', 'Back Pain', 'Dust', 'Michelle Van', '09171000999'),
(4, '2023-340006', 'O-', 'None', 'Dairy', 'Jose Mari', '09171000888'),
(5, '2024-140121', 'AB+', 'Scoliosis', 'None', 'Ana K', '09171000777'),
(6, '2024-140253', 'O+', 'Migraine', 'Shellfish', 'Erwan H', '09171000666'),
(7, '2024-140997', 'A+', 'None', 'Eggs', 'Matteo G', '09171000555'),
(8, '2023-140108', 'B-', 'Knee Injury', 'None', 'Vice G', '09171000444'),
(9, '2024-140009', 'O-', 'Anemia', 'Latex', 'Billy C', '09171000333'),
(10, '2024-140210', 'A+', 'None', 'Soy', 'Coleen G', '09171000222'),
(11, '2023-140111', 'B+', 'Diabetes T2', 'None', 'Luis M', '09171000111'),
(12, '2024-140212', 'O+', 'None', 'Gluten', 'Jessy M', '09171000123'),
(13, '2024-140013', 'A-', 'Heart Murmur', 'Nuts', 'Gary V', '09171000321'),
(14, '2023-140114', 'B-', 'None', 'Penicillin', 'Angeline Q', '09171000456'),
(15, '2024-140215', 'O-', 'Hernia', 'None', 'Erik S', '09171000654'),
(16, '2024-140116', 'AB-', 'Asthma', 'Pollen', 'Morissette', '09171000789'),
(17, '2023-140017', 'A+', 'None', 'Dogs', 'Coco M', '09171000987'),
(18, '2024-140118', 'B+', 'Shoulder dislocation', 'None', 'Julia M', '09171000567'),
(19, '2024-140219', 'O+', 'None', 'Cat dander', 'Gerald A', '09171000432'),
(20, '2023-140020', 'A-', 'Low BP', 'Chocolate', 'Bea A', '09171000210'),
(21, '2024-140121', 'B-', 'None', 'None', 'Piolo P', '09171000345'),
(22, '2024-140022', 'O-', 'Tennis Elbow', 'Aspirin', 'John L', '09171000678'),
(23, '2023-140223', 'AB+', 'None', 'None', 'Angel L', '09171000890'),
(24, '2024-140124', 'A+', 'Insomnia', 'None', 'Jericho R', '09171000901'),
(25, '2024-140025', 'B+', 'None', 'Strawberries', 'Zanjoe M', '09171000012');

INSERT INTO body_metrics (member_id, date, rfid, weight_kg, body_fat_pct, muscle_mass_kg) VALUES
(1, '2026-02-10', '2024-140210', 75.5, 18.2, 35.0),
(2, '2026-02-10', '2024-140125', 62.1, 22.5, 28.4),
(3, '2026-02-11', '2024-140144', 85.0, 25.1, 38.0),
(4, '2026-02-11', '2023-340006', 70.2, 19.5, 32.1),
(5, '2026-02-12', '2024-140121', 55.4, 28.0, 20.5),
(6, '2026-02-12', '2024-140253', 90.1, 30.2, 39.1),
(7, '2026-02-12', '2024-140997', 68.5, 15.0, 33.0),
(8, '2026-02-13', '2023-140108', 77.3, 17.5, 35.2),
(9, '2026-02-13', '2024-140009', 80.0, 20.0, 36.0),
(10, '2026-02-13', '2024-140210', 65.4, 24.1, 29.5),
(11, '2026-02-14', '2023-140111', 72.0, 18.0, 34.0),
(12, '2026-02-14', '2024-140212', 88.5, 22.0, 39.5),
(13, '2026-02-14', '2024-140013', 60.0, 14.5, 30.1),
(14, '2026-02-15', '2023-140114', 74.2, 16.2, 35.8),
(15, '2026-02-15', '2024-140215', 82.5, 19.1, 37.0),
(16, '2026-02-15', '2024-140116', 58.2, 26.3, 21.4),
(17, '2026-02-16', '2023-140017', 95.0, 32.1, 40.0),
(18, '2026-02-16', '2024-140118', 67.3, 14.0, 33.2),
(19, '2026-02-16', '2024-140219', 79.1, 18.5, 36.5),
(20, '2026-02-17', '2023-140020', 71.0, 17.2, 34.1),
(21, '2026-02-17', '2024-140121', 84.4, 21.0, 38.2),
(22, '2026-02-17', '2024-140022', 63.5, 13.5, 32.0),
(23, '2026-02-18', '2023-140223', 76.2, 17.8, 35.9),
(24, '2026-02-18', '2024-140124', 69.1, 19.1, 31.5),
(25, '2026-02-18', '2024-140025', 81.0, 20.5, 37.1);

INSERT INTO attendance_logs (member_id, staff_id, trainer_id, role, rfid, action, timestamp, status) VALUES
(1, NULL, NULL, 'Member', '2024-140210', 'check-in', '2026-02-10 08:00:00', 'Success'),
(2, NULL, NULL, 'Member', '2024-140125', 'check-in', '2026-02-10 08:15:00', 'Success'),
(3, NULL, NULL, 'Member', '2024-140144', 'check-in', '2026-02-10 08:30:00', 'Success'),
(4, NULL, NULL, 'Member', '2023-340006', 'check-in', '2026-02-10 09:00:00', 'Success'),
(5, NULL, NULL, 'Member', '2024-140121', 'check-in', '2026-02-10 10:00:00', 'Success'),
(NULL, 501, NULL, 'Receptionist', '2024-140R99', 'duty-start', '2026-02-10 07:00:00', 'Success'),
(6, NULL, NULL, 'Member', '2024-140253', 'check-in', '2026-02-10 11:00:00', 'Success'),
(7, NULL, NULL, 'Member', '2024-140997', 'check-in', '2026-02-10 12:00:00', 'Success'),
(NULL, NULL, 101, 'Trainer', '2024-140084', 'check-in', '2026-02-10 12:30:00', 'Success'),
(8, NULL, NULL, 'Member', '2023-140108', 'check-in', '2026-02-10 13:00:00', 'Success'),
(9, NULL, NULL, 'Member', '2024-140009', 'check-in', '2026-02-10 14:30:00', 'Success'),
(10, NULL, NULL, 'Member', '2024-140210', 'check-in', '2026-02-10 16:00:00', 'Success'),
(11, NULL, NULL, 'Member', '2023-140111', 'check-in', '2026-02-10 17:00:00', 'Success'),
(12, NULL, NULL, 'Member', '2024-140212', 'check-in', '2026-02-10 17:30:00', 'Success'),
(13, NULL, NULL, 'Member', '2024-140013', 'check-in', '2026-02-10 18:00:00', 'Success'),
(14, NULL, NULL, 'Member', '2023-140114', 'check-in', '2026-02-10 19:00:00', 'Success'),
(15, NULL, NULL, 'Member', '2024-140215', 'check-in', '2026-02-11 08:00:00', 'Success'),
(16, NULL, NULL, 'Member', '2024-140116', 'check-in', '2026-02-11 09:00:00', 'Success'),
(17, NULL, NULL, 'Member', '2023-140017', 'check-in', '2026-02-11 10:00:00', 'Success'),
(18, NULL, NULL, 'Member', '2024-140118', 'check-in', '2026-02-11 11:00:00', 'Success'),
(19, NULL, NULL, 'Member', '2024-140219', 'check-in', '2026-02-11 12:00:00', 'Success'),
(20, NULL, NULL, 'Member', '2023-140020', 'check-in', '2026-02-11 15:00:00', 'Success'),
(21, NULL, NULL, 'Member', '2024-140121', 'check-in', '2026-02-11 17:00:00', 'Success'),
(22, NULL, NULL, 'Member', '2024-140022', 'check-in', '2026-02-11 18:00:00', 'Success'),
(23, NULL, NULL, 'Member', '2023-140223', 'check-in', '2026-02-11 19:00:00', 'Success'),
(24, NULL, NULL, 'Member', '2024-140124', 'check-in', '2026-02-12 08:00:00', 'Success'),
(25, NULL, NULL, 'Member', '2024-140025', 'check-in', '2026-02-12 09:30:00', 'Success'),
(1, NULL, NULL, 'Member', '2024-140210', 'check-out', '2026-02-10 10:00:00', 'Success'),
(2, NULL, NULL, 'Member', '2024-140125', 'check-out', '2026-02-10 09:45:00', 'Success'),
(3, NULL, NULL, 'Member', '2024-140144', 'check-out', '2026-02-10 10:15:00', 'Success'),
(4, NULL, NULL, 'Member', '2023-340006', 'check-out', '2026-02-10 11:00:00', 'Success'),
(5, NULL, NULL, 'Member', '2024-140121', 'check-out', '2026-02-10 11:30:00', 'Success'),
(NULL, 501, NULL, 'Receptionist', '2024-140R99', 'duty-end', '2026-02-10 15:00:00', 'Success'),
(6, NULL, NULL, 'Member', '2024-140253', 'check-out', '2026-02-10 12:30:00', 'Success'),
(7, NULL, NULL, 'Member', '2024-140997', 'check-out', '2026-02-10 13:45:00', 'Success'),
(NULL, NULL, 101, 'Trainer', '2024-140084', 'check-out', '2026-02-10 16:00:00', 'Success'),
(8, NULL, NULL, 'Member', '2023-140108', 'check-out', '2026-02-10 14:30:00', 'Success'),
(9, NULL, NULL, 'Member', '2024-140009', 'check-out', '2026-02-10 16:00:00', 'Success'),
(10, NULL, NULL, 'Member', '2024-140210', 'check-out', '2026-02-10 17:30:00', 'Success'),
(11, NULL, NULL, 'Member', '2023-140111', 'check-out', '2026-02-10 18:45:00', 'Success'),
(12, NULL, NULL, 'Member', '2024-140212', 'check-out', '2026-02-10 19:00:00', 'Success'),
(13, NULL, NULL, 'Member', '2024-140013', 'check-out', '2026-02-10 20:00:00', 'Success'),
(14, NULL, NULL, 'Member', '2023-140114', 'check-out', '2026-02-10 20:30:00', 'Success'),
(15, NULL, NULL, 'Member', '2024-140215', 'check-out', '2026-02-11 10:00:00', 'Success'),
(16, NULL, NULL, 'Member', '2024-140116', 'check-out', '2026-02-11 11:00:00', 'Success'),
(17, NULL, NULL, 'Member', '2023-140017', 'check-out', '2026-02-11 12:00:00', 'Success'),
(18, NULL, NULL, 'Member', '2024-140118', 'check-out', '2026-02-11 13:30:00', 'Success'),
(19, NULL, NULL, 'Member', '2024-140219', 'check-out', '2026-02-11 14:00:00', 'Success'),
(20, NULL, NULL, 'Member', '2023-140020', 'check-out', '2026-02-11 17:00:00', 'Success'),
(21, NULL, NULL, 'Member', '2024-140121', 'check-out', '2026-02-11 19:00:00', 'Success'),
(22, NULL, NULL, 'Member', '2024-140022', 'check-out', '2026-02-11 19:30:00', 'Success'),
(23, NULL, NULL, 'Member', '2023-140223', 'check-out', '2026-02-11 21:00:00', 'Success'),
(24, NULL, NULL, 'Member', '2024-140124', 'check-out', '2026-02-12 10:00:00', 'Success'),
(25, NULL, NULL, 'Member', '2024-140025', 'check-out', '2026-02-12 11:00:00', 'Success');

INSERT INTO trainers (trainer_id, full_name, phone, email, hire_date) VALUES
(1,'Alex Cruz','0918-200-0001','alexcruz@fitlife.com','2023-01-01'),
(2,'Bianca Reyes','0919-200-0002','biancareyes@fitlife.com','2023-01-01'),
(3,'Carlo Santos','0920-200-0003','carlosantos@fitlife.com','2023-01-01'),
(4,'Dina Lopez','0921-200-0004','dinalopez@fitlife.com','2023-01-01'),
(5,'Ethan Lim','0922-200-0005','ethanlim@fitlife.com','2023-01-01');

INSERT INTO service_type (service_type_id, service_name, description) VALUES
(1,'Abs Core','Core strengthening focus'),
(2,'Arm Day','Bicep and Tricep focus'),
(3,'Boxer Routine','Boxing and conditioning'),
(4,'Calisthenics','Bodyweight training'),
(5,'Cardio Blast','High intensity cardio'),
(6,'Endurance','Stamina and long-form exercise'),
(7,'Explosive','Plyometrics and power'),
(8,'Full Body','Comprehensive muscle engagement'),
(9,'HIIT','High Intensity Interval Training'),
(10,'Hypertrophy','Muscle growth focus'),
(11,'Kettlebell','Functional weighted movement'),
(12,'Leg Day','Lower body strength'),
(13,'Marathon Prep','Running and distance prep'),
(14,'Muscle Gain','Strength and mass focus'),
(15,'Pilates','Control and flexibility'),
(16,'Powerlifting','Heavy lifting focus'),
(17,'Pull Day','Back and bicep focus'),
(18,'Push Day','Chest and tricep focus'),
(19,'Quick Burn','Short, high-intensity workout'),
(20,'Rehab','Recovery and mobility'),
(21,'Senior Fit','Low impact for seniors'),
(22,'Swimming','Water-based cardio'),
(23,'Weight Loss','Fat burning focus'),
(24,'Yoga Flow','Flexibility and mindfulness'),
(25,'Zumba','Dance-based cardio');

INSERT INTO classes (class_id, class_name, service_type_id, trainer_id, starts_at, duration_minutes, capacity, location) VALUES
(1, 'Weight Loss Class', 23, 1, '2026-02-15 06:00:00', 60, 20, 'Main Studio'),
(2, 'Muscle Gain Class', 14, 2, '2026-02-15 07:00:00', 60, 20, 'Main Studio'),
(3, 'Cardio Blast Class', 5, 3, '2026-02-15 08:00:00', 60, 20, 'Main Studio'),
(4, 'Yoga Flow Class', 24, 4, '2026-02-15 09:00:00', 60, 20, 'Main Studio'),
(5, 'Powerlifting Class', 16, 5, '2026-02-15 10:00:00', 60, 20, 'Main Studio'),
(6, 'Full Body Class', 8, 1, '2026-02-15 11:00:00', 60, 20, 'Main Studio'),
(7, 'Endurance Class', 6, 2, '2026-02-15 12:00:00', 60, 20, 'Main Studio'),
(8, 'Abs Core Class', 1, 3, '2026-02-15 13:00:00', 60, 20, 'Main Studio'),
(9, 'Boxer Routine Class', 3, 4, '2026-02-15 14:00:00', 60, 20, 'Main Studio'),
(10, 'Senior Fit Class', 21, 5, '2026-02-15 15:00:00', 60, 20, 'Main Studio'),
(11, 'HIIT Class', 9, 1, '2026-02-16 06:00:00', 60, 20, 'Main Studio'),
(12, 'Leg Day Class', 12, 2, '2026-02-16 07:00:00', 60, 20, 'Main Studio'),
(13, 'Pull Day Class', 17, 3, '2026-02-16 08:00:00', 60, 20, 'Main Studio'),
(14, 'Push Day Class', 18, 4, '2026-02-16 09:00:00', 60, 20, 'Main Studio'),
(15, 'Swimming Class', 22, 5, '2026-02-16 10:00:00', 60, 20, 'Pool Area'),
(16, 'Marathon Prep Class', 13, 1, '2026-02-16 11:00:00', 60, 20, 'Track'),
(17, 'Calisthenics Class', 4, 2, '2026-02-16 12:00:00', 60, 20, 'Outdoor Area'),
(18, 'Quick Burn Class', 19, 3, '2026-02-16 13:00:00', 60, 20, 'Main Studio'),
(19, 'Rehab Class', 20, 4, '2026-02-16 14:00:00', 60, 20, 'Private Room'),
(20, 'Zumba Class', 25, 5, '2026-02-16 15:00:00', 60, 20, 'Main Studio'),
(21, 'Hypertrophy Class', 10, 1, '2026-02-17 06:00:00', 60, 20, 'Main Studio'),
(22, 'Explosive Class', 7, 2, '2026-02-17 07:00:00', 60, 20, 'Main Studio'),
(23, 'Kettlebell Class', 11, 3, '2026-02-17 08:00:00', 60, 20, 'Main Studio'),
(24, 'Pilates Class', 15, 4, '2026-02-17 09:00:00', 60, 20, 'Main Studio'),
(25, 'Arm Day Class', 2, 5, '2026-02-17 10:00:00', 60, 20, 'Main Studio');

INSERT INTO membership (membership_id, member_id, membership_plan_id, start_date, end_date, status) VALUES
(1,1,1,'2024-01-15','2025-01-15','active'),
(2,2,1,'2024-02-01','2025-02-01','active'),
(3,3,2,'2024-06-01','2024-12-01','expired'),
(4,4,1,'2024-03-10','2025-03-10','active'),
(5,5,2,'2024-07-01','2025-01-01','active'),
(6,6,1,'2024-05-20','2025-05-20','active'),
(7,7,2,'2024-08-15','2025-02-15','active'),
(8,8,1,'2024-01-01','2025-01-01','active'),
(9,9,2,'2024-09-01','2025-03-01','active'),
(10,10,2,'2023-12-01','2024-06-01','expired'),
(11,11,2,'2024-01-01','2024-07-01','expired'),
(12,12,1,'2024-11-01','2025-11-01','active'),
(13,13,1,'2024-10-15','2025-10-15','active'),
(14,14,2,'2024-02-14','2024-08-14','expired'),
(15,15,2,'2024-05-01','2024-11-01','expired'),
(16,16,2,'2024-05-01','2024-11-01','expired'),
(17,17,1,'2024-12-01','2025-12-01','active'),
(18,18,1,'2024-06-15','2025-06-15','active'),
(19,19,1,'2024-06-20','2025-06-20','active'),
(20,20,2,'2024-01-10','2024-07-10','expired'),
(21,21,2,'2024-08-01','2025-02-01','active'),
(22,22,1,'2024-09-01','2025-09-01','active'),
(23,23,1,'2024-02-01','2025-02-01','active'),
(24,24,2,'2024-03-01','2024-09-01','expired'),
(25,25,1,'2024-04-01','2025-04-01','active');

INSERT INTO bookings (booking_id, member_id, class_id, booked_at, status, notes) VALUES
(1,1,23,'2026-02-10 08:00:00','attended','Imported from attendance_logs (check-in)'),
(2,2,14,'2026-02-10 08:15:00','attended','Imported from attendance_logs (check-in)'),
(3,3,5,'2026-02-10 08:30:00','attended','Imported from attendance_logs (check-in)'),
(4,4,24,'2026-02-10 09:00:00','attended','Imported from attendance_logs (check-in)'),
(5,5,16,'2026-02-10 10:00:00','attended','Imported from attendance_logs (check-in)'),
(6,6,8,'2026-02-10 11:00:00','attended','Imported from attendance_logs (check-in)'),
(7,7,6,'2026-02-10 12:00:00','attended','Imported from attendance_logs (check-in)'),
(8,8,1,'2026-02-10 13:00:00','attended','Imported from attendance_logs (check-in)'),
(9,9,3,'2026-02-10 14:30:00','attended','Imported from attendance_logs (check-in)'),
(10,10,21,'2026-02-10 16:00:00','attended','Imported from attendance_logs (check-in)'),
(11,11,9,'2026-02-10 17:00:00','attended','Imported from attendance_logs (check-in)'),
(12,12,12,'2026-02-10 17:30:00','attended','Imported from attendance_logs (check-in)'),
(13,13,17,'2026-02-10 18:00:00','attended','Imported from attendance_logs (check-in)'),
(14,14,18,'2026-02-10 19:00:00','attended','Imported from attendance_logs (check-in)'),
(15,15,22,'2026-02-11 08:00:00','attended','Imported from attendance_logs (check-in)'),
(16,16,13,'2026-02-11 09:00:00','attended','Imported from attendance_logs (check-in)'),
(17,17,4,'2026-02-11 10:00:00','attended','Imported from attendance_logs (check-in)'),
(18,18,19,'2026-02-11 11:00:00','attended','Imported from attendance_logs (check-in)'),
(19,19,20,'2026-02-11 12:00:00','attended','Imported from attendance_logs (check-in)'),
(20,20,25,'2026-02-11 15:00:00','attended','Imported from attendance_logs (check-in)'),
(21,21,10,'2026-02-11 17:00:00','attended','Imported from attendance_logs (check-in)'),
(22,22,7,'2026-02-11 18:00:00','attended','Imported from attendance_logs (check-in)'),
(23,23,11,'2026-02-11 19:00:00','attended','Imported from attendance_logs (check-in)'),
(24,24,15,'2026-02-12 08:00:00','attended','Imported from attendance_logs (check-in)');

INSERT INTO payments (payment_id, member_id, membership_id, booking_id, session_id, amount, payment_date, method, reference_no) VALUES
(1,1,1,NULL,NULL,2500.00,'2024-01-15','cash','INIT-001'),
(2,2,2,NULL,NULL,2500.00,'2024-02-01','cash','INIT-002'),
(3,3,3,NULL,NULL,1500.00,'2024-06-01','cash','INIT-003'),
(4,4,4,NULL,NULL,2500.00,'2024-03-10','cash','INIT-004'),
(5,5,5,NULL,NULL,1500.00,'2024-07-01','cash','INIT-005'),
(6,6,6,NULL,NULL,2500.00,'2024-05-20','cash','INIT-006'),
(7,7,7,NULL,NULL,1500.00,'2024-08-15','cash','INIT-007'),
(8,8,8,NULL,NULL,2500.00,'2024-01-01','cash','INIT-008'),
(9,9,9,NULL,NULL,1500.00,'2024-09-01','cash','INIT-009'),
(10,10,10,NULL,NULL,1500.00,'2023-12-01','cash','INIT-010'),
(11,11,11,NULL,NULL,1500.00,'2024-01-01','cash','INIT-011'),
(12,12,12,NULL,NULL,2500.00,'2024-11-01','cash','INIT-012'),
(13,13,13,NULL,NULL,2500.00,'2024-10-15','cash','INIT-013'),
(14,14,14,NULL,NULL,1500.00,'2024-02-14','cash','INIT-014'),
(15,15,15,NULL,NULL,1500.00,'2024-05-01','cash','INIT-015'),
(16,16,16,NULL,NULL,1500.00,'2024-05-01','cash','INIT-016'),
(17,17,17,NULL,NULL,2500.00,'2024-12-01','cash','INIT-017'),
(18,18,18,NULL,NULL,2500.00,'2024-06-15','cash','INIT-018'),
(19,19,19,NULL,NULL,2500.00,'2024-06-20','cash','INIT-019'),
(20,20,20,NULL,NULL,1500.00,'2024-01-10','cash','INIT-020'),
(21,21,21,NULL,NULL,1500.00,'2024-08-01','cash','INIT-021'),
(22,22,22,NULL,NULL,2500.00,'2024-09-01','cash','INIT-022'),
(23,23,23,NULL,NULL,2500.00,'2024-02-01','cash','INIT-023'),
(24,24,24,NULL,NULL,1500.00,'2024-03-01','cash','INIT-024'),
(25,25,25,NULL,NULL,2500.00,'2024-04-01','cash','INIT-025'),
(26,4,4,NULL,NULL,2500.00,'2026-02-11','gcash','AUTO-004'),
(27,12,12,NULL,NULL,500.00,'2026-02-12','cash','BAL-012');
