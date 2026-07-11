import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Check,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Zap,
  Lock,
  Smartphone,
  Bell,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

// i18next `t` accepts flexible options; keep loose for demo copy fallbacks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DemoProps = { t: (...args: any[]) => any; isRtl: boolean };

const shell = (children: ReactNode, brand?: string) => (
  <div
    className="mt-5 select-none overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-b from-gray-50 to-white shadow-inner dark:border-white/10 dark:from-[#0c0c0c] dark:to-[#121212]"
    onPointerDown={(e) => e.stopPropagation()}
  >
    {brand && (
      <div className="flex items-center justify-between border-b border-gray-100 px-3.5 py-2 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mintcom-green" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            {brand}
          </span>
        </div>
      </div>
    )}
    <div className="p-3 sm:p-3.5">{children}</div>
  </div>
);

const money = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/* ─── Point of Sale ─────────────────────────────────────────────────────── */
type PosProduct = { id: string; name: string; price: number; emoji: string; color: string };
type CartLine = { id: string; name: string; price: number; qty: number; emoji: string };

export const InteractivePosDemo = ({ t, isRtl }: DemoProps) => {
  const products: PosProduct[] = useMemo(
    () => [
      { id: 'espresso', name: String(t('landing.workflow.receipt.demo.pos.espresso', 'Espresso')), price: 3.5, emoji: '☕', color: 'from-amber-500/20 to-orange-500/10 border-amber-400/30 hover:border-amber-400/60' },
      { id: 'croissant', name: String(t('landing.workflow.receipt.demo.pos.croissant', 'Croissant')), price: 4, emoji: '🥐', color: 'from-yellow-500/20 to-amber-500/10 border-yellow-400/30 hover:border-yellow-400/60' },
      { id: 'soda', name: String(t('landing.workflow.receipt.demo.pos.soda', 'Soda')), price: 2.5, emoji: '🥤', color: 'from-sky-500/20 to-blue-500/10 border-sky-400/30 hover:border-sky-400/60' },
      { id: 'salad', name: String(t('landing.workflow.receipt.demo.pos.salad', 'Salad')), price: 6.5, emoji: '🥗', color: 'from-emerald-500/20 to-green-500/10 border-emerald-400/30 hover:border-emerald-400/60' },
    ],
    [t],
  );
  const [cart, setCart] = useState<CartLine[]>([]);
  const [phase, setPhase] = useState<'selling' | 'paying' | 'done'>('selling');
  const [payMethod, setPayMethod] = useState<'card' | 'cash' | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [pulseTotal, setPulseTotal] = useState(0);

  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const itemCount = cart.reduce((s, l) => s + l.qty, 0);

  const addProduct = (p: PosProduct) => {
    if (phase !== 'selling') return;
    setCart((prev) => {
      const existing = prev.find((l) => l.id === p.id);
      if (existing) return prev.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1, emoji: p.emoji }];
    });
    setLastAdded(p.id);
    setPulseTotal((n) => n + 1);
    window.setTimeout(() => setLastAdded(null), 350);
  };

  const clearCart = () => {
    setCart([]);
    setPhase('selling');
    setPayMethod(null);
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="mt-5 select-none" onPointerDown={(e) => e.stopPropagation()}>
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-b from-gray-50 to-white shadow-inner dark:border-white/10 dark:from-[#0c0c0c] dark:to-[#121212]">
        <div className="flex items-center justify-between border-b border-gray-100 px-3.5 py-2 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mintcom-green" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
              {String(t('landing.workflow.receipt.brand', 'MINTCOM POS'))}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-mintcom-green/10 px-2 py-0.5 text-[10px] font-bold text-mintcom-green">
            <ShoppingBag size={10} />
            {itemCount}
          </div>
        </div>
        <div className="p-3 sm:p-3.5">
          <AnimatePresence mode="wait">
            {phase === 'done' ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-4 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }} className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-mintcom-green text-black shadow-[0_8px_28px_-6px_rgba(125,198,162,0.7)]">
                  <Check size={28} strokeWidth={3} />
                </motion.div>
                <p className="font-barlow text-lg font-bold text-gray-900 dark:text-white">{String(t('landing.workflow.receipt.frame.approved', 'Transaction approved'))}</p>
                <p className="mt-1 text-sm font-semibold text-mintcom-green">
                  {money(total)}{' '}
                  <span className="text-gray-400">
                    {String(t('landing.workflow.receipt.demo.sales.via', { m: payMethod === 'cash' ? String(t('landing.workflow.receipt.demo.sales.cash', 'Cash')) : String(t('landing.workflow.receipt.demo.sales.card', 'Card')), defaultValue: `via ${payMethod === 'cash' ? 'Cash' : 'Card'}` }))}
                  </span>
                </p>
                <div className="mt-4 w-full max-w-[220px] rounded-xl border border-dashed border-gray-200 bg-white px-3 py-3 text-start shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-widest text-gray-400">{String(t('landing.workflow.receipt.frame.pos', 'Sales receipt'))}</p>
                  {cart.map((line) => (
                    <div key={line.id} className="flex justify-between gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                      <span className="truncate">{line.emoji} {line.name} ×{line.qty}</span>
                      <span className="tabular-nums font-semibold">{money(line.price * line.qty)}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex justify-between border-t border-dashed border-gray-200 pt-2 text-xs font-bold text-gray-900 dark:border-white/10 dark:text-white">
                    <span>{String(t('landing.workflow.receipt.demo.pos.totalLine', 'Total'))}</span>
                    <span className="tabular-nums">{money(total)}</span>
                  </div>
                </div>
                <button type="button" onClick={clearCart} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-black">
                  <RotateCcw size={12} /> {String(t('landing.workflow.receipt.demo.pos.newSale', 'New sale'))}
                </button>
              </motion.div>
            ) : phase === 'paying' ? (
              <motion.div key="paying" initial={{ opacity: 0, x: isRtl ? -16 : 16 }} animate={{ opacity: 1, x: 0 }} className="py-2">
                <p className="mb-3 text-center text-sm font-bold text-gray-900 dark:text-white">{money(total)}</p>
                <p className="mb-4 text-center text-xs text-gray-500">{String(t('landing.workflow.receipt.demo.pos.choosePay', 'Choose how the customer pays'))}</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['card', 'cash'] as const).map((m) => (
                    <button key={m} type="button" onClick={() => { setPayMethod(m); setPhase('done'); }} className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-mintcom-green/50 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mintcom-green/15 text-mintcom-green">
                        {m === 'card' ? <CreditCard size={20} /> : <span className="text-lg font-black">$</span>}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {String(t(`landing.workflow.receipt.demo.sales.${m}`, m === 'card' ? 'Card' : 'Cash'))}
                      </span>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setPhase('selling')} className="mt-3 w-full py-2 text-xs font-semibold text-gray-400 hover:text-gray-600">
                  {String(t('common.back', 'Back'))}
                </button>
              </motion.div>
            ) : (
              <motion.div key="selling" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="mb-2.5 text-center text-[11px] font-semibold text-gray-400">{String(t('landing.workflow.receipt.demo.pos.tap', 'Tap an item to add'))}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {products.map((p) => (
                    <motion.button key={p.id} type="button" whileTap={{ scale: 0.92 }} onClick={() => addProduct(p)} className={`relative flex flex-col items-center gap-1 rounded-xl border bg-gradient-to-br p-2.5 transition-shadow hover:shadow-md sm:p-3 ${p.color} dark:from-white/[0.06] dark:to-white/[0.02]`}>
                      <AnimatePresence>
                        {lastAdded === p.id && (
                          <motion.span initial={{ opacity: 0, y: 6, scale: 0.6 }} animate={{ opacity: 1, y: -8, scale: 1 }} exit={{ opacity: 0, y: -18 }} className="pointer-events-none absolute -top-1 end-1 rounded-full bg-mintcom-green px-1.5 py-0.5 text-[9px] font-black text-black">+1</motion.span>
                        )}
                      </AnimatePresence>
                      <span className="text-2xl leading-none sm:text-[26px]">{p.emoji}</span>
                      <span className="w-full truncate text-center text-[11px] font-bold text-gray-800 dark:text-gray-100">{p.name}</span>
                      <span className="tabular-nums text-[10px] font-semibold text-gray-500">{money(p.price)}</span>
                    </motion.button>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-gray-100 bg-white/80 p-3 dark:border-white/8 dark:bg-white/[0.03]">
                  {cart.length === 0 ? (
                    <p className="py-3 text-center text-xs text-gray-400">{String(t('landing.workflow.receipt.demo.pos.emptyCart', 'Cart is empty — tap a product above'))}</p>
                  ) : (
                    <div className="mb-2 max-h-[88px] space-y-1 overflow-y-auto">
                      {cart.map((line) => (
                        <div key={line.id} className="flex items-center justify-between gap-2 text-xs">
                          <span className="truncate font-medium text-gray-700 dark:text-gray-200">{line.emoji} {line.name} <span className="text-gray-400">×{line.qty}</span></span>
                          <span className="tabular-nums font-bold text-gray-900 dark:text-white">{money(line.price * line.qty)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-0.5 border-t border-gray-100 pt-2 text-[11px] dark:border-white/8">
                    <div className="flex justify-between text-gray-500"><span>{String(t('landing.workflow.receipt.demo.pos.subtotal', 'Subtotal'))}</span><span className="tabular-nums">{money(subtotal)}</span></div>
                    <div className="flex justify-between text-gray-500"><span>{String(t('landing.workflow.receipt.demo.pos.taxLine', 'Tax 8%'))}</span><span className="tabular-nums">{money(tax)}</span></div>
                    <motion.div key={pulseTotal} initial={{ scale: 1.04 }} animate={{ scale: 1 }} className="flex justify-between pt-0.5 text-sm font-bold text-gray-900 dark:text-white">
                      <span>{String(t('landing.workflow.receipt.demo.pos.totalLine', 'Total'))}</span>
                      <span className="tabular-nums text-mintcom-green">{money(total)}</span>
                    </motion.div>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    {cart.length > 0 && (
                      <button type="button" onClick={clearCart} className="rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-500 dark:border-white/10">{String(t('common.clear', 'Clear'))}</button>
                    )}
                    <button type="button" disabled={cart.length === 0} onClick={() => cart.length && setPhase('paying')} className="flex-1 rounded-xl bg-mintcom-green py-2.5 text-xs font-bold text-black shadow-[0_4px_16px_-4px_rgba(125,198,162,0.55)] disabled:opacity-40">
                      {cart.length === 0 ? String(t('landing.workflow.receipt.demo.pos.charge', 'Charge')) : `${String(t('landing.workflow.receipt.demo.pos.charge', 'Charge'))} ${money(total)}`}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ─── Sales Control ─────────────────────────────────────────────────────── */
export const InteractiveSalesControlDemo = ({ t }: DemoProps) => {
  const methods = useMemo(
    () => [
      { id: 'card', label: String(t('landing.workflow.receipt.demo.sales.card', 'Card')), emoji: '💳' },
      { id: 'cash', label: String(t('landing.workflow.receipt.demo.sales.cash', 'Cash')), emoji: '💵' },
      { id: 'others', label: String(t('landing.workflow.receipt.demo.sales.others', 'Others')), emoji: '🔗' },
    ],
    [t],
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ card: true, cash: true, others: false });
  const [taxRate, setTaxRate] = useState(8);
  const sample = 42.5;
  const tax = sample * (taxRate / 100);
  const total = sample + tax;
  const activeCount = Object.values(enabled).filter(Boolean).length;

  return shell(
    <>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{String(t('landing.workflow.receipt.demo.sales.methods', 'Payment methods'))}</p>
        <span className="rounded-full bg-mintcom-green/10 px-2 py-0.5 text-[10px] font-bold text-mintcom-green">{activeCount} {String(t('landing.workflow.receipt.demo.sales.active', 'active'))}</span>
      </div>
      <div className="space-y-2">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setEnabled((e) => ({ ...e, [m.id]: !e[m.id] }))}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 transition-all ${
              enabled[m.id]
                ? 'border-mintcom-green/40 bg-mintcom-green/10 shadow-sm'
                : 'border-gray-100 bg-white dark:border-white/8 dark:bg-white/[0.03]'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <span>{m.emoji}</span> {m.label}
            </span>
            {enabled[m.id] ? <ToggleRight className="text-mintcom-green" size={22} /> : <ToggleLeft className="text-gray-300" size={22} />}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-gray-100 bg-white p-3 dark:border-white/8 dark:bg-white/[0.03]">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-200">{String(t('landing.workflow.receipt.demo.sales.tax', 'Tax'))}</span>
          <span className="tabular-nums font-black text-mintcom-green">{taxRate}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={25}
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
          className="w-full accent-mintcom-green"
        />
        <div className="mt-3 space-y-1 border-t border-gray-100 pt-2 text-[11px] dark:border-white/8">
          <div className="flex justify-between text-gray-500"><span>{String(t('landing.workflow.receipt.demo.sales.subtotal', 'Subtotal'))}</span><span className="tabular-nums">{money(sample)}</span></div>
          <div className="flex justify-between text-gray-500"><span>{String(t('landing.workflow.receipt.demo.sales.tax', 'Tax'))} ({taxRate}%)</span><span className="tabular-nums">{money(tax)}</span></div>
          <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white"><span>{String(t('landing.workflow.receipt.demo.sales.total', 'Charged'))}</span><span className="tabular-nums text-mintcom-green">{money(total)}</span></div>
        </div>
      </div>
    </>,
    String(t('landing.workflow.receipt.frame.salesCard', 'Mintcom Pay')),
  );
};

/* ─── Staff Management ──────────────────────────────────────────────────── */
export const InteractiveStaffDemo = ({ t }: DemoProps) => {
  const roles = useMemo(
    () => [
      {
        id: 'barista',
        label: String(t('landing.workflow.receipt.demo.staff.barista', 'Barista')),
        emoji: '👩‍🍳',
        perms: [
          String(t('landing.workflow.receipt.demo.staff.permPos', 'POS sales')),
          String(t('landing.workflow.receipt.demo.staff.permOrders', 'Orders')),
        ],
      },
      {
        id: 'cashier',
        label: String(t('landing.workflow.receipt.demo.staff.cashier', 'Cashier')),
        emoji: '👨‍💼',
        perms: [
          String(t('landing.workflow.receipt.demo.staff.permPos', 'POS sales')),
          String(t('landing.workflow.receipt.demo.staff.permRefunds', 'Refunds')),
        ],
      },
      {
        id: 'manager',
        label: String(t('landing.workflow.receipt.demo.staff.manager', 'Manager')),
        emoji: '👩‍💻',
        perms: [
          String(t('landing.workflow.receipt.demo.staff.permReports', 'Reports')),
          String(t('landing.workflow.receipt.demo.staff.permStaff', 'Manage staff')),
          String(t('landing.workflow.receipt.demo.staff.permSettings', 'Settings')),
        ],
      },
    ],
    [t],
  );

  const [members, setMembers] = useState(() => [
    { id: 'sara', name: 'Sara', roleId: 'barista' },
    { id: 'omar', name: 'Omar', roleId: 'cashier' },
    { id: 'lina', name: 'Lina', roleId: 'manager' },
  ]);
  const [selectedId, setSelectedId] = useState('sara');
  const [nextName, setNextName] = useState(0);
  const extraNames = ['Noor', 'Adam', 'Maya', 'Yusuf'];

  const selected = members.find((m) => m.id === selectedId) ?? members[0];
  const selectedRole = roles.find((r) => r.id === selected.roleId) ?? roles[0];

  const assignRole = (roleId: string) => {
    setMembers((list) => list.map((m) => (m.id === selectedId ? { ...m, roleId } : m)));
  };

  const addMember = () => {
    if (members.length >= 5) return;
    const name = extraNames[nextName % extraNames.length];
    const id = `new-${Date.now()}`;
    setMembers((list) => [...list, { id, name, roleId: 'barista' }]);
    setSelectedId(id);
    setNextName((n) => n + 1);
  };

  return shell(
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {String(t('landing.workflow.receipt.demo.staff.team', 'Team'))}
        </p>
        <button
          type="button"
          onClick={addMember}
          disabled={members.length >= 5}
          className="rounded-full bg-mintcom-green px-2.5 py-1 text-[10px] font-bold text-black shadow-sm transition-opacity disabled:opacity-40"
        >
          + {String(t('landing.workflow.receipt.demo.staff.add', 'Add staff'))}
        </button>
      </div>

      <div className="space-y-1.5">
        {members.map((person) => {
          const role = roles.find((r) => r.id === person.roleId) ?? roles[0];
          const isSelected = person.id === selectedId;
          return (
            <motion.button
              key={person.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedId(person.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-all ${
                isSelected
                  ? 'border-mintcom-green/50 bg-mintcom-green/10 shadow-sm'
                  : 'border-gray-100 bg-white dark:border-white/8 dark:bg-white/[0.03]'
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm dark:bg-white/10">
                {role.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{person.name}</p>
                <p className="text-[11px] text-gray-500">
                  {role.label} · {String(t('landing.workflow.receipt.frame.role', 'Role'))}
                </p>
              </div>
              {isSelected && (
                <span className="rounded-full bg-mintcom-green px-2 py-0.5 text-[10px] font-bold text-black">
                  {String(t('landing.workflow.receipt.demo.staff.editing', 'Editing'))}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-white/8 dark:bg-white/[0.03]">
        <p className="mb-2 text-[11px] font-bold text-gray-700 dark:text-gray-200">
          {String(t('landing.workflow.receipt.demo.staff.assignRole', 'Assign role for'))}{' '}
          <span className="text-mintcom-green">{selected.name}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {roles.map((role) => {
            const active = selected.roleId === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => assignRole(role.id)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                  active
                    ? 'bg-mintcom-green text-black shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300'
                }`}
              >
                {role.emoji} {role.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1">
          {selectedRole.perms.map((p) => (
            <span
              key={p}
              className="rounded-md border border-mintcom-green/20 bg-mintcom-green/8 px-2 py-0.5 text-[10px] font-semibold text-mintcom-green"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-gray-400">
        {String(t('landing.workflow.receipt.demo.staff.hint', 'Select a person, then assign a role & permissions'))}
      </p>
    </>,
    String(t('landing.workflow.receipt.brand', 'MINTCOM POS')),
  );
};

/* ─── Advanced Reporting ────────────────────────────────────────────────── */
export const InteractiveReportingDemo = ({ t }: DemoProps) => {
  const days = useMemo(
    () => [
      { id: 'mon', label: 'M', sales: 820 },
      { id: 'tue', label: 'T', sales: 940 },
      { id: 'wed', label: 'W', sales: 1100 },
      { id: 'thu', label: 'T', sales: 980 },
      { id: 'fri', label: 'F', sales: 1420 },
      { id: 'sat', label: 'S', sales: 1680 },
      { id: 'sun', label: 'S', sales: 1200 },
    ],
    [],
  );
  const [active, setActive] = useState('fri');
  const max = Math.max(...days.map((d) => d.sales));
  const selected = days.find((d) => d.id === active)!;
  const total = days.reduce((s, d) => s + d.sales, 0);
  const CHART_H = 140; // px — absolute heights so bars scale correctly

  return shell(
    <>
      <div className="mb-1 flex items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{String(t('landing.workflow.receipt.demo.reporting.weekly', 'Weekly sales'))}</p>
          <motion.p
            key={selected.id}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-barlow text-xl font-black tabular-nums text-gray-900 dark:text-white"
          >
            {money(selected.sales)}
          </motion.p>
        </div>
        <span className="rounded-lg bg-mintcom-green/10 px-2 py-1 text-[10px] font-bold text-mintcom-green">
          {String(t('landing.workflow.receipt.demo.reporting.weekTotal', 'Week'))}: {money(total)}
        </span>
      </div>
      <div className="mt-4 flex items-end gap-1.5 sm:gap-2">
        {days.map((d) => {
          // Absolute px heights (not %) so bar scale is reliable
          const hPx = Math.max(18, Math.round((d.sales / max) * CHART_H));
          const isActive = d.id === active;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setActive(d.id)}
              className="group flex flex-1 flex-col items-center gap-1.5"
            >
              <div className="flex w-full items-end" style={{ height: CHART_H }}>
                <motion.div
                  initial={false}
                  animate={{ height: hPx }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  className={`w-full rounded-t-md transition-colors ${
                    isActive
                      ? 'bg-mintcom-green shadow-[0_0_16px_rgba(125,198,162,0.45)]'
                      : 'bg-mintcom-green/30 group-hover:bg-mintcom-green/50'
                  }`}
                />
              </div>
              <span className={`text-[10px] font-bold leading-none ${isActive ? 'text-mintcom-green' : 'text-gray-400'}`}>
                {d.label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-gray-400">{String(t('landing.workflow.receipt.demo.reporting.hint', 'Tap a day to inspect sales'))}</p>
    </>,
    String(t('landing.workflow.receipt.frame.report', 'Quarterly report')),
  );
};

/* ─── Recipe & Cost Management ──────────────────────────────────────────── */
export const InteractiveRecipeDemo = ({ t }: DemoProps) => {
  const ingredients = useMemo(
    () => [
      { id: 'flour', name: String(t('landing.workflow.receipt.demo.recipe.flour', 'Flour')), cost: 0.4, emoji: '🌾' },
      { id: 'butter', name: String(t('landing.workflow.receipt.demo.recipe.butter', 'Butter')), cost: 0.9, emoji: '🧈' },
      { id: 'sugar', name: String(t('landing.workflow.receipt.demo.recipe.sugar', 'Sugar')), cost: 0.25, emoji: '🧂' },
      { id: 'eggs', name: String(t('landing.workflow.receipt.demo.recipe.eggs', 'Eggs')), cost: 0.55, emoji: '🥚' },
    ],
    [t],
  );
  const [selected, setSelected] = useState<Record<string, boolean>>({ flour: true, butter: true, sugar: true, eggs: false });
  const sellPrice = 5.5;
  const cost = ingredients.reduce((s, i) => s + (selected[i.id] ? i.cost : 0), 0);
  const margin = sellPrice > 0 ? ((sellPrice - cost) / sellPrice) * 100 : 0;

  return shell(
    <>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900 dark:text-white">🥐 Croissant</p>
        <span className="text-[11px] font-semibold text-gray-400">{String(t('landing.workflow.receipt.frame.recipe', 'Recipe card'))}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ingredients.map((i) => {
          const on = selected[i.id];
          return (
            <motion.button
              key={i.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelected((s) => ({ ...s, [i.id]: !s[i.id] }))}
              className={`rounded-xl border p-2.5 text-start transition-all ${on ? 'border-mintcom-green/50 bg-mintcom-green/10' : 'border-gray-100 bg-white opacity-70 dark:border-white/8 dark:bg-white/[0.03]'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{i.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{i.name}</p>
                  <p className="text-[10px] tabular-nums text-gray-500">{money(i.cost)}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-white/8 dark:bg-white/[0.03]">
        <div className="flex justify-between text-[11px] text-gray-500"><span>{String(t('landing.workflow.receipt.demo.recipe.cost', 'Ingredient cost'))}</span><span className="tabular-nums font-semibold">{money(cost)}</span></div>
        <div className="mt-1 flex justify-between text-[11px] text-gray-500"><span>{String(t('landing.workflow.receipt.demo.recipe.price', 'Sell price'))}</span><span className="tabular-nums font-semibold">{money(sellPrice)}</span></div>
        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-white/8">
          <span className="text-xs font-bold text-gray-900 dark:text-white">{String(t('landing.workflow.receipt.demo.recipe.margin', 'Profit margin'))}</span>
          <motion.span key={margin.toFixed(0)} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className={`text-sm font-black tabular-nums ${margin >= 60 ? 'text-mintcom-green' : margin >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
            {margin.toFixed(0)}%
          </motion.span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
          <motion.div animate={{ width: `${Math.min(100, Math.max(0, margin))}%` }} className="h-full rounded-full bg-mintcom-green" />
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-gray-400">{String(t('landing.workflow.receipt.demo.recipe.hint', 'Toggle ingredients to recalculate margin'))}</p>
    </>,
    String(t('landing.workflow.receipt.frame.prep', 'Prep')),
  );
};

/* ─── AI System ─────────────────────────────────────────────────────────── */
export const InteractiveAiDemo = ({ t }: DemoProps) => {
  const prompts = useMemo(
    () => [
      { q: String(t('landing.workflow.receipt.demo.ai.q1', 'What sold best today?')), a: String(t('landing.workflow.receipt.demo.ai.a1', 'Espresso led with 142 cups, up 18% from yesterday.')) },
      { q: String(t('landing.workflow.receipt.demo.ai.q2', 'Suggest a combo deal')), a: String(t('landing.workflow.receipt.demo.ai.a2', 'Try a "Croissant + Latte" bundle at 5.50 USD — projects +12% basket.')) },
      { q: String(t('landing.workflow.receipt.demo.ai.q3', 'Forecast tomorrow')), a: String(t('landing.workflow.receipt.demo.ai.a3', 'Expect 320–360 orders, peak 9–11 AM. Schedule 2 baristas.')) },
    ],
    [t],
  );
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState('');
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    setThinking(true);
    setTyped('');
    const answer = prompts[active]?.a ?? '';
    let i = 0;
    let typeId: number | undefined;
    const thinkTimer = window.setTimeout(() => {
      setThinking(false);
      typeId = window.setInterval(() => {
        i += 1;
        setTyped(answer.slice(0, i));
        if (i >= answer.length && typeId !== undefined) window.clearInterval(typeId);
      }, 14);
    }, 420);
    return () => {
      window.clearTimeout(thinkTimer);
      if (typeId !== undefined) window.clearInterval(typeId);
    };
  }, [active, prompts]);

  return shell(
    <>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {prompts.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
              i === active ? 'bg-mintcom-green text-black shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300'
            }`}
          >
            {p.q}
          </button>
        ))}
      </div>
      <div className="min-h-[110px] rounded-xl border border-mintcom-green/20 bg-gradient-to-br from-mintcom-green/10 to-transparent p-3.5 dark:from-mintcom-green/15">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-mintcom-green">
          <Sparkles size={12} />
          Mintcom AI
        </div>
        {thinking ? (
          <div className="flex items-center gap-1.5 py-3">
            {[0, 1, 2].map((d) => (
              <motion.span key={d} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }} className="h-1.5 w-1.5 rounded-full bg-mintcom-green" />
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-100">
            {typed}
            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} className="ms-0.5 inline-block h-3.5 w-0.5 bg-mintcom-green align-middle" />
          </p>
        )}
      </div>
      <p className="mt-2 text-center text-[10px] text-gray-400">{String(t('landing.workflow.receipt.frame.aiFooter', 'Built into every Mintcom dashboard'))}</p>
    </>,
    String(t('landing.workflow.receipt.brand', 'MINTCOM POS')),
  );
};

/* ─── Multi-Branch ──────────────────────────────────────────────────────── */
/** Multi-branch as in Mintcom: brands own locations; unified brand totals. */
export const InteractiveBranchDemo = ({ t }: DemoProps) => {
  type Loc = { id: string; name: string; sales: number; staff: number; emoji: string };

  const brandCatalog = useMemo(
    () => [
      {
        id: 'cafe',
        name: String(t('landing.cloudControl.scope.preview.brandA', 'Cafe Delight')),
        emoji: '☕',
        locations: [
          { id: 'dt', name: String(t('landing.cloudControl.scope.preview.locDowntown', 'Downtown')), sales: 4280, staff: 8, emoji: '🏙️' },
          { id: 'mall', name: String(t('landing.cloudControl.scope.preview.locMall', 'Mall')), sales: 6120, staff: 12, emoji: '🛍️' },
          { id: 'west', name: String(t('landing.cloudControl.scope.preview.locWest', 'West Side')), sales: 3180, staff: 6, emoji: '📍' },
        ] as Loc[],
      },
      {
        id: 'urban',
        name: String(t('landing.cloudControl.scope.preview.brandB', 'Urban Eats')),
        emoji: '🍔',
        locations: [
          { id: 'airport', name: String(t('landing.cloudControl.scope.preview.locAirport', 'Airport')), sales: 8940, staff: 15, emoji: '✈️' },
          { id: 'mall2', name: String(t('landing.cloudControl.scope.preview.locMall', 'Mall')), sales: 5400, staff: 10, emoji: '🛍️' },
        ] as Loc[],
      },
      {
        id: 'pizza',
        name: String(t('landing.cloudControl.scope.preview.brandC', 'Pizza Yard')),
        emoji: '🍕',
        locations: [
          { id: 'dt2', name: String(t('landing.cloudControl.scope.preview.locDowntown', 'Downtown')), sales: 7100, staff: 11, emoji: '🏙️' },
          { id: 'west2', name: String(t('landing.cloudControl.scope.preview.locWest', 'West Side')), sales: 2650, staff: 5, emoji: '📍' },
        ] as Loc[],
      },
    ],
    [t],
  );

  const [brandId, setBrandId] = useState(brandCatalog[0].id);
  // linked location ids per brand (operational control — include/exclude from brand rollup)
  const [linked, setLinked] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(brandCatalog.map((b) => [b.id, b.locations.map((l) => l.id)])),
  );
  const [focusLoc, setFocusLoc] = useState<string | null>(null);

  const brand = brandCatalog.find((b) => b.id === brandId) ?? brandCatalog[0];
  const linkedIds = linked[brandId] ?? [];
  const activeLocs = brand.locations.filter((l) => linkedIds.includes(l.id));
  const brandSales = activeLocs.reduce((s, l) => s + l.sales, 0);
  const brandStaff = activeLocs.reduce((s, l) => s + l.staff, 0);
  const focused = brand.locations.find((l) => l.id === focusLoc) ?? null;

  const toggleLink = (locId: string) => {
    setLinked((prev) => {
      const cur = prev[brandId] ?? [];
      const next = cur.includes(locId) ? cur.filter((id) => id !== locId) : [...cur, locId];
      // keep at least one location linked so brand always has a rollup
      if (next.length === 0) return prev;
      return { ...prev, [brandId]: next };
    });
  };

  const linkAll = () => {
    setLinked((prev) => ({ ...prev, [brandId]: brand.locations.map((l) => l.id) }));
  };

  return shell(
    <>
      {/* Brand switcher — like picking a brand in the owner/brand portal */}
      <div className="mb-3">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {String(t('landing.cloudControl.scope.brand', 'Brand scope'))}
        </p>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {brandCatalog.map((b) => {
            const on = b.id === brandId;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setBrandId(b.id);
                  setFocusLoc(null);
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                  on
                    ? 'bg-mintcom-green text-black shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300'
                }`}
              >
                <span>{b.emoji}</span>
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unified brand dashboard totals */}
      <AnimatePresence mode="wait">
        <motion.div
          key={brandId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-3 rounded-xl border border-mintcom-green/25 bg-gradient-to-br from-mintcom-green/12 to-transparent p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-mintcom-green">
                {brand.emoji} {brand.name}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                {String(t('landing.workflow.receipt.demo.branch.unified', 'Unified brand total'))}
              </p>
            </div>
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-mintcom-green dark:bg-black/20">
              {activeLocs.length}/{brand.locations.length}{' '}
              {String(t('brand.dashboard.locations', 'Locations'))}
            </span>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {String(t('landing.workflow.receipt.demo.branch.today', 'Today'))}
              </p>
              <p className="text-lg font-black tabular-nums text-mintcom-green">{money(brandSales)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {String(t('landing.workflow.receipt.demo.branch.staff', 'Staff'))}
              </p>
              <p className="text-lg font-black tabular-nums text-gray-900 dark:text-white">{brandStaff}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Locations under this brand */}
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {String(t('landing.workflow.receipt.demo.branch.underBrand', 'Locations under brand'))}
        </p>
        {linkedIds.length < brand.locations.length && (
          <button type="button" onClick={linkAll} className="text-[10px] font-bold text-mintcom-green hover:underline">
            {String(t('landing.workflow.receipt.demo.branch.linkAll', 'Link all'))}
          </button>
        )}
      </div>
      <div className="max-h-[148px] space-y-1.5 overflow-y-auto">
        {brand.locations.map((loc) => {
          const isLinked = linkedIds.includes(loc.id);
          const isFocus = focusLoc === loc.id;
          return (
            <div
              key={loc.id}
              className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 transition-all ${
                isLinked
                  ? isFocus
                    ? 'border-mintcom-green bg-mintcom-green/10'
                    : 'border-gray-100 bg-white dark:border-white/8 dark:bg-white/[0.03]'
                  : 'border-dashed border-gray-200 bg-gray-50/80 opacity-70 dark:border-white/10 dark:bg-white/[0.02]'
              }`}
            >
              <button
                type="button"
                onClick={() => setFocusLoc(loc.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-start"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-base dark:bg-white/10">
                  {loc.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{loc.name}</p>
                  <p className="text-[10px] tabular-nums text-gray-500">
                    {money(loc.sales)} · {loc.staff} {String(t('landing.workflow.receipt.demo.branch.staff', 'Staff')).toLowerCase()}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => toggleLink(loc.id)}
                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold transition-colors ${
                  isLinked
                    ? 'bg-mintcom-green text-black'
                    : 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                }`}
              >
                {isLinked
                  ? String(t('landing.workflow.receipt.demo.branch.linked', 'Linked'))
                  : String(t('landing.workflow.receipt.demo.branch.link', 'Link'))}
              </button>
            </div>
          );
        })}
      </div>

      {focused && linkedIds.includes(focused.id) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 rounded-lg border border-mintcom-green/20 bg-mintcom-green/5 px-2.5 py-2 text-[11px] text-gray-600 dark:text-gray-300"
        >
          <span className="font-bold text-gray-900 dark:text-white">{focused.name}</span>
          {' · '}
          {String(t('landing.workflow.receipt.demo.branch.locShare', 'Share of brand'))}:{' '}
          <span className="font-bold text-mintcom-green">
            {brandSales > 0 ? Math.round((focused.sales / brandSales) * 100) : 0}%
          </span>
        </motion.div>
      )}

      <p className="mt-3 text-center text-[11px] text-gray-400">
        {String(t('landing.workflow.receipt.demo.branch.hint', 'Switch brand, link locations — brand totals update live'))}
      </p>
    </>,
    String(t('landing.cloudControl.scope.preview.brand', 'Brand')),
  );
};

/* ─── Simple UI ─────────────────────────────────────────────────────────── */
export const InteractiveUiDemo = ({ t }: DemoProps) => {
  const [density, setDensity] = useState<'compact' | 'cozy'>('cozy');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const dense = density === 'compact';
  const dark = theme === 'dark';

  return shell(
    <>
      <div className="mb-3 flex flex-wrap gap-2">
        {(['cozy', 'compact'] as const).map((d) => (
          <button key={d} type="button" onClick={() => setDensity(d)} className={`rounded-full px-3 py-1 text-[11px] font-bold ${density === d ? 'bg-mintcom-green text-black' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'}`}>
            {String(t(`landing.workflow.receipt.demo.ui.${d}`, d === 'cozy' ? 'Cozy' : 'Compact'))}
          </button>
        ))}
        {(['light', 'dark'] as const).map((th) => (
          <button key={th} type="button" onClick={() => setTheme(th)} className={`rounded-full px-3 py-1 text-[11px] font-bold ${theme === th ? 'bg-mintcom-green text-black' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'}`}>
            {String(t(`landing.workflow.receipt.demo.ui.${th}`, th === 'light' ? 'Light' : 'Dark'))}
          </button>
        ))}
      </div>
      <motion.div
        layout
        className={`overflow-hidden rounded-xl border transition-colors ${dark ? 'border-white/10 bg-[#0e0e0e] text-white' : 'border-gray-200 bg-white text-gray-900'}`}
      >
        <div className={`border-b ${dark ? 'border-white/10' : 'border-gray-100'} ${dense ? 'px-3 py-2' : 'px-4 py-3'}`}>
          <p className={`font-bold ${dense ? 'text-xs' : 'text-sm'}`}>Dashboard</p>
        </div>
        <div className={`grid grid-cols-3 ${dense ? 'gap-1.5 p-2' : 'gap-2.5 p-3'}`}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`rounded-lg ${dark ? 'bg-white/5' : 'bg-gray-50'} ${dense ? 'p-2' : 'p-3'}`}>
              <div className={`rounded bg-mintcom-green/30 ${dense ? 'mb-1 h-1.5 w-6' : 'mb-2 h-2 w-8'}`} />
              <div className={`font-black tabular-nums ${dense ? 'text-xs' : 'text-base'}`}>{i * 12}k</div>
            </div>
          ))}
        </div>
        <div className={`${dense ? 'space-y-1 p-2' : 'space-y-2 p-3'}`}>
          {[1, 2].map((i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg ${dark ? 'bg-white/5' : 'bg-gray-50'} ${dense ? 'p-1.5' : 'p-2.5'}`}>
              <div className={`rounded-md bg-mintcom-green/40 ${dense ? 'h-5 w-5' : 'h-7 w-7'}`} />
              <div className="flex-1">
                <div className={`rounded bg-current opacity-20 ${dense ? 'mb-1 h-1.5 w-16' : 'mb-1.5 h-2 w-24'}`} />
                <div className={`rounded bg-current opacity-10 ${dense ? 'h-1 w-10' : 'h-1.5 w-16'}`} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      <p className="mt-2 text-center text-[11px] text-gray-400">{String(t('landing.workflow.receipt.demo.ui.hint', 'Switch density and theme — the preview updates live'))}</p>
    </>,
    String(t('landing.workflow.receipt.brand', 'MINTCOM POS')),
  );
};

/* ─── Fast Onboarding ───────────────────────────────────────────────────── */
export const InteractiveOnboardDemo = ({ t }: DemoProps) => {
  const steps = useMemo(
    () => [
      String(t('landing.workflow.receipt.demo.onboard.s1', 'Add staff member')),
      String(t('landing.workflow.receipt.demo.onboard.s2', 'Assign a role')),
      String(t('landing.workflow.receipt.demo.onboard.s3', 'Run first sale')),
      String(t('landing.workflow.receipt.demo.onboard.s4', 'Ready to go')),
    ],
    [t],
  );
  const [step, setStep] = useState(0);
  const done = step >= steps.length;

  return shell(
    <>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
        <motion.div
          animate={{ width: `${(Math.min(step, steps.length) / steps.length) * 100}%` }}
          className="h-full rounded-full bg-mintcom-green"
        />
      </div>
      <div className="space-y-2">
        {steps.map((label, i) => {
          const completed = i < step;
          const current = i === step;
          return (
            <motion.div
              key={label}
              animate={{ scale: current ? 1.02 : 1 }}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                completed
                  ? 'border-mintcom-green/40 bg-mintcom-green/10'
                  : current
                    ? 'border-mintcom-green bg-white shadow-sm dark:bg-white/[0.04]'
                    : 'border-gray-100 bg-white/60 opacity-60 dark:border-white/8 dark:bg-white/[0.02]'
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${completed ? 'bg-mintcom-green text-black' : current ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-400 dark:bg-white/10'}`}>
                {completed ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`text-sm font-bold ${completed || current ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{label}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        {done ? (
          <button type="button" onClick={() => setStep(0)} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gray-900 py-2.5 text-xs font-bold text-white dark:bg-white dark:text-black">
            <RotateCcw size={12} /> {String(t('landing.workflow.receipt.demo.onboard.restart', 'Restart tour'))}
          </button>
        ) : (
          <button type="button" onClick={() => setStep((s) => s + 1)} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-mintcom-green py-2.5 text-xs font-bold text-black">
            <Zap size={13} /> {step === steps.length - 1 ? String(t('landing.workflow.receipt.frame.boarding', 'Welcome aboard')) : String(t('common.next', 'Next'))}
          </button>
        )}
      </div>
    </>,
    String(t('landing.workflow.receipt.frame.boarding', 'Welcome aboard')),
  );
};

/* ─── Secure & Reliable ─────────────────────────────────────────────────── */
export const InteractiveSecureDemo = ({ t }: DemoProps) => {
  const checks = useMemo(
    () => [
      { id: 'c1', label: String(t('landing.workflow.receipt.demo.secure.c1', 'Encrypted backups')) },
      { id: 'c2', label: String(t('landing.workflow.receipt.demo.secure.c2', '2-factor auth')) },
      { id: 'c3', label: String(t('landing.workflow.receipt.demo.secure.c3', 'Role-based access')) },
      { id: 'c4', label: String(t('landing.workflow.receipt.demo.secure.c4', '99.9% uptime')) },
    ],
    [t],
  );
  const [on, setOn] = useState<Record<string, boolean>>({ c1: true, c2: false, c3: true, c4: true });
  const score = Math.round((Object.values(on).filter(Boolean).length / checks.length) * 100);

  return shell(
    <>
      <div className="mb-3 flex items-center justify-between rounded-xl border border-mintcom-green/20 bg-mintcom-green/8 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-mintcom-green" />
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {score >= 75 ? String(t('landing.workflow.receipt.demo.secure.protected', 'Protected')) : String(t('landing.workflow.receipt.demo.secure.partial', 'Needs attention'))}
          </span>
        </div>
        <span className="text-sm font-black tabular-nums text-mintcom-green">{score}%</span>
      </div>
      <div className="space-y-2">
        {checks.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setOn((s) => ({ ...s, [c.id]: !s[c.id] }))}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-start transition-all ${
              on[c.id] ? 'border-mintcom-green/40 bg-mintcom-green/10' : 'border-gray-100 bg-white dark:border-white/8 dark:bg-white/[0.03]'
            }`}
          >
            <span className="text-sm font-bold text-gray-900 dark:text-white">{c.label}</span>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${on[c.id] ? 'bg-mintcom-green text-black' : 'bg-gray-100 text-gray-300 dark:bg-white/10'}`}>
              {on[c.id] ? <Check size={12} strokeWidth={3} /> : null}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-mintcom-green">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-mintcom-green" />
        </span>
        {String(t('landing.workflow.receipt.demo.secure.live', 'Live'))}
      </div>
    </>,
    String(t('landing.workflow.receipt.frame.dossier', 'Security dossier')),
  );
};

/* ─── Loyalty ───────────────────────────────────────────────────────────── */
export const InteractiveLoyaltyDemo = ({ t }: DemoProps) => {
  const tiers = useMemo(
    () => [
      { id: 'bronze', label: String(t('landing.workflow.receipt.demo.loyalty.bronze', 'Bronze')), need: 0, color: 'from-amber-700/30 to-amber-600/10 border-amber-700/30' },
      { id: 'silver', label: String(t('landing.workflow.receipt.demo.loyalty.silver', 'Silver')), need: 200, color: 'from-slate-400/30 to-slate-300/10 border-slate-400/40' },
      { id: 'gold', label: String(t('landing.workflow.receipt.demo.loyalty.gold', 'Gold')), need: 500, color: 'from-yellow-400/40 to-amber-300/10 border-yellow-400/50' },
    ],
    [t],
  );
  const [points, setPoints] = useState(120);
  const [flash, setFlash] = useState<string | null>(null);
  const tier = [...tiers].reverse().find((x) => points >= x.need) ?? tiers[0];
  const next = tiers.find((x) => x.need > points);

  const earn = () => {
    setPoints((p) => p + 100);
    setFlash('+100');
    window.setTimeout(() => setFlash(null), 500);
  };
  const redeem = () => {
    if (points < 100) return;
    setPoints((p) => p - 100);
    setFlash('-100');
    window.setTimeout(() => setFlash(null), 500);
  };

  return shell(
    <>
      <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 ${tier.color}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{String(t('landing.workflow.receipt.demo.loyalty.tier', 'Tier'))}</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{tier.label}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">{String(t('landing.workflow.receipt.frame.loyalty', 'Member since 2024'))}</p>
          </div>
          <div className="relative text-end">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">pts</p>
            <p className="text-2xl font-black tabular-nums text-mintcom-green">{points}</p>
            <AnimatePresence>
              {flash && (
                <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0 }} className="absolute -top-1 end-0 text-xs font-black text-mintcom-green">
                  {flash}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        {next && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] text-gray-500">
              <span>→ {next.label}</span>
              <span>{next.need - points} pts</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <motion.div animate={{ width: `${Math.min(100, (points / next.need) * 100)}%` }} className="h-full rounded-full bg-mintcom-green" />
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={earn} className="rounded-xl bg-mintcom-green py-2.5 text-xs font-bold text-black">
          {String(t('landing.workflow.receipt.demo.loyalty.earn', 'Earn 100'))}
        </button>
        <button type="button" onClick={redeem} disabled={points < 100} className="rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-700 disabled:opacity-40 dark:border-white/10 dark:text-gray-200">
          {String(t('landing.workflow.receipt.demo.loyalty.redeem', 'Redeem'))}
        </button>
      </div>
    </>,
    String(t('landing.workflow.receipt.brand', 'MINTCOM POS')),
  );
};

/* ─── Mobile App & Notifications ────────────────────────────────────────── */
export const InteractiveMobileDemo = ({ t }: DemoProps) => {
  const pool = useMemo(
    () => [
      { id: 'n1', text: String(t('landing.workflow.receipt.demo.mobile.n1', 'New order #4218 — 24.50 USD')), icon: '🧾' },
      { id: 'n2', text: String(t('landing.workflow.receipt.demo.mobile.n2', 'Daily target reached 🎉')), icon: '🎯' },
      { id: 'n3', text: String(t('landing.workflow.receipt.demo.mobile.n3', 'Low stock: Espresso beans')), icon: '📦' },
      { id: 'n4', text: String(t('landing.workflow.receipt.demo.mobile.n4', 'Sara clocked in')), icon: '👤' },
    ],
    [t],
  );
  const [notifs, setNotifs] = useState(pool.slice(0, 2));
  const [cursor, setCursor] = useState(2);

  const pushNotif = () => {
    const next = pool[cursor % pool.length];
    setNotifs((n) => [{ ...next, id: `${next.id}-${Date.now()}` }, ...n].slice(0, 4));
    setCursor((c) => c + 1);
  };

  return (
    <div className="mt-5 select-none" onPointerDown={(e) => e.stopPropagation()}>
      <div className="mx-auto w-full max-w-[240px]">
        <div className="overflow-hidden rounded-[1.75rem] border-[3px] border-gray-900 bg-gray-900 p-1.5 shadow-xl dark:border-gray-700">
          <div className="overflow-hidden rounded-[1.35rem] bg-white dark:bg-[#0c0c0c]">
            <div className="flex items-center justify-between bg-mintcom-green/15 px-3 py-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-mintcom-green">Mintcom</span>
              <Bell size={12} className="text-mintcom-green" />
            </div>
            <div className="min-h-[180px] space-y-1.5 p-2.5">
              <AnimatePresence initial={false}>
                {notifs.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: -16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-2.5 py-2 dark:border-white/8 dark:bg-white/[0.04]"
                  >
                    <span className="text-sm">{n.icon}</span>
                    <p className="text-[11px] font-semibold leading-snug text-gray-800 dark:text-gray-100">{n.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="border-t border-gray-100 p-2 dark:border-white/8">
              <button type="button" onClick={pushNotif} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-mintcom-green py-2 text-[11px] font-bold text-black">
                <Smartphone size={12} />
                {String(t('landing.workflow.receipt.demo.mobile.push', 'Push notification'))}
              </button>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-gray-400">{String(t('landing.workflow.receipt.demo.mobile.hint', 'Tap to receive a live alert'))}</p>
      </div>
    </div>
  );
};

/* ─── Router ────────────────────────────────────────────────────────────── */
export const FeatureInteractiveDemo = ({
  featureId,
  t,
  isRtl,
}: {
  featureId?: string;
  t: DemoProps['t'];
  isRtl: boolean;
}) => {
  if (!featureId) return null;
  const props = { t, isRtl };
  switch (featureId) {
    case 'pointOfSale':
      return <InteractivePosDemo {...props} />;
    case 'salesControl':
      return <InteractiveSalesControlDemo {...props} />;
    case 'staffManagement':
      return <InteractiveStaffDemo {...props} />;
    case 'advancedReporting':
      return <InteractiveReportingDemo {...props} />;
    case 'production':
      return <InteractiveRecipeDemo {...props} />;
    case 'aiSystem':
      return <InteractiveAiDemo {...props} />;
    case 'multiBranch':
      return <InteractiveBranchDemo {...props} />;
    case 'simpleUI':
      return <InteractiveUiDemo {...props} />;
    case 'fastOnboarding':
      return <InteractiveOnboardDemo {...props} />;
    case 'secure':
      return <InteractiveSecureDemo {...props} />;
    case 'loyalty':
      return <InteractiveLoyaltyDemo {...props} />;
    case 'mobileApp':
      return <InteractiveMobileDemo {...props} />;
    default:
      return null;
  }
};

export const hasInteractiveDemo = (featureId?: string) =>
  Boolean(
    featureId &&
      [
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
      ].includes(featureId),
  );
