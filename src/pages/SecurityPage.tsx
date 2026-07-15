import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  ShieldCheck,
  Lock,
  Eye,
  Server,
  KeyRound,
  FileCheck,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

type Pillar = {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
};

const PILLARS: Pillar[] = [
  { icon: Lock, titleKey: 'pages.security.pillars.encryption.title', descKey: 'pages.security.pillars.encryption.description' },
  { icon: KeyRound, titleKey: 'pages.security.pillars.access.title', descKey: 'pages.security.pillars.access.description' },
  { icon: Server, titleKey: 'pages.security.pillars.cloud.title', descKey: 'pages.security.pillars.cloud.description' },
  { icon: Eye, titleKey: 'pages.security.pillars.audit.title', descKey: 'pages.security.pillars.audit.description' },
  { icon: FileCheck, titleKey: 'pages.security.pillars.privacy.title', descKey: 'pages.security.pillars.privacy.description' },
  { icon: ShieldCheck, titleKey: 'pages.security.pillars.ops.title', descKey: 'pages.security.pillars.ops.description' },
];

export const SecurityPage = () => {
  const { t } = useTranslation();
  const isRtl = t('common.locale') === 'ar';

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white font-sans text-gray-900 dark:bg-[#0F172A] dark:text-white"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Helmet>
        <title>{t('metadata.security.title')}</title>
        <meta name="description" content={t('metadata.security.description')} />
        <meta property="og:title" content={t('metadata.security.title')} />
        <meta property="og:description" content={t('metadata.security.description')} />
      </Helmet>
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-mintcom-green/10 blur-[100px]" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mintcom-green/10">
              <ShieldCheck className="h-8 w-8 text-mintcom-green" />
            </div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-mintcom-green">
              {t('pages.security.badge')}
            </p>
            <h1 className="mb-6 font-magilio text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
              {t('pages.security.title')}
            </h1>
            <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
              {t('pages.security.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20 dark:bg-[#1E293B]/50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((item, index) => (
            <motion.div
              key={item.titleKey}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 3) * 0.06 }}
              className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition hover:border-mintcom-green/30 dark:border-white/5 dark:bg-[#0F172A]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-mintcom-green/10">
                <item.icon className="h-6 w-6 text-mintcom-green" />
              </div>
              <h2 className="mb-2 font-barlow text-lg font-bold text-gray-900 dark:text-white">{t(item.titleKey)}</h2>
              <p className="text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">{t(item.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="font-magilio text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {t('pages.security.trustTitle')}
          </h2>
          <p className="text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-300">
            {t('pages.security.trustBody')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/legal/privacy"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:border-mintcom-green/40 hover:text-mintcom-green dark:border-white/10 dark:text-gray-200"
            >
              {t('footer.privacyPolicy')}
            </Link>
            <Link
              to="/legal/terms"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:border-mintcom-green/40 hover:text-mintcom-green dark:border-white/10 dark:text-gray-200"
            >
              {t('footer.termsOfService')}
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-mintcom-green px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-mintcom-green/25"
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
