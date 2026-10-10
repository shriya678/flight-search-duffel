// Duffel returns airport-local times without an offset (e.g. "2026-11-08T06:05:00").
// We format them from the string so the browser's timezone never shifts them.

export function formatTime(localDateTime) {
  return localDateTime.slice(11, 16);
}

export function formatDate(localDateTime) {
  const [year, month, day] = localDateTime.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

// Days between two airport-local dates, e.g. 1 for an overnight flight.
export function dayDifference(fromDateTime, toDateTime) {
  // Date-only ISO strings parse as UTC midnight, so this is timezone-safe.
  const toDay = (value) => Date.parse(value.slice(0, 10));
  return Math.round((toDay(toDateTime) - toDay(fromDateTime)) / 86_400_000);
}

// ISO 8601 duration, e.g. "PT2H10M" or "P1DT3H".
export function durationToMinutes(isoDuration) {
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/.exec(isoDuration ?? '');
  if (!match) return 0;
  const [, days = 0, hours = 0, minutes = 0] = match;
  return Number(days) * 1440 + Number(hours) * 60 + Number(minutes);
}

export function formatDuration(isoDuration) {
  const total = durationToMinutes(isoDuration);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatStops(stops) {
  if (stops === 0) return 'Non-stop';
  return `${stops} stop${stops > 1 ? 's' : ''}`;
}

export function formatPrice(amount, currency, fractionDigits = 0) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
