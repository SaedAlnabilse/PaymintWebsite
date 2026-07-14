import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Zap,
  Settings,
  Store,
  Play,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Users,
  Lock,
  Building2,
} from 'lucide-react';

type FeatureId = 'complete' | 'realUsers' | 'security' | 'multiBranch';

type Feature = {
  id: FeatureId;
  icon: typeof Store;
  title: string;
  description: string;
  teaser: string;
  highlights: string[];
};

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction * 56,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    x: direction * -56,
    opacity: 0,
    transition: { duration: 0.22 },
  }),
};

/** Calm text card — click opens modal (same language as Cloud Control / Features). */
const FeatureCard = ({
  feature,
  index,
  t,
  onOpen,
}: {
  feature: Feature;
  index: number;
  t: (...args: any[]) => any;
  onOpen: (index: number) => void;
}) => {
  const Icon = feature.icon;

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-start shadow-lg shadow-gray-200/30 transition-colors duration-300 hover:border-mintcom-green/40 hover:shadow-xl hover:shadow-mintcom-green/10 dark:border-white/5 dark:bg-[#121212] dark:shadow-none dark:hover:border-mintcom-green/30 sm:p-7"
    >
      <div className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-mintcom-green/10 transition-colors duration-300 group-hover:bg-mintcom-green dark:bg-mintcom-green/15">
        <Icon
          size={22}
          className="text-mintcom-green transition-colors duration-300 group-hover:text-white"
        />
      </div>

      <h3 className="relative z-10 font-barlow text-lg font-bold leading-snug tracking-tight text-gray-900 transition-colors group-hover:text-mintcom-green dark:text-white sm:text-xl">
        {feature.title}
      </h3>

      <p className="relative z-10 mt-3 line-clamp-4 flex-1 font-barlow text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">
        {feature.description}
      </p>

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/[0.06]">
        <span className="text-xs font-bold text-mintcom-green">
          {t('landing.features.readMore', 'Read more')} →
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
          {index + 1}/4
        </span>
      </div>
    </button>
  );
};

