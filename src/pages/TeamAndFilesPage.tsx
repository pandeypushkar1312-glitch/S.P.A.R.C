import React from 'react';
import { soundFX } from '../utils/audio';

export const TeamAndFilesPage: React.FC = () => {
  const team = [
    { name: 'Aarav Sharma', role: 'firmware & pico wh', task: 'micropython motor control loops, tof sensor i2c drivers, and dead-reckoning fusion.' },
    { name: 'Diya Patel', role: 'power & solar dock', task: '10 w solar panel staging, xl4015 cc/cv buck regulation, 3s bms balancing and diode protection.' },
    { name: 'Rohan Verma', role: 'mechanical & chassis', task: 'differential chassis 3d printing, pogo-pin dock funnel guide, and payload battery bay.' },
    { name: 'Sneha Nair', role: 'navigation & sensors', task: 'hall-effect wheel encoder calibration, mpu6050 heading drift damping, and route recording.' },
    { name: 'Alex Rivera', role: 'telemetry & dashboard', task: 'web dashboard, energy simulator models, judge presentation mode, and live api integration.' }
  ];

  const files = [
    { name: 'rover_main.py', size: '14.2 KB', desc: 'complete micropython firmware for raspberry pi pico wh with http/websocket server.' },
    { name: 'route.json', size: '1.8 KB', desc: 'taught academic quad route coordinates, waypoints, and user call points in meters.' },
    { name: 'phones.json', size: '3.4 KB', desc: 'verified battery capacities and nominal voltages for 30 popular indian smartphones.' },
    { name: 'rover-api.md', size: '8.5 KB', desc: 'hardware communication contract for pico wh http /api/status and /api/call endpoints.' },
    { name: 'sparc_cad_base.stl', size: '420 KB', desc: '3d printable chassis base plate with motor mounts and front caster socket.' },
    { name: 'sparc_funnel_dock.stl', size: '310 KB', desc: 'self-aligning funnel base with dual pogo-pin terminal channels.' }
  ];

  const handleDownload = (fileName: string) => {
    soundFX.playClick();
    alert(`Downloading ${fileName}... (Asset package ready for review)`);
  };

  return (
    <div className="container">
      <section style={{ maxWidth: '820px', marginBottom: '3rem' }}>
        <span className="eyebrow">/ 05 - team & project assets</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '1rem' }}>
          the team & <em>every file</em>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
          first-year multi-disciplinary project at vit chennai. open hardware, downloadable schematics, and clean engineering.
        </p>
      </section>

      {/* Team Cards */}
      <section style={{ marginBottom: '3.5rem' }}>
        <span className="eyebrow">/ 05.1 - vit chennai mdp team</span>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>the <em>people</em></h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {team.map((m) => (
            <div key={m.name} className="card-luminous">
              <span className="part-role">{m.role}</span>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>{m.name}</h3>
              <p style={{ fontSize: '0.85rem' }}>{m.task}</p>
            </div>
          ))}
        </div>

        {/* Faculty Guide Callout */}
        <div className="card-luminous" style={{ marginTop: '16px', background: 'var(--bg-subtle)' }}>
          <span className="eyebrow">project faculty guide</span>
          <h3 style={{ fontSize: '1.1rem' }}>Dr. K. Senthil Kumar, Ph.D.</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Associate Professor, School of Mechanical & Electrical Engineering, Vellore Institute of Technology (VIT), Chennai.
          </p>
        </div>
      </section>

      {/* Every File Downloads */}
      <section style={{ marginBottom: '3.5rem' }}>
        <span className="eyebrow">/ 05.2 - open hardware & code</span>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>every <em>file</em></h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {files.map((f) => (
            <div key={f.name} className="card-luminous" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{f.name}</strong>
                  <span className="chip" style={{ fontSize: '0.7rem' }}>{f.size}</span>
                </div>
                <p style={{ fontSize: '0.82rem' }}>{f.desc}</p>
              </div>

              <div style={{ marginTop: '14px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.78rem', padding: '7px 12px' }}
                  onClick={() => handleDownload(f.name)}
                >
                  download file ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
