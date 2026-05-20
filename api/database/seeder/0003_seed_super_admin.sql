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
  `status`,
  `approval_status`
) VALUES (
  UUID(),
  NULL,
  (SELECT id FROM roles WHERE slug = 'superadmin'),
  'System',
  'Admin',
  'admin@logisticpro.com',
  'superadmin',
  '$2a$12$GhXwlpZTEyy9x8ED.vDJa.yg11rnQ2hjnfnCaeVqI1lKychJHaThW',
  CURRENT_TIMESTAMP,
  'active',
  'approved'
);

//Username: superadmin
//Email: admin@logisticpro.com
//Password: Admin@123
