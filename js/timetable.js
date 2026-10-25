// Timetable tab, ICS import and the today panel.

let timetableTodayProgressInterval = null;

let activeTimetableClassKey = null;

// The today panel appears on the dashboard and at the top of the timetable tab.
function isDashboardTabActive() {
  return Array.from(elements.views || []).some(
    (view) => ['dashboard', 'timetable'].includes(view.dataset.view) && view.classList.contains('is-active')
  );
}

function getTodayPanelTargets() {
  return [
    { list: elements.timetableTodayList, title: elements.timetableTodayTitle },
    { list: elements.timetableTabTodayList, title: elements.timetableTabTodayTitle },
  ].filter((target) => target.list && target.title);
}

function startTimetableTodayProgressTicker() {
  if (timetableTodayProgressInterval) return;
  timetableTodayProgressInterval = window.setInterval(() => {
    if (document.hidden || !isDashboardTabActive()) return;
    renderTodayTimetablePanelFromState();
  }, 1000);
}

function stopTimetableTodayProgressTicker() {
  if (!timetableTodayProgressInterval) return;
  clearInterval(timetableTodayProgressInterval);
  timetableTodayProgressInterval = null;
}

function syncTimetableTodayProgressTicker() {
  if (!elements.timetableTodayList) return;
  const hasLessons = normalizeTimetableData(state.data.timetable).lessons.length > 0;
  if (document.hidden || !isDashboardTabActive() || !hasLessons) {
    stopTimetableTodayProgressTicker();
    return;
  }
  startTimetableTodayProgressTicker();
  renderTodayTimetablePanelFromState();
}

function renderTodayTimetablePanelFromState() {
  if (!elements.timetableTodayList) return;
  const timetable = normalizeTimetableData(state.data.timetable);
  const currentWeekType = getCurrentTimetableWeekType(timetable);
  renderTodayTimetablePanel(timetable, currentWeekType, new Date());
}

function setTimetableClassMessage(message) {
  if (!elements.timetableClassMessage) return;
  elements.timetableClassMessage.textContent = message || '';
}

function buildTimetableClassColorSwatches(selectedColor) {
  const activeColor = normalizeColorValue(selectedColor).toLowerCase();
  return palette
    .map((color) => {
      const activeClass = color.toLowerCase() === activeColor ? ' is-active' : '';
      return `
        <button
          class="color-swatch${activeClass}"
          type="button"
          data-action="set-timetable-class-color"
          data-color="${color}"
          style="--swatch:${color}"
          aria-label="Set class color to ${color}"
        ></button>
      `;
    })
    .join('');
}

function setTimetableClassColor(color) {
  if (!elements.timetableClassColor) return;
  const normalized = normalizeColorValue(color)
    || normalizeColorValue(elements.timetableClassColor.value)
    || palette[0];
  elements.timetableClassColor.value = normalized;
  if (elements.timetableClassColorValue) {
    elements.timetableClassColorValue.textContent = normalized.toUpperCase();
  }
  if (elements.timetableClassSwatches) {
    elements.timetableClassSwatches.innerHTML = buildTimetableClassColorSwatches(normalized);
  }
  if (elements.timetableClassIconPreview) {
    elements.timetableClassIconPreview.style.background = normalized;
  }
}

function setTimetableClassIcon(icon) {
  if (!elements.timetableClassIcon) return;
  const fallbackName = String(elements.timetableClassName?.value || '').trim() || 'Class';
  const resolved = resolveSubjectIcon(icon, fallbackName);
  elements.timetableClassIcon.value = resolved;
  if (elements.timetableClassIconPreview) {
    elements.timetableClassIconPreview.innerHTML = subjectIconHtml(resolved, '');
  }
  const carousel = elements.timetableClassIconCarousel?.querySelector('[data-icon-carousel]');
  setIconCarouselActive(carousel, resolved);
}

function updateTimetableClassModalState() {
  const subjectId = String(elements.timetableClassSubject?.value || '').trim();
  const linkedSubject = subjectId
    ? state.data.subjects.find((subject) => subject.id === subjectId) || null
    : null;
  const isLinked = Boolean(linkedSubject);
  const customColor = normalizeColorValue(elements.timetableClassColor?.value) || palette[0];
  const customIcon = normalizeSubjectIcon(elements.timetableClassIcon?.value) || resolveSubjectIcon('', 'Class');
  const displayColor = linkedSubject?.color || customColor;
  const displayIcon = linkedSubject
    ? resolveSubjectIcon(linkedSubject.icon, linkedSubject.name)
    : customIcon;

  if (elements.timetableClassName) {
    elements.timetableClassName.disabled = isLinked;
  }
  if (isUiV2()) {
    // V2: header meta follows the subject picker.
    if (elements.timetableClassMeta) {
      elements.timetableClassMeta.textContent = linkedSubject
        ? `Linked to ${linkedSubject.name}`
        : 'Not linked · custom style';
    }
  }
  if (elements.timetableClassCustomize) {
    elements.timetableClassCustomize.classList.toggle('is-locked', isLinked);
  }
  if (elements.timetableClassForm) {
    elements.timetableClassForm.classList.toggle('is-linked-lock', isLinked);
  }
  if (elements.timetableClassLockNote) {
    if (isLinked) {
      elements.timetableClassLockNote.hidden = false;
      elements.timetableClassLockNote.textContent = 'Set "No subject link" to edit custom name, color, and icon. Linked classes always use the subject style.';
    } else {
      elements.timetableClassLockNote.hidden = true;
      elements.timetableClassLockNote.textContent = '';
    }
  }
  if (elements.timetableClassColor) {
    elements.timetableClassColor.disabled = isLinked;
  }
  if (elements.timetableClassSwatches) {
    elements.timetableClassSwatches.querySelectorAll('[data-action="set-timetable-class-color"]').forEach((button) => {
      button.disabled = isLinked;
    });
  }
  if (elements.timetableClassIconCarousel) {
    elements.timetableClassIconCarousel.classList.toggle('is-disabled', isLinked);
    elements.timetableClassIconCarousel.querySelectorAll('button').forEach((button) => {
      button.disabled = isLinked;
    });
  }
  if (elements.timetableClassIconPreview) {
    elements.timetableClassIconPreview.style.background = displayColor;
    elements.timetableClassIconPreview.innerHTML = subjectIconHtml(displayIcon, '');
  }
}

function openTimetableClassModal(mapKey) {
  const timetable = normalizeTimetableData(state.data.timetable);
  const rows = getTimetableClassRows(timetable.lessons || []);
  const row = rows.find((item) => item.key === mapKey);
  if (!row || !elements.timetableClassModal || !elements.timetableClassForm) return;
  activeTimetableClassKey = mapKey;
  const profile = getTimetableClassProfile(mapKey, timetable);
  const subjectId = profile.subjectId && profile.subjectId !== '__none__' ? profile.subjectId : '';
  const linkedSubject = subjectId
    ? state.data.subjects.find((subject) => subject.id === subjectId) || null
    : null;
  const customName = profile.name || '';
  const customColor = profile.color || getTimetableClassDefaultColor(row);
  const customIcon = profile.icon || resolveSubjectIcon('', customName || row.subject || 'Class');
  const subjectOptions = state.data.subjects
    .map((subject) => `<option value="${escapeHtml(subject.id)}">${escapeHtml(subject.name)}</option>`)
    .join('');

  if (elements.timetableClassTitle) {
    elements.timetableClassTitle.textContent = row.label;
  }
  if (elements.timetableClassMeta) {
    elements.timetableClassMeta.textContent = linkedSubject
      ? `Linked to ${linkedSubject.name}`
      : 'Custom class style';
  }
  if (elements.timetableClassKey) {
    elements.timetableClassKey.value = mapKey;
  }
  if (elements.timetableClassSubject) {
    elements.timetableClassSubject.innerHTML = `
      <option value="">No subject link</option>
      ${subjectOptions}
    `;
    elements.timetableClassSubject.value = linkedSubject?.id || '';
  }
  if (elements.timetableClassName) {
    elements.timetableClassName.value = customName || linkedSubject?.name || '';
  }
  if (elements.timetableClassIconCarousel) {
    elements.timetableClassIconCarousel.innerHTML = buildIconCarousel({
      selectedIcon: customIcon,
      action: 'set-timetable-class-icon',
      otherAction: 'set-timetable-class-icon-other',
      ariaLabel: 'Class icon options',
    });
  }
  setTimetableClassIcon(customIcon);
  setTimetableClassColor(customColor);
  updateTimetableClassModalState();
  setTimetableClassMessage('');
  openModal(elements.timetableClassModal);
  requestAnimationFrame(() => {
    elements.timetableClassSubject?.focus();
  });
}

