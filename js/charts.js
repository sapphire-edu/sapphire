// Canvas chart drawing primitives shared by the dashboard and analytics.

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

function bindChartsEvents() {
  // Canvas text can't trigger a web-font download, so V2 asks for it and redraws the charts once it's ready.
  if (document.fonts && typeof document.fonts.load === 'function') {
    window.addEventListener('load', () => {
      document.fonts.load('400 12px "Space Grotesk"').then(() => {
        if (isUiV2()) renderCharts();
      }).catch(() => {});
    });
  }
}
