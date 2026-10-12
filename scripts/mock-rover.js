// S.P.A.R.C. Mock Hardware Rover Server (Node.js)
// Simulates a Raspberry Pi Pico WH running on http://localhost:8080 or http://sparc.local:8080

import http from 'http';

const PORT = 8080;
let t = 0;
let state = 'docked';
let x_m = 0.0;
let y_m = 0.0;
let heading_deg = 0;
let soc_pct = 92;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/status' && req.method === 'GET') {
    t++;
    if (state === 'travelling') {
      x_m += 0.3;
      heading_deg = 45;
      soc_pct = Math.max(10, soc_pct - 0.05);
      if (x_m > 25) {
        state = 'arrived';
      }
    }

    const payload = {
      t,
      state,
      pose: { x_m: +x_m.toFixed(2), y_m: +y_m.toFixed(2), heading_deg },
      speed_mps: state === 'travelling' ? 0.3 : 0.0,
      route: { id: 'route-1', progress_pct: Math.min(100, Math.round((x_m / 25) * 100)) },
      obstacle_mm: 1250,
      drive_pack: { voltage_v: 12.2, soc_pct: Math.round(soc_pct), current_a: state === 'travelling' ? 0.45 : 0.05 },
      bank: { soc_pct: 95, output_w: state === 'serving' ? 9.8 : 0.0, phone_connected: state === 'serving' },
      dock: { docked: state === 'docked', panel_v: 17.8, charge_a: state === 'docked' ? 0.85 : 0.0, stage: state === 'docked' ? 'cc' : 'idle' },
      fault: null
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
    return;
  }

  if (req.url === '/api/call' && req.method === 'POST') {
    state = 'travelling';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ accepted: true, eta_s: 85 }));
    return;
  }

  if (req.url === '/api/return' && req.method === 'POST') {
    state = 'returning';
    setTimeout(() => {
      state = 'docked';
      x_m = 0;
      y_m = 0;
    }, 4000);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.url === '/api/stop' && req.method === 'POST') {
    state = 'docked';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.url === '/api/estop' && req.method === 'POST') {
    state = 'e_stop';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`[SPARC Mock Hardware Rover] listening on http://localhost:${PORT}`);
});
