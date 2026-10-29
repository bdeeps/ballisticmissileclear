// Chapter 5: the human cost and the treaties. Facts and sources (see the report for which were read
// at the source and which come from search summaries or memory):
// - Hiroshima 6 August 1945, Nagasaki 9 August 1945. UNODA (8 May 2013 event page, a survivor's
//   testimony): "By the end of the year, 140,000 people in Hiroshima and 70,000 in Nagasaki had
//   died." Estimates by the end of 1945 range from 90,000–166,000 (Hiroshima) and 60,000–80,000
//   (Nagasaki) (Encyclopaedia/Wikipedia summary of the estimates). UN Photo essay "The moment the
//   world changed forever" (2024): about 650,000 people survived the attacks.
// - NPT opened for signature 1 July 1968, in force 5 March 1970 (UNODA).
// - INF Treaty signed 8 December 1987; ended 2 August 2019 when the United States withdrew.
// - MTCR set up in April 1987; India joined on 27 June 2016 (MEA, as reported).
// - CTBT opened for signature 24 September 1996; not in force.
// - New START signed 8 April 2010, in force 5 February 2011; Russia suspended its participation in
//   2023; expired 5 February 2026 (French Ministry for Europe and Foreign Affairs, 6 February 2026).
// - India's nuclear doctrine as stated by the Government of India (PIB, 4 January 2003): "Building and
//   maintaining a credible minimum deterrent"; "A posture of 'No First Use': nuclear weapons will only
//   be used in retaliation against a nuclear attack on Indian territory or on Indian forces anywhere";
//   "Non-use of nuclear weapons against non-nuclear weapon states". Quoted without commentary.
import { THREE, M, canvasTexture, latheX, clamp } from '../kit.js';
import { fatLine, note, link, frameShift, first, narrow } from '../ballistic.js';

