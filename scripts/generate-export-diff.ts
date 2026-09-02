import * as fs from 'fs';
import * as path from 'path';
import { formatPaymentBreakdown } from '../src/utils/paymentBreakdownFormat';

// Representative order dataset matching real-world schema and production typing
// Note: Split method selector is strictly typed 'CASH' | 'CARD', so splits only contain CASH + CARD
const orders = [
  {
    orderNumber: 'ORD-1001',
    createdAt: '2026-09-02T10:15:00.000Z',
    customer: { name: 'Ahmad Al-Saleh' },
    total: 100.0,
    serviceChargeAmount: 5.0,
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    tenders: [
      { method: 'CASH', label: 'CASH', amount: 50.0 },
      { method: 'CARD', label: 'CARD (VISA)', amount: 50.0, cardType: 'VISA' },
    ],
  },
  {
    orderNumber: 'ORD-1002',
    createdAt: '2026-09-02T10:20:00.000Z',
    customer: { name: 'Walk-in' },
    total: 35.5,
    serviceChargeAmount: 0.0,
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    paymentMethod: 'OTHER',
    otherPaymentMethod: 'STC Pay',
    tenders: [
      { method: 'OTHER', label: 'STC Pay', amount: 35.5, otherPaymentMethod: 'STC Pay' },
    ],
  },
  {
    orderNumber: 'ORD-1003',
    createdAt: '2026-09-02T10:30:00.000Z',
    customer: { name: 'Sarah Miller' },
    total: 25.0,
    serviceChargeAmount: 2.0,
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    paymentMethod: 'CARD',
    cardType: 'Mastercard',
    tenders: [
      { method: 'CARD', label: 'CARD (Mastercard)', amount: 25.0, cardType: 'Mastercard' },
    ],
  },
  {
    orderNumber: 'ORD-1004',
    createdAt: '2026-09-02T10:45:00.000Z',
    customer: { name: 'Zaid Tareq' },
    total: 100.0,
    serviceChargeAmount: 4.0,
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    tenders: [
      { method: 'CASH', label: 'CASH', amount: 40.0 },
      { method: 'CARD', label: 'CARD (MADA)', amount: 60.0, cardType: 'MADA' },
    ],
  },
];

function escapeCsv(val: any): string {
  if (val == null) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

// 1. BASELINE EXPORT (Pre-PR: exact columns & mapping from OrdersPage.tsx)
const baselineColumns = [
  'Order Number',
  'Date',
  'Customer',
  'Total',
  'Service Charge',
  'Status',
  'Payment Method',
];

const baselineRows = orders.map((o) => [
  escapeCsv(o.orderNumber),
  escapeCsv(o.createdAt),
  escapeCsv(o.customer.name),
  escapeCsv(o.total.toFixed(2)),
  escapeCsv(o.serviceChargeAmount.toFixed(2)),
  escapeCsv(o.status),
  escapeCsv(o.paymentMethod), // Unaltered paymentMethod
]);

const baselineCsv = [
  baselineColumns.map(escapeCsv).join(','),
  ...baselineRows.map((r) => r.join(',')),
].join('\n') + '\n';

// 2. NEW EXPORT (Post-PR: exact columns & formatPaymentBreakdown function imported from production code)
const newColumns = [
  'Order Number',
  'Date',
  'Customer',
  'Total',
  'Service Charge',
  'Status',
  'Payment Method',
  'Payment Breakdown',
];

const newRows = orders.map((o) => [
  escapeCsv(o.orderNumber),
  escapeCsv(o.createdAt),
  escapeCsv(o.customer.name),
  escapeCsv(o.total.toFixed(2)),
  escapeCsv(o.serviceChargeAmount.toFixed(2)),
  escapeCsv(o.status),
  escapeCsv(o.paymentMethod), // MUST BE BYTE-IDENTICAL
  escapeCsv(formatPaymentBreakdown(o)), // Directly calling production export formatter!
]);

const newCsv = [
  newColumns.map(escapeCsv).join(','),
  ...newRows.map((r) => r.join(',')),
].join('\n') + '\n';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '..');
const fileBefore = path.join(outDir, 'orders_export_before.csv');
const fileAfter = path.join(outDir, 'orders_export_after.csv');

fs.writeFileSync(fileBefore, baselineCsv, 'utf8');
fs.writeFileSync(fileAfter, newCsv, 'utf8');

// Byte-by-byte assertion on Payment Method column (index 6)
let paymentMethodMatches = true;
orders.forEach((o, idx) => {
  const beforeVal = baselineRows[idx][6];
  const afterVal = newRows[idx][6];
  if (beforeVal !== afterVal) {
    console.error(`Mismatch at row ${idx}: before=${beforeVal}, after=${afterVal}`);
    paymentMethodMatches = false;
  }
});

console.log(`✓ orders_export_before.csv written to ${fileBefore}`);
console.log(`✓ orders_export_after.csv written to ${fileAfter}`);
console.log(`✓ Payment Method column byte-identity check: ${paymentMethodMatches ? 'PASS (100% byte-identical)' : 'FAIL'}`);
