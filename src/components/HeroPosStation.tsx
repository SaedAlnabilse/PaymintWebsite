import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Home,
  LayoutGrid,
  BarChart2,
  Bell,
  Settings,
  Search,
  RefreshCw,
  ShoppingBag,
  Percent,
  Pause,
  Star,
  Trash2,
  Plus,
  ChevronDown,
  Banknote,
  CreditCard,
  Wallet,
  SplitSquareHorizontal,
  SlidersHorizontal,
  X,
  CupSoda,
} from 'lucide-react';
import MintcomLeafIcon from '../assets/small-logo.svg';

/**
 * Hero POS station — full hardware + software mockup built in code
 * (same approach as AdminControl / CloudControl device mockups).
 * Tablet screen mirrors the real POS SalesScreen layout:
 * left nav rail · header (employee / search / SYNC) · category chips ·
 * product grid · right order panel (lines, totals, CASH / CARD / OTHER).
 */

const money = (n: number) => `$${n.toFixed(2)}`;

const PRODUCTS = [
  { name: 'Spanish Latte', price: 4.95, emoji: '☕' },
  { name: 'Cappuccino', price: 3.95, emoji: '🥛' },
  { name: 'Americano', price: 6.25, emoji: '☕' },
  { name: 'Croissant', price: 3.5, emoji: '🥐' },
  { name: 'Tiramisu', price: 5.25, emoji: '🍰' },
  { name: 'Cheesecake', price: 4.75, emoji: '🍮' },
];

const ORDER_LINES = [
  { name: 'Spanish Latte', price: 4.95, qty: 1, emoji: '☕' },
  { name: 'Cappuccino', price: 3.95, qty: 1, emoji: '🥛' },
  { name: 'Pastry', price: 4.25, qty: 1, emoji: '🥐' },
];

const TOTAL = ORDER_LINES.reduce((s, l) => s + l.price * l.qty, 0);

/* ───────────────────────── Tablet sales screen (pure code UI) ───────────────────────── */

