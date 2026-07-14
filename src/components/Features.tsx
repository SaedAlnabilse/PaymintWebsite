import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
  type LucideIcon,
} from 'lucide-react';
import { FeatureInteractiveDemo, hasInteractiveDemo } from './FeatureInteractiveDemos';

type WorkflowFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
  id?: string;
};

const WorkflowFeatureCard = ({
  feature,
  index,
  t,
  onOpen,
}: {
  feature: WorkflowFeature;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  onOpen: (index: number) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.08, duration: 0.5 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/30 transition-all duration-500 hover:border-mintcom-green/40 hover:shadow-2xl hover:shadow-mintcom-green/10 dark:border-white/5 dark:bg-[#121212] dark:shadow-none"
    >
      <div className="relative z-10 mb-4 flex items-start gap-4">
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  isRtl: boolean;
}) => {
  const feature = features[activeIndex];
  if (!feature) return null;
  const Icon = feature.icon;
  const hasPreview = hasInteractiveDemo(feature.id);
  // All feature cards use the same split layout + modal size
  const isSplitLayout = hasPreview;
  const isPhoneDemo = feature.id === 'mobileApp';

  const featureHighlights = (id?: string): string[] => {
    const key = id ?? '';
    const defaults: Record<string, [string, string, string]> = {
      pointOfSale: [
        'Browse by category or All menu',
        'Build orders with add-ons & qty',
        'Charge with card, cash, or other',
      ],
      salesControl: [
        'Cash always available at checkout',
        'Card brands, wallets & delivery apps',
        'Tax + service charge configured once',
      ],
      staffManagement: [
        'Add team members with PIN clock-in',
        'Assign roles & fine-grained permissions',
        'Access updates instantly on every POS',
      ],
      advancedReporting: [
        'Net sales, card, cash & order counts',
        'Weekly charts and peak-day insights',
        'Top sellers ranked by revenue',
      ],
      production: [
        'Track raw materials with stock value',
        'Low-stock alerts and restock on the fly',
        'Link recipes so sales deduct inventory',
      ],
      aiSystem: [
        'Ask sales & staffing questions',
        'Get clear, business-ready answers',
        'Built into every Mintcom workspace',
      ],
      multiBranch: [
        'Link locations under one brand',
        'Unified brand totals in real time',
        'Compare Downtown, Mall & more',
      ],
      simpleUI: [
        'Open shift with My Orders & Close Shift',
        'Net, cash, card & pay-in/out at a glance',
        'Live sales trend for the active shift',
      ],
      fastOnboarding: [
        'Guided setup from location to sale',
        'Progress that staff can follow',
        'Productive on day one',
      ],
      secure: [
        'Encrypted backups & 2FA ready',
        'Role-based access by design',
        'Live protection score per location',
      ],
      loyalty: [
        'Redeem % discounts at the register',
        'Gift free items from a category',
        'Points earn just like real POS loyalty',
      ],
      mobileApp: [
        'Cash shortage & overage alerts',
        'Stock warnings with location context',
        'Refunds and push banners on the go',
      ],
    };
    // Do NOT load these via t('…highlights.x.0') — missing keys hit parseMissingKeyHandler
    // which returns the leaf segment ("0"/"1"/"2") instead of the defaultValue.
    return defaults[key] ?? [
      'See the real Mintcom interface',
      'Same screens as Try POS & dashboard',
      'Built for busy businesses',
    ];
  };

  const previewHint = (id?: string): string => {
    const hints: Record<string, string> = {
      pointOfSale: 'Real Mintcom POS sales screen →',
      salesControl: 'Real payment settings screen →',
      staffManagement: 'Real team & roles screen →',
      advancedReporting: 'Real reporting dashboard →',
      production: 'Real Recipe Operations · raw materials →',
      aiSystem: 'Real Mintcom AI assistant →',
      multiBranch: 'Real multi-location brand view →',
      simpleUI: 'Real try-pos Dashboard →',
      fastOnboarding: 'Real onboarding checklist →',
      secure: 'Real security controls →',
      loyalty: 'Real loyalty panel on POS →',
      mobileApp: 'Real owner mobile alerts →',
    };
    return hints[id ?? ''] ?? 'Real Mintcom interface →';
  };

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
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#161616]"
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{ perspective: 1200 }}
      >
        <motion.div
          key={`glow-${activeIndex}`}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.55, 0], scale: [0.4, 1.4, 1.6] }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-64 w-64 -translate-x-1/2 rounded-full bg-mintcom-green/30 blur-3xl"
        />

        <motion.div
          key={`sweep-${activeIndex}`}
          initial={{ x: direction * -120 + '%', opacity: 0 }}
          animate={{ x: direction * 120 + '%', opacity: [0, 0.45, 0] }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-mintcom-green/15 to-transparent"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label={String(t('common.close', 'Close'))}
          className="absolute end-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

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

        <div className="relative max-h-[min(90vh,860px)] overflow-x-hidden overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative z-10 select-text p-6 pt-14 md:p-8 md:pt-16 lg:p-10 lg:pt-16"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {isSplitLayout ? (
                <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(340px,1.22fr)] lg:gap-10 xl:grid-cols-[minmax(0,0.72fr)_minmax(380px,1.28fr)]">
                  {/* Left: story copy */}
                  <div className="order-2 min-w-0 lg:order-1">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05, type: 'spring', stiffness: 220, damping: 18 }}
                      className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-mintcom-green/10 text-mintcom-green dark:bg-white/5"
                    >
                      <Icon size={26} />
                    </motion.div>
                    <motion.h3
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="font-barlow text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white md:text-3xl lg:text-[2rem]"
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p
                      initial={{ y: 16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.18, duration: 0.45 }}
                      className="mt-4 max-w-md font-barlow text-[15px] font-medium leading-relaxed text-gray-600 dark:text-gray-300 md:text-base"
                    >
                      {feature.description}
                    </motion.p>
                    <motion.ul
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.26, duration: 0.4 }}
                      className="mt-6 space-y-2.5"
                    >
                      {featureHighlights(feature.id).map((line) => (
                        <li key={line} className="flex items-start gap-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mintcom-green" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </motion.ul>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="mt-6 hidden text-xs font-medium text-gray-400 lg:block"
                    >
                      {previewHint(feature.id)}
                    </motion.p>
                  </div>

                  {/* Right: static real-UI screenshot — same size for every card */}
                  <motion.div
                    initial={{ y: 24, opacity: 0, scale: 0.96 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="order-1 flex w-full justify-center lg:order-2 lg:justify-stretch"
                  >
                    <div className="w-full max-w-none">
                      <FeatureInteractiveDemo
                        featureId={feature.id}
                        t={t}
                        isRtl={isRtl}
                        tall={isPhoneDemo}
                        side
                      />
                    </div>
                  </motion.div>
                </div>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.05, duration: 0.5, type: 'spring', stiffness: 220, damping: 18 }}
                    className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mintcom-green/10 dark:bg-white/5 text-mintcom-green"
                  >
                    <Icon size={28} />
                  </motion.div>

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
                    className="mt-4 font-barlow text-base md:text-[17px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-line"
                  >
                    {feature.description}
                  </motion.p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 mx-8 flex items-center justify-between gap-4 border-t border-gray-100 dark:border-white/10 py-5 md:mx-10">
          <button
            type="button"
            onClick={onPrev}
            aria-label={String(t('common.previous', 'Previous'))}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <span className="hidden sm:inline">{t('common.previous', 'Previous')}</span>
          </button>

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
            aria-label={String(t('common.next', 'Next'))}
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
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-mintcom-green/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-mintcom-green/5 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-6 md:px-10 lg:px-16 max-w-[1280px]">
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

          <h2 className="text-[clamp(1rem,4.2vw,3.75rem)] whitespace-nowrap font-bold font-magilio mb-6 leading-tight tracking-tight">
            <span className="text-gray-900 dark:text-white">{t('landing.workflow.title')} </span>
            <span className="bg-mintcom-green text-gray-900 dark:text-gray-900 px-2 rounded-sm">{t('landing.workflow.titleHighlight')}</span>
          </h2>
          {t('landing.workflow.subtitle') && (
            <p className="max-w-3xl mx-auto text-base font-light leading-relaxed text-gray-600 dark:text-gray-400 xs:text-lg sm:text-xl">
              {t('landing.workflow.subtitle')}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6 items-stretch">
          {workflowFeatures.map((feature, index) => (
            <WorkflowFeatureCard
              key={feature.id ?? index}
              feature={feature}
              index={index}
              t={t}
              onOpen={handleOpen}
            />
          ))}
        </div>
      </div>

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
