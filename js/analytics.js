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
                  <span class="v2-an-recent-meta">${escapeHtml(assessment.subjectName)} · ${formatDate(assessment.date)}</span>
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

// Spread by subject: a box plot of each subject's marks, one row per subject, on a shared
// percentage scale. Each mark counts once (weighting is ignored, it's about consistency).
// Quartiles interpolate linearly (as Excel's QUARTILE.INC does); SD is the population SD.
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
  return { n, min: values[0], q1, median: quantileOfSorted(values, 0.5), q3, max: values[n - 1], iqr: q3 - q1, mean, sd };
}

function spreadTooltipText(name, spread) {
  const f = (value) => value.toFixed(1);
  if (spread.n === 1) return `${name}\n1 mark: ${f(spread.min)}%\nAdd another mark to see a spread.`;
  return [
    `${name} · ${spread.n} marks`,
    `Min ${f(spread.min)}  ·  Max ${f(spread.max)}`,
    `Q1 ${f(spread.q1)}  ·  Median ${f(spread.median)}  ·  Q3 ${f(spread.q3)}`,
    `IQR ${f(spread.iqr)}  ·  Mean ${f(spread.mean)}  ·  SD ${f(spread.sd)}`,
  ].join('\n');
}

function renderAnalyticsSpreadV2() {
  const container = document.getElementById('analytics-spread');
  if (!container) return;
  bindAnalyticsSpreadV2(container);
  const showAll = safeGetItem('sapphire-analytics-spread-all') !== 'off';
  const allToggle = document.getElementById('analytics-spread-all');
  if (allToggle) allToggle.checked = showAll;
  const rows = state.data.subjects
    .map((subject, index) => {
      const percents = subject.assessments
        .filter((assessment) => assessment.total > 0)
        .map((assessment) => (assessment.score / assessment.total) * 100);
      return { subject, index, average: subjectStats(subject).average, spread: percents.length ? markSpread(percents) : null };
    })
    .filter((row) => row.spread)
    .sort((left, right) => compareNullableNumbers(left.average, right.average, 'desc') || left.index - right.index);

  if (!rows.length) {
    container.innerHTML = '<div class="empty-state">No marks yet. Once a subject has a few marks, its spread shows up here.</div>';
    return;
  }

  // Optional first row: every mark from every subject pooled together.
  const allPercents = rows.flatMap(({ subject }) => subject.assessments
    .filter((assessment) => assessment.total > 0)
    .map((assessment) => (assessment.score / assessment.total) * 100));
  const allRow = showAll ? { all: true, subject: { id: 'all', name: 'All subjects' }, spread: markSpread(allPercents) } : null;
  const plotted = allRow ? [allRow, ...rows] : rows;

  // Shared scale: from the 10 below the lowest mark (or SD tail) up to 100.
  const lowest = Math.min(...plotted.map(({ spread }) => Math.min(spread.min, spread.mean - spread.sd)));
  const low = clamp(Math.floor(lowest / 10) * 10, 0, 80);
  const step = 100 - low > 50 ? 20 : 10;
  const at = (value) => `${((clamp(value, low, 100) - low) / (100 - low)) * 100}%`;
  const ticks = [];
  for (let value = low; value <= 100; value += step) ticks.push(value);
  const gridHtml = `<span class="an-spread-grid" aria-hidden="true">${ticks.map((value) => `<span style="left:${at(value)}"></span>`).join('')}</span>`;

  const rowHtml = ({ all, subject, spread }) => {
    const f = (value) => value.toFixed(1);
    const marks = spread.n === 1
      ? `<span class="an-spread-dot" style="left:${at(spread.min)}"></span>`
      : `
        <span class="an-spread-whisker" style="left:${at(spread.min)};width:calc(${at(spread.max)} - ${at(spread.min)})"></span>
        <span class="an-spread-box" style="left:${at(spread.q1)};width:calc(${at(spread.q3)} - ${at(spread.q1)})"></span>
        <span class="an-spread-median" style="left:${at(spread.median)}"></span>
        <span class="an-spread-sd" style="left:${at(spread.mean - spread.sd)};width:calc(${at(spread.mean + spread.sd)} - ${at(spread.mean - spread.sd)})"></span>
        <span class="an-spread-mean" style="left:${at(spread.mean)}"></span>
      `;
    const statsHtml = spread.n === 1
      ? `<span class="an-spread-stat-main">${f(spread.min)}%</span><span class="an-spread-stat-sub">1 mark</span>`
      : `<span class="an-spread-stat-main">IQR ${f(spread.iqr)}</span><span class="an-spread-stat-sub">SD ${f(spread.sd)} · ${spread.n} marks</span>`;
    const label = spread.n === 1
      ? `${subject.name}: 1 mark, ${f(spread.min)}%.`
      : `${subject.name}: ${spread.n} marks. Minimum ${f(spread.min)}, Q1 ${f(spread.q1)}, median ${f(spread.median)}, Q3 ${f(spread.q3)}, maximum ${f(spread.max)}. IQR ${f(spread.iqr)}, mean ${f(spread.mean)}, SD ${f(spread.sd)}.`;
    const inner = `
        <span class="an-spread-name">
          ${all
            ? `<span class="v2-subject-mark" aria-hidden="true">${iconHtml('squares-four', '')}</span>`
            : subjectMarkHtml(subject.icon, subject.name, subject.color)}
          <span class="an-spread-name-text">${escapeHtml(subject.name)}</span>
        </span>
        <span class="an-spread-plot" aria-hidden="true">${gridHtml}${marks}</span>
        <span class="an-spread-stats" aria-hidden="true">${statsHtml}</span>
    `;
    // The pooled row isn't a subject, so it has nothing to open; it still takes focus for its readout.
    return all
      ? `<div class="an-spread-row is-all" tabindex="0" role="group" data-id="all" style="--subject-color:var(--accent)" aria-label="${escapeHtml(label)}">${inner}</div>`
      : `<button class="an-spread-row" type="button" data-action="open-subject" data-id="${subject.id}"
          style="--subject-color:${subject.color}" aria-label="${escapeHtml(label)} Open subject.">${inner}</button>`;
  };

  const axisHtml = `
    <div class="an-spread-axis" aria-hidden="true">
      <span></span>
      <span class="an-spread-axis-scale">${ticks.map((value) => `<span style="left:${at(value)}">${value}</span>`).join('')}</span>
      <span></span>
    </div>
  `;
  container.innerHTML = plotted.map(rowHtml).join('') + axisHtml;
  container._spreadText = new Map(plotted.map(({ subject, spread }) => [subject.id, spreadTooltipText(subject.name, spread)]));
}

function bindAnalyticsSpreadV2(container) {
  if (container.dataset.tooltipBound) return;
  container.dataset.tooltipBound = 'true';
  document.getElementById('analytics-spread-all')?.addEventListener('change', (event) => {
    safeSetItem('sapphire-analytics-spread-all', event.target.checked ? 'on' : 'off');
    hideChartTooltip();
    renderAnalyticsSpreadV2();
  });
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
