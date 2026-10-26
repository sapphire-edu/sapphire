// V2: a one-page term / semester report card, opened from the "By term" card on Analytics.
// The numbers come from the same term placement as the By term table (termPlansBySubject +
// assignMarksToTerms in analytics.js), so the two always agree.

const reportState = { kind: 'term', index: 0 };

// Every subject's marks in the latest year, grouped into terms or semesters.
// Mirrors the setup in renderAnalyticsTermsV2.
function buildReportData(kind) {
  const periods = kind === 'semester' ? SEMESTER_PERIODS : TERM_PERIODS;
  const toPeriod = (term) => (kind === 'semester' ? Math.floor(term / 2) : term);
  const now = new Date();
  const yearOf = (assessment) => new Date(assessmentDateValue(assessment)).getUTCFullYear();
  const dated = getAllAssessments().filter((assessment) => assessment.total > 0 && assessmentDateValue(assessment));
  const year = dated.length ? Math.max(...dated.map(yearOf)) : now.getFullYear();
  const yearSubjects = state.data.subjects
    .map((subject) => ({ ...subject, assessments: subject.assessments.filter((assessment) => assessment.total > 0 && assessmentDateValue(assessment) && yearOf(assessment) === year) }))
    .filter((subject) => subject.assessments.length);
  const plans = termPlansBySubject(yearSubjects);

  const placedMarks = yearSubjects.flatMap((subject) => {
    const placed = assignMarksToTerms(subject, plans.get(subject.id));
    return subject.assessments.map((assessment) => ({ subject, assessment, period: toPeriod(placed.get(assessment.id).term) }));
  });

  const cellsFor = (marks) => periods.map((_, index) => {
    const inPeriod = marks.filter((mark) => mark.period === index).map((mark) => mark.assessment);
    if (!inPeriod.length) return null;
    const average = weightedAverage(inPeriod);
    return { average, grade: getLetterGrade(average), count: inPeriod.length, marks: inPeriod };
  });

  const currentPeriod = now.getFullYear() === year
    ? toPeriod(schoolTermIndex(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())))
    : -1;

  return {
    kind,
    year,
    periods,
    currentPeriod,
    overall: cellsFor(placedMarks),
    subjects: yearSubjects.map((subject) => ({
      subject,
      cells: cellsFor(placedMarks.filter((mark) => mark.subject.id === subject.id)),
    })),
  };
}

// The current period if it has marks, otherwise the latest one that does.
function defaultReportIndex(data) {
  if (data.currentPeriod >= 0 && data.overall[data.currentPeriod]) return data.currentPeriod;
  for (let index = data.overall.length - 1; index >= 0; index -= 1) {
    if (data.overall[index]) return index;
  }
  return Math.max(data.currentPeriod, 0);
}

// A change is measured against the nearest earlier period that has marks (as in the By term table).
function reportPrevious(cells, index, periods) {
  for (let earlier = index - 1; earlier >= 0; earlier -= 1) {
    if (cells[earlier]) return { cell: cells[earlier], label: periods[earlier].label };
  }
  return null;
}

function reportBestMark(marks) {
  const percent = (assessment) => (assessment.score / assessment.total) * 100;
  return marks.reduce((best, assessment) => (!best || percent(assessment) >= percent(best) ? assessment : best), null);
}

function reportPercent(value) {
  return `${value.toFixed(1)}%`;
}

function reportChangeHtml(previous, cell) {
  if (!previous) return '<span class="report-change-none">First marks</span>';
  const delta = cell.average - previous.cell.average;
  return `
    <span class="report-change">
      ${v2DeltaHtml(delta)}
      <span class="report-change-from">vs ${escapeHtml(previous.label)}</span>
    </span>
  `;
}

function reportPeriodName(data, index) {
  return `${data.periods[index].label} ${data.year}`;
}

function renderReportPicker(data) {
  const picker = document.getElementById('report-picker');
  if (!picker) return;
  const group = (kind, label, count) => {
    const buttons = Array.from({ length: count }, (_, index) => {
      const active = reportState.kind === kind && reportState.index === index;
      const periodLabel = `${label} ${index + 1}`;
      return `<button type="button" data-report-kind="${kind}" data-report-index="${index}" class="${active ? 'is-active' : ''}" aria-pressed="${active}" aria-label="${periodLabel}">${index + 1}</button>`;
    }).join('');
    return `
      <div class="report-picker-group">
        <span class="report-picker-label" id="report-picker-${kind}">${label}</span>
        <div class="an-range" role="group" aria-labelledby="report-picker-${kind}">${buttons}</div>
      </div>
    `;
  };
  picker.innerHTML = `${group('term', 'Term', TERM_PERIODS.length)}${group('semester', 'Semester', SEMESTER_PERIODS.length)}`;
}

