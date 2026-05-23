-- Rollback companies table alterations
ALTER TABLE `companies` 
DROP FOREIGN KEY `fk_companies_organization`,
DROP FOREIGN KEY `fk_companies_created_by`,
DROP FOREIGN KEY `fk_companies_updated_by`,
DROP INDEX `idx_companies_organization_id`,
DROP COLUMN `organization_id`,
DROP COLUMN `created_by`,
DROP COLUMN `updated_by`;
