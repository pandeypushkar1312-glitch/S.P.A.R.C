import React from 'react';

export const PosterPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="poster-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Print Controls (Hidden on Print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={onBack}>← back to site</button>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨 print / save as PDF (A3 Landscape)</button>
      </div>

      {/* Poster Canvas */}
      <div
        className="card"
        style={{
          background: '#FFFFFF',
          border: '2px solid #18181B',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Poster Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #18181B', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <span className="eyebrow" style={{ fontSize: '0.9rem', color: 'var(--accent-solar)', fontWeight: 700 }}>
              VIT CHENNAI • FIRST-YEAR MULTI-DISCIPLINARY PROJECT (MDP) • 2026
            </span>
            <h1 style={{ fontSize: '2.8rem', margin: '4px 0' }}>
              S.P.A.R.C. — Solar Powered <em>Autonomous Roaming Charger</em>
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              an on-demand autonomous mobile robot delivering natural solar energy directly to student desks & workspaces.
            </p>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* SVG QR Code */}
            <svg width="76" height="76" viewBox="0 0 100 100" fill="#18181B">
              <rect width="30" height="30" x="5" y="5"/>
              <rect width="18" height="18" x="11" y="11" fill="#fff"/>
              <rect width="8" height="8" x="16" y="16"/>
              <rect width="30" height="30" x="65" y="5"/>
              <rect width="18" height="18" x="71" y="11" fill="#fff"/>
              <rect width="8" height="8" x="76" y="16"/>
              <rect width="30" height="30" x="5" y="65"/>
              <rect width="18" height="18" x="11" y="71" fill="#fff"/>
              <rect width="8" height="8" x="16" y="76"/>
              <rect width="12" height="12" x="44" y="44"/>
            </svg>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>scan for live demo</span>
          </div>
        </div>

        {/* Poster 3-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '2rem' }}>
          {/* Column 1: Problem & Motivation */}
          <div>
            <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', marginBottom: '10px' }}>
              01 • the <em>problem</em>
            </h3>
            <p style={{ fontSize: '0.88rem', marginBottom: '10px' }}>
              university libraries and lecture halls suffer from acute power outlet shortages. students anchor themselves to walls or rely on heavy personal power banks.
            </p>
            <p style={{ fontSize: '0.88rem' }}>
              traditional solar charging stations are stationary outdoors, where students cannot work during hot daylight hours.
            </p>
          </div>

          {/* Column 2: Solution & Architecture */}
          <div>
            <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', marginBottom: '10px' }}>
              02 • the <em>solution</em>
            </h3>
            <p style={{ fontSize: '0.88rem', marginBottom: '10px' }}>
              s.p.a.r.c. decouples energy harvesting from energy delivery: outdoor 10 W solar docks capture natural irradiation, while a lightweight autonomous rover navigates pre-taught indoor routes on demand.
            </p>
            <p style={{ fontSize: '0.88rem' }}>
              dead-reckoning via wheel encoders and an MPU6050 gyro eliminates expensive GPS, with zero-drift resetting at the dock.
            </p>
          </div>

          {/* Column 3: The Honest Edge */}
          <div>
            <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', marginBottom: '10px' }}>
              03 • <em>honest</em> numbers
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <li>• <strong>controller:</strong> raspberry pi pico wh (wi-fi)</li>
              <li>• <strong>payload:</strong> 10,000 mah commercial bank (37 Wh)</li>
              <li>• <strong>drive pack:</strong> 3s li-ion (11.1 V, ~22.2 Wh)</li>
              <li>• <strong>dock:</strong> 10 W solar panel with XL4015 CC/CV</li>
              <li>• <strong>obstacle sensing:</strong> dual VL53L0X ToF lasers</li>
            </ul>
          </div>
        </div>

        {/* Poster Key Metrics Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="eyebrow" style={{ fontSize: '0.72rem' }}>solar panel</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>10 W</div>
            <span style={{ fontSize: '0.72rem' }}>18 V monocrystalline</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span className="eyebrow" style={{ fontSize: '0.72rem' }}>phone payload</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>37 Wh</div>
            <span style={{ fontSize: '0.72rem' }}>10,000 mAh at 3.7 V</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span className="eyebrow" style={{ fontSize: '0.72rem' }}>navigation</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>0 GPS</div>
            <span style={{ fontSize: '0.72rem' }}>encoders + gyro</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span className="eyebrow" style={{ fontSize: '0.72rem' }}>cruising speed</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>0.3 m/s</div>
            <span style={{ fontSize: '0.72rem' }}>twin gear motors</span>
          </div>
        </div>

        {/* Poster Footer Credits */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-faint)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <span>Team: Aarav Sharma • Diya Patel • Rohan Verma • Sneha Nair • Alex Rivera</span>
          <span>Faculty Guide: Dr. K. Senthil Kumar, Ph.D. • VIT Chennai</span>
        </div>
      </div>
    </div>
  );
};
