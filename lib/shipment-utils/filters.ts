interface HasDate {
  createdAt?: string;
  updatedAt?: string;
}

interface HasSearchFields {
  [key: string]: any;
}

interface HasStatus {
  status: string;
}

export function filterShipmentsByDate<T extends HasDate>(shipments: T[], dateFrom?: string, dateTo?: string): T[] {
  let result = [...shipments];
  if (dateFrom) result = result.filter(s => new Date(s.createdAt || s.updatedAt || '').getTime() >= new Date(dateFrom).getTime());
  if (dateTo) result = result.filter(s => new Date(s.createdAt || s.updatedAt || '').getTime() <= new Date(dateTo).getTime());
  return result;
}

export function filterShipmentsBySearch<T extends HasSearchFields>(shipments: T[], query: string, fields: (keyof T)[]): T[] {
  if (!query) return shipments;
  const q = query.toLowerCase();
  return shipments.filter(s => fields.some(f => String(s[f] || '').toLowerCase().includes(q)));
}

export function filterShipmentsByStatus<T extends HasStatus>(shipments: T[], status: string | string[]): T[] {
  if (!status || status === 'All' || (Array.isArray(status) && status.length === 0)) return shipments;
  const allowed = Array.isArray(status) ? status : [status];
  return shipments.filter(s => allowed.includes(s.status));
}
