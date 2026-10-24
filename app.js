const STORAGE_KEY = 'nsw-grade-tracker-v1';
const THEME_KEY = 'nsw-grade-theme';
const THEME_VARIANT_KEY = 'sapphire-theme-variant';
const TAB_KEY = 'sapphire-active-tab';
const GRAPH_SMOOTHNESS_KEY = 'sapphire-graph-smoothness';
const USER_NAME_KEY = 'sapphire-user-name';
const APPWRITE_SYNC_KEY = 'sapphire-last-sync';
const LEADERBOARD_RANKS_KEY = 'sapphire-leaderboard-ranks';
const UI_VERSION_KEY = 'sapphire-ui-version';

const APPWRITE_ENDPOINT = 'https://auth.sapphire.neonxsl.dev/v1';
const APPWRITE_PROJECT_ID = 'sapphire';
const APPWRITE_DATABASE_ID = 'sapphire-storage';
const APPWRITE_COLLECTION_ID = 'sapphire-storage';

const palette = [
  '#e26a49',
  '#ce8c5a',
  '#c89b77',
  '#d29086',
  '#e7ad57',
  '#5ebf73',
  '#427e80',
  '#417f68',
  '#77b3a7',
  '#57a8d3',
  '#3784cc',
  '#5774c1',
  '#6e67d7',
  '#d77bad',
  '#9c4663',
  '#6d7573'
];
const DEFAULT_SUBJECT_ICON = 'notebook';
const SUBJECT_ICON_OPTIONS = [
  { value: 'notebook', label: 'Notebook' },
  { value: 'book', label: 'Book' },
  { value: 'book-open', label: 'Book Open' },
  { value: 'books', label: 'Books' },
  { value: 'bookmark-simple', label: 'Bookmark' },
  { value: 'pencil-simple', label: 'Pencil' },
  { value: 'pen', label: 'Pen' },
  { value: 'calculator', label: 'Calculator' },
  { value: 'sigma', label: 'Sigma' },
  { value: 'flask', label: 'Flask' },
  { value: 'atom', label: 'Atom' },
  { value: 'globe-hemisphere-west', label: 'Globe West' },
  { value: 'globe', label: 'Globe' },
  { value: 'map-trifold', label: 'Map' },
  { value: 'compass', label: 'Compass' },
  { value: 'heartbeat', label: 'Heartbeat' },
  { value: 'hourglass', label: 'Hourglass' },
  { value: 'broadcast', label: 'Broadcast' },
  { value: 'jar', label: 'Jar' },
  { value: 'baby', label: 'Baby' },
  { value: 'shopping-cart', label: 'Shopping Cart' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'terminal-window', label: 'Terminal' },
  { value: 'code', label: 'Code' },
  { value: 'music-notes', label: 'Music Notes' },
  { value: 'music-note', label: 'Music Note' },
  { value: 'microphone', label: 'Microphone' },
  { value: 'wrench', label: 'Wrench' },
  { value: 'hammer', label: 'Hammer' },
  { value: 'scissors', label: 'Scissors' },
  { value: 'paint-brush', label: 'Paint Brush' },
  { value: 'palette', label: 'Palette' },
  { value: 'camera', label: 'Camera' },
  { value: 'film-strip', label: 'Film Strip' },
  { value: 'translate', label: 'Translate' },
  { value: 'fork-knife', label: 'Food' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'brain', label: 'Brain' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'lightbulb', label: 'Lightbulb' },
  { value: 'target', label: 'Target' },
  { value: 'trophy', label: 'Trophy' },
  { value: 'medal', label: 'Medal' },
  { value: 'rocket-launch', label: 'Rocket' },
  { value: 'airplane', label: 'Airplane' },
  { value: 'car', label: 'Car' },
  { value: 'house', label: 'House' },
  { value: 'storefront', label: 'Storefront' },
  { value: 'star', label: 'Star' },
];
const SUBJECT_ICON_VALUES = new Set(SUBJECT_ICON_OPTIONS.map((option) => option.value));
const CORE_SUBJECTS = ['English', 'Geography', 'History', 'Mathematics', 'PDHPE', 'Science'];
const ELECTIVE_SUBJECTS = [
  'Broadcast Media',
  'Ceramics',
  'Child Studies',
  'Commerce',
  'Computing Technology',
  'Dance',
  'Design and Technology',
  'Drama',
  'Food Technology',
  'Languages',
  'International Studies',
  'Multimedia',
  'Music',
  'Photography',
  'PASS',
  'Psychology',
  'Textiles',
  'Woodworking',
  'Visual Arts',
  'Visual Design',
];
const SUBJECT_ICON_PRESETS = {
  english: 'book-open',
  geography: 'globe-hemisphere-west',
  history: 'hourglass',
  mathematics: 'calculator',
  pdhpe: 'heartbeat',
  science: 'flask',
  'broadcast media': 'broadcast',
  ceramics: 'jar',
  'child studies': 'baby',
  commerce: 'bank',
  'computing technology': 'laptop',
  dance: 'music-notes',
  'design and technology': 'wrench',
  drama: 'microphone',
  'food technology': 'fork-knife',
  languages: 'translate',
  'international studies': 'globe',
  multimedia: 'film-strip',
  music: 'music-note',
  photography: 'camera',
  pass: 'barbell',
  psychology: 'brain',
  'textiles': 'scissors',
  woodworking: 'hammer',
  'visual arts': 'palette',
  'visual design': 'pen',
};

const SUBJECT_ALIASES = {
  'math': 'Mathematics',
  'maths': 'Mathematics',
  'mathematics': 'Mathematics',
  'eng': 'English',
  'english': 'English',
  'geo': 'Geography',
  'geography': 'Geography',
  'hist': 'History',
  'history': 'History',
  'sci': 'Science',
  'science': 'Science',
  'pe': 'PDHPE',
  'pdhpe': 'PDHPE',
  'pd': 'PDHPE',
  'pass': 'PASS',
  'biz': 'Commerce',
  'business': 'Commerce',
  'commerce': 'Commerce',
  'music': 'Music',
  'drama': 'Drama',
  'art': 'Visual Arts',
  'visual arts': 'Visual Arts',
  'va': 'Visual Arts',
  'dt': 'Design and Technology',
  'design': 'Design and Technology',
  'food tech': 'Food Technology',
  'food technology': 'Food Technology',
  'ist': 'Information Software Technology',
  'computing': 'Computing Technology',
  'computing technology': 'Computing Technology',
  'chem': 'Chemistry',
  'chemistry': 'Chemistry',
  'bio': 'Biology',
  'biology': 'Biology',
  'phys': 'Physics',
  'physics': 'Physics',
  'legal': 'Legal Studies',
  'legal studies': 'Legal Studies',
  'eco': 'Economics',
  'economics': 'Economics',
};
const LEADERBOARD_SUMMARY_NAME = 'Subject average';
const CORE_LEADERBOARD_SUBJECTS = new Set(['Mathematics', 'English', 'Science', 'History', 'Geography', 'Commerce']);
const LIGHT_THEMES = ['pearl', 'mint', 'sunrise', 'sky'];
const DARK_THEMES = ['midnight', 'aurora', 'cosmic', 'sapphire'];
const MONTH_AXIS_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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
let timetableTodayProgressInterval = null;
let confirmResolver = null;
let confirmCleanup = null;
let iconPickerResolver = null;
let importUpcomingMapResolver = null;
let leaderboardDocs = [];
let leaderboardFetchId = 0;
let leaderboardRankBaseline = null;
let leaderboardUnsubscribe = null;
let leaderboardRefreshTimer = null;
let leaderboardSyncTimer = null;
let leaderboardSyncRunning = false;
let leaderboardSyncQueued = false;

const onboardingState = {
  step: 0,
};

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

function safeSetItem(key, value) {
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

const state = {
  data: loadData(),
  theme: loadThemeSettings(),
  graphSmoothness: loadGraphSmoothness(),
  upcomingExpanded: false,
  timetableView: {
    selectedWeek: 'current',
  },
  assessmentTable: {
    search: '',
    sortKey: 'date',
    sortDirection: 'desc',
  },
};

const elements = {
  pageGreeting: document.getElementById('page-greeting'),
  overallLetter: document.getElementById('overall-letter'),
  overallPercent: document.getElementById('overall-percent'),
  overallSub: document.getElementById('overall-sub'),
  overallSubjects: document.getElementById('overall-subjects'),
  overallAssessments: document.getElementById('overall-assessments'),
  overallBest: document.getElementById('overall-best'),
  overallGradeSquare: document.getElementById('overall-grade-square'),
  navLeaderboard: document.getElementById('nav-leaderboard'),
  leaderboardSubjectSelect: document.getElementById('leaderboard-subject-select'),
  leaderboardList: document.getElementById('leaderboard-list'),
  leaderboardAutoShare: document.getElementById('leaderboard-auto-share'),
  leaderboardPrivacyOpen: document.getElementById('leaderboard-privacy-open'),
  leaderboardPrivacyModal: document.getElementById('leaderboard-privacy-modal'),
  leaderboardPrivacySubjects: document.getElementById('leaderboard-privacy-subjects'),
  leaderboardPrivacyNewNote: document.getElementById('leaderboard-privacy-new-note'),
  leaderboardPrivacyHideRaw: document.getElementById('leaderboard-privacy-hide-raw'),
  leaderboardPrivacyAverages: document.getElementById('leaderboard-privacy-averages'),
  leaderboardPrivacyMessage: document.getElementById('leaderboard-privacy-message'),
  leaderboardResync: document.getElementById('leaderboard-resync'),
  authButton: document.getElementById('auth-button'),
  authMenu: document.getElementById('auth-menu'),
  authMenuAction: document.getElementById('auth-menu-action'),
  profileAvatar: document.getElementById('profile-avatar'),
  profileFallback: document.getElementById('profile-fallback'),
  profileCardAvatar: document.getElementById('profile-card-avatar'),
  profileCardFallback: document.getElementById('profile-card-fallback'),
  profileCardName: document.getElementById('profile-card-name'),
  syncStatus: document.getElementById('sync-status'),
  topSubjectIcon: document.getElementById('top-subject-icon'),
  topSubjectName: document.getElementById('top-subject-name'),
  topSubjectGrade: document.getElementById('top-subject-grade'),
  topSubjectFooter: document.getElementById('top-subject-footer'),
  latestName: document.getElementById('latest-name'),
  latestScore: document.getElementById('latest-score'),
  latestMeta: document.getElementById('latest-meta'),
  upcomingCard: document.getElementById('upcoming-card'),
  upcomingList: document.getElementById('upcoming-list'),
  upcomingToggle: document.getElementById('upcoming-toggle'),
  upcomingAdd: document.getElementById('upcoming-add'),
  subjectGrid: document.getElementById('subjects-grid'),
  assessmentTable: document.getElementById('assessment-table'),
  assessmentSearch: document.getElementById('assessment-search'),
  shareAllAssessments: document.getElementById('share-all-assessments'),
  assessmentTableHead: document.getElementById('assessment-table-head'),
  overallChart: document.getElementById('overall-chart'),
  progressLegend: document.getElementById('progress-legend'),
  subjectsChart: document.getElementById('subjects-chart'),
  subjectsLegend: document.getElementById('subjects-legend'),
  subjectsKey: document.getElementById('subjects-key'),
  insightList: document.getElementById('insight-list'),
  exportOpen: document.getElementById('export-open'),
  exportModal: document.getElementById('export-modal'),
  settingsOpen: document.getElementById('settings-open'),
  uiV2Toggle: document.getElementById('ui-v2-toggle'),
  uiBetaChip: document.getElementById('ui-beta-chip'),
  quickAdd: document.getElementById('quick-add'),
  quickAddButton: document.getElementById('quick-add-button'),
  quickAddMenu: document.getElementById('quick-add-menu'),
  quickAddList: document.getElementById('quick-add-list'),
  settingsModal: document.getElementById('settings-modal'),
  exportPreset: document.getElementById('export-preset'),
  exportUpcomingType: document.getElementById('export-upcoming-type'),
  exportUpcomingTypeField: document.getElementById('export-upcoming-type-field'),
  exportSubjectsField: document.getElementById('export-subjects-field'),
  exportSubjectsList: document.getElementById('export-subjects-list'),
  exportSubjectsAll: document.getElementById('export-subjects-all'),
  exportSubjectsNone: document.getElementById('export-subjects-none'),
  exportGenerate: document.getElementById('export-generate'),
  exportOutput: document.getElementById('export-output'),
  exportCopy: document.getElementById('export-copy'),
  exportMessage: document.getElementById('export-message'),
  importInput: document.getElementById('import-input'),
  importRestore: document.getElementById('import-restore'),
  importMessage: document.getElementById('import-message'),
  importUpcomingMapModal: document.getElementById('import-upcoming-map-modal'),
  importUpcomingMapForm: document.getElementById('import-upcoming-map-form'),
  importUpcomingMapList: document.getElementById('import-upcoming-map-list'),
  importUpcomingMapMessage: document.getElementById('import-upcoming-map-message'),
  resetData: document.getElementById('reset-data'),
  addSubjectOpen: document.getElementById('add-subject-open'),
  addSubjectModal: document.getElementById('add-subject-modal'),
  addSubjectForm: document.getElementById('add-subject-form'),
  addSubjectName: document.getElementById('add-subject-name'),
  addSubjectIcon: document.getElementById('add-subject-icon'),
  addSubjectIconPreview: document.getElementById('add-subject-icon-preview'),
  addSubjectIconCarousel: document.getElementById('add-subject-icon-carousel'),
  addSubjectColor: document.getElementById('add-subject-color'),
  addSubjectColorValue: document.getElementById('add-subject-color-value'),
  addSubjectSwatches: document.getElementById('add-subject-swatches'),
  subjectMessage: document.getElementById('subject-message'),
  subjectModal: document.getElementById('subject-modal'),
  subjectModalBody: document.getElementById('subject-modal-body'),
  subjectModalTitle: document.getElementById('subject-modal-title'),
  subjectModalMeta: document.getElementById('subject-modal-meta'),
  editSubjectModal: document.getElementById('edit-subject-modal'),
  editSubjectForm: document.getElementById('edit-subject-form'),
  editSubjectId: document.getElementById('edit-subject-id'),
  editSubjectName: document.getElementById('edit-subject-name'),
  editSubjectTarget: document.getElementById('edit-subject-target'),
  editSubjectIcon: document.getElementById('edit-subject-icon'),
  editSubjectIconPreview: document.getElementById('edit-subject-icon-preview'),
  editSubjectIconCarousel: document.getElementById('edit-subject-icon-carousel'),
  editSubjectColor: document.getElementById('edit-subject-color'),
  editSubjectColorValue: document.getElementById('edit-subject-color-value'),
  editSubjectSwatches: document.getElementById('edit-subject-swatches'),
  editSubjectMessage: document.getElementById('edit-subject-message'),
  assessmentModal: document.getElementById('assessment-modal'),
  assessmentForm: document.getElementById('assessment-form'),
  assessmentId: document.getElementById('assessment-id'),
  assessmentMessage: document.getElementById('assessment-message'),
  assessmentSubjectName: document.getElementById('assessment-subject-name'),
  assessmentSubjectId: document.getElementById('assessment-subject-id'),
  assessmentComponentsPanel: document.getElementById('assessment-components-panel'),
  assessmentComponentsList: document.getElementById('assessment-components-list'),
  addAssessmentComponent: document.getElementById('add-assessment-component'),
  upcomingModal: document.getElementById('upcoming-modal'),
  upcomingForm: document.getElementById('upcoming-form'),
  upcomingMessage: document.getElementById('upcoming-message'),
  upcomingModalEyebrow: document.getElementById('upcoming-modal-eyebrow'),
  upcomingModalTitle: document.getElementById('upcoming-modal-title'),
  upcomingModalMeta: document.getElementById('upcoming-modal-meta'),
  upcomingSubmit: document.getElementById('upcoming-submit'),
  upcomingSubjectSelect: document.getElementById('upcoming-subject-select'),
  upcomingTypeSelect: document.getElementById('upcoming-type-select'),
  upcomingWeightField: document.getElementById('upcoming-weight-field'),
  upcomingWeightInput: document.getElementById('upcoming-weight-input'),
  chartTooltip: document.getElementById('chart-tooltip'),
  themeButtons: document.querySelectorAll('[data-theme-variant]'),
  navItems: document.querySelectorAll('[data-tab]'),
  views: document.querySelectorAll('[data-view]'),
  calendarMonth: document.getElementById('calendar-month'),
  calendarGrid: document.getElementById('calendar-grid'),
  calendarPrev: document.getElementById('calendar-prev'),
  calendarNext: document.getElementById('calendar-next'),
  calendarTypeFilters: document.querySelectorAll('[data-calendar-type-filter]'),
  timetableUpload: document.getElementById('timetable-upload'),
  timetableImportCard: document.getElementById('timetable-import-card'),
  timetableImportControls: document.getElementById('timetable-import-controls'),
  timetableImportMovedNote: document.getElementById('timetable-import-moved-note'),
  timetableClear: document.getElementById('timetable-clear'),
  timetableImportMessage: document.getElementById('timetable-import-message'),
  timetableSourceMeta: document.getElementById('timetable-source-meta'),
  settingsTimetableBlock: document.getElementById('settings-timetable-block'),
  settingsTimetableUpload: document.getElementById('settings-timetable-upload'),
  settingsTimetableClear: document.getElementById('settings-timetable-clear'),
  settingsTimetableMessage: document.getElementById('settings-timetable-message'),
  settingsTimetableSourceMeta: document.getElementById('settings-timetable-source-meta'),
  timetableTodayTitle: document.getElementById('timetable-today-title'),
  timetableTodayList: document.getElementById('timetable-today-list'),
  timetableWeekTitle: document.getElementById('timetable-week-title'),
  timetableWeekRange: document.getElementById('timetable-week-range'),
  timetableWeekGrid: document.getElementById('timetable-week-grid'),
  timetableWeekSwitch: document.getElementById('timetable-week-switch'),
  timetableSwapWeeks: document.getElementById('timetable-swap-weeks'),
  timetableMapList: document.getElementById('timetable-map-list'),
  timetableClassModal: document.getElementById('timetable-class-modal'),
  timetableClassForm: document.getElementById('timetable-class-form'),
  timetableClassTitle: document.getElementById('timetable-class-title'),
  timetableClassMeta: document.getElementById('timetable-class-meta'),
  timetableClassKey: document.getElementById('timetable-class-key'),
  timetableClassSubject: document.getElementById('timetable-class-subject'),
  timetableClassCustomize: document.getElementById('timetable-class-customize'),
  timetableClassLockNote: document.getElementById('timetable-class-lock-note'),
  timetableClassName: document.getElementById('timetable-class-name'),
  timetableClassColor: document.getElementById('timetable-class-color'),
  timetableClassColorValue: document.getElementById('timetable-class-color-value'),
  timetableClassSwatches: document.getElementById('timetable-class-swatches'),
  timetableClassIcon: document.getElementById('timetable-class-icon'),
  timetableClassIconPreview: document.getElementById('timetable-class-icon-preview'),
  timetableClassIconCarousel: document.getElementById('timetable-class-icon-carousel'),
  timetableClassMessage: document.getElementById('timetable-class-message'),
  graphSmoothnessRange: document.getElementById('graph-smoothness'),
  graphSmoothnessValue: document.getElementById('graph-smoothness-value'),
  settingsForm: document.getElementById('settings-form'),
  settingsName: document.getElementById('settings-name'),
  settingsMessage: document.getElementById('settings-message'),
  subjectsOrderOpen: document.getElementById('subjects-order-open'),
  subjectsOrderModal: document.getElementById('subjects-order-modal'),
  subjectsOrderList: document.getElementById('subjects-order-list'),
  onboardingModal: document.getElementById('onboarding-modal'),
  onboardingForm: document.getElementById('onboarding-form'),
  onboardingName: document.getElementById('onboarding-name'),
  onboardingMessage: document.getElementById('onboarding-message'),
  onboardingSkip: document.getElementById('onboarding-skip'),
  onboardingImportOpen: document.getElementById('onboarding-import-open'),
  onboardingImportModal: document.getElementById('onboarding-import-modal'),
  onboardingImportInput: document.getElementById('onboarding-import-input'),
  onboardingImportApply: document.getElementById('onboarding-import-apply'),
  onboardingImportMessage: document.getElementById('onboarding-import-message'),
  onboardingAuth: document.getElementById('onboarding-auth'),
  onboardingGuest: document.getElementById('onboarding-guest'),
  onboardingBack: document.getElementById('onboarding-back'),
  onboardingNext: document.getElementById('onboarding-next'),
  onboardingFinish: document.getElementById('onboarding-finish'),
  onboardingProgressBar: document.getElementById('onboarding-progress-bar'),
  onboardingGraphSmoothness: document.getElementById('onboarding-graph-smoothness'),
  onboardingGraphSmoothnessValue: document.getElementById('onboarding-graph-smoothness-value'),
  onboardingTimetableUpload: document.getElementById('onboarding-timetable-upload'),
  onboardingTimetableMessage: document.getElementById('onboarding-timetable-message'),
  onboardingSmoothingPreview: document.getElementById('onboarding-smoothing-preview'),
  electiveGrid: document.getElementById('elective-grid'),
  customElectiveAdd: document.getElementById('custom-elective-add'),
  customElectiveList: document.getElementById('custom-elective-list'),
  confirmModal: document.getElementById('confirm-modal'),
  confirmTitle: document.getElementById('confirm-title'),
  confirmMessage: document.getElementById('confirm-message'),
  confirmAccept: document.getElementById('confirm-accept'),
  confirmCancel: document.getElementById('confirm-cancel'),
  iconPickerModal: document.getElementById('icon-picker-modal'),
  iconPickerForm: document.getElementById('icon-picker-form'),
  iconPickerInput: document.getElementById('icon-picker-input'),
  iconPickerPreview: document.getElementById('icon-picker-preview'),
  iconPickerMessage: document.getElementById('icon-picker-message'),
  iconPickerCancel: document.getElementById('icon-picker-cancel'),
};

const now = new Date();
const today = dateKeyFromParts(now.getFullYear(), now.getMonth(), now.getDate());
const todayValue = dateStringValue(today);
const calendarState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  filter: 'both',
  // V2 only: the day shown in the agenda panel (YYYY-MM-DD).
  selected: null,
};

let activeSubjectId = null;
// Hypothetical marks for the open subject popup. Never saved; cleared when the popup closes.
let whatIfState = { subjectId: null, open: false, rows: [] };
let activeTimetableClassKey = null;
let draggingOrderId = null;
let currentOrderDropTarget = null;
let pendingAssessmentConversion = null;
let pendingUpcomingEdit = null;
let assessmentComponents = [];
const hiddenSubjectsChartIds = new Set();
const ASSESSMENT_SORT_KEYS = new Set(['subject', 'weight', 'percent', 'grade', 'date']);
const GRADE_SORT_ORDER = new Map([
  ['E', 0],
  ['D-', 1],
  ['D', 2],
  ['D+', 3],
  ['C-', 4],
  ['C', 5],
  ['C+', 6],
  ['B-', 7],
  ['B', 8],
  ['B+', 9],
  ['A-', 10],
  ['A', 11],
  ['A+', 12],
]);

setTheme(state.theme.mode, state.theme.variant);
initTabs();
renderElectiveGrid();
renderExportSubjectFilters();
updateExportFilterAvailability();

updateGreeting();
maybeStartOnboarding();

render();
updateGraphSmoothnessUI();
renderOnboardingSmoothingPreview();
initAppwrite();

window.addEventListener('resize', () => {
  renderCharts();
});

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

initNotifications();

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

if (elements.themeButtons) {
  elements.themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.themeMode || 'light';
      const variant = button.dataset.themeVariant || resolveVariant(mode);
      setTheme(mode, variant);
      renderCharts();
      renderCalendar();
      if (elements.themeModal?.classList.contains('is-open')) {
        closeModal(elements.themeModal);
      }
    });
  });
}

if (elements.graphSmoothnessRange) {
  elements.graphSmoothnessRange.addEventListener('input', (event) => {
    const value = Number(event.target.value);
    setGraphSmoothness(value / 100);
  });
}

if (elements.onboardingGraphSmoothness) {
  elements.onboardingGraphSmoothness.addEventListener('input', (event) => {
    const value = Number(event.target.value);
    setGraphSmoothness(value / 100);
    updateOnboardingGraphSmoothnessUI();
  });
}

if (elements.exportOpen) {
  elements.exportOpen.addEventListener('click', () => {
    renderExportSubjectFilters();
    openModal(elements.exportModal);
  });
}

if (elements.settingsOpen) {
  elements.settingsOpen.addEventListener('click', () => openModal(elements.settingsModal));
}

// The beta UI is a styling layer (styles-v2.css) switched on by <html data-ui="v2">.
// index.html sets the attribute before first paint so there is no flash of V1.
function isUiV2() {
  return document.documentElement.dataset.ui === 'v2';
}

function setUiVersion(version) {
  const useV2 = version === 'v2';
  if (useV2) {
    document.documentElement.dataset.ui = 'v2';
  } else {
    delete document.documentElement.dataset.ui;
  }
  safeSetItem(UI_VERSION_KEY, useV2 ? 'v2' : 'v1');
  if (elements.uiV2Toggle) {
    elements.uiV2Toggle.checked = useV2;
  }
  closeQuickAddMenu();
  render();
  if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId) {
    openSubjectModal(activeSubjectId);
  }
}

