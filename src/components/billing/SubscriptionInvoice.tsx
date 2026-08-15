import { useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Download, Printer, X } from 'lucide-react';

/** Mintcom leaf SVG used in the invoice header. */
const MintcomLeaf = () => (
  <svg viewBox="111.25 441.72 196.55 196.55" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
    <g>
      <path fill="#ffffff" d="m158.71,586.04c-3-4.29-6.72-11.05-8.58-16.8-5.84-18.07-7.45-46.74,19.85-68.44,11.59-9.21,25.99-14.64,40.63-17.07,20.24-3.36,41.28-.88,61.13-5.76-2.48,5.57-3.01,11.6-2.6,17.23.5,6.95,2.31,13.57,3,20.48,2.08,20.65-6.35,43.7-22.46,61.36-9.37,10.28-21.42,18.85-34.62,23.03-12.35,3.92-35.68,2.59-52.78-10.22" />
      <path fill="#3d8f6b" d="m214.7,534.03c-6.02,7.01-12.31,14.01-18.35,20.54-.7.76-.42,1.9.56,2.16,18.75,5.09,37.13-.18,46.83-5.96-14.46,11.25-35.09,14.99-51.44,9.49-.57-.19-1.23-.02-1.66.43-4.72,5.01-9.15,9.61-13.02,13.55-.71.72-.49,1.84.43,2.17,18.02,6.31,36.42,1.88,46.15-3.42-13.72,9.83-34.94,11.5-50.3,6.26-.55-.19-1.2-.03-1.63.4-2.65,2.65-4.82,4.77-6.35,6.22,0,0-7.6,7.5-12.29,13.97-.54.74-1.63.94-2.27.36-1.28-1.14-2.49-2.36-3.6-3.65-.5-.58-.29-1.47.44-1.93,3.73-2.36,14.35-11.58,14.35-11.58,2.64-2.43,5.27-4.89,7.89-7.38.5-.48.6-1.18.24-1.71-8.84-13.2-8.55-31.39.91-45.4-4.49,9.23-6.84,25.96,2.31,41.4.46.77,1.63.84,2.34.17,4.99-4.82,9.94-9.72,14.83-14.69.43-.44.53-1.05.28-1.55-6.68-13.06-4.4-30.28,5.87-42.98-5.05,8.29-8.99,23.5-2.88,38.38.37.91,1.71,1.05,2.46.28,6.18-6.4,12.25-12.89,18.2-19.45.43-.47.49-1.12.17-1.61-6.05-9.32-5.76-22.25.91-32.45-3.12,6.57-4.78,18.19,1.08,28.87.46.83,1.74.87,2.43.1,6.87-7.7,13.55-15.48,20.01-23.3-5.05,7.93-12.24,17.25-20.2,26.78-.68.82-.3,1.98.74,2.14,14.85,2.37,28.47-2.97,35.4-8.04-10.25,9.68-26.06,14.03-39.25,10.91-.57-.13-1.18.06-1.57.51Z" />
    </g>
  </svg>
);

/** One frozen line of the document. Values come from the server snapshot. */
export interface InvoiceLineItem {
  description: string;
  detail?: string;
  /** Rate the line was priced at, per unit. */
  unitPrice: number;
  /** Months covered: 1 for monthly, 12 for yearly. */
  quantity: number;
  amount: number;
}

/**
 * The document body as it was at issue time. The server never recomputes this,
 * so a plan rename or price change cannot rewrite a past invoice.
 */
export interface InvoiceSnapshot {
  seller: { name: string; address: string; email: string };
  billTo: {
    name: string;
    reference?: string | null;
    accountName?: string | null;
    accountEmail?: string | null;
  };
  billingCycle: 'monthly' | 'yearly';
  lineItems: InvoiceLineItem[];
  terms?: string;
  /** Reconstructed by the migration from a charge that predates this table. */
  backfilled?: boolean;
}

export interface SubscriptionInvoiceData {
  id?: string | null;
  /**
   * Server-issued document number, e.g. INV-2026-000123.
   *
   * `null` means nothing has been charged yet, so no invoice exists. The
   * document then renders as a subscription summary with no number — it must
   * not be filed as a tax document.
   */
  number: string | null;
  status: string;
  issueDate: string | Date;
  periodStart?: string | Date | null;
  periodEnd?: string | Date | null;
  currency: string;
  subtotal: number;
  discount: number;
  taxAmount?: number;
  total: number;
  cardBrand?: string | null;
  cardLast4?: string | null;
  /** Processor reference for the settled charge. */
  paymentRef?: string | null;
  snapshot: InvoiceSnapshot;
  /** ISTD / JoFotara identifiers, printed only once submission is live. */
  taxAuthorityUuid?: string | null;
  taxAuthorityQr?: string | null;
  /** True when the amounts are a forecast, not a charge that happened. */
  isEstimate?: boolean;
  nextBillDate?: string | null;
  establishmentId?: string | null;
  establishmentName?: string | null;
}

