import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis",
    name: "John Deo",
    title: "Business Owner",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    text: "Paymint has completely transformed how we handle our transactions. The speed and security are unmatched, and the support team is incredible.",
    name: "Sarah Smith",
    title: "Marketing Director",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    text: "Integrating this platform was the best decision for our startup. It's intuitive, reliable, and has scaled perfectly with our growing customer base.",
    name: "Michael Chen",
    title: "Tech Lead",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    text: "The analytics features alone are worth the switch. I can see exactly what's selling and what's not in real-time.",
    name: "Emily Davis",
    title: "Cafe Owner",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 5,
    text: "Setup was a breeze and the customer service has been outstanding whenever we had questions.",
    name: "Robert Wilson",
    title: "Store Manager",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=80"
  }
];

export const FeaturedTestimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-white overflow-hidden relative group">
      <div className="container mx-auto px-6">
        <div className="relative max-w-6xl mx-auto">
            {/* Navigation Buttons */}
            <button 
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 p-2 rounded-full bg-white shadow-lg text-gray-800 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-mint md:flex hidden"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            
            <button 
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 p-2 rounded-full bg-white shadow-lg text-gray-800 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-mint md:flex hidden"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Mobile Navigation Buttons (Visible only on small screens below content) */}
             <div className="flex md:hidden justify-center gap-4 mb-8">
               <button onClick={prevTestimonial} className="p-2 rounded-full bg-white shadow-md text-gray-800"><ChevronLeft/></button>
               <button onClick={nextTestimonial} className="p-2 rounded-full bg-white shadow-md text-gray-800"><ChevronRight/></button>
             </div>

            <div className="min-h-[400px] flex items-center justify-center">
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full"
                >
                  {/* Quote Section */}
                  <div className="flex-1 max-w-xl relative pt-10 pb-10">
                    <span className="absolute top-0 left-0 text-6xl md:text-8xl font-serif text-black leading-none select-none">“</span>
                    
                    <p className="text-xl md:text-2xl leading-relaxed text-gray-600 font-light px-8 relative z-10">
                      {testimonials[currentIndex].text}
                    </p>
                    
                    <span className="absolute bottom-[-2rem] right-0 text-6xl md:text-8xl font-serif text-black leading-none select-none">”</span>
                  </div>

                  {/* Image Section */}
                  <div className="relative">
                    <div className="text-center">
                      <div className="w-64 h-64 rounded-full overflow-hidden mx-auto mb-6 relative">
                         <img 
                           src={testimonials[currentIndex].image}
                           alt={testimonials[currentIndex].name}
                           className="w-full h-full object-cover"
                         />
                      </div>
                      <h3 className="text-lg font-bold text-black italic">
                        {testimonials[currentIndex].name} - {testimonials[currentIndex].title}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
        </div>
      </div>
    </section>
  );
};