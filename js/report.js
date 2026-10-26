// V2: a term / semester / full-year report, opened from the "By term" card on Analytics.
// Page 1 is an overview of every subject; then one page per subject with marks in the period.
// The numbers come from the same term placement as the By term table (termPlansBySubject +
// assignMarksToTerms in analytics.js), so the two always agree.
// "Download PDF" lazy-loads jsPDF + html2canvas from cdnjs and renders each page to an A4 page.

const reportState = { kind: 'term', index: 0 };

const REPORT_LIBS = [
  { src: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', ready: () => window.jspdf?.jsPDF },
  { src: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', ready: () => window.html2canvas },
];
// A4 at 96 dpi: the size each page is laid out at for the PDF.
const REPORT_PAGE_PX = { width: 794, height: 1123 };
const REPORT_YEAR_PERIODS = [{ label: 'Full year', months: 'Terms 1–4' }];

// ── Data ──

function reportYearOf(assessment) {
  return new Date(assessmentDateValue(assessment)).getUTCFullYear();
}

function reportMarksInYear(subject, year) {
  return subject.assessments.filter((assessment) => assessment.total > 0 && assessmentDateValue(assessment) && reportYearOf(assessment) === year);
}

function reportLatestYear() {
  const dated = getAllAssessments().filter((assessment) => assessment.total > 0 && assessmentDateValue(assessment));
  return dated.length ? Math.max(...dated.map(reportYearOf)) : new Date().getFullYear();
}

function reportPeriodsFor(kind) {
  if (kind === 'semester') return SEMESTER_PERIODS;
  if (kind === 'year') return REPORT_YEAR_PERIODS;
  return TERM_PERIODS;
}

// Which terms (0–3) a reported period covers.
function reportTermsIn(kind, index) {
  if (kind === 'semester') return [index * 2, index * 2 + 1];
  if (kind === 'year') return [0, 1, 2, 3];
  return [index];
}

function reportCell(assessments) {
  if (!assessments.length) return null;
  const average = weightedAverage(assessments);
  return { average, grade: getLetterGrade(average), count: assessments.length, marks: sortAssessments(assessments) };
}

// Every subject's marks in the latest year, placed in terms the way renderAnalyticsTermsV2
// does, then grouped by the chosen kind of period.
function buildReportData(kind) {
  const year = reportLatestYear();
  const periods = reportPeriodsFor(kind);
  const toPeriod = (term) => (kind === 'semester' ? Math.floor(term / 2) : kind === 'year' ? 0 : term);
  const now = new Date();
  const yearSubjects = state.data.subjects
    .map((subject) => ({ ...subject, assessments: reportMarksInYear(subject, year) }))
    .filter((subject) => subject.assessments.length);
  const plans = termPlansBySubject(yearSubjects);

  const placedMarks = yearSubjects.flatMap((subject) => {
    const placed = assignMarksToTerms(subject, plans.get(subject.id));
    return subject.assessments.map((assessment) => ({ subject, assessment, term: placed.get(assessment.id).term }));
  });

  const cellsFor = (marks) => periods.map((_, index) => reportCell(marks.filter((mark) => toPeriod(mark.term) === index).map((mark) => mark.assessment)));
  const termCellsFor = (marks) => TERM_PERIODS.map((_, term) => reportCell(marks.filter((mark) => mark.term === term).map((mark) => mark.assessment)));
  // The year before, for a full-year report's change.
  const lastYearCell = (subject) => reportCell(subject ? reportMarksInYear(subject, year - 1) : state.data.subjects.flatMap((item) => reportMarksInYear(item, year - 1)));

  const currentTerm = schoolTermIndex(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const currentPeriod = now.getFullYear() === year ? toPeriod(currentTerm) : -1;

  return {
    kind,
    year,
    periods,
    currentPeriod,
    overall: cellsFor(placedMarks),
    overallTerms: termCellsFor(placedMarks),
    overallLastYear: kind === 'year' ? lastYearCell(null) : null,
    subjects: yearSubjects.map((subject) => {
      const marks = placedMarks.filter((mark) => mark.subject.id === subject.id);
      const live = state.data.subjects.find((item) => item.id === subject.id) || subject;
      return {
        subject,
        // The full subject (every mark, any year) for the "now" figures: target and next grade.
        live,
        placed: marks.sort((a, b) => a.term - b.term || assessmentDateValue(a.assessment) - assessmentDateValue(b.assessment)),
        cells: cellsFor(marks),
        terms: termCellsFor(marks),
        lastYear: kind === 'year' ? lastYearCell(live) : null,
      };
    }),
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

// A change is measured against the nearest earlier period that has marks (as in the By term
// table). A full-year report compares with the year before.
function reportPrevious(cells, index, data, lastYear) {
  if (data.kind === 'year') return lastYear ? { cell: lastYear, label: String(data.year - 1) } : null;
  for (let earlier = index - 1; earlier >= 0; earlier -= 1) {
    if (cells[earlier]) return { cell: cells[earlier], label: data.periods[earlier].label };
  }
  return null;
}

function reportMarkPercent(assessment) {
  return (assessment.score / assessment.total) * 100;
}

function reportBestMark(marks) {
  return marks.reduce((best, assessment) => (!best || reportMarkPercent(assessment) >= reportMarkPercent(best) ? assessment : best), null);
}

function reportWorstMark(marks) {
  return marks.reduce((worst, assessment) => (!worst || reportMarkPercent(assessment) < reportMarkPercent(worst) ? assessment : worst), null);
}

function reportPercent(value) {
  return `${value.toFixed(1)}%`;
}

function reportOrdinal(value) {
  const tens = value % 100;
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][value % 10] || 'th';
  return `${value}${suffix}`;
}

// Task names are often just "1", "2"…: read those as "Task 1".
function reportTaskName(name) {
  const text = String(name || '').trim();
  if (!text) return 'Untitled task';
  return /^\d+[a-z]?$/i.test(text) ? `Task ${text}` : text;
}

function reportPeriodName(data, index) {
  return `${data.periods[index].label} ${data.year}`;
}

function reportKindWord(data) {
  return data.kind === 'semester' ? 'semester' : data.kind === 'year' ? 'year' : 'term';
}

function reportTitleFor(kind) {
  return kind === 'semester' ? 'Semester report' : kind === 'year' ? 'Year report' : 'Term report';
}

function reportShortDate(value) {
  const date = new Date(dateStringValue(value));
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

// ── Shared pieces ──

function reportChangeHtml(previous, cell, firstText = 'First marks') {
  if (!previous) return `<span class="report-change-none">${firstText}</span>`;
  return `
    <span class="report-change">
      ${v2DeltaHtml(cell.average - previous.cell.average)}
      <span class="report-change-from">vs ${escapeHtml(previous.label)}</span>
    </span>
  `;
}

function reportMastheadHtml(data, index) {
  const name = loadUserName();
  return `
    <header class="report-masthead">
      <div class="report-brand"><span class="report-brand-mark" aria-hidden="true">◆</span>Sapphire</div>
      <div class="report-masthead-meta">${escapeHtml(name ? `${name} · ` : '')}${escapeHtml(reportPeriodName(data, index))} report</div>
    </header>
  `;
}

function reportFootHtml(pageNumber, pageCount, note = '') {
  const generated = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  return `
    <footer class="report-foot">
      <span>Generated ${escapeHtml(generated)}${note ? ` · ${note}` : ''}</span>
      <span class="report-foot-page">Page ${pageNumber} of ${pageCount}</span>
    </footer>
  `;
}

function reportFactsHtml(facts) {
  return `
    <dl class="report-facts" style="--report-facts:${facts.length}">
      ${facts.map((fact) => `<div><dt>${fact.label}</dt><dd>${fact.value}</dd>${fact.sub ? `<span class="report-fact-sub">${fact.sub}</span>` : ''}</div>`).join('')}
    </dl>
  `;
}

// A report never shows anything after its own period: only terms up to its last one.
function reportVisibleTerms(kind, index) {
  return Math.max(...reportTermsIn(kind, index)) + 1;
}

// Term by term within a semester or year: each reported term's average and how it moved from
// the term before (earlier terms only appear as that change, never as their own averages).
function reportTermStripHtml(terms, activeTerms) {
  const shown = activeTerms.filter((term) => terms[term]);
  if (shown.length < 2) return '';
  return `
    <ol class="report-year-strip" style="--report-cols:${activeTerms.length}">
      ${activeTerms.map((term) => {
        const cell = terms[term];
        let previous = null;
        for (let earlier = term - 1; earlier >= 0; earlier -= 1) {
          if (terms[earlier]) {
            previous = { cell: terms[earlier], label: TERM_PERIODS[earlier].label };
            break;
          }
        }
        return `
          <li class="report-year-cell${cell ? '' : ' is-empty'}">
            <span class="report-year-label">${escapeHtml(TERM_PERIODS[term].label)}</span>
            ${cell
              ? `<span class="report-year-value">${reportPercent(cell.average)}${v2GradeBadge(cell.grade, ' report-year-grade')}</span>
                 <span class="report-year-change">${reportChangeHtml(previous, cell, 'First term with marks')}</span>`
              : '<span class="report-year-value is-none">No marks</span>'}
          </li>
        `;
      }).join('')}
    </ol>
  `;
}

// ── Page 1: overview ──

function reportOverviewPageHtml(data, index, pageCount) {
  const period = data.periods[index];
  const periodName = reportPeriodName(data, index);
  const kindWord = reportKindWord(data);
  const name = loadUserName();
  const overall = data.overall[index];
  const identity = `
    <div class="report-identity">
      <p class="report-doc-title">${reportTitleFor(data.kind)}</p>
      <h3 class="report-name">${escapeHtml(name || 'Your report')}</h3>
      <p class="report-period">${escapeHtml(periodName)}<span class="report-period-months">${escapeHtml(period.months)}</span>${index === data.currentPeriod ? '<span class="report-period-now">In progress</span>' : ''}</p>
    </div>
  `;

  if (!overall) {
    return `
      <article class="report-page report-page--overview" aria-label="${escapeHtml(`${periodName} overview`)}">
        ${reportMastheadHtml(data, index)}
        <div class="report-top">${identity}</div>
        <div class="report-empty">
          ${iconHtml('lucide:file-text', 'report-empty-icon')}
          <p class="report-empty-title">No marks in ${escapeHtml(periodName)}</p>
          <p class="report-empty-text">Marks you log for this ${kindWord} will show up here. Pick another period above to see its report.</p>
        </div>
        ${reportFootHtml(1, pageCount)}
      </article>
    `;
  }

  const overallPrevious = reportPrevious(data.overall, index, data, data.overallLastYear);
  const withMarks = data.subjects.filter((row) => row.cells[index]);
  const withoutMarks = data.subjects.filter((row) => !row.cells[index]);
  const ranked = [...withMarks].sort((a, b) => b.cells[index].average - a.cells[index].average);
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];
  const gradeCounts = withMarks.reduce((counts, row) => {
    const band = (row.cells[index].grade || '-')[0];
    counts[band] = (counts[band] || 0) + 1;
    return counts;
  }, {});

  // A full-year report has nothing to compare with until there's a year before it.
  const showChange = data.kind !== 'year' || withMarks.some((row) => row.lastYear);
  const rows = withMarks.map((row, position) => {
    const { subject, cells } = row;
    const cell = cells[index];
    const best = reportBestMark(cell.marks);
    return `
      <tr>
        <th scope="row">
          <span class="report-subject">${subjectMarkHtml(subject.icon, subject.name, subject.color, 'report-subject-mark')}<span class="report-subject-name">${escapeHtml(subject.name)}</span></span>
        </th>
        <td class="report-num report-avg">${reportPercent(cell.average)}</td>
        <td class="report-grade-cell">${v2GradeBadge(cell.grade)}</td>
        ${showChange ? `<td class="report-change-cell">${reportChangeHtml(reportPrevious(cells, index, data, row.lastYear), cell)}</td>` : ''}
        <td class="report-num report-count">${cell.count}</td>
        <td class="report-best">
          ${best ? `<span class="report-best-name">${escapeHtml(reportTaskName(best.name))}</span><span class="report-best-value">${reportPercent(reportMarkPercent(best))}</span>` : '—'}
        </td>
        <td class="report-num report-page-ref">${position + 2}</td>
      </tr>
    `;
  }).join('');

  const overallChange = overallPrevious
    ? `${v2DeltaHtml(overall.average - overallPrevious.cell.average)}<span class="report-change-from">vs ${escapeHtml(overallPrevious.label)}</span>`
    : `<span class="report-change-none">First ${kindWord} with marks</span>`;
  const gradeMix = ['A', 'B', 'C', 'D', 'E'].filter((band) => gradeCounts[band]).map((band) => `${gradeCounts[band]} ${band}`).join(' · ');

  return `
    <article class="report-page report-page--overview" aria-label="${escapeHtml(`${periodName} overview`)}">
      ${reportMastheadHtml(data, index)}
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
      ${reportFactsHtml([
        { label: 'Subjects', value: withMarks.length, sub: gradeMix ? escapeHtml(gradeMix) : '' },
        { label: 'Tasks marked', value: overall.count },
        { label: 'Strongest', value: reportPercent(strongest.cells[index].average), sub: escapeHtml(strongest.subject.name) },
        { label: 'Weakest', value: reportPercent(weakest.cells[index].average), sub: escapeHtml(weakest.subject.name) },
      ])}
      <section class="report-section">
        <h4 class="report-section-title">Subjects</h4>
        <table class="report-table report-table--overview">
          <thead>
            <tr>
              <th scope="col">Subject</th>
              <th scope="col" class="report-num">Average</th>
              <th scope="col">Grade</th>
              ${showChange ? '<th scope="col">Change</th>' : ''}
              <th scope="col" class="report-num">Tasks</th>
              <th scope="col">Best task</th>
              <th scope="col" class="report-num report-page-ref">Page</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        ${withoutMarks.length ? `<p class="report-missing">No marks this ${kindWord}: ${withoutMarks.map((row) => escapeHtml(row.subject.name)).join(', ')}.</p>` : ''}
      </section>
      ${reportTermStripHtml(data.overallTerms, reportTermsIn(data.kind, index)) ? `
        <section class="report-section">
          <h4 class="report-section-title">Overall, term by term <span class="report-section-note">Change from the term before</span></h4>
          ${reportTermStripHtml(data.overallTerms, reportTermsIn(data.kind, index))}
        </section>
      ` : ''}
      ${reportFootHtml(1, pageCount, `Averages are weighted by each task's weighting. Marks are placed in terms by each subject's usual task pattern, as in Analytics.`)}
    </article>
  `;
}

// ── Subject pages ──

// A scale fitted to the marks (the shared spreadScale always runs to 100 from 10 below the lowest,
// which squeezes a tight set of marks into a sliver). Same shape: { ticks, at, span }.
function reportSpreadScale(spread) {
  const lowest = Math.min(spread.min, spread.mean - spread.sd);
  const highest = Math.max(spread.max, spread.mean + spread.sd);
  const pad = Math.max(1, (highest - lowest) * 0.2);
  const step = highest - lowest > 30 ? 10 : highest - lowest > 8 ? 5 : 2;
  let low = Math.max(0, Math.floor((lowest - pad) / step) * step);
  let high = Math.min(100, Math.ceil((highest + pad) / step) * step);
  // Too tight: widen to at least 8 points, centred on the marks.
  if (high - low < 8) {
    const middle = (lowest + highest) / 2;
    low = Math.floor((middle - 4) / step) * step;
    high = Math.ceil((middle + 4) / step) * step;
    if (high > 100) { low -= high - 100; high = 100; }
    if (low < 0) { high = Math.min(100, high - low); low = 0; }
  }
  const tickStep = (high - low) / step > 6 ? step * 2 : step;
  const ticks = [];
  for (let value = low; value <= high + 1e-9; value += tickStep) ticks.push(value);
  const at = (value) => `${((clamp(value, low, high) - low) / (high - low)) * 100}%`;
  const span = (from, to) => `left:${at(from)};width:calc(${at(to)} - ${at(from)})`;
  return { ticks, at, span };
}

// The subject's marks this period as a box plot, composed the same way as the subject popup's.
function reportSpreadHtml(subject, marks) {
  const spread = markSpread(marks.map(reportMarkPercent));
  const scale = reportSpreadScale(spread);
  const f = (value) => value.toFixed(1);
  const stat = (label, value) => `<div><dt>${label}</dt><dd>${value}</dd></div>`;
  return `
    <div class="report-spread" style="--subject-color:${subject.color}">
      <div class="report-spread-plot" aria-hidden="true">
        ${spreadGridHtml(scale)}
        <span class="an-spread-whisker" style="${scale.span(spread.low, spread.high)}"></span>
        <span class="an-spread-box" style="${scale.span(spread.q1, spread.q3)}"></span>
        <span class="an-spread-median" style="left:${scale.at(spread.median)}"></span>
        ${spreadOutliersHtml(scale, spread)}
        <span class="an-spread-sd" style="${scale.span(spread.mean - spread.sd, spread.mean + spread.sd)}"></span>
        <span class="an-spread-mean" style="left:${scale.at(spread.mean)}"></span>
      </div>
      <div class="an-spread-scale" aria-hidden="true">${scale.ticks.map((value) => `<span style="left:${scale.at(value)}">${value}</span>`).join('')}</div>
      <dl class="report-spread-stats" aria-label="${escapeHtml(`Spread of ${spread.n} marks: median ${f(spread.median)}, mean ${f(spread.mean)}, SD ${f(spread.sd)}, range ${f(spread.min)} to ${f(spread.max)}`)}">
        ${stat('Median', f(spread.median))}
        ${stat('Mean', f(spread.mean))}
        ${stat('SD', f(spread.sd))}
        ${stat('Range', `${f(spread.min)}–${f(spread.max)}`)}
      </dl>
    </div>
  `;
}

// Every mark in the year, one column band per term (in the order they were placed), with the
// running weighted average. Marks in the reported period are filled; the rest are hollow.
// A smooth line through the points that never overshoots them (monotone cubic, Fritsch–Carlson).
function reportSmoothPath(points) {
  const f = (value) => value.toFixed(2);
  if (points.length < 3) return `M${points.map(([x, y]) => `${f(x)},${f(y)}`).join(' L')}`;
  const n = points.length;
  const slopes = [];
  for (let i = 0; i < n - 1; i += 1) slopes.push((points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0] || 1));
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === n - 1) return slopes[n - 2];
    return slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  });
  for (let i = 0; i < n - 1; i += 1) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i] / slopes[i];
    const b = tangents[i + 1] / slopes[i];
    const sum = a * a + b * b;
    if (sum > 9) {
      const tau = 3 / Math.sqrt(sum);
      tangents[i] = tau * a * slopes[i];
      tangents[i + 1] = tau * b * slopes[i];
    }
  }
  let path = `M${f(points[0][0])},${f(points[0][1])}`;
  for (let i = 0; i < n - 1; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const third = (x1 - x0) / 3;
    path += ` C${f(x0 + third)},${f(y0 + tangents[i] * third)} ${f(x1 - third)},${f(y1 - tangents[i + 1] * third)} ${f(x1)},${f(y1)}`;
  }
  return path;
}

