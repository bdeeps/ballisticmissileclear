// Shared physics and models for BallisticMissileClear.
//
// Scope (see the series brief, section AN): textbook physics only. The one trajectory model here is
// Newton's cannonball on a curved Earth in a vacuum (speed and angle only). There is no payload, no
// target, no aiming, no accuracy and no named missile anywhere in this file.
//
// Constants:
//   GM of the Earth 3.986004418 × 10¹⁴ m³/s² (IERS/NASA standard value), mean radius 6,371 km
//   (NASA Earth Fact Sheet). The same values RocketClear uses (rocketclear/js/rocket.js).
//   Circular speed at height h: √(GM ÷ (R + h)), 7.91 km/s at the surface, 7.85 km/s at 100 km.
//   Escape speed: √2 times that, 11.2 km/s at the surface.
//   The 100 km "edge of space" is the Kármán line used by the FAI (a convention, not a hard edge).
import { THREE, M, latheX, rod, sphere, clamp } from './kit.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';

export const GM = 3.986004418e14;
export const RE = 6371e3;
export const G0 = 9.80665;
export const H_SPACE = 100e3;
export const circSpeed = (h = 0) => Math.sqrt(GM / (RE + h));
export const escSpeed = (h = 0) => Math.sqrt((2 * GM) / (RE + h));

// ------------------------------------------------------------------ Newton's cannon
// Fire a ball from height h0 at speed v (m/s) and angle ang (degrees above the local horizontal),
// in a vacuum, in the plane of the page. Launch point (0, R + h0); "forward" is +x.
// Integrated with RK4; the step grows with distance so escape paths stay cheap.
// Returns points [{x, y, t}] in metres and seconds, the outcome and simple facts about the flight.
export function fly(v, ang, h0 = H_SPACE) {
  const a = (ang * Math.PI) / 180;
  let x = 0, y = RE + h0, vx = v * Math.cos(a), vy = v * Math.sin(a), t = 0;
  const acc = (px, py) => { const r = Math.hypot(px, py), k = -GM / (r * r * r); return [k * px, k * py]; };
  const pts = [{ x, y, t }];
  let swept = 0, prevTh = 0, rMax = y, outcome = 'falls';
  for (let n = 0; n < 40000; n++) {
    const r0 = Math.hypot(x, y);
    const dt = clamp(0.004 * Math.pow(r0 / RE, 1.5) * Math.sqrt(RE * RE * RE / GM), 0.2, 600);
    // RK4 on (x, y, vx, vy)
    const [a1x, a1y] = acc(x, y);
    const v2x = vx + a1x * dt / 2, v2y = vy + a1y * dt / 2;
    const [a2x, a2y] = acc(x + vx * dt / 2, y + vy * dt / 2);
    const v3x = vx + a2x * dt / 2, v3y = vy + a2y * dt / 2;
    const [a3x, a3y] = acc(x + v2x * dt / 2, y + v2y * dt / 2);
    const v4x = vx + a3x * dt, v4y = vy + a3y * dt;
    const [a4x, a4y] = acc(x + v3x * dt, y + v3y * dt);
    const nx = x + (dt / 6) * (vx + 2 * v2x + 2 * v3x + v4x);
    const ny = y + (dt / 6) * (vy + 2 * v2y + 2 * v3y + v4y);
    const nvx = vx + (dt / 6) * (a1x + 2 * a2x + 2 * a3x + a4x);
    const nvy = vy + (dt / 6) * (a1y + 2 * a2y + 2 * a3y + a4y);
    const r1 = Math.hypot(nx, ny);
    if (r1 < RE) {                       // hit the ground: interpolate to the surface
      const f = (r0 - RE) / Math.max(1e-9, r0 - r1);
      const ix = x + (nx - x) * f, iy = y + (ny - y) * f, it = t + dt * f;
      pts.push({ x: ix, y: iy, t: it });
      swept += angleDiff(Math.atan2(ix, iy), prevTh);
      outcome = 'falls'; t = it; break;
    }
    x = nx; y = ny; vx = nvx; vy = nvy; t += dt;
    const th = Math.atan2(x, y);
    swept += angleDiff(th, prevTh); prevTh = th;
    rMax = Math.max(rMax, r1);
    pts.push({ x, y, t });
    if (swept >= Math.PI * 2) { outcome = 'orbit'; break; }
    if (r1 > 9 * RE && x * vx + y * vy > 0) { outcome = 'escape'; break; }
    if (t > 4e5) { outcome = 'orbit'; break; }
  }
  // Straight up (or nearly) is a special case: it falls back where it started.
  return { pts, outcome, t, hMax: rMax - RE, swept, v, ang, h0 };
}
function angleDiff(a, b) { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }

