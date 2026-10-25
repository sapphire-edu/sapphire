// The switch to the new look, animated: the page turns into a blueprint of outlined boxes where
// the old layout had things. The parts the new look drops fold away first; then every box
// resizes, then slides along one axis, then the other, in lockstep, into its place in the new
// layout; then the parts only the new look has draw in, and the real page fades back in.
// Used when someone switches from the tour.

const V2_MORPH_PARTS = [
  '.app-bar .logo',
  '.app-bar .brand-title',
  '.app-bar .nav-item',
  '.app-actions > button',
  '.page-header .page-title',
  '#sync-status',
  '#quick-add-button',
  '[data-view].is-active .card',
  '[data-view].is-active .v2-stats',
  '[data-view].is-active .subject-card',
  '[data-view].is-active .v2-subject-row',
  '[data-view].is-active .upcoming-item',
  '[data-view].is-active .section-header',
];

// Timeline (ms). Each phase finishes before the next starts, so boxes only ever move along one
// axis at a time and fewer paths cross.
const V2_MORPH = {
  foldStart: 150, foldLength: 750,
  moveStart: 750, phaseLength: 650,
  drawLength: 750,
  stagger: 22,
};

// Parts that don't morph in place: the old one slides out to the right, and the new one slides
// in from the right into its spot (the Upcoming card changes too much to morph nicely).
const V2_MORPH_SLIDE = '.upcoming-card';

// Elements kept across the switch match themselves; re-rendered ones match by what they show.
function v2MorphKey(el) {
  if (el.matches('.subject-card, .v2-subject-row')) return `subject:${el.dataset.id}`;
  if (el.matches('.upcoming-item')) return `upcoming:${el.dataset.upcomingId}`;
  return el;
}

function captureV2MorphLayout() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const found = Array.from(document.querySelectorAll(V2_MORPH_PARTS.join(','))).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width >= 8 && r.height >= 8 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
  });
  // Only the outermost: a card and the items inside it would draw as boxes on top of each other.
  const outermost = found.filter((el) => !found.some((other) => other !== el && other.contains(el)));
  const parts = new Map();
  outermost.forEach((el) => {
    const key = v2MorphKey(el);
    if (parts.has(key)) return;
    const r = el.getBoundingClientRect();
    parts.set(key, {
      left: r.left, top: r.top, width: r.width, height: r.height,
      radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
      slide: el.matches(V2_MORPH_SLIDE),
    });
  });
  return parts;
}

function v2MorphBox(rect, lifted = false) {
  return {
    left: `${rect.left}px`, top: `${rect.top}px`,
    width: `${rect.width}px`, height: `${rect.height}px`,
    borderRadius: `${rect.radius}px`,
    boxShadow: lifted ? '0 14px 30px rgba(0, 0, 0, 0.16)' : '0 0 0 rgba(0, 0, 0, 0)',
  };
}

// Size, then one axis, then the other. Anything moving up goes up first, so it is out of the way
// of things sliding into the row it left; everything else slides across first.
function v2MorphKeyframes(from, to) {
  const sized = { ...from, width: to.width, height: to.height, radius: to.radius };
  const upFirst = to.top < from.top - 4;
  const middle = upFirst ? { ...sized, top: to.top } : { ...sized, left: to.left };
  const moves = Math.abs(to.left - from.left) > 2 || Math.abs(to.top - from.top) > 2;
  const ease = 'cubic-bezier(0.8, 0, 0.2, 1)';
  return [
    { ...v2MorphBox(from), offset: 0, easing: ease },
    { ...v2MorphBox(sized, moves), offset: 1 / 3, easing: ease },
    { ...v2MorphBox(middle, moves), offset: 2 / 3, easing: ease },
    { ...v2MorphBox(to, moves), offset: 0.95 },
    { ...v2MorphBox(to), offset: 1 },
  ];
}