function reportTrendHtml(row, activeTerms, year, visible) {
  const { subject } = row;
  const placed = row.placed.filter((mark) => mark.term < visible);
  if (placed.length < 2) return '';
  const percents = placed.map((mark) => reportMarkPercent(mark.assessment));
  const low = clamp(Math.floor((Math.min(...percents) - 5) / 10) * 10, 0, 80);
  const y = (value) => ((clamp(value, low, 100) - low) / (100 - low)) * 100;
  const terms = TERM_PERIODS.slice(0, visible);
  const byTerm = terms.map((_, term) => placed.filter((mark) => mark.term === term));
  const points = [];
  byTerm.forEach((marks, term) => marks.forEach((mark, position) => {
    // Inset each term's dots from its edges so none sit on a band line or the plot's end.
    points.push({ mark, x: ((term + 0.08 + ((position + 0.5) / marks.length) * 0.84) / visible) * 100 });
  }));
  let running = [];
  const line = reportSmoothPath(points.map((point) => {
    running = [...running, point.mark.assessment];
    return [point.x, 100 - y(weightedAverage(running))];
  }));
  const ticks = [];
  for (let value = low; value <= 100; value += (100 - low) > 50 ? 20 : 10) ticks.push(value);
  const dots = points.map((point) => {
    const percent = reportMarkPercent(point.mark.assessment);
    const active = activeTerms.includes(point.mark.term);
    return `<span class="report-trend-dot${active ? ' is-active' : ''}" style="left:${point.x.toFixed(2)}%;bottom:${y(percent).toFixed(2)}%" title="${escapeHtml(`${reportTaskName(point.mark.assessment.name)}: ${reportPercent(percent)}`)}"></span>`;
  }).join('');
  return `
    <section class="report-section">
      <h4 class="report-section-title">${visible === TERM_PERIODS.length ? `Marks through ${year}` : `Marks up to ${escapeHtml(TERM_PERIODS[visible - 1].label)}`} <span class="report-section-note">Each task in order, with your running average</span></h4>
      <div class="report-trend" style="--subject-color:${subject.color};--report-bands:${visible}" aria-label="${escapeHtml(`${subject.name} marks through ${year}: ${points.map((point) => `${reportTaskName(point.mark.assessment.name)} ${reportPercent(reportMarkPercent(point.mark.assessment))}`).join(', ')}`)}">
        <div class="report-trend-axis" aria-hidden="true">${ticks.map((value) => `<span style="bottom:${y(value)}%">${value}</span>`).join('')}</div>
        <div class="report-trend-plot" aria-hidden="true">
          <div class="report-trend-bands">${terms.map((_, term) => `<span class="${activeTerms.includes(term) ? 'is-active' : ''}"></span>`).join('')}</div>
          ${ticks.map((value) => `<span class="report-trend-grid" style="bottom:${y(value)}%"></span>`).join('')}
          <svg class="report-trend-line" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false"><path d="${line}" fill="none" stroke="${subject.color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity="0.6"></path></svg>
          ${dots}
        </div>
        <div class="report-trend-terms" aria-hidden="true">${terms.map((period, term) => `<span class="${activeTerms.includes(term) ? 'is-active' : ''}">${period.label}</span>`).join('')}</div>
      </div>
      <p class="report-trend-key" aria-hidden="true">
        <span><span class="report-trend-key-dot is-active"></span>This ${activeTerms.length === 4 ? 'year' : activeTerms.length === 2 ? 'semester' : 'term'}</span>
        ${placed.some((mark) => !activeTerms.includes(mark.term)) ? '<span><span class="report-trend-key-dot"></span>Earlier this year</span>' : ''}
        <span><span class="report-trend-key-line"></span>Running average</span>
      </p>
    </section>
  `;
}