const TabletSalesScreen = ({ t }: { t: (...args: any[]) => any }) => {
  const categories = [
    { label: t('landing.heroPos.catAll', 'All Menu'), active: false },
    { label: t('landing.heroPos.catCold', 'Cold Drinks'), active: true },
    { label: t('landing.heroPos.catHot', 'Hot Drinks'), active: false },
    { label: t('landing.heroPos.catDesserts', 'Desserts'), active: false },
    { label: t('landing.heroPos.catSalads', 'Salads'), active: false },
  ];
  const activeCategory =
    categories.find((c) => c.active)?.label ?? t('landing.heroPos.allMenu', 'All Menu');

  const navIcons = [Home, LayoutGrid, BarChart2, Bell, Settings];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#f6f3ec] text-[#1f2a26] dark:text-[#1f2a26]">
      {/* iPad status bar */}
      <div className="flex h-[11px] shrink-0 items-center justify-between bg-white px-2.5 sm:h-[13px] sm:px-3.5">
        <span className="text-[6px] font-semibold tabular-nums text-gray-800 sm:text-[7px]">
          10:50 AM
        </span>
        <div className="flex items-center gap-1">
          <div className="flex h-[7px] items-end gap-px">
            {[2, 3.5, 5, 6.5].map((h, i) => (
              <span
                key={i}
                className="w-[1.5px] rounded-[0.5px] bg-gray-800"
                style={{ height: h }}
              />
            ))}
          </div>
          <svg width="11" height="8" viewBox="0 0 11 8" className="text-gray-800" aria-hidden>
            <path
              d="M1 5.2C2.2 3.8 3.9 3 5.5 3s3.3.8 4.5 2.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <circle cx="5.5" cy="6.6" r="0.75" fill="currentColor" />
          </svg>
          <div className="relative h-[7px] w-[13px] rounded-[2px] border border-gray-800">
            <div className="absolute inset-[1px] right-[2.5px] rounded-[0.5px] bg-gray-800" />
            <div className="absolute -right-[2px] top-1/2 h-[3px] w-[1.5px] -translate-y-1/2 rounded-r-sm bg-gray-700" />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
      {/* Left nav rail */}
      <div className="flex w-[7%] min-w-[24px] shrink-0 flex-col items-center gap-[6%] border-e border-black/[0.06] bg-white py-[4%]">
        <div className="flex h-4 w-4 items-center justify-center rounded-md bg-mintcom-green/15 sm:h-5 sm:w-5">
          <img src={MintcomLeafIcon} alt="" className="h-2.5 w-2.5 object-contain sm:h-3 sm:w-3" />
        </div>
        {navIcons.map((Icon, i) => (
          <span
            key={i}
            className={`flex h-4 w-4 items-center justify-center rounded-md sm:h-5 sm:w-5 ${
              i === 0 ? 'bg-mintcom-green text-white shadow-sm shadow-mintcom-green/30' : 'text-gray-400'
            }`}
          >
            <Icon size={9} strokeWidth={2.5} />
          </span>
        ))}
      </div>

      {/* Menu pane */}
      <div className="flex min-w-0 flex-[2.1] flex-col overflow-hidden">
        {/* Header — employee · search · sync · order drawer */}
        <div className="flex shrink-0 items-center gap-1 border-b border-black/[0.06] bg-white px-1.5 py-1 sm:gap-1.5 sm:px-2 sm:py-1.5">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-mintcom-green/20 text-[5px] font-black text-mintcom-green sm:h-5 sm:w-5 sm:text-[6px]">
            AE
          </span>
          <div className="me-0.5 hidden min-w-0 sm:block">
            <p className="truncate text-[6px] font-black leading-tight text-[#1f2a26] dark:text-[#1f2a26]">
              {t('landing.heroPos.employee', 'Admin Employee')}
            </p>
            <p className="truncate text-[5px] leading-tight text-gray-400 dark:text-gray-400">
              {t('landing.heroPos.role', 'Cashier · Shift open')}
            </p>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-1 rounded-md border border-black/[0.07] bg-[#f6f3ec] px-1 py-[3px] sm:px-1.5">
            <Search size={6} className="shrink-0 text-gray-400" />
            <span className="truncate text-[5px] font-medium text-gray-400 sm:text-[6px]">
              {t('landing.heroPos.search', 'Search menu…')}
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-mintcom-green px-1 py-[3px] text-[5px] font-black uppercase tracking-wide text-white shadow-sm shadow-mintcom-green/30 sm:px-1.5 sm:text-[6px]">
            <RefreshCw size={6} strokeWidth={3} />
            {t('landing.heroPos.sync', 'Sync')}
          </span>
          <span className="hidden shrink-0 items-center rounded-full border border-black/[0.08] px-1.5 py-[3px] text-[5px] font-bold text-gray-500 sm:inline-flex sm:text-[6px]">
            {t('landing.heroPos.orderDrawer', 'Order Drawer')}
          </span>
        </div>

        {/* Toolbar — matches real POS SalesHeader: PAY-IN/OUT + search/category dropdown pill + sort */}
        <div className="flex shrink-0 items-center gap-1 overflow-visible px-1.5 py-1 sm:gap-1.5 sm:px-2 sm:py-1.5">
          {/* PAY-IN / PAY-OUT */}
          <span
            className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-[5px] text-[5px] font-extrabold uppercase tracking-wide text-white sm:px-2 sm:text-[6px]"
            style={{ backgroundColor: '#7dc6a2' }}
          >
            <RefreshCw size={6} strokeWidth={2.75} />
            {t('landing.heroPos.payInOut', 'Pay-in / Pay-out')}
          </span>

          {/* Combined search + category dropdown pill (real POS filter pill) */}
          <div
            className="relative flex min-w-0 flex-1 items-stretch overflow-hidden rounded-full border"
            style={{
              backgroundColor: '#F3F4F6',
              borderColor: '#E5E7EB',
            }}
          >
            {/* Search zone */}
            <div className="flex min-w-0 flex-1 items-center gap-0.5 px-1.5 py-[4px] sm:px-2">
              <Search size={7} className="shrink-0 text-gray-400" strokeWidth={2.5} />
              <span className="truncate text-[5px] font-medium text-gray-400 sm:text-[6px]">
                {t('landing.heroPos.searchInCat', {
                  cat: activeCategory,
                  defaultValue: `Search in ${activeCategory}…`,
                })}
              </span>
            </div>

            {/* Divider */}
            <span className="my-1 w-px shrink-0 bg-[#D1D5DB]" />

            {/* Category dropdown trigger — selected (mint tint) */}
            <div
              className="flex shrink-0 items-center gap-0.5 px-1.5 py-[4px] sm:gap-1 sm:px-2"
              style={{ backgroundColor: 'rgba(125,198,162,0.14)' }}
            >
              <CupSoda size={8} className="shrink-0 text-mintcom-green" strokeWidth={2.25} />
              <span className="max-w-[52px] truncate text-[5.5px] font-bold text-mintcom-green sm:max-w-[72px] sm:text-[6.5px]">
                {activeCategory}
              </span>
              <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-mintcom-green sm:h-3 sm:w-3">
                <X size={6} className="text-white" strokeWidth={3} />
              </span>
            </div>
          </div>

          {/* Sort */}
          <span
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-lg border sm:h-5 sm:w-5 sm:rounded-xl"
            style={{
              backgroundColor: '#F3F4F6',
              borderColor: '#E5E7EB',
            }}
          >
            <SlidersHorizontal size={8} className="text-mintcom-green" strokeWidth={2.25} />
          </span>
        </div>

        {/* Active category heading + sync */}
        <div className="flex shrink-0 items-center justify-between px-1.5 sm:px-2">
          <span className="relative pb-[3px] text-[6.5px] font-extrabold tracking-tight text-[#1f2a26] sm:text-[7.5px]">
            {activeCategory}
            <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-mintcom-green" />
          </span>
          <span className="flex items-center gap-1 text-[5px] font-semibold text-gray-400 sm:text-[6px]">
            <span className="h-1 w-1 animate-pulse rounded-full bg-mintcom-green" />
            {t('landing.heroPos.synced', 'Sync status: Synced')}
          </span>
        </div>

        {/* Product grid */}
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-1 overflow-hidden p-1.5 sm:gap-1.5 sm:p-2">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="relative flex min-h-0 flex-col overflow-hidden rounded-lg border border-black/[0.06] bg-white shadow-sm"
            >
              <span className="absolute end-0.5 top-0.5 z-10 rounded-full border border-black/[0.06] bg-white px-1 text-[5px] font-black tabular-nums text-gray-600 shadow-sm sm:text-[6px]">
                {money(p.price)}
              </span>
              <div className="relative flex min-h-0 flex-1 items-center justify-center bg-gradient-to-br from-mintcom-green/15 to-[#f0ece3]">
                <span className="select-none text-[13px] leading-none sm:text-lg">{p.emoji}</span>
                <span className="absolute bottom-0.5 end-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-mintcom-green text-white shadow-sm sm:h-3 sm:w-3">
                  <Plus size={6} strokeWidth={3.5} />
                </span>
              </div>
              <div className="shrink-0 px-1 py-[3px]">
                <p className="truncate text-[5px] font-bold leading-tight text-[#1f2a26] dark:text-[#1f2a26] sm:text-[6px]">{p.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Order panel */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden border-s border-black/[0.06] bg-white">
        {/* Panel header — action icons + order no */}
        <div className="flex shrink-0 items-center justify-between gap-1 border-b border-black/[0.06] px-1.5 py-1 sm:px-2">
          <div className="flex items-center gap-0.5 sm:gap-1">
            {[Percent, Pause, Star].map((Icon, i) => (
              <span
                key={i}
                className="flex h-3.5 w-3.5 items-center justify-center rounded-md bg-mintcom-green/12 text-mintcom-green sm:h-4 sm:w-4"
              >
                <Icon size={7} strokeWidth={2.5} />
              </span>
            ))}
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-md bg-red-500/10 text-red-400 sm:h-4 sm:w-4">
              <Trash2 size={7} strokeWidth={2.5} />
            </span>
          </div>
          <div className="text-end leading-none">
            <p className="text-[4.5px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 sm:text-[5px]">
              {t('landing.heroPos.orderNumber', 'Order')}
            </p>
            <p className="text-[7px] font-black text-[#1f2a26] dark:text-[#1f2a26] sm:text-[8px]">#41</p>
          </div>
        </div>

        {/* Lines */}
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-1.5 sm:p-2">
          {ORDER_LINES.map((l, i) => (
            <motion.div
              key={l.name}
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-black/[0.06] bg-[#f6f3ec] p-1 sm:gap-1.5 sm:p-1.5"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-white text-[8px] shadow-sm sm:h-5 sm:w-5 sm:text-[10px]">
                {l.emoji}
              </span>
              <div className="min-w-0 flex-1 leading-none">
                <p className="truncate text-[5px] font-bold text-[#1f2a26] dark:text-[#1f2a26] sm:text-[6px]">{l.name}</p>
                <p className="mt-[2px] text-[5px] font-black tabular-nums text-[#1f2a26] dark:text-[#1f2a26] sm:text-[6px]">{money(l.price)}</p>
              </div>
              <span className="flex h-2.5 min-w-[10px] shrink-0 items-center justify-center rounded-full bg-mintcom-green px-0.5 text-[5px] font-black text-white sm:h-3">
                ×{l.qty}
              </span>
              <ChevronDown size={6} className="hidden shrink-0 text-gray-400 sm:block" />
            </motion.div>
          ))}
        </div>

        {/* Totals + payment methods */}
        <div className="shrink-0 border-t border-black/[0.06] px-1.5 py-1 sm:px-2 sm:py-1.5">
          <div className="space-y-[2px] text-[5px] text-gray-500 sm:text-[6px]">
            <div className="flex justify-between">
              <span>{t('landing.heroPos.subtotal', 'Subtotal')}</span>
              <span className="tabular-nums">{money(TOTAL)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('landing.heroPos.discount', 'Discount')}</span>
              <span className="tabular-nums">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span>{t('landing.heroPos.tax', 'Total Tax')}</span>
              <span className="tabular-nums">$0.00</span>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-black/[0.08] pt-1">
            <span className="text-[6px] font-black sm:text-[7px]">{t('landing.heroPos.total', 'Total')}</span>
            <span className="text-[7px] font-black tabular-nums text-mintcom-green sm:text-[8px]">
              {money(TOTAL)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[4.5px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 sm:text-[5px]">
              {t('landing.heroPos.paymentMethod', 'Payment Method')}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-mintcom-green/15 px-1 py-[2px] text-[4.5px] font-black text-mintcom-green sm:text-[5px]">
              <SplitSquareHorizontal size={5} />
              {t('landing.heroPos.split', 'Split')}
            </span>
          </div>
          <div className="mt-1 grid grid-cols-3 gap-0.5 sm:gap-1">
            {[
              { icon: Banknote, label: t('landing.heroPos.cash', 'Cash') },
              { icon: CreditCard, label: t('landing.heroPos.card', 'Card') },
              { icon: Wallet, label: t('landing.heroPos.other', 'Other') },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex flex-col items-center gap-[2px] rounded-md bg-mintcom-green py-1 text-[4.5px] font-black uppercase tracking-wide text-white shadow-sm shadow-mintcom-green/30 sm:py-1.5 sm:text-[5.5px]"
              >
                <Icon size={7} strokeWidth={2.5} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

/* ───────────────────────── Hardware pieces ───────────────────────── */

const CashDrawer = () => (
  <div
    className="relative mx-auto h-10 w-[58%] max-w-[280px] rounded-lg sm:h-14"
    style={{
      background: 'linear-gradient(180deg, #303035 0%, #202024 55%, #141417 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
    }}
  >
    {/* Drawer face seam */}
    <div className="absolute inset-x-1.5 top-1.5 bottom-1.5 rounded-md ring-1 ring-white/[0.06]" />
    {/* Handle slot */}
    <div className="absolute left-1/2 top-1/2 h-1.5 w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.07)] sm:h-2" />
    {/* Keyhole */}
    <div className="absolute right-[12%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#0c0c0e] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.08)] sm:h-2.5 sm:w-2.5">
      <span className="absolute left-1/2 top-1/2 h-[55%] w-[1.5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2e2e33]" />
    </div>
  </div>
);

/* ───────────────────────── Full station ───────────────────────── */

export const HeroPosStation = () => {
  const { t } = useTranslation();

  return (
    <div
      role="img"
      aria-label={t('landing.hero.alt', 'Mintcom All-in-One POS System')}
      className="relative mx-auto w-full max-w-[640px] select-none"
    >
      {/* ── iPad-style tablet (landscape) ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-20 mx-auto w-[74%] sm:w-[76%]"
      >
        {/* Outer aluminum shell */}
        <div
          className="relative rounded-[18px] p-[2px] sm:rounded-[26px] sm:p-[2.5px]"
          style={{
            background:
              'linear-gradient(145deg, #6e6e73 0%, #3a3a3c 18%, #8e8e93 36%, #1c1c1e 55%, #5c5c60 78%, #2c2c2e 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
          }}
        >
          {/* Side volume rail (left, landscape top when rotated — keep as left for front view) */}
          <div
            className="absolute -left-[3px] top-[22%] z-40 h-[11%] w-[3px] rounded-l-[2px] sm:-left-[3.5px] sm:w-[3.5px]"
            style={{
              background: 'linear-gradient(90deg, #5a5a5e, #2a2a2c)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          />
          <div
            className="absolute -left-[3px] top-[36%] z-40 h-[14%] w-[3px] rounded-l-[2px] sm:-left-[3.5px] sm:w-[3.5px]"
            style={{
              background: 'linear-gradient(90deg, #5a5a5e, #2a2a2c)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          />
          {/* Power button (right) */}
          <div
            className="absolute -right-[3px] top-[30%] z-40 h-[16%] w-[3px] rounded-r-[2px] sm:-right-[3.5px] sm:w-[3.5px]"
            style={{
              background: 'linear-gradient(270deg, #5a5a5e, #2a2a2c)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          />

          {/* Black front bezel — thicker top band holds the camera cleanly */}
          <div
            className="relative overflow-hidden rounded-[16px] px-2 pb-2 pt-[15px] sm:rounded-[23px] sm:px-2.5 sm:pb-2.5 sm:pt-[18px]"
            style={{
              background:
                'linear-gradient(180deg, #1a1a1c 0%, #0a0a0b 45%, #111113 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            {/* Camera centered in the top bezel only (never on outer metal rim) */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[15px] items-center justify-center sm:h-[18px]">
              <div
                className="relative h-[6px] w-[6px] rounded-full sm:h-[7px] sm:w-[7px]"
                style={{
                  background:
                    'radial-gradient(circle at 32% 28%, #2a4a6e 0%, #0c1528 42%, #000 78%)',
                  boxShadow:
                    '0 0 0 1px rgba(255,255,255,0.08), inset 0 0 1.5px rgba(0,0,0,0.9)',
                }}
              >
                <div
                  className="absolute inset-[1px] rounded-full"
                  style={{
                    boxShadow: 'inset 0 0 0 0.5px rgba(80,120,180,0.25)',
                  }}
                />
                <div className="absolute left-[1.5px] top-[1px] h-[1.5px] w-[1.5px] rounded-full bg-white/35" />
              </div>
            </div>

            {/* Display glass */}
            <div
              className="relative overflow-hidden rounded-[10px] sm:rounded-[14px]"
              style={{
                boxShadow:
                  'inset 0 0 0 0.5px rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.35)',
              }}
            >
              {/* iPad aspect closer to 4:3 landscape */}
              <div className="aspect-[4/3]">
                <TabletSalesScreen t={t} />
              </div>

              {/* Multi-layer glass reflections */}
              <div
                className="pointer-events-none absolute inset-0 z-20"
                style={{
                  background:
                    'linear-gradient(125deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 18%, transparent 36%, transparent 72%, rgba(255,255,255,0.03) 100%)',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 z-20 opacity-40"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(255,255,255,0.12) 0%, transparent 55%)',
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stand stick (neck) — connects tablet to cash drawer ── */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0.6 }}
        whileInView={{ opacity: 1, scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 mx-auto -mt-px h-8 w-[11%] origin-top sm:h-11 sm:w-[10%]"
        style={{
          background:
            'linear-gradient(90deg, #141417 0%, #2c2c32 22%, #3a3a42 50%, #2c2c32 78%, #141417 100%)',
          clipPath: 'polygon(18% 0, 82% 0, 100% 100%, 0 100%)',
          boxShadow:
            'inset 1px 0 0 rgba(255,255,255,0.08), inset -1px 0 0 rgba(0,0,0,0.35)',
        }}
      >
        {/* Center spine highlight */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 w-[28%] -translate-x-1/2"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        />
      </motion.div>

      {/* ── Cash drawer base ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative z-10 -mt-px"
      >
        <CashDrawer />
      </motion.div>

    </div>
  );
};

export default HeroPosStation;
