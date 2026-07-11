import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Building2,
  CheckCheck,
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Layers,
  Mail,
  Package,
  Percent,
  ShoppingBag,
  Tag,
  TrendingUp,
  Wallet,
} from 'lucide-react';

const money = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

type Staff = { id: string; name: string; role: string; pin: string; emoji: string };

/** Full-height screen shell — no page scroll; children fill 100% of remaining app area */
function Fill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden p-2.5 sm:p-3 md:p-4 ${className}`}>
      {children}
    </div>
  );
}

function ScreenTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2 sm:mb-3">
      <div className="min-w-0">
        <h2 className="font-barlow text-lg font-black leading-tight text-text-primary dark:text-white sm:text-xl">
          {title}
        </h2>
        {subtitle && (
          <p className="truncate text-[11px] text-text-secondary dark:text-mintcom-textSecondary sm:text-xs">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/8 dark:bg-mintcom-surface sm:rounded-[20px] sm:p-3.5 ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Dashboard — fills viewport ────────────────────────────────────────── */
export function DemoDashboardScreen({
  staff,
  shiftOrders,
  shiftRevenue,
  heldCount,
  onGoSales,
}: {
  staff: Staff | null;
  shiftOrders: number;
  shiftRevenue: number;
  heldCount: number;
  onGoSales: () => void;
}) {
  const baseOrders = 18;
  const baseRevenue = 642.5;
  const orders = baseOrders + shiftOrders;
  const revenue = baseRevenue + shiftRevenue;
  const avgTicket = orders > 0 ? revenue / orders : 0;
  const cashShare = revenue * 0.42;
  const cardShare = revenue * 0.48;
  const otherShare = revenue * 0.1;

  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const bars = [28, 45, 62, 88, 70, 55, 92, 75, 48];
  const maxBar = Math.max(...bars);

  return (
    <Fill>
      <ScreenTitle
        title="Dashboard"
        subtitle={`Live shift · ${staff?.name ?? 'Cashier'} · Cafe Delight`}
        action={
          <button
            type="button"
            onClick={onGoSales}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-mintcom-green px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs"
          >
            <ShoppingBag size={14} /> Open sales
          </button>
        }
      />

      <div className="grid min-h-0 flex-1 grid-rows-[auto_auto_minmax(0,1.2fr)_minmax(0,1fr)] gap-2 sm:gap-2.5">
        {/* Shift banner */}
        <Card className="shrink-0 border-mintcom-green/25 !py-2.5 bg-mintcom-green/5 dark:bg-mintcom-green/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mintcom-green text-lg text-white sm:h-11 sm:w-11 sm:text-xl">
                {staff?.emoji ?? '👤'}
              </span>
              <div>
                <p className="text-xs font-black text-text-primary dark:text-white sm:text-sm">Shift open</p>
                <p className="text-[10px] text-text-secondary dark:text-mintcom-textSecondary">
                  Started 09:02 · Opening cash $150.00
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[9px] font-bold text-mintcom-green shadow-sm dark:bg-mintcom-dark">
                Cash in / out
              </span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[9px] font-bold text-text-secondary shadow-sm dark:bg-mintcom-dark dark:text-mintcom-textSecondary">
                My orders
              </span>
            </div>
          </div>
        </Card>

        {/* KPI row */}
        <div className="grid shrink-0 grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { label: 'Net sales', value: money(revenue), icon: TrendingUp },
            { label: 'Orders', value: String(orders), icon: ShoppingBag },
            { label: 'Avg ticket', value: money(avgTicket), icon: CreditCard },
            { label: 'Held open', value: String(heldCount), icon: Layers },
          ].map((k) => (
            <Card key={k.label} className="!p-2.5 sm:!p-3">
              <div className="mb-1 flex items-center justify-between">
                <k.icon size={14} className="text-mintcom-green" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary dark:text-mintcom-gray">
                  Today
                </span>
              </div>
              <p className="text-base font-black tabular-nums text-text-primary dark:text-white sm:text-xl">
                {k.value}
              </p>
              <p className="text-[10px] font-bold text-text-secondary dark:text-mintcom-textSecondary sm:text-xs">
                {k.label}
              </p>
            </Card>
          ))}
        </div>

        {/* Charts row — fills mid band */}
        <div className="grid min-h-0 gap-2 lg:grid-cols-5">
          <Card className="flex min-h-0 flex-col lg:col-span-3">
            <div className="mb-1.5 flex shrink-0 items-center justify-between">
              <p className="text-xs font-black text-text-primary dark:text-white sm:text-sm">Sales by hour</p>
              <span className="text-[9px] font-bold text-text-tertiary dark:text-mintcom-gray">Demo</span>
            </div>
            <div className="flex min-h-0 flex-1 items-end gap-1 sm:gap-1.5">
              {bars.map((h, i) => (
                <div key={hours[i]} className="flex h-full min-h-0 flex-1 flex-col items-center justify-end gap-0.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(h / maxBar) * 100}%` }}
                    transition={{ delay: i * 0.03, type: 'spring', stiffness: 200, damping: 22 }}
                    className="w-full min-h-[6px] rounded-t-md bg-mintcom-green/80"
                    style={{ maxHeight: '100%' }}
                  />
                  <span className="shrink-0 text-[8px] font-bold text-text-tertiary dark:text-mintcom-gray sm:text-[9px]">
                    {hours[i]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex min-h-0 flex-col lg:col-span-2">
            <p className="mb-2 shrink-0 text-xs font-black text-text-primary dark:text-white sm:text-sm">Payment mix</p>
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-2.5">
              {[
                { label: 'Cash', value: cashShare, pct: 42, color: 'bg-mintcom-green' },
                { label: 'Card', value: cardShare, pct: 48, color: 'bg-mintcom-greenDark' },
                { label: 'Other', value: otherShare, pct: 10, color: 'bg-mintcom-yellow' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-0.5 flex justify-between text-[10px] font-bold sm:text-[11px]">
                    <span className="text-text-secondary dark:text-mintcom-textSecondary">{row.label}</span>
                    <span className="tabular-nums text-text-primary dark:text-white">{money(row.value)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-cream-200 dark:bg-mintcom-dark sm:h-2">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top sellers — fills bottom band */}
        <Card className="flex min-h-0 flex-col !p-2.5 sm:!p-3">
          <p className="mb-1.5 shrink-0 text-xs font-black text-text-primary dark:text-white sm:text-sm">
            Top sellers this shift
          </p>
          <div className="grid min-h-0 flex-1 grid-cols-1 content-stretch gap-1 sm:grid-cols-2">
            {[
              { name: 'Latte', emoji: '🥛', qty: 24, sales: 132 },
              { name: 'Croissant', emoji: '🥐', qty: 18, sales: 72 },
              { name: 'Club sandwich', emoji: '🥪', qty: 11, sales: 82.5 },
              { name: 'Espresso', emoji: '☕', qty: 15, sales: 52.5 },
            ].map((item, i) => (
              <div
                key={item.name}
                className="flex min-h-0 items-center gap-2 rounded-xl bg-cream-50 px-2 py-1.5 dark:bg-mintcom-dark"
              >
                <span className="w-4 text-center text-[10px] font-black text-text-tertiary">{i + 1}</span>
                <span className="text-lg leading-none sm:text-xl">{item.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-text-primary dark:text-white sm:text-xs">
                    {item.name}
                  </p>
                  <p className="text-[9px] text-text-tertiary dark:text-mintcom-gray">{item.qty} sold</p>
                </div>
                <p className="text-[11px] font-black tabular-nums text-mintcom-green sm:text-xs">{money(item.sales)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Fill>
  );
}

/* ─── Reports ───────────────────────────────────────────────────────────── */
export function DemoReportsScreen() {
  const [tab, setTab] = useState<'sales' | 'items' | 'payments' | 'staff'>('sales');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const sales = [420, 510, 480, 620, 700, 890, 640];
  const max = Math.max(...sales);

  return (
    <Fill>
      <ScreenTitle title="Reports" subtitle="Shift & period analytics — same reports as Mintcom POS" />

      <div className="mb-2 flex shrink-0 flex-wrap gap-1">
        {(
          [
            { id: 'sales' as const, label: 'Sales' },
            { id: 'items' as const, label: 'Items' },
            { id: 'payments' as const, label: 'Payments' },
            { id: 'staff' as const, label: 'Staff' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors sm:px-4 sm:text-xs ${
              tab === t.id
                ? 'bg-mintcom-green text-white'
                : 'bg-white text-text-secondary ring-1 ring-gray-200 dark:bg-mintcom-surface dark:text-mintcom-textSecondary dark:ring-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'sales' && (
          <div className="grid h-full min-h-0 gap-2 lg:grid-cols-3">
            <Card className="flex min-h-0 flex-col lg:col-span-2">
              <p className="mb-0.5 shrink-0 text-xs font-black text-text-primary dark:text-white sm:text-sm">
                Weekly sales
              </p>
              <p className="mb-2 shrink-0 text-[10px] text-text-tertiary dark:text-mintcom-gray">Last 7 days · demo</p>
              <div className="flex min-h-0 flex-1 items-end gap-1.5 sm:gap-2">
                {sales.map((v, i) => (
                  <div key={days[i]} className="flex h-full min-h-0 flex-1 flex-col items-center justify-end gap-0.5">
                    <span className="shrink-0 text-[8px] font-bold tabular-nums text-text-tertiary sm:text-[9px]">
                      {money(v)}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-mintcom-green"
                      style={{ height: `${(v / max) * 100}%`, minHeight: 10, maxHeight: '100%' }}
                    />
                    <span className="shrink-0 text-[9px] font-bold text-text-secondary dark:text-mintcom-textSecondary sm:text-[10px]">
                      {days[i]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="grid min-h-0 grid-cols-2 gap-2 lg:grid-cols-1 lg:grid-rows-4">
              {[
                { label: 'Gross sales', value: money(4260) },
                { label: 'Discounts', value: money(-186) },
                { label: 'Tax collected', value: money(326) },
                { label: 'Net sales', value: money(4074) },
              ].map((r) => (
                <Card key={r.label} className="flex min-h-0 flex-col justify-center !py-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary dark:text-mintcom-gray">
                    {r.label}
                  </p>
                  <p className="text-base font-black tabular-nums text-text-primary dark:text-white sm:text-lg">
                    {r.value}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'items' && (
          <Card className="flex h-full min-h-0 flex-col">
            <p className="mb-2 shrink-0 text-xs font-black text-text-primary dark:text-white sm:text-sm">Items report</p>
            <div className="min-h-0 flex-1 overflow-hidden">
              <table className="w-full text-start text-[11px] sm:text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[9px] uppercase tracking-wider text-text-tertiary dark:border-white/8 dark:text-mintcom-gray">
                    <th className="pb-1.5 font-bold">Item</th>
                    <th className="pb-1.5 font-bold">Qty</th>
                    <th className="pb-1.5 font-bold">Sales</th>
                    <th className="pb-1.5 font-bold">%</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: 'Latte', q: 142, s: 639, p: 15.7 },
                    { n: 'Espresso', q: 98, s: 343, p: 8.4 },
                    { n: 'Croissant', q: 86, s: 344, p: 8.4 },
                    { n: 'Club sandwich', q: 54, s: 405, p: 9.9 },
                    { n: 'Garden salad', q: 41, s: 266.5, p: 6.5 },
                  ].map((row) => (
                    <tr key={row.n} className="border-b border-gray-50 text-text-primary dark:border-white/5 dark:text-white">
                      <td className="py-2 font-bold">{row.n}</td>
                      <td className="py-2 tabular-nums">{row.q}</td>
                      <td className="py-2 font-bold tabular-nums text-mintcom-green">{money(row.s)}</td>
                      <td className="py-2 tabular-nums text-text-secondary dark:text-mintcom-textSecondary">{row.p}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === 'payments' && (
          <div className="grid h-full min-h-0 grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { label: 'Cash', value: 1680, emoji: '💵' },
              { label: 'Card', value: 2140, emoji: '💳' },
              { label: 'Other', value: 440, emoji: '⚡' },
            ].map((p) => (
              <Card key={p.label} className="flex min-h-0 flex-col justify-center">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-mintcom-green/15 text-xl">
                  {p.emoji}
                </div>
                <p className="text-xs font-bold text-text-secondary dark:text-mintcom-textSecondary">{p.label}</p>
                <p className="text-2xl font-black tabular-nums text-text-primary dark:text-white">{money(p.value)}</p>
                <p className="text-[10px] text-text-tertiary dark:text-mintcom-gray">This week</p>
              </Card>
            ))}
          </div>
        )}

        {tab === 'staff' && (
          <Card className="flex h-full min-h-0 flex-col">
            <p className="mb-2 shrink-0 text-xs font-black text-text-primary dark:text-white sm:text-sm">
              Staff performance
            </p>
            <div className="grid min-h-0 flex-1 grid-rows-3 gap-2">
              {[
                { name: 'Sara', role: 'Cashier', sales: 1240, orders: 48, emoji: '👩‍💼' },
                { name: 'Omar', role: 'Barista', sales: 980, orders: 52, emoji: '👨‍🍳' },
                { name: 'Maya', role: 'Manager', sales: 1854, orders: 61, emoji: '👩‍💻' },
              ].map((s) => (
                <div
                  key={s.name}
                  className="flex min-h-0 items-center gap-3 rounded-2xl border border-gray-100 bg-cream-50 px-3 py-2 dark:border-white/8 dark:bg-mintcom-dark"
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-text-primary dark:text-white">{s.name}</p>
                    <p className="text-[11px] text-text-tertiary dark:text-mintcom-gray">
                      {s.role} · {s.orders} orders
                    </p>
                  </div>
                  <p className="text-sm font-black tabular-nums text-mintcom-green">{money(s.sales)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Fill>
  );
}

/* ─── Notifications ─────────────────────────────────────────────────────── */
type Notif = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'order' | 'stock' | 'system' | 'shift';
  unread: boolean;
};

const INITIAL_NOTIFS: Notif[] = [
  {
    id: '1',
    title: 'Low stock · Oat milk',
    body: 'Only 2 units left. Restock before the evening rush.',
    time: '4m ago',
    type: 'stock',
    unread: true,
  },
  {
    id: '2',
    title: 'Held order waiting',
    body: 'Order #1040 is still held for table 4.',
    time: '18m ago',
    type: 'order',
    unread: true,
  },
  {
    id: '3',
    title: 'Shift reminder',
    body: 'Cash drawer variance check recommended before close.',
    time: '1h ago',
    type: 'shift',
    unread: true,
  },
  {
    id: '4',
    title: 'New loyalty member',
    body: 'Lina joined Cafe Delight rewards · 50 welcome points.',
    time: '2h ago',
    type: 'system',
    unread: false,
  },
  {
    id: '5',
    title: 'Printer ready',
    body: 'Kitchen printer reconnected successfully.',
    time: 'Yesterday',
    type: 'system',
    unread: false,
  },
];

const notifIcon = (type: Notif['type']) => {
  if (type === 'stock') return '📦';
  if (type === 'order') return '🧾';
  if (type === 'shift') return '⏱️';
  return '🔔';
};

export function DemoNotificationsScreen() {
  const [items, setItems] = useState(INITIAL_NOTIFS);
  const unread = items.filter((n) => n.unread).length;

  const markAll = () => setItems((list) => list.map((n) => ({ ...n, unread: false })));
  const toggle = (id: string) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));

  return (
    <Fill>
      <ScreenTitle
        title="Notifications"
        subtitle={unread ? `${unread} unread` : 'All caught up'}
        action={
          unread > 0 ? (
            <button
              type="button"
              onClick={markAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-text-primary dark:border-white/10 dark:bg-mintcom-surface dark:text-white"
            >
              <CheckCheck size={14} className="text-mintcom-green" /> Mark all
            </button>
          ) : undefined
        }
      />

      <div className="mx-auto grid min-h-0 w-full max-w-2xl flex-1 grid-rows-5 gap-1.5 overflow-hidden">
        {items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => toggle(n.id)}
            className={`flex min-h-0 w-full items-center gap-2.5 rounded-2xl border px-3 py-2 text-start transition-all ${
              n.unread
                ? 'border-mintcom-green/30 bg-mintcom-green/10 dark:bg-mintcom-green/10'
                : 'border-gray-200 bg-white dark:border-white/8 dark:bg-mintcom-surface'
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm dark:bg-mintcom-dark">
              {notifIcon(n.type)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-bold text-text-primary dark:text-white sm:text-sm">{n.title}</p>
                {n.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-mintcom-green" />}
              </div>
              <p className="line-clamp-1 text-[11px] text-text-secondary dark:text-mintcom-textSecondary">{n.body}</p>
              <p className="text-[9px] font-bold text-text-tertiary dark:text-mintcom-gray">{n.time}</p>
            </div>
          </button>
        ))}
      </div>
    </Fill>
  );
}

/* ─── Settings ──────────────────────────────────────────────────────────── */
const SETTINGS_NAV = [
  { id: 'business', label: 'Your Business', sub: 'Name, hours, profile', icon: Building2 },
  { id: 'sales', label: 'Sales Management', sub: 'Tax, tips, payments', icon: Percent },
  { id: 'products', label: 'Product Management', sub: 'Menu items & prices', icon: Package },
  { id: 'categories', label: 'Categories', sub: 'Menu groups', icon: Layers },
  { id: 'stock', label: 'Stock Management', sub: 'Levels & restock', icon: Activity },
  { id: 'addons', label: 'Add-ons', sub: 'Size, milk, extras', icon: Tag },
  { id: 'language', label: 'Language', sub: 'Display language', icon: Globe },
  { id: 'about', label: 'About Us', sub: 'App version & legal', icon: Info },
] as const;

export function DemoSettingsScreen() {
  const [active, setActive] = useState<(typeof SETTINGS_NAV)[number]['id']>('business');
  const [taxOn, setTaxOn] = useState(true);
  const [taxRate, setTaxRate] = useState(8);
  const [serviceOn, setServiceOn] = useState(false);
  const [serviceRate, setServiceRate] = useState(10);
  const [cardOn, setCardOn] = useState(true);
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  const activeMeta = SETTINGS_NAV.find((s) => s.id === active)!;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden lg:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-gray-200 bg-white dark:border-mintcom-tertiary dark:bg-mintcom-surface lg:h-full lg:w-56 lg:border-b-0 lg:border-e xl:w-64">
        <div className="shrink-0 border-b border-gray-100 px-3 py-2 dark:border-white/8">
          <p className="text-sm font-black text-text-primary dark:text-white">Settings</p>
          <p className="text-[10px] text-text-tertiary dark:text-mintcom-gray">Demo · not saved</p>
        </div>
        <div className="flex gap-1 overflow-x-auto p-1.5 no-scrollbar lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto">
          {SETTINGS_NAV.map((item) => {
            const on = active === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 text-start transition-colors lg:w-full ${
                  on
                    ? 'bg-mintcom-green text-white shadow-md shadow-mintcom-green/20'
                    : 'text-text-secondary hover:bg-cream-100 dark:text-mintcom-textSecondary dark:hover:bg-white/5'
                }`}
              >
                <Icon size={15} className="shrink-0" />
                <span className="hidden min-w-0 flex-1 lg:block">
                  <span className="block text-[11px] font-bold leading-tight">{item.label}</span>
                  <span className={`block text-[9px] ${on ? 'text-white/70' : 'text-text-tertiary dark:text-mintcom-gray'}`}>
                    {item.sub}
                  </span>
                </span>
                <span className="text-[10px] font-bold lg:hidden">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2.5 sm:p-3 md:p-4">
        <ScreenTitle title={activeMeta.label} subtitle={activeMeta.sub} />
        <div className="min-h-0 flex-1 overflow-hidden">
          {active === 'business' && (
            <div className="grid h-full min-h-0 grid-rows-3 gap-2 max-w-xl">
              <Card className="flex min-h-0 flex-col justify-center">
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary">Business name</label>
                <p className="text-base font-black text-text-primary dark:text-white">Cafe Delight</p>
              </Card>
              <Card className="flex min-h-0 flex-col justify-center">
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary">Location</label>
                <p className="text-base font-black text-text-primary dark:text-white">Downtown branch</p>
                <p className="text-xs text-text-secondary dark:text-mintcom-textSecondary">Amman · Jordan · USD demo</p>
              </Card>
              <Card className="flex min-h-0 flex-col justify-center">
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary">Hours</label>
                <p className="text-sm font-bold text-text-primary dark:text-white">Sun–Thu 08:00–22:00</p>
                <p className="text-sm font-bold text-text-primary dark:text-white">Fri–Sat 09:00–23:00</p>
              </Card>
            </div>
          )}

          {active === 'sales' && (
            <div className="grid h-full min-h-0 max-w-xl grid-rows-3 gap-2">
              <Card className="flex min-h-0 flex-col justify-center">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-text-primary dark:text-white">Tax</p>
                    <p className="text-[11px] text-text-secondary dark:text-mintcom-textSecondary">Applied at checkout</p>
                  </div>
                  <Toggle on={taxOn} onToggle={() => setTaxOn((v) => !v)} />
                </div>
                {taxOn && (
                  <div className="mt-2">
                    <div className="mb-0.5 flex justify-between text-[11px] font-bold">
                      <span className="text-text-secondary">Rate</span>
                      <span className="text-mintcom-green">{taxRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-full accent-mintcom-green"
                    />
                  </div>
                )}
              </Card>
              <Card className="flex min-h-0 flex-col justify-center">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-text-primary dark:text-white">Service charge</p>
                    <p className="text-[11px] text-text-secondary dark:text-mintcom-textSecondary">Optional fee</p>
                  </div>
                  <Toggle on={serviceOn} onToggle={() => setServiceOn((v) => !v)} />
                </div>
                {serviceOn && (
                  <div className="mt-2">
                    <div className="mb-0.5 flex justify-between text-[11px] font-bold">
                      <span className="text-text-secondary">Rate</span>
                      <span className="text-mintcom-green">{serviceRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={serviceRate}
                      onChange={(e) => setServiceRate(Number(e.target.value))}
                      className="w-full accent-mintcom-green"
                    />
                  </div>
                )}
              </Card>
              <Card className="flex min-h-0 flex-col justify-center">
                <p className="mb-2 text-sm font-bold text-text-primary dark:text-white">Payment methods</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between rounded-xl bg-cream-50 px-3 py-2 dark:bg-mintcom-dark">
                    <span className="text-xs font-bold">💵 Cash</span>
                    <span className="rounded-full bg-mintcom-green/15 px-2 py-0.5 text-[9px] font-bold text-mintcom-green">
                      Required
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-cream-50 px-3 py-2 dark:bg-mintcom-dark">
                    <span className="text-xs font-bold">💳 Card</span>
                    <Toggle on={cardOn} onToggle={() => setCardOn((v) => !v)} />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {active === 'products' && (
            <div className="grid h-full min-h-0 grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { n: 'Latte', p: 4.5, e: '🥛' },
                { n: 'Espresso', p: 3.5, e: '☕' },
                { n: 'Croissant', p: 4, e: '🥐' },
                { n: 'Club sandwich', p: 7.5, e: '🥪' },
                { n: 'Garden salad', p: 6.5, e: '🥗' },
                { n: 'Cheesecake', p: 5.5, e: '🍰' },
              ].map((p) => (
                <Card key={p.n} className="flex min-h-0 !flex-row !items-center !gap-2 !p-2.5">
                  <span className="text-xl sm:text-2xl">{p.e}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-text-primary dark:text-white sm:text-xs">{p.n}</p>
                    <p className="text-[11px] font-black text-mintcom-green">{money(p.p)}</p>
                  </div>
                  <span className="hidden rounded-full bg-mintcom-green/15 px-2 py-0.5 text-[9px] font-bold text-mintcom-green sm:inline">
                    Active
                  </span>
                </Card>
              ))}
            </div>
          )}

          {active === 'categories' && (
            <div className="grid h-full min-h-0 grid-cols-2 gap-2">
              {[
                { n: 'Beverages', c: 6, e: '☕' },
                { n: 'Pastries', c: 4, e: '🥐' },
                { n: 'Food', c: 4, e: '🥗' },
                { n: 'Desserts', c: 2, e: '🍰' },
              ].map((c) => (
                <Card key={c.n} className="flex min-h-0 !items-center !gap-3">
                  <span className="text-2xl">{c.e}</span>
                  <div>
                    <p className="text-sm font-bold text-text-primary dark:text-white">{c.n}</p>
                    <p className="text-[11px] text-text-tertiary">{c.c} products</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {active === 'stock' && (
            <Card className="flex h-full min-h-0 flex-col">
              <div className="grid min-h-0 flex-1 grid-rows-4 gap-1.5">
                {[
                  { n: 'Oat milk', lvl: 2, status: 'low' as const },
                  { n: 'Croissant dough', lvl: 18, status: 'ok' as const },
                  { n: 'Espresso beans', lvl: 4, status: 'warn' as const },
                  { n: 'To-go cups L', lvl: 120, status: 'ok' as const },
                ].map((s) => (
                  <div
                    key={s.n}
                    className="flex min-h-0 items-center justify-between rounded-xl border border-gray-100 px-3 py-2 dark:border-white/8"
                  >
                    <p className="text-xs font-bold text-text-primary dark:text-white">{s.n}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tabular-nums">{s.lvl}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          s.status === 'low'
                            ? 'bg-mintcom-red/15 text-mintcom-red'
                            : s.status === 'warn'
                              ? 'bg-mintcom-yellow/20 text-amber-700 dark:text-mintcom-yellow'
                              : 'bg-mintcom-green/15 text-mintcom-green'
                        }`}
                      >
                        {s.status === 'ok' ? 'OK' : s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {active === 'addons' && (
            <div className="grid h-full min-h-0 grid-cols-2 gap-2">
              {[
                { n: 'Size', opts: 'S · M · L' },
                { n: 'Milk', opts: 'Whole · Oat · Almond' },
                { n: 'Extras', opts: 'Shot · Syrup · Whip' },
                { n: 'Add-ons', opts: 'Cheese · Avocado · Bacon' },
              ].map((g) => (
                <Card key={g.n} className="flex min-h-0 flex-col justify-center">
                  <p className="text-sm font-black text-text-primary dark:text-white">{g.n}</p>
                  <p className="mt-1 text-xs text-text-secondary dark:text-mintcom-textSecondary">{g.opts}</p>
                </Card>
              ))}
            </div>
          )}

          {active === 'language' && (
            <Card className="flex h-full max-w-md min-h-0 flex-col justify-center">
              <p className="mb-3 text-sm font-bold text-text-primary dark:text-white">Display language</p>
              <div className="flex gap-2">
                {(
                  [
                    { id: 'en' as const, label: 'English' },
                    { id: 'ar' as const, label: 'العربية' },
                  ] as const
                ).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLang(l.id)}
                    className={`flex-1 rounded-xl border py-3 text-sm font-bold ${
                      lang === l.id
                        ? 'border-mintcom-green bg-mintcom-green/15 text-mintcom-green'
                        : 'border-gray-200 text-text-secondary dark:border-white/10 dark:text-mintcom-textSecondary'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-text-tertiary dark:text-mintcom-gray">
                Demo only — does not change the website language.
              </p>
            </Card>
          )}

          {active === 'about' && (
            <Card className="flex h-full max-w-md min-h-0 flex-col justify-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-mintcom-green/15 text-2xl">
                🍃
              </div>
              <p className="text-lg font-black text-text-primary dark:text-white">Mintcom POS</p>
              <p className="text-xs text-text-secondary dark:text-mintcom-textSecondary">Demo build · sandbox</p>
              <div className="mt-3 space-y-1 text-xs text-text-secondary dark:text-mintcom-textSecondary">
                <p>Version 2.x (marketing demo)</p>
                <p>© Mintcom · mintcompos.com</p>
              </div>
              <Link to="/" className="mt-3 inline-flex text-xs font-bold text-mintcom-green hover:underline">
                Visit website →
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-mintcom-green' : 'bg-gray-300 dark:bg-mintcom-tertiary'}`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
          on ? 'start-5' : 'start-0.5'
        }`}
      />
    </button>
  );
}

/* ─── Support ───────────────────────────────────────────────────────────── */
const ARTICLES = [
  {
    id: '1',
    cat: 'Getting started',
    title: 'Set up store payment methods',
    excerpt: 'Cash, Card, brands, delivery apps, wallets & vouchers for checkout.',
  },
  {
    id: '2',
    cat: 'Sales',
    title: 'Hold and resume orders',
    excerpt: 'Park tickets when a guest steps away, then resume on any register.',
  },
  {
    id: '3',
    cat: 'Staff',
    title: 'Roles and PIN clock-in',
    excerpt: 'Assign cashiers, managers, and PINs for fast staff switching.',
  },
  {
    id: '4',
    cat: 'Reports',
    title: 'Read your end-of-day report',
    excerpt: 'Cash, card, discounts, tax, and drawer variance explained.',
  },
  {
    id: '5',
    cat: 'Hardware',
    title: 'Connect a receipt printer',
    excerpt: 'Common thermal printer setup for Mintcom POS.',
  },
];

export function DemoSupportScreen() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ARTICLES;
    return ARTICLES.filter(
      (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Fill>
      <ScreenTitle
        title="Support"
        subtitle="Help articles & contact — same help center as Mintcom"
        action={
          <Link
            to="/support"
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-text-primary dark:border-white/10 dark:bg-mintcom-surface dark:text-white"
          >
            Full site <ChevronRight size={14} />
          </Link>
        }
      />

      <div className="relative mb-2 max-w-xl shrink-0">
        <HelpCircle
          size={14}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2 ps-9 pe-3 text-xs outline-none focus:border-mintcom-green dark:border-mintcom-tertiary dark:bg-mintcom-surface dark:text-white sm:text-sm"
        />
      </div>

      <div className="grid min-h-0 flex-1 gap-2 overflow-hidden lg:grid-cols-3">
        <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden lg:col-span-2">
          {filtered.slice(0, 5).map((a) => {
            const open = openId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setOpenId(open ? null : a.id)}
                className="flex min-h-0 flex-1 items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-start dark:border-white/8 dark:bg-mintcom-surface"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-mintcom-green/15 text-mintcom-green">
                  <FileText size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-mintcom-green">{a.cat}</p>
                  <p className="truncate text-xs font-bold text-text-primary dark:text-white sm:text-sm">{a.title}</p>
                  <p className="line-clamp-1 text-[10px] text-text-secondary dark:text-mintcom-textSecondary sm:text-[11px]">
                    {open
                      ? 'Demo preview — full guide lives on mintcompos.com/support with steps & screenshots.'
                      : a.excerpt}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className={`shrink-0 text-text-tertiary transition-transform ${open ? 'rotate-90' : ''}`}
                />
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-text-tertiary">No articles match “{query}”</p>
          )}
        </div>

        <Card className="flex min-h-0 flex-col justify-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-mintcom-green/15 text-mintcom-green">
            <Mail size={18} />
          </div>
          <p className="text-sm font-black text-text-primary dark:text-white">Contact support</p>
          <p className="mt-1 text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
            Demo cannot send real tickets — use the website for live support.
          </p>
          <a
            href="mailto:support@mintcompos.com"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-mintcom-green py-2.5 text-[11px] font-black text-white"
          >
            <Mail size={13} /> support@mintcompos.com
          </a>
          <Link
            to="/support/tickets/new"
            className="mt-1.5 flex w-full items-center justify-center rounded-xl border border-gray-200 py-2.5 text-[11px] font-bold text-text-primary dark:border-white/10 dark:text-white"
          >
            Open ticket on website
          </Link>
        </Card>
      </div>
    </Fill>
  );
}