function closeTimetableClassModal() {
  activeTimetableClassKey = null;
  closeModal(elements.timetableClassModal);
  setTimetableClassMessage('');
}

function normalizeTimetableData(raw) {
  const fallback = createEmptyTimetableData();
  if (!raw || typeof raw !== 'object') return fallback;
  const lessons = Array.isArray(raw.lessons) ? raw.lessons : [];
  const subjectMapInput = raw.subjectMap && typeof raw.subjectMap === 'object' ? raw.subjectMap : {};
  const classProfilesInput = raw.classProfiles && typeof raw.classProfiles === 'object'
    ? raw.classProfiles
    : {};
  const normalizedLessons = lessons
    .map((lesson) => {
      if (!lesson || typeof lesson !== 'object') return null;
      const dateKey = normalizeDateKey(lesson.dateKey);
      if (!dateKey) return null;
      const startMinutes = Number(lesson.startMinutes);
      const endMinutes = Number(lesson.endMinutes);
      if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) return null;
      const dayIndex = Number(lesson.dayIndex);
      const normalizedDayIndex = Number.isFinite(dayIndex)
        ? clamp(Math.floor(dayIndex), 0, 6)
        : getDayIndexFromDateKey(dateKey);
      const weekType = lesson.weekType === 'B' ? 'B' : 'A';
      return {
        id: String(lesson.id || cryptoRandomId()),
        dateKey,
        dayIndex: normalizedDayIndex,
        weekType,
        startMinutes: clamp(Math.round(startMinutes), 0, 24 * 60 - 1),
        endMinutes: Math.max(
          clamp(Math.round(startMinutes), 0, 24 * 60 - 1) + 5,
          clamp(Math.round(endMinutes), 0, 24 * 60)
        ),
        classCode: String(lesson.classCode || '').trim(),
        subject: String(lesson.subject || 'Lesson').trim() || 'Lesson',
        room: String(lesson.room || '').trim(),
        teacher: String(lesson.teacher || '').trim(),
        period: String(lesson.period || '').trim(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const dateDiff = dateStringValue(a.dateKey) - dateStringValue(b.dateKey);
      if (dateDiff !== 0) return dateDiff;
      return a.startMinutes - b.startMinutes;
    });

  const normalizedSubjectMap = Object.fromEntries(
    Object.entries(subjectMapInput)
      .map(([key, value]) => [String(key || '').trim(), String(value || '').trim()])
      .filter(([key, value]) => key && value)
  );

  const classProfiles = {};
  const addProfile = (mapKey, profileInput = {}) => {
    const key = String(mapKey || '').trim();
    if (!key) return;
    const subjectIdRaw = String(profileInput.subjectId || normalizedSubjectMap[key] || '').trim();
    const subjectId = subjectIdRaw;
    const name = String(profileInput.name || '').trim();
    const color = normalizeColorValue(profileInput.color);
    const icon = normalizeSubjectIcon(profileInput.icon);
    if (!subjectId && !name && !color && !icon && !normalizedSubjectMap[key]) return;
    classProfiles[key] = {
      subjectId,
      name,
      color,
      icon,
    };
  };

  Object.entries(classProfilesInput).forEach(([key, value]) => {
    if (!value || typeof value !== 'object') return;
    addProfile(key, value);
  });

  Object.keys(normalizedSubjectMap).forEach((key) => {
    if (classProfiles[key]) return;
    addProfile(key, {});
  });

  return {
    lessons: normalizedLessons,
    subjectMap: normalizedSubjectMap,
    classProfiles,
    sourceName: String(raw.sourceName || '').trim(),
    importedAt: Number.isFinite(raw.importedAt) ? raw.importedAt : 0,
    anchorMonday: normalizeDateKey(raw.anchorMonday) || '',
  };
}

function setTimetableStatusMessage(target, message, isError) {
  if (!target) return;
  target.textContent = message || '';
  target.style.color = isError ? 'var(--danger)' : '';
}

function setTimetableImportMessage(message, isError) {
  setTimetableStatusMessage(elements.timetableImportMessage, message, isError);
}

function setSettingsTimetableMessage(message, isError) {
  setTimetableStatusMessage(elements.settingsTimetableMessage, message, isError);
}

function setOnboardingTimetableMessage(message, isError) {
  setTimetableStatusMessage(elements.onboardingTimetableMessage, message, isError);
}

function setTimetableActionMessage(context, message, isError) {
  if (context === 'settings') {
    setSettingsTimetableMessage(message, isError);
    setTimetableImportMessage('', false);
    setOnboardingTimetableMessage('', false);
    return;
  }
  if (context === 'onboarding') {
    setOnboardingTimetableMessage(message, isError);
    setTimetableImportMessage('', false);
    setSettingsTimetableMessage('', false);
    return;
  }
  setTimetableImportMessage(message, isError);
  setSettingsTimetableMessage('', false);
  setOnboardingTimetableMessage('', false);
}

async function handleTimetableUploadInput(input, context = 'timetable') {
  const file = input?.files?.[0];
  if (!file) return;
  try {
    const content = await file.text();
    importTimetableFromIcsContent(content, file.name);
    setTimetableActionMessage(context, `Imported ${file.name}.`, false);
  } catch (error) {
    setTimetableActionMessage(context, 'Could not read that file.', true);
  } finally {
    if (input) {
      input.value = '';
    }
  }
}

function clearImportedTimetable(context = 'timetable') {
  state.data.timetable = createEmptyTimetableData();
  saveData(state.data, { syncNow: true });
  renderTimetable();
  setTimetableActionMessage(context, 'Timetable cleared.', false);
}

function swapTimetableWeekMappings() {
  const timetable = normalizeTimetableData(state.data.timetable);
  if (!timetable.lessons.length) {
    setTimetableActionMessage('settings', 'Import a timetable before swapping Week A/B.', true);
    return;
  }

  timetable.lessons = timetable.lessons.map((lesson) => ({
    ...lesson,
    weekType: lesson.weekType === 'B' ? 'A' : 'B',
  }));

  const currentAnchor = parseDateKeyLocal(timetable.anchorMonday || '');
  const baseAnchor = !Number.isNaN(currentAnchor.getTime())
    ? currentAnchor
    : getMondayOfWeek(new Date());
  const flippedAnchor = addDays(baseAnchor, 7);
  timetable.anchorMonday = dateKeyFromParts(
    flippedAnchor.getFullYear(),
    flippedAnchor.getMonth(),
    flippedAnchor.getDate()
  );

  timetable.importedAt = Date.now();
  state.data.timetable = timetable;
  saveData(state.data, { syncNow: true });
  renderTimetable();
  setTimetableActionMessage('settings', 'Swapped Week A/B (kept today’s classes unchanged).', false);
}

function updateTimetableImportPlacement(hasLessons) {
  if (elements.timetableImportCard) {
    elements.timetableImportCard.hidden = hasLessons;
  }
  if (elements.timetableImportControls) {
    elements.timetableImportControls.hidden = hasLessons;
  }
  if (elements.timetableImportMovedNote) {
    elements.timetableImportMovedNote.hidden = true;
  }
  if (elements.settingsTimetableBlock) {
    elements.settingsTimetableBlock.hidden = !hasLessons;
  }
}

function importTimetableFromIcsContent(content, sourceName = '') {
  const parsed = parseSentralIcsTimetable(content, sourceName);
  const existing = normalizeTimetableData(state.data.timetable);
  parsed.subjectMap = {
    ...existing.subjectMap,
    ...parsed.subjectMap,
  };
  parsed.classProfiles = {
    ...existing.classProfiles,
    ...parsed.classProfiles,
  };
  state.data.timetable = applyAutoTimetableSubjectAssignments(normalizeTimetableData(parsed));
  saveData(state.data, { syncNow: true });
  renderTimetable();
}

function parseSentralIcsTimetable(content, sourceName = '') {
  const text = String(content || '');
  const lines = unfoldIcsLines(text);
  const events = [];
  let currentEvent = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed === 'BEGIN:VEVENT') {
      currentEvent = {};
      return;
    }
    if (trimmed === 'END:VEVENT') {
      if (currentEvent) {
        events.push(currentEvent);
      }
      currentEvent = null;
      return;
    }
    if (!currentEvent) return;
    const separatorIndex = line.indexOf(':');
    if (separatorIndex < 0) return;
    const keyPart = line.slice(0, separatorIndex);
    const rawValue = line.slice(separatorIndex + 1);
    const [rawKey, ...rawParams] = keyPart.split(';');
    const key = String(rawKey || '').toUpperCase();
    if (!key) return;
    const params = {};
    rawParams.forEach((param) => {
      const [paramKey, paramValue = ''] = param.split('=');
      if (!paramKey) return;
      params[String(paramKey).toUpperCase()] = String(paramValue);
    });
    currentEvent[key] = { value: rawValue, params };
  });

  const lessons = events
    .map((event) => {
      const startValue = event.DTSTART?.value;
      const endValue = event.DTEND?.value;
      const startDate = parseIcsDateTime(startValue, event.DTSTART?.params);
      if (!startDate) return null;
      const endDate = parseIcsDateTime(endValue, event.DTEND?.params)
        || new Date(startDate.getTime() + 45 * 60 * 1000);

      const dateKey = dateKeyFromParts(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const dayIndex = (startDate.getDay() + 6) % 7;
      const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
      const endMinutes = Math.max(startMinutes + 5, endDate.getHours() * 60 + endDate.getMinutes());

      const summaryText = decodeIcsText(event.SUMMARY?.value || '');
      const summaryParts = summaryText.split(':');
      const classCode = summaryParts.length > 1 ? summaryParts.shift().trim() : '';
      const subjectRaw = summaryParts.length > 0 ? summaryParts.join(':') : summaryText;
      const subject = cleanTimetableSubject(subjectRaw);

      const description = decodeIcsText(event.DESCRIPTION?.value || '');
      const location = decodeIcsText(event.LOCATION?.value || '');
      const teacher = extractTaggedLine(description, 'Teacher');
      const period = extractTaggedLine(description, 'Period');
      const room = location.replace(/^Room:\s*/i, '').trim();

      return {
        id: event.UID?.value || cryptoRandomId(),
        dateKey,
        dayIndex,
        weekType: 'A',
        startMinutes,
        endMinutes,
        classCode,
        subject,
        room,
        teacher,
        period,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const dateDiff = dateStringValue(a.dateKey) - dateStringValue(b.dateKey);
      if (dateDiff !== 0) return dateDiff;
      return a.startMinutes - b.startMinutes;
    });

  if (!lessons.length) {
    throw new Error('No lessons found');
  }

  const firstDate = parseDateKeyLocal(lessons[0].dateKey);
  const anchorMondayDate = getMondayOfWeek(firstDate);
  const anchorMonday = dateKeyFromParts(
    anchorMondayDate.getFullYear(),
    anchorMondayDate.getMonth(),
    anchorMondayDate.getDate()
  );
  const anchorStamp = anchorMondayDate.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  lessons.forEach((lesson) => {
    const lessonDate = parseDateKeyLocal(lesson.dateKey);
    const weekIndex = Math.floor((lessonDate.getTime() - anchorStamp) / (dayMs * 7));
    lesson.weekType = weekIndex % 2 === 0 ? 'A' : 'B';
  });

  return normalizeTimetableData({
    lessons,
    sourceName: String(sourceName || '').trim(),
    importedAt: Date.now(),
    anchorMonday,
  });
}

function unfoldIcsLines(content) {
  const lines = String(content || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');
  const unfolded = [];
  lines.forEach((line) => {
    if (/^[ \t]/.test(line) && unfolded.length) {
      unfolded[unfolded.length - 1] += line.slice(1);
      return;
    }
    unfolded.push(line);
  });
  return unfolded;
}

function parseIcsDateTime(value, params = {}) {
  if (!value) return null;
  const raw = String(value).trim();
  const isDateOnly = String(params.VALUE || '').toUpperCase() === 'DATE' || /^\d{8}$/.test(raw);
  if (isDateOnly) {
    const dateMatch = raw.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (!dateMatch) return null;
    const [, y, m, d] = dateMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0);
  }

  const dateTimeMatch = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (dateTimeMatch) {
    const [, y, m, d, h, min, s, utcFlag] = dateTimeMatch;
    if (utcFlag === 'Z') {
      return new Date(Date.UTC(
        Number(y),
        Number(m) - 1,
        Number(d),
        Number(h),
        Number(min),
        Number(s)
      ));
    }
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s));
  }

  const fallback = new Date(raw);
  if (Number.isNaN(fallback.getTime())) return null;
  return fallback;
}

