// Chapter 1: what "ballistic" means. Two pictures of one idea: a short push, then free fall.
// 1. A thrown ball: 10 m/s at 40° from a 1.9 m release height, g = 9.81 m/s², no air. The push from the
//    hand lasts about a tenth of a second (illustrative). Horizontal speed stays the same; vertical
//    speed falls by 9.81 m/s every second. Time in the air from h = h0 + vy t − ½ g t².
// 2. A rocket's three phases, drawn as a schematic (not to scale, no numbers): boost while the
//    engine burns, a long coast in free fall above the air, and re-entry into the air.
//    The Arms Control Association puts it this way: ballistic missiles "are powered by rockets
//    initially but then they follow an unpowered, free-falling trajectory" (ACA factsheet
//    "Worldwide Ballistic Missile Inventories", reviewed August 2023).
import { THREE, M, arrow, beam, sphere, box, clamp, smooth } from '../kit.js';
import { makeGenericRocket, fatLine, note, link, frameShift } from '../ballistic.js';

const G = 9.81, V0 = 10, ANG = (40 * Math.PI) / 180, H0 = 1.9;
const VX = V0 * Math.cos(ANG), VY = V0 * Math.sin(ANG);
const T_AIR = (VY + Math.sqrt(VY * VY + 2 * G * H0)) / G;          // ≈ 1.58 s
const SC = 0.4;                                                       // 1 m = 0.4 units, person and path to one scale
const XB = -2.4;                                                      // release point x

// Schematic arc for the rocket: a big, flat Earth patch and a smooth path. Illustrative only.
const ER = 40, EC = new THREE.Vector3(0, -ER, 0);
const TH0 = -0.17, TH1 = 0.17, PEAK = 3.2;
const BOOST = 0.12, REENTRY = 0.86;          // fractions of the path (schematic)
function arcPoint(u) {
  const th = TH0 + (TH1 - TH0) * u;
  const hh = PEAK * Math.pow(Math.sin(Math.PI * clamp(u, 0, 1)), 0.75);   // steep at both ends
  const r = ER + 0.02 + hh;
  return new THREE.Vector3(r * Math.sin(th), r * Math.cos(th) - ER, 0);
}

const VIEWS = {
  ball: { pos: [0.6, 2.0, 7.4], target: [0.35, 0.85, 0] },
  rocket: { pos: [0.6, 4.0, 15.5], target: [0.3, 1.6, 0] },
};

