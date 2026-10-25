// Shared helpers: dates, grades, averages, upcoming items, formatting.

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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatPercentValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function normalizeColorValue(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : '';
}

function compareNullableNumbers(left, right, direction = 'asc') {
  const leftNull = !Number.isFinite(left);
  const rightNull = !Number.isFinite(right);
  if (leftNull && rightNull) return 0;
  if (leftNull) return 1;
  if (rightNull) return -1;
  return direction === 'asc' ? left - right : right - left;
}

function parseDateKeyLocal(value) {
  const key = normalizeDateKey(value);
  if (!key) return new Date(Number.NaN);
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0);
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

function addDays(date, amount) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  copy.setDate(copy.getDate() + amount);
  return copy;
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

function dateKeyFromParts(year, month, day) {
  const paddedMonth = String(month + 1).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
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
      const dotHtml = !item.subjectColor
        ? ''
        : isUiV2()
        ? subjectMarkHtml(item.subjectIcon, item.subjectName, item.subjectColor, 'upcoming-mark')
        : `<span class="upcoming-dot" style="--swatch:${item.subjectColor}"></span>`;
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
