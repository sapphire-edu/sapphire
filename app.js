const STORAGE_KEY = 'nsw-grade-tracker-v1';
const THEME_KEY = 'nsw-grade-theme';
const THEME_VARIANT_KEY = 'sapphire-theme-variant';
const TAB_KEY = 'sapphire-active-tab';
const GRAPH_SMOOTHNESS_KEY = 'sapphire-graph-smoothness';

const palette = ['#2aa9ff', '#5ae3a1', '#f6b96e', '#c78bff', '#ff8b8b', '#56d2d2', '#ffb347', '#4dd4a8'];
const LIGHT_THEMES = ['pearl', 'mint', 'sunrise', 'sky'];
const DARK_THEMES = ['midnight', 'aurora', 'cosmic', 'sapphire'];

function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    // no-op
  }
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // no-op
  }
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    // no-op
  }
}

const state = {
  data: loadData(),
  theme: loadThemeSettings(),
  graphSmoothness: loadGraphSmoothness(),
};

const elements = {
  overallLetter: document.getElementById('overall-letter'),
  overallPercent: document.getElementById('overall-percent'),
  overallSub: document.getElementById('overall-sub'),
  overallSubjects: document.getElementById('overall-subjects'),
  overallAssessments: document.getElementById('overall-assessments'),
  overallBest: document.getElementById('overall-best'),
  overallGradeSquare: document.getElementById('overall-grade-square'),
  topSubjectIcon: document.getElementById('top-subject-icon'),
  topSubjectName: document.getElementById('top-subject-name'),
  topSubjectGrade: document.getElementById('top-subject-grade'),
  topSubjectFooter: document.getElementById('top-subject-footer'),
  latestName: document.getElementById('latest-name'),
  latestScore: document.getElementById('latest-score'),
  latestMeta: document.getElementById('latest-meta'),
  upcomingList: document.getElementById('upcoming-list'),
  upcomingAdd: document.getElementById('upcoming-add'),
  subjectGrid: document.getElementById('subjects-grid'),
  assessmentTable: document.getElementById('assessment-table'),
  overallChart: document.getElementById('overall-chart'),
  progressLegend: document.getElementById('progress-legend'),
  subjectsChart: document.getElementById('subjects-chart'),
  subjectsLegend: document.getElementById('subjects-legend'),
  subjectsKey: document.getElementById('subjects-key'),
  insightList: document.getElementById('insight-list'),
  themeOpen: document.getElementById('theme-open'),
  themeModal: document.getElementById('theme-modal'),
  resetData: document.getElementById('reset-data'),
  subjectForm: document.getElementById('subject-form'),
  subjectMessage: document.getElementById('subject-message'),
  subjectModal: document.getElementById('subject-modal'),
  subjectModalBody: document.getElementById('subject-modal-body'),
  subjectModalTitle: document.getElementById('subject-modal-title'),
  subjectModalMeta: document.getElementById('subject-modal-meta'),
  assessmentModal: document.getElementById('assessment-modal'),
  assessmentForm: document.getElementById('assessment-form'),
  assessmentMessage: document.getElementById('assessment-message'),
  assessmentSubjectName: document.getElementById('assessment-subject-name'),
  assessmentSubjectId: document.getElementById('assessment-subject-id'),
  upcomingModal: document.getElementById('upcoming-modal'),
  upcomingForm: document.getElementById('upcoming-form'),
  upcomingMessage: document.getElementById('upcoming-message'),
  upcomingSubjectSelect: document.getElementById('upcoming-subject-select'),
  chartTooltip: document.getElementById('chart-tooltip'),
  themeButtons: document.querySelectorAll('[data-theme-variant]'),
  navItems: document.querySelectorAll('[data-tab]'),
  views: document.querySelectorAll('[data-view]'),
  calendarMonth: document.getElementById('calendar-month'),
  calendarGrid: document.getElementById('calendar-grid'),
  calendarPrev: document.getElementById('calendar-prev'),
  calendarNext: document.getElementById('calendar-next'),
  graphSmoothnessRange: document.getElementById('graph-smoothness'),
  graphSmoothnessValue: document.getElementById('graph-smoothness-value'),
};

const now = new Date();
const today = dateKeyFromParts(now.getFullYear(), now.getMonth(), now.getDate());
const todayValue = dateStringValue(today);
const calendarState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
};

let activeSubjectId = null;

setTheme(state.theme.mode, state.theme.variant);
initTabs();

render();
updateGraphSmoothnessUI();

window.addEventListener('resize', () => {
  renderCharts();
});

if (elements.themeButtons) {
  elements.themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.themeMode || 'light';
      const variant = button.dataset.themeVariant || resolveVariant(mode);
      setTheme(mode, variant);
      renderCharts();
      renderCalendar();
      if (elements.themeModal?.classList.contains('is-open')) {
        closeModal(elements.themeModal);
      }
    });
  });
}

if (elements.graphSmoothnessRange) {
  elements.graphSmoothnessRange.addEventListener('input', (event) => {
    const value = Number(event.target.value);
    setGraphSmoothness(value / 100);
  });
}

if (elements.themeOpen) {
  elements.themeOpen.addEventListener('click', () => openModal(elements.themeModal));
}

if (elements.themeModal) {
  elements.themeModal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    if (actionTarget.dataset.action === 'close-themes') {
      closeModal(elements.themeModal);
    }
  });
}

if (elements.resetData) {
  elements.resetData.addEventListener('click', () => {
    if (confirm('Reset all stored grades? This cannot be undone.')) {
      state.data = { subjects: [] };
      saveData(state.data);
      render();
    }
  });
}

if (elements.upcomingAdd) {
  elements.upcomingAdd.addEventListener('click', () => {
    openUpcomingModal();
  });
}

if (elements.upcomingModal) {
  elements.upcomingModal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    if (actionTarget.dataset.action === 'close-upcoming') {
      closeUpcomingModal();
    }
  });
}

if (elements.upcomingForm) {
  elements.upcomingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(elements.upcomingForm);
    const subjectId = String(formData.get('subjectId') || '').trim();
    const upcomingName = String(formData.get('upcomingName') || '').trim();
    const upcomingDate = String(formData.get('upcomingDate') || '').trim();
    const upcomingNotes = String(formData.get('upcomingNotes') || '').trim();

    if (!subjectId) {
      return setUpcomingMessage('Choose a subject first.');
    }
    const subject = state.data.subjects.find((item) => item.id === subjectId);
    if (!subject) {
      return setUpcomingMessage('Select a valid subject.');
    }
    if (!upcomingName) {
      return setUpcomingMessage('Please enter an assessment name.');
    }
    if (!upcomingDate) {
      return setUpcomingMessage('Please choose a due date.');
    }

    subject.upcoming = Array.isArray(subject.upcoming) ? subject.upcoming : [];
    subject.upcoming.push({
      id: cryptoRandomId(),
      name: upcomingName,
      date: upcomingDate,
      notes: upcomingNotes,
      createdAt: Date.now(),
    });

    saveData(state.data);
    render();
    closeUpcomingModal();
  });
}

