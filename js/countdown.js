// V2 dashboard: the next assessment with a countdown, as one compact row at the top of the
// Upcoming panel. Past-dated assessments and homework are left out. That assessment's own row
// is hidden from the Upcoming list below so it doesn't show twice.

const COUNTDOWN_DAY_MS = 86400000;

// Whole days from today to the item's date: 0 today, 1 tomorrow.
function countdownDays(value) {
  return Math.round((dateStringValue(value) - todayValue) / COUNTDOWN_DAY_MS);
}

function countdownWhen(days) {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

function nextCountdownAssessment() {
  if (!isUiV2()) return null;
  const upcoming = sortUpcoming(
    getUpcomingAssessments().filter(
      (item) =>
        item.date && normalizeUpcomingType(item.type) === 'assessment' && !isPastDate(item.date)
    )
  );
  return upcoming[0] || null;
}

// Hide the list row for the item the countdown already shows. The list re-renders on its own
// (See all / Show less), so this is re-applied whenever its rows change.
function syncCountdownListRow() {
  const list = document.getElementById('upcoming-list');
  const container = document.getElementById('exam-countdown');
  if (!list || !container) return;
  const shownId = container.hidden ? '' : container.dataset.upcomingId || '';
  list.querySelectorAll('.upcoming-item').forEach((row) => {
    row.classList.toggle('is-in-countdown', Boolean(shownId) && row.dataset.upcomingId === shownId);
  });
}

function renderExamCountdown() {
  const container = document.getElementById('exam-countdown');
  if (!container) return;
  const item = nextCountdownAssessment();

  if (!item) {
    container.hidden = true;
    container.innerHTML = '';
    delete container.dataset.upcomingId;
    syncCountdownListRow();
    return;
  }

  const days = countdownDays(item.date);
  const subject = escapeHtml(item.subjectName);
  const name = escapeHtml(item.name);
  const meta = [subject, formatDate(item.date)];
  if (Number.isFinite(item.weight) && item.weight > 0) meta.push(`${item.weight}%`);
  const when = countdownWhen(days);

  container.innerHTML = `<button class="countdown-next" type="button" data-subject-id="${escapeHtml(item.subjectId)}" data-upcoming-id="${escapeHtml(item.id)}" title="${subject}: ${name}, ${when}">
      ${subjectMarkHtml(item.subjectIcon, item.subjectName, item.subjectColor, 'countdown-mark')}
      <span class="countdown-body">
        <span class="countdown-name">${name}</span>
        <span class="countdown-meta">${meta.map((part) => `<span>${part}</span>`).join(' · ')}</span>
      </span>
      <span class="countdown-when${days <= 1 ? ' is-soon' : ''}">${when}</span>
    </button>`;
  container.dataset.upcomingId = String(item.id);
  container.hidden = false;
  syncCountdownListRow();

  if (!container.dataset.bound) {
    container.dataset.bound = '1';
    container.addEventListener('click', (event) => {
      const target = event.target.closest('.countdown-next');
      if (!target) return;
      openUpcomingEditor(target.dataset.subjectId, target.dataset.upcomingId);
    });
    const list = document.getElementById('upcoming-list');
    if (list) new MutationObserver(syncCountdownListRow).observe(list, { childList: true });
  }
}
