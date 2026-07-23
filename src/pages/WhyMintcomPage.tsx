import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  BadgeDollarSign,
  Layers,
  Clock3,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import MintcomLeafIcon from '../assets/small-logo.svg';
const MintcomLeaf = () => <img src={MintcomLeafIcon} alt="" className="h-full w-full scale-x-[-1] object-contain" />;
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const REASONS: { icon: LucideIcon; titleKey: string; descKey: string }[] = [
  { icon: BadgeDollarSign, titleKey: 'pages.why.reasons.r1.title', descKey: 'pages.why.reasons.r1.description' },
  { icon: Layers, titleKey: 'pages.why.reasons.r2.title', descKey: 'pages.why.reasons.r2.description' },
  { icon: Clock3, titleKey: 'pages.why.reasons.r3.title', descKey: 'pages.why.reasons.r3.description' },
  { icon: ShieldCheck, titleKey: 'pages.why.reasons.r4.title', descKey: 'pages.why.reasons.r4.description' },
  { icon: MintcomLeaf as unknown as LucideIcon, titleKey: 'pages.why.reasons.r5.title', descKey: 'pages.why.reasons.r5.description' },
];

export const WhyMintcomPage = () => {
  const { t } = useTranslation();
  const isRtl = t('common.locale') === 'ar';

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white font-sans text-gray-900 dark:bg-[#0F172A] dark:text-white"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Helmet>
        <title>{t('metadata.whyMintcom.title')}</title>
        <meta name="description" content={t('metadata.whyMintcom.description')} />
      </Helmet>
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div className="pointer-events-none absolute right-0 top-10 h-[380px] w-[380px] translate-x-1/4 rounded-full bg-mintcom-green/10 blur-[100px]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-mintcom-green">{t('pages.why.badge')}</p>
            <h1 className="mb-4 font-magilio text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t('pages.why.title')}</h1>
            <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
              {t('pages.why.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {REASONS.map((item, index) => (
            <motion.div
              key={item.titleKey}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="flex gap-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#0F172A] sm:p-8"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mintcom-green/10">
                <item.icon className="h-6 w-6 text-mintcom-green" />
              </div>
              <div>
                <h2 className="mb-2 font-barlow text-lg font-bold">{t(item.titleKey)}</h2>
                <p className="text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">{t(item.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-3 font-magilio text-2xl font-bold sm:text-3xl">{t('pages.why.ctaTitle')}</h2>
          <p className="mb-8 text-sm font-medium text-gray-600 dark:text-gray-300">{t('pages.why.ctaDesc')}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/try-pos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 dark:border-white/10 dark:text-gray-200"
            >
              {t('pages.why.tryDemo')}
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-mintcom-green px-6 py-3 text-sm font-bold text-black shadow-lg shadow-mintcom-green/25"
            >
              {t('nav.getStarted')}
              <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