if (elements.subjectForm) {
  elements.subjectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(elements.subjectForm);
    const subjectName = String(formData.get('subjectName') || '').trim();

    if (!subjectName) {
      return setSubjectMessage('Please enter a subject name.');
    }

    const existing = state.data.subjects.find((subject) => subject.name.toLowerCase() === subjectName.toLowerCase());
    if (existing) {
      return setSubjectMessage('That subject already exists.');
    }

    getOrCreateSubject(subjectName);
    saveData(state.data);
    elements.subjectForm.reset();
    setSubjectMessage('Subject added.');
    render();
  });
}

if (elements.subjectGrid) {
  elements.subjectGrid.addEventListener('click', (event) => {
    const openButton = event.target.closest('[data-action="open-subject"]');
    if (openButton) {
      openSubjectModal(openButton.dataset.id);
    }
  });
}

if (elements.subjectModal) {
  elements.subjectModal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;

    if (action === 'close-subject') {
      closeSubjectModal();
      return;
    }

    if (action === 'open-assessment') {
      if (activeSubjectId) {
        openAssessmentModal(activeSubjectId);
      }
      return;
    }

    if (action === 'open-upcoming') {
      if (activeSubjectId) {
        openUpcomingModal(activeSubjectId);
      } else {
        openUpcomingModal();
      }
      return;
    }

    if (action === 'set-subject-color') {
      const subjectId = actionTarget.dataset.id || activeSubjectId;
      const color = actionTarget.dataset.color;
      if (subjectId && color) {
        applySubjectColor(subjectId, color);
      }
      return;
    }

    if (action === 'delete-subject') {
      if (!activeSubjectId) return;
      if (!confirm('Delete this subject and all assessments?')) return;
      state.data.subjects = state.data.subjects.filter((subject) => subject.id !== activeSubjectId);
      saveData(state.data);
      closeSubjectModal();
      render();
      return;
    }

    if (action === 'delete-assessment') {
      const subjectId = actionTarget.dataset.subjectId;
      const assessmentId = actionTarget.dataset.assessmentId;
      const subject = state.data.subjects.find((item) => item.id === subjectId);
      if (!subject) return;
      subject.assessments = subject.assessments.filter((item) => item.id !== assessmentId);
      saveData(state.data);
      render();
      openSubjectModal(subjectId);
    }

    if (action === 'delete-upcoming') {
      const subjectId = actionTarget.dataset.subjectId;
      const upcomingId = actionTarget.dataset.upcomingId;
      removeUpcoming(subjectId, upcomingId);
    }
  });
}

if (elements.subjectModal) {
  elements.subjectModal.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.name !== 'subjectColor') return;
    const subjectId = target.dataset.subjectId || activeSubjectId;
    const color = target.value;
    if (subjectId && color) {
      applySubjectColor(subjectId, color);
    }
  });
}

if (elements.assessmentModal) {
  elements.assessmentModal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;
    if (action === 'close-assessment') {
      closeAssessmentModal();
    }
  });
}

if (elements.upcomingList) {
  elements.upcomingList.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    if (actionTarget.dataset.action === 'delete-upcoming') {
      const subjectId = actionTarget.dataset.subjectId;
      const upcomingId = actionTarget.dataset.upcomingId;
      removeUpcoming(subjectId, upcomingId);
    }
  });
}

if (elements.calendarPrev) {
  elements.calendarPrev.addEventListener('click', () => {
    calendarState.month -= 1;
    if (calendarState.month < 0) {
      calendarState.month = 11;
      calendarState.year -= 1;
    }
    renderCalendar();
  });
}

if (elements.calendarNext) {
  elements.calendarNext.addEventListener('click', () => {
    calendarState.month += 1;
    if (calendarState.month > 11) {
      calendarState.month = 0;
      calendarState.year += 1;
    }
    renderCalendar();
  });
}

if (elements.assessmentForm) {
  elements.assessmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(elements.assessmentForm);
    const subjectId = String(formData.get('subjectId') || '').trim();
    const assessmentName = String(formData.get('assessment') || '').trim();
    const score = parseFloat(formData.get('score'));
    const total = parseFloat(formData.get('total'));
    const weightInput = formData.get('weight');
    const weight = weightInput === '' ? null : parseFloat(weightInput);
    const date = String(formData.get('date') || today);

    const subject = state.data.subjects.find((item) => item.id === subjectId);
    if (!subject) {
      return setAssessmentMessage('Select a subject before adding an assessment.');
    }
    if (!assessmentName) {
      return setAssessmentMessage('Please enter an assessment name.');
    }
    if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
      return setAssessmentMessage('Please enter a valid score and total.');
    }
    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
      return setAssessmentMessage('Weighting must be a positive number.');
    }

    subject.assessments.push({
      id: cryptoRandomId(),
      name: assessmentName,
      score,
      total,
      weight,
      date,
      createdAt: Date.now(),
    });

    saveData(state.data);
    render();
    closeAssessmentModal();
    openSubjectModal(subjectId);
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (elements.themeModal?.classList.contains('is-open')) {
    closeModal(elements.themeModal);
    return;
  }
  if (elements.upcomingModal?.classList.contains('is-open')) {
    closeUpcomingModal();
    return;
  }
  if (elements.assessmentModal?.classList.contains('is-open')) {
    closeAssessmentModal();
    return;
  }
  if (elements.subjectModal?.classList.contains('is-open')) {
    closeSubjectModal();
  }
});

if (elements.subjectGrid) {
  elements.subjectGrid.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const subjectId = target.dataset.id;
    if (action === 'delete-subject') {
      if (!confirm('Delete this subject and all assessments?')) return;
      state.data.subjects = state.data.subjects.filter((subject) => subject.id !== subjectId);
      saveData(state.data);
      render();
    }
    if (action === 'delete-assessment') {
      const assessmentId = target.dataset.assessmentId;
      const subject = state.data.subjects.find((item) => item.id === target.dataset.subjectId);
      if (!subject) return;
      subject.assessments = subject.assessments.filter((item) => item.id !== assessmentId);
      saveData(state.data);
      render();
      if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId === subjectId) {
        openSubjectModal(subjectId);
      }
    }
  });
}

if (elements.assessmentTable) {
  elements.assessmentTable.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'delete-assessment') {
      const subjectId = target.dataset.subjectId;
      const assessmentId = target.dataset.assessmentId;
      const subject = state.data.subjects.find((item) => item.id === subjectId);
      if (!subject) return;
      subject.assessments = subject.assessments.filter((item) => item.id !== assessmentId);
      saveData(state.data);
      render();
    }
  });
}

