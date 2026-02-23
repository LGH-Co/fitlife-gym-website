USE fitlife_gym;

START TRANSACTION;

INSERT INTO admin_account (username, password, role) VALUES
('admin', 'admin123', 'super_admin'),
('staff1', 'staff123', 'staff');


INSERT INTO service_type (service_type_id, service_name, description, base_monthly_price)
VALUES
(1, 'Gym Access', 'Unlimited gym access', 999.00),
(2, 'Personal Training', '1-on-1 training session', 2500.00),
(3, 'Group Class', 'Instructor-led group class', 500.00);

INSERT INTO membership_type (membership_type_id, type_name, monthly_fee, perks)
VALUES
(1, 'Silver', 999.00, 'Gym access only'),
(2, 'Gold', 1499.00, 'Gym access with trainer + free group classes');

INSERT INTO membership_plan (membership_plan_id, membership_type_id, plan_name, duration_months, price, is_active)
VALUES
(1, 1, 'Silver - 1 Month', 1, 999.00, 1),
(2, 1, 'Silver - 3 Months', 3, 2799.00, 1),
(3, 2, 'Gold - 1 Month', 1, 1499.00, 1),
(4, 2, 'Gold - 12 Months', 12, 15999.00, 1);

INSERT INTO members (member_id, rfid, first_name, middle_name, last_name, phone, email, join_date)
VALUES
(1, 1363725009, 'Juan', NULL, 'Dela Cruz', '09171234567', 'juan@example.com', '2026-01-10'),
(2, 3329519694, 'Maria', NULL, 'Santos', '09981234567', 'maria@example.com', '2026-02-01'),
(3, 1234567890, 'Carlos', NULL, 'Garcia', '09179876543', 'carlos@example.com', '2026-02-15'),
(4, 2023340006, 'Member4', NULL, 'User', '09170000004', 'member4@fitlife.local', '2026-02-01'),
(5, 2024140121, 'Member5', NULL, 'User', '09170000005', 'member5@fitlife.local', '2026-02-01'),
(6, 2024140253, 'Member6', NULL, 'User', '09170000006', 'member6@fitlife.local', '2026-02-01'),
(7, 2024140997, 'Member7', NULL, 'User', '09170000007', 'member7@fitlife.local', '2026-02-01'),
(8, 2023140108, 'Member8', NULL, 'User', '09170000008', 'member8@fitlife.local', '2026-02-01'),
(9, 2024140009, 'Member9', NULL, 'User', '09170000009', 'member9@fitlife.local', '2026-02-01'),
(10, 2024140210, 'Member10', NULL, 'User', '09170000010', 'member10@fitlife.local', '2026-02-01'),
(11, 2023140111, 'Member11', NULL, 'User', '09170000011', 'member11@fitlife.local', '2026-02-01'),
(12, 2024140212, 'Member12', NULL, 'User', '09170000012', 'member12@fitlife.local', '2026-02-01'),
(13, 2024140013, 'Member13', NULL, 'User', '09170000013', 'member13@fitlife.local', '2026-02-01'),
(14, 2023140114, 'Member14', NULL, 'User', '09170000014', 'member14@fitlife.local', '2026-02-01'),
(15, 2024140215, 'Member15', NULL, 'User', '09170000015', 'member15@fitlife.local', '2026-02-01'),
(16, 2024140116, 'Member16', NULL, 'User', '09170000016', 'member16@fitlife.local', '2026-02-01'),
(17, 2023140017, 'Member17', NULL, 'User', '09170000017', 'member17@fitlife.local', '2026-02-01'),
(18, 2024140118, 'Member18', NULL, 'User', '09170000018', 'member18@fitlife.local', '2026-02-01'),
(19, 2024140219, 'Member19', NULL, 'User', '09170000019', 'member19@fitlife.local', '2026-02-01'),
(20, 2023140020, 'Member20', NULL, 'User', '09170000020', 'member20@fitlife.local', '2026-02-01'),
(21, 2024140022, 'Member21', NULL, 'User', '09170000021', 'member21@fitlife.local', '2026-02-01'),
(22, 2023140223, 'Member22', NULL, 'User', '09170000022', 'member22@fitlife.local', '2026-02-01'),
(23, 2024140124, 'Member23', NULL, 'User', '09170000023', 'member23@fitlife.local', '2026-02-01'),
(24, 2024140025, 'Member24', NULL, 'User', '09170000024', 'member24@fitlife.local', '2026-02-01'),
(25, 3317109822, 'Member25', NULL, 'User', '09170000025', 'member25@fitlife.local', '2026-02-01');

INSERT INTO trainers (trainer_id, rfid, first_name, middle_name, last_name, phone, email, specialization, hire_date, is_active)
VALUES
(1, 1363680737, 'Alex', NULL, 'Reyes', '09170001111', 'alex@fitlife.com', 'Strength & Conditioning', '2025-10-15', 1),
(2, 2000000002, 'Bea', NULL, 'Lim', '09170002222', 'bea@fitlife.com', 'Yoga & Mobility', '2025-11-01', 1);

INSERT INTO classes (class_id, class_name, service_type_id, trainer_id, starts_at, duration_minutes, capacity, location)
VALUES
(1, 'Morning Yoga', 3, 2, '2026-02-25 08:00:00', 60, 20, 'Studio A'),
(2, 'HIIT Express', 3, 1, '2026-02-25 18:00:00', 45, 25, 'Studio B');

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