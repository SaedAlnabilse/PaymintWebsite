import { Clock } from 'lucide-react';
import { BiIcon } from '../../../ui/BiIcon';
import { useCurrency } from '../../../../context/CurrencyContext';
import type { Shift } from '../../../../types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDateLocale } from '../../../../utils/dateLocale';
import { Pagination } from '../../../ui';
import { AnalyticsEmptyState } from '../AnalyticsEmptyState';
import { StatValue } from '../../../../components/ui/StatValue';

const CurrencyAmount = ({ amount, className = "", size = "text-2xl", color = "text-gray-900 dark:text-white", containerClassName = "" }: { amount: number, className?: string, size?: string, color?: string, containerClassName?: string }) => {
  const { currencySymbol } = useCurrency();
  return (
    <StatValue 
      value={amount} 
      currency={currencySymbol} 
      className={`${size} ${color} ${className}`}
      containerClassName={containerClassName}
    />
  );
};

const FormatCurrency = ({ value, className = "text-sm", containerClassName = "justify-end w-full" }: { value: number; className?: string; containerClassName?: string }) => {
  const { currencySymbol } = useCurrency();
  return (
    <StatValue 
      value={value} 
      currency={currencySymbol} 
      className={className}
      containerClassName={containerClassName}
    />
  );
};

interface ShiftsViewProps {
  shifts: Shift[];
}

export const ShiftsView = React.memo(function ShiftsView({ shifts }: ShiftsViewProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sort shifts: Active (OPEN) first, then by startTime newest to oldest
  const sortedShifts = React.useMemo(() => {
    return [...shifts].sort((a: any, b: any) => {
      // 1. Active (OPEN) shifts first
      if (a.status === 'OPEN' && b.status !== 'OPEN') return -1;
      if (a.status !== 'OPEN' && b.status === 'OPEN') return 1;

      // 2. Newest to oldest (based on startTime)
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeB - timeA;
    });
  }, [shifts]);

  const paginatedShifts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedShifts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedShifts, currentPage]);

  const totalVariance = shifts.reduce((acc: number, shift: any) => acc + (shift.discrepancy || 0), 0);
  const activeShiftsCount = shifts.filter((s: any) => s.status === 'OPEN').length;

  return (
    <div className="space-y-6" dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] flex flex-col transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <BiIcon icon="bi-person-workspace" size={20} />
            </div>
            <p className="dashboard-stat-title">{t('orders.reports.shifts.cashVariance')}</p>
          </div>
          <div className="flex items-baseline gap-1">
            <CurrencyAmount 
              amount={totalVariance} 
              color={totalVariance < -0.01 ? 'text-red-500' : totalVariance > 0.01 ? 'text-amber-500' : 'text-mintcom-green'} 
            />
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{t('orders.reports.shifts.totalOverShort')}</p>
        </div>
        <div className="p-4 sm:p-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] flex flex-col transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-mintcom-green/10 text-mintcom-green flex items-center justify-center">
              <BiIcon icon="bi-clock-history" size={20} />
            </div>
            <p className="dashboard-stat-title">{t('dashboard.menu.shiftsReports')}</p>
          </div>
          <StatValue 
            value={shifts.length} 
            className="text-2xl"
            isInteger={true}
          />
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{t('orders.reports.shifts.activeShifts', { count: activeShiftsCount })}</p>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-white/[0.02]">
              <tr className="border-b border-gray-200 dark:border-white/5">
                <th className="px-5 py-5 text-start label-strong font-sans whitespace-nowrap">{t('orders.reports.shifts.staff')}</th>
                <th className="px-5 py-5 text-start label-strong font-sans whitespace-nowrap">{t('orders.reports.shifts.time')}</th>
                <th className="px-5 py-5 text-end label-strong font-sans whitespace-nowrap">{t('orders.reports.shifts.opening')}</th>
                <th className="px-5 py-5 text-end label-strong font-sans whitespace-nowrap">{t('orders.stats.totalSales')}</th>
                <th className="px-5 py-5 text-end label-strong font-sans whitespace-nowrap">{t('orders.reports.shifts.closing')}</th>
                <th className="px-5 py-5 text-end label-strong font-sans whitespace-nowrap">{t('orders.reports.shifts.variance')}</th>
                <th className="px-5 py-5 text-end label-strong font-sans whitespace-nowrap">{t('orders.reports.shifts.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {paginatedShifts.length > 0 ? (
                paginatedShifts.map((shift: any, idx: number) => (
                  <motion.tr
                    key={shift.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-5 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-mintcom-green/10 text-mintcom-green flex items-center justify-center font-black text-xs shrink-0">
                          {shift.user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{shift.user?.username || t('common.unknown')}</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {format(new Date(shift.startTime), 'MMM d, HH:mm', { locale: getDateLocale(t('common.locale')) })}
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {t('common.to')} {shift.endTime ? format(new Date(shift.endTime), 'HH:mm', { locale: getDateLocale(t('common.locale')) }) : t('orders.reports.shifts.present')}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-end font-medium text-gray-500">
                      <FormatCurrency value={shift.openingBalance} />
                    </td>
                    <td className="px-5 py-5 text-end font-bold text-mintcom-green">
                      <FormatCurrency value={shift.totalSales} />
                    </td>
                    <td className="px-5 py-5 text-end font-bold text-mintcom-green">
                      {shift.status === 'CLOSED' ? (
                        shift.closingBalance !== null && shift.closingBalance !== undefined
                          ? <FormatCurrency value={shift.closingBalance} />
                          : <span className="text-gray-400 font-normal">-</span>
                      ) : (
                        <span className="text-xs font-bold text-mintcom-green">{t('orders.reports.shifts.currentlyActive', { defaultValue: 'Currently Active' })}</span>
                      )}
                    </td>
                    <td className="px-5 py-5 text-end">
                      {shift.status === 'CLOSED' && shift.discrepancy !== null && shift.discrepancy !== undefined ? (
                        <div className="flex justify-end">
                          <FormatCurrency
                            value={shift.discrepancy}
                            className="text-sm font-bold text-gray-900 dark:text-white"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="px-5 py-5 text-end">
                      {shift.status === 'OPEN' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-mintcom-green/10 text-mintcom-green border border-mintcom-green/20">
                          {t('orders.reports.shifts.currentlyActive', { defaultValue: 'Currently Active' })}
                        </span>
                      ) : shift.autoClose ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {t('orders.reports.shifts.autoClosed', { defaultValue: 'Auto-closed' })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                          {t('orders.reports.shifts.manualClose', { defaultValue: 'Cashed out' })}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-14">
                    <AnalyticsEmptyState
                      icon={Clock}
                      title={t('orders.reports.shifts.noActivity')}
                      description={t('orders.reports.shifts.noActivityDesc')}
                      compact
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(sortedShifts.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
});