function loadData() {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return { subjects: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.subjects)) return { subjects: [] };
    const now = new Date();
    const todayValue = dateKeyFromParts(now.getFullYear(), now.getMonth(), now.getDate());
    const subjects = parsed.subjects.map((subject, index) => {
      const assessments = Array.isArray(subject.assessments) ? subject.assessments : [];
      const upcoming = Array.isArray(subject.upcoming) ? subject.upcoming : [];
      return {
        id: subject.id || cryptoRandomId(),
        name: subject.name || 'Untitled Subject',
        color: subject.color || palette[index % palette.length],
        assessments: assessments.map((assessment, assessmentIndex) => {
          const date = assessment.date || todayValue;
          const dateValue = new Date(date).getTime();
          const createdAt = Number.isFinite(assessment.createdAt)
            ? assessment.createdAt
            : Number.isFinite(dateValue)
            ? dateValue - assessmentIndex
            : Date.now() - assessmentIndex;
          return {
            id: assessment.id || cryptoRandomId(),
            name: assessment.name || 'Assessment',
            score: Number.isFinite(assessment.score) ? assessment.score : 0,
            total: Number.isFinite(assessment.total) ? assessment.total : 0,
            weight: assessment.weight === undefined ? null : assessment.weight,
            date,
            createdAt,
          };
        }),
        upcoming: upcoming.map((item, upcomingIndex) => {
          const date = item.date || todayValue;
          const dateValue = dateStringValue(date);
          const createdAt = Number.isFinite(item.createdAt)
            ? item.createdAt
            : Number.isFinite(dateValue)
            ? dateValue - upcomingIndex
            : Date.now() - upcomingIndex;
          return {
            id: item.id || cryptoRandomId(),
            name: item.name || 'Upcoming assessment',
            date,
            notes: item.notes || '',
            createdAt,
          };
        }),
      };
    });
    return { subjects };
  } catch (error) {
    return { subjects: [] };
  }
}

function saveData(data) {
  safeSetItem(STORAGE_KEY, JSON.stringify(data));
}

function loadThemeSettings() {
  const storedMode = safeGetItem(THEME_KEY);
  const storedVariant = safeGetItem(THEME_VARIANT_KEY);
  const mode =
    storedMode === 'light' || storedMode === 'dark'
      ? storedMode
      : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  const variant = resolveVariant(mode, storedVariant);
  return { mode, variant };
}

function loadGraphSmoothness() {
  const stored = safeGetItem(GRAPH_SMOOTHNESS_KEY);
  const value = stored === null ? 0.35 : parseFloat(stored);
  if (!Number.isFinite(value)) return 0.35;
  return clamp(value, 0, 1);
}

function resolveVariant(mode, variant) {
  const list = mode === 'dark' ? DARK_THEMES : LIGHT_THEMES;
  if (variant && list.includes(variant)) return variant;
  return list[0];
}

function setTheme(mode, variant) {
  const resolved = resolveVariant(mode, variant);
  document.documentElement.dataset.theme = mode;
  document.documentElement.dataset.themeVariant = resolved;
  safeSetItem(THEME_KEY, mode);
  safeSetItem(THEME_VARIANT_KEY, resolved);
  updateThemeButtons();
}

function setGraphSmoothness(value) {
  const clamped = clamp(value, 0, 1);
  state.graphSmoothness = clamped;
  safeSetItem(GRAPH_SMOOTHNESS_KEY, clamped.toFixed(2));
  updateGraphSmoothnessUI();
  renderCharts();
}

function updateGraphSmoothnessUI() {
  if (!elements.graphSmoothnessRange || !elements.graphSmoothnessValue) return;
  const percent = Math.round(state.graphSmoothness * 100);
  elements.graphSmoothnessRange.value = String(percent);
  elements.graphSmoothnessValue.textContent = `${percent}%`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateThemeButtons() {
  if (!elements.themeButtons) return;
  const mode = document.documentElement.dataset.theme;
  const variant = document.documentElement.dataset.themeVariant;
  elements.themeButtons.forEach((button) => {
    button.classList.toggle(
      'is-active',
      button.dataset.themeMode === mode && button.dataset.themeVariant === variant
    );
  });
}

function initTabs() {
  if (!elements.navItems || elements.navItems.length === 0) return;
  const saved = safeGetItem(TAB_KEY);
  const initial = saved && document.querySelector(`[data-view="${saved}"]`) ? saved : 'dashboard';
  setActiveTab(initial);
  elements.navItems.forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button.dataset.tab));
  });
}

function setActiveTab(tab) {
  elements.navItems.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tab === tab);
  });
  elements.views.forEach((view) => {
    view.classList.toggle('is-active', view.dataset.view === tab);
  });
  safeSetItem(TAB_KEY, tab);
  renderCharts();
  renderCalendar();
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  hideChartTooltip();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  const anyOpen = document.querySelector('.modal.is-open');
  if (!anyOpen) {
    document.body.classList.remove('modal-open');
  }
  hideChartTooltip();
}

function openSubjectModal(subjectId) {
  if (!elements.subjectModal) return;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject) return;

  activeSubjectId = subjectId;
  const stats = subjectStats(subject);
  const averageText = stats.average === null ? '--' : `${stats.average.toFixed(1)}%`;
  const gradeText = stats.grade ?? '--';
  const subjectColor = subject.color || palette[0];
  const swatchHtml = palette
    .map((color) => {
      const activeClass = color.toLowerCase() === subjectColor.toLowerCase() ? ' is-active' : '';
      return `
        <button class="color-swatch${activeClass}" type="button" data-action="set-subject-color" data-color="${color}" data-id="${subject.id}" style="--swatch:${color}" aria-label="Set subject color to ${color}"></button>
      `;
    })
    .join('');

  elements.subjectModalTitle.textContent = subject.name;
  if (elements.subjectModalMeta) {
    elements.subjectModalMeta.textContent = `${averageText} · ${gradeText} · ${subject.assessments.length} assessments`;
  }

  const history = sortAssessments(subject.assessments).reverse();
  const historyHtml = history.length
    ? history
        .map((assessment) => {
          const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
          const grade = getLetterGrade(percent);
          const weight = assessment.weight === null ? '' : ` · W${assessment.weight}`;
          return `
            <div class="history-item">
              <div>
                <div class="history-name">${assessment.name}</div>
                <div class="history-meta">${assessment.score} / ${assessment.total} · ${percent.toFixed(1)}% · ${grade}${weight}</div>
              </div>
              <div class="history-right">
                <div class="history-date">${formatDate(assessment.date)}</div>
                <button class="delete-button" data-action="delete-assessment" data-subject-id="${subject.id}" data-assessment-id="${assessment.id}">Remove</button>
              </div>
            </div>
          `;
        })
        .join('')
    : '<div class="empty-state">No assessments yet.</div>';
  const upcomingItems = sortUpcoming(expandUpcomingItems(subject));
  const upcomingHtml = buildUpcomingList(upcomingItems, { showSubject: false, allowRemove: true });

  if (elements.subjectModalBody) {
    elements.subjectModalBody.innerHTML = `
      <div class="modal-chart">
        <canvas id="subject-modal-chart"></canvas>
      </div>
      <div class="subject-color-panel">
        <div class="subject-color-header">
          <div>
            <div class="section-eyebrow">Subject color</div>
            <div class="subject-color-meta">Used across cards and charts.</div>
          </div>
          <div class="color-control">
            <input class="color-input" type="color" name="subjectColor" value="${subjectColor}" data-subject-id="${subject.id}" aria-label="Subject color" />
            <span class="color-value" data-role="color-value">${subjectColor.toUpperCase()}</span>
          </div>
        </div>
        <div class="color-swatches">
          ${swatchHtml}
        </div>
      </div>
      <div class="modal-actions">
        <button class="primary-button" type="button" data-action="open-assessment">Add Assessment</button>
        <button class="ghost-button" type="button" data-action="open-upcoming">Add Upcoming</button>
        <button class="ghost-button" type="button" data-action="delete-subject">Delete Subject</button>
      </div>
      <div class="subject-upcoming">
        <div class="history-title">Upcoming assessments</div>
        <div class="upcoming-list">
          ${upcomingHtml}
        </div>
      </div>
      <div class="subject-history">
        <div class="history-title">Assessment history</div>
        <div class="history-list">${historyHtml}</div>
      </div>
    `;
  }

  openModal(elements.subjectModal);

  const chartCanvas = elements.subjectModalBody?.querySelector('#subject-modal-chart');
  if (chartCanvas) {
    const points = sortAssessments(subject.assessments).map((assessment) => ({
      value: assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0,
      label: assessment.name,
    }));
    drawLineChart(chartCanvas, points, { stroke: subject.color, showAxis: true });
  }
}

