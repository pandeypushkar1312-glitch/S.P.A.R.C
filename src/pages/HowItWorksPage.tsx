import React, { useState } from 'react';
import { soundFX } from '../utils/audio';

export const HowItWorksPage: React.FC<{ onGoToDemo: () => void }> = ({ onGoToDemo }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'call the rover',
      desc: 'a student or researcher requests mobile power from their laptop or smartphone. the request registers on the campus route queue.',
      icon: '📱',
      badge: 'REQUEST QUEUE',
      motorState: 'PWM 0% (Standby at dock)',
      sensorState: 'Wi-Fi polling HTTP /api/call endpoint',
      powerState: '3S pack idle; payload power bank ready at 37 Wh',
      telemetryJson: '{"cmd": "dispatch", "target": "cp-1", "reserve_ok": true}'
    },
    {
      num: '02',
      title: 'depart from dock',
      desc: 'the pico wh checks pack state of charge (>25% reserve). it disengages the pogo pins and zeros dead-reckoning encoders at dock origin.',
      icon: '🚀',
      badge: 'ZERO ORIGIN',
      motorState: 'PWM 45% (slow reverse exit 0.15 m/s)',
      sensorState: 'Encoder counts zeroed; IMU yaw initialized to 0.0°',
      powerState: 'Disengaging 12.6V pogo contacts; drawing ~1.2W traction',
      telemetryJson: '{"state": "departing", "pose": {"x": 0.0, "y": 0.0}, "drift": 0.0}'
    },
    {
      num: '03',
      title: 'autonomous navigation',
      desc: 'twin gear motors follow the pre-taught route. dual time-of-flight sensors look ahead and halt automatically if pedestrians or chairs block the way.',
      icon: '🧭',
      badge: 'DEAD-RECKONING',
      motorState: 'PWM 70% (cruising speed 0.30 m/s)',
      sensorState: 'VL53L0X lasers active at 20 Hz; obstacle threshold 400 mm',
      powerState: '3S pack current ~0.65A (~7.8W total draw)',
      telemetryJson: '{"state": "travelling", "wp": 3, "obstacle_mm": 1200, "drift_m": 0.12}'
    },
    {
      num: '04',
      title: 'charge phone',
      desc: 'the rover arrives at your desk. you plug in your phone to the 10,000 mah payload power bank delivering 5 v / 2 a standard charging.',
      icon: '⚡',
      badge: 'PAYLOAD TRANSFER',
      motorState: 'PWM 0% (holding stationary position)',
      sensorState: 'Proximity detection alert; awaiting phone unplug signal',
      powerState: 'Payload bank delivering 5V / 2A (10W); drive pack sleep mode',
      telemetryJson: '{"state": "serving", "payload_w": 9.8, "phone_connected": true}'
    },
    {
      num: '05',
      title: 'return trip',
      desc: 'once the phone is charged or the drive pack hits reserve threshold, the rover retraces the taught route back towards the academic quad.',
      icon: '🔄',
      badge: 'ROUTE REVERSAL',
      motorState: 'PWM 70% (reverse route traversal 0.30 m/s)',
      sensorState: 'Heading inverted (180°); drift tracking active',
      powerState: 'Checking reserve threshold (>25% lock)',
      telemetryJson: '{"state": "returning", "distance_rem_m": 4.2, "soc_pct": 82}'
    },
    {
      num: '06',
      title: 'dock and solar recharge',
      desc: 'funnel guides slide the rover into pogo contacts. dead-reckoning drift is re-zeroed. the 10 w solar panel resumes cc/cv charging for the next trip.',
      icon: '☀️',
      badge: 'NATURAL HARVEST',
      motorState: 'PWM 0% (mated into dock mechanical stop)',
      sensorState: 'Pogo contact closed; uncertainty halo reset to ±0.04m',
      powerState: '10W solar panel delivering 17.8V • 0.85A CC/CV',
      telemetryJson: '{"state": "docked", "solar_v": 17.8, "stage": "cc", "drift_reset": true}'
    }
  ];

  const current = steps[activeStep];

  return (
    <div className="container">
      <section style={{ maxWidth: '820px', marginBottom: '2.5rem' }}>
        <span className="eyebrow">/ 02 - operating lifecycle</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '1rem' }}>
          six steps from <em>sunlight</em> to your phone
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
          how a 10 w solar panel, a raspberry pi pico wh, and two dc gear motors close the energy loop on campus.
        </p>
      </section>

      {/* Connected Progress Rail Stepper */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '2rem' }}>
        {steps.map((s, idx) => (
          <button
            key={s.num}
            className={`chip ${activeStep === idx ? 'chip-active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
            onClick={() => {
              soundFX.playClick();
              setActiveStep(idx);
            }}
          >
            {s.num}. {s.title}
          </button>
        ))}
      </div>

      {/* Step Carousel / Interactive Stepper */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '2.5rem' }}>
        {steps.map((s, idx) => (
          <div
            key={s.num}
            className="card-luminous"
            style={{
              cursor: 'pointer',
              borderColor: activeStep === idx ? 'var(--text-main)' : 'var(--border-subtle)',
              background: activeStep === idx ? 'var(--bg-card)' : 'var(--bg-subtle)'
            }}
            onClick={() => {
              soundFX.playClick();
              setActiveStep(idx);
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="step-num">{s.num}</span>
              <span className="chip" style={{ fontSize: '0.7rem' }}>{s.badge}</span>
            </div>
            <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{s.icon}</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{s.title}</h3>
            <p style={{ fontSize: '0.88rem' }}>{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Selected Step Deep Dive Inspector */}
      <div className="card-luminous" style={{ padding: '2rem', marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span className="eyebrow" style={{ margin: 0 }}>phase {current.num} technical inspection</span>
            <h3 style={{ fontSize: '1.4rem' }}>{current.title} • <em>state details</em></h3>
          </div>
          <span className="chip" style={{ color: 'var(--accent-amber-deep)', fontWeight: 600 }}>
            {current.badge}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span className="eyebrow" style={{ fontSize: '0.7rem' }}>traction powertrain</span>
            <strong style={{ display: 'block', fontSize: '0.92rem', marginTop: '4px' }}>{current.motorState}</strong>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span className="eyebrow" style={{ fontSize: '0.7rem' }}>sensor & guidance</span>
            <strong style={{ display: 'block', fontSize: '0.92rem', marginTop: '4px' }}>{current.sensorState}</strong>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span className="eyebrow" style={{ fontSize: '0.7rem' }}>power architecture</span>
            <strong style={{ display: 'block', fontSize: '0.92rem', marginTop: '4px' }}>{current.powerState}</strong>
          </div>
        </div>

        <div>
          <span className="eyebrow" style={{ fontSize: '0.7rem' }}>telemetry json packet</span>
          <pre style={{ background: 'var(--bg-dark)', color: '#34D399', padding: '12px 16px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', overflowX: 'auto' }}>
            {current.telemetryJson}
          </pre>
        </div>
      </div>

      {/* Try in Demo Callout */}
      <div className="card-luminous" style={{ textAlign: 'center', padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.8rem' }}>
          see it happen in the <em>live simulator</em>
        </h2>
        <p style={{ maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
          watch the state machine step through docked, departing, travelling, arrived, and charging on the 2D dead-reckoning floorplan.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            soundFX.playClick();
            onGoToDemo();
          }}
        >
          launch live dashboard demo →
        </button>
      </div>
    </div>
  );
};
