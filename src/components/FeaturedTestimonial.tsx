import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonial = {
  id: 1,
  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis",
  name: "John Deo",
  title: "Business Owner",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
};

export const FeaturedTestimonial = () => {
  const handlePrevClick = () => {
    // Arrow functionality can be added later if needed
  };

  const handleNextClick = () => {
    // Arrow functionality can be added later if needed
  };

  return (
    <section className="py-20 bg-paymint-surface overflow-hidden relative group">
      <div className="container mx-auto px-6">
        <div className="relative max-w-6xl mx-auto">
            {/* Navigation Buttons */}
            <button 
              onClick={handlePrevClick}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 p-2 rounded-none bg-black shadow-lg text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-paymint-green md:flex hidden border border-white/10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            
            <button 
              onClick={handleNextClick}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 p-2 rounded-none bg-black shadow-lg text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-paymint-green md:flex hidden border border-white/10"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Mobile Navigation Buttons */}
             <div className="flex md:hidden justify-center gap-4 mb-8">
               <button onClick={handlePrevClick} className="p-2 rounded-none bg-black border border-white/10 shadow-md text-white"><ChevronLeft/></button>
               <button onClick={handleNextClick} className="p-2 rounded-none bg-black border border-white/10 shadow-md text-white"><ChevronRight/></button>
             </div>

            <div className="min-h-[400px] flex items-center justify-center">
              <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full">
                {/* Image Section */}
                <div className="relative">
                  <div className="text-center">
                    <div className="w-64 h-64 rounded-none overflow-hidden mx-auto mb-6 relative border-4 border-white/5">
                       <img 
                         src={testimonial.image}
                         alt={testimonial.name}
                         className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                       />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {testimonial.title}
                    </p>
                  </div>
                </div>

                {/* Quote Section */}
                <div className="flex-1 max-w-xl relative pt-10 pb-10">
                  <span className="absolute top-0 left-0 text-4xl md:text-5xl font-serif text-white/10 leading-none select-none">"</span>
                  
                  <p className="text-lg md:text-xl leading-relaxed text-gray-300 font-normal px-8 relative z-10">
                    {testimonial.text}
                  </p>
                  
                  <span className="absolute bottom-[-1rem] right-0 text-4xl md:text-5xl font-serif text-white/10 leading-none select-none">"</span>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
};