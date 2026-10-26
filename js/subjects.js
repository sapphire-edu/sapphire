// Subjects, assessments and upcoming items: modals, targets, what-if, dashboard rendering.

let activeSubjectId = null;

// Hypothetical marks for the open subject popup. Never saved; cleared when the popup closes.
let whatIfState = { subjectId: null, open: false, rows: [] };

let draggingOrderId = null;

let currentOrderDropTarget = null;

let pendingAssessmentConversion = null;

let pendingUpcomingEdit = null;

let assessmentComponents = [];

function renderAssessmentComponents() {
  if (!elements.assessmentComponentsList) return;
  if (assessmentComponents.length === 0) {
    elements.assessmentComponentsList.innerHTML = '<span class="muted" style="font-size: 0.85rem;">No components added. Standard assessment mark will be used.</span>';
    const scoreInput = elements.assessmentForm.querySelector('input[name="score"]');
    const totalInput = elements.assessmentForm.querySelector('input[name="total"]');
    if (scoreInput) scoreInput.disabled = false;
    if (totalInput) totalInput.disabled = false;
    return;
  }

  const scoreInput = elements.assessmentForm.querySelector('input[name="score"]');
  const totalInput = elements.assessmentForm.querySelector('input[name="total"]');
  if (scoreInput) scoreInput.disabled = true;
  if (totalInput) totalInput.disabled = true;

  elements.assessmentComponentsList.innerHTML = assessmentComponents.map((comp, i) => `
    <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; background: var(--surface-hover); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
      <label class="field" style="flex: 1 1 120px; margin: 0;">
        <span>Component name</span>
        <input class="component-input" type="text" placeholder="e.g. Part A" value="${comp.name}" data-index="${i}" data-field="name" required>
      </label>
      <label class="field" style="flex: 1 1 80px; margin: 0;">
        <span>Score</span>
        <input class="component-input" type="number" placeholder="10" step="0.1" min="0" value="${comp.score !== null ? comp.score : ''}" data-index="${i}" data-field="score" required>
      </label>
      <label class="field" style="flex: 1 1 80px; margin: 0;">
        <span>Total</span>
        <input class="component-input" type="number" placeholder="10" step="0.1" min="0.1" value="${comp.total !== null ? comp.total : ''}" data-index="${i}" data-field="total" required>
      </label>
      <label class="field" style="flex: 1 1 80px; margin: 0;">
        <span>Wt(%)</span>
        <input class="component-input" type="number" placeholder="20" step="0.1" min="0" value="${comp.weight !== null ? comp.weight : ''}" data-index="${i}" data-field="weight">
      </label>
      <button type="button" class="icon-button" style="color: var(--danger); margin-bottom: 6px; flex-shrink: 0;" data-action="remove-component" data-index="${i}">
        <i class="ph ph-trash" aria-hidden="true"></i>
      </button>
    </div>
  `).join('');
}

function buildAddSubjectSwatches(selectedColor) {
  const activeColor = normalizeColorValue(selectedColor).toLowerCase();
  return palette
    .map((color) => {
      const activeClass = color.toLowerCase() === activeColor ? ' is-active' : '';
      return `
        <button class="color-swatch${activeClass}" type="button" data-action="set-add-subject-color" data-color="${color}" style="--swatch:${color}" aria-label="Set subject color to ${color}"></button>
      `;
    })
    .join('');
}

function buildEditSubjectSwatches(selectedColor) {
  const activeColor = normalizeColorValue(selectedColor).toLowerCase();
  return palette
    .map((color) => {
      const activeClass = color.toLowerCase() === activeColor ? ' is-active' : '';
      return `
        <button class="color-swatch${activeClass}" type="button" data-action="set-edit-subject-color" data-color="${color}" style="--swatch:${color}" aria-label="Set subject color to ${color}"></button>
      `;
    })
    .join('');
}

function setEditSubjectMessage(message, isError = false) {
  if (!elements.editSubjectMessage) return;
  elements.editSubjectMessage.textContent = message || '';
  elements.editSubjectMessage.style.color = isError ? 'var(--danger)' : '';
}

function setEditSubjectColor(color) {
  if (!elements.editSubjectColor) return;
  const normalized = normalizeColorValue(color)
    || normalizeColorValue(elements.editSubjectColor.value)
    || palette[0];
  elements.editSubjectColor.value = normalized;
  if (elements.editSubjectColorValue) {
    elements.editSubjectColorValue.textContent = normalized.toUpperCase();
  }
  if (elements.editSubjectIconPreview) {
    elements.editSubjectIconPreview.style.background = normalized;
  }
  if (elements.editSubjectSwatches) {
    elements.editSubjectSwatches.innerHTML = buildEditSubjectSwatches(normalized);
  }
}

function setEditSubjectIcon(icon) {
  if (!elements.editSubjectIcon) return;
  const subjectName = String(elements.editSubjectName?.value || '').trim();
  const resolved = resolveSubjectIcon(icon, subjectName);
  elements.editSubjectIcon.value = resolved;
  if (elements.editSubjectIconPreview) {
    elements.editSubjectIconPreview.innerHTML = subjectIconHtml(resolved, '');
  }
  const carousel = elements.editSubjectIconCarousel?.querySelector('[data-icon-carousel]');
  setIconCarouselActive(carousel, resolved);
}

function openEditSubjectModal(subjectId = activeSubjectId) {
  if (!elements.editSubjectModal || !elements.editSubjectForm) return;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject) return;

  const subjectColor = normalizeColorValue(subject.color) || palette[0];
  const subjectIcon = resolveSubjectIcon(subject.icon, subject.name);
  if (elements.editSubjectId) {
    elements.editSubjectId.value = subject.id;
  }
  if (elements.editSubjectName) {
    elements.editSubjectName.value = subject.name;
  }
  if (elements.editSubjectTarget) {
    elements.editSubjectTarget.value = subject.target ?? '';
  }
  if (elements.editSubjectIconCarousel) {
    elements.editSubjectIconCarousel.innerHTML = buildIconCarousel({
      selectedIcon: subjectIcon,
      action: 'set-edit-subject-icon',
      otherAction: 'set-edit-subject-icon-other',
      ariaLabel: `${subject.name} icon options`,
    });
  }
  setEditSubjectIcon(subjectIcon);
  setEditSubjectColor(subjectColor);
  setEditSubjectMessage('');
  openModal(elements.editSubjectModal);
  requestAnimationFrame(() => {
    elements.editSubjectName?.focus();
    elements.editSubjectName?.select();
  });
}

function closeEditSubjectModal() {
  if (!elements.editSubjectModal) return;
  closeModal(elements.editSubjectModal);
  setEditSubjectMessage('');
}

function setAddSubjectColor(color) {
  if (!elements.addSubjectColor) return;
  const normalized = normalizeColorValue(color)
    || normalizeColorValue(elements.addSubjectColor.value)
    || palette[state.data.subjects.length % palette.length];
  elements.addSubjectColor.value = normalized;
  if (elements.addSubjectColorValue) {
    elements.addSubjectColorValue.textContent = normalized.toUpperCase();
  }
  if (elements.addSubjectIconPreview) {
    elements.addSubjectIconPreview.style.background = normalized;
  }
  if (elements.addSubjectSwatches) {
    elements.addSubjectSwatches.innerHTML = buildAddSubjectSwatches(normalized);
  }
}

function setAddSubjectIcon(icon) {
  if (!elements.addSubjectIcon) return;
  const subjectName = String(elements.addSubjectName?.value || '').trim();
  const resolved = resolveSubjectIcon(icon, subjectName);
  elements.addSubjectIcon.value = resolved;
  if (elements.addSubjectIconPreview) {
    elements.addSubjectIconPreview.innerHTML = subjectIconHtml(resolved, '');
  }
  const carousel = elements.addSubjectIconCarousel?.querySelector('[data-icon-carousel]');
  setIconCarouselActive(carousel, resolved);
}

function openAddSubjectPopup() {
  if (!elements.addSubjectModal || !elements.addSubjectForm) return;
  elements.addSubjectForm.reset();
  setSubjectMessage('');

  const defaultColor = palette[state.data.subjects.length % palette.length];
  if (elements.addSubjectIconCarousel) {
    elements.addSubjectIconCarousel.innerHTML = buildIconCarousel({
      selectedIcon: DEFAULT_SUBJECT_ICON,
      action: 'set-add-subject-icon',
      otherAction: 'set-add-subject-icon-other',
      ariaLabel: 'Subject icon options',
    });
  }
  setAddSubjectIcon(DEFAULT_SUBJECT_ICON);
  setAddSubjectColor(defaultColor);
  const panel = elements.addSubjectModal.querySelector('.modal-panel');
  if (panel) {
    panel.style.left = '';
    panel.style.top = '';
  }
  openModal(elements.addSubjectModal);
  requestAnimationFrame(() => {
    elements.addSubjectName?.focus();
  });
}

function closeAddSubjectPopup() {
  if (!elements.addSubjectModal) return;
  closeModal(elements.addSubjectModal);
  setSubjectMessage('');
}

