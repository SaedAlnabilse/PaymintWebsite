import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface AnalyticsEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  panelClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  compact?: boolean;
}

export const AnalyticsEmptyState = React.memo(function AnalyticsEmptyState({
  icon: Icon,
  title,
  description,
  className = '',
  panelClassName = '',
  titleClassName = '',
  descriptionClassName = '',
  compact = false,
}: AnalyticsEmptyStateProps) {
  const normalizedTitle = title.trim().toLowerCase().replace(/\s+/g, ' ');
  const normalizedDescription = description?.trim().toLowerCase().replace(/\s+/g, ' ');
  const visibleDescription =
    description && normalizedDescription && normalizedDescription !== normalizedTitle ? description : undefined;

  return (
    <div className={`flex min-h-[220px] w-full flex-col items-center justify-center text-center ${compact ? 'gap-3 py-10 px-5' : 'gap-4 py-12 px-6'} ${className}`}>
      <div
        className={`flex items-center justify-center rounded-2xl border border-gray-100 text-gray-300 dark:border-white/5 dark:text-white/10 ${compact ? 'h-14 w-14 bg-gray-50 dark:bg-white/5' : 'h-16 w-16 bg-gray-50 dark:bg-white/5'} ${panelClassName}`}
      >
        <Icon size={compact ? 24 : 28} className="text-current" />
      </div>
      <div className="mx-auto max-w-md space-y-1.5">
        <p className={`text-sm font-bold text-gray-900 dark:text-white tracking-wide ${!visibleDescription ? 'text-base leading-snug' : ''} ${titleClassName}`}>{title}</p>
        {visibleDescription && (
          <p className={`mx-auto max-w-sm text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed ${descriptionClassName}`}>
            {visibleDescription}
          </p>
        )}
      </div>
    </div>
  );
});
