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

/**
 * Shared Why-modal product preview height.
 * All four cards use this so “Designed for Real Users” and the rest stay aligned.
 */
const WHY_PREVIEW_H_CLASS =
  'h-[min(58vh,440px)] w-full overflow-hidden sm:h-[460px] md:h-[480px]';

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

/** Card chrome matches Features WorkflowFeatureCard — icon + title row, Read more. */
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
        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] font-barlow text-base font-bold leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-mintcom-green dark:text-white">
          {feature.title}
        </h3>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between">
        <p className="line-clamp-3 min-h-[3.75rem] font-barlow text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">
          {feature.description}
        </p>

        <button
          type="button"
          onClick={() => onOpen(index)}
          className="mt-3 self-start font-barlow text-xs font-bold text-mintcom-green transition-colors hover:text-mintcom-green/80 focus:outline-none"
        >
          {t('landing.features.readMore', 'Read more')}
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
              <span className="block truncate text-[13px] font-semibold text-[#333] dark:text-white sm:text-sm">
                Cafe Delight
              </span>
            </span>
          </div>
        </div>

        {/* Centered form body */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-3 sm:px-6 sm:py-4">
          <div className="w-full max-w-[320px]">
            <p className="text-center font-barlow text-[22px] font-extrabold leading-tight text-[#333] dark:text-white sm:text-[26px] md:text-[28px]">
              {isRtl ? 'مرحباً بعودتك!' : 'Welcome Back!'}
            </p>
            <p className="mb-4 mt-1.5 text-center text-[12px] text-[#999] sm:mb-5 sm:text-[13px]">
              {isRtl
                ? 'سجّل دخولك ببيانات الموظف'
                : 'Log in using your employee credentials'}
            </p>

            {/* Username — full field, icons inside padding */}
            <div className="mb-3 flex h-11 w-full items-center gap-2.5 rounded-xl border border-mintcom-green bg-white px-3.5 dark:bg-mintcom-surface sm:mb-3.5 sm:h-12">
              <User size={18} className="shrink-0 text-mintcom-green" />
              <span className="min-w-0 truncate text-[14px] text-[#333] dark:text-white sm:text-[15px]">
                Sara
              </span>
            </div>

            {/* Password */}
            <div className="mb-1 flex h-11 w-full items-center gap-2.5 rounded-xl border border-[#d1d5db] bg-white px-3.5 dark:border-white/15 dark:bg-mintcom-surface sm:h-12">
              <Lock size={18} className="shrink-0 text-[#999]" />
              <span className="min-w-0 flex-1 text-[14px] tracking-widest text-[#333] dark:text-white sm:text-[15px]">
                ••••
              </span>
              <Eye size={18} className="shrink-0 text-[#B0B0B0]" />
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
              <p className="text-[12px] text-[#666] sm:text-[13px]">
                {isRtl ? 'تحتاج مساعدة؟ ' : 'Need help? '}
                <span className="font-bold text-mintcom-green underline">
                  {isRtl ? 'تواصل مع الدعم' : 'Contact support'}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-[#666] sm:text-[12px]">
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

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] bg-[#F5F7F6] dark:bg-[#121816]">
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
              <p className="flex-1 text-center font-barlow text-[16px] font-bold tracking-tight text-white">
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
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F5F7F6] px-3.5 pt-3 dark:bg-[#121816]">
              {/* Profile card */}
              <div className="mb-3.5 flex shrink-0 items-center gap-3 rounded-2xl border border-[#E8ECEA] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-[#2A322E] dark:bg-[#1C2420]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7dc6a2] font-barlow text-[16px] font-black text-white shadow-sm shadow-[#7dc6a2]/35">
                  SH
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-barlow text-[14px] font-black text-[#1F1D2B] dark:text-[#F8FAFC]">
                    Sara Hassan
                  </p>
                  <p className="mt-0.5 truncate font-barlow text-[11px] font-semibold text-[#828287]">
                    sara@cafedelight.com
                  </p>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
                {/* Security */}
                <div>
                  <p className="mb-1.5 ms-1 font-barlow text-[10px] font-black uppercase tracking-[1.2px] text-[#828287]">
                    {isRtl ? 'الأمان' : 'Security'}
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-[#E8ECEA] bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-[#2A322E] dark:bg-[#1C2420]">
                    <div className="flex items-start gap-2.5 px-2.5 py-3">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7dc6a2]/12 text-[#7dc6a2]">
                        <Shield size={17} strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0 flex-1 pe-1">
                        <p className="font-barlow text-[13px] font-extrabold text-[#1F1D2B] dark:text-[#F8FAFC]">
                          Face ID
                        </p>
                        <p className="mt-0.5 font-barlow text-[10px] font-semibold leading-snug text-[#828287]">
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
                        <p className="font-barlow text-[13px] font-extrabold text-[#1F1D2B] dark:text-[#F8FAFC]">
                          {isRtl ? 'قفل تلقائي عند الإغلاق' : 'Auto-lock when closed'}
                        </p>
                        <p className="mt-0.5 line-clamp-2 font-barlow text-[10px] font-semibold leading-snug text-[#828287]">
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
                  <p className="mb-1.5 ms-1 font-barlow text-[10px] font-black uppercase tracking-[1.2px] text-[#828287]">
                    {isRtl ? 'الإشعارات' : 'Notifications'}
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-[#E8ECEA] bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-[#2A322E] dark:bg-[#1C2420]">
                    <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7dc6a2]/12 text-[#7dc6a2]">
                        <Bell size={17} strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-barlow text-[13px] font-extrabold text-[#1F1D2B] dark:text-[#F8FAFC]">
                          {isRtl ? 'إشعارات الدفع' : 'Push notifications'}
                        </p>
                        <p className="mt-0.5 line-clamp-1 font-barlow text-[10px] font-semibold text-[#828287]">
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
                      <p className="min-w-0 flex-1 font-barlow text-[13px] font-extrabold text-[#1F1D2B] dark:text-[#F8FAFC]">
                        {isRtl ? 'تنبيهات النقد' : 'Cash alerts'}
                      </p>
                      <WhySwitchOn />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BottomNav + home indicator */}
            <div className="shrink-0 border-t border-[#E5E7EB] bg-[#EFEFF4] dark:border-[#2A322E] dark:bg-[#0E1311]">
              <div className="flex items-center justify-around px-1 pb-1 pt-2">
                {navItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-1 flex-col items-center gap-0.5 py-0.5"
                  >
                    <item.Icon
                      size={16}
                      strokeWidth={2.2}
                      className="text-[#8B8B93]"
                    />
                    <span className="font-barlow text-[9px] font-bold text-[#8B8B93]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center pb-2 pt-0.5">
                <span className="h-1 w-24 rounded-full bg-[#1a1a1e]/75" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * BrandsScreen create-brand wizard — step 2 “Select locations to link”.
 * Real owner flow: Create new brand → choose which locations join the brand.
 * Static snapshot; text is selectable to copy.
 */
function WhyCreateBranchPreview({ isRtl }: { isRtl?: boolean }) {
  const locations = isRtl
    ? [
        { name: 'وسط البلد', type: 'مقهى', selected: true, Icon: Coffee },
        { name: 'فرع المول', type: 'مقهى', selected: true, Icon: Coffee },
        { name: 'كشك المطار', type: 'تجزئة', selected: false, Icon: ShoppingBag },
        { name: 'حي الجامعة', type: 'مطعم', selected: false, Icon: Store },
      ]
    : [
        { name: 'Downtown', type: 'Cafe', selected: true, Icon: Coffee },
        { name: 'Mall Branch', type: 'Cafe', selected: true, Icon: Coffee },
        { name: 'Airport Kiosk', type: 'Retail', selected: false, Icon: ShoppingBag },
        { name: 'University District', type: 'Restaurant', selected: false, Icon: Store },
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
    <div
      role="img"
      aria-label={
        isRtl
          ? 'إنشاء علامة تجارية — اختيار المواقع'
          : 'Create new brand — select locations to link'
      }
      className="flex h-full w-full cursor-text select-text flex-col overflow-hidden bg-[#F5F7F6] font-sans dark:bg-[#0F1412]"
    >
      {/* Wizard modal shell */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden m-2.5 rounded-2xl border border-[#E8ECEA] bg-white shadow-[0_8px_28px_-8px_rgba(15,23,42,0.12)] dark:border-[#2A322E] dark:bg-[#1C2420] sm:m-3">
        {/* Wizard header — Create new brand */}
        <div className="shrink-0 border-b border-black/[0.05] px-3.5 pb-3 pt-3.5 dark:border-white/10 sm:px-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7dc6a2]/20 text-[#7dc6a2]">
                <Briefcase size={18} strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <p className="truncate font-barlow text-[15px] font-black text-[#1F1D2B] dark:text-white sm:text-[16px]">
                  {isRtl ? 'إنشاء علامة تجارية جديدة' : 'Create new brand'}
                </p>
                <p className="truncate text-[11px] font-medium text-[#828287]">
                  {isRtl
                    ? 'Cafe Delight · ربط المواقع'
                    : 'Cafe Delight · Link locations'}
                </p>
              </div>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] text-[#828287] dark:bg-white/10">
              <X size={16} strokeWidth={2.25} />
            </span>
          </div>

          {/* Stepper: Details ✓ → Locations (active) → Team */}
          <div className="flex items-center">
            {wizardSteps.map((step, idx) => {
              const filled = step.state === 'done' || step.state === 'active';
              return (
                <Fragment key={step.label}>
                  <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                        filled
                          ? 'border-[#7dc6a2] bg-[#7dc6a2] text-white'
                          : 'border-[#E5E7EB] bg-white text-[#828287] dark:border-[#2A322E] dark:bg-[#121816]'
                      }`}
                    >
                      {step.state === 'done' ? (
                        <Check size={13} strokeWidth={3} />
                      ) : step.icon === 'home' ? (
                        <Home size={12} strokeWidth={2.25} />
                      ) : step.icon === 'map' ? (
                        <MapPin size={12} strokeWidth={2.25} />
                      ) : (
                        <Users size={12} strokeWidth={2.25} />
                      )}
                    </span>
                    <span
                      className={`truncate text-[9px] font-bold sm:text-[10px] ${
                        filled ? 'text-[#7dc6a2]' : 'text-[#828287]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < wizardSteps.length - 1 && (
                    <div
                      className={`mx-1 mb-4 h-0.5 w-6 shrink-0 rounded-full sm:w-8 ${
                        step.state === 'done' ? 'bg-[#7dc6a2]' : 'bg-[#E5E7EB] dark:bg-[#2A322E]'
                      }`}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* Step 2 body — Select locations to link */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3.5 py-3 sm:px-4 sm:py-3.5">
          <div className="mb-2.5 flex shrink-0 items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-barlow text-[14px] font-black text-[#1F1D2B] dark:text-white sm:text-[15px]">
                {isRtl ? 'اختر المواقع للربط' : 'Select locations to link'}
              </p>
              <p className="mt-0.5 text-[10px] font-medium leading-snug text-[#828287] sm:text-[11px]">
                {isRtl
                  ? 'تظهر فقط المواقع غير المرتبطة. المواقع في علامة أخرى مخفية.'
                  : 'Only unlinked locations are shown. Locations already in another brand are hidden.'}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[#7dc6a2]/15 px-2.5 py-1 text-[10px] font-black text-[#7dc6a2]">
              {isRtl
                ? `${selectedCount} محدد`
                : `${selectedCount} selected`}
            </span>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
            {locations.map((loc) => (
              <div
                key={loc.name}
                className={`flex items-center gap-2.5 rounded-2xl border px-2.5 py-2.5 sm:px-3 sm:py-3 ${
                  loc.selected
                    ? 'border-[#7dc6a2] bg-[#7dc6a2]/10'
                    : 'border-[#E8ECEA] bg-white dark:border-[#2A322E] dark:bg-[#121816]'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    loc.selected
                      ? 'bg-[#7dc6a2] text-white'
                      : 'bg-[#7dc6a2]/14 text-[#7dc6a2]'
                  }`}
                >
                  <loc.Icon size={18} strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-barlow text-[13px] font-extrabold text-[#1F1D2B] dark:text-white">
                    {loc.name}
                  </p>
                  <p className="text-[10px] font-semibold text-[#828287]">
                    {loc.type}
                  </p>
                </div>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    loc.selected
                      ? 'border-[#7dc6a2] bg-[#7dc6a2] text-white'
                      : 'border-[#D1D5DB] bg-transparent dark:border-[#3A4440]'
                  }`}
                >
                  {loc.selected && <Check size={12} strokeWidth={3} />}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — Back + Continue */}
        <div className="flex shrink-0 items-center gap-2 border-t border-black/[0.05] px-3.5 py-2.5 dark:border-white/10 sm:px-4 sm:py-3">
          <div className="flex h-11 flex-1 items-center justify-center rounded-xl border border-[#7dc6a2] bg-white text-[12px] font-bold text-[#7dc6a2] dark:bg-transparent">
            {isRtl ? 'رجوع' : 'Back'}
          </div>
          <div className="relative flex h-11 flex-[1.2] items-center justify-center rounded-xl bg-[#7dc6a2] text-[12px] font-black text-white shadow-md shadow-[#7dc6a2]/25">
            <span>{isRtl ? 'متابعة' : 'Continue'}</span>
            <ArrowRight size={15} className="absolute end-3.5" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Unique previews for Why Mintcom only — real product patterns,
 * intentionally different from Features section screenshots.
 *
 * complete  → all-included product modules (not Sales / Reports)
 * realUsers → static Try POS login snapshot (copy text only)
 * security  → admin portal AppSettingsScreen (polished iPhone component)
 * multiBranch → Brands create-brand wizard step 2 (select locations)
 */
const FeaturePreview = ({ id, isRtl }: { id: FeatureId; isRtl?: boolean }) => {
  if (id === 'complete') {
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
          { Icon: Store, name: 'POS', sub: 'Fast checkout' },
          { Icon: Cloud, name: 'Cloud', sub: 'Live sync' },
          { Icon: BarChart3, name: 'Reports', sub: 'Analytics' },
          { Icon: Users, name: 'Team', sub: 'Roles' },
          { Icon: Heart, name: 'Loyalty', sub: 'Points' },
          { Icon: Package, name: 'Stock', sub: 'Tracking' },
          { Icon: ChefHat, name: 'Recipes', sub: 'Costing' },
          { Icon: CreditCard, name: 'Payments', sub: 'Methods' },
          { Icon: Smartphone, name: 'Mobile', sub: 'Alerts' },
        ];

    return (
      <div className="flex h-full flex-col bg-gradient-to-b from-white to-gray-50 font-sans dark:from-[#141414] dark:to-[#0c0c0c]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Logo variant="icon" size="sm" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-mintcom-green">
                {isRtl ? 'باقة واحدة' : 'One subscription'}
              </p>
              <p className="text-[14px] font-bold text-gray-900 dark:text-white">
                {isRtl ? 'كل شيء مشمول' : 'Everything included'}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-mintcom-green px-2.5 py-1 text-[10px] font-black text-black">
            {isRtl ? 'بدون رسوم خفية' : 'No add-ons'}
          </span>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-3 content-center gap-2.5 p-3.5 sm:gap-3 sm:p-4">
          {mods.map((m) => (
            <div
              key={m.name}
              className="flex min-h-0 flex-col items-center justify-center rounded-2xl border border-gray-200/90 bg-white px-2 py-3 text-center shadow-sm dark:border-white/10 dark:bg-[#1a1a1a] sm:py-4"
            >
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-mintcom-green/12 text-mintcom-green">
                <m.Icon size={18} />
              </span>
              <p className="text-[11px] font-bold text-gray-900 dark:text-white sm:text-[12px]">
                {m.name}
              </p>
              <p className="mt-0.5 text-[9px] font-medium text-gray-400 sm:text-[10px]">
                {m.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === 'realUsers') {
    // Static try-pos sign-in snapshot — copyable text only, not interactive
    return <WhyRealPosLoginPreview isRtl={isRtl} />;
  }

  if (id === 'security') {
    // Admin portal AppSettingsScreen — polished phone component (static)
    return <WhyAppSettingsPreview isRtl={isRtl} />;
  }

  // multiBranch — real LocationOnboarding create-branch step 1
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
        className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#161616]"
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
              className="relative z-10 p-5 pt-12 will-change-transform sm:p-6 sm:pt-12 md:p-8 md:pt-14"
            >
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(320px,1.22fr)] lg:gap-8">
                {/* Story — no icon, top-aligned like Features */}
                <div className="order-2 min-w-0 lg:order-1">
                  <h3 className="line-clamp-2 font-barlow text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white md:text-3xl lg:text-[2rem]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 line-clamp-5 max-w-md font-barlow text-[15px] font-medium leading-relaxed text-gray-600 dark:text-gray-300 md:text-base">
                    {feature.description}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {feature.highlights.map((line) => (
                      <li
                        key={line}
                        className="flex items-start gap-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mintcom-green" />
                        <span className="line-clamp-2">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Shared-height product previews — all Why cards match */}
                <div className="order-1 w-full min-w-0 lg:order-2">
                  <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-lg shadow-black/10 dark:border-white/10 dark:bg-[#0f0f0f]">
                    <div className={WHY_PREVIEW_H_CLASS}>
                      <FeaturePreview id={feature.id} isRtl={isRtl} />
                    </div>
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
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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
            className="flex items-center gap-2 rounded-xl bg-mintcom-green px-4 py-2.5 text-sm font-bold text-black shadow-[0_4px_20px_-4px_rgba(125,198,162,0.5)] transition-all hover:-translate-y-0.5"
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
