import type { OrderStatus, PaymentStatus } from './enums';

export type { OrderStatus, PaymentStatus };

export interface Order {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shipmentId: string | null;
  createdAt: string;
  updatedAt: string;
}
