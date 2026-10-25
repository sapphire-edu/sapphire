// Invites people on the old look (V1) to switch to the new one (V2): a thin banner that stays
// until they do, and a full-screen tour that opens on load at most once a day.
//
// The tour shows the real app with the person's own data: two read-only copies of Sapphire
// (index.html?preview=v1 and ?preview=v2) stacked in frames, with a slider between them and
// numbered callouts on what changed on each page. The preview copies never save anything
// (see safeSetItem in js/storage.js).

const V2_TOUR_SNOOZE_MS = 24 * 60 * 60 * 1000;

const V2_TOUR_STEPS = [
  {
    tab: 'dashboard',
    title: 'Your dashboard, tidied up',
    body: 'The same numbers in a fraction of the space, so you can see everything without scrolling.',
    changes: [
      { sel: '#v2-stats', label: 'One row of stats', text: 'Average, grade, top subject and latest mark side by side.' },
      { sel: '.v2-subject-list', label: 'Subjects as a list', text: 'One line per subject, with its progress bar and grade.' },
      { sel: '.upcoming-card', label: 'Upcoming on the side', text: 'Due work sits next to your subjects instead of above them.' },
      { sel: '#quick-add-button', label: 'Add a mark from any page', text: 'One button at the top, wherever you are.' },
    ],
  },
  {
    tab: 'analytics',
    title: 'Analytics that tell you what to do',
    body: 'Not just charts. See where you are slipping and what moved since your last mark.',
    changes: [
      { sel: '#analytics-stats', label: 'Strongest and needs focus', text: 'Your best subject and the one to work on, plus the change since your last mark.' },
      { sel: '.progress-card .an-card-head', label: 'Zoom the graph', text: 'Switch between the last month, three months or everything.' },
      { sel: '.an-subjects-card', label: 'A trend for every subject', text: 'A mini graph and your target progress on each line.' },
      { sel: '.an-grades-card', label: 'Grade breakdown', text: 'How many of each grade you have. Click one to filter your marks.' },
    ],
  },
  {
    tab: 'calendar',
    title: 'A calendar you can plan from',
    body: 'Pick a day to see what is on it, and what is coming up next.',
    changes: [
      { sel: '.calendar-header-actions', label: 'Today and Add', text: 'Jump back to today or add work without leaving the month.' },
      { sel: '.calendar-v2-chip', label: 'Subject icons on events', text: 'Each exam carries its subject icon and colour.' },
      { sel: '#calendar-agenda', label: 'Day view and coming up', text: 'The day you pick, plus your next few due dates.' },
    ],
  },
  {
    tab: 'timetable',
    title: 'Your timetable, live',
    body: 'Know where you need to be right now, and how long is left.',
    changes: [
      { sel: '#timetable-tab-today-card', label: "Today's classes", text: 'Your day in order, with a progress bar through the current class.' },
      { sel: '.tt-break', label: 'Recess and lunch', text: 'The gaps between classes are labelled.' },
      { sel: '.timetable-day-column.is-today', label: 'Today stands out', text: "Today's column is marked, and the class you are in says Now." },
    ],
  },
  {
    tab: 'dashboard',
    final: true,
    title: 'Switch to the new look',
    body: 'Your marks, subjects and timetable stay exactly as they are. You can switch back any time in Settings.',
    changes: [],
  },
];

let v2Tour = null;

// ── Preview copy of the app (runs inside the tour's frames) ──

