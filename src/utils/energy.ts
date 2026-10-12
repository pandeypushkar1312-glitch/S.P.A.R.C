// S.P.A.R.C. Pure Mathematical Energy Engine
// Fully testable, transparent models matching MDP project brief

export interface PhoneEstimatorInputs {
  phone_mah: number;
  phone_nominal_v?: number; // default 3.85
  current_pct: number; // 0 to 100
  bank_pct: number; // 0 to 100
  boost_efficiency?: number; // default 0.85
  charge_efficiency?: number; // default 0.85
}

export interface PhoneEstimatorResult {
  phone_wh: number;
  bank_energy_wh: number;
  delivered_wh: number;
  full_charges: number;
  added_pct_points: number;
  remaining_full_charges: number;
  time_to_charge_mins: number;
}

export function calculatePhoneCharge(inputs: PhoneEstimatorInputs): PhoneEstimatorResult {
  const nominal_v = inputs.phone_nominal_v ?? 3.85;
  const boost_eff = inputs.boost_efficiency ?? 0.85;
  const charge_eff = inputs.charge_efficiency ?? 0.85;

  const phone_wh = (inputs.phone_mah * nominal_v) / 1000.0;
  const bank_energy_wh = (inputs.bank_pct / 100.0) * 37.0; // 10,000 mAh at 3.7 V = 37 Wh
  const delivered_wh = bank_energy_wh * boost_eff * charge_eff;

  const full_charges = phone_wh > 0 ? delivered_wh / phone_wh : 0;

  // Needed to reach 100% from current_pct
  const needed_wh_to_full = phone_wh * Math.max(0, (100 - inputs.current_pct) / 100.0);
  let added_pct_points = 0;
  let remaining_full_charges = 0;

  if (delivered_wh >= needed_wh_to_full) {
    added_pct_points = 100 - inputs.current_pct;
    const surplus_wh = delivered_wh - needed_wh_to_full;
    remaining_full_charges = phone_wh > 0 ? surplus_wh / phone_wh : 0;
  } else {
    added_pct_points = phone_wh > 0 ? (delivered_wh / phone_wh) * 100 : 0;
    remaining_full_charges = 0;
  }

  // Charging at 5V / 2A max (~10W)
  const charge_power_w = 10.0 * charge_eff;
  const time_to_charge_mins = Math.round((needed_wh_to_full / Math.max(0.1, charge_power_w)) * 60);

  return {
    phone_wh: +phone_wh.toFixed(2),
    bank_energy_wh: +bank_energy_wh.toFixed(2),
    delivered_wh: +delivered_wh.toFixed(2),
    full_charges: +full_charges.toFixed(2),
    added_pct_points: Math.min(100 - inputs.current_pct, Math.round(added_pct_points)),
    remaining_full_charges: +remaining_full_charges.toFixed(1),
    time_to_charge_mins
  };
}

export interface SolarBudgetInputs {
  panel_w: number; // default 10
  sun_hours: number; // default 4.5
  chain_efficiency: number; // default 0.65
  route_length_m: number; // default 150
  rover_speed_mps: number; // default 0.3
  rover_mass_kg: number; // default 1.2
  crr: number; // default 0.03
  drivetrain_efficiency: number; // default 0.4
  electronics_w: number; // default 0.6
  requests_per_day: number; // default 6
  avg_phone_mah: number; // default 4500
  boost_efficiency: number; // default 0.85
  phone_efficiency: number; // default 0.85
}

export interface SolarBudgetResult {
  daily_harvest_wh: number;
  trip_time_h: number;
  drive_power_w: number;
  daily_drive_wh: number;
  phone_wh_each: number;
  daily_phone_wh: number;
  daily_demand_wh: number;
  net_wh: number;
  grid_fallback_needed: boolean;
  verdict_text: string;
}

export function calculateSolarBudget(inputs: SolarBudgetInputs): SolarBudgetResult {
  const daily_harvest_wh = inputs.panel_w * inputs.sun_hours * inputs.chain_efficiency;
  const trip_time_h = (2 * inputs.route_length_m) / (inputs.rover_speed_mps * 3600);

  const mechanical_drive_w =
    (inputs.rover_mass_kg * 9.81 * inputs.crr * inputs.rover_speed_mps) / inputs.drivetrain_efficiency;
  const drive_power_w = mechanical_drive_w + inputs.electronics_w;

  const daily_drive_wh = inputs.requests_per_day * trip_time_h * drive_power_w;

  const phone_wh_each = (inputs.avg_phone_mah * 3.85) / 1000.0;
  const daily_phone_wh =
    (inputs.requests_per_day * phone_wh_each) / (inputs.boost_efficiency * inputs.phone_efficiency);

  const daily_demand_wh = daily_drive_wh + daily_phone_wh;
  const net_wh = daily_harvest_wh - daily_demand_wh;
  const grid_fallback_needed = net_wh < 0;

  const verdict_text = grid_fallback_needed
    ? `grid fallback needed: short by ${Math.abs(net_wh).toFixed(1)} wh/day`
    : `solar covers the load with ${net_wh.toFixed(1)} wh/day surplus`;

  return {
    daily_harvest_wh: +daily_harvest_wh.toFixed(1),
    trip_time_h: +trip_time_h.toFixed(3),
    drive_power_w: +drive_power_w.toFixed(2),
    daily_drive_wh: +daily_drive_wh.toFixed(1),
    phone_wh_each: +phone_wh_each.toFixed(1),
    daily_phone_wh: +daily_phone_wh.toFixed(1),
    daily_demand_wh: +daily_demand_wh.toFixed(1),
    net_wh: +net_wh.toFixed(1),
    grid_fallback_needed,
    verdict_text
  };
}
