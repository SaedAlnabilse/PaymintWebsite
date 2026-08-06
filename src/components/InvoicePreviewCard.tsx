import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Printer, FileText } from 'lucide-react';

interface InvoicePreviewCardProps {
  establishmentName?: string;
  currency?: string;
  taxRate?: number;
}

/** Mintcom leaf SVG used in the invoice header. */
const MintcomLeaf = () => (
  <svg viewBox="111.25 441.72 196.55 196.55" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
    <g>
      <path fill="#ffffff" d="m158.71,586.04c-3-4.29-6.72-11.05-8.58-16.8-5.84-18.07-7.45-46.74,19.85-68.44,11.59-9.21,25.99-14.64,40.63-17.07,20.24-3.36,41.28-.88,61.13-5.76-2.48,5.57-3.01,11.6-2.6,17.23.5,6.95,2.31,13.57,3,20.48,2.08,20.65-6.35,43.7-22.46,61.36-9.37,10.28-21.42,18.85-34.62,23.03-12.35,3.92-35.68,2.59-52.78-10.22"/>
      <path fill="#3d8f6b" d="m214.7,534.03c-6.02,7.01-12.31,14.01-18.35,20.54-.7.76-.42,1.9.56,2.16,18.75,5.09,37.13-.18,46.83-5.96-14.46,11.25-35.09,14.99-51.44,9.49-.57-.19-1.23-.02-1.66.43-4.72,5.01-9.15,9.61-13.02,13.55-.71.72-.49,1.84.43,2.17,18.02,6.31,36.42,1.88,46.15-3.42-13.72,9.83-34.94,11.5-50.3,6.26-.55-.19-1.2-.03-1.63.4-2.65,2.65-4.82,4.77-6.35,6.22,0,0-7.6,7.5-12.29,13.97-.54.74-1.63.94-2.27.36-1.28-1.14-2.49-2.36-3.6-3.65-.5-.58-.29-1.47.44-1.93,3.73-2.36,14.35-11.58,14.35-11.58,2.64-2.43,5.27-4.89,7.89-7.38.5-.48.6-1.18.24-1.71-8.84-13.2-8.55-31.39.91-45.4-4.49,9.23-6.84,25.96,2.31,41.4.46.77,1.63.84,2.34.17,4.99-4.82,9.94-9.72,14.83-14.69.43-.44.53-1.05.28-1.55-6.68-13.06-4.4-30.28,5.87-42.98-5.05,8.29-8.99,23.5-2.88,38.38.37.91,1.71,1.05,2.46.28,6.18-6.4,12.25-12.89,18.2-19.45.43-.47.49-1.12.17-1.61-6.05-9.32-5.76-22.25.91-32.45-3.12,6.57-4.78,18.19,1.08,28.87.46.83,1.74.87,2.43.1,6.87-7.7,13.55-15.48,20.01-23.3-5.05,7.93-12.24,17.25-20.2,26.78-.68.82-.3,1.98.74,2.14,14.85,2.37,28.47-2.97,35.4-8.04-10.25,9.68-26.06,14.03-39.25,10.91-.57-.13-1.18.06-1.57.51Z"/>
    </g>
  </svg>
);

