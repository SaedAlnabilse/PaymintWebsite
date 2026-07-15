import type { ReactNode } from 'react';
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

/* ───────────────────────── Hardware SVGs (product-shot style) ───────────────────────── */

/** Handheld barcode scanner on charging cradle — left of station */
const BarcodeScannerSvg = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 120 200"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="hs-body" x1="20" y1="10" x2="100" y2="160" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3a3f48" />
        <stop offset="0.45" stopColor="#1e2229" />
        <stop offset="1" stopColor="#0d1014" />
      </linearGradient>
      <linearGradient id="hs-nose" x1="30" y1="8" x2="90" y2="70" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5b6573" />
        <stop offset="1" stopColor="#2a313c" />
      </linearGradient>
      <linearGradient id="hs-cradle" x1="10" y1="150" x2="110" y2="198" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1a1d22" />
        <stop offset="1" stopColor="#0a0c0f" />
      </linearGradient>
      <filter id="hs-shadow" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.28" />
      </filter>
    </defs>
    {/* Soft ground shadow */}
    <ellipse cx="60" cy="188" rx="42" ry="8" fill="#000" opacity="0.12" />
    {/* Cradle base */}
    <g filter="url(#hs-shadow)">
      <path
        d="M18 168c0-6 6-10 14-10h56c8 0 14 4 14 10v18c0 6-6 10-14 10H32c-8 0-14-4-14-10v-18z"
        fill="url(#hs-cradle)"
      />
      <path d="M28 162h64v6H28z" fill="#0f1216" opacity="0.9" />
      <rect x="48" y="172" width="24" height="4" rx="2" fill="#2a3038" />
      {/* LED */}
      <circle cx="88" cy="176" r="2.2" fill="#7dc6a2">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </g>
    {/* Scanner body tilted in cradle */}
    <g transform="translate(14 18) rotate(-8 46 70)" filter="url(#hs-shadow)">
      {/* Nose / scan window */}
      <path
        d="M22 8c0-4 4-7 10-7h28c6 0 10 3 10 7v22c0 5-3 9-8 11l-12 6c-4 2-8 2-12 0l-12-6c-5-2-8-6-8-11V8z"
        fill="url(#hs-nose)"
      />
      <rect x="30" y="14" width="32" height="14" rx="3" fill="#0a0c10" opacity="0.85" />
      <rect x="34" y="17" width="24" height="3" rx="1" fill="#7dc6a2" opacity="0.55">
        <animate attributeName="opacity" values="0.25;0.85;0.25" dur="1.8s" repeatCount="indefinite" />
      </rect>
      <rect x="34" y="22" width="18" height="2" rx="1" fill="#7dc6a2" opacity="0.3" />
      {/* Main handle body */}
      <path
        d="M26 42c-4 0-8 3-8 8v78c0 10 7 18 18 18h20c11 0 18-8 18-18V50c0-5-4-8-8-8H26z"
        fill="url(#hs-body)"
      />
      {/* Side grip rubber */}
      <path d="M22 58h8c2 0 3 1 3 3v52c0 2-1 3-3 3h-8V58z" fill="#12151a" opacity="0.7" />
      <path d="M62 58h8v58h-8c-2 0-3-1-3-3V61c0-2 1-3 3-3z" fill="#12151a" opacity="0.55" />
      {/* Trigger */}
      <path d="M34 72h24c2 0 3 1.5 3 3.5v10c0 2-1 3.5-3 3.5H34c-2 0-3-1.5-3-3.5v-10c0-2 1-3.5 3-3.5z" fill="#2c333d" />
      <rect x="38" y="76" width="16" height="5" rx="2" fill="#7dc6a2" opacity="0.35" />
      {/* Brand pill */}
      <rect x="34" y="118" width="24" height="10" rx="5" fill="#0a0c10" opacity="0.55" />
      <circle cx="46" cy="123" r="2.5" fill="#7dc6a2" opacity="0.85" />
      {/* Specular */}
      <path d="M30 48c8-6 28-8 40 2" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

