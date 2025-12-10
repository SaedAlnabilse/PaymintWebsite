import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Layers } from 'lucide-react';

const features = [
  {
    icon: <Layers className="w-8 h-8 text-mint" />,
    title: "All-in-One POS Solution",
    description: "Consolidate sales, inventory, and employees under one roof. No need for costly third-party integrations."
  },
  {
    icon: <Zap className="w-8 h-8 text-mint" />,
    title: "Simple, Fast & Intuitive",
    description: "A clean, modern interface designed for minimal training time and maximum efficiency at the checkout counter."
  },
  {
    icon: <Layers className="w-8 h-8 text-mint" />,
    title: "Advanced Features Included",
    description: "Customize your POS with the features and workflows that suit your operations, no extra complexity."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-mint" />,
    title: "Enterprise-Grade Security",
    description: "Protect your data with end-to-end encryption, regular audits, and secure staff permission settings."
  }
];

export const KeySellingPoints = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          {/* PayMint Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg p-3">
              <img 
                src="/favicon.png" 
                alt="PayMint Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-dark mb-4">Why PayMint?</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-neutral-bg hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group"
            >
              <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