if (elements.uiV2Toggle) {
  elements.uiV2Toggle.checked = isUiV2();
  elements.uiV2Toggle.addEventListener('change', (event) => {
    setUiVersion(event.target.checked ? 'v2' : 'v1');
  });
}

if (elements.uiBetaChip) {
  elements.uiBetaChip.addEventListener('click', () => openModal(elements.settingsModal));
}

function renderQuickAddMenu() {
  if (!elements.quickAddList) return;
  elements.quickAddList.innerHTML = state.data.subjects
    .map(
      (subject) => `
        <button class="quick-add-item" type="button" role="menuitem" data-quick-add-subject="${escapeHtml(subject.id)}">
          <span class="quick-add-icon" style="background:${subject.color}">${subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name))}</span>
          <span>${escapeHtml(subject.name)}</span>
        </button>
      `
    )
    .join('');
}

function openQuickAddMenu() {
  if (!elements.quickAddMenu) return;
  renderQuickAddMenu();
  elements.quickAddMenu.hidden = false;
  elements.quickAddButton?.setAttribute('aria-expanded', 'true');
  elements.quickAddMenu.querySelector('button')?.focus();
}

function closeQuickAddMenu() {
  if (!elements.quickAddMenu || elements.quickAddMenu.hidden) return;
  elements.quickAddMenu.hidden = true;
  elements.quickAddButton?.setAttribute('aria-expanded', 'false');
}

if (elements.quickAddButton) {
  elements.quickAddButton.addEventListener('click', () => {
    const subjects = state.data.subjects;
    if (subjects.length === 0) {
      openAddSubjectPopup();
    } else if (subjects.length === 1) {
      openAssessmentModal(subjects[0].id);
    } else if (elements.quickAddMenu?.hidden) {
      openQuickAddMenu();
    } else {
      closeQuickAddMenu();
    }
  });
}

if (elements.quickAddList) {
  elements.quickAddList.addEventListener('click', (event) => {
    const subjectId = event.target.closest('[data-quick-add-subject]')?.dataset.quickAddSubject;
    if (!subjectId) return;
    closeQuickAddMenu();
    openAssessmentModal(subjectId);
  });
}

document.addEventListener('click', (event) => {
  if (!elements.quickAdd?.contains(event.target)) closeQuickAddMenu();
  if (!event.target.closest('.more-menu')) {
    document.querySelectorAll('.more-menu-list:not([hidden])').forEach((menu) => {
      menu.hidden = true;
      menu.previousElementSibling?.setAttribute('aria-expanded', 'false');
    });
  }
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

if (elements.settingsModal) {
  elements.settingsModal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    if (actionTarget.dataset.action === 'close-settings') {
      closeModal(elements.settingsModal);
    }
  });
}

if (elements.addSubjectOpen) {
  elements.addSubjectOpen.addEventListener('click', () => {
    if (elements.addSubjectModal?.classList.contains('is-open')) {
      closeAddSubjectPopup();
      return;
    }
    openAddSubjectPopup();
  });
}

if (elements.subjectsOrderOpen) {
  elements.subjectsOrderOpen.addEventListener('click', () => {
    closeAddSubjectPopup();
    renderSubjectsOrderList();
    openModal(elements.subjectsOrderModal);
  });
}

if (elements.subjectsOrderModal) {
  elements.subjectsOrderModal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;
    if (action === 'close-subjects-order') {
      closeModal(elements.subjectsOrderModal);
      return;
    }
  });
}

if (elements.subjectsOrderList) {
  elements.subjectsOrderList.addEventListener('dragstart', (event) => {
    const item = event.target.closest('[data-order-item]');
    if (!item) return;
    draggingOrderId = item.dataset.id || null;
    item.classList.add('is-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggingOrderId || '');
  });

  elements.subjectsOrderList.addEventListener('dragend', (event) => {
    const item = event.target.closest('[data-order-item]');
    if (item) {
      item.classList.remove('is-dragging');
    }
    draggingOrderId = null;
    setOrderDropTarget(null);
  });

  elements.subjectsOrderList.addEventListener('dragover', (event) => {
    if (!draggingOrderId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const target = event.target.closest('[data-order-item]');
    if (!target || target.dataset.id === draggingOrderId) return;
    setOrderDropTarget(target);
    const dragging = elements.subjectsOrderList.querySelector('[data-order-item].is-dragging');
    if (!dragging) return;
    const rect = target.getBoundingClientRect();
    const isAfter = event.clientY - rect.top > rect.height / 2;
    const reference = isAfter ? target.nextSibling : target;
    if (reference !== dragging) {
      elements.subjectsOrderList.insertBefore(dragging, reference);
    }
  });

  elements.subjectsOrderList.addEventListener('drop', (event) => {
    if (!draggingOrderId) return;
    event.preventDefault();
    reorderSubjectsFromOrderList();
    setOrderDropTarget(null);
  });
}

if (elements.addSubjectModal) {
  elements.addSubjectModal.addEventListener('click', async (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;

    if (action === 'close-add-subject') {
      closeAddSubjectPopup();
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

    if (action === 'set-add-subject-color') {
      setAddSubjectColor(actionTarget.dataset.color);
      return;
    }

    if (action === 'set-add-subject-icon') {
      setAddSubjectIcon(actionTarget.dataset.icon);
      return;
    }

    if (action === 'set-add-subject-icon-other') {
      const current = normalizeSubjectIcon(elements.addSubjectIcon?.value);
      const icon = await showCustomIconPicker(current);
      if (!icon) return;
      setAddSubjectIcon(icon);
    }
  });
}

if (elements.addSubjectForm) {
  elements.addSubjectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(elements.addSubjectForm);
    const subjectName = String(formData.get('subjectName') || '').trim();
    const icon = resolveSubjectIcon(formData.get('subjectIcon'), subjectName);
    const color = normalizeColorValue(formData.get('subjectColor'))
      || palette[state.data.subjects.length % palette.length];

    if (!subjectName) {
      return setSubjectMessage('Please enter a subject name.');
    }

    const existing = state.data.subjects.find(
      (subject) => subject.name.toLowerCase() === subjectName.toLowerCase()
    );
    if (existing) {
      return setSubjectMessage('That subject already exists.');
    }

    getOrCreateSubject(subjectName, { icon, color });
    saveData(state.data);
    render();
    closeAddSubjectPopup();
  });
}

if (elements.addSubjectModal) {
  elements.addSubjectModal.addEventListener('input', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.name === 'subjectColor') {
      setAddSubjectColor(target.value);
    }
    if (target === elements.addSubjectName) {
      setSubjectMessage('');
    }
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

if (elements.confirmModal) {
  elements.confirmModal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    if (actionTarget.dataset.action === 'close-confirm') {
      dismissConfirm(false);
    }
  });
}

if (elements.iconPickerModal) {
  elements.iconPickerModal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    if (actionTarget.dataset.action === 'close-icon-picker') {
      dismissIconPicker(null);
    }
  });
}

if (elements.iconPickerForm) {
  elements.iconPickerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyIconPickerSelection();
  });
}

if (elements.iconPickerInput) {
  elements.iconPickerInput.addEventListener('input', (event) => {
    const value = String(event.target.value || '');
    updateIconPickerPreview(value);
    if (!value || normalizeSubjectIcon(value)) {
      setIconPickerMessage('');
    }
  });
}

if (elements.iconPickerCancel) {
  elements.iconPickerCancel.addEventListener('click', () => {
    dismissIconPicker(null);
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

if (elements.onboardingForm) {
  elements.onboardingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!isOnboardingFinalStep()) {
      advanceOnboardingStep();
      return;
    }
    finishOnboarding({ skipElectives: false });
  });
}

if (elements.onboardingSkip) {
  elements.onboardingSkip.addEventListener('click', () => {
    finishOnboarding({ skipElectives: true });
  });
}

if (elements.onboardingImportOpen) {
  elements.onboardingImportOpen.addEventListener('click', () => {
    openModal(elements.onboardingImportModal);
  });
}

if (elements.onboardingAuth) {
  elements.onboardingAuth.addEventListener('click', () => {
    handleAuthAction();
  });
}

if (elements.onboardingGuest) {
  elements.onboardingGuest.addEventListener('click', () => {
    advanceOnboardingStep();
  });
}

if (elements.onboardingBack) {
  elements.onboardingBack.addEventListener('click', () => {
    retreatOnboardingStep();
  });
}

if (elements.onboardingNext) {
  elements.onboardingNext.addEventListener('click', () => {
    advanceOnboardingStep();
  });
}

if (elements.onboardingImportModal) {
  elements.onboardingImportModal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    if (actionTarget.dataset.action === 'close-onboarding-import') {
      closeModal(elements.onboardingImportModal);
    }
  });
}

if (elements.onboardingImportApply) {
  elements.onboardingImportApply.addEventListener('click', () => {
    const raw = elements.onboardingImportInput ? elements.onboardingImportInput.value.trim() : '';
    if (!raw) {
      return setOnboardingImportMessage('Paste a share code to continue.');
    }
    const payload = decodeExportString(raw);
    if (!payload) {
      return setOnboardingImportMessage('That code could not be read.');
    }
    if (payload.selection?.scope !== 'all') {
      return setOnboardingImportMessage('Only full-share codes can skip setup.');
    }
    const nextData = buildDataFromExportPayload(payload);
    if (!nextData) {
      return setOnboardingImportMessage('No data found in that code.');
    }
    applyImportedProfile(payload);
    state.data = normalizeData(nextData);
    saveData(state.data);
    render();
    closeModal(elements.onboardingImportModal);
    closeModal(elements.onboardingModal);
    setOnboardingImportMessage('');
  });
}

if (elements.customElectiveAdd) {
  elements.customElectiveAdd.addEventListener('click', () => {
    addCustomElectiveRow();
  });
}

if (elements.customElectiveList) {
  elements.customElectiveList.addEventListener('click', async (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;

    if (action === 'carousel-prev') {
      scrollIconCarousel(actionTarget, -1);
      return;
    }

    if (action === 'carousel-next') {
      scrollIconCarousel(actionTarget, 1);
      return;
    }

    if (action === 'set-custom-elective-icon') {
      const row = actionTarget.closest('[data-custom-elective-row]');
      const hiddenInput = row?.querySelector('input[name="customElectiveIcon"]');
      const icon = resolveSubjectIcon(actionTarget.dataset.icon, '');
      if (hiddenInput) {
        hiddenInput.value = icon;
      }
      const carousel = actionTarget.closest('[data-icon-carousel]');
      setIconCarouselActive(carousel, icon);
      return;
    }

    if (action === 'set-custom-elective-icon-other') {
      const row = actionTarget.closest('[data-custom-elective-row]');
      const hiddenInput = row?.querySelector('input[name="customElectiveIcon"]');
      const current = normalizeSubjectIcon(hiddenInput?.value);
      const icon = await showCustomIconPicker(current);
      if (!icon) return;
      if (hiddenInput) {
        hiddenInput.value = icon;
      }
      const carousel = actionTarget.closest('[data-icon-carousel]');
      setIconCarouselActive(carousel, icon);
      return;
    }

    const button = event.target.closest('[data-action="remove-custom-elective"]');
    if (!button) return;
    const row = button.closest('[data-custom-elective-row]');
    if (row) {
      row.remove();
    }
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

if (elements.upcomingAdd) {
  elements.upcomingAdd.addEventListener('click', () => {
    openUpcomingModal();
  });
}

if (elements.upcomingToggle) {
  elements.upcomingToggle.addEventListener('click', () => {
    state.upcomingExpanded = !state.upcomingExpanded;
    renderUpcomingDashboard();
  });
}

document.getElementById('upcoming-delete')?.addEventListener('click', async () => {
  if (!pendingUpcomingEdit) return;
  const { subjectId, upcomingId } = pendingUpcomingEdit;
  const confirmed = await showConfirm({
    title: 'Delete upcoming item?',
    message: 'This will remove the upcoming item.',
    confirmLabel: 'Delete',
    danger: true,
  });
  if (!confirmed) return;
  closeUpcomingModal();
  removeUpcoming(subjectId, upcomingId);
});

if (elements.upcomingModal) {
  elements.upcomingModal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    if (actionTarget.dataset.action === 'close-upcoming') {
      closeUpcomingModal();
    }
  });
}

if (elements.upcomingForm) {
  elements.upcomingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(elements.upcomingForm);
    const subjectId = String(formData.get('subjectId') || '').trim();
    const upcomingType = normalizeUpcomingType(formData.get('upcomingType'));
    const upcomingName = String(formData.get('upcomingName') || '').trim();
    const upcomingWeightInput = formData.get('upcomingWeight');
    const upcomingWeight = upcomingWeightInput === '' ? null : parseFloat(upcomingWeightInput);
    const upcomingDate = String(formData.get('upcomingDate') || '').trim();
    const upcomingNotes = String(formData.get('upcomingNotes') || '').trim();

    if (!subjectId) {
      return setUpcomingMessage('Choose a subject first.');
    }
    const subject = state.data.subjects.find((item) => item.id === subjectId);
    if (!subject) {
      return setUpcomingMessage('Select a valid subject.');
    }
    if (!upcomingName) {
      return setUpcomingMessage('Please enter an assessment name.');
    }
    if (upcomingType === 'assessment' && upcomingWeight !== null && (!Number.isFinite(upcomingWeight) || upcomingWeight < 0)) {
      return setUpcomingMessage('Weighting must be a positive number.');
    }
    if (!upcomingDate) {
      return setUpcomingMessage('Please choose a due date.');
    }

    const editContext = pendingUpcomingEdit;
    subject.upcoming = Array.isArray(subject.upcoming) ? subject.upcoming : [];
    if (editContext) {
      const sourceSubject = state.data.subjects.find((item) => item.id === editContext.subjectId);
      if (!sourceSubject) {
        return setUpcomingMessage('Could not find the original subject for this upcoming item.');
      }
      sourceSubject.upcoming = Array.isArray(sourceSubject.upcoming) ? sourceSubject.upcoming : [];
      const sourceIndex = sourceSubject.upcoming.findIndex((item) => item.id === editContext.upcomingId);
      if (sourceIndex < 0) {
        return setUpcomingMessage('Could not find that upcoming item.');
      }
      const existingItem = sourceSubject.upcoming[sourceIndex];
      const updatedUpcoming = {
        id: existingItem.id,
        name: upcomingName,
        type: upcomingType,
        weight: upcomingType === 'assessment' ? upcomingWeight : null,
        date: upcomingDate,
        notes: upcomingNotes,
        createdAt: Number.isFinite(existingItem.createdAt) ? existingItem.createdAt : Date.now(),
      };

      if (subjectId === editContext.subjectId) {
        sourceSubject.upcoming[sourceIndex] = updatedUpcoming;
      } else {
        sourceSubject.upcoming.splice(sourceIndex, 1);
        subject.upcoming.push(updatedUpcoming);
      }
    } else {
      subject.upcoming.push({
        id: cryptoRandomId(),
        name: upcomingName,
        type: upcomingType,
        weight: upcomingType === 'assessment' ? upcomingWeight : null,
        date: upcomingDate,
        notes: upcomingNotes,
        createdAt: Date.now(),
      });
    }

    saveData(state.data);
    render();
    closeUpcomingModal();
  });
}

if (elements.subjectGrid) {
  elements.subjectGrid.addEventListener('click', (event) => {
    const openButton = event.target.closest('[data-action="open-subject"]');
    if (openButton) {
      openSubjectModal(openButton.dataset.id);
    }
  });
}

if (elements.subjectsKey) {
  elements.subjectsKey.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-action="toggle-subject-line"]');
    if (!toggle) return;
    const subjectId = toggle.dataset.subjectId;
    if (!subjectId) return;
    if (hiddenSubjectsChartIds.has(subjectId)) {
      hiddenSubjectsChartIds.delete(subjectId);
    } else {
      hiddenSubjectsChartIds.add(subjectId);
    }
    hideChartTooltip();
    renderSubjectsChart();
  });
}

if (elements.subjectModal) {
  elements.subjectModal.addEventListener('input', (event) => {
    const input = event.target.closest('[data-what-if-field]');
    if (!input) return;
    const row = whatIfState.rows[Number(input.dataset.whatIfIndex)];
    if (!row) return;
    row[input.dataset.whatIfField] = input.value;
    renderWhatIfResult();
  });

  elements.subjectModal.addEventListener(
    'toggle',
    (event) => {
      if (event.target.id !== 'what-if-panel') return;
      whatIfState.open = event.target.open;
      renderWhatIfResult();
    },
    true
  );

  elements.subjectModal.addEventListener('click', async (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;

    if (action === 'carousel-prev') {
      scrollIconCarousel(actionTarget, -1);
      return;
    }

    if (action === 'carousel-next') {
      scrollIconCarousel(actionTarget, 1);
      return;
    }

    if (action === 'close-subject') {
      closeSubjectModal();
      return;
    }

    const openMenu = actionTarget.closest('.more-menu-list');
    if (openMenu) {
      openMenu.hidden = true;
      openMenu.previousElementSibling?.setAttribute('aria-expanded', 'false');
    }

    if (action === 'toggle-more-menu') {
      const menu = actionTarget.nextElementSibling;
      if (!menu) return;
      menu.hidden = !menu.hidden;
      actionTarget.setAttribute('aria-expanded', String(!menu.hidden));
      if (!menu.hidden) menu.querySelector('button')?.focus();
      return;
    }

    if (action === 'open-assessment') {
      if (activeSubjectId) {
        openAssessmentModal(activeSubjectId);
      }
      return;
    }

    if (action === 'open-upcoming') {
      if (activeSubjectId) {
        openUpcomingModal(activeSubjectId);
      } else {
        openUpcomingModal();
      }
      return;
    }

    if (action === 'open-edit-subject') {
      if (!activeSubjectId) return;
      openEditSubjectModal(activeSubjectId);
      return;
    }

    if (action === 'what-if-add') {
      whatIfState.rows.push(createBlankWhatIfRow());
      renderWhatIfRows();
      renderWhatIfResult();
      elements.subjectModalBody
        ?.querySelector(`[data-what-if-index="${whatIfState.rows.length - 1}"][data-what-if-field="score"]`)
        ?.focus();
      return;
    }

    if (action === 'what-if-remove') {
      whatIfState.rows.splice(Number(actionTarget.dataset.whatIfIndex), 1);
      if (!whatIfState.rows.length) whatIfState.rows.push(createBlankWhatIfRow());
      renderWhatIfRows();
      renderWhatIfResult();
      return;
    }

    if (action === 'delete-subject') {
      if (!activeSubjectId) return;
      const confirmed = await showConfirm({
        title: 'Delete subject?',
        message: 'This will remove the subject and all assessments.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      state.data.subjects = state.data.subjects.filter((subject) => subject.id !== activeSubjectId);
      saveData(state.data);
      closeSubjectModal();
      render();
      return;
    }

    if (action === 'delete-assessment') {
      const subjectId = actionTarget.dataset.subjectId;
      const assessmentId = actionTarget.dataset.assessmentId;
      const subject = state.data.subjects.find((item) => item.id === subjectId);
      if (!subject) return;
      const toDelete = subject.assessments.find((item) => item.id === assessmentId);
      const sharedDocId = toDelete?.leaderboardDocId || null;

      const confirmed = await showConfirm({
        title: 'Delete assessment?',
        message: 'This will remove the assessment result.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      subject.assessments = subject.assessments.filter((item) => item.id !== assessmentId);
      
      saveData(state.data);
      render();
      openSubjectModal(subjectId);

      // Also remove from leaderboard if shared
      if (sharedDocId && appwriteDatabases) {
        try { await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'leaderboard', sharedDocId); } catch (_) {}
        fetchLeaderboard();
      }
    }

    if (action === 'edit-assessment') {
      const subjectId = actionTarget.dataset.subjectId;
      const assessmentId = actionTarget.dataset.assessmentId;
      const subject = state.data.subjects.find((item) => item.id === subjectId);
      if (!subject) return;
      const assessment = subject.assessments.find((item) => item.id === assessmentId);
      if (!assessment) return;
      openAssessmentModal(subjectId, { edit: assessment });
      return;
    }

    if (action === 'share-assessment') {
      const subjectId = actionTarget.dataset.subjectId;
      const assessmentId = actionTarget.dataset.assessmentId;
      shareAssessmentToLeaderboard(subjectId, assessmentId);
      return;
    }

    if (action === 'complete-upcoming') {
      const subjectId = actionTarget.dataset.subjectId;
      const upcomingId = actionTarget.dataset.upcomingId;
      openAssessmentForUpcoming(subjectId, upcomingId);
      return;
    }

    if (action === 'edit-upcoming') {
      const subjectId = actionTarget.dataset.subjectId;
      const upcomingId = actionTarget.dataset.upcomingId;
      openUpcomingEditor(subjectId, upcomingId);
      return;
    }

    if (action === 'delete-upcoming') {
      const subjectId = actionTarget.dataset.subjectId;
      const upcomingId = actionTarget.dataset.upcomingId;
      const confirmed = await showConfirm({
        title: 'Delete upcoming item?',
        message: 'This will remove the upcoming assessment.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      removeUpcoming(subjectId, upcomingId);
    }
  });
}

if (elements.editSubjectModal) {
  elements.editSubjectModal.addEventListener('click', async (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;

    if (action === 'close-edit-subject') {
      closeEditSubjectModal();
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

    if (action === 'set-edit-subject-color') {
      setEditSubjectColor(actionTarget.dataset.color);
      return;
    }

    if (action === 'set-edit-subject-icon') {
      const icon = resolveSubjectIcon(actionTarget.dataset.icon, elements.editSubjectName?.value || '');
      setEditSubjectIcon(icon);
      return;
    }

    if (action === 'set-edit-subject-icon-other') {
      const current = normalizeSubjectIcon(elements.editSubjectIcon?.value);
      const icon = await showCustomIconPicker(current);
      if (!icon) return;
      setEditSubjectIcon(icon);
    }
  });
}

if (elements.editSubjectModal) {
  elements.editSubjectModal.addEventListener('input', (event) => {
    const target = event.target;
    if (target === elements.editSubjectColor) {
      setEditSubjectColor(target.value);
      return;
    }
    if (target === elements.editSubjectName) {
      setEditSubjectMessage('');
    }
  });
}

if (elements.editSubjectForm) {
  elements.editSubjectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const subjectId = String(elements.editSubjectId?.value || '').trim();
    if (!subjectId) {
      setEditSubjectMessage('Could not find that subject.', true);
      return;
    }
    const subject = state.data.subjects.find((item) => item.id === subjectId);
    if (!subject) {
      setEditSubjectMessage('Could not find that subject.', true);
      return;
    }

    const nextName = String(elements.editSubjectName?.value || '').trim();
    if (!nextName) {
      setEditSubjectMessage('Please enter a subject name.', true);
      return;
    }

    const hasDuplicate = state.data.subjects.some(
      (item) => item.id !== subjectId
        && normalizeSubjectNameKey(item.name) === normalizeSubjectNameKey(nextName)
    );
    if (hasDuplicate) {
      setEditSubjectMessage('That subject name already exists.', true);
      return;
    }

    const nextColor = normalizeColorValue(elements.editSubjectColor?.value)
      || normalizeColorValue(subject.color)
      || palette[0];
    const nextIcon = resolveSubjectIcon(elements.editSubjectIcon?.value, nextName);
    const nextTarget = normalizeTarget(elements.editSubjectTarget?.value);

    const unchanged = subject.name === nextName
      && normalizeColorValue(subject.color).toLowerCase() === nextColor.toLowerCase()
      && resolveSubjectIcon(subject.icon, subject.name) === nextIcon
      && (subject.target ?? null) === nextTarget;
    if (unchanged) {
      setEditSubjectMessage('No changes to save.');
      return;
    }

    subject.name = nextName;
    subject.color = nextColor;
    subject.icon = nextIcon;
    subject.target = nextTarget;
    saveData(state.data);
    render();
    if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId === subjectId) {
      openSubjectModal(subjectId);
    }
    closeEditSubjectModal();
  });
}

if (elements.assessmentModal) {
  elements.assessmentModal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;
    if (action === 'close-assessment') {
      closeAssessmentModal();
    }
  });
}

if (elements.upcomingList) {
  elements.upcomingList.addEventListener('click', async (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    if (actionTarget.dataset.action === 'edit-upcoming') {
      const subjectId = actionTarget.dataset.subjectId;
      const upcomingId = actionTarget.dataset.upcomingId;
      openUpcomingEditor(subjectId, upcomingId);
      return;
    }
    if (actionTarget.dataset.action === 'complete-upcoming') {
      const subjectId = actionTarget.dataset.subjectId;
      const upcomingId = actionTarget.dataset.upcomingId;
      openAssessmentForUpcoming(subjectId, upcomingId);
      return;
    }
    if (actionTarget.dataset.action === 'delete-upcoming') {
      const subjectId = actionTarget.dataset.subjectId;
      const upcomingId = actionTarget.dataset.upcomingId;
      const confirmed = await showConfirm({
        title: 'Delete upcoming item?',
        message: 'This will remove the upcoming assessment.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      removeUpcoming(subjectId, upcomingId);
    }
  });
}

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

// V2 calendar: Today button, Add button and the selected-day agenda panel.
const calendarTodayButton = document.getElementById('calendar-today');
const calendarAddButton = document.getElementById('calendar-add');
const calendarAgenda = document.getElementById('calendar-agenda');

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

if (elements.assessmentForm) {
  elements.assessmentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(elements.assessmentForm);
    const assessmentId = String(formData.get('assessmentId') || '').trim();
    const subjectId = String(formData.get('subjectId') || '').trim();
    const assessmentName = String(formData.get('assessment') || '').trim();
    let score = parseFloat(formData.get('score'));
    let total = parseFloat(formData.get('total'));
    const weightInput = formData.get('weight');
    const weight = weightInput === '' ? null : parseFloat(weightInput);
    const date = String(formData.get('date') || today);

    const subject = state.data.subjects.find((item) => item.id === subjectId);
    if (!subject) {
      return setAssessmentMessage('Select a subject before adding an assessment.');
    }
    if (!assessmentName) {
      return setAssessmentMessage('Please enter an assessment name.');
    }

    if (assessmentComponents.length > 0) {
      let totalWeight = 0;
      let calculatedScore = 0;
      for (const comp of assessmentComponents) {
        if (!comp.name || !Number.isFinite(comp.score) || !Number.isFinite(comp.total) || comp.total <= 0) {
          return setAssessmentMessage('Please complete all component fields correctly.');
        }
        const w = Number.isFinite(comp.weight) && comp.weight > 0 ? comp.weight : 1;
        totalWeight += w;
        calculatedScore += (comp.score / comp.total) * w;
      }
      if (totalWeight > 0) {
        score = Number(((calculatedScore / totalWeight) * 100).toFixed(2));
        total = 100;
      }
    }

    if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
      return setAssessmentMessage('Please enter a valid score and total.');
    }
    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
      return setAssessmentMessage('Weighting must be a positive number.');
    }
    if (pendingAssessmentConversion?.requiresWeight && (!Number.isFinite(weight) || weight <= 0)) {
      return setAssessmentMessage('Weighting is required when converting an upcoming assessment.');
    }

    if (assessmentId) {
      const existing = subject.assessments.find((a) => a.id === assessmentId);
      if (existing) {
        existing.name = assessmentName;
        existing.score = score;
        existing.total = total;
        existing.weight = weight;
        existing.date = date;
        existing.components = [...assessmentComponents];
      }
    } else {
      subject.assessments.push({
        id: cryptoRandomId(),
        name: assessmentName,
        score,
        total,
        weight,
        date,
        createdAt: Date.now(),
        components: [...assessmentComponents],
      });
    }

    if (pendingAssessmentConversion?.subjectId === subjectId && pendingAssessmentConversion.upcomingId) {
      subject.upcoming = Array.isArray(subject.upcoming)
        ? subject.upcoming.filter((u) => u.id !== pendingAssessmentConversion.upcomingId)
        : [];
    }

    saveData(state.data);
    render();
    closeAssessmentModal();
    if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId === subjectId) {
      openSubjectModal(subjectId);
    }
  });
}

