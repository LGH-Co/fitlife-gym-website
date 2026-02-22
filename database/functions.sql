-- ===============
-- trigger block
-- ==============
-- blocking expired members 

DELIMITER //

CREATE TRIGGER tg_block_expired_members
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_end_date DATE;

    SELECT MAX(end_date) INTO v_end_date 
    FROM membership 
    WHERE member_id = NEW.member_id AND status = 'active';

    IF v_end_date IS NULL OR v_end_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Access Denied: Member has no active or valid membership.';
    END IF;
END //

DELIMITER ;

-- ==================
--       CRUD
-- ==================
-- create member account

DELIMITER //

CREATE PROCEDURE Create_Member_Account(
    IN p_rfid BIGINT UNSIGNED,
    IN p_first_name VARCHAR(50),
    IN p_middle_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_phone VARCHAR(20),
    IN p_email VARCHAR(120),
    IN p_plan_id INT,
    IN p_duration_months INT
)
BEGIN
    DECLARE v_member_id INT;
    
    INSERT INTO members (rfid, first_name, middle_name, last_name, phone, email, join_date)
    VALUES (p_rfid, p_first_name, p_middle_name, p_last_name, p_phone, p_email, CURDATE());
    
    SET v_member_id = LAST_INSERT_ID();

    INSERT INTO membership (member_id, membership_plan_id, start_date, end_date, status)
    VALUES (v_member_id, p_plan_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL p_duration_months MONTH), 'active');
    
    SELECT v_member_id AS New_Member_ID;
END //

DELIMITER ;
-- =================
--   soft delete
-- ================
DELIMITER //

CREATE PROCEDURE Deactivate_Trainer(IN p_trainer_id INT)
BEGIN
    UPDATE trainers 
    SET is_active = 0 
    WHERE trainer_id = p_trainer_id; 
END //

DELIMITER ;

-- ===================
-- automated clean up
-- ===================
-- stored procedure for automatically moving all expired members to expired status preventing freeloader
CREATE PROCEDURE Membership_Cleanup()
BEGIN
    UPDATE membership 
    SET status = 'expired' 
    WHERE end_date < CURDATE() AND status = 'active';
END //

-- ==============
-- trigger block
-- ==============
  
-- this trigger block if a silver tries to book a session, it will block the logs 
DELIMITER //

CREATE TRIGGER gold_tier
BEFORE INSERT ON sessions
FOR EACH ROW
BEGIN
    DECLARE v_tier_name VARCHAR(20);

    -- Joins membership to membership_type to find the tier name
    SELECT mt.type_name INTO v_tier_name
    FROM membership m
    JOIN membership_plan mp ON m.membership_plan_id = mp.membership_plan_id
    JOIN membership_type mt ON mp.membership_type_id = mt.membership_type_id
    WHERE m.member_id = NEW.member_id 
      AND m.status = 'active'
    LIMIT 1;

    IF v_tier_name = 'Silver' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Access Denied: Silver members are not allowed to book personal trainers.';
    END IF;
END //

DELIMITER ;

-- =========================
-- trainer payout calculator
-- =========================
CREATE VIEW vw_trainer_payroll AS
SELECT 
    CONCAT(t.first_name, ' ', IFNULL(t.middle_name, ''), ' ', t.last_name) AS trainer_full_name,
    COUNT(s.session_id) AS sessions_conducted,
    SUM(st.base_monthly_price * 0.5) AS total_commission
FROM trainers t
JOIN sessions s ON t.trainer_id = s.trainer_id
JOIN service_type st ON s.service_type_id = st.service_type_id
WHERE s.status = 'completed'
GROUP BY t.trainer_id;

-- ==============================
-- function for schedule checking 
-- ===============================
-- This function checks if the class is full capacity

DELIMITER //

CREATE FUNCTION Is_Class_Full(p_class_id INT) 
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_capacity INT;
    DECLARE v_booked INT;
    
    SELECT capacity INTO v_capacity FROM classes WHERE class_id = p_class_id;
    SELECT COUNT(*) INTO v_booked FROM bookings WHERE class_id = p_class_id AND status = 'booked';
    
    RETURN v_booked >= v_capacity;
END //

DELIMITER ;

-- ================================
-- Trainer Workload view
-- =================================
-- allows the admin to see which trainers are overbooked or underutilized.
CREATE OR REPLACE VIEW trainer_workload AS
SELECT 
    CONCAT(t.first_name, ' ', IFNULL(t.middle_name, ''), ' ', t.last_name) AS trainer_full_name, 
    COUNT(s.session_id) AS active_sessions,
    COUNT(c.class_id) AS assigned_classes
FROM trainers t
LEFT JOIN sessions s ON t.trainer_id = s.trainer_id AND s.status = 'scheduled'
LEFT JOIN classes c ON t.trainer_id = c.trainer_id
GROUP BY t.trainer_id;

-- ===============================
-- RFID-Based Attendance Logger
-- ===============================
-- allows the owner to log a scan simply by passing the rfid.

DELIMITER //

CREATE PROCEDURE Log_RFID(IN p_rfid BIGINT UNSIGNED)
BEGIN
    DECLARE v_member_id INT;
    DECLARE v_trainer_id INT;
    DECLARE v_role ENUM('Member','Trainer');

  
    SELECT member_id, 'Member' 
        INTO v_member_id, v_role 
        FROM members 
        WHERE rfid = p_rfid;
    
    IF v_member_id IS NULL THEN
        SELECT trainer_id, 'Trainer' 
        INTO v_trainer_id, v_role 
        FROM trainers
        WHERE rfid = p_rfid;
    END IF;

    IF v_member_id IS NOT NULL OR v_trainer_id IS NOT NULL THEN
        INSERT INTO attendance_logs (role, member_id, trainer_id, rfid, action, status, timestamp)
        VALUES (v_role, v_member_id, v_trainer_id, p_rfid, 'Entry', 'Success', NOW());
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unregistered RFID Tag.';
    END IF;
END //

DELIMITER ;