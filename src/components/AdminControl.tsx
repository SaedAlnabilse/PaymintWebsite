import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Laptop,
  Bell,
  Menu,
  Search,
  AlertTriangle,
  Package,
  RotateCcw,
  Plus,
  LayoutGrid,
  Home,
  MapPin,
  Briefcase,
  KeyRound,
  AlertOctagon,
} from 'lucide-react';
import AppStoreBadge from '../assets/app-store-badge.svg';
import GooglePlayBadge from '../assets/google-play-badge.svg';
import { OWNER_ANDROID_DOWNLOAD_URL, OWNER_IOS_DOWNLOAD_URL } from '../config/downloads';
import { useTheme } from '../context/ThemeContext';

/** Brand tokens mirrored from mintcom-admin-portal notifications screen */
const G1 = '#7dc6a2';
const SHORTAGE = '#D55263';
const OVERAGE = '#F59E0B';
const WARNING = '#D0A62A';
const STOCK = '#4F46E5';

const SplitText = ({ text, className = '' }: { text: string; className?: string }) => {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => {
        const isMintcom = word.toLowerCase().includes('mintcom');
        return (
          <span
            key={i}
            className={
              isMintcom
                ? 'text-mintcom-green'
                : i % 2 === 0
                  ? 'text-gray-900 dark:text-white'
                  : 'text-mintcom-green'
            }
          >
            {word}{' '}
          </span>
        );
      })}
    </span>
  );
};

type MockAlert = {
  id: string;
  title: string;
  description: string;
  pill: string;
  location: string;
  time: string;
  tone: 'shortage' | 'overage' | 'critical' | 'stock' | 'refund';
  unread?: boolean;
};

const toneStyle = {
  shortage: { color: SHORTAGE, bg: '#D5526312', Icon: AlertTriangle },
  overage: { color: OVERAGE, bg: '#F59E0B12', Icon: Plus },
  critical: { color: SHORTAGE, bg: '#D5526312', Icon: AlertOctagon },
  stock: { color: STOCK, bg: '#4F46E512', Icon: Package },
  refund: { color: WARNING, bg: '#D0A62A12', Icon: RotateCcw },
} as const;

/**
 * Pixel-faithful recreation of AdminPortalAlertsView (owner scope, dark mode)
 * used inside the marketing phone frames.
 */
