import { Download, Smartphone, CheckCircle, Apple } from 'lucide-react';

export const DownloadApp = () => {
  return (
    <section id="download" className="py-24 bg-gray-50 dark:bg-paymint-dark/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display text-gray-900 dark:text-white">
            Take Paymint With You
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Manage your restaurant from anywhere. Download the universal Paymint app for your tablet or phone.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Android Card */}
            <div className="bg-white dark:bg-paymint-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl flex flex-col justify-between">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-paymint-green/10 rounded-full">
                    <Smartphone className="w-8 h-8 text-paymint-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Android</h3>
                </div>
                <ul className="space-y-3 mb-8">
                   <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-paymint-green" />
                    <span>Works on Tablets & Phones</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-paymint-green" />
                    <span>Offline Mode Support</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-paymint-green" />
                    <span>Instant APK Install</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-paymint-green" />
                    <span>Latest Version (v1.6)</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-4">
                <a 
                  href="/paymint-universal.apk" 
                  download
                  className="flex items-center justify-center gap-3 bg-paymint-green hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-paymint-green/25"
                >
                  <Download className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs font-normal opacity-90">Download APK</div>
                    <div className="text-lg leading-none">Android 8.0+</div>
                  </div>
                </a>
              </div>
            </div>

            {/* iOS Card */}
            <div className="bg-white dark:bg-paymint-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden opacity-90">
               <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                UNDER REVIEW
              </div>
              <div className="text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Apple className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">iOS & iPadOS</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  The Paymint experience for iPhone and iPad is currently being finalized for the Apple App Store.
                </p>
                <ul className="space-y-3 mb-8">
                   <li className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>Native iPad POS Interface</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>Optimized for iOS 17+</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-3 bg-gray-200 dark:bg-gray-800 text-gray-500 font-bold py-4 px-8 rounded-xl cursor-not-allowed">
                  <Apple className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs font-normal opacity-90">Coming Soon to</div>
                    <div className="text-lg leading-none">App Store</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg inline-block">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              * Note: To install the iOS version manually, you may need to add the certificate to your device profiles or use TestFlight.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
