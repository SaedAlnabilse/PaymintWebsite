import { Check } from 'lucide-react';

const featureList = [
  "Sales Processing",
  "Inventory Management",
  "Employee Permissions",
  "Multi-branch Support",
  "Real-time Dashboards",
  "Cloud Sync",
  "Offline Mode",
  "Promotions Engine",
  "Supplier Management",
  "Audit-friendly Logs"
];

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-neutral-bg">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-dark mb-6">
              Built to Support Every Part of Your Workflow
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              From the front counter to the back office, PayMint provides the tools you need to run your business smoothly.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {featureList.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-transparent hover:border-mint/20 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-mint/10 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-mint" />
                  </div>
                  <span className="font-medium text-dark">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-mint/20 to-blue-500/20 rounded-3xl blur-2xl -z-10" />
            {/* Static Image Placeholder */}
            <div className="rounded-3xl shadow-2xl w-full h-auto bg-gray-900 border-4 border-white overflow-hidden relative transform hover:scale-[1.02] transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" 
                alt="Feature Overview" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
