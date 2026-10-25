// Share-string export/import and merging imported data.

let importUpcomingMapResolver = null;

function setExportMessage(message) {
  setInlineMessage(elements.exportMessage, message);
}

function setImportMessage(message) {
  setInlineMessage(elements.importMessage, message);
}

function applyImportedProfile(payload) {
  if (!payload || !payload.profile || !payload.profile.name) return;
  const existing = loadUserName();
  if (existing) return;
  setUserName(payload.profile.name);
  updateGreeting();
}

function getExportScope() {
  if (!elements.exportPreset) return 'all';
  return elements.exportPreset.value === 'tasks' ? 'tasks' : 'all';
}

function getExportUpcomingTypeFilter() {
  const value = String(elements.exportUpcomingType?.value || 'both').trim().toLowerCase();
  if (value === 'assessment' || value === 'homework') return value;
  return 'both';
}

function getSelectedExportSubjectIds() {
  if (!elements.exportSubjectsList) {
    return new Set(state.data.subjects.map((subject) => subject.id));
  }
  const checked = Array.from(
    elements.exportSubjectsList.querySelectorAll('input[name="exportSubjectIds"]:checked')
  )
    .map((input) => String(input.value || '').trim())
    .filter(Boolean);
  return new Set(checked);
}

function setExportSubjectSelection(checked) {
  if (!elements.exportSubjectsList) return;
  elements.exportSubjectsList
    .querySelectorAll('input[name="exportSubjectIds"]')
    .forEach((input) => {
      input.checked = Boolean(checked);
    });
}

function updateExportFilterAvailability() {
  const isTasksScope = getExportScope() === 'tasks';
  if (elements.exportUpcomingTypeField) {
    elements.exportUpcomingTypeField.hidden = !isTasksScope;
  }
  if (elements.exportSubjectsField) {
    elements.exportSubjectsField.hidden = !isTasksScope;
  }
  if (elements.exportUpcomingType) {
    elements.exportUpcomingType.disabled = !isTasksScope;
  }
  if (elements.exportSubjectsList) {
    elements.exportSubjectsList
      .querySelectorAll('input[name="exportSubjectIds"]')
      .forEach((input) => {
        input.disabled = !isTasksScope;
      });
  }
  if (elements.exportSubjectsAll) {
    elements.exportSubjectsAll.disabled = !isTasksScope;
  }
  if (elements.exportSubjectsNone) {
    elements.exportSubjectsNone.disabled = !isTasksScope;
  }
}

function renderExportSubjectFilters() {
  if (!elements.exportSubjectsList) return;
  const currentSelection = getSelectedExportSubjectIds();
  const hasExistingSelection = currentSelection.size > 0;
  if (state.data.subjects.length === 0) {
    elements.exportSubjectsList.innerHTML = '<div class="empty-state">No subjects available.</div>';
    updateExportFilterAvailability();
    return;
  }
  elements.exportSubjectsList.innerHTML = state.data.subjects
    .map((subject) => {
      const checked = hasExistingSelection ? currentSelection.has(subject.id) : true;
      const subjectName = escapeHtml(subject.name);
      const subjectId = escapeHtml(subject.id);
      const subjectIcon = resolveSubjectIcon(subject.icon, subject.name);
      return `
        <label class="checkbox-item checkbox-item--icon">
          <input type="checkbox" name="exportSubjectIds" value="${subjectId}"${checked ? ' checked' : ''} />
          <span class="checkbox-item-icon">${subjectIconHtml(subjectIcon, '')}</span>
          <span>${subjectName}</span>
        </label>
      `;
    })
    .join('');
  updateExportFilterAvailability();
}

