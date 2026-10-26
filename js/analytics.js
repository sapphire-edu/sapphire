// Analytics tab and dashboard charts.

const hiddenSubjectsChartIds = new Set();

// V2's stat row. The V1 hero above stays in the DOM (hidden in V2) so both UIs share renderOverview.
function renderV2Stats({ overallAverage, overallGrade, assessmentCount, topSubject, latest }) {
  const container = document.getElementById('v2-stats');
  if (!container) return;
  const topStats = topSubject ? subjectStats(topSubject) : null;
  const latestPercent = latest && latest.total > 0 ? (latest.score / latest.total) * 100 : null;
  const tile = (label, value, sub, extraClass = '') => `
    <div class="v2-stat${extraClass}">
      <div class="v2-stat-label">${label}</div>
      <div class="v2-stat-value">${value}</div>
      <div class="v2-stat-sub">${sub}</div>
    </div>
  `;
  container.innerHTML = [
    tile(
      'Average',
      overallAverage === null ? '—' : `${overallAverage.toFixed(1)}<span class="v2-stat-unit">%</span>`,
      overallAverage === null ? 'Add your first mark to begin' : `Across ${assessmentCount} assessment${assessmentCount === 1 ? '' : 's'}`
    ),
    tile(
      'Grade',
      overallGrade ? `<span class="v2-grade" data-grade="${overallGrade[0]}">${overallGrade}</span>` : '—',
      'Overall letter grade'
    ),
    tile(
      'Top subject',
      topSubject
        ? `${subjectMarkHtml(topSubject.icon, topSubject.name, topSubject.color, 'v2-stat-mark')}${escapeHtml(topSubject.name)}`
        : '—',
      topStats ? `${topStats.average.toFixed(1)}% · ${topStats.grade}` : 'No marks yet',
      ' v2-stat--text'
    ),
    tile(
      'Latest mark',
      latest
        ? `${subjectMarkHtml(latest.subjectIcon, latest.subjectName, latest.subjectColor, 'v2-stat-mark')}${escapeHtml(latest.name)}`
        : '—',
      latest ? `${latestPercent.toFixed(1)}% · ${escapeHtml(latest.subjectName)} · ${formatDate(latest.date)}` : 'Nothing logged yet',
      ' v2-stat--text'
    ),
  ].join('');
}

// ── V2 Analytics page ──
// V2 reuses the analytics canvases, table and search from V1 and fills extra v2-only
// containers (stat strip, subject breakdown). State lives in storage/DOM rather than
// top-level variables because render() runs before this part of the file is evaluated.

function getAnalyticsRange() {
  const value = safeGetItem('sapphire-analytics-range');
  return ['30', '90', 'all'].includes(value) ? value : 'all';
}

function analyticsRangeCutoff(range) {
  if (range === 'all') return null;
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Number(range) * 86400000;
}

function bindAnalyticsV2Controls() {
  const rangeGroup = document.getElementById('analytics-range');
  if (rangeGroup && !rangeGroup.dataset.bound) {
    rangeGroup.dataset.bound = 'true';
    rangeGroup.addEventListener('click', (event) => {
      const button = event.target.closest('[data-analytics-range]');
      if (!button) return;
      safeSetItem('sapphire-analytics-range', button.dataset.analyticsRange);
      hideChartTooltip();
      renderOverallChart();
    });
  }
  [document.getElementById('analytics-subjects'), document.getElementById('analytics-spread'), elements.insightList].forEach((container) => {
    if (!container || container.dataset.openBound) return;
    container.dataset.openBound = 'true';
    container.addEventListener('click', (event) => {
      const row = event.target.closest('[data-action="open-subject"]');
      if (row) openSubjectModal(row.dataset.id);
    });
  });
}

function v2DeltaHtml(delta) {
  if (!Number.isFinite(delta)) return '';
  const dir = Math.abs(delta) < 0.05 ? 'flat' : delta > 0 ? 'up' : 'down';
  const icon = dir === 'up' ? 'trend-up' : dir === 'down' ? 'trend-down' : 'minus';
  const text = dir === 'flat' ? '0.0' : `${delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(1)}`;
  return `<span class="v2-an-delta" data-dir="${dir}">${iconHtml(icon, 'v2-an-delta-icon')}${text}</span>`;
}

function v2GradeBadge(grade, extraClass = '') {
  return `<span class="v2-grade${extraClass}" data-grade="${(grade || '-')[0]}">${grade ?? '—'}</span>`;
}

function buildAnalyticsSubjectRowV2(subject) {
  const stats = subjectStats(subject);
  const count = subject.assessments.length;
  const sorted = sortAssessments(subject.assessments);
  const latest = sorted[sorted.length - 1];
  const previousAverage = sorted.length > 1 ? weightedAverage(sorted.slice(0, -1)) : null;
  const delta = stats.average !== null && previousAverage !== null ? stats.average - previousAverage : null;
  const average = stats.average === null ? 0 : clamp(stats.average, 0, 100);
  const hasTarget = Number.isFinite(subject.target);
  const metaParts = [`${count} mark${count === 1 ? '' : 's'}`];
  if (latest) metaParts.push(`last ${formatDate(latest.date)}`);

  let targetText = 'No target set';
  let targetClass = '';
  if (hasTarget) {
    const targetLabel = `${formatPercentValue(subject.target)}%`;
    if (stats.average === null) {
      targetText = `Target ${targetLabel}`;
    } else if (stats.average >= subject.target) {
      targetText = `On target · ${targetLabel}`;
      targetClass = ' is-met';
    } else {
      const required = requiredForTarget(subject);
      targetClass = ' is-below';
      targetText = !required || required.needed > 100
        ? `${targetLabel} out of reach for now`
        : `Need ${Math.ceil(required.needed)}%${required.pending.length > 1 ? ' avg' : ''} next to hit ${targetLabel}`;
    }
  }

  return `
    <button class="v2-an-subject" type="button" data-action="open-subject" data-id="${subject.id}" style="--subject-color:${subject.color}">
      <span class="v2-subject-icon">${subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name))}</span>
      <span class="v2-subject-main">
        <span class="v2-subject-name">${escapeHtml(subject.name)}</span>
        <span class="v2-subject-meta">${metaParts.join(' · ')}</span>
      </span>
      <span class="v2-an-spark" aria-hidden="true"><canvas data-chart="v2-spark" data-id="${subject.id}"></canvas></span>
      <span class="v2-an-target${hasTarget ? '' : ' is-empty'}">
        <span class="v2-subject-progress" aria-hidden="true">
          <span class="v2-subject-fill" style="width:${average}%"></span>
          ${hasTarget ? `<span class="v2-subject-marker" style="left:${clamp(subject.target, 0, 100)}%"></span>` : ''}
        </span>
        <span class="v2-an-target-text${targetClass}">${targetText}</span>
      </span>
      <span class="v2-an-average">
        <span class="v2-an-average-value">${stats.average === null ? '—' : `${stats.average.toFixed(1)}%`}</span>
        ${v2DeltaHtml(delta)}
      </span>
      ${v2GradeBadge(stats.grade)}
    </button>
  `;
}

