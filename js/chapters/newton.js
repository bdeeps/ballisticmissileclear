// Chapter 2: Newton's cannon. The one interactive trajectory model in this box, kept exactly as
// Newton's thought experiment: a ball fired from a mountain top above the air, with only a speed
// and an angle. No payload, no target, no aiming, no distance-to-target, no named missile.
// Newton described the idea in the years after the Principia (1687); the famous drawing was printed
// in "A Treatise of the System of the World" (1728). Physics: vacuum, inverse-square gravity, RK4
// (js/ballistic.js). Scale: 1 scene unit = 1,000 km, nothing exaggerated.
import { THREE, M, clamp } from '../kit.js';
import { fly, conic, circSpeed, escSpeed, fatLine, makeGlobe, marker, fmt, note, link, RE, H_SPACE, frameShift, narrow } from '../ballistic.js';

const S = 1e-6;                       // metres → scene units (1 unit = 1,000 km)
const R = RE * S;
const PICTURE = [3, 5, 6.5, 7.3, 7.85]; // speeds (km/s) for "Newton's picture"
const v3 = (p) => new THREE.Vector3(p.x * S, p.y * S, 0);

export default {
  id: 'newton',
  short: "Newton's cannon",
  title: "Newton's cannon: from a short arc to an orbit",
  subtitle: 'Fire faster and the ball lands further round the curve, until the ground curves away as fast as it falls.',
  view: { pos: [0.4, 6.9, 2.4], target: [0.4, 6.35, 0] },
  learn: `<p>In the years after his great book, the <b>Principia</b> of <b>1687</b>, Isaac Newton imagined a cannon on top of a mountain so tall that it pokes out above the air. Fire a ball slowly and it curves down and lands nearby. Fire it faster and it lands further round the curve of the Earth. That is a <b>ballistic</b> path: one push, then nothing but gravity.</p>
    <p>Fire it at about <b>7.9 km/s</b> (here, from a 100 km mountain, 7.85 km/s) and something wonderful happens. The ball still falls, all the time, but the ground curves away beneath it just as fast. It never lands. It is in <b>orbit</b>. Faster still, about <b>11.2 km/s</b>, and it <b>escapes</b> the Earth for good.</p>
    <p>Every arc is a piece of an <b>ellipse</b> with the Earth's centre at one focus, exactly as Kepler found for planets (see ${link('keplerclear', 'KeplerClear')}). A short arc is just the top of a long, thin ellipse that happens to run into the ground. Turn on the see-through Earth to see the rest of it. The same sums describe a thrown ball, a sounding rocket and a satellite (${link('gravityclear', 'GravityClear')} and ${link('newtonclear', 'NewtonClear')} have more).</p>
    <p><b>Air.</b> This model has no air, like Newton's. In real life the air matters most at the <b>start</b> and the <b>end</b>, where the path is low; the thin blue shell is the 100 km line where space is said to begin. Anything coming back down at several kilometres a second squeezes the air in front of it so hard that the air glows hot. That <b>re-entry heating</b> is why meteors shine (${link('cometclear', 'CometClear')}).</p>
    <p class="tip"><b>Try it:</b> press “Newton's picture”, then slide the speed up to 7.85 km/s and watch the arc close into a circle. Tilt the angle up and see the arc grow taller but still come down.</p>`,
  terms: [
    { t: 'Ballistic', d: 'Moving under gravity alone after a single push, with no engine or wings steering it.' },
    { t: 'Orbit', d: 'Falling round a planet forever because the ground curves away as fast as you fall.' },
    { t: 'Ellipse', d: 'A stretched circle. Every free-fall path round the Earth is part of one, with the Earth’s centre at one focus.' },
    { t: 'Escape speed', d: 'The speed that carries a thing away from the Earth for good, about 11.2 km/s from the ground.' },
    { t: 'Re-entry heating', d: 'The glow of air squeezed and heated in front of anything that falls back into the air very fast.' },
  ],
  defaults: { v: 5, ang: 0, xray: false },
  controls: [
    { key: 'v', type: 'range', label: 'Launch speed', min: 0.5, max: 11.5, step: 0.05, ends: ['0.5 km/s', '11.5 km/s'], fmt: (v) => v.toFixed(2) + ' km/s' },
    { key: 'ang', type: 'range', label: 'Angle above the horizon', min: 0, max: 80, step: 1, ends: ['flat', '80°'], fmt: (v) => Math.round(v) + '°' },
    { key: 'xray', type: 'toggle', label: 'See-through Earth (the whole ellipse)' },
    { key: 'go', type: 'buttons', label: 'Newton’s thought experiment', items: [
      { label: "Newton's picture", act: (s, inst) => { s.ang = 0; s.v = 7.85; inst.picture(); } },
      { label: 'Orbit (7.85 km/s)', act: (s) => { s.ang = 0; s.v = 7.85; } },
      { label: 'Clear', act: (s, inst) => inst.clearGhosts() },
    ] },
  ],
  quiz: [
    { q: 'In Newton’s thought experiment, what happens at about 7.9 km/s?', options: ['The ball stops falling', 'The ground curves away as fast as the ball falls, so it orbits', 'Gravity switches off', 'The ball goes straight up'], answer: 1, why: 'The ball never stops falling. At that speed the Earth’s surface curves away beneath it at the same rate, so it goes round and round.' },
    { q: 'A ball fired at 3 km/s lands. What shape is its path?', options: ['A straight line', 'Part of an ellipse with the Earth’s centre at one focus', 'A perfect circle', 'A zigzag'], answer: 1, why: 'Every free-fall path round the Earth is a piece of an ellipse (a conic). A short arc is the top of a long, thin ellipse that meets the ground.' },
    { q: 'Where does the air matter most for something that goes up high and comes back?', options: ['Only at the very top', 'At the start and the end, where the path is low and the air is thick', 'Nowhere', 'Only in the middle'], answer: 1, why: 'Most of the air is in the bottom few tens of kilometres. High up there is almost none, so drag and heating happen near the start and the end.' },
  ],
  reel: [
    { ms: 6200, caption: 'Newton imagined a cannon on a mountain above the air: the faster the shot, the further round it lands.', set: { ang: 0, v: 3, xray: false }, act: (s, inst) => inst.clearGhosts(), anim: { v: [3, 7.3] }, spin: 0 },
    { ms: 6000, caption: 'At about 7.9 km/s the ground curves away as fast as the ball falls: it is in orbit.', set: { ang: 0, xray: false }, act: (s, inst) => inst.picture(), anim: { v: [7.3, 7.85] }, spin: 0 },
  ],

  build({ stage }) {
    stage.setWorldMode(true);
    frameShift(stage, 0.12, -0.12);
    const root = new THREE.Group(); stage.root.add(root);
    const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(6, 10, 12);
    root.add(sun, new THREE.HemisphereLight(0xcfe3ff, 0x10131a, 0.9));

    const globe = makeGlobe(stage, R, { atmos: H_SPACE * S });
    root.add(globe.group);
    // Newton's mountain: 100 km tall, a narrow cone on top of the globe.
    const mountain = new THREE.Mesh(new THREE.ConeGeometry(0.06, H_SPACE * S, 24), M.matte(0x8a7a66));
    mountain.position.set(0, R + (H_SPACE * S) / 2, 0); root.add(mountain);
    const centre = marker(0xffffff, 0.08); root.add(centre); centre.visible = false;
    const lblCentre = stage.label("Earth's centre: a focus of the ellipse", [0, -0.3, 0], root); lblCentre.visible = false;
    const lblMount = stage.label("Newton's mountain, 100 km tall", [0, R + 0.13, 0], root);

    const path = fatLine(stage, [], { color: 0xffb547, width: 3.5 }); root.add(path);
    const trail = fatLine(stage, [], { color: 0xfff1c2, width: 5 }); root.add(trail);
    const ell = fatLine(stage, [], { color: 0x8ef0ff, width: 1.6, opacity: 0.75, dashed: true }); root.add(ell);
    const ghosts = []; const ghostG = new THREE.Group(); root.add(ghostG);
    const ball = marker(0xffd27a, 1); root.add(ball);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), M.ghost(0xff7a3c, 0.5)); root.add(glow);

    let key = '', res = null, pts3 = [], con = null, play = 0, dist = 1, lastFrame = '';
    const recompute = (s) => {
      res = fly(s.v * 1000, s.ang);
      pts3 = res.pts.map(v3);
      path.setPoints(pts3);
      con = conic(s.v * 1000, s.ang);
      const cp = con ? con.pts.map(v3) : [];
      const size = con ? Math.max(0.2, (con.ra || 1) * S * 0.04) : 0.1;
      ell.setPoints(cp, [size, size * 0.7]);
      key = s.v.toFixed(3) + '|' + s.ang;
      play = 0;
      frame(s);
    };
    // Frame the camera on the flight: the launch point, the path, and the whole Earth for long ones.
    const frame = () => {
      const box = new THREE.Box3();
      box.expandByPoint(new THREE.Vector3(0, R + 0.1, 0));
      pts3.forEach((p) => box.expandByPoint(p));
      if (res.outcome !== 'falls' || res.swept > 0.9) box.expandByPoint(new THREE.Vector3(-R, -R, 0)).expandByPoint(new THREE.Vector3(R, R, 0));
      if (res.outcome === 'escape') box.expandByPoint(new THREE.Vector3(0, R * 2.5, 0));
      const c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
      const span = Math.max(sz.x, sz.y * 1.3, 0.25);
      dist = span * 1.35 + 0.15;
      const sig = c.x.toFixed(2) + c.y.toFixed(2) + dist.toFixed(2);
      if (sig === lastFrame) return;
      lastFrame = sig;
      stage.setView([c.x + dist * 0.18, c.y + dist * 0.16, dist], [c.x, c.y, 0], 0.9);
    };

    const addGhost = (v) => {
      const r = fly(v * 1000, 0);
      const g = fatLine(stage, r.pts.map(v3), { color: 0xffb547, width: 2, opacity: 0.45 });
      ghostG.add(g); ghosts.push(g);
    };
    const clearGhosts = () => { ghosts.forEach((g) => { ghostG.remove(g); g.geometry.dispose(); }); ghosts.length = 0; };

    return {
      picture() { clearGhosts(); PICTURE.forEach(addGhost); },
      clearGhosts,
      update(dt, s) {
        dt = Math.max(0, dt);
        if ((s.v.toFixed(3) + '|' + s.ang) !== key) recompute(s);
        // Play each flight in about 4 s (orbits in 6 s), then hold, then replay.
        const dur = res.outcome === 'falls' ? 4 : 6;
        play += dt / dur;
        const k = clamp(play, 0, 1), T = res.t * k;
        let i = 0; while (i < res.pts.length - 1 && res.pts[i + 1].t < T) i++;
        const a = res.pts[i], b = res.pts[Math.min(i + 1, res.pts.length - 1)];
        const f = b.t > a.t ? clamp((T - a.t) / (b.t - a.t), 0, 1) : 0;
        const pos = new THREE.Vector3((a.x + (b.x - a.x) * f) * S, (a.y + (b.y - a.y) * f) * S, 0);
        ball.position.copy(pos);
        trail.setPoints([...pts3.slice(0, i + 1), pos]);
        if (play > 1.5) play = 0;
        // Marker size stays steady on screen.
        const cd = stage.camera.position.distanceTo(stage.controls.target);
        ball.scale.setScalar(cd * 0.012);
        // Re-entry glow (illustrative): only when falling back into the air fast.
        const alt = (pos.length() - R) / S, vr = (b.x - a.x) * a.x + (b.y - a.y) * a.y;
        const spd = b.t > a.t ? Math.hypot(b.x - a.x, b.y - a.y) / (b.t - a.t) : 0;
        const hot = alt < 60e3 && vr < 0 && k < 1 ? clamp((spd - 2500) / 4000, 0, 1) : 0;
        glow.position.copy(pos); glow.scale.setScalar(cd * 0.012 * (1.3 + 1.0 * hot)); glow.visible = hot > 0.02;
        glow.material.opacity = 0.25 + 0.5 * hot;
        // See-through Earth shows the rest of the ellipse and the focus.
        globe.mat.opacity = s.xray ? 0.25 : 1; globe.mat.depthWrite = !s.xray;
        centre.visible = lblCentre.visible = s.xray; centre.scale.setScalar(Math.max(0.3, cd * 0.01) / 0.08 * 0.08);
        ell.visible = !!con;
        lblMount.visible = cd < 6;
      },
      readout: (s) => {
        if (!res) return '';
        const out = { falls: 'Falls back to Earth', orbit: 'Orbit: it falls all the way round', escape: "Escapes the Earth's pull" }[res.outcome];
        const vc = circSpeed(H_SPACE) / 1000, ve = escSpeed(H_SPACE) / 1000;
        const shape = res.outcome === 'escape' ? 'an open curve (a hyperbola)' : res.outcome === 'orbit' ? 'a whole ellipse' : 'part of an ellipse';
        return `<div class="big">${out}</div>
          <div class="row"><span>Launch speed</span><b>${s.v.toFixed(2)} km/s</b></div>
          <div class="row"><span>Orbit speed at the mountain top</span><b>${vc.toFixed(2)} km/s</b></div>
          <div class="row"><span>Escape speed there</span><b>${ve.toFixed(1)} km/s</b></div>
          <div class="row"><span>Highest point</span><b>${res.outcome === 'escape' ? 'leaves for good' : fmt(res.hMax / 1000) + ' km up'}</b></div>
          <div class="row"><span>${res.outcome === 'orbit' ? 'Once round takes' : res.outcome === 'escape' ? 'Shown for' : 'Time in the air'}</span><b>${fmt(res.t / 60, 0)} min</b></div>
          <div class="row"><span>Shape of the path</span><b>${shape}</b></div>
          ${narrow() ? '' : note(`Newton’s thought experiment: no air, gravity only, drawn to scale. At the ground the orbit speed is ${(circSpeed(0) / 1000).toFixed(1)} km/s.`)}`;
      },
      dispose() { stage.setWorldMode(false); stage.setShift(0, 0); },
    };
  },
};
