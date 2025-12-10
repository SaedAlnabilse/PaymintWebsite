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
    <section id="pricing" className="py-20 bg-white relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-dark mb-4">PayMint Pricing and Plans</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            The second image details three subscription plans:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-2xl p-8 border ${plan.highlight ? 'border-mint bg-white shadow-xl scale-105 relative z-10' : 'border-gray-100 bg-neutral-bg hover:border-mint/50 transition-colors'}`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-mint text-white px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-dark mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-dark">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <p className="text-gray-500 mb-8 text-sm">{plan.description}</p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <Check size={16} className="text-mint flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.notIncluded && (
                <p className="text-sm text-gray-400 mb-4"><span className="font-semibold">Not Included:</span> {plan.notIncluded}</p>
              )}

              <button 
                onClick={() => setSelectedPlan(plan)}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.highlight 
                    ? 'bg-mint text-white hover:bg-mint-dark shadow-lg shadow-mint/25' 
                    : 'bg-white border border-gray-200 text-dark hover:border-mint hover:text-mint'
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                <h3 className="text-xl font-bold text-dark">Plan Details</h3>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-dark mb-2">{selectedPlan.name}</h2>
                  <div className="flex items-baseline justify-center gap-1 mb-4">
                    <span className="text-5xl font-bold text-mint">{selectedPlan.price}</span>
                    <span className="text-gray-500 text-xl">{selectedPlan.period}</span>
                  </div>
                  <p className="text-gray-600">{selectedPlan.description}</p>
                </div>

                <div className="bg-neutral-bg rounded-xl p-6 mb-8">
                  <h4 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">What's Included</h4>
                  <ul className="space-y-3">
                    {[...selectedPlan.features, ...selectedPlan.detailedFeatures].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700">
                        <div className="mt-1 w-5 h-5 rounded-full bg-mint/20 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-mint" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a 
                  href="#contact" 
                  onClick={() => setSelectedPlan(null)}
                  className="block w-full bg-mint text-white py-4 rounded-xl font-bold text-center hover:bg-mint-dark transition-all hover:shadow-lg hover:shadow-mint/25 text-lg"
                >
                  Contact Sales Team
                </a>
                <p className="text-center text-xs text-gray-400 mt-4">
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
