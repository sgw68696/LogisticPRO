/database/sql/seeder/0002_seed_company_types.sql
-- Seed common logistics company types
INSERT INTO `company_types` (`name`, `slug`, `description`) VALUES
('Freight Forwarder', 'freight-forwarder', 'Organizes shipments for businesses'),
('3PL Provider', '3pl-provider', 'Third-party logistics provider'),
('Warehousing Company', 'warehousing-company', 'Storage and fulfillment services'),
('Transportation Company', 'transportation-company', 'Ground, air, or sea transport'),
('Customs Broker', 'customs-broker', 'Customs clearance services'),
('E-commerce Fulfillment', 'ecommerce-fulfillment', 'E-commerce order fulfillment'),
('Cold Chain Logistics', 'cold-chain-logistics', 'Temperature-controlled logistics'),
('Other', 'other', 'Other logistics company type');