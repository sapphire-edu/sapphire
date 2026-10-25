// Boot: initial render, then wire up every feature's event listeners.

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
initScheduleImport();
initNotifications();

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
