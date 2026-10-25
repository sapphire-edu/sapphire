// Appwrite auth, profile menu and cloud sync.

const appwriteState = {
  enabled: false,
  ready: false,
  user: null,
  syncing: false,
  syncingVisible: false,
  pending: false,
  lastSyncedAt: null,
  error: null,
  cloudReady: false,
};

let appwriteClient = null;

let appwriteAccount = null;

let appwriteDatabases = null;

let syncTimer = null;

let syncTimerKind = null;

let syncStatusTimer = null;

let syncStatusInterval = null;

function loadLastSync() {
  const raw = safeGetItem(APPWRITE_SYNC_KEY);
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

function initAppwrite() {
  if (!window.Appwrite) {
    updateAuthUI();
    return;
  }
  const { Client, Account, Databases } = Appwrite;
  appwriteClient = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);
  appwriteAccount = new Account(appwriteClient);
  appwriteDatabases = new Databases(appwriteClient);
  appwriteState.enabled = true;
  appwriteState.lastSyncedAt = loadLastSync();
  updateAuthUI();
  checkAppwriteSession();
}

async function checkAppwriteSession() {
  if (!appwriteAccount) return;
  try {
    const user = await appwriteAccount.get();
    appwriteState.user = user;
    appwriteState.ready = true;
    updateAuthUI();
    await pullOrSeedCloudData();
    // Only sync leaderboard entries once local data reflects the cloud copy.
    appwriteState.cloudReady = true;
    queueLeaderboardSync();
  } catch (error) {
    appwriteState.user = null;
    appwriteState.ready = true;
    updateAuthUI();
  }
}

function handleAuthAction() {
  if (!appwriteState.enabled || !appwriteAccount) return;
  if (appwriteState.user) {
    appwriteAccount
      .deleteSession('current')
      .then(() => {
        appwriteState.user = null;
        appwriteState.error = null;
        appwriteState.cloudReady = false;
        stopLeaderboardLive();
        updateAuthUI();
      })
      .catch(() => {
        appwriteState.user = null;
        appwriteState.cloudReady = false;
        stopLeaderboardLive();
        updateAuthUI();
      });
    return;
  }
  const redirect = window.location.href;
  appwriteAccount.createOAuth2Session('google', redirect, redirect);
}

function updateAuthUI() {
  if (!elements.authButton || !elements.syncStatus) return;
  if (!appwriteState.enabled) {
    stopSyncStatusTicker();
    elements.authButton.disabled = true;
    elements.authButton.setAttribute('aria-label', 'Sign in');
    setProfileAvatar(null);
    updateProfileCard(null);
    updateAuthMenu();
    if (elements.onboardingAuth) {
      elements.onboardingAuth.disabled = true;
      elements.onboardingAuth.innerHTML = `${iconHtml('sign-in')}Sign in with Google`;
    }
    updateSyncStatus('Private • Stored on this device');
    return;
  }

  elements.authButton.disabled = false;
  if (!appwriteState.user) {
    stopSyncStatusTicker();
    elements.authButton.setAttribute('aria-label', 'Sign in');
    setProfileAvatar(null);
    updateProfileCard(null);
    updateAuthMenu();
    if (elements.onboardingAuth) {
      elements.onboardingAuth.disabled = false;
      elements.onboardingAuth.innerHTML = `${iconHtml('sign-in')}Sign in with Google`;
    }
    updateSyncStatus('Private • Stored on this device');
    return;
  }

  elements.authButton.setAttribute('aria-label', 'Sign out');
  startSyncStatusTicker();
  setProfileAvatar(appwriteState.user);
  updateProfileCard(appwriteState.user);
  updateAuthMenu();
  if (elements.onboardingAuth) {
    elements.onboardingAuth.disabled = true;
    elements.onboardingAuth.innerHTML = `${iconHtml('check-circle')}Signed in`;
  }
  updateSyncStatus();
  checkFriendStatusAndRenderLeaderboard();
}

function setProfileAvatar(user) {
  if (!elements.profileAvatar || !elements.profileFallback) return;
  const fallbackText = getUserInitials(user);
  elements.profileFallback.textContent = fallbackText;
  elements.profileFallback.style.display = 'grid';
  elements.profileAvatar.style.display = 'none';

  if (!user) {
    elements.profileAvatar.removeAttribute('src');
    return;
  }

  const name = user.name || user.email || 'User';
  const avatarUrl = getUserAvatarUrl(user) || buildAvatarUrl(name);
  elements.profileAvatar.onload = () => {
    elements.profileAvatar.style.display = 'block';
    elements.profileFallback.style.display = 'none';
  };
  elements.profileAvatar.onerror = () => {
    elements.profileAvatar.style.display = 'none';
    elements.profileFallback.style.display = 'grid';
  };
  elements.profileAvatar.src = avatarUrl;
}

