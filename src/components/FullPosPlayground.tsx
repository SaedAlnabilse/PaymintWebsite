import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  Pause,
  Play,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';

/**
 * Full immersive POS sandbox — no account, no API.
 * Visitors run a complete sale flow: clock-in → sell → customize → pay → receipt.
 * All labels are hardcoded (demo-only) so missing i18n keys never show "Size s".
 */

type PosOption = { id: string; name: string; price: number };
type PosAttribute = { id: string; name: string; multi?: boolean; required?: boolean; options: PosOption[] };
type PosProduct = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  categoryId: string;
  color: string;
  attributes?: PosAttribute[];
};
type CartLine = {
  id: string;
  productId: string;
  name: string;
  basePrice: number;
  unitPrice: number;
  qty: number;
  emoji: string;
  addons: PosOption[];
};
type OrderType = 'dine-in' | 'takeaway' | 'delivery';
type PayMethod = 'cash' | 'card' | 'cliq' | 'talabat';
type Phase = 'welcome' | 'pin' | 'selling' | 'paying' | 'done';
type Staff = { id: string; name: string; role: string; pin: string; emoji: string };

const money = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const STAFF: Staff[] = [
  { id: 'sara', name: 'Sara', role: 'Cashier', pin: '1234', emoji: '👩‍💼' },
  { id: 'omar', name: 'Omar', role: 'Barista', pin: '0000', emoji: '👨‍🍳' },
  { id: 'maya', name: 'Maya', role: 'Manager', pin: '9999', emoji: '👩‍💻' },
];

const CATEGORIES = [
  { id: 'all', name: 'All', emoji: '⊞' },
  { id: 'beverages', name: 'Beverages', emoji: '☕' },
  { id: 'pastries', name: 'Pastries', emoji: '🥐' },
  { id: 'food', name: 'Food', emoji: '🥗' },
  { id: 'desserts', name: 'Desserts', emoji: '🍰' },
];

