/**
 * Network: one school among many. A round plate holds a central school block, and eight
 * smaller schools stand on a ring around it, each joined to the centre by a dashed guide on
 * the plate. They stand at different heights, as schools do. Pointing near one raises it and
 * lights its link; its neighbours on the ring lift a little, staggered outwards from it.
 * At rest the centre is lit: this school, in the middle of the network.
 * The read-out says which school on the ring. The slider is how high a chosen school rises.
 *
 * The pattern: discrete items (Riffle). The pointer is read on the ground plane (unproj at
 * z 0), matched to each school's resting position (rule 01). Guides are painted before the
 * blocks they join, so a block always covers its own line (rule 06).
 */
const {
  Cam, clamp, fit, poly, proj, facing, rings, rrect, prism, unproj,
  tdone, tset, tval, tween, disposer, mk, solid, put, pointer, register,
} = HL;

const N = 8, RING = 62, PLATE = 84;
const HEIGHTS = [16, 10, 20, 12, 18, 9, 14, 22];
const FALL = [1, 0.42, 0.12];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let rise = value;

  const C = Cam(45, 0.5, 1.78);
  const box = [[-PLATE, -PLATE, 0], [PLATE, PLATE, 0], [PLATE, -PLATE, 0], [-PLATE, PLATE, 0], [0, 0, 44], [-RING, -RING, 22 + 34], [RING, RING, 22 + 34]];
  fit(C, box, 200, 170);
  const P = proj(C), front = facing(C);

  // Nodes on the ring, at angles; drawn back to front by their depth (x + y).
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2 + Math.PI / 8;
    nodes.push({ i, x: Math.cos(t) * RING, y: Math.sin(t) * RING });
  }

  const g = mk("g", {}, svg);
  const plate = rrect(-PLATE, -PLATE, PLATE, PLATE, PLATE, 14);
  const plateIn = rrect(-PLATE + 2, -PLATE + 2, PLATE - 2, PLATE - 2, PLATE - 2, 14);
  put(solid(g), prism(P, front, plate, plateIn, 0, 4));
  // The guides lie on the plate, behind every block.
  for (const n of nodes) n.link = mk("path", { d: poly([P(0, 0, 4), P(n.x, n.y, 4)]).replace("Z", ""), class: "nf lo dash" }, g);

  const centre = { x: 0, y: 0, depth: 0 };
  const order = [...nodes.map((n) => ({ ...n, depth: n.x + n.y })), centre].sort((a, b) => a.depth - b.depth);
  let hub = null;
  for (const o of order) {
    const el = solid(g);
    if (o === centre) {
      const [hr, hi] = rings(-14, -14, 14, 14, 6, 1.6);
      put(el, prism(P, front, hr, hi, 4, 4 + 34));
      const [cr, ci] = rings(-6, -6, 6, 6, 3, 1);
      hub = { el, cap: solid(g), cr, ci };
      put(hub.cap, prism(P, front, cr, ci, 38, 44));
    } else {
      const n = nodes[o.i];
      n.el = el;
      n.r = rings(n.x - 8, n.y - 8, n.x + 8, n.y + 8, 3.8, 1.3);
      n.z = tween(0);
      n.drawn = NaN;
    }
  }

  function draw(n, lift) {
    if (n.drawn === lift) return;
    n.drawn = lift;
    put(n.el, prism(P, front, n.r[0], n.r[1], 4, 4 + HEIGHTS[n.i] + lift));
  }

  function hit(p) {
    const [wx, wy] = unproj(C, p[0], p[1], 0);
    let best = -1, bd = 16 * 16;
    nodes.forEach((n) => {
      const d = (wx - n.x) ** 2 + (wy - n.y) ** 2;
      if (d < bd) { bd = d; best = n.i; }
    });
    return best;
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const n of nodes) {
      draw(n, tval(n.z, now));
      if (!tdone(n.z, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  function setActive(a, force) {
    if (a === act && !force) return;
    const now = performance.now();
    act = a;
    nodes.forEach((n) => {
      // Distance round the ring, so the lift spreads both ways from the chosen school.
      const d = a < 0 ? 9 : Math.min(Math.abs(n.i - a), N - Math.abs(n.i - a));
      tset(n.z, a < 0 ? 0 : clamp(rise, 0, 34) * (FALL[d] ?? 0), now, (a < 0 ? 0 : d) * 45);
      // One highlight: the chosen school with its link; at rest, the centre.
      n.el.sil.classList.toggle("hi", n.i === a);
      n.link.classList.toggle("hi", n.i === a);
    });
    hub.el.sil.classList.toggle("hi", a < 0);
    read.textContent = a < 0 ? "rest" : `school ${a + 1}`;
    B.wake();
  }
  setActive(-1, true);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { rise = v; setActive(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "network",
  means: "One school at the centre of a ring of schools, each joined to it: the school under the pointer rises and lights its link.",
  rules: [1, 2, 5, 6],
  range: [14, 22, 30],
  tour: [[290, 190], [200, 238], [112, 168], null],
  mount,
});
