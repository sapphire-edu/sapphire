// Assessment reminder notifications.

// ---- Local reminders (per device, no server) ----
const NOTIFY_KEY = 'sapphire-notifications';

const NOTIFY_SENT_KEY = 'sapphire-notifications-sent';

const NOTIFY_DEFAULT_LEADS = [1, 0];

function loadNotifySettings() {
  try {
    const parsed = JSON.parse(safeGetItem(NOTIFY_KEY) || 'null');
    if (parsed && typeof parsed === 'object') {
      const leads = Array.isArray(parsed.leads)
        ? parsed.leads.filter((n) => [0, 1, 3, 7].includes(n))
        : NOTIFY_DEFAULT_LEADS;
      return { enabled: Boolean(parsed.enabled), leads };
    }
  } catch (error) {
    // fall through to defaults
  }
  return { enabled: false, leads: [...NOTIFY_DEFAULT_LEADS] };
}

function saveNotifySettings(settings) {
  safeSetItem(NOTIFY_KEY, JSON.stringify(settings));
}

function loadNotifySent() {
  try {
    const parsed = JSON.parse(safeGetItem(NOTIFY_SENT_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function describeNotifyDays(days) {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

function checkReminders() {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  const settings = loadNotifySettings();
  if (!settings.enabled || !settings.leads.length) return;

  const nowDate = new Date();
  const todayUtc = Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  const sent = loadNotifySent();
  const due = [];

  (state.data.subjects || []).forEach((subject) => {
    (subject.upcoming || []).forEach((item) => {
      const dateValue = dateStringValue(item.date);
      if (!dateValue) return;
      const days = Math.round((dateValue - todayUtc) / 86400000);
      if (days < 0) return;
      // The nearest lead time that has been reached (e.g. 1 day beats 1 week).
      const reached = settings.leads.filter((lead) => days <= lead).sort((a, b) => a - b);
      if (!reached.length) return;
      const key = `${subject.id}:${item.id || item.name}:${item.date}`;
      const already = new Set(sent[key] || []);
      if (already.has(reached[0])) return;
      reached.forEach((lead) => already.add(lead));
      sent[key] = Array.from(already);
      due.push({ subject, item, days });
    });
  });

  // Drop sent-markers for dates that have passed so storage doesn't grow forever.
  Object.keys(sent).forEach((key) => {
    const date = key.slice(key.lastIndexOf(':') + 1);
    if (dateStringValue(date) < todayUtc) delete sent[key];
  });
  safeSetItem(NOTIFY_SENT_KEY, JSON.stringify(sent));
  if (!due.length) return;

  due.sort((a, b) => a.days - b.days);
  const label = (entry) => {
    const kind = normalizeUpcomingType(entry.item.type) === 'homework' ? 'Homework' : 'Assessment';
    return `${entry.subject.name}: ${entry.item.name || kind} (${describeNotifyDays(entry.days)})`;
  };
  try {
    if (due.length === 1) {
      new Notification('Sapphire reminder', { body: label(due[0]), icon: 'favicon.png', tag: 'sapphire-reminder' });
    } else {
      new Notification(`${due.length} things coming up`, {
        body: due.slice(0, 4).map(label).join('\n') + (due.length > 4 ? `\n+${due.length - 4} more` : ''),
        icon: 'favicon.png',
        tag: 'sapphire-reminder',
      });
    }
  } catch (error) {
    // Some mobile browsers only allow notifications from a service worker.
  }
}

function syncNotifyUI(message = '') {
  const toggle = document.getElementById('notify-enabled');
  const leadsBox = document.getElementById('notify-leads');
  const messageEl = document.getElementById('notify-message');
  if (!toggle || !leadsBox) return;
  const settings = loadNotifySettings();
  const supported = notificationsSupported();
  const blocked = supported && Notification.permission === 'denied';
  toggle.checked = supported && settings.enabled && Notification.permission === 'granted';
  toggle.disabled = !supported || blocked;
  leadsBox.querySelectorAll('[data-notify-lead]').forEach((input) => {
    input.checked = settings.leads.includes(Number(input.dataset.notifyLead));
    input.disabled = !toggle.checked;
  });
  if (messageEl) {
    messageEl.textContent = message
      || (!supported ? 'This browser does not support notifications.'
        : blocked ? 'Notifications are blocked. Allow them in your browser site settings.'
        : '');
  }
}

function initNotifications() {
  const toggle = document.getElementById('notify-enabled');
  const leadsBox = document.getElementById('notify-leads');
  if (!toggle || !leadsBox) return;

  toggle.addEventListener('change', async () => {
    const settings = loadNotifySettings();
    if (toggle.checked) {
      let permission = Notification.permission;
      if (permission === 'default') permission = await Notification.requestPermission();
      settings.enabled = permission === 'granted';
      saveNotifySettings(settings);
      syncNotifyUI(settings.enabled ? 'Reminders on.' : 'Permission was not granted.');
      if (settings.enabled) checkReminders();
    } else {
      settings.enabled = false;
      saveNotifySettings(settings);
      syncNotifyUI('Reminders off.');
    }
  });

  leadsBox.addEventListener('change', () => {
    const settings = loadNotifySettings();
    settings.leads = Array.from(leadsBox.querySelectorAll('[data-notify-lead]'))
      .filter((input) => input.checked)
      .map((input) => Number(input.dataset.notifyLead));
    saveNotifySettings(settings);
    checkReminders();
  });

  syncNotifyUI();
  checkReminders();
  setInterval(checkReminders, 10 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkReminders();
  });
}
