export interface PlanningItem {
  id: string;
  title: string;
  reference: string;
  assignedTo: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
  startDate: string;
  endDate: string;
  progress: number;
}

export const mockPlanningData: PlanningItem[] = [
  { id: 'pl-001', title: 'Q2 Container Loading Plan', reference: 'PL-2024-001', assignedTo: 'Rajesh Mehta', priority: 'High', status: 'In Progress', startDate: '2024-04-01', endDate: '2024-04-15', progress: 65 },
  { id: 'pl-002', title: 'Customs Clearance Schedule', reference: 'PL-2024-002', assignedTo: 'Anita Desai', priority: 'High', status: 'Planned', startDate: '2024-04-10', endDate: '2024-04-20', progress: 0 },
  { id: 'pl-003', title: 'Transporter Fleet Allocation', reference: 'PL-2024-003', assignedTo: 'Suresh Patel', priority: 'Medium', status: 'Completed', startDate: '2024-03-15', endDate: '2024-03-30', progress: 100 },
  { id: 'pl-004', title: 'Warehouse Slot Booking', reference: 'PL-2024-004', assignedTo: 'Priya Singh', priority: 'Low', status: 'On Hold', startDate: '2024-04-05', endDate: '2024-04-12', progress: 20 },
  { id: 'pl-005', title: 'Origin Inspection Plan', reference: 'PL-2024-005', assignedTo: 'Vikram Joshi', priority: 'High', status: 'Planned', startDate: '2024-04-15', endDate: '2024-04-25', progress: 0 },
];

export interface ProductionLine {
  id: string;
  lineName: string;
  productType: string;
  status: 'Operational' | 'Idle' | 'Maintenance' | 'Shutdown';
  throughput: number;
  utilization: number;
  supervisor: string;
  lastRun: string;
}

export const mockProductionLines: ProductionLine[] = [
  { id: 'pr-001', lineName: 'Assembly Line A', productType: 'Electronics', status: 'Operational', throughput: 450, utilization: 88, supervisor: 'Arun Kumar', lastRun: '2024-04-08' },
  { id: 'pr-002', lineName: 'Packing Line B', productType: 'General Cargo', status: 'Idle', throughput: 0, utilization: 12, supervisor: 'Neha Gupta', lastRun: '2024-04-06' },
  { id: 'pr-003', lineName: 'Cold Storage Line', productType: 'Perishables', status: 'Operational', throughput: 320, utilization: 76, supervisor: 'Ravi Shankar', lastRun: '2024-04-08' },
  { id: 'pr-004', lineName: 'Container Stuffing Line', productType: 'Mixed', status: 'Maintenance', throughput: 0, utilization: 45, supervisor: 'Mohan Das', lastRun: '2024-04-05' },
  { id: 'pr-005', lineName: 'Express Sort Line', productType: 'Courier', status: 'Operational', throughput: 1200, utilization: 94, supervisor: 'Sneha Reddy', lastRun: '2024-04-08' },
];

export interface ShipmentLine {
  id: string;
  shipmentRef: string;
  containerNo: string;
  origin: string;
  destination: string;
  vessel: string;
  etd: string;
  eta: string;
  status: 'Booked' | 'In Transit' | 'Customs Hold' | 'Delivered';
  cargoWeight: string;
}

export const mockShipmentLines: ShipmentLine[] = [
  { id: 'sl-001', shipmentRef: 'SHP-2024-001', containerNo: 'MSCU4821937', origin: 'Shanghai', destination: 'Rotterdam', vessel: 'MSC Anna', etd: '2024-04-01', eta: '2024-04-28', status: 'In Transit', cargoWeight: '24.5T' },
  { id: 'sl-002', shipmentRef: 'SHP-2024-002', containerNo: 'MAEU5910248', origin: 'Singapore', destination: 'Los Angeles', vessel: 'Maersk Elizabeth', etd: '2024-04-05', eta: '2024-05-02', status: 'Booked', cargoWeight: '18.2T' },
  { id: 'sl-003', shipmentRef: 'SHP-2024-003', containerNo: 'CMAU3746159', origin: 'Mumbai', destination: 'Felixstowe', vessel: 'CMA CGM Leo', etd: '2024-03-28', eta: '2024-04-20', status: 'Customs Hold', cargoWeight: '21T' },
  { id: 'sl-004', shipmentRef: 'SHP-2024-004', containerNo: 'HLCU8264017', origin: 'Hamburg', destination: 'New York', vessel: 'Hapag Lloyd Express', etd: '2024-03-30', eta: '2024-04-15', status: 'Delivered', cargoWeight: '15.8T' },
  { id: 'sl-005', shipmentRef: 'SHP-2024-005', containerNo: 'ONEU5930274', origin: 'Tokyo', destination: 'Sydney', vessel: 'ONE Triumph', etd: '2024-04-10', eta: '2024-05-05', status: 'Booked', cargoWeight: '19.3T' },
  { id: 'sl-006', shipmentRef: 'SHP-2024-006', containerNo: 'COSU7182634', origin: 'Ningbo', destination: 'Long Beach', vessel: 'COSCO Pride', etd: '2024-04-03', eta: '2024-04-30', status: 'In Transit', cargoWeight: '22.1T' },
];