export default {
  id: 'ballistic',
  short: 'What “ballistic” means',
  title: 'What “ballistic” means',
  subtitle: 'One short push, then nothing but gravity: a thrown ball, a cannon shell, and a rocket that burns for a few minutes.',
  view: VIEWS.ball,
  learn: `<p>Throw a ball. Your hand pushes it for a fraction of a second. After it leaves your fingers, nothing pushes it any more: only <b>gravity</b> pulls it down (and a little air holds it back). It flies on a smooth curved path and lands. That path is called <b>ballistic</b>, from an old Greek word for throwing. A cannon shell does the same: one big push in the barrel, then free fall.</p>
    <p>Watch the arrows. The <b>sideways speed</b> stays the same all the way. The <b>up-and-down speed</b> shrinks, reaches zero at the top, then grows downwards, because gravity changes it by about 9.8 m/s every second.</p>
    <p>A <b>ballistic missile</b> is a rocket that works the same way, just much bigger and faster. Its engine burns only for the first few minutes, the <b>boost</b> phase. Then it <b>coasts</b> on a free-fall arc, high above most of the air, steered by nothing but gravity. Finally it falls back into the air, the <b>re-entry</b>. Three phases: push, coast, fall back.</p>
    <p>Missiles are only one use of rockets. The same physics carries sounding rockets that study the sky and launchers that put satellites in orbit (${link('rocketclear', 'RocketClear')} explains how a rocket pushes).</p>
    <p class="tip"><b>Try it:</b> drag the timeline slowly through the throw and watch which arrows change. Then switch to the rocket and find where the engine stops.</p>`,
  terms: [
    { t: 'Ballistic', d: 'Flying under gravity alone after the push has ended, like a thrown ball.' },
    { t: 'Free fall', d: 'Moving with only gravity acting on you. A ball is in free fall from the moment it leaves your hand.' },
    { t: 'Boost phase', d: 'The first part of a rocket’s flight, while its engine is burning.' },
    { t: 'Coast', d: 'The long middle part, after the engine stops, when the rocket just falls along its arc.' },
    { t: 'Re-entry', d: 'Coming back down into the thick air from high above it.' },
  ],
  defaults: { focus: 'ball', at: 0, playing: true, arrows: true },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'ball', label: 'A thrown ball' }, { v: 'rocket', label: 'A rocket’s three phases' }] },
    { key: 'at', type: 'range', label: 'Timeline', min: 0, max: 1, step: 0.005, ends: ['start', 'end'], fmt: (v) => Math.round(v * 100) + '%', hint: 'Dragging it pauses the replay.' },
    { key: 'playing', type: 'toggle', label: 'Replay on its own' },
    { key: 'arrows', type: 'toggle', label: 'Show the arrows' },
  ],
  onChange(s, key) { if (key === 'at') s.playing = false; },
  quiz: [
    { q: 'After a thrown ball leaves your hand, what is pushing it forwards?', options: ['Your hand, still', 'Nothing: only gravity (and a little air) acts on it', 'A force stored inside the ball', 'The air behind it'], answer: 1, why: 'Once it leaves your hand nothing pushes it. It keeps its sideways speed and gravity bends its path down. That is what ballistic means.' },
    { q: 'Which part of a thrown ball’s speed stays the same (ignoring air)?', options: ['The sideways part', 'The up-and-down part', 'Both', 'Neither'], answer: 0, why: 'Gravity only pulls downwards, so it changes only the up-and-down speed. The sideways speed stays constant.' },
    { q: 'What are the three phases of a ballistic missile’s flight?', options: ['Take-off, cruise, landing', 'Boost, coast (midcourse) and re-entry', 'Lift, hover, glide', 'Climb, orbit, escape'], answer: 1, why: 'The engine burns during boost, the rocket coasts in free fall, then it falls back into the air at re-entry.' },
  ],
  reel: [
    { ms: 5400, caption: '“Ballistic” means one short push, then nothing but gravity, like a thrown ball.', set: { focus: 'ball', playing: false, arrows: true }, anim: { at: [0, 1] }, view: VIEWS.ball, spin: 0 },
    { ms: 6000, caption: 'A ballistic missile is a rocket that burns for a few minutes, then coasts on a free-fall arc.', set: { focus: 'rocket', playing: false, arrows: true }, anim: { at: [0, 1] }, view: VIEWS.rocket, spin: 0 },
  ],

  build({ stage }) {
    // ---------------------------------------------------------------- the thrown ball
    const reelMode = document.body.classList.contains('gb-reel');
    frameShift(stage, 0.06, -0.1);
    const gBall = new THREE.Group(); stage.root.add(gBall);
    const skinM = M.matte(0x8a6b55), shirt = M.matte(0x3d6fa8), trous = M.matte(0x2b2f3a);
    const m = (v) => v * SC;                       // metres to units
    const PX = XB - m(0.69);                       // the thrower stands behind the release point
    const person = new THREE.Group();
    person.add(beam([PX - m(0.1), 0, 0], [PX - m(0.1), m(0.9), 0], m(0.07), trous));
    person.add(beam([PX + m(0.1), 0, 0], [PX + m(0.1), m(0.9), 0], m(0.07), trous));
    const torso = box(m(0.4), m(0.6), m(0.24), shirt); torso.position.set(PX, m(1.2), 0); person.add(torso);
    const head = sphere(m(0.12), skinM); head.position.set(PX, m(1.68), 0); person.add(head);
    person.add(beam([PX - m(0.2), m(1.45), 0], [PX - m(0.35), m(1.0), 0], m(0.045), skinM));
    const arm = new THREE.Group(); arm.position.set(XB - m(0.62 * Math.cos(0.6)), m(H0 - 0.62 * Math.sin(0.6)), 0.0); person.add(arm);
    arm.add(beam([0, 0, 0], [m(0.62), 0, 0], m(0.045), skinM));
    gBall.add(person);
    const ball = sphere(m(0.11), M.plastic(0xc0392b, { roughness: 0.4 })); gBall.add(ball);
    const yAt = (t) => (H0 + VY * t - 0.5 * G * t * t) * SC;
    const ballPts = [];
    for (let i = 0; i <= 80; i++) { const t = (i / 80) * T_AIR; ballPts.push(new THREE.Vector3(XB + VX * t * SC, yAt(t), 0)); }
    const lift = 0;
    const full = fatLine(stage, ballPts, { color: 0xffb547, width: 2, opacity: 0.35, dashed: true, dash: 0.12, gap: 0.09 }); gBall.add(full);
    const trailB = fatLine(stage, [], { color: 0xffb547, width: 3.5 }); gBall.add(trailB);
    const aX = arrow(0x8ef0ff, 1, 0.16, 0.035), aY = arrow(0x5ce1a9, 1, 0.16, 0.035), aG = arrow(0xff7a59, 0.7, 0.16, 0.035);
    aX.rotation.z = -Math.PI / 2;
    gBall.add(aX, aY, aG);
    const lPush = stage.label('Push: the hand, for about a tenth of a second', [XB - 0.3, 1.45, 0], gBall, 'hot');
    const lFree = stage.label('Free fall: gravity only', [XB + VX * T_AIR * SC * 0.5, yAt(VY / G) + 0.6, 0], gBall);
    const lX = stage.label('Sideways speed: stays the same', [0, 0, 0], gBall);
    const lY = stage.label('Up-and-down speed: changes', [0, 0, 0], gBall);
    const lG = stage.label('Gravity', [0, 0, 0], gBall);

    // ---------------------------------------------------------------- the rocket's three phases
    const gRocket = new THREE.Group(); stage.root.add(gRocket);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(ER, 128, 64, 0, Math.PI * 2, 0, 0.3), M.plastic(0x23527a, { roughness: 0.9 }));
    earth.position.copy(EC); gRocket.add(earth);
    const air = new THREE.Mesh(new THREE.SphereGeometry(ER + 0.55, 128, 64, 0, Math.PI * 2, 0, 0.3), M.ghost(0x7fc8ff, 0.14, { side: THREE.DoubleSide }));
    air.position.copy(EC); gRocket.add(air);
    const N = 160, arcPts = Array.from({ length: N + 1 }, (_, i) => arcPoint(i / N));
    const seg = (a, b) => arcPts.slice(Math.round(a * N), Math.round(b * N) + 1);
    gRocket.add(fatLine(stage, seg(0, BOOST), { color: 0xffb547, width: 4 }));
    gRocket.add(fatLine(stage, seg(BOOST, REENTRY), { color: 0x8ef0ff, width: 3, dashed: true, dash: 0.25, gap: 0.15 }));
    gRocket.add(fatLine(stage, seg(REENTRY, 1), { color: 0xff7a59, width: 4 }));
    const R = makeGenericRocket(); R.root.scale.setScalar(0.09); gRocket.add(R.root);
    const head2 = sphere(0.09, M.glow(0xffd27a)); gRocket.add(head2);
    const P = (u) => arcPoint(u);
    stage.label('1. Boost: the engine burns for a few minutes', P(0.05).clone().add(new THREE.Vector3(-1.2, 0.9, 0)), gRocket, 'hot');
    stage.label('2. Coast: free fall above most of the air', P(0.5).clone().add(new THREE.Vector3(0, 0.55, 0)), gRocket);
    stage.label('3. Re-entry: back into the thick air', P(0.93).clone().add(new THREE.Vector3(1.3, 0.6, 0)), gRocket);
    stage.label('The air (thin blue layer)', [-3.6, 0.15, 0.5], gRocket);
    stage.label('Not to scale: a picture of the idea', [0, -0.5, 0.6], gRocket);

    let focus = '', loop = 0, flameT = 0;
    const setFocus = (f, s) => {
      focus = f; gBall.visible = f === 'ball'; gRocket.visible = f === 'rocket';
      stage.floor.visible = f === 'ball';
      if (!document.body.classList.contains('gb-reel')) stage.setView(VIEWS[f].pos, VIEWS[f].target, 1);
      if (s.playing) loop = 0;
    };

    let phase = '', tNow = 0;
    return {
      update(dt, s) {
        dt = Math.max(0, dt); flameT += dt;
        if (s.focus !== focus) setFocus(s.focus, s);
        if (s.playing) {
          loop += dt / (focus === 'ball' ? 3.2 : 7);
          if (loop > 1.25) loop = 0;
          s.at = clamp(loop, 0, 1);
        }
        const u = clamp(s.at, 0, 1);
        if (focus === 'ball') {
          // u in [0, 0.12] is the push; after that, free fall over T_AIR.
          const pushK = clamp(u / 0.12, 0, 1);
          const t = u <= 0.12 ? 0 : ((u - 0.12) / 0.88) * T_AIR;
          tNow = t;
          arm.rotation.z = -2.4 + 3.0 * smooth(pushK);
          if (u <= 0.12) {
            const hand = new THREE.Vector3(m(0.62), 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), arm.rotation.z).add(arm.position);
            ball.position.set(hand.x, hand.y, hand.z);
            trailB.setPoints([]);
            phase = 'push';
          } else {
            const x = XB + VX * t * SC, y = yAt(t) + lift;
            ball.position.set(x, Math.max(m(0.11), y), 0);
            const k = Math.round((t / T_AIR) * 80);
            trailB.setPoints([...ballPts.slice(0, k + 1), ball.position.clone()]);
            phase = 'free';
          }
          const vy = u <= 0.12 ? VY * pushK : VY - G * t, vx = u <= 0.12 ? VX * pushK : VX;
          const sA = 0.075;
          aX.set(vx * sA); aX.position.copy(ball.position);
          aY.set(Math.abs(vy) * sA); aY.position.copy(ball.position); aY.rotation.z = vy >= 0 ? 0 : Math.PI;
          aG.set(0.75); aG.position.copy(ball.position); aG.rotation.z = Math.PI; aG.position.x -= 0.25;
          aX.visible = s.arrows && vx > 0.3; aY.visible = s.arrows && Math.abs(vy) > 0.4; aG.visible = s.arrows;
          lX.position.copy(ball.position).add(new THREE.Vector3(VX * sA + 0.2, 0.15, 0)); lX.visible = s.arrows && u > 0.12;
          lY.position.copy(ball.position).add(new THREE.Vector3(0.1, vy >= 0 ? Math.abs(vy) * sA + 0.25 : -Math.abs(vy) * sA - 0.25, 0)); lY.visible = s.arrows && u > 0.12 && Math.abs(vy) > 0.4;
          lG.position.copy(ball.position).add(new THREE.Vector3(-0.55, -0.6, 0)); lG.visible = s.arrows;
          lPush.visible = u <= 0.2; lFree.visible = u > 0.12;
        } else {
          const p = P(u), q = P(Math.min(1, u + 0.004));
          R.root.position.copy(p);
          const dir = q.clone().sub(p).normalize();
          R.root.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          head2.position.copy(p);
          const burning = u < BOOST;
          R.setFlame(burning ? 1 : 0, flameT);
          R.root.visible = u < BOOST + 0.02;             // after boost only the generic payload section coasts on
          head2.visible = !R.root.visible;
          head2.material.color.setHex(u > REENTRY ? 0xff7a3c : 0xffd27a);
          head2.scale.setScalar(u > REENTRY ? 1.6 + 0.3 * Math.sin(flameT * 30) : 1);
          phase = u < BOOST ? 'boost' : u < REENTRY ? 'coast' : 'reentry';
        }
      },
      readout: (s) => {
        if (s.focus === 'ball') {
          const t = tNow, vy = VY - G * t;
          return `<div class="big">${phase === 'push' ? 'Push: the hand is throwing' : 'Free fall: gravity only'}</div>
            <div class="row"><span>Forces on the ball</span><b>${phase === 'push' ? 'hand + gravity' : 'gravity (and a little air)'}</b></div>
            <div class="row"><span>Sideways speed</span><b>${VX.toFixed(1)} m/s</b></div>
            <div class="row"><span>Up-and-down speed</span><b>${phase === 'push' ? '–' : (vy >= 0 ? '+' : '−') + Math.abs(vy).toFixed(1) + ' m/s'}</b></div>
            <div class="row"><span>Time since release</span><b>${t.toFixed(2)} s of ${T_AIR.toFixed(2)} s</b></div>
            ${note('A ball thrown at 10 m/s, 40° up, from 1.9 m. Air is left out. Gravity takes 9.8 m/s off the upward speed every second.')}`;
        }
        const txt = { boost: ['Boost: engine burning', 'thrust + gravity + air'], coast: ['Coast: free fall', 'gravity only (almost no air)'], reentry: ['Re-entry: back into the air', 'gravity + air drag and heating'] }[phase] || ['', ''];
        return `<div class="big">${txt[0]}</div>
          <div class="row"><span>Forces</span><b>${txt[1]}</b></div>
          <div class="row"><span>Engine</span><b>${phase === 'boost' ? 'on, for a few minutes' : 'off'}</b></div>
          ${note('A schematic, not to scale and with no numbers. The coast is the longest part of the flight, and it is the same free fall as a thrown ball.')}`;
      },
      dispose() { stage.floor.visible = true; stage.setShift(0, 0); },
    };
  },
};
