import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  LayoutGrid,
  Pause,
  Percent,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { Logo } from './Logo';

/**
 * Full POS sandbox — styled like real Mintcom POS (mintcom-pos SalesScreen)
 * + website light/dark tokens (mintcom-dark / cream / mintcom-green).
 * No account, no API. Labels hardcoded (demo-only).
 */

type PosOption = { id: string; name: string; price: number };
type PosAttribute = { id: string; name: string; multi?: boolean; required?: boolean; options: PosOption[] };
type PosProduct = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  categoryId: string;
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
  note?: string;
};
type HeldTicket = {
  id: string;
  orderNo: number;
  type: OrderType;
  lines: CartLine[];
  discountPct: number;
  note: string;
  at: number;
};
type OrderType = 'dine-in' | 'takeaway' | 'delivery';
type PayMethod = 'cash' | 'card' | 'cliq' | 'talabat' | 'voucher';
type Phase = 'welcome' | 'pin' | 'app';
type Screen = 'sales' | 'held' | 'shift';
type Staff = { id: string; name: string; role: string; pin: string; emoji: string };

const money = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const STAFF: Staff[] = [
  { id: 'sara', name: 'Sara', role: 'Cashier', pin: '1234', emoji: '👩‍💼' },
  { id: 'omar', name: 'Omar', role: 'Barista', pin: '0000', emoji: '👨‍🍳' },
  { id: 'maya', name: 'Maya', role: 'Manager', pin: '9999', emoji: '👩‍💻' },
];

const CATEGORIES = [
  { id: 'all', name: 'All Menu', emoji: '⊞' },
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
    { id: 'espresso', name: 'Espresso', price: 3.5, emoji: '☕', categoryId: 'beverages', attributes: [size, extras] },
    { id: 'latte', name: 'Latte', price: 4.5, emoji: '🥛', categoryId: 'beverages', attributes: [size, milk, extras] },
    { id: 'cappuccino', name: 'Cappuccino', price: 4.25, emoji: '☕', categoryId: 'beverages', attributes: [size, milk, extras] },
    { id: 'coldbrew', name: 'Cold brew', price: 4.75, emoji: '🧊', categoryId: 'beverages', attributes: [size, milk] },
    { id: 'soda', name: 'Soda', price: 2.5, emoji: '🥤', categoryId: 'beverages', attributes: [size] },
    { id: 'tea', name: 'Tea', price: 2.75, emoji: '🍵', categoryId: 'beverages', attributes: [size, milk] },
    { id: 'croissant', name: 'Croissant', price: 4, emoji: '🥐', categoryId: 'pastries', attributes: [heat] },
    { id: 'muffin', name: 'Muffin', price: 3.25, emoji: '🧁', categoryId: 'pastries', attributes: [heat] },
    { id: 'bagel', name: 'Bagel', price: 3.75, emoji: '🥯', categoryId: 'pastries', attributes: [heat, toppings] },
    { id: 'cookie', name: 'Cookie', price: 2, emoji: '🍪', categoryId: 'pastries' },
    { id: 'salad', name: 'Garden salad', price: 6.5, emoji: '🥗', categoryId: 'food', attributes: [dressing, toppings] },
    { id: 'sandwich', name: 'Club sandwich', price: 7.5, emoji: '🥪', categoryId: 'food', attributes: [toppings] },
    { id: 'soup', name: 'Soup of day', price: 5.5, emoji: '🥣', categoryId: 'food', attributes: [size] },
    { id: 'wrap', name: 'Chicken wrap', price: 8, emoji: '🌯', categoryId: 'food', attributes: [toppings] },
    { id: 'cheesecake', name: 'Cheesecake', price: 5.5, emoji: '🍰', categoryId: 'desserts' },
    { id: 'brownie', name: 'Brownie', price: 3.5, emoji: '🍫', categoryId: 'desserts', attributes: [heat] },
  ];
}

const OTHER_METHODS: { id: PayMethod; label: string; emoji: string }[] = [
  { id: 'cliq', label: 'CliQ', emoji: '⚡' },
  { id: 'talabat', label: 'Talabat', emoji: '🛵' },
  { id: 'voucher', label: 'Voucher', emoji: '🎟️' },
];

