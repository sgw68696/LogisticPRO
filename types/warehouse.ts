export interface InventoryItem {
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  location: string;
  lastUpdated: string;
}

export interface Warehouse {
  id: string;
  warehouseId: string;
  name: string;
  location: string;
  city: string;
  capacity: number;
  currentStock: number;
  manager: string;
  contact: string;
  inventory: InventoryItem[];
  inboundLogs: { date: string; items: number; source: string }[];
  outboundLogs: { date: string; items: number; destination: string }[];
}
