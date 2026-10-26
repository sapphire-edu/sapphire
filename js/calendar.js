// Calendar tab.

const calendarState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  filter: 'both',
  // V2 only: the day shown in the agenda panel (YYYY-MM-DD).
  selected: null,
};

// V2 calendar: Today button, Add button and the selected-day agenda panel.
const calendarTodayButton = document.getElementById('calendar-today');

const calendarAddButton = document.getElementById('calendar-add');

const calendarAgenda = document.getElementById('calendar-agenda');

function renderCalendar() {
  if (!elements.calendarGrid || !elements.calendarMonth) return;
  const year = calendarState.year;
  const month = calendarState.month;
  const activeFilter = ['assessment', 'homework', 'both'].includes(calendarState.filter)
    ? calendarState.filter
    : 'both';
  elements.calendarMonth.textContent = formatMonthYear(year, month);

  if (elements.calendarTypeFilters.length > 0) {
    elements.calendarTypeFilters.forEach((button) => {
      const isActive = button.dataset.calendarTypeFilter === activeFilter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  if (isUiV2()) {
    renderCalendarV2(year, month, activeFilter);
    return;
  }

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
    const allEvents = eventsByDate[dateKey] || [];
    const events = activeFilter === 'both'
      ? allEvents
      : allEvents.filter((event) => event.upcomingType === activeFilter);
    const dayLabel = displayDay.toString();
    const isToday = dateKey === today;

    const eventsHtml = events.length
      ? `
        <div class="calendar-events">
          ${events
            .slice(0, 3)
            .map(
              (event) => {
                const upcomingType = event.upcomingType === 'homework' ? 'homework' : 'assessment';
                const typeLabel = upcomingType === 'homework' ? 'Homework' : 'Assessment';
                const typeIcon = event.upcomingType === 'homework'
                  ? iconHtml('notebook', 'calendar-event-type-icon')
                  : iconHtml('file-text', 'calendar-event-type-icon');
                const isEditableUpcoming = event.type === 'upcoming';
                return `
                <button
                  class="calendar-event is-${upcomingType}${event.type === 'completed' ? ' is-completed' : ''}"
                  type="button"
                  style="--event-color:${event.color}"
                  ${isEditableUpcoming ? `data-action="edit-upcoming" data-subject-id="${event.subjectId}" data-upcoming-id="${event.upcomingId}"` : 'disabled'}
                >
                  <span class="calendar-event-title">${typeIcon}${event.name}</span>
                  ${activeFilter === 'both' ? `<span class="calendar-event-tag">${typeLabel}</span>` : ''}
                  <span class="calendar-event-sub">${event.subject}</span>
                </button>
              `;
              }
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

// ── V2 calendar: month grid (chips on desktop, dots on phones) + selected-day agenda ──

function calendarDateFromKey(dateKey) {
  const [y, m, d] = String(dateKey || '').split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function calendarRelativeDayLabel(dateKey) {
  const diff = Math.round((dateStringValue(dateKey) - todayValue) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return diff > 0 ? `In ${diff} days` : `${-diff} days ago`;
}

function selectCalendarDay(dateKey, options = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ''))) return;
  const date = calendarDateFromKey(dateKey);
  calendarState.year = date.getFullYear();
  calendarState.month = date.getMonth();
  calendarState.selected = dateKey;
  renderCalendar();
  if (options.focus && elements.calendarGrid) {
    elements.calendarGrid.querySelector(`.calendar-v2-day[data-calendar-date="${dateKey}"]`)?.focus();
  }
}

function openCalendarAddUpcoming(dateKey) {
  openUpcomingModal();
  const dateInput = elements.upcomingForm?.querySelector('input[name="upcomingDate"]');
  if (dateInput && dateKey && elements.upcomingModal?.classList.contains('is-open')) {
    dateInput.value = dateKey;
  }
}

function calendarEventTypeLabel(event) {
  return event.upcomingType === 'homework' ? 'Homework' : 'Assessment';
}

// The subject's own icon marks each event in the chips, agenda and "Coming up" list. The tiny
// phone-grid dots stay dots, they're too small to hold an icon.
function calendarSubjectIconHtml(event, className = 'calendar-v2-subject-icon') {
  return iconHtml(resolveSubjectIcon(event.icon, event.subject), className);
}

// Busy weeks (V2): a Mon–Sun week with two or more upcoming assessments due. Homework and
// marked results don't make a week busy; homework is only mentioned alongside.
const CALENDAR_BUSY_WEEK_MIN = 2;

function calendarWeekStartKey(dateKey) {
  const date = calendarDateFromKey(dateKey);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return dateKeyFromParts(date.getFullYear(), date.getMonth(), date.getDate());
}

// Busy weeks keyed by their Monday. Weeks that ended before today are left out.
function buildCalendarBusyWeeks(eventsByDate) {
  const weeks = {};
  Object.keys(eventsByDate).forEach((dateKey) => {
    eventsByDate[dateKey].forEach((event) => {
      if (event.type !== 'upcoming') return;
      const startKey = calendarWeekStartKey(dateKey);
      const week = weeks[startKey] || (weeks[startKey] = { assessments: 0, homework: 0, weight: 0, allWeighted: true });
      if (event.upcomingType === 'homework') {
        week.homework += 1;
        return;
      }
      week.assessments += 1;
      if (Number.isFinite(event.weight)) week.weight += event.weight;
      else week.allWeighted = false;
    });
  });
  const busy = {};
  Object.keys(weeks).forEach((startKey) => {
    const week = weeks[startKey];
    if (week.assessments < CALENDAR_BUSY_WEEK_MIN) return;
    const end = calendarDateFromKey(startKey);
    end.setDate(end.getDate() + 6);
    if (dateKeyFromParts(end.getFullYear(), end.getMonth(), end.getDate()) < today) return;
    busy[startKey] = week;
  });
  return busy;
}

// "2 assessments · 45%": the weighting only shows when every assessment in the week has one.
function calendarBusyWeekDetail(week) {
  const parts = [`${week.assessments} assessments`];
  if (week.allWeighted && week.weight > 0) parts.push(`${Math.round(week.weight * 10) / 10}% weighting`);
  return parts.join(' · ');
}

function calendarBusyWeekTitle(week) {
  const homework = week.homework ? `, plus ${week.homework} homework` : '';
  return `Busy week: ${calendarBusyWeekDetail(week)}${homework}`;
}

function buildCalendarBusyLabelV2(week) {
  return `
    <span class="calendar-v2-busy" title="${escapeHtml(calendarBusyWeekTitle(week))}">
      ${iconHtml('lucide:layers', 'calendar-v2-busy-icon')}
      <span class="calendar-v2-busy-text">Busy<span class="calendar-v2-busy-week"> week</span> · ${week.assessments}<span class="calendar-v2-busy-long"> assessments</span></span>
    </span>
  `;
}

function buildCalendarChipV2(event, dateKey) {
  const type = event.upcomingType === 'homework' ? 'homework' : 'assessment';
  const isCompleted = event.type === 'completed';
  const isOverdue = !isCompleted && type === 'homework' && isPastDate(dateKey);
  const classes = `calendar-event calendar-v2-chip is-${type}${isCompleted ? ' is-completed' : ''}${isOverdue ? ' is-overdue' : ''}`;
  const actionAttrs = isCompleted
    ? ''
    : `data-action="edit-upcoming" data-subject-id="${escapeHtml(event.subjectId)}" data-upcoming-id="${escapeHtml(event.upcomingId)}"`;
  const title = `${event.name} · ${event.subject} · ${isCompleted ? 'Marked' : calendarEventTypeLabel(event)}`;
  return `
    <button class="${classes}" type="button" style="--event-color:${escapeHtml(event.color)}" data-calendar-date="${dateKey}" ${actionAttrs} title="${escapeHtml(title)}">
      ${isCompleted ? iconHtml('check', 'calendar-v2-chip-icon') : calendarSubjectIconHtml(event)}
      <span class="calendar-v2-chip-name">${escapeHtml(event.name)}</span>
    </button>
  `;
}

function buildCalendarAgendaItemV2(event, dateKey) {
  const type = event.upcomingType === 'homework' ? 'homework' : 'assessment';
  const isCompleted = event.type === 'completed';
  const isOverdue = !isCompleted && type === 'homework' && isPastDate(dateKey);
  const metaParts = [`<span class="calendar-v2-agenda-subject">${escapeHtml(event.subject)}</span>`, calendarEventTypeLabel(event)];
  if (Number.isFinite(event.weight)) metaParts.push(`${event.weight}%`);
  const badge = isCompleted
    ? `<span class="calendar-v2-badge is-done">${iconHtml('check', '')}Marked</span>`
    : isOverdue
      ? '<span class="calendar-v2-badge is-overdue">Overdue</span>'
      : '';
  const mainAttrs = isCompleted
    ? `data-action="calendar-open-subject" data-subject-id="${escapeHtml(event.subjectId)}" title="Open ${escapeHtml(event.subject)}"`
    : `data-action="edit-upcoming" data-subject-id="${escapeHtml(event.subjectId)}" data-upcoming-id="${escapeHtml(event.upcomingId)}" title="Edit"`;
  const actionHtml = !isCompleted && type === 'assessment'
    ? `<button class="ghost-button ghost-button--small" type="button" data-action="complete-upcoming" data-subject-id="${escapeHtml(event.subjectId)}" data-upcoming-id="${escapeHtml(event.upcomingId)}">Add marks</button>`
    : '';
  return `
    <li class="calendar-v2-agenda-item is-${type}${isCompleted ? ' is-completed' : ''}" style="--event-color:${escapeHtml(event.color)}">
      <button class="calendar-v2-agenda-main" type="button" ${mainAttrs}>
        <span class="calendar-v2-agenda-mark" aria-hidden="true">${calendarSubjectIconHtml(event, '')}</span>
        <span class="calendar-v2-agenda-text">
          <span class="calendar-v2-agenda-name">${escapeHtml(event.name)}${badge}</span>
          <span class="calendar-v2-agenda-meta">${metaParts.join('<span aria-hidden="true"> · </span>')}</span>
          ${event.notes ? `<span class="calendar-v2-agenda-notes">${escapeHtml(event.notes)}</span>` : ''}
        </span>
      </button>
      ${actionHtml ? `<div class="calendar-v2-agenda-actions">${actionHtml}</div>` : ''}
    </li>
  `;
}

function buildCalendarAgendaV2(selected, eventsByDate, filterEvents, busyWeeks = {}) {
  const date = calendarDateFromKey(selected);
  const heading = date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
  const items = filterEvents(eventsByDate[selected] || []);
  const isToday = selected === today;
  const kicker = items.length
    ? `${calendarRelativeDayLabel(selected)} · ${items.length} item${items.length === 1 ? '' : 's'}`
    : calendarRelativeDayLabel(selected);

  const nextUp = [];
  Object.keys(eventsByDate)
    .filter((key) => key > selected)
    .sort()
    .some((key) => {
      filterEvents(eventsByDate[key])
        .filter((event) => event.type === 'upcoming')
        .forEach((event) => nextUp.push({ event, dateKey: key }));
      return nextUp.length >= 4;
    });

  const listHtml = items.length
    ? `<ul class="calendar-v2-agenda-list">${items.map((event) => buildCalendarAgendaItemV2(event, selected)).join('')}</ul>`
    : `
      <div class="calendar-v2-agenda-empty">
        <span>Nothing due.</span>
        <button class="ghost-button ghost-button--small with-icon" type="button" data-action="calendar-add-on-day" data-calendar-date="${selected}">${iconHtml('plus')}Add item</button>
      </div>
    `;

  const shownBusyWeeks = new Set();
  const nextHtml = nextUp.length
    ? `
      <div class="calendar-v2-next">
        <div class="calendar-v2-next-title">Coming up</div>
        <ul class="calendar-v2-next-list">
          ${nextUp.slice(0, 4).map(({ event, dateKey }) => {
            const d = calendarDateFromKey(dateKey);
            const weekKey = calendarWeekStartKey(dateKey);
            const busyWeek = busyWeeks[weekKey] && !shownBusyWeeks.has(weekKey) ? busyWeeks[weekKey] : null;
            if (busyWeek) shownBusyWeeks.add(weekKey);
            const busyHtml = busyWeek
              ? `<li class="calendar-v2-next-busy" title="${escapeHtml(calendarBusyWeekTitle(busyWeek))}">${iconHtml('lucide:layers', 'calendar-v2-busy-icon')}<span>Busy week of ${calendarDateFromKey(weekKey).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} · ${calendarBusyWeekDetail(busyWeek)}</span></li>`
              : '';
            return `
              ${busyHtml}
              <li>
                <button class="calendar-v2-next-item" type="button" data-calendar-date="${dateKey}" style="--event-color:${escapeHtml(event.color)}">
                  <span class="calendar-v2-next-date">
                    <span>${d.toLocaleDateString('en-AU', { weekday: 'short' })}</span>
                    <strong>${d.getDate()}</strong>
                  </span>
                  ${calendarSubjectIconHtml(event, `calendar-v2-subject-icon calendar-v2-next-icon${event.upcomingType === 'homework' ? ' is-homework' : ''}`)}
                  <span class="calendar-v2-next-text">
                    <span class="calendar-v2-next-name">${escapeHtml(event.name)}</span>
                    <span class="calendar-v2-next-meta">${escapeHtml(event.subject)} · ${calendarRelativeDayLabel(dateKey)}</span>
                  </span>
                </button>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `
    : '';

  return `
    <div class="calendar-v2-agenda-head">
      <div>
        <div class="calendar-v2-agenda-kicker${isToday ? ' is-today' : ''}">${kicker}</div>
        <h3 class="calendar-v2-agenda-title">${heading}</h3>
      </div>
      ${items.length ? `<button class="icon-button" type="button" data-action="calendar-add-on-day" data-calendar-date="${selected}" aria-label="Add item on ${heading}" title="Add item">${iconHtml('plus')}</button>` : ''}
    </div>
    ${listHtml}
    ${nextHtml}
  `;
}

function renderCalendarV2(year, month, activeFilter) {
  const eventsByDate = buildCalendarEvents();
  const filterEvents = (list) => (activeFilter === 'both' ? list : list.filter((event) => event.upcomingType === activeFilter));
  const monthPrefix = dateKeyFromParts(year, month, 1).slice(0, 7);
  if (!calendarState.selected || calendarState.selected.slice(0, 7) !== monthPrefix) {
    calendarState.selected = today.slice(0, 7) === monthPrefix ? today : dateKeyFromParts(year, month, 1);
  }
  const selected = calendarState.selected;

  const titleEl = document.getElementById('calendar-v2-title');
  if (titleEl) titleEl.textContent = formatMonthYear(year, month);

  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((startOffset + daysInMonth) / 7);
  let dueAssessments = 0;
  let dueHomework = 0;
  let marked = 0;
  const cells = [];
  // Busy weeks are about assessments, so the Homework filter hides them.
  const busyWeeks = activeFilter === 'homework' ? {} : buildCalendarBusyWeeks(eventsByDate);
  let busyWeekCount = 0;
  let busyWeek = null;

  for (let index = 0; index < weeks * 7; index += 1) {
    const cellDate = new Date(year, month, index - startOffset + 1);
    const dateKey = dateKeyFromParts(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
    const isWeekStart = index % 7 === 0;
    if (isWeekStart) {
      busyWeek = busyWeeks[dateKey] || null;
      if (busyWeek) busyWeekCount += 1;
    }
    const isMuted = cellDate.getMonth() !== month;
    const isToday = dateKey === today;
    const isSelected = dateKey === selected;
    const isWeekend = index % 7 >= 5;
    const events = filterEvents(eventsByDate[dateKey] || []);

    if (!isMuted) {
      events.forEach((event) => {
        if (event.type === 'completed') marked += 1;
        else if (event.upcomingType === 'homework') dueHomework += 1;
        else dueAssessments += 1;
      });
    }

    const visible = events.length > 3 ? events.slice(0, 2) : events;
    const moreCount = events.length - visible.length;
    const dayLabel = cellDate.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
    const busyAria = busyWeek && isWeekStart ? `, ${calendarBusyWeekTitle(busyWeek).replace(':', ',')}` : '';
    const ariaLabel = `${dayLabel}${isToday ? ', today' : ''}${events.length ? `, ${events.length} item${events.length === 1 ? '' : 's'}` : ''}${busyAria}`;

    cells.push(`
      <div class="calendar-cell calendar-v2-cell${isMuted ? ' is-muted' : ''}${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}${isWeekend ? ' is-weekend' : ''}${events.length ? ' has-events' : ''}${busyWeek ? ' is-busy-week' : ''}" data-calendar-date="${dateKey}">
        <button class="calendar-day calendar-v2-day" type="button" data-calendar-date="${dateKey}" aria-label="${ariaLabel}" aria-pressed="${isSelected ? 'true' : 'false'}" tabindex="${isSelected ? '0' : '-1'}">${cellDate.getDate()}</button>
        ${busyWeek && isWeekStart ? buildCalendarBusyLabelV2(busyWeek) : ''}
        ${events.length ? `
          <div class="calendar-events calendar-v2-events">
            ${visible.map((event) => buildCalendarChipV2(event, dateKey)).join('')}
            ${moreCount > 0 ? `<button class="calendar-more calendar-v2-more" type="button" data-calendar-date="${dateKey}">+${moreCount} more</button>` : ''}
          </div>
          <div class="calendar-v2-dots" aria-hidden="true">
            ${events.slice(0, 3).map((event) => `<span class="calendar-v2-chip-dot is-${event.upcomingType === 'homework' ? 'homework' : 'assessment'}${event.type === 'completed' ? ' is-completed' : ''}" style="--event-color:${escapeHtml(event.color)}"></span>`).join('')}
            ${events.length > 3 ? `<span class="calendar-v2-dots-more">+${events.length - 3}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `);
  }

  elements.calendarGrid.innerHTML = cells.join('');

  const summaryEl = document.getElementById('calendar-v2-summary');
  if (summaryEl) {
    const parts = [];
    if (dueAssessments) parts.push(`${dueAssessments} assessment${dueAssessments === 1 ? '' : 's'}`);
    if (dueHomework) parts.push(`${dueHomework} homework`);
    let text = parts.length ? `${parts.join(' and ')} due` : 'Nothing due';
    if (marked) text += ` · ${marked} marked`;
    text += ' this month';
    if (busyWeekCount) text += ` · ${busyWeekCount} busy week${busyWeekCount === 1 ? '' : 's'}`;
    summaryEl.textContent = text;
  }

  const agendaEl = document.getElementById('calendar-agenda');
  if (agendaEl) agendaEl.innerHTML = buildCalendarAgendaV2(selected, eventsByDate, filterEvents, busyWeeks);
}

function formatMonthYear(year, month) {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
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
      icon: item.subjectIcon,
      subjectId: item.subjectId,
      upcomingId: item.id,
      upcomingType: normalizeUpcomingType(item.type),
      notes: item.notes || '',
      weight: Number.isFinite(item.weight) ? item.weight : null,
      dueDate: item.date,
    });
  });

  sortAssessments(getAllAssessments()).forEach((assessment) => {
    addEvent(assessment.date, {
      type: 'completed',
      name: assessment.name,
      subject: assessment.subjectName,
      color: assessment.subjectColor || 'var(--accent)',
      icon: assessment.subjectIcon,
      subjectId: assessment.subjectId,
      upcomingId: '',
      upcomingType: 'assessment',
      notes: '',
      weight: Number.isFinite(assessment.weight) ? assessment.weight : null,
      dueDate: assessment.date,
    });
  });

  Object.values(eventsByDate).forEach((items) => {
    items.sort((a, b) => {
      const order = a.type === b.type ? 0 : a.type === 'upcoming' ? -1 : 1;
      if (order !== 0) return order;
      const typeDiff = upcomingTypePriority(a.upcomingType) - upcomingTypePriority(b.upcomingType);
      if (typeDiff !== 0) return typeDiff;
      return a.name.localeCompare(b.name);
    });
  });

  return eventsByDate;
}

function bindCalendarEvents() {
  if (elements.calendarGrid) {
    elements.calendarGrid.addEventListener('click', (event) => {
      const actionTarget = event.target.closest('[data-action="edit-upcoming"]');
      if (!actionTarget) {
        // V2: clicking a day (or its "+N more" / a logged mark) selects it for the agenda panel.
        const dayTarget = isUiV2() ? event.target.closest('[data-calendar-date]') : null;
        if (dayTarget) selectCalendarDay(dayTarget.dataset.calendarDate);
        return;
      }
      const subjectId = actionTarget.dataset.subjectId;
      const upcomingId = actionTarget.dataset.upcomingId;
      if (isUiV2() && actionTarget.dataset.calendarDate) {
        calendarState.selected = actionTarget.dataset.calendarDate;
        renderCalendar();
      }
      openUpcomingEditor(subjectId, upcomingId);
    });
    // V2: arrow keys move the selected day while a day number has focus.
    elements.calendarGrid.addEventListener('keydown', (event) => {
      if (!isUiV2()) return;
      const dayButton = event.target.closest('.calendar-v2-day');
      if (!dayButton) return;
      const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (!(event.key in steps)) return;
      event.preventDefault();
      const [y, m, d] = dayButton.dataset.calendarDate.split('-').map(Number);
      const next = new Date(y, m - 1, d + steps[event.key]);
      selectCalendarDay(dateKeyFromParts(next.getFullYear(), next.getMonth(), next.getDate()), { focus: true });
    });
  }

  if (elements.calendarTypeFilters.length > 0) {
    elements.calendarTypeFilters.forEach((button) => {
      button.addEventListener('click', () => {
        const nextFilter = button.dataset.calendarTypeFilter;
        if (!['assessment', 'homework', 'both'].includes(nextFilter)) return;
        calendarState.filter = nextFilter;
        renderCalendar();
      });
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

  if (calendarTodayButton) {
    calendarTodayButton.addEventListener('click', () => selectCalendarDay(today));
  }

  if (calendarAddButton) {
    calendarAddButton.addEventListener('click', () => {
      const selected = calendarState.selected;
      openCalendarAddUpcoming(selected && dateStringValue(selected) >= todayValue ? selected : today);
    });
  }

  if (calendarAgenda) {
    calendarAgenda.addEventListener('click', (event) => {
      const actionTarget = event.target.closest('[data-action]');
      if (actionTarget) {
        const { action, subjectId, upcomingId } = actionTarget.dataset;
        if (action === 'edit-upcoming') openUpcomingEditor(subjectId, upcomingId);
        if (action === 'complete-upcoming') openAssessmentForUpcoming(subjectId, upcomingId);
        if (action === 'calendar-open-subject') openSubjectModal(subjectId);
        if (action === 'calendar-add-on-day') openCalendarAddUpcoming(actionTarget.dataset.calendarDate);
        return;
      }
      const dayTarget = event.target.closest('[data-calendar-date]');
      if (dayTarget) selectCalendarDay(dayTarget.dataset.calendarDate);
    });
  }
}