// A few plain-language observations about the subject this period.
function reportHighlightsHtml(data, index, row, rank, rankedCount) {
  const { cells } = row;
  const cell = cells[index];
  const kindWord = reportKindWord(data);
  const overall = data.overall[index];
  const items = [];
  const gap = cell.average - overall.average;
  const gapText = Math.abs(gap) < 0.05 ? 'level with your overall average' : `${Math.abs(gap).toFixed(1)} points ${gap > 0 ? 'above' : 'below'} your overall average`;
  if (rankedCount > 1) {
    items.push(rank === 1
      ? `Your strongest subject this ${kindWord}, ${gapText}.`
      : rank === rankedCount
      ? `Your lowest subject this ${kindWord}, ${gapText}.`
      : `${reportOrdinal(rank)} of ${rankedCount} subjects this ${kindWord}, ${gapText}.`);
  }
  const previous = reportPrevious(cells, index, data, row.lastYear);
  if (previous) {
    const delta = cell.average - previous.cell.average;
    items.push(Math.abs(delta) < 0.05
      ? `Steady on ${previous.label}, holding at ${reportPercent(cell.average)}.`
      : `${delta > 0 ? 'Up' : 'Down'} ${Math.abs(delta).toFixed(1)} points on ${previous.label} (${reportPercent(previous.cell.average)} → ${reportPercent(cell.average)}).`);
  } else {
    items.push(`The first ${kindWord} with marks in this subject${data.kind === 'year' ? '' : ` this year`}.`);
  }
  if (cell.count >= 2) {
    const best = reportBestMark(cell.marks);
    const worst = reportWorstMark(cell.marks);
    items.push(`Best task: ${escapeHtml(reportTaskName(best.name))} at ${reportPercent(reportMarkPercent(best))}. Lowest: ${escapeHtml(reportTaskName(worst.name))} at ${reportPercent(reportMarkPercent(worst))}.`);
  } else {
    const only = cell.marks[0];
    items.push(`One task so far: ${escapeHtml(reportTaskName(only.name))} at ${reportPercent(reportMarkPercent(only))}.`);
  }
  if (cell.count >= 3) {
    const spread = markSpread(cell.marks.map(reportMarkPercent));
    items.push(spread.max - spread.min <= 10
      ? `Consistent: every mark within ${(spread.max - spread.min).toFixed(1)} points.`
      : `Marks ranged ${(spread.max - spread.min).toFixed(1)} points, from ${reportPercent(spread.min)} to ${reportPercent(spread.max)}.`);
  }
  return `
    <section class="report-section">
      <h4 class="report-section-title">Summary</h4>
      <ul class="report-highlights">${items.map((item) => `<li>${item}</li>`).join('')}</ul>
    </section>
  `;
}

