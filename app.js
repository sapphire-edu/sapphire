const STORAGE_KEY = 'nsw-grade-tracker-v1';
const THEME_KEY = 'nsw-grade-theme';
const THEME_VARIANT_KEY = 'sapphire-theme-variant';
const TAB_KEY = 'sapphire-active-tab';
const GRAPH_SMOOTHNESS_KEY = 'sapphire-graph-smoothness';
const USER_NAME_KEY = 'sapphire-user-name';
const APPWRITE_SYNC_KEY = 'sapphire-last-sync';

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
  'Textiles Technology',
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
  'textiles technology': 'scissors',
  woodworking: 'hammer',
  'visual arts': 'palette',
  'visual design': 'pen',
};
const LIGHT_THEMES = ['pearl', 'mint', 'sunrise', 'sky'];
const DARK_THEMES = ['midnight', 'aurora', 'cosmic', 'sapphire'];
const MONTH_AXIS_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const appwriteState = {
  enabled: false,
  ready: false,
  user: null,
  syncing: false,
  syncingVisible: false,
  pending: false,
  lastSyncedAt: null,
  error: null,
};

let appwriteClient = null;
let appwriteAccount = null;
let appwriteDatabases = null;
let syncTimer = null;
let syncTimerKind = null;
let syncStatusTimer = null;
let syncStatusInterval = null;
let confirmResolver = null;
let confirmCleanup = null;
let iconPickerResolver = null;

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
  upcomingList: document.getElementById('upcoming-list'),
  upcomingAdd: document.getElementById('upcoming-add'),
  subjectGrid: document.getElementById('subjects-grid'),
  assessmentTable: document.getElementById('assessment-table'),
  assessmentSearch: document.getElementById('assessment-search'),
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
  settingsModal: document.getElementById('settings-modal'),
  exportPreset: document.getElementById('export-preset'),
  exportGenerate: document.getElementById('export-generate'),
  exportOutput: document.getElementById('export-output'),
  exportCopy: document.getElementById('export-copy'),
  exportMessage: document.getElementById('export-message'),
  importInput: document.getElementById('import-input'),
  importRestore: document.getElementById('import-restore'),
  importMessage: document.getElementById('import-message'),
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
  assessmentModal: document.getElementById('assessment-modal'),
  assessmentForm: document.getElementById('assessment-form'),
  assessmentMessage: document.getElementById('assessment-message'),
  assessmentSubjectName: document.getElementById('assessment-subject-name'),
  assessmentSubjectId: document.getElementById('assessment-subject-id'),
  upcomingModal: document.getElementById('upcoming-modal'),
  upcomingForm: document.getElementById('upcoming-form'),
  upcomingMessage: document.getElementById('upcoming-message'),
  upcomingSubjectSelect: document.getElementById('upcoming-subject-select'),
  chartTooltip: document.getElementById('chart-tooltip'),
  themeButtons: document.querySelectorAll('[data-theme-variant]'),
  navItems: document.querySelectorAll('[data-tab]'),
  views: document.querySelectorAll('[data-view]'),
  calendarMonth: document.getElementById('calendar-month'),
  calendarGrid: document.getElementById('calendar-grid'),
  calendarPrev: document.getElementById('calendar-prev'),
  calendarNext: document.getElementById('calendar-next'),
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
};

let activeSubjectId = null;
let draggingOrderId = null;
let currentOrderDropTarget = null;
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

updateGreeting();
maybeStartOnboarding();

render();
updateGraphSmoothnessUI();
renderOnboardingSmoothingPreview();
initAppwrite();

window.addEventListener('resize', () => {
  renderCharts();
});

window.addEventListener('online', () => {
  if (appwriteState.user) {
    queueCloudSync(true);
  }
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    updateSyncStatus();
  }
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
  elements.exportOpen.addEventListener('click', () => openModal(elements.exportModal));
}

