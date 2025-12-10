import { motion } from 'framer-motion';

export const AdminControl = () => {
  return (
    <section id="admin" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left Side: Image with Fade Effect */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <video 
                src="/demo-video.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-auto rounded-2xl shadow-xl"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>

          {/* Right Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-4xl font-bold text-mint-dark mb-8">Stay in Control</h2>
            
            {/* Logo Lockup */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 bg-mint rounded-lg flex items-center justify-center text-white font-bold text-xl">P</span>
                <span className="text-3xl font-bold text-dark">PayMint</span>
              </div>
              <div className="h-10 w-px bg-gray-300 mx-2"></div>
              <div className="flex flex-col justify-center leading-tight">
                <span className="text-dark font-medium">Admin</span>
                <span className="text-dark font-medium">Portal</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-dark mb-6">
              Real-time monitoring of staff, sales, and inventory
            </h3>

            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              Stay on top of every detail in real time. From shifts to daily summaries to individual sales, our mobile-enabled back office gives owners and managers complete oversight—anytime, anywhere.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