export interface DeliveryLine {
  id: string;
  deliveryRef: string;
  orderRef: string;
  customer: string;
  address: string;
  scheduledDate: string;
  status: 'Scheduled' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Failed';
  driver: string;
  vehicleNo: string;
}

export const mockDeliveryLines: DeliveryLine[] = [
  { id: 'dl-001', deliveryRef: 'DEL-2024-001', orderRef: 'ORD-1001', customer: 'ABC Corp', address: '456 Industrial Area, Mumbai', scheduledDate: '2024-04-09', status: 'Scheduled', driver: 'Ramesh Kumar', vehicleNo: 'MH-01-AB-1234' },
  { id: 'dl-002', deliveryRef: 'DEL-2024-002', orderRef: 'ORD-1002', customer: 'XYZ Traders', address: '789 Market Street, Delhi', scheduledDate: '2024-04-09', status: 'Dispatched', driver: 'Suresh Yadav', vehicleNo: 'DL-05-CD-5678' },
  { id: 'dl-003', deliveryRef: 'DEL-2024-003', orderRef: 'ORD-1003', customer: 'PQR Industries', address: '321 Port Area, Chennai', scheduledDate: '2024-04-08', status: 'Delivered', driver: 'Anil Verma', vehicleNo: 'TN-10-EF-9012' },
  { id: 'dl-004', deliveryRef: 'DEL-2024-004', orderRef: 'ORD-1004', customer: 'LMN Enterprises', address: '654 Business Hub, Bangalore', scheduledDate: '2024-04-10', status: 'In Transit', driver: 'Vijay Patil', vehicleNo: 'KA-15-GH-3456' },
  { id: 'dl-005', deliveryRef: 'DEL-2024-005', orderRef: 'ORD-1005', customer: 'JKL Group', address: '147 Export Zone, Surat', scheduledDate: '2024-04-07', status: 'Failed', driver: 'Mohan Singh', vehicleNo: 'GJ-20-IJ-7890' },
  { id: 'dl-006', deliveryRef: 'DEL-2024-006', orderRef: 'ORD-1006', customer: 'DEF Logistics', address: '258 Warehouse District, Nagpur', scheduledDate: '2024-04-11', status: 'Scheduled', driver: 'Rajesh Patil', vehicleNo: 'MH-35-KL-1234' },
];

export interface OperationalDocument {
  id: string;
  docRef: string;
  title: string;
  type: 'Shipping Instruction' | 'Packing List' | 'Commercial Invoice' | 'Certificate of Origin' | 'Insurance Cert' | 'Bill of Lading';
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Filed';
  createdBy: string;
  createdAt: string;
  relatedShipment: string;
}

export const mockOperationalDocs: OperationalDocument[] = [
  { id: 'od-001', docRef: 'SI-2024-001', title: 'Shipping Instruction - SHP001', type: 'Shipping Instruction', status: 'Approved', createdBy: 'Priya Sharma', createdAt: '2024-04-01', relatedShipment: 'SHP-2024-001' },
  { id: 'od-002', docRef: 'PL-2024-001', title: 'Packing List - ORD1001', type: 'Packing List', status: 'Pending Review', createdBy: 'Anita Desai', createdAt: '2024-04-02', relatedShipment: 'SHP-2024-002' },
  { id: 'od-003', docRef: 'CI-2024-001', title: 'Commercial Invoice - ORD1002', type: 'Commercial Invoice', status: 'Draft', createdBy: 'Rajesh Mehta', createdAt: '2024-04-03', relatedShipment: 'SHP-2024-003' },
  { id: 'od-004', docRef: 'CO-2024-001', title: 'Certificate of Origin - SHP002', type: 'Certificate of Origin', status: 'Filed', createdBy: 'Vikram Joshi', createdAt: '2024-03-28', relatedShipment: 'SHP-2024-004' },
  { id: 'od-005', docRef: 'IC-2024-001', title: 'Insurance Certificate - SHP003', type: 'Insurance Cert', status: 'Pending Review', createdBy: 'Neha Gupta', createdAt: '2024-04-05', relatedShipment: 'SHP-2024-005' },
  { id: 'od-006', docRef: 'BL-2024-001', title: 'Bill of Lading - SHP004', type: 'Bill of Lading', status: 'Approved', createdBy: 'Suresh Patel', createdAt: '2024-04-04', relatedShipment: 'SHP-2024-006' },
];

