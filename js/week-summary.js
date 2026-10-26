// V2 dashboard: a one-line summary of the current week (Mon–Sun), between the stat strip
// and the Timetable card. Items open in the upcoming editor, like the Upcoming panel.

const WEEK_SUMMARY_DAY_MS = 86400000;
const WEEK_SUMMARY_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function weekSummaryPlural(count, word) {
  if (word === 'homework') return `${count} homework`;
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function weekSummaryDayLabel(value) {
  const dateValue = dateStringValue(value);
  if (dateValue === todayValue) return 'today';
  return WEEK_SUMMARY_DAYS[new Date(dateValue).getUTCDay()];
}

function weekSummaryItemHtml(item, dayText) {
  const subject = escapeHtml(item.subjectName);
  const name = escapeHtml(item.name);
  return `<button class="week-summary-item" type="button" data-action="edit-upcoming"
      data-subject-id="${escapeHtml(item.subjectId)}" data-upcoming-id="${escapeHtml(item.id)}"
      title="${subject}: ${name}">${subjectMarkHtml(item.subjectIcon, item.subjectName, item.subjectColor, 'week-summary-mark')}<span class="week-summary-name"><span class="week-summary-subject">${subject} </span>${name}</span><span class="week-summary-day">${dayText}</span></button>`;
}

function renderWeekSummary() {
  const container = document.getElementById('week-summary');
  if (!container) return;
  if (!isUiV2() || !state.data.subjects.length) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  const dayOfWeek = new Date(todayValue).getUTCDay();
  const monday = todayValue - ((dayOfWeek + 6) % 7) * WEEK_SUMMARY_DAY_MS;
  const sunday = monday + 6 * WEEK_SUMMARY_DAY_MS;

  const upcoming = sortUpcoming(getUpcomingAssessments().filter((item) => item.date));
  const isHomework = (item) => normalizeUpcomingType(item.type) === 'homework';
  // Still to come this week: today through Sunday. Earlier homework counts as overdue instead.
  const dueThisWeek = upcoming.filter((item) => {
    const value = dateStringValue(item.date);
    return value >= todayValue && value <= sunday;
  });
  const overdue = upcoming.filter((item) => isHomework(item) && isPastDate(item.date));
  const marksThisWeek = getAllAssessments().filter((item) => {
    const value = dateStringValue(item.date);
    return value >= monday && value <= todayValue;
  }).length;

  const parts = [];
  if (dueThisWeek.length) {
    const assessments = dueThisWeek.filter((item) => !isHomework(item));
    const homework = dueThisWeek.length - assessments.length;
    const counts = [];
    if (assessments.length) counts.push(weekSummaryPlural(assessments.length, 'assessment'));
    if (homework) counts.push(weekSummaryPlural(homework, 'homework'));
    parts.push(`<span class="week-summary-counts">${counts.join(', ')}</span>`);
    // Name the next assessment if there is one, otherwise the next homework.
    const next = assessments[0] || dueThisWeek[0];
    parts.push(weekSummaryItemHtml(next, weekSummaryDayLabel(next.date)));
  } else {
    parts.push('<span class="week-summary-counts is-calm">Nothing due</span>');
    const next = upcoming.find((item) => dateStringValue(item.date) > sunday);
    if (next) {
      const dateText = `${WEEK_SUMMARY_DAYS[new Date(dateStringValue(next.date)).getUTCDay()]} ${formatDate(next.date)}`;
      parts.push(`<span class="week-summary-next">Next${weekSummaryItemHtml(next, dateText)}</span>`);
    }
  }
  if (overdue.length) {
    const first = overdue[0];
    parts.push(`<button class="week-summary-overdue" type="button" data-action="edit-upcoming"
      data-subject-id="${escapeHtml(first.subjectId)}" data-upcoming-id="${escapeHtml(first.id)}"
      title="${escapeHtml(first.subjectName)}: ${escapeHtml(first.name)}">${overdue.length} overdue</button>`);
  }
  if (marksThisWeek) {
    parts.push(`<span class="week-summary-marks">${weekSummaryPlural(marksThisWeek, 'mark')} logged</span>`);
  }

  container.innerHTML = `${iconHtml('lucide:calendar-days', 'week-summary-icon')}<span class="week-summary-label">This week</span><span class="week-summary-parts">${parts
    .map((part) => `<span class="week-summary-part">${part}</span>`)
    .join('')}</span>`;
  container.hidden = false;

  if (!container.dataset.bound) {
    container.dataset.bound = '1';
    container.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action="edit-upcoming"]');
      if (!target) return;
      openUpcomingEditor(target.dataset.subjectId, target.dataset.upcomingId);
    });
  }
}
