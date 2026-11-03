/**
 * csvExport.ts
 *
 * Client-side CSV generation and download helper for transactions, audit reports, and escrow records.
 */

export interface CsvColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number | boolean | null | undefined);
}

export function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) {
    return '';
  }
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function formatItemsAsCsv<T>(items: T[], columns: CsvColumn<T>[]): string {
  const headerRow = columns.map((col) => escapeCsvField(col.header)).join(',');
  const rows = items.map((item) => {
    return columns
      .map((col) => {
        const val =
          typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor];
        return escapeCsvField(val);
      })
      .join(',');
  });

  return [headerRow, ...rows].join('\n');
}

export function generateCsvFilename(prefix: string): string {
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${dateStr}.csv`;
}

export function triggerBrowserDownload(
  csvContent: string,
  filename: string,
  mimeType = 'text/csv;charset=utf-8;'
): boolean {
  if (typeof window === 'undefined' || !window.document) {
    return false;
  }

  const blob = new Blob([csvContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