function renderAnalyticsV2() {
  bindAnalyticsV2Controls();
  const allAssessments = getAllAssessments();
  const sorted = sortAssessments(allAssessments);
  const timeline = buildOverallTimelinePoints(sorted);
  const overallAverage = weightedAverage(allAssessments);
  const overallGrade = getLetterGrade(overallAverage);
  const lastChange = timeline.length > 1
    ? timeline[timeline.length - 1].value - timeline[timeline.length - 2].value
    : null;
  const ranked = state.data.subjects
    .map((subject) => ({ subject, stats: subjectStats(subject) }))
    .filter((entry) => entry.stats.average !== null)
    .sort((left, right) => right.stats.average - left.stats.average);
  const best = ranked[0] || null;
  const worst = ranked.length > 1 ? ranked[ranked.length - 1] : null;
  const withTarget = state.data.subjects.filter((subject) => Number.isFinite(subject.target));
  const targetsMet = withTarget.filter((subject) => {
    const average = subjectStats(subject).average;
    return average !== null && average >= subject.target;
  }).length;

  const statsContainer = document.getElementById('analytics-stats');
  if (statsContainer) {
    const tile = (label, value, sub, extraClass = '') => `
      <div class="v2-stat${extraClass}">
        <div class="v2-stat-label">${label}</div>
        <div class="v2-stat-value">${value}</div>
        <div class="v2-stat-sub">${sub}</div>
      </div>
    `;
    const subjectTile = (label, entry, empty) => tile(
      label,
      entry
        ? `${subjectMarkHtml(entry.subject.icon, entry.subject.name, entry.subject.color, 'v2-stat-mark')}${escapeHtml(entry.subject.name)}`
        : '—',
      entry ? `${entry.stats.average.toFixed(1)}% · ${entry.stats.grade}` : empty,
      ' v2-stat--text'
    );
    const cutoff = analyticsRangeCutoff('30');
    const recentCount = sorted.filter((item) => assessmentDateValue(item) >= cutoff).length;
    const below = withTarget.length - targetsMet;
    statsContainer.innerHTML = [
      tile(
        'Overall average',
        overallAverage === null
          ? '—'
          : `${overallAverage.toFixed(1)}<span class="v2-stat-unit">%</span>${v2GradeBadge(overallGrade, ' v2-an-stat-grade')}`,
        overallAverage === null
          ? 'Add your first mark to begin'
          : lastChange === null
          ? `From ${allAssessments.length} assessment${allAssessments.length === 1 ? '' : 's'}`
          : `${v2DeltaHtml(lastChange)} since last mark`
      ),
      subjectTile('Strongest subject', best, 'No marks yet'),
      subjectTile('Needs focus', worst, ranked.length === 1 ? 'Add marks in another subject' : 'No marks yet'),
      withTarget.length
        ? tile(
            'Targets met',
            `${targetsMet}<span class="v2-stat-unit">&nbsp;/ ${withTarget.length}</span>`,
            below === 0 ? 'Every target is on track' : `${below} subject${below === 1 ? '' : 's'} below target`
          )
        : tile(
            'Assessments',
            String(allAssessments.length),
            `${recentCount} in the last 30 days`
          ),
    ].join('');
  }

  if (elements.insightList) {
    const relative = buildRelativeMarks();
    const recent = sorted.slice(-6).reverse();
    elements.insightList.innerHTML = recent.length
      ? recent
          .map((assessment) => {
            const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
            return `
              <button class="v2-an-recent" type="button" data-action="open-subject" data-id="${assessment.subjectId}" style="--subject-color:${assessment.subjectColor}">
                ${subjectMarkHtml(assessment.subjectIcon, assessment.subjectName, assessment.subjectColor, 'v2-an-recent-mark')}
                <span class="v2-an-recent-main">
                  <span class="v2-an-recent-name">${escapeHtml(assessment.name)}</span>
                  <span class="v2-an-recent-meta">${escapeHtml(assessment.subjectName)} · ${formatDate(assessment.date)}${relativeMarkHtml(relative, assessment, percent)}</span>
                </span>
                <span class="v2-an-recent-percent">${percent.toFixed(1)}%</span>
                ${v2GradeBadge(getLetterGrade(percent))}
              </button>
            `;
          })
          .join('')
      : '<div class="empty-state">No marks yet. Your latest results will show up here.</div>';
  }

  renderAnalyticsGradesV2(allAssessments);
  renderAnalyticsTermsV2();
  renderAnalyticsSpreadV2();

  const subjectsContainer = document.getElementById('analytics-subjects');
  if (subjectsContainer) {
    if (!state.data.subjects.length) {
      subjectsContainer.innerHTML = '<div class="empty-state">No subjects yet. Add a subject to start tracking results.</div>';
    } else {
      const ordered = state.data.subjects
        .map((subject, index) => ({ subject, index, average: subjectStats(subject).average }))
        .sort((left, right) => compareNullableNumbers(left.average, right.average, 'desc') || left.index - right.index);
      subjectsContainer.innerHTML = ordered.map((entry) => buildAnalyticsSubjectRowV2(entry.subject)).join('');
    }
  }
}