function buildCatalog(): PosProduct[] {
  const size: PosAttribute = {
    id: 'size',
    name: 'Size',
    required: true,
    options: [
      { id: 's', name: 'S', price: 0 },
      { id: 'm', name: 'M', price: 0.5 },
      { id: 'l', name: 'L', price: 1 },
    ],
  };
  const milk: PosAttribute = {
    id: 'milk',
    name: 'Milk',
    options: [
      { id: 'whole', name: 'Whole', price: 0 },
      { id: 'oat', name: 'Oat', price: 0.75 },
      { id: 'almond', name: 'Almond', price: 0.75 },
    ],
  };
  const extras: PosAttribute = {
    id: 'extras',
    name: 'Extras',
    multi: true,
    options: [
      { id: 'shot', name: 'Extra shot', price: 1 },
      { id: 'syrup', name: 'Vanilla syrup', price: 0.5 },
      { id: 'whip', name: 'Whipped cream', price: 0.5 },
    ],
  };
  const heat: PosAttribute = {
    id: 'heat',
    name: 'Warming',
    options: [
      { id: 'plain', name: 'As is', price: 0 },
      { id: 'warm', name: 'Warmed', price: 0.25 },
    ],
  };
  const dressing: PosAttribute = {
    id: 'dressing',
    name: 'Dressing',
    options: [
      { id: 'ranch', name: 'Ranch', price: 0 },
      { id: 'caesar', name: 'Caesar', price: 0 },
      { id: 'balsamic', name: 'Balsamic', price: 0.5 },
    ],
  };
  const toppings: PosAttribute = {
    id: 'toppings',
    name: 'Add-ons',
    multi: true,
    options: [
      { id: 'cheese', name: 'Extra cheese', price: 1 },
      { id: 'avocado', name: 'Avocado', price: 1.5 },
      { id: 'bacon', name: 'Bacon', price: 1.5 },
    ],
  };

  return [
    { id: 'espresso', name: 'Espresso', price: 3.5, emoji: '☕', categoryId: 'beverages', color: 'from-amber-500/15 to-orange-500/5 border-amber-300/40', attributes: [size, extras] },
    { id: 'latte', name: 'Latte', price: 4.5, emoji: '🥛', categoryId: 'beverages', color: 'from-amber-400/15 to-yellow-500/5 border-amber-200/40', attributes: [size, milk, extras] },
    { id: 'cappuccino', name: 'Cappuccino', price: 4.25, emoji: '☕', categoryId: 'beverages', color: 'from-stone-400/15 to-amber-500/5 border-stone-300/40', attributes: [size, milk, extras] },
    { id: 'coldbrew', name: 'Cold brew', price: 4.75, emoji: '🧊', categoryId: 'beverages', color: 'from-sky-500/15 to-indigo-500/5 border-sky-300/40', attributes: [size, milk] },
    { id: 'soda', name: 'Soda', price: 2.5, emoji: '🥤', categoryId: 'beverages', color: 'from-sky-500/15 to-blue-500/5 border-sky-300/40', attributes: [size] },
    { id: 'tea', name: 'Tea', price: 2.75, emoji: '🍵', categoryId: 'beverages', color: 'from-emerald-500/15 to-green-500/5 border-emerald-300/40', attributes: [size, milk] },
    { id: 'croissant', name: 'Croissant', price: 4, emoji: '🥐', categoryId: 'pastries', color: 'from-yellow-500/15 to-amber-500/5 border-yellow-300/40', attributes: [heat] },
    { id: 'muffin', name: 'Muffin', price: 3.25, emoji: '🧁', categoryId: 'pastries', color: 'from-pink-500/15 to-rose-500/5 border-pink-300/40', attributes: [heat] },
    { id: 'bagel', name: 'Bagel', price: 3.75, emoji: '🥯', categoryId: 'pastries', color: 'from-orange-400/15 to-amber-500/5 border-orange-300/40', attributes: [heat, toppings] },
    { id: 'cookie', name: 'Cookie', price: 2, emoji: '🍪', categoryId: 'pastries', color: 'from-orange-500/15 to-amber-500/5 border-orange-300/40' },
    { id: 'salad', name: 'Salad', price: 6.5, emoji: '🥗', categoryId: 'food', color: 'from-emerald-500/15 to-green-500/5 border-emerald-300/40', attributes: [dressing, toppings] },
    { id: 'sandwich', name: 'Sandwich', price: 7.5, emoji: '🥪', categoryId: 'food', color: 'from-lime-500/15 to-yellow-500/5 border-lime-300/40', attributes: [toppings] },
    { id: 'soup', name: 'Soup', price: 5.5, emoji: '🥣', categoryId: 'food', color: 'from-orange-400/15 to-red-500/5 border-orange-300/40', attributes: [size] },
    { id: 'wrap', name: 'Chicken wrap', price: 8, emoji: '🌯', categoryId: 'food', color: 'from-yellow-500/15 to-lime-500/5 border-yellow-300/40', attributes: [toppings] },
    { id: 'cheesecake', name: 'Cheesecake', price: 5.5, emoji: '🍰', categoryId: 'desserts', color: 'from-pink-400/15 to-rose-500/5 border-pink-300/40' },
    { id: 'brownie', name: 'Brownie', price: 3.5, emoji: '🍫', categoryId: 'desserts', color: 'from-amber-700/15 to-stone-500/5 border-amber-600/30', attributes: [heat] },
  ];
}

const TIPS = [
  'Tap any item — customize size, milk, and extras like a real POS.',
  'Switch Dine-in / Takeaway / Delivery on the order ticket.',
  'Hold an order, apply a discount, then charge cash or card.',
];

