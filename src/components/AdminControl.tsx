import { motion } from 'framer-motion';
import WhiteLogo from '../assets/White Green Full Logo.png';
import GreenLogo from '../assets/Green Full Logo.png';

export const AdminControl = () => {
  return (
    <section id="admin" className="py-24 bg-white dark:bg-paymint-dark overflow-hidden">
      <div className="container mx-auto px-8 lg:px-20 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-stretch gap-16 lg:gap-24">

          {/* Left Side: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 flex flex-col justify-center"
          >
            <h2 className="text-5xl lg:text-6xl font-bold font-sans text-gray-900 dark:text-white mb-8 tracking-tight">Stay in Control</h2>

            {/* Logo Lockup */}
            <div className="flex items-center gap-4 mb-8">
              <img src={WhiteLogo} alt="PayMint Logo" className="h-12 w-auto object-contain hidden dark:block" />
              <img src={GreenLogo} alt="PayMint Logo" className="h-12 w-auto object-contain block dark:hidden" />
              <div className="h-10 w-px bg-gray-200 dark:bg-white/20 mx-2"></div>
              <div className="flex flex-col justify-center leading-tight">
                <span className="text-gray-900 dark:text-white font-medium">Admin</span>
                <span className="text-gray-900 dark:text-white font-medium">Portal</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Real-time monitoring of staff, sales, and inventory
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
              Stay on top of every detail in real time. From shifts to daily summaries to individual sales, our mobile-enabled back office gives owners and managers complete oversight—anytime, anywhere.
            </p>
          </motion.div>

          {/* Right Side: Dashboard Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2 relative flex"
          >
            <div className="relative rounded-none overflow-hidden shadow-2xl shadow-black/50 w-full">
              <img
                src="/admin-dashboard.png"
                alt="Admin Dashboard - Real-time monitoring interface"
                className="w-full h-full object-cover rounded-none shadow-xl"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
