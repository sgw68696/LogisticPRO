import type {
  Vessel, VesselStatus, Flight, FlightStatus,
  Berth, BerthStatus, PortManifest, ManifestStatus,
  PortCharge, ChargeCategory, ChargeStatus,
  CargoOperation, CargoOpType, CargoOpStatus,
  PortDocument, PortDocCategory, PortDocStatus,
  PortNotification, PortNotifType, PortNotifSeverity,
  PortDashboardStats,
} from '@/types/port';
import { mockContainers } from '@/data/shipments/container-data';
import { mockInvoices } from '@/data/mockData';

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - rand(0, daysBack));
  d.setHours(rand(0, 23), rand(0, 59), rand(0, 59));
  return d.toISOString();
}

function futureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + rand(0, daysAhead));
  d.setHours(rand(0, 23), rand(0, 59), rand(0, 59));
  return d.toISOString();
}

const VESSEL_NAMES = [
  'MSC Aries', 'Maersk Edinburgh', 'CMA CGM T. Roosevelt', 'COSCO Shipping Leo',
  'Ever Given', 'HMM Algeciras', 'ONE Stork', 'Yang Ming Wellbeing',
  'ZIM Mount Davis', 'MOL Triumph', 'OOCL Hong Kong', 'APL Vanda',
  'Hapag-Lloyd Berlin', 'NYK Isabella', 'MSC Diana', 'Maersk Jim',
  'CMA CGM Marco Polo', 'COSCO Development', 'Ever Ace', 'HMM Rotterdam',
];
const IMO_NUMBERS = [
  'IMO9861234', 'IMO9775678', 'IMO9639012', 'IMO9483456',
  'IMO9337890', 'IMO9191234', 'IMO9055678', 'IMO8919012',
  'IMO8773456', 'IMO8637890', 'IMO8491234', 'IMO8355678',
];
const FLAGS = ['Panama', 'Liberia', 'Marshall Islands', 'Singapore', 'Malta', 'Bahamas', 'Greece', 'Japan'];
const CARRIERS = ['Maersk', 'MSC', 'CMA CGM', 'COSCO', 'Hapag-Lloyd', 'ONE', 'Evergreen', 'ZIM', 'HMM', 'Yang Ming'];
const PORTS = ['Mumbai', 'Nhava Sheva', 'Chennai', 'Kolkata', 'Kandla', 'VOC Port', 'Cochin', 'Mangalore', 'Singapore', 'Colombo', 'Dubai', 'Jebel Ali'];
const BERTH_NAMES = ['Berth 1A', 'Berth 1B', 'Berth 2A', 'Berth 2B', 'Berth 3A', 'Berth 3B', 'Berth 4A', 'Berth 4B', 'Berth 5A', 'Berth 5B'];
const AIRLINES = ['Emirates SkyCargo', 'Qatar Airways Cargo', 'Singapore Airlines Cargo', 'Cathay Pacific Cargo', 'Turkish Cargo', 'Ethiopian Cargo', 'Lufthansa Cargo', 'Korean Air Cargo'];
const AIRCRAFT_TYPES = ['Boeing 777F', 'Boeing 747-8F', 'Airbus A330-200F', 'Boeing 767-300F', 'Airbus A350F', 'B777-200LRF'];
const FLIGHT_ROUTES = [
  { origin: 'DXB', originName: 'Dubai', dest: 'BOM', destName: 'Mumbai' },
  { origin: 'DOH', originName: 'Doha', dest: 'BOM', destName: 'Mumbai' },
  { origin: 'SIN', originName: 'Singapore', dest: 'BOM', destName: 'Mumbai' },
  { origin: 'HKG', originName: 'Hong Kong', dest: 'DEL', destName: 'Delhi' },
  { origin: 'LHR', originName: 'London', dest: 'BOM', destName: 'Mumbai' },
  { origin: 'FRA', originName: 'Frankfurt', dest: 'DEL', destName: 'Delhi' },
  { origin: 'ADD', originName: 'Addis Ababa', dest: 'BOM', destName: 'Mumbai' },
  { origin: 'IST', originName: 'Istanbul', dest: 'DEL', destName: 'Delhi' },
  { origin: 'ICN', originName: 'Seoul', dest: 'BOM', destName: 'Mumbai' },
  { origin: 'NRT', originName: 'Tokyo', dest: 'DEL', destName: 'Delhi' },
];
const COMPANIES = ['cmp-001', 'cmp-002', 'cmp-003'];
const DOC_CATEGORIES: PortDocCategory[] = ['Arrival Notice', 'Cargo Manifest', 'BOL', 'AWB', 'Port Clearance', 'Customs Decl', 'Inspection Report', 'Survey Report', 'Certificate', 'Correspondence', 'Other'];
const DOC_STATUSES: PortDocStatus[] = ['Draft', 'Approved', 'Pending Review', 'Rejected', 'Expired', 'Archived'];
const CHARGE_TYPES: ChargeCategory[] = ['Berth Hire', 'Pilotage', 'Towage', 'Mooring', 'Cargo Handling', 'Storage', 'Demurrage', 'Customs', 'Documentation', 'Security', 'Environmental', 'Other'];
const CHARGE_STATUSES: ChargeStatus[] = ['Pending', 'Collected', 'Overdue', 'Disputed', 'Waived'];
const NOTIF_TYPES: PortNotifType[] = ['Vessel Arrival', 'Departure', 'Delay', 'Berth Assignment', 'Cargo Exception', 'Customs Alert', 'Document Ready', 'Invoice', 'System', 'Weather'];
const NOTIF_SEVERITIES: PortNotifSeverity[] = ['Info', 'Warning', 'Critical', 'Emergency'];