/** White NFC / card reader + stacked cards — right of station */
const PaymentClusterSvg = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 180 200"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="pc-term" x1="40" y1="90" x2="140" y2="190" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" />
        <stop offset="0.55" stopColor="#f3f5f7" />
        <stop offset="1" stopColor="#e4e8ee" />
      </linearGradient>
      <linearGradient id="pc-visa" x1="70" y1="10" x2="170" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1a56db" />
        <stop offset="1" stopColor="#1e3a8a" />
      </linearGradient>
      <linearGradient id="pc-white" x1="50" y1="40" x2="150" y2="110" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" />
        <stop offset="1" stopColor="#eef1f5" />
      </linearGradient>
      <linearGradient id="pc-chip" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#f0d78c" />
        <stop offset="1" stopColor="#c9a227" />
      </linearGradient>
      <filter id="pc-shadow" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="2" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.18" />
      </filter>
    </defs>

    {/* Blue Visa-style card (back) */}
    <g filter="url(#pc-shadow)" transform="translate(48 8) rotate(18 50 32)">
      <rect width="100" height="64" rx="8" fill="url(#pc-visa)" />
      <rect x="12" y="16" width="18" height="14" rx="2" fill="url(#pc-chip)" opacity="0.95" />
      <text x="70" y="48" fill="#fff" fontSize="11" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1">
        VISA
      </text>
      <path d="M12 54h40" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
      <circle cx="88" cy="20" r="6" fill="#fff" opacity="0.15" />
      <circle cx="80" cy="20" r="6" fill="#fff" opacity="0.1" />
    </g>

    {/* White card (front stack) */}
    <g filter="url(#pc-shadow)" transform="translate(38 34) rotate(10 50 32)">
      <rect width="100" height="64" rx="8" fill="url(#pc-white)" stroke="#d5dae2" strokeWidth="1" />
      <rect x="12" y="16" width="18" height="14" rx="2" fill="url(#pc-chip)" />
      <rect x="12" y="40" width="52" height="4" rx="2" fill="#c5ccd6" />
      <rect x="12" y="48" width="36" height="3" rx="1.5" fill="#d8dee6" />
      {/* Contactless arcs */}
      <path
        d="M78 22c6 4 6 14 0 18M84 18c10 6 10 22 0 28M90 14c14 8 14 30 0 38"
        stroke="#7dc6a2"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </g>

    {/* NFC terminal */}
    <g filter="url(#pc-shadow)" transform="translate(22 96)">
      <ellipse cx="68" cy="88" rx="58" ry="10" fill="#000" opacity="0.1" />
      {/* Body */}
      <rect x="18" y="8" width="100" height="78" rx="16" fill="url(#pc-term)" stroke="#dfe3ea" strokeWidth="1" />
      {/* Top display lip */}
      <rect x="30" y="18" width="76" height="22" rx="6" fill="#0f172a" opacity="0.92" />
      <text x="68" y="33" textAnchor="middle" fill="#7dc6a2" fontSize="9" fontWeight="700" fontFamily="system-ui,sans-serif">
        $13.15
      </text>
      {/* Contactless icon */}
      <g transform="translate(56 48)">
        <circle cx="12" cy="14" r="11" fill="#7dc6a2" opacity="0.12" />
        <path
          d="M4 18c4-8 12-8 16 0M7 15c2.5-5 7.5-5 10 0M10 12c1.2-2.2 2.8-2.2 4 0"
          stroke="#0f172a"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.55"
        />
      </g>
      {/* Brand mark */}
      <rect x="52" y="72" width="32" height="6" rx="3" fill="#7dc6a2" opacity="0.85" />
      {/* Side ports */}
      <rect x="14" y="36" width="4" height="14" rx="1" fill="#c5ccd6" />
      <rect x="118" y="36" width="4" height="10" rx="1" fill="#c5ccd6" />
      {/* Specular */}
      <path d="M28 14c20-6 70-4 90 8" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
    </g>
  </svg>
);

