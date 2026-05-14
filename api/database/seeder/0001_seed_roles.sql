/database/sql/seeder/0001_seed_roles.sql
-- Seed initial system roles based on the role-based menu guide
INSERT INTO `roles` (`name`, `slug`, `description`, `is_system_role`) VALUES
('Super Admin', 'superadmin', 'Full platform access with all permissions', TRUE),
('Company Admin', 'companyadmin', 'Full access within a single company', TRUE),
('Manager', 'manager', 'Operational manager with broad company access', TRUE),
('Dispatcher', 'dispatcher', 'Manages shipment dispatching', TRUE),
('Operator', 'operator', 'Operations staff', TRUE),
('Agent', 'agent', 'Specialized agent (warehouse, driver, finance)', TRUE),
('Staff', 'staff', 'General support staff', TRUE),
('Customs Agent', 'customsagent', 'Customs clearance specialist', TRUE),
('Port Agent', 'portagent', 'Port operations specialist', TRUE),
('Customer Portal', 'customerportal', 'Customer self-service access', TRUE),
('Auditor Read Only', 'auditorreadonly', 'Read-only audit access', TRUE);