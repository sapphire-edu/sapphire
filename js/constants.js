// App-wide constants: storage keys, Appwrite IDs, palettes, subject and icon lists.

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
