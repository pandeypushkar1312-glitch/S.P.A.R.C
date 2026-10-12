import React from 'react';

export const SystemPage: React.FC = () => {
  return (
    <div className="container">
      <section style={{ maxWidth: '820px', marginBottom: '3rem' }}>
        <span className="eyebrow">/ 01 - system architecture</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '1rem' }}>
          the full technical <em>breakdown</em>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
          every subsystem, power pathway, and mechanical link in s.p.a.r.c. broken down by responsibility.
        </p>
      </section>

      {/* Grid of 4 groups */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '3.5rem' }}>
        {/* Rover Group */}
        <div className="card-luminous">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="eyebrow" style={{ margin: 0 }}>/ 01.1 - mobile unit</span>
            <span className="chip" style={{ fontSize: '0.68rem' }}>RP2040 WH</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>rover <em>subsystem</em></h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>teach-and-repeat:</strong> records waypoints during manual calibration and retraces them autonomously without GPS.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>dead-reckoning:</strong> computes indoor (x, y) coordinates from quadrature wheel encoders and MPU6050 gyro fusion.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>obstacle awareness:</strong> dual VL53L0X time-of-flight laser sensors pause motors if pedestrians or chairs block the corridor.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>high-efficiency traction:</strong> TB6612FNG MOSFET driver draws &lt;2W mechanical power, preserving battery for payload.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>payload power bank:</strong> carries an isolated 10,000 mAh (37 Wh) power bank providing 5V / 2A charging.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>3S Li-ion drive pack:</strong> 11.1V ~22.2 Wh with hardware BMS, cell balancing, and a 3A safety fuse.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>automated return:</strong> returns to dock automatically when pack falls below 25% reserve lock.</span>
            </li>
          </ul>
        </div>

        {/* Dock Group */}
        <div className="card-luminous">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="eyebrow" style={{ margin: 0 }}>/ 01.2 - base station</span>
            <span className="chip" style={{ fontSize: '0.68rem' }}>10W CC/CV</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>solar dock <em>subsystem</em></h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>natural harvest first:</strong> 10W monocrystalline panel generates clean DC power throughout the day.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>XL4015 buck regulation:</strong> charges the 3S drive pack safely at 12.6V ~1A CC/CV with 92% efficiency.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>pogo-pin funnel dock:</strong> spring-loaded gold contacts slide smoothly into position with zero drag.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>schottky protection:</strong> 1N5822 blocking diodes prevent nighttime pack drain back into solar cells.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>drift re-zeroing:</strong> dock contact mechanically snaps coordinates back to origin (0, 0), collapsing uncertainty.</span>
            </li>
          </ul>
        </div>

        {/* System Group */}
        <div className="card-luminous">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="eyebrow" style={{ margin: 0 }}>/ 01.3 - integration</span>
            <span className="chip" style={{ fontSize: '0.68rem' }}>MDP CORE</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>overall <em>system</em></h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>professor brief answer:</strong> natural energy first; grid charging only as an emergency backup.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>on-demand delivery:</strong> users order power directly from their smartphone or laptop dashboard.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>verified database:</strong> 30 verified Indian smartphone models with honest battery capacity lookup.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-solar)' }}>•</span>
              <span><strong>published BOM:</strong> transparent component pricing, data sheets, and pinouts for replication.</span>
            </li>
          </ul>
        </div>

        {/* Planned Group */}
        <div className="card-luminous" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-medium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="eyebrow" style={{ margin: 0 }}>/ 01.4 - vision</span>
            <span className="badge-planned">planned</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>future <em>roadmap</em></h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-amber-deep)' }}>•</span>
              <span><strong>wireless dock:</strong> resonant inductive wireless pad eliminating mechanical contacts.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-amber-deep)' }}>•</span>
              <span><strong>fleet coordination:</strong> multiple docks and rovers sharing a campus-wide mesh network.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--accent-amber-deep)' }}>•</span>
              <span><strong>hybrid wind/solar:</strong> rooftop micro-turbines complementing solar on cloudy monsoon days.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
