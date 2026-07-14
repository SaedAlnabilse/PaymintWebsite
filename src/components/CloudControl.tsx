import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  type Variants,
} from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Cloud,
  Crown,
  Tags,
  Building2,
  ShoppingCart,
  Users,
  BarChart2,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  LayoutDashboard,
  Store,
  Shield,
  CreditCard,
  KeyRound,
  DollarSign,
  Wallet,
  Calendar,
  Menu,
  Bell,
  PlayCircle,
  RefreshCw,
  Download,
  Home,
  Package,
  ShoppingBag,
  Activity,
  CornerDownLeft,
  ChevronDown,
} from 'lucide-react';
import AppStoreBadge from '../assets/app-store-badge.svg';
import GooglePlayBadge from '../assets/google-play-badge.svg';
import MintcomLeafIcon from '../assets/small-logo.svg';
import MintcomLogoWhite from '../assets/white-green-full-logo.svg';
import MintcomLogoDark from '../assets/green-full-logo.svg';
import { OWNER_ANDROID_DOWNLOAD_URL, OWNER_IOS_DOWNLOAD_URL } from '../config/downloads';
import { useTheme } from '../context/ThemeContext';

type ScopeId = 'owner' | 'brand' | 'location';

type ScopeDashboard = {
  icon: typeof Crown;
  title: string;
  description: string;
  scope: ScopeId;
  scopeLabel: string;
  highlights: string[];
};

const scopeSlideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction * 72,
    opacity: 0,
    scale: 0.96,
    filter: 'blur(6px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    x: direction * -72,
    opacity: 0,
    scale: 0.96,
    filter: 'blur(6px)',
    transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
  }),
};

const SplitText = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => {
        const isMintcom = word.toLowerCase().includes('mintcom');
        return (
          <span
            key={i}
            className={isMintcom ? 'text-mintcom-green' : (i % 2 === 0 ? 'text-gray-900 dark:text-white' : 'text-mintcom-green')}
          >
            {word}{' '}
          </span>
        );
      })}
    </span>
  );
};


// ---------------------------------------------------------------------------
// Live scope previews — fill their frame (no CSS scale). size: lg for modal.
// ---------------------------------------------------------------------------

type PreviewSize = 'sm' | 'lg';

const Chrome = ({
  url,
  label,
  size = 'sm',
}: {
  url: string;
  label: string;
  size?: PreviewSize;
}) => (
  <div
    className={`flex shrink-0 items-center gap-1.5 border-b border-gray-200/90 bg-gradient-to-b from-gray-50 to-gray-100/90 dark:border-white/[0.08] dark:from-[#222226] dark:to-[#1a1a1e] ${
      size === 'lg' ? 'h-8 px-2.5' : 'h-[15px] px-1.5'
    }`}
  >
    <span className={`rounded-full bg-red-400/90 ${size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5'}`} />
    <span className={`rounded-full bg-amber-400/90 ${size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5'}`} />
    <span className={`rounded-full bg-mintcom-green ${size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5'}`} />
    <div
      className={`ms-auto max-w-[75%] truncate rounded-md bg-white font-mono leading-none text-gray-500 shadow-sm dark:bg-black/50 dark:text-gray-400 ${
        size === 'lg' ? 'px-2 py-1 text-[10px]' : 'px-1.5 py-px text-[7px]'
      }`}
    >
      <span className="text-mintcom-green">●</span> {url}
    </div>
    <span className="sr-only">{label}</span>
  </div>
);

const PreviewShell = ({
  children,
  url,
  label,
  size = 'sm',
}: {
  children: ReactNode;
  url: string;
  label: string;
  size?: PreviewSize;
}) => (
  <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[inherit] bg-white dark:bg-[#141416] select-none">
    <Chrome url={url} label={label} size={size} />
    <div
      className={`flex min-h-0 flex-1 flex-col ${
        size === 'lg' ? 'gap-2.5 p-3' : 'gap-1 p-1.5'
      }`}
    >
      {children}
    </div>
  </div>
);

// Owner — total revenue + per-brand breakdown + mini spark bars
const OwnerScopePreview = ({ t, size = 'sm' }: { t: any; size?: PreviewSize }) => {
  const lg = size === 'lg';
  const brands = [
    { name: t('landing.cloudControl.scope.preview.brandA', 'Cafe Delight'), val: 58420, change: 12.4, locs: 6, bar: 92 },
    { name: t('landing.cloudControl.scope.preview.brandB', 'Urban Eats'), val: 42180, change: 8.1, locs: 4, bar: 68 },
    { name: t('landing.cloudControl.scope.preview.brandC', 'Pizza Yard'), val: 47650, change: 4.6, locs: 3, bar: 76 },
  ];
  const total = brands.reduce((s, b) => s + b.val, 0);

  return (
    <PreviewShell
      url="dashboard.mintcom.app/owner"
      label={t('landing.cloudControl.scope.preview.owner', 'Owner')}
      size={size}
    >
      <div className={`flex min-h-0 flex-1 gap-2 ${lg ? 'gap-3' : 'gap-1.5'}`}>
        <div
          className={`flex shrink-0 flex-col justify-center rounded-xl border border-mintcom-green/30 bg-gradient-to-br from-mintcom-green/20 to-mintcom-green/5 ${
            lg ? 'w-[38%] p-3' : 'w-[42%] rounded-md px-1.5 py-1'
          }`}
        >
          <p className={`font-bold uppercase tracking-wider text-gray-500 ${lg ? 'text-[10px]' : 'text-[7px]'}`}>
            {t('landing.cloudControl.scope.preview.totalRevenue', 'Total revenue')}
          </p>
          <p className={`mt-0.5 font-mono font-black tabular-nums text-gray-900 dark:text-white ${lg ? 'text-2xl' : 'text-[12px]'}`}>
            ${(total / 1000).toFixed(1)}K
          </p>
          <div className={`mt-1 flex items-center gap-1 font-bold text-mintcom-green ${lg ? 'text-xs' : 'text-[7px]'}`}>
            <TrendingUp size={lg ? 12 : 6} /> +9.2%
          </div>
          <span
            className={`mt-1.5 self-start rounded-md bg-mintcom-green/20 font-bold uppercase tracking-wider text-mintcom-green ${
              lg ? 'px-2 py-0.5 text-[9px]' : 'px-1 py-px text-[6px]'
            }`}
          >
            {t('landing.cloudControl.scope.preview.billingActive', 'Billing · Active')}
          </span>
        </div>

        <div className={`flex min-w-0 flex-1 flex-col ${lg ? 'gap-2' : 'gap-[3px]'}`}>
          {brands.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.08 }}
              className={`flex min-h-0 flex-1 flex-col justify-center rounded-xl border border-gray-200/90 bg-gray-50/90 dark:border-white/[0.08] dark:bg-white/[0.04] ${
                lg ? 'px-2.5 py-1.5' : 'rounded-md px-1 py-[2px]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex min-w-0 items-center gap-1">
                  <Tags size={lg ? 11 : 6} className="shrink-0 text-mintcom-green" />
                  <span className={`truncate font-bold text-gray-800 dark:text-gray-100 ${lg ? 'text-xs' : 'text-[7px]'}`}>
                    {b.name}
                  </span>
                  <span className={`shrink-0 font-mono text-gray-400 ${lg ? 'text-[10px]' : 'text-[6px]'}`}>
                    ·{b.locs}
                  </span>
                </div>
                <span className={`shrink-0 font-mono font-bold text-mintcom-green ${lg ? 'text-xs' : 'text-[7px]'}`}>
                  +{b.change}%
                </span>
              </div>
              {lg && (
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${b.bar}%` }}
                    transition={{ delay: 0.25 + i * 0.1, duration: 0.55 }}
                    className="h-full rounded-full bg-gradient-to-r from-mintcom-green to-emerald-400"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
};

