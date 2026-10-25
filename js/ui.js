// Shared UI plumbing: tabs, modals, confirm dialog, messages, icons, quick add.

let confirmResolver = null;

let confirmCleanup = null;

let iconPickerResolver = null;

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

function setSettingsMessage(message) {
  setInlineMessage(elements.settingsMessage, message);
}

function normalizeSubjectIcon(value) {
  const icon = String(value || '').trim().toLowerCase();
  if (!icon) return '';
  return /^(lucide:)?[a-z0-9-]{1,64}$/.test(icon) ? icon : '';
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

// V2 custom icons are saved as "lucide:<name>". V1 has no Lucide font, so it falls back.
const LUCIDE_ICON_PREFIX = 'lucide:';

function iconHtml(name, className = 'button-icon', weight = 'regular') {
  const raw = String(name || '').trim().toLowerCase();
  if (raw.startsWith(LUCIDE_ICON_PREFIX)) {
    const lucideName = raw.slice(LUCIDE_ICON_PREFIX.length);
    if (!isUiV2() || !/^[a-z0-9-]+$/.test(lucideName)) {
      return iconHtml(DEFAULT_SUBJECT_ICON, className, weight);
    }
    return `<i class="ph lu lu-${lucideName}${className ? ` ${className}` : ''}" aria-hidden="true"></i>`;
  }
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

  const v2 = isUiV2();
  syncIconPickerCopy(v2);
  const saved = normalizeSubjectIcon(initialValue);
  const savedIsLucide = saved.startsWith(LUCIDE_ICON_PREFIX);
  // Phosphor slugs mean nothing to Lucide (and the other way round), so start from the default.
  const initial = v2
    ? (savedIsLucide ? saved.slice(LUCIDE_ICON_PREFIX.length) : 'audio-waveform')
    : (saved && !savedIsLucide ? saved : 'wave-sine');
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
  const example = isUiV2() ? 'audio-waveform' : 'wave-sine';
  if (!normalized || normalized.startsWith(LUCIDE_ICON_PREFIX)) {
    setIconPickerMessage(`Use lowercase letters, numbers, and hyphens (example: ${example}).`);
    return;
  }
  if (isUiV2()) {
    if (!isLucideIconName(normalized)) {
      setIconPickerMessage(`There's no Lucide icon called "${normalized}". Browse names at lucide.dev/icons.`);
      return;
    }
    dismissIconPicker(LUCIDE_ICON_PREFIX + normalized);
    return;
  }
  dismissIconPicker(normalized);
}

// The glyph stylesheet is the list of valid names: an unknown name has no ::before content.
function isLucideIconName(name) {
  if (!/^[a-z0-9-]+$/.test(name)) return false;
  const probe = document.createElement('i');
  probe.className = `lu lu-${name}`;
  probe.hidden = true;
  document.body.appendChild(probe);
  const content = getComputedStyle(probe, '::before').content;
  probe.remove();
  return Boolean(content) && content !== 'none' && content !== 'normal';
}

function syncIconPickerCopy(v2) {
  const hint = document.getElementById('icon-picker-hint');
  const label = document.getElementById('icon-picker-label');
  if (hint) {
    hint.innerHTML = v2
      ? 'Use a Lucide icon name like <code>audio-waveform</code>.'
      : 'Use a Phosphor icon slug like <code>wave-sine</code>.';
  }
  if (label) label.textContent = v2 ? 'Lucide icon name' : 'Phosphor icon name';
  if (elements.iconPickerInput) elements.iconPickerInput.placeholder = v2 ? 'audio-waveform' : 'wave-sine';
}

function updateIconPickerPreview(value) {
  if (!elements.iconPickerPreview) return;
  const normalized = normalizeSubjectIcon(value);
  const icon = isUiV2() && normalized && !normalized.startsWith(LUCIDE_ICON_PREFIX) && isLucideIconName(normalized)
    ? LUCIDE_ICON_PREFIX + normalized
    : (isUiV2() ? 'question' : normalized || 'question');
  elements.iconPickerPreview.innerHTML = iconHtml(icon, '');
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

function bindUiEvents() {
  window.addEventListener('resize', () => {
    renderCharts();
  });

  if (elements.settingsOpen) {
    elements.settingsOpen.addEventListener('click', () => openModal(elements.settingsModal));
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

  if (elements.settingsModal) {
    elements.settingsModal.addEventListener('click', (event) => {
      const actionTarget = event.target.closest('[data-action]');
      if (!actionTarget) return;
      if (actionTarget.dataset.action === 'close-settings') {
        closeModal(elements.settingsModal);
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
    const scheduleImportModal = document.getElementById('schedule-import-modal');
    if (scheduleImportModal?.classList.contains('is-open')) {
      closeModal(scheduleImportModal);
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
}