function openSubjectModal(subjectId) {
  if (!elements.subjectModal) return;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject) return;

  activeSubjectId = subjectId;
  const stats = subjectStats(subject);
  const averageText = stats.average === null ? '--' : `${stats.average.toFixed(1)}%`;
  const gradeText = stats.grade ?? '--';

  const countText = `${subject.assessments.length} assessment${subject.assessments.length === 1 ? '' : 's'}`;
  if (isUiV2()) {
    // V2: the subject's icon leads the title, and the average and grade sit large under it.
    elements.subjectModalTitle.innerHTML = `<span class="v2-subject-icon subject-modal-icon" style="--subject-color:${subject.color}" aria-hidden="true">${subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name))}</span><span>${escapeHtml(subject.name)}</span>`;
    if (elements.subjectModalMeta) {
      const scoreHtml = stats.average === null
        ? ''
        : `<span class="subject-modal-percent">${stats.average.toFixed(1)}<span class="subject-modal-unit">%</span></span>${v2GradeBadge(stats.grade, ' subject-modal-grade')}`;
      elements.subjectModalMeta.innerHTML = `${scoreHtml}<span class="subject-modal-count">${countText}</span>`;
    }
  } else {
    elements.subjectModalTitle.textContent = subject.name;
    if (elements.subjectModalMeta) {
      elements.subjectModalMeta.textContent = `${averageText} · ${gradeText} · ${subject.assessments.length} assessments`;
    }
  }

  const history = sortAssessments(subject.assessments).reverse();
  const relative = isUiV2() ? buildRelativeMarks() : new Map();
  const historyHtml = history.length
    ? history
        .map((assessment) => {
          const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
          const grade = getLetterGrade(percent);
          const weight = assessment.weight === null ? '' : ` · W${assessment.weight}`;
          const canShare = canShareSubjectMarks(subject.id);
          const rel = relativeMarkParts(relative, subject.id, percent);
          return `
            <div class="history-item">
              <div>
                <div class="history-name">${assessment.name}${rel.best}</div>
                <div class="history-meta">${assessment.score} / ${assessment.total} · ${percent.toFixed(1)}% · ${grade}${weight}${rel.z ? ` ${rel.z}` : ''}</div>
              </div>
              <div class="history-right">
                <div class="history-date">${formatDate(assessment.date)}</div>
                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                  <button class="ghost-button ghost-button--small" data-action="edit-assessment" data-subject-id="${subject.id}" data-assessment-id="${assessment.id}">Edit</button>
                  <button class="ghost-button ghost-button--small${assessment.leaderboardDocId ? ' is-shared' : ''}" data-action="share-assessment" data-subject-id="${subject.id}" data-assessment-id="${assessment.id}" ${canShare ? '' : 'hidden'}>
                    ${assessment.leaderboardDocId ? '<i class="ph ph-cloud-check" style="margin-right:4px;"></i>Shared' : '<i class="ph ph-share-network" style="margin-right:4px;"></i>Share'}
                  </button>
                  <button class="delete-button" data-action="delete-assessment" data-subject-id="${subject.id}" data-assessment-id="${assessment.id}">Remove</button>
                </div>
              </div>
            </div>
          `;
        })
        .join('')
    : '<div class="empty-state">No assessments yet.</div>';
  const upcomingItems = sortUpcoming(expandUpcomingItems(subject));
  const upcomingAssessmentItems = upcomingItems.filter((item) => {
    if (normalizeUpcomingType(item.type) !== 'assessment') return false;
    return !isPastDate(item.date);
  });
  const awaitingMarkAssessmentItems = upcomingItems.filter((item) => {
    if (normalizeUpcomingType(item.type) !== 'assessment') return false;
    return isPastDate(item.date);
  });
  const upcomingHomeworkItems = upcomingItems.filter(
    (item) => normalizeUpcomingType(item.type) === 'homework'
  );
  const upcomingAssessmentsHtml = buildUpcomingList(upcomingAssessmentItems, {
    showSubject: false,
    allowRemove: true,
    emptyMessage: 'No upcoming assessments.',
  });
  const upcomingHomeworkHtml = buildUpcomingList(upcomingHomeworkItems, {
    showSubject: false,
    allowRemove: true,
    emptyMessage: 'No homework reminders.',
  });
  const awaitingMarksHtml = buildUpcomingList(awaitingMarkAssessmentItems, {
    showSubject: false,
    allowRemove: true,
    emptyMessage: 'No assessments awaiting marks.',
  });

  if (elements.subjectModalBody) {
    elements.subjectModalBody.innerHTML = `
      <div class="modal-chart">
        <canvas id="subject-modal-chart"></canvas>
      </div>
      ${isUiV2() ? `
      <div class="modal-actions">
        <button class="primary-button with-icon" type="button" data-action="open-assessment">
          ${iconHtml('plus-circle')}
          Add mark
        </button>
        <div class="more-menu">
          <button class="ghost-button with-icon" type="button" data-action="toggle-more-menu" aria-haspopup="menu" aria-expanded="false">
            ${iconHtml('dots-three')}
            More
          </button>
          <div class="more-menu-list" role="menu" hidden>
            <button type="button" role="menuitem" data-action="open-edit-subject">${iconHtml('pencil-simple')}Edit subject</button>
            <button type="button" role="menuitem" data-action="open-upcoming">${iconHtml('calendar')}Add upcoming</button>
            <button type="button" role="menuitem" class="is-danger" data-action="delete-subject">${iconHtml('trash')}Delete subject</button>
          </div>
        </div>
      </div>` : `<div class="modal-actions">
        <button class="primary-button with-icon" type="button" data-action="open-assessment">
          ${iconHtml('plus-circle')}
          Add Assessment
        </button>
        <button class="ghost-button with-icon" type="button" data-action="open-edit-subject">
          ${iconHtml('pencil-simple')}
          Edit Subject
        </button>
        <button class="ghost-button with-icon" type="button" data-action="open-upcoming">
          ${iconHtml('calendar')}
          Add Upcoming
        </button>
        <button class="ghost-button with-icon" type="button" data-action="delete-subject">
          ${iconHtml('trash')}
          Delete Subject
        </button>
      </div>`}
      ${buildTargetStripHtml(subject)}
      ${isUiV2() ? buildNextGradeHtml(subject) + buildSubjectSpreadHtml(subject) : ''}
      <details class="what-if" id="what-if-panel"${whatIfState.open ? ' open' : ''}>
        <summary class="what-if-summary">
          ${iconHtml('flask')}
          <span>What if…</span>
          <span class="muted what-if-hint">Try out marks without saving them</span>
        </summary>
        <div class="what-if-body">
          <div class="what-if-rows" id="what-if-rows"></div>
          <button class="ghost-button ghost-button--small with-icon" type="button" data-action="what-if-add">
            ${iconHtml('plus')}
            Add mark
          </button>
          <div class="what-if-result" id="what-if-result" aria-live="polite"></div>
        </div>
      </details>
      ${(() => {
        // V2 leaves out any list with nothing in it; V1 keeps its empty states.
        const v2 = isUiV2();
        const section = (title, items, html) => (v2 && !items.length ? '' : `
          <div class="subject-upcoming">
            <div class="history-title">${title}</div>
            <div class="upcoming-list">
              ${html}
            </div>
          </div>
        `);
        const sections = [
          section('Upcoming assessments', upcomingAssessmentItems, upcomingAssessmentsHtml),
          section('Homework', upcomingHomeworkItems, upcomingHomeworkHtml),
          section('Assessments awaiting marks', awaitingMarkAssessmentItems, awaitingMarksHtml),
        ].join('');
        return sections.trim() ? `<div class="subject-upcoming-grid">${sections}</div>` : '';
      })()}
      ${isUiV2() && !history.length ? '' : `
      <div class="subject-history">
        <div class="history-title">Assessment history</div>
        <div class="history-list">${historyHtml}</div>
      </div>`}
    `;
  }

  openModal(elements.subjectModal);

  if (whatIfState.subjectId !== subject.id) {
    whatIfState = { subjectId: subject.id, open: false, rows: buildInitialWhatIfRows(subject) };
  }
  renderWhatIfRows();
  renderWhatIfResult();
}

function drawSubjectModalChart(subject) {
  const chartCanvas = elements.subjectModalBody?.querySelector('#subject-modal-chart');
  if (!chartCanvas) return;
  const points = buildSubjectTimelinePoints(subject.assessments);
  if (whatIfState.open && whatIfState.subjectId === subject.id) {
    let lastXValue = points.length ? points[points.length - 1].xValue : Date.now();
    validWhatIfRows().forEach((row) => {
      lastXValue = Math.max(lastXValue + 1, row.xValue ?? lastXValue + 1);
      points.push({
        value: (row.score / row.total) * 100,
        label: `What if · ${row.name || 'Hypothetical mark'}`,
        xValue: lastXValue,
        preview: true,
      });
    });
    addTimelineEdgeLabels(points);
  }
  drawLineChart(chartCanvas, points, { stroke: subject.color, showAxis: true });
}

function buildTargetStripHtml(subject) {
  if (!Number.isFinite(subject.target)) {
    return `
      <div class="target-strip target-strip--empty">
        <span class="muted">No target set for this subject.</span>
        <button class="ghost-button ghost-button--small with-icon" type="button" data-action="open-edit-subject">
          ${iconHtml('target')}
          Set a target
        </button>
      </div>
    `;
  }
  const target = subject.target;
  const average = weightedAverage(subject.assessments);
  const met = average !== null && average >= target;
  const status = average === null
    ? 'No marks yet'
    : met
    ? `${iconHtml('check-circle')} On target`
    : `${(target - average).toFixed(1)}% to go`;
  const fill = average === null ? 0 : clamp(average, 0, 100);
  return `
    <div class="target-strip${met ? ' is-met' : ''}">
      <div class="target-strip-head">
        <span><strong>Target ${formatPercentValue(target)}%</strong>${average === null ? '' : ` · Current ${average.toFixed(1)}%`}</span>
        <span class="target-strip-status">${status}</span>
      </div>
      <div class="target-bar" role="presentation">
        <span class="target-bar-fill" style="width: ${fill}%"></span>
        <span class="target-bar-marker" style="left: ${clamp(target, 0, 100)}%"></span>
      </div>
      <div class="target-needed muted">${escapeHtml(describeRequiredForTarget(subject))}</div>
    </div>
  `;
}

// The mean weight of a subject's marked assessments, used when an upcoming or what-if
// mark has no weight. Assuming weight 1 is wrong when marks use weights like 30 or 40.
function typicalAssessmentWeight(subject) {
  const weights = subject.assessments
    .filter((assessment) => assessment.total > 0)
    .map((assessment) => (assessment.weight === null ? 1 : assessment.weight));
  if (!weights.length) return 1;
  return weights.reduce((total, weight) => total + weight, 0) / weights.length || 1;
}

// The average needed across the remaining assessments to finish on target. Upcoming
// assessments without a weight are assumed to be weighted like the subject's others.
function requiredForTarget(subject) {
  if (!Number.isFinite(subject.target)) return null;
  let sum = 0;
  let weight = 0;
  subject.assessments.forEach((assessment) => {
    const itemWeight = assessment.weight === null ? 1 : assessment.weight;
    if (assessment.total > 0) {
      sum += (assessment.score / assessment.total) * 100 * itemWeight;
      weight += itemWeight;
    }
  });
  const pending = (subject.upcoming || []).filter(
    (item) => normalizeUpcomingType(item.type) === 'assessment' && !isPastDate(item.date)
  );
  const typical = typicalAssessmentWeight(subject);
  const pendingWeight = pending.reduce((total, item) => total + (Number.isFinite(item.weight) ? item.weight : typical), 0);
  const assumed = pendingWeight <= 0;
  const remaining = assumed ? typical : pendingWeight;
  return {
    target: subject.target,
    needed: (subject.target * (weight + remaining) - sum) / remaining,
    hasMarks: weight > 0,
    pending,
    assumed,
  };
}