/** Amount ranges here are subscription prices, so plain 2-decimal money is enough. */
const money = (value: number, currency: string) =>
  `${Number(value || 0).toFixed(2)} ${currency}`;

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const INVOICE_DOM_ID = 'mintcom-subscription-invoice';

/** File-name-safe stem for downloads. */
const documentSlug = (data: SubscriptionInvoiceData) =>
  data.number ||
  `Summary-${(data.snapshot.billTo.name || 'Location').replace(/[^a-zA-Z0-9]+/g, '-')}`;

/**
 * An invoice states whether the money moved, not what the subscription state
 * is, so the stored status is translated into payment language here.
 */
const paymentStatusLabel = (data: SubscriptionInvoiceData) => {
  if (!data.number) return 'Not charged yet';
  switch ((data.status || '').toUpperCase()) {
    case 'PAID':
      return 'Paid';
    case 'VOID':
      return 'Void';
    case 'REFUNDED':
      return 'Refunded';
    case 'ISSUED':
      return 'Payment due';
    default:
      return 'Paid';
  }
};

const labelStyle = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: 1.2,
  color: '#7dc6a2',
  marginBottom: 8,
};

/** The printable document itself: inline styles only, so print/download keep the design. */
export function SubscriptionInvoiceDocument({ data }: { data: SubscriptionInvoiceData }) {
  const { snapshot } = data;
  const isIssued = Boolean(data.number);
  const nextBill = formatDate(data.nextBillDate);
  const periodStart = formatDate(data.periodStart);
  const periodEnd = formatDate(data.periodEnd);

  return (
    <div
      id={INVOICE_DOM_ID}
      style={{
        maxWidth: 720,
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,.08)',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#1f2937',
        lineHeight: 1.5,
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7dc6a2 0%, #5aab85 50%, #3d8f6b 100%)',
        color: '#fff',
        padding: '32px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MintcomLeaf />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Mintcom</div>
            <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.85, marginTop: 2 }}>Point of Sale Solutions</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ fontSize: isIssued ? 28 : 20, fontWeight: 800, letterSpacing: -0.5 }}>
            {isIssued ? 'INVOICE' : 'SUBSCRIPTION SUMMARY'}
          </div>
          {isIssued ? (
            <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.9, marginTop: 4 }}>#{data.number}</div>
          ) : (
            <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.9, marginTop: 4 }}>Not a tax document</div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '32px 40px' }}>
        {!isIssued && (
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
            padding: '12px 16px', marginBottom: 24, fontSize: 11, color: '#92400e', lineHeight: 1.7,
          }}>
            <strong style={{ fontWeight: 700 }}>No invoice has been issued for this location yet.</strong><br />
            This page summarises the current subscription and its expected charge. A numbered
            invoice is issued automatically the first time a payment settles.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, marginBottom: 32 }}>
          <div style={{ flex: 1 }}>
            <h3 style={labelStyle}>From</h3>
            <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
              <strong style={{ color: '#1f2937', fontWeight: 600 }}>{snapshot.seller.name}</strong><br />
              {snapshot.seller.address}<br />
              {snapshot.seller.email}
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={labelStyle}>Bill To</h3>
            <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
              <strong style={{ color: '#1f2937', fontWeight: 600 }}>{snapshot.billTo.name}</strong><br />
              {snapshot.billTo.reference || '—'}
              {snapshot.billTo.accountEmail ? (
                <>
                  <br />
                  {snapshot.billTo.accountEmail}
                </>
              ) : null}
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={labelStyle}>{isIssued ? 'Invoice Details' : 'Summary Details'}</h3>
            <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
              <strong style={{ color: '#1f2937', fontWeight: 600 }}>Date:</strong> {formatDate(data.issueDate)}<br />
              <strong style={{ color: '#1f2937', fontWeight: 600 }}>Currency:</strong> {data.currency}
              {periodStart && periodEnd ? (
                <>
                  <br />
                  <strong style={{ color: '#1f2937', fontWeight: 600 }}>Period:</strong> {periodStart} – {periodEnd}
                </>
              ) : null}
              {!isIssued && nextBill ? (
                <>
                  <br />
                  <strong style={{ color: '#1f2937', fontWeight: 600 }}>Next charge:</strong> {nextBill}
                </>
              ) : null}
            </p>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' as const, marginBottom: 28 }}>
          <thead>
            <tr>
              {['Description', 'Unit Price', 'Qty', 'Amount'].map((header, index) => (
                <th key={header} style={{
                  background: '#f9fafb', fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase' as const, letterSpacing: 1, color: '#6b7280',
                  padding: '10px 14px', borderBottom: '2px solid #e5e7eb',
                  textAlign: index === 3 ? 'right' as const : index === 2 ? 'center' as const : 'left' as const,
                }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {snapshot.lineItems.map((line, index) => (
              <tr key={`${line.description}-${index}`}>
                <td style={{ padding: 14, fontSize: 13, color: '#1f2937', fontWeight: 600, borderBottom: '1px solid #f3f4f6' }}>
                  {line.description}
                  {line.detail ? (
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400, marginTop: 3 }}>{line.detail}</div>
                  ) : null}
                </td>
                <td style={{ padding: 14, fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6' }}>
                  {money(line.unitPrice, data.currency)}{line.quantity > 1 ? ' /mo' : ''}
                </td>
                <td style={{ padding: 14, fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'center' as const }}>
                  {line.quantity === 1 ? '1 month' : `${line.quantity} months`}
                </td>
                <td style={{ padding: 14, fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'right' as const }}>
                  {money(line.amount, data.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <div style={{ width: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#6b7280' }}>
              <span style={{ fontWeight: 500 }}>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#374151' }}>{money(data.subtotal, data.currency)}</span>
            </div>
            {data.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#6b7280' }}>
                <span style={{ fontWeight: 500 }}>Yearly discount</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>−{money(data.discount, data.currency)}</span>
              </div>
            )}
            {(data.taxAmount || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#6b7280' }}>
                <span style={{ fontWeight: 500 }}>Tax</span>
                <span style={{ fontWeight: 600, color: '#374151' }}>{money(data.taxAmount || 0, data.currency)}</span>
              </div>
            )}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              borderTop: '2px solid #1f2937', marginTop: 8, paddingTop: 12,
              fontSize: 16, fontWeight: 800, color: '#1f2937',
            }}>
              <span>Total</span>
              <span style={{ color: '#3d8f6b' }}>{money(data.total, data.currency)}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf7 0%, #ecfdf5 100%)',
          border: '1px solid #d1fae5', borderRadius: 12, padding: 20,
          marginBottom: 32, display: 'flex', gap: 32,
        }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ ...labelStyle, color: '#059669' }}>Payment Method</h4>
            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.8 }}>
              {data.cardLast4 ? (
                <>
                  <strong style={{ fontWeight: 600 }}>{data.cardBrand || 'Card'}</strong><br />
                  Card ending: •••• {data.cardLast4}
                </>
              ) : (
                <strong style={{ fontWeight: 600 }}>No card on file</strong>
              )}
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ ...labelStyle, color: '#059669' }}>Payment Status</h4>
            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.8 }}>
              <strong style={{ fontWeight: 600, color: '#059669' }}>
                {paymentStatusLabel(data)}
              </strong>
              <br />
              {snapshot.billingCycle === 'yearly' ? 'Billed yearly' : 'Billed monthly'}
            </p>
          </div>
        </div>

        {(data.taxAuthorityUuid || data.taxAuthorityQr) && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ ...labelStyle, color: '#9ca3af' }}>Tax Authority</h4>
            <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.8, wordBreak: 'break-all' as const }}>
              {data.taxAuthorityUuid ? <>UUID: {data.taxAuthorityUuid}<br /></> : null}
              {data.taxAuthorityQr || null}
            </p>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px dashed #e5e7eb', margin: '24px 0' }} />

        <div style={{ marginBottom: 24 }}>
          <h4 style={{ ...labelStyle, color: '#9ca3af' }}>Terms</h4>
          <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.8 }}>
            {snapshot.terms
              || 'Charged automatically to the payment method above at the start of each billing period. Questions about this invoice: support@mintcompos.com'}
            {snapshot.backfilled ? (
              <>
                <br />
                This document was reconstructed from the payment ledger for a charge that
                settled before numbered invoices were introduced.
              </>
            ) : null}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '18px 40px', textAlign: 'center' as const }}>
        <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.8 }}>
          <strong>{snapshot.seller.name}</strong> · {snapshot.seller.address}<br />
          <a href="https://mintcompos.com" style={{ color: '#7dc6a2', textDecoration: 'none', fontWeight: 600 }}>mintcompos.com</a>
          {' · '}
          <a href={`mailto:${snapshot.seller.email}`} style={{ color: '#7dc6a2', textDecoration: 'none', fontWeight: 600 }}>{snapshot.seller.email}</a>
        </p>
      </div>
    </div>
  );
}

