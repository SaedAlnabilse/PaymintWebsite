import { Users } from 'lucide-react';
import { BiIcon } from '../../../ui/BiIcon';
import { useCurrency } from '../../../../context/CurrencyContext';
import type { Shift, ShiftOption } from '../../../../types';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useState } from 'react';
import { Pagination } from '../../../ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AnalyticsEmptyState } from '../AnalyticsEmptyState';
import { StatValue } from '../../../../components/ui/StatValue';

const CurrencyAmount = ({ amount, className = "", size = "text-2xl", color = "text-gray-900 dark:text-white" }: { amount: number, className?: string, size?: string, color?: string }) => {
  const { currencySymbol } = useCurrency();
  return (
    <StatValue 
      value={amount} 
      currency={currencySymbol} 
      className={`${size} ${color} ${className}`}
    />
  );
};

const FormatCurrency = ({ value, className = "text-sm", containerClassName = "justify-center" }: { value: number; className?: string; containerClassName?: string }) => {
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

interface StaffViewProps {
  shifts: Shift[];
  selectedEmployeeId: string | null;
  employees: { label: string; value: string }[];
  employeeShifts: ShiftOption[];
}

const COLORS = ['#7dc6a2', '#3b82f6', '#f59e0b', '#D55263', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const StaffView = React.memo(function StaffView({ shifts, selectedEmployeeId, employees, employeeShifts }: StaffViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locationSlug, slug } = useParams();
  const activeSlug = locationSlug || slug;
  const { formatAmount, currencySymbol } = useCurrency();
  const [staffPage, setStaffPage] = useState(1);
  const itemsPerPage = 10;
  const selectedEmp = selectedEmployeeId ? employees.find(e => e.value === selectedEmployeeId) : null;
  const empName = selectedEmp?.label || '';
  const isSpecificEmployee = !!selectedEmployeeId;
  const footerText = isSpecificEmployee ? `${t('orders.reports.staff.byStaff')} ${empName}` : (t('common.allStaff') || 'All Staff');
  const footerIssuedText = isSpecificEmployee ? (t('orders.reports.staff.issuedBy', { name: empName }) || `Issued by ${empName}`) : (t('common.allStaff') || 'All Staff');
  const dataSource = isSpecificEmployee ? employeeShifts : shifts;

  const getNumericTooltipValue = (value: number | string | ReadonlyArray<number | string> | undefined) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    return typeof normalizedValue === 'number' ? normalizedValue : Number(normalizedValue ?? 0);
  };

  // Calculate stats
  const totalHours = dataSource.reduce((acc: number, shift: any) => {
    if (shift.startTime) {
      const start = new Date(shift.startTime);
      const end = shift.endTime ? new Date(shift.endTime) : new Date();
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }
    return acc;
  }, 0);

  const totalOrders = dataSource.reduce((acc: number, shift: any) => acc + (shift.orderCount || 0), 0);
  const totalSales = dataSource.reduce((acc: number, shift: any) => acc + (shift.totalSales || 0), 0);
  const totalDiscounts = dataSource.reduce((acc: number, shift: any) => acc + (shift.totalDiscounts || 0), 0);
  const totalRefunds = dataSource.reduce((acc: number, shift: any) => acc + (shift.totalRefunds || 0), 0);
  const positiveVariance = dataSource.reduce((acc: number, shift: any) => {
    const variance = (shift.variance || shift.discrepancy || 0);
    return variance > 0 ? acc + variance : acc;
  }, 0);
  const negativeVariance = dataSource.reduce((acc: number, shift: any) => {
    const variance = (shift.variance || shift.discrepancy || 0);
    return variance < 0 ? acc + Math.abs(variance) : acc;
  }, 0);

  // Leaderboard Calculation
  const employeeStats = shifts.reduce((acc: any, shift: any) => {
    const username = shift.user?.username || t('common.unknown');
    if (!acc[username]) {
      acc[username] = {
        username,
        totalShifts: 0,
        totalSales: 0,
        totalHours: 0,
        avgTransaction: 0,
        transactionCount: shift.orderCount || 20,
      };
    }
    acc[username].totalShifts += 1;
    acc[username].totalSales += shift.totalSales || 0;
    acc[username].transactionCount += shift.orderCount || 0;
    if (shift.startTime) {
      const start = new Date(shift.startTime);
      const end = shift.endTime ? new Date(shift.endTime) : new Date();
      acc[username].totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }
    return acc;
  }, {});

  const sortedEmployees: any[] = Object.values(employeeStats).sort((a: any, b: any) => b.totalSales - a.totalSales);
  const totalStoreSales = sortedEmployees.reduce((acc: number, curr: any) => acc + curr.totalSales, 0);

  // Prepare Pie Chart Data (Top 4 + Others)
  const pieData = sortedEmployees.slice(0, 4).map((emp: any) => ({
    name: emp.username,
    value: emp.totalSales,
    color: ''
  }));
  if (sortedEmployees.length > 4) {
    pieData.push({
      name: t('common.others'),
      value: sortedEmployees.slice(4).reduce((acc: number, curr: any) => acc + curr.totalSales, 0),
      color: '#94A3B8'
    });
  }

  // Assign colors
  pieData.forEach((entry: any, index: number) => {
    if (entry.name !== t('common.others')) entry.color = COLORS[index % COLORS.length];
  });
  const hasLeaderboardData = sortedEmployees.length > 0;
  const hasSalesShareData = pieData.length > 0 && totalStoreSales > 0;

  return (
    <div className="space-y-8" dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}>
      {/* Overview Cards */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-mintcom-green/10 flex items-center justify-center text-mintcom-green">
            <BiIcon icon="bi-people" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isSpecificEmployee ? t('orders.reports.staff.performance', { name: empName }) : t('orders.reports.staff.overview')}
            </h3>
            <p className="text-xs text-gray-500">{t('orders.reports.staff.breakdown')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Total Hours */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/[0.03] flex flex-col transition-all duration-300 overflow-hidden">
            <p className="dashboard-stat-title mb-1 truncate">{t('orders.reports.staff.totalHours')}</p>
            <StatValue 
              value={totalHours} 
              className="text-2xl"
              isInteger={false}
            />
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-auto truncate" title={footerText}>{footerText}</p>
          </div>

          {/* Total Orders */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/[0.03] flex flex-col transition-all duration-300 overflow-hidden">
            <p className="dashboard-stat-title mb-1 truncate">{t('orders.reports.staff.totalOrders')}</p>
            <StatValue 
              value={totalOrders} 
              className="text-2xl"
              isInteger={true}
            />
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-auto truncate" title={footerText}>{footerText}</p>
          </div>

          {/* Total Sales */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/[0.03] flex flex-col transition-all duration-300 overflow-hidden">
            <p className="dashboard-stat-title mb-1 truncate">{t('orders.reports.staff.totalSales')}</p>
            <CurrencyAmount amount={totalSales} />
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-auto truncate" title={footerText}>{footerText}</p>
          </div>

          {/* Total Discounts */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/[0.03] flex flex-col transition-all duration-300 overflow-hidden">
            <p className="dashboard-stat-title mb-1 truncate">{t('orders.reports.staff.totalDiscounts')}</p>
            <CurrencyAmount amount={totalDiscounts} color="text-orange-500" />
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-auto truncate" title={footerIssuedText}>{footerIssuedText}</p>
          </div>

          {/* Total Refunds */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/[0.03] flex flex-col transition-all duration-300 overflow-hidden">
            <p className="dashboard-stat-title mb-1 truncate">{t('orders.reports.staff.totalRefunds')}</p>
            <CurrencyAmount amount={totalRefunds} color="text-red-500" />
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-auto truncate" title={footerText}>{footerText}</p>
          </div>

          {/* Variances */}
          <div 
            onClick={() => navigate(`/dashboard/${activeSlug}/reports/shifts`)}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/[0.03] flex flex-col transition-all duration-300 overflow-hidden cursor-pointer group"
          >
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-mintcom-green transition-colors tracking-wide mb-1 truncate">{t('orders.reports.staff.totalVariances')}</p>
            <div className="flex flex-wrap items-center gap-1.5 mb-1 leading-none">
              <StatValue value={positiveVariance} currency={currencySymbol} className="text-xl text-amber-500" />
              <span className="text-gray-300 dark:text-white/20 font-light text-xl">/</span>
              <StatValue value={-negativeVariance} currency={currencySymbol} className="text-xl text-red-500" />
            </div>
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-auto truncate" title={footerText}>{footerText}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Visual Analytics - Hide when filtered by specific employee */}
        {!selectedEmployeeId && (
          <>
            {/* 1. Revenue Share Chart */}
            <div className="bg-white dark:bg-[#1E293B] p-5 rounded-[24px] border border-gray-100 dark:border-white/[0.05] shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('orders.reports.staff.salesShare')}</h3>
                <p className="text-xs text-gray-500">{t('orders.reports.staff.byStaff')}</p>
              </div>
              {hasSalesShareData ? (
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="relative shrink-0 w-full lg:w-[280px] h-[220px]" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={88}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={8}
                        >
                          {pieData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => `${formatAmount(getNumericTooltipValue(value))}`}
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                            backgroundColor: '#fff',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '11px'
                          }}
                          position={{ y: -20 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-[11px] font-medium text-gray-400">{t('owner.overview.total')}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          <StatValue value={totalStoreSales} className="text-lg font-bold" />
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {pieData.map((entry: any) => {
                      const pct = totalStoreSales > 0 ? (entry.value / totalStoreSales) * 100 : 0;
                      return (
                        <div key={entry.name} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} aria-hidden="true" />
                          <span className="flex-1 min-w-0 text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={entry.name}>{entry.name}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{pct.toFixed(1)}%</span>
                          <span className="text-sm font-medium text-gray-400 tabular-nums hidden sm:inline">{formatAmount(entry.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <AnalyticsEmptyState
                  icon={Users}
                  title={t('orders.reports.staff.noActivity')}
                  description={t('orders.reports.staff.noActivityDesc')}
                  compact
                  className="rounded-2xl bg-gray-50/50 dark:bg-black/20 border border-dashed border-gray-200 dark:border-white/[0.03] py-12"
                />
              )}
            </div>

            {/* 2. Top Performer — full-width horizontal banner */}
            {hasLeaderboardData && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-[24px] border border-gray-100 dark:border-white/[0.05] shadow-sm bg-white dark:bg-[#1E293B]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="inline-flex items-center shrink-0 px-3.5 py-2 rounded-[12px] bg-mintcom-green text-black text-[11px] font-bold tracking-wide uppercase leading-none" style={{ borderRadius: '12px' }}>
                    {t('common.top')} #1
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                    {sortedEmployees[0].username}
                  </h3>
                </div>
                <div className="flex items-center gap-6 sm:gap-8 sm:ps-6 sm:border-s border-gray-100 dark:border-white/[0.06] sm:ms-auto">
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 mb-1">{t('orders.reports.staff.revenue')}</p>
                    <CurrencyAmount amount={sortedEmployees[0].totalSales} size="text-lg" color="text-gray-900 dark:text-white" />
                  </div>
                  <div className="hidden sm:block w-px self-stretch bg-gray-100 dark:bg-white/[0.06]" aria-hidden="true" />
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 mb-1">{t('orders.reports.staff.avgTicket')}</p>
                    <CurrencyAmount
                      amount={sortedEmployees[0].totalSales / (sortedEmployees[0].transactionCount || 1)}
                      size="text-lg"
                      color="text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* 3. Detailed Metrics Table */}
        <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-white/[0.05] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('orders.reports.staff.title')}</h3>
              <p className="text-xs text-gray-500">{t('orders.reports.staff.subtitle')}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '64px' }} />
                <col />
                <col style={{ width: '18%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '18%' }} />
              </colgroup>
              <thead className="bg-gray-50/50 dark:bg-white/[0.01]">
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-4 py-4 text-start label-strong font-sans">{t('orders.reports.staff.rank')}</th>
                  <th className="px-4 py-4 text-start label-strong font-sans">{t('orders.reports.staff.staff')}</th>
                  <th className="px-4 py-4 text-center label-strong font-sans" style={{ textAlign: 'center' }}>{t('orders.reports.staff.sales')}</th>
                  <th className="px-4 py-4 text-center label-strong font-sans whitespace-nowrap" style={{ textAlign: 'center' }}>{t('orders.reports.staff.share')}</th>
                  <th className="px-4 py-4 text-center label-strong font-sans whitespace-nowrap" style={{ textAlign: 'center' }}>{t('orders.reports.staff.avgOrder')}</th>
                  <th className="px-4 py-4 text-center label-strong font-sans whitespace-nowrap" style={{ textAlign: 'center' }}>{t('orders.reports.staff.salesPerHour')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                {hasLeaderboardData ? (
                  sortedEmployees
                    .slice((staffPage - 1) * itemsPerPage, staffPage * itemsPerPage)
                    .map((emp: any, idx: number) => {
                      const shareRatio = totalStoreSales > 0 ? (emp.totalSales / totalStoreSales) : 0;
                      const sharePercent = shareRatio * 100;
                      const avgTicket = emp.totalSales / (emp.transactionCount || 1);
                      const efficiency = emp.totalSales / (emp.totalHours || 1);

                      return (
                        <tr key={emp.username} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-4 text-start">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs mx-auto sm:mx-0 ${idx === 0 ? 'bg-[#7dc6a2]/20 text-[#7dc6a2]' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                              <StatValue 
                                value={(staffPage - 1) * itemsPerPage + idx + 1} 
                                isInteger={true} 
                                className="text-xs"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4 text-start">
                            <span className="font-bold text-gray-900 dark:text-white text-sm truncate block" title={emp.username}>{emp.username}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex justify-center">
                              <FormatCurrency value={emp.totalSales} />
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                              <div className="w-16 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-mintcom-green rounded-full" style={{ width: `${sharePercent}%` }} />
                              </div>
                              <StatValue 
                                value={sharePercent} 
                                isPercentage={true} 
                                isAlreadyPercent={true} 
                                className="text-xs font-bold text-gray-500"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex justify-center">
                              <FormatCurrency value={avgTicket} />
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex justify-center">
                              <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap text-xs font-bold text-gray-500">
                                <FormatCurrency value={efficiency} /> <span className="whitespace-nowrap">/ {t('orders.reports.staff.perHour')}</span>
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-14">
                      <AnalyticsEmptyState
                        icon={Users}
                        title={t('orders.reports.staff.noActivity')}
                        description={t('orders.reports.staff.noActivityDesc')}
                        compact
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={staffPage}
            totalPages={Math.ceil(sortedEmployees.length / itemsPerPage)}
            onPageChange={(p) => setStaffPage(p)}
          />
        </div>
      </div>
    </div>
  );
});
