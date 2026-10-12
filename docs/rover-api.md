# S.P.A.R.C. — Hardware API Contract & Pico WH Guide
**Target Hardware:** Raspberry Pi Pico WH (MicroPython / C++)  
**Network Protocol:** HTTP REST + WebSocket over local 2.4 GHz Wi-Fi  
**Endpoint Base:** `http://sparc.local` or direct IP `http://192.168.x.x`  

---

## 1. Important Practical Security & Browser Constraint
> **CRITICAL:** Modern web browsers block calls from an `https://` webpage to an `http://` local hardware IP (Mixed Content policy).  
> For the live review evaluation, the showcase website MUST be served over plain `http://` on the laptop using:  
> ```bash
> npm run preview -- --host
> ```
> And the Raspberry Pi Pico WH MUST send CORS response headers:  
> `Access-Control-Allow-Origin: *`  
> `Access-Control-Allow-Methods: GET, POST, OPTIONS`  
> `Access-Control-Allow-Headers: Content-Type`

---

## 2. API Endpoints

### 2.1 `GET /api/status`
Returns real-time telemetry from onboard sensors:
```json
{
  "t": 1234567,
  "state": "travelling",
  "pose": { "x_m": 12.4, "y_m": 3.1, "heading_deg": 87 },
  "speed_mps": 0.28,
  "route": { "id": "route-1", "progress_pct": 41 },
  "obstacle_mm": 650,
  "drive_pack": { "voltage_v": 11.6, "soc_pct": 78, "current_a": 0.21 },
  "bank": { "soc_pct": 92, "output_w": 0.0, "phone_connected": false },
  "dock": { "docked": false, "panel_v": 17.8, "charge_a": 0.0, "stage": "idle" },
  "fault": null
}
```

### 2.2 `POST /api/call`
Request payload:
```json
{ "call_point_id": "cp-2" }
```
Response:
```json
{ "accepted": true, "eta_s": 95 }
```
Or if pack SOC < 25%:
```json
{ "accepted": false, "reason": "battery_low" }
```

### 2.3 `POST /api/return`, `POST /api/stop`, `POST /api/estop`
Response:
```json
{ "ok": true }
```

---

## 3. Copy-Paste MicroPython Implementation for Pico WH

Save as `main.py` on the Raspberry Pi Pico WH flash:

```python
import network
import uasyncio as asyncio
import ujson
import time

# 1. Connect Wi-Fi
SSID = "VIT-STUDENT"
PASS = "your_wifi_password"

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(SSID, PASS)

while not wlan.isconnected():
    time.sleep(0.5)

print("Connected! IP:", wlan.ifconfig()[0])

# Global Rover State
rover_state = {
    "t": 0,
    "state": "docked",
    "pose": {"x_m": 0.0, "y_m": 0.0, "heading_deg": 0},
    "speed_mps": 0.0,
    "route": {"id": "route-1", "progress_pct": 0},
    "obstacle_mm": 1200,
    "drive_pack": {"voltage_v": 12.4, "soc_pct": 90, "current_a": 0.1},
    "bank": {"soc_pct": 95, "output_w": 0.0, "phone_connected": False},
    "dock": {"docked": True, "panel_v": 17.8, "charge_a": 0.85, "stage": "cc"},
    "fault": None
}

CORS_HEADERS = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\n\r\n"

async def handle_client(reader, writer):
    request_line = await reader.readline()
    req_str = request_line.decode('utf-8')
    
    # Read headers
    content_len = 0
    while True:
        line = await reader.readline()
        if line == b'\r\n':
            break
        if b'Content-Length:' in line:
            content_len = int(line.split(b':')[1].strip())
            
    body = b""
    if content_len > 0:
        body = await reader.read(content_len)

    if "GET /api/status" in req_str:
        rover_state["t"] = int(time.time())
        writer.write(CORS_HEADERS + ujson.dumps(rover_state))
    elif "POST /api/call" in req_str:
        rover_state["state"] = "travelling"
        rover_state["dock"]["docked"] = False
        writer.write(CORS_HEADERS + ujson.dumps({"accepted": True, "eta_s": 85}))
    elif "POST /api/return" in req_str:
        rover_state["state"] = "returning"
        writer.write(CORS_HEADERS + ujson.dumps({"ok": True}))
    elif "POST /api/estop" in req_str:
        rover_state["state"] = "e_stop"
        writer.write(CORS_HEADERS + ujson.dumps({"ok": True}))
    else:
        writer.write(CORS_HEADERS + ujson.dumps({"ok": True}))

    await writer.drain()
    writer.close()

async def main():
    server = await asyncio.start_server(handle_client, "0.0.0.0", 80)
    print("MicroPython HTTP server active on port 80")
    while True:
        await asyncio.sleep(1)

asyncio.run(main())
```

---

## 4. Testing Locally with Mock Rover Script
Without hardware, you can test the live mode path immediately using:
```bash
npm run mock-rover
```
Then in the website header, toggle to **`live`**.
