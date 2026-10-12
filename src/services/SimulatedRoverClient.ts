import { RoverClient, RoverStatus, RoverState, Waypoint, CallPoint } from '../types/rover';
import routeData from '../data/route.json';

export class SimulatedRoverClient implements RoverClient {
  private statusData: RoverStatus;
  private listeners = new Set<(status: RoverStatus) => void>();
  private loopInterval: number | null = null;
  private speedMultiplier = 1;
  private waypoints: Waypoint[] = routeData.waypoints;
  private callPoints: CallPoint[] = routeData.call_points;
  private currentTargetIndex = 0;
  private isReturning = false;
  private distanceSinceZero = 0;
  public eventLog: Array<{ time: string; state: RoverState; msg: string }> = [];

  constructor() {
    this.statusData = {
      t: 100,
      state: 'docked',
      pose: { x_m: 0.0, y_m: 0.0, heading_deg: 0.0 },
      speed_mps: 0.0,
      route: {
        id: 'route-1',
        progress_pct: 0,
        current_waypoint: 0,
        distance_remaining_m: 0,
        eta_s: 0
      },
      obstacle_mm: 1200,
      drive_pack: {
        voltage_v: 12.4,
        soc_pct: 88,
        current_a: 0.0,
        capacity_mah: 2000
      },
      bank: {
        soc_pct: 94,
        output_w: 0.0,
        phone_connected: false,
        capacity_mah: 10000
      },
      dock: {
        docked: true,
        panel_v: 17.8,
        charge_a: 0.85,
        stage: 'cc',
        daily_harvest_wh: 26.4
      },
      uncertainty_m: 0.1,
      fault: null,
      mode: 'simulated'
    };

    this.logEvent('docked', 'rover docked at solar dock a. pack charging via 10 w panel.');
    this.startSimulationLoop();
  }

  public status(): RoverStatus {
    return { ...this.statusData };
  }

