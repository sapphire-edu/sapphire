// The switch to the new look, animated: the page turns into a blueprint of outlined boxes where
// the old layout had things, each box resizes, then slides across, then up or down into its
// place in the new layout (things only the new look has materialise, things it drops fold
// away), and the real page fades back in. Used when someone switches from the tour.

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
  '[data-view].is-active .v2-stat',
  '[data-view].is-active .subject-card',
  '[data-view].is-active .v2-subject-row',
  '[data-view].is-active .upcoming-item',
  '[data-view].is-active .section-header',
];

// Elements kept across the switch match themselves; re-rendered ones match by what they show.
function v2MorphKey(el) {
  if (el.matches('.subject-card, .v2-subject-row')) return `subject:${el.dataset.id}`;
  if (el.matches('.upcoming-item')) return `upcoming:${el.dataset.upcomingId}`;
  return el;
}

function captureV2MorphLayout() {
  const parts = new Map();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  document.querySelectorAll(V2_MORPH_PARTS.join(',')).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return;
    const key = v2MorphKey(el);
    if (parts.has(key)) return;
    parts.set(key, {
      left: r.left, top: r.top, width: r.width, height: r.height,
      radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
    });
  });
  return parts;
}

function v2MorphBox(rect) {
  return {
    left: `${rect.left}px`, top: `${rect.top}px`,
    width: `${rect.width}px`, height: `${rect.height}px`,
    borderRadius: `${rect.radius}px`,
  };
}

// Mechanical: change size, then move across, then move up or down, each with a hard ease.
function v2MorphKeyframes(from, to) {
  const sized = { ...from, width: to.width, height: to.height, radius: to.radius };
  const across = { ...sized, left: to.left };
  return [
    { ...v2MorphBox(from), offset: 0, easing: 'cubic-bezier(0.8, 0, 0.2, 1)' },
    { ...v2MorphBox(sized), offset: 0.38, easing: 'cubic-bezier(0.8, 0, 0.2, 1)' },
    { ...v2MorphBox(across), offset: 0.7, easing: 'cubic-bezier(0.8, 0, 0.2, 1)' },
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
  const order = (a, b) => a.top - b.top || a.left - b.left;
  const staggerOf = (rect) => Math.min(260, rect.top * 0.25 + rect.left * 0.05);
  const addBox = (keyframes, delay, duration, extraClass = '') => {
    const box = document.createElement('div');
    box.className = `v2-morph-box${extraClass}`;
    stage.appendChild(box);
    animations.push(box.animate(keyframes, { duration, delay, fill: 'both' }));
  };

  const moving = [];
  after.forEach((to, key) => {
    const from = before.get(key);
    if (from) moving.push({ from, to });
  });
  moving.sort((a, b) => order(a.from, b.from)).forEach(({ from, to }) => {
    addBox(v2MorphKeyframes(from, to), 120 + staggerOf(from), 950);
  });

  // Only in the old look: fold up into a line and fade.
  before.forEach((from, key) => {
    if (after.has(key)) return;
    const folded = { ...from, top: from.top + from.height / 2, height: 0 };
    addBox([
      { ...v2MorphBox(from), opacity: 1 },
      { ...v2MorphBox(folded), opacity: 0 },
    ], 60 + staggerOf(from) * 0.5, 420, ' is-leaving');
  });

  // Only in the new look: drawn in from a line once the rest has arrived.
  after.forEach((to, key) => {
    if (before.has(key)) return;
    const line = { ...to, top: to.top + to.height / 2, height: 0 };
    addBox([
      { ...v2MorphBox(line), opacity: 0 },
      { ...v2MorphBox(line), opacity: 1, offset: 0.2 },
      { ...v2MorphBox(to), opacity: 1 },
    ], 560 + staggerOf(to) * 0.6, 520, ' is-new');
  });

  const finished = Promise.all(animations.map((a) => a.finished.catch(() => {})));
  return finished.then(() => {
    document.documentElement.classList.remove('is-morphing');
    document.documentElement.classList.add('is-morph-revealing');
    stage.classList.add('is-done');
    setTimeout(() => {
      stage.remove();
      document.documentElement.classList.remove('is-morph-revealing');
    }, 450);
  });
}
