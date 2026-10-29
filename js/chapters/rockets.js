// Chapter 3: powered by rockets. One generic rocket shape, labelled only "Stage", "Engine" and
// "Payload section" (series brief, section AN), with staging shown as a sequence; then the three
// cousins that share rocket physics: a sounding rocket, a ballistic arc and a satellite launch.
// The paths are computed with the same vacuum model as Newton's cannon (js/ballistic.js), with
// heights drawn 4× taller so they show, and no numbers attached to them. RocketClear owns the rocket
// equation and the engine; this chapter only points to it.
import { THREE, M, clamp, smooth } from '../kit.js';
import { makeGenericRocket, makeGlobe, fatLine, fly, note, link, RE, frameShift } from '../ballistic.js';

const VIEWS = {
  stack: { pos: [6.2, 4.4, 8.6], target: [-0.6, 3.3, 0] },
  cousins: { pos: [0.4, 3.2, 7.8], target: [0.0, 1.6, 0] },
};
const ER = 2.5, EX = 4, S = ER / RE;
// Generic illustrative launches (speeds in m/s, angle above the horizon). No numbers are displayed.
const PATHS = {
  sounding: { v: 2200, ang: 88, color: 0x5ce1a9, label: 'Sounding rocket: up and down, to study the sky' },
  ballistic: { v: 4200, ang: 40, color: 0xffb547, label: 'Ballistic arc: up, over, and back to Earth' },
  orbit: { v: 7800, ang: 0, h0: 250e3, color: 0x8ef0ff, label: 'Satellite launcher: fast enough sideways to orbit' },
};