/** Rich mini dashboards for each pillar — fill the pane, no empty dead space. */
const FeaturePreview = ({ id, isRtl }: { id: FeatureId; isRtl: boolean }) => {
  if (id === 'complete') {
    const modules = isRtl
      ? [
          { icon: '📊', name: 'تقارير', sub: 'فلاتر + ورديات' },
          { icon: '👥', name: 'موظفين', sub: 'أدوار وصلاحيات' },
          { icon: '🎁', name: 'ولاء', sub: 'نقاط ومكافآت' },
          { icon: '📦', name: 'مخزون', sub: 'مواد خام + أصناف' },
          { icon: '🏷️', name: 'خصومات', sub: 'قواعد مرنة' },
          { icon: '💳', name: 'مدفوعات', sub: 'نقد · بطاقة · أخرى' },
        ]
      : [
          { icon: '📊', name: 'Reports', sub: 'Filters + shifts' },
          { icon: '👥', name: 'Staff', sub: 'Roles & perms' },
          { icon: '🎁', name: 'Loyalty', sub: 'Points & gifts' },
          { icon: '📦', name: 'Stock', sub: 'Raw + items' },
          { icon: '🏷️', name: 'Discounts', sub: 'Flexible rules' },
          { icon: '💳', name: 'Payments', sub: 'Cash · card · more' },
        ];
    const bars = [38, 52, 44, 68, 55, 82, 60, 95, 72, 88, 65, 78];

    return (
      <div className="flex h-full flex-col gap-2.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
              {isRtl ? 'لوحة واحدة' : 'One plan · everything'}
            </p>
            <p className="text-xs font-black text-gray-900 dark:text-white">
              {isRtl ? 'حل متكامل بدون رسوم خفية' : 'Complete stack · fixed monthly'}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-mintcom-green px-2 py-0.5 text-[9px] font-black text-black">
            {isRtl ? 'مشمول' : 'Included'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { l: isRtl ? 'مبيعات' : 'Sales', v: '$24.8K', d: '+12%' },
            { l: isRtl ? 'طلبات' : 'Orders', v: '1,402', d: '+8%' },
            { l: isRtl ? 'موظفين' : 'Staff', v: '18', d: 'live' },
          ].map((k) => (
            <div
              key={k.l}
              className="rounded-xl border border-mintcom-green/25 bg-gradient-to-br from-mintcom-green/15 to-transparent px-2 py-1.5"
            >
              <p className="text-[8px] font-bold uppercase tracking-wide text-gray-500">{k.l}</p>
              <p className="font-mono text-sm font-black tabular-nums text-mintcom-green">{k.v}</p>
              <p className="text-[9px] font-bold text-mintcom-green/80">{k.d}</p>
            </div>
          ))}
        </div>

        <div className="min-h-0 flex-1 rounded-xl border border-gray-200/80 bg-gray-50/90 p-2 dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
              {isRtl ? 'اتجاه 12 يوم' : '12-day trend'}
            </span>
            <span className="font-mono text-[9px] text-mintcom-green">▲ 9.2%</span>
          </div>
          <div className="flex h-[72px] items-end gap-0.5">
            {bars.map((h, i) => (
              <div key={i} className="relative flex flex-1 flex-col justify-end">
                <div
                  style={{ height: `${h}%` }}
                  className={`w-full rounded-t-[3px] ${
                    i === bars.length - 1
                      ? 'bg-mintcom-green shadow-[0_0_8px_rgba(125,198,162,0.5)]'
                      : 'bg-gradient-to-t from-mintcom-green/35 to-mintcom-green/85'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {modules.map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-1.5 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]"
            >
              <span className="text-sm leading-none">{m.icon}</span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold text-gray-900 dark:text-white">{m.name}</p>
                <p className="truncate text-[8px] text-gray-400">{m.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === 'realUsers') {
    const people = isRtl
      ? [
          { emoji: '👩‍💼', role: 'كاشير', name: 'سارة', tip: 'بيع · قبض · طباعة', steps: '3 نقرات' },
          { emoji: '👨‍🍳', role: 'باريستا', name: 'عمر', tip: 'قائمة + إضافات', steps: 'سريع' },
          { emoji: '👩‍💻', role: 'مدير', name: 'مايا', tip: 'وردية · تقارير', steps: 'فوري' },
          { emoji: '🧑‍💼', role: 'مالك', name: 'أنت', tip: 'كل الفروع', steps: 'نظرة واحدة' },
        ]
      : [
          { emoji: '👩‍💼', role: 'Cashier', name: 'Sara', tip: 'Sell · pay · print', steps: '3 taps' },
          { emoji: '👨‍🍳', role: 'Barista', name: 'Omar', tip: 'Menu + add-ons', steps: 'Fast' },
          { emoji: '👩‍💻', role: 'Manager', name: 'Maya', tip: 'Shift · reports', steps: 'Instant' },
          { emoji: '🧑‍💼', role: 'Owner', name: 'You', tip: 'All locations', steps: 'One view' },
        ];

    return (
      <div className="flex h-full flex-col gap-2.5 p-3">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-mintcom-green/25 bg-gradient-to-r from-mintcom-green/15 to-transparent px-2.5 py-2">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-mintcom-green" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {isRtl ? 'فرق حقيقية' : 'Real teams'}
              </p>
              <p className="text-xs font-black text-gray-900 dark:text-white">
                {isRtl ? 'مصمم مع من يستخدمه يومياً' : 'Designed with daily users'}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-mintcom-green/20 px-2 py-0.5 text-[9px] font-bold text-mintcom-green">
            UX
          </span>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
          {people.map((p) => (
            <div
              key={p.role}
              className="flex flex-col justify-between rounded-xl border border-gray-200/90 bg-gray-50/90 p-2 dark:border-white/[0.08] dark:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xl leading-none">{p.emoji}</span>
                <span className="rounded-md bg-mintcom-green/15 px-1.5 py-0.5 text-[8px] font-black text-mintcom-green">
                  {p.steps}
                </span>
              </div>
              <div className="mt-1.5">
                <p className="text-[11px] font-black text-gray-900 dark:text-white">{p.name}</p>
                <p className="text-[9px] font-bold text-mintcom-green">{p.role}</p>
                <p className="mt-0.5 text-[9px] text-gray-500">{p.tip}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-dashed border-mintcom-green/30 bg-mintcom-green/5 px-2.5 py-1.5">
          <Zap size={12} className="shrink-0 text-mintcom-green" />
          <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
            {isRtl
              ? 'لا خبرة تقنية مطلوبة — تعلّم في دقائق'
              : 'No tech degree required — learn in minutes'}
          </p>
        </div>
      </div>
    );
  }

  if (id === 'security') {
    const controls = isRtl
      ? [
          { label: 'تشفير النقل والتخزين', ok: true },
          { label: 'نسخ احتياطي يومي', ok: true },
          { label: 'أرشفة آمنة', ok: true },
          { label: 'صلاحيات حسب الدور', ok: true },
          { label: 'سجل نشاط', ok: true },
          { label: 'جلسات آمنة', ok: true },
        ]
      : [
          { label: 'Encryption in transit & at rest', ok: true },
          { label: 'Daily automatic backups', ok: true },
          { label: 'Secure archival', ok: true },
          { label: 'Role-based access', ok: true },
          { label: 'Activity audit log', ok: true },
          { label: 'Secure sessions', ok: true },
        ];

    return (
      <div className="flex h-full flex-col gap-2.5 p-3">
        <div className="relative overflow-hidden rounded-2xl border border-mintcom-green/30 bg-gradient-to-br from-mintcom-green/20 via-mintcom-green/5 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mintcom-green text-black shadow-md shadow-mintcom-green/30">
                <ShieldCheck size={20} strokeWidth={2.25} />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  {isRtl ? 'درجة الحماية' : 'Security score'}
                </p>
                <p className="text-lg font-black tabular-nums text-gray-900 dark:text-white">
                  98<span className="text-sm text-mintcom-green">/100</span>
                </p>
              </div>
            </div>
            <span className="rounded-full bg-mintcom-green px-2.5 py-1 text-[10px] font-black text-black">
              {isRtl ? 'محمي' : 'Protected'}
            </span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-mintcom-green to-emerald-400" />
          </div>
          <p className="mt-1.5 text-[9px] font-medium text-gray-500">
            {isRtl ? 'تشفير · نسخ · صلاحيات · أرشفة' : 'Encrypt · backup · permissions · archive'}
          </p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5">
          {controls.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-gray-50/90 px-2 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-mintcom-green text-black">
                <Check size={9} strokeWidth={3} />
              </span>
              <span className="truncate text-[10px] font-semibold leading-tight text-gray-800 dark:text-gray-100">
                {c.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-gray-900 px-2.5 py-1.5 dark:bg-black/50">
          <Lock size={11} className="text-mintcom-green" />
          <p className="font-mono text-[9px] text-mintcom-green/90">
            TLS 1.3 · AES-256 · RBAC
          </p>
        </div>
      </div>
    );
  }

  // multiBranch
  const locs = isRtl
    ? [
        { n: 'وسط البلد', on: true, rev: '$8.2K', orders: 48 },
        { n: 'المول', on: true, rev: '$6.1K', orders: 36 },
        { n: 'المطار', on: true, rev: '$5.4K', orders: 29 },
        { n: 'الجانب الغربي', on: false, rev: '—', orders: 0 },
      ]
    : [
        { n: 'Downtown', on: true, rev: '$8.2K', orders: 48 },
        { n: 'Mall', on: true, rev: '$6.1K', orders: 36 },
        { n: 'Airport', on: true, rev: '$5.4K', orders: 29 },
        { n: 'West Side', on: false, rev: '—', orders: 0 },
      ];

  return (
    <div className="flex h-full flex-col gap-2.5 p-3">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-mintcom-green/25 bg-gradient-to-r from-mintcom-green/15 to-transparent px-2.5 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mintcom-green text-black">
            <Building2 size={15} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-gray-900 dark:text-white">Cafe Delight</p>
            <p className="text-[9px] font-medium text-gray-500">
              {isRtl ? 'علامة · 4 مواقع' : 'Brand · 4 locations'}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-end">
          <p className="font-mono text-xs font-black text-mintcom-green">$19.7K</p>
          <p className="text-[8px] font-bold uppercase text-gray-400">
            {isRtl ? 'اليوم' : 'today'}
          </p>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5">
        {locs.map((loc) => (
          <div
            key={loc.n}
            className={`flex flex-col justify-between rounded-xl border p-2 ${
              loc.on
                ? 'border-gray-200/90 bg-gray-50/90 dark:border-white/[0.08] dark:bg-white/[0.04]'
                : 'border-gray-200/40 bg-gray-50/40 opacity-55 dark:border-white/5 dark:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  loc.on ? 'bg-mintcom-green shadow-[0_0_6px_rgba(125,198,162,0.8)]' : 'bg-gray-400'
                }`}
              />
              <span className="truncate text-[11px] font-bold text-gray-900 dark:text-white">{loc.n}</span>
            </div>
            <div className="mt-1.5 flex items-end justify-between gap-1">
              <span className="font-mono text-[11px] font-black text-mintcom-green">{loc.rev}</span>
              <span className="text-[8px] font-bold text-gray-400">
                {loc.on
                  ? `${loc.orders} ${isRtl ? 'طلب' : 'ord'}`
                  : isRtl
                    ? 'مغلق'
                    : 'offline'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200/80 bg-white px-2.5 py-1.5 dark:border-white/8 dark:bg-white/[0.03]">
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
          {isRtl ? 'لوحة موحّدة' : 'Unified dashboard'}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-mintcom-green">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mintcom-green" />
          3/4 live
        </span>
      </div>
    </div>
  );
};

const FeatureModal = ({
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
  features: Feature[];
  activeIndex: number;
  direction: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpTo: (i: number) => void;
  t: (...args: any[]) => any;
  isRtl: boolean;
}) => {
  const feature = features[activeIndex];
  if (!feature) return null;
  const Icon = feature.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 12 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-[0_40px_100px_-24px_rgba(0,0,0,0.55)] dark:border-white/[0.08] dark:bg-[#121214]"
        dir={isRtl ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="true"
        aria-label={feature.title}
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-mintcom-green/15 via-transparent to-transparent px-5 pb-4 pt-14 dark:border-white/[0.06] dark:from-mintcom-green/20 sm:px-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 end-10 h-48 w-48 rounded-full bg-mintcom-green/20 blur-3xl"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label={String(t('common.close', 'Close'))}
            className="absolute end-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-gray-500 shadow-sm backdrop-blur transition-colors hover:bg-white dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
          >
            <X size={16} strokeWidth={2.5} />
          </button>

          <div className="absolute start-4 top-4 z-30 flex items-center gap-1 rounded-full bg-mintcom-green/10 px-3 py-1 text-xs font-bold text-mintcom-green">
            <span className="tabular-nums">{activeIndex + 1}</span>
            <span className="opacity-50">/</span>
            <span className="tabular-nums opacity-70">{features.length}</span>
          </div>

          {/* Feature path chips */}
          <div className="relative z-10 flex flex-wrap items-center gap-1.5 sm:gap-2">
            {features.map((f, i) => {
              const on = i === activeIndex;
              const FIcon = f.icon;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onJumpTo(i)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                    on
                      ? 'bg-mintcom-green text-black shadow-sm shadow-mintcom-green/30'
                      : 'bg-white/70 text-gray-500 hover:bg-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
                  }`}
                >
                  <FIcon size={12} />
                  <span className="hidden max-w-[100px] truncate sm:inline">{f.teaser}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative max-h-[min(78vh,720px)] overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative z-10 p-6 md:p-8 lg:p-10"
            >
              <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)] lg:gap-10">
                {/* Story */}
                <div className="order-2 flex min-w-0 flex-col lg:order-1">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-mintcom-green to-emerald-600 text-white shadow-md shadow-mintcom-green/30">
                    <Icon size={26} />
                  </div>

                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-mintcom-green">
                    {feature.teaser}
                  </p>

                  <h3 className="font-barlow text-2xl font-black leading-snug tracking-tight text-gray-900 dark:text-white md:text-3xl">
                    {feature.title}
                  </h3>

                  <p className="mt-4 max-w-md font-barlow text-[15px] font-medium leading-relaxed text-gray-600 dark:text-gray-300 md:text-base">
                    {feature.description}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {feature.highlights.map((line) => (
                      <li
                        key={line}
                        className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.03]"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mintcom-green text-black">
                          <Check size={11} strokeWidth={3} />
                        </span>
                        <span className="text-sm font-semibold leading-snug text-gray-800 dark:text-gray-100">
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preview pane */}
                <div className="order-1 flex w-full flex-col justify-center lg:order-2">
                  <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50 shadow-xl dark:border-white/10 dark:from-[#1a1a1c] dark:to-[#0e0e10]">
                    <div className="flex items-center gap-1.5 border-b border-gray-200/80 bg-gray-50/90 px-3 py-2 dark:border-white/8 dark:bg-[#222226]">
                      <span className="h-2 w-2 rounded-full bg-red-400/90" />
                      <span className="h-2 w-2 rounded-full bg-amber-400/90" />
                      <span className="h-2 w-2 rounded-full bg-mintcom-green" />
                      <span className="ms-auto font-mono text-[10px] text-gray-400">
                        mintcom · {feature.id}
                      </span>
                    </div>
                    <div className="h-[280px] sm:h-[300px]">
                      <FeaturePreview id={feature.id} isRtl={isRtl} />
                    </div>
                    <p className="border-t border-gray-100 px-3 py-2.5 text-center text-[11px] font-medium text-gray-400 dark:border-white/[0.06]">
                      {isRtl ? 'معاينة حية' : 'Live preview'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-4 py-4 dark:border-white/[0.06] dark:bg-black/30 sm:px-8">
          <button
            type="button"
            onClick={onPrev}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:px-4"
          >
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <span className="hidden sm:inline">{t('common.previous', 'Previous')}</span>
          </button>

          <div className="flex max-w-[58%] items-center gap-1.5 overflow-x-auto no-scrollbar sm:gap-2">
            {features.map((f, i) => {
              const FIcon = f.icon;
              const on = i === activeIndex;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onJumpTo(i)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold transition-colors sm:text-[11px] ${
                    on
                      ? 'bg-mintcom-green text-black shadow-sm shadow-mintcom-green/30'
                      : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:ring-mintcom-green/40 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10'
                  }`}
                >
                  <FIcon size={12} />
                  <span className="hidden md:inline">{f.teaser}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 rounded-xl bg-mintcom-green px-3 py-2.5 text-sm font-bold text-black shadow-[0_6px_24px_-6px_rgba(125,198,162,0.55)] transition-colors hover:brightness-105 sm:px-4"
          >
            <span className="hidden sm:inline">{t('common.next', 'Next')}</span>
            {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const WhyChooseUs = () => {
  const { t } = useTranslation();
  const isRtl = t('common.locale') === 'ar';
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const videoRef = useRef<HTMLDivElement>(null);

  // Plain highlight strings — avoid t('…h1') missing-key → "H1"
  const features: Feature[] = [
    {
      id: 'complete',
      icon: Store,
      title: t('landing.features.cards.complete.title'),
      description: t('landing.features.cards.complete.description'),
      teaser: isRtl ? 'حل كامل' : 'Complete',
      highlights: isRtl
        ? [
            'تقارير متقدمة مع فلاتر وموظفين وأدوار',
            'لا رسوم خفية — كل شيء في الباقة',
            'محرك تقارير قوي جاهز من اليوم الأول',
          ]
        : [
            'Advanced reporting with filters, staff & roles',
            'No hidden fees — everything in the package',
            'Powerful reporting engine from day one',
          ],
    },
    {
      id: 'realUsers',
      icon: Zap,
      title: t('landing.features.cards.realUsers.title'),
      description: t('landing.features.cards.realUsers.description'),
      teaser: isRtl ? 'مستخدمون حقيقيون' : 'Real users',
      highlights: isRtl
        ? [
            'مصمم مع أصحاب أعمال وكاشيرين ومديرين',
            'واجهة بسيطة بدون خبرة تقنية',
            'تدفقات عمل مبنية من الاستخدام اليومي',
          ]
        : [
            'Designed with owners, cashiers & managers',
            'Simple UI — no tech expertise required',
            'Workflows shaped by real daily use',
          ],
    },
    {
      id: 'security',
      icon: ShieldCheck,
      title: t('landing.features.cards.security.title'),
      description: t('landing.features.cards.security.description'),
      teaser: isRtl ? 'أمان' : 'Security',
      highlights: isRtl
        ? [
            'تشفير كامل للبيانات أثناء النقل والتخزين',
            'نسخ احتياطي وأرشفة تلقائية',
            'استثمار في حماية على مستوى المؤسسات',
          ]
        : [
            'Fully encrypted data in transit and at rest',
            'Automatic backups and secure archival',
            'Enterprise-grade protection investment',
          ],
    },
    {
      id: 'multiBranch',
      icon: Settings,
      title: t('landing.features.cards.multiBranch.title'),
      description: t('landing.features.cards.multiBranch.description'),
      teaser: isRtl ? 'فروع متعددة' : 'Multi-branch',
      highlights: isRtl
        ? [
            'متجر واحد أو فروع متعددة تحت لوحة واحدة',
            'علامات تجارية منفصلة أو مدمجة',
            'تقارير موحدة عبر كل المواقع',
          ]
        : [
            'One store or many under a single dashboard',
            'Merged branches or separate brands',
            'Unified reporting across every location',
          ],
    },
  ];

  const handleOpen = useCallback((index: number) => {
    setDirection(1);
    setActiveCard(index);
  }, []);
  const handleClose = useCallback(() => setActiveCard(null), []);
  const handlePrev = useCallback(() => {
    setDirection(isRtl ? 1 : -1);
    setActiveCard((i) => (i === null ? null : (i - 1 + features.length) % features.length));
  }, [features.length, isRtl]);
  const handleNext = useCallback(() => {
    setDirection(isRtl ? -1 : 1);
    setActiveCard((i) => (i === null ? null : (i + 1) % features.length));
  }, [features.length, isRtl]);
  const handleJumpTo = useCallback((target: number) => {
    setActiveCard((i) => {
      if (i === null) return target;
      setDirection(target > i ? 1 : -1);
      return target;
    });
  }, []);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVideoLoaded) {
            setIsVideoVisible(true);
            setIsVideoLoaded(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px', threshold: 0 },
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [isVideoLoaded]);

  return (
    <section
      id="why-mintcom"
      className="relative overflow-hidden bg-gray-50 py-16 dark:bg-[#0f0f0f] lg:py-20"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="absolute end-0 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-mintcom-green/5 blur-[120px]" />
      <div className="absolute bottom-0 start-0 -z-10 h-[400px] w-[400px] rounded-full bg-mintcom-green/3 blur-[100px]" />

      <div className="container mx-auto max-w-[1280px] px-6 md:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center lg:mb-16"
        >
          <div className="group relative mx-auto mb-8 inline-flex items-center gap-2.5 rounded-[12px] border border-mintcom-green/20 bg-mintcom-green/5 px-3.5 py-1.5 text-xs font-bold text-mintcom-green backdrop-blur-md dark:bg-mintcom-green/10">
            <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-[6px] bg-mintcom-green/20 text-mintcom-green">
              <Sparkles size={11} className="relative z-10" />
            </div>
            <span className="text-[10px] uppercase leading-none tracking-widest md:text-[11px]">
              {t('landing.features.badge')}
            </span>
          </div>

          <h2 className="mb-6 font-magilio text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-6xl">
            <span className="text-gray-900 dark:text-white">{t('landing.features.title')}</span>{' '}
            <span className="text-mintcom-green">{t('landing.features.titleHighlight')}</span>
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-base font-light leading-relaxed text-gray-600 dark:text-gray-400 xs:text-lg sm:text-xl">
            {t('landing.features.subtitle')}
          </p>
        </motion.div>

        <div className="flex flex-col gap-16 lg:gap-24">
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                index={index}
                t={t}
                onOpen={handleOpen}
              />
            ))}
          </div>

          {/* Video Section */}
          <motion.div
            ref={videoRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="mx-auto w-full max-w-7xl"
          >
            <div className="group relative aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:border-white/10">
              {isVideoVisible ? (
                <iframe
                  src=""
                  className="h-full w-full scale-[1.02] transition-transform duration-1000 group-hover:scale-100"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  style={{ pointerEvents: 'none' }}
                  loading="lazy"
                  title={t('landing.features.videoTitle')}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-mintcom-green/20">
                      <Play className="h-10 w-10 text-mintcom-green" fill="currentColor" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-white/60">
                      {t('common.loadingVideo')}
                    </p>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="pointer-events-none absolute bottom-8 start-8 end-8 z-10 text-white md:bottom-12 md:start-12">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 shadow-lg backdrop-blur-md">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mintcom-green" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                    {t('landing.features.liveDemo')}
                  </span>
                </div>
                <h4 className="mb-2 font-barlow text-2xl font-bold tracking-tighter text-white xs:text-3xl md:text-5xl">
                  {t('landing.features.seeInAction')}
                </h4>
                <p className="text-base font-medium text-white/70 md:text-lg">
                  {t('landing.features.seamlessSync')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {activeCard !== null && (
          <FeatureModal
            features={features}
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