// A V1 user with no marks or no timetable would see empty pages, so fill the gaps with examples.
function prepareV2Preview() {
  if (!Array.isArray(state.data.subjects) || !state.data.subjects.length) {
    const subject = (id, name, color, icon, marks, upcoming = []) => ({
      id, name, color, icon,
      assessments: marks.map(([title, score, weight, date], i) => ({ id: `${id}${i}`, name: title, score, total: 100, weight, date })),
      upcoming,
    });
    const inDays = (days) => {
      const d = addDays(new Date(), days);
      return dateKeyFromParts(d.getFullYear(), d.getMonth(), d.getDate());
    };
    state.data.subjects = [
      subject('ex-m', 'Maths', '#ee7d76', 'calculator', [['Topic Test 1', 84, 20, inDays(-200)], ['Half Yearly', 88, 30, inDays(-120)]],
        [{ id: 'ex-u1', name: 'Yearly Exam', type: 'assessment', weight: 30, date: inDays(2), notes: '' }]),
      subject('ex-e', 'English', '#e9a15b', 'book-open', [['Essay', 78, 30, inDays(-180)], ['Speech', 85, 20, inDays(-60)]],
        [{ id: 'ex-u2', name: 'Yearly Exam', type: 'assessment', weight: 20, date: inDays(9), notes: '' }]),
      subject('ex-s', 'Science', '#57a8d3', 'flask', [['Practical', 72, 25, inDays(-150)], ['Research', 80, 25, inDays(-40)]]),
      subject('ex-h', 'History', '#d29086', 'hourglass', [['Source Task', 93, 30, inDays(-190)], ['Essay', 89, 30, inDays(-80)]]),
    ];
  }
  const timetable = normalizeTimetableData(state.data.timetable);
  if (!timetable.lessons.length) {
    const monday = getMondayOfWeek(new Date());
    const names = state.data.subjects.slice(0, 4).map((s) => s.name);
    const slots = [[520, 600], [605, 680], [710, 785], [815, 890]];
    const lessons = [];
    for (let day = 0; day < 5; day += 1) {
      const date = addDays(monday, day);
      const dateKey = dateKeyFromParts(date.getFullYear(), date.getMonth(), date.getDate());
      slots.forEach(([start, end], i) => {
        lessons.push({
          id: `ex-l${day}${i}`, dateKey, dayIndex: day, weekType: 'A', startMinutes: start, endMinutes: end,
          classCode: '', subject: names[(day + i) % names.length] || 'Class', room: '', teacher: '', period: String(i + 1),
        });
      });
    }
    state.data.timetable = { ...timetable, lessons, sourceName: 'Example timetable', anchorMonday: dateKeyFromParts(monday.getFullYear(), monday.getMonth(), monday.getDate()) };
  }
}

// ── Tour ──

function v2TourReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function v2TourPreviewUrl(ui) {
  const url = new URL(window.location.href);
  url.search = `?preview=${ui}`;
  url.hash = '';
  return url.toString();
}

function v2TourHtml() {
  const segs = V2_TOUR_STEPS.map((_, i) =>
    `<button class="v2t-seg" type="button" data-step="${i}" aria-label="Step ${i + 1} of ${V2_TOUR_STEPS.length}"></button>`
  ).join('');
  return `
    <div class="v2t-top">
      <div class="v2t-progress">${segs}</div>
      <button class="v2t-btn v2t-btn--quiet" type="button" data-tour="later">Maybe later</button>
    </div>
    <div class="v2t-main">
      <div class="v2t-copy">
        <div class="v2t-copy-text" data-tour="copy">
          <h2 class="v2t-title" id="v2t-title"></h2>
          <p class="v2t-body"></p>
        </div>
        <ol class="v2t-changes" data-tour="changes"></ol>
        <p class="v2t-hint" data-tour="hint"></p>
        <div class="v2t-actions">
          <button class="v2t-btn v2t-btn--ghost" type="button" data-tour="back">Back</button>
          <button class="v2t-btn v2t-btn--primary" type="button" data-tour="next">Next</button>
        </div>
      </div>
      <div class="v2t-stage" data-tour="stage">
        <div class="v2t-frames" data-tour="frames">
          <iframe class="v2t-frame v2t-frame--old" title="Sapphire in the old look" tabindex="-1" aria-hidden="true"></iframe>
          <iframe class="v2t-frame v2t-frame--new" title="Sapphire in the new look" tabindex="-1" aria-hidden="true"></iframe>
        </div>
        <div class="v2t-overlay" data-tour="overlay">
          <div class="v2t-spot" data-tour="spot" hidden></div>
          <div class="v2t-markers" data-tour="markers"></div>
          <span class="v2t-side-tag v2t-side-tag--old">Old look</span>
          <span class="v2t-side-tag v2t-side-tag--new">New look</span>
          <input class="v2t-range" type="range" min="0" max="100" value="100" aria-label="Compare the old look with the new look" />
          <div class="v2t-handle" aria-hidden="true"><span><i class="ph ph-arrows-left-right"></i></span></div>
        </div>
        <div class="v2t-loading" data-tour="loading">Loading your pages…</div>
      </div>
    </div>`;
}

