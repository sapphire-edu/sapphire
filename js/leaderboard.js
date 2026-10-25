// Leaderboard sharing, privacy, ranking and rendering.

let leaderboardDocs = [];

let leaderboardFetchId = 0;

let leaderboardRankBaseline = null;

let leaderboardUnsubscribe = null;

let leaderboardRefreshTimer = null;

let leaderboardSyncTimer = null;

let leaderboardSyncRunning = false;

let leaderboardSyncQueued = false;

async function checkFriendStatusAndRenderLeaderboard() {
  const isFriend = appwriteState.user?.labels?.includes('friends');
  if (elements.navLeaderboard) {
    elements.navLeaderboard.hidden = !isFriend;
  }
  const scheduleImportButton = document.getElementById('calendar-import');
  if (scheduleImportButton) scheduleImportButton.hidden = !isFriend;
  const shareButtons = document.querySelectorAll('[data-action="share-assessment"]');
  shareButtons.forEach(btn => btn.hidden = !canShareSubjectMarks(btn.dataset.subjectId));
  renderShareAllButton();
  renderLeaderboardControls();

  if (isFriend) {
    startLeaderboardLive();
    await fetchLeaderboard();
  } else {
    stopLeaderboardLive();
  }
}

async function shareAssessmentToLeaderboard(subjectId, assessmentId) {
  if (!appwriteState.enabled || !appwriteState.user || !appwriteDatabases) return;
  const subject = state.data.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  if (!assessmentId) return;
  const assessment = subject.assessments.find(a => a.id === assessmentId);
  if (!assessment) return;

  // Averages-only: there is no per-mark entry, so sharing a mark just adds it to (or takes it
  // out of) the subject average, which sync then uploads.
  if (getLeaderboardPrivacy().averagesOnly) {
    const alreadyShared = Boolean(assessment.leaderboardDocId);
    const autoShareOn = Boolean(state.data.leaderboardAutoShare);
    if (alreadyShared) {
      const confirmed = await showConfirm({
        title: 'Remove from your average?',
        message: autoShareOn
          ? `This mark will stop counting towards your ${subject.name} average on the leaderboard, and "Keep everything shared" will be turned off.`
          : `This mark will stop counting towards your ${subject.name} average on the leaderboard.`,
        confirmLabel: 'Remove',
        danger: true,
      });
      if (!confirmed) return;
      assessment.leaderboardDocId = null;
      if (autoShareOn) {
        state.data.leaderboardAutoShare = false;
        renderLeaderboardControls();
      }
    } else {
      assessment.leaderboardDocId = leaderboardDocIdFor(assessment);
    }
    saveData(state.data, { skipLeaderboardSync: true });
    render();
    if (activeSubjectId === subjectId && elements.subjectModal?.classList.contains('is-open')) {
      openSubjectModal(subjectId);
    }
    await syncMyLeaderboardEntries();
    fetchLeaderboard();
    return;
  }

  // If already shared, ask to remove
  if (assessment.leaderboardDocId) {
    const autoShare = Boolean(state.data.leaderboardAutoShare);
    const confirmed = await showConfirm({
      title: 'Remove from leaderboard?',
      message: autoShare
        ? 'This will remove your mark from the shared leaderboard and turn off "Keep everything shared".'
        : 'This will remove your mark from the shared leaderboard.',
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'leaderboard', assessment.leaderboardDocId);
      assessment.leaderboardDocId = null;
      if (autoShare) {
        state.data.leaderboardAutoShare = false;
        renderLeaderboardControls();
      }
      saveData(state.data);
      renderAssessments();
      if (activeSubjectId === subjectId && elements.subjectModal?.classList.contains('is-open')) {
        openSubjectModal(subjectId);
      }
      fetchLeaderboard();
    } catch (err) {
      console.error('Error removing from leaderboard:', err);
      await showConfirm({ title: 'Error', message: 'Could not remove: ' + err.message, confirmLabel: 'OK', cancelLabel: '' });
    }
    return;
  }

  try {
    await createLeaderboardEntry(subject, assessment);
    saveData(state.data);
    renderAssessments();
    if (activeSubjectId === subjectId && elements.subjectModal?.classList.contains('is-open')) {
      openSubjectModal(subjectId);
    }
    await showConfirm({ title: 'Shared!', message: 'Your mark is now on the leaderboard.', confirmLabel: 'OK', cancelLabel: '' });
    fetchLeaderboard();
  } catch (err) {
    console.error('Error sharing to leaderboard:', err);
    await showConfirm({ title: 'Error', message: 'Failed to share: ' + err.message, confirmLabel: 'OK', cancelLabel: '' });
  }
}

function canUseLeaderboard() {
  return Boolean(
    appwriteState.enabled && appwriteState.user && appwriteDatabases && appwriteState.user.labels?.includes('friends')
  );
}

// Derived from the assessment so two devices sharing the same mark can't create duplicates.
function leaderboardDocIdFor(assessment) {
  const userPart = String(appwriteState.user?.$id || '').slice(-12);
  return `${userPart}_${assessment.id}`.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 36);
}

// One entry per subject (instead of per assessment) when "averages only" is on.
function leaderboardSummaryDocIdFor(subject) {
  const userPart = String(appwriteState.user?.$id || '').slice(-12);
  return `${userPart}_s_${subject.id}`.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 36);
}

function isLeaderboardSummaryDoc(doc) {
  return /^[a-zA-Z0-9]+_s_/.test(String(doc?.$id || ''));
}

// Friends can read every leaderboard document directly, so privacy settings must change
// what is uploaded, not just what the page shows.
function leaderboardPayload(subject, assessment) {
  const percent = (assessment.score / assessment.total) * 100;
  const hideRaw = getLeaderboardPrivacy().hideRawMarks;
  const rounded = Math.round(percent);
  return {
    userId: appwriteState.user.$id,
    userName: appwriteState.user.name || 'Anonymous',
    subjectName: normalizeSubjectNameForLeaderboard(subject.name),
    assessmentName: assessment.name,
    score: hideRaw ? rounded : assessment.score,
    total: hideRaw ? 100 : assessment.total,
    percent: hideRaw ? rounded : percent,
    weight: assessment.weight ?? null,
  };
}