const Y0 = 1945, Y1 = 2026, X0 = -6, X1 = 6;
const xOf = (y) => X0 + ((y - Y0) / (Y1 - Y0)) * (X1 - X0);
const STATUS = { cost: ['#f4f1ea', 0xf4f1ea], force: ['#5ce1a9', 0x5ce1a9], ended: ['#a8aebf', 0x8a90a0], pending: ['#ffb547', 0xffb547], india: ['#8ef0ff', 0x8ef0ff] };
const EV = [
  { y: 1945, date: '6 and 9 August 1945', name: 'Hiroshima and Nagasaki', st: 'cost', text: 'By the end of 1945 about 140,000 people in Hiroshima and 70,000 in Nagasaki had died, as a UN disarmament page records. These remain the only nuclear weapons ever used in war. Estimates range from about 90,000 to 166,000 in Hiroshima and 60,000 to 80,000 in Nagasaki. Hundreds of thousands of survivors, the hibakusha, lived on with burns, injuries and illness.' },
  { y: 1963, date: '5 August 1963', name: 'Partial Test Ban Treaty', st: 'force', text: 'Bans nuclear test explosions in the air, in space and under water.' },
  { y: 1967, date: '1967', name: 'Outer Space Treaty', st: 'force', text: 'Space is for all countries to explore. No nuclear weapons may be placed in orbit around the Earth.' },
  { y: 1968, date: '1 July 1968 (in force 5 March 1970)', name: 'Nuclear Non-Proliferation Treaty (NPT)', st: 'force', text: 'Aims to stop nuclear weapons spreading, to work towards disarmament, and to share peaceful nuclear technology. India has not joined it.' },
  { y: 1987, date: 'April 1987', name: 'Missile Technology Control Regime (MTCR)', st: 'force', text: 'Not a treaty but a group of countries that agree to control exports of missiles and the technology to build them.' },
  { y: 1987.6, date: '8 December 1987', name: 'INF Treaty', st: 'ended', text: 'The United States and the Soviet Union agreed to destroy all their ground-launched missiles with ranges of 500 to 5,500 km: a whole class of weapons. It ended on 2 August 2019 when the United States withdrew.' },
  { y: 1996, date: '24 September 1996', name: 'Comprehensive Nuclear-Test-Ban Treaty (CTBT)', st: 'pending', text: 'Bans all nuclear test explosions. Opened for signature in 1996, it has still not entered into force, because some of the countries that must ratify it have not.' },
  { y: 2003, date: '4 January 2003', name: 'India’s stated nuclear doctrine', st: 'india', text: 'As stated by the Government of India: “Building and maintaining a credible minimum deterrent”; a posture of “No First Use”, under which nuclear weapons “will only be used in retaliation against a nuclear attack on Indian territory or on Indian forces anywhere”; and “Non-use of nuclear weapons against non-nuclear weapon states”.' },
  { y: 2010, date: '8 April 2010 (in force 5 February 2011)', name: 'New START', st: 'ended', text: 'Limited the long-range nuclear forces of the United States and Russia, with inspections. Russia suspended its participation in 2023, and the treaty expired on 5 February 2026.' },
  { y: 2016, date: '27 June 2016', name: 'India joins the MTCR', st: 'india', text: 'India became the 35th member of the Missile Technology Control Regime.' },
  { y: 2017, date: '7 July 2017 (in force 22 January 2021)', name: 'Treaty on the Prohibition of Nuclear Weapons', st: 'force', text: 'Bans nuclear weapons outright for the countries that join it. None of the countries that have nuclear weapons has joined.' },
  { y: 2019, date: '2 August 2019', name: 'INF Treaty ends', st: 'ended', text: 'The United States withdrew, citing Russian violations, which Russia denied. The treaty was no longer in force.' },
  { y: 2026, date: '5 February 2026', name: 'New START expires', st: 'ended', text: 'The last treaty limiting the long-range nuclear forces of the United States and Russia ran out, with no replacement agreed at the time of writing (October 2026).' },
];
const nearest = (y) => EV.reduce((best, e) => (e.y <= y + 0.01 && (!best || e.y >= best.y) ? e : best), null) || EV[0];

