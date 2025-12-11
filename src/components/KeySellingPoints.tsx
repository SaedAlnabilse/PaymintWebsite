import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Settings, Store } from 'lucide-react';

const features = [
  {
    icon: <Store className="w-12 h-12 text-paymint-green" />,
    title: "All-in-One POS Solution",
    description: "Consolidate sales, inventory, and employees under one roof. No need for costly third-party integrations."
  },
  {
    icon: <Zap className="w-12 h-12 text-paymint-green" />,
    title: "Simple, Fast & Intuitive",
    description: "A clean, modern interface designed for minimal training time and maximum efficiency at the checkout counter."
  },
  {
    icon: <Settings className="w-12 h-12 text-paymint-green" />,
    title: "Advanced Features Included",
    description: "Customize your POS with the features and workflows that suit your operations, no extra complexity."
  },
  {
    icon: <ShieldCheck className="w-12 h-12 text-paymint-green" />,
    title: "Enterprise-Grade Security",
    description: "Protect your data with end-to-end encryption, regular audits, and secure staff permission settings."
  }
];

export const KeySellingPoints = () => {
  return (
    <section className="py-24 bg-paymint-dark">
      <div className="container mx-auto px-8 lg:px-20 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-5xl lg:text-6xl font-bold font-sans text-white mb-6 tracking-tight">Why PayMint?</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-none bg-transparent hover:bg-white/5 transition-all duration-300 border-l border-white/10 hover:border-paymint-green group text-center"
            >
              <div className="w-full flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-base text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
