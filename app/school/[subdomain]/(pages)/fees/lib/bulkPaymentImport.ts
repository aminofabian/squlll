export interface BulkPaymentCsvRow {
  admissionNumber?: string;
  phone?: string;
  studentName?: string;
  amount: number;
  paymentMethod?: string;
  transactionReference?: string;
  paymentDate?: string;
}

const HEADER_ALIASES: Record<string, keyof BulkPaymentCsvRow | 'amount'> = {
  admission_number: 'admissionNumber',
  admission: 'admissionNumber',
  adm: 'admissionNumber',
  admission_no: 'admissionNumber',
  phone: 'phone',
  phone_number: 'phone',
  mobile: 'phone',
  student_name: 'studentName',
  name: 'studentName',
  amount: 'amount' as const,
  payment_method: 'paymentMethod',
  method: 'paymentMethod',
  transaction_reference: 'transactionReference',
  reference: 'transactionReference',
  mpesa_code: 'transactionReference',
  mpesa: 'transactionReference',
  payment_date: 'paymentDate',
  date: 'paymentDate',
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseBulkPaymentCsv(text: string): BulkPaymentCsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows: BulkPaymentCsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const record: Partial<BulkPaymentCsvRow> = {};

    headers.forEach((header, index) => {
      const value = cells[index]?.trim();
      if (!value) return;

      const field = HEADER_ALIASES[header];
      if (field === 'amount') {
        record.amount = Number(value.replace(/,/g, ''));
      } else if (field) {
        record[field] = value;
      }
    });

    if (record.amount != null && Number.isFinite(record.amount) && record.amount > 0) {
      rows.push(record as BulkPaymentCsvRow);
    }
  }

  return rows;
}

export const BULK_PAYMENT_CSV_TEMPLATE = `admission_number,phone,student_name,amount,payment_method,transaction_reference,payment_date
ADM001,0712345678,Jane Doe,15000,MPESA,TH1234ABC,2026-06-01
,0722000111,,5000,MPESA,TH5678DEF,2026-06-01`;

export function downloadBulkPaymentTemplate(): void {
  const blob = new Blob([BULK_PAYMENT_CSV_TEMPLATE], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'bulk-payments-template.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}