function reportNeededSentence(result, goal) {
  const label = result.assumed
    ? 'your next assessment'
    : result.pending.length === 1
    ? `“${escapeHtml(reportTaskName(result.pending[0].name))}”`
    : `your ${result.pending.length} upcoming assessments`;
  if (result.needed > 100) return `More than 100% on ${label} wouldn't reach ${goal} yet.`;
  if (result.needed <= 0) return `You'll reach ${goal} whatever you get on ${label}.`;
  return `${result.pending.length > 1 ? 'An average of ' : ''}<strong>${result.needed.toFixed(1)}%</strong> on ${label} gets you to ${goal}.`;
}

// Where the subject stood at the end of a past period: its year-to-date average then, against
// the target and the next grade. Nothing after the period is used.
function reportStandingThenHtml(data, index, row) {
  const { live } = row;
  const lastTerm = reportVisibleTerms(data.kind, index) - 1;
  const average = weightedAverage(row.placed.filter((mark) => mark.term <= lastTerm).map((mark) => mark.assessment));
  if (average === null) return '';
  const when = `the end of ${escapeHtml(data.periods[index].label)}`;
  const boxes = [];
  if (Number.isFinite(live.target)) {
    const gap = average - live.target;
    boxes.push(`
      <div class="report-standing-box">
        <span class="report-standing-label">${iconHtml('lucide:target', '')}Target</span>
        <span class="report-standing-value">${formatPercentValue(live.target)}%<span class="report-standing-sub">year to date ${reportPercent(average)}</span></span>
        <p class="report-standing-text">${gap >= 0 ? `On target at ${when}, <strong>${gap.toFixed(1)} points</strong> above.` : `<strong>${Math.abs(gap).toFixed(1)} points</strong> short of the target at ${when}.`}</p>
      </div>
    `);
  }
  const cutoff = GRADE_CUTOFFS.find((value) => value > average + 1e-9);
  boxes.push(`
    <div class="report-standing-box">
      <span class="report-standing-label">${iconHtml('lucide:trending-up', '')}Next grade</span>
      <span class="report-standing-value">${cutoff ? `${(cutoff - average).toFixed(1)}<span class="report-standing-unit">pts</span><span class="report-standing-sub">to ${v2GradeBadge(getLetterGrade(cutoff))}</span>` : v2GradeBadge('A+')}</span>
      <p class="report-standing-text">${cutoff ? `At ${when} the year-to-date average was ${reportPercent(average)}, ${(cutoff - average).toFixed(1)} points below ${cutoff}%.` : `At ${when}, at the top grade.`}</p>
    </div>
  `);
  return `
    <section class="report-section">
      <h4 class="report-section-title">Where it stood at ${when} <span class="report-section-note">Year-to-date average up to ${escapeHtml(data.periods[index].label)}</span></h4>
      <div class="report-standing">${boxes.join('')}</div>
    </section>
  `;
}