function v2TourEls() {
  const root = v2Tour.root;
  const q = (name) => root.querySelector(`[data-tour="${name}"]`);
  return {
    stage: q('stage'), frames: q('frames'), overlay: q('overlay'), markers: q('markers'), spot: q('spot'),
    loading: q('loading'), changes: q('changes'), hint: q('hint'), copy: q('copy'),
    back: q('back'), next: q('next'),
    oldFrame: root.querySelector('.v2t-frame--old'), newFrame: root.querySelector('.v2t-frame--new'),
    range: root.querySelector('.v2t-range'),
  };
}

// The frames render the app at a fixed width and are scaled down to fit the stage, so the
// layout is the real desktop (or, on a phone, the real phone) layout.
function layoutV2Tour() {
  if (!v2Tour) return;
  const { stage, frames, oldFrame, newFrame } = v2TourEls();
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  const frameWidth = width < 620 ? 400 : 1200;
  const scale = width / frameWidth;
  const frameHeight = Math.ceil(height / scale);
  v2Tour.scale = scale;
  frames.style.width = `${frameWidth}px`;
  frames.style.height = `${frameHeight}px`;
  frames.style.transform = `scale(${scale})`;
  [oldFrame, newFrame].forEach((frame) => {
    frame.style.width = `${frameWidth}px`;
    frame.style.height = `${frameHeight}px`;
  });
  placeV2TourMarkers();
}

function setV2TourPos(value) {
  const pos = Math.max(0, Math.min(100, value));
  v2Tour.pos = pos;
  const { stage, range } = v2TourEls();
  stage.style.setProperty('--pos', `${pos}%`);
  range.value = String(pos);
  stage.classList.toggle('is-all-new', pos <= 2);
  stage.classList.toggle('is-all-old', pos >= 98);
}

function animateV2TourPos(to, duration = 900) {
  cancelAnimationFrame(v2Tour.frame);
  if (v2TourReducedMotion()) {
    setV2TourPos(to);
    return Promise.resolve();
  }
  const from = v2Tour.pos;
  const start = performance.now();
  return new Promise((resolve) => {
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV2TourPos(from + (to - from) * eased);
      if (t < 1) v2Tour.frame = requestAnimationFrame(tick);
      else resolve();
    };
    v2Tour.frame = requestAnimationFrame(tick);
  });
}

function v2TourFrameDoc(frame) {
  try {
    return frame.contentDocument;
  } catch (error) {
    return null;
  }
}

function showV2TourTab(frame, tab) {
  const doc = v2TourFrameDoc(frame);
  if (!doc) return;
  doc.querySelector(`[data-tab="${tab}"]`)?.click();
  frame.contentWindow.scrollTo(0, 0);
}

// The changes that exist on this person's page (no calendar events means no event chips).
function v2TourAvailableChanges(step) {
  const doc = v2TourFrameDoc(v2TourEls().newFrame);
  if (!doc) return [];
  return step.changes.filter((change) => {
    const el = doc.querySelector(change.sel);
    return el && el.getClientRects().length;
  });
}

