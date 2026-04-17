-- db/seed.sql
-- Seed users with password123

INSERT INTO users (name, email, password_hash, role, is_admin, subscription_plan, salary, feature_flags)
VALUES
('Admin User', 'admin@corpauth.dev', '$2a$10$gP3yN8g1zB7S7a5Q3m4yEO.yM/sD2Y3/VfGvO5yR3K/6/L.O8S/u', 'admin', TRUE, 'enterprise', 150000.00, '{"debug": true, "beta": true}'),
('Manager User', 'manager@corpauth.dev', '$2a$10$gP3yN8g1zB7S7a5Q3m4yEO.yM/sD2Y3/VfGvO5yR3K/6/L.O8S/u', 'manager', FALSE, 'pro', 90000.00, '{"beta": true}'),
('Regular User', 'user@corpauth.dev', '$2a$10$gP3yN8g1zB7S7a5Q3m4yEO.yM/sD2Y3/VfGvO5yR3K/6/L.O8S/u', 'user', FALSE, 'free', 50000.00, '{}');