function updateProfileCard(user) {
  if (!elements.profileCardAvatar || !elements.profileCardFallback || !elements.profileCardName) return;
  const fallbackText = getUserInitials(user);
  elements.profileCardFallback.textContent = fallbackText;
  elements.profileCardFallback.style.display = 'grid';
  elements.profileCardAvatar.style.display = 'none';

  if (!user) {
    elements.profileCardAvatar.removeAttribute('src');
    elements.profileCardName.textContent = 'Not signed in';
    return;
  }

  const name = user.name || user.email || 'Signed in';
  const avatarUrl = getUserAvatarUrl(user) || buildAvatarUrl(name);
  elements.profileCardName.textContent = name;
  elements.profileCardAvatar.onload = () => {
    elements.profileCardAvatar.style.display = 'block';
    elements.profileCardFallback.style.display = 'none';
  };
  elements.profileCardAvatar.onerror = () => {
    elements.profileCardAvatar.style.display = 'none';
    elements.profileCardFallback.style.display = 'grid';
  };
  elements.profileCardAvatar.src = avatarUrl;
}

function buildAvatarUrl(name) {
  const encoded = encodeURIComponent(name);
  return `${APPWRITE_ENDPOINT}/avatars/initials?name=${encoded}&project=${APPWRITE_PROJECT_ID}`;
}

function getUserInitials(user) {
  if (!user) return '?';
  const base = String(user.name || user.email || '').trim();
  if (!base) return '?';
  return initials(base);
}

function getUserAvatarUrl(user) {
  if (!user || !user.prefs) return '';
  const prefs = user.prefs || {};
  return (
    prefs.avatar ||
    prefs.picture ||
    prefs.photo ||
    prefs.image ||
    ''
  );
}

function toggleAuthMenu() {
  if (!elements.authMenu || !elements.authButton) return;
  const isOpen = elements.authMenu.classList.contains('is-open');
  if (isOpen) {
    closeAuthMenu();
    return;
  }
  elements.authMenu.classList.add('is-open');
  elements.authButton.setAttribute('aria-expanded', 'true');
}

function closeAuthMenu() {
  if (!elements.authMenu || !elements.authButton) return;
  elements.authMenu.classList.remove('is-open');
  elements.authButton.setAttribute('aria-expanded', 'false');
}

function updateAuthMenu() {
  if (!elements.authMenuAction) return;
  elements.authMenuAction.textContent = appwriteState.user ? 'Sign out' : 'Sign in';
}

function startSyncStatusTicker() {
  if (syncStatusInterval) return;
  syncStatusInterval = window.setInterval(() => {
    updateSyncStatus();
  }, 30000);
}

function stopSyncStatusTicker() {
  if (!syncStatusInterval) return;
  clearInterval(syncStatusInterval);
  syncStatusInterval = null;
}

function updateSyncStatus(customMessage) {
  if (!elements.syncStatus) return;
  if (customMessage) {
    elements.syncStatus.textContent = customMessage;
    return;
  }
  if (!appwriteState.enabled || !appwriteState.user) {
    elements.syncStatus.textContent = 'Private • Stored on this device';
    return;
  }

  const label = appwriteState.user.name || appwriteState.user.email || 'Account';
  if (appwriteState.syncingVisible) {
    elements.syncStatus.textContent = `Syncing… • ${label}`;
    return;
  }
  if (appwriteState.error) {
    elements.syncStatus.textContent = `Sync issue • ${label}`;
    return;
  }
  const syncLabel = formatSyncTimestamp(appwriteState.lastSyncedAt);
  elements.syncStatus.textContent = `Signed in as ${label} • ${syncLabel}`;
}

function formatSyncTimestamp(timestamp) {
  if (!timestamp) return 'Sync on';
  const diff = Date.now() - timestamp;
  if (diff < 15000) return 'Synced just now';
  if (diff < 60000) return 'Synced <1m ago';
  if (diff < 3600000) return `Synced ${Math.round(diff / 60000)}m ago`;
  return `Synced ${Math.round(diff / 3600000)}h ago`;
}

function buildCloudPayload() {
  const subjects = (Array.isArray(state.data.subjects) ? state.data.subjects : []).map((subject) => {
    const name = subject?.name || 'Untitled Subject';
    return {
      ...subject,
      icon: resolveSubjectIcon(subject?.icon || subject?.subjectIcon, name),
    };
  });
  const payload = {
    subjects,
    timetable: normalizeTimetableData(state.data.timetable),
    lastUpdatedAt: Number.isFinite(state.data.lastUpdatedAt)
      ? state.data.lastUpdatedAt
      : Date.now(),
    userName: loadUserName() || state.data.userName || '',
    graphSmoothness: Number.isFinite(state.graphSmoothness) ? state.graphSmoothness : null,
    leaderboardAutoShare: Boolean(state.data.leaderboardAutoShare),
    leaderboardPrivacy: normalizeLeaderboardPrivacy(state.data.leaderboardPrivacy),
  };
  return payload;
}

