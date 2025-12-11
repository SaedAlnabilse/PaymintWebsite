import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const workflowFeatures = [
  {
    title: "Sales Processing",
    description: "Complete transaction management with multiple payment methods"
  },
  {
    title: "Inventory Management", 
    description: "Real-time stock tracking and automated reorder alerts"
  },
  {
    title: "Employee Permissions",
    description: "Role-based access control and staff performance tracking"
  },
  {
    title: "Real-time Dashboards",
    description: "Live analytics and business insights at your fingertips"
  },
  {
    title: "Multi-branch Support",
    description: "Centralized management across multiple locations"
  },
  {
    title: "Cloud Sync",
    description: "Automatic data backup and cross-device synchronization"
  }
];

export const WorkflowSupport = () => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-paymint-dark overflow-hidden">
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
            <h2 className="text-5xl lg:text-6xl font-bold font-sans text-gray-900 dark:text-white mb-8 tracking-tight">
              Built to Support<br />
              Every Part of Your<br />
              Workflow
            </h2>

            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-12">
              From the front counter to the back office, PayMint provides the tools you need to run your business smoothly.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {workflowFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-none border border-gray-200 dark:border-white/10 hover:border-paymint-green/50 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <CheckCircle2 size={20} className="text-paymint-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
                alt="PayMint Dashboard - Complete workflow management"
                className="w-full h-full object-cover rounded-none shadow-xl"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};