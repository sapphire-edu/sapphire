// Friends-only school schedule import into the calendar.

// ---- Import a school schedule from JSON (made by the schedule-extract script) ----
// Each event is checked against the classes in your timetable: events for one of your classes
// are imported with the class and period, events with no class info are imported "vaguely",
// and events for other classes are listed but left unticked.

const SCHEDULE_IMPORT_STATUS = {
  match: { label: 'Your class', tone: 'good', checked: true },
  vague: { label: 'No class info', tone: 'neutral', checked: true },
  update: { label: 'Date changed', tone: 'good', checked: true },
  duplicate: { label: 'Already added', tone: 'muted', checked: false },
  other: { label: 'Other class', tone: 'muted', checked: false },
  alt: { label: 'Other class date', tone: 'muted', checked: false },
  approx: { label: 'Date estimated', tone: 'warn', checked: false },
  past: { label: 'Already passed', tone: 'muted', checked: false },
};

let scheduleImportPlan = null;

function importClassKey(code) {
  return String(code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function importTextKey(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function addDaysToDateKey(dateKey, days) {
  const date = parseDateKeyLocal(dateKey);
  date.setDate(date.getDate() + days);
  return dateKeyFromParts(date.getFullYear(), date.getMonth(), date.getDate());
}

function mondayKeyOf(dateKey) {
  return addDaysToDateKey(dateKey, -getDayIndexFromDateKey(dateKey));
}

// Pulls the classes and periods out of a Sentral event title, e.g.
//   "(9GeoB,D &E pd2 &9Geo1 &3 pd3)"            -> {9geob, 9geod, 9geoe} P2, {9geo1, 9geo3} P3
//   "Period 4: 9FT1001 &9FT1002"                 -> {9ft1001, 9ft1002} P4
//   "Topic Test Period 2 (all courses except 9S)" -> no classes, P2, except 9S
function parseEventClassInfo(title) {
  const text = String(title || '');
  const groups = [];
  let open = null;   // group still collecting class codes
  let before = null; // a "P4:" period announced ahead of the codes that follow
  let general = null; // a period that isn't tied to particular classes
  let last = '';     // last full class code, used to expand "&C" and "&2003"
  const re = /\b(?:p|pd|period)\s*(\d)\s*:|\b(?:pd|period|p)\s*(\d)\b|\b(9[a-z]{2,6}\d{0,4}[a-z]?)\b|[,&]\s*(\d{1,4}|[a-z])(?![a-z0-9])/gi;
  for (const m of text.matchAll(re)) {
    if (m[1] !== undefined) {
      before = Number(m[1]);
      open = null;
    } else if (m[2] !== undefined) {
      const period = Number(m[2]);
      if (open && open.period == null) {
        open.period = period;
        open = null;
      } else {
        general = period;
      }
    } else if (m[3] !== undefined) {
      if (!open) {
        open = { codes: new Set(), period: before };
        groups.push(open);
        before = null;
      }
      last = m[3];
      open.codes.add(importClassKey(last));
    } else if (m[4] !== undefined && open && last) {
      const tail = m[4];
      const digits = last.match(/^(.*?)(\d+)$/);
      if (/^\d+$/.test(tail) && digits && digits[2].length === tail.length) {
        open.codes.add(importClassKey(digits[1] + tail));
      } else if (/^[a-z]$/i.test(tail) && /[a-z]$/i.test(last)) {
        open.codes.add(importClassKey(last.slice(0, -1) + tail));
      }
    }
  }
  const exceptMatch = text.match(/except\s+([^)]*)/i);
  const except = exceptMatch
    ? exceptMatch[1].split(/[\s,&]+/).filter((t) => /^9[a-z]+$/i.test(t)).map(importClassKey)
    : [];
  return { groups: groups.filter((g) => g.codes.size), general, except };
}

// Does an event apply to one of your class codes? Returns the matching group (or {} when the
// event isn't class-specific), or null when it is for other classes.
function eventAppliesToClass(classCode, info) {
  const key = importClassKey(classCode);
  if (info.except.some((x) => key.endsWith(x.slice(1)))) return null;
  if (!info.groups.length) return {};
  return info.groups.find((g) => g.codes.has(key)) || null;
}

// subject id -> [{ code, periods }] for the classes in your timetable linked to that subject.
function buildImportClassIndex() {
  const timetable = state.data.timetable;
  const index = new Map();
  const lessons = Array.isArray(timetable?.lessons) ? timetable.lessons : [];
  lessons.forEach((lesson) => {
    const subject = resolveTimetableLessonPresentation(lesson, timetable).subject;
    const code = lesson.classCode || '';
    if (!subject || !code) return;
    const classes = index.get(subject.id) || new Map();
    const entry = classes.get(code) || { code, periods: new Set() };
    const period = String(lesson.period || '').match(/\d+/);
    if (period) entry.periods.add(Number(period[0]));
    classes.set(code, entry);
    index.set(subject.id, classes);
  });
  return new Map(Array.from(index, ([id, classes]) => [id, Array.from(classes.values())]));
}

function findSubjectForScheduleImport(jsonSubject) {
  const key = canonicalSubjectKey(jsonSubject.subject);
  let candidates = state.data.subjects.filter((subject) => canonicalSubjectKey(subject.name) === key);
  if (candidates.length > 1) {
    const wantsAccelerated = /accelerat/i.test(jsonSubject.subject);
    const same = candidates.filter((subject) => /\bacc/i.test(subject.name) === wantsAccelerated);
    if (same.length) candidates = same;
  }
  return candidates[0] || null;
}

function buildScheduleImportPlan(data) {
  const jsonSubjects = Array.isArray(data?.subjects) ? data.subjects : [];
  const now = new Date();
  const todayKey = dateKeyFromParts(now.getFullYear(), now.getMonth(), now.getDate());

  // Any dated event tells us which Monday week 1 starts on, so undated tasks can be estimated.
  let week1Monday = null;
  for (const js of jsonSubjects) {
    for (const task of js.tasks || []) {
      const ev = (task.sentral || []).find((e) => normalizeDateKey(e.date) && Number.isFinite(e.week));
      if (ev) { week1Monday = addDaysToDateKey(mondayKeyOf(ev.date), -(ev.week - 1) * 7); break; }
    }
    if (week1Monday) break;
  }

  const classIndex = buildImportClassIndex();
  const rows = [];
  const skippedSubjects = [];

  // Core and Accelerated Maths both land on your one "Maths" subject, so work out which course
  // is yours: the one whose events name one of your classes, else by the subject's name.
  const coursesBySubject = new Map();
  jsonSubjects.forEach((js) => {
    const subject = findSubjectForScheduleImport(js);
    if (!subject) return;
    if (!coursesBySubject.has(subject.id)) coursesBySubject.set(subject.id, { subject, list: [] });
    coursesBySubject.get(subject.id).list.push(js);
  });
  const ownCourse = new Map();
  coursesBySubject.forEach(({ subject, list }, id) => {
    if (list.length === 1) { ownCourse.set(id, list[0]); return; }
    const classes = classIndex.get(id) || [];
    const named = list.filter((js) => (js.tasks || [])
      .flatMap((task) => task.sentral || [])
      .some((ev) => {
        const info = parseEventClassInfo(ev.title);
        return classes.some((cls) => info.groups.some((g) => g.codes.has(importClassKey(cls.code))));
      }));
    const wantsAccelerated = /\bacc/i.test(subject.name);
    ownCourse.set(
      id,
      named.length === 1 ? named[0] : list.find((js) => /accelerat/i.test(js.subject) === wantsAccelerated) || list[0]
    );
  });

  jsonSubjects.forEach((js) => {
    const subject = findSubjectForScheduleImport(js);
    if (!subject) { skippedSubjects.push(js.subject); return; }
    const otherCourse = ownCourse.get(subject.id) !== js;
    const classes = classIndex.get(subject.id) || [];
    const existingItems = Array.isArray(subject.upcoming) ? subject.upcoming : [];

    // If every dated event for this course names specific classes and none of them is yours,
    // you're not in the course (e.g. Accelerated Maths), so don't guess dates for its other tasks.
    const courseInfos = (js.tasks || [])
      .flatMap((task) => task.sentral || [])
      .filter((ev) => normalizeDateKey(ev.date))
      .map((ev) => parseEventClassInfo(ev.title));
    const inCourse = !otherCourse
      && (!classes.length
      || !courseInfos.length
      || courseInfos.some((info) => !info.groups.length)
      || courseInfos.some((info) => classes.some((cls) => eventAppliesToClass(cls.code, info))));

    (js.tasks || []).forEach((task) => {
      const name = String(task.name || `Task ${task.task}`).trim();
      const weight = Number.isFinite(task.weight) ? task.weight : null;
      const events = (task.sentral || []).filter((e) => normalizeDateKey(e.date));
      const taskRows = [];

      const addRow = (row) => {
        const existing = existingItems.find((u) => u.importKey === row.key);
        const lookalike = !existing && existingItems.find(
          (u) => u.date === row.date && importTextKey(u.name) === importTextKey(row.name)
        );
        if (existing) row.matchedId = existing.id;
        if (existing && existing.date === row.date) {
          row.status = 'duplicate';
        } else if (existing) {
          row.status = 'update';
          row.existingId = existing.id;
          row.fromDate = existing.date;
        } else if (lookalike) {
          row.status = 'duplicate';
        } else if (row.date < todayKey) {
          row.status = 'past';
        }
        row.checked = SCHEDULE_IMPORT_STATUS[row.status].checked;
        taskRows.push(row);
      };

      if (!events.length) {
        const when = (task.when || [])[0];
        if (inCourse && week1Monday && when && Number.isFinite(when.week)) {
          addRow({
            key: `${js.id}|${task.task}|week${when.week}`,
            subjectId: subject.id, subjectName: subject.name, name, weight,
            date: addDaysToDateKey(week1Monday, (when.week - 1) * 7 + 4),
            notes: `Week ${when.week}`,
            detail: `No date in Sentral, estimated from Week ${when.week}`,
            status: 'approx',
          });
        }
      }

      events.forEach((ev) => {
        const info = parseEventClassInfo(ev.title);
        const hits = classes
          .map((cls) => ({ cls, group: eventAppliesToClass(cls.code, info) }))
          .filter((hit) => hit.group);
        const group = hits[0]?.group || {};
        const period = group.period ?? info.general ?? info.groups[0]?.period ?? null;
        let status = 'vague';
        let classLabel = '';
        if (classes.length) {
          status = hits.length ? 'match' : 'other';
          if (hits.length) classLabel = hits.map((hit) => hit.cls.code).join(', ');
        } else if (classIndex.size && info.groups.length) {
          // Your timetable has classes but none for this subject, so you aren't taking it
          // this term and an event for named classes can't be yours.
          status = 'other';
        }
        const otherCodes = info.groups.flatMap((g) => Array.from(g.codes)).map((c) => c.toUpperCase());
        const notes = [classLabel, period ? `Period ${period}` : ''].filter(Boolean).join(' · ');
        if (otherCourse) status = classes.length ? 'other' : 'alt';
        const detail = otherCourse
          ? `A different course of ${subject.name}`
          : status === 'other'
          ? `For ${otherCodes.join(', ') || 'other classes'}${period ? ` · Period ${period}` : ''}`
          : notes || (info.except.length ? `All classes except ${info.except.join(', ').toUpperCase()}` : 'All classes');
        addRow({
          key: `${js.id}|${task.task}|${importTextKey(ev.title)}`,
          subjectId: subject.id, subjectName: subject.name, name, weight,
          date: ev.date, notes,
          detail: ev.note ? `${detail} · ${ev.note}` : detail,
          title: ev.title,
          status,
        });
      });

      // With no class info, several class-specific dates for one task are alternatives: keep the first.
      const vague = taskRows.filter((r) => r.status === 'vague');
      vague.slice(1).forEach((r) => {
        r.status = 'alt';
        r.checked = false;
      });
      rows.push(...taskRows);
    });
  });

  return { rows, skippedSubjects, hasClasses: classIndex.size > 0, week1Monday };
}

function formatImportDate(dateKey) {
  const date = parseDateKeyLocal(dateKey);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

function renderScheduleImportPreview() {
  const preview = document.getElementById('schedule-import-preview');
  const submit = document.getElementById('schedule-import-submit');
  if (!preview || !submit) return;
  if (!scheduleImportPlan) {
    preview.hidden = true;
    preview.innerHTML = '';
    submit.disabled = true;
    submit.textContent = 'Import';
    return;
  }
  const { rows, skippedSubjects, hasClasses } = scheduleImportPlan;
  const groups = new Map();
  rows.forEach((row, index) => {
    if (!groups.has(row.subjectId)) groups.set(row.subjectId, { name: row.subjectName, items: [] });
    groups.get(row.subjectId).items.push({ row, index });
  });
  const notes = [];
  if (!hasClasses) notes.push('Your timetable has no classes linked to subjects yet, so events are imported without class matching.');
  if (skippedSubjects.length) notes.push(`Skipped subjects you don't have: ${skippedSubjects.join(', ')}.`);
  if (!rows.length) notes.push('Nothing in this JSON matches your subjects.');

  preview.innerHTML = `
    ${notes.map((n) => `<div class="import-summary">${escapeHtml(n)}</div>`).join('')}
    ${Array.from(groups.values()).map((group) => `
      <div class="import-group">
        <div class="import-group-title">${escapeHtml(group.name)}</div>
        ${group.items.map(({ row, index }) => {
          const status = SCHEDULE_IMPORT_STATUS[row.status];
          return `
          <label class="import-row" data-status="${row.status}" ${row.title ? `title="${escapeHtml(row.title)}"` : ''}>
            <input type="checkbox" data-import-row="${index}" ${row.checked ? 'checked' : ''} />
            <span class="import-row-date">${escapeHtml(formatImportDate(row.date))}</span>
            <span class="import-row-main">
              <span><strong>${escapeHtml(row.name)}</strong>${Number.isFinite(row.weight) ? ` <span class="import-row-weight">${row.weight}%</span>` : ''}</span>
              <small>${escapeHtml(row.status === 'update' ? `Moves from ${formatImportDate(row.fromDate)}${row.detail ? ` · ${row.detail}` : ''}` : row.detail || '')}</small>
            </span>
            <span class="import-badge" data-tone="${status.tone}">${status.label}</span>
          </label>`;
        }).join('')}
      </div>`).join('')}
  `;
  preview.hidden = false;
  updateScheduleImportCount();
}

function updateScheduleImportCount() {
  const submit = document.getElementById('schedule-import-submit');
  if (!submit || !scheduleImportPlan) return;
  const count = scheduleImportPlan.rows.filter((row) => row.checked).length;
  submit.disabled = count === 0;
  submit.textContent = count ? `Import ${count} item${count === 1 ? '' : 's'}` : 'Import';
}

function setScheduleImportMessage(text) {
  const message = document.getElementById('schedule-import-message');
  if (message) message.textContent = text || '';
}

function showScheduleImportData(data) {
  scheduleImportPlan = null;
  setScheduleImportMessage('');
  try {
    if (!Array.isArray(data?.subjects)) throw new Error('Expected an object with a "subjects" list.');
    scheduleImportPlan = buildScheduleImportPlan(data);
  } catch (error) {
    setScheduleImportMessage(`That doesn't look like a schedule JSON: ${error.message}`);
  }
  renderScheduleImportPreview();
}

function parseScheduleImportInput() {
  const input = document.getElementById('schedule-import-input');
  if (!input) return;
  const text = input.value.trim();
  selectedScheduleFile = null;
  renderScheduleSources();
  if (!text) {
    showScheduleImportData(null);
    setScheduleImportMessage('');
    return;
  }
  try {
    showScheduleImportData(JSON.parse(text));
  } catch (error) {
    scheduleImportPlan = null;
    renderScheduleImportPreview();
    setScheduleImportMessage(`That doesn't look like a schedule JSON: ${error.message}`);
  }
}

// ---- Schedules stored in Appwrite ----
// Collection `schedules` in the main database, readable only by the `friends` label (set in
// Appwrite, not here: the permission is what keeps everyone else out). Each document has a
// title, a description and `data`, the schedule JSON as a string.
const SCHEDULES_COLLECTION_ID = 'schedules';

let scheduleSources = null;

let selectedScheduleFile = null;

 // id of the picked schedule document

function isScheduleFriend() {
  return Boolean(appwriteState.enabled && appwriteState.user?.labels?.includes('friends') && appwriteDatabases);
}

async function loadScheduleSources() {
  const list = document.getElementById('schedule-import-list');
  if (list) list.innerHTML = '<div class="import-summary">Loading schedules…</div>';
  try {
    if (!isScheduleFriend()) throw new Error('not signed in as a friend');
    const { Query } = Appwrite;
    const res = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, SCHEDULES_COLLECTION_ID, [
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]);
    scheduleSources = res.documents.map((doc) => ({
      file: doc.$id,
      title: doc.title,
      description: doc.description,
      data: doc.data,
    }));
  } catch (error) {
    scheduleSources = [];
    setScheduleImportMessage(
      isScheduleFriend()
        ? "Couldn't load the schedules. You can paste a schedule JSON below instead."
        : 'Sign in with a friends account to load schedules, or paste a schedule JSON below.'
    );
    const paste = document.getElementById('schedule-import-paste');
    if (paste) paste.open = true;
  }
  renderScheduleSources();
}

function renderScheduleSources() {
  const list = document.getElementById('schedule-import-list');
  if (!list || !scheduleSources) return;
  if (!scheduleSources.length) {
    list.innerHTML = '<div class="import-summary">No schedules available.</div>';
    return;
  }
  list.innerHTML = scheduleSources.map((entry) => `
    <button class="import-source" type="button" data-schedule-file="${escapeHtml(entry.file)}"
      aria-pressed="${entry.file === selectedScheduleFile}">
      <strong>${escapeHtml(entry.title || entry.file)}</strong>
      ${entry.description ? `<small>${escapeHtml(entry.description)}</small>` : ''}
    </button>`).join('');
}

function selectScheduleSource(id) {
  selectedScheduleFile = id;
  const input = document.getElementById('schedule-import-input');
  if (input) input.value = '';
  renderScheduleSources();
  const entry = (scheduleSources || []).find((source) => source.file === id);
  try {
    showScheduleImportData(JSON.parse(entry?.data || ''));
  } catch (error) {
    scheduleImportPlan = null;
    renderScheduleImportPreview();
    setScheduleImportMessage("Couldn't read that schedule.");
  }
}

function applyScheduleImport() {
  if (!scheduleImportPlan) return;
  let added = 0;
  let updated = 0;
  scheduleImportPlan.rows.filter((row) => row.checked).forEach((row) => {
    const subject = state.data.subjects.find((s) => s.id === row.subjectId);
    if (!subject) return;
    if (!Array.isArray(subject.upcoming)) subject.upcoming = [];
    const existing = row.existingId ? subject.upcoming.find((u) => u.id === row.existingId) : null;
    if (existing) {
      existing.date = row.date;
      existing.importedDate = row.date;
      if (!Number.isFinite(existing.weight) && Number.isFinite(row.weight)) existing.weight = row.weight;
      updated += 1;
      return;
    }
    subject.upcoming.push({
      id: cryptoRandomId(),
      name: row.name,
      type: 'assessment',
      weight: row.weight,
      date: row.date,
      notes: row.notes,
      createdAt: Date.now(),
      importKey: row.key,
      importedDate: row.date,
      importedName: row.name,
    });
    added += 1;
  });
  if (added || updated) {
    saveData(state.data);
    render();
  }
  const input = document.getElementById('schedule-import-input');
  scheduleImportPlan = null;
  selectedScheduleFile = null;
  if (input) input.value = '';
  renderScheduleSources();
  renderScheduleImportPreview();
  const parts = [];
  if (added) parts.push(`added ${added}`);
  if (updated) parts.push(`moved ${updated}`);
  setScheduleImportMessage(parts.length ? `Done: ${parts.join(', ')}.` : 'Nothing was imported.');
}

let importedScheduleUpdateDone = false;

// Quietly updates exams you imported earlier when their date or task name changes in the
// schedule. Nothing is added or removed, and a date or name you edited yourself is left alone
// (importedDate / importedName remember what the import set). Exams imported before those were
// saved count as unedited. Runs once per load, after the cloud copy has been pulled.
async function autoUpdateImportedSchedules() {
  if (importedScheduleUpdateDone || !isScheduleFriend()) return;
  const hasImported = state.data.subjects.some(
    (subject) => Array.isArray(subject.upcoming) && subject.upcoming.some((item) => item.importKey)
  );
  if (!hasImported) return;
  importedScheduleUpdateDone = true;
  try {
    const { Query } = Appwrite;
    const res = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, SCHEDULES_COLLECTION_ID, [
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]);
    const handled = new Set();
    let changed = false;
    res.documents.forEach((doc) => {
      let data;
      try {
        data = JSON.parse(doc.data);
      } catch (_) {
        return;
      }
      // Newest schedule first; an exam a newer schedule already covers isn't touched by older ones.
      buildScheduleImportPlan(data).rows.filter((row) => row.matchedId).forEach((row) => {
        const subject = state.data.subjects.find((s) => s.id === row.subjectId);
        const item = subject?.upcoming?.find((u) => u.id === row.matchedId);
        if (!item || handled.has(item.id)) return;
        handled.add(item.id);
        if (row.date !== item.date && (!item.importedDate || item.importedDate === item.date)) {
          item.date = row.date;
          item.importedDate = row.date;
          changed = true;
        }
        if (row.name && row.name !== item.name && (!item.importedName || item.importedName === item.name)) {
          item.name = row.name;
          item.importedName = row.name;
          changed = true;
        }
      });
    });
    if (changed) {
      saveData(state.data);
      render();
    }
  } catch (error) {
    console.error('Could not check imported schedules for changes:', error);
  }
}

function initScheduleImport() {
  const modal = document.getElementById('schedule-import-modal');
  const openButton = document.getElementById('calendar-import');
  const input = document.getElementById('schedule-import-input');
  const preview = document.getElementById('schedule-import-preview');
  const submit = document.getElementById('schedule-import-submit');
  const list = document.getElementById('schedule-import-list');
  const paste = document.getElementById('schedule-import-paste');
  if (!modal || !openButton || !input || !preview || !submit || !list) return;

  openButton.addEventListener('click', () => {
    input.value = '';
    selectedScheduleFile = null;
    scheduleImportPlan = null;
    if (paste) paste.open = false;
    setScheduleImportMessage('');
    renderScheduleImportPreview();
    openModal(modal);
    loadScheduleSources();
  });
  list.addEventListener('click', (event) => {
    const option = event.target.closest('[data-schedule-file]');
    if (option) selectScheduleSource(option.dataset.scheduleFile);
  });
  modal.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="close-schedule-import"]')) closeModal(modal);
  });
  input.addEventListener('input', parseScheduleImportInput);
  preview.addEventListener('change', (event) => {
    const box = event.target.closest('[data-import-row]');
    if (!box || !scheduleImportPlan) return;
    scheduleImportPlan.rows[Number(box.dataset.importRow)].checked = box.checked;
    updateScheduleImportCount();
  });
  submit.addEventListener('click', applyScheduleImport);
}