function placeV2TourMarkers() {
  if (!v2Tour?.ready) return;
  const { markers, newFrame, spot } = v2TourEls();
  const doc = v2TourFrameDoc(newFrame);
  const scale = v2Tour.scale;
  markers.innerHTML = '';
  if (!doc) return;
  v2Tour.changes.forEach((change, i) => {
    if (v2Tour.focus != null && v2Tour.focus !== i) return;
    const el = doc.querySelector(change.sel);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const top = r.top * scale;
    // Top-right corner: for anything wide that's on the new-look side of the line.
    const left = Math.min(r.right * scale - 18, markers.clientWidth - 30);
    if (top < -4 || top > markers.clientHeight - 20) return; // off-screen until you pick it
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = `v2t-marker${v2Tour.focus === i ? ' is-active' : ''}`;
    marker.dataset.change = String(i);
    marker.textContent = String(i + 1);
    marker.setAttribute('aria-label', change.label);
    marker.style.left = `${Math.max(6, left)}px`;
    marker.style.top = `${Math.max(6, top - 8)}px`;
    markers.appendChild(marker);
  });
  placeV2TourSpot();
}

function placeV2TourSpot() {
  const { spot, newFrame } = v2TourEls();
  const el = v2Tour.focus == null ? null : v2TourFrameDoc(newFrame)?.querySelector(v2Tour.changes[v2Tour.focus]?.sel);
  if (!el) {
    spot.hidden = true;
    return;
  }
  const scale = v2Tour.scale;
  const r = el.getBoundingClientRect();
  const pad = 6;
  spot.hidden = false;
  spot.style.left = `${r.left * scale - pad}px`;
  spot.style.top = `${r.top * scale - pad}px`;
  spot.style.width = `${r.width * scale + pad * 2}px`;
  spot.style.height = `${r.height * scale + pad * 2}px`;
}

// While the preview scrolls to a change, the spotlight follows it every frame, so it is on
// the element from the first frame instead of appearing once the scroll has finished.
function followV2TourSpot() {
  cancelAnimationFrame(v2Tour.spotFrame);
  const { newFrame } = v2TourEls();
  let lastY = null;
  let still = 0;
  const tick = () => {
    if (!v2Tour) return;
    placeV2TourSpot();
    const y = newFrame.contentWindow?.scrollY ?? 0;
    still = y === lastY ? still + 1 : 0;
    lastY = y;
    if (still < 6) v2Tour.spotFrame = requestAnimationFrame(tick);
    else placeV2TourMarkers();
  };
  v2Tour.spotFrame = requestAnimationFrame(tick);
}

function renderV2TourChanges() {
  const { changes, hint } = v2TourEls();
  const step = V2_TOUR_STEPS[v2Tour.step];
  changes.innerHTML = v2Tour.changes.map((change, i) => `
    <li>
      <button class="v2t-change${v2Tour.focus === i ? ' is-active' : ''}" type="button" data-change="${i}" aria-pressed="${v2Tour.focus === i}">
        <span class="v2t-change-num">${i + 1}</span>
        <span class="v2t-change-copy">
          <span class="v2t-change-label">${escapeHtml(change.label)}</span>
          <span class="v2t-change-text">${escapeHtml(change.text)}</span>
        </span>
      </button>
    </li>`).join('');
  changes.hidden = !v2Tour.changes.length;
  hint.textContent = step.final
    ? ''
    : v2Tour.focus == null
    ? 'Drag the line to compare. Pick a change to zoom in on it.'
    : 'Pick it again, or drag the line, to go back to comparing.';
}

