import { RoverClient, RoverStatus } from '../types/rover';

export class LiveRoverClient implements RoverClient {
  private baseUrl = 'http://sparc.local';
  private statusData: RoverStatus | null = null;
  private listeners = new Set<(status: RoverStatus) => void>();
  private pollInterval: number | null = null;
  private lastUpdateTs = Date.now();
  public connectionState: 'connecting' | 'live' | 'lost' = 'connecting';

  constructor(customUrl?: string) {
    if (customUrl) this.baseUrl = customUrl;
    this.startPolling();
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
    this.startPolling();
  }

  public status(): RoverStatus {
    if (!this.statusData) {
      return {
        t: 0,
        state: 'fault',
        pose: { x_m: 0, y_m: 0, heading_deg: 0 },
        speed_mps: 0,
        route: { id: 'route-1', progress_pct: 0, current_waypoint: 0, distance_remaining_m: 0, eta_s: 0 },
        obstacle_mm: 0,
        drive_pack: { voltage_v: 0, soc_pct: 0, current_a: 0, capacity_mah: 2000 },
        bank: { soc_pct: 0, output_w: 0, phone_connected: false, capacity_mah: 10000 },
        dock: { docked: false, panel_v: 0, charge_a: 0, stage: 'idle', daily_harvest_wh: 0 },
        uncertainty_m: 0,
        fault: 'connecting to pico w...',
        mode: 'live'
      };
    }
    return { ...this.statusData, mode: 'live' };
  }

  public subscribe(cb: (status: RoverStatus) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public setSpeedMultiplier(_mult: number) {
    // Live hardware runs on real physical motors
  }

  public async call(callPointId: string): Promise<{ accepted: boolean; eta_s?: number; reason?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call_point_id: callPointId })
      });
      return await res.json();
    } catch (e) {
      return { accepted: false, reason: 'failed to reach pico w over wi-fi' };
    }
  }

  public async returnHome(): Promise<{ ok: boolean }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/return`, { method: 'POST' });
      return await res.json();
    } catch {
      return { ok: false };
    }
  }

  public async stop(): Promise<{ ok: boolean }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/stop`, { method: 'POST' });
      return await res.json();
    } catch {
      return { ok: false };
    }
  }

  public async emergencyStop(): Promise<{ ok: boolean }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/estop`, { method: 'POST' });
      return await res.json();
    } catch {
      return { ok: false };
    }
  }

  private startPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    this.pollInterval = window.setInterval(async () => {
      try {
        const res = await fetch(`${this.baseUrl}/api/status`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const raw = await res.json();
          this.statusData = {
            t: raw.t,
            state: raw.state,
            pose: raw.pose,
            speed_mps: raw.speed_mps,
            route: {
              id: raw.route?.id || 'route-1',
              progress_pct: raw.route?.progress_pct || 0,
              current_waypoint: 0,
              distance_remaining_m: 0,
              eta_s: 0
            },
            obstacle_mm: raw.obstacle_mm,
            drive_pack: {
              ...raw.drive_pack,
              capacity_mah: 2000
            },
            bank: {
              ...raw.bank,
              capacity_mah: 10000
            },
            dock: {
              ...raw.dock,
              daily_harvest_wh: 0
            },
            uncertainty_m: 0.2,
            fault: raw.fault,
            mode: 'live'
          };
          this.connectionState = 'live';
          this.lastUpdateTs = Date.now();
          this.listeners.forEach(cb => cb(this.statusData!));
        } else {
          this.connectionState = 'lost';
        }
      } catch {
        this.connectionState = 'lost';
      }
    }, 1000);
  }
}

export const liveClient = new LiveRoverClient();