export interface CarrierTracking {
  id: string;
  carrier: string;
  carrierRef: string;
  mode: 'Ocean' | 'Air' | 'Land';
  origin: string;
  destination: string;
  currentLocation: string;
  lastUpdate: string;
  status: 'On Time' | 'Delayed' | 'At Origin' | 'In Transit' | 'Arrived';
  eta: string;
}

export const mockCarrierTrackings: CarrierTracking[] = [
  { id: 'ct-001', carrier: 'MSC', carrierRef: 'MSC-4821937', mode: 'Ocean', origin: 'Shanghai', destination: 'Rotterdam', currentLocation: 'Indian Ocean', lastUpdate: '2024-04-08 14:30', status: 'In Transit', eta: '2024-04-28' },
  { id: 'ct-002', carrier: 'Maersk', carrierRef: 'MAEU-5910248', mode: 'Ocean', origin: 'Singapore', destination: 'Los Angeles', currentLocation: 'Singapore Port', lastUpdate: '2024-04-08 10:00', status: 'At Origin', eta: '2024-05-02' },
  { id: 'ct-003', carrier: 'FedEx', carrierRef: 'FX-872341', mode: 'Air', origin: 'Frankfurt', destination: 'Dubai', currentLocation: 'Frankfurt Airport', lastUpdate: '2024-04-08 12:00', status: 'On Time', eta: '2024-04-08 18:00' },
  { id: 'ct-004', carrier: 'DHL', carrierRef: 'DH-563782', mode: 'Air', origin: 'Hong Kong', destination: 'London', currentLocation: 'En Route', lastUpdate: '2024-04-08 13:15', status: 'Delayed', eta: '2024-04-09 06:00' },
  { id: 'ct-005', carrier: 'Hapag-Lloyd', carrierRef: 'HLCU-8264017', mode: 'Ocean', origin: 'Hamburg', destination: 'New York', currentLocation: 'New York Port', lastUpdate: '2024-04-08 08:00', status: 'Arrived', eta: '2024-04-08' },
  { id: 'ct-006', carrier: 'UPS', carrierRef: 'UPS-129834', mode: 'Land', origin: 'Chicago', destination: 'Toronto', currentLocation: 'Michigan Border', lastUpdate: '2024-04-08 15:00', status: 'In Transit', eta: '2024-04-09 12:00' },
];

export interface ContractHolder {
  id: string;
  contractRef: string;
  holderName: string;
  type: 'Shipper' | 'Consignee' | 'Forwarder' | 'Carrier';
  startDate: string;
  endDate: string;
  value: number;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Renegotiating';
}

export const mockContractHolders: ContractHolder[] = [
  { id: 'ch-001', contractRef: 'CTR-2024-001', holderName: 'ABC Corp', type: 'Shipper', startDate: '2024-01-01', endDate: '2024-12-31', value: 2500000, status: 'Active' },
  { id: 'ch-002', contractRef: 'CTR-2024-002', holderName: 'XYZ Logistics', type: 'Forwarder', startDate: '2024-03-01', endDate: '2024-05-31', value: 850000, status: 'Expiring Soon' },
  { id: 'ch-003', contractRef: 'CTR-2024-003', holderName: 'Global Shipping Co', type: 'Carrier', startDate: '2023-06-01', endDate: '2024-03-31', value: 4200000, status: 'Expired' },
  { id: 'ch-004', contractRef: 'CTR-2024-004', holderName: 'PQR Enterprises', type: 'Consignee', startDate: '2024-04-01', endDate: '2025-03-31', value: 1800000, status: 'Active' },
  { id: 'ch-005', contractRef: 'CTR-2024-005', holderName: 'LMN Industries', type: 'Shipper', startDate: '2024-02-01', endDate: '2024-07-31', value: 1250000, status: 'Renegotiating' },
];

export interface EdiMessage {
  id: string;
  messageRef: string;
  type: 'EDI 856' | 'EDI 810' | 'EDI 850' | 'EDI 214' | 'EDI 315';
  sender: string;
  receiver: string;
  sentAt: string;
  status: 'Sent' | 'Received' | 'Failed' | 'Processing';
  relatedShipment: string;
}

