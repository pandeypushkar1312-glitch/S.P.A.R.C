// ==========================================================================
// VOLTRIDE ROVER SIMULATOR ENGINE (DEMO MODE & HARDWARE EMULATOR)
// Follows /docs/rover_api.md JSON contract
// ==========================================================================

export class RoverSimulator {
  constructor() {
    this.demoMode = true;
    
    // Campus Base Reference Coordinates (Bangalore Tech Campus / Engineering Quad)
    this.campusOrigin = { lat: 12.9716, lng: 77.5946 };
    
    // Multi-Rover Fleet
    this.fleet = [
      {
        rover_id: "ROV-01",
        lat: 12.9702,
        lng: 77.5932,
        heading: 45,
        speed: 1.2,
        battery_pct: 92,
        status: "idle",
        eta_seconds: 120,
        distance_remaining_m: 180,
        obstacle_detected: false,
        obstacle_distance_cm: 999,
        pad_temp_c: 28.5,
        charging_power_w: 0.0,
        session_energy_wh: 0.0,
        coil_alignment_pct: 95,
        lock_status: "locked",
        pin_code: "4829",
        dock_name: "Engineering Library Dock"
      },
      {
        rover_id: "ROV-02",
        lat: 12.9729,
        lng: 77.5960,
        heading: 180,
        speed: 0.0,
        battery_pct: 78,
        status: "idle",
        eta_seconds: 240,
        distance_remaining_m: 350,
        obstacle_detected: false,
        obstacle_distance_cm: 999,
        pad_temp_c: 29.1,
        charging_power_w: 0.0,
        session_energy_wh: 0.0,
        coil_alignment_pct: 90,
        lock_status: "locked",
        pin_code: "7134",
        dock_name: "Hostel Block 4 Station"
      },
      {
        rover_id: "ROV-03",
        lat: 12.9691,
        lng: 77.5958,
        heading: 270,
        speed: 0.0,
        battery_pct: 64,
        status: "idle",
        eta_seconds: 310,
        distance_remaining_m: 420,
        obstacle_detected: false,
        obstacle_distance_cm: 999,
        pad_temp_c: 30.0,
        charging_power_w: 0.0,
        session_energy_wh: 0.0,
        coil_alignment_pct: 92,
        lock_status: "locked",
        pin_code: "9201",
        dock_name: "Sports Complex Hub"
      }
    ];

    this.activeOrder = null;
    this.assignedRover = null;
    this.routeWaypoints = [];
    this.currentWaypointIndex = 0;
    this.timerId = null;
    this.chargeTimerId = null;
    this.listeners = new Set();
    this.obstacleTriggeredOnce = false;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error("Listener error:", err);
      }
    });
  }

  setDemoMode(enabled) {
    this.demoMode = enabled;
    this.notify("demo_mode_changed", { enabled });
  }

  getFleet() {
    return this.fleet;
  }

  // ========================================================================
  // ORDER DISPATCH & WAYPOINT INTERPOLATION
  // ========================================================================
  dispatchOrder(orderData) {
    // Select closest or first available rover
    const rover = this.fleet.find(r => r.status === "idle") || this.fleet[0];
    this.assignedRover = rover;
    this.activeOrder = {
      ...orderData,
      rover_id: rover.rover_id,
      pin_code: Math.floor(1000 + Math.random() * 9000).toString(),
      status: "assigned",
      startTime: Date.now(),
      elapsedSeconds: 0,
      charging_power_w: 0.0,
      session_energy_wh: 0.0
    };
    rover.pin_code = this.activeOrder.pin_code;
    rover.status = "assigned";
    rover.lock_status = "locked";
    this.obstacleTriggeredOnce = false;

    // Generate 12 realistic waypoints between rover's starting spot and destination
    this.routeWaypoints = this.generateWaypoints(
      { lat: rover.lat, lng: rover.lng },
      { lat: orderData.dest_lat, lng: orderData.dest_lng },
      12
    );
    this.currentWaypointIndex = 0;

    this.notify("order_assigned", { order: this.activeOrder, rover });

    // Transition to en_route after 2 seconds
    setTimeout(() => {
      if (this.assignedRover && this.assignedRover.status === "assigned") {
        this.assignedRover.status = "en_route";
        this.notify("status_changed", { status: "en_route", rover: this.assignedRover });
        this.startNavigationLoop();
      }
    }, 2000);

    return this.activeOrder;
  }

  generateWaypoints(start, end, steps) {
    const waypoints = [];
    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      // Add slight campus walkway wiggle
      const curveOffset = Math.sin(fraction * Math.PI) * 0.0003;
      waypoints.push({
        lat: start.lat + (end.lat - start.lat) * fraction + curveOffset,
        lng: start.lng + (end.lng - start.lng) * fraction - curveOffset * 0.5
      });
    }
    return waypoints;
  }

  startNavigationLoop() {
    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      if (!this.assignedRover || this.assignedRover.status !== "en_route") {
        clearInterval(this.timerId);
        return;
      }

      // Step along waypoints
      if (this.currentWaypointIndex < this.routeWaypoints.length - 1) {
        this.currentWaypointIndex++;
        const targetPt = this.routeWaypoints[this.currentWaypointIndex];
        
        // Calculate heading
        const dLng = targetPt.lng - this.assignedRover.lng;
        const dLat = targetPt.lat - this.assignedRover.lat;
        const headingDeg = (Math.atan2(dLng, dLat) * (180 / Math.PI) + 360) % 360;

        this.assignedRover.lat = targetPt.lat;
        this.assignedRover.lng = targetPt.lng;
        this.assignedRover.heading = Math.round(headingDeg);
        this.assignedRover.speed = 1.25;

        // Decrease ETA & distance
        const remainingSteps = this.routeWaypoints.length - 1 - this.currentWaypointIndex;
        this.assignedRover.eta_seconds = Math.max(0, remainingSteps * 5);
        this.assignedRover.distance_remaining_m = Math.max(0, remainingSteps * 15);

        // Simulate random obstacle scenario halfway through
        if (this.currentWaypointIndex === 5 && !this.obstacleTriggeredOnce) {
          this.obstacleTriggeredOnce = true;
          this.assignedRover.obstacle_detected = true;
          this.assignedRover.obstacle_distance_cm = 48.0;
          this.notify("obstacle_detected", { rover: this.assignedRover });

          // Auto-resume after 2.5 seconds (obstacle cleared/rerouted)
          setTimeout(() => {
            if (this.assignedRover) {
              this.assignedRover.obstacle_detected = false;
              this.assignedRover.obstacle_distance_cm = 999.0;
              this.notify("obstacle_cleared", { rover: this.assignedRover });
            }
          }, 2500);
        }

        this.notify("telemetry_update", { rover: this.assignedRover, order: this.activeOrder });
      } else {
        // Rover has arrived!
        clearInterval(this.timerId);
        this.assignedRover.status = "arrived";
        this.assignedRover.speed = 0.0;
        this.assignedRover.eta_seconds = 0;
        this.assignedRover.distance_remaining_m = 0;
        this.notify("status_changed", { status: "arrived", rover: this.assignedRover });
        this.notify("rover_arrived", { rover: this.assignedRover, order: this.activeOrder });
      }
    }, 1500);
  }

  // ========================================================================
  // UNLOCK, CHARGING LOOP & SENSORS
  // ========================================================================
  unlockRover(pinAttempt) {
    if (!this.assignedRover) return { success: false, message: "No active rover" };

    if (pinAttempt === this.assignedRover.pin_code) {
      this.assignedRover.status = "charging";
      this.assignedRover.lock_status = "unlocked";
      this.notify("status_changed", { status: "charging", rover: this.assignedRover });
      this.startChargingSession();
      return { success: true };
    } else {
      return { success: false, message: "Incorrect PIN code. Check in-app PIN." };
    }
  }

  startChargingSession() {
    if (this.chargeTimerId) clearInterval(this.chargeTimerId);

    const isFast = this.activeOrder?.charging_mode === "fast_15w";
    const targetWatts = isFast ? 14.8 : 5.0;
    
    this.assignedRover.charging_power_w = 0.0;
    this.assignedRover.session_energy_wh = 0.0;
    this.assignedRover.pad_temp_c = 29.5;
    this.assignedRover.coil_alignment_pct = 94;

    this.chargeTimerId = setInterval(() => {
      if (!this.assignedRover || this.assignedRover.status !== "charging") {
        clearInterval(this.chargeTimerId);
        return;
      }

      // Smoothly ramp up watts
      if (this.assignedRover.charging_power_w < targetWatts) {
        this.assignedRover.charging_power_w = Math.min(
          targetWatts,
          +(this.assignedRover.charging_power_w + 1.2).toFixed(1)
        );
      }

      // Heat generation proportional to power
      if (this.assignedRover.pad_temp_c < 37.5) {
        this.assignedRover.pad_temp_c = +(this.assignedRover.pad_temp_c + 0.1).toFixed(1);
      }

      // Accumulate energy: Watts * hours (1 sec = 1/3600 h)
      const energyIncrement = (this.assignedRover.charging_power_w / 3600);
      this.assignedRover.session_energy_wh = +(this.assignedRover.session_energy_wh + energyIncrement).toFixed(2);

      if (this.activeOrder) {
        this.activeOrder.elapsedSeconds += 1;
        this.activeOrder.session_energy_wh = this.assignedRover.session_energy_wh;
        this.activeOrder.charging_power_w = this.assignedRover.charging_power_w;
      }

      this.notify("charging_tick", {
        rover: this.assignedRover,
        order: this.activeOrder
      });
    }, 1000);
  }

  pauseCharging() {
    if (this.assignedRover && this.assignedRover.status === "charging") {
      this.assignedRover.charging_power_w = 0.0;
      this.notify("charging_paused", { rover: this.assignedRover });
    }
  }

  resumeCharging() {
    if (this.assignedRover && this.assignedRover.status === "charging") {
      const isFast = this.activeOrder?.charging_mode === "fast_15w";
      this.assignedRover.charging_power_w = isFast ? 14.8 : 5.0;
      this.notify("charging_resumed", { rover: this.assignedRover });
    }
  }

  addChargingTime(seconds = 600) {
    if (this.activeOrder) {
      this.activeOrder.target_duration_mins = (this.activeOrder.target_duration_mins || 30) + 10;
      this.notify("charging_extended", { order: this.activeOrder });
    }
  }

  endChargingSession() {
    if (this.chargeTimerId) clearInterval(this.chargeTimerId);

    if (this.assignedRover) {
      this.assignedRover.status = "returning";
      this.assignedRover.charging_power_w = 0.0;
      this.assignedRover.lock_status = "locked";
      this.notify("status_changed", { status: "returning", rover: this.assignedRover });

      const finalSummary = {
        order_id: this.activeOrder?.order_id || `ORD-${Date.now().toString().slice(-4)}`,
        rover_id: this.assignedRover.rover_id,
        duration_seconds: this.activeOrder?.elapsedSeconds || 120,
        energy_wh: this.assignedRover.session_energy_wh || 4.25,
        total_cost: Math.max(15, Math.round((this.activeOrder?.elapsedSeconds || 120) * 0.25)),
        co2_saved_grams: Math.round((this.assignedRover.session_energy_wh || 4.25) * 0.85),
        completed_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Reset rover to idle after return
      setTimeout(() => {
        if (this.assignedRover) {
          this.assignedRover.status = "idle";
          this.assignedRover.session_energy_wh = 0.0;
          this.assignedRover.charging_power_w = 0.0;
          this.assignedRover = null;
          this.activeOrder = null;
          this.notify("status_changed", { status: "idle" });
        }
      }, 5000);

      this.notify("session_completed", { summary: finalSummary });
      return finalSummary;
    }
    return null;
  }

  // ========================================================================
  // HARDWARE COMMANDS: LOCATE PING & EMERGENCY STOP
  // ========================================================================
  pingLocate() {
    if (this.assignedRover) {
      this.notify("hardware_chirp", {
        rover_id: this.assignedRover.rover_id,
        buzzer_hz: 3200,
        led_flashes: 6
      });
      return true;
    }
    return false;
  }

  emergencyStop() {
    if (this.timerId) clearInterval(this.timerId);
    if (this.chargeTimerId) clearInterval(this.chargeTimerId);

    if (this.assignedRover) {
      this.assignedRover.status = "emergency_stop";
      this.assignedRover.speed = 0.0;
      this.assignedRover.charging_power_w = 0.0;
      this.notify("status_changed", { status: "emergency_stop", rover: this.assignedRover });
      return true;
    }
    return false;
  }

  cancelOrder() {
    if (this.timerId) clearInterval(this.timerId);
    if (this.chargeTimerId) clearInterval(this.chargeTimerId);

    if (this.assignedRover) {
      this.assignedRover.status = "returning";
      this.notify("status_changed", { status: "returning", rover: this.assignedRover });
      setTimeout(() => {
        if (this.assignedRover) {
          this.assignedRover.status = "idle";
          this.assignedRover = null;
          this.activeOrder = null;
        }
      }, 3000);
    }
    this.notify("order_cancelled", {});
  }
}

export const simulator = new RoverSimulator();
