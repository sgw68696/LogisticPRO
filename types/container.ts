import type { ContainerStatus, ContainerSize } from './enums';

export type { ContainerStatus, ContainerSize };

export interface Container {
  id: string;
  containerId: string;
  size: ContainerSize;
  type: 'Dry Van' | 'Reefer' | 'Open Top' | 'Flat Rack' | 'Tank' | 'Pallet Wide';
  status: ContainerStatus;
  vessel: string;
  voyage: string;
  origin: string;
  destination: string;
  yard: string;
  operator: string;
  gateIn: string;
  gateOut: string | null;
  customsHold: boolean;
  damage: boolean;
  sealNumber: string;
  weight: number;
  lastInspection: string;
}

export interface ContainerEvent {
  id: string;
  containerId: string;
  type: 'Gate In' | 'Stuffed' | 'Loaded' | 'Unloaded' | 'Gate Out' | 'Inspection';
  timestamp: string;
  location: string;
  notes: string;
  performedBy: string;
}
