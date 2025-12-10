import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { KeySellingPoints } from './components/KeySellingPoints';
import { Features } from './components/Features';
import { AdminControl } from './components/AdminControl';
import { FeaturedTestimonial } from './components/FeaturedTestimonial';
import { Pricing } from './components/Pricing';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

function App() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-bg font-sans text-dark selection:bg-mint selection:text-white">
      <Navbar />
      <main>
        <Hero isVideoOpen={isVideoOpen} setIsVideoOpen={setIsVideoOpen} />
        <Testimonials />
        <KeySellingPoints />
        <Features />
        <AdminControl />
        <FeaturedTestimonial />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;