export function FullPosPlayground() {
  const products = useMemo(() => buildCatalog(), []);
  const [phase, setPhase] = useState<Phase>('welcome');
  const [screen, setScreen] = useState<Screen>('sales');
  const [staff, setStaff] = useState<Staff | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [catOpen, setCatOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [held, setHeld] = useState<HeldTicket[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [discountPct, setDiscountPct] = useState(0);
  const [orderNote, setOrderNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showOtherPay, setShowOtherPay] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [loyaltyName, setLoyaltyName] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState(1042);
  const [payMethod, setPayMethod] = useState<PayMethod | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{
    lines: CartLine[];
    total: number;
    method: PayMethod;
    orderNo: number;
    type: OrderType;
    discountPct: number;
    discount: number;
    tax: number;
    subtotal: number;
  } | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [addonItem, setAddonItem] = useState<PosProduct | null>(null);
  const [addonSel, setAddonSel] = useState<Record<string, string[]>>({});
  const [addonQty, setAddonQty] = useState(1);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [shiftOrders, setShiftOrders] = useState(0);
  const [shiftRevenue, setShiftRevenue] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [flash, setFlash] = useState<string | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const visible = useMemo(() => {
    let list =
      selectedCategory === 'all' ? products : products.filter((p) => p.categoryId === selectedCategory);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    return list;
  }, [products, selectedCategory, search]);

  const activeCat = CATEGORIES.find((c) => c.id === selectedCategory) ?? CATEGORIES[0];

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
    setHeld((h) => [
      {
        id: `h-${Date.now()}`,
        orderNo,
        type: orderType,
        lines: cart,
        discountPct,
        note: orderNote,
        at: Date.now(),
      },
      ...h,
    ]);
    setCart([]);
    setDiscountPct(0);
    setOrderNote('');
    setOrderNo((n) => n + 1);
    setShowDiscount(false);
    setShowNote(false);
    ping('Order held');
  };

  const resumeHeld = (ticket: HeldTicket) => {
    if (cart.length) {
      // park current first
      setHeld((h) => [
        {
          id: `h-${Date.now()}`,
          orderNo,
          type: orderType,
          lines: cart,
          discountPct,
          note: orderNote,
          at: Date.now(),
        },
        ...h.filter((x) => x.id !== ticket.id),
      ]);
    } else {
      setHeld((h) => h.filter((x) => x.id !== ticket.id));
    }
    setCart(ticket.lines);
    setOrderType(ticket.type);
    setDiscountPct(ticket.discountPct);
    setOrderNote(ticket.note);
    setOrderNo(ticket.orderNo);
    setScreen('sales');
    setMobileCartOpen(true);
    ping(`Resumed #${ticket.orderNo}`);
  };

  const clearOrder = () => {
    setCart([]);
    setDiscountPct(0);
    setOrderNote('');
    setLoyaltyName(null);
    setShowDiscount(false);
    setShowNote(false);
    ping('Order cleared');
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
    setPhase('app');
    setScreen('sales');
  };

  const completePay = (m: PayMethod) => {
    if (!cart.length) return;
    setPayMethod(m);
    setShiftOrders((n) => n + 1);
    setShiftRevenue((r) => r + total);
    setLastReceipt({
      lines: cart,
      total,
      method: m,
      orderNo,
      type: orderType,
      discountPct,
      discount,
      tax,
      subtotal,
    });
    setShowReceipt(true);
    setShowOtherPay(false);
    setCart([]);
    setDiscountPct(0);
    setOrderNote('');
    setLoyaltyName(null);
    setOrderNo((n) => n + 1);
    setMobileCartOpen(false);
  };

  const clockOut = () => {
    setStaff(null);
    setCart([]);
    setHeld([]);
    setDiscountPct(0);
    setOrderNote('');
    setLoyaltyName(null);
    setShowReceipt(false);
    setPhase('welcome');
  };

  const timeLabel = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  /* ─── Welcome ─── */
  if (phase === 'welcome') {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-cream-50 dark:bg-mintcom-dark">
        <DemoChrome onExit={null} />
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <Logo size="lg" className="mx-auto" />
          </motion.div>
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-mintcom-green/30 bg-mintcom-green/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-mintcom-green">
            <Sparkles size={12} /> Free sandbox · no account
          </p>
          <h1 className="max-w-xl font-barlow text-3xl font-black tracking-tight text-text-primary dark:text-white sm:text-4xl md:text-5xl">
            Experience the real{' '}
            <span className="text-mintcom-green">Mintcom POS</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary dark:text-mintcom-textSecondary sm:text-base">
            Same layout as the live sales screen — menu, order ticket, add-ons, hold, loyalty, and Cash /
            Card / Other. Nothing is saved.
          </p>
          <div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-2 sm:grid-cols-4">
            {['Sales screen', 'Add-ons', 'Hold tickets', 'Payments'].map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-200 bg-white px-3 py-3 text-[11px] font-bold text-text-primary shadow-sm dark:border-white/10 dark:bg-mintcom-surface dark:text-white"
              >
                {label}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPhase('pin')}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-mintcom-green px-8 py-3.5 text-base font-black text-white shadow-[0_12px_40px_-12px_rgba(125,198,162,0.55)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play size={18} fill="currentColor" />
            Start demo shift
          </button>
          <p className="mt-4 text-[11px] text-text-tertiary dark:text-mintcom-gray">
            ~1 minute · works on phone & desktop
          </p>
        </div>
      </div>
    );
  }

  /* ─── PIN ─── */
  if (phase === 'pin') {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-cream-50 dark:bg-mintcom-dark">
        <DemoChrome onExit={null} />
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
          <button
            type="button"
            onClick={() => setPhase('welcome')}
            className="mb-6 self-start text-xs font-bold text-text-secondary hover:text-mintcom-green dark:text-mintcom-textSecondary"
          >
            ← Back
          </button>
          <div className="w-full max-w-sm rounded-[28px] border border-gray-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-mintcom-surface">
            <h2 className="text-center text-xl font-black text-text-primary dark:text-white">Staff clock-in</h2>
            <p className="mt-1 text-center text-sm text-text-secondary dark:text-mintcom-textSecondary">
              Tap a demo employee or enter their PIN
            </p>
            <div className="mt-5 space-y-2">
              {STAFF.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStaff(s);
                    setPhase('app');
                    setScreen('sales');
                    setPin('');
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-cream-50 px-3 py-3 text-start transition-all hover:border-mintcom-green/40 hover:bg-mintcom-green/10 dark:border-white/8 dark:bg-mintcom-dark dark:hover:border-mintcom-green/40"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm dark:bg-mintcom-surface">
                    {s.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-text-primary dark:text-white">{s.name}</span>
                    <span className="text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
                      {s.role} · PIN {s.pin}
                    </span>
                  </span>
                  <ChevronDown className="-rotate-90 text-mintcom-green" size={16} />
                </button>
              ))}
            </div>
            <motion.div animate={pinError ? { x: [-6, 6, -4, 4, 0] } : {}} className="mt-6 flex justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                    pin.length > i
                      ? 'border-mintcom-green bg-mintcom-green'
                      : pinError
                        ? 'border-mintcom-red'
                        : 'border-gray-300 dark:border-mintcom-tertiary'
                  }`}
                />
              ))}
            </motion.div>
            {pinError && <p className="mt-2 text-center text-xs font-bold text-mintcom-red">Wrong PIN — try 1234</p>}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === '⌫') setPin((p) => p.slice(0, -1));
                    else if (k === '✓') submitPin();
                    else submitPin(k);
                  }}
                  className="rounded-2xl border border-gray-100 bg-cream-50 py-3.5 text-lg font-bold text-text-primary transition-colors hover:border-mintcom-green/40 hover:bg-mintcom-green/10 dark:border-white/8 dark:bg-mintcom-dark dark:text-white"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main POS app shell ─── */
  return (
    <div className="flex min-h-[100dvh] flex-col bg-cream-50 text-text-primary dark:bg-mintcom-dark dark:text-white">
      <DemoChrome
        staff={staff}
        timeLabel={timeLabel}
        flash={flash}
        onExit={clockOut}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Side rail — like POS nav */}
        <nav className="hidden w-[72px] shrink-0 flex-col items-center gap-1 border-e border-gray-200 bg-white py-3 dark:border-mintcom-tertiary dark:bg-mintcom-surface sm:flex">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-mintcom-green/15">
            <Logo variant="icon" size="sm" />
          </div>
          {(
            [
              { id: 'sales' as const, icon: LayoutGrid, label: 'Sales' },
              { id: 'held' as const, icon: Pause, label: 'Held', badge: held.length },
              { id: 'shift' as const, icon: Clock, label: 'Shift' },
            ] as const
          ).map((item) => {
            const on = screen === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                className={`relative flex w-[56px] flex-col items-center gap-0.5 rounded-2xl px-1 py-2.5 text-[10px] font-bold transition-colors ${
                  on
                    ? 'bg-mintcom-green text-white shadow-md shadow-mintcom-green/25'
                    : 'text-text-secondary hover:bg-mintcom-green/10 hover:text-mintcom-green dark:text-mintcom-textSecondary'
                }`}
              >
                <Icon size={18} />
                {item.label}
                {'badge' in item && item.badge > 0 && (
                  <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mintcom-red px-1 text-[9px] font-black text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="mt-auto flex flex-col items-center gap-1 px-1 text-center">
            <span className="text-lg">{staff?.emoji}</span>
            <span className="text-[9px] font-bold text-text-tertiary dark:text-mintcom-gray">{staff?.name}</span>
          </div>
        </nav>

        {/* Mobile bottom tabs */}
        <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-mintcom-tertiary dark:bg-mintcom-surface/95 sm:hidden">
          {(
            [
              { id: 'sales' as const, icon: LayoutGrid, label: 'Sales' },
              { id: 'held' as const, icon: Pause, label: 'Held', badge: held.length },
              { id: 'shift' as const, icon: Clock, label: 'Shift' },
            ] as const
          ).map((item) => {
            const on = screen === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold ${
                  on ? 'text-mintcom-green' : 'text-text-secondary dark:text-mintcom-textSecondary'
                }`}
              >
                <Icon size={18} />
                {item.label}
                {'badge' in item && item.badge > 0 && (
                  <span className="absolute end-[28%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mintcom-red px-1 text-[9px] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileCartOpen(true)}
            className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold text-text-secondary dark:text-mintcom-textSecondary"
          >
            <ShoppingBag size={18} />
            Cart
            {itemCount > 0 && (
              <span className="absolute end-[28%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mintcom-green px-1 text-[9px] font-black text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col pb-14 sm:pb-0 lg:flex-row">
          {screen === 'sales' && (
            <>
              {/* Menu pane ~2.3 */}
              <section className="flex min-h-0 min-w-0 flex-[2.3] flex-col bg-cream-50 dark:bg-mintcom-dark">
                {/* Sales header */}
                <header className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-3 py-2.5 dark:border-mintcom-tertiary dark:bg-mintcom-surface sm:px-4">
                  <div className="me-1 hidden min-w-0 sm:block">
                    <p className="truncate text-xs font-black text-text-primary dark:text-white">Cafe Delight</p>
                    <p className="truncate text-[10px] text-text-secondary dark:text-mintcom-textSecondary">
                      {staff?.name} · {staff?.role}
                    </p>
                  </div>

                  {/* Category trigger — like POS header chip */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCatOpen((v) => !v)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-cream-50 px-3 py-2 text-xs font-bold text-text-primary dark:border-mintcom-tertiary dark:bg-mintcom-dark dark:text-white"
                    >
                      <span>{activeCat.emoji}</span>
                      {activeCat.name}
                      <ChevronDown size={14} className="text-mintcom-green" />
                    </button>
                    <AnimatePresence>
                      {catOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className="absolute start-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-mintcom-tertiary dark:bg-mintcom-surface"
                        >
                          {CATEGORIES.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(c.id);
                                setCatOpen(false);
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2.5 text-start text-xs font-bold ${
                                selectedCategory === c.id
                                  ? 'bg-mintcom-green/15 text-mintcom-green'
                                  : 'text-text-primary hover:bg-cream-100 dark:text-white dark:hover:bg-white/5'
                              }`}
                            >
                              <span>{c.emoji}</span>
                              {c.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative min-w-[140px] flex-1 sm:max-w-xs">
                    <Search
                      size={14}
                      className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-mintcom-gray"
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products…"
                      className="w-full rounded-xl border border-gray-200 bg-cream-50 py-2 ps-8 pe-3 text-xs font-medium text-text-primary outline-none placeholder:text-text-placeholder focus:border-mintcom-green dark:border-mintcom-tertiary dark:bg-mintcom-dark dark:text-white"
                    />
                  </div>
                </header>

                {/* Product grid */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
                  <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                    {visible.map((p) => (
                      <motion.button
                        key={p.id}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => openItem(p)}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-start shadow-sm transition-shadow hover:shadow-md dark:border-white/8 dark:bg-mintcom-surface"
                      >
                        {lastAdded === p.id && (
                          <span className="absolute end-2 top-2 z-10 rounded-full bg-mintcom-green px-1.5 py-0.5 text-[9px] font-black text-white">
                            +1
                          </span>
                        )}
                        <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-mintcom-greenTint to-cream-100 dark:from-mintcom-green/10 dark:to-mintcom-dark">
                          <span className="text-4xl sm:text-5xl">{p.emoji}</span>
                          {/* Green + like real ProductCard */}
                          <span className="absolute bottom-2 end-2 flex h-8 w-8 items-center justify-center rounded-full bg-mintcom-green text-white shadow-md shadow-mintcom-green/30 transition-transform group-hover:scale-110">
                            <Plus size={16} strokeWidth={3} />
                          </span>
                          {!!p.attributes?.length && (
                            <span className="absolute start-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-text-secondary shadow-sm dark:bg-mintcom-dark/80 dark:text-mintcom-textSecondary">
                              Options
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-0.5 p-2.5">
                          <p className="line-clamp-2 text-xs font-bold leading-snug text-text-primary dark:text-white sm:text-[13px]">
                            {p.name}
                          </p>
                          <p className="text-sm font-black tabular-nums text-mintcom-green">{money(p.price)}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  {visible.length === 0 && (
                    <p className="py-16 text-center text-sm text-text-tertiary dark:text-mintcom-gray">
                      No products match your search
                    </p>
                  )}
                </div>
              </section>

              {/* Order pane ~1.2 — desktop always; mobile sheet */}
              <OrderPanel
                className="hidden w-full max-w-none flex-[1.2] border-s border-gray-200 bg-white dark:border-mintcom-tertiary dark:bg-mintcom-surface lg:flex"
                orderNo={orderNo}
                cart={cart}
                orderType={orderType}
                setOrderType={setOrderType}
                discountPct={discountPct}
                orderNote={orderNote}
                loyaltyName={loyaltyName}
                subtotal={subtotal}
                discount={discount}
                tax={tax}
                total={total}
                itemCount={itemCount}
                showDiscount={showDiscount}
                setShowDiscount={setShowDiscount}
                setDiscountPct={setDiscountPct}
                showNote={showNote}
                setShowNote={setShowNote}
                setOrderNote={setOrderNote}
                onHold={holdOrder}
                onClear={clearOrder}
                onLoyalty={() => setShowLoyalty(true)}
                onChangeQty={changeQty}
                onPayCash={() => completePay('cash')}
                onPayCard={() => completePay('card')}
                onPayOther={() => setShowOtherPay(true)}
              />
            </>
          )}

          {screen === 'held' && (
            <section className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
              <h2 className="font-barlow text-xl font-black text-text-primary dark:text-white">Held orders</h2>
              <p className="mt-1 text-sm text-text-secondary dark:text-mintcom-textSecondary">
                Park tickets and resume them later — just like open tickets on POS.
              </p>
              {held.length === 0 ? (
                <div className="mt-10 flex flex-col items-center rounded-[28px] border border-dashed border-gray-200 bg-white py-16 dark:border-mintcom-tertiary dark:bg-mintcom-surface">
                  <Pause className="mb-3 text-mintcom-green" size={32} />
                  <p className="font-bold text-text-primary dark:text-white">No held orders</p>
                  <p className="mt-1 max-w-xs text-center text-xs text-text-secondary dark:text-mintcom-textSecondary">
                    On the sales screen, add items then tap the pause icon on the order ticket.
                  </p>
                  <button
                    type="button"
                    onClick={() => setScreen('sales')}
                    className="mt-4 rounded-xl bg-mintcom-green px-4 py-2 text-xs font-black text-white"
                  >
                    Back to sales
                  </button>
                </div>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {held.map((t) => {
                    const tSub = t.lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
                    return (
                      <div
                        key={t.id}
                        className="rounded-[24px] border border-gray-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-mintcom-surface"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-black text-text-primary dark:text-white">#{t.orderNo}</p>
                            <p className="text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
                              {orderTypeLabel(t.type)} · {t.lines.reduce((s, l) => s + l.qty, 0)} items
                            </p>
                          </div>
                          <p className="text-sm font-black text-mintcom-green">{money(tSub)}</p>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[11px] text-text-tertiary dark:text-mintcom-gray">
                          {t.lines.map((l) => `${l.emoji} ${l.name}×${l.qty}`).join(' · ')}
                        </p>
                        <button
                          type="button"
                          onClick={() => resumeHeld(t)}
                          className="mt-3 w-full rounded-xl bg-mintcom-green py-2.5 text-xs font-black text-white"
                        >
                          Resume order
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {screen === 'shift' && (
            <section className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
              <h2 className="font-barlow text-xl font-black text-text-primary dark:text-white">Shift overview</h2>
              <p className="mt-1 text-sm text-text-secondary dark:text-mintcom-textSecondary">
                Demo session stats for {staff?.name} at Cafe Delight
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Sales completed', value: String(shiftOrders), icon: '🧾' },
                  { label: 'Revenue', value: money(shiftRevenue), icon: '💵' },
                  { label: 'Held tickets', value: String(held.length), icon: '⏸️' },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-mintcom-surface"
                  >
                    <span className="text-2xl">{card.icon}</span>
                    <p className="mt-3 text-2xl font-black tabular-nums text-text-primary dark:text-white">
                      {card.value}
                    </p>
                    <p className="text-xs font-bold text-text-secondary dark:text-mintcom-textSecondary">
                      {card.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[24px] border border-mintcom-green/25 bg-mintcom-green/10 p-5">
                <p className="text-sm font-black text-text-primary dark:text-white">Like what you see?</p>
                <p className="mt-1 text-xs text-text-secondary dark:text-mintcom-textSecondary">
                  Create a free Mintcom account and run this for your real menu, staff, and locations.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/signup"
                    className="rounded-xl bg-mintcom-green px-4 py-2.5 text-xs font-black text-white"
                  >
                    Create free account
                  </Link>
                  <button
                    type="button"
                    onClick={() => setScreen('sales')}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-text-primary dark:border-white/10 dark:bg-mintcom-surface dark:text-white"
                  >
                    Keep practicing
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Mobile order sheet */}
        <AnimatePresence>
          {mobileCartOpen && screen === 'sales' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileCartOpen(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl border border-gray-200 bg-white shadow-2xl dark:border-mintcom-tertiary dark:bg-mintcom-surface"
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/8">
                  <p className="text-sm font-black">Order #{orderNo}</p>
                  <button
                    type="button"
                    onClick={() => setMobileCartOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100 dark:bg-white/10"
                  >
                    <X size={16} />
                  </button>
                </div>
                <OrderPanel
                  className="flex min-h-0 flex-1"
                  orderNo={orderNo}
                  cart={cart}
                  orderType={orderType}
                  setOrderType={setOrderType}
                  discountPct={discountPct}
                  orderNote={orderNote}
                  loyaltyName={loyaltyName}
                  subtotal={subtotal}
                  discount={discount}
                  tax={tax}
                  total={total}
                  itemCount={itemCount}
                  showDiscount={showDiscount}
                  setShowDiscount={setShowDiscount}
                  setDiscountPct={setDiscountPct}
                  showNote={showNote}
                  setShowNote={setShowNote}
                  setOrderNote={setOrderNote}
                  onHold={holdOrder}
                  onClear={clearOrder}
                  onLoyalty={() => setShowLoyalty(true)}
                  onChangeQty={changeQty}
                  onPayCash={() => completePay('cash')}
                  onPayCard={() => completePay('card')}
                  onPayOther={() => setShowOtherPay(true)}
                  compact
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Addon modal */}
        <AnimatePresence>
          {addonItem && (
            <motion.div
              key="addon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm sm:items-center"
              onClick={() => setAddonItem(null)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[90dvh] w-full max-w-md overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl dark:border-mintcom-tertiary dark:bg-mintcom-surface"
              >
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-white/8">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mintcom-greenTint text-3xl dark:bg-mintcom-green/15">
                    {addonItem.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-text-primary dark:text-white">{addonItem.name}</p>
                    <p className="text-sm font-black text-mintcom-green">{money(addonItem.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddonItem(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100 text-text-secondary dark:bg-white/10"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-[45dvh] space-y-4 overflow-y-auto px-4 py-3">
                  {(addonItem.attributes ?? []).map((attr) => (
                    <div key={attr.id}>
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <p className="text-[11px] font-bold text-text-secondary dark:text-mintcom-textSecondary">
                          {attr.name}
                        </p>
                        {attr.required && (
                          <span className="rounded bg-mintcom-red/10 px-1 text-[9px] font-bold text-mintcom-red">
                            Required
                          </span>
                        )}
                        {attr.multi && (
                          <span className="rounded bg-cream-200 px-1 text-[9px] font-bold text-text-tertiary dark:bg-white/10 dark:text-mintcom-gray">
                            Multi
                          </span>
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
                                  ? 'border-mintcom-green bg-mintcom-green/15 text-text-primary dark:text-white'
                                  : 'border-gray-200 bg-cream-50 text-text-secondary hover:border-mintcom-green/40 dark:border-white/10 dark:bg-mintcom-dark dark:text-mintcom-textSecondary'
                              }`}
                            >
                              {selected && <Check size={11} className="text-mintcom-green" strokeWidth={3} />}
                              {opt.name}
                              {opt.price > 0 && (
                                <span className={selected ? 'text-mintcom-green' : 'text-text-tertiary'}>
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
                <div className="border-t border-gray-100 px-4 py-3 dark:border-white/8">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-xl bg-cream-100 p-0.5 dark:bg-white/5">
                      <button
                        type="button"
                        onClick={() => setAddonQty((q) => Math.max(1, q - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/10"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-bold tabular-nums">{addonQty}</span>
                      <button
                        type="button"
                        onClick={() => setAddonQty((q) => Math.min(20, q + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-black tabular-nums text-mintcom-green">
                      {money(addonPreview.unit * addonQty)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={confirmAddons}
                    className="w-full rounded-xl bg-mintcom-green py-3 text-sm font-black text-white"
                  >
                    Add to cart · {money(addonPreview.unit * addonQty)}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Other payment methods */}
        <AnimatePresence>
          {showOtherPay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
              onClick={() => setShowOtherPay(false)}
            >
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-[28px] border border-gray-200 bg-white p-5 shadow-2xl dark:border-mintcom-tertiary dark:bg-mintcom-surface"
              >
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-black text-text-primary dark:text-white">Other payment</h3>
                  <button type="button" onClick={() => setShowOtherPay(false)} className="text-text-tertiary">
                    <X size={18} />
                  </button>
                </div>
                <p className="mb-4 text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
                  Delivery apps, wallets & vouchers — same methods you configure in Dashboard → Payment Methods.
                </p>
                <p className="mb-3 text-center text-2xl font-black tabular-nums text-mintcom-green">{money(total)}</p>
                <div className="space-y-2">
                  {OTHER_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => completePay(m.id)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-mintcom-green/30 bg-mintcom-green/10 px-4 py-3 text-start transition-all hover:bg-mintcom-green/20"
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="flex-1 text-sm font-bold text-text-primary dark:text-white">{m.label}</span>
                      <Wallet size={16} className="text-mintcom-green" />
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loyalty picker */}
        <AnimatePresence>
          {showLoyalty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
              onClick={() => setShowLoyalty(false)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-[28px] border border-gray-200 bg-white p-5 shadow-2xl dark:border-mintcom-tertiary dark:bg-mintcom-surface"
              >
                <h3 className="text-sm font-black text-text-primary dark:text-white">Attach loyalty guest</h3>
                <p className="mt-1 text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
                  Demo customers — points & rewards show on the real POS.
                </p>
                <div className="mt-4 space-y-2">
                  {['Lina · 420 pts', 'Karim · 180 pts', 'Guest walk-in'].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setLoyaltyName(name);
                        setShowLoyalty(false);
                        ping(`Loyalty · ${name.split('·')[0].trim()}`);
                      }}
                      className="flex w-full items-center gap-2 rounded-2xl border border-gray-100 bg-cream-50 px-3 py-3 text-start text-sm font-bold hover:border-mintcom-green/40 dark:border-white/8 dark:bg-mintcom-dark dark:text-white"
                    >
                      <Star size={16} className="text-mintcom-green" />
                      {name}
                    </button>
                  ))}
                </div>
                {loyaltyName && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoyaltyName(null);
                      setShowLoyalty(false);
                      ping('Loyalty removed');
                    }}
                    className="mt-3 w-full text-xs font-bold text-mintcom-red"
                  >
                    Remove guest
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Receipt success */}
        <AnimatePresence>
          {showReceipt && lastReceipt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm rounded-[28px] border border-gray-200 bg-white p-6 text-center shadow-2xl dark:border-mintcom-tertiary dark:bg-mintcom-surface"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-mintcom-green text-white shadow-[0_8px_28px_-6px_rgba(125,198,162,0.7)]">
                  <Check size={28} strokeWidth={3} />
                </div>
                <h3 className="text-lg font-black text-text-primary dark:text-white">Payment approved</h3>
                <p className="mt-1 text-sm text-text-secondary dark:text-mintcom-textSecondary">
                  {money(lastReceipt.total)} via {payMethodLabel(lastReceipt.method)}
                </p>
                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-cream-50 px-3 py-3 text-start dark:border-white/10 dark:bg-mintcom-dark">
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                    Cafe Delight · #{lastReceipt.orderNo} · {orderTypeLabel(lastReceipt.type)}
                  </p>
                  {lastReceipt.lines.map((line) => (
                    <div key={line.id} className="mb-1.5 flex justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-text-primary dark:text-white">
                        {line.emoji} {line.name} ×{line.qty}
                      </span>
                      <span className="tabular-nums font-bold">{money(line.unitPrice * line.qty)}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex justify-between border-t border-dashed border-gray-200 pt-2 text-sm font-black dark:border-white/10">
                    <span>Total</span>
                    <span className="text-mintcom-green">{money(lastReceipt.total)}</span>
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReceipt(false);
                      setScreen('sales');
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-mintcom-green py-3 text-sm font-black text-white"
                  >
                    <RotateCcw size={14} /> New sale
                  </button>
                  <Link
                    to="/signup"
                    className="rounded-xl border border-gray-200 py-3 text-sm font-bold text-text-primary dark:border-white/10 dark:text-white"
                  >
                    Create free account
                  </Link>
                </div>
                <p className="mt-3 text-[11px] text-text-tertiary dark:text-mintcom-gray">
                  Shift: {shiftOrders} sale{shiftOrders === 1 ? '' : 's'} · {money(shiftRevenue)}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Order panel (desktop + mobile sheet) ─── */
function OrderPanel({
  className = '',
  orderNo,
  cart,
  orderType,
  setOrderType,
  discountPct,
  orderNote,
  loyaltyName,
  subtotal,
  discount,
  tax,
  total,
  itemCount,
  showDiscount,
  setShowDiscount,
  setDiscountPct,
  showNote,
  setShowNote,
  setOrderNote,
  onHold,
  onClear,
  onLoyalty,
  onChangeQty,
  onPayCash,
  onPayCard,
  onPayOther,
  compact,
}: {
  className?: string;
  orderNo: number;
  cart: CartLine[];
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;
  discountPct: number;
  orderNote: string;
  loyaltyName: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemCount: number;
  showDiscount: boolean;
  setShowDiscount: (v: boolean) => void;
  setDiscountPct: (n: number) => void;
  showNote: boolean;
  setShowNote: (v: boolean) => void;
  setOrderNote: (s: string) => void;
  onHold: () => void;
  onClear: () => void;
  onLoyalty: () => void;
  onChangeQty: (id: string, d: number) => void;
  onPayCash: () => void;
  onPayCard: () => void;
  onPayOther: () => void;
  compact?: boolean;
}) {
  const empty = cart.length === 0;

  return (
    <aside className={`flex min-h-0 flex-col ${className}`}>
      {/* Order panel header — green action icons like real POS */}
      <div className="border-b border-gray-100 px-3 py-2.5 dark:border-white/8">
        {empty ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-text-secondary dark:text-mintcom-textSecondary">
              Add items to start
            </p>
            <IconBtn label="Loyalty" onClick={onLoyalty} active={!!loyaltyName}>
              <Star size={18} />
            </IconBtn>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <IconBtn label="Discount" onClick={() => setShowDiscount(!showDiscount)} active={discountPct > 0}>
                <Percent size={16} />
              </IconBtn>
              <IconBtn label="Note" onClick={() => setShowNote(!showNote)} active={!!orderNote}>
                <FileText size={16} />
              </IconBtn>
              <IconBtn label="Hold" onClick={onHold}>
                <Pause size={16} />
              </IconBtn>
              <IconBtn label="Loyalty" onClick={onLoyalty} active={!!loyaltyName}>
                <Star size={16} />
              </IconBtn>
              <IconBtn label="Clear" onClick={onClear} danger>
                <Trash2 size={16} />
              </IconBtn>
            </div>
            <div className="text-end">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary dark:text-mintcom-gray">
                Order
              </p>
              <p className="text-sm font-black text-text-primary dark:text-white">#{orderNo}</p>
            </div>
          </div>
        )}

        {loyaltyName && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mintcom-green/15 px-2.5 py-1 text-[10px] font-bold text-mintcom-green">
            <User size={11} />
            {loyaltyName}
          </div>
        )}

        <AnimatePresence>
          {showDiscount && !empty && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 flex gap-1.5">
                {[0, 5, 10, 15, 20].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiscountPct(d)}
                    className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold ${
                      discountPct === d
                        ? 'bg-mintcom-green text-white'
                        : 'bg-cream-100 text-text-secondary dark:bg-white/5 dark:text-mintcom-textSecondary'
                    }`}
                  >
                    {d === 0 ? '0%' : `${d}%`}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showNote && !empty && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <input
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Order note (e.g. extra napkins)…"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-cream-50 px-3 py-2 text-xs outline-none focus:border-mintcom-green dark:border-mintcom-tertiary dark:bg-mintcom-dark dark:text-white"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Order type — tinted chips like POS */}
      <div className="flex gap-1.5 border-b border-gray-100 px-3 py-2 dark:border-white/8">
        {(
          [
            { id: 'dine-in' as const, label: 'Dine in' },
            { id: 'takeaway' as const, label: 'Takeaway' },
            { id: 'delivery' as const, label: 'Delivery' },
          ] as const
        ).map((t) => {
          const on = orderType === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setOrderType(t.id)}
              className={`flex-1 rounded-xl border py-2 text-[11px] font-bold transition-colors ${
                on
                  ? 'border-mintcom-green bg-mintcom-green/15 text-mintcom-green'
                  : 'border-gray-200 bg-transparent text-text-secondary hover:border-mintcom-green/30 dark:border-mintcom-tertiary dark:text-mintcom-textSecondary'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Lines */}
      <div className={`min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3 ${compact ? 'max-h-[36vh]' : ''}`}>
        {empty ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center">
            <ShoppingBag className="mb-2 text-mintcom-green/50" size={28} />
            <p className="text-sm font-bold text-text-secondary dark:text-mintcom-textSecondary">Cart is empty</p>
            <p className="mt-1 max-w-[200px] text-[11px] text-text-tertiary dark:text-mintcom-gray">
              Tap products on the menu to build the order
            </p>
          </div>
        ) : (
          cart.map((line) => (
            <div
              key={line.id}
              className="rounded-2xl border border-gray-100 bg-cream-50 p-2.5 dark:border-white/8 dark:bg-mintcom-dark"
            >
              <div className="flex items-start gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm dark:bg-mintcom-surface">
                  {line.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-xs font-bold text-text-primary dark:text-white">{line.name}</p>
                    <p className="shrink-0 text-xs font-black tabular-nums text-text-primary dark:text-white">
                      {money(line.unitPrice * line.qty)}
                    </p>
                  </div>
                  {line.addons.length > 0 && (
                    <p className="mt-0.5 truncate text-[10px] text-text-tertiary dark:text-mintcom-gray">
                      +{' '}
                      {line.addons
                        .map((a) => (a.price > 0 ? `${a.name} (${money(a.price)})` : a.name))
                        .join(' · ')}
                    </p>
                  )}
                  <div className="mt-1.5 inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5 dark:border-white/10 dark:bg-mintcom-surface">
                    <button
                      type="button"
                      onClick={() => onChangeQty(line.id, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-text-secondary hover:bg-cream-100 dark:hover:bg-white/10"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-[11px] font-bold tabular-nums">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => onChangeQty(line.id, 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-text-secondary hover:bg-cream-100 dark:hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {orderNote && (
          <p className="rounded-xl bg-mintcom-yellow/10 px-2.5 py-1.5 text-[10px] font-medium text-text-secondary dark:text-mintcom-textSecondary">
            📝 {orderNote}
          </p>
        )}
      </div>

      {/* Totals + Cash / Card / Other */}
      <div className="border-t border-gray-100 px-3 py-3 dark:border-white/8">
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-text-tertiary dark:text-mintcom-gray">
          <span>{itemCount} item{itemCount === 1 ? '' : 's'}</span>
        </div>
        <div className="space-y-0.5 text-[11px]">
          <Row label="Subtotal" value={money(subtotal)} />
          {discountPct > 0 && <Row label={`Discount ${discountPct}%`} value={`−${money(discount)}`} />}
          <Row label="Tax 8%" value={money(tax)} />
          <div className="flex justify-between pt-1 text-sm font-black text-text-primary dark:text-white">
            <span>Total</span>
            <span className="tabular-nums text-mintcom-green">{money(total)}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <PayTile
            disabled={empty}
            onClick={onPayCash}
            icon={<span className="text-base">💵</span>}
            label="Cash"
          />
          <PayTile
            disabled={empty}
            onClick={onPayCard}
            icon={<CreditCard size={16} className="text-mintcom-green" />}
            label="Card"
          />
          <PayTile
            disabled={empty}
            onClick={onPayOther}
            icon={<Wallet size={16} className="text-mintcom-green" />}
            label="Other"
          />
        </div>
      </div>
    </aside>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  active,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm transition-transform active:scale-95 ${
        danger
          ? 'bg-mintcom-red'
          : active
            ? 'bg-mintcom-greenDark'
            : 'bg-mintcom-green'
      }`}
    >
      {children}
    </button>
  );
}

function PayTile({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-2xl border border-mintcom-green/50 bg-mintcom-green/10 py-2.5 transition-all hover:bg-mintcom-green/20 disabled:opacity-35"
    >
      {icon}
      <span className="text-[11px] font-bold text-text-primary dark:text-white">{label}</span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-text-secondary dark:text-mintcom-textSecondary">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function DemoChrome({
  staff,
  timeLabel,
  flash,
  onExit,
}: {
  staff?: Staff | null;
  timeLabel?: string;
  flash?: string | null;
  onExit: (() => void) | null;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white/90 px-3 py-2 backdrop-blur-xl dark:border-mintcom-tertiary dark:bg-mintcom-surface/90 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-text-secondary transition-colors hover:bg-cream-100 hover:text-mintcom-green dark:text-mintcom-textSecondary dark:hover:bg-white/10"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Website</span>
        </Link>
        <div className="hidden h-4 w-px bg-gray-200 dark:bg-mintcom-tertiary sm:block" />
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mintcom-green" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-text-primary dark:text-white sm:text-sm">
              Mintcom POS · Demo
            </p>
            <p className="truncate text-[10px] text-text-tertiary dark:text-mintcom-gray">
              Sandbox · matches live sales screen
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {flash && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="hidden rounded-full bg-mintcom-green px-2.5 py-0.5 text-[10px] font-black text-white sm:inline"
            >
              {flash}
            </motion.span>
          )}
        </AnimatePresence>
        {staff && (
          <span className="hidden items-center gap-1.5 rounded-full border border-gray-200 bg-cream-50 px-2.5 py-1 text-[11px] font-bold dark:border-white/10 dark:bg-mintcom-dark sm:inline-flex">
            {staff.emoji} {staff.name}
          </span>
        )}
        {timeLabel && (
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-cream-50 px-2.5 py-1 text-[11px] font-semibold text-text-secondary dark:border-white/10 dark:bg-mintcom-dark dark:text-mintcom-textSecondary">
            <Clock size={12} className="text-mintcom-green" />
            {timeLabel}
          </span>
        )}
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-bold text-text-secondary hover:bg-cream-100 dark:border-white/10 dark:text-mintcom-textSecondary dark:hover:bg-white/10"
          >
            Exit
          </button>
        )}
      </div>
    </header>
  );
}

function orderTypeLabel(t: OrderType) {
  if (t === 'dine-in') return 'Dine in';
  if (t === 'takeaway') return 'Takeaway';
  return 'Delivery';
}

function payMethodLabel(m: PayMethod | null) {
  if (m === 'cash') return 'Cash';
  if (m === 'card') return 'Card';
  if (m === 'cliq') return 'CliQ';
  if (m === 'talabat') return 'Talabat';
  if (m === 'voucher') return 'Voucher';
  return '—';
}
