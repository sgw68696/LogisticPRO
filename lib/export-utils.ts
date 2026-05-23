export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers: { key: keyof T; label: string }[]
): void {
  if (data.length === 0) return;
  const csvRows: string[] = [];
  csvRows.push(headers.map(h => `"${h.label}"`).join(','));
  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h.key];
      const str = val == null ? '' : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
