const path = require("path");
const fs = require("fs");
const http = require("http");
const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const seed = require("./seed");

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-before-deploying";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo123";
const DB_FILE = path.join(__dirname, "data", "db3.json");
const BED_KEYS = ["gen", "icu", "ped", "vent"];
const rad = (d) => (d * Math.PI) / 180;
const hav = (a, b, c, d) => { // straight-line km
  const x = Math.sin(rad(c - a) / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(rad(d - b) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
};

/* ---------- tiny JSON-file database ---------- */
function loadDb() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return JSON.parse(JSON.stringify(seed)); }
}
let hospitals = loadDb();
let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => fs.writeFile(DB_FILE, JSON.stringify(hospitals, null, 2), () => {}), 200);
}
persist();

const publicView = (h) => ({
  id: h.id, name: h.name, city: h.city, state: h.state, type: h.type, lat: h.lat, lng: h.lng, spec: h.spec,
  phone: h.phone, beds: h.beds, updatedAt: h.updatedAt
});

/* ---------- staff accounts: one per hospital (demo) ---------- */
// username = hospital slug (e.g. "citycare"), password = DEMO_PASSWORD
const hash = (s) => crypto.createHash("sha256").update(s).digest();
const safeEq = (a, b) => crypto.timingSafeEqual(hash(a), hash(b));

/* ---------- app ---------- */
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

// naive login rate limit: 10 tries per minute per IP
const attempts = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (attempts.get(ip) || []).filter((t) => now - t < 60000);
  list.push(now);
  attempts.set(ip, list);
  return list.length > 10;
}

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Sign in again: your session is missing or expired." }); }
}

app.post("/api/login", (req, res) => {
  if (limited(req.ip)) return res.status(429).json({ error: "Too many attempts. Wait a minute and try again." });
  const { username = "", password = "" } = req.body || {};
  const h = hospitals.find((x) => x.slug === String(username).trim().toLowerCase());
  if (!h || !safeEq(String(password), DEMO_PASSWORD))
    return res.status(401).json({ error: "Wrong username or password." });
  const token = jwt.sign({ role: "staff", hospitalId: h.id }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, hospital: publicView(h) });
});

app.get("/api/hospitals", (_req, res) => res.json(hospitals.map(publicView)));

app.get("/api/hospitals/:id/history", (req, res) => {
  const h = hospitals.find((x) => x.id === +req.params.id);
  if (!h) return res.status(404).json({ error: "Hospital not found." });
  res.json(h.history.slice(-50));
});

// Staff update: body like { "gen": 40, "icu": 5 }. Values are FREE beds.
app.put("/api/hospitals/:id/beds", auth, (req, res) => {
  const id = +req.params.id;
  if (req.user.hospitalId !== id)
    return res.status(403).json({ error: "You can only update your own hospital." });
  const h = hospitals.find((x) => x.id === id);
  if (!h) return res.status(404).json({ error: "Hospital not found." });

  const body = req.body || {};
  const next = {};
  for (const k of BED_KEYS) {
    if (body[k] === undefined) continue;
    const v = body[k];
    if (!Number.isInteger(v) || v < 0 || v > h.beds[k][1])
      return res.status(400).json({ error: `${k} must be a whole number from 0 to ${h.beds[k][1]}.` });
    next[k] = v;
  }
  if (!Object.keys(next).length) return res.status(400).json({ error: "Send at least one of: gen, icu, ped, vent." });

  for (const k of Object.keys(next)) h.beds[k][0] = next[k];
  h.updatedAt = Date.now();
  h.history.push({ at: h.updatedAt, free: Object.fromEntries(BED_KEYS.map((k) => [k, h.beds[k][0]])) });
  if (h.history.length > 200) h.history.shift();
  persist();

  io.emit("hospital:update", publicView(h)); // push to every open patient screen
  res.json(publicView(h));
});

// Emergency ranking: nearest ETA, penalised if data is stale or the unit is almost full.
app.get("/api/sos", (req, res) => {
  const need = req.query.need, lat = parseFloat(req.query.lat), lng = parseFloat(req.query.lng);
  if (!BED_KEYS.includes(need) || Number.isNaN(lat) || Number.isNaN(lng))
    return res.status(400).json({ error: "need (gen|icu|ped|vent), lat and lng are required." });
  const list = hospitals.filter((h) => h.beds[need][0] > 0 && (!req.query.type || h.type === req.query.type)).map((h) => {
    const km = +(hav(lat, lng, h.lat, h.lng) * 1.35).toFixed(1);
    const min = Math.max(2, Math.round((km / (km < 40 ? 28 : 55)) * 60));
    const stale = (Date.now() - h.updatedAt) / 60000 > 30;
    const nearFull = h.beds[need][0] / h.beds[need][1] < 0.1;
    return { ...publicView(h), km, min, score: min + (stale ? 15 : 0) + (nearFull ? 10 : 0) };
  }).sort((a, b) => a.score - b.score).slice(0, 3);
  res.json(list);
});

// Road route + ETA via OSRM; falls back to a straight-line estimate if OSRM is unreachable.
app.get("/api/route", async (req, res) => {
  const [a, b, c, d] = ["flat", "flng", "tlat", "tlng"].map((k) => parseFloat(req.query[k]));
  if ([a, b, c, d].some(Number.isNaN)) return res.status(400).json({ error: "flat, flng, tlat, tlng are required." });
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 4000);
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${b},${a};${d},${c}?overview=full&geometries=geojson`, { signal: ctl.signal });
    const rt = (await r.json()).routes[0];
    res.json({ km: +(rt.distance / 1000).toFixed(1), min: Math.max(1, Math.round(rt.duration / 60)), geometry: rt.geometry.coordinates.map(([x, y]) => [y, x]), estimated: false });
  } catch {
    const km = hav(a, b, c, d) * 1.35;
    res.json({ km: +km.toFixed(1), min: Math.max(2, Math.round((km / (km < 40 ? 28 : 55)) * 60)), geometry: [[a, b], [c, d]], estimated: true });
  }
});

// Reminder: tell staff screens when a hospital has not updated for 30+ minutes.
setInterval(() => hospitals.forEach((h) => {
  const m = Math.floor((Date.now() - h.updatedAt) / 60000);
  if (m >= 30) io.emit("hospital:stale", { id: h.id, name: h.name, minutes: m });
}), 60000);

io.on("connection", (socket) => socket.emit("hello", { hospitals: hospitals.length }));

server.listen(PORT, () => {
  console.log(`Hospify running at http://localhost:${PORT}`);
  console.log(`Staff login: username = hospital slug (e.g. citycare), password = ${DEMO_PASSWORD}`);
});
