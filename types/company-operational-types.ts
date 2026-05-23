export type CompanyOperationalType =
  | 'standard'
  | 'custom_agent'
  | 'destination_agent'
  | 'origin_agent'
  | 'transporter'
  | 'trucking_agent';

export interface CompanyOperationalTypeMeta {
  slug: CompanyOperationalType;
  label: string;
  description: string;
  icon: string;
  accentColor: string;
}

export const COMPANY_OPERATIONAL_TYPES: CompanyOperationalTypeMeta[] = [
  {
    slug: 'standard',
    label: 'Standard',
    description: 'General logistics company',
    icon: 'Building2',
    accentColor: '#38bdf8',
  },
  {
    slug: 'custom_agent',
    label: 'Custom Agent',
    description: 'Customs clearance and brokerage services',
    icon: 'ShieldCheck',
    accentColor: '#f59e0b',
  },
  {
    slug: 'destination_agent',
    label: 'Destination Agent',
    description: 'Destination-side logistics coordination',
    icon: 'MapPinned',
    accentColor: '#10b981',
  },
  {
    slug: 'origin_agent',
    label: 'Origin Agent',
    description: 'Origin-side logistics coordination',
    icon: 'Package',
    accentColor: '#8b5cf6',
  },
  {
    slug: 'transporter',
    label: 'Transporter',
    description: 'Multi-modal transport operations',
    icon: 'Truck',
    accentColor: '#f43f5e',
  },
  {
    slug: 'trucking_agent',
    label: 'Trucking Agent',
    description: 'Trucking and road freight services',
    icon: 'Route',
    accentColor: '#14b8a6',
  },
];

export const COMPANY_OPERATIONAL_TYPE_MAP = Object.fromEntries(
  COMPANY_OPERATIONAL_TYPES.map((t) => [t.slug, t])
) as Record<CompanyOperationalType, CompanyOperationalTypeMeta>;