export const mockEdiMessages: EdiMessage[] = [
  { id: 'edi-001', messageRef: '856-2024-001', type: 'EDI 856', sender: 'ABC Corp', receiver: 'LogisticsPro', sentAt: '2024-04-08 09:30', status: 'Received', relatedShipment: 'SHP-2024-001' },
  { id: 'edi-002', messageRef: '850-2024-001', type: 'EDI 850', sender: 'XYZ Traders', receiver: 'LogisticsPro', sentAt: '2024-04-08 10:15', status: 'Processing', relatedShipment: 'SHP-2024-002' },
  { id: 'edi-003', messageRef: '810-2024-001', type: 'EDI 810', sender: 'LogisticsPro', receiver: 'MSC Shipping', sentAt: '2024-04-07 14:00', status: 'Sent', relatedShipment: 'SHP-2024-003' },
  { id: 'edi-004', messageRef: '214-2024-001', type: 'EDI 214', sender: 'Carrier Co', receiver: 'LogisticsPro', sentAt: '2024-04-08 11:45', status: 'Received', relatedShipment: 'SHP-2024-004' },
  { id: 'edi-005', messageRef: '315-2024-001', type: 'EDI 315', sender: 'Port Authority', receiver: 'LogisticsPro', sentAt: '2024-04-08 08:00', status: 'Failed', relatedShipment: 'SHP-2024-005' },
  { id: 'edi-006', messageRef: '856-2024-002', type: 'EDI 856', sender: 'PQR Industries', receiver: 'LogisticsPro', sentAt: '2024-04-06 16:30', status: 'Received', relatedShipment: 'SHP-2024-006' },
];

export interface ContainerReport {
  id: string;
  containerNo: string;
  size: '20ft' | '40ft' | '40ft HC';
  type: 'Standard' | 'Reefer' | 'Open Top' | 'Flat Rack';
  location: string;
  status: 'Loaded' | 'Empty' | 'In Transit' | 'At Port' | 'Under Inspection';
  lastEvent: string;
  lastEventDate: string;
  shipmentRef: string;
}

export const mockContainerReports: ContainerReport[] = [
  { id: 'cr-001', containerNo: 'MSCU4821937', size: '40ft', type: 'Standard', location: 'Indian Ocean', status: 'In Transit', lastEvent: 'Loaded on Vessel', lastEventDate: '2024-04-03', shipmentRef: 'SHP-2024-001' },
  { id: 'cr-002', containerNo: 'MAEU5910248', size: '40ft HC', type: 'Reefer', location: 'Singapore Port', status: 'At Port', lastEvent: 'Customs Clearance', lastEventDate: '2024-04-07', shipmentRef: 'SHP-2024-002' },
  { id: 'cr-003', containerNo: 'CMAU3746159', size: '20ft', type: 'Standard', location: 'Mumbai Terminal', status: 'Under Inspection', lastEvent: 'Gate In', lastEventDate: '2024-04-06', shipmentRef: 'SHP-2024-003' },
  { id: 'cr-004', containerNo: 'HLCU8264017', size: '40ft', type: 'Open Top', location: 'New York Depot', status: 'Empty', lastEvent: 'Gate Out Empty', lastEventDate: '2024-04-08', shipmentRef: 'SHP-2024-004' },
  { id: 'cr-005', containerNo: 'ONEU5930274', size: '40ft HC', type: 'Standard', location: 'Tokyo Yard', status: 'Loaded', lastEvent: 'Stuffing Complete', lastEventDate: '2024-04-08', shipmentRef: 'SHP-2024-005' },
  { id: 'cr-006', containerNo: 'COSU7182634', size: '20ft', type: 'Flat Rack', location: 'Ningbo Port', status: 'At Port', lastEvent: 'Vessel Berthing', lastEventDate: '2024-04-07', shipmentRef: 'SHP-2024-006' },
];

export interface AtaUpdate {
  id: string;
  shipmentRef: string;
  containerNo: string;
  vessel: string;
  ata: string;
  currentEta: string;
  delay: number;
  reason: string;
  status: 'On Time' | 'Delayed' | 'Arrived';
}

