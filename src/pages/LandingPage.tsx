import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
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

export const LandingPage = () => {
  const { t } = useTranslation();
  const { isLoading, needsOnboarding } = useAuth();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // A signed-in owner who hasn't created an establishment yet must finish
  // onboarding before anything else — send them straight there instead of the
  // marketing page (mirrors the post-login redirect and the ProtectedRoute).
  if (!isLoading && needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-mintcom-dark font-sans text-gray-900 dark:text-mintcom-light selection:bg-mintcom-green selection:text-black" dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('metadata.home.title')}</title>
        <meta name="description" content={t('metadata.home.description')} />
        <meta property="og:title" content={t('metadata.home.title')} />
        <meta property="og:description" content={t('metadata.home.description')} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />
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
