import React, { useState, useEffect } from 'react';
import { RoverClient, RoverStatus } from '../types/rover';
import routeData from '../data/route.json';
import phonesData from '../data/phones.json';
import docksData from '../data/docks.json';
import { calculatePhoneCharge, PhoneEstimatorResult } from '../utils/energy';
import { soundFX } from '../utils/audio';

interface DemoPageProps {
  client: RoverClient;
  status: RoverStatus;
  mode: 'simulated' | 'live';
  isJudgeMode: boolean;
  onExitJudgeMode: () => void;
}

export const DemoPage: React.FC<DemoPageProps> = ({
  client,
  status,
  mode,
  isJudgeMode,
  onExitJudgeMode
}) => {
  const [selectedCallPointId, setSelectedCallPointId] = useState<string>('cp-1');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [eventLogs, setEventLogs] = useState<Array<{ time: string; state: string; msg: string }>>([]);
  const [motionTrail, setMotionTrail] = useState<Array<{ x: number; y: number }>>([]);

  // Phone Charge Estimator State
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedPhoneModel, setSelectedPhoneModel] = useState('iPhone 15');
  const [phoneCapacity, setPhoneCapacity] = useState(3349);
  const [currentPhonePct, setCurrentPhonePct] = useState(25);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const brands = Array.from(new Set(phonesData.map(p => p.brand)));
  const availableModels = phonesData.filter(p => p.brand === selectedBrand);

  useEffect(() => {
    const found = phonesData.find(p => p.brand === selectedBrand && p.model === selectedPhoneModel);
    if (found) setPhoneCapacity(found.capacity_mah);
  }, [selectedBrand, selectedPhoneModel]);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setCurrentPhonePct(Math.round(battery.level * 100));
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    setMotionTrail(prev => {
      const next = [...prev, { x: status.pose.x_m, y: status.pose.y_m }];
      return next.slice(-25);
    });
  }, [status.pose.x_m, status.pose.y_m]);

  useEffect(() => {
    if ('eventLog' in client) {
      setEventLogs([...(client as any).eventLog]);
    }
  }, [status.t, client]);

  const handleSpeedChange = (mult: number) => {
    setSpeedMultiplier(mult);
    client.setSpeedMultiplier(mult);
  };

  const selectedCallPoint = routeData.call_points.find(p => p.id === selectedCallPointId) || routeData.call_points[0];

  const estimation: PhoneEstimatorResult = calculatePhoneCharge({
    phone_mah: phoneCapacity,
    current_pct: currentPhonePct,
    bank_pct: status.bank.soc_pct
  });

  const stateSteps = [
    'docked',
    'called',
    'departing',
    'travelling',
    'arrived',
    'serving',
    'returning',
    'docking',
    'charging'
  ];
  const currentStepIdx = stateSteps.indexOf(status.state);

  return (
    <div className="container">
      {/* Header & Controls */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="eyebrow" style={{ margin: 0 }}>
                / 02 - interactive evaluation dashboard
              </span>
              {mode === 'simulated' ? (
                <span className="badge-sim">simulated</span>
              ) : (
                <span className="chip-live">live hardware</span>
              )}
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)' }}>
              live rover <em>dashboard</em>
            </h1>
          </div>

          {/* Speed Multiplier Pill Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-subtle)', padding: '5px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-faint)' }}>speed:</span>
            <button
              className={`chip ${speedMultiplier === 1 ? 'chip-active' : ''}`}
              style={{ padding: '3px 10px', fontSize: '0.72rem' }}
              onClick={() => handleSpeedChange(1)}
            >
              1x
            </button>
            <button
              className={`chip ${speedMultiplier === 5 ? 'chip-active' : ''}`}
              style={{ padding: '3px 10px', fontSize: '0.72rem' }}
              onClick={() => handleSpeedChange(5)}
            >
              5x
            </button>
            <button
              className={`chip ${speedMultiplier === 10 ? 'chip-active' : ''}`}
              style={{ padding: '3px 10px', fontSize: '0.72rem' }}
              onClick={() => handleSpeedChange(10)}
            >
              10x (judges)
            </button>
          </div>
        </div>

        {isJudgeMode && (
          <div className="card" style={{ marginTop: '1.25rem', background: '#FEF3C7', borderColor: '#F59E0B', borderLeftWidth: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#B45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pulse-dot pulse-dot-amber"></span>
                  judge review mode active [90s guided walkthrough]
                </strong>
                <p style={{ fontSize: '0.88rem', color: '#92400E', marginTop: '4px' }}>
                  speed set to 10x. demonstration sequence: 1. dispatch request → 2. dead-reckoning trajectory → 3. phone charge transfer → 4. solar docking recharge.
                </p>
              </div>
              <button className="chip" onClick={onExitJudgeMode}>esc exit</button>
            </div>
          </div>
        )}
      </section>

      {/* State Machine Stepper */}
      <section className="card" style={{ marginBottom: '2rem', padding: '1.25rem 1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span className="eyebrow" style={{ margin: 0 }}>rover state sequence</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-faint)' }}>
            active state: <strong style={{ color: 'var(--accent-solar)', textTransform: 'uppercase' }}>{status.state}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          {stateSteps.map((st, idx) => {
            const isActive = st === status.state;
            const isPassed = currentStepIdx > idx;
            return (
              <div
                key={st}
                className="chip"
                style={{
                  background: isActive ? 'var(--text-main)' : isPassed ? 'var(--bg-subtle)' : 'transparent',
                  color: isActive ? '#FFFFFF' : isPassed ? 'var(--text-main)' : 'var(--text-faint)',
                  borderColor: isActive ? 'var(--text-main)' : 'var(--border-subtle)',
                  fontWeight: isActive ? 600 : 400,
                  boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
                }}
              >
                {isPassed ? '✓ ' : ''}{st}
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Grid: 2D Floorplan + Dispatch Controller */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '3rem' }}>
        {/* Top-Down 2D Floorplan */}
        <div className="floorplan-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="eyebrow">/ 2D dead-reckoning floorplan</span>
              <h3 style={{ fontSize: '1.35rem' }}>taught campus route • <em>no gps</em></h3>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-subtle)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>pose:</span> ({status.pose.x_m.toFixed(1)}m, {status.pose.y_m.toFixed(1)}m)
              </div>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>azimuth:</span> {status.pose.heading_deg}°
              </div>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>uncertainty:</span> <strong style={{ color: 'var(--accent-solar)' }}>±{status.uncertainty_m}m</strong>
              </div>
            </div>
          </div>

          {/* SVG Floorplan Canvas */}
          <svg viewBox="-6 -6 116 28" className="floorplan-svg" style={{ background: 'var(--bg-subtle)', borderRadius: '14px', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-inner)' }}>
            {/* Fine Grid Pattern & Radar Gradient */}
            <defs>
              <pattern id="fineGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="var(--border-subtle)" strokeWidth="0.15" />
              </pattern>
              <pattern id="majorGrid" width="20" height="10" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 10" fill="none" stroke="var(--border-medium)" strokeWidth="0.3" />
              </pattern>
              <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-solar)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent-solar)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <rect x="-6" y="-6" width="116" height="28" fill="url(#fineGrid)" />
            <rect x="-6" y="-6" width="116" height="28" fill="url(#majorGrid)" />

            {/* Campus Walkway Corridor Outline */}
            <path
              d="M -2 -1 L 8 0.5 L 20 2.2 L 35 2.0 L 50 4.5 L 65 7.0 L 80 5.2 L 95 3.0 L 105 0.5"
              fill="none"
              stroke="var(--bg-card)"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Taught Route Track */}
            <polyline
              points={routeData.waypoints.map(w => `${w.x_m},${w.y_m}`).join(' ')}
              fill="none"
              stroke="var(--text-faint)"
              strokeWidth="0.7"
              strokeDasharray="1.5 1.5"
            />

            {/* Waypoints */}
            {routeData.waypoints.map(w => (
              <g key={w.id}>
                <circle cx={w.x_m} cy={w.y_m} r="0.9" fill="var(--bg-card)" stroke="var(--text-muted)" strokeWidth="0.4" />
                <text x={w.x_m} y={w.y_m - 1.4} fontSize="1.8" fill="var(--text-muted)" textAnchor="middle" fontFamily="monospace">
                  w{w.id}
                </text>
              </g>
            ))}

            {/* Solar Dock A Base (With solar panel graphic) */}
            <g transform="translate(0, 0)">
              <rect x="-2.5" y="-2.5" width="5" height="5" rx="1.2" fill="var(--accent-solar-soft)" stroke="var(--accent-solar)" strokeWidth="0.6" />
              <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="var(--accent-solar)" strokeWidth="0.3" strokeDasharray="0.5 0.5" />
              <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="var(--accent-solar)" strokeWidth="0.3" strokeDasharray="0.5 0.5" />
              <text x="0" y="0.9" fontSize="2.2" textAnchor="middle" fill="var(--accent-amber-deep)">☀️</text>
              <text x="0" y="4.2" fontSize="1.7" textAnchor="middle" fill="var(--accent-amber-deep)" fontFamily="monospace" fontWeight="bold">dock a</text>
            </g>

            {/* Call Points */}
            {routeData.call_points.map(cp => {
              const isTarget = cp.id === selectedCallPointId;
              return (
                <g
                  key={cp.id}
                  transform={`translate(${cp.x_m}, ${cp.y_m})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedCallPointId(cp.id);
                  }}
                >
                  {isTarget && (
                    <circle cx="0" cy="0" r="4.4" fill="none" stroke="var(--accent-solar)" strokeWidth="0.35" strokeDasharray="1 1" opacity="0.9" />
                  )}
                  <circle cx="0" cy="0" r={isTarget ? 2.6 : 1.9} fill={isTarget ? 'var(--text-main)' : 'var(--bg-card)'} stroke={isTarget ? 'var(--accent-solar)' : 'var(--border-medium)'} strokeWidth="0.5" />
                  <text x="0" y="0.8" fontSize="2.0" textAnchor="middle" fill={isTarget ? '#FFFFFF' : 'var(--text-body)'}>📍</text>
                  <text x="0" y="3.8" fontSize="1.6" textAnchor="middle" fill="var(--text-body)" fontFamily="sans-serif" fontWeight={isTarget ? 'bold' : 'normal'}>
                    {cp.name.split('/')[0]}
                  </text>
                </g>
              );
            })}

            {/* Motion Breadcrumb Trail */}
            {motionTrail.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="0.45"
                fill="var(--accent-sim)"
                opacity={(i / motionTrail.length) * 0.65}
              />
            ))}

            {/* Rover Uncertainty Drift Halo */}
            <circle
              cx={status.pose.x_m}
              cy={status.pose.y_m}
              r={status.uncertainty_m * 2.2}
              fill="rgba(59, 130, 246, 0.12)"
              stroke="rgba(59, 130, 246, 0.45)"
              strokeWidth="0.3"
              strokeDasharray="1 1"
            />

            {/* Radar Sweep Effect Centered on Rover */}
            <g transform={`translate(${status.pose.x_m}, ${status.pose.y_m})`}>
              <circle cx="0" cy="0" r="7" fill="none" stroke="var(--accent-solar)" strokeWidth="0.15" opacity="0.3" />
              <g className="radar-sweep-cone">
                <path d="M 0 0 L 7 -2.5 A 7 7 0 0 1 7 2.5 Z" fill="url(#radarSweepGrad)" />
              </g>
            </g>

            {/* Rover Marker with Heading Azimuth Arrow & ToF Ultrasonic Sensor Cone */}
            <g transform={`translate(${status.pose.x_m}, ${status.pose.y_m}) rotate(${status.pose.heading_deg})`}>
              {/* Ultrasonic Range Beam */}
              <path
                d="M 0 0 L 6 -2 L 6 2 Z"
                fill={status.obstacle_mm < 400 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.15)'}
                stroke={status.obstacle_mm < 400 ? 'var(--accent-danger)' : 'var(--accent-live)'}
                strokeWidth="0.18"
              />
              <circle cx="0" cy="0" r="1.8" fill="var(--text-main)" stroke="#FFFFFF" strokeWidth="0.5" />
              <polygon points="0,-2.6 1.3,1.3 -1.3,1.3" fill="var(--accent-solar)" />
              <circle cx="0" cy="0" r="0.6" fill="var(--accent-solar)" />
            </g>
          </svg>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-faint)' }}>
            <span>position from wheel encoders + gyro. no gps.</span>
            <span>uncertainty halo expands with distance • collapses upon docking re-zero</span>
          </div>
        </div>

        {/* Dispatch & Controller Actions Card */}
        <div className="card">
          <span className="eyebrow">/ route dispatch controller</span>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>call my <em>rover</em></h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '1.5rem' }}>
            {routeData.call_points.map(cp => (
              <div
                key={cp.id}
                className="card card-interactive"
                style={{
                  padding: '14px',
                  borderColor: selectedCallPointId === cp.id ? 'var(--text-main)' : 'var(--border-subtle)',
                  background: selectedCallPointId === cp.id ? 'var(--bg-subtle)' : '#FFFFFF',
                  boxShadow: selectedCallPointId === cp.id ? 'var(--shadow-sm)' : 'none'
                }}
                onClick={() => setSelectedCallPointId(cp.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.94rem', textTransform: 'lowercase' }}>{cp.name}</strong>
                  {selectedCallPointId === cp.id && <span style={{ color: 'var(--accent-solar)' }}>✓</span>}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  distance: {cp.distance_m}m • est travel: ~{cp.est_travel_s}s
                </span>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 2, padding: '11px 22px' }}
              onClick={() => {
                soundFX.playChime(true);
                client.call(selectedCallPointId);
              }}
              disabled={status.state !== 'docked' && status.state !== 'charging'}
            >
              call rover to {selectedCallPoint.name.split('/')[0]} →
            </button>

            {status.state === 'arrived' && (
              <button
                className="btn btn-secondary"
                style={{ background: 'var(--accent-solar-soft)', borderColor: 'var(--accent-solar)', color: 'var(--accent-amber-deep)' }}
                onClick={() => {
                  soundFX.playChime(true);
                  (client as any).startServing();
                }}
              >
                plug in phone ⚡
              </button>
            )}

            <button
              className="btn btn-secondary"
              onClick={() => {
                soundFX.playClick();
                client.returnHome();
              }}
              disabled={status.state === 'docked' || status.state === 'charging'}
            >
              send it home ↺
            </button>

            <button
              className="btn btn-danger"
              onClick={() => {
                soundFX.playAlert();
                client.emergencyStop();
              }}
            >
              emergency stop
            </button>
          </div>
        </div>
      </div>

      {/* Battery Tracker (Drive Pack & Power Bank) */}
      <section style={{ marginBottom: '3.5rem' }}>
        <span className="eyebrow">/ 02.2 - dual battery telemetry</span>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>battery <em>tracker</em></h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Drive Pack Gauge */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="part-role">rover drive pack</span>
              <span className="chip" style={{ fontSize: '0.72rem' }}>3s li-ion (11.1 v nom)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '14px 0 10px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 600 }}>
                {status.drive_pack.soc_pct.toFixed(0)}<em>%</em>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                (~{((status.drive_pack.soc_pct / 100) * 22.2).toFixed(1)} Wh / 22.2 Wh)
              </span>
            </div>

            {/* Glowing Progress bar */}
            <div style={{ height: '10px', background: 'var(--bg-subtle)', borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
              <div
                style={{
                  width: `${status.drive_pack.soc_pct}%`,
                  height: '100%',
                  background: status.drive_pack.soc_pct < 25 ? 'var(--accent-danger)' : 'var(--accent-live)',
                  boxShadow: status.drive_pack.soc_pct < 25 ? '0 0 10px rgba(239, 68, 68, 0.5)' : '0 0 10px rgba(16, 185, 129, 0.4)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              <span>voltage: {status.drive_pack.voltage_v.toFixed(2)} V</span>
              <span>cutoff reserve: 25%</span>
            </div>
          </div>

          {/* Power Bank Gauge */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="part-role">payload power bank</span>
              <span className="chip" style={{ fontSize: '0.72rem' }}>10,000 mah (3.7 v)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '14px 0 10px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 600 }}>
                {status.bank.soc_pct.toFixed(0)}<em>%</em>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                (~{((status.bank.soc_pct / 100) * 37.0).toFixed(1)} Wh / 37.0 Wh)
              </span>
            </div>

            {/* Glowing Progress bar */}
            <div style={{ height: '10px', background: 'var(--bg-subtle)', borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
              <div
                style={{
                  width: `${status.bank.soc_pct}%`,
                  height: '100%',
                  background: 'var(--accent-solar)',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              <span>deliverable at 5v: ~{((status.bank.soc_pct / 100) * 6200).toFixed(0)} mAh</span>
              <span>output: {status.bank.output_w.toFixed(1)} W</span>
            </div>
          </div>
        </div>
      </section>

      {/* Part B: Honest Phone Charge Estimator */}
      <section className="card" style={{ marginBottom: '3.5rem', padding: '2.25rem' }}>
        <span className="eyebrow">/ 02.3 - honest phone estimator</span>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>
          how much of <em>my phone</em> can it charge?
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', marginBottom: '1.75rem', maxWidth: '700px' }}>
          a browser cannot query phone battery capacity (browser sandbox security). select your verified phone model or type its rated mAh capacity:
        </p>

        {/* Brand Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {brands.map(b => (
            <button
              key={b}
              className={`chip ${selectedBrand === b ? 'chip-active' : ''}`}
              onClick={() => {
                setSelectedBrand(b);
                const first = phonesData.find(p => p.brand === b);
                if (first) setSelectedPhoneModel(first.model);
              }}
            >
              {b}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '1.75rem' }}>
          {/* Model Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>model:</label>
            <select
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontFamily: 'inherit' }}
              value={selectedPhoneModel}
              onChange={(e) => setSelectedPhoneModel(e.target.value)}
            >
              {availableModels.map(m => <option key={m.model} value={m.model}>{m.model} ({m.capacity_mah} mAh)</option>)}
            </select>
          </div>

          {/* Rated Capacity Fallback */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>rated capacity (mAh):</label>
            <input
              type="number"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontFamily: 'inherit' }}
              value={phoneCapacity}
              onChange={(e) => setPhoneCapacity(parseInt(e.target.value) || 4000)}
            />
          </div>

          {/* Current Phone % Slider */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              current phone level: <strong>{currentPhonePct}%</strong>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              style={{ width: '100%' }}
              value={currentPhonePct}
              onChange={(e) => setCurrentPhonePct(parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Visual Estimator Result Display */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
            borderColor: 'var(--border-medium)',
            padding: '1.75rem',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', textAlign: 'center' }}>
            <div>
              <span className="eyebrow" style={{ justifyContent: 'center' }}>can add up to</span>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-amber-deep)' }}>
                +{estimation.added_pct_points}%
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>from current {currentPhonePct}%</span>
            </div>

            <div>
              <span className="eyebrow" style={{ justifyContent: 'center' }}>full 0-100% charges</span>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                {estimation.full_charges}x
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>from current power bank level</span>
            </div>

            <div>
              <span className="eyebrow" style={{ justifyContent: 'center' }}>est. time to charge</span>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                ~{estimation.time_to_charge_mins} min
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>at 5 V / 2 A (~10 W)</span>
            </div>
          </div>
        </div>

        {/* Formula disclosure button */}
        <div>
          <button
            className="chip"
            style={{ fontSize: '0.78rem' }}
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          >
            {showFormulaDetails ? 'hide calculation formula' : 'view transparent formula & loss factors ↘'}
          </button>

          {showFormulaDetails && (
            <div style={{ marginTop: '12px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              phone_Wh = {phoneCapacity} mAh × 3.85 V / 1000 = {estimation.phone_wh} Wh<br />
              bank_energy_Wh = {status.bank.soc_pct}% × 37 Wh = {estimation.bank_energy_wh} Wh<br />
              delivered_Wh = bank_energy_Wh × 0.85 (boost converter) × 0.85 (phone charge circuit) = {estimation.delivered_wh} Wh<br />
              estimate under ideal conditions: phone idle, screen off.
            </div>
          )}
        </div>
      </section>

      {/* Docking Stations Network */}
      <section style={{ marginBottom: '3.5rem' }}>
        <span className="eyebrow">/ 02.4 - solar docking stations</span>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>docking <em>network</em></h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {docksData.map(dock => (
            <div
              key={dock.id}
              className="card"
              style={{
                borderColor: dock.status === 'live' ? 'var(--accent-solar)' : 'var(--border-subtle)',
                boxShadow: dock.status === 'live' ? '0 4px 20px rgba(245, 158, 11, 0.1)' : 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '1.05rem', textTransform: 'lowercase' }}>{dock.name}</strong>
                {dock.status === 'live' ? (
                  <span className="chip-live" style={{ fontSize: '0.7rem' }}>live station</span>
                ) : (
                  <span className="badge-planned">planned</span>
                )}
              </div>
              <p style={{ fontSize: '0.88rem', marginBottom: '14px' }}>{dock.description}</p>

              {dock.status === 'live' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: '10px', borderRadius: '8px' }}>
                  <span>solar: {dock.panel_v} V ({dock.charge_a} A)</span>
                  <span>stage: <strong style={{ color: 'var(--accent-amber-deep)' }}>{status.dock.stage.toUpperCase()}</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Live Telemetry Event Log */}
      <section className="card">
        <span className="eyebrow">/ live timestamped audit trail</span>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>trip <em>events</em></h3>
        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
          {eventLogs.map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-faint)', minWidth: '70px' }}>[{log.time}]</span>
              <span className="chip" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>{log.state}</span>
              <span style={{ color: 'var(--text-body)' }}>{log.msg}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
