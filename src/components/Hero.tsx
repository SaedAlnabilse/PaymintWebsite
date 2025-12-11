import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Play, X } from 'lucide-react';

export const Hero = ({ isVideoOpen, setIsVideoOpen }: { isVideoOpen: boolean; setIsVideoOpen: (open: boolean) => void }) => {
  return (
    <section className="pt-40 pb-0 bg-paymint-dark overflow-hidden relative">
      {/* Subtle Gradient/Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-paymint-green/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-paymint-green/5 rounded-full blur-[80px] -z-10" />

      {/* Hero Header */}
      <div className="container mx-auto px-6 flex flex-col items-center gap-16 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto flex flex-col items-center"
        >
          <h1 className="text-6xl lg:text-7xl font-bold font-sans text-white mb-6 leading-none tracking-tight">
            The <span className="text-paymint-green">POS System</span> Built for <br />
            <span className="relative inline-block mt-2">
              Today's
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-paymint-green opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span> Businesses
          </h1>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl font-light">
            Flexible, secure, and packed with premium features. Streamline operations and grow revenue without the overhead.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 mb-12 w-full justify-center">
            <button 
              onClick={() => setIsVideoOpen(true)}
              className="bg-paymint-green text-black px-10 py-5 rounded-none font-bold text-lg hover:bg-white transition-all flex items-center justify-center gap-2 group min-w-[200px]"
            >
              Watch Demo <Play size={20} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#contact" className="bg-transparent text-white border border-white/30 px-10 py-5 rounded-none font-bold text-lg hover:bg-white hover:text-black transition-colors flex items-center justify-center min-w-[200px]">
              Contact Sales
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-paymint-green flex-shrink-0" />
              <span className="font-medium">No Setup Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-paymint-green flex-shrink-0" />
              <span className="font-medium">14-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-paymint-green flex-shrink-0" />
              <span className="font-medium">Cancel Anytime</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsVideoOpen(false)}
          >
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl aspect-video bg-black rounded-none overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <video 
                src="/demo-video.mp4" 
                autoPlay 
                controls 
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