export const mockAtaUpdates: AtaUpdate[] = [
  { id: 'ata-001', shipmentRef: 'SHP-2024-001', containerNo: 'MSCU4821937', vessel: 'MSC Anna', ata: '2024-04-28', currentEta: '2024-04-28', delay: 0, reason: 'On schedule', status: 'On Time' },
  { id: 'ata-002', shipmentRef: 'SHP-2024-003', containerNo: 'CMAU3746159', vessel: 'CMA CGM Leo', ata: '2024-04-25', currentEta: '2024-04-22', delay: 3, reason: 'Weather delay in Indian Ocean', status: 'Delayed' },
  { id: 'ata-003', shipmentRef: 'SHP-2024-004', containerNo: 'HLCU8264017', vessel: 'Hapag Lloyd Express', ata: '2024-04-15', currentEta: '2024-04-15', delay: 0, reason: 'Arrived on time', status: 'Arrived' },
  { id: 'ata-004', shipmentRef: 'SHP-2024-006', containerNo: 'COSU7182634', vessel: 'COSCO Pride', ata: '2024-05-01', currentEta: '2024-04-30', delay: 1, reason: 'Port congestion at Long Beach', status: 'Delayed' },
  { id: 'ata-005', shipmentRef: 'SHP-2024-002', containerNo: 'MAEU5910248', vessel: 'Maersk Elizabeth', ata: '2024-05-02', currentEta: '2024-05-02', delay: 0, reason: 'On schedule', status: 'On Time' },
  { id: 'ata-006', shipmentRef: 'SHP-2024-005', containerNo: 'ONEU5930274', vessel: 'ONE Triumph', ata: '2024-05-05', currentEta: '2024-05-05', delay: 0, reason: 'On schedule', status: 'On Time' },
];

export interface CompanyTypeReport {
  id: string;
  reportName: string;
  type: 'Operational' | 'Financial' | 'Compliance' | 'Performance';
  period: string;
  generatedAt: string;
  status: 'Ready' | 'Generating' | 'Scheduled';
  size: string;
}

export const mockCompanyTypeReports: CompanyTypeReport[] = [
  { id: 'rpt-001', reportName: 'Monthly Operations Summary', type: 'Operational', period: 'March 2024', generatedAt: '2024-04-01 09:00', status: 'Ready', size: '2.4 MB' },
  { id: 'rpt-002', reportName: 'Carrier Performance Q1', type: 'Performance', period: 'Q1 2024', generatedAt: '2024-04-05 14:30', status: 'Ready', size: '1.8 MB' },
  { id: 'rpt-003', reportName: 'Customs Compliance Report', type: 'Compliance', period: 'March 2024', generatedAt: '2024-04-02 11:00', status: 'Ready', size: '3.1 MB' },
  { id: 'rpt-004', reportName: 'Container Utilization Analysis', type: 'Operational', period: 'Q1 2024', generatedAt: '', status: 'Generating', size: 'N/A' },
  { id: 'rpt-005', reportName: 'Cost Per Shipment Analysis', type: 'Financial', period: 'March 2024', generatedAt: '2024-04-03 16:45', status: 'Ready', size: '1.2 MB' },
  { id: 'rpt-006', reportName: 'Weekly Operations Dashboard', type: 'Operational', period: 'Week 14 2024', generatedAt: '', status: 'Scheduled', size: 'N/A' },
  { id: 'rpt-007', reportName: 'Delay Analysis Report', type: 'Performance', period: 'March 2024', generatedAt: '2024-04-04 10:15', status: 'Ready', size: '0.9 MB' },
];

export interface CompanyTypeHomeFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'Active' | 'New' | 'Coming Soon';
  href: string;
}

export const mockHomeFeatures: CompanyTypeHomeFeature[] = [
  { id: 'feat-001', title: 'Planning Board', description: 'Visual planning and scheduling for all operations', icon: 'ClipboardList', status: 'Active', href: '/company/planning' },
  { id: 'feat-002', title: 'Carrier Tracking', description: 'Real-time tracking across all carriers and modes', icon: 'Map', status: 'Active', href: '/company/carrier-tracking' },
  { id: 'feat-003', title: 'Container Reports', description: 'Comprehensive container status and utilization', icon: 'ClipboardCheck', status: 'Active', href: '/company/container-reports' },
  { id: 'feat-004', title: 'EDI Integration', description: 'Electronic Data Interchange for automated communication', icon: 'Network', status: 'Active', href: '/company/edi' },
  { id: 'feat-005', title: 'ATA Updates', description: 'Actual Time of Arrival tracking and delay management', icon: 'Calendar', status: 'Active', href: '/company/ata-update' },
  { id: 'feat-006', title: 'Advanced Analytics', description: 'AI-powered operational insights and predictions', icon: 'BarChart3', status: 'New', href: '/company/reporting' },
  { id: 'feat-007', title: 'Smart Contracts', description: 'Automated contract management with blockchain verification', icon: 'FileText', status: 'Coming Soon', href: '#' },
  { id: 'feat-008', title: 'Carbon Footprint Tracker', description: 'Track and offset your shipment carbon emissions', icon: 'Leaf', status: 'Coming Soon', href: '#' },
];
