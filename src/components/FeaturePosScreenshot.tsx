/**
 * Static screenshot of the current try-pos sales screen.
 *
 * Design approach: paint the full POS at a fixed “design size”, then
 * scale-to-fit the container with ResizeObserver so every label, badge,
 * product card and pay button stays crisp and never clips.
 *
 * Order summary panel mirrors FullPosPlayground OrderPanel (expandable
 * line cards, totals with tax/SC pencils, outlined payment tiles).
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
  Trash2,
  Menu,
  LogOut,
  Inbox,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  User,
  PieChart,
  Headphones,
  LayoutGrid,
  Home,
} from 'lucide-react';
import { Logo } from './Logo';
import {
  PosCashIcon,
  PosCardIcon,
  PosOtherReceiptIcon,
  PosSplitReceiptIcon,
} from './pos-demo/posPaymentIcons';

/** Logical design size of the POS frame (px). Scaled down to fit the modal.
 *  Keep in sync with FeatureScreenshots DESIGN_H for consistent card height. */
const DESIGN_W = 900;
const DESIGN_H = 600;

const DEFAULT_IMG = '/default_product.png?v=pos-box';

const money = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

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
const TAX_RATE = 8;
const TAX = Math.round(SUBTOTAL * (TAX_RATE / 100) * 100) / 100;
const SERVICE_CHARGE = Math.round(SUBTOTAL * 0.05 * 100) / 100;
const TOTAL = SUBTOTAL + TAX + SERVICE_CHARGE;

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
              <Chip icon={<LayoutGrid size={13} />} label="Grid" active />
              <Chip icon={<Inbox size={13} className="text-mintcom-green" />} label="Drawer" green />
            </div>
          </div>

          <div className="my-3 h-px bg-gray-200" />

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

      {/* ── Order panel — mirrors try-pos OrderPanel ── */}
      <aside className="flex w-[300px] shrink-0 flex-col overflow-hidden border-s border-gray-200 bg-white">
        {/* Header actions */}
        <div className="shrink-0 border-b border-[#f0f0f0] px-3.5 py-3">
          <div className="mb-2.5 flex items-stretch justify-between gap-2">
            {(
              [
                { icon: BadgePercent, danger: false },
                { icon: Pencil, danger: false },
                { icon: PauseCircle, danger: false },
                { icon: Star, danger: false },
                { icon: Printer, danger: false },
                { icon: Trash2, danger: true },
              ] as const
            ).map(({ icon: Icon, danger }, i) => (
              <span
                key={i}
                className={`relative flex h-[42px] flex-1 items-center justify-center rounded-xl text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] ${
                  danger ? 'bg-[#D55263]' : 'bg-[#7dc6a2]'
                }`}
              >
                <Icon size={20} strokeWidth={2} />
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#6B7280]">Order number</p>
            <p className="text-lg font-extrabold text-[#111827]">#41</p>
          </div>
        </div>

        {/* Lines — expandable cards like POS SwipeableOrderItem (collapsed) */}
        <div className="min-h-0 flex-1 space-y-2 overflow-hidden px-3 py-2">
          {ORDER_LINES.map((l) => (
            <div
              key={l.name}
              className="overflow-hidden rounded-xl border border-gray-200 bg-[#f6f3ec]"
            >
              <div className="flex w-full items-center gap-2 p-2.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                  <img
                    src={DEFAULT_IMG}
                    alt=""
                    className="h-full w-full object-contain p-1"
                    draggable={false}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#111827]">{l.name}</p>
                  {l.note && (
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-500">Note: {l.note}</p>
                  )}
                  <p className="mt-0.5">
                    <Price value={l.price * l.qty} size="sm" muted />
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mintcom-green text-[13px] font-bold tracking-wide text-white shadow-sm">
                  ×{l.qty}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white">
                  <ChevronDown size={16} className="text-gray-400" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals + payment — mirrors OrderSummaryPanel footer */}
        <div className="shrink-0 border-t border-gray-100 px-3 py-3">
          <div className="space-y-0.5 text-[11px]">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="tabular-nums font-semibold text-[#111827]">{money(SUBTOTAL)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 py-0.5">
              <span className="inline-flex items-center gap-1 text-gray-500">
                Service Charge
                <Pencil size={12} className="text-gray-400" />
              </span>
              <span className="tabular-nums font-semibold text-[#111827]">
                {money(SERVICE_CHARGE)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 py-0.5">
              <span className="inline-flex items-center gap-1 text-gray-500">
                Tax {TAX_RATE}%
                <Pencil size={12} className="text-gray-400" />
              </span>
              <span className="tabular-nums font-semibold text-[#111827]">{money(TAX)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-1.5 text-sm font-black text-[#111827]">
              <span>Total</span>
              <span className="tabular-nums text-mintcom-green">{money(TOTAL)}</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold text-gray-500">Payment Method</p>
            <span className="inline-flex items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-mintcom-green bg-mintcom-green/12 px-2.5 py-1.5 text-[13px] font-bold text-mintcom-green">
              <PosSplitReceiptIcon size={16} className="text-mintcom-green" />
              Split
            </span>
          </div>

          <div className="mx-auto mt-2 grid w-full max-w-[280px] grid-cols-3 gap-2">
            {(
              [
                { icon: <PosCashIcon size={28} className="text-mintcom-green" />, label: 'Cash' },
                { icon: <PosCardIcon size={28} className="text-mintcom-green" />, label: 'Card' },
                {
                  icon: <PosOtherReceiptIcon size={30} className="text-mintcom-green" />,
                  label: 'Other',
                },
              ] as const
            ).map(({ icon, label }) => (
              <span
                key={label}
                className="flex min-h-[75px] w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border-[1.5px] border-mintcom-green/45 bg-mintcom-green/[0.07] px-2.5 py-3"
              >
                <span className="flex h-10 w-10 items-center justify-center text-mintcom-green">
                  {icon}
                </span>
                <span className="text-[12.5px] font-semibold leading-none tracking-tight text-[#111827]">
                  {label}
                </span>
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
