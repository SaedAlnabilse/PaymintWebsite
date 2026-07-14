/**
 * Static try-pos / real Mintcom UI screenshots for Features modals.
 * Layouts are mirrored from FullPosPlayground + pos-demo screens (new version).
 * All use the same 900×560 design size + scale-to-fit for consistent popup size.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Home,
  User,
  PieChart,
  Bell,
  Headphones,
  Settings,
  Menu,
  LogOut,
  Search,
  Wifi,
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  Banknote,
  Printer,
  Calendar,
  Clock,
  ChevronDown,
  Check,
  Gift,
  TrendingUp,
  Shield,
  Info,
  Package,
  Factory,
  BookOpen,
  Sparkles,
  Building2,
  MapPin,
  Lock,
  Zap,
  Heart,
  AlertTriangle,
  AlertOctagon,
  RotateCcw,
  Smartphone,
  CircleCheck,
  X,
  List,
  LogIn,
  DollarSign,
  Hash,
  LayoutGrid,
  Inbox,
  Percent,
  Box,
  Grid3X3,
  Tag,
  Wrench,
  Globe,
  Undo2,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  SlidersHorizontal,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Activity,
} from 'lucide-react';
import { Logo } from './Logo';
import { FeaturePosScreenshot } from './FeaturePosScreenshot';

export const DESIGN_W = 900;
export const DESIGN_H = 560;
const DEFAULT_IMG = '/default_product.png?v=pos-box';

/** POS AmountText: "1,234.00 USD" */
const posAmount = (n: number) =>
  `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;

/* ─── Shared frame ──────────────────────────────────────────────────────── */

export function FeatureShotFrame({
  title,
  children,
  side,
  bg = '#f6f3ec',
}: {
  title: string;
  children: ReactNode;
  side?: boolean;
  bg?: string;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      setScale(Math.min(1, w / DESIGN_W));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      role="img"
      aria-label={title}
      className={`${side ? 'mt-0 w-full' : 'mt-5'} select-text`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white dark:border-white/10 ${
          side ? 'shadow-lg shadow-black/10 dark:shadow-black/40' : 'shadow-inner'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white px-3.5 py-2 dark:border-white/5 dark:from-[#141414] dark:to-[#0f0f0f]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-45" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mintcom-green" />
            </span>
            <span className="text-[11px] font-semibold normal-case text-gray-500 dark:text-gray-400">
              {title}
            </span>
          </div>
          <span className="rounded-full bg-mintcom-green/12 px-2 py-0.5 text-[9px] font-bold text-mintcom-green">
            Live UI
          </span>
        </div>
        <div
          ref={shellRef}
          className="relative w-full overflow-hidden"
          style={{ height: DESIGN_H * scale, background: bg }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})` }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Exact try-pos side rail (FullPosPlayground NAV_ITEMS) */
