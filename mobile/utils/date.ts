export function dateStr(d: string) {
  return new Date(d).toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function dateShort(d: string) {
  return new Date(d).toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'short',
  });
}

export function dateLong(d: string) {
  return new Date(d).toLocaleDateString('hr-HR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function dateWeekday(d: string) {
  return new Date(d).toLocaleDateString('hr-HR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function timeShort(d: string) {
  return new Date(d).toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
