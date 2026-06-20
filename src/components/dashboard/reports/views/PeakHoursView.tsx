import { Activity, Clock, Gauge, ShoppingBag, TrendingUp } from 'lucide-react';
import { useCurrency } from '../../../../context/CurrencyContext';
import type { PeakHour } from '../../../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useTheme } from '../../../../context/ThemeContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnalyticsEmptyState } from '../AnalyticsEmptyState';
import { StatValue } from '../../../../components/ui/StatValue';

interface PeakHoursViewProps {
  peakHours: PeakHour[];
}

const toNumber = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const parseHourValue = (hour: unknown) => {
  if (typeof hour === 'number' && Number.isFinite(hour)) {
    return ((Math.trunc(hour) % 24) + 24) % 24;
  }

  const raw = String(hour ?? '').trim();
  const match = raw.match(/(\d{1,2})/);
  let parsed = match ? Number.parseInt(match[1], 10) : 0;
  const upper = raw.toUpperCase();

  if (upper.includes('PM') && parsed < 12) parsed += 12;
  if (upper.includes('AM') && parsed === 12) parsed = 0;

  return Number.isFinite(parsed) ? ((parsed % 24) + 24) % 24 : 0;
};

const buildHourLabel = (hour: number, locale: string) => {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      hour12: true,
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(2026, 0, 1, hour)));
  } catch {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12} ${suffix}`;
  }
};

const dayPartKey = (hour: number) => {
  if (hour >= 5 && hour <= 10) return 'morningPeak';
  if (hour >= 11 && hour <= 16) return 'afternoonPeak';
  if (hour >= 17 && hour <= 20) return 'eveningPeak';
  return 'nightPeak';
};

export const PeakHoursView = React.memo(function PeakHoursView({ peakHours }: PeakHoursViewProps) {
  const { t } = useTranslation();
  const locale = t('common.locale') || 'en-US';
  const { currencySymbol } = useCurrency();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const rows = React.useMemo(() => {
    const byHour = new Map<number, { hour: number; total: number; count: number }>();

    (peakHours || []).forEach((row: any) => {
      const hour = parseHourValue(row.hour);
      const current = byHour.get(hour) || { hour, total: 0, count: 0 };
      current.total += toNumber(row.total ?? row.revenue ?? row.sales);
      current.count += toNumber(row.count ?? row.orders);
      byHour.set(hour, current);
    });

    return Array.from({ length: 24 }, (_, hour) => {
      const current = byHour.get(hour) || { hour, total: 0, count: 0 };
      return {
        ...current,
        total: Number(current.total.toFixed(2)),
        count: Math.max(0, current.count),
        hourLabel: buildHourLabel(hour, locale),
      };
    });
  }, [peakHours, locale]);

  const activeRows = rows.filter((row) => row.count > 0 || Math.abs(row.total) > 0.005);
  const hasData = activeRows.length > 0;

  if (!hasData) {
    return (
      <div className="p-6 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] shadow-sm">
        <AnalyticsEmptyState
          icon={Clock}
          title={t('orders.reports.peakHours.noData')}
          description={t('orders.reports.peakHours.noDataDesc')}
          className="min-h-[360px] rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/[0.05]"
        />
      </div>
    );
  }

  const peak = activeRows.reduce(
    (best, row) =>
      row.count > best.count || (row.count === best.count && row.total > best.total)
        ? row
        : best,
    activeRows[0],
  );

  const quietest = activeRows.reduce(
    (worst, row) =>
      row.count < worst.count || (row.count === worst.count && row.total < worst.total)
        ? row
        : worst,
    activeRows[0],
  );

  const totalOrders = activeRows.reduce((sum, row) => sum + row.count, 0);
  const totalRevenue = activeRows.reduce((sum, row) => sum + row.total, 0);
  const peakShare = totalOrders > 0 ? peak.count / totalOrders : 0;
  const peakAverageTicket = peak.count > 0 ? peak.total / peak.count : 0;
  const maxCount = Math.max(...rows.map((row) => row.count), 1);
  const topHours = [...activeRows]
    .sort((a, b) => (b.count - a.count) || (b.total - a.total))
    .slice(0, 5);

  const rushWindows = rows.slice(0, 22).map((row, index) => {
    const span = rows.slice(index, index + 3);
    return {
      start: row.hour,
      end: span[span.length - 1].hour,
      count: span.reduce((sum, current) => sum + current.count, 0),
      total: span.reduce((sum, current) => sum + current.total, 0),
    };
  });
  const rushWindow = rushWindows.reduce(
    (best, row) =>
      row.count > best.count || (row.count === best.count && row.total > best.total)
        ? row
        : best,
    rushWindows[0],
  );

  const statCards = [
    {
      icon: Clock,
      label: t('orders.reports.peakHours.busiestHour', { defaultValue: 'Busiest Hour' }),
      value: peak.hourLabel,
      detail: `${peak.count.toLocaleString(locale)} ${t('orders.reports.peakHours.orders', { defaultValue: 'orders' })}`,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      icon: TrendingUp,
      label: t('orders.reports.peakHours.revenue', { defaultValue: 'Revenue' }),
      value: peak.total,
      currency: true,
      detail: t('orders.reports.peakHours.peakRevenueDesc', { defaultValue: 'During the busiest hour' }),
      color: 'text-mintcom-green',
      bg: 'bg-mintcom-green/10',
    },
    {
      icon: ShoppingBag,
      label: t('orders.reports.peakHours.orders', { defaultValue: 'Orders' }),
      value: peak.count,
      integer: true,
      detail: t('orders.reports.peakHours.ofOrders', {
        defaultValue: '{{percent}} of period orders',
        percent: `${Math.round(peakShare * 100)}%`,
      }),
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Gauge,
      label: t('orders.reports.peakHours.avgTicket', { defaultValue: 'Avg. Ticket' }),
      value: peakAverageTicket,
      currency: true,
      detail: t(`orders.reports.peakHours.${dayPartKey(peak.hour)}`, {
        defaultValue: t('orders.reports.peakHours.rushPeriod', { defaultValue: 'Rush period' }),
      }),
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
  ];

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="p-4 sm:p-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] flex flex-col"
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-4`}>
              <card.icon size={20} />
            </div>
            <p className="dashboard-stat-title mb-1">{card.label}</p>
            {card.currency ? (
              <StatValue value={Number(card.value) || 0} currency={currencySymbol} className={`text-2xl ${card.color}`} />
            ) : card.integer ? (
              <StatValue value={Number(card.value) || 0} isInteger={true} className="text-2xl" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{card.value}</p>
            )}
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 p-6 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {t('orders.reports.peakHours.title')}
                </h3>
                <p className="card-subtitle">{t('orders.reports.peakHours.subtitle')}</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] px-4 py-2">
              <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">
                {t('orders.reports.peakHours.rushWindow', { defaultValue: 'Rush window' })}
              </p>
              <p className="text-sm font-black text-gray-900 dark:text-white">
                {buildHourLabel(rushWindow.start, locale)} - {buildHourLabel(rushWindow.end, locale)}
              </p>
            </div>
          </div>

          <div className="h-[360px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff10' : '#00000010'} />
                <XAxis
                  dataKey="hourLabel"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  interval={1}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip
                  cursor={{ fill: isDark ? '#ffffff08' : '#00000006' }}
                  contentStyle={{
                    backgroundColor: isDark ? '#0B1120' : '#fff',
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                    padding: '12px',
                  }}
                  itemStyle={{ color: '#f97316', fontWeight: 'bold', fontSize: '12px' }}
                  labelStyle={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}
                  formatter={(val: any, name: any, props: any) => {
                    const payload = props?.payload;
                    if (name === 'count') {
                      return [
                        `${Number(val || 0).toLocaleString(locale)} ${t('orders.reports.peakHours.orders', { defaultValue: 'orders' })}`,
                        t('orders.reports.peakHours.orders', { defaultValue: 'Orders' }),
                      ];
                    }
                    return [
                      <StatValue value={Number(payload?.total || 0)} currency={currencySymbol} className="text-xs font-bold" />,
                      t('orders.reports.peakHours.revenue', { defaultValue: 'Revenue' }),
                    ];
                  }}
                />
                <Bar dataKey="count" name="count" radius={[6, 6, 0, 0]} barSize={28} animationDuration={900}>
                  {rows.map((row) => (
                    <Cell
                      key={row.hour}
                      fill={row.hour === peak.hour ? '#f97316' : row.count > 0 ? '#7dc6a2' : isDark ? '#334155' : '#e5e7eb'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              {t('orders.reports.peakHours.topHours', { defaultValue: 'Top Rush Hours' })}
            </h3>
            <p className="card-subtitle mb-5">
              {t('orders.reports.peakHours.topHoursDesc', { defaultValue: 'Ranked by order volume' })}
            </p>
            <div className="space-y-3">
              {topHours.map((row, index) => {
                const width = Math.max(8, Math.round((row.count / maxCount) * 100));
                return (
                  <div key={row.hour} className="rounded-xl border border-gray-100 dark:border-white/[0.05] p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{index + 1}. {row.hourLabel}</p>
                        <p className="text-xs font-bold text-gray-400">
                          {row.count.toLocaleString(locale)} {t('orders.reports.peakHours.orders', { defaultValue: 'orders' })}
                        </p>
                      </div>
                      <StatValue value={row.total} currency={currencySymbol} className="text-sm text-orange-500" />
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {t('orders.reports.peakHours.dayMap', { defaultValue: 'Day Load Map' })}
                </h3>
                <p className="card-subtitle">
                  {t('orders.reports.peakHours.dayMapDesc', { defaultValue: 'Darker blocks mean more orders' })}
                </p>
              </div>
              {quietest.hour !== peak.hour && (
                <div className="text-end">
                  <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">
                    {t('orders.reports.peakHours.quietest', { defaultValue: 'Quietest' })}
                  </p>
                  <p className="text-xs font-black text-gray-900 dark:text-white">{quietest.hourLabel}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {rows.map((row) => {
                const opacity = row.count > 0 ? 0.2 + (row.count / maxCount) * 0.8 : 0.08;
                const isPeak = row.hour === peak.hour;
                return (
                  <div
                    key={row.hour}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center ${isPeak ? 'border-orange-500' : 'border-gray-100 dark:border-white/[0.05]'}`}
                    style={{
                      backgroundColor: isPeak
                        ? '#f97316'
                        : `rgba(125, 198, 162, ${opacity})`,
                    }}
                    title={`${row.hourLabel}: ${row.count} orders`}
                  >
                    <span className={`text-[10px] font-black ${isPeak ? 'text-white' : 'text-gray-700 dark:text-white'}`}>
                      {row.hourLabel.replace(/\s/g, '')}
                    </span>
                    <span className={`text-[10px] font-bold ${isPeak ? 'text-white/80' : 'text-gray-500 dark:text-gray-300'}`}>
                      {row.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03]">
          <p className="dashboard-stat-title mb-1">{t('orders.reports.peakHours.totalOrders', { defaultValue: 'Total Orders' })}</p>
          <StatValue value={totalOrders} isInteger={true} className="text-xl" />
        </div>
        <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03]">
          <p className="dashboard-stat-title mb-1">{t('orders.reports.peakHours.totalRevenue', { defaultValue: 'Total Revenue' })}</p>
          <StatValue value={totalRevenue} currency={currencySymbol} className="text-xl" />
        </div>
        <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03]">
          <p className="dashboard-stat-title mb-1">{t('orders.reports.peakHours.rushWindowOrders', { defaultValue: 'Rush Window Orders' })}</p>
          <StatValue value={rushWindow.count} isInteger={true} className="text-xl" />
        </div>
      </div>
    </div>
  );
});