// The next grade up: how far the subject's average is below that cutoff, and what it would need on
// its upcoming assessments to reach it (the same maths as a target). At A+ there's no next grade,
// so it reports the margin above the A+ cutoff instead.
const GRADE_CUTOFFS = [30, 35, 40, 50, 60, 65, 70, 75, 80, 85, 90, 95];

function nextGradeStep(subject) {
  const average = subjectStats(subject).average;
  if (average === null) return null;
  const cutoff = GRADE_CUTOFFS.find((value) => value > average + 1e-9);
  if (!cutoff) return { top: true, average, margin: average - 95 };
  const required = requiredForTarget({ ...subject, target: cutoff });
  return { top: false, average, cutoff, grade: getLetterGrade(cutoff), gap: cutoff - average, ...required };
}

// Short form for list rows: "1.8% from A".
function nextGradeShortText(step) {
  if (!step) return '';
  return step.top ? 'Top grade' : `${step.gap.toFixed(1)}% from ${step.grade}`;
}

function buildNextGradeHtml(subject) {
  const step = nextGradeStep(subject);
  if (!step) return '';
  // The target strip already covers it when the target is the next grade's cutoff.
  if (!step.top && Number.isFinite(subject.target) && Math.abs(subject.target - step.cutoff) < 0.01) return '';
  let detail;
  if (step.top) {
    detail = `You're at the top grade, ${step.margin.toFixed(1)}% above the A+ cutoff.`;
  } else {
    const label = step.assumed
      ? 'your next assessment'
      : step.pending.length === 1
      ? `“${escapeHtml(step.pending[0].name)}”`
      : `your ${step.pending.length} upcoming assessments`;
    detail = step.needed > 100
      ? `More than 100% on ${label} wouldn't get there yet.`
      : step.needed <= 0
      ? `You'll reach it whatever you get on ${label}.`
      : `${step.pending.length > 1 ? 'An average of ' : ''}${step.needed.toFixed(1)}% on ${label} gets you there.`;
  }
  const headline = step.top
    ? `${v2GradeBadge('A+')}<span>Top grade</span>`
    : `<span class="next-grade-gap">${step.gap.toFixed(1)}%</span><span>from ${v2GradeBadge(step.grade)}</span>`;
  return `
    <div class="next-grade">
      <div class="next-grade-head">${iconHtml('lucide:trending-up', 'next-grade-icon')}${headline}</div>
      <p class="next-grade-detail">${detail}</p>
    </div>
  `;
}

// This subject's spread: the same box plot as Analytics, sized for the popup. Needs two marks.
function buildSubjectSpreadHtml(subject) {
  const percents = subjectPercents(subject);
  if (percents.length < 2) return '';
  const spread = markSpread(percents);
  const scale = spreadScale(Math.min(spread.min, spread.mean - spread.sd));
  const f = (value) => value.toFixed(1);
  const stat = (label, value, extra = '') => `<div class="subject-spread-stat${extra}"><dt>${label}</dt><dd>${value}</dd></div>`;
  return `
    <section class="subject-spread" style="--subject-color:${subject.color}" aria-label="${escapeHtml(`Spread of ${subject.name} marks: ${spreadTooltipText(subject.name, spread).replace(/\n/g, '. ')}`)}">
      <div class="subject-spread-head">
        <h3 class="subject-spread-title">Spread</h3>
        <span class="subject-spread-desc">${spread.n} marks, each counted once</span>
      </div>
      <div class="subject-spread-plot" aria-hidden="true">
        ${spreadGridHtml(scale)}
        <span class="an-spread-whisker" style="${scale.span(spread.low, spread.high)}"></span>
        <span class="an-spread-box" style="${scale.span(spread.q1, spread.q3)}"></span>
        <span class="an-spread-median" style="left:${scale.at(spread.median)}"></span>
        ${spreadOutliersHtml(scale, spread)}
        <span class="an-spread-sd" style="${scale.span(spread.mean - spread.sd, spread.mean + spread.sd)}"></span>
        <span class="an-spread-mean" style="left:${scale.at(spread.mean)}"></span>
      </div>
      <div class="an-spread-scale" aria-hidden="true">${scale.ticks.map((value) => `<span style="left:${scale.at(value)}">${value}</span>`).join('')}</div>
      <dl class="subject-spread-stats" aria-hidden="true">
        ${stat('Min', f(spread.min))}
        ${stat('Q1', f(spread.q1))}
        ${stat('Median', f(spread.median), ' is-key')}
        ${stat('Q3', f(spread.q3))}
        ${stat('Max', f(spread.max))}
        ${stat('IQR', f(spread.iqr))}
        ${stat('Mean', f(spread.mean))}
        ${stat('SD', f(spread.sd))}
      </dl>
    </section>
  `;
}

function describeRequiredForTarget(subject) {
  const result = requiredForTarget(subject);
  if (!result) return '';
  if (!result.hasMarks) return `Aim for ${formatPercentValue(result.target)}% on your first assessment.`;
  const label = result.assumed
    ? 'your next assessment (if it\'s weighted like your others)'
    : result.pending.length === 1
    ? `"${result.pending[0].name}"`
    : `your ${result.pending.length} upcoming assessments`;
  if (result.needed > 100) return `You'd need over 100% on ${label}, so the target is out of reach for now. Keep going!`;
  if (result.needed <= 0) return `You'd stay on target even with 0 on ${label}.`;
  const prefix = result.pending.length > 1 ? 'You need an average of' : 'You need';
  return `${prefix} ${result.needed.toFixed(1)}% on ${label} to hit your target.`;
}

function buildInitialWhatIfRows(subject) {
  const pending = (subject.upcoming || []).filter(
    (item) => normalizeUpcomingType(item.type) === 'assessment' && !isPastDate(item.date)
  );
  const rows = sortUpcoming(pending).map((item) => ({
    name: item.name,
    score: '',
    total: '100',
    weight: Number.isFinite(item.weight) ? String(item.weight) : '',
    xValue: dateStringValue(item.date),
  }));
  return rows.length ? rows : [createBlankWhatIfRow()];
}

function createBlankWhatIfRow() {
  return { name: '', score: '', total: '100', weight: '', xValue: null };
}

function validWhatIfRows() {
  const subject = state.data.subjects.find((item) => item.id === whatIfState.subjectId);
  const typical = subject ? typicalAssessmentWeight(subject) : 1;
  return whatIfState.rows
    .filter((row) => String(row.score).trim() !== '')
    .map((row) => ({
      ...row,
      score: Number(row.score),
      total: Number(row.total),
      weight: String(row.weight).trim() === '' ? typical : Number(row.weight),
    }))
    .filter(
      (row) =>
        Number.isFinite(row.score) &&
        Number.isFinite(row.total) &&
        row.total > 0 &&
        Number.isFinite(row.weight) &&
        row.weight >= 0
    );
}

function renderWhatIfRows() {
  const container = elements.subjectModalBody?.querySelector('#what-if-rows');
  if (!container) return;
  const subject = state.data.subjects.find((item) => item.id === whatIfState.subjectId);
  const typicalWeight = formatPercentValue(subject ? typicalAssessmentWeight(subject) : 1);
  container.innerHTML = whatIfState.rows
    .map(
      (row, index) => `
        <div class="what-if-row">
          <input class="what-if-name" data-what-if-index="${index}" data-what-if-field="name" value="${escapeHtml(row.name)}" placeholder="Hypothetical mark" aria-label="Name" maxlength="60" />
          <input data-what-if-index="${index}" data-what-if-field="score" value="${escapeHtml(row.score)}" type="number" min="0" step="any" inputmode="decimal" placeholder="Mark" aria-label="Mark" />
          <span class="muted">/</span>
          <input data-what-if-index="${index}" data-what-if-field="total" value="${escapeHtml(row.total)}" type="number" min="0" step="any" inputmode="decimal" placeholder="Total" aria-label="Total" />
          <input data-what-if-index="${index}" data-what-if-field="weight" value="${escapeHtml(row.weight)}" type="number" min="0" step="any" inputmode="decimal" placeholder="W ${typicalWeight}" title="Weight (blank = ${typicalWeight}, like your other marks)" aria-label="Weight" />
          <button class="delete-button" type="button" data-action="what-if-remove" data-what-if-index="${index}" aria-label="Remove">${iconHtml('x', 'button-icon')}</button>
        </div>
      `
    )
    .join('');
}

function renderWhatIfResult() {
  const subject = state.data.subjects.find((item) => item.id === whatIfState.subjectId);
  if (!subject) return;
  drawSubjectModalChart(subject);
  const resultEl = elements.subjectModalBody?.querySelector('#what-if-result');
  if (!resultEl) return;
  const rows = validWhatIfRows();
  if (!rows.length) {
    resultEl.innerHTML = '<span class="muted">Enter a mark to see how your average would change.</span>';
    return;
  }
  const current = weightedAverage(subject.assessments);
  const projected = weightedAverage([...subject.assessments, ...rows]);
  if (projected === null) {
    resultEl.innerHTML = '<span class="muted">Those marks have no weight, so your average stays the same.</span>';
    return;
  }
  const delta = current === null ? null : projected - current;
  const deltaHtml = delta === null || Math.abs(delta) < 0.05
    ? ''
    : `<span class="what-if-delta ${delta > 0 ? 'is-up' : 'is-down'}">${delta > 0 ? '+' : ''}${delta.toFixed(1)}%</span>`;
  const targetHtml = Number.isFinite(subject.target)
    ? projected >= subject.target
      ? `<span class="what-if-target is-met">${iconHtml('check-circle')} Hits your ${formatPercentValue(subject.target)}% target</span>`
      : `<span class="what-if-target">${(subject.target - projected).toFixed(1)}% short of your target</span>`
    : '';
  resultEl.innerHTML = `
    <span>Your average would be <strong>${projected.toFixed(1)}%</strong> · ${getLetterGrade(projected)}</span>
    ${deltaHtml}
    ${targetHtml}
  `;
}

function closeSubjectModal() {
  closeEditSubjectModal();
  closeAssessmentModal();
  closeUpcomingModal();
  closeModal(elements.subjectModal);
  activeSubjectId = null;
  whatIfState = { subjectId: null, open: false, rows: [] };
}

