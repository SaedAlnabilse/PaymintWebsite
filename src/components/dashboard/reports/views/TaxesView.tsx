import { Scale } from 'lucide-react';
import { BiIcon } from '../../../ui/BiIcon';
import { useCurrency } from '../../../../context/CurrencyContext';
import type { SalesSummary } from '../../../../types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnalyticsEmptyState } from '../AnalyticsEmptyState';
import { StatValue } from '../../../../components/ui/StatValue';

interface TaxesViewProps {
  salesData: SalesSummary;
}

const toNumber = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const ratePct = (rate: number) => {
  if (!Number.isFinite(rate) || rate === 0) return 0;
  return rate > 1 ? rate : rate * 100;
};

type TaxRowType = 'current' | 'changed' | 'previous' | 'standard';

export const TaxesView = React.memo(function TaxesView({ salesData }: TaxesViewProps) {
  const { t } = useTranslation();
  const { currencySymbol } = useCurrency();
  const taxBreakdown = React.useMemo(() => {
    const currentTaxRate = ratePct(
      toNumber(salesData.currentTaxRate ?? salesData.currentTaxRatePercent),
    );
    const isCurrentRate = (rate: number) =>
      currentTaxRate > 0 && Math.abs(rate - currentTaxRate) < 0.01;
    const taxTypeSortRank: Record<TaxRowType, number> =
      currentTaxRate > 0
        ? { current: 0, changed: 1, previous: 2, standard: 3 }
        : { current: 0, standard: 0, changed: 1, previous: 2 };
    const getTaxType = (tax: any, isChanged: boolean, rate: number): TaxRowType => {
      const explicitType = String(tax?.taxType ?? '').toLowerCase();
      if (
        explicitType === 'current' ||
        explicitType === 'changed' ||
        explicitType === 'previous' ||
        explicitType === 'standard'
      ) {
        return explicitType;
      }
      if (isChanged) return 'changed';
      if (currentTaxRate > 0) return isCurrentRate(rate) ? 'current' : 'previous';
      return 'standard';
    };
    const getTaxTypeLabel = (taxType: TaxRowType) => {
      switch (taxType) {
        case 'current':
          return t('orders.reports.taxes.currentTaxRate', { defaultValue: 'Current tax rate' });
        case 'changed':
          return t('orders.reports.taxes.changedTaxRate', { defaultValue: 'Changed order tax rate' });
        case 'previous':
          return t('orders.reports.taxes.previousTaxRate', { defaultValue: 'Previous tax rate' });
        default:
          return t('orders.reports.taxes.standardTaxRate', { defaultValue: 'Standard tax rate' });
      }
    };
    const getTaxTypeDescription = (taxType: TaxRowType) => {
      switch (taxType) {
        case 'current':
          return t('orders.reports.taxes.currentTaxDescription', { defaultValue: 'Used the current location tax setting' });
        case 'changed':
          return t('orders.reports.taxes.changedTaxDescription', { defaultValue: 'Edited in the order before payment' });
        case 'previous':
          return t('orders.reports.taxes.previousTaxDescription', { defaultValue: 'Used a location tax setting before it changed' });
        default:
          return t('orders.reports.taxes.standardTaxDescription', { defaultValue: 'Used the location tax setting' });
      }
    };

    return (salesData.taxBreakdown || []).map((tax: any) => {
      const rawRate = ratePct(toNumber(tax.rate ?? tax.taxRate));
      const rateLabel = tax.rateLabel || (rawRate > 0 ? `${Number(rawRate.toFixed(2))}%` : '');
      const isChanged = Boolean(tax.isChanged);
      const taxType = getTaxType(tax, isChanged, rawRate);
      const baseName = getTaxTypeLabel(taxType);
      const name = rateLabel ? `${baseName} ${rateLabel}` : (tax.name || tax.taxName || baseName);
      const description = getTaxTypeDescription(taxType);

      return {
        ...tax,
        name,
        description,
        taxType,
        sortRank: taxTypeSortRank[taxType],
        ratePercent: rawRate,
        rateLabel,
        isChanged,
        taxableAmount: toNumber(tax.taxableAmount ?? tax.taxable),
        collected: toNumber(tax.collected ?? tax.taxAmount ?? tax.amount),
        transactions: toNumber(tax.transactions ?? tax.orderCount),
        refundCount: toNumber(tax.refundCount),
      };
    }).sort((a, b) => a.sortRank - b.sortRank || Math.abs(b.collected) - Math.abs(a.collected));
  }, [salesData.currentTaxRate, salesData.currentTaxRatePercent, salesData.taxBreakdown, t]);

  const totalTax = toNumber(salesData.taxCollected);
  const taxableFromRows = taxBreakdown.reduce((sum, tax) => sum + tax.taxableAmount, 0);
  const grossSales = toNumber(salesData.totalRevenue);
  const taxableSales = Math.max(
    taxableFromRows || toNumber(salesData.netSalesBeforeTaxAndServiceCharge) || grossSales - totalTax,
    0,
  );
  const averageTaxRate = taxableSales > 0 ? totalTax / taxableSales : 0;
  const hasTaxBreakdown = taxBreakdown.length > 0;
  const changedRows = taxBreakdown.filter((tax) => tax.isChanged);
  const changedOrders = changedRows.reduce((sum, tax) => sum + tax.transactions, 0);
  const changedRefunds = changedRows.reduce((sum, tax) => sum + tax.refundCount, 0);
  const hasTaxActivity =
    taxBreakdown.some((tax) =>
      tax.collected !== 0 ||
      tax.taxableAmount !== 0 ||
      tax.transactions > 0 ||
      tax.refundCount > 0
    ) ||
    totalTax !== 0 ||
    grossSales > 0 ||
    toNumber(salesData.totalOrders) > 0;

  const formatCurrency = (value: number) => (
    <StatValue
      value={value}
      currency={currencySymbol}
      className="text-sm font-bold"
      containerClassName="justify-end w-full"
    />
  );

  return (
    <div className="space-y-6" dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] relative overflow-hidden flex flex-col transition-all duration-300">
          <div className="relative z-10">
            <p className="dashboard-stat-title mb-1">{t('orders.reports.taxes.totalTax')}</p>
            <StatValue 
              value={totalTax} 
              currency={currencySymbol} 
              className="text-2xl"
            />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{t('orders.reports.taxes.totalTaxDesc')}</p>
          </div>
          <div className="absolute end-0 top-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -me-10 -mt-10 pointer-events-none" />
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] relative overflow-hidden flex flex-col transition-all duration-300">
          <div className="relative z-10">
            <p className="dashboard-stat-title mb-1">{t('orders.reports.taxes.taxableSales')}</p>
            <StatValue 
              value={taxableSales} 
              currency={currencySymbol} 
              className="text-2xl"
            />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{t('orders.reports.taxes.taxableSalesDesc')}</p>
          </div>
          <div className="absolute end-0 top-0 w-32 h-32 bg-mintcom-green/10 rounded-full blur-3xl -me-10 -mt-10 pointer-events-none" />
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] relative overflow-hidden flex flex-col transition-all duration-300">
          <div className="relative z-10">
            <p className="dashboard-stat-title mb-1">{t('orders.reports.taxes.avgRate')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              <StatValue value={taxableSales > 0 ? averageTaxRate : 0} isPercentage={true} className="text-2xl" />
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{t('orders.reports.taxes.avgRateDesc')}</p>
          </div>
          <div className="absolute end-0 top-0 w-32 h-32 bg-mintcom-green/10 rounded-full blur-3xl -me-10 -mt-10 pointer-events-none" />
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] relative overflow-hidden flex flex-col transition-all duration-300">
          <div className="relative z-10">
            <p className="dashboard-stat-title mb-1">{t('orders.reports.taxes.changedTaxOrders', { defaultValue: 'Changed-tax orders' })}</p>
            <StatValue value={changedOrders} isInteger={true} className="text-2xl" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              {changedRefunds > 0
                ? t('orders.reports.taxes.changedTaxRefundsDesc', {
                    defaultValue: '{{count}} refunds also affected changed-tax rows',
                    count: changedRefunds,
                  })
                : t('orders.reports.taxes.changedTaxOrdersDesc', {
                    defaultValue: 'POS tax edits in this period',
                  })}
            </p>
          </div>
          <div className="absolute end-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -me-10 -mt-10 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:items-start gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <BiIcon icon="bi-receipt" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('orders.reports.taxes.details')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{t('orders.reports.taxes.detailsDesc', { defaultValue: 'Net tax grouped by applied rate and POS tax changes' })}</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-4 text-start label-strong font-sans whitespace-nowrap">{t('orders.reports.taxes.type')}</th>
                  <th className="px-6 py-4 text-end label-strong font-sans whitespace-nowrap">{t('orders.reports.taxes.rate')}</th>
                  <th className="px-6 py-4 text-end label-strong font-sans whitespace-nowrap">{t('orders.reports.taxes.taxable')}</th>
                  <th className="px-6 py-4 text-end label-strong font-sans whitespace-nowrap">{t('orders.reports.taxes.netTax', { defaultValue: 'Net tax' })}</th>
                  <th className="px-6 py-4 text-end label-strong font-sans whitespace-nowrap">{t('orders.reports.taxes.share')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {hasTaxBreakdown ? (
                  taxBreakdown.map((tax, i: number) => {
                    const contribution = totalTax > 0 ? (tax.collected / totalTax) * 100 : 0;
                    const contributionWidth = Math.max(0, Math.min(100, contribution));
                    const markerClass = tax.taxType === 'changed'
                      ? 'bg-indigo-500/10 text-indigo-500'
                      : tax.taxType === 'previous'
                        ? 'bg-gray-500/10 text-gray-500'
                        : 'bg-orange-500/10 text-orange-500';
                    const markerLetter = tax.taxType === 'changed'
                      ? 'E'
                      : tax.taxType === 'previous'
                        ? 'P'
                        : 'C';
                    const badgeClass = tax.taxType === 'changed'
                      ? 'bg-indigo-500/10 text-indigo-500'
                      : tax.taxType === 'previous'
                        ? 'bg-gray-500/10 text-gray-500'
                        : 'bg-orange-500/10 text-orange-500';
                    const badgeLabel = tax.taxType === 'current'
                      ? t('orders.reports.taxes.current', { defaultValue: 'Current' })
                      : tax.taxType === 'changed'
                        ? t('orders.reports.taxes.changed', { defaultValue: 'Changed' })
                        : tax.taxType === 'previous'
                          ? t('orders.reports.taxes.previous', { defaultValue: 'Previous' })
                          : '';
                    return (
                      <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${markerClass}`}>
                              {markerLetter}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-gray-900 dark:text-white">{tax.name}</span>
                                {badgeLabel && (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${badgeClass}`}>
                                    {badgeLabel}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400 font-bold">{tax.description}</span>
                              <span className="flex items-center gap-1.5 text-xs text-gray-400 font-bold flex-wrap">
                                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                  <StatValue value={tax.transactions} isInteger={true} className="text-xs text-gray-400 font-bold inline-flex" />
                                  {t('orders.reports.taxes.txns')}
                                </span>
                                {tax.refundCount > 0 && (
                                  <>
                                    <span className="text-gray-300 dark:text-gray-600">·</span>
                                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                      <StatValue value={tax.refundCount} isInteger={true} className="text-xs text-gray-400 font-bold inline-flex" />
                                      {t('orders.reports.taxes.refunds', { defaultValue: 'refunds' })}
                                    </span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-end">
                          {tax.ratePercent > 0 ? (
                            <StatValue value={tax.ratePercent / 100} isPercentage={true} className="text-sm" containerClassName="justify-end w-full" />
                          ) : (
                            <span className="text-sm font-bold text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-end font-bold text-gray-900 dark:text-white">
                          {formatCurrency(tax.taxableAmount)}
                        </td>
                        <td className="px-6 py-4 text-end font-bold text-orange-500">
                          {formatCurrency(tax.collected)}
                        </td>
                        <td className="px-6 py-4 text-end">
                          <div className="inline-flex items-center gap-2 w-[100px] justify-end">
                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${contributionWidth}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : hasTaxActivity ? (
                  // Default Fallback Row if no granular data
                  <tr className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 font-bold">
                          {t('orders.reports.taxes.standardTax').charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{t('orders.reports.taxes.standardTax')}</span>
                          <StatValue value={salesData.totalOrders ?? 0} isInteger={true} className="text-xs text-gray-400 font-bold inline-flex" /> <span className="text-xs text-gray-400 font-bold">{t('orders.reports.taxes.txns')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-end font-bold text-gray-500">
                      <StatValue value={taxableSales > 0 ? averageTaxRate : 0} isPercentage={true} className="text-sm" containerClassName="justify-end w-full" />
                    </td>
                    <td className="px-6 py-4 text-end font-bold text-gray-900 dark:text-white">
                      {formatCurrency(taxableSales)}
                    </td>
                    <td className="px-6 py-4 text-end font-bold text-orange-500">
                      {formatCurrency(totalTax)}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="inline-flex items-center gap-2 w-[100px] justify-end">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `100%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-14">
                      <AnalyticsEmptyState
                        icon={Scale}
                        title={t('orders.reports.taxes.noData')}
                        description={t('orders.reports.taxes.noDataDesc')}
                        compact
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unique audit metric only — Total Tax / Changed-tax already appear in top stats */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] shadow-sm p-5 sm:p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {t('orders.reports.taxes.auditSummary', { defaultValue: 'Tax Audit Summary' })}
            </h3>
            <p className="text-xs text-gray-500">
              {t('orders.reports.taxes.auditSummaryDesc', {
                defaultValue: 'Quick checks for tax-free sales and POS tax edits',
              })}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] p-5">
            <div className="w-10 h-10 rounded-xl bg-gray-200/60 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-white/30 mb-3">
              <BiIcon icon="bi-receipt" size={18} />
            </div>
            <StatValue
              value={toNumber(salesData.taxExemptSales)}
              currency={currencySymbol}
              className="text-2xl"
            />
            <p className="text-xs font-bold text-gray-400 mt-1">{t('orders.reports.taxes.taxFreeSales')}</p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {t('orders.reports.taxes.taxFreeSalesDesc', {
                defaultValue: 'Completed sales where no tax was collected after refunds are netted out.',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
