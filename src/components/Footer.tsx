import { Instagram } from 'lucide-react';
import WhiteLogo from '../assets/White Green Full Logo.png';
import GreenLogo from '../assets/Green Full Logo.png';

export const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-paymint-dark pt-20 pb-10 border-t border-gray-200 dark:border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-6">
              <img src={WhiteLogo} alt="PayMint Logo" className="h-14 w-auto object-contain hidden dark:block" />
              <img src={GreenLogo} alt="PayMint Logo" className="h-14 w-auto object-contain block dark:hidden" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The POS system built for today's businesses. Flexible, secure, and packed with premium features.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-none bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-mint hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Product</h4>
            <ul className="space-y-4 text-gray-600 dark:text-gray-400">
              <li><a href="#features" className="hover:text-mint transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-mint transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-4 text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-mint transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-mint transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Contact</h4>
            <ul className="space-y-4 text-gray-600 dark:text-gray-400">
              <li>Sales: sales@paymint.com</li>
              <li>Support: support@paymint.com</li>
              <li>1-800-PAYMINT</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2025 PayMint LLC. All rights reserved.</p>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-mint">Privacy Policy</a>
            <a href="#" className="hover:text-mint">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
