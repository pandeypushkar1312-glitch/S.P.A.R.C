# VOLTRIDE — Autonomous Wireless Charging Rover API & Hardware Contract
Version: 1.0.0  
Status: Active Specification  
Target Hardware: ESP32 / Raspberry Pi 4 / STM32  
Communication Protocols: Firebase Realtime Database / MQTT / WebSocket  

---

## 1. Executive Summary

**VOLTRIDE** is an on-demand autonomous mobile robot (AMR) designed for university campuses, tech parks, and urban spaces. It carries an integrated high-efficiency Qi wireless inductive charging pad (5W Standard / 15W Fast Qi-compatible coil array) with dynamic alignment detection and safety telemetry.

This document defines the bi-directional communication contract between the **VOLTRIDE Mobile App** (client) and the **Rover Embedded Compute & Control Unit** (hardware: ESP32 / Raspberry Pi).

---

## 2. Communication Topology & Topics

### 2.1 MQTT Broker Topics
When deployed using an MQTT broker (e.g. HiveMQ, EMQX, or AWS IoT Core):
* **Rover Telemetry (Rover -> App/Cloud):** `voltride/rovers/{rover_id}/telemetry` (QoS 1, Published every 500ms - 1000ms)
* **Rover Events (Rover -> App/Cloud):** `voltride/rovers/{rover_id}/events` (QoS 2, Obstacle, arrival, thermal alerts)
* **App Commands (App/Cloud -> Rover):** `voltride/rovers/{rover_id}/commands` (QoS 2)
* **Pad Sensor State (Rover -> App/Cloud):** `voltride/rovers/{rover_id}/charging` (QoS 1, Published every 1000ms during active charge)

### 2.2 Firebase Realtime Database Structure
When deployed using Google Firebase:
```json
{
  "rovers": {
    "ROV-01": {
      "telemetry": { ... },
      "command": { ... }
    }
  },
  "orders": {
    "ORD-2026-9901": { ... }
  }
}
```

---

## 3. Rover Telemetry Contract (Rover -> App)

Published by the rover navigation & power controller:

```json
{
  "rover_id": "ROV-01",
  "firmware_version": "v2.4.1",
  "timestamp": 1791817529,
  "lat": 12.971598,
  "lng": 77.594566,
  "heading": 142.5,
  "speed": 1.25,
  "battery_pct": 86,
  "status": "en_route",
  "eta_seconds": 180,
  "distance_remaining_m": 240.5,
  "obstacle_detected": false,
  "obstacle_distance_cm": 999.0,
  "pad_temp_c": 31.2,
  "charging_power_w": 0.0,
  "session_energy_wh": 0.0,
  "coil_alignment_pct": 0,
  "lock_status": "locked",
  "fault_code": null
}
```

### 3.1 Field Specifications

| Field | Type | Unit / Enum | Description |
| :--- | :--- | :--- | :--- |
| `rover_id` | String | e.g. "ROV-01" | Unique hardware identifier for the rover |
| `firmware_version` | String | SemVer | Embedded firmware version |
| `timestamp` | Integer | Unix seconds | Epoch timestamp of telemetry sample |
| `lat` | Float | Degrees | Current GPS latitude (-90.0 to +90.0) |
| `lng` | Float | Degrees | Current GPS longitude (-180.0 to +180.0) |
| `heading` | Float | Degrees (0 - 359.9) | Compass azimuth (0 = North, 90 = East, 180 = South, 270 = West) |
| `speed` | Float | m/s | Current ground speed |
| `battery_pct` | Integer | 0 - 100 % | Rover's internal LiFePO4 battery pack level |
| `status` | String | Enum (see below) | Current mission & state machine state |
| `eta_seconds` | Integer | Seconds | Estimated time of arrival to user destination |
| `distance_remaining_m`| Float | Meters | Distance along planned route to destination |
| `obstacle_detected` | Boolean | true / false | Ultrasonic / LiDAR obstacle safety trip |
| `obstacle_distance_cm`| Float | Centimeters | Distance to nearest obstacle |
| `pad_temp_c` | Float | Celsius (°C) | Qi pad thermistor reading (Safety cutoff > 48°C) |
| `charging_power_w` | Float | Watts (W) | Live inductive power delivery to phone |
| `session_energy_wh` | Float | Watt-hours (Wh) | Cumulative energy delivered in active session |
| `coil_alignment_pct`| Integer | 0 - 100 % | Magnetic coupling efficiency & coil alignment |
| `lock_status` | String | `locked` / `unlocked` | Qi pad physical lock / activation relay status |
| `fault_code` | String / null| e.g. `ERR_MOTOR_OVERHEAT` | Diagnostics fault code if status is `fault` |

### 3.2 Rover Status State Machine