// Brand — locations + roles
const BrandScopePreview = ({ t, size = 'sm' }: { t: any; size?: PreviewSize }) => {
  const lg = size === 'lg';
  const locations = [
    { name: t('landing.cloudControl.scope.preview.locDowntown', 'Downtown'), online: true, orders: 48 },
    { name: t('landing.cloudControl.scope.preview.locMall', 'Mall'), online: true, orders: 36 },
    { name: t('landing.cloudControl.scope.preview.locAirport', 'Airport'), online: true, orders: 29 },
    { name: t('landing.cloudControl.scope.preview.locWest', 'West Side'), online: false, orders: 0 },
  ];
  const roles = [
    { pct: 18, name: t('landing.cloudControl.scope.preview.roleManager', 'Manager'), color: 'bg-mintcom-green' },
    { pct: 38, name: t('landing.cloudControl.scope.preview.roleCashier', 'Cashier'), color: 'bg-emerald-400' },
    { pct: 28, name: t('landing.cloudControl.scope.preview.roleBarista', 'Barista'), color: 'bg-mintcom-green/60' },
    { pct: 16, name: t('landing.cloudControl.scope.preview.roleStaff', 'Staff'), color: 'bg-mintcom-green/35' },
  ];

  return (
    <PreviewShell
      url="dashboard.mintcom.app/brand"
      label={t('landing.cloudControl.scope.preview.brand', 'Brand')}
      size={size}
    >
      {/* Brand header */}
      <div className={`flex items-center justify-between gap-2 ${lg ? '' : ''}`}>
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`flex shrink-0 items-center justify-center rounded-lg bg-mintcom-green ${
              lg ? 'h-8 w-8' : 'h-3 w-3 rounded-sm'
            }`}
          >
            <Tags size={lg ? 14 : 6} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className={`truncate font-bold text-gray-900 dark:text-white ${lg ? 'text-sm' : 'text-[8px]'}`}>
              {t('landing.cloudControl.scope.preview.brandA', 'Cafe Delight')}
            </p>
            {lg && (
              <p className="text-[10px] font-medium text-gray-400">
                {t('landing.cloudControl.scope.preview.brandSub', '4 locations · multi-site brand')}
              </p>
            )}
          </div>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 font-mono font-bold uppercase tracking-wider text-mintcom-green ${
            lg ? 'rounded-full bg-mintcom-green/15 px-2 py-1 text-[10px]' : 'text-[6px]'
          }`}
        >
          <span className={`rounded-full bg-mintcom-green ${lg ? 'h-1.5 w-1.5 animate-pulse' : 'h-1 w-1 animate-pulse'}`} />
          3/4
        </span>
      </div>

      {/* Locations */}
      <div className={`grid min-h-0 flex-1 grid-cols-2 ${lg ? 'gap-2' : 'gap-[3px]'}`}>
        {locations.map((l, i) => (
          <motion.div
            key={l.name}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className={`flex flex-col justify-center rounded-xl border border-gray-200/90 bg-gray-50/90 dark:border-white/[0.08] dark:bg-white/[0.04] ${
              lg ? 'px-2.5 py-2' : 'rounded-md px-1 py-[2px]'
            } ${!l.online ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`shrink-0 rounded-full ${l.online ? 'bg-mintcom-green' : 'bg-gray-400'} ${
                  lg ? 'h-2 w-2' : 'h-1 w-1'
                }`}
              />
              <Building2 size={lg ? 12 : 6} className="shrink-0 text-gray-400" />
              <span className={`truncate font-bold text-gray-800 dark:text-gray-100 ${lg ? 'text-xs' : 'text-[7px]'}`}>
                {l.name}
              </span>
            </div>
            {lg && (
              <p className="mt-1 ps-3.5 text-[10px] font-medium text-gray-400">
                {l.online
                  ? `${l.orders} ${t('landing.cloudControl.scope.preview.ordersToday', 'orders today')}`
                  : t('landing.cloudControl.scope.preview.offline', 'Offline')}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Roles bar */}
      <div className="shrink-0">
        <div className={`mb-1 flex items-center gap-1 font-bold uppercase tracking-wider text-gray-500 ${lg ? 'text-[10px]' : 'text-[6px]'}`}>
          <Users size={lg ? 11 : 6} />
          {t('landing.cloudControl.scope.preview.rolesAcrossLocations', 'Roles across locations')}
        </div>
        <div className={`flex overflow-hidden rounded-full bg-gray-200 dark:bg-white/10 ${lg ? 'h-2.5' : 'h-1.5'}`}>
          {roles.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ width: 0 }}
              animate={{ width: `${r.pct}%` }}
              transition={{ delay: 0.25 + i * 0.08, duration: 0.5 }}
              title={`${r.name} ${r.pct}%`}
              className={`${r.color} first:rounded-s-full last:rounded-e-full`}
            />
          ))}
        </div>
        {lg && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            {roles.map((r) => (
              <span key={r.name} className="text-[9px] font-semibold text-gray-500 dark:text-gray-400">
                <span className={`me-1 inline-block h-1.5 w-1.5 rounded-full ${r.color}`} />
                {r.name} {r.pct}%
              </span>
            ))}
          </div>
        )}
      </div>
    </PreviewShell>
  );
};

