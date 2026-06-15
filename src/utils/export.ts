// xlsx and jspdf are heavy (~700 KB combined). They are dynamically imported
// inside the build functions below so they only download when the user actually
// triggers an export, instead of weighing down every page that renders an
// Export button.

/**
 * Utility to export an array of objects to a Csv file and trigger a download.
 * @param data Array of objects representing the rows.
 * @param filename Desired filename (without extension).
 * @param headers Optional custom headers mapping (e.g., { id: 'Id', name: 'Name' }).
 */
export const exportToCSV = (data: any[], filename: string, headers?: Record<string, string>) => {
  if (!data || data.length === 0) {
    return;
  }

  // Determine keys from the first object if headers aren't provided
  const keys = Object.keys(data[0]);

  // Create header row
  const headerRow = headers
    ? Object.values(headers).join(',')
    : keys.join(',');

  // Create data rows
  const rows = data.map(obj => {
    const values = (headers ? Object.keys(headers) : keys).map(key => {
      let value = obj[key];

      // Handle nested objects (simple flatten)
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Just use the name or username if it exists
        value = value.name || value.username || JSON.stringify(value);
      }

      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value ?? '').replace(/"/g, '""');
      return `"${stringValue}"`;
    });
    return values.join(',');
  });

  // Combine and create blob
  const csvContent = [headerRow, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Trigger download
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// ─── Format-aware export (Excel / PDF / CSV) ───────────────────────────────

export type ExportFormat = 'xlsx' | 'pdf' | 'csv';

/** An ordered column definition: `key` reads the value off each row, `label` is the header text. */
export interface ExportColumn {
  key: string;
  label: string;
}

/** Optional metadata lines rendered above the table (e.g. date range, location). */
export type ExportMeta = { label: string; value: string }[];

export interface ExportSection {
  /** Sheet name (xlsx) / table heading (pdf, csv). */
  name: string;
  columns: ExportColumn[];
  rows: any[];
}

interface ExportTableInput {
  filename: string;
  title: string;
  columns: ExportColumn[];
  rows: any[];
  meta?: ExportMeta;
}

interface ExportSectionsInput {
  filename: string;
  title: string;
  sections: ExportSection[];
  meta?: ExportMeta;
}

const todayStamp = () => new Date().toISOString().split('T')[0];

/** Normalize a single cell value to a primitive suitable for a spreadsheet/table. */
const cellValue = (row: any, key: string): string | number => {
  let value = row?.[key];
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value.name || value.username || JSON.stringify(value);
  }
  return String(value);
};