function runV2Morph(switchLayout) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || typeof Element.prototype.animate !== 'function') {
    switchLayout();
    return Promise.resolve();
  }
  window.scrollTo(0, 0);
  const before = captureV2MorphLayout();
  switchLayout();
  const after = captureV2MorphLayout();

  const stage = document.createElement('div');
  stage.className = 'v2-morph';
  stage.setAttribute('aria-hidden', 'true');
  document.body.appendChild(stage);
  document.documentElement.classList.add('is-morphing');

  const animations = [];
  const byPosition = (a, b) => a.top - b.top || a.left - b.left;
  const addBox = (keyframes, delay, duration, extraClass, zIndex) => {
    const box = document.createElement('div');
    box.className = `v2-morph-box${extraClass}`;
    box.style.zIndex = String(zIndex);
    stage.appendChild(box);
    animations.push(box.animate(keyframes, { duration, delay, fill: 'both' }));
  };

  // 1. Only in the old look: hold a moment so it reads as leaving, fold into a line, fade.
  const leaving = [];
  before.forEach((from, key) => {
    if (!after.has(key)) leaving.push(from);
  });
  leaving.sort(byPosition).forEach((from, i) => {
    const folded = { ...from, top: from.top + from.height / 2, height: 0 };
    addBox([
      { ...v2MorphBox(from), opacity: 1, offset: 0 },
      { ...v2MorphBox(from), opacity: 1, offset: 0.3, easing: 'cubic-bezier(0.8, 0, 0.2, 1)' },
      { ...v2MorphBox(folded), opacity: 1, offset: 0.85 },
      { ...v2MorphBox(folded), opacity: 0, offset: 1 },
    ], V2_MORPH.foldStart + i * V2_MORPH.stagger, V2_MORPH.foldLength, ' is-leaving', 1);
  });

  // 2. In both: resize, then one axis, then the other. The ones travelling furthest pass over
  // the others, lifted, rather than through them.
  const moving = [];
  const sliding = [];
  after.forEach((to, key) => {
    const from = before.get(key);
    if (!from) return;
    if (to.slide) sliding.push({ from, to });
    else moving.push({ from, to, distance: Math.abs(to.left - from.left) + Math.abs(to.top - from.top) });
  });
  const byDistance = moving.slice().sort((a, b) => a.distance - b.distance);
  moving.sort((a, b) => byPosition(a.from, b.from)).forEach((move, i) => {
    addBox(
      v2MorphKeyframes(move.from, move.to),
      V2_MORPH.moveStart + i * V2_MORPH.stagger,
      V2_MORPH.phaseLength * 3,
      '',
      2 + byDistance.indexOf(move)
    );
  });

  // Sliders: out to the right while the others resize and take their first axis, then the new
  // one comes in from the right, at its new size, while the others take their second.
  const offRight = window.innerWidth + 40;
  const slideEase = 'cubic-bezier(0.7, 0, 0.3, 1)';
  sliding.forEach(({ from, to }) => {
    addBox([
      { ...v2MorphBox(from), offset: 0, easing: slideEase },
      { ...v2MorphBox({ ...from, left: offRight }, true), offset: 1 },
    ], V2_MORPH.moveStart + V2_MORPH.phaseLength * 0.3, V2_MORPH.phaseLength * 1.4, '', 50);
    addBox([
      { ...v2MorphBox({ ...to, left: offRight }, true), offset: 0, easing: slideEase },
      { ...v2MorphBox(to, true), offset: 0.92 },
      { ...v2MorphBox(to), offset: 1 },
    ], V2_MORPH.moveStart + V2_MORPH.phaseLength * 1.8, V2_MORPH.phaseLength * 1.2, '', 50);
  });

  // 3. Only in the new look: drawn in from a line once everything else has arrived.
  const drawStart = V2_MORPH.moveStart + V2_MORPH.phaseLength * 3 - 150;
  const arriving = [];
  after.forEach((to, key) => {
    if (!before.has(key)) arriving.push(to);
  });
  arriving.sort(byPosition).forEach((to, i) => {
    const line = { ...to, top: to.top + to.height / 2, height: 0 };
    addBox([
      { ...v2MorphBox(line), opacity: 0 },
      { ...v2MorphBox(line), opacity: 1, offset: 0.2 },
      { ...v2MorphBox(to), opacity: 1 },
    ], drawStart + i * V2_MORPH.stagger * 2, V2_MORPH.drawLength, ' is-new', 1);
  });

  const finished = Promise.all(animations.map((a) => a.finished.catch(() => {})));
  return finished.then(() => {
    document.documentElement.classList.remove('is-morphing');
    document.documentElement.classList.add('is-morph-revealing');
    stage.classList.add('is-done');
    setTimeout(() => {
      stage.remove();
      document.documentElement.classList.remove('is-morph-revealing');
    }, 750);
  });
}
