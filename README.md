# VOLTRIDE — Autonomous Mobile Wireless Charging Rover

[![Flutter](https://img.shields.io/badge/Flutter-3.47-02569B?logo=flutter)](https://flutter.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-2EE6A6)]()
[![Theme](https://img.shields.io/badge/Theme-Dark%20%230B0D12-00E5FF)]()

**VOLTRIDE** is an on-demand autonomous mobile wireless charging rover application designed for university campuses, tech parks, and airports. Users summon a robotic rover carrying a high-speed Qi wireless charging pad to their exact coordinates, unlock the inductive pad using a cryptographically verified PIN, monitor live power telemetry, and pay seamlessly.

---

## ⚡ Instant Localhost Interactive Link
The application is live and running locally:
👉 **[http://localhost:5173/](http://localhost:5173/)**

Open this link in any browser (Chrome, Edge, Safari) to experience the mobile simulation with full interactivity.

---

## 🚀 Key Features

1. **True Dark Luxury Aesthetic**:
   - Palette: Deep Canvas `#0B0D12`, Surfaces `#141821` / `#1B2030`, Neon Electric Cyan `#00E5FF` to Cyber Violet `#7C4DFF` gradient, Success `#2EE6A6`, Warning `#FFB020`, Danger `#FF5470`.
   - Glassmorphic translucent cards with 1px glowing borders, 24px rounded corners.
   - 60fps micro-animations: rotating heading markers, pulsing radar waves, and neon charging progress gauges.

2. **Autonomous Rover Simulator (Demo Mode)**:
   - In-memory simulation engine matching `/docs/rover_api.md`.
   - Dynamic A* waypoint interpolation (1.2 m/s cruising speed).
   - Ultrasonic / LiDAR obstacle encounter and detour recovery.
   - Real-time inductive charging physics: power ramp (5W / 15W), temperature climb, watt-hour accumulation, and coil alignment detection.

3. **18 Complete Interactive Screens**:
   - **Splash & Onboarding**: 3 animated slides with carousel indicators & skip.
   - **Permissions Screen**: Contextual explanations for GPS and push notifications.
   - **Auth Screen**: Phone OTP verification, Google Sign-in, and Guest mode.
   - **Home / Order Map**: Fullscreen Leaflet dark map, live available rovers (`ROV-01`, `ROV-02`, `ROV-03`), draggable destination pin, saved campus places chips.
   - **Order Bottom Sheet**: Standard 5W vs Turbo 15W Qi selection, target charge % slider, estimated cost and time.
   - **Checkout & Payment**: Price breakdown, promo code validator (`CAMPUS50`, `VOLTNEW`), payment switcher (VoltWallet / UPI).
   - **Live Tracking**: Real-time moving rover marker, dynamic ETA countdown, distance left, mission timeline, obstacle alerts, share tracking link.
   - **Arrival & Secure Unlock**: Tactile haptic pulse, audio arrival chime, one-time 4-digit PIN, QR code, and "Locate Rover" light strobe and buzzer ping.
   - **Charging Session Dashboard**: Animated circular neon ring, live Watts (W), energy delivered (Wh), pad temperature, alignment check, phone's own battery API read-out, Pause, Resume, and +10 mins buttons.
   - **Digital Receipt & Summary**: Confetti celebration, energy transferred, duration, CO2 savings, star rating, PDF receipt download.
   - **Orders & History**: Filterable past sessions with 1-tap reorder.
   - **VoltWallet & Rewards**: Balance top-up, VoltPoints, 4-day green charging streak, referral code.
   - **24/7 AI Fleet Support**: Interactive chat bot with instant quick replies and fault diagnosis.
   - **Fleet Administration**: Multi-rover command center with force-return and emergency halt.
   - **Safety / SOS**: Persistent hold-to-confirm 2s emergency stop button actuating failsafe brakes.

4. **Universal Accessibility Engine**:
   - Persistent floating accessibility button on every screen.
   - Dynamic font size slider (80% to 180%).
   - Dyslexia-friendly typography (Lexend font).
   - High-contrast mode and colorblind vision filters (Protanopia, Deuteranopia, Tritanopia).
   - Web Speech API Text-to-Speech (TTS) screen reader.
   - Oversized touch target "Easy Mode".

---

## 📂 Project Structure

```
MDP SPARC/
├── docs/
│   ├── rover_api.md                 # Hardware & MQTT/Firebase JSON contract
│   ├── architecture.md              # Clean Architecture & Riverpod specification
│   └── demo_presentation_script.md  # 3.5-minute demo script for evaluators
├── src/
│   ├── i18n.js                      # Multilingual translations (EN, TA, HI)
│   ├── main.js                      # Application controller & 18 screens
│   ├── simulator.js                 # Rover Simulator engine & hardware mock
│   └── style.css                    # Dark design system & accessibility tokens
├── index.html                       # Mobile app shell & viewport
├── package.json                     # Vite, Leaflet, and confetti dependencies
├── vite.config.js                   # Dev server configuration
└── voltride_app/                    # Native Flutter (Dart) mobile app
    ├── lib/
    │   ├── core/theme/app_theme.dart
    │   ├── data/sources/rover_simulator_service.dart
    │   ├── domain/entities/rover_telemetry.dart
    │   └── main.dart
    └── test/widget_test.dart        # Flutter widget test suite
```

---

## 🛠 Running the Application

### 1. Interactive Mobile Web Simulator (Current)
```bash
npm run dev
# Opens at http://localhost:5173/
```

### 2. Native Flutter Mobile App
```bash
cd voltride_app
flutter run
# Or run tests:
flutter test
```
