# VOLTRIDE — Engineering Project Presentation & Demo Script
**Project:** Autonomous On-Demand Qi Wireless Mobile Charging Rover  
**Target Audience:** MDP Review Committee, Evaluators, Engineering Faculty  

---

## 1. Introduction (0:00 - 0:45)
> "Good morning, respected professors and evaluators. Today we are presenting **VOLTRIDE** — an autonomous on-demand wireless charging rover designed to solve mobile battery depletion in campuses, airports, and tech parks. 
> Instead of students or professionals having to anchor themselves to a wall socket or carry bulky power banks, our rover navigates autonomously to their exact coordinates, allows secure access via a cryptographically hashed PIN, and delivers high-efficiency Qi wireless inductive charging directly to their device."

---

## 2. Walkthrough & Live App Demonstration (0:45 - 2:30)

### Step 1: Onboarding & Home Map Screen
* "Here we open the VOLTRIDE mobile app. You can see the full-screen dark-mode interface styled with cyan-to-violet neon gradients and glassmorphism.
* On the map, the user can see available rovers in their vicinity (e.g. `ROV-01`, `ROV-02`) displaying real-time battery status and distance.
* Notice the floating search bar and campus saved-places chips (`Library`, `Hostel Block 4`, `Engineering Quad`)."

### Step 2: Specifying Charging Target & Ordering
* "Let's tap 'Order Rover'. A bottom sheet appears allowing the user to select their desired charging mode: **Standard 5W** or **Fast 15W Qi Charging**, and target duration or percentage.
* The system computes an upfront estimate of time, energy delivered (Wh), and transparent pricing.
* We tap **Confirm & Dispatch**."

### Step 3: Real-Time Autonomous Tracking
* "The app immediately connects to the Rover telemetry pipeline.
* Notice the moving rover icon on the dark map, complete with live heading rotation, speed telemetry, and dynamic ETA countdown.
* If a simulated obstacle (like a pedestrian) is detected, the app displays a real-time warning banner: *'Obstacle detected — Rover adjusting trajectory'*."

### Step 4: Arrival & Secure Unlock
* "As the rover reaches the user, the app issues a tactile haptic pulse and audible announcement: *'Rover ROV-01 has arrived at your location'*.
* For security against unauthorized tampering, the Qi charging pad remains locked until the user enters their unique 4-digit PIN (or scans the QR code).
* We also have a **'Locate Rover'** button that flashes the rover's neon LEDs and chirps the buzzer for crowded environments."

### Step 5: Active Wireless Charging Session
* "Once unlocked, the user rests their smartphone onto the rover's Qi inductive pad.
* The app transitions to the dynamic charging dashboard featuring an animated circular progress ring, real-time power (W), accumulated energy (Wh), coil alignment feedback (*'Phone aligned'*), and pad temperature monitoring with automatic thermal cutoff protection.
* The app also reads the device's live battery status using system APIs."

### Step 6: Session Completion & Summary Receipt
* "When the session is complete, the user taps 'End Session'.
* An itemized digital receipt appears showing energy transferred, elapsed time, cost breakdown, and estimated CO2 reduction vs fossil grid power.
* The rover locks its pad and autonomously enters its `returning` state back to its campus base station."

---

## 3. Inclusion & Accessibility (2:30 - 3:00)
* "A standout engineering achievement in VOLTRIDE is universal accessibility:
  * Persistent floating Accessibility Hub.
  * Real-time Text-to-Speech (TTS) screen reading.
  * Voice command parsing ('Order rover', 'Stop charging').
  * Dyslexia-friendly typography, color-blind mode adaptations (Protanopia / Deuteranopia / Tritanopia), and large-touch 'Easy Mode'."

---

## 4. Hardware Integration & Ready-to-Deploy Contract (3:00 - 3:30)
* "For the hardware team, our embedded JSON communication protocol in `/docs/rover_api.md` allows seamless drop-in MQTT / Firebase RTDB communication with our ESP32 motor controller and Raspberry Pi LiDAR navigation stack.
* In **Demo Mode**, the app is 100% self-sufficient without requiring physical hardware or paid cloud API keys. Thank you!"