function focusV2TourChange(index) {
  if (!v2Tour?.ready) return;
  const { newFrame } = v2TourEls();
  if (v2Tour.focus === index || index == null) {
    v2Tour.focus = null;
    placeV2TourSpot();
    v2TourEls().markers.innerHTML = '';
    newFrame.contentWindow.scrollTo({ top: 0, behavior: v2TourReducedMotion() ? 'auto' : 'smooth' });
    renderV2TourChanges();
    animateV2TourPos(50, 350);
    followV2TourSpot();
    return;
  }
  v2Tour.focus = index;
  renderV2TourChanges();
  v2TourEls().markers.innerHTML = '';
  const doc = v2TourFrameDoc(newFrame);
  const el = doc?.querySelector(v2Tour.changes[index].sel);
  if (el) {
    const r = el.getBoundingClientRect();
    const viewHeight = newFrame.contentWindow.innerHeight;
    const top = newFrame.contentWindow.scrollY + r.top;
    // Centre it if it fits, otherwise show its top.
    const target = r.height < viewHeight * 0.8 ? top - (viewHeight - r.height) / 2 : top - 40;
    newFrame.contentWindow.scrollTo({ top: Math.max(0, target), behavior: v2TourReducedMotion() ? 'auto' : 'smooth' });
  }
  setV2TourPos(0);
  placeV2TourSpot();
  followV2TourSpot();
}

function setV2TourCopy(step) {
  const { copy } = v2TourEls();
  copy.querySelector('.v2t-title').textContent = step.title;
  copy.querySelector('.v2t-body').textContent = step.body;
}

async function goToV2TourStep(index) {
  if (!v2Tour) return;
  const last = V2_TOUR_STEPS.length - 1;
  v2Tour.step = Math.max(0, Math.min(last, index));
  const step = V2_TOUR_STEPS[v2Tour.step];
  const { stage, back, next, oldFrame, newFrame } = v2TourEls();
  v2Tour.root.querySelectorAll('.v2t-seg').forEach((seg, i) => {
    seg.classList.toggle('is-active', i === v2Tour.step);
    seg.classList.toggle('is-done', i < v2Tour.step);
    seg.setAttribute('aria-current', i === v2Tour.step ? 'step' : 'false');
  });
  back.hidden = v2Tour.step === 0;
  next.textContent = step.final ? 'Switch to the new look' : 'Next';
  stage.classList.toggle('is-final', Boolean(step.final));
  setV2TourCopy(step);
  v2Tour.focus = null;
  v2Tour.changes = [];
  cancelAnimationFrame(v2Tour.spotFrame);
  v2TourEls().spot.hidden = true;
  renderV2TourChanges();
  if (!v2Tour.ready) return;

  showV2TourTab(oldFrame, step.tab);
  showV2TourTab(newFrame, step.tab);
  v2Tour.changes = v2TourAvailableChanges(step);
  renderV2TourChanges();
  v2TourEls().markers.innerHTML = '';
  if (step.final) {
    await animateV2TourPos(0, 600);
    return;
  }
  // Each page opens on the old look, then the new look wipes in over it.
  setV2TourPos(100);
  await new Promise((resolve) => setTimeout(resolve, 250));
  await animateV2TourPos(50, 1100);
  placeV2TourMarkers();
}

function closeV2Tour({ snooze = true } = {}) {
  if (!v2Tour) return;
  cancelAnimationFrame(v2Tour.frame);
  cancelAnimationFrame(v2Tour.spotFrame);
  if (snooze) safeSetItem(V2_TOUR_SNOOZE_KEY, String(Date.now()));
  window.removeEventListener('resize', v2Tour.onResize);
  document.removeEventListener('keydown', handleV2TourKeydown, true);
  v2Tour.root.remove();
  document.body.style.overflow = '';
  const lastFocus = v2Tour.lastFocus;
  v2Tour = null;
  lastFocus?.focus?.();
}

function switchFromTourToV2() {
  const { next } = v2TourEls();
  next.disabled = true;
  next.textContent = 'Switching…';
  v2Tour.root.classList.add('is-leaving');
  setTimeout(() => {
    closeV2Tour({ snooze: false });
    setUiVersion('v2');
  }, v2TourReducedMotion() ? 0 : 320);
}

