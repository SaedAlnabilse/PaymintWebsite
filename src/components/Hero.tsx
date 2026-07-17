import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Play, X, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_VIDEO_POSTER_URL, HERO_VIDEO_URL, isNativeVideoUrl } from '../config/downloads';
import heroImage from '../assets/mintcom-pos-hero.png';

const SplitText = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => {
        const isMintcom = word.toLowerCase().includes('mintcom');
        return (
          <span
            key={i}
            className={isMintcom ? 'text-mintcom-green' : (i % 2 === 0 ? 'text-gray-900 dark:text-white' : 'text-mintcom-green')}
          >
            {word}{' '}
          </span>
        );
      })}
    </span>
  );
};

export const Hero = ({ isVideoOpen, setIsVideoOpen }: { isVideoOpen: boolean; setIsVideoOpen: (open: boolean) => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/owner');
    } else {
      window.open('/signup', '_blank');
    }
  };

  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden bg-white dark:bg-[#0f0f0f]" dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-mintcom-green/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-mintcom-green/10 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-10">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-10 xl:gap-12">

          {/* Text Content — reserve real width so the title never clips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full min-w-0 shrink-0 text-start lg:w-[40%] lg:max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="group relative mb-8 inline-flex max-w-full items-center gap-2.5 rounded-[12px] border border-mintcom-green/20 bg-mintcom-green/5 px-3 py-1.5 text-xs font-bold text-mintcom-green shadow-[0_0_15px_rgba(124,195,159,0.05)] backdrop-blur-md transition-all duration-300 hover:border-mintcom-green/40 dark:bg-mintcom-green/10 xs:px-3.5"
            >
              <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-mintcom-green/20 text-mintcom-green overflow-hidden">
                <Zap size={11} fill="currentColor" className="relative z-10" />
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-mintcom-green/30"
                />
              </div>
              <span className="min-w-0 leading-none text-[10px] uppercase tracking-widest md:text-[11px]">
                {t('landing.hero.badge')}
              </span>
            </motion.div>

            <h1 className="mb-6 font-magilio text-3xl font-bold tracking-tight leading-tight sm:text-4xl lg:text-5xl xl:text-6xl">
              <span className="block leading-[1.15] rtl:leading-[1.25]"><SplitText text={t('landing.hero.title1')} /></span>
              <span className="block leading-[1.15] rtl:leading-[1.25]"><SplitText text={t('landing.hero.title2')} /></span>
              <span className="block leading-[1.15] rtl:leading-[1.25]"><SplitText text={t('landing.hero.title3')} /></span>
            </h1>

            <p className="mb-8 max-w-md text-base font-light leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg md:text-xl lg:max-w-none">
              {t('landing.hero.description')}
            </p>

            <div className="flex w-full flex-row flex-nowrap items-stretch justify-start gap-2.5 sm:gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('/try-pos', '_blank')}
                className="group flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border-2 border-mintcom-green/40 bg-mintcom-green/10 px-2.5 py-3 text-xs font-bold text-gray-900 transition-colors hover:border-mintcom-green hover:bg-mintcom-green/15 dark:text-white xs:gap-2 xs:px-3 xs:text-[13px] sm:px-4 sm:py-3.5 sm:text-sm md:px-5 md:text-[15px]"
              >
                <Play size={14} fill="currentColor" className="shrink-0 text-mintcom-green sm:h-4 sm:w-4" />
                <span>{t('landing.hero.tryDesktop')}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCtaClick}
                className="group flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-mintcom-green px-2.5 py-3 text-xs font-bold text-black transition-all xs:gap-2 xs:px-3 xs:text-[13px] sm:px-4 sm:py-3.5 sm:text-sm md:px-5 md:text-[15px]"
              >
                <span>{isAuthenticated ? t('nav.dashboard', 'Go to Dashboard') : t('landing.hero.cta')}</span>
                <ArrowRight size={16} className={`shrink-0 transition-transform sm:h-[18px] sm:w-[18px] ${t('common.locale') === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </motion.button>

              {/* Temporarily hidden — re-enable when a dedicated hero video CTA is needed
              {HERO_VIDEO_URL && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsVideoOpen(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-100 px-6 py-3.5 text-base font-bold text-gray-900 transition-colors hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:px-8 sm:py-4 sm:text-lg sm:w-72 whitespace-nowrap"
                >
                  <Play size={20} fill="currentColor" className="text-mintcom-green" />
                  {t('landing.hero.watchVideo')}
                </motion.button>
              )}
              */}
            </div>


          </motion.div>

          {/* Visual — product photo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative mt-10 flex w-full min-w-0 flex-1 justify-center sm:mt-14 lg:mt-16 lg:justify-end"
          >
            <motion.div
              className="relative w-full max-w-[320px] sm:max-w-[380px] md:max-w-[440px] lg:max-w-[500px] xl:max-w-[540px]"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Solid green disc behind the device with a thin offset outline ring */}
              <div
                aria-hidden
                className="pointer-events-none absolute z-0 -translate-x-1/2 -translate-y-1/2"
                style={{ width: '90%', height: '90%', left: '64%', top: '38%' }}
              >
                <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible">
                  <defs>
                    {/* Gentle wobble so the shapes read as hand-painted rather than geometric */}
                    <filter id="heroBrush" x="-15%" y="-15%" width="130%" height="130%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="noise" />
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                  </defs>
                  <g filter="url(#heroBrush)">
                    {/* Filled disc */}
                    <circle cx="200" cy="200" r="172" fill="#7cc39f" opacity="0.9" />
                    {/* Thin outline ring, offset so it peeks past the disc like the reference */}
                    <circle cx="212" cy="192" r="188" fill="none" stroke="#7cc39f" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  </g>
                </svg>
              </div>

              <img
                src={heroImage}
                alt={t('landing.hero.alt', 'Mintcom All-in-One POS System')}
                className="relative z-10 h-auto w-full object-contain drop-shadow-2xl"
                width={1053}
                height={927}
                decoding="async"
                fetchPriority="high"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && HERO_VIDEO_URL && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsVideoOpen(false)}
          >
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {isNativeVideoUrl(HERO_VIDEO_URL) ? (
                <video
                  src={HERO_VIDEO_URL}
                  poster={DEMO_VIDEO_POSTER_URL}
                  className="h-full w-full bg-black object-contain"
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  title={t('landing.hero.watchVideo')}
                />
              ) : (
                <iframe
                  src={HERO_VIDEO_URL}
                  title={t('landing.hero.watchVideo')}
                  className="h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