function decodeIcsText(value) {
  return String(value || '')
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function cleanTimetableSubject(value) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return 'Lesson';
  const withoutYear = normalized.replace(/\bYr\s*\d+\b.*$/i, '').trim();
  return withoutYear || normalized;
}

function normalizeTimetableDisplayName(value) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  const key = normalized.toLowerCase();
  if (key.includes('sport')) return 'Sport';
  if (key.includes('connect')) return 'Connect';
  if (key.includes('assem')) return 'Assembly';
  return normalized;
}

function extractTaggedLine(text, label) {
  const expression = new RegExp(`^${label}:\\s*(.+)$`, 'im');
  const match = String(text || '').match(expression);
  return match ? String(match[1]).trim() : '';
}

function formatLocalDateKey(dateKey) {
  const date = parseDateKeyLocal(dateKey);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function getMondayOfWeek(date) {
  const dayIndex = (date.getDay() + 6) % 7;
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  monday.setDate(monday.getDate() - dayIndex);
  return monday;
}

function getCurrentTimetableWeekType(timetable) {
  const anchor = parseDateKeyLocal(timetable?.anchorMonday || '');
  if (!anchor || Number.isNaN(anchor.getTime())) return 'A';
  const nowDate = new Date();
  const todayDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0);
  const diffDays = Math.floor((todayDate.getTime() - anchor.getTime()) / (24 * 60 * 60 * 1000));
  const weekIndex = Math.floor(diffDays / 7);
  return ((weekIndex % 2) + 2) % 2 === 0 ? 'A' : 'B';
}

function buildTimetableTemplates(timetable) {
  const templates = {
    weeks: {
      A: Array.from({ length: 5 }, () => []),
      B: Array.from({ length: 5 }, () => []),
    },
    dayDateSamples: {
      A: Array.from({ length: 5 }, () => ''),
      B: Array.from({ length: 5 }, () => ''),
    },
  };
  const slotMap = new Map();

  (timetable?.lessons || []).forEach((lesson) => {
    if (lesson.dayIndex < 0 || lesson.dayIndex > 4) return;
    const weekType = lesson.weekType === 'B' ? 'B' : 'A';
    if (!templates.dayDateSamples[weekType][lesson.dayIndex]
      || lesson.dateKey < templates.dayDateSamples[weekType][lesson.dayIndex]) {
      templates.dayDateSamples[weekType][lesson.dayIndex] = lesson.dateKey;
    }
    const slotKey = `${weekType}|${lesson.dayIndex}|${lesson.startMinutes}|${lesson.endMinutes}`;
    const signature = [
      lesson.classCode,
      lesson.subject,
      lesson.room,
      lesson.teacher,
      lesson.period,
    ].join('|');
    if (!slotMap.has(slotKey)) {
      slotMap.set(slotKey, {
        weekType,
        dayIndex: lesson.dayIndex,
        startMinutes: lesson.startMinutes,
        endMinutes: lesson.endMinutes,
        counts: new Map(),
        samples: new Map(),
      });
    }
    const entry = slotMap.get(slotKey);
    entry.counts.set(signature, (entry.counts.get(signature) || 0) + 1);
    entry.samples.set(signature, lesson);
  });

  slotMap.forEach((slot) => {
    let bestSignature = '';
    let bestCount = -1;
    slot.counts.forEach((count, signature) => {
      if (count > bestCount) {
        bestCount = count;
        bestSignature = signature;
      }
    });
    const sample = slot.samples.get(bestSignature);
    if (!sample) return;
    templates.weeks[slot.weekType][slot.dayIndex].push(sample);
  });

  ['A', 'B'].forEach((weekType) => {
    templates.weeks[weekType].forEach((dayLessons) => {
      dayLessons.sort((a, b) => a.startMinutes - b.startMinutes);
    });
  });

  return templates;
}

