// Presence: friends write a lastSeen heartbeat while the app is open, and the leaderboard
// shows who's online (a heartbeat in the last 2 minutes) or when they were last seen.

const PRESENCE_COLLECTION_ID = 'presence';
const PRESENCE_HEARTBEAT_MS = 60 * 1000;
const PRESENCE_ONLINE_MS = 2 * 60 * 1000;
const PRESENCE_REPAINT_MS = 30 * 1000;

let presenceByUser = {};
let presenceRunning = false;
let presenceHeartbeatTimer = null;
let presenceRepaintTimer = null;
let presenceUnsubscribe = null;
let presenceEventsBound = false;

function canUsePresence() {
  return Boolean(appwriteState.enabled && appwriteState.user?.labels?.includes('friends') && appwriteDatabases);
}

function startPresence() {
  if (presenceRunning || !canUsePresence()) return;
  presenceRunning = true;
  bindPresenceEvents();
  sendPresenceHeartbeat();
  fetchPresence();
  presenceHeartbeatTimer = setInterval(() => {
    if (document.visibilityState === 'visible') sendPresenceHeartbeat();
  }, PRESENCE_HEARTBEAT_MS);
  // Keeps "5m ago" ticking and lets stale online dots lapse without refetching.
  presenceRepaintTimer = setInterval(paintPresence, PRESENCE_REPAINT_MS);
  startPresenceLive();
}

function stopPresence() {
  presenceRunning = false;
  clearInterval(presenceHeartbeatTimer);
  clearInterval(presenceRepaintTimer);
  presenceHeartbeatTimer = null;
  presenceRepaintTimer = null;
  if (presenceUnsubscribe) {
    try {
      presenceUnsubscribe();
    } catch (_) {}
    presenceUnsubscribe = null;
  }
  presenceByUser = {};
  paintPresence();
}

function bindPresenceEvents() {
  if (presenceEventsBound) return;
  presenceEventsBound = true;
  // Coming back refreshes everyone; leaving stamps one last heartbeat so "last seen" is accurate.
  document.addEventListener('visibilitychange', () => {
    if (!presenceRunning) return;
    sendPresenceHeartbeat();
    if (document.visibilityState === 'visible') fetchPresence();
  });
}

async function sendPresenceHeartbeat() {
  if (!presenceRunning || !canUsePresence()) return;
  const userId = appwriteState.user.$id;
  const doc = {
    userName: appwriteState.user.name || 'Anonymous',
    lastSeen: new Date().toISOString(),
  };
  try {
    await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, PRESENCE_COLLECTION_ID, userId, doc);
  } catch (error) {
    if (error?.code !== 404) {
      console.error('Presence heartbeat failed:', error);
      return;
    }
    // Friends can read every presence doc, but only the owner can change theirs.
    const { Permission, Role } = Appwrite;
    try {
      await appwriteDatabases.createDocument(
        APPWRITE_DATABASE_ID,
        PRESENCE_COLLECTION_ID,
        userId,
        { userId, ...doc },
        [Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
      );
    } catch (createError) {
      console.error('Presence heartbeat failed:', createError);
    }
  }
}

async function fetchPresence() {
  if (!canUsePresence()) return;
  const { Query } = Appwrite;
  const next = {};
  let cursor = null;
  try {
    while (true) {
      const queries = [Query.limit(100)];
      if (cursor) queries.push(Query.cursorAfter(cursor));
      const res = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, PRESENCE_COLLECTION_ID, queries);
      const page = res.documents || [];
      page.forEach((doc) => recordPresence(next, doc));
      if (page.length < 100) break;
      cursor = page[page.length - 1].$id;
    }
  } catch (err) {
    console.error('Presence fetch error:', err);
    return;
  }
  presenceByUser = next;
  paintPresence();
}

function recordPresence(target, doc) {
  const time = Date.parse(doc?.lastSeen);
  if (!doc?.userId || Number.isNaN(time)) return;
  target[doc.userId] = time;
}

function startPresenceLive() {
  if (presenceUnsubscribe || typeof appwriteClient?.subscribe !== 'function') return;
  try {
    presenceUnsubscribe = appwriteClient.subscribe(
      `databases.${APPWRITE_DATABASE_ID}.collections.${PRESENCE_COLLECTION_ID}.documents`,
      (event) => {
        const doc = event?.payload;
        if (event?.events?.some((e) => e.endsWith('.delete'))) {
          delete presenceByUser[doc?.userId];
        } else {
          recordPresence(presenceByUser, doc);
        }
        paintPresence();
      }
    );
  } catch (err) {
    console.error('Presence live updates unavailable:', err);
  }
}

// { online, label } for a user, or null when they've never sent a heartbeat.
function presenceFor(userId, now = Date.now()) {
  // You're online the moment you're looking, even before your first heartbeat lands.
  if (userId === appwriteState.user?.$id && presenceRunning && document.visibilityState === 'visible') {
    return { online: true, label: 'Online' };
  }
  const lastSeen = presenceByUser[userId];
  if (!lastSeen) return null;
  if (now - lastSeen < PRESENCE_ONLINE_MS) return { online: true, label: 'Online' };
  return { online: false, label: `Seen ${formatLastSeen(lastSeen, now)}` };
}

function formatLastSeen(time, now = Date.now()) {
  const minutes = Math.floor((now - time) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const dayStart = (t) => new Date(new Date(t).toDateString()).getTime();
  const days = Math.round((dayStart(now) - dayStart(time)) / 86400000);
  if (days <= 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  const date = new Date(time);
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) });
}

// Fills the presence placeholders the leaderboard rows and popup render, in place.
function paintPresence() {
  const now = Date.now();
  document.querySelectorAll('[data-presence-for]').forEach((el) => {
    const presence = presenceFor(el.dataset.presenceFor, now);
    if (el.classList.contains('lb-presence-dot')) {
      el.hidden = !presence?.online;
      el.title = presence?.online ? 'Online' : '';
    } else {
      el.textContent = presence ? `${presence.label} · ` : '';
      el.classList.toggle('is-online', Boolean(presence?.online));
    }
  });
}
