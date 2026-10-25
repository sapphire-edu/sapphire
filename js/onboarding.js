// Onboarding flow and elective selection.

const onboardingState = {
  step: 0,
};

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

function updateOnboardingGraphSmoothnessUI() {
  if (!elements.onboardingGraphSmoothness || !elements.onboardingGraphSmoothnessValue) return;
  const percent = Math.round(state.graphSmoothness * 100);
  elements.onboardingGraphSmoothness.value = String(percent);
  elements.onboardingGraphSmoothness.style.setProperty('--slider-fill', `${percent}%`);
  elements.onboardingGraphSmoothnessValue.textContent = `${percent}%`;
  renderOnboardingSmoothingPreview();
}

function setOnboardingMessage(message) {
  setInlineMessage(elements.onboardingMessage, message);
}

function setOnboardingImportMessage(message) {
  setInlineMessage(elements.onboardingImportMessage, message);
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

function bindOnboardingEvents() {
  if (elements.onboardingGraphSmoothness) {
    elements.onboardingGraphSmoothness.addEventListener('input', (event) => {
      const value = Number(event.target.value);
      setGraphSmoothness(value / 100);
      updateOnboardingGraphSmoothnessUI();
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
}
