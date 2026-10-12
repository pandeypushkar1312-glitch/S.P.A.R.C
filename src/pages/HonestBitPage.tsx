import React, { useState } from 'react';
import { soundFX } from '../utils/audio';

export const HonestBitPage: React.FC = () => {
  const [expandedGotcha, setExpandedGotcha] = useState<number | null>(null);

  const gotchas = [
    {
      num: '01',
      title: 'dusty tiles warp headings',
      eyebrow: 'tile wheel slip',
      summary: 'VIT corridor tiles get dusty. When one rubber wheel slips on acceleration, encoder counts diverge from reality.',
      mitigation: 'MPU6050 6-axis gyro complementary filter dampens high-frequency wheel slip. Position uncertainty is explicitly bounded by our expanding drift halo and re-zeroed upon dock contact.'
    },
    {
      num: '02',
      title: 'oxidation & dock contact resistance',
      eyebrow: 'pogo-pin tolerances',
      summary: 'Funnel guides require tight mechanical tolerances. If the rover enters at >15° skew, one pogo contact may chatter.',
      mitigation: 'Gold-plated spring pins rated for 10,000 mating cycles with angled 3D-printed ABS guide chamfers ensuring <0.04 Ω contact impedance.'
    },
    {
      num: '03',
      title: '10 W is ideal noon laboratory rating',
      eyebrow: 'real solar harvest vs rating',
      summary: 'In Chennai summer heat, monocrystalline panel voltage sags with temperature, and building shadows cut output dramatically.',
      mitigation: 'Our mathematical solar budget calculator explicitly models 65% chain efficiency and variable sun hours so faculty can evaluate worst-case overcast monsoon days.'
    },
    {
      num: '04',
      title: 'HTTPS blocks local HTTP Pico WH',
      eyebrow: 'mixed content browser security',
      summary: 'Modern browsers forbid an HTTPS web page from making fetch requests to an HTTP local IP (http://sparc.local).',
      mitigation: 'For the review hall demonstration, the showcase dashboard is hosted locally over plain HTTP via Vite on the same Wi-Fi subnet as the Pico WH.'
    }
  ];

  return (
    <div className="container">
      <section style={{ maxWidth: '820px', marginBottom: '3rem' }}>
        <span className="eyebrow">/ 03 - no fluff engineering review</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '1rem' }}>
          the <em>honest</em> bit
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
          what s.p.a.r.c. does, what it can't do yet, and the exact real-world engineering edge cases that will bite you during evaluation.
        </p>
      </section>

      {/* Two Column Block: What it does vs What it can't yet */}
      <div className="honest-grid" style={{ marginBottom: '3.5rem' }}>
        {/* What it does */}
        <div className="card-luminous" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', fontSize: '1.35rem' }}>
            <span style={{ color: 'var(--accent-live)', fontSize: '1.2rem' }}>✓</span>
            <span>what it does</span>
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-live)' }}>•</span>
              <span><strong>teaches & repeats:</strong> we drive the route once manually; the pico wh records wheel ticks & gyro heading, then retraces it reliably.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-live)' }}>•</span>
              <span><strong>dead-reckons without gps:</strong> calculates relative (x, y) coordinates indoors where satellite signals are completely shielded.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-live)' }}>•</span>
              <span><strong>detects frontal obstacles:</strong> dual vl53l0x time-of-flight lasers pause motors when anything enters within 600 mm.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-live)' }}>•</span>
              <span><strong>charges phones safely:</strong> delivers 5 v / 2 a standard usb power from a protected 10,000 mah commercial power bank.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-live)' }}>•</span>
              <span><strong>self-aligns at dock:</strong> mechanical funnel base guides spring-loaded pogo pins into solid contact with zero user intervention.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-live)' }}>•</span>
              <span><strong>solar first:</strong> 10 w solar panel with xl4015 buck charger provides 12.6 v ~1 a cc/cv replenishment in sunlight.</span>
            </li>
          </ul>
        </div>

        {/* What it can't yet */}
        <div className="card-luminous" style={{ borderColor: 'var(--border-medium)', background: 'var(--bg-subtle)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', fontSize: '1.35rem' }}>
            <span style={{ color: 'var(--accent-amber-deep)', fontSize: '1.2rem' }}>✕</span>
            <span>what it can't yet</span>
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-amber-deep)' }}>•</span>
              <span><strong>no freeform slam:</strong> it cannot navigate arbitrary un-taught rooms or solve mazes without pre-recorded waypoints.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-amber-deep)' }}>•</span>
              <span><strong>drift accumulates:</strong> wheel slip on smooth tiles adds ~1.5% position uncertainty until it physically docks to re-zero.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-amber-deep)' }}>•</span>
              <span><strong>no stairs or gravel:</strong> twin 12 v gear motors and low ground clearance restrict roaming to flat tiled corridors and ramps.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-amber-deep)' }}>•</span>
              <span><strong>cloudy day limitations:</strong> on monsoon days, a 10 w panel will not refill the pack without fallback grid top-up.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-amber-deep)' }}>•</span>
              <span><strong>no laptop charging:</strong> payload output is standard 5 v usb (~10 w), not 65 w usb-pd high-voltage charging.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--accent-amber-deep)' }}>•</span>
              <span><strong>browser battery limits:</strong> web browsers cannot read a phone's physical mah capacity; we rely on honest model lookups.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* The Things that Will Bite You */}
      <section style={{ marginBottom: '3.5rem' }}>
        <span className="eyebrow">/ 03.1 - hardware reality checks</span>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
          the things that will <em>bite you</em>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {gotchas.map((g, idx) => {
            const isExpanded = expandedGotcha === idx;
            return (
              <div
                key={g.num}
                className="card-luminous"
                style={{ cursor: 'pointer', padding: '1.5rem' }}
                onClick={() => {
                  soundFX.playClick();
                  setExpandedGotcha(isExpanded ? null : idx);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="eyebrow" style={{ margin: 0 }}>{g.num} - {g.eyebrow}</span>
                  <span className="chip" style={{ fontSize: '0.7rem' }}>
                    {isExpanded ? 'collapse ▴' : 'solution ▾'}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{g.title}</h4>
                <p style={{ fontSize: '0.88rem' }}>{g.summary}</p>

                {isExpanded && (
                  <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '3px solid var(--accent-solar)', fontSize: '0.82rem' }}>
                    <strong>how we handle it:</strong> {g.mitigation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
