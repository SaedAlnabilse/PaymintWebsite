import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  Coffee,
  UtensilsCrossed,
  ShoppingBag,
  Store,
  Building2,
  Cake,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

type Industry = {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  pointsKey: string;
};

const INDUSTRIES: Industry[] = [
  {
    icon: UtensilsCrossed,
    titleKey: 'pages.industries.items.restaurant.title',
    descKey: 'pages.industries.items.restaurant.description',
    pointsKey: 'pages.industries.items.restaurant.points',
  },
  {
    icon: Coffee,
    titleKey: 'pages.industries.items.cafe.title',
    descKey: 'pages.industries.items.cafe.description',
    pointsKey: 'pages.industries.items.cafe.points',
  },
  {
    icon: ShoppingBag,
    titleKey: 'pages.industries.items.retail.title',
    descKey: 'pages.industries.items.retail.description',
    pointsKey: 'pages.industries.items.retail.points',
  },
  {
    icon: Cake,
    titleKey: 'pages.industries.items.bakery.title',
    descKey: 'pages.industries.items.bakery.description',
    pointsKey: 'pages.industries.items.bakery.points',
  },
  {
    icon: Store,
    titleKey: 'pages.industries.items.qsr.title',
    descKey: 'pages.industries.items.qsr.description',
    pointsKey: 'pages.industries.items.qsr.points',
  },
  {
    icon: Building2,
    titleKey: 'pages.industries.items.multi.title',
    descKey: 'pages.industries.items.multi.description',
    pointsKey: 'pages.industries.items.multi.points',
  },
];

export const IndustriesPage = () => {
  const { t } = useTranslation();
  const isRtl = t('common.locale') === 'ar';

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white font-sans text-gray-900 dark:bg-[#0F172A] dark:text-white"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Helmet>
        <title>{t('metadata.industries.title')}</title>
        <meta name="description" content={t('metadata.industries.description')} />
        <meta property="og:title" content={t('metadata.industries.title')} />
        <meta property="og:description" content={t('metadata.industries.description')} />
      </Helmet>
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div className="pointer-events-none absolute left-0 bottom-0 h-[300px] w-[300px] -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/10 blur-[80px]" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-mintcom-green">
              {t('pages.industries.badge')}
            </p>
            <h1 className="mb-6 font-magilio text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
              {t('pages.industries.title')}
            </h1>
            <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
              {t('pages.industries.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20 dark:bg-[#1E293B]/50">
        <div className="mx-auto grid w-full grid-cols-1 gap-8 md:grid-cols-2">
          {INDUSTRIES.map((item, index) => {
            const points = t(item.pointsKey, { returnObjects: true });
            const pointList = Array.isArray(points) ? (points as string[]) : [];
            return (
              <motion.article
                key={item.titleKey}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 2) * 0.08 }}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition hover:border-mintcom-green/30 dark:border-white/5 dark:bg-[#0F172A]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-mintcom-green/10">
                  <item.icon className="h-7 w-7 text-mintcom-green" />
                </div>
                <h2 className="mb-3 font-barlow text-xl font-bold text-gray-900 dark:text-white">{t(item.titleKey)}</h2>
                <p className="mb-5 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                  {t(item.descKey)}
                </p>
                <ul className="space-y-2">
                  {pointList.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mintcom-green" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto w-full text-center">
          <h2 className="mb-3 font-magilio text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {t('pages.industries.ctaTitle')}
          </h2>
          <p className="mb-8 text-sm font-medium text-gray-600 dark:text-gray-300">{t('pages.industries.ctaDesc')}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-mintcom-green px-6 py-3 text-sm font-bold text-black shadow-lg shadow-mintcom-green/25"
            >
              {t('nav.getStarted')}
              <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
            </Link>
            <Link
              to="/#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-mintcom-green/40 dark:border-white/10 dark:text-gray-200"
            >
              {t('pages.industries.contactUs')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