function buildExportPayload(scope, options = {}) {
  const includeAll = scope === 'all';
  const includeTasks = scope === 'all' || scope === 'tasks';
  const selectedSubjectIds = options.selectedSubjectIds instanceof Set
    ? options.selectedSubjectIds
    : new Set(state.data.subjects.map((subject) => subject.id));
  const effectiveSubjectIds = includeAll
    ? new Set(state.data.subjects.map((subject) => subject.id))
    : selectedSubjectIds;
  const upcomingTypeFilter = options.upcomingType === 'assessment' || options.upcomingType === 'homework'
    ? options.upcomingType
    : 'both';
  const effectiveUpcomingTypeFilter = includeAll ? 'both' : upcomingTypeFilter;
  const subjects = [];
  const subjectIds = new Set();

  const addSubject = (subject) => {
    if (!subject) return;
    const id = subject.id || subject.subjectId || cryptoRandomId();
    if (subjectIds.has(id)) return;
    subjectIds.add(id);
    const name = subject.subjectName || subject.name || 'Untitled Subject';
    subjects.push({
      id,
      name,
      color: subject.color || subject.subjectColor || palette[subjects.length % palette.length],
      icon: resolveSubjectIcon(subject.icon || subject.subjectIcon, name),
    });
  };

  state.data.subjects
    .filter((subject) => effectiveSubjectIds.has(subject.id))
    .forEach(addSubject);

  const assessments = includeTasks
    ? getAllAssessments()
      .filter((assessment) => effectiveSubjectIds.has(assessment.subjectId))
      .map((assessment) => {
        return {
          id: assessment.id,
          subjectId: assessment.subjectId,
          subjectName: assessment.subjectName,
          subjectColor: assessment.subjectColor,
          subjectIcon: assessment.subjectIcon,
          name: assessment.name,
          score: assessment.score,
          total: assessment.total,
          weight: assessment.weight,
          date: assessment.date,
          createdAt: assessment.createdAt,
        };
      })
    : [];

  const upcoming = includeTasks
    ? getUpcomingAssessments()
      .filter((item) => effectiveSubjectIds.has(item.subjectId))
      .filter((item) => {
        const type = normalizeUpcomingType(item.type);
        return effectiveUpcomingTypeFilter === 'both' ? true : type === effectiveUpcomingTypeFilter;
      })
      .map((item) => {
        return {
          id: item.id,
          subjectId: item.subjectId,
          subjectName: item.subjectName,
          subjectColor: item.subjectColor,
          subjectIcon: item.subjectIcon,
          name: item.name,
          type: normalizeUpcomingType(item.type),
          weight: Number.isFinite(item.weight) ? item.weight : null,
          date: item.date,
          notes: item.notes,
          createdAt: item.createdAt,
        };
      })
    : [];

  return {
    schema: 1,
    createdAt: new Date().toISOString(),
    selection: {
      scope,
      subjectIds: Array.from(effectiveSubjectIds),
      upcomingType: effectiveUpcomingTypeFilter,
    },
    profile: {
      name: loadUserName(),
    },
    subjects,
    assessments,
    upcoming,
    timetable: includeAll ? normalizeTimetableData(state.data.timetable) : createEmptyTimetableData(),
  };
}

function encodeExportString(payload) {
  const json = JSON.stringify(payload);
  return `SAPPHIRE::${encodeBase64Utf8(json)}`;
}

function decodeExportString(value) {
  if (!value) return null;
  try {
    const trimmed = String(value).trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('SAPPHIRE::')) {
      const raw = trimmed.slice('SAPPHIRE::'.length);
      const json = decodeBase64Utf8(raw);
      return JSON.parse(json);
    }
    return JSON.parse(trimmed);
  } catch (error) {
    return null;
  }
}

