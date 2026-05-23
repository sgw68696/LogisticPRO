export interface Customer {
  id: string;
  customerId: string;
  name: string;
  type: 'Individual' | 'Business';
  email: string;
  phone: string;
  city: string;
  address: string;
  totalShipments: number;
  outstandingBalance: number;
  createdAt: string;
  slaContract: string | null;
}