export default {
  id: 'rockets',
  short: 'Powered by rockets',
  title: 'Powered by rockets: stages and cousins',
  subtitle: 'The push comes from a rocket. The same physics lifts sounding rockets and satellites.',
  view: VIEWS.stack,
  learn: `<p>The short push at the start of a ballistic flight comes from a <b>rocket</b>. A rocket throws hot gas out of its back, and the gas pushes the rocket forwards, even in empty space. How much speed that buys is set by the <b>rocket equation</b>, and how a rocket pushes is all in ${link('rocketclear', 'RocketClear')}, which this chapter borrows from.</p>
    <p>Big rockets are built in <b>stages</b> stacked on top of each other. Each stage has its own <b>engine</b>. When the bottom stage is empty it falls away, so the rest of the rocket does not carry its dead weight, and the next engine takes over. At the top sits the <b>payload section</b>: whatever the rocket is carrying.</p>
    <p>Because a ballistic missile and a space rocket are both rockets, they share the same physics. A <b>sounding rocket</b> goes almost straight up to study the high air and falls back. A <b>satellite launcher</b> tips over and gets going sideways fast enough to <b>orbit</b>. A ballistic path sits in between: up, over, and back down. Many countries' space programmes grew out of rocketry, and India's began with a small sounding rocket at <b>Thumba</b> in Kerala on <b>21 November 1963</b>.</p>
    <p class="tip"><b>Try it:</b> drag the flight slider and watch each stage drop away. Then switch to the three cousins and highlight each path.</p>`,
  terms: [
    { t: 'Stage', d: 'One section of a rocket with its own engine, dropped when it is empty.' },
    { t: 'Engine', d: 'The part at the bottom of each stage that throws hot gas out to push the rocket.' },
    { t: 'Payload section', d: 'The top part of a rocket that carries whatever the rocket is for.' },
    { t: 'Sounding rocket', d: 'A small rocket that flies up to study the upper air and space, then falls back without orbiting.' },
    { t: 'Satellite launcher', d: 'A rocket that reaches orbit speed sideways so its payload keeps falling round the Earth.' },
  ],
  defaults: { focus: 'stack', explode: 0, seq: 0, path: 'all' },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'stack', label: 'The stages' }, { v: 'cousins', label: 'Three cousins' }] },
    { key: 'explode', type: 'range', label: 'Take it apart', min: 0, max: 1, step: 0.01, ends: ['together', 'apart'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'seq', type: 'range', label: 'Flight: staging', min: 0, max: 1, step: 0.005, ends: ['lift-off', 'coasting'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'path', type: 'seg', label: 'Three cousins: highlight', options: [{ v: 'all', label: 'All' }, { v: 'sounding', label: 'Sounding' }, { v: 'ballistic', label: 'Ballistic' }, { v: 'orbit', label: 'Orbit' }] },
  ],
  onChange(s, key) {
    if (key === 'explode' || key === 'seq') s.focus = 'stack';
    if (key === 'path') s.focus = 'cousins';
    if (key === 'explode' && s.explode > 0) s.seq = 0;
    if (key === 'seq' && s.seq > 0) s.explode = 0;
  },
  quiz: [
    { q: 'Why is a big rocket built in stages?', options: ['To look taller', 'So empty stages can be dropped and the rest carries less dead weight', 'So it can turn corners', 'Because one engine is too loud'], answer: 1, why: 'Once a stage is empty, carrying it would waste push. Dropping it leaves a lighter rocket for the next engine to speed up.' },
    { q: 'What do a satellite launcher and a ballistic missile have in common?', options: ['Nothing at all', 'Both are rockets that use the same physics of pushing gas out', 'Both stay in orbit', 'Both fly with wings'], answer: 1, why: 'Both are rockets. The difference is the path: one reaches orbit speed sideways, the other coasts back to Earth on an arc.' },
    { q: 'What does a sounding rocket do?', options: ['Carries a satellite to orbit', 'Flies up to study the high air and then falls back', 'Makes a loud sound for ships', 'Lands on the Moon'], answer: 1, why: 'Sounding rockets, like the first one launched from Thumba in 1963, go up, take measurements and come back down.' },
  ],
  reel: [
    { ms: 5600, caption: 'The push comes from a rocket built in stages: each one drops away when it is empty.', set: { focus: 'stack', explode: 0 }, anim: { seq: [0, 1] }, view: VIEWS.stack, spin: 0.3 },
  ],

  build({ stage }) {
    frameShift(stage, 0.1, -0.06);
    // ---------------------------------------------------------------- the stack
    const gStack = new THREE.Group(); stage.root.add(gStack);
    const R = makeGenericRocket(); gStack.add(R.root);
    const P = R.parts;
    const L = (t, obj, pos, cls) => stage.label(t, pos, obj, cls);
    L('Payload section', P.payload, [0.75, 5.8, 0], 'hot');
    L('Stage', P.stage2, [0.7, 4.2, 0]);
    L('Stage', P.stage1, [0.75, 1.8, 0]);
    L('Engine', P.engine1, [0.75, 0.15, 0]);
    const lE2 = L('Engine', P.engine2, [0.6, 3.2, 0]);
    let flameT = 0, ex = 0;

    // ---------------------------------------------------------------- the cousins
    const gCous = new THREE.Group(); stage.root.add(gCous);
    const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(3, 6, 8); gCous.add(sun);
    const globe = makeGlobe(stage, ER, { atmos: 0.05 });
    gCous.add(globe.group);
    const lines = {};
    const map = (p) => { const r = Math.hypot(p.x, p.y), th = Math.atan2(p.x, p.y), rr = ER + (r - RE) * S * EX; return new THREE.Vector3(rr * Math.sin(th), rr * Math.cos(th), 0); };
    Object.entries(PATHS).forEach(([k, d]) => {
      const res = fly(d.v, d.ang, d.h0 || 0);
      let pts = res.pts.map(map);
      if (k === 'orbit') {
        // the launcher's climb (schematic) joined to the orbit it reaches
        const climb = Array.from({ length: 30 }, (_, i) => { const u = i / 29, th = -0.5 + 0.5 * u, rr = ER + (250e3 * S * EX) * Math.sin(u * Math.PI / 2); return new THREE.Vector3(rr * Math.sin(th), rr * Math.cos(th), 0); });
        const rot = (v) => v.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), 0);
        pts = [...climb, ...pts.map(rot)];
      } else {
        pts = pts.map((v) => v.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), k === 'sounding' ? 0.35 : 0.12));
      }
      const line = fatLine(stage, pts, { color: d.color, width: 3.5 }); gCous.add(line);
      const top = pts.reduce((a, b) => (b.y > a.y ? b : a), pts[0]);
      const lbl = stage.label(d.label, k === 'orbit' ? [-3.3, 1.4, 0] : k === 'sounding' ? [top.x - 0.9, top.y + 0.45, 0] : [top.x + 0.9, top.y + 0.3, 0], gCous);
      lines[k] = { line, lbl };
    });
    stage.label('Earth (heights drawn 4× taller)', [0, -ER - 0.35, 0.3], gCous);

    let focus = '';
    return {
      update(dt, s) {
        dt = Math.max(0, dt); flameT += dt;
        if (s.focus !== focus) {
          focus = s.focus; gStack.visible = focus === 'stack'; gCous.visible = focus === 'cousins';
          stage.floor.visible = focus === 'stack';
          if (!document.body.classList.contains('gb-reel')) stage.setView(VIEWS[focus].pos, VIEWS[focus].target, 1);
        }
        if (focus === 'stack') {
          ex += (s.explode - ex) * (1 - Math.exp(-6 * dt));
          const q = clamp(s.seq, 0, 1);
          // Staging: stage 1 burns to 0.35, drops 0.35–0.5; stage 2 burns to 0.72, drops 0.72–0.85; then coast.
          const drop1 = smooth((q - 0.35) / 0.25), drop2 = smooth((q - 0.72) / 0.22);
          const H = (o) => o.userData.home;
          P.payload.position.set(0, H(P.payload).y + ex * 2.0, 0);
          P.stage2.position.set(0, H(P.stage2).y + ex * 1.0, 0);
          P.engine2.position.set(0, H(P.engine2).y + ex * 0.8, 0);
          P.engine1.position.set(0, H(P.engine1).y - ex * 0.9, 0);
          // dropped stages fall and tumble away below
          P.stage1.position.set(-drop1 * 1.2, H(P.stage1).y - drop1 * 3.2, 0); P.stage1.rotation.z = drop1 * 0.5;
          P.engine1.position.x = -drop1 * 1.2; P.engine1.position.y -= drop1 * 3.2; P.engine1.rotation.z = drop1 * 0.5;
          P.stage2.position.x = -drop2 * 1.0; P.stage2.position.y -= drop2 * 2.6; P.stage2.rotation.z = drop2 * 0.4;
          P.engine2.position.x = -drop2 * 1.0; P.engine2.position.y -= drop2 * 2.6; P.engine2.rotation.z = drop2 * 0.4;
          P.stage1.visible = P.engine1.visible = drop1 < 0.98;
          P.stage2.visible = P.engine2.visible = drop2 < 0.98;
          const burn1 = q > 0.01 && q < 0.35, burn2 = q > 0.5 && q < 0.72;
          R.setFlame(burn1 || burn2 ? 1 : 0, flameT, burn1 ? 0 : 3.05 + ex * 0.8);
          lE2.visible = ex > 0.3 || drop1 > 0.5;
        } else {
          Object.entries(lines).forEach(([k, o]) => {
            const on = s.path === 'all' || s.path === k;
            o.line.material.opacity = on ? 1 : 0.15; o.lbl.visible = on;
          });
        }
      },
      readout: (s) => {
        if (s.focus === 'cousins') {
          const txt = { all: 'Three paths, one physics', sounding: 'Sounding rocket', ballistic: 'Ballistic path', orbit: 'Satellite launcher' }[s.path];
          const why = { all: 'Same rocket push and gravity; only the direction and speed differ.', sounding: 'Up almost vertically, measures the high air, falls back.', ballistic: 'Pushed briefly, then coasts on a free-fall arc back to Earth.', orbit: 'Tips over and goes sideways fast enough that it never comes down.' }[s.path];
          return `<div class="big">${txt}</div><p style="margin:6px 0 0;line-height:1.45">${why}</p>
            ${note('Paths computed with the vacuum model of chapter 2, heights drawn 4× taller. A picture of the idea, with no numbers on purpose.')}`;
        }
        const q = s.seq;
        const now = q < 0.01 ? 'On the pad' : q < 0.35 ? 'Stage 1 engine burning' : q < 0.5 ? 'Stage 1 empty: it drops away' : q < 0.72 ? 'Stage 2 engine burning' : q < 0.85 ? 'Stage 2 empty: it drops away' : 'Engines off: coasting';
        const left = q < 0.5 ? 2 : q < 0.85 ? 1 : 0;
        return `<div class="big">${now}</div>
          <div class="row"><span>Stages still attached</span><b>${left}</b></div>
          <div class="row"><span>Pushed by</span><b>${/burning/.test(now) ? 'the engine + gravity' : q < 0.01 ? '–' : 'gravity only'}</b></div>
          ${note('A generic shape, not any real rocket. How the push works, and the rocket equation, are in RocketClear.')}`;
      },
      dispose() { stage.floor.visible = true; stage.setShift(0, 0); },
    };
  },
};
