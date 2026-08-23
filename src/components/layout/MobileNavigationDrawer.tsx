import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, LogOut, type LucideIcon } from 'lucide-react';
import { SidebarPreferencesHelpMenu } from './SidebarPreferencesHelpMenu';
import MintcomLogoGreen from '../../assets/green-full-logo.svg';
import MintcomLogoWhite from '../../assets/white-green-full-logo.svg';
import type { Account } from '../../types';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

export interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  account: Account | null;
  scope: 'owner' | 'brand';
  onLogout: () => void;
}

export const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
  isOpen,
  onClose,
  menuItems,
  account,
  scope,
  onLogout,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 w-[280px] bg-white dark:bg-[#1E293B] border-r rtl:border-r-0 rtl:border-l border-gray-200 dark:border-white/5 z-[100] flex flex-col lg:hidden"
        >
          {/* Mobile Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center">
              <img
                src={MintcomLogoGreen}
                alt={t('brand.name')}
                width={120}
                height={30}
                className="h-8 w-auto object-contain dark:hidden"
              />
              <img
                src={MintcomLogoWhite}
                alt={t('brand.name')}
                width={120}
                height={30}
                className="h-8 w-auto object-contain hidden dark:block"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/owner' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 p-3.5 rounded-xl transition-all
                    ${
                      isActive
                        ? 'bg-mintcom-green text-black font-semibold shadow-lg shadow-mintcom-green/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                    }
                  `}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm font-semibold tracking-normal">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-white/5">
            <div className="mb-3">
              <SidebarPreferencesHelpMenu onOpenHelpCenter={() => navigate('/support')} />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mintcom-green to-emerald-600 flex items-center justify-center">
                <span className="text-black font-bold">
                  {account?.firstName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{account?.firstName}</p>
                <p className="text-xs text-gray-500">
                  {scope === 'owner' ? t('owner.menu.enterpriseOwner') : t('brand.menu.brandAdmin')}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default MobileNavigationDrawer;