// Target and next grade from every mark in the subject: where it stands now. Only used when the
// reported period is the current one, so it holds nothing from after the period.
function reportStandingHtml(live) {
  const average = subjectStats(live).average;
  const boxes = [];
  if (Number.isFinite(live.target)) {
    const result = requiredForTarget(live);
    const met = average !== null && average >= live.target;
    boxes.push(`
      <div class="report-standing-box">
        <span class="report-standing-label">${iconHtml('lucide:target', '')}Target</span>
        <span class="report-standing-value">${formatPercentValue(live.target)}%<span class="report-standing-sub">${average === null ? 'no marks yet' : `currently ${reportPercent(average)}`}</span></span>
        <p class="report-standing-text">${met ? `On target, ${(average - live.target).toFixed(1)} points above. ` : ''}${result && result.hasMarks ? reportNeededSentence(result, `${formatPercentValue(live.target)}%`) : ''}</p>
      </div>
    `);
  }
  const step = nextGradeStep(live);
  if (step) {
    const text = step.top
      ? `At the top grade, ${step.margin.toFixed(1)} points above the A+ cutoff.`
      : `Currently ${reportPercent(step.average)}, ${step.gap.toFixed(1)} points below ${step.cutoff}%. ${reportNeededSentence(step, step.grade)}`;
    boxes.push(`
      <div class="report-standing-box">
        <span class="report-standing-label">${iconHtml('lucide:trending-up', '')}Next grade</span>
        <span class="report-standing-value">${step.top ? v2GradeBadge('A+') : `${step.gap.toFixed(1)}<span class="report-standing-unit">pts</span><span class="report-standing-sub">to ${v2GradeBadge(step.grade)}</span>`}</span>
        <p class="report-standing-text">${text}</p>
      </div>
    `);
  }
  if (!boxes.length) return '';
  return `
    <section class="report-section">
      <h4 class="report-section-title">Where it stands now <span class="report-section-note">From all your marks in this subject</span></h4>
      <div class="report-standing">${boxes.join('')}</div>
    </section>
  `;
}

