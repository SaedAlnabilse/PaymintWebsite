/**
 * Platform-aware UTF-8 BOM helper for CSV exports.
 *
 * A leading BOM makes legacy desktop Excel on Windows read UTF-8 correctly
 * (so Arabic/accented names aren't garbled). But it makes some other tools —
 * notably the Google Sheets mobile app — render a literal "ï»¿" before the
 * first header.
 *
 * Since legacy-Excel-double-click only happens on Windows, we add the BOM only
 * for Windows users and keep the file clean everywhere else. Windows users who
 * open the file in desktop Google Sheets are unaffected (it strips the BOM on
 * import), so this heuristic has no bad outcome in practice.
 */

const UTF8_BOM = '﻿';

/** Best-effort detection of a Windows client. */
export function isWindowsClient(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  // Prefer the modern, non-deprecated hint when available.
  const uaData = (navigator as any).userAgentData;
  if (uaData?.platform) {
    return /win/i.test(uaData.platform);
  }
  const probe = navigator.userAgent || navigator.platform || '';
  return /win/i.test(probe);
}

/**
 * Prepend a UTF-8 BOM to `csv` only when the user is on Windows, so the file
 * opens correctly in legacy Excel there while staying clean for everyone else.
 */
export function withExcelBom(csv: string): string {
  return isWindowsClient() ? UTF8_BOM + csv : csv;
}