function openAssessmentModal(subjectId, options = {}) {
  if (!elements.assessmentModal || !elements.assessmentForm) return;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject) return;
  const assessmentNameInput = elements.assessmentForm.querySelector('input[name="assessment"]');
  const scoreInput = elements.assessmentForm.querySelector('input[name="score"]');
  const totalInput = elements.assessmentForm.querySelector('input[name="total"]');
  const weightInput = elements.assessmentForm.querySelector('input[name="weight"]');
  const dateInput = elements.assessmentForm.querySelector('input[name="date"]');
  const termInput = elements.assessmentForm.querySelector('select[name="term"]');
  const editItem = options.edit || null;
  const prefill = options.prefill || null;

  pendingAssessmentConversion = options.conversion || null;
  activeSubjectId = subjectId;
  elements.assessmentForm.reset();
  assessmentComponents = editItem?.components ? [...editItem.components] : [];
  renderAssessmentComponents();

  if (elements.assessmentId) {
    elements.assessmentId.value = editItem ? editItem.id : '';
  }

  const modalTitle = elements.assessmentModal.querySelector('#assessment-modal-title');
  const modalEyebrow = elements.assessmentModal.querySelector('.section-eyebrow');
  const submitButton = elements.assessmentForm.querySelector('button[type="submit"]');
  if (modalTitle) modalTitle.textContent = editItem ? 'Edit Result' : 'New Result';
  if (modalEyebrow) modalEyebrow.textContent = editItem ? 'Edit assessment' : 'Add assessment';
  if (submitButton) submitButton.textContent = editItem ? 'Update Assessment' : 'Save Assessment';

  if (elements.assessmentSubjectId) {
    elements.assessmentSubjectId.value = subjectId;
  }
  if (elements.assessmentSubjectName) {
    elements.assessmentSubjectName.textContent = subject.name;
  }
  if (assessmentNameInput && (prefill?.name || editItem?.name)) {
    assessmentNameInput.value = editItem?.name || prefill?.name;
  }
  if (scoreInput) {
    scoreInput.value = editItem ? editItem.score : '';
  }
  if (totalInput) {
    totalInput.value = editItem ? editItem.total : '';
  }
  if (termInput) {
    termInput.value = editItem?.term ? String(editItem.term) : '';
  }
  if (weightInput) {
    if (editItem && Number.isFinite(editItem.weight)) {
      weightInput.value = String(editItem.weight);
    } else if (Number.isFinite(prefill?.weight)) {
      weightInput.value = String(prefill.weight);
    } else {
      weightInput.value = '';
    }
    weightInput.required = Boolean(pendingAssessmentConversion?.requiresWeight);
  }
  if (dateInput) {
    dateInput.value = editItem ? editItem.date : (prefill?.date || today);
  }
  setAssessmentMessage('');
  openModal(elements.assessmentModal);
}

function closeAssessmentModal() {
  pendingAssessmentConversion = null;
  const weightInput = elements.assessmentForm?.querySelector('input[name="weight"]');
  if (weightInput) {
    weightInput.required = false;
  }
  closeModal(elements.assessmentModal);
  setAssessmentMessage('');
}

function openUpcomingModal(options = {}) {
  if (!elements.upcomingModal || !elements.upcomingForm) return;
  if (!state.data.subjects.length) {
    setUpcomingMessage('Add a subject first.');
    return;
  }
  const normalizedOptions = typeof options === 'string' || options === null
    ? { subjectId: options || null, upcomingId: null }
    : options;
  const editSubjectId = String(normalizedOptions.subjectId || '').trim() || null;
  const editUpcomingId = String(normalizedOptions.upcomingId || '').trim() || null;

  elements.upcomingForm.reset();
  renderUpcomingSubjectSelect();

  let editingItem = null;
  let editingSubject = null;
  if (editSubjectId && editUpcomingId) {
    const selected = getUpcomingItem(editSubjectId, editUpcomingId);
    if (!selected) {
      setUpcomingMessage('Could not find that upcoming item.');
      return;
    }
    editingSubject = selected.subject;
    editingItem = selected.upcoming;
    pendingUpcomingEdit = {
      subjectId: editingSubject.id,
      upcomingId: editingItem.id,
    };
  } else {
    pendingUpcomingEdit = null;
  }

  if (elements.upcomingSubjectSelect) {
    const preferred = editingSubject?.id || editSubjectId || elements.upcomingSubjectSelect.value;
    if (preferred) {
      elements.upcomingSubjectSelect.value = preferred;
    }
  }
  const dateInput = elements.upcomingForm.querySelector('input[name="upcomingDate"]');
  if (elements.upcomingTypeSelect) {
    elements.upcomingTypeSelect.value = normalizeUpcomingType(editingItem?.type);
  }
  if (elements.upcomingWeightInput) {
    elements.upcomingWeightInput.value = Number.isFinite(editingItem?.weight)
      ? String(editingItem.weight)
      : '';
  }
  const nameInput = elements.upcomingForm.querySelector('input[name="upcomingName"]');
  if (nameInput) {
    nameInput.value = editingItem?.name || '';
  }
  const notesInput = elements.upcomingForm.querySelector('input[name="upcomingNotes"]');
  if (notesInput) {
    notesInput.value = editingItem?.notes || '';
  }
  if (dateInput) {
    dateInput.value = editingItem?.date || today;
  }

  if (elements.upcomingModalEyebrow) {
    elements.upcomingModalEyebrow.textContent = editingItem ? 'Edit upcoming' : 'Upcoming assessment';
  }
  if (elements.upcomingModalTitle) {
    elements.upcomingModalTitle.textContent = editingItem ? 'Update Item' : 'Schedule';
  }
  if (elements.upcomingModalMeta) {
    elements.upcomingModalMeta.textContent = editingItem
      ? 'Click save after changing type, name, description, weighting, or due date.'
      : 'Add a reminder for what is next.';
  }
  if (elements.upcomingSubmit) {
    elements.upcomingSubmit.textContent = editingItem ? 'Save Changes' : 'Save Upcoming';
  }
  const upcomingDeleteButton = document.getElementById('upcoming-delete');
  if (upcomingDeleteButton) upcomingDeleteButton.hidden = !editingItem;
  updateUpcomingTypeFields();
  setUpcomingMessage('');
  openModal(elements.upcomingModal);
}

function closeUpcomingModal() {
  pendingUpcomingEdit = null;
  if (elements.upcomingModalEyebrow) {
    elements.upcomingModalEyebrow.textContent = 'Upcoming assessment';
  }
  if (elements.upcomingModalTitle) {
    elements.upcomingModalTitle.textContent = 'Schedule';
  }
  if (elements.upcomingModalMeta) {
    elements.upcomingModalMeta.textContent = 'Add a reminder for what is next.';
  }
  if (elements.upcomingSubmit) {
    elements.upcomingSubmit.textContent = 'Save Upcoming';
  }
  closeModal(elements.upcomingModal);
  setUpcomingMessage('');
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

function normalizeUpcomingType(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'homework' ? 'homework' : 'assessment';
}

function updateUpcomingTypeFields() {
  const upcomingType = normalizeUpcomingType(elements.upcomingTypeSelect?.value);
  if (elements.upcomingWeightField) {
    elements.upcomingWeightField.hidden = upcomingType !== 'assessment';
  }
  if (elements.upcomingWeightInput) {
    if (upcomingType !== 'assessment') {
      elements.upcomingWeightInput.value = '';
    }
    elements.upcomingWeightInput.required = false;
  }
}

function renderSubjectsOrderList() {
  if (!elements.subjectsOrderList) return;
  if (!state.data.subjects.length) {
    elements.subjectsOrderList.innerHTML = '<div class="empty-state">No subjects yet.</div>';
    return;
  }
  elements.subjectsOrderList.innerHTML = state.data.subjects
    .map((subject) => {
      const subjectIcon = subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name));
      return `
        <div class="order-item" data-order-item="true" data-id="${subject.id}" draggable="true">
          <div class="order-left">
            <span class="order-icon" style="--swatch:${subject.color}">${subjectIcon}</span>
            <div class="order-name">${subject.name}</div>
          </div>
          <div class="order-handle" aria-hidden="true">
            <i class="ph ph-dots-six-vertical"></i>
          </div>
        </div>
      `;
    })
    .join('');
}

function setOrderDropTarget(target) {
  if (currentOrderDropTarget === target) return;
  if (currentOrderDropTarget) {
    currentOrderDropTarget.classList.remove('is-drop-target');
  }
  currentOrderDropTarget = target;
  if (currentOrderDropTarget) {
    currentOrderDropTarget.classList.add('is-drop-target');
  }
}

function reorderSubjectsFromOrderList() {
  if (!elements.subjectsOrderList) return;
  const orderedIds = Array.from(elements.subjectsOrderList.querySelectorAll('[data-order-item]'))
    .map((item) => item.dataset.id)
    .filter(Boolean);
  if (!orderedIds.length) return;
  const subjectMap = new Map(state.data.subjects.map((subject) => [subject.id, subject]));
  const nextSubjects = orderedIds.map((id) => subjectMap.get(id)).filter(Boolean);
  if (nextSubjects.length !== state.data.subjects.length) return;
  state.data.subjects = nextSubjects;
  saveData(state.data);
  renderSubjects();
}

function normalizeSubjectNameKey(value) {
  return String(value || '').trim().toLowerCase();
}

function getOrCreateSubject(name, options = {}) {
  const normalizedName = String(name || '').trim();
  if (!normalizedName) return null;
  const existing = state.data.subjects.find(
    (subject) => subject.name.toLowerCase() === normalizedName.toLowerCase()
  );
  if (existing) return existing;
  const subject = {
    id: cryptoRandomId(),
    name: normalizedName,
    color: normalizeColorValue(options.color)
      || palette[state.data.subjects.length % palette.length],
    icon: resolveSubjectIcon(options.icon, normalizedName),
    assessments: [],
    upcoming: [],
  };
  state.data.subjects.push(subject);
  return subject;
}

function getUpcomingItem(subjectId, upcomingId) {
  if (!subjectId || !upcomingId) return null;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject || !Array.isArray(subject.upcoming)) return null;
  const upcoming = subject.upcoming.find((item) => item.id === upcomingId);
  if (!upcoming) return null;
  return { subject, upcoming };
}

function openAssessmentForUpcoming(subjectId, upcomingId) {
  const selected = getUpcomingItem(subjectId, upcomingId);
  if (!selected) {
    setUpcomingMessage('Could not find that upcoming item.');
    return;
  }
  const { subject, upcoming } = selected;
  if (normalizeUpcomingType(upcoming.type) !== 'assessment') {
    setUpcomingMessage('Only assessment items can be converted to marks.');
    return;
  }
  openAssessmentModal(subject.id, {
    prefill: {
      name: upcoming.name,
      date: upcoming.date,
      weight: upcoming.weight,
    },
    conversion: {
      subjectId: subject.id,
      upcomingId: upcoming.id,
      requiresWeight: true,
    },
  });
}