function queueCloudSync(immediate = false) {
  if (!appwriteState.enabled || !appwriteState.user || !appwriteDatabases) return;
  clearSyncTimer();
  if (immediate) {
    performCloudSync();
    return;
  }
  const schedule = () => {
    syncTimer = null;
    performCloudSync();
  };
  if ('requestIdleCallback' in window) {
    syncTimer = window.requestIdleCallback(schedule, { timeout: 1500 });
    syncTimerKind = 'idle';
  } else {
    syncTimer = window.setTimeout(schedule, 1200);
    syncTimerKind = 'timeout';
  }
}

function clearSyncTimer() {
  if (!syncTimer) return;
  if (syncTimerKind === 'idle' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(syncTimer);
  } else {
    clearTimeout(syncTimer);
  }
  syncTimer = null;
  syncTimerKind = null;
}

async function performCloudSync() {
  if (!appwriteState.enabled || !appwriteState.user || !appwriteDatabases) return;
  if (appwriteState.syncing) {
    appwriteState.pending = true;
    return;
  }

  appwriteState.syncing = true;
  appwriteState.error = null;
  appwriteState.syncingVisible = false;
  if (syncStatusTimer) {
    clearTimeout(syncStatusTimer);
    syncStatusTimer = null;
  }
  syncStatusTimer = window.setTimeout(() => {
    appwriteState.syncingVisible = true;
    updateSyncStatus();
  }, 500);
  updateSyncStatus();

  const userId = appwriteState.user.$id;
  const payload = buildCloudPayload();
  const document = {
    userName: payload.userName || '',
    payload: JSON.stringify(payload),
  };

  try {
    await appwriteDatabases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      userId,
      document
    );
  } catch (error) {
    if (error && error.code === 404) {
      const permissions = [];
      if (window.Appwrite?.Permission && window.Appwrite?.Role) {
        permissions.push(Appwrite.Permission.read(Appwrite.Role.user(userId)));
        permissions.push(Appwrite.Permission.update(Appwrite.Role.user(userId)));
        permissions.push(Appwrite.Permission.delete(Appwrite.Role.user(userId)));
      }
      try {
        await appwriteDatabases.createDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_COLLECTION_ID,
          userId,
          document,
          permissions
        );
      } catch (createError) {
        appwriteState.error = createError;
      }
    } else {
      appwriteState.error = error;
    }
  } finally {
    if (syncStatusTimer) {
      clearTimeout(syncStatusTimer);
      syncStatusTimer = null;
    }
    appwriteState.syncingVisible = false;
    if (!appwriteState.error) {
      appwriteState.lastSyncedAt = Date.now();
      safeSetItem(APPWRITE_SYNC_KEY, String(appwriteState.lastSyncedAt));
    }
    appwriteState.syncing = false;
    updateSyncStatus();

    if (appwriteState.pending) {
      appwriteState.pending = false;
      queueCloudSync(true);
    }
  }
}

async function pullOrSeedCloudData() {
  if (!appwriteDatabases || !appwriteState.user) return;
  const userId = appwriteState.user.$id;
  try {
    const doc = await appwriteDatabases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      userId
    );
    const remotePayload = readRemotePayload(doc);
    if (!remotePayload) {
      queueCloudSync(true);
      return;
    }
    const remoteNeedsIconBackfill = payloadHasMissingSubjectIcons(remotePayload);
    const remoteData = normalizeData(remotePayload);
    const localSnapshot = normalizeData(loadData());
    const hasLocal =
      (Array.isArray(localSnapshot.subjects) && localSnapshot.subjects.length > 0) ||
      (Array.isArray(localSnapshot.timetable?.lessons) && localSnapshot.timetable.lessons.length > 0) ||
      Boolean(localSnapshot.userName);
    const hasRemote =
      (Array.isArray(remoteData.subjects) && remoteData.subjects.length > 0) ||
      (Array.isArray(remoteData.timetable?.lessons) && remoteData.timetable.lessons.length > 0) ||
      Boolean(remoteData.userName);

    if (hasLocal && hasRemote) {
      const merged = mergeLocalAndRemote(localSnapshot, remoteData);
      applyMergedData(merged);
      queueCloudSync(true);
      return;
    }
    if (hasRemote) {
      applyRemoteData(remoteData);
      if (remoteNeedsIconBackfill) {
        queueCloudSync(true);
      }
      return;
    }
    if (hasLocal) {
      applyMergedData(localSnapshot);
      queueCloudSync(true);
    }
  } catch (error) {
    if (error && error.code === 404) {
      queueCloudSync(true);
    } else {
      appwriteState.error = error;
      updateSyncStatus();
    }
  }
}

