import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
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
  Users,
  Check,
  Smartphone,
  BarChart3,
  Heart,
  Package,
  CreditCard,
  ChefHat,
  Cloud,
  Menu,
  Bell,
  Shield,
  CircleCheck,
  Home,
  ShoppingBag,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  MapPin,
  User,
  Lock,
  Eye,
  Coffee,
  Briefcase,
} from 'lucide-react';
import { Logo } from './Logo';
import { FeaturePosScreenshot } from './FeaturePosScreenshot';
import { FeatureScreenshot } from './FeatureScreenshots';

/**
 * Shared outer frame for ALL 4 Why cards.
 * Fixed 3:2 ratio — identical pixel size on every slide (matches card 2 sales).
 * Story column is forced to this height so the modal never grows on card 1.
 */
const WHY_PREVIEW_FRAME_CLASS = 'relative aspect-[3/2] w-full overflow-hidden';


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

/** Card chrome matches Features WorkflowFeatureCard — icon + title row, Learn more. */
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.08, duration: 0.5 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative flex h-full min-h-[248px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/30 transition-all duration-500 hover:border-mintcom-green/40 hover:shadow-2xl hover:shadow-mintcom-green/10 dark:border-white/5 dark:bg-[#121212] dark:shadow-none"
    >
      <div className="relative z-10 mb-4 flex min-h-[56px] items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-mintcom-green/10 shadow-inner transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-mintcom-green dark:bg-mintcom-green/15">
          <Icon
            size={22}
            className="text-mintcom-green transition-colors duration-500 group-hover:text-white"
          />
        </div>
        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] font-sans text-base font-bold leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-mintcom-green dark:text-white">
          {feature.title}
        </h3>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between">
        <p className="line-clamp-3 min-h-[3.75rem] font-sans text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">
          {feature.description}
        </p>

        <button
          type="button"
          onClick={() => onOpen(index)}
          className="mt-3 self-start font-sans text-xs font-bold tracking-wide text-mintcom-green transition-colors hover:text-mintcom-green/80 focus:outline-none"
        >
          {t('landing.features.readMore', 'Learn more')}
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Static try-pos sign-in snapshot — fills the Why card edge-to-edge.
 * Fluid layout (no scale-crop). Not interactive; text is selectable to copy.
 */
function WhyRealPosLoginPreview({ isRtl }: { isRtl?: boolean }) {
  return (
    <div
      role="img"
      aria-label={
        isRtl ? 'شاشة تسجيل الدخول في نقطة البيع' : 'Mintcom POS sign-in screen'
      }
      className="flex h-full w-full cursor-text select-text overflow-hidden bg-white font-sans dark:bg-mintcom-dark"
    >
      {/* Left: form — fills remaining width */}
      <div className="relative flex min-h-0 min-w-0 flex-[1.15] flex-col overflow-hidden">
        {/* Location chip (back + pin + name) */}
        <div className="flex shrink-0 items-start px-4 pb-0 pt-4 sm:px-5 sm:pt-5">
          <div className="flex max-w-full items-center rounded-xl border border-gray-200 bg-white py-1 pe-3 ps-1 shadow-sm dark:border-white/10 dark:bg-mintcom-surface">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mintcom-green text-white shadow-md shadow-mintcom-green/30 sm:h-10 sm:w-10">
              <ArrowLeft size={18} strokeWidth={2.5} className="sm:hidden" />
              <ArrowLeft size={20} strokeWidth={2.5} className="hidden sm:block" />
            </span>
            <span className="mx-2 h-7 w-px shrink-0 bg-gray-100 dark:bg-white/10 sm:mx-2.5 sm:h-8" />
            <span className="me-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mintcom-green/10 text-mintcom-green sm:me-2.5 sm:h-10 sm:w-10">
              <MapPin size={16} strokeWidth={2.25} className="sm:hidden" />
              <MapPin size={18} strokeWidth={2.25} className="hidden sm:block" />
            </span>
            <span className="min-w-0 pe-1 text-start">
              <span className="block text-[9px] font-extrabold uppercase tracking-wide text-mintcom-green sm:text-[10px]">
                {isRtl ? 'الموقع الحالي' : 'Current location'}
              </span>
              <span className="block truncate text-[13px] font-semibold text-gray-900 dark:text-white sm:text-sm">
                Cafe Delight
              </span>
            </span>
          </div>
        </div>

        {/* Centered form body */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-3 sm:px-6 sm:py-4">
          <div className="w-full max-w-[320px]">
            <p className="text-center font-sans text-[22px] font-extrabold leading-tight text-gray-900 dark:text-white sm:text-[26px] md:text-[28px]">
              {isRtl ? 'مرحباً بعودتك!' : 'Welcome Back!'}
            </p>
            <p className="mb-4 mt-1.5 text-center text-[12px] text-gray-500 dark:text-gray-400 sm:mb-5 sm:text-[13px]">
              {isRtl
                ? 'سجّل دخولك ببيانات الموظف'
                : 'Log in using your employee credentials'}
            </p>

            {/* Username — full field, icons inside padding */}
            <div className="mb-3 flex h-11 w-full items-center gap-2.5 rounded-xl border border-mintcom-green bg-white px-3.5 dark:bg-mintcom-surface sm:mb-3.5 sm:h-12">
              <User size={18} className="shrink-0 text-mintcom-green" />
              <span className="min-w-0 truncate text-[14px] text-gray-900 dark:text-white sm:text-[15px]">
                Sara
              </span>
            </div>

            {/* Password */}
            <div className="mb-1 flex h-11 w-full items-center gap-2.5 rounded-xl border border-gray-300 bg-white px-3.5 dark:border-white/15 dark:bg-mintcom-surface sm:h-12">
              <Lock size={18} className="shrink-0 text-gray-400" />
              <span className="min-w-0 flex-1 text-[14px] tracking-widest text-gray-900 dark:text-white sm:text-[15px]">
                ••••
              </span>
              <Eye size={18} className="shrink-0 text-gray-400" />
            </div>

            <div className="mb-3.5 flex w-full justify-end sm:mb-4">
              <span className="text-[12px] font-medium text-mintcom-green sm:text-[13px]">
                {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </span>
            </div>

            {/* Log in */}
            <div className="relative flex h-11 w-full items-center justify-center rounded-xl bg-mintcom-green px-4 text-[14px] font-semibold text-white shadow-md shadow-mintcom-green/25 sm:h-12 sm:text-[15px]">
              <span>{isRtl ? 'تسجيل الدخول' : 'Log in'}</span>
              <ArrowRight
                size={18}
                className="absolute end-4"
                strokeWidth={2.25}
              />
            </div>

            <div className="mt-3.5 text-center sm:mt-4">
              <p className="text-[12px] text-gray-600 dark:text-gray-400 sm:text-[13px]">
                {isRtl ? 'تحتاج مساعدة؟ ' : 'Need help? '}
                <span className="font-bold text-mintcom-green underline">
                  {isRtl ? 'تواصل مع الدعم' : 'Contact support'}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-gray-600 dark:text-gray-400 sm:text-[12px]">
                <span className="font-medium text-mintcom-green">
                  {isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </span>
                <span className="mx-1.5">·</span>
                <span className="font-medium text-mintcom-green">
                  {isRtl ? 'شروط الخدمة' : 'Terms of Service'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: brand panel — always visible, fills height */}
      <div className="relative flex w-[40%] min-w-[120px] max-w-[48%] shrink-0 flex-col items-center justify-center overflow-hidden bg-[#6baf8b] sm:w-[44%]">
        <div className="pointer-events-none absolute -bottom-12 -start-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-16 -end-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/10 to-transparent" />
        <div className="relative z-10 flex flex-col items-center px-4 text-center sm:px-6">
          <Logo theme="dark" size="md" className="scale-110 sm:scale-125" />
        </div>
      </div>
    </div>
  );
}

const G1 = '#7dc6a2';

/** Static green AppSwitch look (on). */
function WhySwitchOn() {
  return (
    <span
      className="relative h-[24px] w-[42px] shrink-0 rounded-full shadow-inner"
      style={{ backgroundColor: G1 }}
      aria-hidden
    >
      <span className="absolute end-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-sm" />
    </span>
  );
}

/**
 * Admin portal AppSettingsScreen as a polished iPhone component.
 * Fills the Why card cleanly — static, copyable text only.
 */
function WhyAppSettingsPreview({ isRtl }: { isRtl?: boolean }) {
  const navItems = [
    { Icon: Home, label: isRtl ? 'الرئيسية' : 'Home' },
    { Icon: BarChart3, label: isRtl ? 'التقارير' : 'Reports' },
    { Icon: ShoppingBag, label: isRtl ? 'الطلبات' : 'Orders' },
    { Icon: Package, label: isRtl ? 'المنتجات' : 'Products' },
  ];

  return (
    <div
      role="img"
      aria-label={isRtl ? 'إعدادات تطبيق الإدارة' : 'Admin portal App Settings'}
      className="relative flex h-full w-full cursor-text select-text items-center justify-center overflow-hidden bg-gradient-to-b from-[#E4EBE7] via-[#EEF2F0] to-[#F7F9F8] p-3 font-sans dark:from-[#0a0f0d] dark:via-[#0f1412] dark:to-[#121816] sm:p-4"
    >
      {/* Soft stage glow behind phone */}
      <div
        className="pointer-events-none absolute inset-x-[12%] bottom-[6%] h-[30%] rounded-[50%] bg-[#7dc6a2]/28 blur-3xl dark:bg-[#7dc6a2]/12"
        aria-hidden
      />

      <div className="relative z-10 flex h-full max-h-full w-full max-w-[280px] flex-col sm:max-w-[300px]">
        {/* iPhone shell */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[38px] border-[6px] border-[#1a1a1e] bg-[#1a1a1e] shadow-[0_28px_64px_-12px_rgba(0,0,0,0.42),0_0_0_1px_rgba(255,255,255,0.06)_inset]">
          {/* Hardware buttons */}
          <span className="absolute -start-[7px] top-[92px] h-5 w-[3px] rounded-s-sm bg-[#2c2c32]" />
          <span className="absolute -start-[7px] top-[124px] h-9 w-[3px] rounded-s-sm bg-[#2c2c32]" />
          <span className="absolute -start-[7px] top-[172px] h-9 w-[3px] rounded-s-sm bg-[#2c2c32]" />
          <span className="absolute -end-[7px] top-[148px] h-14 w-[3px] rounded-e-sm bg-[#2c2c32]" />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] bg-gray-50 dark:bg-mintcom-dark">
            {/* Status bar on brand green */}
            <div className="relative flex shrink-0 items-center justify-between bg-[#7dc6a2] px-5 pb-0.5 pt-3 text-white">
              <span className="w-11 text-[11px] font-semibold tracking-tight">
                9:41
              </span>
              <div className="absolute left-1/2 top-2 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-black shadow-inner" />
              <div className="flex w-12 items-center justify-end gap-[3px] opacity-95">
                <span className="h-[6px] w-[7px] rounded-[1px] bg-white" />
                <span className="h-[8px] w-[7px] rounded-[1px] bg-white" />
                <span className="h-[10px] w-[7px] rounded-[1px] bg-white" />
                <span className="ms-0.5 h-[10px] w-[18px] rounded-[3px] border border-white/95">
                  <span className="m-[1.5px] block h-[calc(100%-3px)] w-[70%] rounded-[1px] bg-white" />
                </span>
              </div>
            </div>

            {/* OwnerScreenHeader */}
            <div className="flex shrink-0 items-center justify-between bg-[#7dc6a2] px-3.5 pb-3 pt-1.5 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                <Menu size={20} strokeWidth={2.25} />
              </span>
              <p className="flex-1 text-center font-sans text-[16px] font-bold tracking-tight text-white">
                {isRtl ? 'إعدادات التطبيق' : 'App Settings'}
              </p>
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl">
                <Bell size={18} strokeWidth={2.25} />
                <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-[1.5px] border-[#7dc6a2] bg-[#ef4444] px-1 text-[9px] font-black leading-none">
                  7
                </span>
              </span>
            </div>

            {/* Screen body */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-mintcom-dark px-3.5 pt-3 dark:bg-mintcom-dark">
              {/* Profile card */}
              <div className="mb-3.5 flex shrink-0 items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-mintcom-surface">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7dc6a2] font-sans text-[16px] font-black text-white shadow-sm shadow-[#7dc6a2]/35">
                  SH
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-[14px] font-black text-gray-900 dark:text-white">
                    Sara Hassan
                  </p>
                  <p className="mt-0.5 truncate font-sans text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    sara@cafedelight.com
                  </p>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
                {/* Security */}
                <div>
                  <p className="mb-1.5 ms-1 font-sans text-[10px] font-black uppercase tracking-[1.2px] text-gray-500 dark:text-gray-400">
                    {isRtl ? 'الأمان' : 'Security'}
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-mintcom-surface">
                    <div className="flex items-start gap-2.5 px-2.5 py-3">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7dc6a2]/12 text-[#7dc6a2]">
                        <Shield size={17} strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0 flex-1 pe-1">
                        <p className="font-sans text-[13px] font-extrabold text-gray-900 dark:text-white">
                          Face ID
                        </p>
                        <p className="mt-0.5 font-sans text-[10px] font-semibold leading-snug text-gray-500 dark:text-gray-400">
                          {isRtl
                            ? 'تسجيل دخول بيومتري للجهاز مع كلمة المرور كاحتياطي.'
                            : 'Use device biometric login with password fallback.'}
                        </p>
                      </div>
                      <WhySwitchOn />
                    </div>
                    <div className="mx-3 h-px bg-[#EEF1EF] dark:bg-[#2A322E]" />
                    <div className="flex items-start gap-2.5 px-2.5 py-3">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7dc6a2]/12 text-[#7dc6a2]">
                        <Smartphone size={17} strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0 flex-1 pe-1">
                        <p className="font-sans text-[13px] font-extrabold text-gray-900 dark:text-white">
                          {isRtl ? 'قفل تلقائي عند الإغلاق' : 'Auto-lock when closed'}
                        </p>
                        <p className="mt-0.5 line-clamp-2 font-sans text-[10px] font-semibold leading-snug text-gray-500 dark:text-gray-400">
                          {isRtl
                            ? 'يُقفل التطبيق فور انتقاله للخلفية. افتح بالبيومتري أو كلمة المرور.'
                            : 'For your security, the app always locks the moment it goes to the background.'}
                        </p>
                      </div>
                      <CircleCheck
                        size={20}
                        className="mt-0.5 shrink-0 text-[#7dc6a2]"
                        strokeWidth={2.25}
                      />
                    </div>
                  </div>
                </div>

                {/* Notifications — partial peek like real scroll */}
                <div>
                  <p className="mb-1.5 ms-1 font-sans text-[10px] font-black uppercase tracking-[1.2px] text-gray-500 dark:text-gray-400">
                    {isRtl ? 'الإشعارات' : 'Notifications'}
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-mintcom-surface">
                    <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7dc6a2]/12 text-[#7dc6a2]">
                        <Bell size={17} strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-[13px] font-extrabold text-gray-900 dark:text-white">
                          {isRtl ? 'إشعارات الدفع' : 'Push notifications'}
                        </p>
                        <p className="mt-0.5 line-clamp-1 font-sans text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                          {isRtl
                            ? 'تنبيهات خارج التطبيق — متاحة دائماً داخل Mintcom'
                            : 'Outside-app alerts. Always available inside Mintcom.'}
                        </p>
                      </div>
                      <WhySwitchOn />
                    </div>
                    <div className="mx-3 h-px bg-[#EEF1EF] dark:bg-[#2A322E]" />
                    <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7dc6a2]/12 text-[#7dc6a2]">
                        <DollarSign size={17} strokeWidth={2.25} />
                      </span>
                      <p className="min-w-0 flex-1 font-sans text-[13px] font-extrabold text-gray-900 dark:text-white">
                        {isRtl ? 'تنبيهات النقد' : 'Cash alerts'}
                      </p>
                      <WhySwitchOn />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BottomNav + home indicator — elevated strip, readable in light & dark */}
            <div className="shrink-0 border-t border-gray-200 bg-white shadow-[0_-6px_18px_-10px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-mintcom-surface dark:shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-around px-1 pb-1 pt-2">
                {navItems.map((item, i) => {
                  const active = i === 0;
                  return (
                    <div
                      key={item.label}
                      className="flex flex-1 flex-col items-center gap-0.5 py-0.5"
                    >
                      {active ? (
                        <span className="mb-0.5 flex h-7 w-7 items-center justify-center rounded-xl bg-mintcom-green/15">
                          <item.Icon
                            size={16}
                            strokeWidth={2.3}
                            className="text-mintcom-green"
                          />
                        </span>
                      ) : (
                        <item.Icon
                          size={16}
                          strokeWidth={2.2}
                          className="mb-0.5 text-gray-400 dark:text-gray-400"
                        />
                      )}
                      <span
                        className={`font-sans text-[9px] font-bold ${
                          active
                            ? 'text-mintcom-green'
                            : 'text-gray-400 dark:text-gray-400'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center pb-2 pt-1">
                <span className="h-[5px] w-[112px] rounded-full bg-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.18)] dark:bg-white/90 dark:shadow-[0_0_12px_rgba(255,255,255,0.18)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Card 1 — fluid full-bleed modules. Fills the same 3:2 frame as sales/reports
 * (no fixed canvas / FeatureShotFrame scale).
 */
function WhyCompletePreview({ isRtl }: { isRtl?: boolean }) {
  const mods = isRtl
    ? [
        { Icon: Store, name: 'نقطة البيع', sub: 'بيع سريع' },
        { Icon: Cloud, name: 'السحابة', sub: 'مزامنة' },
        { Icon: BarChart3, name: 'تقارير', sub: 'تحليلات' },
        { Icon: Users, name: 'فريق', sub: 'أدوار' },
        { Icon: Heart, name: 'ولاء', sub: 'نقاط' },
        { Icon: Package, name: 'مخزون', sub: 'تتبع' },
        { Icon: ChefHat, name: 'وصفات', sub: 'تكاليف' },
        { Icon: CreditCard, name: 'مدفوعات', sub: 'طرق' },
        { Icon: Smartphone, name: 'الجوال', sub: 'تنبيهات' },
      ]
    : [
        { Icon: Store, name: 'POS', sub: 'Fast Checkout' },
        { Icon: Cloud, name: 'Cloud', sub: 'Live Sync' },
        { Icon: BarChart3, name: 'Reports', sub: 'Analytics' },
        { Icon: Users, name: 'Team', sub: 'Roles' },
        { Icon: Heart, name: 'Loyalty', sub: 'Points' },
        { Icon: Package, name: 'Stock', sub: 'Tracking' },
        { Icon: ChefHat, name: 'Recipes', sub: 'Costing' },
        { Icon: CreditCard, name: 'Payments', sub: 'Methods' },
        { Icon: Smartphone, name: 'Mobile', sub: 'Alerts' },
      ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white font-sans dark:bg-mintcom-dark">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-gray-100 px-3 py-2.5 dark:border-white/10 sm:px-3.5 sm:py-3">
        <Logo variant="icon" size="sm" />
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-mintcom-green sm:text-[10px]">
            {isRtl ? 'باقة واحدة' : 'One subscription'}
          </p>
          <p className="truncate text-[13px] font-bold leading-tight text-gray-900 dark:text-white sm:text-[14px]">
            {isRtl ? 'كل شيء مشمول' : 'Everything Included'}
          </p>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-3 gap-1.5 p-2 sm:gap-2 sm:p-2.5">
        {mods.map((m) => (
          <div
            key={m.name}
            className="flex min-h-0 flex-col items-center justify-center rounded-xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50 px-1 text-center shadow-sm dark:border-white/10 dark:from-[#1a1a1a] dark:to-[#141414] sm:rounded-2xl"
          >
            <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-mintcom-green/12 text-mintcom-green sm:mb-1.5 sm:h-9 sm:w-9 sm:rounded-xl">
              <m.Icon size={16} strokeWidth={2} className="sm:hidden" />
              <m.Icon size={18} strokeWidth={2} className="hidden sm:block" />
            </span>
            <p className="truncate px-0.5 text-[10px] font-bold leading-tight text-gray-900 dark:text-white sm:text-[11px]">
              {m.name}
            </p>
            <p className="mt-0.5 truncate px-0.5 text-[8px] font-medium leading-tight text-gray-400 sm:text-[9px]">
              {m.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Card 4 — fluid Create New Brand. Same 3:2 outer frame as cards 2 & 3.
 */
function WhyCreateBranchPreview({ isRtl }: { isRtl?: boolean }) {
  const locations = isRtl
    ? [
        { name: 'وسط البلد', type: 'موقع · مقهى', selected: true, Icon: Coffee },
        { name: 'فرع المول', type: 'موقع · مقهى', selected: true, Icon: Coffee },
        { name: 'كشك المطار', type: 'نقطة بيع · تجزئة', selected: false, Icon: ShoppingBag },
        { name: 'حي الجامعة', type: 'نقطة بيع · مطعم', selected: false, Icon: Store },
      ]
    : [
        { name: 'Downtown', type: 'Location · Cafe', selected: true, Icon: Coffee },
        { name: 'Mall Branch', type: 'Location · Cafe', selected: true, Icon: Coffee },
        { name: 'Airport Kiosk', type: 'POS · Retail', selected: false, Icon: ShoppingBag },
        { name: 'University District', type: 'POS · Restaurant', selected: false, Icon: Store },
      ];

  const selectedCount = locations.filter((l) => l.selected).length;

  const wizardSteps = isRtl
    ? [
        { label: 'التفاصيل', icon: 'home' as const, state: 'done' as const },
        { label: 'المواقع', icon: 'map' as const, state: 'active' as const },
        { label: 'الفريق', icon: 'team' as const, state: 'todo' as const },
      ]
    : [
        { label: 'Details', icon: 'home' as const, state: 'done' as const },
        { label: 'Locations', icon: 'map' as const, state: 'active' as const },
        { label: 'Team', icon: 'team' as const, state: 'todo' as const },
      ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white font-sans dark:bg-mintcom-dark">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-3 py-2 dark:border-white/10 sm:px-3.5 sm:py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-mintcom-green/15 text-mintcom-green">
            <Briefcase size={15} strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-sans text-[13px] font-black leading-tight text-gray-900 dark:text-white">
              {isRtl ? 'إنشاء علامة تجارية جديدة' : 'Create New Brand'}
            </p>
            <p className="truncate text-[10px] font-medium text-gray-500 dark:text-gray-400">
              {isRtl ? 'Cafe Delight · ربط المواقع / نقاط البيع' : 'Cafe Delight · Link Location/POS'}
            </p>
          </div>
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-white/10">
          <X size={14} strokeWidth={2.25} />
        </span>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-1 border-b border-gray-100 px-3 py-1.5 dark:border-white/10 sm:gap-2 sm:py-2">
        {wizardSteps.map((step, idx) => {
          const filled = step.state === 'done' || step.state === 'active';
          return (
            <Fragment key={step.label}>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] sm:h-6 sm:w-6 ${
                    filled
                      ? 'border-mintcom-green bg-mintcom-green text-white'
                      : 'border-gray-200 bg-white text-gray-400 dark:border-white/15 dark:bg-mintcom-surface'
                  }`}
                >
                  {step.state === 'done' ? (
                    <Check size={10} strokeWidth={3} />
                  ) : step.icon === 'map' ? (
                    <MapPin size={10} strokeWidth={2.25} />
                  ) : step.icon === 'team' ? (
                    <Users size={10} strokeWidth={2.25} />
                  ) : (
                    <Home size={10} strokeWidth={2.25} />
                  )}
                </span>
                <span
                  className={`text-[9px] font-bold sm:text-[10px] ${
                    filled ? 'text-mintcom-green' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < wizardSteps.length - 1 && (
                <div
                  className={`mx-0.5 h-0.5 w-5 rounded-full sm:w-8 ${
                    step.state === 'done' ? 'bg-mintcom-green' : 'bg-gray-200 dark:bg-white/10'
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      <div className="@container shrink-0 px-3 pt-2 sm:px-3.5 sm:pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate font-sans text-[12px] font-black text-gray-900 dark:text-white sm:text-[13px]">
            {isRtl ? 'اختر موقع / نقطة بيع للربط' : 'Select Location/POS to Link'}
          </p>
          <span className="shrink-0 rounded-full bg-mintcom-green/15 px-2 py-0.5 text-[9px] font-black text-mintcom-green">
            {isRtl ? `${selectedCount} محدد` : `${selectedCount} selected`}
          </span>
        </div>
        <p className="mt-0.5 w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium leading-none text-gray-500 dark:text-gray-400 [font-size:clamp(7.5px,2.1cqi,10px)]">
          {isRtl
            ? 'تظهر فقط المواقع غير المرتبطة. المواقع الموجودة في علامة أخرى مخفية.'
            : 'Only unlinked locations are shown. Locations already in another brand are hidden.'}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-1.5 p-2.5 sm:gap-2 sm:p-3">
        {locations.map((loc) => (
          <div
            key={loc.name}
            className={`flex min-h-0 items-center gap-2 rounded-xl border px-2 sm:px-2.5 ${
              loc.selected
                ? 'border-mintcom-green bg-mintcom-green/10'
                : 'border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${
                loc.selected
                  ? 'bg-mintcom-green text-white'
                  : 'bg-mintcom-green/12 text-mintcom-green'
              }`}
            >
              <loc.Icon size={15} strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate font-sans text-[11px] font-extrabold text-gray-900 dark:text-white sm:text-[12px]">
                {loc.name}
              </p>
              <p className="truncate text-[9px] font-semibold text-gray-500 dark:text-gray-400">
                {loc.type}
              </p>
            </div>
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                loc.selected
                  ? 'border-mintcom-green bg-mintcom-green text-white'
                  : 'border-gray-300 bg-transparent dark:border-white/20'
              }`}
            >
              {loc.selected && <Check size={10} strokeWidth={3} />}
            </span>
          </div>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-gray-100 px-3 py-2 dark:border-white/10 sm:px-3.5">
        <div className="flex h-8 flex-1 items-center justify-center rounded-xl border border-mintcom-green bg-white text-[11px] font-bold text-mintcom-green dark:bg-transparent">
          {isRtl ? 'رجوع' : 'Back'}
        </div>
        <div className="relative flex h-8 flex-[1.2] items-center justify-center rounded-xl bg-mintcom-green text-[11px] font-black text-white shadow-sm shadow-mintcom-green/30">
          <span>{isRtl ? 'متابعة' : 'Continue'}</span>
          <ArrowRight size={13} className="absolute end-3" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

/**
 * Why Mintcom previews — all sit in the same 3:2 outer frame.
 * Cards 2–3: real try-pos screenshots (fill). Cards 1 & 4: fluid full-bleed UI.
 */
const FeaturePreview = ({ id, isRtl }: { id: FeatureId; isRtl?: boolean }) => {
  if (id === 'complete') {
    return <WhyCompletePreview isRtl={isRtl} />;
  }

  if (id === 'realUsers') {
    return <FeaturePosScreenshot side fill forceLight className="h-full w-full" />;
  }

  if (id === 'security') {
    return <FeatureScreenshot featureId="advancedReporting" side fill />;
  }

  return <WhyCreateBranchPreview isRtl={isRtl} />;
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Same shell language as Features modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-mintcom-dark"
        dir={isRtl ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="true"
        aria-label={feature.title}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={String(t('common.close', 'Close'))}
          className="absolute end-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        <div className="absolute start-4 top-4 z-30 flex items-center gap-1 px-1 py-1 text-xs font-bold text-mintcom-green">
          <span className="tabular-nums">{activeIndex + 1}</span>
          <span className="opacity-50">/</span>
          <span className="tabular-nums opacity-70">{features.length}</span>
        </div>

        <div className="relative min-h-0 overflow-x-hidden overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative z-10 w-full select-text p-5 pt-12 will-change-transform sm:p-6 sm:pt-12 md:p-8 md:pt-14"
            >
              {/*
                Preview defines row height (always 3:2 of the same column width).
                Story uses h-0 + min-h-full so long card-1 copy cannot enlarge
                the modal — it scrolls instead. Result: card 1 = card 2 size.
              */}
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(320px,1.22fr)] lg:gap-8">
                {/* Preview anchors size — same box on every slide */}
                <div className="order-1 w-full min-w-0 lg:order-2 lg:col-start-2 lg:row-start-1">
                  <div
                    className={`overflow-hidden rounded-2xl border border-gray-200/90 shadow-lg shadow-black/10 dark:border-white/10 dark:shadow-black/40 ${
                      feature.id === 'realUsers'
                        ? 'bg-[#f6f3ec]'
                        : feature.id === 'security'
                          ? 'bg-gray-100 dark:bg-mintcom-dark'
                          : 'bg-white dark:bg-mintcom-dark'
                    }`}
                  >
                    <div className={WHY_PREVIEW_FRAME_CLASS}>
                      <div className="absolute inset-0 overflow-hidden">
                        <FeaturePreview id={feature.id} isRtl={isRtl} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story height = preview height; full description + all bullets (scroll if needed) */}
                <div className="order-2 flex min-w-0 flex-col lg:order-1 lg:col-start-1 lg:row-start-1 lg:h-0 lg:min-h-full lg:overflow-hidden">
                  <h3 className="shrink-0 font-sans text-xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white sm:text-2xl md:text-[1.75rem] lg:text-[1.85rem]">
                    {feature.title}
                  </h3>
                  <div className="mt-2.5 min-h-0 flex-1 overflow-y-auto overscroll-contain pe-1 [scrollbar-width:thin] [scrollbar-color:rgba(125,198,162,0.45)_transparent]">
                    {/* Full copy — no line-clamp; every word + every bullet is in the DOM */}
                    <p className="max-w-md font-sans text-[13px] font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-[14px] md:text-[15px]">
                      {feature.description}
                    </p>
                    <ul className="mt-3.5 space-y-1.5 pb-2 sm:mt-4 sm:space-y-2">
                      {feature.highlights.map((line) => (
                        <li
                          key={line}
                          className="flex items-start gap-2 text-[13px] font-semibold leading-snug text-gray-700 dark:text-gray-200 sm:gap-2.5 sm:text-sm"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mintcom-green" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 mx-6 flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 py-3.5 dark:border-white/10 md:mx-8 md:py-4">
          <button
            type="button"
            onClick={onPrev}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <span className="hidden sm:inline">{t('common.previous', 'Previous')}</span>
          </button>

          <div className="no-scrollbar flex max-w-[55%] items-center gap-1.5 overflow-x-auto">
            {features.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onJumpTo(i)}
                aria-label={`Go to ${i + 1}`}
                className={`h-2 flex-shrink-0 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-5 bg-mintcom-green'
                    : 'w-2 bg-gray-300 hover:bg-gray-400 dark:bg-white/15 dark:hover:bg-white/25'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 rounded-xl bg-mintcom-green px-4 py-2.5 font-sans text-sm font-bold text-black shadow-[0_4px_20px_-4px_rgba(125,198,162,0.5)] transition-all hover:-translate-y-0.5"
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
            'إدارة الموظفين والصلاحيات حسب الدور',
            'مخزون وتتبع مخزون في الوقت الفعلي',
            'تطبيق جوال مع تنبيهات فورية',
            'الفوترة الإلكترونية المتكاملة',
            'برنامج ولاء ومكافآت العملاء',
            'دعم طرق دفع متعددة',
          ]
        : [
            'Staff Management & Role-Based Access',
            'Real-Time Inventory & Stock Control',
            'Mobile App with Instant Alerts',
            'Integrated E-Invoicing',
            'Customer Loyalty & Rewards Program',
            'Support for Multiple Payment Methods',
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
            'رحلة مستخدم بسيطة وبديهية',
            'واجهة نظيفة وسهلة الاستخدام',
            'أداء سريع وفعّال',
            'مزامنة فورية عبر جميع القنوات',
          ]
        : [
            'Simple & Intuitive User Journey',
            'Clean, User-Friendly Interface',
            'Fast & Efficient Performance',
            'Real-Time Synchronization Across All Channels',
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
            'لوحة تحكم مركزية للعلامة التجارية للمواقع المرتبطة',
            'إنشاء مواقع جديدة أو نقاط بيع إضافية داخل المواقع الحالية بسهولة',
            'فصل المواقع أو العلامات التجارية في أي وقت بسلاسة',
          ]
        : [
            'Access a Centralized Brand Dashboard for Connected Locations',
            'Easily Create New Locations or Additional POS Points Within Existing Locations',
            'Seamlessly Disconnect Locations or Separate Brands Anytime',
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
                <h4 className="mb-2 font-sans text-2xl font-bold tracking-tighter text-white xs:text-3xl md:text-5xl">
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
