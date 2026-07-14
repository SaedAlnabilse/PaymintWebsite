/**
 * Static screenshot of the current try-pos sales screen.
 *
 * Design approach: paint the full POS at a fixed “design size”, then
 * scale-to-fit the container with ResizeObserver so every label, badge,
 * product card and pay button stays crisp and never clips.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Bell,
  Settings,
  Search,
  Wifi,
  Plus,
  BadgePercent,
  Pencil,
  PauseCircle,
  Star,
  Printer,
  Monitor,
  Trash2,
  Banknote,
  CreditCard,
  Wallet,
  SplitSquareHorizontal,
  Menu,
  LogOut,
  Inbox,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  Coffee,
  ShoppingBag,
  Truck,
  Home,
  Minus,
  User,
  PieChart,
  Headphones,
  LayoutGrid,
} from 'lucide-react';
import { Logo } from './Logo';

/** Logical design size of the POS frame (px). Scaled down to fit the modal. */
const DESIGN_W = 900;
const DESIGN_H = 560;

const DEFAULT_IMG = '/default_product.png?v=pos-box';

const moneyParts = (n: number) => {
  const amount = n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return { amount, currency: 'USD' };
};

const Price = ({
  value,
  size = 'md',
  muted = false,
}: {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
}) => {
  const { amount, currency } = moneyParts(value);
  const amountCls =
    size === 'lg'
      ? 'text-[17px] font-extrabold'
      : size === 'sm'
        ? 'text-[13px] font-extrabold'
        : 'text-[15px] font-extrabold';
  const curCls =
    size === 'lg' ? 'text-[11px] font-bold' : size === 'sm' ? 'text-[10px] font-bold' : 'text-[11px] font-bold';
  return (
    <span
      className={`inline-flex items-baseline gap-1 tabular-nums ${
        muted ? 'text-[#111827]' : 'text-mintcom-green'
      }`}
    >
      <span className={amountCls}>{amount}</span>
      <span className={curCls}>{currency}</span>
    </span>
  );
};

const PRODUCTS = [
  { name: 'Espresso', price: 3.5 },
  { name: 'Latte', price: 4.5 },
  { name: 'Cappuccino', price: 4.25 },
  { name: 'Cold brew', price: 4.75 },
  { name: 'Croissant', price: 4.0 },
  { name: 'Muffin', price: 3.25 },
] as const;

const ORDER_LINES = [
  { name: 'Latte', price: 5.25, qty: 2, note: 'L · Oat · Extra shot' },
  { name: 'Croissant', price: 4.25, qty: 1, note: 'Warmed' },
  { name: 'Cookie', price: 2.0, qty: 1, note: null as string | null },
] as const;

const SUBTOTAL = ORDER_LINES.reduce((s, l) => s + l.price * l.qty, 0);
const TAX = Math.round(SUBTOTAL * 0.08 * 100) / 100;
const TOTAL = SUBTOTAL + TAX;

/** Exact try-pos side rail order (FullPosPlayground NAV_ITEMS) */
const NAV = [
  { icon: Home, active: true, label: 'Sales' },
  { icon: User, active: false, label: 'Dashboard' },
  { icon: PieChart, active: false, label: 'Reports' },
  { icon: Bell, active: false, label: 'Notifications' },
  { icon: Headphones, active: false, label: 'Support' },
  { icon: Settings, active: false, label: 'Settings' },
] as const;

type Props = { side?: boolean };

