export function formatNumber(value, decimals = 1) {
  if (value == null || Number.isNaN(Number(value))) return '0';
  const rounded = Number(value).toFixed(decimals);
  return rounded.replace(/\.0+$|(\.\d*[1-9])0+$/, '$1');
}

export function formatInteger(value) {
  if (value == null || Number.isNaN(Number(value))) return '0';
  return String(Math.round(Number(value)));
}

export function formatHours(value, decimals = 1) {
  if (value == null || Number.isNaN(Number(value))) return 'N/A';
  if (value <= 0) return '<1 min';
  if (value < 1) return `${Math.round(value * 60)} min`;
  return `${formatNumber(value, decimals)}h`;
}

export function formatClockTime(value) {
  const hourValue = Number(value || 0);
  const normalized = ((hourValue % 24) + 24) % 24;
  const hours = Math.floor(normalized);
  const minutes = Math.round((normalized - hours) * 60);
  const safeHours = minutes === 60 ? (hours + 1) % 24 : hours;
  const safeMinutes = minutes === 60 ? 0 : minutes;
  return `${String(safeHours).padStart(2, '0')}:${String(safeMinutes).padStart(2, '0')}`;
}

export function formatPercent(value, decimals = 0) {
  return `${formatNumber(value, decimals)}%`;
}

export function formatHoursUntil(value) {
  if (value <= 0) return 'now';
  return `in ${formatHours(value)}`;
}
