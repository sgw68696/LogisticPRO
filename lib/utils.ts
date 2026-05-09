import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date utility
export function formatDate(date: string | Date, format: 'short' | 'long' | 'datetime' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: 'short', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    datetime: { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  }[format];
  
  return d.toLocaleDateString('en-IN', options);
}

// Format currency utility (INR)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate tracking ID
export function generateTrackingId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `LOG-${year}-${random}`;
}

// Generate unique ID
export function generateId(prefix: string): string {
  const random = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${String(random).padStart(3, '0')}`;
}

// Status color mapping
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Shipment statuses
    'Pending': 'bg-gray-100 text-gray-800',
    'Picked Up': 'bg-blue-100 text-blue-800',
    'In Transit': 'bg-indigo-100 text-indigo-800',
    'Out for Delivery': 'bg-amber-100 text-amber-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Failed': 'bg-red-100 text-red-800',
    // Order statuses
    'Draft': 'bg-gray-100 text-gray-800',
    'Confirmed': 'bg-blue-100 text-blue-800',
    'Processing': 'bg-indigo-100 text-indigo-800',
    'Shipped': 'bg-amber-100 text-amber-800',
    'Returned': 'bg-red-100 text-red-800',
    // Payment statuses
    'Paid': 'bg-green-100 text-green-800',
    'Partial': 'bg-amber-100 text-amber-800',
    'Refunded': 'bg-purple-100 text-purple-800',
    'Unpaid': 'bg-gray-100 text-gray-800',
    'Overdue': 'bg-red-100 text-red-800',
    // Vehicle statuses
    'Available': 'bg-green-100 text-green-800',
    'On Route': 'bg-blue-100 text-blue-800',
    'Maintenance': 'bg-amber-100 text-amber-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    // Driver statuses
    'Active': 'bg-green-100 text-green-800',
    'On Duty': 'bg-blue-100 text-blue-800',
    'Off Duty': 'bg-gray-100 text-gray-800',
    'Suspended': 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
