export interface OrderPaymentBreakdownSource {
  paymentMethod?: string | null;
  cardType?: string | null;
  otherPaymentMethod?: string | null;
  total?: number | null;
  tenders?: Array<{
    method?: string;
    label?: string;
    amount: number;
    cardType?: string;
    otherPaymentMethod?: string;
  }>;
}

/**
 * Formats the payment breakdown column for export rows and reports.
 * If multiple or enriched tenders exist, formats them as `METHOD AMOUNT | METHOD AMOUNT`.
 * If a single payment method exists, formats the single method with brand/wallet name.
 */
export function formatPaymentBreakdown(order: OrderPaymentBreakdownSource): string {
  if (order.tenders && order.tenders.length > 0) {
    return order.tenders
      .map(
        tItem =>
          `${String(
            tItem.otherPaymentMethod || tItem.cardType || tItem.label || tItem.method,
          ).toUpperCase()} ${Number(tItem.amount).toFixed(2)}`,
      )
      .join(' | ');
  }
  if (order.paymentMethod) {
    return `${String(
      order.otherPaymentMethod || order.cardType || order.paymentMethod,
    ).toUpperCase()} ${Number(order.total || 0).toFixed(2)}`;
  }
  return '';
}
