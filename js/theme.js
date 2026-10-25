// Theme, graph smoothing and V1/V2 UI version.

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

function getThemeMode() {
  return document.documentElement?.dataset?.theme === 'light' ? 'light' : 'dark';
}

function bindThemeEvents() {
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

  if (elements.uiV2Toggle) {
    elements.uiV2Toggle.checked = isUiV2();
    elements.uiV2Toggle.addEventListener('change', (event) => {
      setUiVersion(event.target.checked ? 'v2' : 'v1');
    });
  }

  if (elements.uiBetaChip) {
    elements.uiBetaChip.addEventListener('click', () => openModal(elements.settingsModal));
  }
}
