import { Send } from 'lucide-react';

export const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-neutral-bg">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div className="p-12 md:w-1/2 bg-dark text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-6">Let's Talk</h2>
              <p className="text-gray-400 mb-8">
                Ready to transform your business? Fill out the form and our team will get back to you within 24 hours.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-xl">📧</span>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email us</p>
                  <p className="font-medium">hello@paymint.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-xl">📱</span>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Call us</p>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-12 md:w-1/2">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mint focus:ring-2 focus:ring-mint/20 outline-none transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mint focus:ring-2 focus:ring-mint/20 outline-none transition-all" placeholder="Your Store LLC" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mint focus:ring-2 focus:ring-mint/20 outline-none transition-all" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mint focus:ring-2 focus:ring-mint/20 outline-none transition-all" placeholder="Tell us about your needs..." />
              </div>
              <button className="w-full bg-mint text-white py-4 rounded-xl font-bold hover:bg-mint-dark transition-all hover:shadow-lg hover:shadow-mint/25 flex items-center justify-center gap-2">
                Send Request <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