// Averages-only mode uploads one exact average per subject, worked out from only the
// marks you've shared (the ones carrying a leaderboardDocId marker). The doc carries the
// combined weight of those marks, so averaging the subject docs gives the same overall
// average as the dashboard instead of counting every subject equally.
function leaderboardSummaryPayload(subject, sharedAssessments = subject.assessments) {
  const average = weightedAverage(sharedAssessments);
  if (average === null) return null;
  const weight = sharedAssessments.reduce(
    (sum, a) => (Number(a.total) > 0 ? sum + (a.weight == null ? 1 : Number(a.weight)) : sum),
    0
  );
  return {
    userId: appwriteState.user.$id,
    userName: appwriteState.user.name || 'Anonymous',
    subjectName: normalizeSubjectNameForLeaderboard(subject.name),
    assessmentName: LEADERBOARD_SUMMARY_NAME,
    score: average,
    total: 100,
    percent: average,
    weight,
  };
}

function getLeaderboardPrivacy() {
  return normalizeLeaderboardPrivacy(state.data.leaderboardPrivacy);
}

function isSubjectShareable(subjectId) {
  const { subjectIds } = getLeaderboardPrivacy();
  return subjectIds === null || subjectIds.includes(subjectId);
}

// Whether the per-assessment Share buttons apply to this subject (they also work in
// averages-only mode, where a shared mark counts towards the subject's uploaded average).
function canShareSubjectMarks(subjectId) {
  return Boolean(
    appwriteState.user?.labels?.includes('friends') &&
      isSubjectShareable(subjectId)
  );
}

// The leaderboard documents this user's settings say should exist right now.
function buildDesiredLeaderboardEntries() {
  const privacy = getLeaderboardPrivacy();
  const autoShare = Boolean(state.data.leaderboardAutoShare);
  const entries = [];
  for (const subject of state.data.subjects) {
    if (!isSubjectShareable(subject.id)) continue;
    if (privacy.averagesOnly) {
      const shared = subject.assessments.filter((a) => a.leaderboardDocId && Number(a.total) > 0);
      const payload = leaderboardSummaryPayload(subject, shared);
      if (payload) entries.push({ docId: leaderboardSummaryDocIdFor(subject), subject, payload });
      continue;
    }
    for (const assessment of subject.assessments) {
      if (!(Number(assessment.total) > 0)) continue;
      if (!autoShare && !assessment.leaderboardDocId) continue;
      entries.push({
        docId: assessment.leaderboardDocId || leaderboardDocIdFor(assessment),
        subject,
        assessment,
        payload: leaderboardPayload(subject, assessment),
      });
    }
  }
  return entries;
}

// Remote docs the privacy settings rule out: per-assessment docs while averages-only is on
// (and vice versa), and anything for a local subject that is no longer ticked. Docs for
// subjects this device doesn't know about yet are left for a Resync to judge.
function isLeaderboardDocBlockedByPrivacy(doc) {
  const privacy = getLeaderboardPrivacy();
  if (isLeaderboardSummaryDoc(doc) !== privacy.averagesOnly) return true;
  // A subject average nothing is sharing into any more (its last shared mark was removed).
  if (
    privacy.averagesOnly &&
    isLeaderboardSummaryDoc(doc) &&
    state.data.subjects.some((subject) => leaderboardSummaryDocIdFor(subject) === doc.$id)
  ) {
    return true;
  }
  const localMatches = state.data.subjects.filter(
    (subject) => normalizeSubjectNameForLeaderboard(subject.name) === doc.subjectName
  );
  return localMatches.length > 0 && localMatches.every((subject) => !isSubjectShareable(subject.id));
}

function leaderboardEntryDiffers(doc, payload) {
  return Object.keys(payload).some((key) => {
    const a = doc[key] ?? null;
    const b = payload[key] ?? null;
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) > 1e-6;
    return a !== b;
  });
}

async function createLeaderboardEntry(subject, assessment) {
  const docId = leaderboardDocIdFor(assessment);
  try {
    await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'leaderboard', docId, leaderboardPayload(subject, assessment));
  } catch (err) {
    // Already shared from another device.
    if (err?.code !== 409) throw err;
    await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'leaderboard', docId, leaderboardPayload(subject, assessment));
  }
  assessment.leaderboardDocId = docId;
}

function queueLeaderboardSync() {
  if (!canUseLeaderboard() || !appwriteState.cloudReady) return;
  clearTimeout(leaderboardSyncTimer);
  leaderboardSyncTimer = setTimeout(() => syncMyLeaderboardEntries(), 1500);
}