function renderReportSheet(data) {
  const sheet = document.getElementById('report-sheet');
  if (!sheet) return;
  const index = reportState.index;
  const period = data.periods[index];
  const periodName = reportPeriodName(data, index);
  const kindWord = data.kind === 'semester' ? 'semester' : 'term';
  const name = loadUserName();
  const overall = data.overall[index];
  const generated = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  const title = document.getElementById('report-title');
  if (title) title.textContent = data.kind === 'semester' ? 'Semester report' : 'Term report';

  const masthead = `
    <header class="report-masthead">
      <div class="report-brand"><span class="report-brand-mark" aria-hidden="true">◆</span>Sapphire</div>
      <div class="report-kind">${data.kind === 'semester' ? 'Semester report' : 'Term report'}</div>
    </header>
  `;
  const identity = `
    <div class="report-identity">
      <h3 class="report-name">${escapeHtml(name || 'Student report')}</h3>
      <p class="report-period">${escapeHtml(periodName)}<span class="report-period-months">${escapeHtml(period.months)}</span>${index === data.currentPeriod ? '<span class="report-period-now">In progress</span>' : ''}</p>
    </div>
  `;

  if (!overall) {
    sheet.innerHTML = `
      ${masthead}
      <div class="report-top">${identity}</div>
      <div class="report-empty">
        ${iconHtml('lucide:file-text', 'report-empty-icon')}
        <p class="report-empty-title">No marks in ${escapeHtml(periodName)}</p>
        <p class="report-empty-text">Marks you log for this ${kindWord} will show up here. Pick another ${kindWord} above to see its report.</p>
      </div>
      <footer class="report-foot"><span>Generated ${escapeHtml(generated)}</span></footer>
    `;
    return;
  }

  const overallPrevious = reportPrevious(data.overall, index, data.periods);
  const withMarks = data.subjects.filter((row) => row.cells[index]);
  const withoutMarks = data.subjects.filter((row) => !row.cells[index]);

  const rows = withMarks.map(({ subject, cells }) => {
    const cell = cells[index];
    const best = reportBestMark(cell.marks);
    const previous = reportPrevious(cells, index, data.periods);
    return `
      <tr>
        <th scope="row">
          <span class="report-subject">${subjectMarkHtml(subject.icon, subject.name, subject.color, 'report-subject-mark')}<span class="report-subject-name">${escapeHtml(subject.name)}</span></span>
        </th>
        <td class="report-num report-avg">${reportPercent(cell.average)}</td>
        <td class="report-grade-cell">${v2GradeBadge(cell.grade)}</td>
        <td class="report-change-cell">${reportChangeHtml(previous, cell)}</td>
        <td class="report-num report-count">${cell.count}</td>
        <td class="report-best">
          ${best ? `<span class="report-best-name">${escapeHtml(best.name || 'Untitled task')}</span><span class="report-best-value">${reportPercent((best.score / best.total) * 100)}</span>` : '—'}
        </td>
      </tr>
    `;
  }).join('');

  const overallChange = overallPrevious
    ? `${v2DeltaHtml(overall.average - overallPrevious.cell.average)}<span class="report-change-from">vs ${escapeHtml(overallPrevious.label)}</span>`
    : `<span class="report-change-none">First ${kindWord} with marks</span>`;

  sheet.innerHTML = `
    ${masthead}
    <div class="report-top">
      ${identity}
      <div class="report-overall" aria-label="Overall weighted average ${reportPercent(overall.average)}, ${overall.grade}">
        <span class="report-overall-label">Overall average</span>
        <span class="report-overall-main">
          <span class="report-overall-value">${overall.average.toFixed(1)}<span class="report-overall-unit">%</span></span>
          ${v2GradeBadge(overall.grade, ' report-overall-grade')}
        </span>
        <span class="report-overall-change">${overallChange}</span>
      </div>
    </div>
    <p class="report-summary">${overall.count} ${overall.count === 1 ? 'task' : 'tasks'} across ${withMarks.length} ${withMarks.length === 1 ? 'subject' : 'subjects'}, weighted by each task's weighting.</p>
    <table class="report-table">
      <thead>
        <tr>
          <th scope="col">Subject</th>
          <th scope="col" class="report-num">Average</th>
          <th scope="col">Grade</th>
          <th scope="col">Change</th>
          <th scope="col" class="report-num">Tasks</th>
          <th scope="col">Best task</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${withoutMarks.length ? `<p class="report-missing">No marks this ${kindWord}: ${withoutMarks.map((row) => escapeHtml(row.subject.name)).join(', ')}.</p>` : ''}
    <footer class="report-foot">
      <span>Generated ${escapeHtml(generated)}</span>
      <span>Marks are placed in ${kindWord}s by each subject's usual task pattern, as in Analytics.</span>
    </footer>
  `;
}