// By term / By semester: each subject's weighted average in each NSW school term (or semester)
// of the latest year with marks, with its grade and the change from the period before.
const TERM_PERIODS = [
  { label: 'Term 1', months: 'Feb–Apr' },
  { label: 'Term 2', months: 'Apr–Jul' },
  { label: 'Term 3', months: 'Jul–Sep' },
  { label: 'Term 4', months: 'Oct–Dec' },
];
const SEMESTER_PERIODS = [
  { label: 'Semester 1', months: 'Terms 1–2' },
  { label: 'Semester 2', months: 'Terms 3–4' },
];

// The term a date falls in, splitting at the middle of each holiday break.
function schoolTermIndex(dateValue) {
  const date = new Date(dateValue);
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const before = (m, d) => month < m || (month === m && day < d);
  if (before(3, 12)) return 0; // up to 11 April
  if (before(6, 12)) return 1; // up to 11 July
  if (before(9, 5)) return 2; // up to 4 October
  return 3;
}

// Which term each mark belongs to. Dates aren't reliable (marks often get entered in a batch,
// long after the task), so each subject follows the school's usual pattern of tasks per term:
// - most subjects: one task a term;
// - Maths Accelerated (seen in the subject name, or a MACC / "Accelerated" class linked to it in
//   the timetable): seven tasks, 1 · 2 · 2 · 2;
// - History and Geography: one semester each (one runs in Semester 1, the other in Semester 2),
//   three tasks, two in its first term and one in its second.
// A mark's own Term setting always wins. Dates are used as they are when they already fit the
// pattern; otherwise the subject's marks fill its term slots in order.
const TERM_PLAN_DEFAULT = [0, 1, 2, 3];
const TERM_PLAN_ACCELERATED = [0, 1, 1, 2, 2, 3, 3];

function isSemesterSubject(subject) {
  return /histor|geog/i.test(subject.name);
}

function acceleratedMathsSubjectIds() {
  const ids = new Set();
  const isMaths = (subject) => /math/i.test(subject.name);
  state.data.subjects.forEach((subject) => {
    if (isMaths(subject) && /\bacc(el(erated)?)?\b/i.test(subject.name)) ids.add(subject.id);
  });
  const timetable = normalizeTimetableData(state.data.timetable);
  if (!timetable.lessons.length) return ids;
  const acceleratedRows = getTimetableClassRows(timetable.lessons)
    .filter((row) => /MACC/i.test(row.classCode || '') || /accel/i.test(`${row.subject || ''} ${row.label || ''}`));
  let linked = false;
  acceleratedRows.forEach((row) => {
    const id = String(timetable.classProfiles[row.key]?.subjectId || timetable.subjectMap[row.key] || '');
    if (id && id !== '__none__') {
      ids.add(id);
      linked = true;
    }
  });
  // An accelerated class that isn't linked to a subject: it's the student's only maths subject.
  if (acceleratedRows.length && !linked) {
    const maths = state.data.subjects.filter(isMaths);
    if (maths.length === 1) ids.add(maths[0].id);
  }
  return ids;
}

function termPlansBySubject(markedSubjects) {
  const accelerated = acceleratedMathsSubjectIds();
  const plans = new Map();
  const medianTerm = (subject) => {
    const terms = subject.assessments.map((assessment) => (assessment.term ? assessment.term - 1 : schoolTermIndex(assessmentDateValue(assessment)))).sort((x, y) => x - y);
    return terms.length ? terms[Math.floor((terms.length - 1) / 2)] : 0;
  };
  // History and Geography always sit in opposite semesters. With both, the one whose marks lean
  // earlier (by term, then by average date) gets Semester 1; on its own, its marks decide.
  const meanDate = (subject) => subject.assessments.reduce((sum, assessment) => sum + assessmentDateValue(assessment), 0) / subject.assessments.length;
  const semester = markedSubjects
    .filter(isSemesterSubject)
    .sort((left, right) => medianTerm(left) - medianTerm(right) || meanDate(left) - meanDate(right));
  semester.forEach((subject, index) => {
    const first = semester.length >= 2 ? index === 0 : medianTerm(subject) < 2;
    const start = first ? 0 : 2;
    plans.set(subject.id, [start, start, start + 1]);
  });
  markedSubjects.forEach((subject) => {
    if (!plans.has(subject.id)) plans.set(subject.id, accelerated.has(subject.id) ? TERM_PLAN_ACCELERATED : TERM_PLAN_DEFAULT);
  });
  return plans;
}

function assignMarksToTerms(subject, plan) {
  const placed = new Map();
  const marks = sortAssessments(subject.assessments.filter((assessment) => assessment.total > 0));
  const slots = [...plan];
  const loose = [];
  marks.forEach((assessment) => {
    if (assessment.term) {
      placed.set(assessment.id, { term: assessment.term - 1, how: 'set' });
      const slot = slots.indexOf(assessment.term - 1);
      if (slot !== -1) slots.splice(slot, 1);
    } else {
      loose.push(assessment);
    }
  });
  const byDate = loose.map((assessment) => schoolTermIndex(assessmentDateValue(assessment)));
  const counts = (terms) => terms.reduce((map, term) => map.set(term, (map.get(term) || 0) + 1), new Map());
  const room = counts(slots);
  const datesFit = [...counts(byDate)].every(([term, count]) => count <= (room.get(term) || 0));
  loose.forEach((assessment, index) => {
    if (datesFit || index >= slots.length) placed.set(assessment.id, { term: byDate[index], how: 'date' });
    else placed.set(assessment.id, { term: slots[index], how: 'order' });
  });
  return placed;
}

function getTermsView() {
  return safeGetItem('sapphire-analytics-terms-view') === 'semester' ? 'semester' : 'term';
}

