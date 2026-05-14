/database/sql/rollback/0001_rollback_users_table.sql
-- Rollback users table
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `users`;