/** Premium cash drawer + receipt printer base under the tablet */
const CashDrawerPrinterSvg = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 420 120"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="cd-top" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#3a3a40" />
        <stop offset="0.4" stopColor="#222226" />
        <stop offset="1" stopColor="#121214" />
      </linearGradient>
      <linearGradient id="cd-face" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#2c2c32" />
        <stop offset="1" stopColor="#101012" />
      </linearGradient>
      <linearGradient id="cd-metal" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#5a5a62" />
        <stop offset="0.5" stopColor="#9a9aa2" />
        <stop offset="1" stopColor="#4a4a52" />
      </linearGradient>
      <filter id="cd-shadow" x="-10%" y="-20%" width="120%" height="160%">
        <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.32" />
      </filter>
    </defs>
    <ellipse cx="210" cy="108" rx="170" ry="10" fill="#000" opacity="0.14" />
    <g filter="url(#cd-shadow)">
      {/* Main body */}
      <path
        d="M28 28c0-10 8-18 18-18h328c10 0 18 8 18 18v52c0 14-10 24-24 24H52c-14 0-24-10-24-24V28z"
        fill="url(#cd-top)"
      />
      {/* Top deck plate */}
      <path
        d="M40 18h340c6 0 10 4 10 10v8H30v-8c0-6 4-10 10-10z"
        fill="url(#cd-metal)"
        opacity="0.55"
      />
      {/* Status LEDs */}
      <circle cx="56" cy="28" r="3" fill="#7dc6a2">
        <animate attributeName="opacity" values="0.55;1;0.55" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="70" cy="28" r="3" fill="#fbbf24" opacity="0.85" />
      <circle cx="84" cy="28" r="3" fill="#64748b" opacity="0.7" />
      {/* Receipt slot */}
      <rect x="150" y="22" width="120" height="8" rx="2" fill="#0a0a0c" />
      <rect x="158" y="14" width="104" height="12" rx="1" fill="#f8fafc" opacity="0.92" />
      <path d="M162 18h96M162 21h72M162 24h88" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.7" />
      {/* Drawer face */}
      <path
        d="M48 48h324c6 0 10 4 10 10v28c0 8-6 14-14 14H52c-8 0-14-6-14-14V58c0-6 4-10 10-10z"
        fill="url(#cd-face)"
      />
      <rect x="58" y="56" width="304" height="36" rx="6" stroke="#fff" strokeOpacity="0.06" />
      {/* Handle slot */}
      <rect x="150" y="68" width="120" height="10" rx="5" fill="#050506" />
      <rect x="156" y="70" width="108" height="4" rx="2" fill="#2a2a30" opacity="0.8" />
      {/* Keyhole */}
      <circle cx="340" cy="73" r="6" fill="#0a0a0c" stroke="#3a3a42" strokeWidth="1" />
      <rect x="338.5" y="73" width="3" height="7" rx="1" fill="#1a1a20" />
      {/* Brand star mark (center) */}
      <path
        d="M210 36l1.6 3.4 3.7.5-2.7 2.6.6 3.7-3.2-1.7-3.2 1.7.6-3.7-2.7-2.6 3.7-.5L210 36z"
        fill="#7dc6a2"
        opacity="0.9"
      />
      {/* Front edge highlight */}
      <path d="M52 100h316" stroke="#fff" strokeOpacity="0.06" strokeWidth="1" />
    </g>
  </svg>
);

