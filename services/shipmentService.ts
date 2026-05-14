import { shipmentService } from './shipment/shipmentService';
import type { ShipmentFilters } from './shipment/shipmentService';
import type { ConsolidatedShipment, ShipmentStatus, ServiceType } from '@/types/shipment';

export type { ShipmentFilters };
export type { ConsolidatedShipment, ShipmentStatus, ServiceType };

export const getShipments = (filters?: ShipmentFilters) => shipmentService.list(filters);
export const getShipmentById = (id: string) => shipmentService.getById(id);
export const createShipment = (data: Partial<ConsolidatedShipment>) => shipmentService.create(data);
export const updateShipment = (id: string, updates: Partial<ConsolidatedShipment>) => shipmentService.update(id, updates);
export const updateShipmentStatus = (id: string, status: ShipmentStatus, notes?: string) => shipmentService.updateStatus(id, status, notes);
export const deleteShipment = (id: string) => shipmentService.remove(id);
export const bulkUpdateStatus = (ids: string[], status: ShipmentStatus) => shipmentService.bulkUpdateStatus(ids, status);
export const getShipmentStats = (role?: string) => shipmentService.getStats(role);
