import type { InvoiceStatus } from './enums';

export type { InvoiceStatus };

export interface Invoice {
  id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  shipmentId: string | null;
  orderId: string | null;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidDate: string | null;
  items: { description: string; quantity: number; rate: number; amount: number }[];
  createdAt: string;
}