export function FullPosPlayground() {
  const products = useMemo(() => buildCatalog(), []);
  const [phase, setPhase] = useState<Phase>('welcome');
  const [staff, setStaff] = useState<Staff | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [held, setHeld] = useState<CartLine[] | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [discountPct, setDiscountPct] = useState(0);
  const [orderNo, setOrderNo] = useState(1042);
  const [payMethod, setPayMethod] = useState<PayMethod | null>(null);
  const [addonItem, setAddonItem] = useState<PosProduct | null>(null);
  const [addonSel, setAddonSel] = useState<Record<string, string[]>>({});
  const [addonQty, setAddonQty] = useState(1);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [tipIdx, setTipIdx] = useState(0);
  const [shiftOrders, setShiftOrders] = useState(0);
  const [shiftRevenue, setShiftRevenue] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (phase !== 'selling') return;
    const id = window.setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 5000);
    return () => window.clearInterval(id);
  }, [phase]);

  const visible = useMemo(
    () => (selectedCategory === 'all' ? products : products.filter((p) => p.categoryId === selectedCategory)),
    [products, selectedCategory],
  );

  const subtotal = cart.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const discount = subtotal * (discountPct / 100);
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = afterDiscount * 0.08;
  const total = afterDiscount + tax;
  const itemCount = cart.reduce((s, l) => s + l.qty, 0);

  const ping = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 1400);
  };

  const openItem = (p: PosProduct) => {
    if (phase !== 'selling') return;
    if (!p.attributes?.length) {
      addPlain(p);
      return;
    }
    const initial: Record<string, string[]> = {};
    p.attributes.forEach((attr) => {
      if (!attr.multi && attr.options[0]) initial[attr.id] = [attr.options[0].id];
      else initial[attr.id] = [];
    });
    setAddonSel(initial);
    setAddonQty(1);
    setAddonItem(p);
  };

  const addPlain = (p: PosProduct) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p.id && l.addons.length === 0);
      if (existing) return prev.map((l) => (l.id === existing.id ? { ...l, qty: l.qty + 1 } : l));
      return [
        ...prev,
        {
          id: `${p.id}-${Date.now()}`,
          productId: p.id,
          name: p.name,
          basePrice: p.price,
          unitPrice: p.price,
          qty: 1,
          emoji: p.emoji,
          addons: [],
        },
      ];
    });
    setLastAdded(p.id);
    window.setTimeout(() => setLastAdded(null), 350);
  };

  const toggleOption = (attr: PosAttribute, opt: PosOption) => {
    setAddonSel((prev) => {
      const cur = prev[attr.id] ?? [];
      if (attr.multi) {
        const has = cur.includes(opt.id);
        return { ...prev, [attr.id]: has ? cur.filter((x) => x !== opt.id) : [...cur, opt.id] };
      }
      return { ...prev, [attr.id]: [opt.id] };
    });
  };

  const addonPreview = useMemo(() => {
    if (!addonItem?.attributes) return { addons: [] as PosOption[], unit: 0 };
    const addons: PosOption[] = [];
    addonItem.attributes.forEach((attr) => {
      (addonSel[attr.id] ?? []).forEach((id) => {
        const o = attr.options.find((x) => x.id === id);
        if (o) addons.push(o);
      });
    });
    return { addons, unit: addonItem.price + addons.reduce((s, a) => s + a.price, 0) };
  }, [addonItem, addonSel]);

  const confirmAddons = () => {
    if (!addonItem) return;
    for (const attr of addonItem.attributes ?? []) {
      if (attr.required && !(addonSel[attr.id]?.length)) return;
    }
    const { addons, unit } = addonPreview;
    const key = addons
      .map((a) => a.id)
      .sort()
      .join(',');
    setCart((prev) => {
      const existing = prev.find(
        (l) =>
          l.productId === addonItem.id &&
          l.addons
            .map((a) => a.id)
            .sort()
            .join(',') === key,
      );
      if (existing) return prev.map((l) => (l.id === existing.id ? { ...l, qty: l.qty + addonQty } : l));
      return [
        ...prev,
        {
          id: `${addonItem.id}-${key || 'plain'}-${Date.now()}`,
          productId: addonItem.id,
          name: addonItem.name,
          basePrice: addonItem.price,
          unitPrice: unit,
          qty: addonQty,
          emoji: addonItem.emoji,
          addons,
        },
      ];
    });
    setLastAdded(addonItem.id);
    setAddonItem(null);
    window.setTimeout(() => setLastAdded(null), 350);
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  };

  const holdOrder = () => {
    if (!cart.length) return;
    setHeld(cart);
    setCart([]);
    setDiscountPct(0);
    ping('Order held');
  };

  const resumeHeld = () => {
    if (!held?.length) return;
    setCart(held);
    setHeld(null);
    ping('Held order restored');
  };

  const submitPin = (digit?: string) => {
    const next = digit !== undefined ? (pin + digit).slice(0, 4) : pin;
    if (digit !== undefined) setPin(next);
    const value = digit !== undefined ? next : pin;
    if (value.length < 4) return;
    const match = STAFF.find((s) => s.pin === value);
    if (!match) {
      setPinError(true);
      setPin('');
      window.setTimeout(() => setPinError(false), 500);
      return;
    }
    setStaff(match);
    setPin('');
    setPhase('selling');
  };

  const completePay = (m: PayMethod) => {
    setPayMethod(m);
    setShiftOrders((n) => n + 1);
    setShiftRevenue((r) => r + total);
    setPhase('done');
  };

  const newSale = () => {
    setCart([]);
    setDiscountPct(0);
    setOrderType('dine-in');
    setPayMethod(null);
    setOrderNo((n) => n + 1);
    setPhase('selling');
  };

  const clockOut = () => {
    setStaff(null);
    setCart([]);
    setHeld(null);
    setDiscountPct(0);
    setPhase('welcome');
  };

  const timeLabel = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0b0f0e] text-white">
      {/* Top chrome */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-3 py-2.5 backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="hidden h-4 w-px bg-white/15 sm:block" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mintcom-green" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-black tracking-wide sm:text-sm">Mintcom POS · Demo</p>
              <p className="truncate text-[10px] text-white/45">Cafe Delight · Sandbox (no account)</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {staff && (
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 sm:flex">
              <span>{staff.emoji}</span>
              <span className="text-[11px] font-bold">{staff.name}</span>
              <span className="text-[10px] text-white/40">{staff.role}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70">
            <Clock size={12} className="text-mintcom-green" />
            {timeLabel}
          </div>
          {phase === 'selling' || phase === 'paying' || phase === 'done' ? (
            <button
              type="button"
              onClick={clockOut}
              className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white/60 hover:bg-white/10 hover:text-white"
            >
              Exit
            </button>
          ) : null}
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {phase === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-mintcom-green/15 text-4xl shadow-[0_0_60px_-10px_rgba(125,198,162,0.55)]"
              >
                ☕
              </motion.div>
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-mintcom-green/30 bg-mintcom-green/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-mintcom-green">
                <Sparkles size={12} /> Try before you sign up
              </p>
              <h1 className="max-w-lg font-barlow text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                Run a real sale in the{' '}
                <span className="text-mintcom-green">Mintcom POS</span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
                Full sandbox for Cafe Delight — clock in, ring items, customize add-ons, hold tickets,
                and take payment. Nothing is saved. No login required.
              </p>
              <div className="mt-8 grid w-full max-w-md gap-2 sm:grid-cols-3">
                {['Staff PIN', 'Add-ons & cart', 'Cash · Card · more'].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[11px] font-bold text-white/80"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPhase('pin')}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-mintcom-green px-8 py-3.5 text-base font-black text-black shadow-[0_12px_40px_-12px_rgba(125,198,162,0.7)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play size={18} fill="currentColor" />
                Start demo shift
              </button>
              <p className="mt-4 text-[11px] text-white/35">Takes about 60 seconds · mobile friendly</p>
            </motion.div>
          )}

          {phase === 'pin' && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-1 flex-col items-center justify-center px-5 py-8"
            >
              <button
                type="button"
                onClick={() => setPhase('welcome')}
                className="mb-6 self-start text-xs font-bold text-white/50 hover:text-white"
              >
                ← Back
              </button>
              <h2 className="text-xl font-black">Clock in with a staff PIN</h2>
              <p className="mt-1 text-sm text-white/50">Pick a demo employee or type their PIN</p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {STAFF.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setStaff(s);
                      setPhase('selling');
                      setPin('');
                    }}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-start transition-all hover:border-mintcom-green/40 hover:bg-mintcom-green/10"
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span>
                      <span className="block text-sm font-bold">{s.name}</span>
                      <span className="text-[10px] text-white/45">
                        {s.role} · PIN {s.pin}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <motion.div
                animate={pinError ? { x: [-6, 6, -4, 4, 0] } : {}}
                className="mt-8 flex gap-2"
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                      pin.length > i
                        ? 'border-mintcom-green bg-mintcom-green'
                        : pinError
                          ? 'border-rose-400'
                          : 'border-white/25'
                    }`}
                  />
                ))}
              </motion.div>
              {pinError && <p className="mt-2 text-xs font-bold text-rose-400">Wrong PIN — try 1234</p>}

              <div className="mt-6 grid w-full max-w-[260px] grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (k === '⌫') setPin((p) => p.slice(0, -1));
                      else if (k === '✓') submitPin();
                      else submitPin(k);
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 text-lg font-bold transition-colors hover:border-mintcom-green/40 hover:bg-mintcom-green/10 active:scale-95"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {(phase === 'selling' || phase === 'paying' || phase === 'done') && (
            <motion.div
              key="pos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-0 flex-1 flex-col lg:flex-row"
            >
              {/* Menu column */}
              <div className="relative flex min-h-0 flex-1 flex-col border-b border-white/10 lg:border-b-0 lg:border-e">
                {/* Shift strip */}
                <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2 sm:px-4">
                  <span className="rounded-full bg-mintcom-green/15 px-2.5 py-0.5 text-[10px] font-bold text-mintcom-green">
                    Shift · {shiftOrders} sale{shiftOrders === 1 ? '' : 's'} · {money(shiftRevenue)}
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={tipIdx}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="hidden text-[11px] text-white/45 md:block"
                    >
                      💡 {TIPS[tipIdx]}
                    </motion.p>
                  </AnimatePresence>
                  <AnimatePresence>
                    {flash && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="ms-auto rounded-full bg-mintcom-green px-2.5 py-0.5 text-[10px] font-black text-black"
                      >
                        {flash}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {phase === 'selling' && (
                  <>
                    <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5 no-scrollbar sm:px-4">
                      {CATEGORIES.map((cat) => {
                        const on = selectedCategory === cat.id;
                        const count =
                          cat.id === 'all'
                            ? products.length
                            : products.filter((p) => p.categoryId === cat.id).length;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                              on
                                ? 'border-mintcom-green bg-mintcom-green text-black shadow-[0_0_20px_-6px_rgba(125,198,162,0.8)]'
                                : 'border-white/10 bg-white/[0.04] text-white/80 hover:border-white/25'
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            {cat.name}
                            <span className={`tabular-nums text-[10px] ${on ? 'text-black/50' : 'text-white/35'}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 sm:px-4">
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
                        {visible.map((p) => (
                          <motion.button
                            key={p.id}
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => openItem(p)}
                            className={`relative flex flex-col items-center gap-1 rounded-2xl border bg-gradient-to-br p-2.5 text-center transition-shadow hover:shadow-lg hover:shadow-mintcom-green/10 sm:p-3 ${p.color} border-white/10 dark:from-white/[0.07]`}
                          >
                            {lastAdded === p.id && (
                              <span className="absolute -top-1 end-1 rounded-full bg-mintcom-green px-1.5 py-0.5 text-[9px] font-black text-black">
                                +1
                              </span>
                            )}
                            {!!p.attributes?.length && (
                              <span className="absolute start-1.5 top-1.5 rounded bg-black/30 px-1 text-[8px] font-bold text-white/70">
                                +
                              </span>
                            )}
                            <span className="text-2xl sm:text-3xl">{p.emoji}</span>
                            <span className="w-full truncate text-[11px] font-bold sm:text-xs">{p.name}</span>
                            <span className="text-[10px] font-semibold tabular-nums text-white/55">{money(p.price)}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {phase === 'paying' && (
                  <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
                    <p className="text-sm font-bold text-white/50">Amount due</p>
                    <p className="mt-1 font-barlow text-4xl font-black tabular-nums text-mintcom-green sm:text-5xl">
                      {money(total)}
                    </p>
                    <p className="mt-2 text-xs text-white/40">Order #{orderNo} · {orderTypeLabel(orderType)}</p>
                    <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
                      {(
                        [
                          { id: 'cash' as const, label: 'Cash', emoji: '💵' },
                          { id: 'card' as const, label: 'Card', emoji: '💳' },
                          { id: 'cliq' as const, label: 'CliQ', emoji: '⚡' },
                          { id: 'talabat' as const, label: 'Talabat', emoji: '🛵' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => completePay(m.id)}
                          className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:-translate-y-0.5 hover:border-mintcom-green/50 hover:bg-mintcom-green/10"
                        >
                          <span className="text-2xl">{m.emoji}</span>
                          <span className="text-sm font-bold">{m.label}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhase('selling')}
                      className="mt-6 text-xs font-bold text-white/45 hover:text-white"
                    >
                      ← Back to order
                    </button>
                  </div>
                )}

                {phase === 'done' && (
                  <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                      className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mintcom-green text-black shadow-[0_0_40px_-6px_rgba(125,198,162,0.8)]"
                    >
                      <Check size={32} strokeWidth={3} />
                    </motion.div>
                    <h2 className="text-2xl font-black">Payment approved</h2>
                    <p className="mt-1 text-sm text-white/50">
                      {money(total)} via {payMethodLabel(payMethod)} · Order #{orderNo}
                    </p>

                    <div className="mt-6 w-full max-w-sm rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-4 text-start">
                      <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                        Guest receipt · Cafe Delight
                      </p>
                      {cart.map((line) => (
                        <div key={line.id} className="mb-2">
                          <div className="flex justify-between gap-2 text-xs">
                            <span className="truncate font-medium text-white/80">
                              {line.emoji} {line.name} ×{line.qty}
                            </span>
                            <span className="tabular-nums font-semibold">{money(line.unitPrice * line.qty)}</span>
                          </div>
                          {line.addons.length > 0 && (
                            <p className="truncate text-[10px] text-white/40">
                              + {line.addons.map((a) => a.name).join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                      {discountPct > 0 && (
                        <div className="flex justify-between text-[11px] text-white/45">
                          <span>Discount {discountPct}%</span>
                          <span className="tabular-nums">−{money(discount)}</span>
                        </div>
                      )}
                      <div className="mt-2 flex justify-between border-t border-dashed border-white/15 pt-2 text-sm font-black">
                        <span>Total</span>
                        <span className="tabular-nums text-mintcom-green">{money(total)}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={newSale}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-mintcom-green px-5 py-2.5 text-sm font-black text-black"
                      >
                        <RotateCcw size={14} /> New sale
                      </button>
                      <Link
                        to="/signup"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white hover:border-mintcom-green/40"
                      >
                        Create free account
                      </Link>
                    </div>
                    <p className="mt-4 text-[11px] text-white/35">
                      Shift so far: {shiftOrders} order{shiftOrders === 1 ? '' : 's'} · {money(shiftRevenue)}
                    </p>
                  </div>
                )}
              </div>

              {/* Order ticket — always visible on desktop; sticky bottom sheet on mobile when selling */}
              <aside
                className={`flex w-full flex-col border-t border-white/10 bg-[#0e1312] lg:w-[360px] lg:shrink-0 lg:border-t-0 ${
                  phase === 'selling' ? 'max-h-[48vh] lg:max-h-none' : 'hidden lg:flex'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Current order</p>
                    <p className="text-sm font-black">#{orderNo}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-mintcom-green/15 px-2.5 py-1 text-[11px] font-bold text-mintcom-green">
                    <ShoppingBag size={12} />
                    {itemCount}
                  </div>
                </div>

                {/* Order type */}
                <div className="flex gap-1 border-b border-white/10 p-2">
                  {(
                    [
                      { id: 'dine-in' as const, label: 'Dine-in' },
                      { id: 'takeaway' as const, label: 'Takeaway' },
                      { id: 'delivery' as const, label: 'Delivery' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={phase !== 'selling'}
                      onClick={() => setOrderType(t.id)}
                      className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-colors ${
                        orderType === t.id
                          ? 'bg-mintcom-green text-black'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      } disabled:opacity-50`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
                  {cart.length === 0 ? (
                    <div className="flex h-full min-h-[100px] flex-col items-center justify-center text-center">
                      <p className="text-sm font-bold text-white/35">Cart is empty</p>
                      <p className="mt-1 max-w-[200px] text-[11px] text-white/25">
                        Tap products on the left to build the order
                      </p>
                      {held && (
                        <button
                          type="button"
                          onClick={resumeHeld}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-mintcom-green/40 bg-mintcom-green/10 px-3 py-1.5 text-[11px] font-bold text-mintcom-green"
                        >
                          <Play size={12} /> Resume held order
                        </button>
                      )}
                    </div>
                  ) : (
                    cart.map((line) => (
                      <div key={line.id} className="rounded-xl border border-white/8 bg-white/[0.03] p-2.5">
                        <div className="flex items-start gap-2">
                          <span className="text-lg leading-none">{line.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-xs font-bold">{line.name}</p>
                              <p className="shrink-0 text-xs font-bold tabular-nums">
                                {money(line.unitPrice * line.qty)}
                              </p>
                            </div>
                            {line.addons.length > 0 && (
                              <p className="mt-0.5 truncate text-[10px] text-white/40">
                                + {line.addons.map((a) => (a.price > 0 ? `${a.name} (${money(a.price)})` : a.name)).join(' · ')}
                              </p>
                            )}
                            {phase === 'selling' && (
                              <div className="mt-1.5 inline-flex items-center gap-0.5 rounded-lg bg-white/5 p-0.5">
                                <button
                                  type="button"
                                  onClick={() => changeQty(line.id, -1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-md text-white/60 hover:bg-white/10"
                                >
                                  −
                                </button>
                                <span className="w-5 text-center text-[11px] font-bold tabular-nums">{line.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => changeQty(line.id, 1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-md text-white/60 hover:bg-white/10"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-white/10 px-3 py-3">
                  {phase === 'selling' && (
                    <div className="mb-2 flex gap-1.5">
                      {[0, 5, 10, 15].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDiscountPct(d)}
                          className={`flex-1 rounded-lg py-1 text-[10px] font-bold ${
                            discountPct === d
                              ? 'bg-mintcom-green/20 text-mintcom-green'
                              : 'bg-white/5 text-white/45 hover:bg-white/10'
                          }`}
                        >
                          {d === 0 ? 'No disc.' : `${d}% off`}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="space-y-0.5 text-[11px]">
                    <Row label="Subtotal" value={money(subtotal)} />
                    {discountPct > 0 && <Row label={`Discount ${discountPct}%`} value={`−${money(discount)}`} />}
                    <Row label="Tax 8%" value={money(tax)} />
                    <div className="flex justify-between pt-1 text-sm font-black">
                      <span>Total</span>
                      <span className="tabular-nums text-mintcom-green">{money(total)}</span>
                    </div>
                  </div>

                  {phase === 'selling' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={!cart.length}
                        onClick={holdOrder}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-white/15 py-2.5 text-xs font-bold text-white/70 disabled:opacity-35"
                      >
                        <Pause size={13} /> Hold
                      </button>
                      <button
                        type="button"
                        disabled={!cart.length}
                        onClick={() => cart.length && setPhase('paying')}
                        className="inline-flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-mintcom-green py-2.5 text-xs font-black text-black shadow-[0_8px_24px_-8px_rgba(125,198,162,0.6)] disabled:opacity-40"
                      >
                        <CreditCard size={14} />
                        {cart.length ? `Charge ${money(total)}` : 'Charge'}
                      </button>
                    </div>
                  )}
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add-on modal */}
        <AnimatePresence>
          {addonItem && (
            <motion.div
              key="addon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-md sm:items-center"
              onClick={() => setAddonItem(null)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[90dvh] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#141a18] shadow-2xl"
              >
                <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mintcom-green/15 text-2xl">
                    {addonItem.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{addonItem.name}</p>
                    <p className="text-[11px] text-white/45">Base {money(addonItem.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddonItem(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/60"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="max-h-[50dvh] space-y-4 overflow-y-auto px-4 py-3">
                  {(addonItem.attributes ?? []).map((attr) => (
                    <div key={attr.id}>
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <p className="text-[11px] font-bold tracking-wide text-white/50">{attr.name}</p>
                        {attr.required && (
                          <span className="rounded bg-rose-500/15 px-1 text-[9px] font-bold text-rose-400">
                            Required
                          </span>
                        )}
                        {attr.multi && (
                          <span className="rounded bg-white/10 px-1 text-[9px] font-bold text-white/45">Multi</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {attr.options.map((opt) => {
                          const selected = (addonSel[attr.id] ?? []).includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => toggleOption(attr, opt)}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                                selected
                                  ? 'border-mintcom-green bg-mintcom-green/15 text-white'
                                  : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-mintcom-green/40'
                              }`}
                            >
                              {selected && <Check size={11} className="text-mintcom-green" strokeWidth={3} />}
                              {opt.name}
                              {opt.price > 0 && (
                                <span className={selected ? 'text-mintcom-green' : 'text-white/40'}>
                                  +{money(opt.price)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 px-4 py-3">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-xl bg-white/5 p-0.5">
                      <button
                        type="button"
                        onClick={() => setAddonQty((q) => Math.max(1, q - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-bold tabular-nums">{addonQty}</span>
                      <button
                        type="button"
                        onClick={() => setAddonQty((q) => Math.min(20, q + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-end">
                      <p className="text-[10px] text-white/40">Line total</p>
                      <p className="text-sm font-black tabular-nums text-mintcom-green">
                        {money(addonPreview.unit * addonQty)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={confirmAddons}
                    className="w-full rounded-xl bg-mintcom-green py-3 text-sm font-black text-black"
                  >
                    Add to order · {money(addonPreview.unit * addonQty)}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-white/50">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function orderTypeLabel(t: OrderType) {
  if (t === 'dine-in') return 'Dine-in';
  if (t === 'takeaway') return 'Takeaway';
  return 'Delivery';
}

function payMethodLabel(m: PayMethod | null) {
  if (m === 'cash') return 'Cash';
  if (m === 'card') return 'Card';
  if (m === 'cliq') return 'CliQ';
  if (m === 'talabat') return 'Talabat';
  return '—';
}