function openUpcomingEditor(subjectId, upcomingId) {
  const selected = getUpcomingItem(subjectId, upcomingId);
  if (!selected) {
    setUpcomingMessage('Could not find that upcoming item.');
    return;
  }
  openUpcomingModal({
    subjectId: selected.subject.id,
    upcomingId: selected.upcoming.id,
  });
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
  const normalized = normalizeColorValue(color);
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
  const iconPreview = elements.subjectModal.querySelector('[data-role="icon-preview"]');
  if (iconPreview) {
    iconPreview.style.background = color;
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
    drawSubjectModalChart(subject);
  }
}

function applySubjectIcon(subjectId, icon) {
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject || !icon) return;
  const normalized = resolveSubjectIcon(icon, subject.name);
  if (subject.icon && subject.icon === normalized) {
    updateSubjectIconUI(subjectId, normalized);
    return;
  }
  subject.icon = normalized;
  saveData(state.data);
  render();
  updateSubjectIconUI(subjectId, normalized);
}

function updateSubjectIconUI(subjectId, icon) {
  if (!elements.subjectModal?.classList.contains('is-open')) return;
  if (activeSubjectId !== subjectId) return;
  const carousel = elements.subjectModal.querySelector('[data-icon-carousel]');
  setIconCarouselActive(carousel, icon);
  const preview = elements.subjectModal.querySelector('[data-role="icon-preview"]');
  if (preview) {
    preview.innerHTML = subjectIconHtml(icon);
  }
}

function render() {
  renderOverview();
  renderSubjects();
  renderInsights();
  renderAssessments();
  renderUpcomingDashboard();
  renderUpcomingSubjectSelect();
  renderExportSubjectFilters();
  renderCharts();
  renderCalendar();
  renderTimetable();
  syncTimetableTodayProgressTicker();
  renderWeekSummary();
  renderExamCountdown();
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
    elements.topSubjectIcon.innerHTML = subjectIconHtml(resolveSubjectIcon(topSubject.icon, topSubject.name));
    elements.topSubjectIcon.style.background = topSubject.color;
  } else {
    elements.topSubjectName.textContent = 'No data yet';
    elements.topSubjectGrade.textContent = '--';
    elements.topSubjectFooter.textContent = 'Add assessments to see your leading subject.';
    elements.topSubjectIcon.innerHTML = subjectIconHtml('star');
    elements.topSubjectIcon.style.background = 'linear-gradient(135deg, var(--logo-gradient-1), var(--logo-gradient-2))';
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

  renderV2Stats({ overallAverage, overallGrade, assessmentCount, topSubject, latest });
}

function renderSubjects() {
  if (!elements.subjectGrid) return;
  if (state.data.subjects.length === 0) {
    elements.subjectGrid.innerHTML = '<div class="empty-state">No subjects yet. Add a subject to start tracking results.</div>';
    return;
  }

  if (isUiV2()) {
    elements.subjectGrid.innerHTML = `<div class="v2-subject-list">${state.data.subjects.map(buildV2SubjectRow).join('')}</div>`;
    return;
  }

  elements.subjectGrid.innerHTML = state.data.subjects
    .map((subject) => {
      const stats = subjectStats(subject);
      const averageValue = stats.average === null ? 0 : Math.max(0, Math.min(100, stats.average));
      const averageText = stats.average === null ? '--' : `${stats.average.toFixed(1)}%`;
      const subjectIcon = subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name));
      const hasTarget = Number.isFinite(subject.target);
      const targetMet = hasTarget && stats.average !== null && stats.average >= subject.target;
      const targetLine = hasTarget
        ? `<div class="subject-target-line${targetMet ? ' is-met' : ''}">
            <span>${iconHtml('target')}Target ${formatPercentValue(subject.target)}%</span>
            <span>${stats.average === null ? 'No marks yet' : targetMet ? 'On target' : `${(subject.target - stats.average).toFixed(1)}% to go`}</span>
          </div>`
        : '';
      return `
        <button class="subject-button" type="button" data-action="open-subject" data-id="${subject.id}">
          <div class="card subject-card glow-soft" data-id="${subject.id}">
            <div class="subject-header">
              <div class="subject-info">
                <div class="subject-icon" style="background:${subject.color}">${subjectIcon}</div>
                <div>
                  <div class="subject-title">${subject.name}</div>
                  <div class="subject-meta">${subject.assessments.length} assessments</div>
                </div>
              </div>
            </div>
            <div class="subject-stats">
              <div class="stat-box">
                <span>Average</span>
                <strong>${averageText}</strong>
              </div>
              <div class="stat-box">
                <span>Grade</span>
                <strong>${stats.grade ?? '--'}</strong>
              </div>
            </div>
            <div
              class="subject-average-progress"
              role="progressbar"
              aria-label="${subject.name} average"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${averageValue.toFixed(1)}"
            >
              <div class="subject-average-progress-track">
                <div
                  class="subject-average-progress-fill"
                  style="width:${averageValue}%; --subject-color:${subject.color};"
                ></div>
                ${hasTarget ? `<span class="target-bar-marker" style="left:${subject.target}%"></span>` : ''}
              </div>
            </div>
            ${targetLine}
          </div>
        </button>
      `;
    })
    .join('');
}

function buildV2SubjectRow(subject) {
  const stats = subjectStats(subject);
  const average = stats.average === null ? 0 : clamp(stats.average, 0, 100);
  const hasTarget = Number.isFinite(subject.target);
  const targetMet = hasTarget && stats.average !== null && stats.average >= subject.target;
  const count = subject.assessments.length;
  const metaParts = [`${count} assessment${count === 1 ? '' : 's'}`];
  if (hasTarget) {
    metaParts.push(
      stats.average === null
        ? `Target ${formatPercentValue(subject.target)}%`
        : targetMet
        ? `<span class="v2-target is-met">On target</span>`
        : `<span class="v2-target">${(subject.target - stats.average).toFixed(1)}% to target</span>`
    );
  }
  return `
    <button class="v2-subject-row" type="button" data-action="open-subject" data-id="${subject.id}" style="--subject-color:${subject.color}">
      <span class="v2-subject-icon">${subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name))}</span>
      <span class="v2-subject-main">
        <span class="v2-subject-name">${escapeHtml(subject.name)}</span>
        <span class="v2-subject-meta">${metaParts.join(' · ')}</span>
      </span>
      <span class="v2-subject-progress" aria-hidden="true">
        <span class="v2-subject-fill" style="width:${average}%"></span>
        ${hasTarget ? `<span class="v2-subject-marker" style="left:${clamp(subject.target, 0, 100)}%"></span>` : ''}
      </span>
      <span class="v2-subject-average">${stats.average === null ? '—' : `${stats.average.toFixed(1)}%`}</span>
      <span class="v2-grade" data-grade="${(stats.grade || '-')[0]}">${stats.grade ?? '—'}</span>
      ${iconHtml('caret-right', 'v2-subject-chevron')}
    </button>
  `;
}

function normalizeAssessmentSortDirection(direction) {
  return direction === 'asc' ? 'asc' : 'desc';
}

function buildAssessmentRows(items) {
  return (items || []).map((assessment, index) => {
    const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
    const grade = getLetterGrade(percent);
    return {
      assessment,
      percent,
      grade,
      gradeRank: GRADE_SORT_ORDER.get(grade) ?? -1,
      dateValue: assessmentDateValue(assessment),
      weightValue: Number.isFinite(assessment.weight) ? assessment.weight : null,
      index,
    };
  });
}

function sortAssessmentRows(rows, sortKey, sortDirection) {
  const direction = normalizeAssessmentSortDirection(sortDirection);
  const key = ASSESSMENT_SORT_KEYS.has(sortKey) ? sortKey : 'date';
  return [...rows].sort((left, right) => {
    let compare = 0;
    if (key === 'subject') {
      compare = left.assessment.subjectName.localeCompare(right.assessment.subjectName, undefined, { sensitivity: 'base' });
      if (compare === 0) {
        compare = left.assessment.name.localeCompare(right.assessment.name, undefined, { sensitivity: 'base' });
      }
      compare = direction === 'asc' ? compare : -compare;
    } else if (key === 'weight') {
      compare = compareNullableNumbers(left.weightValue, right.weightValue, direction);
      if (compare === 0) {
        compare = direction === 'asc' ? left.percent - right.percent : right.percent - left.percent;
      }
    } else if (key === 'percent') {
      compare = direction === 'asc' ? left.percent - right.percent : right.percent - left.percent;
    } else if (key === 'grade') {
      compare = direction === 'asc' ? left.gradeRank - right.gradeRank : right.gradeRank - left.gradeRank;
      if (compare === 0) {
        compare = direction === 'asc' ? left.percent - right.percent : right.percent - left.percent;
      }
    } else {
      compare = direction === 'asc' ? left.dateValue - right.dateValue : right.dateValue - left.dateValue;
    }
    if (compare !== 0) return compare;
    return left.index - right.index;
  });
}

