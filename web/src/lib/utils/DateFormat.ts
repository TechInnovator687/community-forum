export function formatDate(value: string | Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatRelativeDate(value: string | Date, locale: string, now = new Date()) {
  const date = new Date(value);
  const diffInSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const diffInMinutes = Math.round(diffInSeconds / 60);
  const diffInHours = Math.round(diffInMinutes / 60);
  const diffInDays = Math.round(diffInHours / 24);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffInDays) >= 1) {
    return formatter.format(diffInDays, "day");
  }

  if (Math.abs(diffInHours) >= 1) {
    return formatter.format(diffInHours, "hour");
  }

  return formatter.format(diffInMinutes, "minute");
}