/** Frozen try-pos sales frame — scales to fit, never clips. */
export function FeaturePosScreenshot({ side }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      // Fit width; height follows design aspect (shell uses padding-bottom).
      setScale(Math.min(1, w / DESIGN_W));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scaledH = DESIGN_H * scale;

  return (
    <div
      role="img"
      aria-label="Mintcom POS sales screen — same as Try POS"
      className={`${side ? 'mt-0 w-full' : 'mt-5'} select-text`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white dark:border-white/10 ${
          side ? 'shadow-lg shadow-black/10 dark:shadow-black/40' : 'shadow-inner'
        }`}
      >
        {/* Chrome */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white px-3.5 py-2 dark:border-white/5 dark:from-[#141414] dark:to-[#0f0f0f]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-45" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mintcom-green" />
            </span>
            <span className="text-[11px] font-semibold normal-case text-gray-500 dark:text-gray-400">
              Sales
            </span>
          </div>
          <span className="rounded-full bg-mintcom-green/12 px-2 py-0.5 text-[9px] font-bold text-mintcom-green">
            Live UI
          </span>
        </div>

        {/* Scale shell: width 100%, height = design × scale */}
        <div
          ref={shellRef}
          className="relative w-full overflow-hidden bg-[#f6f3ec]"
          style={{ height: scaledH }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: DESIGN_W,
              height: DESIGN_H,
              transform: `scale(${scale})`,
            }}
          >
            <PosDesignCanvas />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Full-fidelity POS painted at DESIGN_W × DESIGN_H */
function PosDesignCanvas() {
  return (
    <div
      className="flex h-full w-full overflow-hidden text-[#1f2a26]"
      style={{ width: DESIGN_W, height: DESIGN_H }}
    >
      {/* ── Side rail ── */}
      <nav
        className="flex h-full w-[64px] shrink-0 flex-col items-center py-3"
        style={{ backgroundColor: '#1F1D2B' }}
        aria-hidden
      >
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl">
          <Logo variant="icon" size="sm" className="pointer-events-none" />
        </div>
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl text-white/80">
          <Menu size={20} strokeWidth={2} />
        </div>
        <div className="flex flex-1 flex-col items-center gap-1.5">
          {NAV.map(({ icon: Icon, active, label }) => (
            <span
              key={label}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
              style={active ? { backgroundColor: '#7dc6a2' } : undefined}
            >
              <Icon size={20} strokeWidth={1.75} className={active ? 'text-white' : 'text-white/65'} />
            </span>
          ))}
        </div>
        <span className="mt-auto flex h-11 w-11 items-center justify-center rounded-xl text-white/65">
          <LogOut size={20} strokeWidth={1.75} />
        </span>
      </nav>

      {/* ── Menu pane ── */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f6f3ec]">
        <header className="shrink-0 border-b border-black/[0.05] bg-white px-4 py-3">
          {/* Staff + badges — single non-wrapping row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mintcom-green">
                <span className="text-[14px] font-bold text-white">SA</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold leading-tight text-[#111827]">
                  Sam Cashier
                </p>
                <p className="truncate text-[12px] text-gray-500">Tue, 14 Jul 2026</p>
                <p className="truncate text-[12px] font-semibold text-mintcom-green">Cafe Delight</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Chip icon={<Wifi size={13} className="text-mintcom-green" />} label="Synced" />
              <Chip icon={<BookOpen size={13} />} label="Train" />
              <Chip
                icon={<LayoutGrid size={13} />}
                label="Grid"
                active
              />
              <Chip icon={<Inbox size={13} className="text-mintcom-green" />} label="Drawer" green />
            </div>
          </div>

          <div className="my-3 h-px bg-gray-200" />

          {/* Toolbar */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-mintcom-green px-3.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-md shadow-mintcom-green/30">
              Pay-in / Out
            </span>
            <div className="flex h-11 min-w-0 flex-1 items-center overflow-hidden rounded-xl bg-gray-100">
              <Search size={15} className="ms-3.5 shrink-0 text-gray-400" />
              <span className="min-w-0 flex-1 truncate px-2.5 text-[13px] font-medium text-gray-400">
                Search menu…
              </span>
              <span className="mx-0.5 h-[22px] w-px shrink-0 bg-gray-200" />
              <span className="me-1 flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-gray-500">
                <LayoutGrid size={13} />
                Category
                <ChevronDown size={13} className="opacity-70" />
              </span>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-mintcom-green">
              <SlidersHorizontal size={18} />
            </span>
          </div>
        </header>

        {/* Product grid — 3×2, balanced cards */}
        <div className="min-h-0 flex-1 overflow-hidden p-3.5">
          <div className="grid h-full grid-cols-3 gap-3">
            {PRODUCTS.map((p) => (
              <div
                key={p.name}
                className="relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="relative flex h-[110px] w-full shrink-0 items-center justify-center overflow-hidden bg-white">
                  <img
                    src={DEFAULT_IMG}
                    alt=""
                    className="h-full w-full object-contain object-center p-5"
                    draggable={false}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between px-3.5 py-3">
                  <p className="truncate text-[14px] font-bold leading-snug text-[#111827]">
                    {p.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Price value={p.price} size="sm" />
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mintcom-green text-white shadow-sm">
                      <Plus size={16} strokeWidth={2.5} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Order panel ── */}
      <aside className="flex w-[280px] shrink-0 flex-col overflow-hidden border-s border-gray-200 bg-white">
        <div className="shrink-0 border-b border-[#f0f0f0] px-3.5 py-3">
          <div className="mb-2.5 flex items-stretch gap-1.5">
            {(
              [
                { icon: BadgePercent, danger: false },
                { icon: Pencil, danger: false },
                { icon: PauseCircle, danger: false },
                { icon: Star, danger: false },
                { icon: Printer, danger: false },
                { icon: Monitor, danger: false },
                { icon: Trash2, danger: true },
              ] as const
            ).map(({ icon: Icon, danger }, i) => (
              <span
                key={i}
                className={`relative flex h-[42px] flex-1 items-center justify-center rounded-[10px] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] ${
                  danger ? 'bg-[#D55263]' : 'bg-[#7dc6a2]'
                }`}
              >
                <Icon size={18} strokeWidth={2} />
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#6B7280]">Order number</p>
            <p className="text-lg font-extrabold text-[#111827]">#41</p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2 border-b border-gray-100 px-3 py-2">
          {(
            [
              { label: 'Dine in', Icon: Coffee, on: true },
              { label: 'Takeaway', Icon: ShoppingBag, on: false },
              { label: 'Delivery', Icon: Truck, on: false },
            ] as const
          ).map(({ label, Icon, on }) => (
            <span
              key={label}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] py-2.5 text-[11px] font-bold ${
                on
                  ? 'border-mintcom-green bg-mintcom-green/10 text-mintcom-green'
                  : 'border-gray-200 bg-white text-gray-500'
              }`}
            >
              <Icon size={14} />
              <span className="truncate">{label}</span>
            </span>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-3 py-2.5">
          {ORDER_LINES.map((l) => (
            <div
              key={l.name}
              className="flex shrink-0 items-center gap-2.5 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white">
                <img
                  src={DEFAULT_IMG}
                  alt=""
                  className="h-full w-full object-contain p-1"
                  draggable={false}
                />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[13px] font-bold text-[#111827]">{l.name}</p>
                {l.note && (
                  <p className="mt-0.5 truncate text-[11px] font-medium text-gray-400">{l.note}</p>
                )}
                <div className="mt-0.5">
                  <Price value={l.price * l.qty} size="sm" muted />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 rounded-lg bg-gray-100 px-1 py-0.5">
                <span className="flex h-6 w-6 items-center justify-center text-gray-500">
                  <Minus size={12} strokeWidth={2.5} />
                </span>
                <span className="min-w-[18px] text-center text-[13px] font-black text-[#111827]">
                  {l.qty}
                </span>
                <span className="flex h-6 w-6 items-center justify-center text-mintcom-green">
                  <Plus size={12} strokeWidth={2.5} />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-gray-100 px-3.5 py-3">
          <div className="space-y-1 text-[12px] text-gray-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums font-semibold text-[#111827]">
                {moneyParts(SUBTOTAL).amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax 8%</span>
              <span className="tabular-nums font-semibold text-[#111827]">
                {moneyParts(TAX).amount}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
            <span className="text-[15px] font-black text-[#111827]">Total</span>
            <Price value={TOTAL} size="lg" />
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Payment
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-mintcom-green/15 px-2 py-0.5 text-[10px] font-black text-mintcom-green">
              <SplitSquareHorizontal size={10} />
              Split
            </span>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {[
              { icon: Banknote, label: 'Cash' },
              { icon: CreditCard, label: 'Card' },
              { icon: Wallet, label: 'Other' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex flex-col items-center gap-1 rounded-xl bg-mintcom-green py-2.5 text-[11px] font-black uppercase tracking-wide text-white shadow-sm shadow-mintcom-green/25"
              >
                <Icon size={16} strokeWidth={2.5} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Chip({
  icon,
  label,
  active,
  green,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  green?: boolean;
}) {
  return (
    <span
      className={`inline-flex h-9 items-center gap-1.5 rounded-[10px] border px-2.5 text-[12px] font-semibold ${
        active
          ? 'border-mintcom-green/30 bg-mintcom-green/10 text-mintcom-green'
          : green
            ? 'border-gray-200 bg-white text-mintcom-green'
            : 'border-gray-200 bg-white text-gray-600'
      }`}
    >
      {icon}
      {label}
    </span>
  );
}

export default FeaturePosScreenshot;
