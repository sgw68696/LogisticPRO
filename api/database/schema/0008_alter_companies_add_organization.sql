-- Add organization_id to companies table
ALTER TABLE `companies` 
ADD COLUMN `organization_id` INT UNSIGNED NULL AFTER `uuid`,
ADD COLUMN `created_by` INT UNSIGNED NULL AFTER `verified_at`,
ADD COLUMN `updated_by` INT UNSIGNED NULL AFTER `created_by`,
ADD INDEX idx_companies_organization_id (`organization_id`);

-- Add foreign key constraint for organization_id
ALTER TABLE `companies` 
ADD CONSTRAINT `fk_companies_organization` 
FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE;

-- Add foreign key constraints for audit fields
ALTER TABLE `companies` 
ADD CONSTRAINT `fk_companies_created_by` 
FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

ALTER TABLE `companies` 
ADD CONSTRAINT `fk_companies_updated_by` 
FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;
