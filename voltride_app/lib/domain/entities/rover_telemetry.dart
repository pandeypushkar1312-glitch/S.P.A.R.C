/// Rover Telemetry Domain Entity
/// Matches /docs/rover_api.md hardware specification
enum RoverStatus {
  idle,
  assigned,
  enRoute,
  arrived,
  charging,
  returning,
  fault,
  emergencyStop,
}

class RoverTelemetry {
  final String roverId;
  final double lat;
  final double lng;
  final double heading;
  final double speed;
  final int batteryPct;
  final RoverStatus status;
  final int etaSeconds;
  final double distanceRemainingM;
  final bool obstacleDetected;
  final double padTempC;
  final double chargingPowerW;
  final double sessionEnergyWh;
  final int coilAlignmentPct;
  final String lockStatus;
  final String pinCode;

  const RoverTelemetry({
    required this.roverId,
    required this.lat,
    required this.lng,
    required this.heading,
    required this.speed,
    required this.batteryPct,
    required this.status,
    required this.etaSeconds,
    required this.distanceRemainingM,
    required this.obstacleDetected,
    required this.padTempC,
    required this.chargingPowerW,
    required this.sessionEnergyWh,
    required this.coilAlignmentPct,
    required this.lockStatus,
    required this.pinCode,
  });

  factory RoverTelemetry.initial(String id, double lat, double lng) {
    return RoverTelemetry(
      roverId: id,
      lat: lat,
      lng: lng,
      heading: 0.0,
      speed: 0.0,
      batteryPct: 90,
      status: RoverStatus.idle,
      etaSeconds: 180,
      distanceRemainingM: 250.0,
      obstacleDetected: false,
      padTempC: 28.5,
      chargingPowerW: 0.0,
      sessionEnergyWh: 0.0,
      coilAlignmentPct: 95,
      lockStatus: 'locked',
      pinCode: '4829',
    );
  }

  RoverTelemetry copyWith({
    String? roverId,
    double? lat,
    double? lng,
    double? heading,
    double? speed,
    int? batteryPct,
    RoverStatus? status,
    int? etaSeconds,
    double? distanceRemainingM,
    bool? obstacleDetected,
    double? padTempC,
    double? chargingPowerW,
    double? sessionEnergyWh,
    int? coilAlignmentPct,
    String? lockStatus,
    String? pinCode,
  }) {
    return RoverTelemetry(
      roverId: roverId ?? this.roverId,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      heading: heading ?? this.heading,
      speed: speed ?? this.speed,
      batteryPct: batteryPct ?? this.batteryPct,
      status: status ?? this.status,
      etaSeconds: etaSeconds ?? this.etaSeconds,
      distanceRemainingM: distanceRemainingM ?? this.distanceRemainingM,
      obstacleDetected: obstacleDetected ?? this.obstacleDetected,
      padTempC: padTempC ?? this.padTempC,
      chargingPowerW: chargingPowerW ?? this.chargingPowerW,
      sessionEnergyWh: sessionEnergyWh ?? this.sessionEnergyWh,
      coilAlignmentPct: coilAlignmentPct ?? this.coilAlignmentPct,
      lockStatus: lockStatus ?? this.lockStatus,
      pinCode: pinCode ?? this.pinCode,
    );
  }

  Map<String, dynamic> toJson() => {
    'rover_id': roverId,
    'lat': lat,
    'lng': lng,
    'heading': heading,
    'speed': speed,
    'battery_pct': batteryPct,
    'status': status.name,
    'eta_seconds': etaSeconds,
    'distance_remaining_m': distanceRemainingM,
    'obstacle_detected': obstacleDetected,
    'pad_temp_c': padTempC,
    'charging_power_w': chargingPowerW,
    'session_energy_wh': sessionEnergyWh,
    'coil_alignment_pct': coilAlignmentPct,
    'lock_status': lockStatus,
  };
}
