import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { StatValue } from '../../ui/StatValue';
import { useCurrency } from '../../../context/CurrencyContext';
import { formatPaymentBrandName } from '../../../utils/paymentCard';

interface PaymentMethodsBreakdownProps {
  paymentMethodBreakdown: { name: string; value: number }[];
  viewMode: 'current_shift' | 'previous_shift' | 'last_24_hours';
}

const COLORS = ['#7dc6a2', '#3b82f6', '#f59e0b', '#D55263', '#8b5cf6', '#ec4899'];

export const PaymentMethodsBreakdown = React.memo(function PaymentMethodsBreakdown({ paymentMethodBreakdown }: PaymentMethodsBreakdownProps) {
  const { t } = useTranslation();
  const { locationSlug } = useParams();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const { currencySymbol } = useCurrency();
  const isDark = resolvedTheme === 'dark';
  const rows = paymentMethodBreakdown || [];
  const paymentTotal = rows.reduce((sum, item) => sum + Math.max(Number(item.value) || 0, 0), 0);
  const hasPaymentData = paymentTotal > 0.005;
  // Recharts hides zero-value slices — use a single gray ring when empty.
  const emptyFill = isDark ? '#334155' : '#e5e7eb';
  const pieData = hasPaymentData
    ? rows.map((item) => ({ ...item, value: Math.max(Number(item.value) || 0, 0) }))
    : [{ name: '__empty__', value: 1 }];
  const legendRows =
    rows.length > 0
      ? rows.slice(0, 3)
      : [
          { name: 'CASH', value: 0 },
          { name: 'CARD', value: 0 },
          { name: 'OTHER', value: 0 },
        ];

  const getMethodName = (name: string) => {
    const nameStr = String(name).toUpperCase();
    if (nameStr === 'CARD') return t('orders.payment.allCards');
    if (nameStr === 'CASH') return t('orders.payment.cash');
    if (nameStr === 'OTHER') return t('orders.payment.allOther');
    return formatPaymentBrandName(name);
  };

  return (
    <div id="tour-capital-sources" className="group relative p-4 sm:p-6 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] shadow-sm flex flex-col transition-all duration-300 overflow-hidden">
      <div className="absolute top-0 end-0 w-40 h-40 bg-mintcom-green/5 rounded-full blur-3xl opacity-0 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
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
            className="text-xs font-bold text-mintcom-green hover:underline tracking-wide mt-1.5"
          >
            {t('common.viewAll')}
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="h-[160px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={hasPaymentData ? 4 : 0}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={hasPaymentData}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={hasPaymentData ? COLORS[index % COLORS.length] : emptyFill}
                    />
                  ))}
                </Pie>
                {hasPaymentData && (
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0B1120' : '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: isDark ? '#fff' : '#111', fontWeight: 'bold' }}
                  />
                )}
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {legendRows.map((item, i) => {
              const percentage = paymentTotal > 0 ? item.value / paymentTotal : 0;

              return (
                <div key={`${item.name}-${i}`} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: hasPaymentData ? COLORS[i % COLORS.length] : emptyFill }}
                    />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{getMethodName(item.name)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatValue value={item.value} currency={currencySymbol} className="text-xs" />
                    <StatValue value={percentage} isPercentage={true} className="text-xs font-bold text-gray-500 min-w-[36px] text-end" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

