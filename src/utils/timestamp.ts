export function generateTimestamp(date = new Date()): string {
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  
  return `${YYYY}${MM}${DD}${hh}${mm}${ss}`;
}

export function parseCallbackTimestamp(timestampStr?: string | number): Date | undefined {
  if (!timestampStr) return undefined;
  const str = String(timestampStr);
  if (str.length !== 14) return undefined;

  const year = parseInt(str.slice(0, 4), 10);
  const month = parseInt(str.slice(4, 6), 10) - 1;
  const day = parseInt(str.slice(6, 8), 10);
  const hour = parseInt(str.slice(8, 10), 10);
  const minute = parseInt(str.slice(10, 12), 10);
  const second = parseInt(str.slice(12, 14), 10);

  return new Date(Date.UTC(year, month, day, hour, minute, second));
}