// Boot: initial render, then wire up every feature's event listeners.

if (window.SAPPHIRE_PREVIEW) prepareV2Preview();
setTheme(state.theme.mode, state.theme.variant);
initTabs();
renderElectiveGrid();
renderExportSubjectFilters();
updateExportFilterAvailability();
updateGreeting();
if (!window.SAPPHIRE_PREVIEW) maybeStartOnboarding();
render();
updateGraphSmoothnessUI();
renderOnboardingSmoothingPreview();
if (!window.SAPPHIRE_PREVIEW) {
  initAppwrite();
  initScheduleImport();
  initNotifications();
  initV2Tour();
}

bindUiEvents();
bindSyncEvents();
bindThemeEvents();
bindOnboardingEvents();
bindShareEvents();
bindSubjectsEvents();
bindStorageEvents();
bindAnalyticsEvents();
bindCalendarEvents();
bindTimetableEvents();
bindLeaderboardEvents();
bindChartsEvents();
