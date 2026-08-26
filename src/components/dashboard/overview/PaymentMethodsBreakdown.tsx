import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wallet, CreditCard, ChevronRight, Layers } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { StatValue } from '../../ui/StatValue';
import { useCurrency } from '../../../context/CurrencyContext';
import { formatPaymentBrandName } from '../../../utils/paymentCard';

interface PaymentMethodsBreakdownProps {
  paymentMethodBreakdown: { name: string; value: number }[];
  cardTypeBreakdown?: { name: string; value: number }[];
  otherPaymentBreakdown?: { name: string; value: number }[];
  viewMode: 'current_shift' | 'previous_shift' | 'last_24_hours';
}

const COLORS = [
  '#7dc6a2', // Mint green (Cash / primary)
  '#3b82f6', // Blue (Visa / Cards)
  '#f59e0b', // Amber / Orange (Mastercard / Others)
  '#D55263', // Coral / Red (AMEX)
  '#8b5cf6', // Purple (CliQ / Wallets)
  '#ec4899', // Pink (Apple Pay)
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#f97316', // Bright Orange
  '#84cc16', // Lime
  '#a855f7', // Violet
];

type PaymentTab = 'all' | 'cards' | 'others';

const isCardMethod = (name: string) => {
  const n = String(name).toUpperCase();
  return (
    n === 'CARD' ||
    n === 'CARDS' ||
    n.includes('VISA') ||
    n.includes('MASTER') ||
    n.includes('AMEX') ||
    n.includes('MADA') ||
    n.includes('CREDIT') ||
    n.includes('DEBIT') ||
    n.includes('MEEZA') ||
    n.includes('DISCOVER') ||
    n.includes('JCB') ||
    n.includes('UNIONPAY')
  );
};

const isCashMethod = (name: string) => {
  const n = String(name).toUpperCase();
  return n === 'CASH' || n === 'MONEY';
};

const isOtherMethod = (name: string) => {
  return !isCashMethod(name) && !isCardMethod(name);
};