const TabletBezel = ({ children }: { children: ReactNode }) => (
  <div
    className="relative rounded-[18px] p-[2px] sm:rounded-[26px] sm:p-[2.5px]"
    style={{
      background:
        'linear-gradient(145deg, #6e6e73 0%, #3a3a3c 18%, #8e8e93 36%, #1c1c1e 55%, #5c5c60 78%, #2c2c2e 100%)',
      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.28), 0 28px 50px -18px rgba(0,0,0,0.45), 0 12px 20px -12px rgba(0,0,0,0.3)',
    }}
  >
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
    <div
      className="absolute -right-[3px] top-[30%] z-40 h-[16%] w-[3px] rounded-r-[2px] sm:-right-[3.5px] sm:w-[3.5px]"
      style={{
        background: 'linear-gradient(270deg, #5a5a5e, #2a2a2c)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    />
    <div
      className="relative overflow-hidden rounded-[16px] px-2 pb-2 pt-[15px] sm:rounded-[23px] sm:px-2.5 sm:pb-2.5 sm:pt-[18px]"
      style={{
        background: 'linear-gradient(180deg, #1a1a1c 0%, #0a0a0b 45%, #111113 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[15px] items-center justify-center sm:h-[18px]">
        <div
          className="relative h-[6px] w-[6px] rounded-full sm:h-[7px] sm:w-[7px]"
          style={{
            background: 'radial-gradient(circle at 32% 28%, #2a4a6e 0%, #0c1528 42%, #000 78%)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), inset 0 0 1.5px rgba(0,0,0,0.9)',
          }}
        >
          <div className="absolute left-[1.5px] top-[1px] h-[1.5px] w-[1.5px] rounded-full bg-white/35" />
        </div>
      </div>
      <div
        className="relative overflow-hidden rounded-[10px] sm:rounded-[14px]"
        style={{
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.35)',
        }}
      >
        {children}
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
);

/* ───────────────────────── Full station ───────────────────────── */

export const HeroPosStation = () => {
  const { t } = useTranslation();

  return (
    <div
      role="img"
      aria-label={t('landing.hero.alt', 'Mintcom All-in-One POS System')}
      className="relative mx-auto w-full max-w-[720px] select-none"
    >
      {/* Soft product-studio backdrop (matches reference mint plate) */}
      <div
        className="pointer-events-none absolute inset-[-6%] -z-10 rounded-[40%] opacity-90 dark:opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 58%, rgba(125,198,162,0.28) 0%, rgba(125,198,162,0.1) 42%, transparent 72%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[4%] left-[8%] right-[8%] -z-10 h-[18%] rounded-[100%]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.12) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Layout: scanner | tablet stack | payments */}
      <div className="relative grid grid-cols-[0.78fr_2.2fr_0.95fr] items-end gap-0 sm:gap-1">
        {/* ── Left: barcode scanner ── */}
        <motion.div
          initial={{ opacity: 0, x: -24, rotate: -6 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, delay: 0.15 }}
          className="relative z-10 mb-[6%] -me-1 sm:mb-[8%] sm:-me-2"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BarcodeScannerSvg className="h-auto w-full drop-shadow-xl" />
          </motion.div>
        </motion.div>

        {/* ── Center: tablet + stand + drawer ── */}
        <div className="relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full"
          >
            <TabletBezel>
              <div className="aspect-[4/3]">
                <TabletSalesScreen t={t} />
              </div>
            </TabletBezel>
          </motion.div>

          {/* Stand neck */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0.6 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10 mx-auto -mt-px h-7 w-[12%] origin-top sm:h-10 sm:w-[11%]"
            style={{
              background:
                'linear-gradient(90deg, #141417 0%, #2c2c32 22%, #3a3a42 50%, #2c2c32 78%, #141417 100%)',
              clipPath: 'polygon(18% 0, 82% 0, 100% 100%, 0 100%)',
              boxShadow:
                'inset 1px 0 0 rgba(255,255,255,0.08), inset -1px 0 0 rgba(0,0,0,0.35)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-1/2 w-[28%] -translate-x-1/2"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
              }}
            />
          </motion.div>

          {/* Cash drawer / printer base */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative z-10 -mt-1"
          >
            <CashDrawerPrinterSvg className="mx-auto h-auto w-[108%] max-w-none -translate-x-[4%]" />
          </motion.div>
        </div>

        {/* ── Right: cards + NFC terminal ── */}
        <motion.div
          initial={{ opacity: 0, x: 28, rotate: 6 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, delay: 0.22 }}
          className="relative z-30 mb-[2%] -ms-2 sm:mb-[4%] sm:-ms-3"
        >
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          >
            <PaymentClusterSvg className="h-auto w-full drop-shadow-xl" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroPosStation;