export function InvoicePreviewCard({ establishmentName, currency, taxRate }: InvoicePreviewCardProps) {
  const { t } = useTranslation();

  const sym = currency || 'USD';
  const tax = taxRate ?? 16;
  const name = establishmentName || t('settings.fiscal.preview.yourEstablishment', { defaultValue: 'Your Establishment' });

  const sample = useMemo(() => {
    const unitPrice = 17.50;
    const qty = 12;
    const subtotal = unitPrice * qty;
    const discount = 30;
    const taxable = subtotal - discount;
    const taxAmt = Math.round(taxable * (tax / 100) * 100) / 100;
    const total = Math.round((taxable + taxAmt) * 100) / 100;
    return { unitPrice, qty, subtotal, discount, taxable, taxAmt, total };
  }, [tax]);

  const fmt = (n: number) => n.toFixed(2);

  const handlePrint = () => {
    const el = document.getElementById('mintcom-invoice-preview');
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write([
      '<!DOCTYPE html><html><head><title>Invoice Preview</title>',
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">',
      '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Inter",sans-serif;background:#f3f4f6;padding:40px 20px}',
      '@media print{body{background:#fff;padding:0}}</style></head><body>',
      el.outerHTML,
      '<script>setTimeout(function(){window.print()},300)<\/script></body></html>',
    ].join(''));
    w.document.close();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/[0.03] rounded-2xl shadow-sm font-sans"
    >
      {/* Section header */}
      <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-mintcom-green/10 flex items-center justify-center text-mintcom-green shadow-sm">
            <FileText size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('settings.fiscal.preview.title', { defaultValue: 'Invoice Template Preview' })}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
              {t('settings.fiscal.preview.subtitle', { defaultValue: 'This is how your e-invoices will appear' })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mintcom-green/10 text-mintcom-green font-bold text-xs hover:bg-mintcom-green/20 transition-all border border-mintcom-green/20"
        >
          <Printer size={15} />
          <span className="hidden sm:inline">{t('settings.fiscal.preview.print', { defaultValue: 'Print / Save PDF' })}</span>
        </button>
      </div>

      {/* Invoice preview */}
      <div className="p-6 sm:p-8">
        <div
          id="mintcom-invoice-preview"
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
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>INVOICE</div>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.9, marginTop: 4 }}>#MNT-INV-SAMPLE</div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '32px 40px' }}>
            {/* Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, marginBottom: 32 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.2, color: '#7dc6a2', marginBottom: 8 }}>From</h3>
                <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
                  <strong style={{ color: '#1f2937', fontWeight: 600 }}>Mintcom POS Ltd.</strong><br/>
                  123 Business Avenue<br/>
                  Port Louis, Mauritius<br/>
                  support@mintcompos.com
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.2, color: '#7dc6a2', marginBottom: 8 }}>Bill To</h3>
                <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
                  <strong style={{ color: '#1f2937', fontWeight: 600 }}>{name}</strong><br/>
                  —
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.2, color: '#7dc6a2', marginBottom: 8 }}>Invoice Details</h3>
                <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
                  <strong style={{ color: '#1f2937', fontWeight: 600 }}>Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br/>
                  <strong style={{ color: '#1f2937', fontWeight: 600 }}>Currency:</strong> {sym}
                </p>
                <span style={{
                  display: 'inline-block', background: '#ecfdf5', color: '#059669',
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  border: '1px solid #a7f3d0', marginTop: 6, letterSpacing: 0.5,
                }}>SAMPLE</span>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, marginBottom: 28 }}>
              <thead>
                <tr>
                  {['Description', 'Unit Price', 'Qty', 'Amount'].map((h, i) => (
                    <th key={h} style={{
                      background: '#f9fafb', fontSize: 10, fontWeight: 700,
                      textTransform: 'uppercase' as const, letterSpacing: 1, color: '#6b7280',
                      padding: '10px 14px', borderBottom: '2px solid #e5e7eb',
                      textAlign: i === 3 ? 'right' as const : i === 2 ? 'center' as const : 'left' as const,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: 14, fontSize: 13, color: '#1f2937', fontWeight: 600, borderBottom: '1px solid #f3f4f6' }}>
                    Mintcom POS — Premium Plan (Yearly)
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400, marginTop: 3 }}>Full software license · 12-month subscription</div>
                  </td>
                  <td style={{ padding: 14, fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6' }}>${fmt(sample.unitPrice)} /mo</td>
                  <td style={{ padding: 14, fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'center' as const }}>{sample.qty} months</td>
                  <td style={{ padding: 14, fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'right' as const }}>${fmt(sample.subtotal)}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
              <div style={{ width: 280 }}>
                {[
                  { label: 'Subtotal', value: `$${fmt(sample.subtotal)}` },
                  { label: 'Discount (Yearly — Save $30)', value: `−$${fmt(sample.discount)}`, color: '#059669' },
                  { label: `Tax (${tax}%)`, value: `$${fmt(sample.taxAmt)}` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#6b7280' }}>
                    <span style={{ fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: row.color || '#374151' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  borderTop: '2px solid #1f2937', marginTop: 8, paddingTop: 12,
                  fontSize: 16, fontWeight: 800, color: '#1f2937',
                }}>
                  <span>Total</span>
                  <span style={{ color: '#3d8f6b' }}>${fmt(sample.total)} {sym}</span>
                </div>
              </div>
            </div>

            {/* Payment Box */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf7 0%, #ecfdf5 100%)',
              border: '1px solid #d1fae5', borderRadius: 12, padding: 20,
              marginBottom: 32, display: 'flex', gap: 32,
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.2, color: '#059669', marginBottom: 8 }}>Payment Method</h4>
                <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.8 }}>
                  <strong style={{ fontWeight: 600 }}>Credit Card (Visa)</strong><br/>Card ending: •••• 4829
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.2, color: '#059669', marginBottom: 8 }}>Payment Status</h4>
                <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.8 }}>
                  <strong style={{ fontWeight: 600, color: '#059669' }}>✓ Payment Successful</strong><br/>Receipt ID: RCT-MNT-SAMPLE
                </p>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed #e5e7eb', margin: '24px 0' }} />

            {/* Notes */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.2, color: '#9ca3af', marginBottom: 8 }}>Terms &amp; Notes</h4>
              <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.8 }}>
                • This is a sample invoice preview for your e-invoicing configuration.<br/>
                • Actual invoices will contain your real transaction data and tax calculations.<br/>
                • Manage your billing from <strong>Owner Portal › Billing</strong>.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '18px 40px', textAlign: 'center' as const }}>
            <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.8 }}>
              <strong>Mintcom POS Ltd.</strong> · Port Louis, Mauritius<br/>
              <a href="https://mintcompos.com" style={{ color: '#7dc6a2', textDecoration: 'none', fontWeight: 600 }}>mintcompos.com</a>
              {' · '}
              <a href="mailto:support@mintcompos.com" style={{ color: '#7dc6a2', textDecoration: 'none', fontWeight: 600 }}>support@mintcompos.com</a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default InvoicePreviewCard;