function closeSubjectModal() {
  closeAssessmentModal();
  closeUpcomingModal();
  closeModal(elements.subjectModal);
  activeSubjectId = null;
}

function openAssessmentModal(subjectId) {
  if (!elements.assessmentModal || !elements.assessmentForm) return;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject) return;
  activeSubjectId = subjectId;
  elements.assessmentForm.reset();
  if (elements.assessmentSubjectId) {
    elements.assessmentSubjectId.value = subjectId;
  }
  if (elements.assessmentSubjectName) {
    elements.assessmentSubjectName.textContent = subject.name;
  }
  const dateInput = elements.assessmentForm.querySelector('input[name="date"]');
  if (dateInput) {
    dateInput.value = today;
  }
  setAssessmentMessage('');
  openModal(elements.assessmentModal);
}

function closeAssessmentModal() {
  closeModal(elements.assessmentModal);
  setAssessmentMessage('');
}

function openUpcomingModal(subjectId = null) {
  if (!elements.upcomingModal || !elements.upcomingForm) return;
  if (!state.data.subjects.length) {
    setUpcomingMessage('Add a subject first.');
    return;
  }
  elements.upcomingForm.reset();
  renderUpcomingSubjectSelect();
  if (elements.upcomingSubjectSelect) {
    const preferred = subjectId || elements.upcomingSubjectSelect.value;
    if (preferred) {
      elements.upcomingSubjectSelect.value = preferred;
    }
  }
  const dateInput = elements.upcomingForm.querySelector('input[name="upcomingDate"]');
  if (dateInput) {
    dateInput.value = today;
  }
  setUpcomingMessage('');
  openModal(elements.upcomingModal);
}

function closeUpcomingModal() {
  closeModal(elements.upcomingModal);
  setUpcomingMessage('');
}

function showChartTooltip(text, x, y) {
  if (!elements.chartTooltip) return;
  elements.chartTooltip.textContent = text;
  elements.chartTooltip.style.left = `${x}px`;
  elements.chartTooltip.style.top = `${y}px`;
  elements.chartTooltip.classList.add('is-visible');
  elements.chartTooltip.setAttribute('aria-hidden', 'false');
}

function hideChartTooltip() {
  if (!elements.chartTooltip) return;
  elements.chartTooltip.classList.remove('is-visible');
  elements.chartTooltip.setAttribute('aria-hidden', 'true');
}

function bindChartHover(canvas) {
  if (!canvas || canvas.dataset.hoverBound) return;
  canvas.dataset.hoverBound = 'true';

  canvas.addEventListener('mousemove', (event) => {
    const points = canvas._chartPoints;
    if (!points || points.length === 0) {
      hideChartTooltip();
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const nearest = points.reduce((best, point) => {
      const bestDiff = Math.abs(best.x - x);
      const nextDiff = Math.abs(point.x - x);
      return nextDiff < bestDiff ? point : best;
    });

    const label = nearest.label ? `${nearest.label} · ${nearest.value.toFixed(1)}%` : `${nearest.value.toFixed(1)}%`;
    showChartTooltip(label, rect.left + nearest.x, rect.top + nearest.y);
  });

  canvas.addEventListener('mouseleave', () => {
    hideChartTooltip();
  });
}

function setInlineMessage(target, message) {
  if (!target) return;
  target.textContent = message;
  setTimeout(() => {
    if (target.textContent === message) {
      target.textContent = '';
    }
  }, 2400);
}

function setSubjectMessage(message) {
  setInlineMessage(elements.subjectMessage, message);
}

function setAssessmentMessage(message) {
  setInlineMessage(elements.assessmentMessage, message);
}

function setUpcomingMessage(message) {
  setInlineMessage(elements.upcomingMessage, message);
}

function getOrCreateSubject(name) {
  const existing = state.data.subjects.find((subject) => subject.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  const subject = {
    id: cryptoRandomId(),
    name,
    color: palette[state.data.subjects.length % palette.length],
    assessments: [],
    upcoming: [],
  };
  state.data.subjects.push(subject);
  return subject;
}

function removeUpcoming(subjectId, upcomingId) {
  if (!subjectId || !upcomingId) return;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject || !Array.isArray(subject.upcoming)) return;
  subject.upcoming = subject.upcoming.filter((item) => item.id !== upcomingId);
  saveData(state.data);
  render();
  if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId === subjectId) {
    openSubjectModal(subjectId);
  }
}

function applySubjectColor(subjectId, color) {
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject || !color) return;
  const normalized = String(color).trim();
  if (!normalized) return;
  if (subject.color && subject.color.toLowerCase() === normalized.toLowerCase()) {
    updateSubjectColorUI(subjectId, normalized);
    return;
  }
  subject.color = normalized;
  saveData(state.data);
  render();
  updateSubjectColorUI(subjectId, normalized);
}