export const PaymentMethodsBreakdown = React.memo(function PaymentMethodsBreakdown({
  paymentMethodBreakdown = [],
  cardTypeBreakdown = [],
  otherPaymentBreakdown = [],
}: PaymentMethodsBreakdownProps) {
  const { t } = useTranslation();
  const { locationSlug } = useParams();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const { currencySymbol } = useCurrency();
  const isDark = resolvedTheme === 'dark';
  const [activeTab, setActiveTab] = useState<PaymentTab>('all');

  const rows = useMemo(() => paymentMethodBreakdown || [], [paymentMethodBreakdown]);

  const cardsData = useMemo(() => {
    if (cardTypeBreakdown && cardTypeBreakdown.length > 0) {
      return cardTypeBreakdown.filter((item) => Number(item.value) > 0);
    }
    return rows.filter((r) => isCardMethod(r.name));
  }, [cardTypeBreakdown, rows]);

  const othersData = useMemo(() => {
    if (otherPaymentBreakdown && otherPaymentBreakdown.length > 0) {
      return otherPaymentBreakdown.filter((item) => Number(item.value) > 0);
    }
    return rows.filter((r) => isOtherMethod(r.name));
  }, [otherPaymentBreakdown, rows]);

  const currentData = useMemo(() => {
    if (activeTab === 'cards') return cardsData;
    if (activeTab === 'others') return othersData;
    return rows;
  }, [activeTab, cardsData, othersData, rows]);

  const currentTotal = useMemo(
    () => currentData.reduce((sum, item) => sum + Math.max(Number(item.value) || 0, 0), 0),
    [currentData]
  );

  const hasData = currentTotal > 0.005;
  const emptyFill = isDark ? '#334155' : '#e5e7eb';

  const pieData = useMemo(() => {
    if (hasData) {
      return currentData.map((item) => ({
        name: item.name,
        value: Math.max(Number(item.value) || 0, 0),
      }));
    }
    return [{ name: '__empty__', value: 1 }];
  }, [currentData, hasData]);

  const getMethodName = (name: string) => {
    if (!name || name === '__empty__') return '—';
    const nameStr = String(name).toUpperCase();
    if (nameStr === 'CARD') return t('orders.payment.allCards');
    if (nameStr === 'CASH') return t('orders.payment.cash');
    if (nameStr === 'OTHER') return t('orders.payment.allOther');
    return formatPaymentBrandName(name);
  };

  return (
    <div id="tour-capital-sources" className="group relative p-4 sm:p-6 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] shadow-sm flex flex-col transition-all duration-300 overflow-hidden">
      <div className="absolute top-0 end-0 w-40 h-40 bg-mintcom-green/5 rounded-full blur-3xl opacity-0 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-mintcom-green/10 flex items-center justify-center text-mintcom-green transition-transform duration-300 shrink-0">
              <Wallet size={20} />
            </div>
            <div className="pt-0.5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('dashboard.paymentMethods.title')}</h3>
              <p className="card-subtitle">{t('dashboard.paymentMethods.distributionOverview', { defaultValue: 'Shift Distribution Overview' })}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/dashboard/${locationSlug}/reports/payments`)}
            className="text-xs font-bold text-mintcom-green hover:underline tracking-wide mt-1.5 shrink-0"
          >
            {t('common.viewAll')}
          </button>
        </div>

        {/* Clickable Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-white/5 rounded-xl mb-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Layers size={13} className="shrink-0" />
            <span>{t('orders.payment.all', { defaultValue: 'All' })}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'cards'
                ? 'bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard size={13} className="shrink-0" />
            <span>{t('orders.payment.allCards', { defaultValue: 'Cards' })}</span>
            {cardsData.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                activeTab === 'cards' ? 'bg-mintcom-green/15 text-mintcom-green' : 'bg-gray-200/70 dark:bg-white/10 text-gray-500'
              }`}>
                {cardsData.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('others')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'others'
                ? 'bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Wallet size={13} className="shrink-0" />
            <span>{t('orders.payment.allOther', { defaultValue: 'Others' })}</span>
            {othersData.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                activeTab === 'others' ? 'bg-mintcom-green/15 text-mintcom-green' : 'bg-gray-200/70 dark:bg-white/10 text-gray-500'
              }`}>
                {othersData.length}
              </span>
            )}
          </button>
        </div>

        {/* Donut Chart */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="h-[145px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={hasData && pieData.length > 1 ? 4 : 0}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={hasData}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={hasData ? COLORS[index % COLORS.length] : emptyFill}
                    />
                  ))}
                </Pie>
                {hasData && (
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0B1120' : '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: isDark ? '#fff' : '#111', fontWeight: 'bold' }}
                    formatter={(val: any, _name: any, entry: any) => [
                      <StatValue
                        key="val"
                        value={Number(val)}
                        currency={currencySymbol}
                        className="text-xs font-bold"
                      />,
                      getMethodName(String(entry?.payload?.name ?? '')),
                    ]}
                  />
                )}
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* Scrollable Legend List (never stretches the card) */}
          <div className="max-h-[145px] overflow-y-auto custom-scrollbar space-y-1 mt-2 pr-1">
            {currentData.length > 0 ? (
              currentData.map((item, i) => {
                const percentage = currentTotal > 0 ? (Math.max(Number(item.value) || 0, 0) / currentTotal) : 0;
                const isCard = activeTab === 'all' && (item.name.toUpperCase() === 'CARD' || item.name.toUpperCase() === 'CARDS');
                const isOther = activeTab === 'all' && (item.name.toUpperCase() === 'OTHER' || item.name.toUpperCase() === 'OTHERS');
                const isClickable = isCard || isOther;

                return (
                  <div
                    key={`${item.name}-${i}`}
                    onClick={() => {
                      if (isCard && cardsData.length > 0) setActiveTab('cards');
                      if (isOther && othersData.length > 0) setActiveTab('others');
                    }}
                    className={`flex items-center justify-between gap-2.5 p-2 rounded-xl transition-all ${
                      isClickable
                        ? 'cursor-pointer hover:bg-mintcom-green/5 dark:hover:bg-white/5 active:scale-[0.99] group/item'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: hasData ? COLORS[i % COLORS.length] : emptyFill }}
                      />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                        {getMethodName(item.name)}
                      </span>
                      {isClickable && (
                        <ChevronRight
                          size={13}
                          className="text-gray-400 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatValue value={Number(item.value) || 0} currency={currencySymbol} className="text-xs font-bold text-gray-900 dark:text-white" />
                      <StatValue value={percentage} isPercentage={true} className="text-xs font-bold text-gray-500 dark:text-gray-400 min-w-[36px] text-end" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-gray-400 font-medium">
                {t('common.noData', { defaultValue: 'No payment data available' })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

