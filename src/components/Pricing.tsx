import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const plans = [
  {
    name: "Classic Plan",
    price: "36 JOD",
    period: "/m",
    description: "Included: Software, Hardware (Cash Drawer), Installment, All year support, and Back office (Mobile Admin Portal).",
    features: ["Software", "Hardware (Cash Drawer)", "Installment", "All year support", "Back office (Mobile Admin Portal)"],
    detailedFeatures: [
      "Software License",
      "Cash Drawer included",
      "Installment options",
      "Year-round support",
      "Mobile Admin Portal access"
    ],
    notIncluded: "Hardware (Tablet)",
    cta: "Get Started",
    highlight: false
  },
  {
    name: "Inclusive Plan",
    price: "36 JOD",
    period: "/m",
    description: "Included: Software, Hardware (Cash Drawer), Hardware (Tablet), Installment, All year support, and Back office (Mobile Admin Portal).",
    features: ["Software", "Hardware (Cash Drawer)", "Hardware (Tablet)", "Installment", "All year support", "Back office (Mobile Admin Portal)"],
    detailedFeatures: [
      "Software License",
      "Cash Drawer included",
      "Tablet included",
      "Installment options",
      "Year-round support",
      "Mobile Admin Portal access"
    ],
    cta: "Get Started",
    highlight: true
  },
  {
    name: "Custom Plan",
    price: "Custom",
    period: "",
    description: "Allows the user to pick the features, set their workflow, and create a POS that works for them.",
    features: ["Customizable features", "Tailored workflows", "Flexible billing"],
    detailedFeatures: [
      "Pick the features you need",
      "Design custom workflows",
      "Choose hardware and integrations",
      "Dedicated onboarding & support"
    ],
    cta: "Contact Sales",
    highlight: false
  }
];

export const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  return (
    <section id="pricing" className="py-24 bg-paymint-dark relative">
      <div className="container mx-auto px-8 lg:px-20 max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-5xl lg:text-6xl font-bold font-sans text-white mb-6 tracking-tight">PayMint Pricing and Plans</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Choose the plan that fits your business needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-none p-8 border ${plan.highlight ? 'border-paymint-green bg-white/10 shadow-xl scale-105 relative z-10' : 'border-white/10 bg-paymint-surface hover:border-paymint-green/50 transition-colors'}`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-paymint-green text-black px-4 py-1 rounded-none text-sm font-bold">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <p className="text-base text-gray-400 mb-8 leading-relaxed">{plan.description}</p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <Check size={16} className="text-paymint-green flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.notIncluded && (
                <p className="text-sm text-gray-500 mb-4"><span className="font-semibold">Not Included:</span> {plan.notIncluded}</p>
              )}

              <button 
                onClick={() => setSelectedPlan(plan)}
                className={`w-full py-3 rounded-none font-bold transition-all ${
                  plan.highlight 
                    ? 'bg-paymint-green text-black hover:bg-paymint-green/90 shadow-lg shadow-paymint-green/25' 
                    : 'bg-transparent border border-white/20 text-white hover:border-paymint-green hover:text-paymint-green'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Details Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-paymint-surface border border-white/10 rounded-none w-full max-w-lg overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-paymint-surface">
                <h3 className="text-xl font-bold text-white">Plan Details</h3>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 rounded-none hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedPlan.name}</h2>
                  <div className="flex items-baseline justify-center gap-1 mb-4">
                    <span className="text-5xl font-bold text-paymint-green">{selectedPlan.price}</span>
                    <span className="text-gray-400 text-xl">{selectedPlan.period}</span>
                  </div>
                  <p className="text-gray-400">{selectedPlan.description}</p>
                </div>

                <div className="bg-black/40 rounded-none p-6 mb-8 border border-white/5">
                  <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">What's Included</h4>
                  <ul className="space-y-3">
                    {[...selectedPlan.features, ...selectedPlan.detailedFeatures].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-400">
                        <div className="mt-1 w-5 h-5 rounded-none bg-paymint-green/20 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-paymint-green" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a 
                  href="#contact" 
                  onClick={() => setSelectedPlan(null)}
                  className="block w-full bg-paymint-green text-black py-4 rounded-none font-bold text-center hover:bg-paymint-green/90 transition-all hover:shadow-lg hover:shadow-paymint-green/25 text-lg"
                >
                  Contact Sales Team
                </a>
                <p className="text-center text-xs text-gray-500 mt-4">
                  No credit card required for consultation
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
