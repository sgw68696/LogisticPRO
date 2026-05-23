-- Rollback users table alterations
ALTER TABLE `users` 
DROP FOREIGN KEY `fk_users_organization`,
DROP FOREIGN KEY `fk_users_approved_by`,
DROP FOREIGN KEY `fk_users_created_by`,
DROP FOREIGN KEY `fk_users_updated_by`,
DROP INDEX `idx_users_organization_id`,
DROP INDEX `idx_users_approval_status`,
DROP COLUMN `organization_id`,
DROP COLUMN `approval_status`,
DROP COLUMN `approved_at`,
DROP COLUMN `approved_by`,
DROP COLUMN `created_by`,
DROP COLUMN `updated_by`;
