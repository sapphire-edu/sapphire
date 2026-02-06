const STORAGE_KEY = 'nsw-grade-tracker-v1';
const THEME_KEY = 'nsw-grade-theme';
const THEME_VARIANT_KEY = 'sapphire-theme-variant';
const TAB_KEY = 'sapphire-active-tab';

const palette = ['#2aa9ff', '#5ae3a1', '#f6b96e', '#c78bff', '#ff8b8b', '#56d2d2', '#ffb347', '#4dd4a8'];
const LIGHT_THEMES = ['pearl', 'mint', 'sunrise', 'sky'];
const DARK_THEMES = ['midnight', 'aurora', 'cosmic', 'sapphire'];

const state = {
  data: loadData(),
  theme: loadThemeSettings(),
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
  chartTooltip: document.getElementById('chart-tooltip'),
  themeButtons: document.querySelectorAll('[data-theme-variant]'),
  navItems: document.querySelectorAll('[data-tab]'),
  views: document.querySelectorAll('[data-view]'),
};

let activeSubjectId = null;

setTheme(state.theme.mode, state.theme.variant);
initTabs();

const today = new Date().toISOString().slice(0, 10);

render();

window.addEventListener('resize', () => {
  renderCharts();
});

if (elements.themeButtons) {
  elements.themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.themeMode || 'light';
      const variant = button.dataset.themeVariant || resolveVariant(mode);
      setTheme(mode, variant);
      if (elements.themeModal?.classList.contains('is-open')) {
        closeModal(elements.themeModal);
      }
    });
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { subjects: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.subjects)) return { subjects: [] };
    const todayValue = new Date().toISOString().slice(0, 10);
    const subjects = parsed.subjects.map((subject, index) => {
      const assessments = Array.isArray(subject.assessments) ? subject.assessments : [];
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
      };
    });
    return { subjects };
  } catch (error) {
    return { subjects: [] };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadThemeSettings() {
  const storedMode = localStorage.getItem(THEME_KEY);
  const storedVariant = localStorage.getItem(THEME_VARIANT_KEY);
  const mode =
    storedMode === 'light' || storedMode === 'dark'
      ? storedMode
      : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  const variant = resolveVariant(mode, storedVariant);
  return { mode, variant };
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
  localStorage.setItem(THEME_KEY, mode);
  localStorage.setItem(THEME_VARIANT_KEY, resolved);
  updateThemeButtons();
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
  const saved = localStorage.getItem(TAB_KEY);
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
  localStorage.setItem(TAB_KEY, tab);
  renderCharts();
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

  if (elements.subjectModalBody) {
    elements.subjectModalBody.innerHTML = `
      <div class="modal-chart">
        <canvas id="subject-modal-chart"></canvas>
      </div>
      <div class="modal-actions">
        <button class="primary-button" type="button" data-action="open-assessment">Add Assessment</button>
        <button class="ghost-button" type="button" data-action="delete-subject">Delete Subject</button>
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

function getOrCreateSubject(name) {
  const existing = state.data.subjects.find((subject) => subject.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  const subject = {
    id: cryptoRandomId(),
    name,
    color: palette[state.data.subjects.length % palette.length],
    assessments: [],
  };
  state.data.subjects.push(subject);
  return subject;
}

function render() {
  renderOverview();
  renderSubjects();
  renderInsights();
  renderAssessments();
  renderCharts();
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
  const ticks = [0, 25, 50, 75, 100];

  if (showAxis) {
    ctx.fillStyle = axisColor;
    ctx.font = '12px \"SF Pro Text\", \"Manrope\", sans-serif';
    ticks.forEach((tick) => {
      const y = height - paddingBottom - (tick / 100) * (height - paddingTop - paddingBottom);
      ctx.textAlign = 'left';
      ctx.fillText(`${tick}`, 4, y + 4);
      ctx.textAlign = 'right';
      ctx.fillText(`${tick}`, width - 4, y + 4);
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
  const max = 100;
  const min = 0;
  const xStep = (width - paddingLeft - paddingRight) / (series.length - 1);

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = stroke;
  ctx.beginPath();

  const chartPoints = series.map((point, index) => {
    const x = paddingLeft + xStep * index;
    const y = height - paddingBottom - ((point.value - min) / (max - min)) * (height - paddingTop - paddingBottom);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    return {
      x,
      y,
      value: point.value,
      label: point.label,
    };
  });

  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
  gradient.addColorStop(0, `${stroke}55`);
  gradient.addColorStop(1, `${stroke}05`);

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
  const ticks = [0, 25, 50, 75, 100];
  const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#7a8292';

  ctx.fillStyle = axisColor;
  ctx.font = '12px \"SF Pro Text\", \"Manrope\", sans-serif';
  ticks.forEach((tick) => {
    const y = height - paddingBottom - (tick / 100) * (height - paddingTop - paddingBottom);
    ctx.textAlign = 'left';
    ctx.fillText(`${tick}`, 4, y + 4);
    ctx.textAlign = 'right';
    ctx.fillText(`${tick}`, width - 4, y + 4);
  });

  if (!series || series.length === 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - paddingRight, paddingTop);
    ctx.stroke();
    return;
  }

  const maxPoints = Math.max(...series.map((line) => line.points.length));
  const xStep = maxPoints > 1 ? (width - paddingLeft - paddingRight) / (maxPoints - 1) : 0;
  const allPoints = [];

  series.forEach((line) => {
    const points = line.points;
    if (!points.length) return;
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = line.color || '#2aa9ff';
    ctx.beginPath();

    points.forEach((point, index) => {
      const x = paddingLeft + xStep * index;
      const y = height - paddingBottom - (point.value / 100) * (height - paddingTop - paddingBottom);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      allPoints.push({
        x,
        y,
        value: point.value,
        label: point.label ? `${line.name}: ${point.label}` : line.name,
      });
    });

    ctx.stroke();
  });

  canvas._chartPoints = allPoints;
  bindChartHover(canvas);
}

function assessmentDateValue(assessment) {
  const dateValue = new Date(assessment.date).getTime();
  return Number.isFinite(dateValue) ? dateValue : 0;
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
      order: index,
    }))
  );
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
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
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