// Brings this user's leaderboard entries in line with their local marks and privacy
// settings: pushes edits, subject renames and name changes, shares new marks when
// auto-share is on, removes entries the privacy settings rule out, and (when
// removeOrphans is set) deletes entries whose assessment no longer exists.
async function syncMyLeaderboardEntries({ removeOrphans = false } = {}) {
  if (!canUseLeaderboard() || !appwriteState.cloudReady) return null;
  if (leaderboardSyncRunning) {
    leaderboardSyncQueued = true;
    return null;
  }
  leaderboardSyncRunning = true;
  const result = { created: 0, updated: 0, removed: 0, failed: 0 };
  let localChanged = false;

  try {
    const userId = appwriteState.user.$id;
    const allDocs = await fetchAllLeaderboardDocs();
    const remote = new Map(allDocs.filter((d) => d.userId === userId).map((d) => [d.$id, d]));
    const referenced = new Set();
    const autoShare = Boolean(state.data.leaderboardAutoShare);
    const privacy = getLeaderboardPrivacy();

    for (const subject of state.data.subjects) {
      const shareable = isSubjectShareable(subject.id);
      for (const assessment of subject.assessments) {
        if (!shareable) {
          // Hidden by privacy settings: its doc (if any) is removed below.
          if (assessment.leaderboardDocId) {
            assessment.leaderboardDocId = null;
            localChanged = true;
          }
          continue;
        }
        if (privacy.averagesOnly) {
          // No per-mark docs here: the marker just records that the mark counts towards the
          // subject average. "Keep everything shared" adds new marks to it automatically.
          if (autoShare && !assessment.leaderboardDocId && Number(assessment.total) > 0) {
            assessment.leaderboardDocId = leaderboardDocIdFor(assessment);
            localChanged = true;
          }
          continue;
        }
        // Shared from another device before this one synced.
        const derivedId = leaderboardDocIdFor(assessment);
        if (!assessment.leaderboardDocId && remote.has(derivedId)) {
          assessment.leaderboardDocId = derivedId;
          localChanged = true;
        }
      }
    }

    for (const entry of buildDesiredLeaderboardEntries()) {
      const { docId, payload, assessment, subject } = entry;
      try {
        if (remote.has(docId)) {
          referenced.add(docId);
          if (leaderboardEntryDiffers(remote.get(docId), payload)) {
            await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'leaderboard', docId, payload);
            result.updated += 1;
          }
          continue;
        }
        if (assessment?.leaderboardDocId && !autoShare) {
          // Not in the listing: either just created, or removed on another device.
          try {
            await appwriteDatabases.getDocument(APPWRITE_DATABASE_ID, 'leaderboard', docId);
            referenced.add(docId);
          } catch (err) {
            if (err?.code !== 404) throw err;
            if (remote.has(leaderboardSummaryDocIdFor(subject))) {
              // Just switched away from averages-only: the marks were shared, so publish them.
              await createLeaderboardEntry(subject, assessment);
              referenced.add(assessment.leaderboardDocId);
              result.created += 1;
            } else {
              assessment.leaderboardDocId = null;
            }
            localChanged = true;
          }
          continue;
        }
        try {
          await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'leaderboard', docId, payload);
        } catch (err) {
          if (err?.code !== 409) throw err;
          await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'leaderboard', docId, payload);
        }
        referenced.add(docId);
        result.created += 1;
        if (assessment && assessment.leaderboardDocId !== docId) {
          assessment.leaderboardDocId = docId;
          localChanged = true;
        }
      } catch (err) {
        console.error('Leaderboard sync error:', err);
        result.failed += 1;
      }
    }

    for (const [docId, doc] of remote) {
      if (referenced.has(docId)) continue;
      if (!removeOrphans && !isLeaderboardDocBlockedByPrivacy(doc)) continue;
      try {
        await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'leaderboard', docId);
        result.removed += 1;
      } catch (err) {
        console.error('Leaderboard orphan removal error:', err);
        result.failed += 1;
      }
    }
  } catch (err) {
    console.error('Leaderboard sync error:', err);
    result.failed += 1;
  } finally {
    leaderboardSyncRunning = false;
  }

  if (localChanged) {
    saveData(state.data, { skipLeaderboardSync: true });
    render();
    if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId) {
      openSubjectModal(activeSubjectId);
    }
  }
  if (result.created || result.updated || result.removed) {
    fetchLeaderboard();
  }
  if (leaderboardSyncQueued) {
    leaderboardSyncQueued = false;
    queueLeaderboardSync();
  }
  return result;
}

function startLeaderboardLive() {
  if (leaderboardUnsubscribe || typeof appwriteClient?.subscribe !== 'function') return;
  try {
    leaderboardUnsubscribe = appwriteClient.subscribe(
      `databases.${APPWRITE_DATABASE_ID}.collections.leaderboard.documents`,
      () => {
        clearTimeout(leaderboardRefreshTimer);
        leaderboardRefreshTimer = setTimeout(fetchLeaderboard, 400);
      }
    );
  } catch (err) {
    console.error('Leaderboard live updates unavailable:', err);
  }
}

function stopLeaderboardLive() {
  if (!leaderboardUnsubscribe) return;
  try {
    leaderboardUnsubscribe();
  } catch (_) {}
  leaderboardUnsubscribe = null;
}

function renderLeaderboardControls() {
  const privacy = getLeaderboardPrivacy();
  if (elements.leaderboardAutoShare) {
    elements.leaderboardAutoShare.checked = Boolean(state.data.leaderboardAutoShare);
    const toggleLabel = elements.leaderboardAutoShare.closest('.lb-toggle');
    if (toggleLabel) {
      toggleLabel.title = privacy.averagesOnly
        ? 'Automatically count new marks towards your subject averages'
        : 'Automatically share new and edited marks';
    }
  }
  if (elements.leaderboardPrivacyModal?.classList.contains('is-open')) {
    renderLeaderboardPrivacyModal();
  }
}

function renderLeaderboardPrivacyModal() {
  const privacy = getLeaderboardPrivacy();
  if (elements.leaderboardPrivacySubjects) {
    elements.leaderboardPrivacySubjects.innerHTML = state.data.subjects.length
      ? state.data.subjects
          .map(
            (subject) => `
              <label class="lb-toggle privacy-subject">
                <input type="checkbox" data-privacy-subject-id="${escapeHtml(subject.id)}" ${isSubjectShareable(subject.id) ? 'checked' : ''} />
                <span class="privacy-subject-icon" style="background:${subject.color}">${subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name))}</span>
                <span>${escapeHtml(subject.name)}</span>
              </label>
            `
          )
          .join('')
      : '<div class="empty-state">No subjects yet.</div>';
  }
  const privacyCount = document.getElementById('leaderboard-privacy-count');
  if (privacyCount) {
    const total = state.data.subjects.length;
    const shared = state.data.subjects.filter((subject) => isSubjectShareable(subject.id)).length;
    privacyCount.textContent = total ? `${shared} of ${total} shared` : '';
  }
  if (elements.leaderboardPrivacyNewNote) {
    elements.leaderboardPrivacyNewNote.hidden = privacy.subjectIds === null;
  }
  if (elements.leaderboardPrivacyHideRaw) {
    elements.leaderboardPrivacyHideRaw.checked = privacy.hideRawMarks;
    // Averages are always rounded, so this only matters for per-assessment sharing.
    elements.leaderboardPrivacyHideRaw.disabled = privacy.averagesOnly;
    elements.leaderboardPrivacyHideRaw.closest('.lb-toggle')?.classList.toggle('is-disabled', privacy.averagesOnly);
  }
  if (elements.leaderboardPrivacyAverages) {
    elements.leaderboardPrivacyAverages.checked = privacy.averagesOnly;
  }
}

