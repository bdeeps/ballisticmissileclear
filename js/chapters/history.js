// Chapter 6: history, dated and neutral. Generic shapes only (no named missile is modelled, and no
// sizes or capabilities are given). Sources are listed in history.json; key ones:
// - Fire arrows: gunpowder rockets in China by the 13th century (the siege of Kaifeng, 1232, is often
//   cited; attributed).
// - Mysore rockets: iron-cased rockets used by Hyder Ali's and Tipu Sultan's armies, 1780s–1790s
//   (RocketClear covers them).
// - Newton: Principia 1687; the cannon drawing printed in 1728.
// - V-2: first used in war in September 1944. Smithsonian National Air and Space Museum (Neufeld, 2020):
//   20,000–25,000 detainees died in the Mittelbau camp system; at least 10,000 deaths attributable to
//   V-2 production at the Mittelwerk; "a bit over 5,000 Allied deaths" from the attacks.
// - R-7 and Sputnik (4 October 1957); Cuban Missile Crisis (October 1962); Thumba (21 November 1963);
//   IGMDP sanctioned in July 1983 with A. P. J. Abdul Kalam leading it, declared complete in January
//   2008 (DRDO, as reported); Kalam was President of India 2002–2007.
import { THREE, M, latheX, beam, clamp } from '../kit.js';
import { makeGenericRocket, fatLine, note, link, frameShift, first, narrow } from '../ballistic.js';

const EV = [
  { y: 1232, label: 'c. 1232', name: 'Fire arrows in China', text: 'Gunpowder rockets, arrows with a tube of powder tied on, were used in China by the 13th century. The siege of Kaifeng in 1232 is often given as an early example.' },
  { y: 1780, label: '1780s–1790s', name: 'Mysore rockets', text: 'The armies of Hyder Ali and Tipu Sultan of Mysore used rockets with iron cases, which flew further than paper or bamboo ones. Captured examples inspired Britain’s Congreve rockets. See RocketClear.' },
  { y: 1687, label: '1687', name: 'Newton explains the arc', text: 'Isaac Newton’s Principia showed that one law of gravity explains a falling apple, a thrown stone and the Moon’s orbit. His cannon-on-a-mountain picture came from that work.' },
  { y: 1926, label: '16 March 1926', name: 'The first liquid-fuelled rocket', text: 'Robert Goddard flew the first liquid-fuelled rocket at Auburn, Massachusetts. It flew for about 2.5 seconds.' },
  { y: 1944, label: 'September 1944', name: 'The V-2, and the people who built it', text: 'Germany’s V-2 was the first long-range ballistic missile used in war. It was built largely by concentration-camp prisoners. The Smithsonian estimates that at least 10,000 died producing it at the Mittelwerk factory, about twice as many as the roughly 5,000 people killed by its attacks.' },
  { y: 1957, label: '4 October 1957', name: 'The R-7 and Sputnik', text: 'The Soviet R-7, built as a long-range missile, launched Sputnik, the first artificial satellite. The space race had begun, and many early space rockets grew out of missile programmes.' },
  { y: 1962, label: 'October 1962', name: 'The Cuban Missile Crisis', text: 'For thirteen days the United States and the Soviet Union faced each other over missiles placed in Cuba. It ended with an agreement to remove them, and in 1963 the two sides set up a direct hotline.' },
  { y: 1963, label: '21 November 1963', name: 'Thumba, India’s first rocket launch', text: 'A small sounding rocket was launched from Thumba in Kerala, the start of India’s space programme under Vikram Sarabhai.' },
  { y: 1983, label: 'July 1983', name: 'India’s guided missile programme', text: 'The Integrated Guided Missile Development Programme was sanctioned in 1983, led by A. P. J. Abdul Kalam at the DRDO laboratories in Hyderabad. The DRDO declared it complete in 2008. Kalam later served as President of India from 2002 to 2007.' },
  { y: 1987, label: '1987–2026', name: 'Arms control', text: 'The INF Treaty (1987–2019), the Missile Technology Control Regime (1987, India a member since 2016) and New START (2010–2026): see the previous chapter.' },
];
EV.sort((a, b) => a.y - b.y);
const xOf = (i) => -6 + (12 * i) / (EV.length - 1);

