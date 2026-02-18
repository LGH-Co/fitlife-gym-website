CREATE DATABASE IF NOT EXISTS fitlife_gym;
USE fitlife_gym;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS admin_account;
DROP TABLE IF EXISTS trainer_payouts;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS membership;
DROP TABLE IF EXISTS membership_plan;
DROP TABLE IF EXISTS membership_type;
DROP TABLE IF EXISTS service_type;
DROP TABLE IF EXISTS trainers;
DROP TABLE IF EXISTS members;

SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE admin_account (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(120),
    join_date DATE NOT NULL
);


CREATE TABLE trainers (
    trainer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(120),
    specialization VARCHAR(80),
    hire_date DATE NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_date DATE NOT NULL DEFAULT (CURRENT_DATE)
);


CREATE TABLE service_type (
    service_type_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    base_monthly_price DECIMAL(10,2),
    created_date DATE NOT NULL DEFAULT (CURRENT_DATE)
);


CREATE TABLE membership_type (
    membership_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(20) NOT NULL,
    monthly_fee DECIMAL(10,2),
    perks TEXT,
    created_date DATE NOT NULL DEFAULT (CURRENT_DATE)
);


CREATE TABLE membership_plan (
    membership_plan_id INT AUTO_INCREMENT PRIMARY KEY,
    membership_type_id INT NOT NULL,
    plan_name VARCHAR(40) NOT NULL,
    duration_months INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT fk_plan_type
        FOREIGN KEY (membership_type_id) REFERENCES membership_type(membership_type_id)
);


CREATE TABLE membership (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    membership_plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active','expired','cancelled') NOT NULL DEFAULT 'active',
    created_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT fk_membership_member
        FOREIGN KEY (member_id) REFERENCES members(member_id),
    CONSTRAINT fk_membership_plan
        FOREIGN KEY (membership_plan_id) REFERENCES membership_plan(membership_plan_id)
);


CREATE TABLE classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(80) NOT NULL,
    service_type_id INT NOT NULL,
    trainer_id INT,
    starts_at DATETIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    capacity INT NOT NULL DEFAULT 20,
    location VARCHAR(80),
    CONSTRAINT fk_class_service
        FOREIGN KEY (service_type_id) REFERENCES service_type(service_type_id),
    CONSTRAINT fk_class_trainer
        FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
);


CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    class_id INT NOT NULL,
    booked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('booked','cancelled','attended','no_show') NOT NULL DEFAULT 'booked',
    notes VARCHAR(255),
    CONSTRAINT fk_booking_member
        FOREIGN KEY (member_id) REFERENCES members(member_id),
    CONSTRAINT fk_booking_class
        FOREIGN KEY (class_id) REFERENCES classes(class_id),
    UNIQUE KEY uq_member_class (member_id, class_id)
);


CREATE TABLE sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    trainer_id INT NOT NULL,
    service_type_id INT NOT NULL,
    starts_at DATETIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    status ENUM('scheduled','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
    notes VARCHAR(255),
    CONSTRAINT fk_session_member
        FOREIGN KEY (member_id) REFERENCES members(member_id),
    CONSTRAINT fk_session_trainer
        FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id),
    CONSTRAINT fk_session_service
        FOREIGN KEY (service_type_id) REFERENCES service_type(service_type_id)
);


CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    membership_id INT NULL,
    booking_id INT NULL,
    session_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method ENUM('cash','gcash','card','bank_transfer','other') NOT NULL DEFAULT 'cash',
    reference_no VARCHAR(60),
    CONSTRAINT fk_payment_member
        FOREIGN KEY (member_id) REFERENCES members(member_id),
    CONSTRAINT fk_payment_membership
        FOREIGN KEY (membership_id) REFERENCES membership(membership_id),
    CONSTRAINT fk_payment_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    CONSTRAINT fk_payment_session
        FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);


CREATE TABLE trainer_payouts (
    payout_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT NOT NULL,
    session_id INT NULL,
    class_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payout_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending','paid','void') NOT NULL DEFAULT 'pending',
    CONSTRAINT fk_payout_trainer
        FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id),
    CONSTRAINT fk_payout_session
        FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    CONSTRAINT fk_payout_class
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
);
