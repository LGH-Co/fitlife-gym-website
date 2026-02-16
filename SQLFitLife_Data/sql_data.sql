USE fitlife_gym;

CREATE TABLE IF NOT EXISTS admin_account (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
TRUNCATE TABLE admin_account;
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

INSERT INTO admin_account (username, password) VALUES
('admin', 'admin123'),
('manager', 'fitlife2024');

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