function reportSubjectPageHtml(data, index, row, relative, rank, rankedCount, pageNumber, pageCount) {
  const { subject, live, cells } = row;
  const cell = cells[index];
  const kindWord = reportKindWord(data);
  const activeTerms = reportTermsIn(data.kind, index);
  const visible = reportVisibleTerms(data.kind, index);
  const isCurrent = index === data.currentPeriod;
  const previous = reportPrevious(cells, index, data, row.lastYear);
  const best = reportBestMark(cell.marks);
  const worst = reportWorstMark(cell.marks);
  const weights = cell.marks.map((assessment) => assessment.weight).filter((weight) => Number.isFinite(weight));
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const showWeights = weights.length > 0;

  const taskRows = cell.marks.map((assessment) => {
    const percent = reportMarkPercent(assessment);
    const parts = relativeMarkParts(relative, subject.id, percent);
    const weight = Number.isFinite(assessment.weight) ? `${formatPercentValue(assessment.weight)}%` : '—';
    return `
      <tr>
        <th scope="row" class="report-task-name">${escapeHtml(reportTaskName(assessment.name))}</th>
        <td class="report-task-date">${escapeHtml(reportShortDate(assessment.date))}</td>
        <td class="report-num report-task-score">${formatPercentValue(assessment.score)}<span class="report-task-total"> / ${formatPercentValue(assessment.total)}</span></td>
        ${showWeights ? `<td class="report-num report-task-weight">${weight}</td>` : ''}
        <td class="report-num report-task-pct">${reportPercent(percent)}</td>
        <td class="report-grade-cell">${v2GradeBadge(getLetterGrade(percent))}</td>
        <td class="report-task-rel">${parts.z || parts.best ? `${parts.z}${parts.best}` : '<span class="report-change-none">—</span>'}</td>
      </tr>
    `;
  }).join('');

  const facts = [
    { label: 'Tasks', value: cell.count, sub: showWeights ? `${formatPercentValue(weightTotal)}% weighting` : '' },
    { label: 'Highest', value: reportPercent(reportMarkPercent(best)), sub: escapeHtml(reportTaskName(best.name)) },
    { label: 'Lowest', value: cell.count > 1 ? reportPercent(reportMarkPercent(worst)) : '—', sub: cell.count > 1 ? escapeHtml(reportTaskName(worst.name)) : 'Only one task' },
    { label: 'Rank', value: rankedCount > 1 ? `${reportOrdinal(rank)}` : '—', sub: rankedCount > 1 ? `of ${rankedCount} subjects` : 'Only subject' },
  ];
  const showSpread = cell.count >= 2;
  const termStrip = reportTermStripHtml(row.terms, activeTerms);

  return `
    <article class="report-page report-page--subject" style="--subject-color:${subject.color}" aria-label="${escapeHtml(`${subject.name}, ${reportPeriodName(data, index)}`)}">
      ${reportMastheadHtml(data, index)}
      <div class="report-subject-head">
        <div class="report-subject-title">
          ${subjectMarkHtml(subject.icon, subject.name, subject.color, 'report-subject-mark report-subject-mark--lg')}
          <div>
            <h3 class="report-subject-heading">${escapeHtml(subject.name)}</h3>
            <p class="report-subject-meta">${escapeHtml(reportPeriodName(data, index))} · ${cell.count} ${cell.count === 1 ? 'task' : 'tasks'}</p>
          </div>
        </div>
        <div class="report-overall report-overall--subject">
          <span class="report-overall-label">${data.kind === 'semester' ? 'Semester' : data.kind === 'year' ? 'Year' : 'Term'} average</span>
          <span class="report-overall-main">
            <span class="report-overall-value">${cell.average.toFixed(1)}<span class="report-overall-unit">%</span></span>
            ${v2GradeBadge(cell.grade, ' report-overall-grade')}
          </span>
          <span class="report-overall-change">${reportChangeHtml(previous, cell, `First ${kindWord} with marks`)}</span>
        </div>
      </div>

      ${reportFactsHtml(facts)}
      ${reportHighlightsHtml(data, index, row, rank, rankedCount)}

      <section class="report-section">
        <h4 class="report-section-title">Tasks this ${kindWord}</h4>
        <table class="report-table report-table--tasks">
          <thead>
            <tr>
              <th scope="col">Task</th>
              <th scope="col">Date</th>
              <th scope="col" class="report-num">Score</th>
              ${showWeights ? '<th scope="col" class="report-num">Weight</th>' : ''}
              <th scope="col" class="report-num">Mark</th>
              <th scope="col">Grade</th>
              <th scope="col">vs your average</th>
            </tr>
          </thead>
          <tbody>${taskRows}</tbody>
        </table>
      </section>

      ${reportTrendHtml(row, activeTerms, data.year, visible)}

      ${termStrip || showSpread ? `<div class="report-pair${termStrip && showSpread && activeTerms.length <= 2 ? '' : ' is-single'}">
        ${termStrip ? `<section class="report-section">
          <h4 class="report-section-title">Term by term <span class="report-section-note">Change from the term before</span></h4>
          ${termStrip}
        </section>` : ''}
        ${showSpread ? `
          <section class="report-section">
            <h4 class="report-section-title">Spread this ${kindWord}</h4>
            ${reportSpreadHtml(subject, cell.marks)}
          </section>
        ` : ''}
      </div>` : ''}

      ${isCurrent ? reportStandingHtml(live) : reportStandingThenHtml(data, index, row)}
      ${reportFootHtml(pageNumber, pageCount, `“vs your average” uses your marks up to ${escapeHtml(data.periods[index].label)}`)}
    </article>
  `;
}

