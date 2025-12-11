import { Send, Mail, Phone, X } from 'lucide-react';
import { useState } from 'react';

type ModalType = 'privacy' | 'terms' | null;

export const Contact = () => {
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <section id="contact" className="py-24 bg-white dark:bg-paymint-dark">
      <div className="container mx-auto px-8 lg:px-20 max-w-6xl">
        <div className="max-w-4xl mx-auto bg-white dark:bg-paymint-surface rounded-none shadow-2xl shadow-black/5 dark:shadow-black/50 overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-white/10">
          <div className="p-12 md:w-1/2 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Blurred background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80')" }}
            />
            {/* Green overlay with multiply blend mode */}
            <div className="absolute inset-0 bg-paymint-green/90 mix-blend-multiply" />
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold font-sans text-white mb-6 tracking-tight">Let's Talk</h2>
              <p className="text-lg text-white/90 mb-8 leading-relaxed">
                Ready to transform your business? Fill out the form and our team will get back to you within 24 hours.
              </p>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-none bg-white/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Email us</p>
                  <p className="font-medium text-white">hello@paymint.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-none bg-white/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Call us</p>
                  <p className="font-medium text-white">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-12 md:w-1/2 bg-gray-50 dark:bg-paymint-surface text-gray-900 dark:text-white">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Full Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-none bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-paymint-green focus:ring-2 focus:ring-paymint-green/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Business Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-none bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-paymint-green focus:ring-2 focus:ring-paymint-green/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600" placeholder="Your Store LLC" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-none bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-paymint-green focus:ring-2 focus:ring-paymint-green/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-none bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-paymint-green focus:ring-2 focus:ring-paymint-green/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600" placeholder="Tell us about your needs..." />
              </div>
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  id="policy" 
                  checked={policyAccepted}
                  onChange={(e) => setPolicyAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-paymint-green cursor-pointer"
                />
                <label htmlFor="policy" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                  I agree to the <button type="button" onClick={() => setActiveModal('privacy')} className="text-paymint-green hover:underline">Privacy Policy</button> and <button type="button" onClick={() => setActiveModal('terms')} className="text-paymint-green hover:underline">Terms of Service</button>
                </label>
              </div>
              <button 
                disabled={!policyAccepted}
                className="w-full bg-paymint-green text-black py-4 rounded-none font-bold hover:bg-paymint-green/90 transition-all hover:shadow-lg hover:shadow-paymint-green/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Send Request <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-white dark:bg-paymint-surface border border-gray-200 dark:border-white/10 rounded-none max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-gray-600 dark:text-gray-300 space-y-4">
              {activeModal === 'privacy' ? (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: December 11, 2025</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">1. Information We Collect</h4>
                  <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, phone number, business name, and payment information.</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">2. How We Use Your Information</h4>
                  <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">3. Information Sharing</h4>
                  <p>We do not share your personal information with third parties except as described in this policy. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">4. Data Security</h4>
                  <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. All data is encrypted using industry-standard SSL technology.</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">5. Contact Us</h4>
                  <p>If you have any questions about this Privacy Policy, please contact us at privacy@paymint.com.</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: December 11, 2025</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">1. Acceptance of Terms</h4>
                  <p>By accessing and using PayMint's services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">2. Description of Service</h4>
                  <p>PayMint provides a point-of-sale (POS) system and related business management tools. Our services include sales processing, inventory management, employee management, and reporting features.</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">3. User Responsibilities</h4>
                  <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">4. Payment Terms</h4>
                  <p>You agree to pay all fees associated with your selected plan. Fees are non-refundable except as expressly set forth in this agreement. We reserve the right to change our pricing with 30 days notice.</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">5. Limitation of Liability</h4>
                  <p>PayMint shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">6. Contact</h4>
                  <p>For any questions regarding these Terms of Service, please contact us at legal@paymint.com.</p>
                </>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-white/10 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="bg-paymint-green text-black px-8 py-3 rounded-none font-bold hover:bg-paymint-green/90 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