/** Wrap a rendered document in a standalone printable page. */
export const buildStandaloneHtml = (bodyHtml: string, title: string, autoPrint: boolean) => [
  '<!DOCTYPE html><html><head><meta charset="utf-8" />',
  `<title>${title}</title>`,
  '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">',
  '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Inter",sans-serif;background:#f3f4f6;padding:40px 20px}',
  '@media print{body{background:#fff;padding:0}}</style></head><body>',
  bodyHtml,
  autoPrint ? '<script>setTimeout(function(){window.print()},300)</scr' + 'ipt>' : '',
  '</body></html>',
].join('');

/** Open `html` in a new tab and trigger the browser print dialog. */
export const printHtmlDocument = (html: string, title: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;
  printWindow.document.write(buildStandaloneHtml(html, title, true));
  printWindow.document.close();
  return true;
};

/** Save `html` as a standalone file the user can reopen or print later. */
export const downloadHtmlDocument = (html: string, title: string, fileName: string) => {
  const blob = new Blob([buildStandaloneHtml(html, title, false)], {
    type: 'text/html;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export interface SubscriptionInvoiceModalProps {
  data: SubscriptionInvoiceData | null;
  onClose: () => void;
  /** Rendered to the left of the actions, e.g. a "back to history" button. */
  leadingAction?: React.ReactNode;
}

/** Owner-facing invoice viewer with print (save as PDF) and download actions. */
export function SubscriptionInvoiceModal({ data, onClose, leadingAction }: SubscriptionInvoiceModalProps) {
  const { t } = useTranslation();
  const documentRef = useRef<HTMLDivElement>(null);

  const getInvoiceHtml = useCallback(() => {
    const node = documentRef.current?.querySelector(`#${INVOICE_DOM_ID}`);
    return node ? node.outerHTML : null;
  }, []);

  const documentTitle = data
    ? data.number
      ? `Invoice ${data.number}`
      : `Subscription summary — ${data.snapshot.billTo.name}`
    : '';

  const handlePrint = useCallback(() => {
    const html = getInvoiceHtml();
    if (!html || !data) return;
    printHtmlDocument(html, documentTitle);
  }, [data, documentTitle, getInvoiceHtml]);

  const handleDownload = useCallback(() => {
    const html = getInvoiceHtml();
    if (!html || !data) return;
    downloadHtmlDocument(html, documentTitle, `Mintcom-${documentSlug(data)}.html`);
  }, [data, documentTitle, getInvoiceHtml]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {data && (
        <div
          dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-[9999] popup-surface flex items-end justify-center p-0 sm:items-center sm:p-4 font-sans"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1E293B] sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-white/5">
              <div className="flex min-w-0 items-center gap-3">
                {leadingAction}
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                    {data.number
                      ? t('owner.billing.invoice.title', { defaultValue: 'Subscription invoice' })
                      : t('owner.billing.invoice.summaryTitle', { defaultValue: 'Subscription summary' })}
                  </h3>
                  <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    {data.snapshot.billTo.name}
                    {data.number ? ` · #${data.number}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  <Download size={15} />
                  <span className="hidden sm:inline">
                    {t('owner.billing.invoice.download', { defaultValue: 'Download' })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-xl border border-mintcom-green/20 bg-mintcom-green/10 px-3 py-2 text-xs font-bold text-mintcom-green transition hover:bg-mintcom-green/20"
                >
                  <Printer size={15} />
                  <span className="hidden sm:inline">
                    {t('owner.billing.invoice.print', { defaultValue: 'Print / Save PDF' })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('common.close', { defaultValue: 'Close' })}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div ref={documentRef} className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-black/20 sm:p-6">
              <SubscriptionInvoiceDocument data={data} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default SubscriptionInvoiceModal;