function updateSubjectColorUI(subjectId, color) {
  if (!elements.subjectModal?.classList.contains('is-open')) return;
  if (activeSubjectId !== subjectId) return;
  const input = elements.subjectModal.querySelector('input[name="subjectColor"]');
  if (input) {
    input.value = color;
  }
  const valueLabel = elements.subjectModal.querySelector('[data-role="color-value"]');
  if (valueLabel) {
    valueLabel.textContent = color.toUpperCase();
  }
  elements.subjectModal.querySelectorAll('.color-swatch').forEach((swatch) => {
    swatch.classList.toggle(
      'is-active',
      swatch.dataset.color?.toLowerCase() === color.toLowerCase()
    );
  });
  const chartCanvas = elements.subjectModal.querySelector('#subject-modal-chart');
  if (chartCanvas) {
    const subject = state.data.subjects.find((item) => item.id === subjectId);
    if (!subject) return;
    const points = sortAssessments(subject.assessments).map((assessment) => ({
      value: assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0,
      label: assessment.name,
    }));
    drawLineChart(chartCanvas, points, { stroke: subject.color, showAxis: true });
  }
}

function render() {
  renderOverview();
  renderSubjects();
  renderInsights();
  renderAssessments();
  renderUpcomingDashboard();
  renderUpcomingSubjectSelect();
  renderCharts();
  renderCalendar();
}

function renderOverview() {
  const allAssessments = getAllAssessments();
  const overallAverage = weightedAverage(allAssessments);
  const overallGrade = getLetterGrade(overallAverage);
  const subjectCount = state.data.subjects.length;
  const assessmentCount = allAssessments.length;
  const bestGrade = getBestGrade(allAssessments);

  elements.overallPercent.textContent = overallAverage === null ? '--' : overallAverage.toFixed(1);
  elements.overallLetter.textContent = overallGrade ?? '--';
  elements.overallSub.textContent = overallAverage === null
    ? 'Add your first assessment to begin.'
    : `Weighted across ${assessmentCount} assessments.`;
  elements.overallSubjects.textContent = String(subjectCount);
  elements.overallAssessments.textContent = String(assessmentCount);
  elements.overallBest.textContent = bestGrade ?? '--';

  const gradeColor = gradeColorFor(overallGrade);
  elements.overallGradeSquare.style.background = gradeColor;

  const topSubject = getTopSubject();
  if (topSubject) {
    const stats = subjectStats(topSubject);
    elements.topSubjectName.textContent = topSubject.name;
    elements.topSubjectGrade.textContent = `${stats.average.toFixed(1)}% · ${stats.grade}`;
    elements.topSubjectFooter.textContent = `${topSubject.assessments.length} assessments logged.`;
    elements.topSubjectIcon.textContent = initials(topSubject.name);
    elements.topSubjectIcon.style.background = topSubject.color;
  } else {
    elements.topSubjectName.textContent = 'No data yet';
    elements.topSubjectGrade.textContent = '--';
    elements.topSubjectFooter.textContent = 'Add assessments to see your leading subject.';
    elements.topSubjectIcon.textContent = '★';
    elements.topSubjectIcon.style.background = 'linear-gradient(135deg, var(--accent), rgba(90, 190, 255, 0.5))';
  }

  const latest = getLatestAssessment();
  if (latest) {
    const percent = latest.total > 0 ? (latest.score / latest.total) * 100 : 0;
    elements.latestName.textContent = latest.name;
    elements.latestScore.textContent = `${percent.toFixed(1)}% · ${getLetterGrade(percent)}`;
    elements.latestMeta.textContent = `${latest.subjectName} · ${formatDate(latest.date)}`;
  } else {
    elements.latestName.textContent = 'Nothing logged';
    elements.latestScore.textContent = '--';
    elements.latestMeta.textContent = 'Once you add an assessment, it will appear here.';
  }
}

function renderInsights() {
  if (!elements.insightList) return;
  const allAssessments = getAllAssessments();
  const overallAverage = weightedAverage(allAssessments);
  const overallGrade = getLetterGrade(overallAverage);
  const topSubject = getTopSubject();
  const latest = getLatestAssessment();
  const topStats = topSubject ? subjectStats(topSubject) : null;

  const latestPercent = latest && latest.total > 0 ? (latest.score / latest.total) * 100 : 0;
  const insights = [
    {
      title: 'Overall average',
      detail: overallAverage === null ? 'Add assessments to calculate.' : `${overallAverage.toFixed(1)}% · ${overallGrade}`,
    },
    {
      title: 'Top subject',
      detail: topSubject && topStats
        ? `${topSubject.name} · ${topStats.average.toFixed(1)}% · ${topStats.grade}`
        : 'No subjects yet.',
    },
    {
      title: 'Latest assessment',
      detail: latest
        ? `${latest.name} · ${latestPercent.toFixed(1)}%`
        : 'No assessments yet.',
    },
    {
      title: 'Total assessments',
      detail: allAssessments.length ? `${allAssessments.length} logged so far.` : 'Start with your first mark.',
    },
  ];

  elements.insightList.innerHTML = insights
    .map(
      (item) => `
        <div class="insight-item">
          <strong>${item.title}</strong>
          <span>${item.detail}</span>
        </div>
      `
    )
    .join('');
}

function renderSubjects() {
  if (!elements.subjectGrid) return;
  if (state.data.subjects.length === 0) {
    elements.subjectGrid.innerHTML = '<div class="empty-state">No subjects yet. Add a subject to start tracking results.</div>';
    return;
  }

  elements.subjectGrid.innerHTML = state.data.subjects
    .map((subject) => {
      const stats = subjectStats(subject);
      return `
        <button class="subject-button" type="button" data-action="open-subject" data-id="${subject.id}">
          <div class="card subject-card glow-soft" data-id="${subject.id}">
            <div class="subject-header">
              <div class="subject-info">
                <div class="subject-icon" style="background:${subject.color}">${initials(subject.name)}</div>
                <div>
                  <div class="subject-title">${subject.name}</div>
                  <div class="subject-meta">${subject.assessments.length} assessments</div>
                </div>
              </div>
            </div>
            <div class="subject-stats">
              <div class="stat-box">
                <span>Average</span>
                <strong>${stats.average === null ? '--' : `${stats.average.toFixed(1)}%`}</strong>
              </div>
              <div class="stat-box">
                <span>Grade</span>
                <strong>${stats.grade ?? '--'}</strong>
              </div>
            </div>
          </div>
        </button>
      `;
    })
    .join('');
}

