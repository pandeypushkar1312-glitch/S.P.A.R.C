import React, { useState } from 'react';
import { calculateSolarBudget, SolarBudgetInputs, SolarBudgetResult } from '../utils/energy';
import { soundFX } from '../utils/audio';

export const EnergySimulatorPage: React.FC = () => {
  const [inputs, setInputs] = useState<SolarBudgetInputs>({
    panel_w: 10,
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

  const [activeScenario, setActiveScenario] = useState<'poc' | 'campus'>('poc');

  const result: SolarBudgetResult = calculateSolarBudget(inputs);

  const applyWeatherPreset = (type: 'summer' | 'typical' | 'monsoon') => {
    soundFX.playClick();
    if (type === 'summer') {
      setInputs(prev => ({ ...prev, sun_hours: 6.0, chain_efficiency: 0.70 }));
    } else if (type === 'typical') {
      setInputs(prev => ({ ...prev, sun_hours: 4.5, chain_efficiency: 0.65 }));
    } else {
      setInputs(prev => ({ ...prev, sun_hours: 2.2, chain_efficiency: 0.50 }));
    }
  };

  const handleScenarioChange = (scenario: 'poc' | 'campus') => {
    soundFX.playClick();
    setActiveScenario(scenario);
    if (scenario === 'poc') {
      setInputs({
        panel_w: 10,
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
    } else {
      setInputs({
        panel_w: 40,
        sun_hours: 4.5,
        chain_efficiency: 0.75,
        route_length_m: 300,
        rover_speed_mps: 0.5,
        rover_mass_kg: 2.5,
        crr: 0.025,
        drivetrain_efficiency: 0.55,
        electronics_w: 1.2,
        requests_per_day: 24,
        avg_phone_mah: 4800,
        boost_efficiency: 0.90,
        phone_efficiency: 0.90
      });
    }
  };

  const exportJson = () => {
    soundFX.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ inputs, result }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `sparc_energy_scenario_${activeScenario}.json`);
    dlAnchor.click();
  };

  return (
    <div className="container">
      <section style={{ maxWidth: '820px', marginBottom: '2.5rem' }}>
        <span className="eyebrow">/ 03 - energy budget simulator <span className="badge-sim">simulation</span></span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '1rem' }}>
          does the solar budget <em>close?</em>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
          mathematical proof answering our professor's brief: natural energy first, grid charging only as a last resort.
        </p>
      </section>

      {/* Weather Presets & Scenario Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>scenario:</span>
          <button
            className={`chip ${activeScenario === 'poc' ? 'chip-active' : ''}`}
            onClick={() => handleScenarioChange('poc')}
          >
            proof of concept (10 W dock, 1 rover)
          </button>
          <button
            className={`chip ${activeScenario === 'campus' ? 'chip-active' : ''}`}
            onClick={() => handleScenarioChange('campus')}
          >
            campus fleet (40 W dock, multi-rover) <span className="badge-planned">planned</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>weather:</span>
          <button className="chip" onClick={() => applyWeatherPreset('summer')}>☀️ chennai peak (6.0h)</button>
          <button className="chip" onClick={() => applyWeatherPreset('typical')}>⛅ typical (4.5h)</button>
          <button className="chip" onClick={() => applyWeatherPreset('monsoon')}>🌧️ monsoon (2.2h)</button>
        </div>
      </div>

      {/* Verdict Card (Honest, not always green) */}
      <div
        className="card-luminous"
        style={{
          background: result.grid_fallback_needed ? '#FEF2F2' : '#F0FDF4',
          borderColor: result.grid_fallback_needed ? '#FCA5A5' : '#86EFAC',
          marginBottom: '2.5rem',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="eyebrow" style={{ color: result.grid_fallback_needed ? '#991B1B' : '#166534' }}>
              mathematical verdict
            </span>
            <h2 style={{ fontSize: '1.8rem', color: result.grid_fallback_needed ? '#991B1B' : '#166534', marginBottom: '6px' }}>
              {result.verdict_text}
            </h2>
            <p style={{ fontSize: '0.92rem', color: result.grid_fallback_needed ? '#B91C1C' : '#15803D' }}>
              {result.grid_fallback_needed
                ? 'the solar panel cannot satisfy all requested phone charges plus rover driving on current sun hours alone. grid fallback or panel upgrade required.'
                : 'natural solar harvest exceeds combined motor traction and phone charging demands under standard conditions.'}
            </p>
          </div>

          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>daily harvest vs demand</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {result.daily_harvest_wh} Wh / {result.daily_demand_wh} Wh
            </div>
            <span style={{ fontSize: '0.82rem', color: result.grid_fallback_needed ? 'var(--accent-danger)' : 'var(--accent-live)', fontWeight: 600 }}>
              net: {result.net_wh > 0 ? `+${result.net_wh}` : result.net_wh} Wh/day
            </span>
          </div>
        </div>

        {/* Hint on what closes gap */}
        <div style={{ marginTop: '1.25rem', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: '8px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', border: '1px solid var(--border-subtle)' }}>
          💡 <strong>what closes the gap fastest:</strong> increasing solar panel from {inputs.panel_w} W to {Math.ceil(result.daily_demand_wh / (inputs.sun_hours * inputs.chain_efficiency))} W turns the net budget positive without compromising phone delivery trips.
        </div>
      </div>

      {/* Grid: Interactive Input Sliders + 24h Harvest Curve */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '2.5rem' }}>
        {/* Sliders Card */}
        <div className="card-luminous">
          <span className="eyebrow">simulation parameters</span>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>adjustable <em>inputs</em></h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span>solar panel rated power</span>
                <strong>{inputs.panel_w} W</strong>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                style={{ width: '100%' }}
                value={inputs.panel_w}
                onChange={(e) => setInputs({ ...inputs, panel_w: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span>peak sun hours / day</span>
                <strong>{inputs.sun_hours} hrs</strong>
              </div>
              <input
                type="range"
                min="2.0"
                max="7.0"
                step="0.5"
                style={{ width: '100%' }}
                value={inputs.sun_hours}
                onChange={(e) => setInputs({ ...inputs, sun_hours: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span>phone charge requests / day</span>
                <strong>{inputs.requests_per_day} charges</strong>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                style={{ width: '100%' }}
                value={inputs.requests_per_day}
                onChange={(e) => setInputs({ ...inputs, requests_per_day: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span>route length one-way</span>
                <strong>{inputs.route_length_m} m</strong>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                style={{ width: '100%' }}
                value={inputs.route_length_m}
                onChange={(e) => setInputs({ ...inputs, route_length_m: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span>rover cruising speed</span>
                <strong>{inputs.rover_speed_mps} m/s</strong>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                style={{ width: '100%' }}
                value={inputs.rover_speed_mps}
                onChange={(e) => setInputs({ ...inputs, rover_speed_mps: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* 24-Hour Bell Harvest Curve SVG */}
        <div className="card-luminous">
          <span className="eyebrow">24-hour diurnal profile</span>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>solar bell curve & <em>drain</em></h3>

          <svg viewBox="0 0 300 160" style={{ width: '100%', height: 'auto', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <defs>
              <linearGradient id="bellCurveFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid */}
            <line x1="20" y1="130" x2="280" y2="130" stroke="var(--border-medium)" strokeWidth="0.8" />
            <line x1="20" y1="20" x2="20" y2="130" stroke="var(--border-medium)" strokeWidth="0.8" />

            {/* Solar Bell Curve (6 AM to 6 PM) */}
            <path
              d="M 60 130 Q 150 25 240 130"
              fill="url(#bellCurveFill)"
              stroke="var(--accent-solar)"
              strokeWidth="2.5"
            />

            {/* Sun Icon At Zenith */}
            <circle cx="150" cy="35" r="5" fill="var(--accent-solar)" />
            <circle cx="150" cy="35" r="9" fill="none" stroke="var(--accent-solar)" strokeWidth="1" strokeDasharray="2 2" />

            {/* Rover Load Line */}
            <line
              x1="20"
              y1={Math.max(30, 130 - (result.daily_demand_wh / 60) * 80)}
              x2="280"
              y2={Math.max(30, 130 - (result.daily_demand_wh / 60) * 80)}
              stroke="var(--accent-sim)"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Time labels */}
            <text x="60" y="145" fontSize="8" fill="var(--text-faint)" textAnchor="middle">06:00</text>
            <text x="150" y="145" fontSize="8" fill="var(--text-faint)" textAnchor="middle">12:00 (zenith)</text>
            <text x="240" y="145" fontSize="8" fill="var(--text-faint)" textAnchor="middle">18:00</text>

            <text x="150" y="55" fontSize="9" fill="var(--accent-amber-deep)" textAnchor="middle" fontWeight="bold">
              harvest ({result.daily_harvest_wh} Wh)
            </text>
            <text x="270" y={Math.max(25, 122 - (result.daily_demand_wh / 60) * 80)} fontSize="8" fill="var(--accent-sim)" textAnchor="end" fontWeight="bold">
              demand ({result.daily_demand_wh} Wh)
            </text>
          </svg>

          {/* Model Equations Breakdown */}
          <div style={{ marginTop: '1rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            daily_harvest_Wh = {inputs.panel_w}W × {inputs.sun_hours}h × {inputs.chain_efficiency} = {result.daily_harvest_wh} Wh<br />
            daily_drive_Wh = {result.daily_drive_wh} Wh (traction + electronics)<br />
            daily_phone_Wh = {result.daily_phone_wh} Wh ({inputs.requests_per_day} charges)<br />
            net_Wh = {result.net_wh} Wh
          </div>
        </div>
      </div>

      {/* Export Action */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-secondary" onClick={exportJson}>
          export scenario as JSON ↗
        </button>
      </div>
    </div>
  );
};