function renderTimetable() {
  if (!elements.timetableWeekGrid || !elements.timetableTodayList) return;
  const timetable = applyAutoTimetableSubjectAssignments(normalizeTimetableData(state.data.timetable));
  state.data.timetable = timetable;

  const hasLessons = timetable.lessons.length > 0;
  const sourceName = timetable.sourceName || 'Uploaded file';
  const importedLabel = timetable.importedAt
    ? `Imported ${new Date(timetable.importedAt).toLocaleString('en-AU')}`
    : '';
  const sourceMeta = hasLessons
    ? `${sourceName}${importedLabel ? ` · ${importedLabel}` : ''}`
    : 'No timetable imported yet.';
  if (elements.timetableSourceMeta) {
    elements.timetableSourceMeta.textContent = sourceMeta;
  }
  if (elements.settingsTimetableSourceMeta) {
    elements.settingsTimetableSourceMeta.textContent = sourceMeta;
  }
  updateTimetableImportPlacement(hasLessons);
  if (elements.timetableTabTodayCard) {
    elements.timetableTabTodayCard.hidden = !hasLessons;
  }
  if (elements.timetableSwapWeeks) {
    elements.timetableSwapWeeks.hidden = !hasLessons;
  }
  const useV2 = isUiV2();
  if (useV2) {
    renderTimetableV2ImportCard(hasLessons, sourceMeta);
  }

  const currentWeekType = getCurrentTimetableWeekType(timetable);
  const selectedWeekControl = ['current', 'A', 'B'].includes(state.timetableView.selectedWeek)
    ? state.timetableView.selectedWeek
    : 'current';
  state.timetableView.selectedWeek = selectedWeekControl;
  const selectedWeekType = selectedWeekControl === 'current' ? currentWeekType : selectedWeekControl;

  if (elements.timetableWeekSwitch) {
    elements.timetableWeekSwitch.querySelectorAll('[data-timetable-week]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.timetableWeek === selectedWeekControl);
      // Undo V2's "(current)" label if the beta was switched off.
      if (!useV2 && button.dataset.timetableWeek !== 'current') {
        button.textContent = `Week ${button.dataset.timetableWeek}`;
      }
    });
  }

  const nowDate = new Date();
  const currentWeekMonday = getMondayOfWeek(nowDate);
  const selectedWeekMonday = getDisplayWeekMonday(currentWeekMonday, selectedWeekType, timetable);
  const selectedWeekDates = buildWeekDateKeys(selectedWeekMonday);
  const nextWeekMonday = addDays(selectedWeekMonday, 7);
  const nextWeekDates = buildWeekDateKeys(nextWeekMonday);
  const nextWeekType = getWeekTypeForMonday(nextWeekMonday, timetable);

  if (elements.timetableWeekRange) {
    const selectedFrom = formatShortDate(selectedWeekDates[0]);
    const selectedTo = formatShortDate(selectedWeekDates[4]);
    const nextFrom = formatShortDate(nextWeekDates[0]);
    const nextTo = formatShortDate(nextWeekDates[4]);
    elements.timetableWeekRange.textContent = `Showing ${selectedWeekType} (${selectedFrom} - ${selectedTo}) · Next ${nextWeekType} (${nextFrom} - ${nextTo})`;
  }
  const templates = buildTimetableTemplates(timetable);
  const weekLessons = templates.weeks[selectedWeekType];
  renderTodayTimetablePanel(timetable, currentWeekType, nowDate, templates);

  if (elements.timetableWeekTitle) {
    elements.timetableWeekTitle.textContent = selectedWeekControl === 'current'
      ? `Current Week ${selectedWeekType}`
      : `Week ${selectedWeekType}`;
  }

  if (useV2) {
    renderTimetableV2WeekHeader({
      hasLessons,
      currentWeekType,
      selectedWeekType,
      selectedWeekDates,
      selectedWeekMonday,
      currentWeekMonday,
    });
  }

  if (!hasLessons) {
    elements.timetableWeekGrid.innerHTML = '<div class="empty-state">Import an ICS timetable to show Week A and Week B.</div>';
    renderTimetableMapList(timetable);
    return;
  }

  if (useV2) {
    renderTimetableV2Grid({
      timetable,
      weekLessons,
      selectedWeekDates,
      isThisWeek: selectedWeekMonday.getTime() === currentWeekMonday.getTime(),
      nowDate,
    });
    renderTimetableMapList(timetable);
    return;
  }

  const v1TodayKey = dateKeyFromParts(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  const v1IsThisWeek = selectedWeekMonday.getTime() === currentWeekMonday.getTime();
  const dayColumnsHtml = TIMETABLE_DAYS.map((dayName, dayIndex) => {
    const dayDate = selectedWeekDates[dayIndex];
    const isToday = v1IsThisWeek && dayDate === v1TodayKey;
    const dayLessons = (weekLessons[dayIndex] || [])
      .slice()
      .sort((a, b) => {
        if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
        return a.endMinutes - b.endMinutes;
      });
    const listHtml = dayLessons.length
      ? dayLessons.map((lesson) => buildLessonCardHtml(lesson, timetable)).join('')
      : '<div class="muted">No classes</div>';
    return `
      <section class="timetable-day-column${isToday ? ' is-today' : ''}">
        <div class="timetable-grid-head">
          ${dayName}${isToday ? ' <span class="tt-today-tag">Today</span>' : ''}
          <span class="sub">${formatShortDate(dayDate)}</span>
        </div>
        <div class="timetable-day-list">${listHtml}</div>
      </section>
    `;
  }).join('');

  elements.timetableWeekGrid.innerHTML = dayColumnsHtml;
  renderTimetableMapList(timetable);
}

/* V2 timetable page: import card stays visible (compact once a file exists). */
function renderTimetableV2ImportCard(hasLessons, sourceMeta) {
  const card = elements.timetableImportCard;
  if (!card) return;
  card.hidden = false;
  if (elements.timetableImportControls) {
    elements.timetableImportControls.hidden = false;
  }
  card.classList.toggle('is-compact', hasLessons);
  card.closest('.view')?.toggleAttribute('data-tt-empty', !hasLessons);
  const title = document.getElementById('tt-import-title');
  if (title) {
    title.textContent = hasLessons ? 'Timetable file' : 'Import your timetable';
  }
  const sub = document.getElementById('tt-import-sub');
  if (sub) {
    sub.textContent = hasLessons
      ? sourceMeta
      : "Upload your Sentral .ics export to build your Week A / Week B timetable and the dashboard's Today view.";
  }
  const uploadLabel = document.getElementById('tt-upload-label');
  if (uploadLabel) {
    uploadLabel.textContent = hasLessons ? 'Replace file' : 'Upload .ics';
  }
  const swapButton = document.getElementById('tt-swap-weeks');
  if (swapButton) {
    swapButton.hidden = !hasLessons;
    swapButton.onclick = () => elements.timetableSwapWeeks?.click();
  }
}