export default {
  id: 'treaties',
  short: 'The human cost and the treaties',
  title: 'The human cost, and the treaties',
  subtitle: 'Two cities in 1945, and eighty years of agreements to stop it happening again.',
  view: { pos: [0.4, 3.6, 13.5], target: [0.2, 1.1, 0] },
  learn: `<p>Ballistic missiles matter to the world mostly because of what they can carry. In <b>August 1945</b> the United States dropped atomic bombs, from aircraft, on <b>Hiroshima</b> (6 August) and <b>Nagasaki</b> (9 August). A UN disarmament page records that by the end of that year about <b>140,000</b> people in Hiroshima and <b>70,000</b> in Nagasaki had died. Estimates range from about 90,000 to 166,000 and from 60,000 to 80,000. The survivors, the <b>hibakusha</b>, have spent their lives asking that it never happen again.</p>
    <p>Since then countries have made agreements to limit tests, stop the spread of weapons, and cut their numbers. The <b>NPT</b> (1968, in force 1970) is the widest. The <b>INF Treaty</b> (1987) removed a whole class of missiles until it ended in 2019. The <b>Missile Technology Control Regime</b> (1987) controls the export of missiles and their technology; <b>India joined it in 2016</b>. The <b>CTBT</b> (1996) bans all nuclear test explosions but has not entered into force. <b>New START</b> (2010) limited the largest arsenals until it expired in February 2026.</p>
    <p>India states its own policy in its 2003 doctrine: a “credible minimum deterrent” and a posture of “No First Use”, as quoted in the timeline. Some treaties are in force, some have ended and one is still waiting: the story is still being written.</p>
    <p>More on ships and boats in the same series: ${link('warshipclear', 'WarshipClear')} and ${link('submarineclear', 'SubmarineClear')}.</p>
    <p class="tip"><b>Try it:</b> drag the year from 1945 to today and read what each agreement does and whether it still holds.</p>`,
  terms: [
    { t: 'Hibakusha', d: 'The survivors of the atomic bombings of Hiroshima and Nagasaki.' },
    { t: 'Arms control', d: 'Agreements between countries to limit, check or reduce weapons.' },
    { t: 'Ratify', d: 'To formally approve a treaty at home so that it binds your country.' },
    { t: 'In force', d: 'A treaty is in force once enough countries have ratified it for it to apply.' },
    { t: 'No First Use', d: 'A stated policy of never being the first to use nuclear weapons. India states this in its 2003 doctrine.' },
  ],
  defaults: { year: 1945 },
  controls: [
    { key: 'year', type: 'range', label: 'Year', min: 1945, max: 2026, step: 0.1, ends: ['1945', '2026'], fmt: (v) => String(Math.floor(v)) },
    { key: 'go', type: 'buttons', label: 'Jump to', items: [
      { label: '1945', act: (s) => { s.year = 1945; } },
      { label: 'NPT', act: (s) => { s.year = 1968; } },
      { label: 'INF', act: (s) => { s.year = 1987.6; } },
      { label: 'India 2003', act: (s) => { s.year = 2003; } },
      { label: 'Today', act: (s) => { s.year = 2026; } },
    ] },
  ],
  quiz: [
    { q: 'By the end of 1945, about how many people had died in Hiroshima, according to the UN page?', options: ['About 1,400', 'About 14,000', 'About 140,000', 'About 1.4 million'], answer: 2, why: 'About 140,000 in Hiroshima and 70,000 in Nagasaki, with estimates ranging around those figures.' },
    { q: 'Which agreement did India join in 2016?', options: ['The NPT', 'The Missile Technology Control Regime', 'New START', 'The INF Treaty'], answer: 1, why: 'India became the 35th member of the Missile Technology Control Regime on 27 June 2016.' },
    { q: 'What is the status of the CTBT, the treaty banning all nuclear test explosions?', options: ['In force since 1996', 'Signed in 1996 but not yet in force', 'Ended in 2019', 'Never signed by anyone'], answer: 1, why: 'It opened for signature in 1996 but cannot enter into force until every listed country ratifies it.' },
  ],
  reel: [
    { ms: 6400, caption: 'In August 1945 two atomic bombs killed about 140,000 people in Hiroshima and 70,000 in Nagasaki by the year’s end.', set: { year: 1945 }, view: { pos: [-4.7, 1.5, 3.6], target: [-5.6, 0.75, 0] }, spin: 0 },
    { ms: 5800, caption: 'Since 1968, treaties have tried to stop the spread and cut the numbers: some hold, some have ended.', set: { year: 1963 }, anim: { year: [1963, 2026] }, view: { pos: [1.2, 3.6, 12.5], target: [0.4, 1.3, 0] }, spin: 0 },
  ],

  build({ stage }) {
    frameShift(stage, 0.08, -0.2);
    const root = new THREE.Group(); stage.root.add(root);
    // The base: a long low plinth with decade ticks.
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0 + 0.8, 0.12, 1.2), M.matte(0x252a38));
    plinth.position.set(0, 0.06, 0); root.add(plinth);
    for (let y = 1950; y <= 2020; y += 10) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 1.2), M.glow(0x4a5268)); t.position.set(xOf(y), 0.13, 0); root.add(t);
      stage.label(`<small>${y}</small>`, [xOf(y), -0.05, 0.75], root);
    }
    // Two paper lanterns for Hiroshima and Nagasaki (as floated at the memorial ceremonies).
    const lanterns = [];
    [-0.35, 0.35].forEach((dz, i) => {
      const g = new THREE.Group();
      const body = latheX([[0, 0.17], [0.1, 0.2], [0.42, 0.2], [0.52, 0.17]], M.glow(0xfff1d6, { transparent: true, opacity: 0.9 }));
      body.rotation.z = Math.PI / 2; g.add(body);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 24), M.matte(0x2a2a2a)); cap.position.y = 0.54; g.add(cap);
      const lightP = new THREE.PointLight(0xffd9a0, 1.2, 3); lightP.position.y = 0.3; g.add(lightP);
      g.scale.setScalar(1.5); g.position.set(xOf(1945) + i * 0.12, 0.14, dz); root.add(g); lanterns.push(g);
    });
    stage.label('Hiroshima and Nagasaki, August 1945', [xOf(1945) + 1.5, 1.35, 0.4], root, 'hot');
    // A post for each agreement, coloured by its status today.
    const posts = EV.slice(1).map((e, i) => {
      const h = 0.7 + (i % 3) * 0.45;
      const g = new THREE.Group(); g.position.set(xOf(e.y), 0.12, (i % 2 ? -0.3 : 0.3)); root.add(g);
      const rodM = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, h, 10), M.metal(0x9aa2b0)); rodM.position.y = h / 2; g.add(rodM);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), M.glow(STATUS[e.st][1])); head.position.y = h; g.add(head);
      const lbl = stage.label(e.name, [0, h + 0.3, 0], g);
      return { e, g, head, lbl, h };
    });
    // The year cursor.
    const cursor = fatLine(stage, [new THREE.Vector3(0, 0.12, 0.7), new THREE.Vector3(0, 2.6, 0.7)], { color: 0xffffff, width: 2, opacity: 0.6 });
    root.add(cursor);
    // Legend board.
    const { tex, redraw } = canvasTexture(520, 230, (g, w, h) => {
      g.fillStyle = 'rgba(10,12,20,0.9)'; g.fillRect(0, 0, w, h);
      g.font = '600 24px Geist, sans-serif'; g.fillStyle = '#eef0f6'; g.fillText('Colour = status in October 2026', 20, 38);
      [['force', 'In force'], ['ended', 'Ended or expired'], ['pending', 'Signed, not yet in force'], ['india', 'India’s stated policy and membership'], ['cost', 'The human cost, 1945']].forEach(([k, t], i) => {
        g.fillStyle = STATUS[k][0]; g.beginPath(); g.arc(34, 72 + i * 34, 10, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#d6d9e2'; g.font = '21px Geist, sans-serif'; g.fillText(t, 56, 79 + i * 34);
      });
    });
    redraw();
    const board = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.86), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    board.position.set(3.4, 3.4, -0.8); root.add(board);

    let t = 0;
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        const y = clamp(s.year, Y0, Y1);
        cursor.position.x = xOf(y);
        const cur = nearest(y);
        posts.forEach((p) => {
          const on = p.e === cur;
          const reached = p.e.y <= y + 0.01;
          p.head.scale.setScalar(on ? 1.6 + 0.1 * Math.sin(t * 4) : reached ? 1 : 0.6);
          p.lbl.visible = on;
          p.head.material.opacity = reached ? 1 : 0.35; p.head.material.transparent = true;
        });
        lanterns.forEach((l, i) => { l.position.y = 0.12 + 0.03 * Math.sin(t * 1.3 + i); });
      },
      readout: (s) => {
        const e = nearest(clamp(s.year, Y0, Y1));
        return `<div class="big">${e.name}</div>
          <div class="row"><span>Date</span><b>${e.date}</b></div>
          <p style="margin:6px 0 0;line-height:1.45">${first(e.text)}</p>
          ${narrow() ? '' : note(e.st === 'cost' ? 'Figures from a UN disarmament (UNODA) page; the ranges are published estimates.' : 'Dates from UNODA, the Arms Control Association, the Government of India and government statements. Status as of October 2026.')}`;
      },
      dispose() { stage.setShift(0, 0); },
    };
  },
};