// "vs your average" pills, against the subject's marks up to the end of the period (earlier years
// and this year's marks placed up to its last term), never later ones. Same shape as
// buildRelativeMarks() in analytics.js, which relativeMarkParts reads.
function reportRelativeMarks(data, index) {
  const lastTerm = reportVisibleTerms(data.kind, index) - 1;
  const relative = new Map();
  data.subjects.forEach((row) => {
    const earlier = row.live.assessments.filter((assessment) => assessment.total > 0 && assessmentDateValue(assessment) && reportYearOf(assessment) < data.year);
    const percents = [...earlier, ...row.placed.filter((mark) => mark.term <= lastTerm).map((mark) => mark.assessment)].map(reportMarkPercent);
    if (percents.length >= 2) relative.set(row.subject.id, { name: row.subject.name, spread: markSpread(percents) });
  });
  return relative;
}

function reportPagesHtml(data, index) {
  const withMarks = data.subjects.filter((row) => row.cells[index]);
  const pageCount = data.overall[index] ? 1 + withMarks.length : 1;
  const relative = reportRelativeMarks(data, index);
  const ranked = [...withMarks].sort((a, b) => b.cells[index].average - a.cells[index].average);
  return [
    reportOverviewPageHtml(data, index, pageCount),
    ...withMarks.map((row, position) => reportSubjectPageHtml(data, index, row, relative, ranked.indexOf(row) + 1, ranked.length, position + 2, pageCount)),
  ];
}

// ── Popup ──

function renderReportPicker() {
  const picker = document.getElementById('report-picker');
  if (!picker) return;
  const button = (kind, index, label, ariaLabel) => {
    const active = reportState.kind === kind && reportState.index === index;
    return `<button type="button" data-report-kind="${kind}" data-report-index="${index}" class="${active ? 'is-active' : ''}" aria-pressed="${active}"${ariaLabel ? ` aria-label="${ariaLabel}"` : ''}>${label}</button>`;
  };
  const group = (kind, label, count) => `
    <div class="report-picker-group">
      <span class="report-picker-label" id="report-picker-${kind}">${label}</span>
      <div class="an-range" role="group" aria-labelledby="report-picker-${kind}">
        ${Array.from({ length: count }, (_, index) => button(kind, index, index + 1, `${label} ${index + 1}`)).join('')}
      </div>
    </div>
  `;
  picker.innerHTML = `
    ${group('term', 'Term', TERM_PERIODS.length)}
    ${group('semester', 'Semester', SEMESTER_PERIODS.length)}
    <div class="report-picker-group">
      <div class="an-range" role="group" aria-label="Whole year">${button('year', 0, `Full year ${reportLatestYear()}`)}</div>
    </div>
  `;
}

function renderReport() {
  const data = buildReportData(reportState.kind);
  if (reportState.index >= data.periods.length) reportState.index = defaultReportIndex(data);
  renderReportPicker();
  const pages = document.getElementById('report-pages');
  if (pages) pages.innerHTML = reportPagesHtml(data, reportState.index).join('');
  const title = document.getElementById('report-title');
  if (title) title.textContent = reportTitleFor(data.kind);
  reportMessage('');
  return data;
}

function reportMessage(text, isError = false) {
  const message = document.getElementById('report-message');
  if (!message) return;
  message.textContent = text;
  message.classList.toggle('is-error', isError);
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
    `Overall: ${reportPercent(overall.average)} (${overall.grade})${changeText(reportPrevious(data.overall, index, data, data.overallLastYear), overall)}`,
    '',
  ];
  data.subjects.forEach((row) => {
    const cell = row.cells[index];
    if (!cell) return;
    const best = reportBestMark(cell.marks);
    const bestText = best ? `, best: ${reportTaskName(best.name)} ${reportPercent(reportMarkPercent(best))}` : '';
    lines.push(`${row.subject.name}: ${reportPercent(cell.average)} (${cell.grade})${changeText(reportPrevious(row.cells, index, data, row.lastYear), cell)}, ${cell.count} ${cell.count === 1 ? 'task' : 'tasks'}${bestText}`);
  });
  return lines.join('\n');
}

async function copyReportSummary() {
  try {
    await navigator.clipboard.writeText(reportSummaryText());
    reportMessage('Copied to clipboard.');
  } catch (error) {
    reportMessage('Couldn’t copy. Your browser blocked clipboard access.', true);
  }
}

// ── PDF ──

const reportScriptLoads = new Map();

function loadReportScript(lib) {
  if (lib.ready()) return Promise.resolve();
  if (reportScriptLoads.has(lib.src)) return reportScriptLoads.get(lib.src);
  const load = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = lib.src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => (lib.ready() ? resolve() : reject(new Error(`${lib.src} loaded without its global`)));
    script.onerror = () => {
      script.remove();
      reject(new Error(`Couldn't load ${lib.src}`));
    };
    document.head.appendChild(script);
  }).catch((error) => {
    reportScriptLoads.delete(lib.src); // let the next click try again
    throw error;
  });
  reportScriptLoads.set(lib.src, load);
  return load;
}

// html2canvas 1.4 can't parse color-mix(), color() or oklab(), which V2 uses throughout. Resolve
// every colour on the offscreen pages to rgba() first (via a 1×1 canvas). This runs on the
// offscreen copy itself, before html2canvas clones it, so ::before icons inherit plain colours.
function reportColorResolver() {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  return (value) => {
    if (cache.has(value)) return cache.get(value);
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = '#000000';
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    const rgba = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
    cache.set(value, rgba);
    return rgba;
  };
}