function handleV2TourKeydown(event) {
  if (!v2Tour) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeV2Tour();
    return;
  }
  if (event.key === 'Tab') {
    const focusable = Array.from(v2Tour.root.querySelectorAll('button:not([disabled]):not([hidden]), input'))
      .filter((el) => el.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
    return;
  }
  if (event.target.closest?.('.v2t-range')) return;
  if (event.key === 'ArrowRight') goToV2TourStep(v2Tour.step + 1);
  if (event.key === 'ArrowLeft') goToV2TourStep(v2Tour.step - 1);
}

function waitForV2TourFrame(frame, url) {
  return new Promise((resolve) => {
    frame.addEventListener('load', async () => {
      try {
        await frame.contentDocument.fonts?.ready;
      } catch (error) {}
      resolve();
    }, { once: true });
    frame.src = url;
  });
}

async function openV2Tour() {
  if (v2Tour) return;
  const root = document.createElement('div');
  root.className = 'v2t';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'v2t-title');
  root.tabIndex = -1;
  root.innerHTML = v2TourHtml();
  document.body.appendChild(root);
  document.body.style.overflow = 'hidden';
  v2Tour = { root, step: 0, pos: 100, focus: null, changes: [], ready: false, scale: 1, frame: 0, spotFrame: 0, lastFocus: document.activeElement };

  root.addEventListener('click', (event) => {
    const target = event.target.closest('[data-tour], [data-step], [data-change]');
    if (!target || !v2Tour) return;
    const action = target.dataset.tour;
    if (action === 'later') closeV2Tour();
    else if (action === 'back') goToV2TourStep(v2Tour.step - 1);
    else if (action === 'next') {
      if (V2_TOUR_STEPS[v2Tour.step].final) switchFromTourToV2();
      else goToV2TourStep(v2Tour.step + 1);
    } else if (target.dataset.step !== undefined) goToV2TourStep(Number(target.dataset.step));
    else if (target.dataset.change !== undefined) focusV2TourChange(Number(target.dataset.change));
  });
  const { range, oldFrame, newFrame, loading } = v2TourEls();
  range.addEventListener('input', () => {
    cancelAnimationFrame(v2Tour.frame);
    if (v2Tour.focus != null) {
      v2Tour.focus = null;
      newFrame.contentWindow?.scrollTo(0, 0);
      renderV2TourChanges();
      setTimeout(placeV2TourMarkers, 50);
    }
    setV2TourPos(Number(range.value));
  });
  let resizeTimer = 0;
  v2Tour.onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutV2Tour, 120);
  };
  window.addEventListener('resize', v2Tour.onResize);
  document.addEventListener('keydown', handleV2TourKeydown, true);

  layoutV2Tour();
  setV2TourPos(100);
  goToV2TourStep(0);
  requestAnimationFrame(() => {
    root.classList.add('is-open');
    root.focus({ preventScroll: true });
  });

  await Promise.all([
    waitForV2TourFrame(oldFrame, v2TourPreviewUrl('v1')),
    waitForV2TourFrame(newFrame, v2TourPreviewUrl('v2')),
  ]);
  if (!v2Tour || v2Tour.root !== root) return;
  v2Tour.ready = true;
  layoutV2Tour();
  loading.hidden = true;
  goToV2TourStep(v2Tour.step);
}

function shouldAutoOpenV2Tour() {
  if (isUiV2() || safeGetItem(V2_TRIED_KEY)) return false;
  const snoozedAt = Number(safeGetItem(V2_TOUR_SNOOZE_KEY));
  if (snoozedAt && Date.now() - snoozedAt < V2_TOUR_SNOOZE_MS) return false;
  // Don't stack on top of another dialog (first-launch setup, a subject being edited, ...).
  return !document.querySelector('.modal.is-open');
}

function initV2Tour() {
  document.getElementById('v2-banner')?.addEventListener('click', () => openV2Tour());
  setTimeout(() => {
    if (shouldAutoOpenV2Tour()) openV2Tour();
  }, 900);
}
