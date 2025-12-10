import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Play, X } from 'lucide-react';

export const Hero = ({ isVideoOpen, setIsVideoOpen }: { isVideoOpen: boolean; setIsVideoOpen: (open: boolean) => void }) => {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-neutral-bg to-white overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-mint/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl lg:text-6xl font-bold text-dark mb-6 leading-tight">
            The POS System Built for <span className="text-mint relative">
              Today's
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-mint opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span> Businesses
          </h1>
          <p className="text-xl text-gray-500 mb-8 leading-relaxed">
            Flexible, secure, and packed with premium features—at no extra cost. Streamline your operations and grow your revenue.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button 
              onClick={() => setIsVideoOpen(true)}
              className="bg-mint text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-mint-dark transition-all hover:shadow-lg hover:shadow-mint/25 flex items-center justify-center gap-2"
            >
              Watch Demo <Play size={20} fill="currentColor" />
            </button>
            <a href="#contact" className="bg-white text-dark border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-mint hover:text-mint transition-colors flex items-center justify-center">
              Contact Sales
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-mint" />
              <span>No Setup Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-mint" />
              <span>14-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-mint" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
                              {/* Video Demo Placeholder */}
                                <div 
                                  id="demo-video" 
                                  className="relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform rotate-[-1deg] hover:rotate-0 transition-transform duration-500 group"
                                >
                                  <video 
                                    src="/demo-video.mp4" 
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    controls
                                    className="w-full h-full object-cover aspect-video"
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                </div>        </motion.div>
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
              className="w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
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
