export interface MockCustomsRecord {
  id: string;
  shipmentId: string;
  declarationNumber: string;
  status: 'Cleared' | 'Pending' | 'Hold' | 'Examined' | 'Released';
  hsCode: string;
  declaredValue: number;
  currency: string;
  originCountry: string;
  destinationCountry: string;
  submittedAt: string;
  clearedAt: string | null;
  examiner: string;
  notes: string;
}

export const mockCustomsRecords: MockCustomsRecord[] = [
  { id: 'custm-001', shipmentId: 'shp-003', declarationNumber: 'DEC-2026-00001', status: 'Cleared', hsCode: '8471.30', declaredValue: 250000, currency: 'INR', originCountry: 'India', destinationCountry: 'USA', submittedAt: '2026-05-01T09:00:00Z', clearedAt: '2026-05-03T14:00:00Z', examiner: 'Rajesh Kumar', notes: 'Standard electronics clearance' },
  { id: 'custm-002', shipmentId: 'shp-008', declarationNumber: 'DEC-2026-00002', status: 'Hold', hsCode: '3004.90', declaredValue: 850000, currency: 'INR', originCountry: 'India', destinationCountry: 'Germany', submittedAt: '2026-05-02T11:00:00Z', clearedAt: null, examiner: 'Priya Sharma', notes: 'Pharmaceutical samples - additional documentation required' },
  { id: 'custm-003', shipmentId: 'shp-012', declarationNumber: 'DEC-2026-00003', status: 'Examined', hsCode: '8708.99', declaredValue: 175000, currency: 'INR', originCountry: 'India', destinationCountry: 'UAE', submittedAt: '2026-05-04T08:30:00Z', clearedAt: null, examiner: 'Ahmed Khan', notes: 'Auto parts - physical inspection scheduled' },
  { id: 'custm-004', shipmentId: 'shp-015', declarationNumber: 'DEC-2026-00004', status: 'Pending', hsCode: '6204.62', declaredValue: 95000, currency: 'INR', originCountry: 'India', destinationCountry: 'UK', submittedAt: '2026-05-05T10:00:00Z', clearedAt: null, examiner: 'Sarah Johnson', notes: 'Textile shipment - awaiting duty assessment' },
  { id: 'custm-005', shipmentId: 'shp-021', declarationNumber: 'DEC-2026-00005', status: 'Released', hsCode: '8473.30', declaredValue: 320000, currency: 'INR', originCountry: 'India', destinationCountry: 'Singapore', submittedAt: '2026-04-28T13:00:00Z', clearedAt: '2026-05-01T16:00:00Z', examiner: 'Wei Ming', notes: 'Computer parts - expedited clearance applied' },
  { id: 'custm-006', shipmentId: 'shp-027', declarationNumber: 'DEC-2026-00006', status: 'Cleared', hsCode: '4011.10', declaredValue: 450000, currency: 'INR', originCountry: 'India', destinationCountry: 'Australia', submittedAt: '2026-04-30T07:00:00Z', clearedAt: '2026-05-02T11:30:00Z', examiner: 'Michael Chen', notes: 'Tire shipment - all documentation in order' },
];