// Location — KPIs + live orders
const LocationScopePreview = ({ t, size = 'sm' }: { t: any; size?: PreviewSize }) => {
  const lg = size === 'lg';
  const kpis = [
    { label: t('landing.cloudControl.scope.preview.orders', 'Orders'), val: '142' },
    { label: t('landing.cloudControl.scope.preview.revenue', 'Revenue'), val: lg ? '2.4K' : '2.4K USD' },
    { label: t('landing.cloudControl.scope.preview.aov', 'AOV'), val: lg ? '$16.9' : '16.9 USD' },
  ];
  const orders = [
    { id: '#4218', amt: '24.50', method: t('landing.cloudControl.scope.preview.methodCard', 'Card') },
    { id: '#4217', amt: '8.75', method: t('landing.cloudControl.scope.preview.methodCash', 'Cash') },
    { id: '#4216', amt: '32.00', method: t('landing.cloudControl.scope.preview.methodMobile', 'Mobile') },
    ...(lg
      ? [{ id: '#4215', amt: '11.25', method: t('landing.cloudControl.scope.preview.methodCard', 'Card') }]
      : []),
  ];

  return (
    <PreviewShell
      url="dashboard.mintcom.app/location"
      label={t('landing.cloudControl.scope.preview.location', 'Location')}
      size={size}
    >
      <div className={`grid grid-cols-3 ${lg ? 'gap-2' : 'gap-1'}`}>
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06 }}
            className={`flex flex-col rounded-xl border border-mintcom-green/25 bg-gradient-to-br from-mintcom-green/15 to-transparent ${
              lg ? 'px-2.5 py-2' : 'rounded-md px-1 py-[2px]'
            }`}
          >
            <span className={`font-bold uppercase tracking-wider text-gray-500 ${lg ? 'text-[9px]' : 'text-[6px]'}`}>
              {k.label}
            </span>
            <span className={`mt-0.5 font-mono font-black text-mintcom-green ${lg ? 'text-base' : 'text-[9px]'}`}>
              {k.val}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className={`mb-1 flex items-center gap-1.5 font-bold uppercase tracking-wider text-gray-500 ${lg ? 'text-[10px]' : 'text-[6px]'}`}>
          <span className={`rounded-full bg-mintcom-green ${lg ? 'h-1.5 w-1.5 animate-pulse' : 'h-1 w-1 animate-pulse'}`} />
          {t('landing.cloudControl.scope.preview.liveOrders', 'Live orders')}
        </div>
        <div className={`flex min-h-0 flex-1 flex-col ${lg ? 'gap-1.5' : 'gap-[2px]'}`}>
          {orders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + i * 0.07 }}
              className={`flex items-center justify-between rounded-xl border border-gray-200/90 bg-gray-50/90 dark:border-white/[0.08] dark:bg-white/[0.04] ${
                lg ? 'px-2.5 py-2' : 'rounded-md px-1 py-[2px]'
              }`}
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <ShoppingCart size={lg ? 12 : 6} className="shrink-0 text-mintcom-green" />
                <span className={`font-mono text-gray-600 dark:text-gray-300 ${lg ? 'text-xs' : 'text-[7px]'}`}>
                  {o.id}
                </span>
                <span
                  className={`rounded-md bg-gray-200/80 font-bold uppercase tracking-wide text-gray-500 dark:bg-white/10 dark:text-gray-400 ${
                    lg ? 'px-1.5 py-0.5 text-[9px]' : 'text-[6px]'
                  }`}
                >
                  {o.method}
                </span>
              </div>
              <span className={`shrink-0 font-mono font-bold text-gray-900 dark:text-white ${lg ? 'text-xs' : 'text-[7px]'}`}>
                {o.amt} {lg ? 'USD' : 'USD'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
};

const ScopePreview = ({
  scope,
  t,
  size = 'sm',
}: {
  scope: ScopeId;
  t: any;
  size?: PreviewSize;
}) => {
  if (scope === 'owner') return <OwnerScopePreview t={t} size={size} />;
  if (scope === 'brand') return <BrandScopePreview t={t} size={size} />;
  return <LocationScopePreview t={t} size={size} />;
};

const SCOPE_META: Record<
  ScopeId,
  { teaser: string; kpis: { label: string; value: string }[]; motif: string }
> = {
  owner: {
    teaser: 'Portfolio · all brands',
    kpis: [
      { label: 'Rev', value: '$148K' },
      { label: 'Brands', value: '3' },
      { label: 'Δ', value: '+9%' },
    ],
    motif: 'from-emerald-400/20 via-mintcom-green/10 to-transparent',
  },
  brand: {
    teaser: 'One brand · many sites',
    kpis: [
      { label: 'Sites', value: '4' },
      { label: 'Live', value: '3/4' },
      { label: 'Roles', value: '12' },
    ],
    motif: 'from-teal-400/20 via-cyan-400/5 to-transparent',
  },
  location: {
    teaser: 'Today on the floor',
    kpis: [
      { label: 'Orders', value: '142' },
      { label: 'AOV', value: '$17' },
      { label: 'Live', value: '●' },
    ],
    motif: 'from-lime-300/20 via-mintcom-green/10 to-transparent',
  },
};

