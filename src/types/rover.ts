// S.P.A.R.C. Core Data Contracts and State Machine Definitions

export type RoverState =
  | 'docked'
  | 'called'
  | 'departing'
  | 'travelling'
  | 'arrived'
  | 'serving'
  | 'returning'
  | 'docking'
  | 'charging'
  | 'obstacle_wait'
  | 'fault'
  | 'e_stop';

export interface RoverPose {
  x_m: number;
  y_m: number;
  heading_deg: number;
}

export interface DrivePackTelemetry {
  voltage_v: number;
  soc_pct: number;
  current_a: number;
  capacity_mah: number; // 2000 mAh 3S Li-ion nominal 11.1 V (~22.2 Wh)
}

export interface PowerBankTelemetry {
  soc_pct: number;
  output_w: number;
  phone_connected: boolean;
  capacity_mah: number; // 10,000 mAh at 3.7 V (~37 Wh)
}

export interface DockTelemetry {
  docked: boolean;
  panel_v: number;
  charge_a: number;
  stage: 'idle' | 'cc' | 'cv' | 'done';
  daily_harvest_wh: number;
}

export interface RoverStatus {
  t: number;
  state: RoverState;
  pose: RoverPose;
  speed_mps: number;
  route: {
    id: string;
    progress_pct: number;
    current_waypoint: number;
    distance_remaining_m: number;
    eta_s: number;
  };
  obstacle_mm: number;
  drive_pack: DrivePackTelemetry;
  bank: PowerBankTelemetry;
  dock: DockTelemetry;
  uncertainty_m: number; // dead-reckoning drift since last dock/re-zero
  fault: string | null;
  mode: 'simulated' | 'live';
}

export interface Waypoint {
  id: number;
  x_m: number;
  y_m: number;
  label?: string;
}

export interface CallPoint {
  id: string;
  name: string;
  x_m: number;
  y_m: number;
  distance_m: number;
  est_travel_s: number;
}

export interface DockStation {
  id: string;
  name: string;
  status: 'live' | 'planned';
  rover_docked: boolean;
  panel_watts: number;
  x_m: number;
  y_m: number;
}

export interface PhoneModel {
  brand: string;
  model: string;
  capacity_mah: number;
  nominal_v: number;
  source: string;
}

export interface RoverClient {
  status(): RoverStatus;
  call(callPointId: string): Promise<{ accepted: boolean; eta_s?: number; reason?: string }>;
  returnHome(): Promise<{ ok: boolean }>;
  stop(): Promise<{ ok: boolean }>;
  emergencyStop(): Promise<{ ok: boolean }>;
  subscribe(cb: (status: RoverStatus) => void): () => void;
  setSpeedMultiplier(mult: number): void;
}