function buildDataFromExportPayload(payload) {
  if (!payload) return null;
  if (payload.data && Array.isArray(payload.data.subjects)) {
    return {
      ...payload.data,
      timetable: normalizeTimetableData(payload.data.timetable || payload.timetable),
    };
  }
  if (Array.isArray(payload.subjects)) {
    const hasNested = payload.subjects.some(
      (subject) => Array.isArray(subject.assessments) || Array.isArray(subject.upcoming)
    );
    if (hasNested) {
      return {
        subjects: payload.subjects,
        timetable: normalizeTimetableData(payload.timetable),
      };
    }
  }

  const subjects = [];
  const subjectMap = new Map();
  const subjectNameMap = new Map();

  const addSubject = (subject) => {
    if (!subject) return null;
    const id = subject.id || subject.subjectId || cryptoRandomId();
    if (subjectMap.has(id)) return subjectMap.get(id);
    const entry = {
      id,
      name: subject.name || subject.subjectName || 'Untitled Subject',
      color: subject.color || subject.subjectColor || palette[subjects.length % palette.length],
      icon: resolveSubjectIcon(subject.icon || subject.subjectIcon, subject.name || subject.subjectName),
      assessments: [],
      upcoming: [],
    };
    const nameKey = entry.name.toLowerCase();
    const existingByName = subjectNameMap.get(nameKey);
    if (existingByName) {
      subjectMap.set(id, existingByName);
      return existingByName;
    }
    subjects.push(entry);
    subjectMap.set(id, entry);
    subjectNameMap.set(nameKey, entry);
    return entry;
  };

  const findSubjectByName = (value) => {
    const key = String(value || '').trim().toLowerCase();
    if (!key) return null;
    return subjectNameMap.get(key) || null;
  };

  if (Array.isArray(payload.subjects)) {
    payload.subjects.forEach((subject) => addSubject(subject));
  }

  if (Array.isArray(payload.assessments)) {
    payload.assessments.forEach((assessment, index) => {
      const subject = assessment.subjectId ? subjectMap.get(assessment.subjectId) : null;
      const named = subject || findSubjectByName(assessment.subjectName);
      const target = named || (assessment.subjectName ? addSubject({
        subjectName: assessment.subjectName,
        subjectColor: assessment.subjectColor,
        subjectIcon: assessment.subjectIcon,
      }) : null);
      if (!target) return;
      target.assessments.push({
        id: assessment.id || cryptoRandomId(),
        name: assessment.name || 'Assessment',
        score: Number.isFinite(assessment.score) ? assessment.score : 0,
        total: Number.isFinite(assessment.total) ? assessment.total : 0,
        weight: assessment.weight === undefined ? null : assessment.weight,
        date: assessment.date || today,
        createdAt: Number.isFinite(assessment.createdAt) ? assessment.createdAt : Date.now() - index,
      });
    });
  }

  if (Array.isArray(payload.upcoming)) {
    payload.upcoming.forEach((item, index) => {
      const subject = item.subjectId ? subjectMap.get(item.subjectId) : null;
      const named = subject || findSubjectByName(item.subjectName);
      const target = named || (item.subjectName ? addSubject({
        subjectName: item.subjectName,
        subjectColor: item.subjectColor,
        subjectIcon: item.subjectIcon,
      }) : null);
      if (!target) return;
      target.upcoming.push({
        id: item.id || cryptoRandomId(),
        name: item.name || 'Upcoming assessment',
        type: normalizeUpcomingType(item.type),
        weight: Number.isFinite(item.weight) ? item.weight : null,
        date: item.date || today,
        notes: item.notes || '',
        createdAt: Number.isFinite(item.createdAt) ? item.createdAt : Date.now() - index,
      });
    });
  }

  return {
    subjects,
    timetable: normalizeTimetableData(payload.timetable),
  };
}

function setImportUpcomingMapMessage(message, isError = false) {
  if (!elements.importUpcomingMapMessage) return;
  elements.importUpcomingMapMessage.textContent = message || '';
  elements.importUpcomingMapMessage.style.color = isError ? 'var(--danger)' : '';
}

function openImportUpcomingMappingModal(unmatchedSubjects, existingSubjects) {
  if (!elements.importUpcomingMapModal || !elements.importUpcomingMapList) {
    return Promise.resolve(null);
  }
  const optionsHtml = existingSubjects
    .map((subject) => `<option value="${escapeHtml(subject.id)}">${escapeHtml(subject.name)}</option>`)
    .join('');

  elements.importUpcomingMapList.innerHTML = unmatchedSubjects
    .map((subject) => {
      const upcomingCount = Array.isArray(subject.upcoming) ? subject.upcoming.length : 0;
      const assessmentCount = Array.isArray(subject.assessments) ? subject.assessments.length : 0;
      return `
        <label class="field import-map-item">
          <span>${escapeHtml(subject.name)} (${assessmentCount} assessments · ${upcomingCount} upcoming)</span>
          <select data-source-subject-id="${escapeHtml(subject.id)}" required>
            <option value="__keep__">Keep as imported subject</option>
            <option value="__skip__">Do not import this subject</option>
            ${optionsHtml}
          </select>
        </label>
      `;
    })
    .join('');

  setImportUpcomingMapMessage('');
  openModal(elements.importUpcomingMapModal);

  return new Promise((resolve) => {
    importUpcomingMapResolver = resolve;
  });
}