const REPORT_COLOR_PROPS = [
  'color', 'background-color', 'background-image', 'border-top-color', 'border-right-color', 'border-bottom-color',
  'border-left-color', 'outline-color', 'text-decoration-color', 'box-shadow', 'text-shadow',
  '-webkit-text-fill-color', '-webkit-text-stroke-color', 'caret-color', 'column-rule-color', 'fill', 'stroke',
];
const REPORT_MODERN_COLOR = /(?:color|oklab|oklch|lab|lch|hwb)\([^()]*\)/g;

function reportFlattenColors(root) {
  const resolve = reportColorResolver();
  const view = root.ownerDocument.defaultView;
  [root, ...root.querySelectorAll('*')].forEach((element) => {
    const style = view.getComputedStyle(element);
    REPORT_COLOR_PROPS.forEach((prop) => {
      const value = style.getPropertyValue(prop);
      REPORT_MODERN_COLOR.lastIndex = 0;
      if (!value || !REPORT_MODERN_COLOR.test(value)) return;
      REPORT_MODERN_COLOR.lastIndex = 0;
      element.style.setProperty(prop, value.replace(REPORT_MODERN_COLOR, (match) => resolve(match)), 'important');
    });
  });
}

// Where to cut a page taller than A4: after the last row or section that fits.
function reportPageSlices(page, pageHeight, continuationTop) {
  const total = page.offsetHeight;
  if (total <= pageHeight + 1) return [[0, pageHeight]];
  const top = page.getBoundingClientRect().top;
  const edges = [...page.querySelectorAll('tbody tr, .report-section, .report-pair, .report-subject-head, .report-facts')]
    .map((element) => element.getBoundingClientRect().bottom - top)
    .sort((a, b) => a - b);
  const slices = [];
  let start = 0;
  while (start < total - 1) {
    const room = slices.length ? pageHeight - continuationTop : pageHeight;
    const limit = start + room;
    if (limit >= total) {
      slices.push([start, total]);
      break;
    }
    const cut = edges.filter((edge) => edge > start + 40 && edge <= limit).pop() || limit;
    slices.push([start, cut]);
    start = cut;
  }
  return slices;
}

function reportFileName(data, index) {
  const name = loadUserName();
  const base = `${name ? `${name} – ` : ''}${reportPeriodName(data, index)} report`;
  return `${base.replace(/[\\/:*?"<>|]+/g, '-')}.pdf`;
}

async function downloadReportPdf() {
  const button = document.getElementById('report-download');
  if (button?.getAttribute('aria-busy') === 'true') return;
  const label = button?.querySelector('.report-download-label');
  const setBusy = (busy) => {
    if (!button) return;
    button.disabled = busy;
    button.setAttribute('aria-busy', busy ? 'true' : 'false');
    button.classList.toggle('is-busy', busy);
    if (label) label.textContent = busy ? 'Building PDF…' : 'Download PDF';
  };
  setBusy(true);
  reportMessage('');
  let host = null;
  try {
    try {
      await Promise.all(REPORT_LIBS.map(loadReportScript));
    } catch (error) {
      reportMessage('Couldn’t load the PDF tools. Check your connection and try again, or press Ctrl+P (⌘P on a Mac) to print.', true);
      return;
    }
    const data = buildReportData(reportState.kind);
    const index = reportState.index;
    // Lay the pages out offscreen at A4 size with the light (print) palette, whatever the theme.
    host = document.createElement('div');
    host.className = 'report-capture';
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML = reportPagesHtml(data, index).join('');
    document.body.appendChild(host);
    await document.fonts.ready;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait', compress: true });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const pageHeight = REPORT_PAGE_PX.height;
    const continuationTop = 48;
    let first = true;

    for (const page of host.querySelectorAll('.report-page')) {
      // Too long for one page: tighten the rows first, then let it run on.
      if (page.offsetHeight > pageHeight + 1) page.classList.add('is-compact');
      const slices = reportPageSlices(page, pageHeight, continuationTop);
      reportFlattenColors(page);
      const canvas = await window.html2canvas(page, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        windowWidth: REPORT_PAGE_PX.width + 40,
        ignoreElements: (element) => element.classList?.contains('layout') || element.classList?.contains('modal'),
      });
      const scale = canvas.width / page.offsetWidth;
      slices.forEach(([start, end], sliceIndex) => {
        const sheet = document.createElement('canvas');
        sheet.width = canvas.width;
        sheet.height = Math.round(pageHeight * scale);
        const context = sheet.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, sheet.width, sheet.height);
        const offset = sliceIndex ? Math.round(continuationTop * scale) : 0;
        const height = Math.round((end - start) * scale);
        context.drawImage(canvas, 0, Math.round(start * scale), canvas.width, height, 0, offset, canvas.width, height);
        if (!first) pdf.addPage();
        first = false;
        pdf.addImage(sheet.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      });
    }
    pdf.save(reportFileName(data, index));
    reportMessage('PDF downloaded.');
  } catch (error) {
    console.error('Report PDF failed', error);
    reportMessage('Couldn’t build the PDF. Try again, or press Ctrl+P (⌘P on a Mac) to print.', true);
  } finally {
    host?.remove();
    setBusy(false);
  }
}

// ── Events ──

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action="open-report"], [data-action="close-report"], [data-action="download-report"], [data-action="copy-report"], [data-report-kind]');
  if (!target) return;
  if (target.dataset.reportKind) {
    const kind = target.dataset.reportKind;
    reportState.kind = kind === 'semester' || kind === 'year' ? kind : 'term';
    reportState.index = Number(target.dataset.reportIndex) || 0;
    renderReport();
    document.querySelector(`[data-report-kind="${reportState.kind}"][data-report-index="${reportState.index}"]`)?.focus();
    return;
  }
  const action = target.dataset.action;
  if (action === 'open-report') openReport();
  else if (action === 'close-report') closeReport();
  else if (action === 'download-report') downloadReportPdf();
  else if (action === 'copy-report') copyReportSummary();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (document.getElementById('report-modal')?.classList.contains('is-open')) closeReport();
});
