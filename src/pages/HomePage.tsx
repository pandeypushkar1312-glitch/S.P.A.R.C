import React, { useState } from 'react';
import { RoverStatus, RoverClient } from '../types/rover';
import { Rover3DViewer } from '../components/Rover3DViewer';
import { soundFX } from '../utils/audio';

interface HomePageProps {
  onGoToDemo: () => void;
  onGoToHonest: () => void;
  status?: RoverStatus;
  client?: RoverClient;
}

export const HomePage: React.FC<HomePageProps> = ({
  onGoToDemo,
  onGoToHonest,
  status,
  client
}) => {
  const [quickDispatchMsg, setQuickDispatchMsg] = useState<string | null>(null);

  // Fallback status if not provided
  const currentStatus: RoverStatus = status || {
    t: Date.now() / 1000,
    state: 'docked',
    pose: { x_m: 0, y_m: 0, heading_deg: 0 },
    speed_mps: 0,
    route: {
      id: 'taught-route-1',
      progress_pct: 0,
      current_waypoint: 0,
      distance_remaining_m: 0,
      eta_s: 0
    },
    obstacle_mm: 1200,
    uncertainty_m: 0.04,
    drive_pack: { voltage_v: 12.4, soc_pct: 88, current_a: 0.85, capacity_mah: 2000 },
    bank: { soc_pct: 94, output_w: 0, phone_connected: false, capacity_mah: 10000 },
    dock: { docked: true, panel_v: 17.8, charge_a: 0.85, stage: 'cc', daily_harvest_wh: 42.5 }
  };

  const handleQuickDispatch = (callPointId: string, label: string) => {
    soundFX.playChime(true);
    if (client) {
      client.call(callPointId);
      setQuickDispatchMsg(`dispatched to ${label}! switching to demo in 1s...`);
      setTimeout(() => {
        onGoToDemo();
      }, 1200);
    } else {
      onGoToDemo();
    }
  };

  return (
    <div className="container">
      {/* Hero Section: 2-Column Grid with Copy on Left, 3D Interactive Model on Right */}
      <section className="hero-grid">
        <div>
          <div className="hero-badge">
            <span className="pulse-dot pulse-dot-amber"></span>
            <span>VIT CHENNAI MDP 2026 • AUTONOMOUS ROVER</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5.8vw, 4.1rem)', marginBottom: '1.25rem', letterSpacing: '-0.035em', lineHeight: '1.1' }}>
            a charger that <em>comes to you.</em>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-body)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
            a small autonomous rover that roams a pre-taught campus route carrying a 10,000 mAh power bank, charges phones on request, and returns to a solar-powered dock to recharge itself. natural energy first. grid charging only as a last resort.
          </p>

          {/* Spec Chips */}
          <div className="spec-chips">
            <span className="chip">
              <span style={{ color: 'var(--accent-solar)' }}>⚡</span> pico wh (wi-fi)
            </span>
            <span className="chip">
              <span style={{ color: 'var(--accent-solar)' }}>☀️</span> 10 w solar dock
            </span>
            <span className="chip">
              <span style={{ color: 'var(--accent-solar)' }}>🔋</span> 3s li-ion pack
            </span>
            <span className="chip">
              <span style={{ color: 'var(--accent-solar)' }}>📱</span> 10,000 mah payload
            </span>
            <span className="chip">
              <span style={{ color: 'var(--accent-solar)' }}>🧭</span> dead-reckoning (no gps)
            </span>
            <span className="chip">
              <span style={{ color: 'var(--accent-solar)' }}>🔌</span> pogo-pin dock
            </span>
          </div>

          {/* Quick Dispatch Console */}
          <div
            className="card"
            style={{
              background: 'var(--bg-subtle)',
              borderColor: 'var(--border-medium)',
              padding: '1.1rem 1.4rem',
              margin: '1.75rem 0',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="eyebrow" style={{ margin: 0, fontSize: '0.7rem' }}>
                quick dispatch order
              </span>
              <span className="badge-sim">simulated</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.82rem', padding: '7px 16px' }}
                onClick={() => handleQuickDispatch('cp-1', 'desk 1 (library quad)')}
              >
                ⚡ order rover to desk 1
              </button>
              <button
                className="chip"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                onClick={() => handleQuickDispatch('cp-2', 'desk 2 (quiet hall)')}
              >
                call desk 2
              </button>
              <button
                className="chip"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                onClick={() => handleQuickDispatch('cp-3', 'bench 3 (atrium)')}
              >
                call bench 3
              </button>
            </div>

            {quickDispatchMsg && (
              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--accent-amber-deep)', fontFamily: 'var(--font-mono)' }}>
                ✓ {quickDispatchMsg}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                soundFX.playClick();
                onGoToDemo();
              }}
              style={{ padding: '11px 24px', fontSize: '0.95rem' }}
            >
              open live demo dashboard →
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                soundFX.playClick();
                onGoToHonest();
              }}
              style={{ padding: '11px 22px', fontSize: '0.95rem' }}
            >
              read the honest bit ↘
            </button>
          </div>
        </div>

        {/* Right: Embedded Interactive 3D Model */}
        <div>
          <Rover3DViewer variant="hero" />
        </div>
      </section>

      {/* Interactive Live Snapshot HUD (Looks like Teenage Engineering hardware screen) */}
      <section
        className="card-luminous"
        style={{
          marginBottom: '3.5rem',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="pulse-dot pulse-dot-green"></span>
            <span className="eyebrow" style={{ margin: 0 }}>system live telemetry snapshot</span>
            <span className="badge-sim">simulated</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-faint)' }}>
            firmware: v1.4-micropython • rp2040 dual-core
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px' }}>
          {/* Tile 1: Rover State */}
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <span className="eyebrow" style={{ fontSize: '0.7rem' }}>rover status</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '4px 0', textTransform: 'lowercase' }}>
              {currentStatus.state}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {currentStatus.state === 'docked' ? 'mating via pogo contacts' : `substate: ${currentStatus.substate}`}
            </span>
          </div>

          {/* Tile 2: Solar Dock Power with SVG Sparkline */}
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <span className="eyebrow" style={{ fontSize: '0.7rem' }}>solar dock harvest</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-amber-deep)', margin: '4px 0' }}>
              {currentStatus.dock.panel_v.toFixed(1)} V • {currentStatus.dock.charge_a.toFixed(2)} A
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="60" height="16" viewBox="0 0 60 16" style={{ overflow: 'visible' }}>
                <path
                  d="M0 12 Q15 2 30 10 T60 6"
                  fill="none"
                  stroke="var(--accent-solar)"
                  strokeWidth="2"
                  className="sparkline-line"
                />
              </svg>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ~{(currentStatus.dock.panel_v * currentStatus.dock.charge_a).toFixed(1)} W flux
              </span>
            </div>
          </div>

          {/* Tile 3: Drive Pack SOC */}
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <span className="eyebrow" style={{ fontSize: '0.7rem' }}>drive pack 3s</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '4px 0' }}>
              {currentStatus.drive_pack.soc_pct.toFixed(0)}% ({currentStatus.drive_pack.voltage_v.toFixed(1)} V)
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-live)', fontWeight: 500 }}>
              {currentStatus.drive_pack.soc_pct > 25 ? 'above 25% reserve lock' : 'reserve threshold hit'}
            </span>
          </div>

          {/* Tile 4: Payload Power Bank */}
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <span className="eyebrow" style={{ fontSize: '0.7rem' }}>payload power bank</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '4px 0' }}>
              {currentStatus.bank.soc_pct}% ({(currentStatus.bank.soc_pct * 0.37).toFixed(1)} Wh)
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {currentStatus.bank.phone_connected ? 'delivering 5V / 2A' : 'ready for phone delivery'}
            </span>
          </div>
        </div>
      </section>

      {/* 3 Headline Metrics (Clearly Labelled [simulated]) */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="eyebrow">/ 01 - proof of concept numbers</span>
          <h2 style={{ fontSize: '1.8rem' }}>engineered for <em>campus scale</em></h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="card-luminous">
            <span className="eyebrow">deliverable payload <span className="badge-sim">simulated</span></span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 600, margin: '8px 0' }}>
              ~37 <em>wh</em>
            </div>
            <p style={{ fontSize: '0.88rem' }}>
              from a 10,000 mah 3.7 v power bank payload, delivering 5 v / 2 a standard phone charging.
            </p>
          </div>

          <div className="card-luminous">
            <span className="eyebrow">solar refill time <span className="badge-sim">simulated</span></span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 600, margin: '8px 0' }}>
              ~1.8 <em>hrs</em>
            </div>
            <p style={{ fontSize: '0.88rem' }}>
              at peak sunshine using a 10 w solar panel with xl4015 cc/cv buck regulation at 12.6 v ~1 a.
            </p>
          </div>

          <div className="card-luminous">
            <span className="eyebrow">cruising speed <span className="badge-sim">simulated</span></span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 600, margin: '8px 0' }}>
              0.3 <em>m/s</em>
            </div>
            <p style={{ fontSize: '0.88rem' }}>
              twin 12 v dc gear motors via tb6612fng high-efficiency driver, drawing &lt;2 w mechanical power.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principle Callout */}
      <section
        className="card-luminous"
        style={{
          padding: '2.25rem',
          marginBottom: '3rem'
        }}
      >
        <span className="eyebrow">/ 02 - natural energy first</span>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.25rem' }}>
          why roaming solar beats stationary <em>wall sockets</em>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div>
            <strong style={{ display: 'block', marginBottom: '6px', textTransform: 'lowercase', fontSize: '1.05rem' }}>
              ☀️ solar energy where sun hits:
            </strong>
            <p style={{ fontSize: '0.92rem' }}>
              the dock sits in full sun on the academic quad or terrace, harvesting clean energy throughout the day.
            </p>
          </div>
          <div>
            <strong style={{ display: 'block', marginBottom: '6px', textTransform: 'lowercase', fontSize: '1.05rem' }}>
              ⚡ charge delivered where you sit:
            </strong>
            <p style={{ fontSize: '0.92rem' }}>
              instead of users walking to outdoor panels or being tied to wall sockets, the rover transports the harvested energy directly to desks and study tables.
            </p>
          </div>
          <div>
            <strong style={{ display: 'block', marginBottom: '6px', textTransform: 'lowercase', fontSize: '1.05rem' }}>
              🧭 honest dead-reckoning:
            </strong>
            <p style={{ fontSize: '0.92rem' }}>
              gps fails indoors and under dense campus walkways. we teach the route once, dead-reckon with encoders + imu gyro, and re-zero drift at the dock.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