function dismissImportUpcomingMapping(result) {
  if (elements.importUpcomingMapModal?.classList.contains('is-open')) {
    closeModal(elements.importUpcomingMapModal);
  }
  setImportUpcomingMapMessage('');
  if (importUpcomingMapResolver) {
    const resolve = importUpcomingMapResolver;
    importUpcomingMapResolver = null;
    resolve(result);
  }
}

async function resolveUpcomingImportMappings(incomingData) {
  if (!incomingData || !Array.isArray(incomingData.subjects) || incomingData.subjects.length === 0) {
    return incomingData;
  }

  const existingByName = new Map(
    state.data.subjects.map((subject) => [normalizeSubjectNameKey(subject.name), subject])
  );
  const unmatchedSubjects = incomingData.subjects.filter((subject) => {
    const hasUpcoming = Array.isArray(subject.upcoming) && subject.upcoming.length > 0;
    if (!hasUpcoming) return false;
    return !existingByName.has(normalizeSubjectNameKey(subject.name));
  });

  if (unmatchedSubjects.length === 0) {
    return incomingData;
  }

  const mapping = await openImportUpcomingMappingModal(unmatchedSubjects, state.data.subjects);
  if (!mapping) {
    return null;
  }

  const mapped = {
    ...incomingData,
    subjects: incomingData.subjects.map((subject) => ({
      ...subject,
      assessments: Array.isArray(subject.assessments) ? [...subject.assessments] : [],
      upcoming: Array.isArray(subject.upcoming) ? [...subject.upcoming] : [],
    })),
    timetable: normalizeTimetableData(incomingData.timetable),
  };

  const unmatchedIds = new Set(unmatchedSubjects.map((subject) => subject.id));
  const skippedIds = new Set();

  Object.entries(mapping).forEach(([sourceId, targetId]) => {
    if (!sourceId || !targetId || targetId === '__keep__') return;
    if (targetId === '__skip__') {
      skippedIds.add(sourceId);
      return;
    }
    const source = mapped.subjects.find((subject) => subject.id === sourceId);
    if (!source || !Array.isArray(source.upcoming) || source.upcoming.length === 0) return;
    const existingTarget = state.data.subjects.find((subject) => subject.id === targetId);
    if (!existingTarget) return;
    const targetKey = normalizeSubjectNameKey(existingTarget.name);
    let target = mapped.subjects.find((subject) => normalizeSubjectNameKey(subject.name) === targetKey);
    if (!target) {
      target = {
        id: existingTarget.id,
        name: existingTarget.name,
        color: existingTarget.color,
        icon: existingTarget.icon,
        assessments: [],
        upcoming: [],
      };
      mapped.subjects.push(target);
    }
    target.upcoming.push(...source.upcoming);
    source.upcoming = [];
  });

  mapped.subjects = mapped.subjects.filter((subject) => {
    if (skippedIds.has(subject.id)) return false;
    if (!unmatchedIds.has(subject.id)) return true;
    return subject.assessments.length > 0 || subject.upcoming.length > 0;
  });

  return mapped;
}

