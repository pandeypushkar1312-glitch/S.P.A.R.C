# VOLTRIDE Architecture & Engineering Specification

## 1. Architectural Philosophy: Clean Architecture
VOLTRIDE follows the strict separation of concerns into three tiers:

```
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                   │
│  - Screens & Pages (Dark UI, Glassmorphism, Micro-anim)│
│  - Widgets (Charging ring, Dark Map, Timeline, PIN)    │
│  - State Management: Riverpod (Notifiers, Providers)  │
└───────────────────────────▲────────────────────────────┘
                            │ (watches / triggers)
┌───────────────────────────┴────────────────────────────┐
│                      DOMAIN LAYER                      │
│  - Entities: RoverTelemetry, ChargingOrder, Pricing    │
│  - Value Objects: GeoCoordinate, PowerMeasurement      │
│  - Repositories (Abstract interfaces)                  │
│  - Use Cases: DispatchRover, CalculateBill, StreamTrack│
└───────────────────────────▲────────────────────────────┘
                            │ (implemented by)
┌───────────────────────────┴────────────────────────────┐
│                       DATA LAYER                       │
│  - Live Data Sources: Firebase RTDB / MQTT Client      │
│  - Mock Data Source: RoverSimulatorEngine (Demo Mode)  │
│  - Local Storage: Hive / SharedPreferences (offline)   │
│  - Sensor Services: Geolocator, BatteryPlus, TTS, STT  │
└────────────────────────────────────────────────────────┘
```

## 2. Rover Simulator Engine (In-Memory Microkernel)
When **Demo Mode** is enabled (default in simulator / no hardware mode):
* Emulates realistic kinematics: acceleration, turning heading changes, cruising speed (1.2 m/s).
* Interpolates waypoints from rover home base to user coordinate.
* Simulates dynamic obstacle detection (pedestrian crossing, path deviation, and recalculation event).
* Emulates Qi charging induction: power ramping from 0W to 14.8W, coil coupling percentage, thermal rise (30°C -> 38°C), and energy accumulation in watt-hours.
* Sends periodic events to Riverpod providers exactly mimicking real-time MQTT / Firebase RTDB payloads.

## 3. Design System & Tokens
* **Backgrounds:** Canvas `#0B0D12`, Card `#141821`, Raised `#1B2030`, Glass Border `rgba(255,255,255,0.08)`
* **Primary Neon Gradient:** Electric Cyan `#00E5FF` to Cyber Violet `#7C4DFF`
* **Status Colors:** Success `#2EE6A6`, Warning `#FFB020`, Hazard `#FF5470`
* **Typography:** Inter / Poppins with clean optical sizing and accessible contrast ratios.

## 4. Universal Accessibility Engine
* **Accessibility Hub Floating Button:** Always accessible on every view.
* **Text Scaler:** 80% to 200% dynamic font scaling.
* **Color Vision Deficiency Filters:** Protanopia, Deuteranopia, Tritanopia high-differentiation palettes.
* **Spoken Assistant:** Flutter TTS integration reading status updates, ETA, PIN, and charge stats.
* **One-Handed & Easy Mode:** Simplified UI with oversized controls and bottom-anchored action zones.
