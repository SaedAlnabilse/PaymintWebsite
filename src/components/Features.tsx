import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
      className="group relative flex h-full min-h-[248px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/30 transition-all duration-500 hover:border-mintcom-green/40 hover:shadow-2xl hover:shadow-mintcom-green/10 dark:border-white/5 dark:bg-[#121212] dark:shadow-none"
    >
      {/* Fixed header band so titles wrap like “Recipe & Cost Management” without changing card height */}
      <div className="relative z-10 mb-4 flex min-h-[56px] items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-mintcom-green/10 shadow-inner transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-mintcom-green dark:bg-mintcom-green/15">
          <feature.icon size={22} className="text-mintcom-green transition-colors duration-500 group-hover:text-white" />
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

// Soft crossfade + gentle directional drift (no blur — keeps it smooth).
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction * 40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 34, mass: 0.85 },
      opacity: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
    },
  },
  exit: (direction: number) => ({
    x: direction * -28,
    opacity: 0,
    transition: {
      x: { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.2, ease: [0.4, 0, 1, 1] },
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
  const hasPreview = hasInteractiveDemo(feature.id);
  // All feature cards use the same split layout + modal size
  const isSplitLayout = hasPreview;
  const isPhoneDemo = feature.id === 'mobileApp';

  /** Keep body height stable while slides crossfade (avoids jump/glitch). */
  const slideNodeRef = useRef<HTMLDivElement | null>(null);
  const [bodyHeight, setBodyHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = slideNodeRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setBodyHeight(Math.ceil(h));
    };
    measure();
    // Previews scale via ResizeObserver — remeasure when layout settles
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const t = window.setTimeout(measure, 60);
    const t2 = window.setTimeout(measure, 200);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [activeIndex, feature.id]);

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
        'Add team members with username & password',
        'Assign roles & fine-grained permissions',
        'Access updates instantly on every POS',
      ],
      advancedReporting: [
        'Net sales, card, cash & order counts',
        'Weekly charts and peak-day insights',
        'Top sellers ranked by revenue',
      ],
      production: [
        'Raw materials grid with stock & unit cost',
        'Low-stock badges and one-tap restock',
        'Recipes for prepared items & menu products',
      ],
      aiSystem: [
        'Morning briefings & top sellers on demand',
        'Stock and staff answers scoped per location',
        'Same AI agent as the admin mobile app',
      ],
      multiBranch: [
        'Create brands from the owner portal',
        'Link Downtown, Mall & more locations',
        'Open each brand dashboard in one click',
      ],
      simpleUI: [
        'My Orders & Close Shift on one card',
        'Net, cash, card, pay-in/out & hours',
        'Live Sales Overview for the active shift',
      ],
      fastOnboarding: [
        'Add staff from dashboard Staff in seconds',
        'Set role, username & password once',
        'They log in on POS with the same password',
      ],
      secure: [
        'Password re-auth for high-impact actions',
        'Role-based access for every staff member',
        'Security tips built into the owner portal',
      ],
      loyalty: [
        'Redeem % discounts at the register',
        'Gift free items from a category',
        'Points earn just like real POS loyalty',
      ],
      mobileApp: [
        'Live Notifications feed for all locations',
        'Cash, stock & refund tabs with unread badges',
        'iOS push banners that open the right alert',
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

      {/* Height hugs content — no empty white band under the preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#161616]"
        dir={isRtl ? 'rtl' : 'ltr'}
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

        {/* Height eases between slides; content crossfades on top */}
        <div
          className="relative min-h-0 overflow-x-hidden overflow-y-auto"
          style={
            bodyHeight
              ? {
                  height: bodyHeight,
                  transition: 'height 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
                }
              : undefined
          }
        >
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={activeIndex}
              ref={slideNodeRef}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative z-10 w-full select-text p-5 pt-12 will-change-transform sm:p-6 sm:pt-12 md:p-8 md:pt-14"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {isSplitLayout ? (
                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(340px,1.22fr)] lg:gap-8 xl:grid-cols-[minmax(0,0.72fr)_minmax(380px,1.28fr)]">
                  <div className="order-2 min-w-0 lg:order-1">
                    <h3 className="line-clamp-2 font-barlow text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white md:text-3xl lg:text-[2rem]">
                      {feature.title}
                    </h3>
                    <p className="mt-3 line-clamp-5 max-w-md font-barlow text-[15px] font-medium leading-relaxed text-gray-600 dark:text-gray-300 md:text-base">
                      {feature.description}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {featureHighlights(feature.id).map((line) => (
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

                  <div className="order-1 w-full min-w-0 lg:order-2">
                    <FeatureInteractiveDemo
                      featureId={feature.id}
                      t={t}
                      isRtl={isRtl}
                      tall={isPhoneDemo}
                      side
                    />
                  </div>
                </div>
              ) : (
                <div className="min-w-0">
                  <h3 className="line-clamp-2 font-barlow text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white md:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-4 line-clamp-8 font-barlow text-base font-medium leading-relaxed text-gray-600 dark:text-gray-300 md:text-[17px]">
                    {feature.description}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 mx-6 flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 py-3.5 dark:border-white/10 md:mx-8 md:py-4">
          <button
            type="button"
            onClick={onPrev}
            aria-label={String(t('common.previous', 'Previous'))}
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