function renderAssessmentComponents() {
  if (!elements.assessmentComponentsList) return;
  if (assessmentComponents.length === 0) {
    elements.assessmentComponentsList.innerHTML = '<span class="muted" style="font-size: 0.85rem;">No components added. Standard assessment mark will be used.</span>';
    const scoreInput = elements.assessmentForm.querySelector('input[name="score"]');
    const totalInput = elements.assessmentForm.querySelector('input[name="total"]');
    if (scoreInput) scoreInput.disabled = false;
    if (totalInput) totalInput.disabled = false;
    return;
  }

  const scoreInput = elements.assessmentForm.querySelector('input[name="score"]');
  const totalInput = elements.assessmentForm.querySelector('input[name="total"]');
  if (scoreInput) scoreInput.disabled = true;
  if (totalInput) totalInput.disabled = true;

  elements.assessmentComponentsList.innerHTML = assessmentComponents.map((comp, i) => `
    <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; background: var(--surface-hover); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
      <label class="field" style="flex: 1 1 120px; margin: 0;">
        <span>Component name</span>
        <input class="component-input" type="text" placeholder="e.g. Part A" value="${comp.name}" data-index="${i}" data-field="name" required>
      </label>
      <label class="field" style="flex: 1 1 80px; margin: 0;">
        <span>Score</span>
        <input class="component-input" type="number" placeholder="10" step="0.1" min="0" value="${comp.score !== null ? comp.score : ''}" data-index="${i}" data-field="score" required>
      </label>
      <label class="field" style="flex: 1 1 80px; margin: 0;">
        <span>Total</span>
        <input class="component-input" type="number" placeholder="10" step="0.1" min="0.1" value="${comp.total !== null ? comp.total : ''}" data-index="${i}" data-field="total" required>
      </label>
      <label class="field" style="flex: 1 1 80px; margin: 0;">
        <span>Wt(%)</span>
        <input class="component-input" type="number" placeholder="20" step="0.1" min="0" value="${comp.weight !== null ? comp.weight : ''}" data-index="${i}" data-field="weight">
      </label>
      <button type="button" class="icon-button" style="color: var(--danger); margin-bottom: 6px; flex-shrink: 0;" data-action="remove-component" data-index="${i}">
        <i class="ph ph-trash" aria-hidden="true"></i>
      </button>
    </div>
  `).join('');
}

if (elements.addAssessmentComponent) {
  elements.addAssessmentComponent.addEventListener('click', () => {
    assessmentComponents.push({ name: '', score: null, total: null, weight: null });
    renderAssessmentComponents();
  });
}

if (elements.assessmentComponentsList) {
  elements.assessmentComponentsList.addEventListener('input', (event) => {
    const target = event.target;
    if (target.classList.contains('component-input')) {
      const index = parseInt(target.dataset.index, 10);
      const field = target.dataset.field;
      if (field === 'name') {
        assessmentComponents[index][field] = target.value;
      } else {
        assessmentComponents[index][field] = target.value ? parseFloat(target.value) : null;
      }
    }
  });

  elements.assessmentComponentsList.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action="remove-component"]');
    if (btn) {
      const index = parseInt(btn.dataset.index, 10);
      assessmentComponents.splice(index, 1);
      renderAssessmentComponents();
    }
  });
}

if (elements.upcomingForm) {
  elements.upcomingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId === subjectId) {
      openSubjectModal(subjectId);
    }
  });
}

if (elements.upcomingTypeSelect) {
  elements.upcomingTypeSelect.addEventListener('change', () => {
    updateUpcomingTypeFields();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (elements.quickAddMenu && !elements.quickAddMenu.hidden) {
    closeQuickAddMenu();
    elements.quickAddButton?.focus();
    return;
  }
  if (elements.confirmModal?.classList.contains('is-open')) {
    dismissConfirm(false);
    return;
  }
  if (elements.leaderboardPrivacyModal?.classList.contains('is-open')) {
    closeModal(elements.leaderboardPrivacyModal);
    return;
  }
  if (elements.iconPickerModal?.classList.contains('is-open')) {
    dismissIconPicker(null);
    return;
  }
  if (elements.authMenu?.classList.contains('is-open')) {
    closeAuthMenu();
    return;
  }
  if (elements.addSubjectModal?.classList.contains('is-open')) {
    closeAddSubjectPopup();
    return;
  }
  if (elements.timetableClassModal?.classList.contains('is-open')) {
    closeTimetableClassModal();
    return;
  }
  if (elements.settingsModal?.classList.contains('is-open')) {
    closeModal(elements.settingsModal);
    return;
  }
  if (elements.upcomingModal?.classList.contains('is-open')) {
    closeUpcomingModal();
    return;
  }
  if (elements.importUpcomingMapModal?.classList.contains('is-open')) {
    dismissImportUpcomingMapping(null);
    return;
  }
  if (elements.editSubjectModal?.classList.contains('is-open')) {
    closeEditSubjectModal();
    return;
  }
  if (elements.assessmentModal?.classList.contains('is-open')) {
    closeAssessmentModal();
    return;
  }
  if (elements.subjectModal?.classList.contains('is-open')) {
    closeSubjectModal();
  }
});

if (elements.subjectGrid) {
  elements.subjectGrid.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const subjectId = target.dataset.id;
    if (action === 'delete-subject') {
      const confirmed = await showConfirm({
        title: 'Delete subject?',
        message: 'This will remove the subject and all assessments.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      state.data.subjects = state.data.subjects.filter((subject) => subject.id !== subjectId);
      saveData(state.data);
      render();
    }
    if (action === 'delete-assessment') {
      const assessmentId = target.dataset.assessmentId;
      const subject = state.data.subjects.find((item) => item.id === target.dataset.subjectId);
      if (!subject) return;
      const confirmed = await showConfirm({
        title: 'Delete assessment?',
        message: 'This will remove the assessment result.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      subject.assessments = subject.assessments.filter((item) => item.id !== assessmentId);
      saveData(state.data);
      render();
      if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId === subjectId) {
        openSubjectModal(subjectId);
      }
    }
  });
}

if (elements.assessmentTable) {
  elements.assessmentTable.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'delete-assessment') {
      const subjectId = target.dataset.subjectId;
      const assessmentId = target.dataset.assessmentId;
      const subject = state.data.subjects.find((item) => item.id === subjectId);
      if (!subject) return;
      const toDelete = subject.assessments.find((item) => item.id === assessmentId);
      const sharedDocId = toDelete?.leaderboardDocId || null;
      const confirmed = await showConfirm({
        title: 'Delete assessment?',
        message: 'This will remove the assessment result.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      subject.assessments = subject.assessments.filter((item) => item.id !== assessmentId);
      saveData(state.data);
      render();
      // Also remove from leaderboard if shared
      if (sharedDocId && appwriteDatabases) {
        try { await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'leaderboard', sharedDocId); } catch (_) {}
        fetchLeaderboard();
      }
    } else if (action === 'edit-assessment') {
      const subjectId = target.dataset.subjectId;
      const assessmentId = target.dataset.assessmentId;
      const subject = state.data.subjects.find((item) => item.id === subjectId);
      if (!subject) return;
      const assessment = subject.assessments.find((item) => item.id === assessmentId);
      if (!assessment) return;
      openAssessmentModal(subjectId, { edit: assessment });
    } else if (action === 'share-assessment') {
      const subjectId = target.dataset.subjectId;
      const assessmentId = target.dataset.assessmentId;
      shareAssessmentToLeaderboard(subjectId, assessmentId);
    }
  });
}

if (elements.assessmentSearch) {
  elements.assessmentSearch.addEventListener('input', (event) => {
    state.assessmentTable.search = String(event.target.value || '');
    renderAssessments();
  });
}

if (elements.assessmentTableHead) {
  elements.assessmentTableHead.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-assessment-sort]');
    if (!toggle) return;
    const sortKey = toggle.dataset.assessmentSort;
    if (!ASSESSMENT_SORT_KEYS.has(sortKey)) return;
    if (state.assessmentTable.sortKey === sortKey) {
      state.assessmentTable.sortDirection = state.assessmentTable.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.assessmentTable.sortKey = sortKey;
      state.assessmentTable.sortDirection = sortKey === 'date' ? 'desc' : 'asc';
    }
    renderAssessments();
  });
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

