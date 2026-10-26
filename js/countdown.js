// V2 dashboard: exam countdown at the top of the Upcoming panel. The next assessment gets a
// countdown ("in 2 days"), the one or two after it share a compact line, and a note appears
// when several land close together. Assessments whose date has passed without a mark are
// called out as overdue (the Upcoming list hides them). Homework is left to the list.

const COUNTDOWN_DAY_MS = 86400000;
const COUNTDOWN_CLUSTER_DAYS = 14;
const COUNTDOWN_CLUSTER_MIN = 3;

// Whole days from today to the item's date: 0 today, 1 tomorrow, negative when past.
function countdownDays(value) {
  return Math.round((dateStringValue(value) - todayValue) / COUNTDOWN_DAY_MS);
}

function countdownWhen(days) {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 0) {
    const late = -days;
    return `${late} day${late === 1 ? '' : 's'} overdue`;
  }
  return `in ${days} days`;
}

function countdownItemAttrs(item, action = 'edit-upcoming') {
  return `data-action="${action}" data-subject-id="${escapeHtml(item.subjectId)}" data-upcoming-id="${escapeHtml(item.id)}"`;
}

function countdownNextHtml(item, days) {
  const subject = escapeHtml(item.subjectName);
  const name = escapeHtml(item.name);
  const metaParts = [subject, formatDate(item.date)];
  if (Number.isFinite(item.weight) && item.weight > 0) metaParts.push(`${item.weight}%`);
  const when = countdownWhen(days);
  const soonClass = days <= 1 ? ' is-soon' : '';
  return `<button class="countdown-next" type="button" ${countdownItemAttrs(item)} title="${subject}: ${name}, ${when}">
      <span class="countdown-tile" style="--subject-color:${item.subjectColor}">${subjectMarkHtml(item.subjectIcon, item.subjectName, item.subjectColor, 'countdown-mark')}</span>
      <span class="countdown-body">
        <span class="countdown-label">Next assessment</span>
        <span class="countdown-name">${name}</span>
        <span class="countdown-meta">${metaParts.map((part) => `<span>${part}</span>`).join(' · ')}</span>
      </span>
      <span class="countdown-when${soonClass}">${when}</span>
    </button>`;
}

function countdownThenHtml(items) {
  const links = items
    .map((item) => {
      const subject = escapeHtml(item.subjectName);
      const name = escapeHtml(item.name);
      return `<button class="countdown-then-item" type="button" ${countdownItemAttrs(item)} title="${subject}: ${name}">${subjectMarkHtml(item.subjectIcon, item.subjectName, item.subjectColor, 'countdown-then-mark')}<span class="countdown-then-name">${name}</span><span class="countdown-then-when">${countdownDays(item.date) === 1 ? 'tomorrow' : `${countdownDays(item.date)}d`}</span></button>`;
    })
    .join('');
  return `<div class="countdown-then"><span class="countdown-then-label">Then</span>${links}</div>`;
}

// "3 assessments in the next 12 days": the largest run of at least three that all fall within
// the cluster window, measured to the last one in the run.
function countdownClusterHtml(upcoming) {
  let count = 0;
  let span = 0;
  upcoming.forEach((item, index) => {
    const days = countdownDays(item.date);
    if (days <= COUNTDOWN_CLUSTER_DAYS) {
      count = index + 1;
      span = days;
    }
  });
  if (count < COUNTDOWN_CLUSTER_MIN) return '';
  const window = span <= 1 ? 'by tomorrow' : span === 7 ? 'in the next week' : `in the next ${span} days`;
  return `<p class="countdown-cluster">${iconHtml('lucide:layers', 'countdown-cluster-icon')}${count} assessments ${window}</p>`;
}

function countdownOverdueHtml(overdue) {
  const first = overdue[0];
  const days = countdownDays(first.date);
  const text = overdue.length === 1
    ? `<span class="countdown-overdue-name">${escapeHtml(first.name)}</span> is ${countdownWhen(days)}`
    : `${overdue.length} overdue assessments. <span class="countdown-overdue-name">${escapeHtml(first.name)}</span> is ${countdownWhen(days)}`;
  return `<div class="countdown-overdue">
      ${iconHtml('lucide:circle-alert', 'countdown-overdue-icon')}
      <span class="countdown-overdue-text" title="${escapeHtml(first.subjectName)}: ${escapeHtml(first.name)}">${text}</span>
      <button class="ghost-button ghost-button--small" type="button" ${countdownItemAttrs(first, 'complete-upcoming')}>Add marks</button>
    </div>`;
}

function renderExamCountdown() {
  const container = document.getElementById('exam-countdown');
  if (!container) return;

  const assessments = isUiV2()
    ? sortUpcoming(
        getUpcomingAssessments().filter(
          (item) => item.date && normalizeUpcomingType(item.type) === 'assessment'
        )
      )
    : [];
  const overdue = assessments.filter((item) => isPastDate(item.date));
  const upcoming = assessments.filter((item) => !isPastDate(item.date));

  if (!upcoming.length && !overdue.length) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  const parts = [];
  if (overdue.length) parts.push(countdownOverdueHtml(overdue));
  if (upcoming.length) {
    parts.push(countdownNextHtml(upcoming[0], countdownDays(upcoming[0].date)));
    const following = upcoming.slice(1, 3);
    if (following.length) parts.push(countdownThenHtml(following));
    parts.push(countdownClusterHtml(upcoming));
  }
  container.innerHTML = parts.join('');
  container.hidden = false;

  if (!container.dataset.bound) {
    container.dataset.bound = '1';
    container.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;
      const { subjectId, upcomingId } = target.dataset;
      if (target.dataset.action === 'complete-upcoming') {
        openAssessmentForUpcoming(subjectId, upcomingId);
      } else {
        openUpcomingEditor(subjectId, upcomingId);
      }
    });
  }
}
