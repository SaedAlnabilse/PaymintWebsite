type RefundLineItem = {
  id?: string;
  orderItemId?: string;
  itemId?: string;
  quantity?: number;
  price?: number;
  totalPrice?: number;
  total?: number;
  finalPrice?: number;
  unitPrice?: number;
  finalUnitPrice?: number;
  basePrice?: number;
  refundedFromOrderItemId?: string | null;
  chosenAttributes?: any[];
  selectedAttributes?: any[];
  item?: { id?: string };
  remainingRefundQuantity?: number;
  refundUnitAmountWithAdjustments?: number;
};

type RefundOrderLike = {
  subtotal?: number;
  discount?: number;
  discountAmount?: number;
  serviceChargeAmount?: number;
  tax?: number;
  total?: number;
  items?: RefundLineItem[];
  refundOrders?: Array<{
    subtotal?: number;
    discountAmount?: number;
    serviceChargeAmount?: number;
    tax?: number;
    total?: number;
    items?: RefundLineItem[];
  }>;
};

type SelectedRefundLine = {
  item: RefundLineItem;
  quantity: number;
};

const roundCurrency = (value: number): number =>
  Number((Number.isFinite(value) ? value : 0).toFixed(2));

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getRefundOrderItemId = (item: RefundLineItem): string =>
  String(item?.orderItemId || item?.id || '');

export const getRefundItemSignature = (item: RefundLineItem): string => {
  const itemId = String(item?.itemId || item?.item?.id || '');
  const basePrice = Math.abs(
    toNumber(item?.basePrice ?? item?.unitPrice ?? item?.price),
  ).toFixed(4);
  const attributes = (item?.chosenAttributes || item?.selectedAttributes || [])
    .map((attr: any) =>
      String(attr?.subAttributeId || attr?.subAttribute?.id || attr?.id || ''),
    )
    .filter(Boolean)
    .sort()
    .join(',');

  return `${itemId}|${basePrice}|${attributes}`;
};

export const getRefundedQuantitiesByLine = (order?: RefundOrderLike | null) => {
  const refunded = new Map<string, number>();
  const refundOrders = Array.isArray(order?.refundOrders)
    ? order?.refundOrders || []
    : [];

  refundOrders.forEach(refundOrder => {
    const refundItems = Array.isArray(refundOrder?.items)
      ? refundOrder.items || []
      : [];

    refundItems.forEach(refundItem => {
      const quantity = Math.max(0, toNumber(refundItem?.quantity));
      const refundedFromOrderItemId = String(
        refundItem?.refundedFromOrderItemId || '',
      );

      if (refundedFromOrderItemId) {
        refunded.set(
          refundedFromOrderItemId,
          (refunded.get(refundedFromOrderItemId) || 0) + quantity,
        );
        return;
      }

      const signature = getRefundItemSignature(refundItem);
      refunded.set(signature, (refunded.get(signature) || 0) + quantity);
    });
  });

  return refunded;
};

export const getRefundItemLineTotal = (item: RefundLineItem): number => {
  const value =
    item?.total ??
    item?.totalPrice ??
    item?.finalPrice ??
    item?.price ??
    0;
  return Math.abs(toNumber(value));
};

export const getRefundItemUnitTotal = (item: RefundLineItem): number => {
  const adjusted = toNumber(item?.refundUnitAmountWithAdjustments);
  if (adjusted > 0) return adjusted;

  const explicitUnit = toNumber(item?.unitPrice ?? item?.finalUnitPrice);
  if (explicitUnit > 0) return explicitUnit;

  const quantity = Math.max(1, toNumber(item?.quantity) || 1);
  return getRefundItemLineTotal(item) / quantity;
};

const getLineNetUnitTotal = (item: RefundLineItem): number => {
  const explicitUnit = toNumber(item?.unitPrice ?? item?.finalUnitPrice);
  if (explicitUnit > 0) return explicitUnit;

  const quantity = Math.max(1, toNumber(item?.quantity) || 1);
  return getRefundItemLineTotal(item) / quantity;
};