function setLeaderboardPrivacyMessage(message) {
  setInlineMessage(elements.leaderboardPrivacyMessage, message);
}

function updateLeaderboardPrivacy(changes) {
  state.data.leaderboardPrivacy = { ...getLeaderboardPrivacy(), ...changes };
  saveData(state.data);
  render();
  renderShareAllButton();
  renderLeaderboardControls();
  if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId) {
    openSubjectModal(activeSubjectId);
  }
  setLeaderboardPrivacyMessage('Saved. Updating the leaderboard…');
}

async function unshareEverythingFromLeaderboard() {
  if (!canUseLeaderboard()) return;
  const confirmed = await showConfirm({
    title: 'Unshare everything?',
    message: 'This removes all of your marks from the leaderboard and turns off auto-sharing. Your marks stay saved in Sapphire.',
    confirmLabel: 'Unshare',
    danger: true,
  });
  if (!confirmed) return;

  // Turn sharing off first so a queued sync can't put anything back.
  clearTimeout(leaderboardSyncTimer);
  state.data.leaderboardAutoShare = false;
  state.data.subjects.forEach((subject) => {
    subject.assessments.forEach((assessment) => {
      assessment.leaderboardDocId = null;
    });
  });
  saveData(state.data, { skipLeaderboardSync: true });

  let removed = 0;
  let failed = 0;
  try {
    const userId = appwriteState.user.$id;
    const mine = (await fetchAllLeaderboardDocs()).filter((doc) => doc.userId === userId);
    for (const doc of mine) {
      try {
        await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'leaderboard', doc.$id);
        removed += 1;
      } catch (err) {
        console.error('Leaderboard unshare error:', err);
        failed += 1;
      }
    }
  } catch (err) {
    console.error('Leaderboard unshare error:', err);
    failed += 1;
  }

  render();
  renderLeaderboardControls();
  if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId) {
    openSubjectModal(activeSubjectId);
  }
  fetchLeaderboard();
  setLeaderboardPrivacyMessage(
    failed
      ? 'Some marks could not be removed. Try again in a moment.'
      : `Removed ${removed} entr${removed === 1 ? 'y' : 'ies'} from the leaderboard.`
  );
}

async function shareAllAssessmentsToLeaderboard() {
  if (!appwriteState.enabled || !appwriteState.user || !appwriteDatabases) return;
  const pending = state.data.subjects
    .filter((subject) => canShareSubjectMarks(subject.id))
    .flatMap((subject) =>
      subject.assessments.filter((a) => !a.leaderboardDocId).map((assessment) => ({ subject, assessment }))
    );
  if (pending.length === 0) return;

  if (getLeaderboardPrivacy().averagesOnly) {
    const confirmedAverages = await showConfirm({
      title: 'Share everything?',
      message: `This will count ${pending.length} mark${pending.length !== 1 ? 's' : ''} towards your subject averages on the leaderboard.`,
      confirmLabel: 'Share all',
    });
    if (!confirmedAverages) return;
    pending.forEach(({ assessment }) => {
      assessment.leaderboardDocId = leaderboardDocIdFor(assessment);
    });
    saveData(state.data, { skipLeaderboardSync: true });
    render();
    if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId) {
      openSubjectModal(activeSubjectId);
    }
    await syncMyLeaderboardEntries();
    fetchLeaderboard();
    return;
  }

  const confirmed = await showConfirm({
    title: 'Share everything?',
    message: `This will share ${pending.length} assessment${pending.length !== 1 ? 's' : ''} to the leaderboard.`,
    confirmLabel: 'Share all',
  });
  if (!confirmed) return;

  if (elements.shareAllAssessments) elements.shareAllAssessments.disabled = true;
  let failed = 0;
  for (const { subject, assessment } of pending) {
    try {
      await createLeaderboardEntry(subject, assessment);
    } catch (err) {
      console.error('Error sharing to leaderboard:', err);
      failed += 1;
    }
  }
  saveData(state.data);
  render();
  if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId) {
    openSubjectModal(activeSubjectId);
  }
  fetchLeaderboard();

  const shared = pending.length - failed;
  await showConfirm({
    title: failed ? 'Partly shared' : 'Shared!',
    message: failed
      ? `Shared ${shared} of ${pending.length}. ${failed} failed — try again in a moment.`
      : `All ${shared} assessment${shared !== 1 ? 's are' : ' is'} now on the leaderboard.`,
    confirmLabel: 'OK',
    cancelLabel: '',
  });
}

async function fetchAllLeaderboardDocs() {
  // Appwrite returns only 25 documents by default, so page through everything.
  const { Query } = Appwrite;
  const docs = [];
  let cursor = null;
  while (true) {
    const queries = [Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, 'leaderboard', queries);
    const page = res.documents || [];
    docs.push(...page);
    if (page.length < 100) break;
    cursor = page[page.length - 1].$id;
  }
  return docs;
}