const escapeCsv = (value: string | number): string => {
  const str = String(value ?? '');
  return `"${str.replace(/"/g, '""')}"`;
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ─── Excel ─────────────────────────────────────────────────────────────────

/** Build a worksheet for one section. `preamble` rows (title/meta) are placed above the table. */
const buildSheet = (XLSX: typeof import('xlsx'), section: ExportSection, preamble: any[][] = []): any => {
  const header = section.columns.map(c => c.label);
  const body = (section.rows || []).map(row => section.columns.map(c => cellValue(row, c.key)));
  const aoa = [...preamble, header, ...body];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Auto-size columns to the widest cell (capped so a long string can't blow out the layout).
  ws['!cols'] = section.columns.map((c, i) => {
    const widest = Math.max(
      String(c.label).length,
      ...body.map(r => String(r[i] ?? '').length),
    );
    return { wch: Math.min(Math.max(widest + 2, 10), 60) };
  });
  return ws;
};

/** Sanitize a worksheet name for Excel (max 31 chars, no : \\ / ? * [ ]). */
const safeSheetName = (name: string, fallback: string): string => {
  const cleaned = (name || fallback).replace(/[:\\/?*[\]]/g, ' ').trim().slice(0, 31);
  return cleaned || fallback;
};

const buildXLSX = async (title: string, sections: ExportSection[], meta?: ExportMeta) => {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();

  sections.forEach((section, idx) => {
    // Prepend a title + meta block above the table on the first sheet only.
    const preamble: any[][] = [];
    if (idx === 0 && (title || (meta && meta.length))) {
      if (title) preamble.push([title]);
      (meta || []).forEach(m => preamble.push([`${m.label}: ${m.value}`]));
      preamble.push([]); // spacer row
    }
    const ws = buildSheet(XLSX, section, preamble);

    let name = safeSheetName(section.name, `Sheet${idx + 1}`);
    let suffix = 1;
    while (used.has(name.toLowerCase())) {
      name = safeSheetName(`${section.name} ${++suffix}`, `Sheet${idx + 1}`);
    }
    used.add(name.toLowerCase());
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  triggerDownload(
    new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${title ? slug(title) : 'export'}_${todayStamp()}.xlsx`,
  );
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'export';

// ─── PDF ─────────────────────────────────────────────────────────────────

const buildPDF = async (title: string, sections: ExportSection[], meta?: ExportMeta) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const marginX = 40;
  let cursorY = 48;

  if (title) {
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text(title, marginX, cursorY);
    cursorY += 18;
  }

  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  (meta || []).forEach(m => {
    doc.text(`${m.label}: ${m.value}`, marginX, cursorY);
    cursorY += 12;
  });
  doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, cursorY);
  cursorY += 8;

  sections.forEach((section, idx) => {
    const head = [section.columns.map(c => c.label)];
    const body = (section.rows || []).map(row =>
      section.columns.map(c => {
        const v = cellValue(row, c.key);
        return typeof v === 'number' ? v.toLocaleString() : v;
      }),
    );

    if (sections.length > 1) {
      cursorY += 16;
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(section.name, marginX, cursorY);
      cursorY += 4;
    }

    autoTable(doc, {
      head,
      body,
      startY: cursorY,
      margin: { left: marginX, right: marginX },
      styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
      headStyles: { fillColor: [125, 198, 162], textColor: [7, 17, 11], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [247, 250, 248] },
    });

    // Advance cursor below the table just rendered.
    cursorY = (doc as any).lastAutoTable?.finalY ?? cursorY;
    if (idx < sections.length - 1) {
      cursorY += 8;
    }
  });

  doc.save(`${title ? slug(title) : 'export'}_${todayStamp()}.pdf`);
};

// ─── CSV (multi-section aware) ──────────────────────────────────────────────

const buildCSV = (filename: string, title: string, sections: ExportSection[], meta?: ExportMeta) => {
  const lines: string[] = [];
  if (title) lines.push(escapeCsv(title));
  (meta || []).forEach(m => lines.push(`${escapeCsv(m.label)},${escapeCsv(m.value)}`));
  if (lines.length) lines.push('');

  sections.forEach((section, idx) => {
    if (sections.length > 1) lines.push(escapeCsv(section.name));
    lines.push(section.columns.map(c => escapeCsv(c.label)).join(','));
    (section.rows || []).forEach(row => {
      lines.push(section.columns.map(c => escapeCsv(cellValue(row, c.key))).join(','));
    });
    if (idx < sections.length - 1) lines.push('');
  });

  // BOM so Excel reads UTF-8 (incl. Arabic) correctly.
  triggerDownload(
    new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' }),
    `${slug(filename || title)}_${todayStamp()}.csv`,
  );
};

// ─── Public dispatchers ──────────────────────────────────────────────────

/** Export a single table in the requested format. */
export const exportTable = (format: ExportFormat, input: ExportTableInput): Promise<void> => {
  return exportSections(format, {
    filename: input.filename,
    title: input.title,
    meta: input.meta,
    sections: [{ name: input.title || 'Data', columns: input.columns, rows: input.rows }],
  });
};

/** Export multiple titled sections (multi-sheet xlsx / stacked pdf tables / sectioned csv). */
export const exportSections = async (format: ExportFormat, input: ExportSectionsInput): Promise<void> => {
  const sections = (input.sections || []).filter(s => s && s.columns?.length);
  if (sections.length === 0) return;

  try {
    switch (format) {
      case 'xlsx':
        await buildXLSX(input.title, sections, input.meta);
        break;
      case 'pdf':
        await buildPDF(input.title, sections, input.meta);
        break;
      case 'csv':
        buildCSV(input.filename, input.title, sections, input.meta);
        break;
    }
  } catch (err) {
    console.error('[export] Failed to generate file', { format, err });
    throw err;
  }
};
