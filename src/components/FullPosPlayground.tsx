import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  Pause,
  Percent,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  SplitSquareHorizontal,
  Star,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { Logo } from './Logo';
import {
  DemoDashboardScreen,
  DemoNotificationsScreen,
  DemoReportsScreen,
  DemoSettingsScreen,
  DemoSupportScreen,
  emptyShift,
  type DemoShift,
} from './pos-demo/PosDemoExtraScreens';

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
  /** Table number or guest nickname — like real POS holdOrder nickname */
  label: string;
  at: number;
};

const HOLD_TABLE_COUNT = 12;
type OrderType = 'dine-in' | 'takeaway' | 'delivery';
type PayMethod = 'cash' | 'card' | 'cliq' | 'talabat' | 'voucher' | 'split';
type CheckoutTab = 'cash' | 'card' | 'other' | 'split';
type Phase = 'welcome' | 'pin' | 'app';
type Screen =
  | 'dashboard'
  | 'sales'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'support';
type Staff = { id: string; name: string; role: string; pin: string; emoji: string };

const NAV_ITEMS: {
  id: Screen;
  label: string;
  short: string;
  icon: typeof LayoutGrid;
  badge?: 'alerts';
}[] = [
  { id: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales', short: 'Sales', icon: LayoutGrid },
  { id: 'reports', label: 'Reports', short: 'Reports', icon: BarChart3 },
  { id: 'notifications', label: 'Alerts', short: 'Alerts', icon: Bell, badge: 'alerts' },
  { id: 'settings', label: 'Settings', short: 'Settings', icon: Settings },
  { id: 'support', label: 'Support', short: 'Help', icon: HelpCircle },
];

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

export function FullPosPlayground() {
  const products = useMemo(() => buildCatalog(), []);
  const [phase, setPhase] = useState<Phase>('welcome');
  const [screen, setScreen] = useState<Screen>('dashboard');
  const notifUnread = 3; // seed unread stock/system alerts in notifications center
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
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const [paymentTab, setPaymentTab] = useState<CheckoutTab>('cash');
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
  const [shift, setShift] = useState<DemoShift>(() => emptyShift());
  const [now, setNow] = useState(() => new Date());
  const [flash, setFlash] = useState<string | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  /** When true, Dashboard auto-opens the Open Shift amount popup */
  const [promptOpenShift, setPromptOpenShift] = useState(false);
  /** After opening shift from a blocked payment, return here with cart intact */
  const [returnToSalesAfterShift, setReturnToSalesAfterShift] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);

  const shiftOrders = shift.orders;
  const shiftRevenue = shift.cashSales + shift.cardSales + shift.otherSales;

  /** Block only at checkout — sales browsing & adding items is always allowed */
  const requireOpenShiftForPayment = () => {
    if (shift.open) return true;
    setScreen('dashboard');
    setPromptOpenShift(true);
    setReturnToSalesAfterShift(true);
    setShowPaymentPanel(false);
    setMobileCartOpen(false);
    ping('Open a shift to take payment');
    return false;
  };

  /** Open payment panel with order summary (like POS PaymentPanel) */
  const openPayment = (tab: CheckoutTab) => {
    if (!cart.length) return;
    if (!requireOpenShiftForPayment()) return;
    setPaymentTab(tab);
    setShowPaymentPanel(true);
    setMobileCartOpen(false);
  };

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Lock document to a true full-screen POS shell (no body/page scroll)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
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

  const openHoldModal = () => {
    if (!cart.length) return;
    setShowHoldModal(true);
  };

  const confirmHold = (label: string) => {
    if (!cart.length || !label.trim()) return;
    const name = label.trim();
    setHeld((h) => [
      {
        id: `h-${Date.now()}`,
        orderNo,
        type: orderType,
        lines: cart,
        discountPct,
        note: orderNote,
        label: name,
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
    setShowHoldModal(false);
    setMobileCartOpen(false);
    ping(`Held · ${name}`);
  };

  const resumeHeld = (ticket: HeldTicket) => {
    if (cart.length) {
      // Park current ticket with a temp label so resume never loses it
      setHeld((h) => [
        {
          id: `h-${Date.now()}`,
          orderNo,
          type: orderType,
          lines: cart,
          discountPct,
          note: orderNote,
          label: `Parked #${orderNo}`,
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
    ping(`Resumed · ${ticket.label}`);
  };

  const usedHoldLabels = useMemo(
    () => held.map((h) => h.label),
    [held],
  );

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
    setScreen('dashboard');
  };

  const finalizeSale = (
    method: PayMethod,
    methodLabel: string,
    amounts: { cash: number; card: number; other: number },
  ) => {
    if (!cart.length) return;
    if (!requireOpenShiftForPayment()) return;
    setPayMethod(method);
    const methodBucket: 'cash' | 'card' | 'other' =
      method === 'cash' ? 'cash' : method === 'card' ? 'card' : method === 'split' ? 'other' : 'other';
    // For split, bucket is mixed — track real amounts from `amounts`
    const itemsLabel = cart.map((l) => `${l.emoji} ${l.name}${l.qty > 1 ? ` ×${l.qty}` : ''}`).join(' · ');
    const saleId = `sale-${Date.now()}`;
    const thisOrderNo = orderNo;

    setShift((s) => ({
      ...s,
      orders: s.orders + 1,
      cashSales: s.cashSales + amounts.cash,
      cardSales: s.cardSales + amounts.card,
      otherSales: s.otherSales + amounts.other,
      sales: [
        {
          id: saleId,
          orderNo: thisOrderNo,
          total,
          method: method === 'split' ? 'other' : methodBucket,
          methodLabel,
          items: itemsLabel,
          at: Date.now(),
        },
        ...s.sales,
      ].slice(0, 40),
    }));

    setLastReceipt({
      lines: cart,
      total,
      method,
      orderNo: thisOrderNo,
      type: orderType,
      discountPct,
      discount,
      tax,
      subtotal,
    });
    setShowReceipt(true);
    setShowPaymentPanel(false);
    setCart([]);
    setDiscountPct(0);
    setOrderNote('');
    setLoyaltyName(null);
    setOrderNo((n) => n + 1);
    setMobileCartOpen(false);
  };

  const openShift = (openingCash: number) => {
    setShift({
      ...emptyShift(),
      open: true,
      openingCash,
      startedAt: Date.now(),
    });
    setPromptOpenShift(false);
    ping(`Shift open · ${money(openingCash)}`);
    // If they were blocked at payment, return to sales with cart still there
    if (returnToSalesAfterShift) {
      setReturnToSalesAfterShift(false);
      setScreen('sales');
    }
  };

  const closeShift = (_actualCash: number) => {
    setShift(emptyShift());
    ping('Shift closed');
  };

  const recordPayInOut = (type: 'in' | 'out', amount: number, reason: string) => {
    setShift((s) => ({
      ...s,
      payIn: s.payIn + (type === 'in' ? amount : 0),
      payOut: s.payOut + (type === 'out' ? amount : 0),
      movements: [
        { id: `m-${Date.now()}`, type, amount, reason, at: Date.now() },
        ...s.movements,
      ],
    }));
    ping(type === 'in' ? `Cash in ${money(amount)}` : `Cash out ${money(amount)}`);
  };

  const clockOut = () => {
    setStaff(null);
    setCart([]);
    setHeld([]);
    setShift(emptyShift());
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
      <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-cream-50 dark:bg-mintcom-dark">
        <DemoChrome onExit={null} />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-5 py-6 text-center">
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
            Full POS sandbox — dashboard, sales, reports, notifications, settings, and support. Same
            flow cashiers use. Nothing is saved.
          </p>
          <div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-2 sm:grid-cols-3">
            {['Dashboard', 'Sales screen', 'Reports', 'Notifications', 'Settings', 'Support'].map((label) => (
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
      <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-cream-50 dark:bg-mintcom-dark">
        <DemoChrome onExit={null} />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-5 py-4">
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
                    setScreen('dashboard');
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
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-cream-50 text-text-primary dark:bg-mintcom-dark dark:text-white">
      <DemoChrome
        staff={staff}
        timeLabel={timeLabel}
        flash={flash}
        onExit={clockOut}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Side rail — like POS main nav */}
        <nav className="hidden h-full w-[76px] shrink-0 flex-col items-center gap-0.5 overflow-hidden border-e border-gray-200 bg-white py-2 dark:border-mintcom-tertiary dark:bg-mintcom-surface sm:flex">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-mintcom-green/15">
            <Logo variant="icon" size="sm" />
          </div>
          {NAV_ITEMS.map((item) => {
            const on = screen === item.id;
            const Icon = item.icon;
            const badge = item.badge === 'alerts' ? held.length + notifUnread : 0;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                onClick={() => setScreen(item.id)}
                className={`relative flex w-[60px] flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[9px] font-bold transition-colors ${
                  on
                    ? 'bg-mintcom-green text-white shadow-md shadow-mintcom-green/25'
                    : 'text-text-secondary hover:bg-mintcom-green/10 hover:text-mintcom-green dark:text-mintcom-textSecondary'
                }`}
              >
                <Icon size={17} />
                {item.short}
                {badge > 0 && (
                  <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mintcom-red px-1 text-[9px] font-black text-white">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="mt-auto flex flex-col items-center gap-1 px-1 pb-1 text-center">
            <span className="text-lg">{staff?.emoji}</span>
            <span className="text-[9px] font-bold text-text-tertiary dark:text-mintcom-gray">{staff?.name}</span>
          </div>
        </nav>

        {/* Mobile bottom tabs — inside shell (not fixed) so height math stays 100dvh */}
        <div className="absolute inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-mintcom-tertiary dark:bg-mintcom-surface/95 sm:hidden">
          {(
            [
              { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Home' },
              { id: 'sales' as const, icon: LayoutGrid, label: 'Sales' },
              { id: 'reports' as const, icon: BarChart3, label: 'Reports' },
              { id: 'notifications' as const, icon: Bell, label: 'Alerts' },
              { id: 'settings' as const, icon: Settings, label: 'More' },
            ] as const
          ).map((item) => {
            const on =
              screen === item.id ||
              (item.id === 'settings' && (screen === 'settings' || screen === 'support'));
            const Icon = item.icon;
            const badge = item.id === 'notifications' ? held.length + notifUnread : 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'settings' && screen === 'settings') return;
                  setScreen(item.id === 'settings' ? 'settings' : item.id);
                }}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-bold ${
                  on ? 'text-mintcom-green' : 'text-text-secondary dark:text-mintcom-textSecondary'
                }`}
              >
                <Icon size={17} />
                {item.label}
                {badge > 0 && (
                  <span className="absolute end-[18%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mintcom-red px-1 text-[9px] text-white">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
          {screen === 'sales' && (
            <button
              type="button"
              onClick={() => setMobileCartOpen(true)}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-bold text-text-secondary dark:text-mintcom-textSecondary"
            >
              <ShoppingBag size={17} />
              Cart
              {itemCount > 0 && (
                <span className="absolute end-[18%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mintcom-green px-1 text-[9px] font-black text-white">
                  {itemCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Main column (secondary chips + screen content) */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-[52px] sm:pb-0">
        {/* Mobile secondary destinations */}
        {(screen === 'settings' || screen === 'support') && (
          <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-gray-200 bg-white px-3 py-1.5 dark:border-mintcom-tertiary dark:bg-mintcom-surface sm:hidden">
            {(
              [
                { id: 'settings' as const, label: 'Settings' },
                { id: 'support' as const, label: 'Support' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setScreen(t.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                  screen === t.id
                    ? 'bg-mintcom-green text-white'
                    : 'bg-cream-100 text-text-secondary dark:bg-mintcom-dark dark:text-mintcom-textSecondary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Content — always fills remaining height */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {screen === 'dashboard' && (
            <DemoDashboardScreen
              staff={staff}
              shift={shift}
              onOpenShift={openShift}
              onCloseShift={closeShift}
              onPayInOut={recordPayInOut}
              onGoSales={() => setScreen('sales')}
              onGoOrders={() => setScreen('reports')}
              autoOpenShiftModal={promptOpenShift}
              onAutoOpenShiftModalHandled={() => setPromptOpenShift(false)}
            />
          )}

          {screen === 'reports' && <DemoReportsScreen shift={shift} />}
          {screen === 'notifications' && (
            <DemoNotificationsScreen
              held={held}
              staffName={staff?.name}
              onResumeHeld={(ticket) => {
                // Map DemoHeldTicket shape → HeldTicket used in playground state
                const full = held.find((h) => h.id === ticket.id);
                if (full) resumeHeld(full);
              }}
              onDismissHeld={(id) => {
                setHeld((list) => list.filter((h) => h.id !== id));
                ping('Held order dismissed');
              }}
            />
          )}
          {screen === 'settings' && <DemoSettingsScreen />}
          {screen === 'support' && <DemoSupportScreen />}

          {screen === 'sales' && (
            <>
              {/* Menu pane ~2.3 */}
              <section className="flex h-full min-h-0 min-w-0 flex-[2.3] flex-col overflow-hidden bg-cream-50 dark:bg-mintcom-dark">
                {/* Sales header */}
                <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 dark:border-mintcom-tertiary dark:bg-mintcom-surface sm:px-4">
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

                {/* Product grid — fills remaining height; internal scroll only if many products */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
                  <div className="grid h-full auto-rows-fr grid-cols-2 gap-2 xs:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                    {visible.map((p) => (
                      <motion.button
                        key={p.id}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => openItem(p)}
                        className="group relative flex min-h-[110px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-start shadow-sm transition-shadow hover:shadow-md dark:border-white/8 dark:bg-mintcom-surface sm:min-h-[130px]"
                      >
                        {lastAdded === p.id && (
                          <span className="absolute end-2 top-2 z-10 rounded-full bg-mintcom-green px-1.5 py-0.5 text-[9px] font-black text-white">
                            +1
                          </span>
                        )}
                        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-gradient-to-br from-mintcom-greenTint to-cream-100 dark:from-mintcom-green/10 dark:to-mintcom-dark">
                          <span className="text-3xl sm:text-4xl">{p.emoji}</span>
                          <span className="absolute bottom-1.5 end-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-mintcom-green text-white shadow-md shadow-mintcom-green/30 transition-transform group-hover:scale-110 sm:h-8 sm:w-8">
                            <Plus size={14} strokeWidth={3} />
                          </span>
                          {!!p.attributes?.length && (
                            <span className="absolute start-1.5 top-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[8px] font-bold text-text-secondary shadow-sm dark:bg-mintcom-dark/80 dark:text-mintcom-textSecondary">
                              Options
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col gap-0.5 p-2">
                          <p className="line-clamp-1 text-[11px] font-bold leading-snug text-text-primary dark:text-white sm:text-xs">
                            {p.name}
                          </p>
                          <p className="text-xs font-black tabular-nums text-mintcom-green sm:text-sm">{money(p.price)}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  {visible.length === 0 && (
                    <p className="py-10 text-center text-sm text-text-tertiary dark:text-mintcom-gray">
                      No products match your search
                    </p>
                  )}
                </div>
              </section>

              {/* Order pane ~1.2 — desktop always; mobile sheet */}
              <OrderPanel
                className="hidden h-full w-full max-w-none flex-[1.2] overflow-hidden border-s border-gray-200 bg-white dark:border-mintcom-tertiary dark:bg-mintcom-surface lg:flex"
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
                onHold={openHoldModal}
                onClear={clearOrder}
                onLoyalty={() => setShowLoyalty(true)}
                onChangeQty={changeQty}
                onPayCash={() => openPayment('cash')}
                onPayCard={() => openPayment('card')}
                onPayOther={() => openPayment('other')}
                onPaySplit={() => openPayment('split')}
              />
            </>
          )}

        </div>
        </div>

        {/* Hold order modal — table grid or nickname like real POS HoldOrderModal */}
        <AnimatePresence>
          {showHoldModal && (
            <HoldOrderModal
              usedLabels={usedHoldLabels}
              tableCount={HOLD_TABLE_COUNT}
              itemCount={itemCount}
              orderTotal={total}
              onCancel={() => setShowHoldModal(false)}
              onHold={confirmHold}
            />
          )}
        </AnimatePresence>

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
                  onHold={openHoldModal}
                  onClear={clearOrder}
                  onLoyalty={() => setShowLoyalty(true)}
                  onChangeQty={changeQty}
                  onPayCash={() => openPayment('cash')}
                  onPayCard={() => openPayment('card')}
                  onPayOther={() => openPayment('other')}
                  onPaySplit={() => openPayment('split')}
                  compact
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment panel — order summary + Cash / Card / Other / Split */}
        <AnimatePresence>
          {showPaymentPanel && (
            <PaymentCheckoutPanel
              cart={cart}
              orderNo={orderNo}
              orderType={orderType}
              subtotal={subtotal}
              discount={discount}
              discountPct={discountPct}
              tax={tax}
              total={total}
              initialTab={paymentTab}
              onClose={() => setShowPaymentPanel(false)}
              onComplete={finalizeSale}
            />
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
  onPaySplit,
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
  onPaySplit: () => void;
  compact?: boolean;
}) {
  const empty = cart.length === 0;
  // Accordion expand like POS OrderSummaryPanel — one open at a time
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((cur) => (cur === id ? null : id));
  };

  return (
    <aside className={`flex h-full min-h-0 flex-col overflow-hidden ${className}`}>
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
      <div className={`min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-2 ${compact ? '' : ''}`}>
        {empty ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center">
            <ShoppingBag className="mb-2 text-mintcom-green/50" size={28} />
            <p className="text-sm font-bold text-text-secondary dark:text-mintcom-textSecondary">Cart is empty</p>
            <p className="mt-1 max-w-[200px] text-[11px] text-text-tertiary dark:text-mintcom-gray">
              Tap products on the menu to build the order
            </p>
          </div>
        ) : (
          cart.map((line) => {
            const expanded = expandedId === line.id;
            const lineTotal = line.unitPrice * line.qty;
            return (
              <div
                key={line.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-cream-100 dark:border-white/10 dark:bg-mintcom-dark"
              >
                {/* Collapsed header — tap to expand like POS SwipeableOrderItem */}
                <button
                  type="button"
                  onClick={() => toggleExpand(line.id)}
                  className="flex w-full items-center gap-2 p-2.5 text-start"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm dark:bg-mintcom-surface">
                    {line.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-text-primary dark:text-white">{line.name}</p>
                    {line.addons.length > 0 && (
                      <p className="mt-0.5 truncate text-[10px] text-text-tertiary dark:text-mintcom-gray">
                        + {line.addons.map((a) => a.name).join(' · ')}
                      </p>
                    )}
                    {line.note && (
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-text-secondary dark:text-mintcom-textSecondary">
                        📝 {line.note}
                      </p>
                    )}
                    <p className="mt-0.5 text-sm font-black tabular-nums text-text-primary dark:text-white">
                      {money(lineTotal)}
                    </p>
                  </div>
                  <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-mintcom-green px-1.5 text-[11px] font-black text-white">
                    ×{line.qty}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-white/10 dark:bg-mintcom-surface">
                    <ChevronDown
                      size={16}
                      className={`text-text-tertiary transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                {/* Expanded body — base, attributes, qty, note, total, remove */}
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 border-t border-gray-200/80 px-2.5 pb-2.5 pt-2 dark:border-white/8">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-text-tertiary">Base price</span>
                          <span className="font-bold tabular-nums text-text-primary dark:text-white">
                            {money(line.basePrice)}
                          </span>
                        </div>

                        {line.addons.length > 0 && (
                          <div className="rounded-xl border border-mintcom-green/25 bg-mintcom-green/10 px-2.5 py-2">
                            <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-mintcom-green">
                              Selected options
                            </p>
                            <div className="space-y-1">
                              {line.addons.map((a) => (
                                <div key={a.id} className="flex items-center justify-between text-[11px]">
                                  <span className="font-medium text-text-primary dark:text-white">• {a.name}</span>
                                  <span className="font-bold tabular-nums text-mintcom-green">
                                    {a.price > 0 ? `+${money(a.price)}` : 'Free'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-text-tertiary">Quantity</span>
                          <div className="inline-flex items-center gap-0.5 rounded-xl border border-gray-200 bg-white p-0.5 dark:border-white/10 dark:bg-mintcom-surface">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onChangeQty(line.id, -1);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-text-secondary hover:bg-cream-100 dark:hover:bg-white/10"
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-sm font-black tabular-nums text-text-primary dark:text-white">
                              {line.qty}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onChangeQty(line.id, 1);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-mintcom-green text-sm font-bold text-white"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {line.note && (
                          <div className="rounded-xl border border-mintcom-green/20 bg-mintcom-green/5 px-2.5 py-1.5 text-[11px] text-text-primary dark:text-white">
                            {line.note}
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-gray-200/80 pt-2 dark:border-white/8">
                          <span className="text-xs font-black text-text-primary dark:text-white">Item total</span>
                          <span className="text-sm font-black tabular-nums text-mintcom-green">{money(lineTotal)}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Remove line by stepping qty to 0
                            onChangeQty(line.id, -line.qty);
                            if (expandedId === line.id) setExpandedId(null);
                          }}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-mintcom-red py-2 text-[11px] font-black text-white"
                        >
                          <Trash2 size={13} /> Remove item
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
        {orderNote && (
          <p className="rounded-xl bg-mintcom-yellow/10 px-2.5 py-1.5 text-[10px] font-medium text-text-secondary dark:text-mintcom-textSecondary">
            📝 {orderNote}
          </p>
        )}
      </div>

      {/* Totals + Cash / Card / Other / Split */}
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

        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
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
          <PayTile
            disabled={empty}
            onClick={onPaySplit}
            icon={<SplitSquareHorizontal size={16} className="text-mintcom-green" />}
            label="Split"
          />
        </div>
      </div>
    </aside>
  );
}

/** Mirrors mintcom-pos HoldOrderModal — table dropdown or guest nickname */
function HoldOrderModal({
  usedLabels,
  tableCount,
  itemCount,
  orderTotal,
  onCancel,
  onHold,
}: {
  usedLabels: string[];
  tableCount: number;
  itemCount: number;
  orderTotal: number;
  onCancel: () => void;
  onHold: (label: string) => void;
}) {
  const [selectedTable, setSelectedTable] = useState('');
  const [nickname, setNickname] = useState('');
  const [tableOpen, setTableOpen] = useState(false);

  const tables = useMemo(() => {
    return Array.from({ length: tableCount }, (_, i) => {
      const name = `Table ${i + 1}`;
      const used = usedLabels.some((u) => u.toLowerCase() === name.toLowerCase());
      return { name, num: i + 1, used };
    });
  }, [tableCount, usedLabels]);

  const freeCount = tables.filter((t) => !t.used).length;
  const busyCount = tables.filter((t) => t.used).length;
  const holdLabel = selectedTable || nickname.trim();
  const canHold = holdLabel.length > 0;
  const nicknameMode = nickname.trim() !== '';

  const clearTable = () => {
    setSelectedTable('');
    setTableOpen(false);
  };

  const pickTable = (name: string) => {
    // Tap same table again to unselect
    if (selectedTable === name) {
      clearTable();
      return;
    }
    setSelectedTable(name);
    setNickname('');
    setTableOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 32, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl dark:border-mintcom-tertiary dark:bg-mintcom-surface"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/8">
          <div>
            <p className="text-sm font-black text-text-primary dark:text-white">Hold order</p>
            <p className="text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
              Select a table or enter a name · {itemCount} items · {money(orderTotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100 dark:bg-white/10"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <p className="text-xs font-bold text-text-secondary dark:text-mintcom-textSecondary">
            Choose a free table or type a guest nickname
          </p>

          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mintcom-green/15 px-2.5 py-1 text-[10px] font-bold text-mintcom-green">
              <span className="h-1.5 w-1.5 rounded-full bg-mintcom-green" />
              {freeCount} free
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mintcom-red/10 px-2.5 py-1 text-[10px] font-bold text-mintcom-red">
              <span className="h-1.5 w-1.5 rounded-full bg-mintcom-red" />
              {busyCount} held
            </span>
          </div>

          {/* Table dropdown */}
          <div className={nicknameMode ? 'opacity-45' : ''}>
            <p className="mb-1.5 text-[11px] font-bold text-text-primary dark:text-white">Table number</p>
            <div className="relative">
              <button
                type="button"
                disabled={nicknameMode}
                onClick={() => !nicknameMode && setTableOpen((v) => !v)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-start text-sm font-bold transition-colors ${
                  tableOpen
                    ? 'border-mintcom-green bg-mintcom-green/5'
                    : 'border-gray-200 bg-cream-50 dark:border-white/10 dark:bg-mintcom-dark'
                } ${nicknameMode ? 'cursor-not-allowed' : ''}`}
              >
                <span
                  className={
                    selectedTable ? 'text-text-primary dark:text-white' : 'text-text-tertiary dark:text-mintcom-gray'
                  }
                >
                  {selectedTable || 'Select a table…'}
                </span>
                <span className="flex items-center gap-1">
                  {selectedTable && !nicknameMode && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        clearTable();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          clearTable();
                        }
                      }}
                      className="rounded-md p-1 text-text-tertiary hover:bg-white hover:text-mintcom-red dark:hover:bg-white/10"
                      aria-label="Clear table"
                    >
                      <X size={14} />
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className={`text-text-tertiary transition-transform ${tableOpen ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>

              <AnimatePresence>
                {tableOpen && !nicknameMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-48 overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-xl dark:border-mintcom-tertiary dark:bg-mintcom-surface"
                  >
                    {tables.map((t) => {
                      const selected = selectedTable === t.name;
                      return (
                        <button
                          key={t.name}
                          type="button"
                          disabled={t.used}
                          onClick={() => pickTable(t.name)}
                          className={`flex w-full items-center justify-between px-3 py-2.5 text-start text-sm font-bold transition-colors ${
                            t.used
                              ? 'cursor-not-allowed text-mintcom-red/70'
                              : selected
                                ? 'bg-mintcom-green/15 text-mintcom-green'
                                : 'text-text-primary hover:bg-cream-50 dark:text-white dark:hover:bg-white/5'
                          }`}
                        >
                          <span>{t.name}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wide">
                            {t.used ? 'Held' : selected ? 'Selected · tap to clear' : 'Free'}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {selectedTable && (
              <p className="mt-1.5 text-[10px] text-text-tertiary">
                Tap the × or the same table again to unselect and type a nickname
              </p>
            )}
          </div>

          {/* Nickname */}
          <div className={selectedTable ? 'opacity-45' : ''}>
            <p className="mb-1.5 text-[11px] font-bold text-text-primary dark:text-white">
              Or enter a nickname
            </p>
            <div className="relative">
              <input
                value={nickname}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 40);
                  setNickname(v);
                  if (v.trim()) {
                    setSelectedTable('');
                    setTableOpen(false);
                  }
                }}
                onFocus={() => {
                  // Typing a name takes priority — clear table so field is active
                  if (selectedTable) clearTable();
                }}
                placeholder="e.g. Sara, Uber Eats, Walk-in"
                maxLength={40}
                className="w-full rounded-2xl border border-gray-200 bg-cream-50 px-3 py-2.5 pe-9 text-sm font-medium outline-none focus:border-mintcom-green dark:border-mintcom-tertiary dark:bg-mintcom-dark dark:text-white"
              />
              {nickname && (
                <button
                  type="button"
                  onClick={() => setNickname('')}
                  className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-tertiary hover:bg-white dark:hover:bg-white/10"
                  aria-label="Clear nickname"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {nickname.trim() && (
              <p className="mt-1 text-[10px] text-text-tertiary">Clear the name to pick a table instead</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-gray-100 p-4 dark:border-white/8">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-bold text-text-secondary dark:border-white/10 dark:text-mintcom-textSecondary"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canHold}
            onClick={() => canHold && onHold(holdLabel)}
            className="flex-1 rounded-xl bg-mintcom-green py-3 text-xs font-black text-white disabled:opacity-40"
          >
            Hold · {canHold ? holdLabel : '…'}
          </button>
        </div>
      </motion.div>
    </motion.div>
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
  if (m === 'split') return 'Split';
  return '—';
}

/** Payment checkout — order summary + Cash / Card / Other / Split (like POS PaymentPanel) */
function PaymentCheckoutPanel({
  cart,
  orderNo,
  orderType,
  subtotal,
  discount,
  discountPct,
  tax,
  total,
  initialTab,
  onClose,
  onComplete,
}: {
  cart: CartLine[];
  orderNo: number;
  orderType: OrderType;
  subtotal: number;
  discount: number;
  discountPct: number;
  tax: number;
  total: number;
  initialTab: CheckoutTab;
  onClose: () => void;
  onComplete: (
    method: PayMethod,
    methodLabel: string,
    amounts: { cash: number; card: number; other: number },
  ) => void;
}) {
  const [tab, setTab] = useState<CheckoutTab>(initialTab);
  const [tenderedCents, setTenderedCents] = useState(() => Math.round(total * 100));
  const [cardBrand, setCardBrand] = useState<'Visa' | 'Mastercard' | 'Amex'>('Visa');
  const [otherId, setOtherId] = useState<'cliq' | 'talabat' | 'voucher'>('cliq');
  const [splitParts, setSplitParts] = useState(2);
  const [splitMethods, setSplitMethods] = useState<Array<'cash' | 'card' | 'other'>>(['cash', 'card']);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setTenderedCents(Math.round(total * 100));
  }, [total]);

  useEffect(() => {
    setSplitMethods((prev) => {
      const next = [...prev];
      while (next.length < splitParts) next.push(next.length % 2 === 0 ? 'cash' : 'card');
      return next.slice(0, splitParts);
    });
  }, [splitParts]);

  const tendered = tenderedCents / 100;
  const change = Math.max(0, tendered - total);
  const short = tendered < total;

  const equalShare = total / splitParts;
  const splitShares = Array.from({ length: splitParts }, (_, i) => {
    if (i === splitParts - 1) {
      return Math.round((total - equalShare * (splitParts - 1)) * 100) / 100;
    }
    return Math.round(equalShare * 100) / 100;
  });

  const typeLabel =
    orderType === 'dine-in' ? 'Dine in' : orderType === 'takeaway' ? 'Takeaway' : 'Delivery';

  const confirmCash = () => {
    if (short) return;
    onComplete('cash', 'Cash', { cash: total, card: 0, other: 0 });
  };
  const confirmCard = () => {
    onComplete('card', `Card · ${cardBrand}`, { cash: 0, card: total, other: 0 });
  };
  const confirmOther = () => {
    const label = otherId === 'cliq' ? 'CliQ' : otherId === 'talabat' ? 'Talabat' : 'Voucher';
    onComplete(otherId, label, { cash: 0, card: 0, other: total });
  };
  const confirmSplit = () => {
    const amounts = { cash: 0, card: 0, other: 0 };
    splitShares.forEach((amt, i) => {
      const m = splitMethods[i] ?? 'cash';
      amounts[m] += amt;
    });
    const label = `Split ×${splitParts} (${splitMethods
      .map((m, i) => `${m} ${money(splitShares[i])}`)
      .join(' + ')})`;
    onComplete('split', label, amounts);
  };

  const appendDigit = (d: string) => {
    if (d === '⌫') {
      setTenderedCents((c) => Math.floor(c / 10));
      return;
    }
    if (d === 'C') {
      setTenderedCents(0);
      return;
    }
    if (d === 'Exact') {
      setTenderedCents(Math.round(total * 100));
      return;
    }
    setTenderedCents((c) => Math.min(99999999, c * 10 + Number(d)));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[75] flex items-end justify-center bg-black/55 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 28, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl dark:border-mintcom-tertiary dark:bg-mintcom-surface lg:flex-row"
      >
        {/* Order summary */}
        <div className="flex min-h-0 w-full flex-col border-b border-gray-100 dark:border-white/8 lg:w-[42%] lg:border-b-0 lg:border-e">
          <div className="flex shrink-0 items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-black text-text-primary dark:text-white">Order summary</p>
              <p className="text-[11px] text-text-secondary dark:text-mintcom-textSecondary">
                #{orderNo} · {typeLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100 lg:hidden dark:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 pb-2">
            {cart.map((line) => (
              <div
                key={line.id}
                className="flex items-start gap-2 rounded-xl bg-cream-50 px-2.5 py-2 dark:bg-mintcom-dark"
              >
                <span className="text-lg">{line.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-text-primary dark:text-white">
                    {line.name} ×{line.qty}
                  </p>
                  {line.addons.length > 0 && (
                    <p className="truncate text-[10px] text-text-tertiary">
                      + {line.addons.map((a) => a.name).join(' · ')}
                    </p>
                  )}
                </div>
                <span className="text-xs font-black tabular-nums text-text-primary dark:text-white">
                  {money(line.unitPrice * line.qty)}
                </span>
              </div>
            ))}
          </div>
          <div className="shrink-0 space-y-1 border-t border-gray-100 px-4 py-3 text-[11px] dark:border-white/8">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span className="tabular-nums">{money(subtotal)}</span>
            </div>
            {discountPct > 0 && (
              <div className="flex justify-between text-text-secondary">
                <span>Discount {discountPct}%</span>
                <span className="tabular-nums">−{money(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-text-secondary">
              <span>Tax 8%</span>
              <span className="tabular-nums">{money(tax)}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-black text-text-primary dark:text-white">
              <span>Amount due</span>
              <span className="tabular-nums text-mintcom-green">{money(total)}</span>
            </div>
          </div>
        </div>

        {/* Method + confirm */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/8">
            <p className="text-sm font-black text-text-primary dark:text-white">Payment</p>
            <button
              type="button"
              onClick={onClose}
              className="hidden h-8 w-8 items-center justify-center rounded-lg bg-cream-100 lg:flex dark:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex shrink-0 gap-1 overflow-x-auto px-3 pt-3">
            {(
              [
                { id: 'cash' as const, label: 'Cash', emoji: '💵' },
                { id: 'card' as const, label: 'Card', emoji: '💳' },
                { id: 'other' as const, label: 'Other', emoji: '⚡' },
                { id: 'split' as const, label: 'Split', emoji: '✂️' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                  tab === t.id
                    ? 'bg-mintcom-green text-white'
                    : 'bg-cream-100 text-text-secondary dark:bg-mintcom-dark dark:text-mintcom-textSecondary'
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {tab === 'cash' && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-mintcom-green/30 bg-mintcom-green/5 px-4 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                    Amount tendered
                  </p>
                  <p className="text-3xl font-black tabular-nums text-mintcom-green">{money(tendered)}</p>
                  <p className={`mt-1 text-xs font-bold ${short ? 'text-mintcom-red' : 'text-text-secondary'}`}>
                    {short ? `Need ${money(total - tendered)} more` : `Change ${money(change)}`}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => appendDigit(k)}
                      className="rounded-xl border border-gray-200 bg-cream-50 py-3 text-sm font-black text-text-primary hover:border-mintcom-green/40 dark:border-white/10 dark:bg-mintcom-dark dark:text-white"
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[total, 10, 20, 50, 100].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTenderedCents(Math.round(n * 100))}
                      className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-bold dark:border-white/10 dark:text-white"
                    >
                      {n === total ? 'Exact' : money(n)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'card' && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-text-secondary">Card brand</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['Visa', 'Mastercard', 'Amex'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setCardBrand(b)}
                      className={`rounded-2xl border-2 py-4 text-sm font-black ${
                        cardBrand === b
                          ? 'border-mintcom-green bg-mintcom-green/15 text-mintcom-green'
                          : 'border-gray-200 text-text-primary dark:border-white/10 dark:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <p className="rounded-xl bg-cream-50 px-3 py-2 text-center text-xs text-text-secondary dark:bg-mintcom-dark">
                  Charge {money(total)} on {cardBrand}
                </p>
              </div>
            )}

            {tab === 'other' && (
              <div className="space-y-2">
                {(
                  [
                    { id: 'cliq' as const, label: 'CliQ', emoji: '⚡' },
                    { id: 'talabat' as const, label: 'Talabat', emoji: '🛵' },
                    { id: 'voucher' as const, label: 'Voucher', emoji: '🎟️' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setOtherId(m.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-start ${
                      otherId === m.id
                        ? 'border-mintcom-green bg-mintcom-green/10'
                        : 'border-gray-200 dark:border-white/10'
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="flex-1 text-sm font-bold text-text-primary dark:text-white">{m.label}</span>
                    {otherId === m.id && <Check size={16} className="text-mintcom-green" />}
                  </button>
                ))}
              </div>
            )}

            {tab === 'split' && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-text-secondary">Equal split across guests</p>
                <div className="flex flex-wrap gap-1.5">
                  {[2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSplitParts(n)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                        splitParts === n
                          ? 'bg-mintcom-green text-white'
                          : 'bg-cream-100 text-text-secondary dark:bg-mintcom-dark dark:text-mintcom-textSecondary'
                      }`}
                    >
                      {n} ways
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {splitShares.map((amt, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-cream-50 p-2.5 dark:border-white/10 dark:bg-mintcom-dark"
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-black text-white"
                        style={{
                          backgroundColor: ['#7dc6a2', '#4A90D9', '#E07A5F', '#9B6FD9', '#F2A65A'][i % 5],
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-[4.5rem] text-sm font-black tabular-nums text-text-primary dark:text-white">
                        {money(amt)}
                      </span>
                      <div className="flex flex-1 flex-wrap gap-1">
                        {(['cash', 'card', 'other'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() =>
                              setSplitMethods((prev) => {
                                const next = [...prev];
                                next[i] = m;
                                return next;
                              })
                            }
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                              splitMethods[i] === m
                                ? 'bg-mintcom-green text-white'
                                : 'bg-white text-text-secondary ring-1 ring-gray-200 dark:bg-mintcom-surface dark:ring-white/10'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-text-tertiary">
                  Each share is paid with its own method — tracked on the dashboard like POS split.
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-gray-100 p-4 dark:border-white/8">
            {tab === 'cash' && (
              <button
                type="button"
                disabled={short}
                onClick={confirmCash}
                className="w-full rounded-xl bg-mintcom-green py-3 text-sm font-black text-white disabled:opacity-40"
              >
                Complete cash · {money(total)}
                {!short && change > 0 ? ` · change ${money(change)}` : ''}
              </button>
            )}
            {tab === 'card' && (
              <button
                type="button"
                onClick={confirmCard}
                className="w-full rounded-xl bg-mintcom-green py-3 text-sm font-black text-white"
              >
                Charge {cardBrand} · {money(total)}
              </button>
            )}
            {tab === 'other' && (
              <button
                type="button"
                onClick={confirmOther}
                className="w-full rounded-xl bg-mintcom-green py-3 text-sm font-black text-white"
              >
                Confirm {otherId === 'cliq' ? 'CliQ' : otherId === 'talabat' ? 'Talabat' : 'Voucher'} ·{' '}
                {money(total)}
              </button>
            )}
            {tab === 'split' && (
              <button
                type="button"
                onClick={confirmSplit}
                className="w-full rounded-xl bg-mintcom-green py-3 text-sm font-black text-white"
              >
                Complete split · {money(total)}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