function renderAssessments() {
  if (!elements.assessmentTable) return;
  const allAssessments = sortAssessments(getAllAssessments()).reverse();

  if (allAssessments.length === 0) {
    elements.assessmentTable.innerHTML = '<tr><td colspan="8" class="empty-state">No assessments logged yet.</td></tr>';
    return;
  }

  elements.assessmentTable.innerHTML = allAssessments
    .map((assessment) => {
      const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
      const grade = getLetterGrade(percent);
      return `
        <tr>
          <td>${assessment.subjectName}</td>
          <td>${assessment.name}</td>
          <td>${assessment.score} / ${assessment.total}</td>
          <td>${assessment.weight ?? '--'}</td>
          <td>${percent.toFixed(1)}%</td>
          <td><span class="badge">${grade}</span></td>
          <td>${formatDate(assessment.date)}</td>
          <td>
            <button class="delete-button" data-action="delete-assessment" data-subject-id="${assessment.subjectId}" data-assessment-id="${assessment.id}">Remove</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderUpcomingDashboard() {
  if (!elements.upcomingList) return;
  const upcoming = sortUpcoming(getUpcomingAssessments());
  if (upcoming.length === 0) {
    elements.upcomingList.innerHTML = '<div class="empty-state">No upcoming assessments yet.</div>';
  } else {
    const maxItems = 4;
    const visible = upcoming.slice(0, maxItems);
    const moreCount = upcoming.length - visible.length;
    const moreHtml = moreCount > 0 ? `<div class="upcoming-more">+${moreCount} more scheduled</div>` : '';
    elements.upcomingList.innerHTML = `${buildUpcomingList(visible, { showSubject: true, allowRemove: true })}${moreHtml}`;
  }
  if (elements.upcomingAdd) {
    elements.upcomingAdd.disabled = state.data.subjects.length === 0;
  }
}

function renderUpcomingSubjectSelect() {
  if (!elements.upcomingSubjectSelect) return;
  if (!state.data.subjects.length) {
    elements.upcomingSubjectSelect.innerHTML = '<option value="">No subjects yet</option>';
    elements.upcomingSubjectSelect.disabled = true;
    return;
  }
  elements.upcomingSubjectSelect.disabled = false;
  const currentValue = elements.upcomingSubjectSelect.value;
  elements.upcomingSubjectSelect.innerHTML = state.data.subjects
    .map((subject) => `<option value="${subject.id}">${subject.name}</option>`)
    .join('');
  if (currentValue) {
    elements.upcomingSubjectSelect.value = currentValue;
  }
}

function renderCharts() {
  renderOverallChart();
  renderSubjectCharts();
  renderSubjectsChart();
}

function renderOverallChart() {
  if (!elements.overallChart) return;
  const sorted = sortAssessments(getAllAssessments());
  const points = [];
  let runningWeight = 0;
  let runningSum = 0;

  sorted.forEach((assessment) => {
    const weight = assessment.weight === null ? 1 : assessment.weight;
    const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
    runningSum += (percent / 100) * weight;
    runningWeight += weight;
    points.push({
      value: (runningSum / runningWeight) * 100,
      label: assessment.name,
    });
  });

  if (elements.progressLegend) {
    if (points.length === 0) {
      elements.progressLegend.textContent = 'No data yet.';
    } else {
      elements.progressLegend.textContent = `Updated ${formatDate(sorted[sorted.length - 1].date)} · ${points.length} points`;
    }
  }

  drawLineChart(elements.overallChart, points, {
    stroke: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    showAxis: true,
  });
}

function renderSubjectCharts() {
  const canvases = document.querySelectorAll('canvas[data-chart="subject"]');
  canvases.forEach((canvas) => {
    const subjectId = canvas.dataset.id;
    const subject = state.data.subjects.find((item) => item.id === subjectId);
    if (!subject) return;
    const points = sortAssessments(subject.assessments).map((assessment) => ({
      value: assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0,
      label: assessment.name,
    }));
    drawLineChart(canvas, points, { stroke: subject.color, showAxis: false });
  });
}

function renderSubjectsChart() {
  if (!elements.subjectsChart) return;
  const series = state.data.subjects
    .map((subject) => ({
      name: subject.name,
      color: subject.color,
      points: sortAssessments(subject.assessments).map((assessment) => ({
        value: assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0,
        label: assessment.name,
      })),
    }))
    .filter((subject) => subject.points.length > 0);

  if (elements.subjectsLegend) {
    elements.subjectsLegend.textContent = series.length
      ? `${series.length} subject lines · Hover for assessment details.`
      : 'No subject data yet.';
  }

  if (elements.subjectsKey) {
    elements.subjectsKey.innerHTML = series
      .map(
        (subject) => `
          <div class="chart-key-item">
            <span class="chart-key-swatch" style="--swatch:${subject.color}"></span>
            ${subject.name}
          </div>
        `
      )
      .join('');
  }

  drawMultiLineChart(elements.subjectsChart, series);
}

function renderCalendar() {
  if (!elements.calendarGrid || !elements.calendarMonth) return;
  const year = calendarState.year;
  const month = calendarState.month;
  elements.calendarMonth.textContent = formatMonthYear(year, month);

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const eventsByDate = buildCalendarEvents();
  const cells = [];

  for (let index = 0; index < 42; index += 1) {
    const dayNumber = index - startOffset + 1;
    let cellMonth = month;
    let cellYear = year;
    let displayDay = dayNumber;
    let isMuted = false;

    if (dayNumber <= 0) {
      cellMonth = month - 1;
      if (cellMonth < 0) {
        cellMonth = 11;
        cellYear -= 1;
      }
      displayDay = daysInPrevMonth + dayNumber;
      isMuted = true;
    } else if (dayNumber > daysInMonth) {
      cellMonth = month + 1;
      if (cellMonth > 11) {
        cellMonth = 0;
        cellYear += 1;
      }
      displayDay = dayNumber - daysInMonth;
      isMuted = true;
    }

    const dateKey = dateKeyFromParts(cellYear, cellMonth, displayDay);
    const events = eventsByDate[dateKey] || [];
    const dayLabel = displayDay.toString();
    const isToday = dateKey === today;

    const eventsHtml = events.length
      ? `
        <div class="calendar-events">
          ${events
            .slice(0, 3)
            .map(
              (event) => `
                <div class="calendar-event${event.type === 'completed' ? ' is-completed' : ''}" style="--event-color:${event.color}">
                  <span class="calendar-event-title">${event.name}</span>
                  <span class="calendar-event-sub">${event.subject}</span>
                </div>
              `
            )
            .join('')}
          ${events.length > 3 ? `<div class="calendar-more">+${events.length - 3} more</div>` : ''}
        </div>
      `
      : '';

    cells.push(`
      <div class="calendar-cell${isMuted ? ' is-muted' : ''}${isToday ? ' is-today' : ''}">
        <div class="calendar-day">${dayLabel}</div>
        ${eventsHtml}
      </div>
    `);
  }

  elements.calendarGrid.innerHTML = cells.join('');
}

function traceSmoothLine(ctx, points, smoothness = 0.35) {
  if (!points.length) return;
  const s = clamp(smoothness, 0, 1);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length < 2) return;
  if (s === 0) {
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    return;
  }
  const factor = s / 6;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) * factor;
    const cp1y = p1.y + (p2.y - p0.y) * factor;
    const cp2x = p2.x - (p3.x - p1.x) * factor;
    const cp2y = p2.y - (p3.y - p1.y) * factor;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

function withAlpha(color, alpha) {
  const value = String(color || '').trim();
  if (!value) return `rgba(0, 0, 0, ${alpha})`;
  if (value.startsWith('rgb')) {
    const parts = value
      .replace(/rgba?\(/, '')
      .replace(')', '')
      .split(',')
      .map((item) => parseFloat(item.trim()));
    if (parts.length >= 3) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    }
  }
  if (value.startsWith('#')) {
    let hex = value.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return value;
}

function scaleValue(value, min, max, start, end) {
  if (!Number.isFinite(value) || min === max) {
    return (start + end) / 2;
  }
  return start + ((value - min) / (max - min)) * (end - start);
}

function getValueRange(points, options = {}) {
  const values = (points || [])
    .map((point) => point.value)
    .filter((value) => Number.isFinite(value));
  if (!values.length) {
    return { min: 0, max: 100 };
  }
  let minValue = Math.min(...values);
  let maxValue = Math.max(...values);
  if (minValue === maxValue) {
    minValue -= 5;
    maxValue += 5;
  }
  const range = Math.max(maxValue - minValue, 1);
  const padding = Math.max(10, range * 0.2);
  const minClamp = Number.isFinite(options.min) ? options.min : 0;
  const maxClamp = Number.isFinite(options.max) ? options.max : 100;
  let min = minValue - padding;
  let max = maxValue + padding;
  if (Number.isFinite(minClamp)) min = Math.max(minClamp, min);
  if (Number.isFinite(maxClamp)) max = Math.min(maxClamp, max);
  if (max - min < 1) {
    max = min + 1;
  }
  const tickMin = Math.ceil(min / 5) * 5;
  const tickMax = Math.floor(max / 5) * 5;
  if (tickMax - tickMin >= 10) {
    return { min: tickMin, max: tickMax };
  }
  return { min, max };
}

function buildTicks(min, max, steps = 4) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [0, 25, 50, 75, 100];
  }
  const roundedMin = Math.floor(min / 5) * 5;
  const roundedMax = Math.ceil(max / 5) * 5;
  const range = Math.max(roundedMax - roundedMin, 5);
  const desiredSteps = Math.max(steps, 1);
  const stepMultiple = Math.max(1, Math.ceil(range / (desiredSteps * 5)));
  const step = stepMultiple * 5;
  const ticks = [];
  for (let value = roundedMin; value <= roundedMax + 0.0001; value += step) {
    ticks.push(value);
  }
  return ticks.length ? ticks : [roundedMin, roundedMax];
}

function drawLineChart(canvas, points, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 300;
  const height = canvas.clientHeight || 120;
  if (width === 0 || height === 0) return;
  const series = (points || []).map((point) =>
    typeof point === 'number'
      ? {
          value: point,
          label: '',
        }
      : point
  );
  const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#7a8292';
  const showAxis = options.showAxis !== false;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const paddingLeft = 36;
  const paddingRight = 36;
  const paddingTop = 18;
  const paddingBottom = 18;
  const valueRange = getValueRange(series, { min: 0, max: 100 });
  const ticks = buildTicks(valueRange.min, valueRange.max, 4);

  if (showAxis) {
    ctx.fillStyle = axisColor;
    ctx.font = '12px "Red Hat Display", sans-serif';
    ctx.textBaseline = 'middle';
    ticks.forEach((tick) => {
      const y =
        height -
        paddingBottom -
        ((tick - valueRange.min) / (valueRange.max - valueRange.min)) *
          (height - paddingTop - paddingBottom);
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(tick)}`, 4, y);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(tick)}`, width - 4, y);
  });
}

  if (!series || series.length < 2) {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - paddingRight, paddingTop);
    ctx.stroke();
    return;
  }

  const stroke = options.stroke || '#2aa9ff';
  const max = valueRange.max;
  const min = valueRange.min;
  const chartPoints = series.map((point, index) => {
    const x = paddingLeft + ((width - paddingLeft - paddingRight) / (series.length - 1)) * index;
    const y =
      height -
      paddingBottom -
      ((point.value - min) / (max - min)) * (height - paddingTop - paddingBottom);
    return {
      x,
      y,
      value: point.value,
      label: point.label,
    };
  });

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = stroke;
  traceSmoothLine(ctx, chartPoints, state.graphSmoothness);
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
  gradient.addColorStop(0, withAlpha(stroke, 0.35));
  gradient.addColorStop(1, withAlpha(stroke, 0.05));

  traceSmoothLine(ctx, chartPoints, state.graphSmoothness);
  ctx.lineTo(width - paddingRight, height - paddingBottom);
  ctx.lineTo(paddingLeft, height - paddingBottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  canvas._chartPoints = chartPoints;
  bindChartHover(canvas);
}

function drawMultiLineChart(canvas, series) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 300;
  const height = canvas.clientHeight || 160;
  if (width === 0 || height === 0) return;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const paddingLeft = 36;
  const paddingRight = 36;
  const paddingTop = 18;
  const paddingBottom = 18;
  const allSeriesPoints = series.flatMap((line) => line.points || []);
  const valueRange = getValueRange(allSeriesPoints, { min: 0, max: 100 });
  const ticks = buildTicks(valueRange.min, valueRange.max, 4);
  const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#7a8292';

  ctx.fillStyle = axisColor;
  ctx.font = '12px "Red Hat Display", sans-serif';
  ctx.textBaseline = 'middle';
  ticks.forEach((tick) => {
    const y =
      height -
      paddingBottom -
      ((tick - valueRange.min) / (valueRange.max - valueRange.min)) *
        (height - paddingTop - paddingBottom);
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(tick)}`, 4, y);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(tick)}`, width - 4, y);
  });

  if (!series || series.length === 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - paddingRight, paddingTop);
    ctx.stroke();
    return;
  }

  const allPoints = [];
  series.forEach((line) => {
    const points = line.points;
    if (!points.length) return;
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = line.color || '#2aa9ff';
    const chartPoints = points.map((point, index) => {
      const fallbackDenom = Math.max(points.length - 1, 1);
      const x = paddingLeft + ((width - paddingLeft - paddingRight) / fallbackDenom) * index;
      const y =
        height -
        paddingBottom -
        ((point.value - valueRange.min) / (valueRange.max - valueRange.min)) *
          (height - paddingTop - paddingBottom);
      const entry = {
        x,
        y,
        value: point.value,
        label: point.label ? `${line.name}: ${point.label}` : line.name,
      };
      allPoints.push(entry);
      return entry;
    });

    traceSmoothLine(ctx, chartPoints, state.graphSmoothness);
    ctx.stroke();
  });

  canvas._chartPoints = allPoints;
  bindChartHover(canvas);
}

function dateStringValue(value) {
  if (!value) return 0;
  if (typeof value === 'string') {
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
      return Date.UTC(parts[0], parts[1] - 1, parts[2]);
    }
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 0;
  return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function dateKeyFromParts(year, month, day) {
  const paddedMonth = String(month + 1).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
}

function formatMonthYear(year, month) {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

function assessmentDateValue(assessment) {
  return dateStringValue(assessment.date);
}

function assessmentTieBreak(assessment) {
  if (Number.isFinite(assessment.createdAt)) return assessment.createdAt;
  const order = Number.isFinite(assessment.order) ? assessment.order : 0;
  return -order;
}

function sortAssessments(items) {
  return items
    .map((assessment, index) => ({
      ...assessment,
      order: Number.isFinite(assessment.order) ? assessment.order : index,
    }))
    .sort((a, b) => {
      const dateDiff = assessmentDateValue(a) - assessmentDateValue(b);
      if (dateDiff !== 0) return dateDiff;
      return assessmentTieBreak(a) - assessmentTieBreak(b);
    });
}

function weightedAverage(items) {
  if (items.length === 0) return null;
  let totalWeight = 0;
  let sum = 0;
  items.forEach((item) => {
    const weight = item.weight === null ? 1 : item.weight;
    if (item.total > 0) {
      sum += (item.score / item.total) * weight;
      totalWeight += weight;
    }
  });
  if (!totalWeight) return null;
  return (sum / totalWeight) * 100;
}

function getAllAssessments() {
  return state.data.subjects.flatMap((subject) =>
    subject.assessments.map((assessment, index) => ({
      ...assessment,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color,
      order: index,
    }))
  );
}

function expandUpcomingItems(subject) {
  return (subject.upcoming || []).map((item, index) => ({
    ...item,
    subjectId: subject.id,
    subjectName: subject.name,
    subjectColor: subject.color,
    order: index,
  }));
}

function getUpcomingAssessments() {
  return state.data.subjects.flatMap((subject) => expandUpcomingItems(subject));
}

function upcomingDateValue(item) {
  return dateStringValue(item.date);
}

function upcomingTieBreak(item) {
  if (Number.isFinite(item.createdAt)) return item.createdAt;
  const order = Number.isFinite(item.order) ? item.order : 0;
  return -order;
}

function sortUpcoming(items) {
  return items
    .map((item, index) => ({
      ...item,
      order: Number.isFinite(item.order) ? item.order : index,
    }))
    .sort((a, b) => {
      const dateDiff = upcomingDateValue(a) - upcomingDateValue(b);
      if (dateDiff !== 0) return dateDiff;
      return upcomingTieBreak(a) - upcomingTieBreak(b);
    });
}

function isPastDate(value) {
  if (!value) return false;
  return dateStringValue(value) < todayValue;
}

function buildUpcomingList(items, options = {}) {
  if (!items.length) {
    return '<div class="empty-state">No upcoming assessments.</div>';
  }
  return items
    .map((item) => {
      const metaParts = [];
      if (options.showSubject && item.subjectName) {
        metaParts.push(item.subjectName);
      }
      metaParts.push(formatDate(item.date));
      if (item.notes) {
        metaParts.push(item.notes);
      }
      const metaText = metaParts.join(' · ');
      const overdue = isPastDate(item.date);
      const tagHtml = overdue ? '<span class="upcoming-tag is-overdue">Overdue</span>' : '';
      const removeHtml = options.allowRemove
        ? `<button class="delete-button" data-action="delete-upcoming" data-subject-id="${item.subjectId}" data-upcoming-id="${item.id}">Remove</button>`
        : '';
      const dotHtml = item.subjectColor
        ? `<span class="upcoming-dot" style="--swatch:${item.subjectColor}"></span>`
        : '';
      return `
        <div class="upcoming-item">
          <div>
            <div class="upcoming-name">${dotHtml}${item.name}</div>
            <div class="upcoming-meta">${metaText}</div>
          </div>
          <div class="upcoming-right">
            ${tagHtml}
            ${removeHtml}
          </div>
        </div>
      `;
    })
    .join('');
}

function buildCalendarEvents() {
  const eventsByDate = {};
  const addEvent = (date, event) => {
    if (!date) return;
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date].push(event);
  };

  sortUpcoming(getUpcomingAssessments()).forEach((item) => {
    addEvent(item.date, {
      type: 'upcoming',
      name: item.name,
      subject: item.subjectName,
      color: item.subjectColor || 'var(--accent)',
    });
  });

  Object.values(eventsByDate).forEach((items) => {
    items.sort((a, b) => {
      const order = a.type === b.type ? 0 : a.type === 'upcoming' ? -1 : 1;
      if (order !== 0) return order;
      return a.name.localeCompare(b.name);
    });
  });

  return eventsByDate;
}

function subjectStats(subject) {
  const average = weightedAverage(subject.assessments);
  return {
    average,
    grade: getLetterGrade(average),
  };
}

function getTopSubject() {
  let best = null;
  let bestScore = -Infinity;
  state.data.subjects.forEach((subject) => {
    const average = weightedAverage(subject.assessments);
    if (average !== null && average > bestScore) {
      bestScore = average;
      best = subject;
    }
  });
  return best;
}

function getLatestAssessment() {
  const allAssessments = getAllAssessments();
  if (allAssessments.length === 0) return null;
  const sorted = sortAssessments(allAssessments);
  return sorted[sorted.length - 1];
}

function getBestGrade(items) {
  if (items.length === 0) return null;
  const best = Math.max(
    ...items.map((item) => (item.total > 0 ? (item.score / item.total) * 100 : 0))
  );
  return getLetterGrade(best);
}

function getLetterGrade(percentage) {
if (percentage === null || !Number.isFinite(percentage)) return null;

if (percentage >= 95) return 'A+';
if (percentage >= 90) return 'A';
if (percentage >= 85) return 'A-';

if (percentage >= 80) return 'B+';
if (percentage >= 75) return 'B';
if (percentage >= 70) return 'B-';

if (percentage >= 65) return 'C+';
if (percentage >= 60) return 'C';
if (percentage >= 50) return 'C-';

if (percentage >= 40) return 'D+';
if (percentage >= 35) return 'D';
if (percentage >= 30) return 'D-';

return 'E';

}

function gradeColorFor(letter) {
  if (!letter) return 'var(--grade-a)';
  if (letter.startsWith('A')) return 'var(--grade-a)';
  if (letter.startsWith('B')) return 'var(--grade-b)';
  if (letter.startsWith('C')) return 'var(--grade-c)';
  return 'var(--grade-d)';
}

function initials(name) {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function cryptoRandomId() {
  if (window.crypto && crypto.getRandomValues) {
    const bytes = new Uint32Array(2);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16)).join('');
  }
  return Math.random().toString(16).slice(2);
}

function formatDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}
