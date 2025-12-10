import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

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
          className="cursor-pointer"
        >
          <Logo size="md" />
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-paymint-dark/80 hover:text-paymint-green transition-colors">Features</a>
          <a href="#pricing" className="text-paymint-dark/80 hover:text-paymint-green transition-colors">Pricing</a>
          <a href="#contact" className="text-paymint-dark/80 hover:text-paymint-green transition-colors">Contact</a>
          <a href="#admin" className="text-paymint-dark/80 hover:text-paymint-green transition-colors font-medium">Admin Portal</a>
          <a 
            href="#contact"
            className="bg-paymint-green text-white px-6 py-2 rounded-full font-medium hover:bg-paymint-green/90 transition-colors hover:shadow-lg hover:shadow-paymint-green/20"
          >
            Book a Demo
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-paymint-dark" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
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
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-paymint-dark/80">Features</a>
              <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-paymint-dark/80">Pricing</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-paymint-dark/80">Contact</a>
              <a href="#admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-paymint-dark/80">Admin Portal</a>
              <a 
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-paymint-green text-white px-6 py-3 rounded-lg font-medium w-full shadow-md shadow-paymint-green/20 block text-center"
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
