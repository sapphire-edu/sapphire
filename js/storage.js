// localStorage access and loading, saving and normalizing app data.

function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    // no-op
  }
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

// The tour's preview copy of the app (?preview=) reads your data but never writes it.
function safeSetItem(key, value) {
  if (window.SAPPHIRE_PREVIEW) return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // no-op
  }
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    // no-op
  }
}

function safeRemoveItem(key) {
  if (window.SAPPHIRE_PREVIEW) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // no-op
  }
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    // no-op
  }
}

function loadData() {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return createEmptyData();
    const parsed = JSON.parse(raw);
    const normalized = normalizeData(parsed);
    if (normalized.userName && !loadUserName()) {
      setUserName(normalized.userName, { skipSync: true });
    }
    return normalized;
  } catch (error) {
    return createEmptyData();
  }
}

function loadUserName() {
  const value = safeGetItem(USER_NAME_KEY);
  return value ? String(value).trim() : '';
}

function setUserName(value, options = {}) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return;
  safeSetItem(USER_NAME_KEY, trimmed);
  if (state.data) {
    state.data.userName = trimmed;
  }
  if (!options.skipSync) {
    queueCloudSync();
  }
}

function clearAllStoredData() {
  [
    STORAGE_KEY,
    THEME_KEY,
    THEME_VARIANT_KEY,
    TAB_KEY,
    GRAPH_SMOOTHNESS_KEY,
    USER_NAME_KEY,
    APPWRITE_SYNC_KEY,
    LEADERBOARD_RANKS_KEY,
    UI_VERSION_KEY,
    V2_TOUR_SNOOZE_KEY,
    V2_TRIED_KEY,
  ].forEach((key) => safeRemoveItem(key));
}

function createEmptyTimetableData() {
  return {
    lessons: [],
    subjectMap: {},
    classProfiles: {},
    sourceName: '',
    importedAt: 0,
    anchorMonday: '',
  };
}

function createEmptyData() {
  return {
    subjects: [],
    timetable: createEmptyTimetableData(),
  };
}

function normalizeData(parsed) {
  if (!parsed || typeof parsed !== 'object') return createEmptyData();
  const now = new Date();
  const todayValue = dateKeyFromParts(now.getFullYear(), now.getMonth(), now.getDate());
  const sourceSubjects = Array.isArray(parsed.subjects) ? parsed.subjects : [];
  const subjects = sourceSubjects.map((subject, index) => {
    const assessments = Array.isArray(subject.assessments) ? subject.assessments : [];
    const upcoming = Array.isArray(subject.upcoming) ? subject.upcoming : [];
    const name = subject.name || 'Untitled Subject';
    return {
      id: subject.id || cryptoRandomId(),
      name,
      color: subject.color || palette[index % palette.length],
      icon: resolveSubjectIcon(subject.icon || subject.subjectIcon, name),
      target: normalizeTarget(subject.target),
      assessments: assessments.map((assessment, assessmentIndex) => {
        const date = assessment.date || todayValue;
        const dateValue = new Date(date).getTime();
        const createdAt = Number.isFinite(assessment.createdAt)
          ? assessment.createdAt
          : Number.isFinite(dateValue)
          ? dateValue - assessmentIndex
          : Date.now() - assessmentIndex;
        return {
          id: assessment.id || cryptoRandomId(),
          name: assessment.name || 'Assessment',
          score: Number.isFinite(assessment.score) ? assessment.score : 0,
          total: Number.isFinite(assessment.total) ? assessment.total : 0,
          weight: assessment.weight === undefined ? null : assessment.weight,
          date,
          // Optional school term (1–4) the student picked; null means Analytics works it out.
          term: [1, 2, 3, 4].includes(assessment.term) ? assessment.term : null,
          createdAt,
          components: Array.isArray(assessment.components) ? assessment.components : [],
          leaderboardDocId: assessment.leaderboardDocId || null,
        };
      }),
      upcoming: upcoming.map((item, upcomingIndex) => {
        const date = item.date || todayValue;
        const dateValue = dateStringValue(date);
        const createdAt = Number.isFinite(item.createdAt)
          ? item.createdAt
          : Number.isFinite(dateValue)
          ? dateValue - upcomingIndex
          : Date.now() - upcomingIndex;
        return {
          id: item.id || cryptoRandomId(),
          name: item.name || 'Upcoming assessment',
          type: normalizeUpcomingType(item.type),
          weight: Number.isFinite(item.weight) ? item.weight : null,
          date,
          notes: item.notes || '',
          createdAt,
          ...(item.importKey ? { importKey: String(item.importKey) } : {}),
          ...(item.importedDate ? { importedDate: String(item.importedDate) } : {}),
          ...(item.importedName ? { importedName: String(item.importedName) } : {}),
        };
      }),
    };
  });
  const lastUpdatedAt = Number.isFinite(parsed.lastUpdatedAt) ? parsed.lastUpdatedAt : 0;
  const userName = typeof parsed.userName === 'string' ? parsed.userName : '';
  const graphSmoothness = Number.isFinite(parsed.graphSmoothness) ? parsed.graphSmoothness : null;
  const timetable = normalizeTimetableData(parsed.timetable);
  const leaderboardAutoShare = parsed.leaderboardAutoShare === true;
  const leaderboardPrivacy = normalizeLeaderboardPrivacy(parsed.leaderboardPrivacy);
  return {
    subjects,
    timetable,
    lastUpdatedAt,
    userName,
    graphSmoothness,
    leaderboardAutoShare,
    leaderboardPrivacy,
  };
}

function normalizeTarget(value) {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return Number.isFinite(number) ? clamp(number, 0, 100) : null;
}

function normalizeLeaderboardPrivacy(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    // null means every subject may be shared.
    subjectIds: Array.isArray(source.subjectIds) ? source.subjectIds.filter((id) => typeof id === 'string') : null,
    hideRawMarks: source.hideRawMarks === true,
    averagesOnly: source.averagesOnly === true,
  };
}

function saveData(data, options = {}) {
  const { skipSync = false, skipTimestamp = false, syncNow = false, skipLeaderboardSync = false } = options;
  if (!skipTimestamp) {
    data.lastUpdatedAt = Date.now();
  }
  data.userName = loadUserName() || data.userName || '';
  safeSetItem(STORAGE_KEY, JSON.stringify(data));
  if (!skipSync) {
    queueCloudSync(Boolean(syncNow));
  }
  if (!skipLeaderboardSync) {
    queueLeaderboardSync();
  }
}

function bindStorageEvents() {
  if (elements.settingsForm) {
    elements.settingsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = String(elements.settingsName?.value || '').trim();
      if (!name) {
        return setSettingsMessage('Please enter a name.');
      }
      setUserName(name);
      updateGreeting();
      setSettingsMessage(isUiV2() ? 'Saved ✓' : 'Name updated.');
    });
  }

  // V2 has no Save button: the name saves when the field loses focus.
  if (elements.settingsName && elements.settingsForm) {
    elements.settingsName.addEventListener('change', () => {
      if (!isUiV2()) return;
      if (String(elements.settingsName.value || '').trim() === loadUserName()) return;
      elements.settingsForm.requestSubmit();
    });
  }

  if (elements.resetData) {
    elements.resetData.addEventListener('click', async () => {
      const confirmed = await showConfirm({
        title: 'Reset all data?',
        message: 'This will clear everything on this device and in the cloud.',
        confirmLabel: 'Reset',
        danger: true,
      });
      if (!confirmed) return;
      clearAllStoredData();
      try {
        await clearCloudData();
      } finally {
        await signOutAfterReset();
        window.location.reload();
      }
    });
  }
}
