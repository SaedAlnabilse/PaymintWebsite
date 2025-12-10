import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-2xl font-bold text-dark flex items-center gap-2 cursor-pointer"
        >
          <span className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center text-white font-bold">P</span>
          PayMint
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-dark/80 hover:text-mint transition-colors">Features</a>
          <a href="#pricing" className="text-dark/80 hover:text-mint transition-colors">Pricing</a>
          <a href="#contact" className="text-dark/80 hover:text-mint transition-colors">Contact</a>
          <a href="#admin" className="text-dark/80 hover:text-mint transition-colors font-medium">Admin Portal</a>
          <a 
            href="#contact"
            className="bg-mint text-white px-6 py-2 rounded-full font-medium hover:bg-mint-dark transition-colors hover:shadow-lg hover:shadow-mint/20"
          >
            Book a Demo
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-dark" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t absolute w-full shadow-lg"
          >
            <div className="flex flex-col p-6 gap-4">
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-dark/80">Features</a>
              <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-dark/80">Pricing</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-dark/80">Contact</a>
              <a href="#admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-dark/80">Admin Portal</a>
              <a 
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-mint text-white px-6 py-3 rounded-lg font-medium w-full shadow-md shadow-mint/20 block text-center"
              >
                Book a Demo
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