// The whole conic the ball is on (Kepler: an ellipse with Earth's centre at one focus), from the
// launch state. Returns points in metres, or null for a hyperbola or a straight-up shot.
export function conic(v, ang, h0 = H_SPACE, n = 256) {
  const a = (ang * Math.PI) / 180, r0 = RE + h0;
  const px = 0, py = r0, vx = v * Math.cos(a), vy = v * Math.sin(a);
  const h = px * vy - py * vx;                                  // specific angular momentum (z)
  if (Math.abs(h) < 1e3) return null;
  const E = (v * v) / 2 - GM / r0;
  if (E >= 0) return null;
  // eccentricity vector e = (v × h)/GM − r̂
  const ex = (vy * h) / GM - px / r0, ey = (-vx * h) / GM - py / r0;
  const e = Math.hypot(ex, ey), p = (h * h) / GM, w = Math.atan2(ey, ex);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const nu = (i / n) * Math.PI * 2, r = p / (1 + e * Math.cos(nu));
    pts.push({ x: r * Math.cos(nu + w), y: r * Math.sin(nu + w) });
  }
  return { pts, e, a: -GM / (2 * E), rp: p / (1 + e), ra: p / (1 - e) };
}

// ------------------------------------------------------------------ drawing helpers
// A screen-space line of constant pixel width through a list of THREE.Vector3 points.
export function fatLine(stage, pts, { color = 0xffb547, width = 3, opacity = 1, dashed = false, dash = 0.1, gap = 0.07 } = {}) {
  if (document.body.classList.contains('gb-reel')) width *= 1.8;   // video frames are large
  const mat = stage.lineMaterial({ color, linewidth: width, transparent: true, opacity, dashed, dashSize: dash, gapSize: gap, depthWrite: false });
  const line = new LineSegments2(new LineSegmentsGeometry(), mat);
  line.setPoints = (p, d) => {
    const arr = [];
    for (let i = 0; i < p.length - 1; i++) arr.push(p[i].x, p[i].y, p[i].z, p[i + 1].x, p[i + 1].y, p[i + 1].z);
    line.geometry.dispose();
    line.geometry = new LineSegmentsGeometry();
    if (arr.length) line.geometry.setPositions(arr);
    line.visible = arr.length > 0;
    if (dashed && arr.length) {
      if (d) { mat.dashSize = d[0]; mat.gapSize = d[1]; }
      line.computeLineDistances();
    }
  };
  line.setPoints(pts);
  line.frustumCulled = false;
  return line;
}

// A plain globe with a faint latitude and longitude grid. No continents, no borders, no places.
export function makeGlobe(stage, R, { color = 0x1f4f78, grid = 0x8fb8e0, gridOpacity = 0.28, atmos = 0 } = {}) {
  const g = new THREE.Group();
  const mat = M.plastic(color, { roughness: 0.75, transparent: true, opacity: 1 });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), mat);
  g.add(ball);
  const lines = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = []; const c = Math.cos((lat * Math.PI) / 180), s = Math.sin((lat * Math.PI) / 180);
    for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push(new THREE.Vector3(R * 1.002 * c * Math.cos(a), R * 1.002 * s, R * 1.002 * c * Math.sin(a))); }
    lines.push(pts);
  }
  for (let lon = 0; lon < 180; lon += 30) {
    const pts = []; const a = (lon * Math.PI) / 180;
    for (let i = 0; i <= 96; i++) { const b = (i / 96) * Math.PI * 2; pts.push(new THREE.Vector3(R * 1.002 * Math.cos(b) * Math.cos(a), R * 1.002 * Math.sin(b), R * 1.002 * Math.cos(b) * Math.sin(a))); }
    lines.push(pts);
  }
  const gridLines = lines.map((p) => { const l = fatLine(stage, p, { color: grid, width: 1, opacity: gridOpacity }); g.add(l); return l; });
  let air = null;
  if (atmos) {
    air = new THREE.Mesh(new THREE.SphereGeometry(R + atmos, 96, 64), M.ghost(0x7fc8ff, 0.16));
    g.add(air);
  }
  return { group: g, ball, mat, gridLines, air };
}