function renderAnalyticsTermsV2() {
  const container = document.getElementById('analytics-terms');
  if (!container) return;
  const view = getTermsView();
  const group = document.getElementById('analytics-terms-view');
  if (group) {
    group.querySelectorAll('[data-terms-view]').forEach((button) => {
      const active = button.dataset.termsView === view;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (!group.dataset.bound) {
      group.dataset.bound = 'true';
      group.addEventListener('click', (event) => {
        const button = event.target.closest('[data-terms-view]');
        if (!button) return;
        safeSetItem('sapphire-analytics-terms-view', button.dataset.termsView);
        renderAnalyticsTermsV2();
      });
    }
  }
  const title = container.closest('.card')?.querySelector('.an-card-title');
  if (title) title.textContent = view === 'semester' ? 'By semester' : 'By term';
  const desc = document.getElementById('analytics-terms-desc');

  const yearOf = (assessment) => new Date(assessmentDateValue(assessment)).getUTCFullYear();
  const dated = getAllAssessments().filter((assessment) => assessment.total > 0 && assessmentDateValue(assessment));
  if (!dated.length) {
    container.innerHTML = '<div class="empty-state">No marks yet. Your term-by-term averages will show up here.</div>';
    if (desc) desc.textContent = `Your weighted average in each ${view}.`;
    return;
  }
  const year = Math.max(...dated.map(yearOf));
  const yearSubjects = state.data.subjects
    .map((subject) => ({ ...subject, assessments: subject.assessments.filter((assessment) => assessment.total > 0 && assessmentDateValue(assessment) && yearOf(assessment) === year) }))
    .filter((subject) => subject.assessments.length);
  const plans = termPlansBySubject(yearSubjects);
  const periods = view === 'semester' ? SEMESTER_PERIODS : TERM_PERIODS;
  const toPeriod = (term) => (view === 'semester' ? Math.floor(term / 2) : term);

  // Every mark in the year with the period it was placed in.
  const placedMarks = yearSubjects.flatMap((subject) => {
    const placed = assignMarksToTerms(subject, plans.get(subject.id));
    return subject.assessments.map((assessment) => ({ subject, assessment, period: toPeriod(placed.get(assessment.id).term), how: placed.get(assessment.id).how }));
  });
  const reordered = placedMarks.filter((mark) => mark.how === 'order').length;

  const averagesFor = (marks) => periods.map((_, index) => {
    const inPeriod = marks.filter((mark) => mark.period === index).map((mark) => mark.assessment);
    if (!inPeriod.length) return null;
    const average = weightedAverage(inPeriod);
    return { average, grade: getLetterGrade(average), count: inPeriod.length };
  });
  const rows = [
    { overall: true, name: 'Overall', cells: averagesFor(placedMarks) },
    ...yearSubjects.map((subject) => ({ subject, name: subject.name, cells: averagesFor(placedMarks.filter((mark) => mark.subject.id === subject.id)) })),
  ];

  const now = new Date();
  const currentPeriod = now.getFullYear() === year ? toPeriod(schoolTermIndex(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))) : -1;
  if (desc) {
    desc.textContent = `Your weighted average and grade in each ${view} of ${year}, and how it changed from the ${view} before.`;
  }

  const cellHtml = (cell, previous, row, period) => {
    if (!cell) return '<td class="an-terms-cell is-empty"><span class="an-terms-none" aria-label="No marks">—</span></td>';
    const delta = previous ? cell.average - previous.average : null;
    const label = `${row.name}, ${period.label}: ${cell.average.toFixed(1)}%, ${cell.grade}, from ${cell.count} mark${cell.count === 1 ? '' : 's'}`;
    return `
      <td class="an-terms-cell" title="${escapeHtml(label)}">
        <span class="an-terms-main">
          <span class="an-terms-value">${cell.average.toFixed(1)}<span class="an-terms-unit">%</span></span>
          ${v2GradeBadge(cell.grade, ' an-terms-grade')}
        </span>
        ${delta === null || Math.abs(delta) < 0.05 ? '' : v2DeltaHtml(delta)}
      </td>
    `;
  };

  container.innerHTML = `
    <div class="an-terms-scroll">
      <table class="an-terms-table${view === 'semester' ? ' is-semesters' : ''}">
        <thead>
          <tr>
            <th scope="col">Subject</th>
            ${periods.map((period, index) => `
              <th scope="col"${index === currentPeriod ? ' class="is-current"' : ''}>
                <span class="an-terms-period">${period.label}${index === currentPeriod ? '<span class="an-terms-now">Now</span>' : ''}</span>
                <span class="an-terms-months">${period.months}</span>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => {
            // A change is shown against the nearest earlier period that has marks.
            let previous = null;
            const cells = row.cells.map((cell, index) => {
              const html = cellHtml(cell, previous, row, periods[index]);
              if (cell) previous = cell;
              return html;
            }).join('');
            const nameHtml = row.overall
              ? `<span class="v2-subject-mark" style="--subject-color:var(--accent)" aria-hidden="true">${iconHtml('squares-four', '')}</span>`
              : subjectMarkHtml(row.subject.icon, row.subject.name, row.subject.color);
            return `
              <tr${row.overall ? ' class="is-overall"' : ''}>
                <th scope="row"><span class="an-terms-name">${nameHtml}<span class="an-terms-name-text">${escapeHtml(row.name)}</span></span></th>
                ${cells}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    <p class="an-terms-note">
      ${iconHtml('lucide:info', '')}
      <span>${reordered
        ? `${reordered} mark${reordered === 1 ? '' : 's'} had dates that didn't fit the subject's usual tasks per term, so ${reordered === 1 ? 'it was' : 'they were'} placed in task order instead.`
        : 'Marks are placed by date, checked against each subject\'s usual tasks per term.'} To move one, edit the mark and set its Term.</span>
    </p>
  `;
}

// Relative performance: how a mark sits against the rest of its subject, as a z-score (SDs from
// the subject's mean, each mark counted once). It needs three marks with some variation to mean
// anything. A subject's highest mark (from three marks up) is called out as its best.
function buildRelativeMarks() {
  const bySubject = new Map();
  state.data.subjects.forEach((subject) => {
    const percents = subjectPercents(subject);
    if (percents.length < 2) return;
    const spread = markSpread(percents);
    bySubject.set(subject.id, { name: subject.name, spread });
  });
  return bySubject;
}

function relativeMarkHtml(relative, assessment, percent) {
  const entry = relative.get(assessment.subjectId);
  if (!entry) return '';
  const { spread, name } = entry;
  const parts = [];
  if (spread.n >= 3 && spread.sd > 0) {
    const z = (percent - spread.mean) / spread.sd;
    const tone = z >= 1 ? ' is-up' : z <= -1 ? ' is-down' : '';
    const sign = z > 0.05 ? '+' : z < -0.05 ? '−' : '';
    const title = `${Math.abs(z).toFixed(1)} SD ${z >= 0 ? 'above' : 'below'} your ${name} average of ${spread.mean.toFixed(1)}%`;
    parts.push(`<span class="v2-an-rel${tone}" title="${escapeHtml(title)}">${sign}${Math.abs(z).toFixed(1)} SD</span>`);
  }
  if (spread.n >= 3 && percent >= spread.max && spread.max > spread.min) {
    parts.push(`<span class="v2-an-rel is-best" title="${escapeHtml(`Your highest ${name} mark`)}">${iconHtml('trophy', '')}Best</span>`);
  }
  return parts.length ? `<span aria-hidden="true"> · </span>${parts.join(' ')}` : '';
}

// Spread charts: box plots of marks. Each mark counts once (weighting is ignored, these are
// about consistency). Quartiles interpolate linearly (as Excel's QUARTILE.INC does); SD is the
// population SD. "Overall spread" pools every mark; "Spread by subject" has one row each.
function quantileOfSorted(values, q) {
  const position = (values.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return values[lower] + (values[upper] - values[lower]) * (position - lower);
}

function markSpread(percents) {
  const values = [...percents].sort((a, b) => a - b);
  const n = values.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const sd = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / n);
  const q1 = quantileOfSorted(values, 0.25);
  const q3 = quantileOfSorted(values, 0.75);
  const iqr = q3 - q1;
  // Outliers: marks more than 1.5 × IQR outside the box (Tukey's rule). With fewer than four
  // marks the quartiles are too rough to call anything an outlier. Whiskers stop at the
  // furthest mark that isn't one.
  const flagOutliers = n >= 4 && iqr > 0;
  const isOutlier = (value) => flagOutliers && (value < q1 - 1.5 * iqr || value > q3 + 1.5 * iqr);
  const inside = values.filter((value) => !isOutlier(value));
  return {
    n, min: values[0], q1, median: quantileOfSorted(values, 0.5), q3, max: values[n - 1], iqr, mean, sd,
    low: inside[0], high: inside[inside.length - 1], outliers: values.filter(isOutlier), isOutlier,
  };
}

function spreadOutliersHtml(scale, spread) {
  return spread.outliers.map((value) => `<span class="an-spread-outlier" style="left:${scale.at(value)}"></span>`).join('');
}

const SPREAD_KEY_OUTLIER = '<span class="an-spread-key-item"><span class="an-spread-key-outlier"></span>Outlier</span>';

function subjectPercents(subject) {
  return subject.assessments
    .filter((assessment) => assessment.total > 0)
    .map((assessment) => (assessment.score / assessment.total) * 100);
}

// A shared 0–100 scale starting at the 10 below the lowest value it has to show.
function spreadScale(lowest) {
  const low = clamp(Math.floor(lowest / 10) * 10, 0, 80);
  const step = 100 - low > 50 ? 20 : 10;
  const ticks = [];
  for (let value = low; value <= 100; value += step) ticks.push(value);
  const at = (value) => `${((clamp(value, low, 100) - low) / (100 - low)) * 100}%`;
  const span = (from, to) => `left:${at(from)};width:calc(${at(to)} - ${at(from)})`;
  return { ticks, at, span };
}

function spreadGridHtml(scale) {
  return `<span class="an-spread-grid" aria-hidden="true">${scale.ticks.map((value) => `<span style="left:${scale.at(value)}"></span>`).join('')}</span>`;
}

function spreadTooltipText(name, spread) {
  const f = (value) => value.toFixed(1);
  if (spread.n === 1) return `${name}\n1 mark: ${f(spread.min)}%\nAdd another mark to see a spread.`;
  return [
    `${name} · ${spread.n} marks`,
    `Min ${f(spread.min)}  ·  Max ${f(spread.max)}`,
    `Q1 ${f(spread.q1)}  ·  Median ${f(spread.median)}  ·  Q3 ${f(spread.q3)}`,
    `IQR ${f(spread.iqr)}  ·  Mean ${f(spread.mean)}  ·  SD ${f(spread.sd)}`,
    ...(spread.outliers.length ? [`Outlier${spread.outliers.length === 1 ? '' : 's'}: ${spread.outliers.map(f).join(', ')}`] : []),
  ].join('\n');
}

function renderAnalyticsSpreadV2() {
  renderAnalyticsOverallSpreadV2();
  renderAnalyticsSubjectSpreadV2();
}

function renderAnalyticsOverallSpreadV2() {
  const container = document.getElementById('analytics-overall-spread');
  if (!container) return;
  const desc = document.getElementById('analytics-overall-desc');

  const marks = state.data.subjects.flatMap((subject) => subject.assessments
    .filter((assessment) => assessment.total > 0)
    .map((assessment) => ({ subject, assessment, percent: (assessment.score / assessment.total) * 100 })));
  const percents = marks.map((mark) => mark.percent);
  if (percents.length < 2) {
    container.innerHTML = `<div class="empty-state">${percents.length ? 'Add another mark' : 'Add a couple of marks'} to see how your results spread out.</div>`;
    if (desc) desc.textContent = 'Every mark from every subject in one box plot.';
    return;
  }
  const spread = markSpread(percents);
  if (desc) desc.textContent = `All ${spread.n} marks from every subject in one box plot. Each mark counts once.`;
  const scale = spreadScale(Math.min(spread.min, spread.mean - spread.sd));
  const f = (value) => value.toFixed(1);
  const stat = (label, value, extra = '') => `<div class="an-overall-stat${extra}"><dt>${label}</dt><dd>${value}</dd></div>`;
  const outlierMarks = marks
    .filter((mark) => spread.isOutlier(mark.percent))
    .sort((left, right) => left.percent - right.percent);

  container.innerHTML = `
    <div class="an-overall-chart" aria-hidden="true">
      <div class="an-overall-plot">
        ${spreadGridHtml(scale)}
        <span class="an-spread-whisker" style="${scale.span(spread.low, spread.high)}"></span>
        <span class="an-spread-box" style="${scale.span(spread.q1, spread.q3)}"></span>
        <span class="an-spread-median" style="left:${scale.at(spread.median)}"></span>
        ${spreadOutliersHtml(scale, spread)}
        <span class="an-spread-sd" style="${scale.span(spread.mean - spread.sd, spread.mean + spread.sd)}"></span>
        <span class="an-spread-mean" style="left:${scale.at(spread.mean)}"></span>
      </div>
      <div class="an-spread-scale">${scale.ticks.map((value) => `<span style="left:${scale.at(value)}">${value}</span>`).join('')}</div>
    </div>
    <dl class="an-overall-stats">
      ${stat('Min', f(spread.min))}
      ${stat('Q1', f(spread.q1))}
      ${stat('Median', f(spread.median), ' is-key')}
      ${stat('Q3', f(spread.q3))}
      ${stat('Max', f(spread.max))}
      ${stat('IQR', f(spread.iqr), ' is-measure')}
      ${stat('Mean', f(spread.mean), ' is-measure')}
      ${stat('SD', f(spread.sd), ' is-measure')}
    </dl>
    ${outlierMarks.length ? `
      <p class="an-overall-outliers">
        <span class="an-overall-outliers-label">${outlierMarks.length === 1 ? 'Outlier' : `${outlierMarks.length} outliers`}</span>
        ${outlierMarks.map(({ subject, assessment, percent }) => `
          <span class="an-overall-outlier">
            ${subjectMarkHtml(subject.icon, subject.name, subject.color)}
            <span>${escapeHtml(assessment.name)}</span>
            <strong>${f(percent)}%</strong>
          </span>
        `).join('')}
      </p>` : ''}
    <div class="an-spread-key an-overall-key" aria-hidden="true">
      <span class="an-spread-key-item"><span class="an-spread-key-whisker"></span>${spread.outliers.length ? 'Range' : 'Min–max'}</span>
      <span class="an-spread-key-item"><span class="an-spread-key-box"><span></span></span>Q1–Q3 · median</span>
      <span class="an-spread-key-item"><span class="an-spread-key-sd"><span></span></span>Mean ± SD</span>
      ${spread.outliers.length ? SPREAD_KEY_OUTLIER : ''}
    </div>
  `;
}

function renderAnalyticsSubjectSpreadV2() {
  const container = document.getElementById('analytics-spread');
  if (!container) return;
  bindAnalyticsSpreadV2(container);
  const rows = state.data.subjects
    .map((subject, index) => {
      const percents = subjectPercents(subject);
      return { subject, index, average: subjectStats(subject).average, spread: percents.length ? markSpread(percents) : null };
    })
    .filter((row) => row.spread)
    .sort((left, right) => compareNullableNumbers(left.average, right.average, 'desc') || left.index - right.index);

  if (!rows.length) {
    container.innerHTML = '<div class="empty-state">No marks yet. Once a subject has a few marks, its spread shows up here.</div>';
    return;
  }

  const scale = spreadScale(Math.min(...rows.map(({ spread }) => Math.min(spread.min, spread.mean - spread.sd))));
  const gridHtml = spreadGridHtml(scale);
  const f = (value) => value.toFixed(1);

  const rowHtml = ({ subject, spread }) => {
    const single = spread.n === 1;
    const marks = single
      ? `<span class="an-spread-dot" style="left:${scale.at(spread.min)}"></span>`
      : `
        <span class="an-spread-whisker" style="${scale.span(spread.low, spread.high)}"></span>
        <span class="an-spread-box" style="${scale.span(spread.q1, spread.q3)}"></span>
        <span class="an-spread-median" style="left:${scale.at(spread.median)}"></span>
        ${spreadOutliersHtml(scale, spread)}
        <span class="an-spread-sd" style="${scale.span(spread.mean - spread.sd, spread.mean + spread.sd)}"></span>
        <span class="an-spread-mean" style="left:${scale.at(spread.mean)}"></span>
      `;
    const value = (number) => (single ? '—' : f(number));
    const label = single
      ? `${subject.name}: 1 mark, ${f(spread.min)}%.`
      : `${subject.name}: ${spread.n} marks. Minimum ${f(spread.min)}, Q1 ${f(spread.q1)}, median ${f(spread.median)}, Q3 ${f(spread.q3)}, maximum ${f(spread.max)}. IQR ${f(spread.iqr)}, mean ${f(spread.mean)}, SD ${f(spread.sd)}.${spread.outliers.length ? ` Outliers: ${spread.outliers.map(f).join(', ')}.` : ''}`;
    return `
      <button class="an-spread-row" type="button" data-action="open-subject" data-id="${subject.id}"
        style="--subject-color:${subject.color}" aria-label="${escapeHtml(label)} Open subject.">
        <span class="an-spread-name">
          ${subjectMarkHtml(subject.icon, subject.name, subject.color)}
          <span class="an-spread-name-text">${escapeHtml(subject.name)}</span>
        </span>
        <span class="an-spread-plot" aria-hidden="true">${gridHtml}${marks}</span>
        <span class="an-spread-num is-count" aria-hidden="true">${spread.n}</span>
        <span class="an-spread-num" aria-hidden="true">${value(spread.iqr)}</span>
        <span class="an-spread-num" aria-hidden="true">${single ? f(spread.min) : f(spread.mean)}</span>
        <span class="an-spread-num" aria-hidden="true">${value(spread.sd)}</span>
      </button>
    `;
  };

  container.innerHTML = `
    <div class="an-spread-head" aria-hidden="true">
      <span>Subject</span>
      <span class="an-spread-scale">${scale.ticks.map((value) => `<span style="left:${scale.at(value)}">${value}</span>`).join('')}</span>
      <span class="an-spread-num">Marks</span>
      <span class="an-spread-num">IQR</span>
      <span class="an-spread-num">Mean</span>
      <span class="an-spread-num">SD</span>
    </div>
    ${rows.map(rowHtml).join('')}
  `;
  const key = document.querySelector('.an-spread-card .an-spread-key');
  if (key) {
    const hasOutliers = rows.some(({ spread }) => spread.outliers.length);
    key.innerHTML = `
      <span class="an-spread-key-item"><span class="an-spread-key-whisker"></span>${hasOutliers ? 'Range' : 'Min–max'}</span>
      <span class="an-spread-key-item"><span class="an-spread-key-box"><span></span></span>Q1–Q3 · median</span>
      <span class="an-spread-key-item"><span class="an-spread-key-sd"><span></span></span>Mean ± SD</span>
      ${hasOutliers ? SPREAD_KEY_OUTLIER : ''}
    `;
  }
  container._spreadText = new Map(rows.map(({ subject, spread }) => [subject.id, spreadTooltipText(subject.name, spread)]));
}

function bindAnalyticsSpreadV2(container) {
  if (container.dataset.tooltipBound) return;
  container.dataset.tooltipBound = 'true';
  const show = (row, x) => {
    const text = container._spreadText?.get(row.dataset.id);
    if (!text) return;
    const plot = row.querySelector('.an-spread-plot').getBoundingClientRect();
    showChartTooltip(text, clamp(x ?? plot.left + plot.width / 2, plot.left, plot.right), plot.top);
  };
  container.addEventListener('pointermove', (event) => {
    const row = event.target.closest('.an-spread-row');
    if (row) show(row, event.clientX);
    else hideChartTooltip();
  });
  container.addEventListener('pointerleave', hideChartTooltip);
  container.addEventListener('focusin', (event) => {
    const row = event.target.closest('.an-spread-row');
    if (row) show(row);
  });
  container.addEventListener('focusout', hideChartTooltip);
}

// Grade breakdown: how many marks landed in each grade, A+ down to E. Clicking a
// column filters the All assessments table below to that grade; clicking it again
// clears the filter. The choice is kept on the container (render() runs before
// top-level state this far down is initialised).
function getAnalyticsGradeFilter() {
  return document.getElementById('analytics-grades')?.dataset.selectedGrade || '';
}

function setAnalyticsGradeFilter(grade) {
  const container = document.getElementById('analytics-grades');
  if (!container) return;
  container.dataset.selectedGrade = grade;
  renderAnalyticsGradesV2(getAllAssessments());
  renderAssessments();
  if (!grade) return;
  const table = document.querySelector('.assessment-card');
  const rect = table?.getBoundingClientRect();
  if (rect && (rect.top > window.innerHeight - 120 || rect.top < 0)) {
    table.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderAnalyticsGradesV2(allAssessments) {
  const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
  const container = document.getElementById('analytics-grades');
  const summary = document.getElementById('analytics-grades-summary');
  if (!container) return;
  bindAnalyticsGradesV2(container);

  const counts = new Map(gradeOrder.map((grade) => [grade, 0]));
  allAssessments
    .filter((assessment) => assessment.total > 0)
    .forEach((assessment) => {
      const grade = getLetterGrade((assessment.score / assessment.total) * 100);
      counts.set(grade, counts.get(grade) + 1);
    });
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);

  if (!total) {
    container.dataset.selectedGrade = '';
    container.classList.remove('has-selection');
    container.innerHTML = '<div class="empty-state">No marks yet. Your grade breakdown will show up here.</div>';
    if (summary) summary.textContent = 'How many of your marks landed in each grade.';
    return;
  }

  let selected = container.dataset.selectedGrade || '';
  if (selected && !counts.get(selected)) selected = '';
  container.dataset.selectedGrade = selected;
  container.classList.toggle('has-selection', Boolean(selected));

  const max = Math.max(...counts.values());
  container.innerHTML = gradeOrder.map((grade, index) => {
    const count = counts.get(grade);
    const height = count ? Math.max(8, (count / max) * 100) : 0;
    const bandStart = index > 0 && grade[0] !== gradeOrder[index - 1][0];
    return `
      <button class="an-grade-col${count ? '' : ' is-empty'}${bandStart ? ' is-band-start' : ''}${grade === selected ? ' is-selected' : ''}"
        type="button" data-grade="${grade[0]}" data-grade-value="${grade}" ${count ? '' : 'disabled'}
        aria-pressed="${grade === selected}" aria-label="${grade}: ${count} mark${count === 1 ? '' : 's'}${count ? ' — show them in the table' : ''}">
        <span class="an-grade-count">${count || ''}</span>
        <span class="an-grade-track"><span class="an-grade-bar" style="height:${height}%"></span></span>
        <span class="an-grade-label">${grade}</span>
      </button>
    `;
  }).join('');

  if (summary) {
    const [topGrade, topCount] = [...counts.entries()].reduce((best, entry) => (entry[1] > best[1] ? entry : best));
    const aRange = ['A+', 'A', 'A-'].reduce((sum, grade) => sum + counts.get(grade), 0);
    summary.textContent = `Most common: ${topGrade} (${topCount} of ${total} marks) · ${Math.round((aRange / total) * 100)}% in the A range. Click a grade to filter the table below.`;
  }
}

function bindAnalyticsGradesV2(container) {
  if (container.dataset.bound) return;
  container.dataset.bound = 'true';
  container.addEventListener('click', (event) => {
    const column = event.target.closest('[data-grade-value]');
    if (!column || column.disabled) return;
    const grade = column.dataset.gradeValue;
    setAnalyticsGradeFilter(getAnalyticsGradeFilter() === grade ? '' : grade);
  });
  document.getElementById('analytics-grade-filter')?.addEventListener('click', () => setAnalyticsGradeFilter(''));
}

function renderAnalyticsSparklines() {
  if (!isUiV2()) return;
  document.querySelectorAll('canvas[data-chart="v2-spark"]').forEach((canvas) => {
    const subject = state.data.subjects.find((item) => item.id === canvas.dataset.id);
    if (!subject) return;
    // Spaced one step per mark rather than by date, so the shape reads as a trend.
    const points = buildSubjectTimelinePoints(subject.assessments).map(({ value, label }) => ({ value, label }));
    drawLineChart(canvas, points, {
      stroke: subject.color,
      showAxis: false,
      v2: true,
      compact: true,
    });
  });
}

function renderInsights() {
  if (isUiV2()) {
    renderAnalyticsV2();
    return;
  }
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

function renderCharts() {
  renderOverallChart();
  renderSubjectCharts();
  renderSubjectsChart();
  renderAnalyticsSparklines();
}

// V2: the overall trend card has a range switch (1M / 3M / All) and a headline figure.
// The running average is still computed over every mark; the range only crops the view.
function renderOverallChartV2(sorted, points) {
  const range = getAnalyticsRange();
  const cutoff = analyticsRangeCutoff(range);
  const visible = cutoff === null ? points : points.filter((point) => point.xValue >= cutoff);
  const baseline = cutoff === null
    ? points[0]
    : [...points].reverse().find((point) => point.xValue < cutoff) || visible[0];
  const current = points[points.length - 1];

  document.querySelectorAll('#analytics-range [data-analytics-range]').forEach((button) => {
    const active = button.dataset.analyticsRange === range;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const figure = document.getElementById('analytics-trend-figure');
  if (figure) {
    const rangeLabel = range === 'all' ? 'since your first mark' : `in the last ${range === '30' ? '30' : '90'} days`;
    const change = current && baseline && visible.length && current !== baseline ? current.value - baseline.value : null;
    // The overall average itself is in the stat strip above; this card leads with the change.
    const dir = change === null || Math.abs(change) < 0.05 ? 'flat' : change > 0 ? 'up' : 'down';
    const changeText = change === null ? '—' : dir === 'flat' ? '0.0' : `${change > 0 ? '+' : '−'}${Math.abs(change).toFixed(1)}`;
    figure.innerHTML = current
      ? `<span class="v2-an-figure-value" data-dir="${dir}">${changeText}<span class="v2-stat-unit">${change === null ? '' : '%'}</span></span>
         <span class="v2-an-figure-change">${change === null ? 'Not enough marks to show a change yet' : `Average ${rangeLabel}`}</span>`
      : '<span class="v2-an-figure-value">—</span><span class="v2-an-figure-change">Add marks to see your trend</span>';
  }

  if (elements.progressLegend) {
    elements.progressLegend.textContent = points.length === 0
      ? 'No marks yet.'
      : visible.length === 0
      ? 'No marks in this range.'
      : `${visible.length} mark${visible.length === 1 ? '' : 's'} shown · last updated ${formatDate(sorted[sorted.length - 1].date)}`;
  }

  drawLineChart(elements.overallChart, addTimelineEdgeLabels(visible.map((point) => ({ ...point }))), {
    stroke: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    showAxis: true,
    v2: true,
    emptyText: points.length ? 'No marks in this range' : 'No marks yet',
  });
}

function renderOverallChart() {
  if (!elements.overallChart) return;
  const sorted = sortAssessments(getAllAssessments());
  const points = buildOverallTimelinePoints(sorted);

  if (isUiV2()) {
    renderOverallChartV2(sorted, points);
    return;
  }

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
    const points = buildSubjectTimelinePoints(subject.assessments);
    drawLineChart(canvas, points, { stroke: subject.color, showAxis: false });
  });
}

function renderSubjectsChart() {
  if (!elements.subjectsChart) return;
  const allSeries = state.data.subjects
    .map((subject) => ({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      icon: resolveSubjectIcon(subject.icon, subject.name),
      points: buildSubjectTimelinePoints(subject.assessments),
      average: subjectStats(subject).average,
    }))
    .filter((subject) => subject.points.length > 0);
  const validIds = new Set(allSeries.map((subject) => subject.id));
  Array.from(hiddenSubjectsChartIds).forEach((subjectId) => {
    if (!validIds.has(subjectId)) {
      hiddenSubjectsChartIds.delete(subjectId);
    }
  });
  const series = allSeries.filter((subject) => !hiddenSubjectsChartIds.has(subject.id));
  const totalCount = allSeries.length;
  const visibleCount = series.length;

  const v2 = isUiV2();
  if (elements.subjectsLegend) {
    elements.subjectsLegend.textContent = !totalCount
      ? 'No subject data yet.'
      : v2
      ? `${visibleCount} of ${totalCount} subjects shown · Click a subject to show or hide its line.`
      : `${visibleCount}/${totalCount} subject lines visible · Hover for details. Tip: Click subject chips below to hide/show lines.`;
  }

  if (elements.subjectsKey) {
    elements.subjectsKey.innerHTML = allSeries
      .map(
        (subject) => `
          <button
            class="chart-key-item${hiddenSubjectsChartIds.has(subject.id) ? ' is-hidden' : ''}"
            type="button"
            data-action="toggle-subject-line"
            data-subject-id="${subject.id}"
            aria-pressed="${hiddenSubjectsChartIds.has(subject.id) ? 'false' : 'true'}"
            title="Click to ${hiddenSubjectsChartIds.has(subject.id) ? 'show' : 'hide'} ${subject.name}"
          >
            <span class="chart-key-swatch" style="--swatch:${subject.color}"></span>
            ${subject.name}${v2 && subject.average !== null ? `<span class="chart-key-value v2-only">${subject.average.toFixed(1)}%</span>` : ''}
          </button>
        `
      )
      .join('');
  }

  drawMultiLineChart(
    elements.subjectsChart,
    series,
    v2 ? { v2: true, emptyText: totalCount ? 'Every subject is hidden' : 'No marks yet' } : undefined
  );
}

function bindAnalyticsEvents() {
  if (elements.subjectsKey) {
    elements.subjectsKey.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-action="toggle-subject-line"]');
      if (!toggle) return;
      const subjectId = toggle.dataset.subjectId;
      if (!subjectId) return;
      if (hiddenSubjectsChartIds.has(subjectId)) {
        hiddenSubjectsChartIds.delete(subjectId);
      } else {
        hiddenSubjectsChartIds.add(subjectId);
      }
      hideChartTooltip();
      renderSubjectsChart();
    });
  }
}
