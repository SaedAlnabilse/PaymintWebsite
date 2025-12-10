
const companies = [
  "RetailCo", "FreshMart", "StyleHub", "TechStore", "CafeBrew", "BurgerJoint"
];

export const Testimonials = () => {
  return (
    <section className="py-12 bg-white border-b border-gray-50">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm font-medium text-gray-400 mb-8 uppercase tracking-wider">Trusted by businesses across the region</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Logos */}
            {companies.map((name, i) => (
                <div key={i} className="text-2xl font-bold text-gray-300 flex items-center gap-2 select-none">
                    <div className={`w-8 h-8 rounded bg-gray-200`} />
                    {name}
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};