/** Calm text card — click opens modal. Minimal motion. */
const DashboardCard = ({
  dashboard,
  index,
  t,
  onOpen,
}: {
  dashboard: ScopeDashboard;
  index: number;
  t: (...args: any[]) => any;
  onOpen: (index: number) => void;
}) => {
  const Icon = dashboard.icon;
  const rank = dashboard.scope === 'owner' ? 3 : dashboard.scope === 'brand' ? 2 : 1;
  const meta = SCOPE_META[dashboard.scope];

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-start shadow-lg shadow-gray-200/30 transition-colors duration-300 hover:border-mintcom-green/40 hover:shadow-xl hover:shadow-mintcom-green/10 dark:border-white/5 dark:bg-[#121212] dark:shadow-none dark:hover:border-mintcom-green/30"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.motif} opacity-40`}
      />

      <div className="absolute end-4 top-4 z-10 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < rank ? 'bg-mintcom-green' : 'bg-gray-300 dark:bg-white/15'
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 mb-4 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mintcom-green/10 transition-colors duration-300 group-hover:bg-mintcom-green dark:bg-mintcom-green/15">
          <Icon
            size={22}
            className="text-mintcom-green transition-colors duration-300 group-hover:text-white"
          />
        </div>
        <div className="min-w-0 flex-1 pe-8 pt-0.5">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            {dashboard.scopeLabel}
          </p>
          <h3 className="font-barlow text-base font-bold leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-mintcom-green dark:text-white sm:text-lg">
            {dashboard.title}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-mintcom-green/80">{meta.teaser}</p>
        </div>
      </div>

      <p className="relative z-10 line-clamp-3 flex-1 font-barlow text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">
        {dashboard.description}
      </p>

      <div className="relative z-10 mt-4 grid grid-cols-3 gap-1.5">
        {meta.kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-gray-100 bg-gray-50/80 px-2 py-1.5 text-center dark:border-white/[0.06] dark:bg-white/[0.03]"
          >
            <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">{k.label}</p>
            <p className="font-barlow text-xs font-black tabular-nums text-gray-900 dark:text-white">
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/[0.06]">
        <span className="text-xs font-bold text-mintcom-green">
          {t('landing.features.readMore', 'Read more')} →
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
          {index + 1}/3
        </span>
      </div>
    </button>
  );
};

/** Immersive scope modal — hierarchy story + floating live preview. */
const ScopeDashboardModal = ({
  dashboards,
  activeIndex,
  direction,
  onClose,
  onPrev,
  onNext,
  onJumpTo,
  t,
  isRtl,
}: {
  dashboards: ScopeDashboard[];
  activeIndex: number;
  direction: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpTo: (i: number) => void;
  t: (...args: any[]) => any;
  isRtl: boolean;
}) => {
  const item = dashboards[activeIndex];
  if (!item) return null;
  const Icon = item.icon;
  const rank = item.scope === 'owner' ? 3 : item.scope === 'brand' ? 2 : 1;
  const meta = SCOPE_META[item.scope];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 12 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-[0_40px_100px_-24px_rgba(0,0,0,0.55)] dark:border-white/[0.08] dark:bg-[#121214]"
        dir={isRtl ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
      >
        {/* Top header */}
        <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-mintcom-green/15 via-transparent to-transparent px-6 pb-5 pt-14 dark:border-white/[0.06] dark:from-mintcom-green/20 sm:px-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 end-10 h-48 w-48 rounded-full bg-mintcom-green/20 blur-3xl"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label={String(t('common.close', 'Close'))}
            className="absolute end-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-gray-500 shadow-sm backdrop-blur transition-colors hover:bg-white dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
          >
            <X size={16} strokeWidth={2.5} />
          </button>

          <div className="absolute start-4 top-4 z-30 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-bold text-mintcom-green dark:bg-white/10">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={activeIndex}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="tabular-nums"
                >
                  {activeIndex + 1}
                </motion.span>
              </AnimatePresence>
              <span className="opacity-40">/</span>
              <span className="opacity-60">{dashboards.length}</span>
            </span>
            <span className="hidden items-center gap-1.5 rounded-full bg-mintcom-green/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-mintcom-green sm:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mintcom-green" />
              </span>
              {t('landing.cloudControl.scope.live', 'Live scope')}
            </span>
          </div>

          {/* Hierarchy path: Owner → Brand → Location */}
          <div className="relative z-10 flex flex-wrap items-center gap-1.5 sm:gap-2">
            {dashboards.map((d, i) => {
              const on = i === activeIndex;
              const DIcon = d.icon;
              return (
                <div key={d.scope} className="flex items-center gap-1.5 sm:gap-2">
                  {i > 0 && (
                    <span className="text-gray-300 dark:text-white/20" aria-hidden>
                      →
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onJumpTo(i)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                      on
                        ? 'bg-mintcom-green text-black shadow-md shadow-mintcom-green/30'
                        : 'bg-white/70 text-gray-500 hover:bg-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
                    }`}
                  >
                    <DIcon size={12} />
                    <span className="hidden xs:inline sm:inline">{d.scopeLabel.replace(/ scope/i, '')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative max-h-[min(78vh,720px)] overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={scopeSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative z-10 p-6 md:p-8 lg:p-10"
            >
              <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,1.05fr)] lg:gap-12">
                {/* Story column */}
                <div className="order-2 flex min-w-0 flex-col lg:order-1">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -18, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                    className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-mintcom-green to-emerald-600 text-white shadow-lg shadow-mintcom-green/35"
                  >
                    <Icon size={28} />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-mintcom-green"
                  >
                    {item.scopeLabel} · {meta.teaser}
                  </motion.p>

                  <motion.h3
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.06, duration: 0.4 }}
                    className="font-barlow text-2xl font-black leading-snug tracking-tight text-gray-900 dark:text-white md:text-3xl lg:text-[2.1rem]"
                  >
                    {item.title}
                  </motion.h3>

                  <motion.p
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.14, duration: 0.45 }}
                    className="mt-4 max-w-md font-barlow text-[15px] font-medium leading-relaxed text-gray-600 dark:text-gray-300 md:text-base"
                  >
                    {item.description}
                  </motion.p>

                  <ul className="mt-7 space-y-3">
                    {item.highlights.map((line, i) => (
                      <motion.li
                        key={line}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.22 + i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                        className="group/row flex items-start gap-3 rounded-xl border border-transparent bg-gray-50/80 px-3 py-2.5 transition-colors hover:border-mintcom-green/25 hover:bg-mintcom-green/5 dark:bg-white/[0.03] dark:hover:bg-mintcom-green/10"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mintcom-green text-black shadow-sm shadow-mintcom-green/30">
                          <Check size={11} strokeWidth={3} />
                        </span>
                        <span className="text-sm font-semibold leading-snug text-gray-800 dark:text-gray-100">
                          {line}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Scope depth meter */}
                  <div className="mt-auto pt-8">
                    <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <span>{isRtl ? 'عمق النطاق' : 'Scope depth'}</span>
                      <span className="tabular-nums text-mintcom-green">{rank}/3</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                      <motion.div
                        key={`bar-${activeIndex}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(rank / 3) * 100}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="rounded-full bg-gradient-to-r from-mintcom-green to-emerald-400 shadow-[0_0_12px_rgba(125,198,162,0.5)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Live preview stage */}
                <div className="order-1 flex w-full flex-col justify-center lg:order-2">
                  <div className="relative">
                    <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50 p-3 shadow-xl dark:border-white/10 dark:from-[#1a1a1c] dark:to-[#0e0e10] sm:p-4">
                      <div
                        aria-hidden
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.motif}`}
                      />
                      {/* Live badge */}
                      <div className="relative z-10 mb-3 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-mintcom-green/15 px-2.5 py-1 text-[10px] font-bold text-mintcom-green">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mintcom-green" />
                          dashboard.mintcom.app/{item.scope}
                        </span>
                        <span className="font-mono text-[10px] tabular-nums text-gray-400">
                          {meta.kpis.map((k) => k.value).join(' · ')}
                        </span>
                      </div>
                      {/* Full-bleed preview — no scale; size="lg" fills the frame */}
                      <div className="relative z-10 h-[240px] overflow-hidden rounded-2xl border border-gray-200/90 shadow-inner ring-1 ring-black/5 dark:border-white/[0.08] dark:ring-white/5 sm:h-[280px]">
                        <ScopePreview scope={item.scope} t={t} size="lg" />
                      </div>
                      <p className="relative z-10 mt-3 text-center text-[11px] font-medium text-gray-400">
                        {t(
                          'landing.cloudControl.scope.livePreview',
                          'Live preview',
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: prev / labeled scopes / next */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-4 py-4 backdrop-blur dark:border-white/[0.06] dark:bg-black/30 sm:px-8">
          <button
            type="button"
            onClick={onPrev}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 transition-all hover:-translate-x-0.5 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:px-4"
          >
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <span className="hidden sm:inline">{t('common.previous', 'Previous')}</span>
          </button>

          <div className="flex max-w-[58%] items-center gap-1.5 overflow-x-auto no-scrollbar sm:gap-2">
            {dashboards.map((d, i) => {
              const DIcon = d.icon;
              const on = i === activeIndex;
              return (
                <button
                  key={d.scope}
                  type="button"
                  onClick={() => onJumpTo(i)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold transition-all sm:text-[11px] ${
                    on
                      ? 'bg-mintcom-green text-black shadow-md shadow-mintcom-green/30'
                      : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:ring-mintcom-green/40 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10'
                  }`}
                >
                  <DIcon size={12} />
                  <span className="hidden md:inline">{d.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 rounded-xl bg-mintcom-green px-3 py-2.5 text-sm font-bold text-black shadow-[0_6px_24px_-6px_rgba(125,198,162,0.65)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_32px_-6px_rgba(125,198,162,0.75)] sm:px-4"
          >
            <span className="hidden sm:inline">{t('common.next', 'Next')}</span>
            {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * MacBook mockup — Owner Portal screen matching real OwnerLayout + OwnerOverviewPage
 * (dark mode): sidebar nav, KPI cards, net sales trend.
 */
const DeviceMockup = ({ t }: { t: any }) => {
  const isRtl = t('common.locale') === 'ar';
  const locale = t('common.locale') === 'ar' ? 'ar-EG' : 'en-US';
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // 1. MacBook theme colors
  const MAC_BG = isDarkMode ? '#050505' : '#F8FAFC';
  const MAC_SIDEBAR_BG = isDarkMode ? '#1E293B' : '#FFFFFF';
  const MAC_CARD_BG = isDarkMode ? '#1E293B' : '#FFFFFF';
  const MAC_CARD_BORDER = isDarkMode ? 'border-white/[0.05]' : 'border-gray-200';
  const MAC_TEXT = isDarkMode ? 'text-white' : 'text-gray-900';
  const MAC_SUB = isDarkMode ? 'text-gray-400' : 'text-slate-600';
  const MAC_BORDER = isDarkMode ? 'border-white/[0.05]' : 'border-gray-200';

  // 2. iPhone theme colors
  const PH_BG = isDarkMode ? '#1F1D2B' : '#F8FAFC';
  const PH_CARD_BG = isDarkMode ? '#252836' : '#FFFFFF';
  const PH_TEXT = isDarkMode ? 'text-white' : 'text-gray-900';
  const PH_BORDER = isDarkMode ? '#3A3A4A' : '#E2E8F0';

  const sidebarItems = [
    { icon: LayoutDashboard, label: t('owner.menu.overview', 'Overview'), active: true },
    { icon: Store, label: t('owner.menu.locations', 'Locations'), active: false },
    { icon: Building2, label: t('owner.menu.brands', 'Brands'), active: false },
    { icon: Users, label: t('owner.menu.employees', 'Employees'), active: false },
    { icon: Shield, label: t('owner.menu.globalRoles', 'Global Roles'), active: false },
    { icon: CreditCard, label: t('owner.menu.billing', 'Billing'), active: false },
    { icon: KeyRound, label: t('owner.menu.accountManagement', 'Account'), active: false },
  ];

  const kpis = [
    {
      label: t('owner.overview.netSales', 'Net Sales'),
      value: (21450).toLocaleString(locale, { style: 'currency', currency: 'JOD', maximumFractionDigits: 0 }),
      sub: t('owner.overview.netSalesSub', 'Excludes tax and other charges'),
      icon: DollarSign,
      iconColor: 'text-mintcom-green',
      iconBg: 'bg-mintcom-green/10',
    },
    {
      label: t('owner.overview.totalSales', 'Total Sales'),
      value: (24800).toLocaleString(locale, { style: 'currency', currency: 'JOD', maximumFractionDigits: 0 }),
      sub: t('owner.overview.totalSalesSub', 'Includes tax and other charges'),
      icon: Wallet,
      iconColor: 'text-mintcom-green',
      iconBg: 'bg-mintcom-green/10',
    },
    {
      label: t('owner.overview.totalProfit', 'Total Profit'),
      value: (8120).toLocaleString(locale, { style: 'currency', currency: 'JOD', maximumFractionDigits: 0 }),
      sub: null as string | null,
      icon: TrendingUp,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      label: t('owner.overview.activeLocations', 'Active Locations'),
      value: '6',
      sub: null as string | null,
      icon: Store,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
    },
    {
      label: t('owner.overview.totalBrands', 'Total Brands'),
      value: '3',
      sub: null as string | null,
      icon: Building2,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10',
    },
    {
      label: t('owner.overview.totalStaff', 'Total Staff'),
      value: '42',
      sub: null as string | null,
      icon: Users,
      iconColor: 'text-pink-400',
      iconBg: 'bg-pink-500/10',
    },
  ];

  const chartHeights = [38, 52, 44, 68, 55, 78, 62, 90, 70, 85, 74, 92];

  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[320px] sm:min-h-[420px] lg:min-h-[520px] select-none">
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[80%] h-[80%] bg-mintcom-green/10 rounded-full blur-[100px]" />
      </div>

      {/* ── MacBook ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-[92%] max-w-[680px]"
      >
        {/* Lid / screen bezel — real MacBook Pro style (notch, no browser chrome) */}
        <div
          className="relative rounded-t-[16px] border-[9px] border-[#1c1c1e] ring-1 ring-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65)] overflow-hidden aspect-[16/10]"
          style={{
            background: '#0a0a0a',
            boxShadow:
              '0 30px 60px -20px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Display notch (MacBook Pro style) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div
              className="relative h-[14px] sm:h-[16px] w-[88px] sm:w-[108px] bg-black rounded-b-[10px] flex items-center justify-center"
              style={{
                boxShadow: '0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {/* Camera module */}
              <div
                className="w-[7px] h-[7px] sm:w-[8px] sm:h-[8px] rounded-full relative"
                style={{
                  background:
                    'radial-gradient(circle at 35% 35%, #1a2744 0%, #0a1020 50%, #050508 100%)',
                  boxShadow: 'inset 0 0 0 1px rgba(80,120,200,0.18)',
                }}
              >
                <div className="absolute top-[1.5px] left-[1.5px] w-[1.5px] h-[1.5px] rounded-full bg-sky-300/25" />
              </div>
            </div>
          </div>

          {/* Thin top bezel strip (screen edge under notch) */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-black z-20 pointer-events-none" />

          {/* Owner portal UI — full-bleed under notch */}
          <div className="w-full h-full flex transition-colors duration-300" style={{ backgroundColor: MAC_BG }}>
            {/* ── Real OwnerLayout sidebar ── */}
            <div className={`hidden sm:flex w-[22%] min-w-0 flex-col border-r ${MAC_BORDER} py-2 px-1.5 relative transition-colors duration-300`} style={{ backgroundColor: MAC_SIDEBAR_BG }}>
              <div className="absolute top-0 end-0 w-px h-full bg-gradient-to-b from-transparent via-mintcom-green/20 to-transparent opacity-50 pointer-events-none" />

              {/* Brand header */}
              <div className="flex items-center gap-1.5 px-1.5 h-8 mb-1 shrink-0">
                <img
                  src={isDarkMode ? MintcomLogoWhite : MintcomLogoDark}
                  alt="Mintcom"
                  className="h-4 w-auto object-contain max-w-[88%]"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <p className={`px-1.5 py-1 text-[7px] font-semibold tracking-wide mb-0.5 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                {t('owner.menu.mainMenu', 'Main Menu')}
              </p>

              <div className="flex-1 min-h-0 flex flex-col gap-0.5 overflow-hidden">
                {sidebarItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-1.5 px-1.5 py-[5px] rounded-lg text-[8px] font-semibold transition-colors ${
                      item.active
                        ? 'bg-mintcom-green text-black shadow-sm shadow-mintcom-green/25'
                        : isDarkMode ? 'text-gray-400' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon size={10} className="shrink-0" strokeWidth={2.25} />
                    <span className="truncate leading-none">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Account chip at bottom of sidebar */}
              <div className={`mt-auto pt-1.5 border-t ${MAC_BORDER} px-1`}>
                <div className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 ${isDarkMode ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
                  <div className="w-5 h-5 rounded-md bg-mintcom-green/15 border border-mintcom-green/25 flex items-center justify-center shrink-0">
                    <img src={MintcomLeafIcon} alt="" className="w-3 h-3 object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[7px] font-bold truncate ${MAC_TEXT}`}>
                      {t('landing.admin.mockup.businessOwner', 'Business Owner')}
                    </p>
                    <p className={`text-[6px] truncate ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>owner@mintcom.app</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Owner Overview main ── */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden px-2.5 py-2 gap-1.5 transition-colors duration-300" style={{ backgroundColor: MAC_BG }}>
              {/* Page header + period filter */}
              <div className="flex items-start justify-between gap-2 shrink-0">
                <div className="min-w-0">
                  <h2 className={`text-[11px] sm:text-[12px] font-bold tracking-tight leading-tight truncate ${MAC_TEXT}`}>
                    {t('owner.overview.title', 'Business Overview')}
                  </h2>
                  <p className={`text-[7px] mt-0.5 truncate ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                    {t('owner.overview.subtitle', {
                      count: 6,
                      brands: 3,
                      defaultValue: '6 locations · 3 brands',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 rounded-xl border border-mintcom-green/40 bg-mintcom-green/10 px-1.5 py-1 shadow-sm shadow-mintcom-green/10">
                  <Calendar size={8} className="text-mintcom-green" />
                  <span className="text-[7px] font-bold text-mintcom-green">
                    {t('common.datePeriods.this_week', 'This Week')}
                  </span>
                </div>
              </div>

              {/* KPI grid — 6 cards like real overview */}
              <div className="grid grid-cols-3 gap-1 sm:gap-1.5 shrink-0">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className={`rounded-lg border ${MAC_CARD_BORDER} p-1.5 sm:p-2 relative overflow-hidden transition-colors duration-300`}
                    style={{ backgroundColor: MAC_CARD_BG }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center`}
                      >
                        <kpi.icon size={10} strokeWidth={2.25} />
                      </div>
                    </div>
                    <p className={`text-[6px] sm:text-[7px] font-semibold leading-tight mb-0.5 truncate ${MAC_SUB}`}>
                      {kpi.label}
                    </p>
                    <p className={`text-[9px] sm:text-[11px] font-black tracking-tight leading-none tabular-nums ${MAC_TEXT}`}>
                      {kpi.value}
                    </p>
                    {kpi.sub && (
                      <p className="text-[5px] sm:text-[6px] text-gray-500 mt-0.5 truncate hidden sm:block">
                        {kpi.sub}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Net Sales Trend chart card */}
              <div className={`flex-1 min-h-0 rounded-lg border ${MAC_BORDER} p-2 flex flex-col transition-colors duration-300`} style={{ backgroundColor: MAC_CARD_BG }}>
                <div className="flex items-center justify-between mb-1.5 shrink-0">
                  <div className="min-w-0">
                    <p className={`text-[9px] font-bold tracking-tight truncate ${MAC_TEXT}`}>
                      {t('owner.overview.netSalesTrend', 'Net Sales Trend')}
                    </p>
                    <p className={`text-[6px] truncate ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                      {t('owner.overview.consolidatedPerf', 'Consolidated Performance Across Locations')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-mintcom-green" />
                    <span className="text-[6px] font-medium text-gray-500">
                      {t('owner.overview.netSales', 'Net Sales')} (JOD)
                    </span>
                  </div>
                </div>

                {/* Area-style chart mock (matches green trend) */}
                <div className="flex-1 min-h-0 relative flex items-end">
                  {/* Soft area fill behind bars */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-[70%] opacity-30 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(125,198,162,0.35) 0%, transparent 100%)',
                      clipPath:
                        'polygon(0% 70%, 8% 55%, 16% 62%, 25% 35%, 33% 48%, 42% 22%, 50% 40%, 58% 8%, 66% 28%, 75% 12%, 83% 24%, 92% 5%, 100% 18%, 100% 100%, 0% 100%)',
                    }}
                  />
                  <div className="relative w-full h-full flex items-end gap-[3px] px-0.5">
                    {chartHeights.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-[2px] bg-gradient-to-t from-mintcom-green/50 to-mintcom-green"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* X-axis ticks */}
                <div className="flex justify-between mt-1 px-0.5 shrink-0">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <span key={d} className="text-[5px] font-medium text-gray-600">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MacBook base / chin */}
        <div className="relative h-3 w-full">
          <div className="absolute left-1/2 -translate-x-1/2 -top-[10px] w-[108%] h-3 bg-gradient-to-b from-[#3a3a3c] via-[#2c2c2e] to-[#1c1c1e] rounded-b-[18px] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.6)]" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[14%] h-1 bg-[#0a0a0a] rounded-b-sm" />
        </div>
      </motion.div>

      {/* ── iPhone — Admin Portal location dashboard ── */}
      <motion.div
        initial={{ opacity: 0, x: isRtl ? -50 : 50, rotate: isRtl ? 10 : -10 }}
        whileInView={{ opacity: 1, x: 0, rotate: isRtl ? 10 : -10 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className={`absolute bottom-[-2%] sm:bottom-[0%] ${
          isRtl ? 'left-[0%] sm:left-[4%]' : 'right-[0%] sm:right-[4%]'
        } w-[34%] max-w-[168px] sm:max-w-[196px] z-20`}
      >
        {/* Titanium chassis */}
        <div
          className="relative w-full aspect-[9/19.5] rounded-[36px] p-[2px]"
          style={{
            background:
              'linear-gradient(145deg, #6b6b70 0%, #2a2a2e 18%, #8e8e93 38%, #1c1c1e 55%, #5a5a5f 78%, #3a3a3c 100%)',
            boxShadow:
              '0 28px 50px -12px rgba(0,0,0,0.7), 0 12px 24px -8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <div
            className="relative w-full h-full rounded-[34px] p-[8px] overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a1a1c 0%, #0a0a0b 100%)',
            }}
          >
            {/* Side rails */}
            <div className="absolute -left-[2.5px] top-[18%] w-[2.5px] h-[16px] rounded-l-sm bg-[#3a3a3c] z-40" />
            <div className="absolute -left-[2.5px] top-[26%] w-[2.5px] h-[28px] rounded-l-sm bg-[#3a3a3c] z-40" />
            <div className="absolute -left-[2.5px] top-[36%] w-[2.5px] h-[28px] rounded-l-sm bg-[#3a3a3c] z-40" />
            <div className="absolute -right-[2.5px] top-[28%] w-[2.5px] h-[44px] rounded-r-sm bg-[#3a3a3c] z-40" />

            {/* Screen */}
            <div
              className="relative w-full h-full rounded-[26px] overflow-hidden flex flex-col transition-colors duration-300"
              style={{ background: PH_BG }}
            >
              {/* Status + Dynamic Island over green header */}
              <div className="absolute top-0 inset-x-0 h-[22px] z-30 pointer-events-none flex items-end justify-between px-3.5 pb-0.5">
                <span className="text-[7px] font-semibold text-white">9:41</span>
                <div className="flex items-center gap-0.5">
                  <div className="flex items-end gap-px h-1.5">
                    {[2, 3, 4, 5].map((h) => (
                      <div key={h} className="w-[1.5px] rounded-sm bg-white" style={{ height: h }} />
                    ))}
                  </div>
                  <div className="w-[12px] h-[6px] rounded-[1.5px] border border-white relative ml-0.5">
                    <div className="absolute inset-[1px] right-[2px] rounded-[0.5px] bg-white" />
                  </div>
                </div>
              </div>
              <div
                className="absolute left-1/2 top-[5px] -translate-x-1/2 h-[16px] w-[62px] rounded-full z-40 pointer-events-none flex items-center justify-end pr-1.5"
                style={{ background: '#000' }}
              >
                <div
                  className="w-[7px] h-[7px] rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 35%, #1a2744 0%, #0a0f1a 55%, #000 100%)',
                  }}
                />
              </div>

              {/* Green header (OwnerScreenHeader — Dashboard) */}
              <div className="flex-shrink-0 pt-[22px]" style={{ backgroundColor: '#7dc6a2' }}>
                <div className="flex items-center justify-between px-2 h-8">
                  <Menu size={11} className="text-white" strokeWidth={2.25} />
                  <span className="text-white font-bold text-[10px] tracking-tight">
                    {t('menu.dashboard', 'Dashboard')}
                  </span>
                  <div className="relative">
                    <Bell size={11} className="text-white" strokeWidth={2.25} />
                    <span className="absolute -top-0.5 -right-0.5 min-w-[9px] h-[9px] rounded-full bg-[#D55263] border border-[#7dc6a2] text-[5px] font-black text-white flex items-center justify-center px-0.5">
                      7
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable dashboard body */}
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {/* Hero pills (OwnerScreenHero) */}
                <div className="px-1.5 pt-1.5 pb-1 transition-colors duration-300" style={{ backgroundColor: PH_BG }}>
                  <div
                    className="flex rounded-lg border px-1 py-1.5 transition-colors duration-300"
                    style={{ backgroundColor: PH_CARD_BG, borderColor: PH_BORDER }}
                  >
                    <div className="flex-1 flex flex-col items-center justify-center px-0.5">
                      <div className="flex items-center gap-0.5 mb-0.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                          <PlayCircle size={7} className="text-emerald-400" />
                        </div>
                      </div>
                      <span className={`text-[5.5px] font-extrabold text-center leading-tight transition-colors duration-300 ${PH_TEXT}`}>
                        {t('dashboard.shiftStatus.activeOnly', 'Active Shift')}
                      </span>
                      <span className="text-[5px] font-bold text-emerald-400/90 truncate max-w-full">
                        Sara
                      </span>
                    </div>
                    <div className="w-px self-stretch my-0.5 transition-colors duration-300" style={{ backgroundColor: PH_BORDER }} />
                    <div className="flex-1 flex flex-col items-center justify-center px-0.5">
                      <div className="flex items-center gap-0.5 mb-0.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-mintcom-green/15 flex items-center justify-center">
                          <RefreshCw size={7} className="text-mintcom-green" />
                        </div>
                        <span className={`text-[9px] font-black tracking-tight tabular-nums transition-colors duration-300 ${PH_TEXT}`}>9:41</span>
                      </div>
                      <span className="text-[5px] font-extrabold uppercase tracking-wide text-gray-500">
                        {t('dashboard.lastUpdated', 'Last updated')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0 px-1.5 flex flex-col gap-1 overflow-hidden">
                  {/* View Mode selector — matches admin portal ViewModeSelector card */}
                  <div
                    className="flex items-center gap-1.5 rounded-lg border px-1.5 py-1.5 transition-colors duration-300"
                    style={{ backgroundColor: PH_CARD_BG, borderColor: PH_BORDER }}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(125,198,162,0.2)' }}
                    >
                      <PlayCircle size={10} className="text-mintcom-green" strokeWidth={2.25} />
                    </div>
                    <span className="text-[6.5px] font-semibold text-slate-400 shrink-0">
                      {t('dashboard.viewMode.selectView', 'View Mode')}
                    </span>
                    <div className="flex-1" />
                    <span className="text-[7px] font-bold text-mintcom-green truncate max-w-[42%]">
                      {t('dashboard.viewMode.currentShift', 'Current Shift')}
                    </span>
                    <ChevronDown size={10} className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} shrink-0`} strokeWidth={2.5} />
                  </div>

                  {/* Info bar */}
                  <div
                    className="flex items-center justify-between rounded-md border px-1.5 py-1 transition-colors duration-300"
                    style={{ backgroundColor: isDarkMode ? '#1A1F2E' : '#F1F5F9', borderColor: PH_BORDER }}
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <PlayCircle size={8} className="text-mintcom-green shrink-0" />
                      <span className={`text-[6px] font-semibold truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {t('dashboard.viewMode.showingSince', {
                          date: '8:00 AM',
                          defaultValue: 'Since 8:00 AM',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[5px] text-gray-500">9:41 AM</span>
                      <div
                        className="w-4 h-4 rounded-md border flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: isDarkMode ? '#252A3A' : '#FFFFFF', borderColor: PH_BORDER }}
                      >
                        <Download size={7} className="text-mintcom-green" />
                      </div>
                    </div>
                  </div>

                  {/* Section: Overview KPIs */}
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-mintcom-green" />
                    <span className={`text-[6px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t('dashboard.stats.overview', 'Overview')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    {[
                      {
                        label: t('dashboard.stats.netSales', 'Net Sales'),
                        value: '2,180 JOD',
                        sub: t('dashboard.stats.excludingTaxServiceCharge', 'Excludes tax & charges'),
                        featured: true,
                        Icon: TrendingUp,
                      },
                      {
                        label: t('dashboard.stats.totalSales', 'Total Sales'),
                        value: '2,450 JOD',
                        sub: t('dashboard.stats.includingTaxServiceCharge', 'Includes tax & charges'),
                        featured: false,
                        Icon: CreditCard,
                      },
                      {
                        label: t('dashboard.stats.totalOrders', 'Orders'),
                        value: '142',
                        sub: t('dashboard.stats.completedOrders', 'Completed orders'),
                        featured: false,
                        Icon: ShoppingBag,
                      },
                      {
                        label: t('dashboard.stats.profit', 'Profit'),
                        value: '812 JOD',
                        sub: t('dashboard.stats.netSalesCosts', 'Net Sales - Costs'),
                        featured: false,
                        Icon: Activity,
                      },
                      {
                        label: t('dashboard.stats.avgOrder', 'Avg Order'),
                        value: '17.3 JOD',
                        sub: t('dashboard.stats.avgOrderValue', 'Avg. Order Value'),
                        featured: false,
                        Icon: DollarSign,
                      },
                      {
                        label: t('dashboard.stats.refunds', 'Refunds'),
                        value: '24 JOD',
                        sub: t('dashboard.stats.thisShift', 'This Shift'),
                        featured: false,
                        Icon: CornerDownLeft,
                      },
                    ].map((card) => (
                      <div
                        key={card.label}
                        className="rounded-md p-1.5 border transition-colors duration-300"
                        style={{
                          backgroundColor: card.featured
                            ? 'rgba(125,198,162,0.07)'
                            : PH_CARD_BG,
                          borderColor: card.featured ? '#7dc6a2' : PH_BORDER,
                          borderWidth: card.featured ? 1.5 : 1,
                          boxShadow: card.featured
                            ? '0 0 10px rgba(125,198,162,0.25)'
                            : undefined,
                        }}
                      >
                        <p className={`text-[5.5px] font-bold truncate mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {card.label}
                        </p>
                        <p className={`text-[8px] font-black tabular-nums leading-none transition-colors duration-300 ${PH_TEXT}`}>
                          {card.value}
                        </p>
                        <p className="text-[5px] text-gray-500 mt-0.5 truncate">{card.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sales Trends mini chart */}
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-mintcom-green" />
                    <span className={`text-[6px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t('owner.overview.salesTrends', 'Sales Trends')}
                    </span>
                  </div>
                  <div
                    className="rounded-md border p-1.5 flex-1 min-h-[36px] flex flex-col transition-colors duration-300"
                    style={{ backgroundColor: PH_CARD_BG, borderColor: PH_BORDER }}
                  >
                    <div className="flex-1 flex items-end gap-0.5">
                      {[40, 55, 42, 70, 58, 85, 62, 92, 74, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-[1px] bg-gradient-to-t from-mintcom-green/45 to-mintcom-green"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom nav (dashboard mode) */}
              <div
                className="flex-shrink-0 flex items-center justify-around border-t px-0.5 pt-1 pb-2 transition-colors duration-300"
                style={{ backgroundColor: PH_BG, borderColor: PH_BORDER }}
              >
                {[
                  { Icon: Home, label: t('dashboard.menu.dashboard', 'Home'), active: true },
                  { Icon: BarChart2, label: t('dashboard.menu.reports', 'Reports'), active: false },
                  { Icon: ShoppingBag, label: t('dashboard.menu.orders', 'Orders'), active: false },
                  { Icon: Package, label: t('dashboard.menu.products', 'Products'), active: false },
                ].map((tab) => (
                  <div key={tab.label} className="flex flex-col items-center gap-0.5 flex-1">
                    <tab.Icon
                      size={10}
                      className={tab.active ? 'text-mintcom-green' : isDarkMode ? 'text-gray-500' : 'text-slate-400'}
                      strokeWidth={2.25}
                    />
                    <span
                      className={`text-[5px] font-bold transition-colors duration-300 ${
                        tab.active ? 'text-mintcom-green' : isDarkMode ? 'text-gray-500' : 'text-slate-400'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Home indicator */}
              <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-[72px] h-[3px] rounded-full z-30 ${isDarkMode ? 'bg-white/30' : 'bg-black/20'}`} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const CloudControl = () => {
  const { t } = useTranslation();
  const hasOwnerAndroidDownload = Boolean(OWNER_ANDROID_DOWNLOAD_URL);
  const hasOwnerIosDownload = Boolean(OWNER_IOS_DOWNLOAD_URL);
  const isRtl = t('common.locale') === 'ar';

  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  const dashboards: ScopeDashboard[] = [
    {
      icon: Crown,
      title: t('landing.cloudControl.owner.title'),
      description: t('landing.cloudControl.owner.description'),
      scope: 'owner',
      scopeLabel: t('landing.cloudControl.scope.global', 'Global scope'),
      // Plain strings — t('…h1') hits parseMissingKeyHandler and shows "H1"
      highlights: isRtl
        ? [
            'اطلع على إيرادات كل علامة تجارية في مكان واحد',
            'تتبع حالة الفوترة عبر النشاط بالكامل',
            'انتقل من إجمالي المحفظة إلى أداء كل علامة',
          ]
        : [
            'See every brand’s revenue in one place',
            'Track billing status across the business',
            'Drill from portfolio totals to brand performance',
          ],
    },
    {
      icon: Tags,
      title: t('landing.cloudControl.brand.title'),
      description: t('landing.cloudControl.brand.description'),
      scope: 'brand',
      scopeLabel: t('landing.cloudControl.scope.brand', 'Brand scope'),
      highlights: isRtl
        ? [
            'إدارة كل المواقع تحت علامة تجارية واحدة',
            'تعيين أدوار تنتقل عبر المواقع',
            'تقارير ورؤى موحّدة على مستوى العلامة',
          ]
        : [
            'Manage all locations under one brand',
            'Assign roles that travel across sites',
            'Consolidated brand reporting & insights',
          ],
    },
    {
      icon: Building2,
      title: t('landing.cloudControl.location.title'),
      description: t('landing.cloudControl.location.description'),
      scope: 'location',
      scopeLabel: t('landing.cloudControl.scope.location', 'Location scope'),
      highlights: isRtl
        ? [
            'طلبات حية وإيرادات ومتوسط طلب لليوم',
            'الموظفون والمنتجات والمدفوعات لكل موقع',
            'واجهة تشغيل موحّدة لفريق الصالة',
          ]
        : [
            'Live orders, revenue & AOV for the day',
            'Staff, products & payments per site',
            'One streamlined ops view for the floor',
          ],
    },
  ];

  const handleOpen = useCallback((index: number) => {
    setDirection(0);
    setActiveCard(index);
  }, []);

  const handleClose = useCallback(() => setActiveCard(null), []);

  const handlePrev = useCallback(() => {
    setDirection(isRtl ? 1 : -1);
    setActiveCard((i) => {
      if (i === null) return 0;
      return (i - 1 + dashboards.length) % dashboards.length;
    });
  }, [dashboards.length, isRtl]);

  const handleNext = useCallback(() => {
    setDirection(isRtl ? -1 : 1);
    setActiveCard((i) => {
      if (i === null) return 0;
      return (i + 1) % dashboards.length;
    });
  }, [dashboards.length, isRtl]);

  const handleJumpTo = useCallback(
    (i: number) => {
      setDirection(() => {
        if (activeCard === null) return 0;
        return i > activeCard ? 1 : -1;
      });
      setActiveCard(i);
    },
    [activeCard],
  );

  useEffect(() => {
    if (activeCard === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') (isRtl ? handleNext : handlePrev)();
      if (e.key === 'ArrowRight') (isRtl ? handlePrev : handleNext)();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeCard, handleClose, handleNext, handlePrev, isRtl]);

  return (
    <section
      id="cloud-control"
      className="py-16 lg:py-24 bg-gray-50 dark:bg-[#0f0f0f] relative overflow-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-mintcom-green/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-mintcom-green/5 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-6 md:px-10 lg:px-16 max-w-[1280px]">
        {/* Top Section: Header + Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 lg:mb-20">
          {/* Left: Heading */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[12px] bg-mintcom-green/5 dark:bg-mintcom-green/10 text-mintcom-green font-bold text-xs mb-8 border border-mintcom-green/20 backdrop-blur-md shadow-[0_0_15px_rgba(124,195,159,0.05)] hover:border-mintcom-green/40 transition-all duration-300"
            >
              <div className="relative flex items-center justify-center w-5 h-5 rounded-[6px] bg-mintcom-green/20 text-mintcom-green overflow-hidden">
                <Cloud size={11} className="relative z-10" />
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-mintcom-green/30"
                />
              </div>
              <span className="tracking-widest uppercase text-[10px] md:text-[11px] leading-none">
                {t('landing.cloudControl.badge')}
              </span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold font-magilio mb-6 leading-tight tracking-tight">
              <SplitText text={t('landing.cloudControl.title', 'In-Sync Cloud Control')} />
              <span className="block text-gray-900 dark:text-white mt-2">
                {t('landing.cloudControl.titleHighlight')}
              </span>
            </h2>
            <p className="max-w-2xl text-base font-light leading-relaxed text-gray-600 dark:text-gray-400 xs:text-lg sm:text-xl">
              {t('landing.cloudControl.subtitle')}
            </p>

            {/* Download CTA — compact, matching AdminControl style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 sm:mt-10 flex flex-col items-center sm:items-start gap-3 w-fit mx-auto sm:mx-0"
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {t('landing.admin.installApp')}
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
                    aria-label={t('landing.cloudControl.scope.preview.ownerIosDownloadComingSoon', 'Owner iOS app download coming soon')}
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
                    aria-label={t('landing.cloudControl.scope.preview.ownerAndroidDownloadComingSoon', 'Owner Android app download coming soon')}
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

          {/* Right: Laptop + Tablet visual */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative"
          >
            <DeviceMockup t={t} />
          </motion.div>
        </div>

        {/* Three scope cards — text first; click opens creative modal */}
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3 md:gap-6">
          {dashboards.map((d, i) => (
            <DashboardCard
              key={d.scope}
              dashboard={d}
              index={i}
              t={t}
              onOpen={handleOpen}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeCard !== null && (
          <ScopeDashboardModal
            dashboards={dashboards}
            activeIndex={activeCard}
            direction={direction}
            onClose={handleClose}
            onPrev={handlePrev}
            onNext={handleNext}
            onJumpTo={handleJumpTo}
            t={t}
            isRtl={isRtl}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
