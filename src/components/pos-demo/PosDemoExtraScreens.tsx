import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Layers,
  AlertTriangle,
  List,
  LogIn,
  LogOut,
  Mail,
  Package,
  Pause,
  Percent,
  Play,
  Receipt,
  ShoppingBag,
  Tag,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';

const money = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

type Staff = { id: string; name: string; role: string; pin: string; emoji: string };

export type CashMovement = {
  id: string;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  at: number;
};

export type DemoSale = {
  id: string;
  orderNo: number;
  total: number;
  method: 'cash' | 'card' | 'other';
  methodLabel: string;
  items: string;
  at: number;
};

export type DemoShift = {
  open: boolean;
  openingCash: number;
  cashSales: number;
  cardSales: number;
  otherSales: number;
  payIn: number;
  payOut: number;
  orders: number;
  startedAt: number | null;
  movements: CashMovement[];
  sales: DemoSale[];
};

export const emptyShift = (): DemoShift => ({
  open: false,
  openingCash: 0,
  cashSales: 0,
  cardSales: 0,
  otherSales: 0,
  payIn: 0,
  payOut: 0,
  orders: 0,
  startedAt: null,
  movements: [],
  sales: [],
});

function Fill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden p-2.5 sm:p-3 md:p-4 ${className}`}>
      {children}
    </div>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/8 dark:bg-mintcom-surface ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── ATM amount helpers ────────────────────────────────────────────────── */
function useAtmAmount() {
  const [cents, setCents] = useState(0);
  const display = (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const value = cents / 100;
  const onChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    setCents(digits === '' ? 0 : parseInt(digits, 10));
  };
  const reset = () => setCents(0);
  return { display, value, onChange, reset, cents };
}

/* ─── Open / Close shift modal (like CashManagementModal) ───────────────── */
function ShiftCashModal({
  mode,
  open,
  onClose,
  onConfirm,
  summary,
}: {
  mode: 'open' | 'close';
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  summary?: {
    cashSales: number;
    cardSales: number;
    otherSales: number;
    payIn: number;
    payOut: number;
    openingCash: number;
    orders: number;
    netSales: number;
    expectedCash: number;
    hoursLabel: string;
  };
}) {
  const atm = useAtmAmount();
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      atm.reset();
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const isOpen = mode === 'open';
  const title = isOpen ? 'Open shift' : 'Close shift';
  const cta = isOpen ? 'Open shift' : 'Close shift';
  const hint = isOpen
    ? 'Count the drawer and enter opening cash (ATM-style).'
    : 'Count the drawer and enter actual cash on hand.';

  const submit = () => {
    if (atm.value <= 0 && isOpen) {
      setError('Enter opening cash greater than $0.00');
      return;
    }
    if (atm.value < 0) {
      setError('Invalid amount');
      return;
    }
    onConfirm(atm.value);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl dark:border-mintcom-tertiary dark:bg-mintcom-surface"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/8">
          <div>
            <p className="text-sm font-black text-text-primary dark:text-white">{title}</p>
            <p className="text-[11px] text-text-secondary dark:text-mintcom-textSecondary">{hint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100 dark:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {!isOpen && summary && (
            <div className="rounded-2xl border border-gray-100 bg-cream-50 p-3 dark:border-white/8 dark:bg-mintcom-dark">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Shift summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                <Row label="Orders" value={String(summary.orders)} />
                <Row label="Hours" value={summary.hoursLabel} />
                <Row label="Net sales" value={money(summary.netSales)} />
                <Row label="Opening cash" value={money(summary.openingCash)} />
                <Row label="Cash sales" value={money(summary.cashSales)} />
                <Row label="Card sales" value={money(summary.cardSales)} />
                <Row label="Other" value={money(summary.otherSales)} />
                <Row label="Pay in" value={money(summary.payIn)} accent="green" />
                <Row label="Pay out" value={money(summary.payOut)} accent="red" />
                <Row label="Expected cash" value={money(summary.expectedCash)} bold />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
              {isOpen ? 'Opening cash' : 'Actual cash in drawer'}
            </label>
            <div
              className={`flex items-center gap-2 rounded-2xl border-2 bg-cream-50 px-4 py-3 dark:bg-mintcom-dark ${
                error ? 'border-mintcom-red' : 'border-mintcom-green/40'
              }`}
            >
              <span className="text-lg font-black text-mintcom-green">$</span>
              <input
                inputMode="numeric"
                value={atm.display}
                onChange={(e) => {
                  atm.onChange(e.target.value);
                  setError('');
                }}
                className="w-full bg-transparent text-2xl font-black tabular-nums text-text-primary outline-none dark:text-white"
                autoFocus
              />
            </div>
            {error && <p className="mt-1 text-[11px] font-bold text-mintcom-red">{error}</p>}
            {!isOpen && summary && (
              <p className="mt-1.5 text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
                Variance:{' '}
                <span
                  className={`font-black ${
                    atm.value - summary.expectedCash === 0
                      ? 'text-mintcom-green'
                      : 'text-mintcom-red'
                  }`}
                >
                  {money(atm.value - summary.expectedCash)}
                </span>
              </p>
            )}
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1.5">
            {(isOpen ? [50, 100, 150, 200] : [summary?.expectedCash ?? 0, 100, 150, 200]).map((n, i) => (
              <button
                key={`${n}-${i}`}
                type="button"
                onClick={() => atm.onChange(String(Math.round(n * 100)))}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-bold text-text-secondary dark:border-white/10 dark:bg-mintcom-dark dark:text-mintcom-textSecondary"
              >
                {money(n)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-gray-100 p-4 dark:border-white/8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-bold text-text-secondary dark:border-white/10 dark:text-mintcom-textSecondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className={`flex-1 rounded-xl py-3 text-xs font-black text-white ${
              isOpen ? 'bg-mintcom-green' : 'bg-mintcom-red'
            }`}
          >
            {cta}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Mid-shift cash in / cash out (pay-in / pay-out) ───────────────────── */
function PayInOutModal({
  open,
  initialType,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initialType: 'in' | 'out';
  onClose: () => void;
  onConfirm: (type: 'in' | 'out', amount: number, reason: string) => void;
}) {
  const [type, setType] = useState<'in' | 'out'>(initialType);
  const atm = useAtmAmount();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setType(initialType);
      atm.reset();
      setReason('');
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialType]);

  if (!open) return null;

  const submit = () => {
    if (atm.value <= 0) {
      setError('Enter an amount greater than $0.00');
      return;
    }
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }
    onConfirm(type, atm.value, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl dark:border-mintcom-tertiary dark:bg-mintcom-surface"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/8">
          <p className="text-sm font-black text-text-primary dark:text-white">Cash drawer movement</p>
          <button type="button" onClick={onClose} className="rounded-lg bg-cream-100 p-1.5 dark:bg-white/10">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'in' as const, label: 'Cash in', icon: ArrowDownLeft, desc: 'Pay in' },
                { id: 'out' as const, label: 'Cash out', icon: ArrowUpRight, desc: 'Pay out' },
              ] as const
            ).map((t) => {
              const on = type === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-3 text-start transition-colors ${
                    on
                      ? t.id === 'in'
                        ? 'border-mintcom-green bg-mintcom-green/10'
                        : 'border-mintcom-red bg-mintcom-red/10'
                      : 'border-gray-200 dark:border-white/10'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${
                      t.id === 'in' ? 'bg-mintcom-green' : 'bg-mintcom-red'
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <span>
                    <span className="block text-xs font-black text-text-primary dark:text-white">{t.label}</span>
                    <span className="text-[10px] text-text-tertiary">{t.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
              Amount
            </label>
            <div className="flex items-center gap-2 rounded-2xl border-2 border-mintcom-green/40 bg-cream-50 px-4 py-3 dark:bg-mintcom-dark">
              <span className="text-lg font-black text-mintcom-green">$</span>
              <input
                inputMode="numeric"
                value={atm.display}
                onChange={(e) => {
                  atm.onChange(e.target.value);
                  setError('');
                }}
                className="w-full bg-transparent text-2xl font-black tabular-nums outline-none dark:text-white"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
              Reason
            </label>
            <input
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder={type === 'in' ? 'e.g. Float top-up' : 'e.g. Bank drop'}
              className="w-full rounded-2xl border border-gray-200 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:border-mintcom-green dark:border-mintcom-tertiary dark:bg-mintcom-dark dark:text-white"
            />
          </div>

          {error && <p className="text-[11px] font-bold text-mintcom-red">{error}</p>}

          <button
            type="button"
            onClick={submit}
            className={`w-full rounded-xl py-3 text-xs font-black text-white ${
              type === 'in' ? 'bg-mintcom-green' : 'bg-mintcom-red'
            }`}
          >
            Confirm {type === 'in' ? 'cash in' : 'cash out'} · {money(atm.value)}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  bold,
}: {
  label: string;
  value: string;
  accent?: 'green' | 'red';
  bold?: boolean;
}) {
  return (
    <>
      <span className="text-text-secondary dark:text-mintcom-textSecondary">{label}</span>
      <span
        className={`text-end tabular-nums ${
          bold
            ? 'font-black text-text-primary dark:text-white'
            : accent === 'green'
              ? 'font-bold text-mintcom-green'
              : accent === 'red'
                ? 'font-bold text-mintcom-red'
                : 'font-semibold text-text-primary dark:text-white'
        }`}
      >
        {value}
      </span>
    </>
  );
}

/* ─── Dashboard (matches POS ShiftManagementCard + metric grid) ─────────── */
export function DemoDashboardScreen({
  staff,
  shift,
  onOpenShift,
  onCloseShift,
  onPayInOut,
  onGoSales,
  onGoOrders,
  autoOpenShiftModal = false,
  onAutoOpenShiftModalHandled,
}: {
  staff: Staff | null;
  shift: DemoShift;
  onOpenShift: (openingCash: number) => void;
  onCloseShift: (actualCash: number) => void;
  onPayInOut: (type: 'in' | 'out', amount: number, reason: string) => void;
  onGoSales: () => void;
  onGoOrders?: () => void;
  /** Parent asks to open the Open Shift amount popup (e.g. user tapped Sales without a shift). */
  autoOpenShiftModal?: boolean;
  onAutoOpenShiftModalHandled?: () => void;
}) {
  const [shiftModal, setShiftModal] = useState<'open' | 'close' | null>(null);
  const [payModal, setPayModal] = useState<'in' | 'out' | null>(null);
  const [closedReview, setClosedReview] = useState<{
    expected: number;
    actual: number;
    variance: number;
  } | null>(null);

  useEffect(() => {
    if (autoOpenShiftModal && !shift.open) {
      setShiftModal('open');
      onAutoOpenShiftModalHandled?.();
    }
  }, [autoOpenShiftModal, shift.open, onAutoOpenShiftModalHandled]);

  const netSales = shift.cashSales + shift.cardSales + shift.otherSales;
  const expectedCash = shift.openingCash + shift.cashSales + shift.payIn - shift.payOut;

  const hoursLabel = useMemo(() => {
    if (!shift.startedAt) return '0h 0m';
    const ms = Date.now() - shift.startedAt;
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return `${h}h ${m}m`;
  }, [shift.startedAt, shift.open, shift.orders, shift.cashSales]);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  // Synthetic hour bars — bias toward live sales so chart feels alive
  const baseBars = [22, 38, 55, 72, 64, 50, 80, 68, 42];
  const liveBoost = Math.min(40, shift.orders * 6);
  const bars = baseBars.map((b, i) => b + (i === 6 ? liveBoost : Math.floor(liveBoost * 0.15)));
  const maxBar = Math.max(...bars, 1);

  return (
    <Fill>
      {/* Shift management card — mirrors POS ShiftManagementCard */}
      <Card className="mb-2 shrink-0 p-3 sm:p-3.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-text-primary dark:text-white sm:text-base">
              {shift.open
                ? `You're doing great, ${staff?.name ?? 'Cashier'}!`
                : `Welcome back, ${staff?.name ?? 'Cashier'}`}
            </p>
            <p className="text-[11px] text-text-secondary dark:text-mintcom-textSecondary">{dateLabel}</p>
            {shift.open && shift.startedAt && (
              <p className="mt-0.5 text-[10px] font-bold text-mintcom-green">
                Shift open · {new Date(shift.startedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ·{' '}
                {hoursLabel}
              </p>
            )}
            {!shift.open && (
              <p className="mt-0.5 text-[10px] text-text-tertiary dark:text-mintcom-gray">
                Open a shift to start selling and tracking the drawer
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {shift.open && (
              <>
                <button
                  type="button"
                  onClick={() => onGoOrders?.() ?? onGoSales()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-mintcom-green px-3 py-2 text-[11px] font-bold text-mintcom-green"
                >
                  <List size={14} /> My orders
                </button>
                <button
                  type="button"
                  onClick={() => setPayModal('in')}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-cream-50 px-2.5 py-2 text-[11px] font-bold text-text-primary dark:border-white/10 dark:bg-mintcom-dark dark:text-white"
                >
                  <ArrowDownLeft size={13} className="text-mintcom-green" /> Cash in
                </button>
                <button
                  type="button"
                  onClick={() => setPayModal('out')}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-cream-50 px-2.5 py-2 text-[11px] font-bold text-text-primary dark:border-white/10 dark:bg-mintcom-dark dark:text-white"
                >
                  <ArrowUpRight size={13} className="text-mintcom-red" /> Cash out
                </button>
                <button
                  type="button"
                  onClick={() => setShiftModal('close')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-mintcom-red px-3 py-2 text-[11px] font-black text-white"
                >
                  <LogOut size={14} /> Close shift
                </button>
              </>
            )}
            {!shift.open && (
              <button
                type="button"
                onClick={() => setShiftModal('open')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-mintcom-green px-4 py-2.5 text-[11px] font-black text-white shadow-md shadow-mintcom-green/25"
              >
                <LogIn size={14} /> Open shift
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Metric grid — POS layout: left column tall cards + right 2x2 + chart */}
      <div className="grid min-h-0 flex-1 gap-2 overflow-hidden lg:grid-cols-2">
        {/* Left: Net / Cash / Card */}
        <div className="grid min-h-0 grid-rows-3 gap-2">
          <div className="flex min-h-0 flex-col justify-between rounded-2xl bg-mintcom-green p-3 text-white sm:p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-mintcom-green sm:h-10 sm:w-10">
                <TrendingUp size={18} />
              </span>
              <div>
                <p className="text-xs font-bold sm:text-sm">Net sales</p>
                <p className="text-[9px] text-white/75">Including tax</p>
              </div>
            </div>
            <p className="text-2xl font-black tabular-nums sm:text-3xl">{money(netSales)}</p>
          </div>

          <MetricSalesCard icon="💵" label="Cash sales" value={money(shift.cashSales)} />
          <MetricSalesCard icon="💳" label="Card sales" value={money(shift.cardSales)} />
        </div>

        {/* Right: small cards + chart */}
        <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-2">
          <div className="grid grid-cols-2 gap-2">
            <SmallMetric icon={<Receipt size={16} className="text-white" />} label="Orders" value={String(shift.orders)} />
            <Card className="flex items-center gap-2 p-2.5 sm:p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mintcom-green text-white">
                <Activity size={16} />
              </span>
              <div className="min-w-0 flex-1 text-[10px] font-bold">
                <div className="flex justify-between gap-1">
                  <span className="text-text-tertiary">PAY IN</span>
                  <span className="tabular-nums text-mintcom-green">{money(shift.payIn)}</span>
                </div>
                <div className="my-1 h-px bg-gray-200 dark:bg-white/10" />
                <div className="flex justify-between gap-1">
                  <span className="text-text-tertiary">PAY OUT</span>
                  <span className="tabular-nums text-mintcom-red">{money(shift.payOut)}</span>
                </div>
              </div>
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SmallMetric
              icon={<Wallet size={16} className="text-white" />}
              label="Other payments"
              value={money(shift.otherSales)}
            />
            <SmallMetric icon={<Clock size={16} className="text-white" />} label="Hours worked" value={hoursLabel} />
          </div>

          <Card className="flex min-h-0 flex-col p-2.5 sm:p-3">
            <div className="mb-1 flex shrink-0 items-center justify-between">
              <p className="text-xs font-black text-text-primary dark:text-white">Sales trend</p>
              <button
                type="button"
                onClick={onGoSales}
                className="text-[10px] font-bold text-mintcom-green hover:underline"
              >
                Go to sales →
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-end gap-1">
              {bars.map((h, i) => (
                <div key={hours[i]} className="flex h-full min-h-0 flex-1 flex-col items-center justify-end gap-0.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(h / maxBar) * 100}%` }}
                    transition={{ delay: i * 0.03, type: 'spring', stiffness: 200, damping: 22 }}
                    className="w-full min-h-[4px] rounded-t-md bg-mintcom-green/85"
                  />
                  <span className="text-[8px] font-bold text-text-tertiary">{hours[i]}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {!shift.open && (
        <p className="mt-2 shrink-0 text-center text-[11px] font-bold text-text-tertiary dark:text-mintcom-gray">
          Tip: Open shift first — then ring sales. Cash in / out updates the drawer mid-shift.
        </p>
      )}

      <AnimatePresence>
        {shiftModal && (
          <ShiftCashModal
            mode={shiftModal}
            open
            onClose={() => setShiftModal(null)}
            summary={
              shiftModal === 'close'
                ? {
                    cashSales: shift.cashSales,
                    cardSales: shift.cardSales,
                    otherSales: shift.otherSales,
                    payIn: shift.payIn,
                    payOut: shift.payOut,
                    openingCash: shift.openingCash,
                    orders: shift.orders,
                    netSales,
                    expectedCash,
                    hoursLabel,
                  }
                : undefined
            }
            onConfirm={(amount) => {
              if (shiftModal === 'open') {
                onOpenShift(amount);
                setShiftModal(null);
              } else {
                onCloseShift(amount);
                setClosedReview({
                  expected: expectedCash,
                  actual: amount,
                  variance: amount - expectedCash,
                });
                setShiftModal(null);
              }
            }}
          />
        )}
      </AnimatePresence>

      <PayInOutModal
        open={payModal !== null}
        initialType={payModal ?? 'in'}
        onClose={() => setPayModal(null)}
        onConfirm={(type, amount, reason) => {
          onPayInOut(type, amount, reason);
          setPayModal(null);
        }}
      />

      {/* Close shift success */}
      <AnimatePresence>
        {closedReview && (
          <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm rounded-[28px] border border-gray-200 bg-white p-5 text-center shadow-2xl dark:border-mintcom-tertiary dark:bg-mintcom-surface"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-mintcom-green text-white">
                <Check size={24} strokeWidth={3} />
              </div>
              <p className="text-base font-black text-text-primary dark:text-white">Shift closed</p>
              <div className="mt-3 space-y-1 rounded-2xl bg-cream-50 p-3 text-start text-xs dark:bg-mintcom-dark">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Expected</span>
                  <span className="font-bold tabular-nums">{money(closedReview.expected)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Actual</span>
                  <span className="font-bold tabular-nums">{money(closedReview.actual)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1 dark:border-white/10">
                  <span className="font-bold">Variance</span>
                  <span
                    className={`font-black tabular-nums ${
                      closedReview.variance === 0 ? 'text-mintcom-green' : 'text-mintcom-red'
                    }`}
                  >
                    {money(closedReview.variance)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClosedReview(null)}
                className="mt-4 w-full rounded-xl bg-mintcom-green py-2.5 text-xs font-black text-white"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Fill>
  );
}

function MetricSalesCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <Card className="flex min-h-0 flex-col justify-between p-3 sm:p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mintcom-green text-base text-white sm:h-10 sm:w-10 sm:text-lg">
          {icon}
        </span>
        <div>
          <p className="text-xs font-bold text-text-secondary dark:text-mintcom-textSecondary sm:text-sm">{label}</p>
          <p className="text-[9px] text-text-tertiary">Including tax</p>
        </div>
      </div>
      <p className="text-xl font-black tabular-nums text-text-primary dark:text-white sm:text-2xl">{value}</p>
    </Card>
  );
}

function SmallMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-2 p-2.5 sm:p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mintcom-green">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-bold text-text-tertiary dark:text-mintcom-gray">{label}</p>
        <p className="truncate text-sm font-black tabular-nums text-text-primary dark:text-white">{value}</p>
      </div>
    </Card>
  );
}

/* ─── Reports (closer to POS Sales summary + tabs) ──────────────────────── */
export function DemoReportsScreen({ shift }: { shift: DemoShift }) {
  const [tab, setTab] = useState<'summary' | 'orders' | 'items' | 'payments' | 'drawer'>('summary');
  const [range, setRange] = useState<'today' | 'week' | 'month'>('today');

  const net = shift.cashSales + shift.cardSales + shift.otherSales;
  const tax = net * 0.08;
  const gross = net; // simplified
  const expectedCash = shift.openingCash + shift.cashSales + shift.payIn - shift.payOut;

  // Seed demo baseline for empty shift so reports still look real
  const seeded = !shift.orders;
  const displayNet = seeded ? 1240.5 : net;
  const displayOrders = seeded ? 32 : shift.orders;
  const displayCash = seeded ? 520 : shift.cashSales;
  const displayCard = seeded ? 610 : shift.cardSales;
  const displayOther = seeded ? 110.5 : shift.otherSales;
  const displayTax = seeded ? 99.24 : tax;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekBars = [420, 510, 480, 620, 700, 890, 640];
  const maxWeek = Math.max(...weekBars);

  return (
    <Fill>
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-barlow text-lg font-black text-text-primary dark:text-white sm:text-xl">Reports</h2>
          <p className="text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
            {shift.open ? 'Live shift + history' : 'Demo data · open a shift to track live sales'}
          </p>
        </div>
        <div className="flex gap-1">
          {(
            [
              { id: 'today' as const, label: 'Today' },
              { id: 'week' as const, label: 'Week' },
              { id: 'month' as const, label: 'Month' },
            ] as const
          ).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                range === r.id
                  ? 'bg-mintcom-green text-white'
                  : 'bg-white text-text-secondary ring-1 ring-gray-200 dark:bg-mintcom-surface dark:text-mintcom-textSecondary dark:ring-white/10'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2 flex shrink-0 flex-wrap gap-1">
        {(
          [
            { id: 'summary' as const, label: 'Summary' },
            { id: 'orders' as const, label: 'Orders' },
            { id: 'items' as const, label: 'Items' },
            { id: 'payments' as const, label: 'Payments' },
            { id: 'drawer' as const, label: 'Drawer' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
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
        {tab === 'summary' && (
          <div className="grid h-full min-h-0 gap-2 lg:grid-cols-5">
            <div className="grid min-h-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:col-span-3 lg:grid-cols-3 lg:grid-rows-2">
              {[
                { label: 'Gross sales', value: money(displayNet), color: 'bg-mintcom-green text-white' },
                { label: 'Net sales', value: money(displayNet), color: '' },
                { label: 'Tax collected', value: money(displayTax), color: '' },
                { label: 'Orders', value: String(displayOrders), color: '' },
                { label: 'Cash', value: money(displayCash), color: '' },
                { label: 'Card', value: money(displayCard), color: '' },
              ].map((c) => (
                <Card
                  key={c.label}
                  className={`flex min-h-0 flex-col justify-center p-3 ${c.color || ''}`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      c.color ? 'text-white/80' : 'text-text-tertiary dark:text-mintcom-gray'
                    }`}
                  >
                    {c.label}
                  </p>
                  <p
                    className={`text-lg font-black tabular-nums sm:text-xl ${
                      c.color ? 'text-white' : 'text-text-primary dark:text-white'
                    }`}
                  >
                    {c.value}
                  </p>
                </Card>
              ))}
            </div>
            <Card className="flex min-h-0 flex-col p-3 lg:col-span-2">
              <p className="mb-2 shrink-0 text-xs font-black text-text-primary dark:text-white">
                {range === 'today' ? 'Today by hour' : 'Weekly sales'}
              </p>
              <div className="flex min-h-0 flex-1 items-end gap-1.5">
                {(range === 'week' ? weekBars : [28, 45, 62, 88, 70, 55, 92, 75, 48]).map((v, i) => {
                  const labels = range === 'week' ? days : [9, 10, 11, 12, 13, 14, 15, 16, 17];
                  const max = range === 'week' ? maxWeek : 92;
                  return (
                    <div key={i} className="flex h-full min-h-0 flex-1 flex-col items-center justify-end gap-0.5">
                      <div
                        className="w-full rounded-t-md bg-mintcom-green"
                        style={{ height: `${(v / max) * 100}%`, minHeight: 8, maxHeight: '100%' }}
                      />
                      <span className="text-[8px] font-bold text-text-tertiary">{labels[i]}</span>
                    </div>
                  );
                })}
              </div>
              {seeded && (
                <p className="mt-1 shrink-0 text-[9px] text-text-tertiary">Showing sample data until you complete sales</p>
              )}
            </Card>
          </div>
        )}

        {tab === 'orders' && (
          <Card className="flex h-full min-h-0 flex-col p-3">
            <p className="mb-2 shrink-0 text-xs font-black text-text-primary dark:text-white">
              Recent orders {shift.sales.length ? `(this shift)` : ''}
            </p>
            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
              {(shift.sales.length
                ? shift.sales
                : [
                    { id: 'd1', orderNo: 1038, total: 18.5, methodLabel: 'Card', items: '☕ Latte · 🥐 Croissant', at: Date.now() - 3600000 },
                    { id: 'd2', orderNo: 1039, total: 7.5, methodLabel: 'Cash', items: '🥪 Club sandwich', at: Date.now() - 7200000 },
                    { id: 'd3', orderNo: 1040, total: 12.25, methodLabel: 'CliQ', items: '☕ Espresso ×2 · 🍪 Cookie', at: Date.now() - 10800000 },
                  ]
              ).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-cream-50 px-3 py-2 dark:border-white/8 dark:bg-mintcom-dark"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mintcom-green/15 text-xs font-black text-mintcom-green">
                    #{o.orderNo}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-text-primary dark:text-white">{o.items}</p>
                    <p className="text-[10px] text-text-tertiary">
                      {o.methodLabel} ·{' '}
                      {new Date(o.at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-xs font-black tabular-nums text-mintcom-green">{money(o.total)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'items' && (
          <Card className="flex h-full min-h-0 flex-col p-3">
            <p className="mb-2 text-xs font-black text-text-primary dark:text-white">Top items</p>
            <table className="w-full text-start text-[11px] sm:text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[9px] uppercase text-text-tertiary dark:border-white/8">
                  <th className="pb-1.5 font-bold">Item</th>
                  <th className="pb-1.5 font-bold">Qty</th>
                  <th className="pb-1.5 font-bold">Sales</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: 'Latte', q: 24 + shift.orders, s: 132 + shift.cashSales * 0.2 },
                  { n: 'Espresso', q: 18, s: 63 },
                  { n: 'Croissant', q: 15, s: 60 },
                  { n: 'Club sandwich', q: 11, s: 82.5 },
                  { n: 'Garden salad', q: 8, s: 52 },
                ].map((row) => (
                  <tr key={row.n} className="border-b border-gray-50 dark:border-white/5">
                    <td className="py-2 font-bold text-text-primary dark:text-white">{row.n}</td>
                    <td className="py-2 tabular-nums">{Math.round(row.q)}</td>
                    <td className="py-2 font-black tabular-nums text-mintcom-green">{money(row.s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'payments' && (
          <div className="grid h-full min-h-0 grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { label: 'Cash', value: displayCash, emoji: '💵', pct: 42 },
              { label: 'Card', value: displayCard, emoji: '💳', pct: 48 },
              { label: 'Other', value: displayOther, emoji: '⚡', pct: 10 },
            ].map((p) => (
              <Card key={p.label} className="flex min-h-0 flex-col justify-center p-4">
                <span className="mb-2 text-2xl">{p.emoji}</span>
                <p className="text-xs font-bold text-text-secondary">{p.label}</p>
                <p className="text-2xl font-black tabular-nums text-text-primary dark:text-white">{money(p.value)}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-200 dark:bg-mintcom-dark">
                  <div className="h-full rounded-full bg-mintcom-green" style={{ width: `${p.pct}%` }} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'drawer' && (
          <div className="grid h-full min-h-0 gap-2 lg:grid-cols-2">
            <Card className="flex min-h-0 flex-col p-3">
              <p className="mb-2 text-xs font-black text-text-primary dark:text-white">Cash drawer</p>
              <div className="grid flex-1 content-center gap-2 text-xs">
                {[
                  { l: 'Opening cash', v: money(shift.openingCash) },
                  { l: 'Cash sales', v: money(shift.cashSales) },
                  { l: 'Pay in', v: money(shift.payIn), c: 'text-mintcom-green' },
                  { l: 'Pay out', v: money(shift.payOut), c: 'text-mintcom-red' },
                  { l: 'Expected cash', v: money(expectedCash), bold: true },
                ].map((r) => (
                  <div key={r.l} className="flex justify-between border-b border-gray-50 py-1.5 dark:border-white/5">
                    <span className="text-text-secondary dark:text-mintcom-textSecondary">{r.l}</span>
                    <span className={`font-bold tabular-nums ${r.bold ? 'text-mintcom-green' : r.c || 'text-text-primary dark:text-white'}`}>
                      {r.v}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="flex min-h-0 flex-col p-3">
              <p className="mb-2 text-xs font-black text-text-primary dark:text-white">Cash in / out log</p>
              <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
                {shift.movements.length === 0 ? (
                  <p className="py-8 text-center text-[11px] text-text-tertiary">
                    No movements yet. Use Cash in / Cash out on the dashboard.
                  </p>
                ) : (
                  shift.movements.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 rounded-xl bg-cream-50 px-2.5 py-2 dark:bg-mintcom-dark"
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${
                          m.type === 'in' ? 'bg-mintcom-green' : 'bg-mintcom-red'
                        }`}
                      >
                        {m.type === 'in' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-text-primary dark:text-white">{m.reason}</p>
                        <p className="text-[9px] text-text-tertiary">
                          {new Date(m.at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p
                        className={`text-xs font-black tabular-nums ${
                          m.type === 'in' ? 'text-mintcom-green' : 'text-mintcom-red'
                        }`}
                      >
                        {m.type === 'in' ? '+' : '−'}
                        {money(m.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Fill>
  );
}

/* ─── Notifications center (held + stock + system — like real POS) ─────── */
export type DemoHeldTicket = {
  id: string;
  orderNo: number;
  type: 'dine-in' | 'takeaway' | 'delivery';
  lines: { emoji: string; name: string; qty: number; unitPrice: number }[];
  discountPct: number;
  note: string;
  /** Table or guest nickname from Hold Order popup */
  label: string;
  at: number;
};

type Notif = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: 'stock_red' | 'stock_yellow' | 'stock_out' | 'system' | 'shift';
  unread: boolean;
};

const INITIAL_NOTIFS: Notif[] = [
  {
    id: 's1',
    title: 'Out of stock · Oat milk',
    body: '0 units left. Item is blocked on the sales screen until restocked.',
    time: '4m ago',
    kind: 'stock_out',
    unread: true,
  },
  {
    id: 's2',
    title: 'Critical stock · Espresso beans',
    body: '4 bags left — below red threshold (5).',
    time: '18m ago',
    kind: 'stock_red',
    unread: true,
  },
  {
    id: 's3',
    title: 'Low stock · To-go cups L',
    body: '28 left — yellow threshold. Reorder soon.',
    time: '1h ago',
    kind: 'stock_yellow',
    unread: true,
  },
  {
    id: 's4',
    title: 'Shift reminder',
    body: 'Cash drawer variance check recommended before close.',
    time: '2h ago',
    kind: 'shift',
    unread: false,
  },
  {
    id: 's5',
    title: 'Printer ready',
    body: 'Kitchen printer reconnected successfully.',
    time: 'Yesterday',
    kind: 'system',
    unread: false,
  },
];

function orderTypeShort(t: DemoHeldTicket['type']) {
  if (t === 'dine-in') return 'Dine in';
  if (t === 'takeaway') return 'Takeaway';
  return 'Delivery';
}

function stockTone(kind: Notif['kind']) {
  if (kind === 'stock_out' || kind === 'stock_red')
    return {
      bar: 'bg-mintcom-red',
      chip: 'bg-mintcom-red/15 text-mintcom-red',
      icon: <AlertTriangle size={16} className="text-white" />,
      iconBg: 'bg-mintcom-red',
      label: kind === 'stock_out' ? 'Out of stock' : 'Critical',
    };
  if (kind === 'stock_yellow')
    return {
      bar: 'bg-mintcom-yellow',
      chip: 'bg-mintcom-yellow/20 text-amber-700 dark:text-mintcom-yellow',
      icon: <Package size={16} className="text-black" />,
      iconBg: 'bg-mintcom-yellow',
      label: 'Low stock',
    };
  if (kind === 'shift')
    return {
      bar: 'bg-mintcom-green',
      chip: 'bg-mintcom-green/15 text-mintcom-green',
      icon: <Clock size={16} className="text-white" />,
      iconBg: 'bg-mintcom-green',
      label: 'Shift',
    };
  return {
    bar: 'bg-sky-500',
    chip: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    icon: <CheckCheck size={16} className="text-white" />,
    iconBg: 'bg-sky-500',
    label: 'System',
  };
}

/**
 * One screen like mintcom-pos NotificationsScreen:
 * 1) Pinned held orders (resume)
 * 2) Stock + system alerts below
 */
export function DemoNotificationsScreen({
  held,
  staffName,
  onResumeHeld,
  onDismissHeld,
}: {
  held: DemoHeldTicket[];
  staffName?: string;
  onResumeHeld: (ticket: DemoHeldTicket) => void;
  onDismissHeld?: (id: string) => void;
}) {
  const [items, setItems] = useState(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<'all' | 'held' | 'stock' | 'other'>('all');
  const unread = items.filter((n) => n.unread).length;
  const badgeTotal = held.length + unread;

  const markAll = () => setItems((list) => list.map((n) => ({ ...n, unread: false })));
  const toggle = (id: string) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));

  const stockItems = items.filter((n) => n.kind.startsWith('stock'));
  const otherItems = items.filter((n) => !n.kind.startsWith('stock'));

  const showHeld = filter === 'all' || filter === 'held';
  const showStock = filter === 'all' || filter === 'stock';
  const showOther = filter === 'all' || filter === 'other';

  return (
    <Fill>
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-barlow text-lg font-black text-text-primary dark:text-white sm:text-xl">
            Notifications
          </h2>
          <p className="text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
            Held orders · stock · system — same center as Mintcom POS
            {badgeTotal > 0 ? ` · ${badgeTotal} active` : ''}
          </p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold dark:border-white/10 dark:bg-mintcom-surface dark:text-white"
          >
            <CheckCheck size={14} className="text-mintcom-green" /> Mark alerts read
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="mb-2 flex shrink-0 flex-wrap gap-1">
        {(
          [
            { id: 'all' as const, label: 'All', count: held.length + items.length },
            { id: 'held' as const, label: 'Held', count: held.length },
            { id: 'stock' as const, label: 'Stock', count: stockItems.length },
            { id: 'other' as const, label: 'Other', count: otherItems.length },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
              filter === f.id
                ? 'bg-mintcom-green text-white'
                : 'bg-white text-text-secondary ring-1 ring-gray-200 dark:bg-mintcom-surface dark:text-mintcom-textSecondary dark:ring-white/10'
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className={`ms-1 tabular-nums ${filter === f.id ? 'text-white/80' : 'text-text-tertiary'}`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        {/* ── Held orders (pinned) ── */}
        {showHeld && (
          <section className="flex min-h-0 shrink-0 flex-col gap-1.5 overflow-hidden" style={{ maxHeight: held.length ? '42%' : undefined }}>
            <div className="flex shrink-0 items-center gap-2">
              <Pause size={12} className="text-mintcom-green" />
              <p className="text-[10px] font-black uppercase tracking-wider text-text-tertiary dark:text-mintcom-gray">
                Held orders
              </p>
              {held.length > 0 && (
                <span className="rounded-full bg-mintcom-green/15 px-1.5 py-0.5 text-[9px] font-black text-mintcom-green">
                  {held.length}
                </span>
              )}
            </div>

            {held.length === 0 ? (
              filter === 'held' ? (
                <Card className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <Pause className="mb-2 text-mintcom-green/50" size={28} />
                  <p className="text-sm font-bold text-text-primary dark:text-white">No held orders</p>
                  <p className="mt-1 max-w-xs text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
                    On Sales, build a ticket and tap the pause icon to park it here.
                  </p>
                </Card>
              ) : (
                <p className="rounded-xl border border-dashed border-gray-200 px-3 py-2 text-[11px] text-text-tertiary dark:border-white/10">
                  No held orders — park a ticket from Sales with Hold.
                </p>
              )
            ) : (
              <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pe-0.5">
                {held.map((t) => {
                  const sub = t.lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
                  const qty = t.lines.reduce((s, l) => s + l.qty, 0);
                  const age = Math.max(1, Math.round((Date.now() - t.at) / 60000));
                  return (
                    <div
                      key={t.id}
                      className="overflow-hidden rounded-2xl border border-mintcom-green/30 bg-gradient-to-br from-mintcom-green to-mintcom-greenDark text-white shadow-md shadow-mintcom-green/20"
                    >
                      <div className="flex items-start gap-3 p-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                          <ShoppingBag size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-sm font-black">{t.label || `Held · #${t.orderNo}`}</p>
                            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold">
                              #{t.orderNo}
                            </span>
                            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold">
                              {orderTypeShort(t.type)}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-white/85">
                            {t.lines.map((l) => `${l.emoji} ${l.name}×${l.qty}`).join(' · ')}
                          </p>
                          <p className="mt-0.5 text-[10px] text-white/70">
                            {qty} items · {money(sub)}
                            {t.discountPct > 0 ? ` · ${t.discountPct}% off` : ''}
                            {' · '}
                            {age < 60 ? `${age}m ago` : `${Math.floor(age / 60)}h ago`}
                            {staffName ? ` · ${staffName}` : ''}
                          </p>
                          {t.note && (
                            <p className="mt-1 line-clamp-1 text-[10px] text-white/80">📝 {t.note}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => onResumeHeld(t)}
                            className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-[11px] font-black text-mintcom-green"
                          >
                            <Play size={12} fill="currentColor" /> Resume
                          </button>
                          {onDismissHeld && (
                            <button
                              type="button"
                              onClick={() => onDismissHeld(t.id)}
                              className="rounded-xl bg-white/15 px-2 py-1 text-[10px] font-bold text-white/90 hover:bg-white/25"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Stock + other alerts ── */}
        {(showStock || showOther) && (
          <section className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
            <div className="flex shrink-0 items-center gap-2">
              <AlertTriangle size={12} className="text-mintcom-yellow" />
              <p className="text-[10px] font-black uppercase tracking-wider text-text-tertiary dark:text-mintcom-gray">
                {filter === 'stock' ? 'Stock alerts' : filter === 'other' ? 'Other alerts' : 'Stock & system'}
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pe-0.5">
              {(showStock ? stockItems : [])
                .concat(showOther ? otherItems : [])
                .map((n) => {
                  const tone = stockTone(n.kind);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => toggle(n.id)}
                      className={`flex w-full overflow-hidden rounded-2xl border text-start transition-all ${
                        n.unread
                          ? 'border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-mintcom-surface'
                          : 'border-gray-100 bg-cream-50 opacity-80 dark:border-white/5 dark:bg-mintcom-dark'
                      }`}
                    >
                      <span className={`w-1.5 shrink-0 ${tone.bar}`} />
                      <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.iconBg}`}
                        >
                          {tone.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-xs font-bold text-text-primary dark:text-white sm:text-sm">
                              {n.title}
                            </p>
                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${tone.chip}`}>
                              {tone.label}
                            </span>
                            {n.unread && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mintcom-green" />
                            )}
                          </div>
                          <p className="line-clamp-1 text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
                            {n.body}
                          </p>
                          <p className="text-[9px] font-bold text-text-tertiary dark:text-mintcom-gray">{n.time}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              {filter === 'stock' && stockItems.length === 0 && (
                <p className="py-8 text-center text-[11px] text-text-tertiary">No stock alerts</p>
              )}
              {filter === 'other' && otherItems.length === 0 && (
                <p className="py-8 text-center text-[11px] text-text-tertiary">No other alerts</p>
              )}
            </div>
          </section>
        )}
      </div>
    </Fill>
  );
}

/* ─── Settings (compact fill) ───────────────────────────────────────────── */
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
        <div className="flex gap-1 overflow-x-auto p-1.5 no-scrollbar lg:min-h-0 lg:flex-1 lg:flex-col">
          {SETTINGS_NAV.map((item) => {
            const on = active === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 text-start lg:w-full ${
                  on ? 'bg-mintcom-green text-white shadow-md' : 'text-text-secondary hover:bg-cream-100 dark:text-mintcom-textSecondary'
                }`}
              >
                <Icon size={15} />
                <span className="hidden text-[11px] font-bold lg:block">{item.label}</span>
                <span className="text-[10px] font-bold lg:hidden">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </aside>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
        <div className="mb-2 shrink-0">
          <h2 className="text-lg font-black text-text-primary dark:text-white">{activeMeta.label}</h2>
          <p className="text-[11px] text-text-secondary">{activeMeta.sub}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          {active === 'business' && (
            <div className="grid h-full grid-rows-3 gap-2 max-w-xl">
              {[
                { l: 'Business name', v: 'Cafe Delight' },
                { l: 'Location', v: 'Downtown branch · Amman' },
                { l: 'Hours', v: 'Sun–Thu 08–22 · Fri–Sat 09–23' },
              ].map((r) => (
                <Card key={r.l} className="flex flex-col justify-center p-3">
                  <p className="text-[9px] font-bold uppercase text-text-tertiary">{r.l}</p>
                  <p className="text-sm font-black text-text-primary dark:text-white">{r.v}</p>
                </Card>
              ))}
            </div>
          )}
          {active === 'sales' && (
            <div className="grid h-full max-w-xl grid-rows-3 gap-2">
              <Card className="flex flex-col justify-center p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">Tax {taxOn ? `· ${taxRate}%` : ''}</p>
                  <Toggle on={taxOn} onToggle={() => setTaxOn((v) => !v)} />
                </div>
                {taxOn && (
                  <input type="range" min={0} max={25} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="mt-2 w-full accent-mintcom-green" />
                )}
              </Card>
              <Card className="flex flex-col justify-center p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">Service charge {serviceOn ? `· ${serviceRate}%` : ''}</p>
                  <Toggle on={serviceOn} onToggle={() => setServiceOn((v) => !v)} />
                </div>
                {serviceOn && (
                  <input type="range" min={0} max={25} value={serviceRate} onChange={(e) => setServiceRate(Number(e.target.value))} className="mt-2 w-full accent-mintcom-green" />
                )}
              </Card>
              <Card className="flex flex-col justify-center gap-1.5 p-3">
                <p className="text-sm font-bold">Payment methods</p>
                <div className="flex items-center justify-between rounded-xl bg-cream-50 px-3 py-2 dark:bg-mintcom-dark">
                  <span className="text-xs font-bold">💵 Cash</span>
                  <span className="text-[9px] font-bold text-mintcom-green">Required</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-cream-50 px-3 py-2 dark:bg-mintcom-dark">
                  <span className="text-xs font-bold">💳 Card</span>
                  <Toggle on={cardOn} onToggle={() => setCardOn((v) => !v)} />
                </div>
              </Card>
            </div>
          )}
          {active === 'products' && (
            <div className="grid h-full grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { n: 'Latte', p: 4.5, e: '🥛' },
                { n: 'Espresso', p: 3.5, e: '☕' },
                { n: 'Croissant', p: 4, e: '🥐' },
                { n: 'Sandwich', p: 7.5, e: '🥪' },
                { n: 'Salad', p: 6.5, e: '🥗' },
                { n: 'Cake', p: 5.5, e: '🍰' },
              ].map((p) => (
                <Card key={p.n} className="flex items-center gap-2 p-2.5">
                  <span className="text-xl">{p.e}</span>
                  <div>
                    <p className="text-[11px] font-bold">{p.n}</p>
                    <p className="text-[11px] font-black text-mintcom-green">{money(p.p)}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {active === 'categories' && (
            <div className="grid h-full grid-cols-2 gap-2">
              {[
                { n: 'Beverages', c: 6, e: '☕' },
                { n: 'Pastries', c: 4, e: '🥐' },
                { n: 'Food', c: 4, e: '🥗' },
                { n: 'Desserts', c: 2, e: '🍰' },
              ].map((c) => (
                <Card key={c.n} className="flex items-center gap-3 p-3">
                  <span className="text-2xl">{c.e}</span>
                  <div>
                    <p className="text-sm font-bold">{c.n}</p>
                    <p className="text-[11px] text-text-tertiary">{c.c} products</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {active === 'stock' && (
            <Card className="flex h-full flex-col p-3">
              <div className="grid flex-1 grid-rows-4 gap-1.5">
                {[
                  { n: 'Oat milk', lvl: 2, s: 'low' },
                  { n: 'Croissant dough', lvl: 18, s: 'ok' },
                  { n: 'Espresso beans', lvl: 4, s: 'warn' },
                  { n: 'To-go cups L', lvl: 120, s: 'ok' },
                ].map((s) => (
                  <div key={s.n} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 dark:border-white/8">
                    <p className="text-xs font-bold">{s.n}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      s.s === 'low' ? 'bg-mintcom-red/15 text-mintcom-red' : s.s === 'warn' ? 'bg-mintcom-yellow/20 text-amber-700' : 'bg-mintcom-green/15 text-mintcom-green'
                    }`}>{s.lvl} · {s.s}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {active === 'addons' && (
            <div className="grid h-full grid-cols-2 gap-2">
              {[
                { n: 'Size', opts: 'S · M · L' },
                { n: 'Milk', opts: 'Whole · Oat · Almond' },
                { n: 'Extras', opts: 'Shot · Syrup · Whip' },
                { n: 'Add-ons', opts: 'Cheese · Avocado · Bacon' },
              ].map((g) => (
                <Card key={g.n} className="flex flex-col justify-center p-3">
                  <p className="text-sm font-black">{g.n}</p>
                  <p className="text-xs text-text-secondary">{g.opts}</p>
                </Card>
              ))}
            </div>
          )}
          {active === 'language' && (
            <Card className="flex h-full max-w-md flex-col justify-center p-4">
              <p className="mb-3 text-sm font-bold">Display language</p>
              <div className="flex gap-2">
                {(['en', 'ar'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`flex-1 rounded-xl border py-3 text-sm font-bold ${
                      lang === l ? 'border-mintcom-green bg-mintcom-green/15 text-mintcom-green' : 'border-gray-200 dark:border-white/10'
                    }`}
                  >
                    {l === 'en' ? 'English' : 'العربية'}
                  </button>
                ))}
              </div>
            </Card>
          )}
          {active === 'about' && (
            <Card className="flex h-full max-w-md flex-col justify-center p-4">
              <p className="text-lg font-black">Mintcom POS</p>
              <p className="text-xs text-text-secondary">Demo build · sandbox</p>
              <Link to="/" className="mt-3 text-xs font-bold text-mintcom-green">Visit website →</Link>
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
      className={`relative h-7 w-12 shrink-0 rounded-full ${on ? 'bg-mintcom-green' : 'bg-gray-300 dark:bg-mintcom-tertiary'}`}
    >
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'start-5' : 'start-0.5'}`} />
    </button>
  );
}

/* ─── Support ───────────────────────────────────────────────────────────── */
const ARTICLES = [
  { id: '1', cat: 'Getting started', title: 'Set up store payment methods', excerpt: 'Cash, Card, brands, delivery apps, wallets & vouchers.' },
  { id: '2', cat: 'Sales', title: 'Hold and resume orders', excerpt: 'Park tickets when a guest steps away.' },
  { id: '3', cat: 'Staff', title: 'Roles and PIN clock-in', excerpt: 'Assign cashiers, managers, and PINs.' },
  { id: '4', cat: 'Reports', title: 'End-of-day report', excerpt: 'Cash, card, discounts, tax, and variance.' },
  { id: '5', cat: 'Hardware', title: 'Connect a receipt printer', excerpt: 'Common thermal printer setup.' },
];

export function DemoSupportScreen() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ARTICLES;
    return ARTICLES.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
  }, [query]);

  return (
    <Fill>
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
        <div>
          <h2 className="font-barlow text-lg font-black text-text-primary dark:text-white">Support</h2>
          <p className="text-[11px] text-text-secondary">Help articles & contact</p>
        </div>
        <Link to="/support" className="text-[11px] font-bold text-mintcom-green">Full site →</Link>
      </div>
      <div className="relative mb-2 max-w-xl shrink-0">
        <HelpCircle size={14} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2 ps-9 pe-3 text-xs outline-none focus:border-mintcom-green dark:border-mintcom-tertiary dark:bg-mintcom-surface dark:text-white"
        />
      </div>
      <div className="grid min-h-0 flex-1 gap-2 overflow-hidden lg:grid-cols-3">
        <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden lg:col-span-2">
          {filtered.slice(0, 5).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setOpenId(openId === a.id ? null : a.id)}
              className="flex min-h-0 flex-1 items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-start dark:border-white/8 dark:bg-mintcom-surface"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-mintcom-green/15 text-mintcom-green">
                <FileText size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase text-mintcom-green">{a.cat}</p>
                <p className="truncate text-xs font-bold dark:text-white">{a.title}</p>
                <p className="line-clamp-1 text-[10px] text-text-secondary">{openId === a.id ? 'Demo preview — full guide on mintcompos.com/support.' : a.excerpt}</p>
              </div>
              <ChevronRight size={14} className={`shrink-0 text-text-tertiary ${openId === a.id ? 'rotate-90' : ''}`} />
            </button>
          ))}
        </div>
        <Card className="flex min-h-0 flex-col justify-center p-4">
          <Mail className="mb-2 text-mintcom-green" size={20} />
          <p className="text-sm font-black dark:text-white">Contact support</p>
          <a href="mailto:support@mintcompos.com" className="mt-3 rounded-xl bg-mintcom-green py-2.5 text-center text-[11px] font-black text-white">
            support@mintcompos.com
          </a>
        </Card>
      </div>
    </Fill>
  );
}
