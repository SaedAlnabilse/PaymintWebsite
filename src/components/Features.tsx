import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, type PanInfo, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  ShieldCheck,
  Users,
  BarChart3,
  ChefHat,
  Sparkles,
  Building2,
  LayoutDashboard,
  Zap,
  Lock,
  Heart,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  RotateCcw,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';

type WorkflowFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
  id?: string;
};

type PosProduct = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  color: string;
};

type CartLine = { id: string; name: string; price: number; qty: number; emoji: string };

/** Interactive mini POS terminal — visitors tap products, build a cart, and charge. */
const InteractivePosDemo = ({ t, isRtl }: { t: any; isRtl: boolean }) => {
  const products: PosProduct[] = useMemo(
    () => [
      {
        id: 'espresso',
        name: t('landing.workflow.receipt.demo.pos.espresso', 'Espresso'),
        price: 3.5,
        emoji: '☕',
        color: 'from-amber-500/20 to-orange-500/10 border-amber-400/30 hover:border-amber-400/60',
      },
      {
        id: 'croissant',
        name: t('landing.workflow.receipt.demo.pos.croissant', 'Croissant'),
        price: 4,
        emoji: '🥐',
        color: 'from-yellow-500/20 to-amber-500/10 border-yellow-400/30 hover:border-yellow-400/60',
      },
      {
        id: 'soda',
        name: t('landing.workflow.receipt.demo.pos.soda', 'Soda'),
        price: 2.5,
        emoji: '🥤',
        color: 'from-sky-500/20 to-blue-500/10 border-sky-400/30 hover:border-sky-400/60',
      },
      {
        id: 'salad',
        name: t('landing.workflow.receipt.demo.pos.salad', 'Salad'),
        price: 6.5,
        emoji: '🥗',
        color: 'from-emerald-500/20 to-green-500/10 border-emerald-400/30 hover:border-emerald-400/60',
      },
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
      if (existing) {
        return prev.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      }
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

  const startPay = () => {
    if (cart.length === 0) return;
    setPhase('paying');
  };

  const completePay = (method: 'card' | 'cash') => {
    setPayMethod(method);
    setPhase('done');
  };

  const formatMoney = (n: number) =>
    n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="mt-5 select-none"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Terminal chrome */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-b from-gray-50 to-white shadow-inner dark:border-white/10 dark:from-[#0c0c0c] dark:to-[#121212]">
        {/* status bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-3.5 py-2 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mintcom-green" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
              {t('landing.workflow.receipt.brand', 'MINTCOM POS')}
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
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="flex flex-col items-center py-4 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.05 }}
                  className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-mintcom-green text-black shadow-[0_8px_28px_-6px_rgba(125,198,162,0.7)]"
                >
                  <Check size={28} strokeWidth={3} />
                </motion.div>
                <p className="font-barlow text-lg font-bold text-gray-900 dark:text-white">
                  {t('landing.workflow.receipt.frame.approved', 'Transaction approved')}
                </p>
                <p className="mt-1 text-sm font-semibold text-mintcom-green">
                  {formatMoney(total)}{' '}
                  <span className="text-gray-400">
                    {t('landing.workflow.receipt.demo.sales.via', {
                      m: payMethod === 'cash'
                        ? t('landing.workflow.receipt.demo.sales.cash', 'Cash')
                        : t('landing.workflow.receipt.demo.sales.card', 'Card'),
                      defaultValue: `via ${payMethod === 'cash' ? 'Cash' : 'Card'}`,
                    })}
                  </span>
                </p>

                {/* mini receipt */}
                <motion.div
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 w-full max-w-[220px] rounded-xl border border-dashed border-gray-200 bg-white px-3 py-3 text-start shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    {t('landing.workflow.receipt.frame.pos', 'Sales receipt')}
                  </p>
                  <div className="space-y-1">
                    {cart.map((line) => (
                      <div key={line.id} className="flex justify-between gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                        <span className="truncate">
                          {line.emoji} {line.name} ×{line.qty}
                        </span>
                        <span className="tabular-nums font-semibold">{formatMoney(line.price * line.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-dashed border-gray-200 pt-2 dark:border-white/10">
                    <div className="flex justify-between text-xs font-bold text-gray-900 dark:text-white">
                      <span>{t('landing.workflow.receipt.demo.pos.totalLine', 'Total')}</span>
                      <span className="tabular-nums">{formatMoney(total)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-[10px] text-gray-400">
                    {t('landing.workflow.receipt.thanks', 'Thank you')}
                  </p>
                </motion.div>

                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                >
                  <RotateCcw size={12} />
                  {t('landing.workflow.receipt.demo.pos.newSale', 'New sale')}
                </button>
              </motion.div>
            ) : phase === 'paying' ? (
              <motion.div
                key="paying"
                initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                className="py-2"
              >
                <p className="mb-3 text-center text-sm font-bold text-gray-900 dark:text-white">
                  {formatMoney(total)}
                </p>
                <p className="mb-4 text-center text-xs text-gray-500">
                  {t('landing.workflow.receipt.demo.pos.choosePay', 'Choose how the customer pays')}
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => completePay('card')}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-mintcom-green/50 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mintcom-green/15 text-mintcom-green transition-transform group-hover:scale-110">
                      <CreditCard size={20} />
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {t('landing.workflow.receipt.demo.sales.card', 'Card')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => completePay('cash')}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-mintcom-green/50 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400">
                      <span className="text-lg font-black">$</span>
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {t('landing.workflow.receipt.demo.sales.cash', 'Cash')}
                    </span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setPhase('selling')}
                  className="mt-3 w-full py-2 text-xs font-semibold text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {t('common.back', 'Back')}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="selling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="mb-2.5 text-center text-[11px] font-semibold text-gray-400">
                  {t('landing.workflow.receipt.demo.pos.tap', 'Tap an item to add')}
                </p>

                {/* product grid */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {products.map((p) => (
                    <motion.button
                      key={p.id}
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => addProduct(p)}
                      className={`relative flex flex-col items-center gap-1 rounded-xl border bg-gradient-to-br p-2.5 transition-shadow hover:shadow-md sm:p-3 ${p.color} dark:from-white/[0.06] dark:to-white/[0.02]`}
                    >
                      <AnimatePresence>
                        {lastAdded === p.id && (
                          <motion.span
                            initial={{ opacity: 0, y: 6, scale: 0.6 }}
                            animate={{ opacity: 1, y: -8, scale: 1 }}
                            exit={{ opacity: 0, y: -18 }}
                            className="pointer-events-none absolute -top-1 end-1 rounded-full bg-mintcom-green px-1.5 py-0.5 text-[9px] font-black text-black"
                          >
                            +1
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <span className="text-2xl leading-none sm:text-[26px]">{p.emoji}</span>
                      <span className="w-full truncate text-center text-[11px] font-bold text-gray-800 dark:text-gray-100">
                        {p.name}
                      </span>
                      <span className="tabular-nums text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                        {formatMoney(p.price)}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* cart + totals */}
                <div className="mt-3 rounded-xl border border-gray-100 bg-white/80 p-3 dark:border-white/8 dark:bg-white/[0.03]">
                  {cart.length === 0 ? (
                    <p className="py-3 text-center text-xs text-gray-400">
                      {t('landing.workflow.receipt.demo.pos.emptyCart', 'Cart is empty — tap a product above')}
                    </p>
                  ) : (
                    <div className="mb-2 max-h-[88px] space-y-1 overflow-y-auto">
                      <AnimatePresence initial={false}>
                        {cart.map((line) => (
                          <motion.div
                            key={line.id}
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="min-w-0 truncate font-medium text-gray-700 dark:text-gray-200">
                              {line.emoji} {line.name}{' '}
                              <span className="text-gray-400">×{line.qty}</span>
                            </span>
                            <span className="tabular-nums font-bold text-gray-900 dark:text-white">
                              {formatMoney(line.price * line.qty)}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="space-y-0.5 border-t border-gray-100 pt-2 text-[11px] dark:border-white/8">
                    <div className="flex justify-between text-gray-500">
                      <span>{t('landing.workflow.receipt.demo.pos.subtotal', 'Subtotal')}</span>
                      <span className="tabular-nums">{formatMoney(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>{t('landing.workflow.receipt.demo.pos.taxLine', 'Tax 8%')}</span>
                      <span className="tabular-nums">{formatMoney(tax)}</span>
                    </div>
                    <motion.div
                      key={pulseTotal}
                      initial={{ scale: 1.04 }}
                      animate={{ scale: 1 }}
                      className="flex justify-between pt-0.5 text-sm font-bold text-gray-900 dark:text-white"
                    >
                      <span>{t('landing.workflow.receipt.demo.pos.totalLine', 'Total')}</span>
                      <span className="tabular-nums text-mintcom-green">{formatMoney(total)}</span>
                    </motion.div>
                  </div>

                  <div className="mt-2.5 flex gap-2">
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                      >
                        {t('common.clear', 'Clear')}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={startPay}
                      className="flex-1 rounded-xl bg-mintcom-green py-2.5 text-xs font-bold text-black shadow-[0_4px_16px_-4px_rgba(125,198,162,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(125,198,162,0.65)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    >
                      {cart.length === 0
                        ? t('landing.workflow.receipt.demo.pos.charge', 'Charge')
                        : `${t('landing.workflow.receipt.demo.pos.charge', 'Charge')} ${formatMoney(total)}`}
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

const WorkflowFeatureCard = ({
  feature,
  index,
  t,
  onOpen,
}: {
  feature: WorkflowFeature;
  index: number;
  t: any;
  onOpen: (index: number) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.08, duration: 0.5 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group flex flex-col h-full p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#121212] hover:border-mintcom-green/40 hover:shadow-2xl hover:shadow-mintcom-green/10 shadow-lg shadow-gray-200/30 dark:shadow-none transition-all duration-500 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-mintcom-green/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-mintcom-green/10 dark:bg-mintcom-green/15 flex items-center justify-center group-hover:bg-mintcom-green group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
          <feature.icon size={22} className="text-mintcom-green group-hover:text-white transition-colors duration-500" />
        </div>
        <h3 className="font-barlow text-gray-900 dark:text-white font-bold text-base mt-2 group-hover:text-mintcom-green transition-colors leading-tight tracking-tight">
          {feature.title}
        </h3>
      </div>

      <div className="flex-1 flex flex-col justify-between relative z-10">
        <p className="font-barlow text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium line-clamp-3">
          {feature.description}
        </p>

        <button
          type="button"
          onClick={() => onOpen(index)}
          className="mt-3 text-xs font-bold font-barlow text-mintcom-green hover:text-mintcom-green/80 self-start transition-colors focus:outline-none"
        >
          {t('landing.features.readMore', 'Read more')}
        </button>
      </div>
    </motion.div>
  );
};

// Slide variants for the inner content panel.
// `direction` is 1 when going to next, -1 when going to previous.
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction * 80,
    opacity: 0,
    scale: 0.96,
    rotateY: direction * 8,
    filter: 'blur(8px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction: number) => ({
    x: direction * -80,
    opacity: 0,
    scale: 0.96,
    rotateY: direction * -8,
    filter: 'blur(8px)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  }),
};

const WorkflowFeatureModal = ({
  features,
  activeIndex,
  direction,
  onClose,
  onPrev,
  onNext,
  onJumpTo,
  t,
  isRtl,
}: {
  features: WorkflowFeature[];
  activeIndex: number;
  direction: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpTo: (i: number) => void;
  t: any;
  isRtl: boolean;
}) => {
  const feature = features[activeIndex];
  if (!feature) return null;
  const Icon = feature.icon;
  const isPosStep = feature.id === 'pointOfSale';

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    if (isPosStep) return; // don't swipe-away while playing with the POS demo
    const threshold = 80;
    if (info.offset.x < -threshold) {
      if (isRtl) {
        onPrev();
      } else {
        onNext();
      }
    } else if (info.offset.x > threshold) {
      if (isRtl) {
        onNext();
      } else {
        onPrev();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal shell — stays mounted while paginating */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#161616] ${
          isPosStep ? 'max-w-xl' : 'max-w-2xl'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{ perspective: 1200 }}
      >
        {/* ambient glow that pulses on each step */}
        <motion.div
          key={`glow-${activeIndex}`}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.55, 0], scale: [0.4, 1.4, 1.6] }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-64 w-64 -translate-x-1/2 rounded-full bg-mintcom-green/30 blur-3xl"
        />

        {/* sweep highlight that crosses the card on each step */}
        <motion.div
          key={`sweep-${activeIndex}`}
          initial={{ x: direction * -120 + '%', opacity: 0 }}
          animate={{ x: direction * 120 + '%', opacity: [0, 0.45, 0] }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-mintcom-green/15 to-transparent"
        />

        {/* close */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close', 'Close')}
          className="absolute end-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* counter pill */}
        <div className="absolute start-4 top-4 z-30 flex items-center gap-1 rounded-full bg-mintcom-green/10 px-3 py-1 text-xs font-bold text-mintcom-green">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.span
              key={`count-${activeIndex}`}
              custom={direction}
              initial={{ y: direction * 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: direction * -12, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="tabular-nums"
            >
              {activeIndex + 1}
            </motion.span>
          </AnimatePresence>
          <span className="opacity-50">/</span>
          <span className="tabular-nums opacity-70">{features.length}</span>
        </div>

        {/* sliding content area — drag enabled (except on interactive POS demo) */}
        <div className="relative max-h-[min(78vh,720px)] overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag={isPosStep ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={handleDragEnd}
              className={`relative z-10 p-8 pt-14 md:p-10 md:pt-16 ${isPosStep ? '' : 'cursor-grab active:cursor-grabbing'}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {!isPosStep && (
                <motion.div
                  initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.5, type: 'spring', stiffness: 220, damping: 18 }}
                  className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mintcom-green/10 dark:bg-white/5 text-mintcom-green"
                >
                  <Icon size={28} />
                </motion.div>
              )}

              <motion.h3
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="font-barlow text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug"
              >
                {feature.title}
              </motion.h3>

              <motion.p
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={`mt-3 font-barlow text-gray-600 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-line ${
                  isPosStep ? 'text-sm md:text-[15px]' : 'mt-4 text-base md:text-[17px]'
                }`}
              >
                {feature.description}
              </motion.p>

              {isPosStep && (
                <motion.div
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.28, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <InteractivePosDemo t={t} isRtl={isRtl} />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* footer / nav */}
        <div className="relative z-10 mx-8 flex items-center justify-between gap-4 border-t border-gray-100 dark:border-white/10 py-5 md:mx-10">
          <button
            type="button"
            onClick={onPrev}
            aria-label={t('common.previous', 'Previous')}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <span className="hidden sm:inline">{t('common.previous', 'Previous')}</span>
          </button>

          {/* dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[55%] no-scrollbar">
            {features.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onJumpTo(i)}
                aria-label={`Go to ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                  i === activeIndex ? 'w-5 bg-mintcom-green' : 'w-2 bg-gray-300 hover:bg-gray-400 dark:bg-white/15 dark:hover:bg-white/25'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onNext}
            aria-label={t('common.next', 'Next')}
            className="flex items-center gap-2 rounded-xl bg-mintcom-green px-4 py-2.5 text-sm font-bold text-black shadow-[0_4px_20px_-4px_rgba(125,198,162,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-4px_rgba(125,198,162,0.65)]"
          >
            <span className="hidden sm:inline">{t('common.next', 'Next')}</span>
            {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const Features = () => {
  const { t } = useTranslation();
  const isRtl = t('common.locale') === 'ar';
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);

  // Order matches the requested layout:
  // POS, Sales Control, Staff Management, Advanced Reporting,
  // Recipe & Cost Management, AI System, Multi-Branch Management, Simple & Easy Interface,
  // Fast Staff Onboarding, Secure & Reliable, Loyalty & Customer Management, Mobile App & Notifications
  const workflowFeatures: WorkflowFeature[] = [
    {
      id: 'pointOfSale',
      title: t('landing.workflow.pointOfSale.title'),
      description: t('landing.workflow.pointOfSale.description'),
      icon: CreditCard,
    },
    {
      id: 'salesControl',
      title: t('landing.workflow.salesControl.title'),
      description: t('landing.workflow.salesControl.description'),
      icon: ShieldCheck,
    },
    {
      id: 'staffManagement',
      title: t('landing.workflow.staffManagement.title'),
      description: t('landing.workflow.staffManagement.description'),
      icon: Users,
    },
    {
      id: 'advancedReporting',
      title: t('landing.workflow.advancedReporting.title'),
      description: t('landing.workflow.advancedReporting.description'),
      icon: BarChart3,
    },
    {
      id: 'production',
      title: t('landing.workflow.production.title'),
      description: t('landing.workflow.production.description'),
      icon: ChefHat,
    },
    {
      id: 'aiSystem',
      title: t('landing.workflow.aiSystem.title'),
      description: t('landing.workflow.aiSystem.description'),
      icon: Sparkles,
    },
    {
      id: 'multiBranch',
      title: t('landing.workflow.multiBranch.title'),
      description: t('landing.workflow.multiBranch.description'),
      icon: Building2,
    },
    {
      id: 'simpleUI',
      title: t('landing.workflow.simpleUI.title'),
      description: t('landing.workflow.simpleUI.description'),
      icon: LayoutDashboard,
    },
    {
      id: 'fastOnboarding',
      title: t('landing.workflow.fastOnboarding.title'),
      description: t('landing.workflow.fastOnboarding.description'),
      icon: Zap,
    },
    {
      id: 'secure',
      title: t('landing.workflow.secure.title'),
      description: t('landing.workflow.secure.description'),
      icon: Lock,
    },
    {
      id: 'loyalty',
      title: t('landing.workflow.loyalty.title'),
      description: t('landing.workflow.loyalty.description'),
      icon: Heart,
    },
    {
      id: 'mobileApp',
      title: t('landing.workflow.mobileApp.title'),
      description: t('landing.workflow.mobileApp.description'),
      icon: Smartphone,
    },
  ];

  const handleOpen = useCallback((index: number) => {
    setDirection(1);
    setActiveCard(index);
  }, []);
  const handleClose = useCallback(() => setActiveCard(null), []);
  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveCard((i) => (i === null ? null : (i - 1 + workflowFeatures.length) % workflowFeatures.length));
  }, [workflowFeatures.length]);
  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveCard((i) => (i === null ? null : (i + 1) % workflowFeatures.length));
  }, [workflowFeatures.length]);
  const handleJumpTo = useCallback((target: number) => {
    setActiveCard((i) => {
      if (i === null) return target;
      setDirection(target > i ? 1 : -1);
      return target;
    });
  }, []);

  // Keyboard nav, body scroll lock, and chat widget hide while modal is open
  useEffect(() => {
    if (activeCard === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      else if (e.key === 'ArrowRight') (isRtl ? handlePrev : handleNext)();
      else if (e.key === 'ArrowLeft') (isRtl ? handleNext : handlePrev)();
    };
    window.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.dispatchEvent(new CustomEvent('mintcom-chat-widget-hide'));

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      window.dispatchEvent(new CustomEvent('mintcom-chat-widget-show'));
    };
  }, [activeCard, handleClose, handleNext, handlePrev, isRtl]);

  return (
    <section
      id="features"
      className="py-16 lg:py-24 bg-white dark:bg-[#0f0f0f] overflow-hidden relative"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background Decor */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-mintcom-green/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-mintcom-green/5 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-6 md:px-10 lg:px-16 max-w-[1280px]">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16 mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[12px] bg-mintcom-green/5 dark:bg-mintcom-green/10 text-mintcom-green font-bold text-xs mb-8 border border-mintcom-green/20 backdrop-blur-md shadow-[0_0_15px_rgba(124,195,159,0.05)] hover:border-mintcom-green/40 transition-all duration-300 mx-auto"
          >
            <div className="relative flex items-center justify-center w-5 h-5 rounded-[6px] bg-mintcom-green/20 text-mintcom-green overflow-hidden">
              <Sparkles size={11} className="relative z-10" />
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-mintcom-green/30"
              />
            </div>
            <span className="tracking-widest uppercase text-[10px] md:text-[11px] leading-none">
              {t('landing.workflow.badge')}
            </span>
          </motion.div>

          <h2 className="text-[clamp(1rem,5.2vw,4.5rem)] whitespace-nowrap font-bold font-magilio mb-6 leading-tight tracking-tight">
            <span className="text-gray-900 dark:text-white">{t('landing.workflow.title')} </span>
            <span className="bg-mintcom-green text-gray-900 dark:text-gray-900 px-2 rounded-sm">{t('landing.workflow.titleHighlight')}</span>
          </h2>
          {t('landing.workflow.subtitle') && (
            <p className="max-w-3xl mx-auto text-base font-light leading-relaxed text-gray-600 dark:text-gray-400 xs:text-lg sm:text-xl">
              {t('landing.workflow.subtitle')}
            </p>
          )}
        </motion.div>

        {/* 4-column responsive grid of all 12 features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6 items-stretch">
          {workflowFeatures.map((feature, index) => (
            <WorkflowFeatureCard
              key={index}
              feature={feature}
              index={index}
              t={t}
              onOpen={handleOpen}
            />
          ))}
        </div>
      </div>

      {/* Read more popup */}
      <AnimatePresence>
        {activeCard !== null && (
          <WorkflowFeatureModal
            features={workflowFeatures}
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