const getOrderDiscount = (order?: RefundOrderLike | null): number =>
  Math.abs(toNumber(order?.discountAmount ?? order?.discount));

const getOrderLineNetTotal = (order?: RefundOrderLike | null): number => {
  const items = Array.isArray(order?.items) ? order?.items || [] : [];
  return roundCurrency(
    items.reduce((sum, item) => sum + getRefundItemLineTotal(item), 0),
  );
};

const getRefundedPaidTotal = (order?: RefundOrderLike | null): number => {
  const refundOrders = Array.isArray(order?.refundOrders)
    ? order?.refundOrders || []
    : [];
  return roundCurrency(
    refundOrders.reduce(
      (sum, refundOrder) => sum + Math.abs(toNumber(refundOrder?.total)),
      0,
    ),
  );
};

const areAllRemainingItemsSelected = (
  order: RefundOrderLike,
  lines: SelectedRefundLine[],
): boolean => {
  const selectedById = new Map<string, number>();
  lines.forEach(line => {
    const id = getRefundOrderItemId(line.item);
    selectedById.set(id, (selectedById.get(id) || 0) + line.quantity);
  });

  const refunded = getRefundedQuantitiesByLine(order);
  const items = Array.isArray(order.items) ? order.items : [];
  return items.every(item => {
    const id = getRefundOrderItemId(item);
    const refundedQuantity =
      refunded.get(id) || refunded.get(getRefundItemSignature(item)) || 0;
    const remaining =
      item.remainingRefundQuantity ??
      Math.max(0, toNumber(item.quantity) - refundedQuantity);
    if (remaining <= 0) return true;
    return (selectedById.get(id) || 0) >= remaining;
  });
};

export const calculateSelectedRefundAmount = (
  order: RefundOrderLike | null | undefined,
  lines: SelectedRefundLine[],
): number => {
  const legacyLineAmount = roundCurrency(
    lines.reduce(
      (sum, line) => sum + getLineNetUnitTotal(line.item) * line.quantity,
      0,
    ),
  );

  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return legacyLineAmount;
  }

  const originalLineNet = getOrderLineNetTotal(order);
  if (originalLineNet <= 0) return legacyLineAmount;

  const selectedLineNet = roundCurrency(
    lines.reduce(
      (sum, line) => sum + getLineNetUnitTotal(line.item) * line.quantity,
      0,
    ),
  );
  if (selectedLineNet <= 0) return 0;

  const originalTotal = Math.abs(toNumber(order.total));
  const remainingPaid = roundCurrency(
    Math.max(0, originalTotal - getRefundedPaidTotal(order)),
  );
  if (remainingPaid > 0 && areAllRemainingItemsSelected(order, lines)) {
    return remainingPaid;
  }

  const ratio = Math.min(1, selectedLineNet / originalLineNet);
  const preTaxPaid = Math.max(
    0,
    roundCurrency(toNumber(order.subtotal) - getOrderDiscount(order)),
  );
  const allocated = roundCurrency(
    preTaxPaid * ratio +
      Math.abs(toNumber(order.serviceChargeAmount)) * ratio +
      Math.abs(toNumber(order.tax)) * ratio,
  );

  return remainingPaid > 0
    ? roundCurrency(Math.min(remainingPaid, allocated))
    : allocated;
};

export const getRefundUnitAmountWithAdjustments = (
  order: RefundOrderLike | null | undefined,
  item: RefundLineItem,
): number => calculateSelectedRefundAmount(order, [{ item, quantity: 1 }]);

export const withRefundAllocation = <T extends RefundLineItem>(
  order: RefundOrderLike | null | undefined,
  items: T[],
): T[] =>
  items.map(item => ({
    ...item,
    refundUnitAmountWithAdjustments: getRefundUnitAmountWithAdjustments(
      order,
      item,
    ),
  }));
