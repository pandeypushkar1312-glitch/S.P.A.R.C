import 'dart:async';
import 'dart:math';
import '../../domain/entities/rover_telemetry.dart';

/// In-Process Flutter Rover Simulator Service
/// Emulates Rover movement, LiDAR obstacle encounters, and inductive Qi charging telemetry
class RoverSimulatorService {
  final _telemetryController = StreamController<RoverTelemetry>.broadcast();
  Stream<RoverTelemetry> get telemetryStream => _telemetryController.stream;

  late RoverTelemetry _currentRover;
  Timer? _navTimer;
  Timer? _chargeTimer;

  RoverSimulatorService() {
    _currentRover = RoverTelemetry.initial('ROV-01', 12.9716, 77.5946);
  }

  RoverTelemetry get currentRover => _currentRover;

  void dispatchRover({
    required double destLat,
    required double destLng,
    required String chargingMode,
  }) {
    _currentRover = _currentRover.copyWith(
      status: RoverStatus.assigned,
      pinCode: (1000 + Random().nextInt(9000)).toString(),
    );
    _telemetryController.add(_currentRover);

    Future.delayed(const Duration(seconds: 2), () {
      _currentRover = _currentRover.copyWith(status: RoverStatus.enRoute);
      _telemetryController.add(_currentRover);
      _startNavigationLoop(destLat, destLng);
    });
  }

  void _startNavigationLoop(double destLat, double destLng) {
    _navTimer?.cancel();
    int steps = 10;
    int currentStep = 0;

    _navTimer = Timer.periodic(const Duration(milliseconds: 1200), (timer) {
      if (currentStep < steps) {
        currentStep++;
        double fraction = currentStep / steps;
        double newLat = _currentRover.lat + (destLat - _currentRover.lat) * fraction;
        double newLng = _currentRover.lng + (destLng - _currentRover.lng) * fraction;
        int remainingSec = (steps - currentStep) * 6;

        bool hasObstacle = currentStep == 4;

        _currentRover = _currentRover.copyWith(
          lat: newLat,
          lng: newLng,
          heading: 45.0,
          speed: 1.25,
          etaSeconds: remainingSec,
          distanceRemainingM: (steps - currentStep) * 20.0,
          obstacleDetected: hasObstacle,
        );
        _telemetryController.add(_currentRover);
      } else {
        _navTimer?.cancel();
        _currentRover = _currentRover.copyWith(
          status: RoverStatus.arrived,
          speed: 0.0,
          etaSeconds: 0,
          distanceRemainingM: 0.0,
        );
        _telemetryController.add(_currentRover);
      }
    });
  }

  bool unlockWithPin(String pin) {
    if (pin == _currentRover.pinCode) {
      _currentRover = _currentRover.copyWith(
        status: RoverStatus.charging,
        lockStatus: 'unlocked',
        chargingPowerW: 14.8,
      );
      _telemetryController.add(_currentRover);
      _startChargingLoop();
      return true;
    }
    return false;
  }

  void _startChargingLoop() {
    _chargeTimer?.cancel();
    _chargeTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_currentRover.status == RoverStatus.charging) {
        double newEnergy = _currentRover.sessionEnergyWh + (_currentRover.chargingPowerW / 3600);
        double newTemp = min(38.0, _currentRover.padTempC + 0.05);

        _currentRover = _currentRover.copyWith(
          sessionEnergyWh: double.parse(newEnergy.toStringAsFixed(2)),
          padTempC: double.parse(newTemp.toStringAsFixed(1)),
        );
        _telemetryController.add(_currentRover);
      }
    });
  }

  void stopCharging() {
    _chargeTimer?.cancel();
    _currentRover = _currentRover.copyWith(
      status: RoverStatus.returning,
      chargingPowerW: 0.0,
      lockStatus: 'locked',
    );
    _telemetryController.add(_currentRover);
  }

  void emergencyStop() {
    _navTimer?.cancel();
    _chargeTimer?.cancel();
    _currentRover = _currentRover.copyWith(
      status: RoverStatus.emergencyStop,
      speed: 0.0,
      chargingPowerW: 0.0,
    );
    _telemetryController.add(_currentRover);
  }

  void dispose() {
    _navTimer?.cancel();
    _chargeTimer?.cancel();
    _telemetryController.close();
  }
}
