-- Update company types to match requirements
-- Clear existing company types (only if this is a fresh setup)
-- DELETE FROM `company_types`;

-- Insert required company types
INSERT INTO `company_types` (`name`, `slug`, `description`) VALUES
('Logistics', 'logistics', 'Logistics and freight forwarding services'),
('Transport', 'transport', 'Transportation and shipping services'),
('Warehouse', 'warehouse', 'Warehousing and storage services'),
('Manufacturing', 'manufacturing', 'Manufacturing and production companies'),
('Retail', 'retail', 'Retail and distribution companies'),
('Service Provider', 'service-provider', 'Service providers and consultants')
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `slug` = VALUES(`slug`),
  `description` = VALUES(`description`);
