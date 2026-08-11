import { addDays, differenceInCalendarDays, format, formatDistanceToNowStrict, isAfter, parseISO } from 'date-fns';

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function addDaysISO(isoDate: string, days: number): string {
  return format(addDays(parseISO(isoDate), days), 'yyyy-MM-dd');
}

export function nightsBetween(checkInISO: string, checkOutISO: string): number {
  if (!checkInISO || !checkOutISO) return 0;
  const nights = differenceInCalendarDays(parseISO(checkOutISO), parseISO(checkInISO));
  return Math.max(0, nights);
}

export function daysBetween(startISO: string, endISO: string): number {
  if (!startISO || !endISO) return 0;
  return Math.max(0, differenceInCalendarDays(parseISO(endISO), parseISO(startISO)));
}

export function isDateAfter(a: string, b: string): boolean {
  return isAfter(parseISO(a), parseISO(b));
}

export function formatDateLong(isoOrMillis: string | number): string {
  const date = typeof isoOrMillis === 'number' ? new Date(isoOrMillis) : parseISO(isoOrMillis);
  return format(date, 'EEE, d MMM yyyy');
}

export function formatDateShort(isoOrMillis: string | number): string {
  const date = typeof isoOrMillis === 'number' ? new Date(isoOrMillis) : parseISO(isoOrMillis);
  return format(date, 'd MMM yyyy');
}

export function formatTime(millis: number): string {
  return format(new Date(millis), 'HH:mm');
}

export function formatDateTime(millis: number): string {
  return format(new Date(millis), 'EEE, d MMM · HH:mm');
}

export function formatDurationMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatRelative(millis: number): string {
  return formatDistanceToNowStrict(new Date(millis), { addSuffix: true });
}
