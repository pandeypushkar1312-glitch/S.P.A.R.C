import React, { useState } from 'react';
import { Rover3DViewer } from '../components/Rover3DViewer';
import { soundFX } from '../utils/audio';

export const PartsAndWiringPage: React.FC = () => {
  const [selectedSchematicNode, setSelectedSchematicNode] = useState<string | null>('solar');

  const parts = [
    {
      name: 'Raspberry Pi Pico WH',
      role: 'the brain',
      qty: 'x1',
      desc: 'RP2040 dual-core ARM Cortex-M0+ with onboard 2.4 GHz Wi-Fi running telemetry & motor loops.'
    },
    {
      name: '12V DC Metal Gear Motors',
      role: 'the drive',
      qty: 'x2',
      desc: 'High-torque metal geared motors with integrated hall-effect quadrature wheel encoders.'
    },
    {
      name: 'TB6612FNG Dual Driver',
      role: 'the muscle',
      qty: 'x1',
      desc: 'Low-RDS(on) MOSFET dual H-bridge motor driver with thermal shutdown and standby pin.'
    },
    {
      name: 'VL53L0X ToF Distance Sensors',
      role: 'the eyes',
      qty: 'x2',
      desc: 'Time-of-flight laser ranging sensors providing millimeter obstacle avoidance.'
    },
    {
      name: 'MPU6050 6-Axis IMU',
      role: 'the compass',
      qty: 'x1',
      desc: '3-axis gyroscope & accelerometer for dead-reckoning heading drift compensation.'
    },
    {
      name: '3S Li-ion Drive Battery Pack',
      role: 'the fuel',
      qty: 'x1',
      desc: '3x 2000 mAh 18650 cells (11.1 V nom, ~22.2 Wh) with 3S BMS, 3A safety fuse, and diodes.'
    },
    {
      name: '10,000 mAh Power Bank',
      role: 'the payload',
      qty: 'x1',
      desc: 'Dedicated commercial 37 Wh lithium-polymer bank providing 5 V / 2 A phone charging.'
    },
    {
      name: '10 W Solar Panel & Dock',
      role: 'the sun',
      qty: 'x1',
      desc: '12 V monocrystalline panel, XL4015 CC/CV buck charger (12.6 V, 1 A), and pogo-pin funnel guide.'
    }
  ];

  const schematicNodes: Record<string, { title: string; subtitle: string; spec: string; notes: string }> = {
    solar: {
      title: '10W Monocrystalline Solar Panel',
      subtitle: 'Energy Generation Node (Stationary Dock)',
      spec: 'Voc: 21.6 V • Vmp: 18.0 V • Imp: 0.55 A • Pmax: 10 W',
      notes: 'Mounted at a 30° fixed tilt angle facing south on the academic quad or terrace. Protected by a 1N5822 Schottky blocking diode to eliminate reverse leakage during overcast or night.'
    },
    buck: {
      title: 'XL4015 CC/CV Buck Charger',
      subtitle: 'Regulation & Charge Controller Stage',
      spec: 'Vin: 18.0 V • Vout: 12.6 V CC/CV • Ilimit: 1.0 A • Efficiency: ~92%',
      notes: 'Steps down raw panel harvest into precision 3S Li-ion charging curve. Operates in Constant Current (1.0 A) mode until 12.6 V is reached, then tapers current in Constant Voltage mode.'
    },
    pogo: {
      title: 'Gold-Plated Pogo-Pin Dock Contacts',
      subtitle: 'Physical Hardware Interface',
      spec: 'Pin Count: 2 (VCC / GND) • Rated Current: 3 A • Resistance: < 0.04 Ω',
      notes: 'Features a 3D-printed angled funnel mechanical alignment guide. Pins mate securely upon rover entry and disconnect cleanly upon departure with zero friction drag.'
    },
    pack: {
      title: '3S Li-ion Drive Pack (11.1V Nom)',
      subtitle: 'Primary Rover Traction Battery',
      spec: 'Configuration: 3S1P 18650 • Capacity: 2000 mAh (22.2 Wh) • Cutoff: 9.0 V (25% reserve: 10.5 V)',
      notes: 'Includes hardware 3S BMS with overcharge (4.25 V/cell), overdischarge (2.8 V/cell), cell-balancing circuitry, and an inline 3 A fast-blow fuse for maximum safety.'
    },
    motors: {
      title: 'TB6612FNG Driver & 12V DC Motors',
      subtitle: 'Mobility & Mechanical Powertrain',
      spec: 'Driver: Dual MOSFET H-Bridge • Motor: 12V Metal Gearbox 100 RPM • Stall: ~0.8 A',
      notes: 'High-efficiency alternative to old L298N drivers with negligible voltage drop (<0.1 V). Dual quadrature hall encoders generate 360 ticks per wheel revolution for dead-reckoning odometry.'
    },
    brain: {
      title: 'Raspberry Pi Pico WH & Sensors',
      subtitle: 'Control & Telemetry Architecture',
      spec: 'MCU: Dual-core ARM Cortex-M0+ @ 133 MHz • Wi-Fi: CYW43439 2.4 GHz • Voltage: 3.3 V Logic',
      notes: 'Powered by an LM2596 / AMS1117 5V-to-3.3V step-down regulator. Polls VL53L0X ToF laser sensors at 20 Hz, MPU6050 IMU gyro at 50 Hz, and serves HTTP JSON telemetry.'
    },
    payload: {
      title: '10,000 mAh Payload Power Bank',
      subtitle: 'Dedicated User Phone Charging Reservoir',
      spec: 'Capacity: 10,000 mAh @ 3.7 V (37 Wh) • Output: 5.0 V / 2.0 A (10 W) USB-A/C',
      notes: 'Completely electrically isolated from rover drive electronics to prevent traction motor noise or stalling from interrupting user smartphone charging.'
    }
  };

  const activeNode = selectedSchematicNode ? schematicNodes[selectedSchematicNode] : schematicNodes.solar;

  return (
    <div className="container">
      <section style={{ maxWidth: '820px', marginBottom: '2.5rem' }}>
        <span className="eyebrow">/ 04 - bill of materials & schematics</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '1rem' }}>
          parts and <em>wiring</em>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
          every off-the-shelf component, power chain stage, and signal wiring pinout in our proof-of-concept rover.
        </p>
      </section>

      {/* 3D Rover Viewer */}
      <Rover3DViewer variant="full" />

      {/* Interactive Power Chain Schematic */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span className="eyebrow">/ 04.1 - interactive power bus schematic</span>
            <h2 style={{ fontSize: '1.6rem' }}>electrical <em>flow</em> architecture</h2>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-faint)' }}>
            click any node to inspect electrical specs
          </span>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderColor: 'var(--border-medium)', boxShadow: 'var(--shadow-md)' }}>
          {/* SVG Animated Circuit Schematic */}
          <svg viewBox="0 0 960 320" style={{ width: '100%', height: 'auto', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <defs>
              <linearGradient id="solarBusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="driveBusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="picoBusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>

            {/* Circuit Background Grid Lines */}
            <line x1="160" y1="80" x2="240" y2="80" stroke="#F59E0B" strokeWidth="2.5" className="sparkline-line" />
            <line x1="380" y1="80" x2="440" y2="80" stroke="#F59E0B" strokeWidth="2.5" className="sparkline-line" />
            <line x1="560" y1="80" x2="620" y2="80" stroke="#3B82F6" strokeWidth="2.5" className="sparkline-line" />
            
            {/* Split from 3S Pack to Motors and Pico */}
            <path d="M 740 80 L 780 80 L 780 50 L 820 50" fill="none" stroke="#3B82F6" strokeWidth="2.5" className="sparkline-line" />
            <path d="M 740 80 L 780 80 L 780 120 L 820 120" fill="none" stroke="#10B981" strokeWidth="2.5" className="sparkline-line" />

            {/* Isolated Payload Circuit Row */}
            <line x1="280" y1="230" x2="680" y2="230" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="5 3" />

            {/* Nodes */}
            {/* 1. Solar Panel */}
            <g transform="translate(40, 45)" style={{ cursor: 'pointer' }} onClick={() => { soundFX.playClick(); setSelectedSchematicNode('solar'); }}>
              <rect width="120" height="70" rx="10" fill={selectedSchematicNode === 'solar' ? '#FEF3C7' : 'var(--bg-card)'} stroke="#F59E0B" strokeWidth={selectedSchematicNode === 'solar' ? '2.5' : '1.5'} />
              <text x="60" y="28" fontSize="18" textAnchor="middle">☀️</text>
              <text x="60" y="46" fontSize="11" fontWeight="bold" textAnchor="middle" fill="var(--text-main)" fontFamily="sans-serif">10W SOLAR</text>
              <text x="60" y="60" fontSize="9" textAnchor="middle" fill="#B45309" fontFamily="monospace">18V Voc / Dock</text>
            </g>

            {/* 2. XL4015 Buck Charger */}
            <g transform="translate(240, 45)" style={{ cursor: 'pointer' }} onClick={() => { soundFX.playClick(); setSelectedSchematicNode('buck'); }}>
              <rect width="140" height="70" rx="10" fill={selectedSchematicNode === 'buck' ? '#FEF3C7' : 'var(--bg-card)'} stroke="#F59E0B" strokeWidth={selectedSchematicNode === 'buck' ? '2.5' : '1.5'} />
              <text x="70" y="28" fontSize="18" textAnchor="middle">⚡</text>
              <text x="70" y="46" fontSize="11" fontWeight="bold" textAnchor="middle" fill="var(--text-main)" fontFamily="sans-serif">XL4015 BUCK</text>
              <text x="70" y="60" fontSize="9" textAnchor="middle" fill="#B45309" fontFamily="monospace">12.6V CC/CV (1A)</text>
            </g>

            {/* 3. Pogo Pins */}
            <g transform="translate(440, 45)" style={{ cursor: 'pointer' }} onClick={() => { soundFX.playClick(); setSelectedSchematicNode('pogo'); }}>
              <rect width="120" height="70" rx="10" fill={selectedSchematicNode === 'pogo' ? '#FEF3C7' : 'var(--bg-card)'} stroke="#F59E0B" strokeWidth={selectedSchematicNode === 'pogo' ? '2.5' : '1.5'} />
              <text x="60" y="28" fontSize="18" textAnchor="middle">🔌</text>
              <text x="60" y="46" fontSize="11" fontWeight="bold" textAnchor="middle" fill="var(--text-main)" fontFamily="sans-serif">POGO DOCK</text>
              <text x="60" y="60" fontSize="9" textAnchor="middle" fill="#B45309" fontFamily="monospace">Funnel Guide</text>
            </g>

            {/* 4. 3S Pack */}
            <g transform="translate(620, 45)" style={{ cursor: 'pointer' }} onClick={() => { soundFX.playClick(); setSelectedSchematicNode('pack'); }}>
              <rect width="120" height="70" rx="10" fill={selectedSchematicNode === 'pack' ? '#DBEAFE' : 'var(--bg-card)'} stroke="#3B82F6" strokeWidth={selectedSchematicNode === 'pack' ? '2.5' : '1.5'} />
              <text x="60" y="28" fontSize="18" textAnchor="middle">🔋</text>
              <text x="60" y="46" fontSize="11" fontWeight="bold" textAnchor="middle" fill="var(--text-main)" fontFamily="sans-serif">3S LI-ION</text>
              <text x="60" y="60" fontSize="9" textAnchor="middle" fill="#1D4ED8" fontFamily="monospace">11.1V / 22.2Wh</text>
            </g>

            {/* 5. Motors */}
            <g transform="translate(820, 20)" style={{ cursor: 'pointer' }} onClick={() => { soundFX.playClick(); setSelectedSchematicNode('motors'); }}>
              <rect width="110" height="55" rx="8" fill={selectedSchematicNode === 'motors' ? '#DBEAFE' : 'var(--bg-card)'} stroke="#3B82F6" strokeWidth={selectedSchematicNode === 'motors' ? '2.5' : '1.5'} />
              <text x="55" y="24" fontSize="10" fontWeight="bold" textAnchor="middle" fill="var(--text-main)" fontFamily="sans-serif">TB6612 + MOTORS</text>
              <text x="55" y="40" fontSize="8.5" textAnchor="middle" fill="#1D4ED8" fontFamily="monospace">12V Drive Powertrain</text>
            </g>

            {/* 6. Pico WH */}
            <g transform="translate(820, 95)" style={{ cursor: 'pointer' }} onClick={() => { soundFX.playClick(); setSelectedSchematicNode('brain'); }}>
              <rect width="110" height="55" rx="8" fill={selectedSchematicNode === 'brain' ? '#D1FAE5' : 'var(--bg-card)'} stroke="#10B981" strokeWidth={selectedSchematicNode === 'brain' ? '2.5' : '1.5'} />
              <text x="55" y="24" fontSize="10" fontWeight="bold" textAnchor="middle" fill="var(--text-main)" fontFamily="sans-serif">PICO WH + SENSORS</text>
              <text x="55" y="40" fontSize="8.5" textAnchor="middle" fill="#047857" fontFamily="monospace">3.3V Logic / Wi-Fi</text>
            </g>

            {/* 7. Payload Power Bank (Lower loop) */}
            <g transform="translate(240, 195)" style={{ cursor: 'pointer' }} onClick={() => { soundFX.playClick(); setSelectedSchematicNode('payload'); }}>
              <rect width="160" height="70" rx="10" fill={selectedSchematicNode === 'payload' ? '#FEF3C7' : 'var(--bg-card)'} stroke="#F59E0B" strokeWidth={selectedSchematicNode === 'payload' ? '2.5' : '1.5'} />
              <text x="80" y="28" fontSize="18" textAnchor="middle">📱</text>
              <text x="80" y="46" fontSize="11" fontWeight="bold" textAnchor="middle" fill="var(--text-main)" fontFamily="sans-serif">10,000 mAh POWER BANK</text>
              <text x="80" y="60" fontSize="9" textAnchor="middle" fill="#B45309" fontFamily="monospace">Dedicated 37Wh Payload</text>
            </g>

            {/* 8. User Phone Pad */}
            <g transform="translate(620, 195)" style={{ cursor: 'pointer' }} onClick={() => { soundFX.playClick(); setSelectedSchematicNode('payload'); }}>
              <rect width="140" height="70" rx="10" fill="var(--bg-card)" stroke="var(--border-medium)" strokeWidth="1.5" />
              <text x="70" y="28" fontSize="18" textAnchor="middle">⚡</text>
              <text x="70" y="46" fontSize="11" fontWeight="bold" textAnchor="middle" fill="var(--text-main)" fontFamily="sans-serif">USER PHONE PAD</text>
              <text x="70" y="60" fontSize="9" textAnchor="middle" fill="var(--text-muted)" fontFamily="monospace">5V / 2A Output</text>
            </g>

            {/* Text Banner: Isolated Loop */}
            <text x="480" y="222" fontSize="9" textAnchor="middle" fill="var(--text-muted)" fontFamily="monospace">
              [ISOLATED PAYLOAD BUS - ZERO TRACTION INTERFERENCE]
            </text>
          </svg>

          {/* Interactive Node Spec Card */}
          <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="eyebrow" style={{ fontSize: '0.68rem', margin: 0 }}>{activeNode.subtitle}</span>
                <h3 style={{ fontSize: '1.2rem', marginTop: '2px' }}>{activeNode.title}</h3>
              </div>
              <span className="chip" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                {activeNode.spec}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', marginTop: '8px', lineHeight: '1.6' }}>
              {activeNode.notes}
            </p>
          </div>
        </div>
      </section>

      {/* Bill of Materials Cards */}
      <section style={{ marginBottom: '3.5rem' }}>
        <span className="eyebrow">/ 04.2 - proof-of-concept bill of materials</span>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>component <em>inventory</em></h2>

        <div className="parts-grid">
          {parts.map((p) => (
            <div key={p.name} className="part-card">
              <div>
                <span className="part-role">{p.role}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1.05rem' }}>{p.name}</h4>
                  <span className="chip" style={{ fontSize: '0.72rem' }}>{p.qty}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Signal Wiring List */}
      <section>
        <span className="eyebrow">/ 04.3 - pinout table</span>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>pico wh gpio <em>map</em></h2>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
            <div style={{ padding: '10px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <strong>GP0 / GP1 (I2C0)</strong><br />
              <span style={{ color: 'var(--text-muted)' }}>VL53L0X ToF Sensors & MPU6050</span>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <strong>GP6 / GP7 (PWM)</strong><br />
              <span style={{ color: 'var(--text-muted)' }}>TB6612 PWMA & PWMB Motor Speeds</span>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <strong>GP8-GP11 (GPIO)</strong><br />
              <span style={{ color: 'var(--text-muted)' }}>Motor Direction Pins AIN1/2, BIN1/2</span>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <strong>GP14 / GP15 (IRQ)</strong><br />
              <span style={{ color: 'var(--text-muted)' }}>Left & Right Wheel Hall Encoders</span>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <strong>GP26 (ADC0)</strong><br />
              <span style={{ color: 'var(--text-muted)' }}>3S Pack Voltage Divider (1/4 scaled)</span>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <strong>Wi-Fi Antenna</strong><br />
              <span style={{ color: 'var(--text-muted)' }}>802.11b/g/n Telemetry Server</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
