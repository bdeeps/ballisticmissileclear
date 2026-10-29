// Chapter 4: names and ranges. The public range categories, verified at the source:
// Arms Control Association, "Worldwide Ballistic Missile Inventories" (last reviewed August 2023):
//   short-range: less than 1,000 km; medium-range: 1,000–3,000 km;
//   intermediate-range: 3,000–5,500 km; intercontinental (ICBM): more than 5,500 km.
// Drawn as rings (great-circle distance d, angular radius d ÷ R) around one generic point on a plain
// globe with no continents, borders or places: nothing is targeted. Earth's circumference
// 40,075 km at the equator (NASA Earth Fact Sheet), so half-way round is about 20,000 km.
import { THREE, M, canvasTexture } from '../kit.js';
import { makeGlobe, fatLine, note, link, RE, frameShift, narrow } from '../ballistic.js';

const GR = 4;                                   // globe radius in scene units
const CATS = [
  { id: 'short', name: 'Short-range', band: 'less than 1,000 km', from: 0, to: 1000, color: 0x5ce1a9, css: '#5ce1a9' },
  { id: 'medium', name: 'Medium-range', band: '1,000 to 3,000 km', from: 1000, to: 3000, color: 0x8ef0ff, css: '#8ef0ff' },
  { id: 'intermediate', name: 'Intermediate-range', band: '3,000 to 5,500 km', from: 3000, to: 5500, color: 0xffb547, css: '#ffb547' },
  { id: 'icbm', name: 'Intercontinental', band: 'more than 5,500 km', from: 5500, to: 20015, color: 0xff7a59, css: '#ff7a59' },
];
const ang = (km) => (km * 1000) / RE;           // angular radius on the globe
// The generic point sits at 30° up from the globe's equator, facing the camera.
const POLE = new THREE.Vector3(0, Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)).normalize();

