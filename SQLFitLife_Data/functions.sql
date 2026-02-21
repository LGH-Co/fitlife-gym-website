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

-- =========================
-- trainer payouts function
-- =========================

DELIMITER //

CREATE PROCEDURE Get_Trainer_Payroll_Report(
    IN p_StartDate DATE,
    IN p_EndDate DATE
)
BEGIN
    SELECT 
        t.full_name AS 'Trainer Name',
        t.specialization AS 'Specialty',
        COUNT(s.session_id) AS 'Total Sessions',
        SUM(st.base_monthly_price * 0.4) AS 'Estimated Payout (40% Commission)' 
    FROM trainers t
    LEFT JOIN sessions s ON t.trainer_id = s.trainer_id
    LEFT JOIN service_type st ON s.service_type_id = st.service_type_id
    WHERE s.starts_at BETWEEN p_StartDate AND p_EndDate
      AND s.status = 'completed'
    GROUP BY t.trainer_id
    ORDER BY 'Estimated Payout (40% Commission)' DESC;
END //

DELIMITER ;

-- ==================
--       CRUD
-- ==================
-- create member account

DELIMITER //

CREATE PROCEDURE Create_Member_Account(
    IN p_full_name VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_email VARCHAR(120),
    IN p_plan_id INT,
    IN p_duration_months INT
)
BEGIN
    DECLARE v_member_id INT;
    
    INSERT INTO members (full_name, phone, email, join_date)
    VALUES (p_full_name, p_phone, p_email, CURDATE());
    
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

CREATE TRIGGER tg_enforce_gold_tier
BEFORE INSERT ON sessions
FOR EACH ROW
BEGIN
    DECLARE v_tier_name VARCHAR(20);

    SELECT mt.type_name INTO v_tier_name
    FROM membership m
    JOIN membership_plan mp ON m.membership_plan_id = mp.membership_plan_id
    JOIN membership_type mt ON mp.membership_type_id = mt.membership_type_id
    WHERE m.member_id = NEW.member_id 
      AND m.status = 'active'
    LIMIT 1;

    -- if the tier is 'Silver', they are forbidden from booking personal sessions
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
    t.full_name,
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
CREATE VIEW trainer_workload AS
SELECT 
    t.full_name, 
    COUNT(s.session_id) AS active_sessions,
    COUNT(c.class_id) AS assigned_classes
FROM trainers t
LEFT JOIN sessions s ON t.trainer_id = s.trainer_id AND s.status = 'scheduled'
LEFT JOIN classes c ON t.trainer_id = c.trainer_id
GROUP BY t.trainer_id;


