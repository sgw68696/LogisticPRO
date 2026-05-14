/database/sql/seeder/0003_seed_super_admin.sql
-- Seed Super Admin user with initial credentials
-- Password is hashed version of 'Admin@123' (using bcrypt)
INSERT INTO `users` (
  `uuid`,
  `company_id`,
  `role_id`,
  `first_name`,
  `last_name`,
  `email`,
  `username`,
  `password`,
  `email_verified_at`,
  `status`
) VALUES (
  UUID(),
  NULL,
  (SELECT id FROM roles WHERE slug = 'superadmin'),
  'System',
  'Admin',
  'admin@logisticpro.com',
  'superadmin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u2D', -- Admin@123
  CURRENT_TIMESTAMP,
  'active'
);

//Username: superadmin
//Email: admin@logisticpro.com
//Password: Admin@123