export default {
  id: 'ranges',
  short: 'Names and ranges',
  title: 'Names and ranges: four rings on a plain globe',
  subtitle: 'Ballistic missiles are sorted by how far they can fly. Here are the four public categories.',
  view: { pos: [3.6, 6.2, 11.4], target: [0.4, 1.6, 0] },
  learn: `<p>People who track weapons for arms-control talks sort ballistic missiles into four groups by how far they can travel. The <b>Arms Control Association</b> uses these bands: <b>short-range</b>, less than <b>1,000 km</b>; <b>medium-range</b>, <b>1,000 to 3,000 km</b>; <b>intermediate-range</b>, <b>3,000 to 5,500 km</b>; and <b>intercontinental</b> (ICBM), more than <b>5,500 km</b>.</p>
    <p>On this plain globe, with no countries drawn, the rings show those distances measured over the curved surface from one point. The biggest category reaches a long way round a planet whose full circumference is about <b>40,000 km</b>. That is the reason long-range flights climb so high: the free-fall arc you met in ${link('newtonclear', 'Newton’s cannon')} gets longer and taller as the speed approaches orbit speed.</p>
    <p><b>Ballistic or cruise?</b> A ballistic missile is pushed by a rocket and then falls along a high arc. A <b>cruise missile</b> is different: it flies like a small aircraft, with wings and an engine running the whole way, usually low down (see ${link('aeroplaneclear', 'AeroplaneClear')} for how wings work).</p>
    <p>The same bands of physics apply to peaceful rockets. A sounding rocket goes up and down, and a satellite launcher goes sideways fast enough never to come down.</p>
    <p class="tip"><b>Try it:</b> step through the four categories and compare the size of each ring with the whole globe.</p>`,
  terms: [
    { t: 'Short-range', d: 'A ballistic missile that travels less than 1,000 km, in the Arms Control Association’s bands.' },
    { t: 'Medium-range', d: 'Between 1,000 and 3,000 km.' },
    { t: 'Intermediate-range', d: 'Between 3,000 and 5,500 km.' },
    { t: 'Intercontinental (ICBM)', d: 'More than 5,500 km.' },
    { t: 'Cruise missile', d: 'A missile that flies like a small aircraft, with wings and an engine running all the way, rather than falling on an arc.' },
  ],
  defaults: { cat: 'all', compare: false },
  controls: [
    { key: 'cat', type: 'seg', label: 'Category', options: [{ v: 'all', label: 'All' }, ...CATS.map((c) => ({ v: c.id, label: c.name.replace('-range', '') }))] },
    { key: 'compare', type: 'toggle', label: 'Ballistic or cruise: side view' },
  ],
  quiz: [
    { q: 'In the Arms Control Association’s bands, what is a short-range ballistic missile?', options: ['Less than 100 km', 'Less than 1,000 km', 'Between 3,000 and 5,500 km', 'More than 5,500 km'], answer: 1, why: 'Short-range means less than 1,000 km. Medium-range is 1,000 to 3,000 km, intermediate 3,000 to 5,500 km, and intercontinental more than 5,500 km.' },
    { q: 'What makes a cruise missile different from a ballistic missile?', options: ['It is always bigger', 'It flies like an aircraft with wings and an engine running all the way', 'It goes into orbit', 'It has no engine'], answer: 1, why: 'A ballistic missile coasts on a free-fall arc after a short rocket push. A cruise missile keeps flying under power, held up by wings.' },
    { q: 'Roughly how far is it all the way round the Earth?', options: ['About 4,000 km', 'About 40,000 km', 'About 400,000 km', 'About 4 million km'], answer: 1, why: 'The Earth’s circumference is about 40,075 km at the equator, so half-way round is about 20,000 km.' },
  ],
  reel: [
    { ms: 6000, caption: 'Ballistic missiles are named by range: under 1,000 km, up to 3,000, up to 5,500, and beyond.', set: { cat: 'short', compare: false }, act: (s, inst) => inst.sweep(true), view: { pos: [2.4, 4.6, 8.4], target: [0, 1.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    stage.setWorldMode(true);
    const reel = document.body.classList.contains('gb-reel');
    frameShift(stage, 0.1, -0.08, -0.1);
    const root = new THREE.Group(); stage.root.add(root);
    const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(5, 8, 10);
    root.add(sun, new THREE.HemisphereLight(0xcfe3ff, 0x10131a, 0.8));
    const globe = makeGlobe(stage, GR, { color: 0x24507a, gridOpacity: 0.22 });
    root.add(globe.group);

    // Rotation that takes +Y to the chosen point, so caps built around +Y sit around it.
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), POLE);
    const caps = new THREE.Group(); caps.quaternion.copy(q); root.add(caps);
    const bands = CATS.map((c) => {
      const g = new THREE.SphereGeometry(GR * 1.004, 128, 48, 0, Math.PI * 2, ang(c.from), ang(c.to) - ang(c.from));
      const m = new THREE.Mesh(g, M.ghost(c.color, 0.28, { side: THREE.FrontSide }));
      caps.add(m);
      const ringPts = Array.from({ length: 161 }, (_, i) => { const a = (i / 160) * Math.PI * 2, t = ang(c.to); return new THREE.Vector3(GR * 1.008 * Math.sin(t) * Math.cos(a), GR * 1.008 * Math.cos(t), GR * 1.008 * Math.sin(t) * Math.sin(a)); });
      const ring = c.id === 'icbm' ? null : fatLine(stage, ringPts, { color: c.color, width: 2.5 });
      if (ring) caps.add(ring);
      // label on the near side of each ring
      const t = c.id === 'icbm' ? ang(7200) : ang(c.to);
      const lp = new THREE.Vector3(GR * 1.02 * Math.sin(t), GR * 1.02 * Math.cos(t), 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.35 - 0.3 * CATS.indexOf(c));
      const lbl = stage.label(c.id === 'icbm' ? 'More than 5,500 km' : `${c.to.toLocaleString('en-IN')} km`, [lp.x, lp.y, lp.z], caps);
      return { c, m, ring, lbl };
    });
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), M.glow(0xffffff));
    dot.position.copy(POLE).multiplyScalar(GR * 1.01); root.add(dot);
    stage.label('Any one point (nothing is targeted)', POLE.clone().multiplyScalar(GR * 1.01).add(new THREE.Vector3(-0.9, 0.5, 0.2)).toArray(), root);

    // Side-view board: a ballistic arc against a cruise path (schematic, not to scale).
    const { tex, redraw } = canvasTexture(640, 340, (g, w, h) => {
      g.fillStyle = 'rgba(10,12,20,0.92)'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#eef0f6'; g.font = '600 26px Geist, sans-serif'; g.fillText('Side view (not to scale)', 24, 42);
      g.fillStyle = '#23527a'; g.fillRect(24, h - 70, w - 48, 40);
      g.fillStyle = 'rgba(127,200,255,0.18)'; g.fillRect(24, h - 120, w - 48, 50);
      g.strokeStyle = '#ffb547'; g.lineWidth = 5; g.beginPath();
      for (let i = 0; i <= 100; i++) { const u = i / 100, x = 60 + u * (w - 120), y = h - 72 - 190 * Math.pow(Math.sin(Math.PI * u), 0.8); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      g.strokeStyle = '#8ef0ff'; g.setLineDash([12, 8]); g.beginPath();
      for (let i = 0; i <= 100; i++) { const u = i / 100, x = 60 + u * (w - 120), y = h - 82 - 10 * Math.sin(u * 18) * 0.4 - 6; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); g.setLineDash([]);
      g.font = '22px Geist, sans-serif'; g.fillStyle = '#ffb547'; g.fillText('Ballistic: rocket push, then a high free-fall arc', 70, 100);
      g.fillStyle = '#8ef0ff'; g.fillText('Cruise: flies low like an aircraft, engine on', 70, h - 128);
      g.fillStyle = '#a8aebf'; g.font = '18px Geist, sans-serif'; g.fillText('the air', w - 100, h - 78);
    });
    redraw();
    const board = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.23), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    board.position.set(5.4, 0.4, 2.4); board.rotation.y = -0.45; root.add(board);

    let sweepT = -1, lastCompare = null, started = false;
    const homeView = { pos: [3.6, 6.2, 11.4], target: [0.4, 1.6, 0] };
    return {
      sweep(on) { sweepT = on ? 0 : -1; },
      update(dt, s) {
        dt = Math.max(0, dt);
        board.visible = !!s.compare;
        if (s.compare !== lastCompare) {
          lastCompare = s.compare;
          if (!reel && started) { const v = s.compare ? { pos: [7.4, 1.6, 8.6], target: [4.4, 0.5, 2.0] } : homeView; stage.setView(v.pos, v.target, 1); }
          started = true;
        }
        if (sweepT >= 0) { sweepT += dt; s.cat = ['short', 'medium', 'intermediate', 'icbm', 'all'][Math.min(4, Math.floor(sweepT / 1.15))]; }
        bands.forEach(({ c, m, ring, lbl }) => {
          const on = s.cat === 'all' || s.cat === c.id;
          m.material.opacity = on ? (s.cat === 'all' ? 0.26 : 0.5) : 0.05;
          if (ring) ring.material.opacity = on ? 1 : 0.25;
          lbl.visible = on || s.cat === 'all';
        });
      },
      readout: (s) => {
        if (s.cat === 'all') {
          return `<div class="big">Four range categories</div>
            ${CATS.map((c) => `<div class="row"><span style="color:${c.css}">${c.name}</span><b>${c.band}</b></div>`).join('')}
            ${narrow() ? '' : note('Bands from the Arms Control Association factsheet “Worldwide Ballistic Missile Inventories” (reviewed August 2023). Rings measured over the curved surface.')}`;
        }
        const c = CATS.find((x) => x.id === s.cat);
        return `<div class="big" style="color:${c.css}">${c.name}</div>
          <div class="row"><span>Range band</span><b>${c.band}</b></div>
          <div class="row"><span>Earth’s circumference</span><b>about 40,075 km</b></div>
          ${note('Arms Control Association bands. A plain globe with no countries: the point is generic.')}`;
      },
      dispose() { stage.setWorldMode(false); stage.setShift(0, 0); },
    };
  },
};