function renderAssessmentSortState() {
  if (elements.assessmentSearch && elements.assessmentSearch.value !== state.assessmentTable.search) {
    elements.assessmentSearch.value = state.assessmentTable.search;
  }
  if (!elements.assessmentTableHead) return;
  const sortKey = ASSESSMENT_SORT_KEYS.has(state.assessmentTable.sortKey) ? state.assessmentTable.sortKey : 'date';
  const sortDirection = normalizeAssessmentSortDirection(state.assessmentTable.sortDirection);
  const toggles = elements.assessmentTableHead.querySelectorAll('[data-assessment-sort]');
  toggles.forEach((toggle) => {
    const key = toggle.dataset.assessmentSort;
    const active = key === sortKey;
    toggle.classList.toggle('is-active', active);
    toggle.dataset.direction = active ? sortDirection : 'none';
    toggle.setAttribute('aria-pressed', active ? 'true' : 'false');
    const indicator = toggle.querySelector('[data-sort-indicator]');
    if (indicator) {
      indicator.textContent = active ? (sortDirection === 'asc' ? '↑' : '↓') : '↕';
    }
    const heading = toggle.closest('th');
    if (heading) {
      heading.setAttribute('aria-sort', active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none');
    }
  });
}

// One table row in V2: subject dot, tabular numbers, a grade badge and icon-only actions.
// Keeps the same data-action buttons as V1 so the table's click handler works unchanged.
function buildAssessmentRowV2(row) {
  const { assessment, percent, grade } = row;
  const ids = `data-subject-id="${assessment.subjectId}" data-assessment-id="${assessment.id}"`;
  const shared = Boolean(assessment.leaderboardDocId);
  const name = escapeHtml(assessment.name);
  const rel = relativeMarkParts(row.relative || new Map(), assessment.subjectId, percent);
  return `
    <tr class="v2-an-row">
      <td class="v2-an-cell-subject">
        <span class="v2-an-subject-cell" style="--subject-color:${assessment.subjectColor}">
          ${subjectMarkHtml(assessment.subjectIcon, assessment.subjectName, assessment.subjectColor)}
          <span class="v2-an-subject-name">${escapeHtml(assessment.subjectName)}</span>
        </span>
      </td>
      <td class="v2-an-cell-name">${name}${rel.best}</td>
      <td class="v2-an-num v2-an-cell-score">${assessment.score}<span class="v2-an-of"> / ${assessment.total}</span></td>
      <td class="v2-an-num v2-an-cell-weight">${assessment.weight ?? '<span class="v2-an-none">—</span>'}</td>
      <td class="v2-an-num v2-an-cell-percent">${percent.toFixed(1)}%</td>
      <td class="v2-an-cell-rel">${rel.z || '<span class="v2-an-none">—</span>'}</td>
      <td class="v2-an-cell-grade">${v2GradeBadge(grade)}</td>
      <td class="v2-an-cell-date">${formatDate(assessment.date)}</td>
      <td class="v2-an-cell-actions">
        <div class="v2-an-actions">
          <button class="icon-button" type="button" data-action="edit-assessment" ${ids} title="Edit" aria-label="Edit ${name}">${iconHtml('pencil-simple')}</button>
          <button class="icon-button${shared ? ' is-shared' : ''}" type="button" data-action="share-assessment" ${ids} title="${shared ? 'Shared to leaderboard' : 'Share to leaderboard'}" aria-label="${shared ? 'Shared' : 'Share'} ${name}" ${canShareSubjectMarks(assessment.subjectId) ? '' : 'hidden'}>${iconHtml(shared ? 'cloud-check' : 'share-network')}</button>
          <button class="icon-button v2-an-remove" type="button" data-action="delete-assessment" ${ids} title="Remove" aria-label="Remove ${name}">${iconHtml('trash')}</button>
        </div>
      </td>
    </tr>
  `;
}

function renderAssessments() {
  renderShareAllButton();
  if (!elements.assessmentTable) return;
  if (!ASSESSMENT_SORT_KEYS.has(state.assessmentTable.sortKey)) {
    state.assessmentTable.sortKey = 'date';
  }
  state.assessmentTable.sortDirection = normalizeAssessmentSortDirection(state.assessmentTable.sortDirection);
  renderAssessmentSortState();

  const v2 = isUiV2();
  if (elements.assessmentSearch) {
    elements.assessmentSearch.placeholder = v2 ? 'Search assessments or subjects' : 'Type an assessment name';
  }
  const countLabel = document.getElementById('analytics-assessment-count');
  const allAssessments = sortAssessments(getAllAssessments()).reverse();
  if (allAssessments.length === 0) {
    if (countLabel) countLabel.textContent = '';
    elements.assessmentTable.innerHTML = '<tr><td colspan="9" class="empty-state">No assessments logged yet.</td></tr>';
    return;
  }

  const searchQuery = String(state.assessmentTable.search || '').trim().toLowerCase();
  const rows = buildAssessmentRows(allAssessments);
  // V2 also matches the subject name, and can be narrowed to one grade from the Grade breakdown.
  const gradeFilter = v2 ? getAnalyticsGradeFilter() : '';
  const filterTag = document.getElementById('analytics-grade-filter');
  if (filterTag) {
    filterTag.hidden = !gradeFilter;
    filterTag.innerHTML = gradeFilter ? `Grade ${escapeHtml(gradeFilter)}${iconHtml('x')}` : '';
    filterTag.setAttribute('aria-label', gradeFilter ? `Showing grade ${gradeFilter} only. Show all assessments` : '');
  }
  const filteredRows = rows.filter((row) =>
    (!gradeFilter || row.grade === gradeFilter) &&
    (!searchQuery ||
      row.assessment.name.toLowerCase().includes(searchQuery) ||
      (v2 && String(row.assessment.subjectName || '').toLowerCase().includes(searchQuery)))
  );
  if (countLabel) {
    countLabel.textContent = searchQuery || gradeFilter
      ? `${filteredRows.length} of ${rows.length}`
      : `${rows.length} total`;
  }

  if (filteredRows.length === 0) {
    elements.assessmentTable.innerHTML = `<tr><td colspan="9" class="empty-state">${gradeFilter && !searchQuery ? `No ${escapeHtml(gradeFilter)} marks.` : 'No assessments match your search.'}</td></tr>`;
    return;
  }

  const orderedRows = sortAssessmentRows(
    filteredRows,
    state.assessmentTable.sortKey,
    state.assessmentTable.sortDirection
  );

  if (v2) {
    const relative = buildRelativeMarks();
    elements.assessmentTable.innerHTML = orderedRows.map((row) => buildAssessmentRowV2({ ...row, relative })).join('');
    return;
  }

  elements.assessmentTable.innerHTML = orderedRows
    .map((row) => {
      const { assessment, percent, grade } = row;
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
            <div style="display: flex; gap: 8px;">
              <button class="ghost-button ghost-button--small" data-action="edit-assessment" data-subject-id="${assessment.subjectId}" data-assessment-id="${assessment.id}">Edit</button>
              <button class="ghost-button ghost-button--small${assessment.leaderboardDocId ? ' is-shared' : ''}" data-action="share-assessment" data-subject-id="${assessment.subjectId}" data-assessment-id="${assessment.id}" ${canShareSubjectMarks(assessment.subjectId) ? '' : 'hidden'}>
                ${assessment.leaderboardDocId ? '<i class="ph ph-cloud-check" style="margin-right:4px;"></i>Shared' : '<i class="ph ph-share-network" style="margin-right:4px;"></i>Share'}
              </button>
              <button class="delete-button" data-action="delete-assessment" data-subject-id="${assessment.subjectId}" data-assessment-id="${assessment.id}">Remove</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderUpcomingDashboard() {
  if (!elements.upcomingList) return;
  const upcoming = sortUpcoming(getVisibleUpcomingItems());
  const maxItems = 4;
  const canExpand = upcoming.length > maxItems;
  const visible = state.upcomingExpanded ? upcoming : upcoming.slice(0, maxItems);

  if (elements.upcomingCard) {
    elements.upcomingCard.classList.toggle('is-expanded', state.upcomingExpanded && canExpand);
  }

  if (elements.upcomingToggle) {
    elements.upcomingToggle.hidden = !canExpand;
    elements.upcomingToggle.setAttribute('aria-expanded', state.upcomingExpanded && canExpand ? 'true' : 'false');
    elements.upcomingToggle.innerHTML = state.upcomingExpanded && canExpand
      ? `${iconHtml('caret-up')}Show less`
      : `${iconHtml('caret-down')}See all`;
  }

  if (upcoming.length === 0) {
    elements.upcomingList.innerHTML = '<div class="empty-state">No upcoming work yet.</div>';
  } else {
    elements.upcomingList.innerHTML = buildUpcomingList(visible, { showSubject: true, allowRemove: true });
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

function bindSubjectsEvents() {
  if (elements.addSubjectOpen) {
    elements.addSubjectOpen.addEventListener('click', () => {
      if (elements.addSubjectModal?.classList.contains('is-open')) {
        closeAddSubjectPopup();
        return;
      }
      openAddSubjectPopup();
    });
  }

  if (elements.subjectsOrderOpen) {
    elements.subjectsOrderOpen.addEventListener('click', () => {
      closeAddSubjectPopup();
      renderSubjectsOrderList();
      openModal(elements.subjectsOrderModal);
    });
  }

  if (elements.subjectsOrderModal) {
    elements.subjectsOrderModal.addEventListener('click', (event) => {
      const actionTarget = event.target.closest('[data-action]');
      if (!actionTarget) return;
      const action = actionTarget.dataset.action;
      if (action === 'close-subjects-order') {
        closeModal(elements.subjectsOrderModal);
        return;
      }
    });
  }

  if (elements.subjectsOrderList) {
    elements.subjectsOrderList.addEventListener('dragstart', (event) => {
      const item = event.target.closest('[data-order-item]');
      if (!item) return;
      draggingOrderId = item.dataset.id || null;
      item.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggingOrderId || '');
    });

    elements.subjectsOrderList.addEventListener('dragend', (event) => {
      const item = event.target.closest('[data-order-item]');
      if (item) {
        item.classList.remove('is-dragging');
      }
      draggingOrderId = null;
      setOrderDropTarget(null);
    });

    elements.subjectsOrderList.addEventListener('dragover', (event) => {
      if (!draggingOrderId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const target = event.target.closest('[data-order-item]');
      if (!target || target.dataset.id === draggingOrderId) return;
      setOrderDropTarget(target);
      const dragging = elements.subjectsOrderList.querySelector('[data-order-item].is-dragging');
      if (!dragging) return;
      const rect = target.getBoundingClientRect();
      const isAfter = event.clientY - rect.top > rect.height / 2;
      const reference = isAfter ? target.nextSibling : target;
      if (reference !== dragging) {
        elements.subjectsOrderList.insertBefore(dragging, reference);
      }
    });

    elements.subjectsOrderList.addEventListener('drop', (event) => {
      if (!draggingOrderId) return;
      event.preventDefault();
      reorderSubjectsFromOrderList();
      setOrderDropTarget(null);
    });
  }

  if (elements.addSubjectModal) {
    elements.addSubjectModal.addEventListener('click', async (event) => {
      const actionTarget = event.target.closest('[data-action]');
      if (!actionTarget) return;
      const action = actionTarget.dataset.action;

      if (action === 'close-add-subject') {
        closeAddSubjectPopup();
        return;
      }

      if (action === 'carousel-prev') {
        scrollIconCarousel(actionTarget, -1);
        return;
      }

      if (action === 'carousel-next') {
        scrollIconCarousel(actionTarget, 1);
        return;
      }

      if (action === 'set-add-subject-color') {
        setAddSubjectColor(actionTarget.dataset.color);
        return;
      }

      if (action === 'set-add-subject-icon') {
        setAddSubjectIcon(actionTarget.dataset.icon);
        return;
      }

      if (action === 'set-add-subject-icon-other') {
        const current = normalizeSubjectIcon(elements.addSubjectIcon?.value);
        const icon = await showCustomIconPicker(current);
        if (!icon) return;
        setAddSubjectIcon(icon);
      }
    });
  }

  if (elements.addSubjectForm) {
    elements.addSubjectForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(elements.addSubjectForm);
      const subjectName = String(formData.get('subjectName') || '').trim();
      const icon = resolveSubjectIcon(formData.get('subjectIcon'), subjectName);
      const color = normalizeColorValue(formData.get('subjectColor'))
        || palette[state.data.subjects.length % palette.length];

      if (!subjectName) {
        return setSubjectMessage('Please enter a subject name.');
      }

      const existing = state.data.subjects.find(
        (subject) => subject.name.toLowerCase() === subjectName.toLowerCase()
      );
      if (existing) {
        return setSubjectMessage('That subject already exists.');
      }

      getOrCreateSubject(subjectName, { icon, color });
      saveData(state.data);
      render();
      closeAddSubjectPopup();
    });
  }

  if (elements.addSubjectModal) {
    elements.addSubjectModal.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.name === 'subjectColor') {
        setAddSubjectColor(target.value);
      }
      if (target === elements.addSubjectName) {
        setSubjectMessage('');
      }
    });
  }

  if (elements.upcomingAdd) {
    elements.upcomingAdd.addEventListener('click', () => {
      openUpcomingModal();
    });
  }

  if (elements.upcomingToggle) {
    elements.upcomingToggle.addEventListener('click', () => {
      state.upcomingExpanded = !state.upcomingExpanded;
      renderUpcomingDashboard();
    });
  }

  document.getElementById('upcoming-delete')?.addEventListener('click', async () => {
    if (!pendingUpcomingEdit) return;
    const { subjectId, upcomingId } = pendingUpcomingEdit;
    const confirmed = await showConfirm({
      title: 'Delete upcoming item?',
      message: 'This will remove the upcoming item.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    closeUpcomingModal();
    removeUpcoming(subjectId, upcomingId);
  });

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
      const upcomingType = normalizeUpcomingType(formData.get('upcomingType'));
      const upcomingName = String(formData.get('upcomingName') || '').trim();
      const upcomingWeightInput = formData.get('upcomingWeight');
      const upcomingWeight = upcomingWeightInput === '' ? null : parseFloat(upcomingWeightInput);
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
      if (upcomingType === 'assessment' && upcomingWeight !== null && (!Number.isFinite(upcomingWeight) || upcomingWeight < 0)) {
        return setUpcomingMessage('Weighting must be a positive number.');
      }
      if (!upcomingDate) {
        return setUpcomingMessage('Please choose a due date.');
      }

      const editContext = pendingUpcomingEdit;
      subject.upcoming = Array.isArray(subject.upcoming) ? subject.upcoming : [];
      if (editContext) {
        const sourceSubject = state.data.subjects.find((item) => item.id === editContext.subjectId);
        if (!sourceSubject) {
          return setUpcomingMessage('Could not find the original subject for this upcoming item.');
        }
        sourceSubject.upcoming = Array.isArray(sourceSubject.upcoming) ? sourceSubject.upcoming : [];
        const sourceIndex = sourceSubject.upcoming.findIndex((item) => item.id === editContext.upcomingId);
        if (sourceIndex < 0) {
          return setUpcomingMessage('Could not find that upcoming item.');
        }
        const existingItem = sourceSubject.upcoming[sourceIndex];
        const updatedUpcoming = {
          id: existingItem.id,
          name: upcomingName,
          type: upcomingType,
          weight: upcomingType === 'assessment' ? upcomingWeight : null,
          date: upcomingDate,
          notes: upcomingNotes,
          createdAt: Number.isFinite(existingItem.createdAt) ? existingItem.createdAt : Date.now(),
        };

        if (subjectId === editContext.subjectId) {
          sourceSubject.upcoming[sourceIndex] = updatedUpcoming;
        } else {
          sourceSubject.upcoming.splice(sourceIndex, 1);
          subject.upcoming.push(updatedUpcoming);
        }
      } else {
        subject.upcoming.push({
          id: cryptoRandomId(),
          name: upcomingName,
          type: upcomingType,
          weight: upcomingType === 'assessment' ? upcomingWeight : null,
          date: upcomingDate,
          notes: upcomingNotes,
          createdAt: Date.now(),
        });
      }

      saveData(state.data);
      render();
      closeUpcomingModal();
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
    elements.subjectModal.addEventListener('input', (event) => {
      const input = event.target.closest('[data-what-if-field]');
      if (!input) return;
      const row = whatIfState.rows[Number(input.dataset.whatIfIndex)];
      if (!row) return;
      row[input.dataset.whatIfField] = input.value;
      renderWhatIfResult();
    });

    elements.subjectModal.addEventListener(
      'toggle',
      (event) => {
        if (event.target.id !== 'what-if-panel') return;
        whatIfState.open = event.target.open;
        renderWhatIfResult();
      },
      true
    );

    elements.subjectModal.addEventListener('click', async (event) => {
      const actionTarget = event.target.closest('[data-action]');
      if (!actionTarget) return;
      const action = actionTarget.dataset.action;

      if (action === 'carousel-prev') {
        scrollIconCarousel(actionTarget, -1);
        return;
      }

      if (action === 'carousel-next') {
        scrollIconCarousel(actionTarget, 1);
        return;
      }

      if (action === 'close-subject') {
        closeSubjectModal();
        return;
      }

      const openMenu = actionTarget.closest('.more-menu-list');
      if (openMenu) {
        openMenu.hidden = true;
        openMenu.previousElementSibling?.setAttribute('aria-expanded', 'false');
      }

      if (action === 'toggle-more-menu') {
        const menu = actionTarget.nextElementSibling;
        if (!menu) return;
        menu.hidden = !menu.hidden;
        actionTarget.setAttribute('aria-expanded', String(!menu.hidden));
        if (!menu.hidden) menu.querySelector('button')?.focus();
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

      if (action === 'open-edit-subject') {
        if (!activeSubjectId) return;
        openEditSubjectModal(activeSubjectId);
        return;
      }

      if (action === 'what-if-add') {
        whatIfState.rows.push(createBlankWhatIfRow());
        renderWhatIfRows();
        renderWhatIfResult();
        elements.subjectModalBody
          ?.querySelector(`[data-what-if-index="${whatIfState.rows.length - 1}"][data-what-if-field="score"]`)
          ?.focus();
        return;
      }

      if (action === 'what-if-remove') {
        whatIfState.rows.splice(Number(actionTarget.dataset.whatIfIndex), 1);
        if (!whatIfState.rows.length) whatIfState.rows.push(createBlankWhatIfRow());
        renderWhatIfRows();
        renderWhatIfResult();
        return;
      }

      if (action === 'delete-subject') {
        if (!activeSubjectId) return;
        const confirmed = await showConfirm({
          title: 'Delete subject?',
          message: 'This will remove the subject and all assessments.',
          confirmLabel: 'Delete',
          danger: true,
        });
        if (!confirmed) return;
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
        const toDelete = subject.assessments.find((item) => item.id === assessmentId);
        const sharedDocId = toDelete?.leaderboardDocId || null;

        const confirmed = await showConfirm({
          title: 'Delete assessment?',
          message: 'This will remove the assessment result.',
          confirmLabel: 'Delete',
          danger: true,
        });
        if (!confirmed) return;
        subject.assessments = subject.assessments.filter((item) => item.id !== assessmentId);
        
        saveData(state.data);
        render();
        openSubjectModal(subjectId);

        // Also remove from leaderboard if shared
        if (sharedDocId && appwriteDatabases) {
          try { await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'leaderboard', sharedDocId); } catch (_) {}
          fetchLeaderboard();
        }
      }

      if (action === 'edit-assessment') {
        const subjectId = actionTarget.dataset.subjectId;
        const assessmentId = actionTarget.dataset.assessmentId;
        const subject = state.data.subjects.find((item) => item.id === subjectId);
        if (!subject) return;
        const assessment = subject.assessments.find((item) => item.id === assessmentId);
        if (!assessment) return;
        openAssessmentModal(subjectId, { edit: assessment });
        return;
      }

      if (action === 'share-assessment') {
        const subjectId = actionTarget.dataset.subjectId;
        const assessmentId = actionTarget.dataset.assessmentId;
        shareAssessmentToLeaderboard(subjectId, assessmentId);
        return;
      }

      if (action === 'complete-upcoming') {
        const subjectId = actionTarget.dataset.subjectId;
        const upcomingId = actionTarget.dataset.upcomingId;
        openAssessmentForUpcoming(subjectId, upcomingId);
        return;
      }

      if (action === 'edit-upcoming') {
        const subjectId = actionTarget.dataset.subjectId;
        const upcomingId = actionTarget.dataset.upcomingId;
        openUpcomingEditor(subjectId, upcomingId);
        return;
      }

      if (action === 'delete-upcoming') {
        const subjectId = actionTarget.dataset.subjectId;
        const upcomingId = actionTarget.dataset.upcomingId;
        const confirmed = await showConfirm({
          title: 'Delete upcoming item?',
          message: 'This will remove the upcoming assessment.',
          confirmLabel: 'Delete',
          danger: true,
        });
        if (!confirmed) return;
        removeUpcoming(subjectId, upcomingId);
      }
    });
  }

  if (elements.editSubjectModal) {
    elements.editSubjectModal.addEventListener('click', async (event) => {
      const actionTarget = event.target.closest('[data-action]');
      if (!actionTarget) return;
      const action = actionTarget.dataset.action;

      if (action === 'close-edit-subject') {
        closeEditSubjectModal();
        return;
      }

      if (action === 'carousel-prev') {
        scrollIconCarousel(actionTarget, -1);
        return;
      }

      if (action === 'carousel-next') {
        scrollIconCarousel(actionTarget, 1);
        return;
      }

      if (action === 'set-edit-subject-color') {
        setEditSubjectColor(actionTarget.dataset.color);
        return;
      }

      if (action === 'set-edit-subject-icon') {
        const icon = resolveSubjectIcon(actionTarget.dataset.icon, elements.editSubjectName?.value || '');
        setEditSubjectIcon(icon);
        return;
      }

      if (action === 'set-edit-subject-icon-other') {
        const current = normalizeSubjectIcon(elements.editSubjectIcon?.value);
        const icon = await showCustomIconPicker(current);
        if (!icon) return;
        setEditSubjectIcon(icon);
      }
    });
  }

  if (elements.editSubjectModal) {
    elements.editSubjectModal.addEventListener('input', (event) => {
      const target = event.target;
      if (target === elements.editSubjectColor) {
        setEditSubjectColor(target.value);
        return;
      }
      if (target === elements.editSubjectName) {
        setEditSubjectMessage('');
      }
    });
  }

  if (elements.editSubjectForm) {
    elements.editSubjectForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const subjectId = String(elements.editSubjectId?.value || '').trim();
      if (!subjectId) {
        setEditSubjectMessage('Could not find that subject.', true);
        return;
      }
      const subject = state.data.subjects.find((item) => item.id === subjectId);
      if (!subject) {
        setEditSubjectMessage('Could not find that subject.', true);
        return;
      }

      const nextName = String(elements.editSubjectName?.value || '').trim();
      if (!nextName) {
        setEditSubjectMessage('Please enter a subject name.', true);
        return;
      }

      const hasDuplicate = state.data.subjects.some(
        (item) => item.id !== subjectId
          && normalizeSubjectNameKey(item.name) === normalizeSubjectNameKey(nextName)
      );
      if (hasDuplicate) {
        setEditSubjectMessage('That subject name already exists.', true);
        return;
      }

      const nextColor = normalizeColorValue(elements.editSubjectColor?.value)
        || normalizeColorValue(subject.color)
        || palette[0];
      const nextIcon = resolveSubjectIcon(elements.editSubjectIcon?.value, nextName);
      const nextTarget = normalizeTarget(elements.editSubjectTarget?.value);

      const unchanged = subject.name === nextName
        && normalizeColorValue(subject.color).toLowerCase() === nextColor.toLowerCase()
        && resolveSubjectIcon(subject.icon, subject.name) === nextIcon
        && (subject.target ?? null) === nextTarget;
      if (unchanged) {
        setEditSubjectMessage('No changes to save.');
        return;
      }

      subject.name = nextName;
      subject.color = nextColor;
      subject.icon = nextIcon;
      subject.target = nextTarget;
      saveData(state.data);
      render();
      if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId === subjectId) {
        openSubjectModal(subjectId);
      }
      closeEditSubjectModal();
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
    elements.upcomingList.addEventListener('click', async (event) => {
      const actionTarget = event.target.closest('[data-action]');
      if (!actionTarget) return;
      if (actionTarget.dataset.action === 'edit-upcoming') {
        const subjectId = actionTarget.dataset.subjectId;
        const upcomingId = actionTarget.dataset.upcomingId;
        openUpcomingEditor(subjectId, upcomingId);
        return;
      }
      if (actionTarget.dataset.action === 'complete-upcoming') {
        const subjectId = actionTarget.dataset.subjectId;
        const upcomingId = actionTarget.dataset.upcomingId;
        openAssessmentForUpcoming(subjectId, upcomingId);
        return;
      }
      if (actionTarget.dataset.action === 'delete-upcoming') {
        const subjectId = actionTarget.dataset.subjectId;
        const upcomingId = actionTarget.dataset.upcomingId;
        const confirmed = await showConfirm({
          title: 'Delete upcoming item?',
          message: 'This will remove the upcoming assessment.',
          confirmLabel: 'Delete',
          danger: true,
        });
        if (!confirmed) return;
        removeUpcoming(subjectId, upcomingId);
      }
    });
  }

  if (elements.assessmentForm) {
    elements.assessmentForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(elements.assessmentForm);
      const assessmentId = String(formData.get('assessmentId') || '').trim();
      const subjectId = String(formData.get('subjectId') || '').trim();
      const assessmentName = String(formData.get('assessment') || '').trim();
      let score = parseFloat(formData.get('score'));
      let total = parseFloat(formData.get('total'));
      const weightInput = formData.get('weight');
      const weight = weightInput === '' ? null : parseFloat(weightInput);
      const date = String(formData.get('date') || today);
      const termValue = Number(formData.get('term'));
      const term = [1, 2, 3, 4].includes(termValue) ? termValue : null;

      const subject = state.data.subjects.find((item) => item.id === subjectId);
      if (!subject) {
        return setAssessmentMessage('Select a subject before adding an assessment.');
      }
      if (!assessmentName) {
        return setAssessmentMessage('Please enter an assessment name.');
      }

      if (assessmentComponents.length > 0) {
        let totalWeight = 0;
        let calculatedScore = 0;
        for (const comp of assessmentComponents) {
          if (!comp.name || !Number.isFinite(comp.score) || !Number.isFinite(comp.total) || comp.total <= 0) {
            return setAssessmentMessage('Please complete all component fields correctly.');
          }
          const w = Number.isFinite(comp.weight) && comp.weight > 0 ? comp.weight : 1;
          totalWeight += w;
          calculatedScore += (comp.score / comp.total) * w;
        }
        if (totalWeight > 0) {
          score = Number(((calculatedScore / totalWeight) * 100).toFixed(2));
          total = 100;
        }
      }

      if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
        return setAssessmentMessage('Please enter a valid score and total.');
      }
      if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
        return setAssessmentMessage('Weighting must be a positive number.');
      }
      if (pendingAssessmentConversion?.requiresWeight && (!Number.isFinite(weight) || weight <= 0)) {
        return setAssessmentMessage('Weighting is required when converting an upcoming assessment.');
      }

      if (assessmentId) {
        const existing = subject.assessments.find((a) => a.id === assessmentId);
        if (existing) {
          existing.name = assessmentName;
          existing.score = score;
          existing.total = total;
          existing.weight = weight;
          existing.date = date;
          if (isUiV2()) existing.term = term;
          existing.components = [...assessmentComponents];
        }
      } else {
        subject.assessments.push({
          id: cryptoRandomId(),
          name: assessmentName,
          score,
          total,
          weight,
          date,
          term: isUiV2() ? term : null,
          createdAt: Date.now(),
          components: [...assessmentComponents],
        });
      }

      if (pendingAssessmentConversion?.subjectId === subjectId && pendingAssessmentConversion.upcomingId) {
        subject.upcoming = Array.isArray(subject.upcoming)
          ? subject.upcoming.filter((u) => u.id !== pendingAssessmentConversion.upcomingId)
          : [];
      }

      saveData(state.data);
      render();
      closeAssessmentModal();
      if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId === subjectId) {
        openSubjectModal(subjectId);
      }
    });
  }

  if (elements.addAssessmentComponent) {
    elements.addAssessmentComponent.addEventListener('click', () => {
      assessmentComponents.push({ name: '', score: null, total: null, weight: null });
      renderAssessmentComponents();
    });
  }

  if (elements.assessmentComponentsList) {
    elements.assessmentComponentsList.addEventListener('input', (event) => {
      const target = event.target;
      if (target.classList.contains('component-input')) {
        const index = parseInt(target.dataset.index, 10);
        const field = target.dataset.field;
        if (field === 'name') {
          assessmentComponents[index][field] = target.value;
        } else {
          assessmentComponents[index][field] = target.value ? parseFloat(target.value) : null;
        }
      }
    });

    elements.assessmentComponentsList.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-action="remove-component"]');
      if (btn) {
        const index = parseInt(btn.dataset.index, 10);
        assessmentComponents.splice(index, 1);
        renderAssessmentComponents();
      }
    });
  }

  if (elements.upcomingForm) {
    elements.upcomingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId === subjectId) {
        openSubjectModal(subjectId);
      }
    });
  }

  if (elements.upcomingTypeSelect) {
    elements.upcomingTypeSelect.addEventListener('change', () => {
      updateUpcomingTypeFields();
    });
  }

  if (elements.subjectGrid) {
    elements.subjectGrid.addEventListener('click', async (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;
      const subjectId = target.dataset.id;
      if (action === 'delete-subject') {
        const confirmed = await showConfirm({
          title: 'Delete subject?',
          message: 'This will remove the subject and all assessments.',
          confirmLabel: 'Delete',
          danger: true,
        });
        if (!confirmed) return;
        state.data.subjects = state.data.subjects.filter((subject) => subject.id !== subjectId);
        saveData(state.data);
        render();
      }
      if (action === 'delete-assessment') {
        const assessmentId = target.dataset.assessmentId;
        const subject = state.data.subjects.find((item) => item.id === target.dataset.subjectId);
        if (!subject) return;
        const confirmed = await showConfirm({
          title: 'Delete assessment?',
          message: 'This will remove the assessment result.',
          confirmLabel: 'Delete',
          danger: true,
        });
        if (!confirmed) return;
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
    elements.assessmentTable.addEventListener('click', async (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;
      if (action === 'delete-assessment') {
        const subjectId = target.dataset.subjectId;
        const assessmentId = target.dataset.assessmentId;
        const subject = state.data.subjects.find((item) => item.id === subjectId);
        if (!subject) return;
        const toDelete = subject.assessments.find((item) => item.id === assessmentId);
        const sharedDocId = toDelete?.leaderboardDocId || null;
        const confirmed = await showConfirm({
          title: 'Delete assessment?',
          message: 'This will remove the assessment result.',
          confirmLabel: 'Delete',
          danger: true,
        });
        if (!confirmed) return;
        subject.assessments = subject.assessments.filter((item) => item.id !== assessmentId);
        saveData(state.data);
        render();
        // Also remove from leaderboard if shared
        if (sharedDocId && appwriteDatabases) {
          try { await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'leaderboard', sharedDocId); } catch (_) {}
          fetchLeaderboard();
        }
      } else if (action === 'edit-assessment') {
        const subjectId = target.dataset.subjectId;
        const assessmentId = target.dataset.assessmentId;
        const subject = state.data.subjects.find((item) => item.id === subjectId);
        if (!subject) return;
        const assessment = subject.assessments.find((item) => item.id === assessmentId);
        if (!assessment) return;
        openAssessmentModal(subjectId, { edit: assessment });
      } else if (action === 'share-assessment') {
        const subjectId = target.dataset.subjectId;
        const assessmentId = target.dataset.assessmentId;
        shareAssessmentToLeaderboard(subjectId, assessmentId);
      }
    });
  }

  if (elements.assessmentSearch) {
    elements.assessmentSearch.addEventListener('input', (event) => {
      state.assessmentTable.search = String(event.target.value || '');
      renderAssessments();
    });
  }

  if (elements.assessmentTableHead) {
    elements.assessmentTableHead.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-assessment-sort]');
      if (!toggle) return;
      const sortKey = toggle.dataset.assessmentSort;
      if (!ASSESSMENT_SORT_KEYS.has(sortKey)) return;
      if (state.assessmentTable.sortKey === sortKey) {
        state.assessmentTable.sortDirection = state.assessmentTable.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.assessmentTable.sortKey = sortKey;
        state.assessmentTable.sortDirection = sortKey === 'date' ? 'desc' : 'asc';
      }
      renderAssessments();
    });
  }
}
