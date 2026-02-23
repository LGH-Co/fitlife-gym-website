CREATE DATABASE IF NOT EXISTS fitlife_gym;
USE fitlife_gym;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS
admin_audit_logs,
attendance_logs,
health_history,
body_metrics,
trainer_payouts,
payments,
sessions,
bookings,
classes,
membership,
membership_plan,
membership_type,
service_type,
trainers,
members,
admin_account;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE admin_account (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'staff') NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    rfid BIGINT UNSIGNED NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(120),
    join_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_members_email (email),
    INDEX idx_members_rfid (rfid)
) ENGINE=InnoDB;

CREATE TABLE trainers (
    trainer_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NULL,
    rfid BIGINT UNSIGNED NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(120),
    specialization VARCHAR(80),
    hire_date DATE NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_trainers_email (email),
    INDEX idx_trainers_admin_id (admin_id),
    INDEX idx_trainers_rfid (rfid),
    CONSTRAINT fk_trainers_admin
        FOREIGN KEY (admin_id) REFERENCES admin_account(admin_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE service_type (
    service_type_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    base_monthly_price DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE membership_type (
    membership_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(20) NOT NULL UNIQUE,
    monthly_fee DECIMAL(10,2),
    perks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE membership_plan (
    membership_plan_id INT AUTO_INCREMENT PRIMARY KEY,
    membership_type_id INT NOT NULL,
    plan_name VARCHAR(40) NOT NULL UNIQUE,
    duration_months INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_type
        FOREIGN KEY (membership_type_id) REFERENCES membership_type(membership_type_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE membership (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NULL,
    member_id INT NOT NULL,
    membership_plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active','expired','cancelled') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_membership_admin_id (admin_id),
    INDEX idx_membership_member_id (member_id),
    INDEX idx_membership_plan_id (membership_plan_id),
    CONSTRAINT fk_membership_admin
        FOREIGN KEY (admin_id) REFERENCES admin_account(admin_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_membership_member
        FOREIGN KEY (member_id) REFERENCES members(member_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_membership_plan
        FOREIGN KEY (membership_plan_id) REFERENCES membership_plan(membership_plan_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(80) NOT NULL,
    service_type_id INT NOT NULL,
    trainer_id INT NULL,
    starts_at DATETIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    capacity INT NOT NULL DEFAULT 20,
    location VARCHAR(80),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_classes_start (starts_at),
    INDEX idx_classes_service_type_id (service_type_id),
    INDEX idx_classes_trainer_id (trainer_id),
    CONSTRAINT fk_class_service
        FOREIGN KEY (service_type_id) REFERENCES service_type(service_type_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_class_trainer
        FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NULL,
    member_id INT NOT NULL,
    class_id INT NOT NULL,
    booked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('booked','cancelled','attended','no_show') NOT NULL DEFAULT 'booked',
    notes VARCHAR(255),
    UNIQUE KEY uq_member_class (member_id, class_id),
    INDEX idx_bookings_admin_id (admin_id),
    INDEX idx_bookings_member_id (member_id),
    INDEX idx_bookings_class_id (class_id),
    CONSTRAINT fk_booking_admin
        FOREIGN KEY (admin_id) REFERENCES admin_account(admin_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_booking_member
        FOREIGN KEY (member_id) REFERENCES members(member_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_booking_class
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    trainer_id INT NOT NULL,
    service_type_id INT NOT NULL,
    starts_at DATETIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    status ENUM('scheduled','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sessions_start (starts_at),
    INDEX idx_sessions_member_id (member_id),
    INDEX idx_sessions_trainer_id (trainer_id),
    INDEX idx_sessions_service_type_id (service_type_id),
    CONSTRAINT fk_session_member
        FOREIGN KEY (member_id) REFERENCES members(member_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_session_trainer
        FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_session_service
        FOREIGN KEY (service_type_id) REFERENCES service_type(service_type_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NULL,
    member_id INT NOT NULL,
    membership_id INT NULL,
    booking_id INT NULL,
    session_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method ENUM('cash','gcash','card','bank_transfer','other') NOT NULL DEFAULT 'cash',
    reference_no VARCHAR(60),
    INDEX idx_payments_datetime (payment_datetime),
    INDEX idx_payments_admin_id (admin_id),
    INDEX idx_payments_member_id (member_id),
    INDEX idx_payments_membership_id (membership_id),
    INDEX idx_payments_booking_id (booking_id),
    INDEX idx_payments_session_id (session_id),
    CONSTRAINT fk_payment_admin
        FOREIGN KEY (admin_id) REFERENCES admin_account(admin_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_payment_member
        FOREIGN KEY (member_id) REFERENCES members(member_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_payment_membership
        FOREIGN KEY (membership_id) REFERENCES membership(membership_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_payment_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_payment_session
        FOREIGN KEY (session_id) REFERENCES sessions(session_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE trainer_payouts (
    payout_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT NOT NULL,
    session_id INT NULL,
    class_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payout_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending','paid','void') NOT NULL DEFAULT 'pending',
    INDEX idx_payouts_trainer_id (trainer_id),
    INDEX idx_payouts_session_id (session_id),
    INDEX idx_payouts_class_id (class_id),
    CONSTRAINT fk_payout_trainer
        FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_payout_session
        FOREIGN KEY (session_id) REFERENCES sessions(session_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_payout_class
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE body_metrics (
    body_metrics_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    rfid BIGINT UNSIGNED NOT NULL,
    weight DECIMAL(6,2),
    height INT,
    bmi DECIMAL(5,2),
    target_weight DECIMAL(6,2),
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_body_metrics_member (member_id),
    INDEX idx_body_metrics_rfid (rfid),
    CONSTRAINT fk_body_metrics_member
        FOREIGN KEY (member_id) REFERENCES members(member_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_body_metrics_rfid
        FOREIGN KEY (rfid) REFERENCES members(rfid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE health_history (
    health_history_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    rfid BIGINT UNSIGNED NOT NULL,
    log_date DATE NOT NULL,
    type VARCHAR(30) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_health_history_member (member_id),
    INDEX idx_health_history_rfid (rfid),
    CONSTRAINT fk_health_history_member
        FOREIGN KEY (member_id) REFERENCES members(member_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_health_history_rfid
        FOREIGN KEY (rfid) REFERENCES members(rfid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE attendance_logs (
    attendance_log_id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('Member','Trainer') NOT NULL,
    member_id INT NULL,
    trainer_id INT NULL,
    rfid BIGINT UNSIGNED NOT NULL,
    action VARCHAR(30) NOT NULL,
    status VARCHAR(30),
    log_datetime DATETIME NOT NULL,
    INDEX idx_attendance_rfid (rfid),
    INDEX idx_attendance_log_datetime (log_datetime),
    INDEX idx_attendance_member_id (member_id),
    INDEX idx_attendance_trainer_id (trainer_id),
    CONSTRAINT fk_attendance_member
        FOREIGN KEY (member_id) REFERENCES members(member_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_attendance_trainer
        FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE admin_audit_logs (
    audit_id VARCHAR(40) PRIMARY KEY,
    log_datetime DATETIME NOT NULL,
    actor_id VARCHAR(40) NOT NULL,
    action VARCHAR(60) NOT NULL,
    target_rfid BIGINT UNSIGNED NULL,
    details JSON,
    INDEX idx_audit_log_datetime (log_datetime),
    INDEX idx_audit_target_rfid (target_rfid)
) ENGINE=InnoDB;