function renderReport() {
  const data = buildReportData(reportState.kind);
  if (reportState.index >= data.periods.length) reportState.index = defaultReportIndex(data);
  renderReportPicker(data);
  renderReportSheet(data);
  const message = document.getElementById('report-message');
  if (message) message.textContent = '';
  return data;
}

function openReport() {
  const modal = document.getElementById('report-modal');
  if (!modal) return;
  reportState.kind = typeof getTermsView === 'function' ? getTermsView() : 'term';
  reportState.index = defaultReportIndex(buildReportData(reportState.kind));
  renderReport();
  openModal(modal);
  modal.querySelector('.modal-panel')?.scrollTo(0, 0);
}

function closeReport() {
  closeModal(document.getElementById('report-modal'));
  document.getElementById('report-open')?.focus();
}

function reportSummaryText() {
  const data = buildReportData(reportState.kind);
  const index = reportState.index;
  const overall = data.overall[index];
  const name = loadUserName();
  const heading = `${name ? `${name}: ` : ''}${reportPeriodName(data, index)} report`;
  if (!overall) return `${heading}\nNo marks yet.`;
  const changeText = (previous, cell) => {
    if (!previous) return '';
    const delta = cell.average - previous.cell.average;
    const sign = Math.abs(delta) < 0.05 ? '±' : delta > 0 ? '+' : '−';
    return `, ${sign}${Math.abs(delta).toFixed(1)} vs ${previous.label}`;
  };
  const lines = [
    heading,
    `Overall: ${reportPercent(overall.average)} (${overall.grade})${changeText(reportPrevious(data.overall, index, data.periods), overall)}`,
    '',
  ];
  data.subjects.forEach(({ subject, cells }) => {
    const cell = cells[index];
    if (!cell) return;
    const best = reportBestMark(cell.marks);
    const bestText = best ? `, best: ${best.name || 'Untitled task'} ${reportPercent((best.score / best.total) * 100)}` : '';
    lines.push(`${subject.name}: ${reportPercent(cell.average)} (${cell.grade})${changeText(reportPrevious(cells, index, data.periods), cell)}, ${cell.count} ${cell.count === 1 ? 'task' : 'tasks'}${bestText}`);
  });
  return lines.join('\n');
}

async function copyReportSummary() {
  const message = document.getElementById('report-message');
  try {
    await navigator.clipboard.writeText(reportSummaryText());
    if (message) message.textContent = 'Copied to clipboard.';
  } catch (error) {
    if (message) message.textContent = 'Couldn’t copy. Your browser blocked clipboard access.';
  }
}

function printReport() {
  const data = buildReportData(reportState.kind);
  const name = loadUserName();
  const previousTitle = document.title;
  // The saved PDF takes its file name from the page title.
  document.title = `${name ? `${name} – ` : ''}${reportPeriodName(data, reportState.index)} report`;
  window.addEventListener('afterprint', () => { document.title = previousTitle; }, { once: true });
  window.print();
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action="open-report"], [data-action="close-report"], [data-action="print-report"], [data-action="copy-report"], [data-report-kind]');
  if (!target) return;
  if (target.dataset.reportKind) {
    reportState.kind = target.dataset.reportKind === 'semester' ? 'semester' : 'term';
    reportState.index = Number(target.dataset.reportIndex) || 0;
    renderReport();
    document.querySelector(`[data-report-kind="${reportState.kind}"][data-report-index="${reportState.index}"]`)?.focus();
    return;
  }
  const action = target.dataset.action;
  if (action === 'open-report') openReport();
  else if (action === 'close-report') closeReport();
  else if (action === 'print-report') printReport();
  else if (action === 'copy-report') copyReportSummary();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (document.getElementById('report-modal')?.classList.contains('is-open')) closeReport();
});