function readRemotePayload(doc) {
  if (!doc || !doc.payload) return null;
  if (typeof doc.payload === 'string') {
    try {
      return JSON.parse(doc.payload);
    } catch (error) {
      return null;
    }
  }
  return doc.payload;
}

function payloadHasMissingSubjectIcons(payload) {
  if (!payload || !Array.isArray(payload.subjects)) return false;
  return payload.subjects.some((subject) => {
    if (!subject || typeof subject !== 'object') return true;
    return !normalizeSubjectIcon(subject.icon || subject.subjectIcon);
  });
}

function applyRemoteData(remoteData) {
  state.data = normalizeData(remoteData);
  if (state.data.userName) {
    setUserName(state.data.userName, { skipSync: true });
  }
  applyCloudPreferences(state.data);
  saveData(state.data, { skipSync: true, skipTimestamp: true });
  render();
  updateGreeting();
  updateSyncStatus();
  maybeCompleteOnboardingFromCloud();
}

function mergeLocalAndRemote(localData, remoteData) {
  const merged = mergeData(localData, remoteData);
  const localUpdated = Number.isFinite(localData.lastUpdatedAt) ? localData.lastUpdatedAt : 0;
  const remoteUpdated = Number.isFinite(remoteData.lastUpdatedAt) ? remoteData.lastUpdatedAt : 0;
  merged.lastUpdatedAt = Math.max(localUpdated, remoteUpdated);
  merged.userName = localData.userName || remoteData.userName || '';
  if (remoteUpdated >= localUpdated) {
    merged.graphSmoothness =
      Number.isFinite(remoteData.graphSmoothness) ? remoteData.graphSmoothness : localData.graphSmoothness ?? null;
    merged.leaderboardAutoShare = remoteData.leaderboardAutoShare;
    merged.leaderboardPrivacy = remoteData.leaderboardPrivacy ?? localData.leaderboardPrivacy;
  } else {
    merged.graphSmoothness =
      Number.isFinite(localData.graphSmoothness) ? localData.graphSmoothness : remoteData.graphSmoothness ?? null;
    merged.leaderboardAutoShare = localData.leaderboardAutoShare;
    merged.leaderboardPrivacy = localData.leaderboardPrivacy;
  }
  return normalizeData(merged);
}

function applyMergedData(mergedData) {
  state.data = normalizeData(mergedData);
  if (state.data.userName) {
    setUserName(state.data.userName, { skipSync: true });
  }
  applyCloudPreferences(state.data);
  saveData(state.data, { skipSync: true, skipTimestamp: true });
  render();
  updateGreeting();
  updateSyncStatus();
  maybeCompleteOnboardingFromCloud();
}

function applyCloudPreferences(payload) {
  if (!payload) return;
  if (Number.isFinite(payload.graphSmoothness)) {
    setGraphSmoothness(payload.graphSmoothness, { skipSync: true });
  }
  renderLeaderboardControls();
}

async function clearCloudData() {
  if (!appwriteDatabases || !appwriteState.user) return;
  try {
    await appwriteDatabases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      appwriteState.user.$id
    );
  } catch (error) {
    // Ignore delete errors; local reset should still proceed.
  } finally {
    appwriteState.lastSyncedAt = null;
    safeSetItem(APPWRITE_SYNC_KEY, '');
    updateSyncStatus();
  }
}

async function signOutAfterReset() {
  if (!appwriteAccount || !appwriteState.user) return;
  try {
    await appwriteAccount.deleteSession('current');
  } catch (error) {
    // Ignore sign-out errors after reset.
  } finally {
    appwriteState.user = null;
    appwriteState.error = null;
    updateAuthUI();
  }
}

function bindSyncEvents() {
  window.addEventListener('online', () => {
    if (appwriteState.user) {
      queueCloudSync(true);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      updateSyncStatus();
    }
    syncTimetableTodayProgressTicker();
  });

  if (elements.authButton) {
    elements.authButton.addEventListener('click', () => {
      toggleAuthMenu();
    });
  }

  if (elements.authMenuAction) {
    elements.authMenuAction.addEventListener('click', () => {
      closeAuthMenu();
      handleAuthAction();
    });
  }

  document.addEventListener('click', (event) => {
    if (!elements.authMenu || !elements.authButton) return;
    const withinMenu = event.target.closest('.profile-menu');
    if (!withinMenu) {
      closeAuthMenu();
    }
  });
}