function renderTimetableV2WeekHeader({
  hasLessons,
  currentWeekType,
  selectedWeekType,
  selectedWeekDates,
  selectedWeekMonday,
  currentWeekMonday,
}) {
  // Two-way A/B switch; this week's letter is marked "(current)".
  elements.timetableWeekSwitch?.querySelectorAll('[data-timetable-week="A"], [data-timetable-week="B"]')
    .forEach((button) => {
      const week = button.dataset.timetableWeek;
      const isCurrent = hasLessons && week === currentWeekType;
      button.innerHTML = `Week ${week}${isCurrent ? ' <span class="tt-week-current">(current)</span>' : ''}`;
      button.classList.toggle('is-active', week === selectedWeekType);
      button.setAttribute('aria-pressed', week === selectedWeekType ? 'true' : 'false');
    });
  if (elements.timetableWeekTitle) {
    elements.timetableWeekTitle.textContent = `Week ${selectedWeekType}`;
  }
  if (elements.timetableWeekRange) {
    elements.timetableWeekRange.textContent = hasLessons
      ? `${formatShortDate(selectedWeekDates[0])} – ${formatShortDate(selectedWeekDates[4])}`
      : 'No timetable imported yet';
  }
  const badge = document.getElementById('tt-week-badge');
  if (badge) {
    const weeksAhead = Math.round(
      (selectedWeekMonday.getTime() - currentWeekMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    badge.textContent = weeksAhead <= 0
      ? 'This week'
      : weeksAhead === 1
      ? 'Next week'
      : `In ${weeksAhead} weeks`;
    badge.classList.toggle('is-current', weeksAhead <= 0);
    badge.hidden = !hasLessons;
  }
}

function renderTimetableV2Grid({ timetable, weekLessons, selectedWeekDates, isThisWeek, nowDate }) {
  const grid = elements.timetableWeekGrid;
  const todayKey = dateKeyFromParts(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  const nowMinutes = getTimeMinutesWithSeconds(nowDate);
  const todayIndex = isThisWeek ? selectedWeekDates.indexOf(todayKey) : -1;
  const storedDay = Number.parseInt(grid.dataset.v2Day || '', 10);
  const selectedDay = storedDay >= 0 && storedDay <= 4 ? storedDay : Math.max(0, todayIndex);

  grid.innerHTML = TIMETABLE_DAYS.map((dayName, dayIndex) => {
    const dayDate = selectedWeekDates[dayIndex];
    const isToday = dayIndex === todayIndex;
    const dayLessons = (weekLessons[dayIndex] || [])
      .slice()
      .sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);
    const currentLesson = isToday ? findCurrentLesson(dayLessons, nowMinutes) : null;
    let breakCount = 0;
    const listHtml = dayLessons.length
      ? dayLessons.map((lesson, lessonIndex) => {
        // Gaps between lessons: the first is recess, the second lunch.
        const previous = dayLessons[lessonIndex - 1];
        const gap = previous ? lesson.startMinutes - previous.endMinutes : 0;
        let breakHtml = '';
        if (gap >= 15) {
          const breakName = ['Recess', 'Lunch'][breakCount] || 'Break';
          breakCount += 1;
          breakHtml = `<div class="tt-break" title="${gap} min"><span>${breakName}</span></div>`;
        }
        return breakHtml + buildLessonCardHtml(lesson, timetable, {
          status: !isToday
            ? ''
            : lesson === currentLesson
            ? 'current'
            : lesson.endMinutes <= nowMinutes
            ? 'past'
            : '',
        });
      }).join('')
      : '<div class="tt-day-empty">No classes</div>';
    const columnClass = [
      'timetable-day-column',
      isToday ? 'is-today' : '',
      dayIndex === selectedDay ? 'is-selected' : '',
    ].filter(Boolean).join(' ');
    return `
      <section class="${columnClass}" data-day-index="${dayIndex}" aria-label="${dayName}">
        <div class="timetable-grid-head">
          <span class="tt-day-name">${dayName.slice(0, 3)}</span>
          <span class="sub">${formatShortDate(dayDate)}</span>
          ${isToday ? '<span class="tt-today-tag">Today</span>' : ''}
        </div>
        <div class="timetable-day-list">${listHtml}</div>
      </section>
    `;
  }).join('');

  // Phones show one day at a time; these tabs pick it.
  const tabs = document.getElementById('tt-day-tabs');
  if (!tabs) return;
  tabs.innerHTML = TIMETABLE_DAYS.map((dayName, dayIndex) => `
    <button
      class="tt-day-tab${dayIndex === selectedDay ? ' is-active' : ''}${dayIndex === todayIndex ? ' is-today' : ''}"
      type="button"
      role="tab"
      aria-selected="${dayIndex === selectedDay ? 'true' : 'false'}"
      data-day-index="${dayIndex}"
    >
      <span class="tt-day-tab-name">${dayName.slice(0, 3)}</span>
      <span class="tt-day-tab-date">${formatShortDate(selectedWeekDates[dayIndex])}</span>
    </button>
  `).join('');
  tabs.onclick = (event) => {
    const tab = event.target.closest('[data-day-index]');
    if (!tab) return;
    const dayIndex = tab.dataset.dayIndex;
    grid.dataset.v2Day = dayIndex;
    tabs.querySelectorAll('[data-day-index]').forEach((button) => {
      const isActive = button.dataset.dayIndex === dayIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    grid.querySelectorAll('.timetable-day-column').forEach((column) => {
      column.classList.toggle('is-selected', column.dataset.dayIndex === dayIndex);
    });
  };
}

function renderTodayTimetablePanel(
  timetable,
  currentWeekType,
  nowDate = new Date(),
  templates = null
) {
  const targets = getTodayPanelTargets();
  if (!targets.length) return;
  const nowMinutes = getTimeMinutesWithSeconds(nowDate);
  const showNextDay = nowMinutes >= (16 * 60);
  const panelDate = showNextDay
    ? addDays(nowDate, 1)
    : new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0);
  const panelDateKey = dateKeyFromParts(panelDate.getFullYear(), panelDate.getMonth(), panelDate.getDate());
  const panelLabel = panelDate.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const panelLessons = (timetable?.lessons || [])
    .filter((lesson) => lesson.dateKey === panelDateKey)
    .sort((a, b) => a.startMinutes - b.startMinutes);
  const resolvedTemplates = templates || buildTimetableTemplates(timetable);
  const panelDayIndex = getDayIndexFromDateKey(panelDateKey);
  const isSchoolDay = panelDayIndex >= 0 && panelDayIndex <= 4;
  const displayWeekType = showNextDay
    ? getWeekTypeForMonday(getMondayOfWeek(panelDate), timetable)
    : currentWeekType;
  const fallbackPanelLessons = isSchoolDay ? (resolvedTemplates.weeks[displayWeekType]?.[panelDayIndex] || []) : [];
  const activePanelLessons = panelLessons.length ? panelLessons : fallbackPanelLessons;
  const progressNowMinutes = showNextDay ? 0 : nowMinutes;
  const lessonWidthTracks = buildTodayLessonTrackTemplate(activePanelLessons);
  targets.forEach(({ list, title }) => {
    list.style.setProperty('--today-lesson-columns', String(Math.max(1, activePanelLessons.length)));
    list.style.setProperty('--today-lesson-widths', lessonWidthTracks);
    title.textContent = `${showNextDay ? 'Tomorrow' : 'Today'} · ${panelLabel}`;
  });

  if (!activePanelLessons.length) {
    const emptyHtml = `<div class="empty-state">No classes for ${showNextDay ? 'tomorrow' : 'today'}.</div>`;
    targets.forEach(({ list }) => { list.innerHTML = emptyHtml; });
    return;
  }

  const currentLesson = showNextDay ? null : findCurrentLesson(activePanelLessons, progressNowMinutes);
  const lessonsHtml = activePanelLessons
    .map((lesson) => buildDashboardTodayLessonHtml(lesson, timetable, {
      nowMinutes: progressNowMinutes,
      currentLessonId: currentLesson?.id || '',
    }))
    .join('');
  const progressHtml = buildTodayProgressBarHtml(
    activePanelLessons,
    progressNowMinutes,
    timetable,
    currentLesson,
    { isTomorrow: showNextDay }
  );
  const fallbackText = panelLessons.length
    ? ''
    : `<div class="muted">No explicit event ${showNextDay ? 'tomorrow' : 'today'}. Showing Week ${displayWeekType} template.</div>`;
  const panelHtml = `
    ${fallbackText}
    ${lessonsHtml}
    ${progressHtml}
  `;
  targets.forEach(({ list }) => { list.innerHTML = panelHtml; });
}

function buildLessonCardHtml(lesson, timetable = state.data.timetable, options = {}) {
  const presentation = resolveTimetableLessonPresentation(lesson, timetable);
  const subject = escapeHtml(presentation.displayName);
  const subjectIcon = subjectIconHtml(presentation.icon, 'lesson-subject-icon');
  const period = escapeHtml(lesson.period || lesson.classCode || '');
  const timeLabel = `${formatMinutesLabel(lesson.startMinutes)} - ${formatMinutesLabel(lesson.endMinutes)}`;
  const classCode = lesson.classCode ? escapeHtml(lesson.classCode) : '';
  const metaParts = [];
  if (classCode) metaParts.push(classCode);
  if (lesson.room) metaParts.push(escapeHtml(lesson.room));
  if (lesson.teacher) metaParts.push(escapeHtml(lesson.teacher));
  const metaText = metaParts.length ? `<div class="lesson-meta">${metaParts.join(' · ')}</div>` : '';
  const tone = getTimetableLessonTone(lesson, timetable);
  if (isUiV2()) {
    // V2: same content, plus the raw subject colour and the current/past state for the weekly grid.
    const status = options.status === 'current' || options.status === 'past' ? options.status : '';
    const color = normalizeColorValue(presentation.color) || 'var(--accent)';
    // Room and teacher first: when the line truncates, it's the class code that's cut.
    const v2MetaParts = [lesson.room, lesson.teacher, lesson.classCode].filter(Boolean).map(escapeHtml);
    const v2MetaText = v2MetaParts.length
      ? `<div class="lesson-meta" title="${v2MetaParts.join(' · ')}">${v2MetaParts.join(' · ')}</div>`
      : '';
    return `
      <article class="lesson-card${status ? ` is-${status}` : ''}" style="--lesson-bg:${tone.background}; --lesson-border:${tone.border}; --lesson-color:${color}">
        <div class="lesson-top">
          <span class="lesson-period">${period || '&nbsp;'}</span>
          ${status === 'current' ? '<span class="tt-now-tag">Now</span>' : ''}
          <span class="lesson-time">${formatMinutesLabel(lesson.startMinutes)} – ${formatMinutesLabel(lesson.endMinutes)}</span>
        </div>
        <div class="lesson-subject-row">
          <span class="lesson-icon-wrap">${subjectIcon}</span>
          <span class="lesson-subject">${subject}</span>
        </div>
        ${v2MetaText}
      </article>
    `;
  }
  return `
    <article class="lesson-card" style="--lesson-bg:${tone.background}; --lesson-border:${tone.border}">
      <div class="lesson-top">
        <span class="lesson-period">${period || '&nbsp;'}</span>
        <span class="lesson-time">${timeLabel}</span>
      </div>
      <div class="lesson-subject-row">
        <span class="lesson-icon-wrap">${subjectIcon}</span>
        <span class="lesson-subject">${subject}</span>
      </div>
      ${metaText}
    </article>
  `;
}

function buildTodayLessonTrackTemplate(lessons) {
  if (!Array.isArray(lessons) || !lessons.length) return 'minmax(0, 1fr)';
  return lessons.map((lesson) => {
    const weight = getLessonVisualWeight(lesson);
    return `minmax(0, ${weight}fr)`;
  }).join(' ');
}

function getTimetableLessonTone(lesson, timetable = state.data.timetable) {
  const baseColor = getTimetableLessonBaseColor(lesson, timetable);
  const themeMode = getThemeMode();
  const backgroundMix = themeMode === 'light' ? 14 : 24;
  const borderMix = themeMode === 'light' ? 36 : 52;
  return {
    background: `color-mix(in srgb, ${baseColor} ${backgroundMix}%, var(--surface-elevated))`,
    border: `color-mix(in srgb, ${baseColor} ${borderMix}%, var(--card-border))`,
  };
}

function getTimetableLessonBaseColor(lesson, timetable = state.data.timetable) {
  return resolveTimetableLessonPresentation(lesson, timetable).color;
}

function resolveMappedSubjectForLesson(lesson, timetable = state.data.timetable) {
  return resolveTimetableLessonPresentation(lesson, timetable).subject;
}

function timetableLessonMapKey(lesson) {
  const classKey = normalizeSubjectNameKey(lesson.classCode);
  if (classKey) return classKey;
  return normalizeSubjectNameKey(lesson.subject);
}

function getTimetableClassProfile(mapKey, timetable = state.data.timetable) {
  const normalized = timetable?.classProfiles && Array.isArray(timetable?.lessons)
    ? timetable
    : normalizeTimetableData(timetable);
  const key = String(mapKey || '').trim();
  const profile = normalized.classProfiles?.[key];
  if (!profile) {
    return {
      subjectId: '',
      name: '',
      color: '',
      icon: '',
    };
  }
  return {
    subjectId: String(profile.subjectId || '').trim(),
    name: String(profile.name || '').trim(),
    color: normalizeColorValue(profile.color),
    icon: normalizeSubjectIcon(profile.icon),
  };
}

function resolveTimetableLessonPresentation(lesson, timetable = state.data.timetable) {
  const normalized = timetable?.classProfiles && Array.isArray(timetable?.lessons)
    ? timetable
    : normalizeTimetableData(timetable);
  const mapKey = timetableLessonMapKey(lesson);
  const profile = getTimetableClassProfile(mapKey, normalized);
  const subjectId = profile.subjectId || normalized.subjectMap?.[mapKey] || '';
  const linkedSubject = subjectId && subjectId !== '__none__'
    ? state.data.subjects.find((subject) => subject.id === subjectId) || null
    : null;
  const lessonKey = normalizeSubjectNameKey(lesson.subject || lesson.classCode || '');
  const fallbackSubject = state.data.subjects.find(
    (subject) => normalizeSubjectNameKey(subject.name) === lessonKey
  );
  const displayName = linkedSubject?.name
    || profile.name
    || normalizeTimetableDisplayName(lesson.subject)
    || 'Lesson';
  const color = linkedSubject?.color
    || profile.color
    || fallbackSubject?.color
    || palette[hashString(lessonKey || mapKey || displayName) % palette.length];
  const icon = linkedSubject
    ? resolveSubjectIcon(linkedSubject.icon, linkedSubject.name)
    : resolveSubjectIcon(profile.icon, displayName);
  return {
    mapKey,
    profile,
    subject: linkedSubject,
    displayName,
    color,
    icon,
  };
}

function findCurrentLesson(lessons, nowMinutes) {
  return lessons.find((lesson) => nowMinutes >= lesson.startMinutes && nowMinutes < lesson.endMinutes) || null;
}

function getTimeMinutesWithSeconds(date = new Date()) {
  return date.getHours() * 60
    + date.getMinutes()
    + date.getSeconds() / 60
    + date.getMilliseconds() / 60000;
}

function buildDashboardTodayLessonHtml(lesson, timetable = state.data.timetable, options = {}) {
  const presentation = resolveTimetableLessonPresentation(lesson, timetable);
  const tone = getTimetableLessonTone(lesson, timetable);
  const isCurrent = options.currentLessonId && lesson.id === options.currentLessonId;
  const subject = escapeHtml(presentation.displayName);
  const subjectIcon = subjectIconHtml(presentation.icon, 'lesson-subject-icon');
  const period = escapeHtml(lesson.period || lesson.classCode || '');
  const timeLabel = `${formatMinutesLabel(lesson.startMinutes)} - ${formatMinutesLabel(lesson.endMinutes)}`;
  const metaParts = [];
  if (lesson.classCode) metaParts.push(escapeHtml(lesson.classCode));
  if (lesson.room) metaParts.push(escapeHtml(lesson.room));
  if (lesson.teacher) metaParts.push(escapeHtml(lesson.teacher));
  return `
    <article class="today-lesson-card${isCurrent ? ' is-current' : ''}" style="--lesson-bg:${tone.background}; --lesson-border:${tone.border}">
      <div class="lesson-top">
        <span class="lesson-period">${period || '&nbsp;'}</span>
        <span class="lesson-time">${timeLabel}</span>
      </div>
      <div class="lesson-subject-row">
        <span class="lesson-icon-wrap">${subjectIcon}</span>
        <span class="lesson-subject">${subject}</span>
      </div>
      ${metaParts.length ? `<div class="lesson-meta">${metaParts.join(' · ')}</div>` : ''}
    </article>
  `;
}

function buildTodayProgressBarHtml(
  lessons,
  nowMinutes,
  timetable = state.data.timetable,
  currentLesson = null,
  options = {}
) {
  const sorted = lessons
    .slice()
    .sort((a, b) => {
      if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
      return a.endMinutes - b.endMinutes;
    });
  const timelineGradient = buildCardAlignedBlendGradient(sorted, timetable);
  const totalWeight = sorted.reduce((sum, lesson) => sum + getLessonVisualWeight(lesson), 0);
  const elapsedWeight = sorted.reduce((sum, lesson) => {
    const weight = getLessonVisualWeight(lesson);
    return sum + (getLessonProgressRatio(lesson, nowMinutes) * weight);
  }, 0);
  const overallProgressRatio = totalWeight > 0 ? (elapsedWeight / totalWeight) : 0;
  const overallProgressPercent = clamp(overallProgressRatio * 100, 0, 100);
  const overallProgressAria = Math.round(overallProgressPercent);
  const fillBgScale = overallProgressPercent > 0
    ? Math.min(50000, 10000 / overallProgressPercent)
    : 100;
  const statusLine = buildTodayProgressStatusLine(sorted, nowMinutes, currentLesson, options);
  return `
    <div class="timetable-progress-wrap">
      <div class="timetable-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${overallProgressAria}">
        <div class="timetable-progress-track" style="background:${timelineGradient}"></div>
        <div class="timetable-progress-fill" style="width:${overallProgressPercent.toFixed(4)}%; background:${timelineGradient}; background-size:${fillBgScale.toFixed(4)}% 100%; background-position:left center;"></div>
      </div>
      <div class="timetable-progress-meta">${escapeHtml(statusLine)}</div>
    </div>
  `;
}

function getLessonDurationMinutes(lesson) {
  const start = Number(lesson?.startMinutes);
  const end = Number(lesson?.endMinutes);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 1;
  return Math.max(1, end - start);
}

function getLessonVisualWeight(lesson) {
  const MIN_VISUAL_MINUTES = 45;
  return Math.max(MIN_VISUAL_MINUTES, getLessonDurationMinutes(lesson));
}

function getLessonProgressRatio(lesson, nowMinutes) {
  const duration = getLessonDurationMinutes(lesson);
  if (nowMinutes <= lesson.startMinutes) return 0;
  if (nowMinutes >= lesson.endMinutes) return 1;
  return clamp((nowMinutes - lesson.startMinutes) / duration, 0, 1);
}

function buildCardAlignedBlendGradient(sortedLessons, timetable = state.data.timetable) {
  if (!sortedLessons.length) return 'var(--surface-soft)';
  const segments = sortedLessons.map((lesson) => ({
    color: getTimetableLessonBaseColor(lesson, timetable),
    weight: getLessonVisualWeight(lesson),
  }));
  if (segments.length === 1) return segments[0].color;

  const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
  if (totalWeight <= 0) return segments[0].color;

  const stops = [];
  let elapsed = 0;

  segments.forEach((segment, index) => {
    const segStart = (elapsed / totalWeight) * 100;
    elapsed += segment.weight;
    const segEnd = (elapsed / totalWeight) * 100;
    const segSize = Math.max(0, segEnd - segStart);
    const maxPad = Math.max(0, (segSize / 2) - 0.001);
    const blendPad = Math.min(2.2, segSize * 0.28, maxPad);
    const solidStart = index === 0 ? segStart : Math.min(segEnd, segStart + blendPad);
    const solidEnd = index === segments.length - 1 ? segEnd : Math.max(segStart, segEnd - blendPad);
    if (index === 0) {
      stops.push(`${segment.color} 0%`);
    }
    stops.push(`${segment.color} ${solidStart.toFixed(3)}%`);
    stops.push(`${segment.color} ${solidEnd.toFixed(3)}%`);
  });

  const lastColor = segments[segments.length - 1].color;
  stops.push(`${lastColor} 100%`);
  return `linear-gradient(90deg, ${stops.join(', ')})`;
}

function buildTodayProgressStatusLine(sortedLessons, nowMinutes, currentLesson = null, options = {}) {
  if (!sortedLessons.length) return 'No lessons';
  const isTomorrow = Boolean(options?.isTomorrow);
  const firstStart = sortedLessons[0].startMinutes;
  const lastEnd = sortedLessons[sortedLessons.length - 1].endMinutes;
  if (currentLesson) {
    const total = Math.max(1, currentLesson.endMinutes - currentLesson.startMinutes);
    const elapsed = clamp(nowMinutes - currentLesson.startMinutes, 0, total);
    const remaining = Math.max(0, total - elapsed);
    const percent = Math.round((elapsed / total) * 100);
    const elapsedMinutes = Math.max(0, Math.floor(elapsed));
    const remainingMinutes = Math.max(0, Math.ceil(remaining));
    const name = resolveTimetableLessonPresentation(currentLesson, state.data.timetable).displayName || 'Current lesson';
    return `${name}: ${formatDurationLabel(elapsedMinutes)} in · ${formatDurationLabel(remainingMinutes)} left (${percent}%)`;
  }
  if (nowMinutes < firstStart) {
    if (isTomorrow) {
      return `Starts tomorrow at ${formatMinutesLabel(firstStart)}`;
    }
    const minutesUntilStart = Math.max(0, Math.ceil(firstStart - nowMinutes));
    return `Starts in ${formatDurationLabel(minutesUntilStart)} at ${formatMinutesLabel(firstStart)}`;
  }
  if (nowMinutes >= lastEnd) {
    return `Finished for today · ended ${formatMinutesLabel(lastEnd)}`;
  }
  const next = sortedLessons.find((lesson) => lesson.startMinutes > nowMinutes);
  if (next) {
    const name = resolveTimetableLessonPresentation(next, state.data.timetable).displayName || next.subject;
    const minutesUntilNext = Math.max(0, Math.ceil(next.startMinutes - nowMinutes));
    return `Next ${name} at ${formatMinutesLabel(next.startMinutes)} (${formatDurationLabel(minutesUntilNext)})`;
  }
  return 'In progress';
}

function getDisplayWeekMonday(currentWeekMonday, selectedWeekType, timetable) {
  const currentMonday = new Date(
    currentWeekMonday.getFullYear(),
    currentWeekMonday.getMonth(),
    currentWeekMonday.getDate(),
    0,
    0,
    0
  );
  if (getWeekTypeForMonday(currentMonday, timetable) === selectedWeekType) {
    return currentMonday;
  }
  for (let offset = 1; offset <= 8; offset += 1) {
    const candidate = addDays(currentMonday, offset * 7);
    if (getWeekTypeForMonday(candidate, timetable) === selectedWeekType) {
      return candidate;
    }
  }
  return currentMonday;
}

function getWeekTypeForMonday(mondayDate, timetable) {
  const anchor = parseDateKeyLocal(timetable?.anchorMonday || '');
  if (Number.isNaN(anchor.getTime()) || Number.isNaN(mondayDate.getTime())) return 'A';
  const anchorMonday = getMondayOfWeek(anchor);
  const diffWeeks = Math.floor((mondayDate.getTime() - anchorMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return ((diffWeeks % 2) + 2) % 2 === 0 ? 'A' : 'B';
}

function buildWeekDateKeys(mondayDate) {
  return Array.from({ length: 5 }, (_, index) => {
    const date = addDays(mondayDate, index);
    return dateKeyFromParts(date.getFullYear(), date.getMonth(), date.getDate());
  });
}

function formatShortDate(dateKey) {
  return formatLocalDateKey(dateKey);
}

function renderTimetableMapList(timetable) {
  if (!elements.timetableMapList) return;
  const lessons = timetable?.lessons || [];
  const useV2 = isUiV2();
  const mapSummary = useV2 ? document.getElementById('tt-map-summary') : null;
  if (!lessons.length) {
    elements.timetableMapList.innerHTML = '<div class="empty-state">Import a timetable to manage class links.</div>';
    if (mapSummary) mapSummary.textContent = '';
    return;
  }
  const classRows = getTimetableClassRows(lessons);
  let linkedCount = 0;
  const v2Rows = [];
  const v1Html = classRows
    .map((row) => {
      const profile = getTimetableClassProfile(row.key, timetable);
      const subject = profile.subjectId && profile.subjectId !== '__none__'
        ? state.data.subjects.find((item) => item.id === profile.subjectId) || null
        : null;
      const displayName = subject?.name
        || profile.name
        || normalizeTimetableDisplayName(row.subject)
        || 'Class';
      const displayColor = subject?.color || profile.color || getTimetableClassDefaultColor(row);
      const displayIcon = subject
        ? resolveSubjectIcon(subject.icon, subject.name)
        : resolveSubjectIcon(profile.icon, displayName);
      const status = subject
        ? `Linked · ${subject.name}`
        : profile.name || profile.color || profile.icon
        ? 'Custom style'
        : 'Not linked';
      if (useV2) {
        if (subject) linkedCount += 1;
        const statusKey = subject ? 'linked' : status === 'Custom style' ? 'custom' : 'none';
        v2Rows.push({
          statusKey,
          html: `
          <button
            class="tt-class-row"
            type="button"
            data-action="open-timetable-class"
            data-timetable-map-key="${escapeHtml(row.key)}"
            data-link-status="${statusKey}"
            style="--class-color:${displayColor}"
            title="${escapeHtml(subject ? `Linked to ${subject.name}` : status)}"
          >
            <span class="tt-class-icon">${subjectIconHtml(displayIcon, '')}</span>
            <span class="tt-class-body">
              <span class="tt-class-name">${escapeHtml(displayName)}</span>
              <span class="tt-class-code">${row.classCode ? `<b>${escapeHtml(row.classCode)}</b> ` : ''}${escapeHtml(row.subject || '')}</span>
            </span>
            <span class="tt-class-state" data-state="${statusKey}">${statusKey === 'none' ? 'Link' : statusKey === 'custom' ? 'Custom' : ''}</span>
          </button>
        `,
        });
        return '';
      }
      return `
        <button
          class="timetable-map-class-card"
          type="button"
          data-action="open-timetable-class"
          data-timetable-map-key="${escapeHtml(row.key)}"
          style="--class-color:${displayColor}"
        >
          <div class="timetable-map-class-head">
            <span class="timetable-map-class-icon">${subjectIconHtml(displayIcon, '')}</span>
            <span class="timetable-map-class-name">${escapeHtml(displayName)}</span>
          </div>
          <div class="timetable-map-title">${escapeHtml(row.label)}</div>
          <div class="timetable-map-meta">${escapeHtml(status)}</div>
        </button>
      `;
    })
    .join('');
  if (!useV2) {
    elements.timetableMapList.innerHTML = v1Html;
    return;
  }
  renderTimetableClassListV2(v2Rows, linkedCount, mapSummary);
}

// V2 classes: a two-row strip that scrolls sideways, with classes that still need a subject first.
function renderTimetableClassListV2(rows, linkedCount, mapSummary) {
  const order = { none: 0, custom: 1, linked: 2 };
  const sorted = rows
    .map((row, index) => ({ ...row, index }))
    .sort((left, right) => order[left.statusKey] - order[right.statusKey] || left.index - right.index);
  if (mapSummary) mapSummary.textContent = `${linkedCount} of ${rows.length} linked`;
  elements.timetableMapList.innerHTML = sorted.map((row) => row.html).join('');
}

function getTimetableClassRows(lessons) {
  const byKey = new Map();
  lessons.forEach((lesson) => {
    const key = timetableLessonMapKey(lesson);
    if (!key) return;
    if (!byKey.has(key)) {
      const label = lesson.classCode ? `${lesson.classCode} · ${lesson.subject}` : lesson.subject;
      byKey.set(key, {
        key,
        label,
        classCode: lesson.classCode || '',
        subject: lesson.subject || '',
      });
    }
  });
  return Array.from(byKey.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function getTimetableClassDefaultColor(row) {
  const key = normalizeSubjectNameKey(row?.subject || row?.classCode || row?.key || '');
  const fallbackSubject = state.data.subjects.find((subject) => normalizeSubjectNameKey(subject.name) === key);
  return fallbackSubject?.color || palette[hashString(key || row?.label || 'class') % palette.length];
}

function applyAutoTimetableSubjectAssignments(timetable) {
  const normalized = normalizeTimetableData(timetable);
  if (!state.data.subjects.length || !normalized.lessons.length) return normalized;
  const classProfiles = { ...normalized.classProfiles };
  const rows = getTimetableClassRows(normalized.lessons);
  rows.forEach((row) => {
    const existing = classProfiles[row.key] || {};
    const existingSubjectId = String(existing.subjectId || normalized.subjectMap[row.key] || '').trim();
    if (existingSubjectId) return;
    if (isSportClassLabel(row.label) || isSportClassLabel(row.subject) || isSportClassLabel(row.classCode)) {
      classProfiles[row.key] = {
        subjectId: '__none__',
        name: String(existing.name || '').trim(),
        color: normalizeColorValue(existing.color),
        icon: normalizeSubjectIcon(existing.icon),
      };
      return;
    }
    const match = findBestSubjectMatchForClass(row.label);
    if (match) {
      classProfiles[row.key] = {
        subjectId: match.id,
        name: String(existing.name || '').trim(),
        color: normalizeColorValue(existing.color),
        icon: normalizeSubjectIcon(existing.icon),
      };
    }
  });
  normalized.classProfiles = classProfiles;
  normalized.subjectMap = Object.fromEntries(
    Object.entries(classProfiles)
      .map(([key, profile]) => [key, String(profile.subjectId || '').trim()])
      .filter(([key, subjectId]) => key && subjectId)
  );
  return normalized;
}

function isSportClassLabel(value) {
  const text = normalizeSubjectNameKey(value);
  if (!text) return false;
  return /\bsport\b/.test(text) || /\bspt\b/.test(text) || /snrsp/.test(text);
}

function findBestSubjectMatchForClass(label) {
  const key = normalizeSubjectNameKey(label);
  const codeHint = inferSubjectHintFromClassLabel(label);
  const canonicalKey = canonicalSubjectKey(key);
  let best = null;
  let bestScore = -1;
  state.data.subjects.forEach((subject) => {
    const subjectKey = normalizeSubjectNameKey(subject.name);
    const canonicalSubject = canonicalSubjectKey(subjectKey);
    let score = 0;
    if (subjectKey === key || canonicalSubject === canonicalKey) score = 100;
    else if (subjectKey.includes(key) || key.includes(subjectKey)) score = 80;
    if (codeHint && (subjectKey.includes(codeHint) || canonicalSubject === codeHint)) {
      score = Math.max(score, 95);
    }
    if (score > bestScore) {
      bestScore = score;
      best = subject;
    }
  });
  return bestScore >= 80 ? best : null;
}

function inferSubjectHintFromClassLabel(value) {
  const text = normalizeSubjectNameKey(value);
  if (/mat|mac/.test(text)) return 'mathematics';
  if (/eng/.test(text)) return 'english';
  if (/geo/.test(text)) return 'geography';
  if (/sci/.test(text)) return 'science';
  if (/pdh|pe/.test(text)) return 'pdhpe';
  if (/ctech|comput/.test(text)) return 'computing technology';
  if (/com/.test(text)) return 'commerce';
  return '';
}

function formatMinutesLabel(totalMinutes) {
  const value = clamp(Math.round(Number(totalMinutes) || 0), 0, 24 * 60);
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

function formatDurationLabel(totalMinutes) {
  const value = clamp(Math.round(Number(totalMinutes) || 0), 0, 24 * 60);
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function bindTimetableEvents() {
  if (elements.timetableUpload) {
    elements.timetableUpload.addEventListener('change', async (event) => {
      handleTimetableUploadInput(event.target, 'timetable');
    });
  }

  if (elements.timetableClear) {
    elements.timetableClear.addEventListener('click', () => {
      clearImportedTimetable('timetable');
    });
  }

  if (elements.settingsTimetableUpload) {
    elements.settingsTimetableUpload.addEventListener('change', (event) => {
      handleTimetableUploadInput(event.target, 'settings');
    });
  }

  if (elements.settingsTimetableClear) {
    elements.settingsTimetableClear.addEventListener('click', () => {
      clearImportedTimetable('settings');
    });
  }

  if (elements.onboardingTimetableUpload) {
    elements.onboardingTimetableUpload.addEventListener('change', (event) => {
      handleTimetableUploadInput(event.target, 'onboarding');
    });
  }

  if (elements.timetableWeekSwitch) {
    elements.timetableWeekSwitch.addEventListener('click', (event) => {
      const button = event.target.closest('[data-timetable-week]');
      if (!button) return;
      let week = button.dataset.timetableWeek;
      if (!week || !['current', 'A', 'B'].includes(week)) return;
      // V2 has no separate "Current" button: picking this week's letter means "current",
      // so the view keeps following the current week as the weeks roll over.
      if (isUiV2() && week === getCurrentTimetableWeekType(state.data.timetable)) {
        week = 'current';
      }
      state.timetableView.selectedWeek = week;
      renderTimetable();
    });
  }

  if (elements.timetableSwapWeeks) {
    elements.timetableSwapWeeks.addEventListener('click', () => {
      swapTimetableWeekMappings();
    });
  }

  if (elements.timetableMapList) {
    elements.timetableMapList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action="open-timetable-class"]');
      if (!button) return;
      const mapKey = String(button.dataset.timetableMapKey || '').trim();
      if (!mapKey) return;
      openTimetableClassModal(mapKey);
    });
  }

  if (elements.timetableClassModal) {
    elements.timetableClassModal.addEventListener('click', async (event) => {
      const actionTarget = event.target.closest('[data-action]');
      if (!actionTarget) return;
      const action = actionTarget.dataset.action;

      if (action === 'close-timetable-class') {
        closeTimetableClassModal();
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

      if (action === 'set-timetable-class-color') {
        setTimetableClassColor(actionTarget.dataset.color);
        return;
      }

      if (action === 'set-timetable-class-icon') {
        setTimetableClassIcon(actionTarget.dataset.icon);
        return;
      }

      if (action === 'set-timetable-class-icon-other') {
        const current = normalizeSubjectIcon(elements.timetableClassIcon?.value);
        const icon = await showCustomIconPicker(current);
        if (!icon) return;
        setTimetableClassIcon(icon);
      }
    });
  }

  if (elements.timetableClassSubject) {
    elements.timetableClassSubject.addEventListener('change', () => {
      updateTimetableClassModalState();
      setTimetableClassMessage('');
    });
  }

  if (elements.timetableClassColor) {
    elements.timetableClassColor.addEventListener('input', (event) => {
      setTimetableClassColor(event.target.value);
      setTimetableClassMessage('');
    });
  }

  if (elements.timetableClassName) {
    elements.timetableClassName.addEventListener('input', () => {
      setTimetableClassMessage('');
    });
  }

  if (elements.timetableClassForm) {
    elements.timetableClassForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const mapKey = String(elements.timetableClassKey?.value || '').trim();
      if (!mapKey) {
        setTimetableClassMessage('Could not identify this class.');
        return;
      }

      const timetable = normalizeTimetableData(state.data.timetable);
      const selectedSubjectId = String(elements.timetableClassSubject?.value || '').trim();
      const subjectId = selectedSubjectId || '__none__';
      const customName = String(elements.timetableClassName?.value || '').trim();
      const customColor = normalizeColorValue(elements.timetableClassColor?.value);
      const customIcon = normalizeSubjectIcon(elements.timetableClassIcon?.value);

      timetable.subjectMap = { ...timetable.subjectMap };
      timetable.classProfiles = { ...timetable.classProfiles };
      timetable.subjectMap[mapKey] = subjectId;
      timetable.classProfiles[mapKey] = {
        subjectId,
        name: customName,
        color: customColor,
        icon: customIcon,
      };
      timetable.importedAt = Date.now();
      state.data.timetable = timetable;
      saveData(state.data, { syncNow: true });
      renderTimetable();
      closeTimetableClassModal();
    });
  }
}