function generateVesselTimeline(vesselId: string, status: string): VesselTimelineEvent[] {
  const events = [
    { id: `${vesselId}-tl-1`, vesselId, status: 'Departed Last Port', timestamp: randomDate(14), location: pick(PORTS), notes: 'Departed on schedule' },
    { id: `${vesselId}-tl-2`, vesselId, status: 'In Transit', timestamp: randomDate(7), location: 'At Sea', notes: 'En route to destination' },
  ];
  if (status === 'Arrived' || status === 'Berthing' || status === 'Docked' || status === 'Unloading') {
    events.push({ id: `${vesselId}-tl-3`, vesselId, status: 'Arrived at Pilot Station', timestamp: randomDate(3), location: pick(PORTS), notes: 'Awaiting pilot boarding' });
  }
  if (status === 'Docked' || status === 'Unloading') {
    events.push({ id: `${vesselId}-tl-4`, vesselId, status: 'Docked', timestamp: randomDate(1), location: `${pick(PORTS)} Outer Harbour`, notes: 'Secured at berth' });
  }
  return events;
}

function generateVessels(): Vessel[] {
  const statuses: VesselStatus[] = ['Arrived', 'Berthing', 'Docked', 'Unloading', 'Sailing', 'Expected', 'Departed', 'Delayed', 'Anchored'];
  return Array.from({ length: 20 }, (_, i) => {
    const status = statuses[i % statuses.length];
    const companyId = pick(COMPANIES);
    const vesselName = VESSEL_NAMES[i % VESSEL_NAMES.length];
    const carrier = pick(CARRIERS);
    const lastPort = pick(PORTS);
    const currentPort = pick(PORTS);
    return {
      id: `ves-${String(i + 1).padStart(3, '0')}`,
      companyId,
      vesselId: `VSL-${String(1000 + i)}`,
      name: vesselName,
      imo: IMO_NUMBERS[i % IMO_NUMBERS.length],
      flag: pick(FLAGS),
      vesselType: pick(['Container Ship', 'Bulk Carrier', 'Tanker', 'Ro-Ro', 'General Cargo', 'Reefer'] as const),
      grossTonnage: rand(15000, 220000),
      deadweight: rand(25000, 180000),
      length: rand(180, 400),
      beam: rand(28, 62),
      status,
      voyage: `VYG-${String(2025)}-${String(100 + i)}`,
      carrier,
      captain: pick(['Capt. Sharma', 'Capt. Singh', 'Capt. Patel', 'Capt. Nair', 'Capt. Menon', 'Capt. Das']),
      crewCount: rand(18, 30),
      port: currentPort,
      berth: status === 'Docked' || status === 'Unloading' || status === 'Berthing' ? pick(BERTH_NAMES) : null,
      eta: status === 'Expected' || status === 'Sailing' ? futureDate(3) : randomDate(1),
      etd: (status === 'Docked' || status === 'Unloading' || status === 'Arrived') ? futureDate(5) : null,
      ata: (status === 'Arrived' || status === 'Docked' || status === 'Unloading') ? randomDate(2) : null,
      atd: status === 'Departed' ? randomDate(3) : null,
      cargoCapacity: rand(5000, 24000),
      cargoLoaded: rand(2000, 22000),
      cargoUnit: pick(['TEU', 'Tons', 'CBM'] as const),
      lastPort,
      nextPort: pick(PORTS),
      notes: pick(['Regular container service', 'Bulk grain shipment', 'Vehicle carrier', 'Oil tanker shipment', 'General cargo']),
      timeline: generateVesselTimeline(`ves-${String(i + 1).padStart(3, '0')}`, status),
      createdAt: randomDate(90),
      updatedAt: randomDate(7),
    };
  });
}