if (elements.settingsOpen) {
  elements.settingsOpen.addEventListener('click', () => openModal(elements.settingsModal));
}

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
    if (elements.exportOutput) {
      elements.exportOutput.value = '';
    }
  });
}

if (elements.exportGenerate) {
  elements.exportGenerate.addEventListener('click', () => {
    const scope = getExportScope();
    const payload = buildExportPayload(scope);
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
    state.data = mergeData(state.data, incoming);
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
    setSettingsMessage('Name updated.');
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
    const upcomingName = String(formData.get('upcomingName') || '').trim();
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
    if (!upcomingDate) {
      return setUpcomingMessage('Please choose a due date.');
    }

    subject.upcoming = Array.isArray(subject.upcoming) ? subject.upcoming : [];
    subject.upcoming.push({
      id: cryptoRandomId(),
      name: upcomingName,
      date: upcomingDate,
      notes: upcomingNotes,
      createdAt: Date.now(),
    });

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

    if (action === 'set-subject-color') {
      const subjectId = actionTarget.dataset.id || activeSubjectId;
      const color = actionTarget.dataset.color;
      if (subjectId && color) {
        applySubjectColor(subjectId, color);
      }
      return;
    }

    if (action === 'set-subject-icon') {
      const subjectId = actionTarget.dataset.subjectId || activeSubjectId;
      const icon = resolveSubjectIcon(actionTarget.dataset.icon, '');
      if (subjectId && icon) {
        applySubjectIcon(subjectId, icon);
      }
      return;
    }

    if (action === 'set-subject-icon-other') {
      const subjectId = actionTarget.dataset.subjectId || activeSubjectId;
      if (!subjectId) return;
      const subject = state.data.subjects.find((item) => item.id === subjectId);
      if (!subject) return;
      const current = resolveSubjectIcon(subject.icon, subject.name);
      const icon = await showCustomIconPicker(current);
      if (!icon) return;
      applySubjectIcon(subjectId, icon);
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

if (elements.subjectModal) {
  elements.subjectModal.addEventListener('input', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.name === 'subjectColor') {
      const subjectId = target.dataset.subjectId || activeSubjectId;
      const color = target.value;
      if (subjectId && color) {
        applySubjectColor(subjectId, color);
      }
    }
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

if (elements.assessmentForm) {
  elements.assessmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(elements.assessmentForm);
    const subjectId = String(formData.get('subjectId') || '').trim();
    const assessmentName = String(formData.get('assessment') || '').trim();
    const score = parseFloat(formData.get('score'));
    const total = parseFloat(formData.get('total'));
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
    if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
      return setAssessmentMessage('Please enter a valid score and total.');
    }
    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
      return setAssessmentMessage('Weighting must be a positive number.');
    }

    subject.assessments.push({
      id: cryptoRandomId(),
      name: assessmentName,
      score,
      total,
      weight,
      date,
      createdAt: Date.now(),
    });

    saveData(state.data);
    render();
    closeAssessmentModal();
    openSubjectModal(subjectId);
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (elements.confirmModal?.classList.contains('is-open')) {
    dismissConfirm(false);
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
  if (elements.settingsModal?.classList.contains('is-open')) {
    closeModal(elements.settingsModal);
    return;
  }
  if (elements.upcomingModal?.classList.contains('is-open')) {
    closeUpcomingModal();
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
    if (!raw) return { subjects: [] };
    const parsed = JSON.parse(raw);
    const normalized = normalizeData(parsed);
    if (normalized.userName && !loadUserName()) {
      setUserName(normalized.userName, { skipSync: true });
    }
    return normalized;
  } catch (error) {
    return { subjects: [] };
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
  ].forEach((key) => safeRemoveItem(key));
}

function normalizeData(parsed) {
  if (!parsed || !Array.isArray(parsed.subjects)) return { subjects: [] };
  const now = new Date();
  const todayValue = dateKeyFromParts(now.getFullYear(), now.getMonth(), now.getDate());
  const subjects = parsed.subjects.map((subject, index) => {
    const assessments = Array.isArray(subject.assessments) ? subject.assessments : [];
    const upcoming = Array.isArray(subject.upcoming) ? subject.upcoming : [];
    const name = subject.name || 'Untitled Subject';
    return {
      id: subject.id || cryptoRandomId(),
      name,
      color: subject.color || palette[index % palette.length],
      icon: resolveSubjectIcon(subject.icon || subject.subjectIcon, name),
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
  return { subjects, lastUpdatedAt, userName, graphSmoothness };
}

function saveData(data, options = {}) {
  const { skipSync = false, skipTimestamp = false } = options;
  if (!skipTimestamp) {
    data.lastUpdatedAt = Date.now();
  }
  data.userName = loadUserName() || data.userName || '';
  safeSetItem(STORAGE_KEY, JSON.stringify(data));
  if (!skipSync) {
    queueCloudSync();
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
        updateAuthUI();
      })
      .catch(() => {
        appwriteState.user = null;
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
    lastUpdatedAt: Number.isFinite(state.data.lastUpdatedAt)
      ? state.data.lastUpdatedAt
      : Date.now(),
    userName: loadUserName() || state.data.userName || '',
    graphSmoothness: Number.isFinite(state.graphSmoothness) ? state.graphSmoothness : null,
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
      Boolean(localSnapshot.userName);
    const hasRemote =
      (Array.isArray(remoteData.subjects) && remoteData.subjects.length > 0) ||
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
  } else {
    merged.graphSmoothness =
      Number.isFinite(localData.graphSmoothness) ? localData.graphSmoothness : remoteData.graphSmoothness ?? null;
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
  onboardingState.step = clamp(step, 0, 3);
  const steps = elements.onboardingForm?.querySelectorAll('[data-onboarding-step]');
  if (steps) {
    steps.forEach((section) => {
      const sectionStep = Number(section.dataset.onboardingStep);
      section.classList.toggle('is-active', sectionStep === onboardingState.step);
    });
  }

  if (elements.onboardingProgressBar) {
    const progress = ((onboardingState.step + 1) / 4) * 100;
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
    const final = onboardingState.step === 3;
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
  return onboardingState.step === 3;
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
  renderCharts();
  renderCalendar();
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
  const subjectColor = subject.color || palette[0];
  const subjectIcon = resolveSubjectIcon(subject.icon, subject.name);
  const iconCarouselHtml = buildIconCarousel({
    selectedIcon: subjectIcon,
    action: 'set-subject-icon',
    otherAction: 'set-subject-icon-other',
    dataAttrs: `data-subject-id="${subject.id}"`,
    ariaLabel: `${subject.name} icon options`,
  });
  const swatchHtml = palette
    .map((color) => {
      const activeClass = color.toLowerCase() === subjectColor.toLowerCase() ? ' is-active' : '';
      return `
        <button class="color-swatch${activeClass}" type="button" data-action="set-subject-color" data-color="${color}" data-id="${subject.id}" style="--swatch:${color}" aria-label="Set subject color to ${color}"></button>
      `;
    })
    .join('');

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
          return `
            <div class="history-item">
              <div>
                <div class="history-name">${assessment.name}</div>
                <div class="history-meta">${assessment.score} / ${assessment.total} · ${percent.toFixed(1)}% · ${grade}${weight}</div>
              </div>
              <div class="history-right">
                <div class="history-date">${formatDate(assessment.date)}</div>
                <button class="delete-button" data-action="delete-assessment" data-subject-id="${subject.id}" data-assessment-id="${assessment.id}">Remove</button>
              </div>
            </div>
          `;
        })
        .join('')
    : '<div class="empty-state">No assessments yet.</div>';
  const upcomingItems = sortUpcoming(expandUpcomingItems(subject));
  const upcomingHtml = buildUpcomingList(upcomingItems, { showSubject: false, allowRemove: true });

  if (elements.subjectModalBody) {
    elements.subjectModalBody.innerHTML = `
      <div class="modal-chart">
        <canvas id="subject-modal-chart"></canvas>
      </div>
      <div class="subject-color-panel">
        <div class="subject-color-header subject-icon-header">
          <div>
            <div class="section-eyebrow">Subject icon</div>
            <div class="subject-color-meta">Shown on cards and the top subject.</div>
          </div>
          <div class="subject-icon-control">
            <span class="subject-icon-preview" data-role="icon-preview" style="background:${subjectColor}">
              ${subjectIconHtml(subjectIcon)}
            </span>
            <div class="subject-icon-carousel">
              ${iconCarouselHtml}
            </div>
          </div>
        </div>
        <div class="subject-color-header">
          <div>
            <div class="section-eyebrow">Subject color</div>
            <div class="subject-color-meta">Used across cards and charts.</div>
          </div>
          <div class="color-control">
            <input class="color-input" type="color" name="subjectColor" value="${subjectColor}" data-subject-id="${subject.id}" aria-label="Subject color" />
            <span class="color-value" data-role="color-value">${subjectColor.toUpperCase()}</span>
          </div>
        </div>
        <div class="color-swatches">
          ${swatchHtml}
        </div>
      </div>
      <div class="modal-actions">
        <button class="primary-button with-icon" type="button" data-action="open-assessment">
          ${iconHtml('plus-circle')}
          Add Assessment
        </button>
        <button class="ghost-button with-icon" type="button" data-action="open-upcoming">
          ${iconHtml('calendar')}
          Add Upcoming
        </button>
        <button class="ghost-button with-icon" type="button" data-action="delete-subject">
          ${iconHtml('trash')}
          Delete Subject
        </button>
      </div>
      <div class="subject-upcoming">
        <div class="history-title">Upcoming assessments</div>
        <div class="upcoming-list">
          ${upcomingHtml}
        </div>
      </div>
      <div class="subject-history">
        <div class="history-title">Assessment history</div>
        <div class="history-list">${historyHtml}</div>
      </div>
    `;
  }

  openModal(elements.subjectModal);

  const chartCanvas = elements.subjectModalBody?.querySelector('#subject-modal-chart');
  if (chartCanvas) {
    const points = buildSubjectTimelinePoints(subject.assessments);
    drawLineChart(chartCanvas, points, { stroke: subject.color, showAxis: true });
  }
}

function closeSubjectModal() {
  closeAssessmentModal();
  closeUpcomingModal();
  closeModal(elements.subjectModal);
  activeSubjectId = null;
}

function openAssessmentModal(subjectId) {
  if (!elements.assessmentModal || !elements.assessmentForm) return;
  const subject = state.data.subjects.find((item) => item.id === subjectId);
  if (!subject) return;
  activeSubjectId = subjectId;
  elements.assessmentForm.reset();
  if (elements.assessmentSubjectId) {
    elements.assessmentSubjectId.value = subjectId;
  }
  if (elements.assessmentSubjectName) {
    elements.assessmentSubjectName.textContent = subject.name;
  }
  const dateInput = elements.assessmentForm.querySelector('input[name="date"]');
  if (dateInput) {
    dateInput.value = today;
  }
  setAssessmentMessage('');
  openModal(elements.assessmentModal);
}

function closeAssessmentModal() {
  closeModal(elements.assessmentModal);
  setAssessmentMessage('');
}

function openUpcomingModal(subjectId = null) {
  if (!elements.upcomingModal || !elements.upcomingForm) return;
  if (!state.data.subjects.length) {
    setUpcomingMessage('Add a subject first.');
    return;
  }
  elements.upcomingForm.reset();
  renderUpcomingSubjectSelect();
  if (elements.upcomingSubjectSelect) {
    const preferred = subjectId || elements.upcomingSubjectSelect.value;
    if (preferred) {
      elements.upcomingSubjectSelect.value = preferred;
    }
  }
  const dateInput = elements.upcomingForm.querySelector('input[name="upcomingDate"]');
  if (dateInput) {
    dateInput.value = today;
  }
  setUpcomingMessage('');
  openModal(elements.upcomingModal);
}

function closeUpcomingModal() {
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
  return elements.exportPreset.value === 'subjects' ? 'subjects' : 'all';
}

function buildExportPayload(scope) {
  const includeAll = scope === 'all';
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

  state.data.subjects.forEach(addSubject);

  const assessments = includeAll
    ? getAllAssessments().map((assessment) => {
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

  const upcoming = includeAll
    ? getUpcomingAssessments().map((item) => {
        return {
          id: item.id,
          subjectId: item.subjectId,
          subjectName: item.subjectName,
          subjectColor: item.subjectColor,
          subjectIcon: item.subjectIcon,
          name: item.name,
          date: item.date,
          notes: item.notes,
          createdAt: item.createdAt,
        };
      })
    : [];

  return {
    schema: 1,
    createdAt: new Date().toISOString(),
    selection: { scope },
    profile: {
      name: loadUserName(),
    },
    subjects,
    assessments,
    upcoming,
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
    return payload.data;
  }
  if (Array.isArray(payload.subjects)) {
    const hasNested = payload.subjects.some(
      (subject) => Array.isArray(subject.assessments) || Array.isArray(subject.upcoming)
    );
    if (hasNested) {
      return { subjects: payload.subjects };
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
        date: item.date || today,
        notes: item.notes || '',
        createdAt: Number.isFinite(item.createdAt) ? item.createdAt : Date.now() - index,
      });
    });
  }

  return { subjects };
}

function mergeData(existing, incoming) {
  const merged = {
    subjects: existing.subjects.map((subject) => ({
      ...subject,
      assessments: [...subject.assessments],
      upcoming: [...subject.upcoming],
    })),
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

  return merged;
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
    state.data = { subjects: [] };
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
    const points = buildSubjectTimelinePoints(subject.assessments);
    drawLineChart(chartCanvas, points, { stroke: subject.color, showAxis: true });
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
  renderCharts();
  renderCalendar();
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
}

function renderInsights() {
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

  elements.subjectGrid.innerHTML = state.data.subjects
    .map((subject) => {
      const stats = subjectStats(subject);
      const averageValue = stats.average === null ? 0 : Math.max(0, Math.min(100, stats.average));
      const averageText = stats.average === null ? '--' : `${stats.average.toFixed(1)}%`;
      const subjectIcon = subjectIconHtml(resolveSubjectIcon(subject.icon, subject.name));
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
              </div>
            </div>
          </div>
        </button>
      `;
    })
    .join('');
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

function renderAssessments() {
  if (!elements.assessmentTable) return;
  if (!ASSESSMENT_SORT_KEYS.has(state.assessmentTable.sortKey)) {
    state.assessmentTable.sortKey = 'date';
  }
  state.assessmentTable.sortDirection = normalizeAssessmentSortDirection(state.assessmentTable.sortDirection);
  renderAssessmentSortState();

  const allAssessments = sortAssessments(getAllAssessments()).reverse();
  if (allAssessments.length === 0) {
    elements.assessmentTable.innerHTML = '<tr><td colspan="8" class="empty-state">No assessments logged yet.</td></tr>';
    return;
  }

  const searchQuery = String(state.assessmentTable.search || '').trim().toLowerCase();
  const rows = buildAssessmentRows(allAssessments);
  const filteredRows = searchQuery
    ? rows.filter((row) => row.assessment.name.toLowerCase().includes(searchQuery))
    : rows;

  if (filteredRows.length === 0) {
    elements.assessmentTable.innerHTML = '<tr><td colspan="8" class="empty-state">No assessments match your search.</td></tr>';
    return;
  }

  const orderedRows = sortAssessmentRows(
    filteredRows,
    state.assessmentTable.sortKey,
    state.assessmentTable.sortDirection
  );

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
            <button class="delete-button" data-action="delete-assessment" data-subject-id="${assessment.subjectId}" data-assessment-id="${assessment.id}">Remove</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderUpcomingDashboard() {
  if (!elements.upcomingList) return;
  const upcoming = sortUpcoming(getUpcomingAssessments());
  if (upcoming.length === 0) {
    elements.upcomingList.innerHTML = '<div class="empty-state">No upcoming assessments yet.</div>';
  } else {
    const maxItems = 4;
    const visible = upcoming.slice(0, maxItems);
    const moreCount = upcoming.length - visible.length;
    const moreHtml = moreCount > 0 ? `<div class="upcoming-more">+${moreCount} more scheduled</div>` : '';
    elements.upcomingList.innerHTML = `${buildUpcomingList(visible, { showSubject: true, allowRemove: true })}${moreHtml}`;
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
}

function renderOverallChart() {
  if (!elements.overallChart) return;
  const sorted = sortAssessments(getAllAssessments());
  const points = buildOverallTimelinePoints(sorted);

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

  if (elements.subjectsLegend) {
    elements.subjectsLegend.textContent = totalCount
      ? `${visibleCount}/${totalCount} subject lines visible · Hover for details. Tip: Click subject chips below to hide/show lines.`
      : 'No subject data yet.';
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
            ${subject.name}
          </button>
        `
      )
      .join('');
  }

  drawMultiLineChart(elements.subjectsChart, series);
}

function renderCalendar() {
  if (!elements.calendarGrid || !elements.calendarMonth) return;
  const year = calendarState.year;
  const month = calendarState.month;
  elements.calendarMonth.textContent = formatMonthYear(year, month);

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
    const events = eventsByDate[dateKey] || [];
    const dayLabel = displayDay.toString();
    const isToday = dateKey === today;

    const eventsHtml = events.length
      ? `
        <div class="calendar-events">
          ${events
            .slice(0, 3)
            .map(
              (event) => `
                <div class="calendar-event${event.type === 'completed' ? ' is-completed' : ''}" style="--event-color:${event.color}">
                  <span class="calendar-event-title">${event.name}</span>
                  <span class="calendar-event-sub">${event.subject}</span>
                </div>
              `
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

function traceSmoothLine(ctx, points, smoothness = 0.35) {
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
    ctx.bezierCurveTo(
      clamp(cp1x, minX, maxX),
      cp1y,
      clamp(cp2x, minX, maxX),
      cp2y,
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
    ctx.font = '12px "Red Hat Display", sans-serif';
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

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const hasPlottableValues = series.some((point) => Number.isFinite(point?.value));
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

  const paddingLeft = 36;
  const paddingRight = 36;
  const paddingTop = 18;
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
  const paddingBottom = hasAxisLabels ? 30 : 18;
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

  if (showAxis) {
    ctx.fillStyle = axisColor;
    ctx.font = '12px "Red Hat Display", sans-serif';
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
      ctx.font = '10px "Red Hat Display", sans-serif';
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
      ctx.font = '12px "Red Hat Display", sans-serif';
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

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = stroke;
  if (drawablePoints.length > 1) {
    traceSmoothLine(ctx, drawablePoints, lineSmoothness);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(drawablePoints[0].x, drawablePoints[0].y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = stroke;
    ctx.fill();
  }

  const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
  gradient.addColorStop(0, withAlpha(stroke, 0.35));
  gradient.addColorStop(1, withAlpha(stroke, 0.05));
  if (drawablePoints.length > 2) {
    ctx.fillStyle = gradient;
    traceSmoothLine(ctx, drawablePoints, lineSmoothness);
    ctx.lineTo(drawablePoints[drawablePoints.length - 1].x, height - paddingBottom);
    ctx.lineTo(drawablePoints[0].x, height - paddingBottom);
    ctx.closePath();
    ctx.fill();
  }

  canvas._chartPoints = drawablePoints;
  bindChartHover(canvas);
}

function drawMultiLineChart(canvas, series) {
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

  const paddingLeft = 36;
  const paddingRight = 36;
  const paddingTop = 18;
  const paddingBottom = 18;
  const allSeriesPoints = series.flatMap((line) => line.points || []);
  const hasPlottableValues = allSeriesPoints.some((point) => Number.isFinite(point?.value));
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
  const tickStep = 5;
  const tickMin = Math.floor(valueRange.min / tickStep) * tickStep;
  const tickMax = Math.ceil(valueRange.max / tickStep) * tickStep;
  const ticks = [];
  for (let value = tickMin; value <= tickMax + 0.0001; value += tickStep) {
    ticks.push(value);
  }
  const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#7a8292';

  ctx.fillStyle = axisColor;
  ctx.font = '12px "Red Hat Display", sans-serif';
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

  const allPoints = [];
  series.forEach((line) => {
    const points = line.points;
    if (!points.length) return;
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = line.color || '#2aa9ff';
    const denom = Math.max(points.length - 1, 1);
    const lineDateValues = points
      .map((point) => (Number.isFinite(point.xValue) ? point.xValue : null))
      .filter((value) => Number.isFinite(value));
    const hasLineDateScale = lineDateValues.length >= 2;
    const lineMinDateValue = hasLineDateScale ? Math.min(...lineDateValues) : null;
    const lineMaxDateValue = hasLineDateScale ? Math.max(...lineDateValues) : null;
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
      traceSmoothLine(ctx, drawablePoints, state.graphSmoothness);
      ctx.stroke();
    } else if (drawablePoints.length === 1) {
      ctx.beginPath();
      ctx.arc(drawablePoints[0].x, drawablePoints[0].y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = line.color || '#2aa9ff';
      ctx.fill();
    }
  });

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

function upcomingDateValue(item) {
  return dateStringValue(item.date);
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
      return upcomingTieBreak(a) - upcomingTieBreak(b);
    });
}

function isPastDate(value) {
  if (!value) return false;
  return dateStringValue(value) < todayValue;
}

function buildUpcomingList(items, options = {}) {
  if (!items.length) {
    return '<div class="empty-state">No upcoming assessments.</div>';
  }
  return items
    .map((item) => {
      const metaParts = [];
      if (options.showSubject && item.subjectName) {
        metaParts.push(item.subjectName);
      }
      metaParts.push(formatDate(item.date));
      if (item.notes) {
        metaParts.push(item.notes);
      }
      const metaText = metaParts.join(' · ');
      const overdue = isPastDate(item.date);
      const tagHtml = overdue ? '<span class="upcoming-tag is-overdue">Overdue</span>' : '';
      const removeHtml = options.allowRemove
        ? `<button class="delete-button" data-action="delete-upcoming" data-subject-id="${item.subjectId}" data-upcoming-id="${item.id}">Remove</button>`
        : '';
      const dotHtml = item.subjectColor
        ? `<span class="upcoming-dot" style="--swatch:${item.subjectColor}"></span>`
        : '';
      return `
        <div class="upcoming-item">
          <div>
            <div class="upcoming-name">${dotHtml}${item.name}</div>
            <div class="upcoming-meta">${metaText}</div>
          </div>
          <div class="upcoming-right">
            ${tagHtml}
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
    });
  });

  Object.values(eventsByDate).forEach((items) => {
    items.sort((a, b) => {
      const order = a.type === b.type ? 0 : a.type === 'upcoming' ? -1 : 1;
      if (order !== 0) return order;
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