async function checkFriendStatusAndRenderLeaderboard() {
  const isFriend = appwriteState.user?.labels?.includes('friends');
  if (elements.navLeaderboard) {
    elements.navLeaderboard.hidden = !isFriend;
  }
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

// Averages-only mode uploads one rounded average per subject, worked out from only the
// marks you've shared (the ones carrying a leaderboardDocId marker).
function leaderboardSummaryPayload(subject, sharedAssessments = subject.assessments) {
  const average = weightedAverage(sharedAssessments);
  if (average === null) return null;
  const rounded = Math.round(average);
  return {
    userId: appwriteState.user.$id,
    userName: appwriteState.user.name || 'Anonymous',
    subjectName: normalizeSubjectNameForLeaderboard(subject.name),
    assessmentName: LEADERBOARD_SUMMARY_NAME,
    score: rounded,
    total: 100,
    percent: rounded,
    weight: null,
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

if (elements.shareAllAssessments) {
  elements.shareAllAssessments.addEventListener('click', shareAllAssessmentsToLeaderboard);
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

if (elements.leaderboardSubjectSelect) {
  elements.leaderboardSubjectSelect.addEventListener('change', () => {
    renderLeaderboardView(leaderboardDocs);
  });
}

function openLeaderboardPopup(userData) {
  // Build detail HTML
  const detailSubjects = Object.entries(userData.subjectGroups).map(([subName, assessments]) => {
    const subAvg = leaderboardAverage(assessments);
    // Averages-only entries have no per-assessment rows; hidden raw marks show just the %.
    const rows = assessments.filter((a) => !isLeaderboardSummaryDoc(a)).map(a => {
      const rawHidden = a.total === 100 && a.score === Math.round(a.percent) && Number.isInteger(a.percent);
      return `
      <div class="lb-detail-row">
        <span class="lb-detail-name">${escapeHtml(a.assessmentName || 'Assessment')}</span>
        <span class="lb-detail-score">${rawHidden ? '' : `${a.score} / ${a.total}`}</span>
        <span class="lb-detail-percent">${rawHidden ? a.percent : a.percent.toFixed(1)}%</span>
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
        const rawHidden = a.total === 100 && a.score === Math.round(a.percent) && Number.isInteger(a.percent);
        return `
          <div class="lb-pop-row">
            <span class="lb-pop-row-name">${escapeHtml(a.assessmentName || 'Assessment')}</span>
            <span class="lb-pop-row-raw">${rawHidden ? '' : `${a.score} / ${a.total}`}</span>
            <span class="lb-pop-row-pct">${rawHidden ? a.percent : a.percent.toFixed(1)}%</span>
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

function isDashboardTabActive() {
  return Array.from(elements.views || []).some(
    (view) => view.dataset.view === 'dashboard' && view.classList.contains('is-active')
  );
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

function renderOnboardingSmoothingPreview() {
  if (!elements.onboardingSmoothingPreview) return;
  const points = [
    { value: 62, label: 'Start' },
    { value: 78, label: 'Quiz' },
    { value: 54, label: 'Task' },
    { value: 86, label: 'Project' },
    { value: 71, label: 'Test' },
    { value: 92, label: 'Final' },
  ];
  drawLineChart(elements.onboardingSmoothingPreview, points, {
    stroke: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2aa9ff',
    showAxis: false,
  });
}

function maybeCompleteOnboardingFromCloud() {
  if (!elements.onboardingModal) return;
  if (!elements.onboardingModal.classList.contains('is-open')) return;
  const hasName = Boolean(loadUserName());
  const hasSubjects = Array.isArray(state.data.subjects) && state.data.subjects.length > 0;
  if (hasName || hasSubjects) {
    closeModal(elements.onboardingModal);
    setOnboardingMessage('');
  }
}

function setOnboardingStep(step) {
  onboardingState.step = clamp(step, 0, 4);
  const steps = elements.onboardingForm?.querySelectorAll('[data-onboarding-step]');
  if (steps) {
    steps.forEach((section) => {
      const sectionStep = Number(section.dataset.onboardingStep);
      section.classList.toggle('is-active', sectionStep === onboardingState.step);
    });
  }

  if (elements.onboardingProgressBar) {
    const progress = ((onboardingState.step + 1) / 5) * 100;
    elements.onboardingProgressBar.style.width = `${progress}%`;
  }

  if (onboardingState.step === 2) {
    requestAnimationFrame(() => {
      renderOnboardingSmoothingPreview();
    });
  }

  if (elements.onboardingBack) {
    elements.onboardingBack.style.display = onboardingState.step === 0 ? 'none' : 'inline-flex';
  }
  if (elements.onboardingNext && elements.onboardingFinish) {
    const final = onboardingState.step === 4;
    elements.onboardingNext.style.display = final ? 'none' : 'inline-flex';
    elements.onboardingFinish.style.display = final ? 'inline-flex' : 'none';
    const nav = elements.onboardingNext.closest('.onboarding-nav');
    if (nav) {
      nav.classList.toggle('is-final', final);
    }
  }

  setOnboardingMessage('');
}

function isOnboardingFinalStep() {
  return onboardingState.step === 4;
}

function advanceOnboardingStep() {
  if (onboardingState.step === 1 && elements.onboardingName) {
    const name = String(elements.onboardingName.value || '').trim();
    if (!name) {
      setOnboardingMessage('Please add your name to continue.');
      return;
    }
  }
  setOnboardingStep(onboardingState.step + 1);
}

function retreatOnboardingStep() {
  setOnboardingStep(onboardingState.step - 1);
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

function loadThemeSettings() {
  const storedMode = safeGetItem(THEME_KEY);
  const storedVariant = safeGetItem(THEME_VARIANT_KEY);
  const mode =
    storedMode === 'light' || storedMode === 'dark'
      ? storedMode
      : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  const variant = resolveVariant(mode, storedVariant);
  return { mode, variant };
}

function loadGraphSmoothness() {
  const stored = safeGetItem(GRAPH_SMOOTHNESS_KEY);
  const value = stored === null ? 0.35 : parseFloat(stored);
  if (!Number.isFinite(value)) return 0.35;
  return clamp(value, 0, 1);
}

function resolveVariant(mode, variant) {
  const list = mode === 'dark' ? DARK_THEMES : LIGHT_THEMES;
  if (variant && list.includes(variant)) return variant;
  return list[0];
}

function setTheme(mode, variant) {
  const resolved = resolveVariant(mode, variant);
  document.documentElement.dataset.theme = mode;
  document.documentElement.dataset.themeVariant = resolved;
  safeSetItem(THEME_KEY, mode);
  safeSetItem(THEME_VARIANT_KEY, resolved);
  updateThemeButtons();
  renderOnboardingSmoothingPreview();
}

function setGraphSmoothness(value, options = {}) {
  const clamped = clamp(value, 0, 1);
  state.graphSmoothness = clamped;
  safeSetItem(GRAPH_SMOOTHNESS_KEY, clamped.toFixed(2));
  updateGraphSmoothnessUI();
  renderCharts();
  if (!options.skipSync) {
    queueCloudSync();
  }
}

function updateGraphSmoothnessUI() {
  if (!elements.graphSmoothnessRange || !elements.graphSmoothnessValue) return;
  const percent = Math.round(state.graphSmoothness * 100);
  elements.graphSmoothnessRange.value = String(percent);
  elements.graphSmoothnessRange.style.setProperty('--slider-fill', `${percent}%`);
  elements.graphSmoothnessValue.textContent = `${percent}%`;
  updateOnboardingGraphSmoothnessUI();
}

function updateOnboardingGraphSmoothnessUI() {
  if (!elements.onboardingGraphSmoothness || !elements.onboardingGraphSmoothnessValue) return;
  const percent = Math.round(state.graphSmoothness * 100);
  elements.onboardingGraphSmoothness.value = String(percent);
  elements.onboardingGraphSmoothness.style.setProperty('--slider-fill', `${percent}%`);
  elements.onboardingGraphSmoothnessValue.textContent = `${percent}%`;
  renderOnboardingSmoothingPreview();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateThemeButtons() {
  if (!elements.themeButtons) return;
  const mode = document.documentElement.dataset.theme;
  const variant = document.documentElement.dataset.themeVariant;
  elements.themeButtons.forEach((button) => {
    button.classList.toggle(
      'is-active',
      button.dataset.themeMode === mode && button.dataset.themeVariant === variant
    );
  });
}

function initTabs() {
  if (!elements.navItems || elements.navItems.length === 0) return;
  const saved = safeGetItem(TAB_KEY);
  const initial = saved && document.querySelector(`[data-view="${saved}"]`) ? saved : 'dashboard';
  setActiveTab(initial);
  elements.navItems.forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button.dataset.tab));
  });
}

function setActiveTab(tab) {
  elements.navItems.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tab === tab);
  });
  elements.views.forEach((view) => {
    view.classList.toggle('is-active', view.dataset.view === tab);
  });
  safeSetItem(TAB_KEY, tab);
  if (tab === 'leaderboard') {
    loadLeaderboardRankBaseline();
    fetchLeaderboard();
  }
  renderCharts();
  renderCalendar();
  renderTimetable();
  syncTimetableTodayProgressTicker();
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  hideChartTooltip();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  const anyOpen = document.querySelector('.modal.is-open');
  if (!anyOpen) {
    document.body.classList.remove('modal-open');
  }
  hideChartTooltip();
}

function buildAddSubjectSwatches(selectedColor) {
  const activeColor = normalizeColorValue(selectedColor).toLowerCase();
  return palette
    .map((color) => {
      const activeClass = color.toLowerCase() === activeColor ? ' is-active' : '';
      return `
        <button class="color-swatch${activeClass}" type="button" data-action="set-add-subject-color" data-color="${color}" style="--swatch:${color}" aria-label="Set subject color to ${color}"></button>
      `;
    })
    .join('');
}

function buildEditSubjectSwatches(selectedColor) {
  const activeColor = normalizeColorValue(selectedColor).toLowerCase();
  return palette
    .map((color) => {
      const activeClass = color.toLowerCase() === activeColor ? ' is-active' : '';
      return `
        <button class="color-swatch${activeClass}" type="button" data-action="set-edit-subject-color" data-color="${color}" style="--swatch:${color}" aria-label="Set subject color to ${color}"></button>
      `;
    })
    .join('');
}

function setEditSubjectMessage(message, isError = false) {
  if (!elements.editSubjectMessage) return;
  elements.editSubjectMessage.textContent = message || '';
  elements.editSubjectMessage.style.color = isError ? 'var(--danger)' : '';
}

function setEditSubjectColor(color) {
  if (!elements.editSubjectColor) return;
  const normalized = normalizeColorValue(color)
    || normalizeColorValue(elements.editSubjectColor.value)
    || palette[0];
  elements.editSubjectColor.value = normalized;
  if (elements.editSubjectColorValue) {
    elements.editSubjectColorValue.textContent = normalized.toUpperCase();
  }
  if (elements.editSubjectIconPreview) {
    elements.editSubjectIconPreview.style.background = normalized;
  }
  if (elements.editSubjectSwatches) {
    elements.editSubjectSwatches.innerHTML = buildEditSubjectSwatches(normalized);
  }
}

function setEditSubjectIcon(icon) {
  if (!elements.editSubjectIcon) return;
  const subjectName = String(elements.editSubjectName?.value || '').trim();
  const resolved = resolveSubjectIcon(icon, subjectName);
  elements.editSubjectIcon.value = resolved;
  if (elements.editSubjectIconPreview) {
    elements.editSubjectIconPreview.innerHTML = subjectIconHtml(resolved, '');
  }
  const carousel = elements.editSubjectIconCarousel?.querySelector('[data-icon-carousel]');
  setIconCarouselActive(carousel, resolved);
}

function openEditSubjectModal(subjectId = activeSubjectId) {
  if (!elements.editSubjectModal || !elements.editSubjectForm) return;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject) return;

  const subjectColor = normalizeColorValue(subject.color) || palette[0];
  const subjectIcon = resolveSubjectIcon(subject.icon, subject.name);
  if (elements.editSubjectId) {
    elements.editSubjectId.value = subject.id;
  }
  if (elements.editSubjectName) {
    elements.editSubjectName.value = subject.name;
  }
  if (elements.editSubjectTarget) {
    elements.editSubjectTarget.value = subject.target ?? '';
  }
  if (elements.editSubjectIconCarousel) {
    elements.editSubjectIconCarousel.innerHTML = buildIconCarousel({
      selectedIcon: subjectIcon,
      action: 'set-edit-subject-icon',
      otherAction: 'set-edit-subject-icon-other',
      ariaLabel: `${subject.name} icon options`,
    });
  }
  setEditSubjectIcon(subjectIcon);
  setEditSubjectColor(subjectColor);
  setEditSubjectMessage('');
  openModal(elements.editSubjectModal);
  requestAnimationFrame(() => {
    elements.editSubjectName?.focus();
    elements.editSubjectName?.select();
  });
}

function closeEditSubjectModal() {
  if (!elements.editSubjectModal) return;
  closeModal(elements.editSubjectModal);
  setEditSubjectMessage('');
}

function setAddSubjectColor(color) {
  if (!elements.addSubjectColor) return;
  const normalized = normalizeColorValue(color)
    || normalizeColorValue(elements.addSubjectColor.value)
    || palette[state.data.subjects.length % palette.length];
  elements.addSubjectColor.value = normalized;
  if (elements.addSubjectColorValue) {
    elements.addSubjectColorValue.textContent = normalized.toUpperCase();
  }
  if (elements.addSubjectIconPreview) {
    elements.addSubjectIconPreview.style.background = normalized;
  }
  if (elements.addSubjectSwatches) {
    elements.addSubjectSwatches.innerHTML = buildAddSubjectSwatches(normalized);
  }
}

function setAddSubjectIcon(icon) {
  if (!elements.addSubjectIcon) return;
  const subjectName = String(elements.addSubjectName?.value || '').trim();
  const resolved = resolveSubjectIcon(icon, subjectName);
  elements.addSubjectIcon.value = resolved;
  if (elements.addSubjectIconPreview) {
    elements.addSubjectIconPreview.innerHTML = subjectIconHtml(resolved, '');
  }
  const carousel = elements.addSubjectIconCarousel?.querySelector('[data-icon-carousel]');
  setIconCarouselActive(carousel, resolved);
}

function openAddSubjectPopup() {
  if (!elements.addSubjectModal || !elements.addSubjectForm) return;
  elements.addSubjectForm.reset();
  setSubjectMessage('');

  const defaultColor = palette[state.data.subjects.length % palette.length];
  if (elements.addSubjectIconCarousel) {
    elements.addSubjectIconCarousel.innerHTML = buildIconCarousel({
      selectedIcon: DEFAULT_SUBJECT_ICON,
      action: 'set-add-subject-icon',
      otherAction: 'set-add-subject-icon-other',
      ariaLabel: 'Subject icon options',
    });
  }
  setAddSubjectIcon(DEFAULT_SUBJECT_ICON);
  setAddSubjectColor(defaultColor);
  const panel = elements.addSubjectModal.querySelector('.modal-panel');
  if (panel) {
    panel.style.left = '';
    panel.style.top = '';
  }
  openModal(elements.addSubjectModal);
  requestAnimationFrame(() => {
    elements.addSubjectName?.focus();
  });
}

function closeAddSubjectPopup() {
  if (!elements.addSubjectModal) return;
  closeModal(elements.addSubjectModal);
  setSubjectMessage('');
}

function showConfirm(options) {
  if (!elements.confirmModal || !elements.confirmAccept || !elements.confirmCancel) {
    return Promise.resolve(false);
  }
  const { title, message, confirmLabel, cancelLabel, danger } = options || {};
  if (elements.confirmTitle) {
    elements.confirmTitle.textContent = title || 'Are you sure?';
  }
  if (elements.confirmMessage) {
    elements.confirmMessage.textContent = message || 'This action can’t be undone.';
  }
  elements.confirmAccept.textContent = confirmLabel || 'Confirm';
  elements.confirmAccept.classList.toggle('confirm-danger', Boolean(danger));
  elements.confirmCancel.textContent = cancelLabel || 'Cancel';

  dismissConfirm(false);

  return new Promise((resolve) => {
    confirmResolver = resolve;
    const onAccept = () => {
      dismissConfirm(true);
    };
    const onCancel = () => {
      dismissConfirm(false);
    };
    confirmCleanup = () => {
      elements.confirmAccept.removeEventListener('click', onAccept);
      elements.confirmCancel.removeEventListener('click', onCancel);
      elements.confirmAccept.classList.remove('confirm-danger');
      confirmCleanup = null;
    };
    elements.confirmAccept.addEventListener('click', onAccept);
    elements.confirmCancel.addEventListener('click', onCancel);
    openModal(elements.confirmModal);
    elements.confirmAccept.focus();
  });
}

function dismissConfirm(confirmed) {
  if (!elements.confirmModal) return;
  if (confirmCleanup) {
    confirmCleanup();
  }
  closeModal(elements.confirmModal);
  if (confirmResolver) {
    const resolve = confirmResolver;
    confirmResolver = null;
    resolve(Boolean(confirmed));
  }
}

function openSubjectModal(subjectId) {
  if (!elements.subjectModal) return;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject) return;

  activeSubjectId = subjectId;
  const stats = subjectStats(subject);
  const averageText = stats.average === null ? '--' : `${stats.average.toFixed(1)}%`;
  const gradeText = stats.grade ?? '--';

  elements.subjectModalTitle.textContent = subject.name;
  if (elements.subjectModalMeta) {
    elements.subjectModalMeta.textContent = `${averageText} · ${gradeText} · ${subject.assessments.length} assessments`;
  }

  const history = sortAssessments(subject.assessments).reverse();
  const historyHtml = history.length
    ? history
        .map((assessment) => {
          const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
          const grade = getLetterGrade(percent);
          const weight = assessment.weight === null ? '' : ` · W${assessment.weight}`;
          const canShare = canShareSubjectMarks(subject.id);
          return `
            <div class="history-item">
              <div>
                <div class="history-name">${assessment.name}</div>
                <div class="history-meta">${assessment.score} / ${assessment.total} · ${percent.toFixed(1)}% · ${grade}${weight}</div>
              </div>
              <div class="history-right">
                <div class="history-date">${formatDate(assessment.date)}</div>
                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                  <button class="ghost-button ghost-button--small" data-action="edit-assessment" data-subject-id="${subject.id}" data-assessment-id="${assessment.id}">Edit</button>
                  <button class="ghost-button ghost-button--small${assessment.leaderboardDocId ? ' is-shared' : ''}" data-action="share-assessment" data-subject-id="${subject.id}" data-assessment-id="${assessment.id}" ${canShare ? '' : 'hidden'}>
                    ${assessment.leaderboardDocId ? '<i class="ph ph-cloud-check" style="margin-right:4px;"></i>Shared' : '<i class="ph ph-share-network" style="margin-right:4px;"></i>Share'}
                  </button>
                  <button class="delete-button" data-action="delete-assessment" data-subject-id="${subject.id}" data-assessment-id="${assessment.id}">Remove</button>
                </div>
              </div>
            </div>
          `;
        })
        .join('')
    : '<div class="empty-state">No assessments yet.</div>';
  const upcomingItems = sortUpcoming(expandUpcomingItems(subject));
  const upcomingAssessmentItems = upcomingItems.filter((item) => {
    if (normalizeUpcomingType(item.type) !== 'assessment') return false;
    return !isPastDate(item.date);
  });
  const awaitingMarkAssessmentItems = upcomingItems.filter((item) => {
    if (normalizeUpcomingType(item.type) !== 'assessment') return false;
    return isPastDate(item.date);
  });
  const upcomingHomeworkItems = upcomingItems.filter(
    (item) => normalizeUpcomingType(item.type) === 'homework'
  );
  const upcomingAssessmentsHtml = buildUpcomingList(upcomingAssessmentItems, {
    showSubject: false,
    allowRemove: true,
    emptyMessage: 'No upcoming assessments.',
  });
  const upcomingHomeworkHtml = buildUpcomingList(upcomingHomeworkItems, {
    showSubject: false,
    allowRemove: true,
    emptyMessage: 'No homework reminders.',
  });
  const awaitingMarksHtml = buildUpcomingList(awaitingMarkAssessmentItems, {
    showSubject: false,
    allowRemove: true,
    emptyMessage: 'No assessments awaiting marks.',
  });

  if (elements.subjectModalBody) {
    elements.subjectModalBody.innerHTML = `
      <div class="modal-chart">
        <canvas id="subject-modal-chart"></canvas>
      </div>
      ${isUiV2() ? `
      <div class="modal-actions">
        <button class="primary-button with-icon" type="button" data-action="open-assessment">
          ${iconHtml('plus-circle')}
          Add mark
        </button>
        <div class="more-menu">
          <button class="ghost-button with-icon" type="button" data-action="toggle-more-menu" aria-haspopup="menu" aria-expanded="false">
            ${iconHtml('dots-three')}
            More
          </button>
          <div class="more-menu-list" role="menu" hidden>
            <button type="button" role="menuitem" data-action="open-edit-subject">${iconHtml('pencil-simple')}Edit subject</button>
            <button type="button" role="menuitem" data-action="open-upcoming">${iconHtml('calendar')}Add upcoming</button>
            <button type="button" role="menuitem" class="is-danger" data-action="delete-subject">${iconHtml('trash')}Delete subject</button>
          </div>
        </div>
      </div>` : `<div class="modal-actions">
        <button class="primary-button with-icon" type="button" data-action="open-assessment">
          ${iconHtml('plus-circle')}
          Add Assessment
        </button>
        <button class="ghost-button with-icon" type="button" data-action="open-edit-subject">
          ${iconHtml('pencil-simple')}
          Edit Subject
        </button>
        <button class="ghost-button with-icon" type="button" data-action="open-upcoming">
          ${iconHtml('calendar')}
          Add Upcoming
        </button>
        <button class="ghost-button with-icon" type="button" data-action="delete-subject">
          ${iconHtml('trash')}
          Delete Subject
        </button>
      </div>`}
      ${buildTargetStripHtml(subject)}
      <details class="what-if" id="what-if-panel"${whatIfState.open ? ' open' : ''}>
        <summary class="what-if-summary">
          ${iconHtml('flask')}
          <span>What if…</span>
          <span class="muted what-if-hint">Try out marks without saving them</span>
        </summary>
        <div class="what-if-body">
          <div class="what-if-rows" id="what-if-rows"></div>
          <button class="ghost-button ghost-button--small with-icon" type="button" data-action="what-if-add">
            ${iconHtml('plus')}
            Add mark
          </button>
          <div class="what-if-result" id="what-if-result" aria-live="polite"></div>
        </div>
      </details>
      <div class="subject-upcoming-grid">
        <div class="subject-upcoming">
          <div class="history-title">Upcoming assessments</div>
          <div class="upcoming-list">
            ${upcomingAssessmentsHtml}
          </div>
        </div>
        <div class="subject-upcoming">
          <div class="history-title">Homework</div>
          <div class="upcoming-list">
            ${upcomingHomeworkHtml}
          </div>
        </div>
        <div class="subject-upcoming">
          <div class="history-title">Assessments awaiting marks</div>
          <div class="upcoming-list">
            ${awaitingMarksHtml}
          </div>
        </div>
      </div>
      <div class="subject-history">
        <div class="history-title">Assessment history</div>
        <div class="history-list">${historyHtml}</div>
      </div>
    `;
  }

  openModal(elements.subjectModal);

  if (whatIfState.subjectId !== subject.id) {
    whatIfState = { subjectId: subject.id, open: false, rows: buildInitialWhatIfRows(subject) };
  }
  renderWhatIfRows();
  renderWhatIfResult();
}

function drawSubjectModalChart(subject) {
  const chartCanvas = elements.subjectModalBody?.querySelector('#subject-modal-chart');
  if (!chartCanvas) return;
  const points = buildSubjectTimelinePoints(subject.assessments);
  if (whatIfState.open && whatIfState.subjectId === subject.id) {
    let lastXValue = points.length ? points[points.length - 1].xValue : Date.now();
    validWhatIfRows().forEach((row) => {
      lastXValue = Math.max(lastXValue + 1, row.xValue ?? lastXValue + 1);
      points.push({
        value: (row.score / row.total) * 100,
        label: `What if · ${row.name || 'Hypothetical mark'}`,
        xValue: lastXValue,
        preview: true,
      });
    });
    addTimelineEdgeLabels(points);
  }
  drawLineChart(chartCanvas, points, { stroke: subject.color, showAxis: true });
}

function buildTargetStripHtml(subject) {
  if (!Number.isFinite(subject.target)) {
    return `
      <div class="target-strip target-strip--empty">
        <span class="muted">No target set for this subject.</span>
        <button class="ghost-button ghost-button--small with-icon" type="button" data-action="open-edit-subject">
          ${iconHtml('target')}
          Set a target
        </button>
      </div>
    `;
  }
  const target = subject.target;
  const average = weightedAverage(subject.assessments);
  const met = average !== null && average >= target;
  const status = average === null
    ? 'No marks yet'
    : met
    ? `${iconHtml('check-circle')} On target`
    : `${(target - average).toFixed(1)}% to go`;
  const fill = average === null ? 0 : clamp(average, 0, 100);
  return `
    <div class="target-strip${met ? ' is-met' : ''}">
      <div class="target-strip-head">
        <span><strong>Target ${formatPercentValue(target)}%</strong>${average === null ? '' : ` · Current ${average.toFixed(1)}%`}</span>
        <span class="target-strip-status">${status}</span>
      </div>
      <div class="target-bar" role="presentation">
        <span class="target-bar-fill" style="width: ${fill}%"></span>
        <span class="target-bar-marker" style="left: ${clamp(target, 0, 100)}%"></span>
      </div>
      <div class="target-needed muted">${escapeHtml(describeRequiredForTarget(subject))}</div>
    </div>
  `;
}

function formatPercentValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

// The mean weight of a subject's marked assessments, used when an upcoming or what-if
// mark has no weight. Assuming weight 1 is wrong when marks use weights like 30 or 40.
function typicalAssessmentWeight(subject) {
  const weights = subject.assessments
    .filter((assessment) => assessment.total > 0)
    .map((assessment) => (assessment.weight === null ? 1 : assessment.weight));
  if (!weights.length) return 1;
  return weights.reduce((total, weight) => total + weight, 0) / weights.length || 1;
}

// The average needed across the remaining assessments to finish on target. Upcoming
// assessments without a weight are assumed to be weighted like the subject's others.
function requiredForTarget(subject) {
  if (!Number.isFinite(subject.target)) return null;
  let sum = 0;
  let weight = 0;
  subject.assessments.forEach((assessment) => {
    const itemWeight = assessment.weight === null ? 1 : assessment.weight;
    if (assessment.total > 0) {
      sum += (assessment.score / assessment.total) * 100 * itemWeight;
      weight += itemWeight;
    }
  });
  const pending = (subject.upcoming || []).filter(
    (item) => normalizeUpcomingType(item.type) === 'assessment' && !isPastDate(item.date)
  );
  const typical = typicalAssessmentWeight(subject);
  const pendingWeight = pending.reduce((total, item) => total + (Number.isFinite(item.weight) ? item.weight : typical), 0);
  const assumed = pendingWeight <= 0;
  const remaining = assumed ? typical : pendingWeight;
  return {
    target: subject.target,
    needed: (subject.target * (weight + remaining) - sum) / remaining,
    hasMarks: weight > 0,
    pending,
    assumed,
  };
}

function describeRequiredForTarget(subject) {
  const result = requiredForTarget(subject);
  if (!result) return '';
  if (!result.hasMarks) return `Aim for ${formatPercentValue(result.target)}% on your first assessment.`;
  const label = result.assumed
    ? 'your next assessment (if it\'s weighted like your others)'
    : result.pending.length === 1
    ? `"${result.pending[0].name}"`
    : `your ${result.pending.length} upcoming assessments`;
  if (result.needed > 100) return `You'd need over 100% on ${label}, so the target is out of reach for now. Keep going!`;
  if (result.needed <= 0) return `You'd stay on target even with 0 on ${label}.`;
  const prefix = result.pending.length > 1 ? 'You need an average of' : 'You need';
  return `${prefix} ${result.needed.toFixed(1)}% on ${label} to hit your target.`;
}

function buildInitialWhatIfRows(subject) {
  const pending = (subject.upcoming || []).filter(
    (item) => normalizeUpcomingType(item.type) === 'assessment' && !isPastDate(item.date)
  );
  const rows = sortUpcoming(pending).map((item) => ({
    name: item.name,
    score: '',
    total: '100',
    weight: Number.isFinite(item.weight) ? String(item.weight) : '',
    xValue: dateStringValue(item.date),
  }));
  return rows.length ? rows : [createBlankWhatIfRow()];
}

function createBlankWhatIfRow() {
  return { name: '', score: '', total: '100', weight: '', xValue: null };
}

function validWhatIfRows() {
  const subject = state.data.subjects.find((item) => item.id === whatIfState.subjectId);
  const typical = subject ? typicalAssessmentWeight(subject) : 1;
  return whatIfState.rows
    .filter((row) => String(row.score).trim() !== '')
    .map((row) => ({
      ...row,
      score: Number(row.score),
      total: Number(row.total),
      weight: String(row.weight).trim() === '' ? typical : Number(row.weight),
    }))
    .filter(
      (row) =>
        Number.isFinite(row.score) &&
        Number.isFinite(row.total) &&
        row.total > 0 &&
        Number.isFinite(row.weight) &&
        row.weight >= 0
    );
}

function renderWhatIfRows() {
  const container = elements.subjectModalBody?.querySelector('#what-if-rows');
  if (!container) return;
  const subject = state.data.subjects.find((item) => item.id === whatIfState.subjectId);
  const typicalWeight = formatPercentValue(subject ? typicalAssessmentWeight(subject) : 1);
  container.innerHTML = whatIfState.rows
    .map(
      (row, index) => `
        <div class="what-if-row">
          <input class="what-if-name" data-what-if-index="${index}" data-what-if-field="name" value="${escapeHtml(row.name)}" placeholder="Hypothetical mark" aria-label="Name" maxlength="60" />
          <input data-what-if-index="${index}" data-what-if-field="score" value="${escapeHtml(row.score)}" type="number" min="0" step="any" inputmode="decimal" placeholder="Mark" aria-label="Mark" />
          <span class="muted">/</span>
          <input data-what-if-index="${index}" data-what-if-field="total" value="${escapeHtml(row.total)}" type="number" min="0" step="any" inputmode="decimal" placeholder="Total" aria-label="Total" />
          <input data-what-if-index="${index}" data-what-if-field="weight" value="${escapeHtml(row.weight)}" type="number" min="0" step="any" inputmode="decimal" placeholder="W ${typicalWeight}" title="Weight (blank = ${typicalWeight}, like your other marks)" aria-label="Weight" />
          <button class="delete-button" type="button" data-action="what-if-remove" data-what-if-index="${index}" aria-label="Remove">${iconHtml('x', 'button-icon')}</button>
        </div>
      `
    )
    .join('');
}

function renderWhatIfResult() {
  const subject = state.data.subjects.find((item) => item.id === whatIfState.subjectId);
  if (!subject) return;
  drawSubjectModalChart(subject);
  const resultEl = elements.subjectModalBody?.querySelector('#what-if-result');
  if (!resultEl) return;
  const rows = validWhatIfRows();
  if (!rows.length) {
    resultEl.innerHTML = '<span class="muted">Enter a mark to see how your average would change.</span>';
    return;
  }
  const current = weightedAverage(subject.assessments);
  const projected = weightedAverage([...subject.assessments, ...rows]);
  if (projected === null) {
    resultEl.innerHTML = '<span class="muted">Those marks have no weight, so your average stays the same.</span>';
    return;
  }
  const delta = current === null ? null : projected - current;
  const deltaHtml = delta === null || Math.abs(delta) < 0.05
    ? ''
    : `<span class="what-if-delta ${delta > 0 ? 'is-up' : 'is-down'}">${delta > 0 ? '+' : ''}${delta.toFixed(1)}%</span>`;
  const targetHtml = Number.isFinite(subject.target)
    ? projected >= subject.target
      ? `<span class="what-if-target is-met">${iconHtml('check-circle')} Hits your ${formatPercentValue(subject.target)}% target</span>`
      : `<span class="what-if-target">${(subject.target - projected).toFixed(1)}% short of your target</span>`
    : '';
  resultEl.innerHTML = `
    <span>Your average would be <strong>${projected.toFixed(1)}%</strong> · ${getLetterGrade(projected)}</span>
    ${deltaHtml}
    ${targetHtml}
  `;
}

function closeSubjectModal() {
  closeEditSubjectModal();
  closeAssessmentModal();
  closeUpcomingModal();
  closeModal(elements.subjectModal);
  activeSubjectId = null;
  whatIfState = { subjectId: null, open: false, rows: [] };
}

function openAssessmentModal(subjectId, options = {}) {
  if (!elements.assessmentModal || !elements.assessmentForm) return;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject) return;
  const assessmentNameInput = elements.assessmentForm.querySelector('input[name="assessment"]');
  const scoreInput = elements.assessmentForm.querySelector('input[name="score"]');
  const totalInput = elements.assessmentForm.querySelector('input[name="total"]');
  const weightInput = elements.assessmentForm.querySelector('input[name="weight"]');
  const dateInput = elements.assessmentForm.querySelector('input[name="date"]');
  const editItem = options.edit || null;
  const prefill = options.prefill || null;

  pendingAssessmentConversion = options.conversion || null;
  activeSubjectId = subjectId;
  elements.assessmentForm.reset();
  assessmentComponents = editItem?.components ? [...editItem.components] : [];
  renderAssessmentComponents();

  if (elements.assessmentId) {
    elements.assessmentId.value = editItem ? editItem.id : '';
  }

  const modalTitle = elements.assessmentModal.querySelector('#assessment-modal-title');
  const modalEyebrow = elements.assessmentModal.querySelector('.section-eyebrow');
  const submitButton = elements.assessmentForm.querySelector('button[type="submit"]');
  if (modalTitle) modalTitle.textContent = editItem ? 'Edit Result' : 'New Result';
  if (modalEyebrow) modalEyebrow.textContent = editItem ? 'Edit assessment' : 'Add assessment';
  if (submitButton) submitButton.textContent = editItem ? 'Update Assessment' : 'Save Assessment';

  if (elements.assessmentSubjectId) {
    elements.assessmentSubjectId.value = subjectId;
  }
  if (elements.assessmentSubjectName) {
    elements.assessmentSubjectName.textContent = subject.name;
  }
  if (assessmentNameInput && (prefill?.name || editItem?.name)) {
    assessmentNameInput.value = editItem?.name || prefill?.name;
  }
  if (scoreInput) {
    scoreInput.value = editItem ? editItem.score : '';
  }
  if (totalInput) {
    totalInput.value = editItem ? editItem.total : '';
  }
  if (weightInput) {
    if (editItem && Number.isFinite(editItem.weight)) {
      weightInput.value = String(editItem.weight);
    } else if (Number.isFinite(prefill?.weight)) {
      weightInput.value = String(prefill.weight);
    } else {
      weightInput.value = '';
    }
    weightInput.required = Boolean(pendingAssessmentConversion?.requiresWeight);
  }
  if (dateInput) {
    dateInput.value = editItem ? editItem.date : (prefill?.date || today);
  }
  setAssessmentMessage('');
  openModal(elements.assessmentModal);
}

function closeAssessmentModal() {
  pendingAssessmentConversion = null;
  const weightInput = elements.assessmentForm?.querySelector('input[name="weight"]');
  if (weightInput) {
    weightInput.required = false;
  }
  closeModal(elements.assessmentModal);
  setAssessmentMessage('');
}

function openUpcomingModal(options = {}) {
  if (!elements.upcomingModal || !elements.upcomingForm) return;
  if (!state.data.subjects.length) {
    setUpcomingMessage('Add a subject first.');
    return;
  }
  const normalizedOptions = typeof options === 'string' || options === null
    ? { subjectId: options || null, upcomingId: null }
    : options;
  const editSubjectId = String(normalizedOptions.subjectId || '').trim() || null;
  const editUpcomingId = String(normalizedOptions.upcomingId || '').trim() || null;

  elements.upcomingForm.reset();
  renderUpcomingSubjectSelect();

  let editingItem = null;
  let editingSubject = null;
  if (editSubjectId && editUpcomingId) {
    const selected = getUpcomingItem(editSubjectId, editUpcomingId);
    if (!selected) {
      setUpcomingMessage('Could not find that upcoming item.');
      return;
    }
    editingSubject = selected.subject;
    editingItem = selected.upcoming;
    pendingUpcomingEdit = {
      subjectId: editingSubject.id,
      upcomingId: editingItem.id,
    };
  } else {
    pendingUpcomingEdit = null;
  }

  if (elements.upcomingSubjectSelect) {
    const preferred = editingSubject?.id || editSubjectId || elements.upcomingSubjectSelect.value;
    if (preferred) {
      elements.upcomingSubjectSelect.value = preferred;
    }
  }
  const dateInput = elements.upcomingForm.querySelector('input[name="upcomingDate"]');
  if (elements.upcomingTypeSelect) {
    elements.upcomingTypeSelect.value = normalizeUpcomingType(editingItem?.type);
  }
  if (elements.upcomingWeightInput) {
    elements.upcomingWeightInput.value = Number.isFinite(editingItem?.weight)
      ? String(editingItem.weight)
      : '';
  }
  const nameInput = elements.upcomingForm.querySelector('input[name="upcomingName"]');
  if (nameInput) {
    nameInput.value = editingItem?.name || '';
  }
  const notesInput = elements.upcomingForm.querySelector('input[name="upcomingNotes"]');
  if (notesInput) {
    notesInput.value = editingItem?.notes || '';
  }
  if (dateInput) {
    dateInput.value = editingItem?.date || today;
  }

  if (elements.upcomingModalEyebrow) {
    elements.upcomingModalEyebrow.textContent = editingItem ? 'Edit upcoming' : 'Upcoming assessment';
  }
  if (elements.upcomingModalTitle) {
    elements.upcomingModalTitle.textContent = editingItem ? 'Update Item' : 'Schedule';
  }
  if (elements.upcomingModalMeta) {
    elements.upcomingModalMeta.textContent = editingItem
      ? 'Click save after changing type, name, description, weighting, or due date.'
      : 'Add a reminder for what is next.';
  }
  if (elements.upcomingSubmit) {
    elements.upcomingSubmit.textContent = editingItem ? 'Save Changes' : 'Save Upcoming';
  }
  const upcomingDeleteButton = document.getElementById('upcoming-delete');
  if (upcomingDeleteButton) upcomingDeleteButton.hidden = !editingItem;
  updateUpcomingTypeFields();
  setUpcomingMessage('');
  openModal(elements.upcomingModal);
}

function closeUpcomingModal() {
  pendingUpcomingEdit = null;
  if (elements.upcomingModalEyebrow) {
    elements.upcomingModalEyebrow.textContent = 'Upcoming assessment';
  }
  if (elements.upcomingModalTitle) {
    elements.upcomingModalTitle.textContent = 'Schedule';
  }
  if (elements.upcomingModalMeta) {
    elements.upcomingModalMeta.textContent = 'Add a reminder for what is next.';
  }
  if (elements.upcomingSubmit) {
    elements.upcomingSubmit.textContent = 'Save Upcoming';
  }
  closeModal(elements.upcomingModal);
  setUpcomingMessage('');
}

function showChartTooltip(text, x, y) {
  if (!elements.chartTooltip) return;
  elements.chartTooltip.textContent = text;
  elements.chartTooltip.style.left = `${x}px`;
  elements.chartTooltip.style.top = `${y}px`;
  elements.chartTooltip.classList.add('is-visible');
  elements.chartTooltip.setAttribute('aria-hidden', 'false');
}

function hideChartTooltip() {
  if (!elements.chartTooltip) return;
  elements.chartTooltip.classList.remove('is-visible');
  elements.chartTooltip.setAttribute('aria-hidden', 'true');
}

function bindChartHover(canvas) {
  if (!canvas || canvas.dataset.hoverBound) return;
  canvas.dataset.hoverBound = 'true';

  canvas.addEventListener('mousemove', (event) => {
    const points = canvas._chartPoints;
    if (!points || points.length === 0) {
      hideChartTooltip();
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const nearest = points.reduce((best, point) => {
      const bestDiff = Math.abs(best.x - x);
      const nextDiff = Math.abs(point.x - x);
      return nextDiff < bestDiff ? point : best;
    });

    const label = nearest.label ? `${nearest.label} · ${nearest.value.toFixed(1)}%` : `${nearest.value.toFixed(1)}%`;
    showChartTooltip(label, rect.left + nearest.x, rect.top + nearest.y);
  });

  canvas.addEventListener('mouseleave', () => {
    hideChartTooltip();
  });
}

function setInlineMessage(target, message) {
  if (!target) return;
  target.textContent = message;
  setTimeout(() => {
    if (target.textContent === message) {
      target.textContent = '';
    }
  }, 2400);
}

function setSubjectMessage(message) {
  setInlineMessage(elements.subjectMessage, message);
}

function setAssessmentMessage(message) {
  setInlineMessage(elements.assessmentMessage, message);
}

function setUpcomingMessage(message) {
  setInlineMessage(elements.upcomingMessage, message);
}

function normalizeUpcomingType(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'homework' ? 'homework' : 'assessment';
}

function updateUpcomingTypeFields() {
  const upcomingType = normalizeUpcomingType(elements.upcomingTypeSelect?.value);
  if (elements.upcomingWeightField) {
    elements.upcomingWeightField.hidden = upcomingType !== 'assessment';
  }
  if (elements.upcomingWeightInput) {
    if (upcomingType !== 'assessment') {
      elements.upcomingWeightInput.value = '';
    }
    elements.upcomingWeightInput.required = false;
  }
}

function setExportMessage(message) {
  setInlineMessage(elements.exportMessage, message);
}

function setImportMessage(message) {
  setInlineMessage(elements.importMessage, message);
}

function setSettingsMessage(message) {
  setInlineMessage(elements.settingsMessage, message);
}

function setOnboardingMessage(message) {
  setInlineMessage(elements.onboardingMessage, message);
}

function setOnboardingImportMessage(message) {
  setInlineMessage(elements.onboardingImportMessage, message);
}

function renderSubjectsOrderList() {
  if (!elements.subjectsOrderList) return;
  if (!state.data.subjects.length) {
    elements.subjectsOrderList.innerHTML = '<div class="empty-state">No subjects yet.</div>';
    return;
  }
  elements.subjectsOrderList.innerHTML = state.data.subjects
    .map((subject) => {
      const subjectIcon = subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name));
      return `
        <div class="order-item" data-order-item="true" data-id="${subject.id}" draggable="true">
          <div class="order-left">
            <span class="order-icon" style="--swatch:${subject.color}">${subjectIcon}</span>
            <div class="order-name">${subject.name}</div>
          </div>
          <div class="order-handle" aria-hidden="true">
            <i class="ph ph-dots-six-vertical"></i>
          </div>
        </div>
      `;
    })
    .join('');
}

function setOrderDropTarget(target) {
  if (currentOrderDropTarget === target) return;
  if (currentOrderDropTarget) {
    currentOrderDropTarget.classList.remove('is-drop-target');
  }
  currentOrderDropTarget = target;
  if (currentOrderDropTarget) {
    currentOrderDropTarget.classList.add('is-drop-target');
  }
}

function reorderSubjectsFromOrderList() {
  if (!elements.subjectsOrderList) return;
  const orderedIds = Array.from(elements.subjectsOrderList.querySelectorAll('[data-order-item]'))
    .map((item) => item.dataset.id)
    .filter(Boolean);
  if (!orderedIds.length) return;
  const subjectMap = new Map(state.data.subjects.map((subject) => [subject.id, subject]));
  const nextSubjects = orderedIds.map((id) => subjectMap.get(id)).filter(Boolean);
  if (nextSubjects.length !== state.data.subjects.length) return;
  state.data.subjects = nextSubjects;
  saveData(state.data);
  renderSubjects();
}

function updateGreeting() {
  if (!elements.pageGreeting) return;
  const name = loadUserName();
  elements.pageGreeting.textContent = name ? `Hi, ${name}` : 'Sapphire Gradebook';
  if (elements.settingsName) {
    elements.settingsName.value = name;
  }
  if (elements.onboardingName) {
    elements.onboardingName.value = name;
  }
}

function maybeStartOnboarding() {
  const hasStoredData = safeGetItem(STORAGE_KEY);
  if (hasStoredData) return;
  if (!elements.onboardingModal) return;
  if (elements.onboardingName) {
    elements.onboardingName.value = loadUserName();
  }
  setOnboardingStep(0);
  openModal(elements.onboardingModal);
}

function normalizeSubjectNameKey(value) {
  return String(value || '').trim().toLowerCase();
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

function normalizeColorValue(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : '';
}

function normalizeSubjectIcon(value) {
  const icon = String(value || '').trim().toLowerCase();
  if (!icon) return '';
  return /^[a-z0-9-]{1,64}$/.test(icon) ? icon : '';
}

function getSubjectPreset(name) {
  const key = normalizeSubjectNameKey(name);
  const presetIcon = SUBJECT_ICON_PRESETS[key];
  return {
    icon: normalizeSubjectIcon(presetIcon) || DEFAULT_SUBJECT_ICON,
  };
}

function resolveSubjectIcon(icon, name) {
  const direct = normalizeSubjectIcon(icon);
  if (direct) return direct;
  return getSubjectPreset(name).icon;
}

function iconHtml(name, className = 'button-icon', weight = 'regular') {
  const safeName = /^[a-z0-9-]+$/.test(String(name || '').trim().toLowerCase())
    ? String(name).trim().toLowerCase()
    : 'star';
  const classAttr = className ? ` ${className}` : '';
  const weightClass = weight === 'bold' ? 'ph ph-bold' : 'ph';
  return `<i class="${weightClass} ph-${safeName}${classAttr}" aria-hidden="true"></i>`;
}

function subjectIconHtml(name, className = 'button-icon') {
  return iconHtml(name, className, 'bold');
}

function buildIconCarouselItems(selectedIcon, action, otherAction, dataAttrs = '') {
  const selected = resolveSubjectIcon(selectedIcon);
  const selectedInCatalog = SUBJECT_ICON_VALUES.has(selected);
  return SUBJECT_ICON_OPTIONS
    .map((option) => {
      const activeClass = option.value === selected ? ' is-active' : '';
      return `
        <button
          class="icon-carousel-item${activeClass}"
          type="button"
          data-action="${action}"
          data-icon="${option.value}"
          ${dataAttrs}
          aria-label="${option.label}"
          title="${option.label}"
        >
          ${iconHtml(option.value, '')}
        </button>
      `;
    })
    .join('') + `
      <button
        class="icon-carousel-item icon-carousel-item--other${selectedInCatalog ? '' : ' is-active'}"
        type="button"
        data-action="${otherAction}"
        data-other="true"
        ${dataAttrs}
        aria-label="${selectedInCatalog ? 'Other icon' : `Other (${selected})`}"
        title="${selectedInCatalog ? 'Other icon' : `Other (${selected})`}"
      >
        ${selectedInCatalog ? iconHtml('dots-three', '') : iconHtml(selected, '')}
      </button>
    `;
}

function buildIconCarousel({
  selectedIcon,
  action,
  otherAction,
  dataAttrs = '',
  ariaLabel = 'Icon options',
}) {
  const items = buildIconCarouselItems(selectedIcon, action, otherAction, dataAttrs);
  return `
    <div class="icon-carousel" data-icon-carousel="true">
      <button class="icon-carousel-nav" type="button" data-action="carousel-prev" aria-label="Scroll icons left">
        ${iconHtml('caret-left', '')}
      </button>
      <div class="icon-carousel-track" data-role="icon-carousel-track" aria-label="${ariaLabel}">
        ${items}
      </div>
      <button class="icon-carousel-nav" type="button" data-action="carousel-next" aria-label="Scroll icons right">
        ${iconHtml('caret-right', '')}
      </button>
    </div>
  `;
}

function scrollIconCarousel(actionTarget, direction) {
  const carousel = actionTarget.closest('[data-icon-carousel]');
  const track = carousel?.querySelector('[data-role="icon-carousel-track"]');
  if (!track) return;
  track.scrollBy({ left: 220 * direction, behavior: 'smooth' });
}

function setIconCarouselActive(carousel, icon) {
  if (!carousel) return;
  const selected = normalizeSubjectIcon(icon);
  const selectedInCatalog = SUBJECT_ICON_VALUES.has(selected);
  let activeButton = null;
  carousel.querySelectorAll('.icon-carousel-item').forEach((button) => {
    const isOther = button.dataset.other === 'true';
    const active = isOther ? !selectedInCatalog : button.dataset.icon === selected;
    button.classList.toggle('is-active', active);
    if (isOther) {
      button.innerHTML = selectedInCatalog ? iconHtml('dots-three', '') : iconHtml(selected, '');
      const label = selectedInCatalog ? 'Other icon' : `Other (${selected})`;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    }
    if (active) {
      activeButton = button;
    }
  });
  if (activeButton) {
    activeButton.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
}

function showCustomIconPicker(initialValue = '') {
  if (!elements.iconPickerModal || !elements.iconPickerInput) {
    return Promise.resolve(null);
  }

  dismissIconPicker(null);

  const initial = normalizeSubjectIcon(initialValue) || 'wave-sine';
  elements.iconPickerInput.value = initial;
  updateIconPickerPreview(initial);
  setIconPickerMessage('');
  openModal(elements.iconPickerModal);
  requestAnimationFrame(() => {
    elements.iconPickerInput?.focus();
    elements.iconPickerInput?.select();
  });

  return new Promise((resolve) => {
    iconPickerResolver = resolve;
  });
}

function applyIconPickerSelection() {
  if (!elements.iconPickerInput) return;
  const normalized = normalizeSubjectIcon(elements.iconPickerInput.value);
  if (!normalized) {
    setIconPickerMessage('Use lowercase letters, numbers, and hyphens (example: wave-sine).');
    return;
  }
  dismissIconPicker(normalized);
}

function updateIconPickerPreview(value) {
  if (!elements.iconPickerPreview) return;
  const normalized = normalizeSubjectIcon(value);
  elements.iconPickerPreview.innerHTML = iconHtml(normalized || 'question', '');
}

function setIconPickerMessage(message) {
  if (!elements.iconPickerMessage) return;
  elements.iconPickerMessage.textContent = message;
}

function dismissIconPicker(value) {
  if (!elements.iconPickerModal) return;
  closeModal(elements.iconPickerModal);
  setIconPickerMessage('');
  if (iconPickerResolver) {
    const resolve = iconPickerResolver;
    iconPickerResolver = null;
    resolve(value || null);
    return;
  }
  iconPickerResolver = null;
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

function buildSubjectSeed(name, options = {}) {
  const normalizedName = String(name || '').trim();
  const preset = getSubjectPreset(normalizedName);
  return {
    name: normalizedName,
    icon: resolveSubjectIcon(options.icon || preset.icon, normalizedName),
    color: normalizeColorValue(options.color),
  };
}

function renderElectiveGrid() {
  if (!elements.electiveGrid) return;
  elements.electiveGrid.innerHTML = ELECTIVE_SUBJECTS
    .map((subjectName) => {
      const subjectIcon = resolveSubjectIcon('', subjectName);
      return `
        <label class="checkbox-item checkbox-item--icon">
          <input type="checkbox" value="${subjectName}" />
          <span class="checkbox-item-icon">${subjectIconHtml(subjectIcon, '')}</span>
          <span>${subjectName}</span>
        </label>
      `;
    })
    .join('');
}

function addCustomElectiveRow(initial = {}) {
  if (!elements.customElectiveList) return;
  const colorIndex = (state.data.subjects.length + elements.customElectiveList.children.length) % palette.length;
  const defaultColor = normalizeColorValue(initial.color) || palette[colorIndex];
  const subjectName = String(initial.name || '').trim();
  const subjectIcon = resolveSubjectIcon(initial.icon, subjectName);
  const iconCarousel = buildIconCarousel({
    selectedIcon: subjectIcon,
    action: 'set-custom-elective-icon',
    otherAction: 'set-custom-elective-icon-other',
    ariaLabel: 'Custom elective icon options',
  });
  const row = document.createElement('div');
  row.className = 'custom-elective-row';
  row.dataset.customElectiveRow = 'true';
  row.innerHTML = `
    <input
      class="custom-elective-name"
      name="customElectiveName"
      placeholder="Subject name"
      value="${subjectName}"
    />
    <input type="hidden" name="customElectiveIcon" value="${subjectIcon}" />
    <div class="custom-elective-carousel">
      ${iconCarousel}
    </div>
    <input
      class="custom-elective-color"
      type="color"
      name="customElectiveColor"
      value="${defaultColor}"
      aria-label="Custom elective color"
    />
    <button
      class="icon-button icon-button--small"
      type="button"
      data-action="remove-custom-elective"
      aria-label="Remove custom elective"
    >
      ${iconHtml('x', '')}
    </button>
  `;
  elements.customElectiveList.appendChild(row);
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

function finishOnboarding(options) {
  if (!elements.onboardingName) return;
  const name = String(elements.onboardingName.value || '').trim();
  if (!name) {
    return setOnboardingMessage('Please add your name to continue.');
  }
  setUserName(name);
  updateGreeting();

  if (!state.data || !Array.isArray(state.data.subjects)) {
    state.data = createEmptyData();
  }

  if (state.data.subjects.length === 0) {
    const seeds = [
      ...CORE_SUBJECTS.map((name) => buildSubjectSeed(name)),
      ...(options?.skipElectives ? [] : getSelectedElectives().map((name) => buildSubjectSeed(name))),
      ...(options?.skipElectives ? [] : getCustomElectives()),
    ];
    const unique = new Map();
    seeds.forEach((seed) => {
      const key = normalizeSubjectNameKey(seed.name);
      if (!key) return;
      unique.set(key, seed);
    });
    unique.forEach((seed) => {
      getOrCreateSubject(seed.name, {
        color: seed.color,
        icon: seed.icon,
      });
    });
    saveData(state.data);
  }

  if (elements.onboardingModal) {
    closeModal(elements.onboardingModal);
  }
  setOnboardingMessage('');
  render();
}

function getSelectedElectives() {
  if (!elements.electiveGrid) return [];
  return Array.from(elements.electiveGrid.querySelectorAll('input[type="checkbox"]'))
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function getCustomElectives() {
  if (!elements.customElectiveList) return [];
  return Array.from(elements.customElectiveList.querySelectorAll('[data-custom-elective-row]'))
    .map((row) => {
      const nameInput = row.querySelector('input[name="customElectiveName"]');
      const iconInput = row.querySelector('input[name="customElectiveIcon"]');
      const colorInput = row.querySelector('input[name="customElectiveColor"]');
      const name = String(nameInput?.value || '').trim();
      if (!name) return null;
      return {
        name,
        icon: resolveSubjectIcon(iconInput?.value, name),
        color: normalizeColorValue(colorInput?.value),
      };
    })
    .filter(Boolean);
}

function getOrCreateSubject(name, options = {}) {
  const normalizedName = String(name || '').trim();
  if (!normalizedName) return null;
  const existing = state.data.subjects.find(
    (subject) => subject.name.toLowerCase() === normalizedName.toLowerCase()
  );
  if (existing) return existing;
  const subject = {
    id: cryptoRandomId(),
    name: normalizedName,
    color: normalizeColorValue(options.color)
      || palette[state.data.subjects.length % palette.length],
    icon: resolveSubjectIcon(options.icon, normalizedName),
    assessments: [],
    upcoming: [],
  };
  state.data.subjects.push(subject);
  return subject;
}

function getUpcomingItem(subjectId, upcomingId) {
  if (!subjectId || !upcomingId) return null;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject || !Array.isArray(subject.upcoming)) return null;
  const upcoming = subject.upcoming.find((item) => item.id === upcomingId);
  if (!upcoming) return null;
  return { subject, upcoming };
}

function openAssessmentForUpcoming(subjectId, upcomingId) {
  const selected = getUpcomingItem(subjectId, upcomingId);
  if (!selected) {
    setUpcomingMessage('Could not find that upcoming item.');
    return;
  }
  const { subject, upcoming } = selected;
  if (normalizeUpcomingType(upcoming.type) !== 'assessment') {
    setUpcomingMessage('Only assessment items can be converted to marks.');
    return;
  }
  openAssessmentModal(subject.id, {
    prefill: {
      name: upcoming.name,
      date: upcoming.date,
      weight: upcoming.weight,
    },
    conversion: {
      subjectId: subject.id,
      upcomingId: upcoming.id,
      requiresWeight: true,
    },
  });
}

function openUpcomingEditor(subjectId, upcomingId) {
  const selected = getUpcomingItem(subjectId, upcomingId);
  if (!selected) {
    setUpcomingMessage('Could not find that upcoming item.');
    return;
  }
  openUpcomingModal({
    subjectId: selected.subject.id,
    upcomingId: selected.upcoming.id,
  });
}

function removeUpcoming(subjectId, upcomingId) {
  if (!subjectId || !upcomingId) return;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject || !Array.isArray(subject.upcoming)) return;
  subject.upcoming = subject.upcoming.filter((item) => item.id !== upcomingId);
  saveData(state.data);
  render();
  if (elements.subjectModal?.classList.contains('is-open') && activeSubjectId === subjectId) {
    openSubjectModal(subjectId);
  }
}

function applySubjectColor(subjectId, color) {
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject || !color) return;
  const normalized = normalizeColorValue(color);
  if (!normalized) return;
  if (subject.color && subject.color.toLowerCase() === normalized.toLowerCase()) {
    updateSubjectColorUI(subjectId, normalized);
    return;
  }
  subject.color = normalized;
  saveData(state.data);
  render();
  updateSubjectColorUI(subjectId, normalized);
}

function updateSubjectColorUI(subjectId, color) {
  if (!elements.subjectModal?.classList.contains('is-open')) return;
  if (activeSubjectId !== subjectId) return;
  const input = elements.subjectModal.querySelector('input[name="subjectColor"]');
  if (input) {
    input.value = color;
  }
  const valueLabel = elements.subjectModal.querySelector('[data-role="color-value"]');
  if (valueLabel) {
    valueLabel.textContent = color.toUpperCase();
  }
  const iconPreview = elements.subjectModal.querySelector('[data-role="icon-preview"]');
  if (iconPreview) {
    iconPreview.style.background = color;
  }
  elements.subjectModal.querySelectorAll('.color-swatch').forEach((swatch) => {
    swatch.classList.toggle(
      'is-active',
      swatch.dataset.color?.toLowerCase() === color.toLowerCase()
    );
  });
  const chartCanvas = elements.subjectModal.querySelector('#subject-modal-chart');
  if (chartCanvas) {
    const subject = state.data.subjects.find((item) => item.id === subjectId);
    if (!subject) return;
    drawSubjectModalChart(subject);
  }
}

function applySubjectIcon(subjectId, icon) {
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject || !icon) return;
  const normalized = resolveSubjectIcon(icon, subject.name);
  if (subject.icon && subject.icon === normalized) {
    updateSubjectIconUI(subjectId, normalized);
    return;
  }
  subject.icon = normalized;
  saveData(state.data);
  render();
  updateSubjectIconUI(subjectId, normalized);
}

function updateSubjectIconUI(subjectId, icon) {
  if (!elements.subjectModal?.classList.contains('is-open')) return;
  if (activeSubjectId !== subjectId) return;
  const carousel = elements.subjectModal.querySelector('[data-icon-carousel]');
  setIconCarouselActive(carousel, icon);
  const preview = elements.subjectModal.querySelector('[data-role="icon-preview"]');
  if (preview) {
    preview.innerHTML = subjectIconHtml(icon);
  }
}

function render() {
  renderOverview();
  renderSubjects();
  renderInsights();
  renderAssessments();
  renderUpcomingDashboard();
  renderUpcomingSubjectSelect();
  renderExportSubjectFilters();
  renderCharts();
  renderCalendar();
  renderTimetable();
  syncTimetableTodayProgressTicker();
}

function renderOverview() {
  const allAssessments = getAllAssessments();
  const overallAverage = weightedAverage(allAssessments);
  const overallGrade = getLetterGrade(overallAverage);
  const subjectCount = state.data.subjects.length;
  const assessmentCount = allAssessments.length;
  const bestGrade = getBestGrade(allAssessments);

  elements.overallPercent.textContent = overallAverage === null ? '--' : overallAverage.toFixed(1);
  elements.overallLetter.textContent = overallGrade ?? '--';
  elements.overallSub.textContent = overallAverage === null
    ? 'Add your first assessment to begin.'
    : `Weighted across ${assessmentCount} assessments.`;
  elements.overallSubjects.textContent = String(subjectCount);
  elements.overallAssessments.textContent = String(assessmentCount);
  elements.overallBest.textContent = bestGrade ?? '--';

  const gradeColor = gradeColorFor(overallGrade);
  elements.overallGradeSquare.style.background = gradeColor;

  const topSubject = getTopSubject();
  if (topSubject) {
    const stats = subjectStats(topSubject);
    elements.topSubjectName.textContent = topSubject.name;
    elements.topSubjectGrade.textContent = `${stats.average.toFixed(1)}% · ${stats.grade}`;
    elements.topSubjectFooter.textContent = `${topSubject.assessments.length} assessments logged.`;
    elements.topSubjectIcon.innerHTML = subjectIconHtml(resolveSubjectIcon(topSubject.icon, topSubject.name));
    elements.topSubjectIcon.style.background = topSubject.color;
  } else {
    elements.topSubjectName.textContent = 'No data yet';
    elements.topSubjectGrade.textContent = '--';
    elements.topSubjectFooter.textContent = 'Add assessments to see your leading subject.';
    elements.topSubjectIcon.innerHTML = subjectIconHtml('star');
    elements.topSubjectIcon.style.background = 'linear-gradient(135deg, var(--logo-gradient-1), var(--logo-gradient-2))';
  }

  const latest = getLatestAssessment();
  if (latest) {
    const percent = latest.total > 0 ? (latest.score / latest.total) * 100 : 0;
    elements.latestName.textContent = latest.name;
    elements.latestScore.textContent = `${percent.toFixed(1)}% · ${getLetterGrade(percent)}`;
    elements.latestMeta.textContent = `${latest.subjectName} · ${formatDate(latest.date)}`;
  } else {
    elements.latestName.textContent = 'Nothing logged';
    elements.latestScore.textContent = '--';
    elements.latestMeta.textContent = 'Once you add an assessment, it will appear here.';
  }

  renderV2Stats({ overallAverage, overallGrade, assessmentCount, topSubject, latest });
}

// V2's stat row. The V1 hero above stays in the DOM (hidden in V2) so both UIs share renderOverview.
function renderV2Stats({ overallAverage, overallGrade, assessmentCount, topSubject, latest }) {
  const container = document.getElementById('v2-stats');
  if (!container) return;
  const topStats = topSubject ? subjectStats(topSubject) : null;
  const latestPercent = latest && latest.total > 0 ? (latest.score / latest.total) * 100 : null;
  const tile = (label, value, sub, extraClass = '') => `
    <div class="v2-stat${extraClass}">
      <div class="v2-stat-label">${label}</div>
      <div class="v2-stat-value">${value}</div>
      <div class="v2-stat-sub">${sub}</div>
    </div>
  `;
  container.innerHTML = [
    tile(
      'Average',
      overallAverage === null ? '—' : `${overallAverage.toFixed(1)}<span class="v2-stat-unit">%</span>`,
      overallAverage === null ? 'Add your first mark to begin' : `Across ${assessmentCount} assessment${assessmentCount === 1 ? '' : 's'}`
    ),
    tile(
      'Grade',
      overallGrade ? `<span class="v2-grade" data-grade="${overallGrade[0]}">${overallGrade}</span>` : '—',
      'Overall letter grade'
    ),
    tile(
      'Top subject',
      topSubject ? escapeHtml(topSubject.name) : '—',
      topStats ? `${topStats.average.toFixed(1)}% · ${topStats.grade}` : 'No marks yet',
      ' v2-stat--text'
    ),
    tile(
      'Latest mark',
      latest ? escapeHtml(latest.name) : '—',
      latest ? `${latestPercent.toFixed(1)}% · ${escapeHtml(latest.subjectName)} · ${formatDate(latest.date)}` : 'Nothing logged yet',
      ' v2-stat--text'
    ),
  ].join('');
}

// ── V2 Analytics page ──
// V2 reuses the analytics canvases, table and search from V1 and fills extra v2-only
// containers (stat strip, subject breakdown). State lives in storage/DOM rather than
// top-level variables because render() runs before this part of the file is evaluated.

function getAnalyticsRange() {
  const value = safeGetItem('sapphire-analytics-range');
  return ['30', '90', 'all'].includes(value) ? value : 'all';
}

function analyticsRangeCutoff(range) {
  if (range === 'all') return null;
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Number(range) * 86400000;
}

function bindAnalyticsV2Controls() {
  const rangeGroup = document.getElementById('analytics-range');
  if (rangeGroup && !rangeGroup.dataset.bound) {
    rangeGroup.dataset.bound = 'true';
    rangeGroup.addEventListener('click', (event) => {
      const button = event.target.closest('[data-analytics-range]');
      if (!button) return;
      safeSetItem('sapphire-analytics-range', button.dataset.analyticsRange);
      hideChartTooltip();
      renderOverallChart();
    });
  }
  [document.getElementById('analytics-subjects'), elements.insightList].forEach((container) => {
    if (!container || container.dataset.openBound) return;
    container.dataset.openBound = 'true';
    container.addEventListener('click', (event) => {
      const row = event.target.closest('[data-action="open-subject"]');
      if (row) openSubjectModal(row.dataset.id);
    });
  });
}

function v2DeltaHtml(delta) {
  if (!Number.isFinite(delta)) return '';
  const dir = Math.abs(delta) < 0.05 ? 'flat' : delta > 0 ? 'up' : 'down';
  const icon = dir === 'up' ? 'trend-up' : dir === 'down' ? 'trend-down' : 'minus';
  const text = dir === 'flat' ? '0.0' : `${delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(1)}`;
  return `<span class="v2-an-delta" data-dir="${dir}">${iconHtml(icon, 'v2-an-delta-icon')}${text}</span>`;
}

function v2GradeBadge(grade, extraClass = '') {
  return `<span class="v2-grade${extraClass}" data-grade="${(grade || '-')[0]}">${grade ?? '—'}</span>`;
}

function buildAnalyticsSubjectRowV2(subject) {
  const stats = subjectStats(subject);
  const count = subject.assessments.length;
  const sorted = sortAssessments(subject.assessments);
  const latest = sorted[sorted.length - 1];
  const previousAverage = sorted.length > 1 ? weightedAverage(sorted.slice(0, -1)) : null;
  const delta = stats.average !== null && previousAverage !== null ? stats.average - previousAverage : null;
  const average = stats.average === null ? 0 : clamp(stats.average, 0, 100);
  const hasTarget = Number.isFinite(subject.target);
  const metaParts = [`${count} mark${count === 1 ? '' : 's'}`];
  if (latest) metaParts.push(`last ${formatDate(latest.date)}`);

  let targetText = 'No target set';
  let targetClass = '';
  if (hasTarget) {
    const targetLabel = `${formatPercentValue(subject.target)}%`;
    if (stats.average === null) {
      targetText = `Target ${targetLabel}`;
    } else if (stats.average >= subject.target) {
      targetText = `On target · ${targetLabel}`;
      targetClass = ' is-met';
    } else {
      const required = requiredForTarget(subject);
      targetClass = ' is-below';
      targetText = !required || required.needed > 100
        ? `${targetLabel} out of reach for now`
        : `Need ${Math.ceil(required.needed)}%${required.pending.length > 1 ? ' avg' : ''} next to hit ${targetLabel}`;
    }
  }

  return `
    <button class="v2-an-subject" type="button" data-action="open-subject" data-id="${subject.id}" style="--subject-color:${subject.color}">
      <span class="v2-subject-icon">${subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name))}</span>
      <span class="v2-subject-main">
        <span class="v2-subject-name">${escapeHtml(subject.name)}</span>
        <span class="v2-subject-meta">${metaParts.join(' · ')}</span>
      </span>
      <span class="v2-an-spark" aria-hidden="true"><canvas data-chart="v2-spark" data-id="${subject.id}"></canvas></span>
      <span class="v2-an-target${hasTarget ? '' : ' is-empty'}">
        <span class="v2-subject-progress" aria-hidden="true">
          <span class="v2-subject-fill" style="width:${average}%"></span>
          ${hasTarget ? `<span class="v2-subject-marker" style="left:${clamp(subject.target, 0, 100)}%"></span>` : ''}
        </span>
        <span class="v2-an-target-text${targetClass}">${targetText}</span>
      </span>
      <span class="v2-an-average">
        <span class="v2-an-average-value">${stats.average === null ? '—' : `${stats.average.toFixed(1)}%`}</span>
        ${v2DeltaHtml(delta)}
      </span>
      ${v2GradeBadge(stats.grade)}
    </button>
  `;
}

function renderAnalyticsV2() {
  bindAnalyticsV2Controls();
  const allAssessments = getAllAssessments();
  const sorted = sortAssessments(allAssessments);
  const timeline = buildOverallTimelinePoints(sorted);
  const overallAverage = weightedAverage(allAssessments);
  const overallGrade = getLetterGrade(overallAverage);
  const lastChange = timeline.length > 1
    ? timeline[timeline.length - 1].value - timeline[timeline.length - 2].value
    : null;
  const ranked = state.data.subjects
    .map((subject) => ({ subject, stats: subjectStats(subject) }))
    .filter((entry) => entry.stats.average !== null)
    .sort((left, right) => right.stats.average - left.stats.average);
  const best = ranked[0] || null;
  const worst = ranked.length > 1 ? ranked[ranked.length - 1] : null;
  const withTarget = state.data.subjects.filter((subject) => Number.isFinite(subject.target));
  const targetsMet = withTarget.filter((subject) => {
    const average = subjectStats(subject).average;
    return average !== null && average >= subject.target;
  }).length;

  const statsContainer = document.getElementById('analytics-stats');
  if (statsContainer) {
    const tile = (label, value, sub, extraClass = '') => `
      <div class="v2-stat${extraClass}">
        <div class="v2-stat-label">${label}</div>
        <div class="v2-stat-value">${value}</div>
        <div class="v2-stat-sub">${sub}</div>
      </div>
    `;
    const subjectTile = (label, entry, empty) => tile(
      label,
      entry ? `<span class="v2-an-stat-dot" style="--subject-color:${entry.subject.color}"></span>${escapeHtml(entry.subject.name)}` : '—',
      entry ? `${entry.stats.average.toFixed(1)}% · ${entry.stats.grade}` : empty,
      ' v2-stat--text'
    );
    const cutoff = analyticsRangeCutoff('30');
    const recentCount = sorted.filter((item) => assessmentDateValue(item) >= cutoff).length;
    const below = withTarget.length - targetsMet;
    statsContainer.innerHTML = [
      tile(
        'Overall average',
        overallAverage === null
          ? '—'
          : `${overallAverage.toFixed(1)}<span class="v2-stat-unit">%</span>${v2GradeBadge(overallGrade, ' v2-an-stat-grade')}`,
        overallAverage === null
          ? 'Add your first mark to begin'
          : lastChange === null
          ? `From ${allAssessments.length} assessment${allAssessments.length === 1 ? '' : 's'}`
          : `${v2DeltaHtml(lastChange)} since last mark`
      ),
      subjectTile('Strongest subject', best, 'No marks yet'),
      subjectTile('Needs focus', worst, ranked.length === 1 ? 'Add marks in another subject' : 'No marks yet'),
      withTarget.length
        ? tile(
            'Targets met',
            `${targetsMet}<span class="v2-stat-unit">&nbsp;/ ${withTarget.length}</span>`,
            below === 0 ? 'Every target is on track' : `${below} subject${below === 1 ? '' : 's'} below target`
          )
        : tile(
            'Assessments',
            String(allAssessments.length),
            `${recentCount} in the last 30 days`
          ),
    ].join('');
  }

  if (elements.insightList) {
    const recent = sorted.slice(-6).reverse();
    elements.insightList.innerHTML = recent.length
      ? recent
          .map((assessment) => {
            const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
            return `
              <button class="v2-an-recent" type="button" data-action="open-subject" data-id="${assessment.subjectId}" style="--subject-color:${assessment.subjectColor}">
                <span class="v2-an-dot" aria-hidden="true"></span>
                <span class="v2-an-recent-main">
                  <span class="v2-an-recent-name">${escapeHtml(assessment.name)}</span>
                  <span class="v2-an-recent-meta">${escapeHtml(assessment.subjectName)} · ${formatDate(assessment.date)}</span>
                </span>
                <span class="v2-an-recent-percent">${percent.toFixed(1)}%</span>
                ${v2GradeBadge(getLetterGrade(percent))}
              </button>
            `;
          })
          .join('')
      : '<div class="empty-state">No marks yet. Your latest results will show up here.</div>';
  }

  renderAnalyticsGradesV2(allAssessments);

  const subjectsContainer = document.getElementById('analytics-subjects');
  if (subjectsContainer) {
    if (!state.data.subjects.length) {
      subjectsContainer.innerHTML = '<div class="empty-state">No subjects yet. Add a subject to start tracking results.</div>';
    } else {
      const ordered = state.data.subjects
        .map((subject, index) => ({ subject, index, average: subjectStats(subject).average }))
        .sort((left, right) => compareNullableNumbers(left.average, right.average, 'desc') || left.index - right.index);
      subjectsContainer.innerHTML = ordered.map((entry) => buildAnalyticsSubjectRowV2(entry.subject)).join('');
    }
  }
}

// Grade breakdown: how many marks landed in each grade, A+ down to E. Clicking a
// column filters the All assessments table below to that grade; clicking it again
// clears the filter. The choice is kept on the container (render() runs before
// top-level state this far down is initialised).
function getAnalyticsGradeFilter() {
  return document.getElementById('analytics-grades')?.dataset.selectedGrade || '';
}

function setAnalyticsGradeFilter(grade) {
  const container = document.getElementById('analytics-grades');
  if (!container) return;
  container.dataset.selectedGrade = grade;
  renderAnalyticsGradesV2(getAllAssessments());
  renderAssessments();
  if (!grade) return;
  const table = document.querySelector('.assessment-card');
  const rect = table?.getBoundingClientRect();
  if (rect && (rect.top > window.innerHeight - 120 || rect.top < 0)) {
    table.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderAnalyticsGradesV2(allAssessments) {
  const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
  const container = document.getElementById('analytics-grades');
  const summary = document.getElementById('analytics-grades-summary');
  if (!container) return;
  bindAnalyticsGradesV2(container);

  const counts = new Map(gradeOrder.map((grade) => [grade, 0]));
  allAssessments
    .filter((assessment) => assessment.total > 0)
    .forEach((assessment) => {
      const grade = getLetterGrade((assessment.score / assessment.total) * 100);
      counts.set(grade, counts.get(grade) + 1);
    });
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);

  if (!total) {
    container.dataset.selectedGrade = '';
    container.classList.remove('has-selection');
    container.innerHTML = '<div class="empty-state">No marks yet. Your grade breakdown will show up here.</div>';
    if (summary) summary.textContent = 'How many of your marks landed in each grade.';
    return;
  }

  let selected = container.dataset.selectedGrade || '';
  if (selected && !counts.get(selected)) selected = '';
  container.dataset.selectedGrade = selected;
  container.classList.toggle('has-selection', Boolean(selected));

  const max = Math.max(...counts.values());
  container.innerHTML = gradeOrder.map((grade, index) => {
    const count = counts.get(grade);
    const height = count ? Math.max(8, (count / max) * 100) : 0;
    const bandStart = index > 0 && grade[0] !== gradeOrder[index - 1][0];
    return `
      <button class="an-grade-col${count ? '' : ' is-empty'}${bandStart ? ' is-band-start' : ''}${grade === selected ? ' is-selected' : ''}"
        type="button" data-grade="${grade[0]}" data-grade-value="${grade}" ${count ? '' : 'disabled'}
        aria-pressed="${grade === selected}" aria-label="${grade}: ${count} mark${count === 1 ? '' : 's'}${count ? ' — show them in the table' : ''}">
        <span class="an-grade-count">${count || ''}</span>
        <span class="an-grade-track"><span class="an-grade-bar" style="height:${height}%"></span></span>
        <span class="an-grade-label">${grade}</span>
      </button>
    `;
  }).join('');

  if (summary) {
    const [topGrade, topCount] = [...counts.entries()].reduce((best, entry) => (entry[1] > best[1] ? entry : best));
    const aRange = ['A+', 'A', 'A-'].reduce((sum, grade) => sum + counts.get(grade), 0);
    summary.textContent = `Most common: ${topGrade} (${topCount} of ${total} marks) · ${Math.round((aRange / total) * 100)}% in the A range. Click a grade to filter the table below.`;
  }
}

function bindAnalyticsGradesV2(container) {
  if (container.dataset.bound) return;
  container.dataset.bound = 'true';
  container.addEventListener('click', (event) => {
    const column = event.target.closest('[data-grade-value]');
    if (!column || column.disabled) return;
    const grade = column.dataset.gradeValue;
    setAnalyticsGradeFilter(getAnalyticsGradeFilter() === grade ? '' : grade);
  });
  document.getElementById('analytics-grade-filter')?.addEventListener('click', () => setAnalyticsGradeFilter(''));
}

function renderAnalyticsSparklines() {
  if (!isUiV2()) return;
  document.querySelectorAll('canvas[data-chart="v2-spark"]').forEach((canvas) => {
    const subject = state.data.subjects.find((item) => item.id === canvas.dataset.id);
    if (!subject) return;
    // Spaced one step per mark rather than by date, so the shape reads as a trend.
    const points = buildSubjectTimelinePoints(subject.assessments).map(({ value, label }) => ({ value, label }));
    drawLineChart(canvas, points, {
      stroke: subject.color,
      showAxis: false,
      v2: true,
      compact: true,
    });
  });
}

function renderInsights() {
  if (isUiV2()) {
    renderAnalyticsV2();
    return;
  }
  if (!elements.insightList) return;
  const allAssessments = getAllAssessments();
  const overallAverage = weightedAverage(allAssessments);
  const overallGrade = getLetterGrade(overallAverage);
  const topSubject = getTopSubject();
  const latest = getLatestAssessment();
  const topStats = topSubject ? subjectStats(topSubject) : null;

  const latestPercent = latest && latest.total > 0 ? (latest.score / latest.total) * 100 : 0;
  const insights = [
    {
      title: 'Overall average',
      detail: overallAverage === null ? 'Add assessments to calculate.' : `${overallAverage.toFixed(1)}% · ${overallGrade}`,
    },
    {
      title: 'Top subject',
      detail: topSubject && topStats
        ? `${topSubject.name} · ${topStats.average.toFixed(1)}% · ${topStats.grade}`
        : 'No subjects yet.',
    },
    {
      title: 'Latest assessment',
      detail: latest
        ? `${latest.name} · ${latestPercent.toFixed(1)}%`
        : 'No assessments yet.',
    },
    {
      title: 'Total assessments',
      detail: allAssessments.length ? `${allAssessments.length} logged so far.` : 'Start with your first mark.',
    },
  ];

  elements.insightList.innerHTML = insights
    .map(
      (item) => `
        <div class="insight-item">
          <strong>${item.title}</strong>
          <span>${item.detail}</span>
        </div>
      `
    )
    .join('');
}

function renderSubjects() {
  if (!elements.subjectGrid) return;
  if (state.data.subjects.length === 0) {
    elements.subjectGrid.innerHTML = '<div class="empty-state">No subjects yet. Add a subject to start tracking results.</div>';
    return;
  }

  if (isUiV2()) {
    elements.subjectGrid.innerHTML = `<div class="v2-subject-list">${state.data.subjects.map(buildV2SubjectRow).join('')}</div>`;
    return;
  }

  elements.subjectGrid.innerHTML = state.data.subjects
    .map((subject) => {
      const stats = subjectStats(subject);
      const averageValue = stats.average === null ? 0 : Math.max(0, Math.min(100, stats.average));
      const averageText = stats.average === null ? '--' : `${stats.average.toFixed(1)}%`;
      const subjectIcon = subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name));
      const hasTarget = Number.isFinite(subject.target);
      const targetMet = hasTarget && stats.average !== null && stats.average >= subject.target;
      const targetLine = hasTarget
        ? `<div class="subject-target-line${targetMet ? ' is-met' : ''}">
            <span>${iconHtml('target')}Target ${formatPercentValue(subject.target)}%</span>
            <span>${stats.average === null ? 'No marks yet' : targetMet ? 'On target' : `${(subject.target - stats.average).toFixed(1)}% to go`}</span>
          </div>`
        : '';
      return `
        <button class="subject-button" type="button" data-action="open-subject" data-id="${subject.id}">
          <div class="card subject-card glow-soft" data-id="${subject.id}">
            <div class="subject-header">
              <div class="subject-info">
                <div class="subject-icon" style="background:${subject.color}">${subjectIcon}</div>
                <div>
                  <div class="subject-title">${subject.name}</div>
                  <div class="subject-meta">${subject.assessments.length} assessments</div>
                </div>
              </div>
            </div>
            <div class="subject-stats">
              <div class="stat-box">
                <span>Average</span>
                <strong>${averageText}</strong>
              </div>
              <div class="stat-box">
                <span>Grade</span>
                <strong>${stats.grade ?? '--'}</strong>
              </div>
            </div>
            <div
              class="subject-average-progress"
              role="progressbar"
              aria-label="${subject.name} average"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${averageValue.toFixed(1)}"
            >
              <div class="subject-average-progress-track">
                <div
                  class="subject-average-progress-fill"
                  style="width:${averageValue}%; --subject-color:${subject.color};"
                ></div>
                ${hasTarget ? `<span class="target-bar-marker" style="left:${subject.target}%"></span>` : ''}
              </div>
            </div>
            ${targetLine}
          </div>
        </button>
      `;
    })
    .join('');
}

function buildV2SubjectRow(subject) {
  const stats = subjectStats(subject);
  const average = stats.average === null ? 0 : clamp(stats.average, 0, 100);
  const hasTarget = Number.isFinite(subject.target);
  const targetMet = hasTarget && stats.average !== null && stats.average >= subject.target;
  const count = subject.assessments.length;
  const metaParts = [`${count} assessment${count === 1 ? '' : 's'}`];
  if (hasTarget) {
    metaParts.push(
      stats.average === null
        ? `Target ${formatPercentValue(subject.target)}%`
        : targetMet
        ? `<span class="v2-target is-met">On target</span>`
        : `<span class="v2-target">${(subject.target - stats.average).toFixed(1)}% to target</span>`
    );
  }
  return `
    <button class="v2-subject-row" type="button" data-action="open-subject" data-id="${subject.id}" style="--subject-color:${subject.color}">
      <span class="v2-subject-icon">${subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name))}</span>
      <span class="v2-subject-main">
        <span class="v2-subject-name">${escapeHtml(subject.name)}</span>
        <span class="v2-subject-meta">${metaParts.join(' · ')}</span>
      </span>
      <span class="v2-subject-progress" aria-hidden="true">
        <span class="v2-subject-fill" style="width:${average}%"></span>
        ${hasTarget ? `<span class="v2-subject-marker" style="left:${clamp(subject.target, 0, 100)}%"></span>` : ''}
      </span>
      <span class="v2-subject-average">${stats.average === null ? '—' : `${stats.average.toFixed(1)}%`}</span>
      <span class="v2-grade" data-grade="${(stats.grade || '-')[0]}">${stats.grade ?? '—'}</span>
      ${iconHtml('caret-right', 'v2-subject-chevron')}
    </button>
  `;
}

function normalizeAssessmentSortDirection(direction) {
  return direction === 'asc' ? 'asc' : 'desc';
}

function compareNullableNumbers(left, right, direction = 'asc') {
  const leftNull = !Number.isFinite(left);
  const rightNull = !Number.isFinite(right);
  if (leftNull && rightNull) return 0;
  if (leftNull) return 1;
  if (rightNull) return -1;
  return direction === 'asc' ? left - right : right - left;
}

function buildAssessmentRows(items) {
  return (items || []).map((assessment, index) => {
    const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
    const grade = getLetterGrade(percent);
    return {
      assessment,
      percent,
      grade,
      gradeRank: GRADE_SORT_ORDER.get(grade) ?? -1,
      dateValue: assessmentDateValue(assessment),
      weightValue: Number.isFinite(assessment.weight) ? assessment.weight : null,
      index,
    };
  });
}

function sortAssessmentRows(rows, sortKey, sortDirection) {
  const direction = normalizeAssessmentSortDirection(sortDirection);
  const key = ASSESSMENT_SORT_KEYS.has(sortKey) ? sortKey : 'date';
  return [...rows].sort((left, right) => {
    let compare = 0;
    if (key === 'subject') {
      compare = left.assessment.subjectName.localeCompare(right.assessment.subjectName, undefined, { sensitivity: 'base' });
      if (compare === 0) {
        compare = left.assessment.name.localeCompare(right.assessment.name, undefined, { sensitivity: 'base' });
      }
      compare = direction === 'asc' ? compare : -compare;
    } else if (key === 'weight') {
      compare = compareNullableNumbers(left.weightValue, right.weightValue, direction);
      if (compare === 0) {
        compare = direction === 'asc' ? left.percent - right.percent : right.percent - left.percent;
      }
    } else if (key === 'percent') {
      compare = direction === 'asc' ? left.percent - right.percent : right.percent - left.percent;
    } else if (key === 'grade') {
      compare = direction === 'asc' ? left.gradeRank - right.gradeRank : right.gradeRank - left.gradeRank;
      if (compare === 0) {
        compare = direction === 'asc' ? left.percent - right.percent : right.percent - left.percent;
      }
    } else {
      compare = direction === 'asc' ? left.dateValue - right.dateValue : right.dateValue - left.dateValue;
    }
    if (compare !== 0) return compare;
    return left.index - right.index;
  });
}

function renderAssessmentSortState() {
  if (elements.assessmentSearch && elements.assessmentSearch.value !== state.assessmentTable.search) {
    elements.assessmentSearch.value = state.assessmentTable.search;
  }
  if (!elements.assessmentTableHead) return;
  const sortKey = ASSESSMENT_SORT_KEYS.has(state.assessmentTable.sortKey) ? state.assessmentTable.sortKey : 'date';
  const sortDirection = normalizeAssessmentSortDirection(state.assessmentTable.sortDirection);
  const toggles = elements.assessmentTableHead.querySelectorAll('[data-assessment-sort]');
  toggles.forEach((toggle) => {
    const key = toggle.dataset.assessmentSort;
    const active = key === sortKey;
    toggle.classList.toggle('is-active', active);
    toggle.dataset.direction = active ? sortDirection : 'none';
    toggle.setAttribute('aria-pressed', active ? 'true' : 'false');
    const indicator = toggle.querySelector('[data-sort-indicator]');
    if (indicator) {
      indicator.textContent = active ? (sortDirection === 'asc' ? '↑' : '↓') : '↕';
    }
    const heading = toggle.closest('th');
    if (heading) {
      heading.setAttribute('aria-sort', active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none');
    }
  });
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

// One table row in V2: subject dot, tabular numbers, a grade badge and icon-only actions.
// Keeps the same data-action buttons as V1 so the table's click handler works unchanged.
function buildAssessmentRowV2(row) {
  const { assessment, percent, grade } = row;
  const ids = `data-subject-id="${assessment.subjectId}" data-assessment-id="${assessment.id}"`;
  const shared = Boolean(assessment.leaderboardDocId);
  const name = escapeHtml(assessment.name);
  return `
    <tr class="v2-an-row">
      <td class="v2-an-cell-subject">
        <span class="v2-an-subject-cell" style="--subject-color:${assessment.subjectColor}">
          <span class="v2-an-dot" aria-hidden="true"></span>
          <span class="v2-an-subject-name">${escapeHtml(assessment.subjectName)}</span>
        </span>
      </td>
      <td class="v2-an-cell-name">${name}</td>
      <td class="v2-an-num v2-an-cell-score">${assessment.score}<span class="v2-an-of"> / ${assessment.total}</span></td>
      <td class="v2-an-num v2-an-cell-weight">${assessment.weight ?? '<span class="v2-an-none">—</span>'}</td>
      <td class="v2-an-num v2-an-cell-percent">${percent.toFixed(1)}%</td>
      <td class="v2-an-cell-grade">${v2GradeBadge(grade)}</td>
      <td class="v2-an-cell-date">${formatDate(assessment.date)}</td>
      <td class="v2-an-cell-actions">
        <div class="v2-an-actions">
          <button class="icon-button" type="button" data-action="edit-assessment" ${ids} title="Edit" aria-label="Edit ${name}">${iconHtml('pencil-simple')}</button>
          <button class="icon-button${shared ? ' is-shared' : ''}" type="button" data-action="share-assessment" ${ids} title="${shared ? 'Shared to leaderboard' : 'Share to leaderboard'}" aria-label="${shared ? 'Shared' : 'Share'} ${name}" ${canShareSubjectMarks(assessment.subjectId) ? '' : 'hidden'}>${iconHtml(shared ? 'cloud-check' : 'share-network')}</button>
          <button class="icon-button v2-an-remove" type="button" data-action="delete-assessment" ${ids} title="Remove" aria-label="Remove ${name}">${iconHtml('trash')}</button>
        </div>
      </td>
    </tr>
  `;
}

function renderAssessments() {
  renderShareAllButton();
  if (!elements.assessmentTable) return;
  if (!ASSESSMENT_SORT_KEYS.has(state.assessmentTable.sortKey)) {
    state.assessmentTable.sortKey = 'date';
  }
  state.assessmentTable.sortDirection = normalizeAssessmentSortDirection(state.assessmentTable.sortDirection);
  renderAssessmentSortState();

  const v2 = isUiV2();
  if (elements.assessmentSearch) {
    elements.assessmentSearch.placeholder = v2 ? 'Search assessments or subjects' : 'Type an assessment name';
  }
  const countLabel = document.getElementById('analytics-assessment-count');
  const allAssessments = sortAssessments(getAllAssessments()).reverse();
  if (allAssessments.length === 0) {
    if (countLabel) countLabel.textContent = '';
    elements.assessmentTable.innerHTML = '<tr><td colspan="8" class="empty-state">No assessments logged yet.</td></tr>';
    return;
  }

  const searchQuery = String(state.assessmentTable.search || '').trim().toLowerCase();
  const rows = buildAssessmentRows(allAssessments);
  // V2 also matches the subject name, and can be narrowed to one grade from the Grade breakdown.
  const gradeFilter = v2 ? getAnalyticsGradeFilter() : '';
  const filterTag = document.getElementById('analytics-grade-filter');
  if (filterTag) {
    filterTag.hidden = !gradeFilter;
    filterTag.innerHTML = gradeFilter ? `Grade ${escapeHtml(gradeFilter)}${iconHtml('x')}` : '';
    filterTag.setAttribute('aria-label', gradeFilter ? `Showing grade ${gradeFilter} only. Show all assessments` : '');
  }
  const filteredRows = rows.filter((row) =>
    (!gradeFilter || row.grade === gradeFilter) &&
    (!searchQuery ||
      row.assessment.name.toLowerCase().includes(searchQuery) ||
      (v2 && String(row.assessment.subjectName || '').toLowerCase().includes(searchQuery)))
  );
  if (countLabel) {
    countLabel.textContent = searchQuery || gradeFilter
      ? `${filteredRows.length} of ${rows.length}`
      : `${rows.length} total`;
  }

  if (filteredRows.length === 0) {
    elements.assessmentTable.innerHTML = `<tr><td colspan="8" class="empty-state">${gradeFilter && !searchQuery ? `No ${escapeHtml(gradeFilter)} marks.` : 'No assessments match your search.'}</td></tr>`;
    return;
  }

  const orderedRows = sortAssessmentRows(
    filteredRows,
    state.assessmentTable.sortKey,
    state.assessmentTable.sortDirection
  );

  if (v2) {
    elements.assessmentTable.innerHTML = orderedRows.map(buildAssessmentRowV2).join('');
    return;
  }

  elements.assessmentTable.innerHTML = orderedRows
    .map((row) => {
      const { assessment, percent, grade } = row;
      return `
        <tr>
          <td>${assessment.subjectName}</td>
          <td>${assessment.name}</td>
          <td>${assessment.score} / ${assessment.total}</td>
          <td>${assessment.weight ?? '--'}</td>
          <td>${percent.toFixed(1)}%</td>
          <td><span class="badge">${grade}</span></td>
          <td>${formatDate(assessment.date)}</td>
          <td>
            <div style="display: flex; gap: 8px;">
              <button class="ghost-button ghost-button--small" data-action="edit-assessment" data-subject-id="${assessment.subjectId}" data-assessment-id="${assessment.id}">Edit</button>
              <button class="ghost-button ghost-button--small${assessment.leaderboardDocId ? ' is-shared' : ''}" data-action="share-assessment" data-subject-id="${assessment.subjectId}" data-assessment-id="${assessment.id}" ${canShareSubjectMarks(assessment.subjectId) ? '' : 'hidden'}>
                ${assessment.leaderboardDocId ? '<i class="ph ph-cloud-check" style="margin-right:4px;"></i>Shared' : '<i class="ph ph-share-network" style="margin-right:4px;"></i>Share'}
              </button>
              <button class="delete-button" data-action="delete-assessment" data-subject-id="${assessment.subjectId}" data-assessment-id="${assessment.id}">Remove</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderUpcomingDashboard() {
  if (!elements.upcomingList) return;
  const upcoming = sortUpcoming(getVisibleUpcomingItems());
  const maxItems = 4;
  const canExpand = upcoming.length > maxItems;
  const visible = state.upcomingExpanded ? upcoming : upcoming.slice(0, maxItems);

  if (elements.upcomingCard) {
    elements.upcomingCard.classList.toggle('is-expanded', state.upcomingExpanded && canExpand);
  }

  if (elements.upcomingToggle) {
    elements.upcomingToggle.hidden = !canExpand;
    elements.upcomingToggle.setAttribute('aria-expanded', state.upcomingExpanded && canExpand ? 'true' : 'false');
    elements.upcomingToggle.innerHTML = state.upcomingExpanded && canExpand
      ? `${iconHtml('caret-up')}Show less`
      : `${iconHtml('caret-down')}See all`;
  }

  if (upcoming.length === 0) {
    elements.upcomingList.innerHTML = '<div class="empty-state">No upcoming work yet.</div>';
  } else {
    elements.upcomingList.innerHTML = buildUpcomingList(visible, { showSubject: true, allowRemove: true });
  }
  if (elements.upcomingAdd) {
    elements.upcomingAdd.disabled = state.data.subjects.length === 0;
  }
}

function renderUpcomingSubjectSelect() {
  if (!elements.upcomingSubjectSelect) return;
  if (!state.data.subjects.length) {
    elements.upcomingSubjectSelect.innerHTML = '<option value="">No subjects yet</option>';
    elements.upcomingSubjectSelect.disabled = true;
    return;
  }
  elements.upcomingSubjectSelect.disabled = false;
  const currentValue = elements.upcomingSubjectSelect.value;
  elements.upcomingSubjectSelect.innerHTML = state.data.subjects
    .map((subject) => `<option value="${subject.id}">${subject.name}</option>`)
    .join('');
  if (currentValue) {
    elements.upcomingSubjectSelect.value = currentValue;
  }
}

function renderCharts() {
  renderOverallChart();
  renderSubjectCharts();
  renderSubjectsChart();
  renderAnalyticsSparklines();
}

// V2: the overall trend card has a range switch (1M / 3M / All) and a headline figure.
// The running average is still computed over every mark; the range only crops the view.
function renderOverallChartV2(sorted, points) {
  const range = getAnalyticsRange();
  const cutoff = analyticsRangeCutoff(range);
  const visible = cutoff === null ? points : points.filter((point) => point.xValue >= cutoff);
  const baseline = cutoff === null
    ? points[0]
    : [...points].reverse().find((point) => point.xValue < cutoff) || visible[0];
  const current = points[points.length - 1];

  document.querySelectorAll('#analytics-range [data-analytics-range]').forEach((button) => {
    const active = button.dataset.analyticsRange === range;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const figure = document.getElementById('analytics-trend-figure');
  if (figure) {
    const rangeLabel = range === 'all' ? 'since your first mark' : `in the last ${range === '30' ? '30' : '90'} days`;
    const change = current && baseline && visible.length && current !== baseline ? current.value - baseline.value : null;
    // The overall average itself is in the stat strip above; this card leads with the change.
    const dir = change === null || Math.abs(change) < 0.05 ? 'flat' : change > 0 ? 'up' : 'down';
    const changeText = change === null ? '—' : dir === 'flat' ? '0.0' : `${change > 0 ? '+' : '−'}${Math.abs(change).toFixed(1)}`;
    figure.innerHTML = current
      ? `<span class="v2-an-figure-value" data-dir="${dir}">${changeText}<span class="v2-stat-unit">${change === null ? '' : '%'}</span></span>
         <span class="v2-an-figure-change">${change === null ? 'Not enough marks to show a change yet' : `Average ${rangeLabel}`}</span>`
      : '<span class="v2-an-figure-value">—</span><span class="v2-an-figure-change">Add marks to see your trend</span>';
  }

  if (elements.progressLegend) {
    elements.progressLegend.textContent = points.length === 0
      ? 'No marks yet.'
      : visible.length === 0
      ? 'No marks in this range.'
      : `${visible.length} mark${visible.length === 1 ? '' : 's'} shown · last updated ${formatDate(sorted[sorted.length - 1].date)}`;
  }

  drawLineChart(elements.overallChart, addTimelineEdgeLabels(visible.map((point) => ({ ...point }))), {
    stroke: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    showAxis: true,
    v2: true,
    emptyText: points.length ? 'No marks in this range' : 'No marks yet',
  });
}

function renderOverallChart() {
  if (!elements.overallChart) return;
  const sorted = sortAssessments(getAllAssessments());
  const points = buildOverallTimelinePoints(sorted);

  if (isUiV2()) {
    renderOverallChartV2(sorted, points);
    return;
  }

  if (elements.progressLegend) {
    if (points.length === 0) {
      elements.progressLegend.textContent = 'No data yet.';
    } else {
      elements.progressLegend.textContent = `Updated ${formatDate(sorted[sorted.length - 1].date)} · ${points.length} points`;
    }
  }

  drawLineChart(elements.overallChart, points, {
    stroke: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    showAxis: true,
  });
}

function renderSubjectCharts() {
  const canvases = document.querySelectorAll('canvas[data-chart="subject"]');
  canvases.forEach((canvas) => {
    const subjectId = canvas.dataset.id;
    const subject = state.data.subjects.find((item) => item.id === subjectId);
    if (!subject) return;
    const points = buildSubjectTimelinePoints(subject.assessments);
    drawLineChart(canvas, points, { stroke: subject.color, showAxis: false });
  });
}

function renderSubjectsChart() {
  if (!elements.subjectsChart) return;
  const allSeries = state.data.subjects
    .map((subject) => ({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      icon: resolveSubjectIcon(subject.icon, subject.name),
      points: buildSubjectTimelinePoints(subject.assessments),
      average: subjectStats(subject).average,
    }))
    .filter((subject) => subject.points.length > 0);
  const validIds = new Set(allSeries.map((subject) => subject.id));
  Array.from(hiddenSubjectsChartIds).forEach((subjectId) => {
    if (!validIds.has(subjectId)) {
      hiddenSubjectsChartIds.delete(subjectId);
    }
  });
  const series = allSeries.filter((subject) => !hiddenSubjectsChartIds.has(subject.id));
  const totalCount = allSeries.length;
  const visibleCount = series.length;

  const v2 = isUiV2();
  if (elements.subjectsLegend) {
    elements.subjectsLegend.textContent = !totalCount
      ? 'No subject data yet.'
      : v2
      ? `${visibleCount} of ${totalCount} subjects shown · Click a subject to show or hide its line.`
      : `${visibleCount}/${totalCount} subject lines visible · Hover for details. Tip: Click subject chips below to hide/show lines.`;
  }

  if (elements.subjectsKey) {
    elements.subjectsKey.innerHTML = allSeries
      .map(
        (subject) => `
          <button
            class="chart-key-item${hiddenSubjectsChartIds.has(subject.id) ? ' is-hidden' : ''}"
            type="button"
            data-action="toggle-subject-line"
            data-subject-id="${subject.id}"
            aria-pressed="${hiddenSubjectsChartIds.has(subject.id) ? 'false' : 'true'}"
            title="Click to ${hiddenSubjectsChartIds.has(subject.id) ? 'show' : 'hide'} ${subject.name}"
          >
            <span class="chart-key-swatch" style="--swatch:${subject.color}"></span>
            ${subject.name}${v2 && subject.average !== null ? `<span class="chart-key-value v2-only">${subject.average.toFixed(1)}%</span>` : ''}
          </button>
        `
      )
      .join('');
  }

  drawMultiLineChart(
    elements.subjectsChart,
    series,
    v2 ? { v2: true, emptyText: totalCount ? 'Every subject is hidden' : 'No marks yet' } : undefined
  );
}

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
      ${isCompleted ? iconHtml('check', 'calendar-v2-chip-icon') : '<span class="calendar-v2-chip-dot" aria-hidden="true"></span>'}
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
        <span class="calendar-v2-agenda-mark" aria-hidden="true"></span>
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

function buildCalendarAgendaV2(selected, eventsByDate, filterEvents) {
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

  const nextHtml = nextUp.length
    ? `
      <div class="calendar-v2-next">
        <div class="calendar-v2-next-title">Coming up</div>
        <ul class="calendar-v2-next-list">
          ${nextUp.slice(0, 4).map(({ event, dateKey }) => {
            const d = calendarDateFromKey(dateKey);
            return `
              <li>
                <button class="calendar-v2-next-item" type="button" data-calendar-date="${dateKey}" style="--event-color:${escapeHtml(event.color)}">
                  <span class="calendar-v2-next-date">
                    <span>${d.toLocaleDateString('en-AU', { weekday: 'short' })}</span>
                    <strong>${d.getDate()}</strong>
                  </span>
                  <span class="calendar-v2-chip-dot is-${event.upcomingType === 'homework' ? 'homework' : 'assessment'}" aria-hidden="true"></span>
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

  for (let index = 0; index < weeks * 7; index += 1) {
    const cellDate = new Date(year, month, index - startOffset + 1);
    const dateKey = dateKeyFromParts(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
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
    const ariaLabel = `${dayLabel}${isToday ? ', today' : ''}${events.length ? `, ${events.length} item${events.length === 1 ? '' : 's'}` : ''}`;

    cells.push(`
      <div class="calendar-cell calendar-v2-cell${isMuted ? ' is-muted' : ''}${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}${isWeekend ? ' is-weekend' : ''}${events.length ? ' has-events' : ''}" data-calendar-date="${dateKey}">
        <button class="calendar-day calendar-v2-day" type="button" data-calendar-date="${dateKey}" aria-label="${ariaLabel}" aria-pressed="${isSelected ? 'true' : 'false'}" tabindex="${isSelected ? '0' : '-1'}">${cellDate.getDate()}</button>
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
    summaryEl.textContent = `${text} this month`;
  }

  const agendaEl = document.getElementById('calendar-agenda');
  if (agendaEl) agendaEl.innerHTML = buildCalendarAgendaV2(selected, eventsByDate, filterEvents);
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

function parseDateKeyLocal(value) {
  const key = normalizeDateKey(value);
  if (!key) return new Date(Number.NaN);
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0);
}

function formatLocalDateKey(dateKey) {
  const date = parseDateKeyLocal(dateKey);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function normalizeDateKey(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const [, y, m, d] = match;
  return `${y}-${m}-${d}`;
}

function getDayIndexFromDateKey(dateKey) {
  const date = parseDateKeyLocal(dateKey);
  if (Number.isNaN(date.getTime())) return -1;
  return (date.getDay() + 6) % 7;
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

  const dayColumnsHtml = TIMETABLE_DAYS.map((dayName, dayIndex) => {
    const dayDate = selectedWeekDates[dayIndex];
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
      <section class="timetable-day-column">
        <div class="timetable-grid-head">
          ${dayName}
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
  if (!elements.timetableTodayList || !elements.timetableTodayTitle) return;
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
  elements.timetableTodayList.style.setProperty('--today-lesson-columns', String(Math.max(1, activePanelLessons.length)));
  elements.timetableTodayList.style.setProperty('--today-lesson-widths', lessonWidthTracks);

  elements.timetableTodayTitle.textContent = `${showNextDay ? 'Tomorrow' : 'Today'} · ${panelLabel}`;

  if (!activePanelLessons.length) {
    elements.timetableTodayList.innerHTML = `<div class="empty-state">No classes for ${showNextDay ? 'tomorrow' : 'today'}.</div>`;
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
  elements.timetableTodayList.innerHTML = `
    ${fallbackText}
    ${lessonsHtml}
    ${progressHtml}
  `;
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

function getThemeMode() {
  return document.documentElement?.dataset?.theme === 'light' ? 'light' : 'dark';
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

function addDays(date, amount) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  copy.setDate(copy.getDate() + amount);
  return copy;
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

function canonicalSubjectKey(value) {
  const text = normalizeSubjectNameKey(value);
  if (!text) return '';
  if (/mat|math/.test(text)) return 'mathematics';
  if (/eng/.test(text)) return 'english';
  if (/geo/.test(text)) return 'geography';
  if (/sci/.test(text)) return 'science';
  if (/pdh|pe/.test(text)) return 'pdhpe';
  if (/ctech|comput/.test(text)) return 'computing technology';
  if (/commerc|commerce/.test(text)) return 'commerce';
  return text;
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

function hashString(value) {
  let hash = 0;
  const text = String(value || '');
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// options.clampY keeps each curve segment between its two points' heights, so
// smoothing can't overshoot into loops or above 100% (used by V2 charts).
function traceSmoothLine(ctx, points, smoothness = 0.35, options = {}) {
  if (!points.length) return;
  const s = clamp(smoothness, 0, 1);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length < 2) return;
  if (s === 0) {
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    return;
  }
  const factor = s / 6;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) * factor;
    const cp1y = p1.y + (p2.y - p0.y) * factor;
    const cp2x = p2.x - (p3.x - p1.x) * factor;
    const cp2y = p2.y - (p3.y - p1.y) * factor;
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    ctx.bezierCurveTo(
      clamp(cp1x, minX, maxX),
      options.clampY ? clamp(cp1y, minY, maxY) : cp1y,
      clamp(cp2x, minX, maxX),
      options.clampY ? clamp(cp2y, minY, maxY) : cp2y,
      p2.x,
      p2.y
    );
  }
}

function withAlpha(color, alpha) {
  const value = String(color || '').trim();
  if (!value) return `rgba(0, 0, 0, ${alpha})`;
  if (value.startsWith('rgb')) {
    const parts = value
      .replace(/rgba?\(/, '')
      .replace(')', '')
      .split(',')
      .map((item) => parseFloat(item.trim()));
    if (parts.length >= 3) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    }
  }
  if (value.startsWith('#')) {
    let hex = value.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return value;
}

function scaleValue(value, min, max, start, end) {
  if (!Number.isFinite(value) || min === max) {
    return (start + end) / 2;
  }
  return start + ((value - min) / (max - min)) * (end - start);
}

function getValueRange(points, options = {}) {
  const values = (points || [])
    .map((point) => point.value)
    .filter((value) => Number.isFinite(value));
  if (!values.length) {
    return { min: 0, max: 100 };
  }
  let minValue = Math.min(...values);
  let maxValue = Math.max(...values);
  if (minValue === maxValue) {
    minValue -= 5;
    maxValue += 5;
  }
  const range = Math.max(maxValue - minValue, 1);
  const paddingRatio = Number.isFinite(options.paddingRatio) ? options.paddingRatio : 0.2;
  const minPadding = Number.isFinite(options.minPadding) ? options.minPadding : 10;
  const padding = Math.max(minPadding, range * paddingRatio);
  const minClamp = Number.isFinite(options.min) ? options.min : 0;
  const maxClamp = Number.isFinite(options.max) ? options.max : 100;
  let min = minValue - padding;
  let max = maxValue + padding;
  if (Number.isFinite(minClamp)) min = Math.max(minClamp, min);
  if (Number.isFinite(maxClamp)) max = Math.min(maxClamp, max);
  if (max - min < 1) {
    max = min + 1;
  }
  const roundToStep = Number.isFinite(options.roundToStep) && options.roundToStep > 0
    ? options.roundToStep
    : null;
  if (roundToStep) {
    const roundedMin = Math.floor(min / roundToStep) * roundToStep;
    const roundedMax = Math.ceil(max / roundToStep) * roundToStep;
    if (roundedMax - roundedMin >= roundToStep * 2) {
      return { min: roundedMin, max: roundedMax };
    }
  } else {
    const tickMin = Math.ceil(min / 5) * 5;
    const tickMax = Math.floor(max / 5) * 5;
    if (tickMax - tickMin >= 10) {
      return { min: tickMin, max: tickMax };
    }
  }
  return { min, max };
}

function buildTicks(min, max, steps = 4, options = {}) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [0, 25, 50, 75, 100];
  }
  const roundToStep = Number.isFinite(options.roundToStep) && options.roundToStep > 0
    ? options.roundToStep
    : 5;
  const roundedMin = Math.floor(min / roundToStep) * roundToStep;
  const roundedMax = Math.ceil(max / roundToStep) * roundToStep;
  const range = Math.max(roundedMax - roundedMin, roundToStep);
  const desiredSteps = Math.max(steps, 1);
  const stepMultiple = Math.max(1, Math.ceil(range / (desiredSteps * roundToStep)));
  const step = stepMultiple * roundToStep;
  const ticks = [];
  for (let value = roundedMin; value <= roundedMax + 0.0001; value += step) {
    ticks.push(value);
  }
  return ticks.length ? ticks : [roundedMin, roundedMax];
}

function drawEmptyChartState(ctx, width, height, options = {}) {
  if (!ctx) return;
  const paddingLeft = Number.isFinite(options.paddingLeft) ? options.paddingLeft : 36;
  const paddingRight = Number.isFinite(options.paddingRight) ? options.paddingRight : 36;
  const paddingTop = Number.isFinite(options.paddingTop) ? options.paddingTop : 18;
  const paddingBottom = Number.isFinite(options.paddingBottom) ? options.paddingBottom : 18;
  const showAxis = options.showAxis !== false;
  const axisColor = options.axisColor || '#7a8292';
  const lineColor = options.lineColor || withAlpha(axisColor, 0.45);
  if (showAxis) {
    const ticks = [0, 25, 50, 75, 100];
    ctx.fillStyle = axisColor;
    ctx.font = chartFont(12);
    ctx.textBaseline = 'middle';
    ticks.forEach((tick) => {
      const y =
        height -
        paddingBottom -
        (tick / 100) *
          (height - paddingTop - paddingBottom);
      ctx.textAlign = 'left';
      ctx.fillText(`${tick}`, 4, y);
      ctx.textAlign = 'right';
      ctx.fillText(`${tick}`, width - 4, y);
    });
  }
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(paddingLeft, height - paddingBottom);
  ctx.lineTo(width - paddingRight, paddingTop);
  ctx.stroke();
}

function spreadDenseXCoordinates(points, minX, maxX, minGap = 6) {
  if (!points || points.length < 2) {
    return (points || []).map((point) => point.x);
  }
  const span = Math.max(maxX - minX, 1);
  const effectiveGap = Math.min(minGap, span / (points.length - 1));
  const adjusted = new Array(points.length);
  adjusted[0] = clamp(points[0].x, minX, maxX);
  for (let index = 1; index < points.length; index += 1) {
    adjusted[index] = Math.max(points[index].x, adjusted[index - 1] + effectiveGap);
  }
  if (adjusted[adjusted.length - 1] > maxX) {
    adjusted[adjusted.length - 1] = maxX;
    for (let index = adjusted.length - 2; index >= 0; index -= 1) {
      adjusted[index] = Math.min(adjusted[index], adjusted[index + 1] - effectiveGap);
    }
    if (adjusted[0] < minX) {
      adjusted[0] = minX;
      for (let index = 1; index < adjusted.length; index += 1) {
        adjusted[index] = Math.max(adjusted[index], adjusted[index - 1] + effectiveGap);
      }
    }
  }
  return adjusted.map((value) => clamp(value, minX, maxX));
}

function buildDateAxisLabels(minDateValue, maxDateValue, minX, maxX) {
  if (!Number.isFinite(minDateValue) || !Number.isFinite(maxDateValue) || maxDateValue <= minDateValue) {
    return [];
  }
  const fractions = [0, 0.25, 0.5, 0.75, 1];
  return fractions.map((fraction) => {
    const dateValue = minDateValue + (maxDateValue - minDateValue) * fraction;
    const x = minX + (maxX - minX) * fraction;
    return {
      x,
      text: formatDate(new Date(dateValue)),
    };
  });
}

// Canvas text can't trigger a web-font download, so V2 asks for it and redraws the charts once it's ready.
if (document.fonts && typeof document.fonts.load === 'function') {
  window.addEventListener('load', () => {
    document.fonts.load('400 12px "Space Grotesk"').then(() => {
      if (isUiV2()) renderCharts();
    }).catch(() => {});
  });
}

function chartFont(size) {
  return `${size}px ${isUiV2() ? '"Space Grotesk", sans-serif' : '"Red Hat Display", sans-serif'}`;
}

function drawLineChart(canvas, points, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 300;
  const height = canvas.clientHeight || 120;
  if (width === 0 || height === 0) return;
  const series = (points || []).map((point) =>
    typeof point === 'number'
      ? {
          value: point,
          label: '',
        }
      : point
  );
  const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#7a8292';
  const showAxis = options.showAxis !== false;
  // V2 (optional): hairline grid, left-hand labels, flat fill and an end dot.
  // `compact` draws a bare sparkline. V1 callers don't pass these and render as before.
  const v2 = options.v2 === true;
  const compact = v2 && options.compact === true;
  const v2Colors = v2 ? getV2ChartColors() : null;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const hasPlottableValues = series.some((point) => Number.isFinite(point?.value));
  if (!hasPlottableValues && v2) {
    if (!compact) drawV2EmptyChart(ctx, width, height, v2Colors, options.emptyText);
    canvas._chartPoints = [];
    bindChartHover(canvas);
    return;
  }
  if (!hasPlottableValues) {
    drawEmptyChartState(ctx, width, height, {
      paddingLeft: 36,
      paddingRight: 36,
      paddingTop: 18,
      paddingBottom: 18,
      axisColor,
      showAxis,
    });
    canvas._chartPoints = [];
    bindChartHover(canvas);
    return;
  }

  const paddingLeft = compact ? 4 : v2 ? 34 : 36;
  const paddingRight = compact ? 4 : v2 ? 14 : 36;
  const paddingTop = compact ? 4 : v2 ? 12 : 18;
  const datedValues = series
    .map((point) => (Number.isFinite(point.xValue) ? point.xValue : null))
    .filter((value) => Number.isFinite(value));
  const hasDateScale = datedValues.length >= 2;
  const minDateValue = hasDateScale ? Math.min(...datedValues) : null;
  const maxDateValue = hasDateScale ? Math.max(...datedValues) : null;
  const canScaleByDate =
    hasDateScale &&
    Number.isFinite(minDateValue) &&
    Number.isFinite(maxDateValue) &&
    maxDateValue > minDateValue;
  const hasAxisLabels = showAxis && (series.some((point) => point.axisLabel) || canScaleByDate);
  const paddingBottom = compact ? 4 : v2 ? (hasAxisLabels ? 28 : 12) : hasAxisLabels ? 30 : 18;
  const fallbackDenom = Math.max(series.length - 1, 1);
  const resolveX = (point, index) => {
    if (canScaleByDate && Number.isFinite(point.xValue)) {
      return (
        paddingLeft +
        ((point.xValue - minDateValue) / (maxDateValue - minDateValue)) *
          (width - paddingLeft - paddingRight)
      );
    }
    return paddingLeft + ((width - paddingLeft - paddingRight) / fallbackDenom) * index;
  };
  const valueRange = getValueRange(series, { min: 0, max: 100 });
  const ticks = buildTicks(valueRange.min, valueRange.max, 4);

  if (showAxis && v2) {
    drawV2Grid(ctx, ticks, valueRange, { width, height, paddingLeft, paddingRight, paddingTop, paddingBottom }, v2Colors);
    if (hasAxisLabels) {
      const labels = canScaleByDate
        ? buildDateAxisLabels(minDateValue, maxDateValue, paddingLeft, width - paddingRight)
        : series
            .map((point, index) => (point.axisLabel ? { x: resolveX(point, index), text: point.axisLabel } : null))
            .filter(Boolean);
      drawV2XLabels(ctx, labels, width, height, v2Colors);
    }
  } else if (showAxis) {
    ctx.fillStyle = axisColor;
    ctx.font = chartFont(12);
    ctx.textBaseline = 'middle';
    ticks.forEach((tick) => {
      const y =
        height -
        paddingBottom -
        ((tick - valueRange.min) / (valueRange.max - valueRange.min)) *
          (height - paddingTop - paddingBottom);
      ctx.textAlign = 'left';
      ctx.fillText(`${Math.round(tick)}`, 4, y);
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(tick)}`, width - 4, y);
    });
    if (hasAxisLabels) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.font = chartFont(10);
      if (canScaleByDate) {
        const axisLabelPoints = buildDateAxisLabels(
          minDateValue,
          maxDateValue,
          paddingLeft,
          width - paddingRight
        );
        axisLabelPoints.forEach((item) => {
          ctx.fillText(item.text, item.x, height - 5);
        });
      } else {
        series.forEach((point, index) => {
          if (!point.axisLabel) return;
          const x = resolveX(point, index);
          ctx.fillText(point.axisLabel, x, height - 5);
        });
      }
      ctx.font = chartFont(12);
      ctx.textBaseline = 'middle';
    }
  }

  const stroke = options.stroke || '#2aa9ff';
  const max = valueRange.max;
  const min = valueRange.min;
  const lineSmoothness = state.graphSmoothness;
  const chartPoints = series.map((point, index) => {
    const x = resolveX(point, index);
    const y = Number.isFinite(point.value)
      ? height - paddingBottom - ((point.value - min) / (max - min)) * (height - paddingTop - paddingBottom)
      : null;
    return {
      x,
      y,
      value: point.value,
      label: point.label,
      xValue: Number.isFinite(point.xValue) ? point.xValue : null,
      preview: point.preview === true,
    };
  });
  const drawablePoints = chartPoints.filter((point) => Number.isFinite(point.y));
  if (canScaleByDate && drawablePoints.length > 2) {
    const adjusted = spreadDenseXCoordinates(drawablePoints, paddingLeft, width - paddingRight, 6);
    drawablePoints.forEach((point, index) => {
      point.x = adjusted[index];
    });
  }
  if (drawablePoints.length < 1) {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - paddingRight, paddingTop);
    ctx.stroke();
    canvas._chartPoints = [];
    bindChartHover(canvas);
    return;
  }

  // What-if points are drawn as a dashed continuation of the real line.
  const realPoints = drawablePoints.filter((point) => !point.preview);
  const previewPoints = drawablePoints.filter((point) => point.preview);

  // V2: a faint flat area under the line, painted first so the line sits on top.
  if (v2 && !compact && realPoints.length > 1) {
    ctx.fillStyle = withAlpha(stroke, 0.08);
    traceSmoothLine(ctx, realPoints, lineSmoothness, { clampY: options.v2 === true });
    ctx.lineTo(realPoints[realPoints.length - 1].x, height - paddingBottom);
    ctx.lineTo(realPoints[0].x, height - paddingBottom);
    ctx.closePath();
    ctx.fill();
  }

  ctx.lineWidth = compact ? 1.75 : v2 ? 2 : 2.5;
  ctx.strokeStyle = stroke;
  if (v2) ctx.lineJoin = 'round';
  if (realPoints.length > 1) {
    traceSmoothLine(ctx, realPoints, lineSmoothness, { clampY: options.v2 === true });
    ctx.stroke();
  } else if (realPoints.length === 1) {
    ctx.beginPath();
    ctx.arc(realPoints[0].x, realPoints[0].y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = stroke;
    ctx.fill();
  }

  const gradient = v2 ? null : ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
  if (gradient) {
    gradient.addColorStop(0, withAlpha(stroke, 0.35));
    gradient.addColorStop(1, withAlpha(stroke, 0.05));
  }
  if (!v2 && realPoints.length > 2) {
    ctx.fillStyle = gradient;
    traceSmoothLine(ctx, realPoints, lineSmoothness, { clampY: options.v2 === true });
    ctx.lineTo(realPoints[realPoints.length - 1].x, height - paddingBottom);
    ctx.lineTo(realPoints[0].x, height - paddingBottom);
    ctx.closePath();
    ctx.fill();
  }

  if (previewPoints.length) {
    const dashed = realPoints.length ? [realPoints[realPoints.length - 1], ...previewPoints] : previewPoints;
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = withAlpha(stroke, 0.85);
    ctx.lineWidth = 2;
    ctx.beginPath();
    dashed.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = stroke;
    previewPoints.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  if (v2 && realPoints.length > 1) {
    drawV2EndDot(ctx, realPoints[realPoints.length - 1], stroke, v2Colors, compact ? 2.25 : 3.25);
  }

  canvas._chartPoints = drawablePoints;
  bindChartHover(canvas);
}

function getV2ChartColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    text: styles.getPropertyValue('--text-tertiary').trim() || '#737373',
    grid: styles.getPropertyValue('--card-border').trim() || '#222222',
    surface: styles.getPropertyValue('--card-surface').trim() || '#0a0a0a',
  };
}

// Hairline horizontal grid with value labels on the left (V2 charts).
function drawV2Grid(ctx, ticks, range, box, colors) {
  const { width, height, paddingLeft, paddingRight, paddingTop, paddingBottom } = box;
  const span = Math.max(range.max - range.min, 1e-6);
  ctx.save();
  ctx.font = chartFont(11);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 1;
  ticks
    .filter((tick) => tick >= range.min - 0.001 && tick <= range.max + 0.001)
    .forEach((tick) => {
      const y = Math.round(height - paddingBottom - ((tick - range.min) / span) * (height - paddingTop - paddingBottom)) + 0.5;
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();
      ctx.fillStyle = colors.text;
      ctx.fillText(`${Math.round(tick)}`, paddingLeft - 8, y);
    });
  ctx.restore();
}

function drawV2XLabels(ctx, labels, width, height, colors) {
  // Narrow charts keep only the first, middle and last dates.
  const items = width < 420 && labels.length === 5 ? [labels[0], labels[2], labels[4]] : labels;
  ctx.save();
  ctx.font = chartFont(11);
  ctx.fillStyle = colors.text;
  ctx.textBaseline = 'alphabetic';
  items.forEach((item, index) => {
    const isFirst = items.length > 1 && index === 0;
    const isLast = items.length > 1 && index === items.length - 1;
    ctx.textAlign = isFirst ? 'left' : isLast ? 'right' : 'center';
    ctx.fillText(item.text, item.x, height - 8);
  });
  ctx.restore();
}

function drawV2EndDot(ctx, point, color, colors, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = colors.surface;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawV2EmptyChart(ctx, width, height, colors, text) {
  const box = { width, height, paddingLeft: 34, paddingRight: 14, paddingTop: 12, paddingBottom: 12 };
  drawV2Grid(ctx, [0, 25, 50, 75, 100], { min: 0, max: 100 }, box, colors);
  const label = text || 'No marks yet';
  ctx.save();
  ctx.font = chartFont(13);
  const x = (box.paddingLeft + width - box.paddingRight) / 2;
  const y = height / 2;
  const textWidth = ctx.measureText(label).width;
  ctx.fillStyle = colors.surface;
  ctx.fillRect(x - textWidth / 2 - 10, y - 12, textWidth + 20, 24);
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);
  ctx.restore();
}

function drawMultiLineChart(canvas, series, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 300;
  const height = canvas.clientHeight || 160;
  if (width === 0 || height === 0) return;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const v2 = options.v2 === true;
  const v2Colors = v2 ? getV2ChartColors() : null;
  const paddingLeft = v2 ? 34 : 36;
  const paddingRight = v2 ? 14 : 36;
  const paddingTop = v2 ? 12 : 18;
  const paddingBottom = v2 ? 28 : 18;
  const allSeriesPoints = series.flatMap((line) => line.points || []);
  const hasPlottableValues = allSeriesPoints.some((point) => Number.isFinite(point?.value));
  if (v2 && (!series || series.length === 0 || !hasPlottableValues)) {
    drawV2EmptyChart(ctx, width, height, v2Colors, options.emptyText || 'No marks yet');
    canvas._chartPoints = [];
    bindChartHover(canvas);
    return;
  }
  if (!series || series.length === 0 || !hasPlottableValues) {
    const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#7a8292';
    drawEmptyChartState(ctx, width, height, {
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      axisColor,
      showAxis: true,
    });
    canvas._chartPoints = [];
    bindChartHover(canvas);
    return;
  }
  const chartSpan = width - paddingLeft - paddingRight;
  const valueRange = getValueRange(allSeriesPoints, {
    min: 0,
    max: 100,
    paddingRatio: 0.08,
    minPadding: 1.5,
    roundToStep: 5,
  });
  const tickStep = v2 && valueRange.max - valueRange.min > 40 ? 10 : 5;
  const tickMin = Math.floor(valueRange.min / tickStep) * tickStep;
  const tickMax = Math.ceil(valueRange.max / tickStep) * tickStep;
  const ticks = [];
  for (let value = tickMin; value <= tickMax + 0.0001; value += tickStep) {
    ticks.push(value);
  }
  const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#7a8292';

  // V2 puts every line on one shared date scale and labels it along the bottom.
  const sharedDateValues = v2
    ? allSeriesPoints.map((point) => point.xValue).filter((value) => Number.isFinite(value))
    : [];
  const sharedMinDate = sharedDateValues.length ? Math.min(...sharedDateValues) : null;
  const sharedMaxDate = sharedDateValues.length ? Math.max(...sharedDateValues) : null;
  const hasSharedDateScale = v2 && sharedDateValues.length >= 2 && sharedMaxDate > sharedMinDate;
  if (v2) {
    drawV2Grid(ctx, ticks, valueRange, { width, height, paddingLeft, paddingRight, paddingTop, paddingBottom }, v2Colors);
    if (hasSharedDateScale) {
      drawV2XLabels(ctx, buildDateAxisLabels(sharedMinDate, sharedMaxDate, paddingLeft, width - paddingRight), width, height, v2Colors);
    }
  }
  if (!v2) ctx.fillStyle = axisColor;
  ctx.font = chartFont(12);
  ctx.textBaseline = 'middle';
  if (!v2) ticks.forEach((tick) => {
    const y =
      height -
      paddingBottom -
      ((tick - valueRange.min) / (valueRange.max - valueRange.min)) *
        (height - paddingTop - paddingBottom);
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(tick)}`, 4, y);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(tick)}`, width - 4, y);
  });

  const allPoints = [];
  const lineEnds = [];
  series.forEach((line) => {
    const points = line.points;
    if (!points.length) return;
    ctx.lineWidth = v2 ? 1.75 : 2.2;
    ctx.strokeStyle = line.color || '#2aa9ff';
    const denom = Math.max(points.length - 1, 1);
    const lineDateValues = points
      .map((point) => (Number.isFinite(point.xValue) ? point.xValue : null))
      .filter((value) => Number.isFinite(value));
    const hasLineDateScale = v2 ? hasSharedDateScale : lineDateValues.length >= 2;
    const lineMinDateValue = hasLineDateScale ? (v2 ? sharedMinDate : Math.min(...lineDateValues)) : null;
    const lineMaxDateValue = hasLineDateScale ? (v2 ? sharedMaxDate : Math.max(...lineDateValues)) : null;
    const canScaleLineByDate =
      hasLineDateScale &&
      Number.isFinite(lineMinDateValue) &&
      Number.isFinite(lineMaxDateValue) &&
      lineMaxDateValue > lineMinDateValue;
    const chartPoints = points.map((point, index) => {
      const x = canScaleLineByDate && Number.isFinite(point.xValue)
        ? paddingLeft +
          ((point.xValue - lineMinDateValue) / (lineMaxDateValue - lineMinDateValue)) *
            chartSpan
        : paddingLeft + (chartSpan / denom) * index;
      const y = Number.isFinite(point.value)
        ? height -
          paddingBottom -
          ((point.value - valueRange.min) / (valueRange.max - valueRange.min)) *
            (height - paddingTop - paddingBottom)
        : null;
      const entry = {
        x,
        y,
        value: point.value,
        label: point.label ? `${line.name}: ${point.label}` : line.name,
        xValue: Number.isFinite(point.xValue) ? point.xValue : null,
      };
      if (Number.isFinite(entry.y)) {
        allPoints.push(entry);
      }
      return entry;
    });
    const drawablePoints = chartPoints.filter((point) => Number.isFinite(point.y));
    if (canScaleLineByDate && drawablePoints.length > 2) {
      const adjusted = spreadDenseXCoordinates(drawablePoints, paddingLeft, width - paddingRight, 6);
      drawablePoints.forEach((point, index) => {
        point.x = adjusted[index];
      });
    }
    if (drawablePoints.length > 1) {
      traceSmoothLine(ctx, drawablePoints, state.graphSmoothness, { clampY: v2 });
      ctx.stroke();
      if (v2) lineEnds.push({ point: drawablePoints[drawablePoints.length - 1], color: line.color || '#2aa9ff' });
    } else if (drawablePoints.length === 1) {
      ctx.beginPath();
      ctx.arc(drawablePoints[0].x, drawablePoints[0].y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = line.color || '#2aa9ff';
      ctx.fill();
    }
  });

  lineEnds.forEach((end) => drawV2EndDot(ctx, end.point, end.color, v2Colors, 3));

  canvas._chartPoints = allPoints;
  bindChartHover(canvas);
}

function dateStringValue(value) {
  if (!value) return 0;
  if (typeof value === 'string') {
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
      return Date.UTC(parts[0], parts[1] - 1, parts[2]);
    }
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 0;
  return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getAssessmentDateParts(assessment) {
  const dateValue = dateStringValue(assessment?.date);
  if (!dateValue) return null;
  const date = new Date(dateValue);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
  };
}

function getLatestAssessmentYear(items) {
  const years = (items || [])
    .map((item) => getAssessmentDateParts(item)?.year)
    .filter((year) => Number.isFinite(year));
  return years.length ? Math.max(...years) : new Date().getFullYear();
}

function buildMonthlyAveragePoints(items, options = {}) {
  const weighted = options.weighted === true;
  const year = Number.isFinite(options.year) ? options.year : getLatestAssessmentYear(items);
  const buckets = Array.from({ length: 12 }, () => ({
    sum: 0,
    totalWeight: 0,
    count: 0,
    names: [],
  }));

  sortAssessments(items || []).forEach((assessment) => {
    const parts = getAssessmentDateParts(assessment);
    if (!parts || parts.year !== year) return;
    const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
    const weight = weighted ? (assessment.weight === null ? 1 : assessment.weight) : 1;
    const bucket = buckets[parts.month];
    bucket.sum += percent * weight;
    bucket.totalWeight += weight;
    bucket.count += 1;
    if (assessment.name) {
      bucket.names.push(assessment.name);
    }
  });

  const points = MONTH_AXIS_LABELS.map((axisLabel, monthIndex) => {
    const bucket = buckets[monthIndex];
    const value = bucket.totalWeight > 0 ? bucket.sum / bucket.totalWeight : null;
    const monthBaseLabel = `${axisLabel} ${year}`;
    let label = monthBaseLabel;
    if (bucket.count === 1 && bucket.names[0]) {
      label = `${monthBaseLabel} · ${bucket.names[0]}`;
    } else if (bucket.count > 1) {
      label = `${monthBaseLabel} · ${bucket.count} assessments`;
    }
    return {
      value,
      label,
      axisLabel,
    };
  });

  return { year, points };
}

function addTimelineEdgeLabels(points) {
  if (!points.length) return points;
  points[0].axisLabel = formatDate(points[0].xValue);
  if (points.length > 1) {
    points[points.length - 1].axisLabel = formatDate(points[points.length - 1].xValue);
  }
  return points;
}

function buildSubjectTimelinePoints(items) {
  const sorted = sortAssessments(items || []);
  let lastXValue = -Infinity;
  const points = sorted.map((assessment) => {
    const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
    const dateLabel = formatDate(assessment.date);
    let xValue = assessmentDateValue(assessment);
    if (!Number.isFinite(xValue)) {
      xValue = lastXValue + 1;
    } else if (xValue <= lastXValue) {
      xValue = lastXValue + 1;
    }
    lastXValue = xValue;
    return {
      value: percent,
      label: `${dateLabel} · ${assessment.name}`,
      xValue,
    };
  });
  return addTimelineEdgeLabels(points);
}

function buildOverallTimelinePoints(items) {
  const sorted = sortAssessments(items || []);
  let runningWeight = 0;
  let runningSum = 0;
  let lastXValue = -Infinity;
  const points = sorted.map((assessment) => {
    const weight = assessment.weight === null ? 1 : assessment.weight;
    const percent = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
    runningSum += (percent / 100) * weight;
    runningWeight += weight;
    const dateLabel = formatDate(assessment.date);
    const name = assessment.subjectName ? `${assessment.subjectName}: ${assessment.name}` : assessment.name;
    let xValue = assessmentDateValue(assessment);
    if (!Number.isFinite(xValue)) {
      xValue = lastXValue + 1;
    } else if (xValue <= lastXValue) {
      xValue = lastXValue + 1;
    }
    lastXValue = xValue;
    return {
      value: (runningSum / runningWeight) * 100,
      label: `${dateLabel} · ${name}`,
      xValue,
    };
  });
  return addTimelineEdgeLabels(points);
}

function dateKeyFromParts(year, month, day) {
  const paddedMonth = String(month + 1).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
}

function formatMonthYear(year, month) {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

function assessmentDateValue(assessment) {
  return dateStringValue(assessment.date);
}

function assessmentTieBreak(assessment) {
  if (Number.isFinite(assessment.createdAt)) return assessment.createdAt;
  const order = Number.isFinite(assessment.order) ? assessment.order : 0;
  return -order;
}

function sortAssessments(items) {
  return items
    .map((assessment, index) => ({
      ...assessment,
      order: Number.isFinite(assessment.order) ? assessment.order : index,
    }))
    .sort((a, b) => {
      const dateDiff = assessmentDateValue(a) - assessmentDateValue(b);
      if (dateDiff !== 0) return dateDiff;
      return assessmentTieBreak(a) - assessmentTieBreak(b);
    });
}

function weightedAverage(items) {
  if (items.length === 0) return null;
  let totalWeight = 0;
  let sum = 0;
  items.forEach((item) => {
    const weight = item.weight === null ? 1 : item.weight;
    if (item.total > 0) {
      sum += (item.score / item.total) * weight;
      totalWeight += weight;
    }
  });
  if (!totalWeight) return null;
  return (sum / totalWeight) * 100;
}

function getAllAssessments() {
  return state.data.subjects.flatMap((subject) =>
    subject.assessments.map((assessment, index) => ({
      ...assessment,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color,
      subjectIcon: resolveSubjectIcon(subject.icon, subject.name),
      order: index,
    }))
  );
}

function expandUpcomingItems(subject) {
  return (subject.upcoming || []).map((item, index) => ({
    ...item,
    subjectId: subject.id,
    subjectName: subject.name,
    subjectColor: subject.color,
    subjectIcon: resolveSubjectIcon(subject.icon, subject.name),
    order: index,
  }));
}

function getUpcomingAssessments() {
  return state.data.subjects.flatMap((subject) => expandUpcomingItems(subject));
}

function getVisibleUpcomingItems() {
  return getUpcomingAssessments().filter((item) => {
    const upcomingType = normalizeUpcomingType(item.type);
    if (upcomingType !== 'assessment') return true;
    return !isPastDate(item.date);
  });
}

function upcomingDateValue(item) {
  return dateStringValue(item.date);
}

function upcomingTypePriority(value) {
  return normalizeUpcomingType(value) === 'assessment' ? 0 : 1;
}

function upcomingTieBreak(item) {
  if (Number.isFinite(item.createdAt)) return item.createdAt;
  const order = Number.isFinite(item.order) ? item.order : 0;
  return -order;
}

function sortUpcoming(items) {
  return items
    .map((item, index) => ({
      ...item,
      order: Number.isFinite(item.order) ? item.order : index,
    }))
    .sort((a, b) => {
      const dateDiff = upcomingDateValue(a) - upcomingDateValue(b);
      if (dateDiff !== 0) return dateDiff;
      const typeDiff = upcomingTypePriority(a.type) - upcomingTypePriority(b.type);
      if (typeDiff !== 0) return typeDiff;
      return upcomingTieBreak(a) - upcomingTieBreak(b);
    });
}

function isPastDate(value) {
  if (!value) return false;
  return dateStringValue(value) < todayValue;
}

function buildUpcomingList(items, options = {}) {
  const emptyMessage = options.emptyMessage || 'No upcoming assessments.';
  if (!items.length) {
    return `<div class="empty-state">${emptyMessage}</div>`;
  }
  return items
    .map((item) => {
      const upcomingType = normalizeUpcomingType(item.type);
      const isAssessment = upcomingType === 'assessment';
      const metaParts = [];
      if (options.showSubject && item.subjectName) {
        metaParts.push(item.subjectName);
      }
      metaParts.push(formatDate(item.date));
      if (item.notes) {
        metaParts.push(item.notes);
      }
      const metaText = metaParts.join(' · ');
      const overdue = !isAssessment && isPastDate(item.date);
      const typeTagHtml = `<span class="upcoming-tag">${isAssessment ? 'Assessment' : 'Homework'}</span>`;
      const overdueTagHtml = overdue ? '<span class="upcoming-tag is-overdue">Overdue</span>' : '';
      const completeHtml = isAssessment
        ? `<button class="ghost-button ghost-button--small" type="button" data-action="complete-upcoming" data-subject-id="${item.subjectId}" data-upcoming-id="${item.id}">Add marks</button>`
        : '';
      const removeHtml = options.allowRemove
        ? `<button class="delete-button upcoming-remove" data-action="delete-upcoming" data-subject-id="${item.subjectId}" data-upcoming-id="${item.id}" aria-label="Remove ${escapeHtml(item.name)}"><i class="ph ph-x v2-only" aria-hidden="true"></i><span class="upcoming-remove-label">Remove</span></button>`
        : '';
      const dotHtml = item.subjectColor
        ? `<span class="upcoming-dot" style="--swatch:${item.subjectColor}"></span>`
        : '';
      return `
        <div
          class="upcoming-item"
          data-action="edit-upcoming"
          data-subject-id="${item.subjectId}"
          data-upcoming-id="${item.id}"
          role="button"
          tabindex="0"
          aria-label="Edit ${item.name}"
        >
          <div>
            <div class="upcoming-name">${dotHtml}${item.name}</div>
            <div class="upcoming-meta">${metaText}</div>
          </div>
          <div class="upcoming-right">
            ${typeTagHtml}
            ${overdueTagHtml}
            ${completeHtml}
            ${removeHtml}
          </div>
        </div>
      `;
    })
    .join('');
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

function subjectStats(subject) {
  const average = weightedAverage(subject.assessments);
  return {
    average,
    grade: getLetterGrade(average),
  };
}

function getTopSubject() {
  let best = null;
  let bestScore = -Infinity;
  state.data.subjects.forEach((subject) => {
    const average = weightedAverage(subject.assessments);
    if (average !== null && average > bestScore) {
      bestScore = average;
      best = subject;
    }
  });
  return best;
}

function getLatestAssessment() {
  const allAssessments = getAllAssessments();
  if (allAssessments.length === 0) return null;
  const sorted = sortAssessments(allAssessments);
  return sorted[sorted.length - 1];
}

function getBestGrade(items) {
  if (items.length === 0) return null;
  const best = Math.max(
    ...items.map((item) => (item.total > 0 ? (item.score / item.total) * 100 : 0))
  );
  return getLetterGrade(best);
}

function getLetterGrade(percentage) {
if (percentage === null || !Number.isFinite(percentage)) return null;

if (percentage >= 95) return 'A+';
if (percentage >= 90) return 'A';
if (percentage >= 85) return 'A-';

if (percentage >= 80) return 'B+';
if (percentage >= 75) return 'B';
if (percentage >= 70) return 'B-';

if (percentage >= 65) return 'C+';
if (percentage >= 60) return 'C';
if (percentage >= 50) return 'C-';

if (percentage >= 40) return 'D+';
if (percentage >= 35) return 'D';
if (percentage >= 30) return 'D-';

return 'E';

}

function gradeColorFor(letter) {
  if (!letter) return 'var(--grade-a)';
  if (letter.startsWith('A')) return 'var(--grade-a)';
  if (letter.startsWith('B')) return 'var(--grade-b)';
  if (letter.startsWith('C')) return 'var(--grade-c)';
  return 'var(--grade-d)';
}

function initials(name) {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function cryptoRandomId() {
  if (window.crypto && crypto.getRandomValues) {
    const bytes = new Uint32Array(2);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16)).join('');
  }
  return Math.random().toString(16).slice(2);
}

function formatDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}