// ------------------------------------------------------------------ the generic rocket
// One generic two-stage rocket standing on +Y, about 6.6 units tall. Deliberately plain: a cylinder
// per stage, a bell per engine, a payload section and a nose. No fins, markings or detail of any kind.
// Parts: stage1, engine1, stage2, engine2, payload. Labels use only "Stage", "Engine" and
// "Payload section", as the series brief requires.
export function makeGenericRocket() {
  const root = new THREE.Group();
  const skin = M.metal(0xdde2ea, { roughness: 0.4, metalness: 0.5 });
  const dark = M.metal(0x5a606c, { roughness: 0.5, side: THREE.DoubleSide });
  const ring = M.metal(0x9aa2b0, { roughness: 0.35 });
  // Each part is a group standing on +Y; inside it, a group turned so the kit's X-axis shapes stand up.
  const mk = () => { const g = new THREE.Group(), inner = new THREE.Group(); inner.rotation.z = Math.PI / 2; g.add(inner); root.add(g); g.put = (m) => inner.add(m); return g; };

  const stage1 = mk(), engine1 = mk(), stage2 = mk(), engine2 = mk(), payload = mk();
  stage1.put(rod(0.45, 3.2, 0.5, 0.5, skin, 48));
  stage1.put(rod(3.2, 3.45, 0.5, 0.44, ring, 48));                   // interstage ring
  engine1.put(latheX([[0.0, 0.42], [0.15, 0.33], [0.32, 0.22], [0.45, 0.2]], dark));
  stage2.put(rod(3.45, 4.95, 0.42, 0.42, skin, 48));
  engine2.put(latheX([[3.05, 0.3], [3.18, 0.24], [3.32, 0.16], [3.45, 0.15]], dark));
  payload.put(rod(4.95, 5.05, 0.43, 0.43, ring, 48));
  payload.put(latheX([[5.05, 0.42], [5.5, 0.42], [5.95, 0.33], [6.3, 0.18], [6.6, 0.01]], skin));

  // Flame and exhaust under the first (or the active) engine. Generic glow only.
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.6, 24, 1, true), M.glow(0xffb547, { transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  flame.rotation.x = Math.PI; flame.position.y = -0.8;
  const core = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 16, 1, true), M.glow(0xfff1c2, { transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
  core.rotation.x = Math.PI; core.position.y = -0.45;
  const fl = new THREE.Group(); fl.add(flame, core); fl.visible = false;
  root.add(fl);
  const setFlame = (k, t, y = 0) => {
    fl.visible = k > 0.02; fl.position.y = y;
    fl.scale.set(0.9 + 0.1 * Math.sin(t * 37), Math.max(0.05, k) * (1 + 0.08 * Math.sin(t * 23)), 0.9 + 0.1 * Math.sin(t * 41));
  };
  const parts = { stage1, engine1, stage2, engine2, payload };
  Object.values(parts).forEach((p) => { p.userData.home = p.position.clone(); });
  return { root, parts, setFlame, skin };
}

// A small sprite-like marker ball whose on-screen size stays steady as the camera zooms.
export function marker(color = 0xffd27a, r = 1) { return sphere(r, M.glow(color), 20); }

export const fmt = (n, d = 0) => (Number.isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d }) : '–');
export const note = (html) => `<p style="margin:10px 0 0;font-size:12px;color:var(--muted);line-height:1.45">${html}</p>`;
export const link = (slug, name) => `<a href="https://glassbox.how/${slug}/" target="_blank" rel="noopener">${name}</a>`;

// Phones show a tall readout over the top of the stage, so push the picture down there.
export const narrow = () => window.innerWidth < 700;
export function frameShift(stage, x, y, ny = -0.3) {
  if (document.body.classList.contains('gb-reel')) return;
  if (narrow()) stage.setShift(0, ny); else stage.setShift(x, y);
}
// The first sentence of a text, for phone readouts.
export const first = (t) => (narrow() ? t.split(/(?<=\.)\s/)[0] : t);