async function fetchLeaderboard() {
  if (!canUseLeaderboard()) return;
  if (!elements.leaderboardList) return;
  const fetchId = ++leaderboardFetchId;

  try {
    if (leaderboardDocs.length === 0) {
      elements.leaderboardList.innerHTML = '<div class="empty-state">Loading leaderboard...</div>';
    }
    const docs = await fetchAllLeaderboardDocs();
    // A newer fetch (e.g. from a live update) has already started.
    if (fetchId !== leaderboardFetchId) return;
    renderLeaderboardView(docs);
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    if (fetchId === leaderboardFetchId && leaderboardDocs.length === 0) {
      elements.leaderboardList.innerHTML = '<div class="empty-state">Could not load leaderboard.</div>';
    }
  }
}

function loadLeaderboardRankBaseline() {
  try {
    leaderboardRankBaseline = JSON.parse(safeGetItem(LEADERBOARD_RANKS_KEY) || '{}') || {};
  } catch (_) {
    leaderboardRankBaseline = {};
  }
}

// Ranks are compared against what was saved the last time the tab was opened.
function updateLeaderboardRanks(filter, users) {
  if (!leaderboardRankBaseline) loadLeaderboardRankBaseline();
  const previous = leaderboardRankBaseline[filter] || null;
  const current = {};
  users.forEach((user) => {
    current[user.userId] = user.rank;
    const before = previous?.[user.userId];
    user.movement = !previous ? 0 : before ? before - user.rank : 'new';
  });
  // Only remember ranks the user has actually seen.
  if (!document.querySelector('[data-view="leaderboard"]')?.classList.contains('is-active')) return;
  let stored = {};
  try {
    stored = JSON.parse(safeGetItem(LEADERBOARD_RANKS_KEY) || '{}') || {};
  } catch (_) {}
  stored[filter] = current;
  safeSetItem(LEADERBOARD_RANKS_KEY, JSON.stringify(stored));
}

function leaderboardMovementHtml(movement) {
  if (movement === 'new') return '<span class="lb-move lb-move--new">New</span>';
  // V2 keeps the column lined up with a dash; V1 shows nothing.
  if (!movement) return '<span class="lb-move lb-move--none v2-only" title="No change since you last looked">–</span>';
  const up = movement > 0;
  return `<span class="lb-move lb-move--${up ? 'up' : 'down'}" title="${up ? 'Up' : 'Down'} ${Math.abs(movement)} since you last looked"><i class="ph ph-bold ph-caret-${up ? 'up' : 'down'}"></i>${Math.abs(movement)}</span>`;
}

// Weighted the same way as the dashboard so the numbers line up.
function leaderboardAverage(docs) {
  return weightedAverage(docs.map((d) => ({ score: d.score, total: d.total, weight: d.weight ?? null }))) ?? 0;
}