export default {
  id: 'history',
  short: 'History',
  title: 'From fire arrows to the space race',
  subtitle: 'Eight hundred years of rockets, used for war and for science, with their human cost.',
  view: { pos: [-4.4, 2.6, 6.6], target: [-5.6, 1.1, 0] },
  learn: `<p>Rockets began in <b>China</b>: by the 13th century, arrows carrying a tube of gunpowder were used in battle. In the 1780s and 1790s the armies of <b>Mysore</b> fired iron-cased rockets that flew further than any before, and captured ones inspired Britain’s Congreve rockets (${link('rocketclear', 'RocketClear')} tells that story).</p>
    <p>In <b>1687</b> Newton explained why anything thrown follows an arc. In <b>1926</b> Robert Goddard flew the first liquid-fuelled rocket. In <b>September 1944</b> the <b>V-2</b> became the first long-range ballistic missile used in war. It was built largely by concentration-camp prisoners at the <b>Mittelwerk</b>: the Smithsonian estimates that at least 10,000 of them died, about twice as many as were killed by its attacks.</p>
    <p>On <b>4 October 1957</b> a Soviet R-7 rocket, designed as a long-range missile, launched <b>Sputnik</b>, and the space race began. In <b>October 1962</b> the <b>Cuban Missile Crisis</b> brought the United States and the Soviet Union close to war for thirteen days, before both stepped back.</p>
    <p>India's space programme began with a sounding rocket at <b>Thumba</b> on <b>21 November 1963</b>. In <b>1983</b> the government started the <b>Integrated Guided Missile Development Programme</b>, led by <b>A. P. J. Abdul Kalam</b>, who had led India's first satellite launcher; the DRDO declared it complete in 2008. Kalam went on to serve as <b>President of India</b> from 2002 to 2007.</p>
    <p class="tip"><b>Try it:</b> drag through the centuries and read each moment. The full timeline, with sources, is on the History page.</p>`,
  terms: [
    { t: 'Fire arrow', d: 'An early Chinese rocket: an arrow with a tube of gunpowder tied to it.' },
    { t: 'Space race', d: 'The rivalry between the United States and the Soviet Union to reach space and the Moon, from 1957.' },
    { t: 'Forced labour', d: 'Work people are made to do against their will. The V-2 was built largely by concentration-camp prisoners.' },
    { t: 'IGMDP', d: 'India’s Integrated Guided Missile Development Programme, begun in 1983.' },
  ],
  defaults: { at: 0 },
  controls: [
    { key: 'at', type: 'range', label: 'Moment', min: 0, max: EV.length - 1, step: 1, fmt: (v) => EV[Math.round(v)].label },
  ],
  quiz: [
    { q: 'Where were rockets first used?', options: ['In Germany in 1944', 'In China, by the 13th century', 'In the United States in 1926', 'In Russia in 1957'], answer: 1, why: 'Gunpowder fire arrows were used in China by the 13th century, centuries before modern rockets.' },
    { q: 'What does the Smithsonian say about the people who built the V-2?', options: ['They were all volunteers', 'At least 10,000 prisoners died producing it, about twice as many as its attacks killed', 'Nobody was harmed', 'It was built by robots'], answer: 1, why: 'Concentration-camp prisoners were forced to build it in terrible conditions at the Mittelwerk.' },
    { q: 'Who led India’s Integrated Guided Missile Development Programme from 1983?', options: ['Vikram Sarabhai', 'A. P. J. Abdul Kalam', 'Homi Bhabha', 'Satish Dhawan'], answer: 1, why: 'A. P. J. Abdul Kalam led it. He later became President of India (2002–2007).' },
  ],
  reel: [
    { ms: 5600, caption: 'From Chinese fire arrows to Sputnik, rockets have carried both weapons and science.', set: { at: 0 }, anim: { at: [0, EV.length - 1] }, spin: 0 },
  ],

  build({ stage }) {
    frameShift(stage, 0.08, -0.08);
    const root = new THREE.Group(); stage.root.add(root);
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.12, 1.4), M.matte(0x252a38)); plinth.position.y = 0.06; root.add(plinth);
    root.add(fatLine(stage, [new THREE.Vector3(-6.6, 0.13, 0.65), new THREE.Vector3(6.6, 0.13, 0.65)], { color: 0x4a5268, width: 1.5 }));
    const wood = M.matte(0x8a6a44), iron = M.metal(0x5d636e, { roughness: 0.5 }), paper = M.matte(0xd8cfbf);
    // Generic little objects for each moment. No real dimensions.
    const obj = (i) => {
      const e = EV[i], g = new THREE.Group();
      if (e.y === 1232) { g.add(beam([0, 0.2, 0], [0, 1.6, 0], 0.02, wood)); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12), paper); t.position.y = 1.25; g.add(t); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 8), iron); tip.position.y = 1.67; g.add(tip); }
      else if (e.y === 1780) { g.add(beam([0, 0.2, 0], [0, 1.7, 0], 0.025, wood)); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 14), iron); t.position.y = 1.5; g.add(t); }
      else if (e.y === 1687) { const ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), M.metal(0x3a3f4b)); ball.position.set(0.25, 1.0, 0); g.add(ball); const pts = Array.from({ length: 30 }, (_, k) => { const u = k / 29; return new THREE.Vector3(-0.45 + u * 0.7, 0.4 + 0.9 * u * (1.4 - u), 0); }); g.add(fatLine(stage, pts, { color: 0xffb547, width: 2, dashed: true, dash: 0.06, gap: 0.04 })); }
      else if (e.y === 1957) { const R = makeGenericRocket(); R.root.scale.setScalar(0.22); R.root.position.y = 0.15; g.add(R.root); const sat = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), M.metal(0xd0d5de)); sat.position.set(0.45, 2.0, 0); g.add(sat); [0.6, 1.1, 1.6].forEach((a) => g.add(beam([0.45, 2.0, 0], [0.45 + 0.35 * Math.cos(a + 2), 2.0 + 0.35 * Math.sin(a + 2) - 0.2, 0], 0.006, M.metal(0xd0d5de)))); }
      else if (e.y === 1962) { const ph = latheX([[0, 0.18], [0.12, 0.2], [0.2, 0.12]], M.plastic(0xb03a2e)); ph.rotation.z = Math.PI / 2; ph.position.y = 0.2; g.add(ph); g.add(beam([0, 0.42, 0], [0, 0.55, 0], 0.03, M.plastic(0x222222))); const hand = beam([-0.25, 0.58, 0], [0.25, 0.58, 0], 0.05, M.plastic(0x222222)); g.add(hand); }
      else if (e.y === 1987) { const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 16), paper); sc.rotation.z = Math.PI / 2; sc.position.y = 0.35; g.add(sc); const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.5), M.matte(0xece4d4, { side: THREE.DoubleSide })); sheet.position.set(0, 0.55, 0.12); sheet.rotation.x = -0.6; g.add(sheet); }
      else if (e.y === 1983 || e.y === 1963 || e.y === 1926 || e.y === 1944) {
        const R = makeGenericRocket(); R.root.scale.setScalar(e.y === 1926 ? 0.1 : e.y === 1963 ? 0.16 : 0.2); R.root.position.y = 0.15; g.add(R.root);
      }
      g.position.x = xOf(i); root.add(g);
      const lbl = stage.label(`<b>${e.label}</b><br>${e.name}`, [xOf(i), 2.3, 0], root);
      return { g, lbl };
    };
    const items = EV.map((_, i) => obj(i));
    const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.02, 40), M.glow(0xffb547, { transparent: true, opacity: 0.35 }));
    spot.position.y = 0.13; root.add(spot);

    let x = xOf(0), t = 0, lastI = -1;
    const reel = document.body.classList.contains('gb-reel');
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        const i = clamp(Math.round(s.at), 0, EV.length - 1);
        x += (xOf(i) - x) * (1 - Math.exp(-8 * dt));
        spot.position.x = x;
        if (i !== lastI) { if (lastI >= 0 || reel) stage.setView([xOf(i) + 1.6, 2.6, 6.6], [xOf(i) + 0.4, 1.1, 0], 0.9); lastI = i; }
        items.forEach((it, k) => { it.lbl.visible = k === i; it.g.scale.setScalar(k === i ? 1.25 : 1); it.g.rotation.y = k === i ? 0.3 * Math.sin(t * 0.8) : 0; });
      },
      readout: (s) => {
        const e = EV[clamp(Math.round(s.at), 0, EV.length - 1)];
        return `<div class="big">${e.name}</div><div class="row"><span>When</span><b>${e.label}</b></div>
          <p style="margin:6px 0 0;line-height:1.45">${first(e.text)}</p>
          ${narrow() ? '' : note('Generic shapes, not models of any real rocket or missile. Sources on the History page.')}`;
      },
      dispose() { stage.setShift(0, 0); },
    };
  },
};
