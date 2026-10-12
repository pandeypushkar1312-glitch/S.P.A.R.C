import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'domain/entities/rover_telemetry.dart';
import 'data/sources/rover_simulator_service.dart';

void main() {
  runApp(const VoltrideApp());
}

class VoltrideApp extends StatelessWidget {
  const VoltrideApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VOLTRIDE',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  final RoverSimulatorService _simulator = RoverSimulatorService();
  int _currentIndex = 0;
  String _chargingMode = 'fast_15w';

  @override
  void dispose() {
    _simulator.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<RoverTelemetry>(
      stream: _simulator.telemetryStream,
      initialData: _simulator.currentRover,
      builder: (context, snapshot) {
        final rover = snapshot.data!;

        return Scaffold(
          appBar: AppBar(
            backgroundColor: AppTheme.bgDark,
            elevation: 0,
            title: Row(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    color: AppTheme.neonCyan,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: AppTheme.neonCyan, blurRadius: 8),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'VOLTRIDE',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                    fontSize: 18,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.surface2,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0x3300E5FF)),
                  ),
                  child: const Text(
                    'DEMO MODE',
                    style: TextStyle(fontSize: 10, color: AppTheme.neonCyan, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          body: _buildCurrentBody(rover),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _currentIndex,
            backgroundColor: AppTheme.surface1,
            selectedItemColor: AppTheme.neonCyan,
            unselectedItemColor: Colors.white38,
            type: BottomNavigationBarType.fixed,
            onTap: (index) => setState(() => _currentIndex = index),
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.map_rounded), label: 'Order'),
              BottomNavigationBarItem(icon: Icon(Icons.receipt_long_rounded), label: 'Trips'),
              BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet_rounded), label: 'Wallet'),
              BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCurrentBody(RoverTelemetry rover) {
    if (rover.status == RoverStatus.enRoute || rover.status == RoverStatus.assigned) {
      return _buildTrackingView(rover);
    } else if (rover.status == RoverStatus.arrived) {
      return _buildUnlockView(rover);
    } else if (rover.status == RoverStatus.charging) {
      return _buildChargingView(rover);
    } else {
      return _buildHomeOrderView(rover);
    }
  }

  Widget _buildHomeOrderView(RoverTelemetry rover) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Map Representation Card
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.surface2,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0x2200E5FF)),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.radar, size: 64, color: AppTheme.neonCyan),
                      const SizedBox(height: 12),
                      const Text(
                        'Autonomous Campus Fleet Active',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '3 Rovers available near Engineering Quad',
                        style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Charging Mode Selector
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _chargingMode = 'standard_5w'),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: _chargingMode == 'standard_5w' ? AppTheme.surface3 : AppTheme.surface1,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _chargingMode == 'standard_5w' ? AppTheme.neonCyan : Colors.white10,
                      ),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Standard 5W', style: TextStyle(fontWeight: FontWeight.bold)),
                        SizedBox(height: 4),
                        Text('₹15 • Overnight', style: TextStyle(color: AppTheme.neonCyan, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _chargingMode = 'fast_15w'),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: _chargingMode == 'fast_15w' ? AppTheme.surface3 : AppTheme.surface1,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _chargingMode == 'fast_15w' ? AppTheme.neonCyan : Colors.white10,
                      ),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Turbo 15W Qi', style: TextStyle(fontWeight: FontWeight.bold)),
                        SizedBox(height: 4),
                        Text('₹30 • High Speed', style: TextStyle(color: AppTheme.neonCyan, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          ElevatedButton(
            onPressed: () {
              _simulator.dispatchRover(
                destLat: 12.9716,
                destLng: 77.5946,
                chargingMode: _chargingMode,
              );
            },
            child: const Text('Order Rover to My Location'),
          ),
        ],
      ),
    );
  }

  Widget _buildTrackingView(RoverTelemetry rover) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surface1,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.neonCyan),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    const Text('ETA', style: TextStyle(color: Colors.white54, fontSize: 12)),
                    Text('${rover.etaSeconds}s', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppTheme.neonCyan)),
                  ],
                ),
                Column(
                  children: [
                    const Text('DISTANCE', style: TextStyle(color: Colors.white54, fontSize: 12)),
                    Text('${rover.distanceRemainingM.toInt()}m', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
                  ],
                ),
                Column(
                  children: [
                    const Text('ROVER BATT', style: TextStyle(color: Colors.white54, fontSize: 12)),
                    Text('${rover.batteryPct}%', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppTheme.success)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (rover.obstacleDetected)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.warning.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.warning),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: AppTheme.warning),
                  SizedBox(width: 8),
                  Text('Obstacle detected — Rover rerouting safely', style: TextStyle(color: AppTheme.warning, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          const Spacer(),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () => _simulator.emergencyStop(),
            child: const Text('Emergency Stop (Halt Rover)', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildUnlockView(RoverTelemetry rover) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.check_circle_rounded, size: 72, color: AppTheme.success),
          const SizedBox(height: 16),
          const Text('Rover Arrived at Your Location!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Place phone on the inductive pad and verify PIN:', style: TextStyle(color: Colors.white60)),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
            decoration: BoxDecoration(
              color: AppTheme.surface2,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.neonCyan, width: 2),
            ),
            child: Text(
              rover.pinCode,
              style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, letterSpacing: 8, color: AppTheme.neonCyan),
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () => _simulator.unlockWithPin(rover.pinCode),
            child: const Text('Unlock Charging Pad'),
          ),
        ],
      ),
    );
  }

  Widget _buildChargingView(RoverTelemetry rover) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.neonCyan, width: 8),
              boxShadow: const [
                BoxShadow(color: Color(0x3300E5FF), blurRadius: 30),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.bolt_rounded, size: 48, color: AppTheme.neonCyan),
                Text('${rover.chargingPowerW.toStringAsFixed(1)} W', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
                Text('${rover.sessionEnergyWh.toStringAsFixed(2)} Wh delivered', style: const TextStyle(fontSize: 12, color: Colors.white60)),
              ],
            ),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surface1,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Text('Pad Temp: ${rover.padTempC}°C', style: const TextStyle(fontWeight: FontWeight.bold)),
                const Text('Coils: Aligned (95%)', style: TextStyle(color: AppTheme.success, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () => _simulator.stopCharging(),
            child: const Text('Stop & Complete Session', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
