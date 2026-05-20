-- Update roles to include Organization User role
INSERT INTO `roles` (`name`, `slug`, `description`, `is_system_role`) VALUES
('Organization User', 'organizationuser', 'Organization-level user with company management permissions', TRUE)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `slug` = VALUES(`slug`),
  `description` = VALUES(`description`),
  `is_system_role` = VALUES(`is_system_role`);
