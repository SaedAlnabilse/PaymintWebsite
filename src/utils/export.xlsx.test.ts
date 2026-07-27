import { describe, it, expect } from 'vitest';
import writeXlsxFile from 'write-excel-file/node';
import { unzipSync, strFromU8 } from 'fflate';

/**
 * XLSX export round-trip.
 *
 * The abandoned `xlsx` (SheetJS 0.18.5, no patched release on npm) was swapped
 * for `write-excel-file`. That change rewrote how cells, sheet names and column
 * widths are produced, so this asserts the *actual bytes* — unzipped and
 * inspected — rather than trusting that it compiles.
 *
 * The builders are duplicated here rather than imported because export.ts pulls
 * in `write-excel-file/browser` (Blob) and jsPDF at module scope; this test runs
 * the identical shapes through the Node build to get a Buffer it can unzip.
 */

type XlsxCell = {
  value: string | number | null;
  type: StringConstructor | NumberConstructor;
};

const xlsxCell = (value: string | number): XlsxCell =>
  typeof value === 'number'
    ? { value, type: Number }
    : { value: value === '' ? null : value, type: String };

const safeSheetName = (name: string, fallback: string): string => {
  const cleaned = (name || fallback)
    .replace(/[:\\/?*[\]]/g, ' ')
    .trim()
    .slice(0, 31);
  return cleaned || fallback;
};

const buildWorkbook = async () => {
  const sheets = [
    {
      data: [
        [xlsxCell('Sales Report')],
        [xlsxCell('Range: January')],
        [],
        [xlsxCell('Item'), xlsxCell('Qty'), xlsxCell('Total')],
        [xlsxCell('Latte'), xlsxCell(12), xlsxCell(48.5)],
        [xlsxCell('Empty'), xlsxCell(''), xlsxCell(0)],
      ],
      sheet: safeSheetName('Sales', 'Sheet1'),
      columns: [{ width: 20 }, { width: 10 }, { width: 10 }],
    },
    {
      data: [[xlsxCell('Only')], [xlsxCell(7)]],
      sheet: safeSheetName('Second', 'Sheet2'),
      columns: [{ width: 12 }],
    },
  ];
  const buffer = await writeXlsxFile(sheets as never).toBuffer();
  return unzipSync(new Uint8Array(buffer));
};

describe('xlsx export via write-excel-file', () => {
  it('produces a valid zip containing the expected OOXML parts', async () => {
    const files = await buildWorkbook();
    expect(Object.keys(files)).toEqual(
      expect.arrayContaining([
        '[Content_Types].xml',
        'xl/workbook.xml',
        'xl/worksheets/sheet1.xml',
        'xl/worksheets/sheet2.xml',
      ]),
    );
  });

  it('names every worksheet', async () => {
    const files = await buildWorkbook();
    const wb = strFromU8(files['xl/workbook.xml']);
    const names = [...wb.matchAll(/name="([^"]+)"/g)].map((m) => m[1]);
    expect(names).toEqual(['Sales', 'Second']);
  });

  it('writes the preamble, header and body rows', async () => {
    const files = await buildWorkbook();
    const s1 = strFromU8(files['xl/worksheets/sheet1.xml']);
    // 2 preamble + 1 spacer + 1 header + 2 body
    expect((s1.match(/<row/g) || []).length).toBe(6);

    const strings = strFromU8(files['xl/sharedStrings.xml'] ?? new Uint8Array());
    expect(strings).toContain('Sales Report');
    expect(strings).toContain('Latte');
  });

  it('keeps numbers numeric rather than stringifying them', async () => {
    const files = await buildWorkbook();
    const s1 = strFromU8(files['xl/worksheets/sheet1.xml']);
    // Numeric cells carry no t="s" (shared-string) marker and hold the raw value.
    expect(s1).toMatch(/<c r="B5"[^>]*><v>12<\/v>/);
    expect(s1).toMatch(/<c r="C5"[^>]*><v>48\.5<\/v>/);
    // 0 must survive as a real zero, not be dropped as falsy.
    expect(s1).toMatch(/<c r="C6"[^>]*><v>0<\/v>/);
  });

  it('applies the computed column widths', async () => {
    const files = await buildWorkbook();
    const s1 = strFromU8(files['xl/worksheets/sheet1.xml']);
    expect(s1).toMatch(/<col[^>]*width="20"/);
    expect(s1).toMatch(/<col[^>]*width="10"/);
  });

  it('sanitizes sheet names to Excel rules', () => {
    expect(safeSheetName('a/b:c*d?e[f]g', 'X')).toBe('a b c d e f g');
    expect(safeSheetName('x'.repeat(40), 'X')).toHaveLength(31);
    expect(safeSheetName('', 'Fallback')).toBe('Fallback');
  });
});