  public subscribe(cb: (status: RoverStatus) => void): () => void {
    this.listeners.add(cb);
    cb(this.statusData);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb({ ...this.statusData }));
  }

  public setSpeedMultiplier(mult: number) {
    this.speedMultiplier = mult;
  }

  private logEvent(state: RoverState, msg: string) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.eventLog.unshift({ time, state, msg });
    if (this.eventLog.length > 30) this.eventLog.pop();
  }

  public async call(callPointId: string): Promise<{ accepted: boolean; eta_s?: number; reason?: string }> {
    if (this.statusData.drive_pack.soc_pct < 25) {
      this.logEvent('docked', 'call rejected: rover pack below 25% reserve threshold.');
      return {
        accepted: false,
        reason: 'rover battery below reserve threshold (25%). currently solar charging at dock.'
      };
    }

    const cp = this.callPoints.find(p => p.id === callPointId) || this.callPoints[0];
    this.statusData.state = 'called';
    this.statusData.dock.docked = false;
    this.logEvent('called', `dispatch requested for ${cp.name} (${cp.distance_m}m away).`);
    this.notify();

    setTimeout(() => {
      this.statusData.state = 'departing';
      this.logEvent('departing', 'disengaging dock pogo-pins. dead-reckoning origin calibrated.');
      this.distanceSinceZero = 0;
      this.statusData.uncertainty_m = 0.1;
      this.notify();

      setTimeout(() => {
        this.statusData.state = 'travelling';
        this.isReturning = false;
        // Target nearest waypoint matching call point
        const targetWp = this.waypoints.findIndex(w => Math.hypot(w.x_m - cp.x_m, w.y_m - cp.y_m) < 8) || 3;
        this.currentTargetIndex = targetWp;
        this.logEvent('travelling', `following taught route to waypoint ${this.currentTargetIndex}.`);
        this.notify();
      }, 1500 / this.speedMultiplier);
    }, 1200 / this.speedMultiplier);

    return { accepted: true, eta_s: cp.est_travel_s };
  }

  public async returnHome(): Promise<{ ok: boolean }> {
    this.isReturning = true;
    this.statusData.state = 'returning';
    this.logEvent('returning', 'mission ended. returning to solar dock a.');
    this.notify();
    return { ok: true };
  }

  public async stop(): Promise<{ ok: boolean }> {
    this.statusData.speed_mps = 0.0;
    this.logEvent(this.statusData.state, 'rover drive paused.');
    this.notify();
    return { ok: true };
  }

  public async emergencyStop(): Promise<{ ok: boolean }> {
    this.statusData.state = 'e_stop';
    this.statusData.speed_mps = 0.0;
    this.logEvent('e_stop', 'EMERGENCY BRAKE ACTUATED. H-bridge disabled.');
    this.notify();
    return { ok: true };
  }

  public async startServing(): Promise<{ ok: boolean }> {
    this.statusData.state = 'serving';
    this.statusData.bank.phone_connected = true;
    this.statusData.bank.output_w = 9.8;
    this.logEvent('serving', 'phone connected to 10,000 mah power bank. delivering 5 v / 2 a.');
    this.notify();
    return { ok: true };
  }

  private startSimulationLoop() {
    if (this.loopInterval) clearInterval(this.loopInterval);

    this.loopInterval = window.setInterval(() => {
      this.statusData.t += 1;

      // Handle motion
      if (this.statusData.state === 'travelling') {
        const target = this.waypoints[this.currentTargetIndex] || this.waypoints[this.waypoints.length - 1];
        const dx = target.x_m - this.statusData.pose.x_m;
        const dy = target.y_m - this.statusData.pose.y_m;
        const dist = Math.hypot(dx, dy);

        if (dist > 0.4) {
          const step = Math.min(dist, 0.3 * this.speedMultiplier);
          const angle = Math.atan2(dy, dx);
          this.statusData.pose.x_m += Math.cos(angle) * step;
          this.statusData.pose.y_m += Math.sin(angle) * step;
          this.statusData.pose.heading_deg = Math.round((angle * 180) / Math.PI);
          this.statusData.speed_mps = 0.3 * this.speedMultiplier;

          // Dead reckoning drift grows with distance
          this.distanceSinceZero += step;
          this.statusData.uncertainty_m = Math.min(2.5, +(0.1 + this.distanceSinceZero * 0.015).toFixed(2));

          // Pack discharge
          this.statusData.drive_pack.soc_pct = Math.max(10, +(this.statusData.drive_pack.soc_pct - 0.02 * this.speedMultiplier).toFixed(2));
          this.statusData.drive_pack.voltage_v = +(11.1 + (this.statusData.drive_pack.soc_pct / 100) * 1.5).toFixed(2);
        } else {
          // Re-zero at waypoint!
          this.statusData.uncertainty_m = 0.15;
          this.distanceSinceZero = 0;
          this.statusData.state = 'arrived';
          this.statusData.speed_mps = 0.0;
          this.logEvent('arrived', 'arrived at destination. ready to charge user phone.');
        }
        this.notify();
      } else if (this.statusData.state === 'serving') {
        // Power bank discharges into phone
        this.statusData.bank.soc_pct = Math.max(5, +(this.statusData.bank.soc_pct - 0.08 * this.speedMultiplier).toFixed(2));
        this.notify();
      } else if (this.statusData.state === 'returning') {
        const dock = this.waypoints[0];
        const dx = dock.x_m - this.statusData.pose.x_m;
        const dy = dock.y_m - this.statusData.pose.y_m;
        const dist = Math.hypot(dx, dy);

        if (dist > 0.4) {
          const step = Math.min(dist, 0.3 * this.speedMultiplier);
          const angle = Math.atan2(dy, dx);
          this.statusData.pose.x_m += Math.cos(angle) * step;
          this.statusData.pose.y_m += Math.sin(angle) * step;
          this.statusData.pose.heading_deg = Math.round((angle * 180) / Math.PI);
          this.statusData.speed_mps = 0.3 * this.speedMultiplier;
        } else {
          this.statusData.state = 'docking';
          this.statusData.speed_mps = 0.1;
          this.logEvent('docking', 'funnel alignment guide engaged. mating pogo pins.');
          setTimeout(() => {
            this.statusData.state = 'charging';
            this.statusData.dock.docked = true;
            this.statusData.pose = { x_m: 0.0, y_m: 0.0, heading_deg: 0.0 };
            this.statusData.uncertainty_m = 0.05;
            this.logEvent('charging', 'docked successfully. solar charging stage active.');
            this.notify();
          }, 1500 / this.speedMultiplier);
        }
        this.notify();
      } else if (this.statusData.state === 'charging' || this.statusData.state === 'docked') {
        // Solar charge accumulation
        if (this.statusData.drive_pack.soc_pct < 100) {
          this.statusData.drive_pack.soc_pct = Math.min(100, +(this.statusData.drive_pack.soc_pct + 0.03 * this.speedMultiplier).toFixed(2));
        }
        if (this.statusData.bank.soc_pct < 100) {
          this.statusData.bank.soc_pct = Math.min(100, +(this.statusData.bank.soc_pct + 0.04 * this.speedMultiplier).toFixed(2));
        }
        this.notify();
      }
    }, 500);
  }
}

export const simulatedClient = new SimulatedRoverClient();
