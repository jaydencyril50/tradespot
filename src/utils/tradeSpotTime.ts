// Utility to format date/time using TradeSpot time (UTC, as in Dashboard)
export function formatTradeSpotTime(date: string | number | Date, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  // Default: show both date and time in UTC
  return d.toLocaleString('en-GB', { timeZone: 'UTC', ...opts });
}

export function formatTradeSpotDate(date: string | number | Date, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });
}

export function formatTradeSpotTimeOnly(date: string | number | Date, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('en-GB', { timeZone: 'UTC', ...opts });
}
