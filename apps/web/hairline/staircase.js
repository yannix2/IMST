/**
 * Staircase: the Cambridge pathway as five rounded steps rising away from the viewer,
 * Early Years in front to AS and A Level at the back, where a graduation cap waits on the
 * top tread. Each riser carries as many dots as its stage's number, so the order reads
 * without a word. The step under the pointer rises; its neighbours follow less, staggered
 * outwards from it. At rest the first step is lit: the journey starts there.
 * The read-out names the stage. The slider is how high a chosen step rises.
 *
 * The pattern: discrete items (Riffle). Tweens with a stagger by distance, and a hit test
 * on each step's RESTING hull, front step first, so a rising step never changes the choice.
 */
const {
  Cam, clamp, fit, hull, poly, proj, facing, rings, prism,
  tdone, tset, tval, tween, disposer, mk, solid, put, place, pointer, register,
} = HL;

const CODES = ["early-years", "primary", "lower-secondary", "igcse", "as-a-level"];
const N = 5, W = 28, D = 50, R = 4, B = 1.4;
const H = [12, 26, 40, 54, 68];
const X0 = H.map((_h, k) => (N - 1 - k) * W); // step k: front (large x) is the first stage
const FALL = [1, 0.38, 0.12];

/** Point-in-convex-polygon, for the rest hulls. */
function inside(pt, poly2) {
  let sign = 0;
  for (let k = 0; k < poly2.length; k++) {
    const [ax, ay] = poly2[k], [bx, by] = poly2[(k + 1) % poly2.length];
    const c = (bx - ax) * (pt[1] - ay) - (by - ay) * (pt[0] - ax);
    if (c !== 0) { if (sign === 0) sign = Math.sign(c); else if (Math.sign(c) !== sign) return false; }
  }
  return true;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let rise = value;

  // Fitted to the stair at its widest rise, the cap on the top step included.
  const C = Cam(45, 0.5, 1.7);
  const box = [[-4, -4, 0], [N * W + 4, D + 4, 0], [N * W + 4, -4, 0], [-4, D + 4, 0]];
  for (let k = 0; k < N; k++) box.push([X0[k], 0, H[k] + 24], [X0[k] + W, D, H[k] + 24]);
  box.push([-6, D / 2 - 15, H[N - 1] + 24 + 16], [W + 6, D / 2 + 15, H[N - 1] + 24 + 16]);
  fit(C, box, 200, 170);
  const P = proj(C), front = facing(C);

  // Back to front: the top step (k = 4) first, so each nearer step covers the one behind it.
  const steps = new Array(N);
  for (let k = N - 1; k >= 0; k--) {
    const g = mk("g", {}, svg);
    const [sr, si] = rings(X0[k], 0, X0[k] + W, D, R, B);
    const body = solid(g);
    const dots = [];
    for (let d = 0; d <= k; d++) dots.push(mk("circle", { r: 1.25, class: "dot off" }, g));
    let cap = null;
    if (k === N - 1) {
      // The cap: a skull block and a thin square board, turned on the tread, with a tassel.
      const cx = X0[k] + W / 2, cy = D / 2;
      cap = {
        cx, cy,
        skull: solid(g), board: solid(g),
        sk: rings(cx - 5.5, cy - 5.5, cx + 5.5, cy + 5.5, 2.4, 1),
        bd: rings(cx - 13, cy - 13, cx + 13, cy + 13, 1.2, 0.8),
        cord: mk("path", { class: "sil nf" }, g),
        bead: mk("circle", { r: 1.4, class: "dot off" }, g),
      };
    }
    steps[k] = { g, sr, si, body, dots, cap, z: tween(0), drawn: NaN };
  }

  function draw(k, lift) {
    const s = steps[k];
    if (s.drawn === lift) return;
    s.drawn = lift;
    const top = H[k] + lift;
    put(s.body, prism(P, front, s.sr, s.si, 0, top));
    // The riser is the face towards the step below (x = X0 + W): k + 1 dots across it,
    // just under the tread's nosing, above the lower step's top.
    const v0 = D / 2 - (k * 5) / 2;
    s.dots.forEach((dot, d) => place(dot, P(X0[k] + W, v0 + d * 5, top - 5.5)));
    if (s.cap) {
      const c = s.cap, z0 = top, z1 = top + 7, z2 = z1 + 2;
      put(c.skull, prism(P, front, c.sk[0], c.sk[1], z0, z1));
      put(c.board, prism(P, front, c.bd[0], c.bd[1], z1, z2));
      const a = P(c.cx + 11, c.cy + 11, z1), b = P(c.cx + 11, c.cy + 11, z1 - 9);
      c.cord.setAttribute("d", `M${a[0]},${a[1]}L${b[0]},${b[1]}`);
      place(c.bead, b);
    }
  }

  // Hit test: each step's RESTING hull, front step first (it covers the ones behind).
  const hulls = steps.map((s, k) => hull(s.sr.map((q) => P(q.u, q.v, 0)).concat(s.sr.map((q) => P(q.u, q.v, H[k] + (k === N - 1 ? 9 : 0))))));
  const hit = (p) => { for (let k = 0; k < N; k++) if (inside(p, hulls[k])) return k; return -1; };

  const Bk = register(stage, (_dt, now) => {
    let moving = false;
    steps.forEach((s, k) => {
      draw(k, tval(s.z, now));
      if (!tdone(s.z, now)) moving = true;
    });
    return moving;
  });
  bag.add(Bk.unregister);

  let act = -1;
  function setActive(a, force) {
    if (a === act && !force) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : 0;
    act = a;
    steps.forEach((s, k) => {
      const dist = Math.abs(k - from);
      // The reach is clamped: the chosen step, half its neighbours, a trace beyond, then nothing.
      const lift = a < 0 ? 0 : clamp(rise, 0, 26) * (FALL[Math.abs(k - a)] ?? 0);
      tset(s.z, lift, now, dist * 45);
      // One highlight: the chosen step and its dots; at rest, the first step.
      const lit = a < 0 ? k === 0 : k === a;
      s.body.sil.classList.toggle("hi", lit);
      s.dots.forEach((dot) => dot.setAttribute("class", lit ? "dot" : "dot off"));
      if (s.cap) s.cap.bead.setAttribute("class", lit ? "dot" : "dot off");
    });
    read.textContent = a < 0 ? "rest" : CODES[a];
    Bk.wake();
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
  name: "staircase",
  means: "The Cambridge pathway as five steps from Early Years to A Level: the stage under the pointer rises, its neighbours follow.",
  rules: [1, 2, 3, 5],
  range: [8, 14, 22],
  tour: [[262, 214], [190, 176], [120, 128], null],
  mount,
});