function mergeData(existing, incoming) {
  const merged = {
    subjects: existing.subjects.map((subject) => ({
      ...subject,
      assessments: [...subject.assessments],
      upcoming: [...subject.upcoming],
    })),
    timetable: normalizeTimetableData(existing.timetable),
  };
  const subjectIds = new Set(merged.subjects.map((subject) => subject.id));
  const subjectsByName = new Map(
    merged.subjects.map((subject) => [subject.name.toLowerCase(), subject])
  );

  const uniqueId = (candidate, used) => {
    let id = candidate || cryptoRandomId();
    while (used.has(id)) {
      id = cryptoRandomId();
    }
    used.add(id);
    return id;
  };

  const normalizeText = (value) => String(value || '').trim().toLowerCase();
  const assessmentSignature = (assessment) =>
    [
      normalizeText(assessment.name),
      String(assessment.score),
      String(assessment.total),
      String(assessment.weight ?? 'null'),
      String(assessment.date),
    ].join('|');
  const upcomingSignature = (item) =>
    [
      normalizeText(item.name),
      normalizeUpcomingType(item.type),
      String(item.weight ?? 'null'),
      String(item.date),
      normalizeText(item.notes),
    ].join('|');

  const mergeSubjectItems = (target, source) => {
    if (!target.color && source.color) {
      target.color = source.color;
    }
    if (!target.icon && source.icon) {
      target.icon = resolveSubjectIcon(source.icon, source.name);
    }
    if (target.target == null && source.target != null) {
      target.target = source.target;
    }
    const assessmentIds = new Set(target.assessments.map((item) => item.id));
    const upcomingIds = new Set(target.upcoming.map((item) => item.id));
    const assessmentSignatures = new Set(target.assessments.map(assessmentSignature));
    const upcomingSignatures = new Set(target.upcoming.map(upcomingSignature));

    source.assessments.forEach((assessment) => {
      const signature = assessmentSignature(assessment);
      if (assessmentSignatures.has(signature)) return;
      const id = uniqueId(assessment.id, assessmentIds);
      target.assessments.push({
        ...assessment,
        id,
      });
      assessmentSignatures.add(signature);
    });

    source.upcoming.forEach((item) => {
      const signature = upcomingSignature(item);
      if (upcomingSignatures.has(signature)) return;
      const id = uniqueId(item.id, upcomingIds);
      target.upcoming.push({
        ...item,
        id,
      });
      upcomingSignatures.add(signature);
    });
  };

  incoming.subjects.forEach((subject) => {
    const key = subject.name.toLowerCase();
    const existingSubject = subjectsByName.get(key);
    if (!existingSubject) {
      const id = uniqueId(subject.id, subjectIds);
      const nextSubject = {
        ...subject,
        id,
        assessments: [...subject.assessments],
        upcoming: [...subject.upcoming],
      };
      merged.subjects.push(nextSubject);
      subjectsByName.set(key, nextSubject);
      return;
    }
    mergeSubjectItems(existingSubject, subject);
  });

  merged.timetable = mergeTimetableData(existing.timetable, incoming.timetable);
  return merged;
}

function mergeTimetableData(existing, incoming) {
  const current = normalizeTimetableData(existing);
  const next = normalizeTimetableData(incoming);
  if (!next.lessons.length) return current;
  if (!current.lessons.length) return next;
  if (next.importedAt >= current.importedAt) return next;
  return current;
}

function encodeBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64Utf8(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function bindShareEvents() {
  if (elements.exportOpen) {
    elements.exportOpen.addEventListener('click', () => {
      renderExportSubjectFilters();
      openModal(elements.exportModal);
    });
  }

  if (elements.exportModal) {
    elements.exportModal.addEventListener('click', (event) => {
      const actionTarget = event.target.closest('[data-action]');
      if (!actionTarget) return;
      if (actionTarget.dataset.action === 'close-export') {
        closeModal(elements.exportModal);
      }
    });
  }

  if (elements.importUpcomingMapModal) {
    elements.importUpcomingMapModal.addEventListener('click', (event) => {
      const actionTarget = event.target.closest('[data-action]');
      if (!actionTarget) return;
      if (actionTarget.dataset.action === 'close-import-upcoming-map') {
        dismissImportUpcomingMapping(null);
      }
    });
  }

  if (elements.importUpcomingMapForm) {
    elements.importUpcomingMapForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!elements.importUpcomingMapList) {
        dismissImportUpcomingMapping({});
        return;
      }
      const rows = Array.from(
        elements.importUpcomingMapList.querySelectorAll('select[data-source-subject-id]')
      );
      const mapping = {};
      for (const row of rows) {
        const sourceId = String(row.dataset.sourceSubjectId || '').trim();
        const targetId = String(row.value || '').trim();
        if (!sourceId || !targetId) {
          setImportUpcomingMapMessage('Choose a target for each unmatched subject.', true);
          return;
        }
        mapping[sourceId] = targetId;
      }
      dismissImportUpcomingMapping(mapping);
    });
  }

  if (elements.exportPreset) {
    elements.exportPreset.addEventListener('change', () => {
      updateExportFilterAvailability();
      if (elements.exportOutput) {
        elements.exportOutput.value = '';
      }
    });
  }

  if (elements.exportUpcomingType) {
    elements.exportUpcomingType.addEventListener('change', () => {
      if (elements.exportOutput) {
        elements.exportOutput.value = '';
      }
    });
  }

  if (elements.exportSubjectsList) {
    elements.exportSubjectsList.addEventListener('change', () => {
      if (elements.exportOutput) {
        elements.exportOutput.value = '';
      }
    });
  }

  if (elements.exportSubjectsAll) {
    elements.exportSubjectsAll.addEventListener('click', () => {
      setExportSubjectSelection(true);
      if (elements.exportOutput) {
        elements.exportOutput.value = '';
      }
    });
  }

  if (elements.exportSubjectsNone) {
    elements.exportSubjectsNone.addEventListener('click', () => {
      setExportSubjectSelection(false);
      if (elements.exportOutput) {
        elements.exportOutput.value = '';
      }
    });
  }

  if (elements.exportGenerate) {
    elements.exportGenerate.addEventListener('click', () => {
      const scope = getExportScope();
      const selectedSubjectIds = getSelectedExportSubjectIds();
      if (scope === 'tasks' && selectedSubjectIds.size === 0) {
        setExportMessage('Select at least one subject to export.');
        return;
      }
      const payload = buildExportPayload(scope, {
        selectedSubjectIds,
        upcomingType: getExportUpcomingTypeFilter(),
      });
      const encoded = encodeExportString(payload);
      if (elements.exportOutput) {
        elements.exportOutput.value = encoded;
      }
      setExportMessage('String ready. Copy it to share or save.');
    });
  }

  if (elements.exportCopy) {
    elements.exportCopy.addEventListener('click', async () => {
      if (!elements.exportOutput || !elements.exportOutput.value.trim()) {
        return setExportMessage('Generate a string first.');
      }
      const value = elements.exportOutput.value.trim();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          elements.exportOutput.focus();
          elements.exportOutput.select();
          document.execCommand('copy');
        }
        setExportMessage('Copied to clipboard.');
      } catch (error) {
        setExportMessage('Copy failed. Select and copy manually.');
      }
    });
  }

  if (elements.importRestore) {
    elements.importRestore.addEventListener('click', async () => {
      const raw = elements.importInput ? elements.importInput.value.trim() : '';
      if (!raw) {
        return setImportMessage('Paste a string to import.');
      }
      const payload = decodeExportString(raw);
      if (!payload) {
        return setImportMessage('That string could not be read.');
      }
      applyImportedProfile(payload);
      const nextData = buildDataFromExportPayload(payload);
      if (!nextData) {
        return setImportMessage('No valid data found in that string.');
      }
      const confirmed = await showConfirm({
        title: 'Add imported data?',
        message: 'Your existing data stays. Add these subjects and assessments?',
        confirmLabel: 'Add data',
      });
      if (!confirmed) return;
      const incoming = normalizeData(nextData);
      const mappedIncoming = await resolveUpcomingImportMappings(incoming);
      if (!mappedIncoming) {
        return setImportMessage('Import cancelled.');
      }
      state.data = mergeData(state.data, mappedIncoming);
      saveData(state.data);
      render();
      if (elements.importInput) {
        elements.importInput.value = '';
      }
      setImportMessage('Data imported.');
    });
  }
}