function renderLeaderboardView(docs) {
  if (!elements.leaderboardList) return;
  leaderboardDocs = docs;
  const summaryEl = document.getElementById('leaderboard-summary');
  const clearSummary = () => {
    if (!summaryEl) return;
    summaryEl.hidden = true;
    summaryEl.innerHTML = '';
  };
  // V1 shows only the plain text; V2 adds an icon, a title and a hint.
  const emptyHtml = (icon, title, hint, v1Text) => `
    <div class="empty-state lb-empty">
      <span class="lb-empty-icon v2-only" aria-hidden="true"><i class="ph ${icon}"></i></span>
      <strong class="lb-empty-title v2-only">${title}</strong>
      <span class="lb-empty-hint v2-only">${hint}</span>
      <span class="lb-empty-v1">${v1Text}</span>
    </div>
  `;

  if (docs.length === 0) {
    clearSummary();
    elements.leaderboardList.innerHTML = emptyHtml(
      'ph-trophy',
      'No shared marks yet',
      'Share a mark from a subject, or turn on “Keep everything shared”, and you’ll show up here for your friends.',
      'No shared marks yet. Be the first to share!'
    );
    return;
  }

  const selectedSubject = elements.leaderboardSubjectSelect?.value || 'all';

  // Update subject dropdown options
  const subjects = new Set(docs.map(d => d.subjectName));
  if (elements.leaderboardSubjectSelect) {
    const currentValue = elements.leaderboardSubjectSelect.value;
    elements.leaderboardSubjectSelect.innerHTML = '<option value="all">All Subjects</option>' +
      '<option value="core">Main 6 Subjects</option>' +
      Array.from(subjects).sort().map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    elements.leaderboardSubjectSelect.value = currentValue === 'core' || subjects.has(currentValue) ? currentValue : 'all';
  }

  const filteredDocs = selectedSubject === 'all' ? docs
    : selectedSubject === 'core' ? docs.filter(d => CORE_LEADERBOARD_SUBJECTS.has(d.subjectName))
    : docs.filter(d => d.subjectName === selectedSubject);

  if (filteredDocs.length === 0) {
    clearSummary();
    elements.leaderboardList.innerHTML = emptyHtml(
      'ph-books',
      'Nothing shared here yet',
      'Nobody has shared marks for this filter. Try another subject or “All Subjects”.',
      'No marks shared for this subject.'
    );
    return;
  }

  // Group by userId
  const userMap = new Map();
  for (const doc of filteredDocs) {
    const key = doc.userId;
    if (!userMap.has(key)) {
      userMap.set(key, { userId: doc.userId, userName: doc.userName, assessments: [] });
    }
    userMap.get(key).assessments.push(doc);
  }

  // Calculate overall average for each user and sort
  const users = Array.from(userMap.values()).map(u => {
    u.average = leaderboardAverage(u.assessments);
    // Group assessments by subject for the detail view
    u.subjectGroups = {};
    for (const a of u.assessments) {
      if (!u.subjectGroups[a.subjectName]) {
        u.subjectGroups[a.subjectName] = [];
      }
      u.subjectGroups[a.subjectName].push(a);
    }
    return u;
  });
  // Compare at the precision shown so people who look tied are tied, then give tied
  // users the same rank (1, 1, 1, 4). Name order keeps ties from shuffling between fetches.
  const rankScore = (user) => Math.round(user.average * 10);
  users.sort((a, b) => rankScore(b) - rankScore(a) || String(a.userName).localeCompare(String(b.userName)));
  users.forEach((user, i) => {
    const prev = users[i - 1];
    user.rank = prev && rankScore(prev) === rankScore(user) ? prev.rank : i + 1;
  });
  updateLeaderboardRanks(selectedSubject, users);

  const isCurrentUser = (uid) => appwriteState.user?.$id === uid;
  const avatarInitials = (name) => {
    const base = String(name || '').trim();
    return base ? escapeHtml(initials(base)) : '?';
  };
  // V2-only extras sit alongside the V1 markup (hidden in V1 by .v2-only).
  const v2RankHtml = (rank) => rank <= 3
    ? `<span class="lb-medal v2-only" data-place="${rank}" title="${rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}"><i class="ph ${rank === 1 ? 'ph-trophy' : 'ph-medal'}" aria-hidden="true"></i></span>`
    : `<span class="lb-rank-v2 v2-only">${rank}</span>`;

  if (summaryEl) {
    const me = users.find((u) => isCurrentUser(u.userId));
    const leaders = users.filter((u) => u.rank === 1);
    const top = users[0];
    const filterLabel = selectedSubject === 'all' ? 'All subjects'
      : selectedSubject === 'core' ? 'Main 6 subjects'
      : selectedSubject;
    const meGrade = me ? getLetterGrade(me.average) : null;
    const gap = me && top ? top.average - me.average : 0;
    const meMove = me && typeof me.movement === 'number' && me.movement !== 0
      ? `<span class="lb-move lb-move--${me.movement > 0 ? 'up' : 'down'}"><i class="ph ph-caret-${me.movement > 0 ? 'up' : 'down'}" aria-hidden="true"></i>${Math.abs(me.movement)}</span> since you last looked`
      : me?.movement === 'new' ? 'New on this board' : 'No change since you last looked';
    const cell = (label, value, sub) => `
      <div class="lb-stat">
        <div class="lb-stat-label">${label}</div>
        <div class="lb-stat-value">${value}</div>
        <div class="lb-stat-sub">${sub}</div>
      </div>
    `;
    summaryEl.innerHTML = [
      cell('Your rank',
        me ? `#${me.rank}<span class="lb-stat-of"> of ${users.length}</span>` : '—',
        me ? meMove : 'Share a mark to join'),
      cell('Your average',
        me ? `${me.average.toFixed(1)}%${meGrade ? ` <span class="v2-grade" data-grade="${meGrade[0]}">${meGrade}</span>` : ''}` : '—',
        !me ? 'Not on this board yet' : me.rank === 1 ? 'Top of the board' : `${gap.toFixed(1)}% behind #1`),
      cell('Top average',
        `${top.average.toFixed(1)}%`,
        escapeHtml(leaders.length > 1 ? `${leaders.length} tied for #1` : top.userName || 'Anonymous')),
      cell('Sharing',
        `${users.length}<span class="lb-stat-of"> ${users.length === 1 ? 'person' : 'people'}</span>`,
        escapeHtml(filterLabel)),
    ].join('');
    summaryEl.hidden = false;
  }

  const v2HeadHtml = `
    <div class="lb-head v2-only" aria-hidden="true">
      <span>Rank</span>
      <span class="lb-head-student">Student</span>
      <span class="lb-head-grade">Grade</span>
      <span class="lb-head-average">Average</span>
    </div>
  `;

  elements.leaderboardList.innerHTML = v2HeadHtml + users.map((user) => {
    const rank = user.rank;
    const rankIcon = rank === 1 ? '<i class="ph ph-fill ph-trophy" style="color: #f6b96e; font-size: 20px;"></i>'
      : rank === 2 ? '<i class="ph ph-fill ph-medal" style="color: #a8b4c4; font-size: 20px;"></i>'
      : rank === 3 ? '<i class="ph ph-fill ph-medal" style="color: #cd7f32; font-size: 20px;"></i>'
      : `<span class="lb-rank-num">${rank}</span>`;
    const subjectCount = Object.keys(user.subjectGroups).length;
    const assessmentCount = user.assessments.filter((a) => !isLeaderboardSummaryDoc(a)).length;
    const highlight = isCurrentUser(user.userId) ? ' leaderboard-entry--you' : '';
    const grade = getLetterGrade(user.average);

    // Build meta text based on filter
    const isFiltered = selectedSubject !== 'all' && selectedSubject !== 'core';
    const assessmentText = assessmentCount
      ? `${assessmentCount} assessment${assessmentCount !== 1 ? 's' : ''}`
      : 'Average only';
    const metaText = isFiltered
      ? assessmentText
      : `${subjectCount} subject${subjectCount !== 1 ? 's' : ''} · ${assessmentText}`;

    return `
      <div class="leaderboard-entry${highlight}" data-user-id="${escapeHtml(user.userId)}" data-action="open-lb-popup">
        <div class="leaderboard-entry-summary" style="cursor: pointer;">
          <div class="lb-rank">${rankIcon}${v2RankHtml(rank)}</div>
          <span class="lb-avatar v2-only" aria-hidden="true">${avatarInitials(user.userName)}</span>
          <div class="lb-info">
            <div class="lb-name">${escapeHtml(user.userName)}${isCurrentUser(user.userId) ? ' <span class="badge" style="font-size: 0.7rem;">You</span>' : ''}</div>
            <div class="lb-meta muted">${metaText}</div>
          </div>
          <span class="lb-grade v2-only">${grade ? `<span class="v2-grade" data-grade="${grade[0]}">${grade}</span>` : '—'}</span>
          <div class="lb-score">
            <div class="lb-average">${user.average.toFixed(1)}%</div>
            ${leaderboardMovementHtml(user.movement)}
          </div>
          <i class="ph ph-caret-right lb-chevron v2-only" aria-hidden="true"></i>
        </div>
      </div>
    `;
  }).join('');

  // Store user data for popup
  elements.leaderboardList._userData = users;
}

