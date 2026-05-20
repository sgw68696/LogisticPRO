-- Add organization_id to users table
ALTER TABLE `users` 
ADD COLUMN `organization_id` INT UNSIGNED NULL AFTER `company_id`,
ADD COLUMN `approval_status` ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'approved' AFTER `status`,
ADD COLUMN `approved_at` TIMESTAMP NULL AFTER `approval_status`,
ADD COLUMN `approved_by` INT UNSIGNED NULL AFTER `approved_at`,
ADD COLUMN `created_by` INT UNSIGNED NULL AFTER `password_changed_at`,
ADD COLUMN `updated_by` INT UNSIGNED NULL AFTER `created_by`,
ADD INDEX idx_users_organization_id (`organization_id`),
ADD INDEX idx_users_approval_status (`approval_status`);

-- Modify company_id to be nullable (it already is, but ensuring consistency)
ALTER TABLE `users` 
MODIFY COLUMN `company_id` INT UNSIGNED NULL COMMENT 'NULL for Super Admin and Organization Users';

-- Modify role_id to be nullable for flexibility
ALTER TABLE `users` 
MODIFY COLUMN `role_id` INT UNSIGNED NULL COMMENT 'NULL until assigned to organization or company';

-- Add foreign key constraint for organization_id
ALTER TABLE `users` 
ADD CONSTRAINT `fk_users_organization` 
FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE;

-- Add foreign key constraint for approved_by
ALTER TABLE `users` 
ADD CONSTRAINT `fk_users_approved_by` 
FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- Add foreign key constraints for audit fields
ALTER TABLE `users` 
ADD CONSTRAINT `fk_users_created_by` 
FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

ALTER TABLE `users` 
ADD CONSTRAINT `fk_users_updated_by` 
FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;
