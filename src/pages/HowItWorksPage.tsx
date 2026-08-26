import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  UserPlus,
  Store,
  Package,
  Smartphone,
  BarChart3,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const STEPS: { icon: LucideIcon; titleKey: string; descKey: string }[] = [
  { icon: UserPlus, titleKey: 'pages.howItWorks.steps.s1.title', descKey: 'pages.howItWorks.steps.s1.description' },
  { icon: Store, titleKey: 'pages.howItWorks.steps.s2.title', descKey: 'pages.howItWorks.steps.s2.description' },
  { icon: Package, titleKey: 'pages.howItWorks.steps.s3.title', descKey: 'pages.howItWorks.steps.s3.description' },
  { icon: Smartphone, titleKey: 'pages.howItWorks.steps.s4.title', descKey: 'pages.howItWorks.steps.s4.description' },
  { icon: BarChart3, titleKey: 'pages.howItWorks.steps.s5.title', descKey: 'pages.howItWorks.steps.s5.description' },
];

export const HowItWorksPage = () => {
  const { t } = useTranslation();
  const isRtl = t('common.locale') === 'ar';

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white font-sans text-gray-900 dark:bg-[#0F172A] dark:text-white"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Helmet>
        <title>{t('metadata.howItWorks.title')}</title>
        <meta name="description" content={t('metadata.howItWorks.description')} />
      </Helmet>
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div className="pointer-events-none absolute left-0 top-20 h-[300px] w-[300px] -translate-x-1/3 rounded-full bg-mintcom-green/10 blur-[90px]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-mintcom-green">{t('pages.howItWorks.badge')}</p>
            <h1 className="mb-4 font-magilio text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t('pages.howItWorks.title')}</h1>
            <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
              {t('pages.howItWorks.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto w-full space-y-6">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.titleKey}
              initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="relative flex gap-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#0F172A] sm:p-8"
            >
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mintcom-green text-sm font-black text-black">
                  {index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div className="mt-3 hidden h-full w-px bg-gradient-to-b from-mintcom-green/40 to-transparent sm:block" />
                )}
              </div>
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <step.icon className="h-5 w-5 text-mintcom-green" />
                  <h2 className="font-barlow text-lg font-bold">{t(step.titleKey)}</h2>
                </div>
                <p className="text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">{t(step.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20 dark:bg-[#1E293B]/50">
        <div className="mx-auto w-full rounded-3xl border border-mintcom-green/20 bg-white p-10 text-center dark:bg-[#0F172A]">
          <h2 className="mb-3 font-magilio text-2xl font-bold sm:text-3xl">{t('pages.howItWorks.ctaTitle')}</h2>
          <p className="mb-8 text-sm font-medium text-gray-600 dark:text-gray-300">{t('pages.howItWorks.ctaDesc')}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-mintcom-green px-6 py-3 text-sm font-bold text-black shadow-lg shadow-mintcom-green/25"
            >
              {t('nav.getStarted')}
              <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
            </Link>
            <Link
              to="/try-pos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 dark:border-white/10 dark:text-gray-200"
            >
              {t('pages.howItWorks.tryDemo')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