function PosRail({ active }: { active: string }) {
  const items = [
    { id: 'sales', icon: Home },
    { id: 'dashboard', icon: User },
    { id: 'reports', icon: PieChart },
    { id: 'notifications', icon: Bell },
    { id: 'support', icon: Headphones },
    { id: 'settings', icon: Settings },
  ] as const;
  return (
    <nav
      className="flex h-full w-[64px] shrink-0 flex-col items-center py-3"
      style={{ backgroundColor: '#1F1D2B' }}
    >
      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl">
        <Logo variant="icon" size="sm" className="pointer-events-none" />
      </div>
      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl text-white/80">
        <Menu size={20} />
      </div>
      <div className="flex flex-1 flex-col items-center gap-1">
        {items.map(({ id, icon: Icon }) => {
          const on = id === active;
          return (
            <span
              key={id}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-white"
              style={on ? { backgroundColor: '#7dc6a2' } : undefined}
            >
              <Icon size={20} strokeWidth={1.75} className={on ? 'text-white' : 'text-white/65'} />
              {id === 'notifications' && (
                <span className="absolute -end-0.5 -top-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#E85D6A] px-0.5 text-[9px] font-bold text-white">
                  2
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className="mt-auto flex h-11 w-11 items-center justify-center rounded-xl text-white/65">
        <LogOut size={20} strokeWidth={1.75} />
      </span>
    </nav>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
        on ? 'bg-mintcom-green' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </span>
  );
}

/**
 * Try-pos Settings is exactly TWO cards (no dark POS rail inside the page):
 * left = icon+label nav (green active pill) · right = content panel.
 * Mirrors PosDemoSettings.tsx tablet layout.
 */
const SETTINGS_NAV = [
  { id: 'business', label: 'Main Settings', icon: Building2 },
  { id: 'sales', label: 'Payment Processes', icon: Percent },
  { id: 'products', label: 'Product Management', icon: Box },
  { id: 'categories', label: 'Categories', icon: Grid3X3 },
  { id: 'stock', label: 'Stock Management', icon: Package },
  { id: 'addons', label: 'Attributes', icon: Tag },
  { id: 'manufacturing', label: 'Recipe Operations', icon: Wrench },
  { id: 'activity', label: 'Activity Log', icon: Clock },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'about', label: 'About Us', icon: Info },
] as const;

function SettingsShell({
  active,
  title,
  sub,
  children,
  showFooter = true,
}: {
  active: string;
  title: string;
  sub: string;
  children: ReactNode;
  showFooter?: boolean;
}) {
  return (
    // font-sans — site CSS forces Magilio on h1/h2; try-pos Settings uses Inter
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-white p-3.5 font-sans"
      style={{ width: DESIGN_W, height: DESIGN_H }}
    >
      {/* Use p not h1 — matches PosDemoSettings title typography */}
      <p className="mb-3 shrink-0 text-[22px] font-bold tracking-[-0.02em] text-[#111827]">
        Settings
      </p>

      {/* Two separate cards — sidebar + content */}
      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        {/* Left card — green active pill, icon + label only */}
        <aside className="flex w-[220px] shrink-0 flex-col overflow-hidden rounded-xl bg-gray-100 p-2">
          <div className="flex flex-col gap-1.5 overflow-hidden py-0.5">
            {SETTINGS_NAV.map((item) => {
              const on = item.id === active;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 ${
                    on
                      ? 'bg-mintcom-green text-white shadow-md shadow-mintcom-green/25'
                      : 'text-[#111827]'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate text-[13px] font-semibold">{item.label}</span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right card — content */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-gray-100">
          <div className="shrink-0 border-b border-gray-200 px-4 py-3.5">
            <p className="text-[17px] font-semibold tracking-normal text-[#111827]">{title}</p>
            <p className="mt-0.5 text-[13px] font-normal text-gray-500">{sub}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden p-3.5">{children}</div>
          {showFooter && (
            <div className="flex shrink-0 gap-3 border-t border-gray-200 px-4 py-3">
              <span className="flex flex-1 items-center justify-center rounded-xl bg-gray-200/80 py-3 text-[13px] font-semibold text-gray-500">
                Discard Changes
              </span>
              <span className="flex flex-1 items-center justify-center rounded-xl bg-mintcom-green py-3 text-[13px] font-black text-white shadow-sm shadow-mintcom-green/25">
                Save Changes
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sales Control = Payment Processes (PosDemoSettings sales tab) ─────── */

function SalesControlShot() {
  return (
    <SettingsShell
      active="sales"
      title="Payment Processes"
      sub="Configure how payments are accepted, processed, and recorded"
    >
      <div className="flex h-full gap-3 overflow-hidden">
        <div className="min-w-0 flex-1 space-y-2.5 overflow-hidden">
          {/* Cash — always required */}
          <div className="rounded-xl border border-gray-300 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mintcom-green/15 text-mintcom-green">
                  <Banknote size={20} />
                </span>
                <div>
                  <p className="text-[14px] font-bold text-[#111827]">Cash</p>
                  <p className="text-[11px] text-gray-500">Always available at checkout</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                Required
              </span>
            </div>
          </div>

          {/* Card Types group */}
          <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <p className="text-[14px] font-semibold text-[#111827]">Card Types</p>
                <p className="text-[11px] text-gray-400">Choose what type of card payments you accept</p>
              </div>
              <ChevronDown size={18} className="text-gray-400" />
            </div>
            {[
              { name: 'Visa', on: true },
              { name: 'Mastercard', on: true },
              { name: 'Amex', on: false },
            ].map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-0"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mintcom-green/15 text-mintcom-green">
                  <CreditCard size={18} />
                </span>
                <span className="flex-1 text-[13px] font-bold text-[#111827]">{c.name}</span>
                <Pencil size={15} className="text-mintcom-green" />
                <Trash2 size={15} className="text-[#D55263]" />
              </div>
            ))}
            <div className="px-4 py-2.5">
              <span className="text-[12px] font-bold text-mintcom-green">+ Add Card Type</span>
            </div>
          </div>

          {/* Other methods */}
          <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-[14px] font-semibold text-[#111827]">Other Payment Methods</p>
              <p className="text-[11px] text-gray-400">Digital wallets or delivery apps</p>
            </div>
            {[
              { name: 'CliQ', on: true },
              { name: 'Talabat', on: false },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-0"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mintcom-green/15 text-mintcom-green">
                  <WalletIcon />
                </span>
                <span className="flex-1 text-[13px] font-bold text-[#111827]">{p.name}</span>
                <Toggle on={p.on} />
              </div>
            ))}
            <div className="px-4 py-2.5">
              <span className="text-[12px] font-bold text-mintcom-green">+ Add Other Payment Method</span>
            </div>
          </div>
        </div>

        <div className="w-[280px] shrink-0 space-y-2.5 overflow-hidden">
          {/* Tax */}
          <div className="rounded-xl border border-gray-300 bg-white p-3.5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#111827]">Tax</p>
              <Toggle on />
            </div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Rate</p>
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <span className="flex h-10 w-10 items-center justify-center bg-mintcom-green/10 text-sm font-extrabold text-mintcom-green">
                %
              </span>
              <span className="px-3 text-[14px] font-bold text-[#111827]">8.00</span>
            </div>
          </div>

          {/* Service charge */}
          <div className="rounded-xl border border-gray-300 bg-white p-3.5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#111827]">Service Charge</p>
              <Toggle on />
            </div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Charge name</p>
            <div className="mb-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] font-bold text-[#111827]">
              Service Charge
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <span className="flex items-center justify-center gap-1 rounded-xl bg-mintcom-green py-2 text-[12px] font-bold text-white">
                % Percentage <Check size={12} />
              </span>
              <span className="flex items-center justify-center rounded-xl border border-gray-200 py-2 text-[12px] font-bold text-gray-500">
                $ Fixed
              </span>
            </div>
            <div className="mt-2 flex items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <span className="flex h-9 w-9 items-center justify-center bg-mintcom-green/10 text-sm font-extrabold text-mintcom-green">
                %
              </span>
              <span className="px-3 text-[13px] font-bold">5.00</span>
            </div>
          </div>

          {/* Loyalty snippet */}
          <div className="rounded-xl border border-gray-300 bg-white shadow-sm">
            <div className="flex items-center justify-between px-3.5 py-3">
              <span className="text-[14px] font-semibold text-[#111827]">Loyalty Program</span>
              <Toggle on />
            </div>
            <div className="border-t border-gray-100 px-3.5 py-2.5">
              <p className="mb-1.5 flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-mintcom-green">
                <TrendingUp size={13} /> Earning Rule
              </p>
              <p className="text-[12px] font-semibold text-gray-600">
                For every <span className="text-mintcom-green">$1</span> → customer earns{' '}
                <span className="text-mintcom-green">10 PTS</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}

function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

/* ─── Staff = Main Settings focused on Employees table ──────────────────── */

function StaffShot() {
  const employees = [
    { name: 'Cafe Delight', username: 'owner', role: 'Owner', owner: true },
    { name: 'Sara Hassan', username: 'sara', role: 'Cashier', owner: false },
    { name: 'Omar Ali', username: 'omar', role: 'Barista', owner: false },
    { name: 'Maya Nour', username: 'maya', role: 'Manager', owner: false },
  ];
  return (
    <SettingsShell
      active="business"
      title="Main Settings"
      sub="Manage details for Cafe Delight"
    >
      <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden font-sans">
        {/* Employees — primary content for Staff Management card */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <p className="mb-2.5 px-1 text-lg font-black text-[#111827]">Employees (4)</p>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <span className="flex-1 text-[13px] font-bold text-[#111827]">Employee Name</span>
              <span className="flex-1 text-[13px] font-bold text-[#111827]">Username</span>
              <span className="w-24 text-[13px] font-bold text-[#111827]">Role</span>
              <div className="w-24 text-end">
                <span className="inline-flex items-center gap-1 rounded-xl bg-mintcom-green px-3 py-1.5 text-[12px] font-black text-white shadow-sm shadow-mintcom-green/25">
                  <span className="text-sm leading-none">+</span> Add
                </span>
              </div>
            </div>
            {employees.map((e) => (
              <div
                key={e.username}
                className="flex items-center gap-2 border-b border-gray-50 px-4 py-3 last:border-0"
                style={e.owner ? { background: '#FFFBEB' } : undefined}
              >
                <span className="flex-1 truncate text-[13px] font-medium text-[#111827]">{e.name}</span>
                <span className="flex-1 truncate text-[13px] text-gray-500">{e.username}</span>
                <span
                  className={`w-24 text-[13px] ${
                    e.owner ? 'font-bold text-amber-700' : 'font-semibold text-mintcom-green'
                  }`}
                >
                  {e.role}
                </span>
                <div className="flex w-24 items-center justify-end gap-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl text-mintcom-green">
                    <Pencil size={16} />
                  </span>
                  {e.owner ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl text-amber-700">
                      <Shield size={16} />
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl text-[#D55263]">
                      <Trash2 size={16} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}

/* ─── Reports = PosDemoReports ──────────────────────────────────────────── */

/** Currency like PosDemoReports money() */
const reportMoney = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/** Stat card — mirrors PosDemoReports StatCard (icon 42×42, title 11/500, value 15/700) */
function ReportStatCard({
  label,
  hint,
  value,
  icon,
  primary,
  chevron,
}: {
  label: string;
  hint?: string;
  value: string;
  icon: ReactNode;
  primary?: boolean;
  chevron?: boolean;
}) {
  return (
    <div
      className={`relative flex min-h-[68px] min-w-0 items-center gap-2.5 rounded-xl border p-2.5 text-start ${
        primary
          ? 'border-transparent bg-mintcom-green text-white shadow-sm shadow-mintcom-green/20'
          : 'border-gray-200/90 bg-white'
      }`}
    >
      <span
        className={`absolute end-2 top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full ${
          primary ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-400'
        }`}
      >
        <Info size={11} />
      </span>
      <span
        className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl ${
          primary ? 'bg-white text-mintcom-green' : 'bg-mintcom-green text-white'
        }`}
      >
        {icon}
      </span>
      <div className={`min-w-0 flex-1 pe-4 ${chevron ? 'pe-5' : ''}`}>
        <p
          className={`text-[11px] font-medium leading-snug ${
            primary ? 'text-white' : 'text-gray-500'
          }`}
        >
          {label}
        </p>
        {hint && (
          <p className={`text-[8px] font-medium leading-snug ${primary ? 'text-white/82' : 'text-gray-400'}`}>
            {hint}
          </p>
        )}
        <p
          className={`mt-0.5 text-[14px] font-bold tabular-nums leading-tight ${
            primary ? 'text-white' : 'text-[#111827]'
          }`}
        >
          {value}
        </p>
      </div>
      {chevron && (
        <ChevronRight
          size={16}
          className={`mb-0.5 shrink-0 self-end ${primary ? 'text-white' : 'text-gray-400'}`}
        />
      )}
    </div>
  );
}

/**
 * Advanced Reporting — mirrors current try-pos PosDemoReports General Report:
 * header (title + print) · filters (period/date/time/employee) · tabs · 8 cards · lists
 */
function ReportingShot() {
  return (
    <div
      className="flex h-full w-full overflow-hidden font-sans"
      style={{ width: DESIGN_W, height: DESIGN_H }}
    >
      <PosRail active="reports" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F5F5F7] p-3">
        {/* Header — Reporting + Print only (employee moved to filter row) */}
        <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
          <p className="text-[18px] font-bold tracking-[-0.02em] text-[#111827]">Reporting</p>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-mintcom-green text-white shadow-sm shadow-mintcom-green/30">
            <Printer size={16} />
          </span>
        </div>

        {/* Filters: Period | Date range | Time range | Employee */}
        <div className="mb-2 flex shrink-0 flex-wrap items-end gap-2">
          <div className="w-[120px] shrink-0">
            <p className="mb-0.5 text-[10px] font-medium text-gray-400">Period</p>
            <span className="flex h-9 items-center justify-between rounded-xl border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-[#111827]">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Calendar size={14} className="shrink-0 text-mintcom-green" />
                <span className="truncate">Last 7 days</span>
              </span>
              <ChevronDown size={13} className="shrink-0 text-gray-400" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[10px] font-medium text-gray-400">Date range</p>
            <span className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-[#111827]">
              <Calendar size={13} className="shrink-0 text-mintcom-green" />
              <span className="truncate">8 Jul 2026 - 14 Jul 2026</span>
            </span>
          </div>
          <div className="min-w-[140px] flex-1">
            <p className="mb-0.5 text-[10px] font-medium text-gray-400">Time range</p>
            <span className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-[#111827]">
              <Clock size={13} className="shrink-0 text-mintcom-green" />
              <span className="truncate">12:00 AM - 11:59 PM</span>
            </span>
          </div>
          <div className="min-w-[150px] flex-1">
            <p className="mb-0.5 text-[10px] font-medium text-gray-400">Employee</p>
            <div className="relative">
              <span className="flex h-9 w-full items-center rounded-xl border border-gray-200 bg-white py-2 ps-8 pe-7 text-[12px] font-semibold text-[#111827]">
                All Employees
              </span>
              <User
                size={14}
                className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-mintcom-green"
              />
              <ChevronDown
                size={13}
                className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Tabs — full-width underline like POS */}
        <div className="relative mb-2 flex shrink-0 border-b border-gray-200">
          {['General Report', 'Item Report'].map((t, i) => (
            <span
              key={t}
              className={`relative flex-1 py-2 text-center text-[12px] font-semibold ${
                i === 0 ? 'text-mintcom-green' : 'text-gray-500'
              }`}
            >
              {t}
              {i === 0 && (
                <span className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-t-full bg-mintcom-green" />
              )}
            </span>
          ))}
        </div>

        {/* 8 SalesSummaryCards — Net, Card, Cash, Refunds, Other, Hours, Orders, Pay-in/out */}
        <div className="mb-2 grid shrink-0 grid-cols-4 gap-2">
          <ReportStatCard
            primary
            chevron
            label="Net Sales"
            hint="Excludes tax & service/other charges"
            value={reportMoney(4462.96)}
            icon={<TrendingUp size={18} strokeWidth={2.25} />}
          />
          <ReportStatCard
            chevron
            label="Card Sales"
            value={reportMoney(2910)}
            icon={<CreditCard size={16} />}
          />
          <ReportStatCard label="Cash Sales" value={reportMoney(1540)} icon={<Banknote size={16} />} />
          <ReportStatCard
            label="Refunds"
            value={reportMoney(-48.5)}
            icon={<Undo2 size={15} />}
          />
          <ReportStatCard
            chevron
            label="Other Payments"
            value={reportMoney(370)}
            icon={<Receipt size={15} />}
          />
          <ReportStatCard
            chevron
            label="Total Hours Worked"
            value="32h 15m"
            icon={<Clock size={15} />}
          />
          <ReportStatCard label="Total Orders" value="318" icon={<Receipt size={15} />} />
          <ReportStatCard
            chevron
            label="PAY-IN/PAY-OUT"
            value="Non-sales transactions"
            icon={
              <span className="flex flex-col items-center leading-none">
                <ArrowDownLeft size={11} strokeWidth={2.5} />
                <ArrowUpRight size={11} strokeWidth={2.5} className="-mt-0.5" />
              </span>
            }
          />
        </div>

        {/* Orders & Receipts | Top 3 Selling Items */}
        <div className="grid min-h-0 flex-1 grid-cols-[1.35fr_1fr] gap-2.5 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-3">
              <p className="text-[14px] font-semibold text-[#111827]">Orders & Receipts</p>
              <span className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-1 text-[10px] font-semibold text-gray-500">
                <SlidersHorizontal size={12} />
                Filters
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {[
                {
                  no: '#1001',
                  pay: 'Card · Visa',
                  emp: 'Sara Hassan',
                  total: reportMoney(14.04),
                  status: 'Completed',
                },
                {
                  no: '#1002',
                  pay: 'Cash',
                  emp: 'Omar Ali',
                  total: reportMoney(3.78),
                  status: 'Completed',
                },
                {
                  no: '#1003',
                  pay: 'CliQ',
                  emp: 'Maya Nour',
                  total: reportMoney(15.12),
                  status: 'Completed',
                },
                {
                  no: '#1009',
                  pay: 'Card · Visa',
                  emp: 'Sara Hassan',
                  total: reportMoney(-4.86),
                  status: 'Refunded',
                },
              ].map((o) => (
                <div
                  key={o.no}
                  className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-bold text-[#111827]">{o.no}</p>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                          o.status === 'Refunded'
                            ? 'bg-red-50 text-[#D55263]'
                            : 'bg-mintcom-green/12 text-mintcom-green'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="truncate text-[10px] text-gray-400">
                      {o.pay} · {o.emp}
                    </p>
                  </div>
                  <span
                    className={`text-[12px] font-bold tabular-nums ${
                      o.status === 'Refunded' ? 'text-[#D55263]' : 'text-[#111827]'
                    }`}
                  >
                    {o.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-3">
              <p className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
                Top 3 Selling Items
              </p>
              <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-xl border border-gray-200 bg-white py-0.5 ps-1.5 pe-1 text-[10px] font-semibold text-[#111827]">
                <Calendar size={12} className="text-mintcom-green" />
                This Week
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-mintcom-green/10 text-mintcom-green">
                  <ChevronDown size={10} />
                </span>
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-between p-2.5">
              {[
                { name: 'Latte', qty: 142, rev: 639 },
                { name: 'Croissant', qty: 98, rev: 392 },
                { name: 'Espresso', qty: 86, rev: 301 },
              ].map((item, i) => (
                <div
                  key={item.name}
                  className="flex min-h-0 flex-1 items-center gap-2 border-b border-gray-100 px-1 last:border-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <img src={DEFAULT_IMG} alt="" className="h-7 w-7 object-contain" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#111827]">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.qty} sold</p>
                  </div>
                  <p className="text-[12px] font-semibold tabular-nums text-mintcom-green">
                    {reportMoney(item.rev)}
                  </p>
                  <span className="text-[10px] font-bold text-gray-400">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Recipe & Cost Management — mirrors try-pos DemoManufacturingPanel
 * inside Settings → Recipe Operations (Raw materials tab, default).
 */
function ProductionShot() {
  const materials = [
    {
      name: 'Espresso beans',
      qty: '4.2 kg',
      cost: 18,
      unit: 'kg',
      value: 75.6,
      low: false,
      threshold: '2 kg',
      bar: 55,
    },
    {
      name: 'Whole milk',
      qty: '12 L',
      cost: 1.2,
      unit: 'L',
      value: 14.4,
      low: false,
      threshold: '4 L',
      bar: 75,
    },
    {
      name: 'Oat milk',
      qty: '1.5 L',
      cost: 2.4,
      unit: 'L',
      value: 3.6,
      low: true,
      threshold: '3 L',
      bar: 18,
    },
    {
      name: 'Flour',
      qty: '8 kg',
      cost: 1.1,
      unit: 'kg',
      value: 8.8,
      low: false,
      threshold: '3 kg',
      bar: 65,
    },
  ] as const;

  return (
    <SettingsShell
      active="manufacturing"
      title="Recipe Operations"
      sub="View and update recipes and ingredients"
    >
      <div className="mx-auto flex h-full min-h-0 max-w-3xl flex-col gap-2 overflow-hidden font-sans">
        {/* Top tabs — Segmented Raw materials | Recipe management */}
        <div className="relative flex shrink-0 rounded-xl border border-gray-200 bg-[#fafaf8] p-1">
          {(
            [
              { id: 'inv', label: 'Raw materials', Icon: Package, on: true },
              { id: 'rec', label: 'Recipe management', Icon: BookOpen, on: false },
            ] as const
          ).map(({ id, label, Icon, on }) => (
            <span
              key={id}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold sm:text-xs ${
                on
                  ? 'bg-mintcom-green text-white shadow-md shadow-mintcom-green/25'
                  : 'text-gray-500'
              }`}
            >
              <Icon size={14} />
              {label}
            </span>
          ))}
        </div>

        {/* Search + Add material */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              size={13}
              className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <span className="flex w-full items-center rounded-xl border border-gray-200 bg-white py-2 ps-8 pe-3 text-[11px] font-medium text-gray-400">
              Search materials…
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-mintcom-green px-3 py-2 text-[11px] font-black text-white shadow-md shadow-mintcom-green/20">
            <Plus size={14} /> Add material
          </span>
        </div>

        {/* Low stock banner */}
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">
          <AlertTriangle size={14} />
          1 material at or below low-stock threshold
        </div>

        {/* Sub-tabs Raw stock | Intermediate stock */}
        <div className="relative flex shrink-0 rounded-xl border border-gray-200 bg-[#fafaf8] p-1">
          <span className="flex flex-1 items-center justify-center rounded-xl bg-mintcom-green px-2 py-2 text-[11px] font-bold text-white shadow-md shadow-mintcom-green/25 sm:text-xs">
            Raw stock
          </span>
          <span className="flex flex-1 items-center justify-center rounded-xl px-2 py-2 text-[11px] font-bold text-gray-500 sm:text-xs">
            Intermediate stock
          </span>
        </div>

        {/* Material list */}
        <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden">
          {materials.map((m) => (
            <div
              key={m.name}
              className="rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex items-start gap-2.5 p-2.5">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    m.low ? 'bg-red-500/15 text-[#D55263]' : 'bg-mintcom-green/15 text-mintcom-green'
                  }`}
                >
                  <Package size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-black text-[#111827]">{m.name}</p>
                    {m.low && (
                      <span className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase text-[#D55263]">
                        Low
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {m.qty} · {reportMoney(m.cost)}/{m.unit} · stock value{' '}
                    <span className="font-bold text-mintcom-green">{reportMoney(m.value)}</span>
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${m.low ? 'bg-[#D55263]' : 'bg-mintcom-green'}`}
                      style={{ width: `${m.bar}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[9px] font-bold text-gray-400">
                    Low at ≤ {m.threshold}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <span className="rounded-xl bg-mintcom-green px-2.5 py-1.5 text-center text-[10px] font-black text-white">
                    Restock
                  </span>
                  <span className="rounded-xl border border-gray-200 px-2.5 py-1.5 text-center text-[10px] font-bold text-[#111827]">
                    Edit
                  </span>
                  <span className="flex items-center justify-center rounded-xl p-1.5 text-[#D55263]">
                    <Trash2 size={13} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SettingsShell>
  );
}

/* ─── AI ────────────────────────────────────────────────────────────────── */

function AiShot() {
  return (
    <div className="flex h-full w-full overflow-hidden" style={{ width: DESIGN_W, height: DESIGN_H }}>
      <PosRail active="dashboard" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F5F5F7]">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-3.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mintcom-green text-white shadow-sm shadow-mintcom-green/30">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-[17px] font-extrabold text-[#111827]">Mintcom AI</p>
            <p className="text-[12px] text-gray-500">Built into every Mintcom dashboard</p>
          </div>
          <span className="ms-auto rounded-full bg-mintcom-green/12 px-3 py-1 text-[11px] font-bold text-mintcom-green">
            Cafe Delight
          </span>
        </header>
        <div className="min-h-0 flex-1 space-y-3 overflow-hidden p-5">
          <div className="flex justify-end">
            <div className="max-w-[68%] rounded-2xl rounded-ee-md bg-mintcom-green px-4 py-3 text-[13px] font-semibold text-white shadow-sm">
              What sold best today?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[76%] rounded-2xl rounded-es-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-[13px] font-medium leading-relaxed text-[#111827]">
                Espresso led with <span className="font-extrabold text-mintcom-green">142 cups</span>, up 18% from
                yesterday. Peak rush was 9–11 AM — schedule 2 baristas for tomorrow morning.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[68%] rounded-2xl rounded-ee-md bg-mintcom-green px-4 py-3 text-[13px] font-semibold text-white shadow-sm">
              Suggest a combo deal
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[76%] rounded-2xl rounded-es-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-[13px] font-medium leading-relaxed text-[#111827]">
                Try a <span className="font-extrabold">“Croissant + Latte”</span> bundle at{' '}
                <span className="font-extrabold text-mintcom-green">{posAmount(5.5)}</span> — projects +12% basket.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {['Forecast tomorrow', 'Slow movers', 'Staff hours'].map((q) => (
              <span
                key={q}
                className="rounded-full border border-mintcom-green/30 bg-white px-3 py-1.5 text-[12px] font-bold text-mintcom-green"
              >
                {q}
              </span>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-200 bg-white px-5 py-3">
          <div className="flex h-12 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4">
            <span className="flex-1 text-[13px] text-gray-400">Ask Mintcom AI…</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mintcom-green text-white">
              <Sparkles size={14} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Multi-branch ──────────────────────────────────────────────────────── */

function BranchShot() {
  const locs = [
    { name: 'Downtown', sales: 1820, staff: 6, linked: true },
    { name: 'Mall Branch', sales: 1540, staff: 5, linked: true },
    { name: 'Airport Kiosk', sales: 980, staff: 3, linked: true },
    { name: 'University', sales: 480, staff: 2, linked: false },
  ];
  const total = locs.filter((l) => l.linked).reduce((s, l) => s + l.sales, 0);
  return (
    <div className="flex h-full w-full overflow-hidden" style={{ width: DESIGN_W, height: DESIGN_H }}>
      <PosRail active="dashboard" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F5F5F7]">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mintcom-green/15 text-mintcom-green">
              <Building2 size={20} />
            </span>
            <div>
              <p className="text-[17px] font-extrabold text-[#111827]">Cafe Delight</p>
              <p className="text-[12px] text-gray-500">Brand · multi-location control</p>
            </div>
          </div>
          <div className="rounded-2xl border border-mintcom-green/25 bg-mintcom-green/10 px-4 py-2 text-end">
            <p className="text-[10px] font-bold uppercase tracking-wide text-mintcom-green">Unified total</p>
            <p className="text-[18px] font-extrabold tabular-nums text-[#111827]">{posAmount(total)}</p>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#111827]">Locations under brand</p>
            <span className="text-[12px] font-bold text-mintcom-green">Link all</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {locs.map((loc) => (
              <div
                key={loc.name}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${
                  loc.linked ? 'border-mintcom-green/30' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-mintcom-green">
                      <MapPin size={18} />
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-[#111827]">{loc.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {loc.staff} staff · today {posAmount(loc.sales)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      loc.linked ? 'bg-mintcom-green/15 text-mintcom-green' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {loc.linked ? 'Linked' : 'Link'}
                  </span>
                </div>
                {loc.linked && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-mintcom-green"
                      style={{ width: `${(loc.sales / total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple & Easy Interface — mirrors try-pos DemoDashboardScreen:
 * ShiftManagementCard · left Net/Cash/Card · right Orders/Pay-in-out/Other/Hours · Sales trend
 */
function SimpleUiShot() {
  const netPts = [12, 28, 45, 62, 88, 110, 145, 180, 220, 265, 310, 380];
  const cashPts = [8, 18, 28, 38, 50, 62, 80, 95, 115, 140, 165, 200];
  const cardPts = [4, 8, 14, 20, 30, 40, 52, 68, 85, 100, 118, 145];
  const maxY = 400;

  const toPoly = (pts: number[]) =>
    pts
      .map((v, i) => {
        const x = (i / (pts.length - 1)) * 100;
        const y = 100 - (v / maxY) * 100;
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <div
      className="flex h-full w-full overflow-hidden font-sans"
      style={{ width: DESIGN_W, height: DESIGN_H }}
    >
      <PosRail active="dashboard" />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 overflow-hidden bg-[#F5F5F7] p-2.5">
        {/* Shift management card */}
        <div className="shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 p-3">
            <div className="min-w-0">
              <p className="text-sm font-black text-[#111827]">
                You&apos;re Doing Great, Sam Cashier
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">Tuesday, 14 Jul 2026</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-mintcom-green bg-white px-3 py-1.5 text-[12px] font-bold text-mintcom-green">
                <List size={15} /> My Orders
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#d55263] px-3 py-1.5 text-[12px] font-bold text-white">
                <LogOut size={15} /> Close Shift
              </span>
            </div>
          </div>
          <div className="mx-3 mb-3 rounded-xl bg-mintcom-green px-3.5 py-2.5 text-white">
            <p className="text-[13px] font-bold leading-tight">Current shift of Sam Cashier</p>
            <p className="mt-0.5 text-[11px] font-medium text-white/90">
              Shift started Tuesday 7/14/26 - 09:12 AM
            </p>
          </div>
        </div>

        {/* Metric grid — left Net/Cash/Card · right 2×2 + chart */}
        <div className="flex min-h-0 flex-1 gap-2.5 overflow-hidden">
          {/* LEFT */}
          <div className="flex w-[28%] min-w-0 shrink-0 flex-col gap-2.5">
            {/* Net Sales primary */}
            <div className="flex min-h-0 flex-1 flex-col justify-between rounded-xl bg-mintcom-green p-3 text-white">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-mintcom-green">
                  <TrendingUp size={20} strokeWidth={2.25} />
                </span>
                <div className="min-w-0 text-start">
                  <p className="text-[13px] font-semibold leading-tight">Net Sales</p>
                  <p className="mt-0.5 text-[10px] font-normal text-white/80">
                    Excludes tax and other charges
                  </p>
                </div>
              </div>
              <p className="mt-2 text-center text-[22px] font-extrabold tabular-nums tracking-tight">
                {reportMoney(1284.5)}
              </p>
            </div>

            {/* Cash Sales — MetricSalesCard style */}
            <div className="flex min-h-0 flex-1 flex-col justify-between rounded-xl border border-gray-200 bg-[#F3F4F6] p-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mintcom-green text-white">
                  <Banknote size={18} />
                </span>
                <div className="min-w-0 text-start">
                  <p className="text-[12px] font-semibold text-[#6B7280]">Cash Sales</p>
                  <p className="mt-0.5 text-[10px] text-[#9CA3AF]">Excludes tax and other charges</p>
                </div>
              </div>
              <p className="mt-1.5 text-center text-[20px] font-extrabold tabular-nums tracking-tight text-[#1F2937]">
                {reportMoney(465)}
              </p>
            </div>

            {/* Card Sales */}
            <div className="flex min-h-0 flex-1 flex-col justify-between rounded-xl border border-gray-200 bg-[#F3F4F6] p-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mintcom-green text-white">
                  <CreditCard size={18} />
                </span>
                <div className="min-w-0 text-start">
                  <p className="text-[12px] font-semibold text-[#6B7280]">Card Sales</p>
                  <p className="mt-0.5 text-[10px] text-[#9CA3AF]">Excludes tax and other charges</p>
                </div>
              </div>
              <p className="mt-1.5 text-center text-[20px] font-extrabold tabular-nums tracking-tight text-[#1F2937]">
                {reportMoney(765)}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5">
            <div className="grid shrink-0 grid-cols-2 gap-2.5">
              {/* Number of Orders */}
              <div className="relative flex min-h-[72px] items-center gap-2.5 rounded-xl border border-gray-200 bg-[#F3F4F6] p-2.5">
                <span className="absolute end-2 top-2 text-[#9CA3AF]">
                  <Info size={13} />
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mintcom-green text-white">
                  <Receipt size={16} />
                </span>
                <div className="min-w-0 flex-1 pe-3 text-start">
                  <p className="truncate text-[10px] font-bold text-[#6B7280]">Number of Orders</p>
                  <p className="mt-0.5 truncate text-[15px] font-extrabold tabular-nums text-[#1F2937]">
                    42
                  </p>
                </div>
              </div>

              {/* PAY-IN / PAY-OUT */}
              <div className="flex min-h-[72px] items-center gap-2.5 rounded-xl border border-gray-200 bg-[#F3F4F6] p-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mintcom-green text-white">
                  <ArrowUpDown size={16} />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
                      PAY-IN
                    </span>
                    <span className="text-[12px] font-bold tabular-nums text-mintcom-green">
                      {reportMoney(50)}
                    </span>
                  </div>
                  <div className="h-px bg-[#E5E7EB]" />
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
                      PAY-OUT
                    </span>
                    <span className="text-[12px] font-bold tabular-nums text-[#d55263]">
                      {reportMoney(20)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-2.5">
              <div className="relative flex min-h-[72px] items-center gap-2.5 rounded-xl border border-gray-200 bg-[#F3F4F6] p-2.5">
                <span className="absolute end-2 top-2 text-[#9CA3AF]">
                  <Info size={13} />
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mintcom-green text-white">
                  <Receipt size={16} />
                </span>
                <div className="min-w-0 flex-1 pe-3 text-start">
                  <p className="truncate text-[10px] font-bold text-[#6B7280]">Other Payment Methods</p>
                  <p className="mt-0.5 truncate text-[15px] font-extrabold tabular-nums text-[#1F2937]">
                    {reportMoney(54.5)}
                  </p>
                </div>
              </div>
              <div className="relative flex min-h-[72px] items-center gap-2.5 rounded-xl border border-gray-200 bg-[#F3F4F6] p-2.5">
                <span className="absolute end-2 top-2 text-[#9CA3AF]">
                  <Info size={13} />
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mintcom-green text-white">
                  <Clock size={16} />
                </span>
                <div className="min-w-0 flex-1 pe-3 text-start">
                  <p className="truncate text-[10px] font-bold text-[#6B7280]">Total Hours Worked</p>
                  <p className="mt-0.5 truncate text-[15px] font-extrabold tabular-nums text-[#1F2937]">
                    4h 12m
                  </p>
                </div>
              </div>
            </div>

            {/* Sales trend chart — POS SalesTrendChartCard style */}
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm">
              <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Activity size={14} className="text-mintcom-green" />
                  <p className="text-[12px] font-bold text-[#111827]">Sales trend</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-mintcom-green/15 px-1.5 py-0.5 text-[9px] font-black uppercase text-mintcom-green">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mintcom-green" />
                    Live
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-[#F3F4F6] px-2 py-1 text-[10px] font-semibold text-[#6B7280]">
                  Active shift
                  <ChevronDown size={11} />
                </span>
              </div>
              {/* Legend */}
              <div className="mb-1.5 flex shrink-0 flex-wrap gap-2 text-[9px] font-bold">
                {(
                  [
                    { c: '#7dc6a2', l: 'Net' },
                    { c: '#A8B8BF', l: 'Cash' },
                    { c: '#737182', l: 'Card' },
                    { c: '#D8A85B', l: 'Other' },
                  ] as const
                ).map((s) => (
                  <span key={s.l} className="inline-flex items-center gap-1 text-[#6B7280]">
                    <span className="h-1.5 w-3 rounded-full" style={{ background: s.c }} />
                    {s.l}
                  </span>
                ))}
              </div>
              <div className="relative min-h-0 flex-1">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                  {/* grid lines */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth="0.4"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  <polyline
                    fill="none"
                    stroke="#A8B8BF"
                    strokeWidth="1.2"
                    vectorEffect="non-scaling-stroke"
                    points={toPoly(cashPts)}
                  />
                  <polyline
                    fill="none"
                    stroke="#737182"
                    strokeWidth="1.2"
                    vectorEffect="non-scaling-stroke"
                    points={toPoly(cardPts)}
                  />
                  <polyline
                    fill="none"
                    stroke="#7dc6a2"
                    strokeWidth="1.8"
                    vectorEffect="non-scaling-stroke"
                    points={toPoly(netPts)}
                  />
                </svg>
              </div>
              <div className="mt-0.5 flex shrink-0 justify-between text-[8px] font-semibold text-gray-400">
                <span>9:00</span>
                <span>11:00</span>
                <span>1:00</span>
                <span>3:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Onboarding ────────────────────────────────────────────────────────── */

function OnboardShot() {
  const steps = [
    { label: 'Create location', done: true },
    { label: 'Add products', done: true },
    { label: 'Invite staff', done: true },
    { label: 'Set payments', done: false },
    { label: 'Run first sale', done: false },
  ];
  const done = steps.filter((s) => s.done).length;
  return (
    <div className="flex h-full w-full overflow-hidden" style={{ width: DESIGN_W, height: DESIGN_H }}>
      <PosRail active="settings" />
      <div className="flex min-w-0 flex-1 items-center justify-center bg-[#F5F5F7] p-8">
        <div className="w-full max-w-[500px] rounded-3xl border border-gray-100 bg-white p-7 shadow-lg shadow-black/5">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mintcom-green text-white shadow-md shadow-mintcom-green/30">
              <Zap size={22} />
            </span>
            <div>
              <p className="text-[20px] font-extrabold text-[#111827]">Welcome aboard</p>
              <p className="text-[13px] text-gray-500">Get Cafe Delight ready in minutes</p>
            </div>
          </div>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-mintcom-green" style={{ width: `${(done / steps.length) * 100}%` }} />
          </div>
          <p className="mb-4 text-[12px] font-bold text-mintcom-green">
            {done} of {steps.length} steps complete
          </p>
          <div className="space-y-2.5">
            {steps.map((s, i) => (
              <div
                key={s.label}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
                  s.done
                    ? 'border-mintcom-green/25 bg-mintcom-green/5'
                    : i === done
                      ? 'border-mintcom-green bg-white shadow-sm'
                      : 'border-gray-100 bg-gray-50'
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-black ${
                    s.done
                      ? 'bg-mintcom-green text-white'
                      : i === done
                        ? 'border-2 border-mintcom-green text-mintcom-green'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s.done ? <Check size={14} strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={`flex-1 text-[14px] font-bold ${
                    s.done ? 'text-gray-500 line-through' : 'text-[#111827]'
                  }`}
                >
                  {s.label}
                </span>
                {i === done && <span className="text-[11px] font-bold text-mintcom-green">Next</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Secure ────────────────────────────────────────────────────────────── */

function SecureShot() {
  const checks = [
    { label: 'Encrypted backups', on: true },
    { label: '2-factor authentication', on: true },
    { label: 'Role-based access', on: true },
    { label: 'Session timeout', on: true },
    { label: 'Device trust list', on: false },
  ];
  const score = 80;
  return (
    <div className="flex h-full w-full overflow-hidden" style={{ width: DESIGN_W, height: DESIGN_H }}>
      <PosRail active="settings" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F5F5F7]">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mintcom-green/15 text-mintcom-green">
            <Shield size={20} />
          </span>
          <div>
            <p className="text-[17px] font-extrabold text-[#111827]">Security</p>
            <p className="text-[12px] text-gray-500">Cafe Delight · protection controls</p>
          </div>
          <span className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-mintcom-green/15 px-3 py-1 text-[11px] font-bold text-mintcom-green">
            <span className="h-1.5 w-1.5 rounded-full bg-mintcom-green" />
            Live
          </span>
        </header>
        <div className="min-h-0 flex-1 grid grid-cols-[1fr_1.2fr] gap-4 p-5">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f0f0f0" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#7dc6a2"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 327} 327`}
                />
              </svg>
              <div className="text-center">
                <p className="text-[32px] font-extrabold tabular-nums text-[#111827]">{score}</p>
                <p className="text-[11px] font-bold text-mintcom-green">Protected</p>
              </div>
            </div>
            <p className="mt-4 text-center text-[12px] text-gray-500">Encrypted · backed up · 99.9% uptime</p>
          </div>
          <div className="space-y-2.5 overflow-hidden">
            {checks.map((c) => (
              <div
                key={c.label}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      c.on ? 'bg-mintcom-green/15 text-mintcom-green' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {c.on ? <Lock size={16} /> : <Shield size={16} />}
                  </span>
                  <span className="text-[14px] font-bold text-[#111827]">{c.label}</span>
                </div>
                <Toggle on={c.on} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Loyalty modal (FullPosPlayground LoyaltyModal FOUND state) ────────── */

function LoyaltyShot() {
  return (
    <div className="flex h-full w-full overflow-hidden" style={{ width: DESIGN_W, height: DESIGN_H }}>
      <PosRail active="sales" />
      <div className="relative flex min-w-0 flex-1 overflow-hidden bg-[#f6f3ec]">
        {/* Dimmed sales grid behind */}
        <div className="flex min-w-0 flex-1 flex-col opacity-35">
          <div className="border-b border-gray-100 bg-white px-4 py-3">
            <p className="text-[13px] font-bold text-gray-500">Sales · Order #41</p>
          </div>
          <div className="grid flex-1 grid-cols-3 gap-2 p-3">
            {['Espresso', 'Latte', 'Croissant', 'Muffin', 'Cookie', 'Tea'].map((n) => (
              <div key={n} className="rounded-xl border border-gray-100 bg-white p-2">
                <div className="mb-1 flex h-12 items-center justify-center">
                  <img src={DEFAULT_IMG} alt="" className="h-10 w-10 object-contain" />
                </div>
                <p className="text-[11px] font-bold">{n}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4">
          <div className="flex h-full max-h-[500px] w-[380px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-mintcom-green" />
                <p className="text-[15px] font-bold text-[#111827]">Loyalty</p>
              </div>
              <X size={18} className="text-gray-400" />
            </div>
            {/* Tabs like real modal */}
            <div className="flex border-b border-gray-100">
              {[
                { label: 'Search', icon: Search },
                { label: 'Scan QR', icon: Hash },
                { label: 'New Customer', icon: User },
              ].map((t, i) => (
                <span
                  key={t.label}
                  className={`flex flex-1 items-center justify-center gap-1 py-2.5 text-[11px] font-bold ${
                    i === 0 ? 'border-b-2 border-mintcom-green text-mintcom-green' : 'text-gray-400'
                  }`}
                >
                  <t.icon size={13} />
                  {t.label}
                </span>
              ))}
            </div>
            <div className="border-b border-gray-50 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mintcom-green text-[14px] font-bold text-white">
                  NA
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-[#111827]">Nora Alami</p>
                  <p className="text-[12px] text-gray-500">+1 555 0142 · Gold</p>
                </div>
                <div className="text-end">
                  <p className="text-[20px] font-extrabold tabular-nums text-mintcom-green">1,240</p>
                  <p className="text-[10px] font-bold uppercase text-gray-400">points</p>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-hidden p-3.5">
              <p className="text-[11px] font-black uppercase tracking-wide text-mintcom-green">
                <Gift size={12} className="me-1 inline" />
                Rewards
              </p>
              {[
                { name: 'Free coffee', pts: 100, type: 'Free Item' },
                { name: '10% off order', pts: 250, type: '10% off' },
              ].map((r) => (
                <div
                  key={r.name}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-[#fafaf9] px-3 py-2.5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mintcom-green/15 text-mintcom-green">
                    <Gift size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-[#111827]">{r.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {r.type} · {r.pts} points
                    </p>
                  </div>
                  <span className="rounded-lg bg-mintcom-green px-2.5 py-1.5 text-[11px] font-bold text-white">
                    Apply
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 px-4 py-3">
              <span className="flex w-full items-center justify-center rounded-xl bg-mintcom-green py-3 text-[13px] font-bold text-white">
                Attach to order
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile ────────────────────────────────────────────────────────────── */

function MobileShot() {
  const alerts = [
    {
      title: 'Shortage — Sara',
      desc: 'Expected $420.00 — Counted $395.50',
      pill: '−$24.50',
      loc: 'Downtown',
      time: 'Just now',
      color: '#FF6B7A',
      Icon: AlertTriangle,
    },
    {
      title: 'Low stock',
      desc: 'Espresso beans has 4 units remaining',
      pill: '4 left',
      loc: 'Mall',
      time: '12m ago',
      color: '#818CF8',
      Icon: Package,
    },
    {
      title: 'Refund',
      desc: 'Order #4218 refunded by Omar',
      pill: '$12.00',
      loc: 'Downtown',
      time: '1h ago',
      color: '#E8C547',
      Icon: RotateCcw,
    },
    {
      title: 'Critical stock',
      desc: 'Whole milk has 1 L remaining',
      pill: '1 left',
      loc: 'Downtown',
      time: '3h ago',
      color: '#FF6B7A',
      Icon: AlertOctagon,
    },
  ];
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0f7f4] via-[#f6f3ec] to-[#e8f0ec]"
      style={{ width: DESIGN_W, height: DESIGN_H }}
    >
      <div className="absolute left-[12%] top-[18%] h-40 w-56 rotate-[-8deg] rounded-2xl border border-white/60 bg-white/50 shadow-lg" />
      <div className="absolute bottom-[16%] right-[10%] h-36 w-52 rotate-[10deg] rounded-2xl border border-white/60 bg-white/40 shadow-lg" />

      <div className="relative z-10 flex items-center gap-10">
        <div
          className="relative w-[280px] overflow-hidden rounded-[36px] border-[6px] border-[#1F1D2B] bg-[#0f0f12] shadow-2xl shadow-black/30"
          style={{ height: 500 }}
        >
          <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-[#1F1D2B]" />
          <div className="flex h-full flex-col bg-[#111114] pt-8 text-white">
            <div className="flex items-center justify-between px-4 pb-3">
              <div>
                <p className="text-[11px] font-semibold text-white/50">Mintcom</p>
                <p className="text-[17px] font-extrabold">Alerts</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Bell size={15} />
              </span>
            </div>
            <div className="mb-3 flex gap-1.5 px-3">
              {['All', 'Cash', 'Stock', 'Refunds'].map((t, i) => (
                <span
                  key={t}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    i === 0 ? 'bg-mintcom-green text-[#111]' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-hidden px-3 pb-4">
              {alerts.map((a) => {
                const Icon = a.Icon;
                return (
                  <div key={a.title} className="rounded-2xl border border-white/8 bg-white/[0.06] p-3">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${a.color}33`, color: a.color }}
                      >
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[12px] font-bold">{a.title}</p>
                          <span
                            className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black"
                            style={{ backgroundColor: `${a.color}33`, color: a.color }}
                          >
                            {a.pill}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-white/55">{a.desc}</p>
                        <p className="mt-1 text-[9px] font-semibold text-white/35">
                          {a.loc} · {a.time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex w-[260px] flex-col gap-4">
          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-md">
            <Smartphone size={18} className="mb-2 text-mintcom-green" />
            <p className="text-[14px] font-bold text-[#111827]">Owner mobile app</p>
            <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
              Cash, stock & refund alerts — same live data as try-pos Notifications.
            </p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-md">
            <div className="flex items-center gap-2 text-[12px] font-bold text-mintcom-green">
              <CircleCheck size={16} />
              Push banners
            </div>
            <p className="mt-1 text-[12px] text-gray-500">Shortage, overage & low-stock pings</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Router ────────────────────────────────────────────────────────────── */

const ALL_STATIC_IDS = [
  'pointOfSale',
  'salesControl',
  'staffManagement',
  'advancedReporting',
  'production',
  'aiSystem',
  'multiBranch',
  'simpleUI',
  'fastOnboarding',
  'secure',
  'loyalty',
  'mobileApp',
] as const;

export const STATIC_FEATURE_SCREENSHOTS = new Set<string>(ALL_STATIC_IDS);

export function isStaticFeatureScreenshot(featureId?: string) {
  return Boolean(featureId && STATIC_FEATURE_SCREENSHOTS.has(featureId));
}

export function hasFeatureScreenshot(featureId?: string) {
  return isStaticFeatureScreenshot(featureId);
}

const TITLES: Record<string, string> = {
  salesControl: 'Payment processes',
  staffManagement: 'Employees',
  advancedReporting: 'Reporting',
  production: 'Recipe operations',
  aiSystem: 'AI',
  multiBranch: 'Brands',
  simpleUI: 'Dashboard',
  fastOnboarding: 'Onboarding',
  secure: 'Security',
  loyalty: 'Loyalty',
  mobileApp: 'Mobile',
};

export function FeatureScreenshot({
  featureId,
  side,
}: {
  featureId?: string;
  side?: boolean;
}) {
  if (!featureId) return null;
  if (featureId === 'pointOfSale') {
    return <FeaturePosScreenshot side={side} />;
  }

  const title = TITLES[featureId] ?? 'Mintcom POS';
  let body: ReactNode = null;
  let bg = '#F5F5F7';
  switch (featureId) {
    case 'salesControl':
      body = <SalesControlShot />;
      break;
    case 'staffManagement':
      body = <StaffShot />;
      break;
    case 'advancedReporting':
      body = <ReportingShot />;
      break;
    case 'production':
      body = <ProductionShot />;
      break;
    case 'aiSystem':
      body = <AiShot />;
      break;
    case 'multiBranch':
      body = <BranchShot />;
      break;
    case 'simpleUI':
      body = <SimpleUiShot />;
      break;
    case 'fastOnboarding':
      body = <OnboardShot />;
      break;
    case 'secure':
      body = <SecureShot />;
      break;
    case 'loyalty':
      body = <LoyaltyShot />;
      bg = '#f6f3ec';
      break;
    case 'mobileApp':
      body = <MobileShot />;
      bg = 'transparent';
      break;
    default:
      return null;
  }

  return (
    <FeatureShotFrame title={title} side={side} bg={bg}>
      {body}
    </FeatureShotFrame>
  );
}
