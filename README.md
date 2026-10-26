# Hospify v2

Real-time hospital bed availability for Delhi. Express API, Socket.IO live push, JWT staff login, JSON-file database, real map and routing.

## Run (Node.js 18+)

```bash
npm install
npm start
```
Open http://localhost:3000.
If you ran the earlier version, nothing to reset: this version uses a new file (data/db3.json).

## Pages
- `/` Home
- `/find.html` Live map (Leaflet + OpenStreetMap), filters, route and ETA, call and directions
- `/sos.html` Emergency mode: pick ICU, ventilator, pediatric or general, get the top 3 hospitals
- `/desk.html` Hospital desk: login, update beds, stale-data reminder, update history
- Hindi / English toggle in the header on every page

## Demo flow
1. Window 1: open /find.html. Allow location (or it uses central Delhi).
2. Window 2: open /desk.html, sign in `aiims` / `demo123`, change ICU beds, Publish.
3. Window 1 updates instantly. Loknayak and DDU show as stale, with a reminder on their desk.
4. Open /sos.html, tap ICU, show the ranked top 3.

Usernames (hospital short names): aiims, safdarjung, rml, loknayak, gangaram, maxsaket, apollo, ddu, fortis, blkmax, medanta, jaypee, pgimer, sms, kgmu, kem, lilavati, sskm, rggh, apollochennai, victoria, manipal, osmania, civilahd.

## API
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/login | none | `{username,password}` returns JWT |
| GET | /api/hospitals | none | All hospitals with free/total beds |
| GET | /api/hospitals/:id/history | none | Last 50 updates |
| PUT | /api/hospitals/:id/beds | JWT | Staff update, e.g. `{"icu":5}` |
| GET | /api/sos?need=icu&lat=..&lng=.. | none | Top 3 ranked by ETA, penalising stale or nearly full |
| GET | /api/route?flat=..&flng=..&tlat=..&tlng=.. | none | Road route and ETA via OSRM, straight-line fallback |

Socket events: `hospital:update` (bed change), `hospital:stale` (no update for 30+ minutes).

## Honest notes
- Hospital names and locations are real (approximate). **Bed numbers and phone numbers are simulated placeholders.**
- ETA is road distance at normal speed, not live traffic.
- The map and route need internet.
- Config: PORT, JWT_SECRET, DEMO_PASSWORD.

## Track
Hack The Circle, Open Innovation.

## Credits and third-party resources
- Express, Socket.IO, jsonwebtoken (npm packages)
- Leaflet and OpenStreetMap (map and tiles)
- OSRM public routing service (road routes and ETA)
- Outfit font (Google Fonts)
Hospital names and locations are approximate public information; bed counts and phone numbers are simulated placeholders for the demo.

Hospitals are tagged Government or Private (Sir Ganga Ram is trust-run and shown as Private). Tags and locations should be verified before any real use.