```
              ┌─────────┐
              │  IDLE   │◄──────────────┐
              └────┬────┘               │
                   │ (App sends "go")   │
                   ▼                    │
              ┌─────────┐               │
              │ASSIGNED │               │
              └────┬────┘               │
                   │ (Path planned)     │
                   ▼                    │
              ┌─────────┐               │
              │EN_ROUTE ├──────────┐    │
              └────┬────┘          │    │
                   │ (Arrived)     │    │
                   ▼               │    │
              ┌─────────┐          │    │
              │ ARRIVED │          │    │
              └────┬────┘          │    │
                   │ (App sends    │    │
                   │  "unlock")    │    │
                   ▼               │    │
              ┌─────────┐          │    │
              │CHARGING │          │    │
              └────┬────┘          │    │
                   │ (App sends    │    │
                   │  "stop"/done) │    │
                   ▼               │    │
              ┌─────────┐          │    │
              │RETURNING├──────────┘    │
              └─────────┘               │
                   ▲                    │
                   │ (Resolved)         │
       ┌───────────┴───────────┐        │
       │ FAULT / EMERGENCY_STOP├────────┘
       └───────────────────────┘
```

Allowed Status Enum values:
* `idle`: Rover at dock/standby, awaiting dispatch.
* `assigned`: Mission accepted, calibrating sensors & calculating A* / NavMesh trajectory.
* `en_route`: Driving autonomously towards destination.
* `arrived`: At user destination; waiting for user PIN / QR verification.
* `charging`: Qi pad relay energized; transmitting power to phone.
* `returning`: Navigating autonomously back to designated campus dock or next queue node.
* `fault`: Hardware error (motor stall, wheel encoder slip, thermal trip, low battery < 10%).
* `emergency_stop`: Immediate hardware brake actuated via app SOS or rover bumper switch.

---

## 4. App Commands Contract (App -> Rover)

Sent by the mobile application when user initiates actions:

```json
{
  "order_id": "ORD-2026-9901",
  "user_id": "USR-4820",
  "timestamp": 1791817550,
  "dest_lat": 12.972100,
  "dest_lng": 77.595200,
  "pin_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "command": "go",
  "charging_mode": "fast_15w",
  "target_duration_mins": 30,
  "light_beacon": false,
  "buzzer_ping": false
}
```

### 4.1 Command Payload Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `order_id` | String | Unique order reference generated by client/backend |
| `user_id` | String | Authenticated user ID |
| `timestamp` | Integer | Epoch timestamp when command was issued |
| `dest_lat` | Float | Destination pickup latitude |
| `dest_lng` | Float | Destination pickup longitude |
| `pin_hash` | String | SHA-256 hash of the 4-digit unlock PIN (e.g. "8492") |
| `command` | String | Enum: `go`, `cancel`, `stop`, `resume`, `unlock`, `emergency_stop`, `ping_locate` |
| `charging_mode`| String | `standard_5w` or `fast_15w` |
| `target_duration_mins` | Integer | Max charging session duration in minutes |
| `light_beacon` | Boolean | True if user requests high-visibility LED strobe to spot rover |
| `buzzer_ping` | Boolean | True if user requests piezoelectric chime to locate rover |

### 4.2 Command Semantics
1. **`go`**: Dispatches rover to `dest_lat`, `dest_lng`. Rover validates geofence and transitions from `idle` to `assigned` -> `en_route`.
2. **`cancel`**: User cancels before arrival. If already en route, rover stops and transitions to `returning`.
3. **`unlock`**: Sent when user enters the 4-digit PIN or scans QR code at the rover. Rover checks `pin_hash` against order. If valid, actuates charging pad relay.
4. **`stop`**: Ends the charging session early. De-energizes pad, reports final `session_energy_wh`, transitions to `returning`.
5. **`emergency_stop`**: Immediate failsafe halt. De-energizes motor drive H-bridges, engages magnetic brake, turns on hazard LEDs. Rover remains motionless until reset.
6. **`ping_locate`**: Triggers 3 audible pulses and 5 neon LED flashes to help the user spot the rover in a crowd.

---

## 5. Wireless Charging Pad & Alignment Telemetry

The Qi wireless charging sub-assembly uses a multi-coil transmitter controlled via an internal I2C/SPI bridge.

### 5.1 Power Delivery Modes
* **Standard (5W):** 5V @ 1.0A baseline inductive transfer.
* **Fast Qi (15W):** 9V @ 1.67A / 12V @ 1.25A with foreign object detection (FOD).

### 5.2 Alignment Feedback
* **`coil_alignment_pct >= 80%`**: Ideal alignment. Charging efficiency ~78%. Status: "Phone aligned".
* **`50% <= coil_alignment_pct < 80%`**: Marginal alignment. Status: "Acceptable alignment".
* **`coil_alignment_pct < 50%`**: Misaligned. Status: "Move your phone to the center".

### 5.3 Safety Cutoffs
* **Over-Temperature:** `pad_temp_c >= 48.0°C` halts charging immediately.
* **Foreign Object Detection (FOD):** Metallic keys or coins detected via Q-factor shift de-energizes coil.
* **Over-Current:** Exceeding 2.5A input shuts down power rail.

---

## 6. Simulated Rover Implementation (Demo Mode)

For development, testing, and presentations where physical hardware is offline:
* The client maintains an in-process, high-fidelity **RoverSimulator** service.
* It simulates physics (speed 1.2 m/s, path interpolation via Haversine distance), battery discharge (0.05% per minute moving), realistic obstacle scenarios (temporary reroute), and inductive charging physics (5W/15W power curve with thermal rise).
* The UI interacts with the exact same domain repository interface regardless of whether backend is Mock or Live Firebase/MQTT.
