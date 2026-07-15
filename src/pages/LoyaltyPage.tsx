import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Heart, Gift, Percent, Users, Sparkles, ArrowRight, type LucideIcon } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const CARDS: { icon: LucideIcon; titleKey: string; descKey: string }[] = [
  { icon: Sparkles, titleKey: 'pages.loyalty.cards.earn.title', descKey: 'pages.loyalty.cards.earn.description' },
  { icon: Percent, titleKey: 'pages.loyalty.cards.discounts.title', descKey: 'pages.loyalty.cards.discounts.description' },
  { icon: Gift, titleKey: 'pages.loyalty.cards.gifts.title', descKey: 'pages.loyalty.cards.gifts.description' },
  { icon: Users, titleKey: 'pages.loyalty.cards.customers.title', descKey: 'pages.loyalty.cards.customers.description' },
];

export const LoyaltyPage = () => {
  const { t } = useTranslation();
  const isRtl = t('common.locale') === 'ar';

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white font-sans text-gray-900 dark:bg-[#0F172A] dark:text-white"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Helmet>
        <title>{t('metadata.loyaltyPage.title')}</title>
        <meta name="description" content={t('metadata.loyaltyPage.description')} />
      </Helmet>
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-rose-400/10 blur-[100px]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mintcom-green/10">
              <Heart className="h-8 w-8 text-mintcom-green" />
            </div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-mintcom-green">{t('pages.loyalty.badge')}</p>
            <h1 className="mb-4 font-magilio text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t('pages.loyalty.title')}</h1>
            <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
              {t('pages.loyalty.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20 dark:bg-[#1E293B]/50">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.titleKey}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-[#0F172A]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-mintcom-green/10">
                <card.icon className="h-6 w-6 text-mintcom-green" />
              </div>
              <h2 className="mb-2 font-barlow text-lg font-bold">{t(card.titleKey)}</h2>
              <p className="text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">{t(card.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-3 font-magilio text-2xl font-bold sm:text-3xl">{t('pages.loyalty.whyTitle')}</h2>
          <p className="mb-8 text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-300">{t('pages.loyalty.whyBody')}</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-mintcom-green px-6 py-3 text-sm font-bold text-black shadow-lg shadow-mintcom-green/25"
          >
            {t('pages.loyalty.cta')}
            <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};
