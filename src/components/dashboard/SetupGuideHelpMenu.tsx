import { useRef, useState } from 'react';
import { BookOpen, HelpCircle, LifeBuoy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PortalDropdown } from '../PortalDropdown';

type SetupGuideHelpMenuProps = {
  canReplay: boolean;
  onReplay: () => Promise<boolean>;
  onOpenHelpCenter: () => void;
  compact?: boolean;
};

export function SetupGuideHelpMenu({
  canReplay,
  onReplay,
  onOpenHelpCenter,
  compact = false,
}: SetupGuideHelpMenuProps) {
  const { t } = useTranslation();
  const isRTL = t('common.locale') === 'ar';
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);

  const handleReplay = async () => {
    if (isReplaying) return;
    setIsReplaying(true);
    // Keep a stable, mounted focus target active while authorization is in
    // flight. The replay modal records `document.activeElement` when it opens
    // and can then return focus to this Help trigger after it exits.
    triggerRef.current?.focus();
    try {
      const allowed = await onReplay();
      if (allowed) setIsOpen(false);
    } finally {
      setIsReplaying(false);
    }
  };

  return (
    <div className={compact ? 'relative group' : 'w-full'}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={compact ? t('dashboard.setupGuide.help') : undefined}
        onClick={() => setIsOpen((open) => !open)}
        className={
          compact
            ? 'flex h-12 w-12 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
            : 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-bold text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
        }
      >
        <HelpCircle size={compact ? 24 : 20} />
        {!compact && <span>{t('dashboard.setupGuide.help')}</span>}
      </button>

      {compact && (
        <div className="pointer-events-none absolute left-full top-1/2 z-[80] ml-2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg border border-white/10 bg-gray-900/90 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl backdrop-blur-md transition-all group-hover:translate-x-0 group-hover:opacity-100 rtl:left-auto rtl:right-full rtl:ml-0 rtl:mr-2 rtl:-translate-x-1 rtl:group-hover:translate-x-0">
          {t('dashboard.setupGuide.help')}
        </div>
      )}

      <PortalDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        align={isRTL ? 'right' : 'left'}
        width="w-56"
        maxHeight="max-h-none"
      >
        <div role="menu" dir={isRTL ? 'rtl' : 'ltr'} className="p-1.5">
          {canReplay && (
            <button
              type="button"
              role="menuitem"
              disabled={isReplaying}
              onClick={() => void handleReplay()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950 disabled:cursor-wait disabled:opacity-60 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <BookOpen size={17} className="text-mintcom-green" />
              <span>{t('dashboard.setupGuide.menuItem')}</span>
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onOpenHelpCenter();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <LifeBuoy size={17} className="text-gray-400" />
            <span>{t('dashboard.setupGuide.helpCenter')}</span>
          </button>
        </div>
      </PortalDropdown>
    </div>
  );
}
