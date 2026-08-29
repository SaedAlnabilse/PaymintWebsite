import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exportSections } from './export';

/**
 * CSV export output.
 *
 * The reports exports lead with a summary section and carry separate
 * "excl. tax" / "tax" / "incl. tax" columns, so this asserts the actual text
 * that lands in the downloaded file — section headings, header row and cell
 * order — rather than trusting the section objects were shaped correctly.
 */

let downloaded: Blob | null = null;
let originalCreate: typeof URL.createObjectURL;
let originalRevoke: typeof URL.revokeObjectURL;

beforeEach(() => {
  downloaded = null;
  originalCreate = URL.createObjectURL;
  originalRevoke = URL.revokeObjectURL;
  URL.createObjectURL = vi.fn((blob: Blob) => {
    downloaded = blob;
    return 'blob:mock';
  }) as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;
  // jsdom's anchor click would try to navigate; the download itself is not
  // what this test is about.
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  URL.createObjectURL = originalCreate;
  URL.revokeObjectURL = originalRevoke;
  vi.restoreAllMocks();
});

const readDownload = async () => {
  expect(downloaded).not.toBeNull();
  // jsdom's Blob has no `.text()`, so read it the way a browser would.
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(downloaded as unknown as Blob);
  });
  // Strip the UTF-8 BOM the exporter prepends for Excel.
  return text.replace(/^\uFEFF/, '');
};

describe('CSV export', () => {
  it('writes the summary section above the detail table', async () => {
    await exportSections('csv', {
      filename: 'report_sales',
      title: 'Sales Summary',
      meta: [{ label: 'Date', value: '1 Jan — 2 Jan' }],
      sections: [
        {
          name: 'Sales Summary',
          columns: [
            { key: 'metric', label: 'Metric' },
            { key: 'value', label: 'Value' },
          ],
          rows: [
            { metric: 'Total Sales (Incl. Tax)', value: '174.00' },
            { metric: 'Total Sales (Excl. Tax)', value: '150.00' },
            { metric: 'Total Tax', value: '24.00' },
            { metric: 'Number of Orders', value: '2' },
          ],
        },
        {
          name: 'Sales Summary',
          columns: [
            { key: 'date', label: 'Date' },
            { key: 'count', label: 'Number of Orders' },
            { key: 'netRevenue', label: 'Total Sales (Excl. Tax)' },
            { key: 'tax', label: 'Total Tax' },
            { key: 'revenue', label: 'Total Sales (Incl. Tax)' },
          ],
          rows: [
            {
              date: '2026-08-29',
              count: '2',
              netRevenue: '150.00',
              tax: '24.00',
              revenue: '174.00',
            },
          ],
        },
      ],
    });

    const csv = await readDownload();
    const lines = csv.split('\n');

    expect(lines[0]).toBe('"Sales Summary"');
    expect(lines[1]).toBe('"Date","1 Jan — 2 Jan"');
    expect(lines[3]).toBe('"Sales Summary"');
    expect(lines[4]).toBe('"Metric","Value"');
    expect(lines[5]).toBe('"Total Sales (Incl. Tax)","174.00"');
    expect(csv).toContain('"Number of Orders","2"');

    // The detail table keeps its own header and column order.
    expect(csv).toContain(
      '"Date","Number of Orders","Total Sales (Excl. Tax)","Total Tax","Total Sales (Incl. Tax)"',
    );
    expect(csv).toContain('"2026-08-29","2","150.00","24.00","174.00"');
  });

  it('does not emit an order count of 0 when the rows carry one', async () => {
    await exportSections('csv', {
      filename: 'report_sales',
      title: 'Sales',
      sections: [
        {
          name: 'Sales',
          columns: [
            { key: 'date', label: 'Date' },
            { key: 'count', label: 'Number of Orders' },
          ],
          rows: [
            { date: '2026-08-29', count: 3 },
            { date: '2026-08-30', count: 5 },
          ],
        },
      ],
    });

    const csv = await readDownload();
    expect(csv).toContain('"2026-08-29","3"');
    expect(csv).toContain('"2026-08-30","5"');
    expect(csv).not.toContain(',"0"');
  });
});
