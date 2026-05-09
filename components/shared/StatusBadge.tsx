"use client";

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Shipment statuses
  'Pending': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'Picked Up': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Transit': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Out for Delivery': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Delivered': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Failed': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  // Order statuses
  'Draft': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'Confirmed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Processing': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Shipped': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Returned': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  // Payment statuses
  'Paid': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Partial': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Refunded': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Unpaid': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'Overdue': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  // Vehicle statuses
  'Available': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'On Route': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Maintenance': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Inactive': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  // Driver statuses
  'Active': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'On Duty': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Off Duty': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'Suspended': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  // User statuses
  'Individual': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Business': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
