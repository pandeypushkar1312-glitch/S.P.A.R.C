import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundFX } from '../utils/audio';

interface HotspotInfo {
  name: string;
  role: string;
  qty: string;
  desc: string;
}

interface Rover3DViewerProps {
  variant?: 'hero' | 'full';
}

export const Rover3DViewer: React.FC<Rover3DViewerProps> = ({ variant = 'full' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [selectedPart, setSelectedPart] = useState<HotspotInfo | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const width = container.clientWidth || (variant === 'hero' ? 480 : 640);
    const height = variant === 'hero' ? 360 : 420;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(variant === 'hero' ? 4.8 : 5.2, 3.8, variant === 'hero' ? 5.2 : 6.0);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Subtle studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    mainLight.position.set(6, 12, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.6);
    fillLight.position.set(-6, 8, -6);
    scene.add(fillLight);

    // Master group for rover
    const roverGroup = new THREE.Group();
    scene.add(roverGroup);

    // 1. Chassis Base Plate (Nordic Matte Black Anodized Aluminum)
    const baseGeo = new THREE.BoxGeometry(2.4, 0.12, 1.6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.2,
      roughness: 0.4
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.4;
    baseMesh.castShadow = true;
    roverGroup.add(baseMesh);

    // Chassis Standoff Screws / Highlights
    const screwMat = new THREE.MeshStandardMaterial({ color: 0xa1a1aa, metalness: 0.8, roughness: 0.2 });
    const screwGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.14, 12);
    [[-1.0, 0.7], [1.0, 0.7], [-1.0, -0.7], [1.0, -0.7]].forEach(([sx, sz]) => {
      const screw = new THREE.Mesh(screwGeo, screwMat);
      screw.position.set(sx, 0.47, sz);
      roverGroup.add(screw);
    });

    // 2. Drive Wheels (High-Grip Rubber Thread)
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.22, 28);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.3 });

    const leftWheel = new THREE.Mesh(wheelGeo, wheelMat);
    leftWheel.rotation.x = Math.PI / 2;
    leftWheel.position.set(0.6, 0.36, 0.95);
    leftWheel.castShadow = true;
    roverGroup.add(leftWheel);

    const leftRim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.24, 16), rimMat);
    leftRim.rotation.x = Math.PI / 2;
    leftRim.position.set(0.6, 0.36, 0.95);
    roverGroup.add(leftRim);

    const rightWheel = new THREE.Mesh(wheelGeo, wheelMat);
    rightWheel.rotation.x = Math.PI / 2;
    rightWheel.position.set(0.6, 0.36, -0.95);
    rightWheel.castShadow = true;
    roverGroup.add(rightWheel);

    const rightRim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.24, 16), rimMat);
    rightRim.rotation.x = Math.PI / 2;
    rightRim.position.set(0.6, 0.36, -0.95);
    roverGroup.add(rightRim);

    // 3. Front Ball Caster
    const casterGeo = new THREE.SphereGeometry(0.18, 20, 20);
    const casterMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.9, roughness: 0.1 });
    const casterMesh = new THREE.Mesh(casterGeo, casterMat);
    casterMesh.position.set(-0.8, 0.18, 0);
    casterMesh.castShadow = true;
    roverGroup.add(casterMesh);

    // 4. 3S Li-ion Battery Pack (Layer 1 - Blue Accented)
    const battGroup = new THREE.Group();
    const battGeo = new THREE.BoxGeometry(1.0, 0.26, 0.65);
    const battMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3, metalness: 0.1 });
    const battMesh = new THREE.Mesh(battGeo, battMat);
    battMesh.castShadow = true;
    battGroup.position.set(0.2, 0.55, 0);
    battGroup.add(battMesh);
    roverGroup.add(battGroup);

    // 5. 10,000 mAh Payload Power Bank (Layer 2 - Solar Amber Accented)
    const payloadGroup = new THREE.Group();
    const payloadGeo = new THREE.BoxGeometry(1.25, 0.22, 0.75);
    const payloadMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.2 });
    const payloadMesh = new THREE.Mesh(payloadGeo, payloadMat);
    payloadMesh.castShadow = true;
    payloadGroup.position.set(-0.25, 0.86, 0);
    payloadGroup.add(payloadMesh);

    // Qi Wireless / USB-C Pad on top of payload
    const padGeo = new THREE.BoxGeometry(0.8, 0.02, 0.55);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
    const padMesh = new THREE.Mesh(padGeo, padMat);
    padMesh.position.y = 0.12;
    payloadGroup.add(padMesh);
    roverGroup.add(payloadGroup);

    // 6. Dual ToF Distance Sensors (Front Red Lasers)
    const sensorGeo = new THREE.BoxGeometry(0.12, 0.16, 0.22);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.4 });
    const leftSensor = new THREE.Mesh(sensorGeo, sensorMat);
    leftSensor.position.set(-1.22, 0.45, 0.38);
    roverGroup.add(leftSensor);

    const rightSensor = new THREE.Mesh(sensorGeo, sensorMat);
    rightSensor.position.set(-1.22, 0.45, -0.38);
    roverGroup.add(rightSensor);

    // Glowing Laser Beam Cones for ToF Sensor Visuals
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const laserConeGeo = new THREE.ConeGeometry(0.3, 1.4, 16, 1, true);

    const leftLaser = new THREE.Mesh(laserConeGeo, laserMat);
    leftLaser.rotation.z = Math.PI / 2;
    leftLaser.position.set(-2.0, 0.45, 0.38);
    roverGroup.add(leftLaser);

    const rightLaser = new THREE.Mesh(laserConeGeo, laserMat);
    rightLaser.rotation.z = Math.PI / 2;
    rightLaser.position.set(-2.0, 0.45, -0.38);
    roverGroup.add(rightLaser);

    // 7. Raspberry Pi Pico WH ("the brain")
    const picoGeo = new THREE.BoxGeometry(0.52, 0.05, 0.26);
    const picoMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3 });
    const picoMesh = new THREE.Mesh(picoGeo, picoMat);
    picoMesh.position.set(0.55, 0.48, 0);
    roverGroup.add(picoMesh);

    // Pico Blinking Green Status LED
    const ledGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(0.7, 0.52, 0.08);
    roverGroup.add(ledMesh);

    // 8. Solar Dock on Stand (Shown in full mode or beside rover)
    const dockGroup = new THREE.Group();
    dockGroup.position.set(variant === 'hero' ? 2.6 : 3.0, 0, 0);
    scene.add(dockGroup);

    // Dock Stand & Solar Panel
    const standGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.9);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.6 });
    const standMesh = new THREE.Mesh(standGeo, standMat);
    standMesh.position.y = 0.95;
    dockGroup.add(standMesh);

    const panelGeo = new THREE.BoxGeometry(1.65, 0.05, 1.25);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.2
    });
    const panelMesh = new THREE.Mesh(panelGeo, panelMat);
    panelMesh.position.set(0, 1.85, 0);
    panelMesh.rotation.z = 0.36;
    panelMesh.castShadow = true;
    dockGroup.add(panelMesh);

    // Gold Pogo Contact Pins at Dock Base
    const pogoGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 12);
    const pogoMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    const pogoPin1 = new THREE.Mesh(pogoGeo, pogoMat);
    pogoPin1.position.set(-0.6, 0.4, 0.2);
    dockGroup.add(pogoPin1);
    const pogoPin2 = new THREE.Mesh(pogoGeo, pogoMat);
    pogoPin2.position.set(-0.6, 0.4, -0.2);
    dockGroup.add(pogoPin2);

    // Soft Shadow Ground Plane
    const groundGeo = new THREE.PlaneGeometry(24, 24);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0.01;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Orbit Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsRotating(false);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      roverGroup.rotation.y += deltaX * 0.012;
      camera.position.y = Math.max(1.2, Math.min(7.5, camera.position.y - deltaY * 0.018));
      camera.lookAt(0, 0.5, 0);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow elegant rotation when not dragging
      if (isRotating && !isDragging) {
        roverGroup.rotation.y += 0.005;
      }

      // Blinking Pico LED
      ledMesh.visible = Math.sin(elapsedTime * 6) > -0.2;

      // Laser Cone Breathing Pulse
      laserMat.opacity = 0.18 + Math.sin(elapsedTime * 4) * 0.08;

      // Smooth Explosion Interpolation
      const targetBattY = isExploded ? 1.35 : 0.55;
      const targetPayloadY = isExploded ? 2.2 : 0.86;
      battGroup.position.y += (targetBattY - battGroup.position.y) * 0.12;
      payloadGroup.position.y += (targetPayloadY - payloadGroup.position.y) * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isExploded, isRotating, variant]);

  const handleToggleExplode = () => {
    soundFX.playClick();
    setIsExploded(!isExploded);
  };

  const handleToggleRotate = () => {
    soundFX.playClick();
    setIsRotating(!isRotating);
  };

  return (
    <div
      className="card"
      style={{
        padding: variant === 'hero' ? '1.25rem' : '1.75rem',
        marginBottom: variant === 'hero' ? '0' : '2.5rem',
        background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
        borderColor: 'var(--border-medium)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="eyebrow" style={{ margin: 0 }}>
            {variant === 'hero' ? 'interactive 3d twin' : '/ 04 - interactive 3d model'}
          </span>
          <h3 style={{ fontSize: variant === 'hero' ? '1.15rem' : '1.4rem' }}>
            s.p.a.r.c. <em>cad geometry</em>
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="chip"
            style={{ fontSize: '0.72rem' }}
            onClick={handleToggleRotate}
            title="Toggle continuous rotation"
          >
            {isRotating ? '⏸ pause rotate' : '▶ auto rotate'}
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', padding: '4px 12px' }}
            onClick={handleToggleExplode}
          >
            {isExploded ? 'collapse layers' : 'exploded cad ↗'}
          </button>
        </div>
      </div>

      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: variant === 'hero' ? '340px' : '400px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          cursor: 'grab',
          position: 'relative'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
        {/* Hotspots Quick Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className="chip"
            style={{ fontSize: '0.72rem' }}
            onClick={() => {
              soundFX.playClick();
              setSelectedPart({
                name: '10,000 mAh Power Bank',
                role: 'the payload',
                qty: 'x1',
                desc: 'commercial 37 Wh lithium polymer bank delivering 5 V / 2 A standard phone charging.'
              });
            }}
          >
            amber: power bank
          </button>
          <button
            className="chip"
            style={{ fontSize: '0.72rem' }}
            onClick={() => {
              soundFX.playClick();
              setSelectedPart({
                name: '3S Li-ion Drive Pack',
                role: 'the fuel',
                qty: 'x1 (3 cells)',
                desc: '3x 2000 mAh 18650 cells in series (11.1 V nom, ~22.2 Wh) with BMS and 3A fuse.'
              });
            }}
          >
            blue: 3s pack
          </button>
          <button
            className="chip"
            style={{ fontSize: '0.72rem' }}
            onClick={() => {
              soundFX.playClick();
              setSelectedPart({
                name: 'Raspberry Pi Pico WH',
                role: 'the brain',
                qty: 'x1',
                desc: 'rp2040 dual-core controller with 2.4 GHz Wi-Fi hosting MicroPython telemetry server.'
              });
            }}
          >
            green: pico wh
          </button>
          <button
            className="chip"
            style={{ fontSize: '0.72rem' }}
            onClick={() => {
              soundFX.playClick();
              setSelectedPart({
                name: '10 W Solar Panel & Stand',
                role: 'the sun',
                qty: 'x1',
                desc: '12 V monocrystalline panel with XL4015 CC/CV buck charger and gold pogo contacts.'
              });
            }}
          >
            stand: solar dock
          </button>
        </div>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-faint)' }}>
          drag to orbit • scroll to zoom
        </span>
      </div>

      {selectedPart && (
        <div className="card" style={{ marginTop: '0.85rem', background: 'var(--bg-subtle)', borderColor: 'var(--border-medium)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="part-role" style={{ fontSize: '0.68rem' }}>{selectedPart.role}</span>
              <strong style={{ display: 'block', fontSize: '0.92rem', textTransform: 'lowercase' }}>
                {selectedPart.name} ({selectedPart.qty})
              </strong>
            </div>
            <button className="chip" style={{ fontSize: '0.7rem' }} onClick={() => setSelectedPart(null)}>✕ close</button>
          </div>
          <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>{selectedPart.desc}</p>
        </div>
      )}
    </div>
  );
};
