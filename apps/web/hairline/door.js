/**
 * Door: the admissions route as a doorway on a threshold, with four stepping stones leading
 * up to it, one per admission step. Pointing at a stone lights it, and the door swings open
 * as far as that step takes a family: ajar at the first stone, wide open at the last.
 * At rest the door stands just ajar and the first stone is lit: start here.
 * The read-out names the step. The slider is how far the door opens at the last stone.
 *
 * The pattern: discrete items (Riffle). The pointer is read on the ground plane (unproj at
 * z 0), which never moves, and matched to the stones' resting centres (rule 01); the door's
 * angle is a tween to the chosen step (rule 08: a choice, not a position).
 */
const {
  Cam, clamp, fillet, fit, poly, proj, facing, rad, rings, prism, unproj,
  tdone, tset, tval, tween, disposer, mk, solid, put, place, pointer, register,
} = HL;

const CODES = ["step-1", "step-2", "step-3", "step-4"];
const OPEN = [0.24, 0.48, 0.72, 1];
const AJAR = 6, STEP_UP = 7;
const HINGE = 6, DW = 28, DH = 54, FY = 8, BASE = 4;
// Stones from the front of the path (step 1) to the threshold (step 4), staggered a little.
const STONES = [[22, 76], [13, 60], [23, 45], [15, 30]];

/** The door in its own plane: s along its width from the hinge, v up; a rounded head. */
const PANEL = fillet([[0, 0], [DW, 0], [DW, DH], [0, DH]], [0.6, 0.6, 9, 9]);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let swing = value;

  const C = Cam(45, 0.5, 2.3);
  const box = [[-14, -6, 0], [56, -6, 0], [-14, 82, 0], [56, 82, 0], [-2, 0, BASE + 66], [42, 9, BASE + 66]];
  box.push([-14, 82, STEP_UP + 3]);
  for (const deg of [0, 60, 120]) box.push([HINGE + DW - DW * Math.cos(rad(deg)), FY + DW * Math.sin(rad(deg)), BASE + DH]);
  fit(C, box, 200, 168);
  const P = proj(C), front = facing(C);

  // Back to front: the threshold, the frame, the door, then the stones from the door outwards.
  const g = mk("g", {}, svg);
  const [tr, ti] = rings(-12, -4, 52, 14, 4, 1.4);
  put(solid(g), prism(P, front, tr, ti, 0, BASE));
  const [lr, li] = rings(-2, -1, HINGE, FY + 1, 2, 1);
  put(solid(g), prism(P, front, lr, li, BASE, BASE + 60));
  const [rr, ri] = rings(HINGE + DW, -1, HINGE + DW + 8, FY + 1, 2, 1);
  put(solid(g), prism(P, front, rr, ri, BASE, BASE + 60));
  const [hr, hi] = rings(-4, -2, HINGE + DW + 10, FY + 2, 2.4, 1.2);
  put(solid(g), prism(P, front, hr, hi, BASE + 60, BASE + 66));
  // The doorway's floor line, seen through the opening.
  mk("path", { d: poly([P(HINGE, FY - 6, BASE), P(HINGE + DW, FY - 6, BASE)]).replace("Z", ""), class: "nf lo" }, g);

  const panel = mk("path", { class: "sil" }, g);
  const knob = mk("circle", { r: 1.2, class: "dot off" }, g);
  const stones = [];
  for (let j = STONES.length - 1; j >= 0; j--) {
    const [cx, cy] = STONES[j];
    const [sr, si] = rings(cx - 7.5, cy - 5.5, cx + 7.5, cy + 5.5, 4, 1.3);
    stones[j] = { el: solid(g), sr, si, cx, cy, z: tween(0), drawn: NaN };
  }

  const a = tween(AJAR);
  let drawn = NaN;
  function draw(ang) {
    if (ang === drawn) return;
    drawn = ang;
    const c = Math.cos(rad(ang)), s = Math.sin(rad(ang));
    // Hinged on the right jamb, opening towards the path: half open, it faces the viewer.
    const at = (u, v) => P(HINGE + DW - u * c, FY + u * s, BASE + v);
    panel.setAttribute("d", poly(PANEL.map(([u, v]) => at(u, v))));
    place(knob, at(DW - 3.4, DH * 0.46));
  }

  // Hit test on the ground plane: the stone whose resting centre is nearest, within reach.
  function hit(p) {
    const [wx, wy] = unproj(C, p[0], p[1], 0);
    let best = -1, bd = 12 * 12;
    stones.forEach((st, j) => {
      const d = (wx - st.cx) ** 2 + (wy - st.cy) ** 2;
      if (d < bd) { bd = d; best = j; }
    });
    return best;
  }

  const B = register(stage, (_dt, now) => {
    draw(tval(a, now));
    let moving = !tdone(a, now);
    for (const st of stones) {
      const z = tval(st.z, now);
      if (z !== st.drawn) { st.drawn = z; put(st.el, prism(P, front, st.sr, st.si, z, z + 2.4)); }
      if (!tdone(st.z, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  function setActive(j, force) {
    if (j === act && !force) return;
    act = j;
    tset(a, j < 0 ? AJAR : clamp(swing * OPEN[j], 0, 120), performance.now(), 0);
    // One highlight: the chosen stone; at rest, the first stone.
    const lit = j < 0 ? 0 : j;
    // The chosen stone lifts under the foot; the others settle, staggered outwards from it.
    const now = performance.now();
    stones.forEach((st, k) => {
      st.el.sil.classList.toggle("hi", k === lit);
      tset(st.z, j >= 0 && k === j ? STEP_UP : 0, now, Math.abs(k - lit) * 45);
    });
    read.textContent = j < 0 ? "rest" : CODES[j];
    B.wake();
  }
  setActive(-1, true);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { swing = v; setActive(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "door",
  means: "Four stepping stones up to the school's door, one per admission step: each step opens the door a little wider.",
  rules: [1, 4, 5, 8],
  range: [70, 95, 120],
  tour: [[262, 252], [215, 205], [180, 170], null],
  mount,
});
