/** Returns the four-digit year of an ISO date string (`YYYY-MM-DD`). */
export function formatYear(isoDate: string): string {
  return isoDate.slice(0, 4);
}