const NotificationsScreenMock = ({
  compact = false,
  activeTab = 'all',
  /** Extra top padding inside the green header for status bar / Dynamic Island */
  statusPad = 0,
}: {
  compact?: boolean;
  activeTab?: 'all' | 'cash' | 'stock' | 'refunds';
  statusPad?: number;
}) => {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  const BG = isDarkMode ? '#1F1D2B' : '#F8FAFC';
  const CARD = isDarkMode ? '#252836' : '#FFFFFF';
  const BORDER = isDarkMode ? '#3A3A4A' : '#E2E8F0';
  const TEXT = isDarkMode ? '#F8FAFC' : '#0F172A';
  const SUB = isDarkMode ? '#737182' : '#64748B';
  const SEARCH_BG = isDarkMode ? '#2D3039' : '#F1F5F9';
  const TAB_BG = isDarkMode ? 'rgba(0,0,0,0.25)' : '#F1F5F9';
  const FILTER_LABEL = isDarkMode ? '#7a9e93' : '#4d7c6e';
  const MARK_READ = isDarkMode ? G1 : '#3d8f68';

  const alerts: MockAlert[] = [
    {
      id: '1',
      title: t('landing.admin.mockup.shortageSara'),
      description: t('landing.admin.mockup.shortageDesc'),
      pill: t('landing.admin.mockup.shortagePill'),
      location: t('landing.admin.mockup.downtownCafe'),
      time: t('landing.admin.mockup.time12m'),
      tone: 'shortage',
      unread: true,
    },
    {
      id: '2',
      title: t('landing.admin.mockup.criticalStock'),
      description: t('landing.admin.mockup.criticalStockDesc'),
      pill: t('landing.admin.mockup.criticalStockPill'),
      location: t('landing.admin.mockup.downtownCafe'),
      time: t('landing.admin.mockup.time1h'),
      tone: 'critical',
      unread: true,
    },
    {
      id: '3',
      title: t('landing.admin.mockup.refundTitle'),
      description: t('landing.admin.mockup.refundDesc'),
      pill: t('landing.admin.mockup.refundPill'),
      location: t('landing.admin.mockup.mallBranch'),
      time: t('landing.admin.mockup.time2h'),
      tone: 'refund',
      unread: true,
    },
    {
      id: '4',
      title: t('landing.admin.mockup.lowStock'),
      description: t('landing.admin.mockup.lowStockDesc'),
      pill: t('landing.admin.mockup.lowStockPill'),
      location: t('landing.admin.mockup.downtownCafe'),
      time: t('landing.admin.mockup.time3h'),
      tone: 'stock',
      unread: false,
    },
    {
      id: '5',
      title: t('landing.admin.mockup.overageTitle'),
      description: t('landing.admin.mockup.overageDesc'),
      pill: t('landing.admin.mockup.overagePill'),
      location: t('landing.admin.mockup.mallBranch'),
      time: t('landing.admin.mockup.time4h'),
      tone: 'overage',
      unread: false,
    },
    {
      id: '6',
      title: t('landing.admin.mockup.overageNoor', 'Overage - Noor'),
      description: t('landing.admin.mockup.overageNoorDesc', 'Expected JOD 150.00 - Counted JOD 153.00'),
      pill: t('landing.admin.mockup.overageNoorPill', '+JOD 3.00'),
      location: t('landing.admin.mockup.airportBranch', 'Airport Branch'),
      time: t('landing.admin.mockup.time5h', '5h ago'),
      tone: 'overage',
      unread: false,
    },
    {
      id: '7',
      title: t('landing.admin.mockup.lowStockEspresso', 'Low stock'),
      description: t('landing.admin.mockup.lowStockEspressoDesc', 'Espresso beans have 2 kg remaining'),
      pill: t('landing.admin.mockup.lowStockEspressoPill', '2 kg left'),
      location: t('landing.admin.mockup.airportBranch', 'Airport Branch'),
      time: t('landing.admin.mockup.time6h', '6h ago'),
      tone: 'stock',
      unread: false,
    },
    {
      id: '8',
      title: t('landing.admin.mockup.lowStockChocolate', 'Low stock'),
      description: t('landing.admin.mockup.lowStockChocolateDesc', 'Chocolate syrup has 1 L remaining'),
      pill: t('landing.admin.mockup.lowStockChocolatePill', '1 L left'),
      location: t('landing.admin.mockup.downtownCafe'),
      time: t('landing.admin.mockup.time7h', '7h ago'),
      tone: 'stock',
      unread: false,
    },
  ];

  const visibleAlerts =
    activeTab === 'all'
      ? alerts
      : activeTab === 'cash'
        ? alerts.filter((a) => a.tone === 'shortage' || a.tone === 'overage')
        : activeTab === 'stock'
          ? alerts.filter((a) => a.tone === 'critical' || a.tone === 'stock')
          : alerts.filter((a) => a.tone === 'refund');

  const displayAlerts = compact ? visibleAlerts.slice(0, 3) : visibleAlerts.slice(0, 4);

  const tabs: { id: typeof activeTab; label: string; count: number }[] = [
    { id: 'all', label: t('landing.admin.mockup.tabAll'), count: 8 },
    { id: 'cash', label: t('landing.admin.mockup.tabCash'), count: 3 },
    { id: 'stock', label: t('landing.admin.mockup.tabStock'), count: 4 },
    { id: 'refunds', label: t('landing.admin.mockup.tabRefunds'), count: 1 },
  ];

  const stats = [
    { value: '1', label: t('landing.admin.mockup.shortages') },
    { value: '2', label: t('landing.admin.mockup.overages') },
    { value: '4', label: t('landing.admin.mockup.stockStat') },
    { value: '1', label: t('landing.admin.mockup.updates') },
  ];

  const navItems = [
    { icon: Home, label: t('landing.admin.mockup.navHome'), active: false },
    { icon: MapPin, label: t('landing.admin.mockup.navLocations'), active: false },
    { icon: Briefcase, label: t('landing.admin.mockup.navBrands'), active: false },
    { icon: KeyRound, label: t('landing.admin.mockup.navAccount'), active: false },
  ];

  return (
    <div
      className="w-full h-full flex flex-col relative z-10 transition-colors duration-300"
      style={{ backgroundColor: BG }}
    >
      {/* ── OwnerScreenHeader (single continuous green block) ── */}
      <div className="flex-shrink-0" style={{ backgroundColor: G1, paddingTop: statusPad }}>
        <div className="flex items-center justify-between px-3 h-11">
          <div className="w-8 h-8 flex items-center justify-center">
            <Menu size={compact ? 14 : 16} className="text-white" strokeWidth={2.25} />
          </div>
          <span className="text-white font-bold text-[13px] tracking-tight flex-1 text-center px-2">
            {t('landing.admin.mockup.notificationsTitle')}
          </span>
          <div className="w-8 h-8 flex items-center justify-center relative">
            <Bell size={compact ? 14 : 16} className="text-white" strokeWidth={2.25} />
            <span
              className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] font-black text-white border-[1.5px]"
              style={{ backgroundColor: SHORTAGE, borderColor: G1 }}
            >
              7
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* ── Stats panel (OwnerScreenHero pills) ── */}
        <div className="px-3 pt-2 mb-2">
          <div
            className="flex items-stretch rounded-xl border px-1 py-2.5 transition-colors duration-300"
            style={{ backgroundColor: CARD, borderColor: BORDER }}
          >
            {stats.map((s, i) => (
              <div key={s.label} className="flex flex-1 items-center">
                {i > 0 && (
                  <div className="w-px h-7 self-center opacity-80 transition-colors duration-300" style={{ backgroundColor: BORDER }} />
                )}
                <div className="flex-1 flex flex-col items-center justify-center px-0.5">
                  <span className="font-black text-[15px] leading-none tracking-tight transition-colors duration-300" style={{ color: TEXT }}>
                    {s.value}
                  </span>
                  <span
                    className="text-[7px] font-extrabold uppercase tracking-wider mt-1 leading-none text-center transition-colors duration-300"
                    style={{ color: SUB }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-3 flex flex-col gap-1.5 flex-1 min-h-0">
          {/* ── Search ── */}
          <div
            className="flex items-center gap-2 rounded-xl px-2.5 py-2 border transition-colors duration-300"
            style={{ backgroundColor: SEARCH_BG, borderColor: BORDER }}
          >
            <Search size={12} style={{ color: SUB }} className="transition-colors duration-300" />
            <span className="text-[10px] font-semibold transition-colors duration-300" style={{ color: SUB }}>
              {t('landing.admin.mockup.searchPlaceholder')}
            </span>
          </div>

          {/* ── Segmented tabs ── */}
          <div
            className="flex rounded-xl p-0.5 transition-colors duration-300"
            style={{ backgroundColor: TAB_BG }}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <div
                  key={tab.id}
                  className="flex-1 py-1.5 rounded-lg flex items-center justify-center"
                >
                  <span
                    className={`text-[8px] leading-none whitespace-nowrap transition-colors duration-300 ${isActive ? 'font-black' : 'font-bold'}`}
                    style={{ color: isActive ? MARK_READ : SUB }}
                  >
                    {tab.label} {tab.count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Location filter (owner multi-location feed) ── */}
          {!compact && (
            <>
              <span
                className="text-[8px] font-black uppercase tracking-widest mt-0.5 transition-colors duration-300"
                style={{ color: FILTER_LABEL }}
              >
                {t('landing.admin.mockup.filterByLocation')}
              </span>

              <div
                className="flex items-center justify-between rounded-xl px-2 py-1.5 border-[1.5px] transition-colors duration-300"
                style={{ backgroundColor: G1, borderColor: G1 }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <LayoutGrid size={12} className="text-white" />
                  </div>
                  <span className="text-[11px] font-black text-white">
                    {t('landing.admin.mockup.allLocations')}
                  </span>
                </div>
                <span
                  className="min-w-[20px] h-5 px-1.5 rounded-xl flex items-center justify-center text-[9px] font-black text-white"
                  style={{ backgroundColor: '#D0C962' }}
                >
                  7
                </span>
              </div>

              <div className="flex gap-1.5 overflow-hidden">
                {[
                  { letter: 'D', name: t('landing.admin.mockup.downtownCafe'), count: 4 },
                  { letter: 'M', name: t('landing.admin.mockup.mallBranch'), count: 2 },
                  { letter: 'A', name: t('landing.admin.mockup.airportBranch', 'Airport Branch'), count: 2 },
                ].map((loc) => (
                  <div
                    key={loc.letter}
                    className="flex items-center gap-1 rounded-xl border-[1.5px] px-1.5 py-1 shrink-0 transition-colors duration-300"
                    style={{ backgroundColor: CARD, borderColor: BORDER }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(125, 198, 162, 0.08)' }}
                    >
                      <span className="text-[8px] font-black transition-colors duration-300" style={{ color: MARK_READ }}>
                        {loc.letter}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[8px] font-black transition-colors duration-300" style={{ color: TEXT }}>
                        {loc.name}
                      </div>
                      <div className="text-[7px] font-bold transition-colors duration-300" style={{ color: SUB }}>
                        {loc.count} {t('landing.admin.mockup.alertsLabel')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Mark all read */}
          <div className="flex justify-end">
            <span className="text-[9px] font-black transition-colors duration-300" style={{ color: MARK_READ }}>
              {t('landing.admin.mockup.markAllRead')}
            </span>
          </div>

          {/* ── Day group ── */}
          <div className="flex items-center gap-2 px-0.5 mb-0.5">
            <span
              className="text-[8px] font-black uppercase tracking-[0.12em] transition-colors duration-300"
              style={{ color: SUB }}
            >
              {t('landing.admin.mockup.today')}
            </span>
            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: BORDER }} />
            <span className="text-[8px] font-bold transition-colors duration-300" style={{ color: SUB }}>
              {displayAlerts.length} {t('landing.admin.mockup.alertsLabel')}
            </span>
          </div>

          {/* ── Alert cards ── */}
          <div
            className="rounded-xl border overflow-hidden flex-1 min-h-0 transition-colors duration-300"
            style={{ backgroundColor: CARD, borderColor: BORDER }}
          >
            {displayAlerts.map((alert, index) => {
              const tone = toneStyle[alert.tone];
              const Icon = tone.Icon;
              const isLast = index === displayAlerts.length - 1;
              return (
                <div
                  key={alert.id}
                  className="relative flex gap-2.5 px-2.5 py-2.5 transition-colors duration-300"
                  style={{
                    borderBottom: isLast ? 'none' : `1px solid ${BORDER}`,
                  }}
                >
                  {alert.unread && (
                    <div
                      className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r"
                      style={{ backgroundColor: tone.color }}
                    />
                  )}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: tone.bg }}
                  >
                    <Icon size={14} style={{ color: tone.color }} strokeWidth={2.25} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5 mb-0.5">
                      <span
                        className="text-[10px] font-black leading-tight truncate transition-colors duration-300"
                        style={{ color: TEXT }}
                      >
                        {alert.title}
                      </span>
                      <span className="text-[8px] font-bold flex-shrink-0 mt-0.5 transition-colors duration-300" style={{ color: SUB }}>
                        {alert.time}
                      </span>
                    </div>
                    <p
                      className="text-[9px] font-semibold leading-snug mb-1.5 line-clamp-2 transition-colors duration-300"
                      style={{ color: SUB }}
                    >
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: tone.bg, color: tone.color }}
                      >
                        {alert.pill}
                      </span>
                      <span className="text-[8px] font-bold truncate transition-colors duration-300" style={{ color: FILTER_LABEL }}>
                        {alert.location}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── BottomNav (owner) ── */}
      <div
        className="flex-shrink-0 flex items-center justify-around border-t px-1 pt-1.5 pb-2.5 transition-colors duration-300"
        style={{ backgroundColor: BG, borderColor: BORDER }}
      >
        {navItems.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-0.5 flex-1">
            <item.icon
              size={compact ? 13 : 14}
              style={{ color: item.active ? MARK_READ : SUB }}
              strokeWidth={2.25}
              className="transition-colors duration-300"
            />
            <span
              className="text-[7px] font-bold leading-none transition-colors duration-300"
              style={{ color: item.active ? MARK_READ : SUB }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Premium iPhone chassis — Dynamic Island, continuous corners, home indicator,
 * metallic titanium edge, volume/power rails.
 */
const IPhoneFrame = ({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div className={className} style={style}>
    {/* Outer titanium shell */}
    <div
      className="relative w-full h-full rounded-[44px] p-[2px]"
      style={{
        background:
          'linear-gradient(145deg, #6b6b70 0%, #2a2a2e 18%, #8e8e93 38%, #1c1c1e 55%, #5a5a5f 78%, #3a3a3c 100%)',
        boxShadow:
          '0 30px 60px -12px rgba(0,0,0,0.65), 0 12px 24px -8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.22)',
      }}
    >
      {/* Inner black bezel */}
      <div
        className="relative w-full h-full rounded-[42px] p-[10px] overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #1a1a1c 0%, #0a0a0b 50%, #111113 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        {/* Side rails — volume (left) */}
        <div
          className="absolute -left-[3px] top-[18%] w-[3px] h-[22px] rounded-l-sm z-40"
          style={{
            background: 'linear-gradient(90deg, #4a4a4e, #2c2c2e)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        />
        <div
          className="absolute -left-[3px] top-[26%] w-[3px] h-[36px] rounded-l-sm z-40"
          style={{
            background: 'linear-gradient(90deg, #4a4a4e, #2c2c2e)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        />
        <div
          className="absolute -left-[3px] top-[36%] w-[3px] h-[36px] rounded-l-sm z-40"
          style={{
            background: 'linear-gradient(90deg, #4a4a4e, #2c2c2e)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        />
        {/* Power button (right) */}
        <div
          className="absolute -right-[3px] top-[28%] w-[3px] h-[56px] rounded-r-sm z-40"
          style={{
            background: 'linear-gradient(270deg, #4a4a4e, #2c2c2e)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        />

        {/* Screen glass — continuous green top via app header + absolute chrome overlays */}
        <div
          className="relative w-full h-full rounded-[32px] overflow-hidden"
          style={{ background: '#1f1d2b' }}
        >
          <div className="absolute inset-0 pb-5 overflow-hidden flex flex-col">
            {/* Status icons only — no separate green strip (avoids seam line) */}
            <div className="absolute top-0 inset-x-0 h-[28px] z-30 pointer-events-none flex items-end justify-between px-5 pb-0.5">
              <span className="text-[10px] font-semibold text-white tracking-tight">9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex items-end gap-[1.5px] h-2.5">
                  {[3, 5, 7, 9].map((h) => (
                    <div
                      key={h}
                      className="w-[2.5px] rounded-[0.5px] bg-white"
                      style={{ height: h }}
                    />
                  ))}
                </div>
                <svg width="14" height="10" viewBox="0 0 14 10" className="ml-0.5">
                  <path
                    d="M1 6.5c1.8-2 4.2-3 6.5-3s4.7 1 6.5 3"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3.2 8c1.2-1.2 2.6-1.8 4.3-1.8S10.6 6.8 11.8 8"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <circle cx="7.5" cy="9" r="0.9" fill="white" />
                </svg>
                <div className="ml-0.5 w-[18px] h-[9px] rounded-[2.5px] border border-white relative">
                  <div className="absolute inset-[1.5px] right-[3px] rounded-[1px] bg-white" />
                  <div className="absolute -right-[2.5px] top-1/2 -translate-y-1/2 w-[1.5px] h-[4px] rounded-r-sm bg-white/70" />
                </div>
              </div>
            </div>

            {/* Dynamic Island */}
            <div
              className="absolute left-1/2 top-[7px] -translate-x-1/2 h-[22px] w-[90px] rounded-full flex items-center justify-end pr-2.5 z-40 pointer-events-none"
              style={{ background: '#000' }}
            >
              <div
                className="w-[10px] h-[10px] rounded-full relative"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #1a2744 0%, #0a0f1a 55%, #000 100%)',
                }}
              >
                <div className="absolute top-[2px] left-[2px] w-[2.5px] h-[2.5px] rounded-full bg-white/25" />
              </div>
            </div>

            {/* App content fills from top — green header includes status pad */}
            <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 w-[100px] h-[4px] rounded-full bg-white/35" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Premium Android chassis — center punch-hole, flatter corners, graphite frame,
 * side fingerprint power button, taller aspect feel.
 */
const AndroidFrame = ({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div className={className} style={style}>
    {/* Outer graphite shell — slightly squarer than iPhone */}
    <div
      className="relative w-full h-full rounded-[36px] p-[2.5px]"
      style={{
        background:
          'linear-gradient(160deg, #5c5c62 0%, #232326 22%, #707078 42%, #141416 60%, #3e3e44 82%, #1a1a1c 100%)',
        boxShadow:
          '0 36px 70px -14px rgba(0,0,0,0.7), 0 14px 28px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
    >
      {/* Accent rim */}
      <div
        className="relative w-full h-full rounded-[34px] p-[9px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #121214 0%, #070708 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Left rails — volume */}
        <div
          className="absolute -left-[3.5px] top-[22%] w-[3.5px] h-[42px] rounded-l-[2px] z-40"
          style={{
            background: 'linear-gradient(90deg, #55555a, #2a2a2c)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
        />
        {/* Right — power + fingerprint pill */}
        <div
          className="absolute -right-[3.5px] top-[24%] w-[3.5px] h-[28px] rounded-r-[2px] z-40"
          style={{
            background: 'linear-gradient(270deg, #55555a, #2a2a2c)',
          }}
        />
        <div
          className="absolute -right-[4px] top-[36%] w-[4px] h-[48px] rounded-r-[3px] z-40"
          style={{
            background: 'linear-gradient(270deg, #6a6a70, #2e2e32 40%, #4a4a4e)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        />

        {/* Screen — no separate green strip (avoids seam line under header) */}
        <div
          className="relative w-full h-full rounded-[26px] overflow-hidden"
          style={{ background: '#1f1d2b' }}
        >
          <div className="absolute inset-0 overflow-hidden flex flex-col">
            {/* Status icons + punch-hole overlay on app green header */}
            <div className="absolute top-0 inset-x-0 h-[24px] z-30 pointer-events-none flex items-center justify-between px-4">
              <span className="text-[10px] font-medium text-white">9:41</span>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
                <div
                  className="w-[13px] h-[13px] rounded-full flex items-center justify-center"
                  style={{ background: '#000' }}
                >
                  <div
                    className="w-[7px] h-[7px] rounded-full relative"
                    style={{
                      background:
                        'radial-gradient(circle at 32% 32%, #1e3a5f 0%, #0b1220 50%, #000 100%)',
                    }}
                  >
                    <div className="absolute top-[1px] left-[1px] w-[2px] h-[2px] rounded-full bg-sky-300/35" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="12" height="10" viewBox="0 0 12 10">
                  <rect x="0" y="6" width="2" height="4" rx="0.4" fill="white" />
                  <rect x="3.2" y="4" width="2" height="6" rx="0.4" fill="white" />
                  <rect x="6.4" y="2" width="2" height="8" rx="0.4" fill="white" />
                  <rect x="9.6" y="0" width="2" height="10" rx="0.4" fill="white" opacity="0.45" />
                </svg>
                <svg width="14" height="10" viewBox="0 0 14 10">
                  <path
                    d="M7 2.2c1.6 0 3 .6 4.1 1.6l1.1-1.2C10.7.9 9 .2 7 .2S3.3.9 1.8 2.6L2.9 3.8C4 2.8 5.4 2.2 7 2.2z"
                    fill="white"
                  />
                  <path
                    d="M7 5c.9 0 1.7.3 2.3.9l1.1-1.2A4.8 4.8 0 007 3.4c-1.3 0-2.5.5-3.4 1.3L4.7 5.9A3.3 3.3 0 017 5z"
                    fill="white"
                  />
                  <circle cx="7" cy="8.2" r="1.2" fill="white" />
                </svg>
                <div className="w-[18px] h-[9px] rounded-[2px] border border-white relative overflow-hidden">
                  <div
                    className="absolute inset-[1.5px] rounded-[1px]"
                    style={{
                      width: '70%',
                      background: 'linear-gradient(90deg, #fff, #e8e8e8)',
                    }}
                  />
                  <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[1.5px] h-[3.5px] bg-white/70 rounded-r-sm" />
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const AdminControl = () => {
  const { t } = useTranslation();
  const hasOwnerAndroidDownload = Boolean(OWNER_ANDROID_DOWNLOAD_URL);
  const hasOwnerIosDownload = Boolean(OWNER_IOS_DOWNLOAD_URL);

  const [isInView, setIsInView] = useState(false);
  const [activePhone, setActivePhone] = useState<'iphone' | 'android'>('iphone');

  useEffect(() => {
    if (isInView) {
      const interval = setInterval(() => {
        setActivePhone((curr) => (curr === 'iphone' ? 'android' : 'iphone'));
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setActivePhone('iphone');
    }
  }, [isInView]);

  return (
    <section
      id="admin"
      className="py-16 lg:py-20 bg-white dark:bg-[#0f0f0f] overflow-x-clip relative"
      dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-6 md:px-10 lg:px-16 max-w-[1280px]">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            onViewportEnter={() => setIsInView(true)}
            onViewportLeave={() => {
              setIsInView(false);
              setActivePhone('iphone');
            }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative flex justify-center items-start pt-8 sm:pt-4 lg:pt-0 lg:items-center h-[440px] sm:h-[540px] lg:h-[620px] lg:justify-start select-none"
          >
            {/* Back — Android (Stock notifications) */}
            <motion.div
              style={{
                originY: 0,
              }}
              animate={{
                x: "-50%",
                rotate: activePhone === 'android' ? 0 : 5,
                scale: activePhone === 'android' ? 0.95 : 0.85,
                opacity: activePhone === 'android' ? 1 : 0,
                zIndex: activePhone === 'android' ? 20 : 10,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute top-2 sm:top-0 left-1/2 w-[230px] h-[470px] sm:w-[290px] sm:h-[590px] lg:w-[310px] lg:h-[640px] origin-top"
            >
              <AndroidFrame className="w-full h-full">
                <NotificationsScreenMock activeTab="stock" statusPad={22} />
              </AndroidFrame>
            </motion.div>

            {/* Front — iPhone (All notifications, full fidelity) */}
            <motion.div
              style={{
                originY: 0,
              }}
              animate={{
                x: "-50%",
                rotate: activePhone === 'iphone' ? 0 : -5,
                scale: activePhone === 'iphone' ? 0.95 : 0.85,
                opacity: activePhone === 'iphone' ? 1 : 0,
                zIndex: activePhone === 'iphone' ? 20 : 10,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute top-2 sm:top-0 left-1/2 w-[230px] h-[470px] sm:w-[290px] sm:h-[590px] lg:w-[310px] lg:h-[640px] z-20 origin-top"
            >
              <IPhoneFrame className="w-full h-full">
                <NotificationsScreenMock activeTab="all" statusPad={28} />
              </IPhoneFrame>
            </motion.div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] lg:w-[500px] lg:h-[500px] border border-mintcom-green/20 rounded-full -z-10 animate-[spin_20s_linear_infinite]" />
          </motion.div>

          {/* Right Side: Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[12px] bg-mintcom-green/5 dark:bg-mintcom-green/10 text-mintcom-green font-bold text-xs mb-8 border border-mintcom-green/20 backdrop-blur-md shadow-[0_0_15px_rgba(124,195,159,0.05)] hover:border-mintcom-green/40 transition-all duration-300"
            >
              <div className="relative flex items-center justify-center w-5 h-5 rounded-[6px] bg-mintcom-green/20 text-mintcom-green overflow-hidden">
                <Laptop size={11} className="relative z-10" />
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-mintcom-green/30"
                />
              </div>
              <span className="tracking-widest uppercase text-[10px] md:text-[11px] leading-none">
                {t('landing.admin.badge')}
              </span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold font-magilio mb-6 leading-tight tracking-tight">
              <span className="block leading-[1.1] rtl:leading-[1.2]">
                <SplitText text={t('landing.admin.title1')} />
              </span>
              <span className="block leading-[1.1] rtl:leading-[1.2]">
                <SplitText text={t('landing.admin.title2')} />
              </span>
              <span className="block leading-[1.1] rtl:leading-[1.2]">
                {(() => {
                  const words = t('landing.admin.title3').split(' ');
                  return words.map((word, i) => (
                    <span
                      key={i}
                      className={i === 0 ? 'text-gray-900 dark:text-white' : 'text-mintcom-green'}
                    >
                      {word}
                      {i < words.length - 1 ? ' ' : ''}
                    </span>
                  ));
                })()}
              </span>
            </h2>

            <p className="mb-10 max-w-2xl text-base font-light leading-relaxed text-gray-600 dark:text-gray-400 xs:text-lg sm:text-xl">
              {t('landing.admin.description')}
            </p>

            <ul className="space-y-4 font-medium">
              {[
                { label: t('landing.admin.shiftAlerts'), icon: Bell },
                { label: t('landing.admin.stockAlerts'), icon: Package },
                { label: t('landing.admin.liveReports'), icon: AlertTriangle },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-gray-700 dark:text-gray-300 group">
                  <div className="w-10 h-10 rounded-xl bg-mintcom-green/10 border border-mintcom-green/20 flex items-center justify-center transition-all duration-300 group-hover:bg-mintcom-green/20 group-hover:scale-110 flex-shrink-0">
                    <item.icon size={18} className="text-mintcom-green" />
                  </div>
                  <span className="text-lg tracking-tight">{item.label}</span>
                </li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 sm:mt-10 flex flex-col items-center sm:items-start gap-3 w-fit mx-auto sm:mx-0"
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {t('landing.admin.installBackofficeApp')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {hasOwnerIosDownload ? (
                  <a
                    href={OWNER_IOS_DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('landing.admin.downloadOnAppStore')}
                    className="block transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-mintcom-green/60 rounded-[11px]"
                  >
                    <img
                      src={AppStoreBadge}
                      alt={t('landing.admin.downloadOnAppStore')}
                      className="block h-[52px] w-auto object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-label={t(
                      'landing.cloudControl.scope.preview.ownerIosDownloadComingSoon',
                      'Owner iOS app download coming soon',
                    )}
                    className="block opacity-50 cursor-not-allowed rounded-[11px]"
                  >
                    <img
                      src={AppStoreBadge}
                      alt={t('landing.admin.downloadOnAppStore')}
                      className="block h-[52px] w-auto object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                )}
                {hasOwnerAndroidDownload ? (
                  <a
                    href={OWNER_ANDROID_DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('landing.admin.getItOnGooglePlay')}
                    className="block transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-mintcom-green/60 rounded-[11px]"
                  >
                    <img
                      src={GooglePlayBadge}
                      alt={t('landing.admin.getItOnGooglePlay')}
                      className="block h-[52px] w-auto object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-label={t(
                      'landing.cloudControl.scope.preview.ownerAndroidDownloadComingSoon',
                      'Owner Android app download coming soon',
                    )}
                    className="block opacity-50 cursor-not-allowed rounded-[11px]"
                  >
                    <img
                      src={GooglePlayBadge}
                      alt={t('landing.admin.getItOnGooglePlay')}
                      className="block h-[52px] w-auto object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
