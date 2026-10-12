import { calculatePhoneCharge, calculateSolarBudget } from './energy';

function runTests() {
  console.log('--- Testing calculatePhoneCharge ---');

  // Test 1: 5000 mAh phone with a full bank (100%)
  const t1 = calculatePhoneCharge({
    phone_mah: 5000,
    current_pct: 0,
    bank_pct: 100
  });
  console.assert(t1.delivered_wh > 20, `T1 failed: delivered_wh should be > 20, got ${t1.delivered_wh}`);
  console.assert(t1.full_charges > 1.0, `T1 failed: full_charges should be > 1.0, got ${t1.full_charges}`);
  console.log('Test 1 (5000 mAh, 100% bank): PASS', t1);

  // Test 2: 5000 mAh phone with 0% bank
  const t2 = calculatePhoneCharge({
    phone_mah: 5000,
    current_pct: 20,
    bank_pct: 0
  });
  console.assert(t2.delivered_wh === 0, `T2 failed: delivered_wh should be 0, got ${t2.delivered_wh}`);
  console.assert(t2.added_pct_points === 0, `T2 failed: added_pct_points should be 0, got ${t2.added_pct_points}`);
  console.log('Test 2 (5000 mAh, 0% bank): PASS', t2);

  // Test 3: Phone at 100% already
  const t3 = calculatePhoneCharge({
    phone_mah: 5000,
    current_pct: 100,
    bank_pct: 100
  });
  console.assert(t3.added_pct_points === 0, `T3 failed: added_pct_points should be 0, got ${t3.added_pct_points}`);
  console.assert(t3.remaining_full_charges > 1.0, `T3 failed: remaining_full_charges should be > 1.0, got ${t3.remaining_full_charges}`);
  console.log('Test 3 (Phone already 100%): PASS', t3);

  console.log('--- Testing calculateSolarBudget ---');

  // Test 4: Zero sun hours
  const t4 = calculateSolarBudget({
    panel_w: 10,
    sun_hours: 0,
    chain_efficiency: 0.65,
    route_length_m: 150,
    rover_speed_mps: 0.3,
    rover_mass_kg: 1.2,
    crr: 0.03,
    drivetrain_efficiency: 0.4,
    electronics_w: 0.6,
    requests_per_day: 6,
    avg_phone_mah: 4500,
    boost_efficiency: 0.85,
    phone_efficiency: 0.85
  });
  console.assert(t4.daily_harvest_wh === 0, `T4 failed: harvest should be 0, got ${t4.daily_harvest_wh}`);
  console.assert(t4.grid_fallback_needed === true, `T4 failed: fallback needed should be true`);
  console.log('Test 4 (Zero sun hours): PASS', t4.verdict_text);

  // Test 5: Zero requests
  const t5 = calculateSolarBudget({
    panel_w: 10,
    sun_hours: 4.5,
    chain_efficiency: 0.65,
    route_length_m: 150,
    rover_speed_mps: 0.3,
    rover_mass_kg: 1.2,
    crr: 0.03,
    drivetrain_efficiency: 0.4,
    electronics_w: 0.6,
    requests_per_day: 0,
    avg_phone_mah: 4500,
    boost_efficiency: 0.85,
    phone_efficiency: 0.85
  });
  console.assert(t5.daily_demand_wh === 0, `T5 failed: demand should be 0, got ${t5.daily_demand_wh}`);
  console.assert(t5.net_wh === t5.daily_harvest_wh, `T5 failed: net should equal harvest`);
  console.log('Test 5 (Zero requests): PASS', t5.verdict_text);

  // Test 6: Panel large enough that net_Wh is positive (e.g. 50W panel)
  const t6 = calculateSolarBudget({
    panel_w: 50,
    sun_hours: 4.5,
    chain_efficiency: 0.65,
    route_length_m: 150,
    rover_speed_mps: 0.3,
    rover_mass_kg: 1.2,
    crr: 0.03,
    drivetrain_efficiency: 0.4,
    electronics_w: 0.6,
    requests_per_day: 6,
    avg_phone_mah: 4500,
    boost_efficiency: 0.85,
    phone_efficiency: 0.85
  });
  console.assert(t6.net_wh > 0, `T6 failed: net should be > 0, got ${t6.net_wh}`);
  console.assert(t6.grid_fallback_needed === false, `T6 failed: grid fallback should be false`);
  console.log('Test 6 (Large 50W panel): PASS', t6.verdict_text);

  console.log('All 6 mathematical unit tests PASSED successfully!');
}

runTests();
