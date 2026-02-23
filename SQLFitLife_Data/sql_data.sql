USE fitlife_gym;

START TRANSACTION;

INSERT INTO admin_account (username, password, role)
VALUES
('admin', 'hashed_password_here', 'super_admin'),
('staff1', 'hashed_password_here', 'staff');

INSERT INTO service_type (service_type_id, service_name, description, base_monthly_price)
VALUES
(1, 'Gym Access', 'Unlimited gym access', 999.00),
(2, 'Personal Training', '1-on-1 training session', 2500.00),
(3, 'Group Class', 'Instructor-led group class', 500.00);

INSERT INTO membership_type (membership_type_id, type_name, monthly_fee, perks)
VALUES
(1, 'Basic', 999.00, 'Gym access during staffed hours'),
(2, 'Premium', 1499.00, 'Gym access + free group classes');

INSERT INTO membership_plan (membership_plan_id, membership_type_id, plan_name, duration_months, price, is_active)
VALUES
(1, 1, 'Silver - 1 Month', 1, 999.00, 1),
(2, 1, 'Silver - 3 Months', 3, 2799.00, 1),
(3, 2, 'Gold - 1 Month', 1, 1499.00, 1),
(4, 2, 'Gold - 12 Months', 12, 15999.00, 1);

INSERT INTO members (member_id, rfid, first_name, middle_name, last_name, phone, email, join_date)
VALUES
(1, 1363725009, 'Juan', NULL, 'Dela Cruz', '09171234567', 'juan@example.com', '2026-01-10'),
(2, 3329519694, 'Maria', NULL, 'Santos', '09981234567', 'maria@example.com', '2026-02-01');

INSERT INTO trainers (trainer_id, rfid, first_name, middle_name, last_name, phone, email, specialization, hire_date, is_active)
VALUES
(1, 1363680737, 'Alex', NULL, 'Reyes', '09170001111', 'alex@fitlife.com', 'Strength & Conditioning', '2025-10-15', 1),
(2, 2000000002, 'Bea', NULL, 'Lim', '09170002222', 'bea@fitlife.com', 'Yoga & Mobility', '2025-11-01', 1);

INSERT INTO classes (class_id, class_name, service_type_id, trainer_id, starts_at, duration_minutes, capacity, location)
VALUES
(1, 2000000002, 'Bea', NULL, 'Lim', '09170002222', 'bea@fitlife.com', 'Yoga & Mobility', '2025-11-01', 1),
(2, 1474791848, 'Jordan', 'Lee', 'Smith', '09000000102', 'jsmith@fitlife.local', 'Strength Training', '2025-11-05', 1),
(3, 1585802959, 'Sarah', NULL, 'Chen', '09000000103', 'schen@fitlife.local', 'Yoga & Mindfulness', '2025-11-10', 1),
(4, 1696913060, 'Marcus', 'Aurelius', 'Vance', '09000000104', 'mvance@fitlife.local', 'HIIT', '2025-11-12', 1),
(5, 1707024171, 'Elena', 'Rose', 'Rodriguez', '09000000105', 'erodriguez@fitlife.local', 'Cardio Recovery', '2025-11-15', 1),
(6, 1818135282, 'David', NULL, 'Kim', '09000000106', 'dkim@fitlife.local', 'Powerlifting', '2025-11-20', 1),
(7, 1929246393, 'Maya', 'Grace', 'Thompson', '09000000107', 'mthompson@fitlife.local', 'Nutrition Coaching', '2025-11-22', 1),
(8, 2030357404, 'Julian', 'Blake', 'Foster', '09000000108', 'jfoster@fitlife.local', 'Athletic Performance', '2025-11-25', 1),
(9, 2141468515, 'Sophia', NULL, 'Martinez', '09000000109', 'smartinez@fitlife.local', 'Pilates', '2025-11-28', 1),
(10, 2252579626, 'Liam', 'James', 'O-Brian', '09000000110', 'lobrian@fitlife.local', 'Functional Fitness', '2025-12-01', 0);

INSERT INTO membership (membership_id, member_id, membership_plan_id, start_date, end_date, status)
VALUES
(1, 1, 3, '2026-02-01', '2026-03-01', 'active'),
(2, 2, 1, '2026-02-01', '2026-03-01', 'active');

INSERT INTO bookings (booking_id, member_id, class_id, status, notes)
VALUES
(1, 1, 1, 'booked', 'First time yoga'),
(2, 2, 2, 'booked', NULL);

INSERT INTO sessions (session_id, member_id, trainer_id, service_type_id, starts_at, duration_minutes, status, notes)
VALUES
(1, 1, 1, 2, '2026-02-26 10:00:00', 60, 'scheduled', 'Strength assessment'),
(2, 2, 1, 2, '2026-02-26 11:30:00', 60, 'scheduled', 'Beginner program');

INSERT INTO payments (payment_id, member_id, membership_id, booking_id, session_id, amount, method, reference_no)
VALUES
(1, 1, 1, NULL, NULL, 1499.00, 'gcash', 'GCASH-0001'),
(2, 2, 2, NULL, NULL, 999.00, 'cash', NULL),
(3, 1, NULL, 1, NULL, 500.00, 'card', 'CARD-1234'),
(4, 1, NULL, NULL, 1, 2500.00, 'bank_transfer', 'BT-0009');

INSERT INTO trainer_payouts (payout_id, trainer_id, session_id, class_id, amount, status)
VALUES
(1, 1, 1, NULL, 1000.00, 'pending'),
(2, 2, NULL, 1, 300.00, 'pending');

COMMIT;
