import React from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Smartphone } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { AlertsBell, type AlertsBellLocation } from '../notifications/AlertsBell';
import type { Account } from '../../types';

export interface SidebarUserProfileFooterProps {
  sidebarOpen: boolean;
  account: Account | null;
  scope: 'owner' | 'brand';
  locations: readonly AlertsBellLocation[];
  establishmentIds?: string[];
  onOpenMobileAppModal: () => void;
  onLogout: () => void;
}

export const SidebarUserProfileFooter: React.FC<SidebarUserProfileFooterProps> = ({
  sidebarOpen,
  account,
  scope,
  locations,
  establishmentIds,
  onOpenMobileAppModal,
  onLogout,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-3 border-t border-gray-100 dark:border-white/5 relative shrink-0">
      {sidebarOpen ? (
        <div className="space-y-1">
          {/* Profile Header */}
          <div className="flex items-center gap-3 p-3 mb-2 bg-gray-50 dark:bg-white/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mintcom-green to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm text-black font-bold text-xs">
              {account?.firstName?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {account?.firstName} {account?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {account?.email || (scope === 'owner' ? t('owner.menu.enterpriseOwner') : t('brand.menu.brandAdmin'))}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-3 py-1">
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
              {t('notifications.menu.title')}
            </span>
            <AlertsBell scope={scope} locations={locations} establishmentIds={establishmentIds} />
          </div>

          {/* Menu Items */}
          <div className="flex justify-end">
            <LanguageSwitcher
              dropdownDirection="up"
              className="w-full"
              buttonClassName="w-full justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:!bg-gray-100 dark:hover:!bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all text-left !bg-transparent dark:!bg-transparent !border-transparent focus:outline-none focus:ring-0 focus:!bg-transparent focus:!border-transparent active:!bg-transparent active:!border-transparent"
              menuClassName="w-full min-w-0"
              iconSize={20}
            />
          </div>

          <ThemeToggle
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all text-left"
            showLabel={true}
            dropdownDirection="up"
            iconSize={20}
          />

          <button
            onClick={onOpenMobileAppModal}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all text-left"
          >
            <Smartphone size={16} className="text-gray-400" />
            <span>{t('owner.menu.getMobileApp')}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all text-left"
          >
            <LogOut size={20} />
            <span>{t('dashboard.menu.logout')}</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <AlertsBell scope={scope} locations={locations} establishmentIds={establishmentIds} />
          <div className="relative group">
            <LanguageSwitcher
              iconOnly
              iconSize={24}
              dropdownDirection="right"
              buttonClassName="w-12 h-12 rounded-xl !px-0 !py-0 flex items-center justify-center gap-0 !bg-transparent dark:!bg-transparent !border-transparent text-gray-500 dark:text-gray-400 hover:!bg-gray-100 dark:hover:!bg-white/5 hover:text-gray-900 dark:hover:text-white"
            />
            <div className="absolute left-full rtl:left-auto rtl:right-full top-1/2 -translate-y-1/2 ml-2 rtl:ml-0 rtl:mr-2 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-xs font-sans font-medium tracking-normal rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 pointer-events-none z-[80] whitespace-nowrap border border-white/10 shadow-xl translate-x-1 rtl:-translate-x-1 group-hover:translate-x-0 group-focus-within:translate-x-0">
              {t('common.aria.changeLanguage')}
            </div>
          </div>

          <button
            onClick={onOpenMobileAppModal}
            className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all relative group"
          >
            <Smartphone size={24} />
            <div className="absolute left-full rtl:left-auto rtl:right-full top-1/2 -translate-y-1/2 ml-2 rtl:ml-0 rtl:mr-2 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-xs font-sans font-medium tracking-normal rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[80] whitespace-nowrap border border-white/10 shadow-xl translate-x-1 rtl:-translate-x-1 group-hover:translate-x-0">
              {t('owner.menu.getMobileApp')}
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all relative group"
          >
            <LogOut size={24} />
            <div className="absolute left-full rtl:left-auto rtl:right-full top-1/2 -translate-y-1/2 ml-2 rtl:ml-0 rtl:mr-2 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-xs font-sans font-medium tracking-normal rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[80] whitespace-nowrap border border-white/10 shadow-xl translate-x-1 rtl:-translate-x-1 group-hover:translate-x-0">
              {t('dashboard.menu.logout')}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarUserProfileFooter;
