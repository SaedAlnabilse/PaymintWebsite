import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { Features } from '../components/Features';
import { CloudControl } from '../components/CloudControl';
import { AdminControl } from '../components/AdminControl';
import { Hardware } from '../components/Hardware';
import { PricingDownload } from '../components/PricingDownload';
import { Contact } from '../components/Contact';
import { Footer } from '../components/Footer';
import { ONBOARDING_START_PATH } from '../utils/onboardingLaunch';

export const LandingPage = () => {
  const { t } = useTranslation();
  const { needsOnboarding } = useAuth();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const isRtl = t('common.locale') === 'ar';

  return (
    <div className="min-h-screen bg-white dark:bg-mintcom-dark font-sans text-gray-900 dark:text-mintcom-light selection:bg-mintcom-green selection:text-black" dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('metadata.home.title')}</title>
        <meta name="description" content={t('metadata.home.description')} />
        <meta property="og:title" content={t('metadata.home.title')} />
        <meta property="og:description" content={t('metadata.home.description')} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />
      {/* Soft nudge — never blocks browsing. Users can finish first-location setup anytime. */}
      {needsOnboarding && (
        <div className="relative z-40 border-b border-mintcom-green/20 bg-gradient-to-r from-mintcom-green/15 via-emerald-50 to-mintcom-green/10 dark:from-mintcom-green/20 dark:via-[#0a1a12] dark:to-mintcom-green/10">
          <div className="mx-auto flex max-w-[1200px] flex-col items-stretch gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3 sm:items-center">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mintcom-green/20 text-mintcom-green sm:mt-0">
                <Sparkles size={16} />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('nav.onboardingBannerTitle', {
                    defaultValue: 'Your first location is one step away',
                  })}
                </p>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('nav.onboardingBannerSubtitle', {
                    defaultValue: 'Browse freely anytime — pick up setup when you’re ready.',
                  })}
                </p>
              </div>
            </div>
            <Link
              to={ONBOARDING_START_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-mintcom-green px-4 py-2.5 text-sm font-bold text-black shadow-[0_4px_16px_-4px_rgba(124,195,159,0.5)] transition-all hover:shadow-[0_6px_20px_-4px_rgba(124,195,159,0.7)] active:scale-[0.98]"
            >
              {t('nav.continueOnboarding', { defaultValue: 'Continue Onboarding' })}
              <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
            </Link>
          </div>
        </div>
      )}
      <main>
        <Hero isVideoOpen={isVideoOpen} setIsVideoOpen={setIsVideoOpen} />
        <WhyChooseUs />
        <Features />
        <CloudControl />
        <AdminControl />
        <PricingDownload />
        <Hardware />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