function generateFlights(): Flight[] {
  return Array.from({ length: 15 }, (_, i) => {
    const route = pick(FLIGHT_ROUTES);
    const isArrival = i % 2 === 0;
    const statuses: FlightStatus[] = ['Scheduled', 'Departed', 'In Flight', 'Arrived', 'Landed', 'Delayed', 'Cancelled'];
    const status = statuses[i % statuses.length];
    return {
      id: `flt-${String(i + 1).padStart(3, '0')}`,
      companyId: pick(COMPANIES),
      flightId: `FLT-${String(1000 + i)}`,
      flightNumber: `${pick(['EK', 'QR', 'SQ', 'CX', 'TK', 'ET', 'LH', 'KE'])}${rand(100, 999)}`,
      airline: pick(AIRLINES),
      type: isArrival ? 'Arrival' : 'Departure',
      status,
      origin: isArrival ? route.originName : route.destName,
      originCode: isArrival ? route.origin : route.dest,
      destination: isArrival ? route.destName : route.originName,
      destinationCode: isArrival ? route.dest : route.origin,
      scheduled: futureDate(1),
      estimated: futureDate(1),
      actual: status === 'Arrived' || status === 'Landed' ? randomDate(1) : null,
      gate: pick(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2']),
      cargoWeight: rand(10000, 120000),
      cargoVolume: rand(50, 400),
      awbCount: rand(10, 80),
      aircraft: pick(AIRCRAFT_TYPES),
      aircraftType: pick(['Wide-body', 'Freighter', 'Combi']),
      carrier: pick(AIRLINES),
      notes: pick(['Regular cargo service', 'Perishable goods priority', 'DG cargo on board', 'Express courier']),
      createdAt: randomDate(30),
      updatedAt: randomDate(3),
    };
  });
}

function generateBerths(): Berth[] {
  return BERTH_NAMES.map((name, i) => {
    const isOccupied = i < 6;
    const vesselName = isOccupied ? pick(VESSEL_NAMES) : null;
    return {
      id: `brt-${String(i + 1).padStart(3, '0')}`,
      companyId: pick(COMPANIES),
      berthId: `BRT-${String(100 + i)}`,
      name,
      type: pick(['Container', 'Bulk', 'General', 'Liquid'] as const),
      status: isOccupied ? 'Occupied' : i === 8 ? 'Maintenance' : i === 9 ? 'Reserved' : 'Available',
      depth: rand(10, 18),
      length: rand(200, 400),
      maxDraft: rand(10, 16),
      maxVesselLength: rand(220, 420),
      maxVesselBeam: rand(30, 65),
      craneCapacity: pick(['40T', '50T', '65T', '100T', 'Panamax', 'Post-Panamax']),
      craneCount: rand(2, 6),
      operator: pick(['Adani Ports', 'DP World', 'PSA International', 'JNPT', 'MSC Terminal']),
      currentVessel: vesselName,
      currentVesselId: isOccupied ? `ves-${String(rand(1, 20)).padStart(3, '0')}` : null,
      occupancyStart: isOccupied ? randomDate(3) : null,
      occupancyEnd: isOccupied ? futureDate(5) : null,
      occupancyRate: rand(45, 95),
      equipment: pick([['Gantry Crane', 'Reach Stacker', 'Top Loader'], ['Mobile Crane', 'Forklift', 'Tug'], ['Panamax Crane', 'Yard Tractor', 'Empty Handler']]),
      services: pick([['Pilotage', 'Towage', 'Fresh Water'], ['Bunkering', 'Waste Disposal'], ['Customs Inspection', 'Container Freight Station']]),
      notes: pick(['Primary container terminal', 'Bulk cargo operations', 'General purpose berth', 'Liquid cargo handling']),
      createdAt: randomDate(180),
      updatedAt: randomDate(14),
    };
  });
}

function generateManifests(): PortManifest[] {
  return Array.from({ length: 15 }, (_, i) => {
    const types = ['Import', 'Export', 'Transshipment'] as const;
    const type = types[i % 3];
    const statuses: ManifestStatus[] = ['Draft', 'Filed', 'Approved', 'Amended', 'Rejected', 'Archived'];
    const containerCount = rand(5, 200);
    const containerIds = Array.from({ length: Math.min(containerCount, mockContainers.length) }, (_, j) =>
      mockContainers[j % mockContainers.length]?.id || `ctr-${String(rand(1, 100)).padStart(3, '0')}`
    );
    return {
      id: `mft-${String(i + 1).padStart(3, '0')}`,
      companyId: pick(COMPANIES),
      manifestId: `MFT-${String(2025)}-${String(1000 + i)}`,
      type,
      status: statuses[i % statuses.length],
      vessel: pick(VESSEL_NAMES),
      vesselId: `ves-${String(rand(1, 20)).padStart(3, '0')}`,
      voyage: `VYG-2025-${String(100 + i)}`,
      carrier: pick(CARRIERS),
      portOfLoading: pick(PORTS),
      portOfDischarge: pick(PORTS),
      containerCount,
      totalWeight: rand(50000, 500000),
      weightUnit: 'kg',
      hazmatCount: rand(0, 15),
      reeferCount: rand(0, 25),
      filedDate: randomDate(14),
      filedBy: pick(['Rajesh Kumar', 'Priya Sharma', 'Deepa Nair', 'Arjun Singh', 'Ananya Gupta']),
      approvedDate: Math.random() > 0.4 ? randomDate(7) : null,
      approvedBy: Math.random() > 0.4 ? pick(['Customs Officer Sharma', 'Port Authority Menon', 'Supervisor Verma']) : null,
      customsReference: `CUS-${String(rand(10000, 99999))}`,
      notes: pick(['Full container load shipment', 'Mixed cargo consolidation', 'DG cargo - Class 3 flammable', 'Temperature controlled goods']),
      containers: containerIds,
      shipmentIds: Array.from({ length: rand(1, 5) }, () => `shp-${String(rand(1, 55)).padStart(3, '0')}`),
      createdAt: randomDate(30),
      updatedAt: randomDate(7),
    };
  });
}

function generateCharges(): PortCharge[] {
  return Array.from({ length: 20 }, (_, i) => {
    const type = pick(CHARGE_TYPES);
    const status = pick(CHARGE_STATUSES);
    const qty = rand(1, 100);
    const rate = rand(500, 50000);
    const invRef = `PINV-${String(2025)}-${String(1000 + i)}`;
    return {
      id: `pch-${String(i + 1).padStart(3, '0')}`,
      companyId: pick(COMPANIES),
      chargeId: `PCH-${String(1000 + i)}`,
      invoiceRef: invRef,
      type,
      status,
      vessel: pick(VESSEL_NAMES),
      vesselId: `ves-${String(rand(1, 20)).padStart(3, '0')}`,
      voyage: `VYG-2025-${String(100 + i)}`,
      description: `${type} charges for vessel operations at port`,
      payer: pick(['Maersk Line', 'MSC Shipping', 'CMA CGM', 'COSCO Shipping', 'Hapag-Lloyd', 'ONE Line', 'Evergreen Marine']),
      quantity: qty,
      rate,
      currency: pick(['USD', 'INR', 'EUR', 'SGD'] as const),
      amount: qty * rate,
      issuedDate: randomDate(30),
      dueDate: randomDate(15),
      paidDate: status === 'Collected' ? randomDate(5) : null,
      invoiceLink: Math.random() > 0.3 ? `INV-2025-${String(rand(1000, 9999))}` : null,
      notes: pick(['Standard port tariff', 'Overtime handling charges', 'Weekend surcharge applied', 'Bulk discount negotiated']),
      createdAt: randomDate(60),
      updatedAt: randomDate(14),
    };
  });
}

function generateCargoOps(): CargoOperation[] {
  const types: CargoOpType[] = ['Offload', 'Load', 'Transfer', 'Inspection', 'Lashing', 'Unlashing', 'Shifting', 'Stuffing'];
  const statuses: CargoOpStatus[] = ['Scheduled', 'In Progress', 'Completed', 'Paused', 'Cancelled', 'On Hold'];
  return Array.from({ length: 20 }, (_, i) => {
    const status = statuses[i % statuses.length];
    const startTime = status === 'Completed' ? randomDate(10) : futureDate(2);
    const duration = status === 'Completed' ? rand(2, 48) : null;
    return {
      id: `cgo-${String(i + 1).padStart(3, '0')}`,
      companyId: pick(COMPANIES),
      operationId: `OP-${String(2025)}-${String(100 + i)}`,
      type: types[i % types.length],
      status,
      vessel: pick(VESSEL_NAMES),
      vesselId: `ves-${String(rand(1, 20)).padStart(3, '0')}`,
      berth: pick(BERTH_NAMES),
      berthId: `brt-${String(rand(1, 10)).padStart(3, '0')}`,
      manifest: Math.random() > 0.3 ? `MFT-2025-${String(1000 + rand(0, 14))}` : null,
      manifestId: Math.random() > 0.3 ? `mft-${String(rand(1, 15)).padStart(3, '0')}` : null,
      containerId: Math.random() > 0.4 ? pick(mockContainers)?.id || null : null,
      cargoType: pick(['General Cargo', 'Containerized', 'Bulk', 'Liquid', 'Reefer', 'DG', 'Vehicles', 'Project Cargo']),
      cargoWeight: rand(5000, 200000),
      cargoVolume: rand(10, 500),
      quantity: rand(5, 200),
      unit: pick(['TEU', 'Tons', 'Units', 'CBM'] as const),
      startTime,
      endTime: status === 'Completed' ? new Date(new Date(startTime).getTime() + (duration || 12) * 3600000).toISOString() : null,
      duration,
      operator: pick(['Crew A', 'Crew B', 'Crew C', 'Stevedore Team 1', 'Stevedore Team 2', 'Terminal Ops']),
      supervisor: pick(['Suresh Yadav', 'Mahesh Sharma', 'Ganesh Patel', 'Dinesh Singh', 'Rakesh Verma']),
      equipment: pick([['Crane #1', 'Forklift #3'], ['Mobile Crane', 'Yard Tractor'], ['Reach Stacker', 'Top Loader', 'Forklift #5']]),
      notes: pick(['Standard container offload', 'Bulk cargo loading operation', 'Container inspection and survey', 'Cross-berth transfer operation']),
      timeline: [
        { id: `cgo-${i}-tl-1`, operationId: `OP-2025-${String(100 + i)}`, status: 'Scheduled', timestamp: randomDate(5), notes: 'Operation scheduled' },
        { id: `cgo-${i}-tl-2`, operationId: `OP-2025-${String(100 + i)}`, status: status, timestamp: randomDate(1), notes: 'Current status' },
      ],
      createdAt: randomDate(30),
      updatedAt: randomDate(3),
    };
  });
}

function generateDocuments(): PortDocument[] {
  const titles = [
    'Arrival Notice - MSC Aries', 'Cargo Manifest - MAE001', 'Bill of Lading - BOL-2025-001',
    'Air Waybill - AWB-777-001', 'Port Clearance Certificate', 'Customs Declaration - CD-001',
    'Inspection Report - Container Survey', 'Survey Report - Damage Assessment',
    'Certificate of Registry', 'Correspondence - Berth Extension Request',
    'Customs Declaration - Export', 'Port Clearance - Departure',
    'Cargo Manifest - Import Cargo', 'Survey Report - Pre-loading',
    'Bill of Lading - Transshipment',
  ];
  return titles.map((title, i) => ({
    id: `pdoc-${String(i + 1).padStart(3, '0')}`,
    companyId: pick(COMPANIES),
    documentId: `PDOC-${String(1000 + i)}`,
    title,
    category: pick(DOC_CATEGORIES),
    status: pick(DOC_STATUSES),
    type: pick(['PDF', 'XLSX', 'DOCX', 'ZIP', 'Image'] as const),
    referenceNumber: `REF-${String(2025)}-${String(1000 + i)}`,
    vessel: pick(VESSEL_NAMES),
    vesselId: `ves-${String(rand(1, 20)).padStart(3, '0')}`,
    uploadedBy: pick(['Deepa Nair', 'Rajesh Kumar', 'Priya Sharma', 'Arjun Singh', 'Neha Gupta']),
    uploadedAt: randomDate(30),
    fileSize: `${rand(100, 5000)} KB`,
    pageCount: rand(2, 50),
    issueDate: randomDate(60),
    expiryDate: Math.random() > 0.3 ? futureDate(90) : null,
    version: rand(1, 5),
    confidential: Math.random() > 0.7,
    notes: pick(['Original document scanned', 'Digitally signed copy', 'Certified true copy', 'Draft for review']),
    folder: pick(['Arrivals', 'Departures', 'Customs', 'Cargo', 'Invoices', 'Reports']),
    tags: Array.from({ length: rand(1, 4) }, () => pick(['urgent', 'confidential', 'signed', 'original', 'copy', 'verified', 'pending'])),
    createdAt: randomDate(60),
    updatedAt: randomDate(7),
  }));
}

function generateNotifications(): PortNotification[] {
  const messages = [
    { title: 'Vessel Arrival', message: 'MSC Aries arriving at Berth 1A in 2 hours', type: 'Vessel Arrival' as PortNotifType, severity: 'Info' as PortNotifSeverity, module: 'Vessels' },
    { title: 'Departure Alert', message: 'Maersk Edinburgh departing Berth 3B - 14:30 hrs', type: 'Departure' as PortNotifType, severity: 'Info' as PortNotifSeverity, module: 'Vessels' },
    { title: 'Schedule Delay', message: 'CMA CGM T. Roosevelt delayed by 6 hours due to weather', type: 'Delay' as PortNotifType, severity: 'Warning' as PortNotifSeverity, module: 'Vessels' },
    { title: 'Berth Assignment', message: 'Berth 2A assigned to COSCO Shipping Leo', type: 'Berth Assignment' as PortNotifType, severity: 'Info' as PortNotifSeverity, module: 'Berths' },
    { title: 'Cargo Exception', message: 'Container MAEU9876543 - Seal broken on arrival', type: 'Cargo Exception' as PortNotifType, severity: 'Critical' as PortNotifSeverity, module: 'Cargo' },
    { title: 'Customs Hold', message: 'Shipment SHP-045 held for customs inspection - DG classification', type: 'Customs Alert' as PortNotifType, severity: 'Warning' as PortNotifSeverity, module: 'Customs' },
    { title: 'Document Ready', message: 'Customs clearance docs ready for MSC Diana', type: 'Document Ready' as PortNotifType, severity: 'Info' as PortNotifSeverity, module: 'Documents' },
    { title: 'Invoice Generated', message: 'Port charges invoice PINV-2025-1008 generated', type: 'Invoice' as PortNotifType, severity: 'Info' as PortNotifSeverity, module: 'Finance' },
    { title: 'System Alert', message: 'Port management system backup completed', type: 'System' as PortNotifType, severity: 'Info' as PortNotifSeverity, module: 'System' },
    { title: 'Weather Warning', message: 'Cyclone alert - Port operations may be affected', type: 'Weather' as PortNotifType, severity: 'Emergency' as PortNotifSeverity, module: 'Operations' },
    { title: 'Berth Release', message: 'Berth 4A released - HMM Algeciras departed ahead of schedule', type: 'Berth Assignment' as PortNotifType, severity: 'Info' as PortNotifSeverity, module: 'Berths' },
    { title: 'Cargo Offload Complete', message: 'Cargo offload from ONE Stork completed - 2,450 TEU', type: 'Cargo Exception' as PortNotifType, severity: 'Info' as PortNotifSeverity, module: 'Cargo' },
    { title: 'Document Expiry', message: 'Port clearance docs for MOL Triumph expiring in 3 days', type: 'Document Ready' as PortNotifType, severity: 'Warning' as PortNotifSeverity, module: 'Documents' },
    { title: 'Customs Clearance', message: 'Customs cleared for Yang Ming Wellbeing - Release approved', type: 'Customs Alert' as PortNotifType, severity: 'Info' as PortNotifSeverity, module: 'Customs' },
    { title: 'Equipment Status', message: 'Gantry Crane #3 maintenance completed - back in service', type: 'System' as PortNotifType, severity: 'Info' as PortNotifSeverity, module: 'Equipment' },
  ];
  return messages.map((msg, i) => ({
    id: `pnotif-${String(i + 1).padStart(3, '0')}`,
    companyId: pick(COMPANIES),
    type: msg.type,
    severity: msg.severity,
    title: msg.title,
    message: msg.message,
    module: msg.module,
    referenceId: Math.random() > 0.3 ? `ref-${String(rand(100, 999))}` : null,
    timestamp: randomDate(3),
    read: Math.random() > 0.5,
    actionUrl: Math.random() > 0.6 ? `/port/${msg.module.toLowerCase()}` : null,
    createdAt: randomDate(7),
  }));
}

// Core shared datasets
export const mockVessels = generateVessels();
export const mockFlights = generateFlights();
export const mockBerths = generateBerths();
export const mockManifests = generateManifests();
export const mockPortCharges = generateCharges();
export const mockCargoOps = generateCargoOps();
export const mockPortDocuments = generateDocuments();
export const mockPortNotifications = generateNotifications();

export const mockPortDashboardStats: PortDashboardStats = {
  vesselsArrivingToday: 4,
  flightsArrivingToday: 8,
  containersInPort: mockContainers.length + rand(5, 20),
  cargoPendingOffload: rand(1500, 5000),
  berthsOccupied: mockBerths.filter(b => b.status === 'Occupied').length,
  berthsAvailable: mockBerths.filter(b => b.status === 'Available').length,
  delayedArrivals: rand(1, 4),
  customsHoldCount: rand(2, 7),
  portRevenueToday: rand(500000, 2000000),
  totalVessels: mockVessels.length,
  totalFlights: mockFlights.length,
  totalBerths: mockBerths.length,
  totalContainers: mockContainers.length + rand(50, 100),
  cargoVolumeToday: rand(5000, 25000),
  yardUtilization: rand(65, 92),
  berthOccupancyRate: rand(60, 88),
  equipmentAvailable: rand(12, 30),
  customsClearanceRate: rand(82, 97),
  avgTurnaroundTime: rand(18, 72),
};
