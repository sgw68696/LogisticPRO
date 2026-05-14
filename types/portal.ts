export type PortalBookingStatus =
  | 'Draft' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PortalPaymentMethod =
  | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'UPI' | 'Wire Transfer' | 'Cash';

export type PortalPaymentStatus =
  | 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export type PortalSupportCategory =
  | 'Shipment Issue' | 'Billing' | 'Technical' | 'General' | 'Complaint';

export type PortalSupportPriority =
  | 'Low' | 'Medium' | 'High' | 'Urgent';

export type PortalTicketStatus =
  | 'Open' | 'In Progress' | 'Awaiting Info' | 'Resolved' | 'Closed';

export type PortalDocumentType =
  | 'Bill of Lading' | 'Invoice' | 'Proof of Delivery'
  | 'Packing List' | 'Insurance Certificate' | 'Customs Doc' | 'Other';

export type PortalTrackingEventType =
  | 'Order Placed' | 'Pickup Scheduled' | 'Picked Up'
  | 'In Transit' | 'Arrived at Hub' | 'Out for Delivery'
  | 'Delivered' | 'Failed Attempt' | 'Exception';

export interface PortalBooking {
  id: string;
  bookingRef: string;
  customerId: string;
  serviceType: 'Express' | 'Standard' | 'Freight';
  pickupAddress: string;
  deliveryAddress: string;
  packageWeight: number;
  packageDimensions: string;
  packageType: string;
  description: string;
  pieces: number;
  status: PortalBookingStatus;
  estimatedDelivery: string;
  actualDelivery: string | null;
  quotedPrice: number;
  finalPrice: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  timeline: { status: string; timestamp: string; location: string; notes: string }[];
}

export interface PortalPayment {
  id: string;
  paymentRef: string;
  invoiceId: string;
  invoiceRef: string;
  customerId: string;
  amount: number;
  method: PortalPaymentMethod;
  status: PortalPaymentStatus;
  transactionId: string;
  paidAt: string;
  receiptUrl: string | null;
  notes: string;
}

export interface PortalSupportTicket {
  id: string;
  ticketRef: string;
  customerId: string;
  customerName: string;
  subject: string;
  description: string;
  category: PortalSupportCategory;
  priority: PortalSupportPriority;
  status: PortalTicketStatus;
  attachments: { name: string; url: string }[];
  messages: { from: string; message: string; timestamp: string; isStaff: boolean }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface PortalDocument {
  id: string;
  docRef: string;
  customerId: string;
  type: PortalDocumentType;
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  shipmentRef: string | null;
  bookingRef: string | null;
  status: 'Available' | 'Pending' | 'Expired';
  uploadedAt: string;
  expiresAt: string | null;
  tags: string[];
}

export interface PortalTrackingEvent {
  id: string;
  trackingNumber: string;
  type: PortalTrackingEventType;
  location: string;
  description: string;
  timestamp: string;
  latitude: number;
  longitude: number;
}

export interface PortalDashboardStats {
  activeShipments: number;
  inTransit: number;
  deliveredThisMonth: number;
  pendingBookings: number;
  invoicesDue: number;
  openTickets: number;
  totalSpentThisMonth: number;
  onTimeRate: number;
}