function openLeaderboardPopup(userData) {
  // Build detail HTML
  const detailSubjects = Object.entries(userData.subjectGroups).map(([subName, assessments]) => {
    const subAvg = leaderboardAverage(assessments);
    // Averages-only entries have no per-assessment rows; hidden raw marks show just the %.
    const rows = assessments.filter((a) => !isLeaderboardSummaryDoc(a)).map(a => {
      const isSummary = a.assessmentName === LEADERBOARD_SUMMARY_NAME;
      const rawHidden = isSummary || (a.total === 100 && a.score === Math.round(a.percent) && Number.isInteger(a.percent));
      return `
      <div class="lb-detail-row">
        <span class="lb-detail-name">${escapeHtml(a.assessmentName || 'Assessment')}</span>
        <span class="lb-detail-score">${rawHidden ? '' : `${a.score} / ${a.total}`}</span>
        <span class="lb-detail-percent">${rawHidden && !isSummary ? a.percent : a.percent.toFixed(1)}%</span>
      </div>
    `;
    }).join('');
    return `
      <div class="lb-subject-group">
        <div class="lb-subject-header">
          <span class="lb-subject-name">${escapeHtml(subName)}</span>
          <span class="badge">${subAvg.toFixed(1)}%</span>
        </div>
        ${rows}
      </div>
    `;
  }).join('');

  const subjectCount = Object.keys(userData.subjectGroups).length;
  const assessmentCount = userData.assessments.filter((a) => !isLeaderboardSummaryDoc(a)).length;
  const countText = assessmentCount
    ? ` · ${assessmentCount} assessment${assessmentCount !== 1 ? 's' : ''}`
    : ' · averages only';

  // Create or reuse popup overlay
  let popup = document.getElementById('lb-popup-overlay');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'lb-popup-overlay';
    popup.className = 'modal';
    popup.innerHTML = `
      <div class="modal-backdrop" data-action="close-lb-popup"></div>
      <div class="modal-panel modal-panel--small" role="dialog" aria-modal="true">
        <div class="modal-header" id="lb-popup-header"></div>
        <div class="modal-body" id="lb-popup-body"></div>
      </div>
    `;
    document.body.appendChild(popup);
    popup.addEventListener('click', (event) => {
      if (event.target.closest('[data-action="close-lb-popup"]')) {
        closeModal(popup);
      }
    });
  }

  const header = popup.querySelector('#lb-popup-header');
  const body = popup.querySelector('#lb-popup-body');

  if (isUiV2()) {
    const isYou = appwriteState.user?.$id === userData.userId;
    const name = String(userData.userName || '').trim();
    const grade = getLetterGrade(userData.average);
    const rank = userData.rank;
    const rankIcon = rank === 1 ? 'ph-trophy' : rank <= 3 ? 'ph-medal' : '';
    const gradeHtml = (letter) => (letter ? `<span class="v2-grade" data-grade="${letter[0]}">${letter}</span>` : '');
    const subjectsHtml = Object.entries(userData.subjectGroups).map(([subName, assessments]) => {
      const subAvg = leaderboardAverage(assessments);
      // Same rules as V1: averages-only entries have no rows; hidden raw marks show just the %.
      const items = assessments.filter((a) => !isLeaderboardSummaryDoc(a));
      const rows = items.map((a) => {
        const isSummary = a.assessmentName === LEADERBOARD_SUMMARY_NAME;
        const rawHidden = isSummary || (a.total === 100 && a.score === Math.round(a.percent) && Number.isInteger(a.percent));
        return `
          <div class="lb-pop-row">
            <span class="lb-pop-row-name">${escapeHtml(a.assessmentName || 'Assessment')}</span>
            <span class="lb-pop-row-raw">${rawHidden ? '' : `${a.score} / ${a.total}`}</span>
            <span class="lb-pop-row-pct">${rawHidden && !isSummary ? a.percent : a.percent.toFixed(1)}%</span>
          </div>
        `;
      }).join('');
      const countLabel = items.length
        ? `${items.length} assessment${items.length !== 1 ? 's' : ''}`
        : 'Average only';
      return `
        <section class="lb-pop-subject">
          <div class="lb-pop-subject-head">
            <div class="lb-pop-subject-title">
              <span class="lb-pop-subject-name">${escapeHtml(subName)}</span>
              <span class="lb-pop-subject-count">${countLabel}</span>
            </div>
            <div class="lb-pop-subject-avg">${gradeHtml(getLetterGrade(subAvg))}<span>${subAvg.toFixed(1)}%</span></div>
          </div>
          <div class="lb-pop-bar" aria-hidden="true"><span style="width:${Math.max(0, Math.min(100, subAvg)).toFixed(1)}%"></span></div>
          ${rows
            ? `<div class="lb-pop-rows">${rows}</div>`
            : '<div class="lb-pop-summary-note"><i class="ph ph-lock" aria-hidden="true"></i>Shared as a rounded average only</div>'}
        </section>
      `;
    }).join('');

    header.innerHTML = `
      <div class="lb-pop-id">
        <span class="lb-avatar lb-avatar--lg${isYou ? ' is-you' : ''}" aria-hidden="true">${name ? escapeHtml(initials(name)) : '?'}</span>
        <div>
          <h2 class="section-title">${escapeHtml(userData.userName)}${isYou ? ' <span class="badge lb-you-badge">You</span>' : ''}</h2>
          <div class="modal-meta">${subjectCount} subject${subjectCount !== 1 ? 's' : ''}${countText}</div>
        </div>
      </div>
      <button class="icon-button" type="button" data-action="close-lb-popup" aria-label="Close">
        <i class="ph ph-x" aria-hidden="true"></i>
      </button>
    `;

    body.innerHTML = `
      <div class="lb-pop-stats">
        <div class="lb-stat">
          <div class="lb-stat-label">Rank</div>
          <div class="lb-stat-value">${rankIcon ? `<span class="lb-medal" data-place="${rank}"><i class="ph ${rankIcon}" aria-hidden="true"></i></span>` : ''}#${rank}</div>
        </div>
        <div class="lb-stat">
          <div class="lb-stat-label">Average</div>
          <div class="lb-stat-value">${userData.average.toFixed(1)}%</div>
        </div>
        <div class="lb-stat">
          <div class="lb-stat-label">Grade</div>
          <div class="lb-stat-value">${gradeHtml(grade) || '—'}</div>
        </div>
      </div>
      <div class="lb-pop-subjects">${subjectsHtml}</div>
    `;

    openModal(popup);
    return;
  }

  header.innerHTML = `
    <div>
      <div class="section-eyebrow">Leaderboard</div>
      <h2 class="section-title">${escapeHtml(userData.userName)}</h2>
      <div class="modal-meta">${subjectCount} subject${subjectCount !== 1 ? 's' : ''}${countText} · ${userData.average.toFixed(1)}% average</div>
    </div>
    <button class="icon-button" type="button" data-action="close-lb-popup">
      <i class="ph ph-x" aria-hidden="true"></i>
    </button>
  `;

  body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${detailSubjects}
    </div>
  `;

  openModal(popup);
}

function normalizeSubjectNameForLeaderboard(name) {
  const trimmed = String(name || '').trim();
  const key = normalizeSubjectNameKey(trimmed);

  // 1. Exact full-name match
  if (SUBJECT_ALIASES[key]) return SUBJECT_ALIASES[key];

  // 2. Word-token match: find the highest-priority alias word in the subject name
  const words = key.split(/[\s_\-\/]+/).filter(Boolean);
  for (const word of words) {
    if (SUBJECT_ALIASES[word]) return SUBJECT_ALIASES[word];
  }

  // 3. Substring match: see if any alias key appears inside the full name
  for (const aliasKey of Object.keys(SUBJECT_ALIASES)) {
    if (key.includes(aliasKey)) return SUBJECT_ALIASES[aliasKey];
  }

  // 4. No match — return original name unchanged
  return trimmed;
}

function renderShareAllButton() {
  const button = elements.shareAllAssessments;
  if (!button) return;
  const assessments = getAllAssessments().filter((a) => canShareSubjectMarks(a.subjectId));
  button.hidden = assessments.length === 0;
  const unshared = assessments.filter((a) => !a.leaderboardDocId).length;
  button.disabled = unshared === 0;
  button.innerHTML = unshared === 0
    ? '<i class="ph ph-cloud-check"></i>All shared'
    : `<i class="ph ph-share-network"></i>Share all (${unshared})`;
}

function bindLeaderboardEvents() {
  if (elements.leaderboardPrivacyOpen) {
    elements.leaderboardPrivacyOpen.addEventListener('click', () => {
      setLeaderboardPrivacyMessage('');
      renderLeaderboardPrivacyModal();
      openModal(elements.leaderboardPrivacyModal);
    });
  }

  if (elements.leaderboardPrivacyModal) {
    elements.leaderboardPrivacyModal.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'close-leaderboard-privacy') {
        closeModal(elements.leaderboardPrivacyModal);
      } else if (action === 'leaderboard-unshare-all') {
        unshareEverythingFromLeaderboard();
      }
    });

    elements.leaderboardPrivacyModal.addEventListener('change', (event) => {
      const input = event.target;
      if (input === elements.leaderboardPrivacyHideRaw) {
        updateLeaderboardPrivacy({ hideRawMarks: input.checked });
      } else if (input === elements.leaderboardPrivacyAverages) {
        updateLeaderboardPrivacy({ averagesOnly: input.checked });
      } else if (input.dataset.privacySubjectId) {
        const checked = Array.from(
          elements.leaderboardPrivacySubjects.querySelectorAll('[data-privacy-subject-id]:checked'),
          (box) => box.dataset.privacySubjectId
        );
        const allChecked = checked.length === state.data.subjects.length;
        updateLeaderboardPrivacy({ subjectIds: allChecked ? null : checked });
      }
    });
  }

  if (elements.leaderboardAutoShare) {
    elements.leaderboardAutoShare.addEventListener('change', (event) => {
      state.data.leaderboardAutoShare = event.target.checked;
      saveData(state.data);
    });
  }

  if (elements.leaderboardResync) {
    elements.leaderboardResync.addEventListener('click', async () => {
      const button = elements.leaderboardResync;
      button.disabled = true;
      const result = await syncMyLeaderboardEntries({ removeOrphans: true });
      button.disabled = false;
      if (!result) return;
      const changes = result.created + result.updated + result.removed;
      await showConfirm({
        title: result.failed ? 'Resync partly failed' : 'Resynced',
        message: result.failed
          ? `${result.failed} update${result.failed !== 1 ? 's' : ''} failed — try again in a moment.`
          : changes
          ? `Updated ${result.updated}, added ${result.created}, removed ${result.removed} stale entr${result.removed !== 1 ? 'ies' : 'y'}.`
          : 'Your leaderboard entries were already up to date.',
        confirmLabel: 'OK',
        cancelLabel: '',
      });
    });
  }

  if (elements.shareAllAssessments) {
    elements.shareAllAssessments.addEventListener('click', shareAllAssessmentsToLeaderboard);
  }

  if (elements.leaderboardSubjectSelect) {
    elements.leaderboardSubjectSelect.addEventListener('change', () => {
      renderLeaderboardView(leaderboardDocs);
    });
  }

  if (elements.leaderboardList) {
    elements.leaderboardList.addEventListener('click', (event) => {
      const entry = event.target.closest('[data-action="open-lb-popup"]');
      if (!entry) return;
      const userId = entry.dataset.userId;
      const users = elements.leaderboardList._userData;
      if (!users) return;
      const userData = users.find(u => u.userId === userId);
      if (!userData) return;
      openLeaderboardPopup(userData);
    });
  }
}
