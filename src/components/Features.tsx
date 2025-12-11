import { ShieldCheck, Zap, Settings, Store } from 'lucide-react';

const features = [
  {
    icon: <Store className="w-8 h-8 text-paymint-green" />,
    title: "All-in-One POS Solution",
    description: "Consolidate sales, inventory, and employees under one roof."
  },
  {
    icon: <Zap className="w-8 h-8 text-paymint-green" />,
    title: "Simple, Fast & Intuitive",
    description: "A clean, modern interface designed for maximum efficiency."
  },
  {
    icon: <Settings className="w-8 h-8 text-paymint-green" />,
    title: "Advanced Features Included",
    description: "Customize your POS with workflows that suit your operations."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-paymint-green" />,
    title: "Enterprise-Grade Security",
    description: "Protect your data with end-to-end encryption and regular audits."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-white dark:bg-paymint-dark overflow-hidden">
      <div className="flex flex-col lg:flex-row items-stretch gap-16 lg:gap-24">
        
        {/* Left Side: Video - extends to left edge */}
        <div className="w-full lg:w-1/2 pl-0">
          <div className="relative rounded-none overflow-hidden shadow-2xl shadow-black/50 h-full">
            <video
              src="/demo-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-none shadow-xl"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center pr-8 lg:pr-20 px-8 lg:px-0">
          <h2 className="text-5xl lg:text-6xl font-bold font-sans text-gray-900 dark:text-white mb-10 tracking-tight">Why PayMint?</h2>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
