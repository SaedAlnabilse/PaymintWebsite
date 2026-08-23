import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Landmark, Lightbulb } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';

export interface ChangeCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromCurrency: string;
  toCurrency: string;
  isSubmitting?: boolean;
}

export function ChangeCurrencyModal({
  isOpen,
  onClose,
  onConfirm,
  fromCurrency,
  toCurrency,
  isSubmitting = false,
}: ChangeCurrencyModalProps) {
  const { t } = useTranslation();

  useScrollLock(isOpen);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-[9999] popup-surface flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans selection:bg-mintcom-green selection:text-black"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full sm:max-w-md overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 shadow-2xl transition-colors duration-300 z-10"
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3">
              <div className="w-10 h-1 bg-gray-300 dark:bg-white/20 rounded-full" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label={t('common.closeModal', { defaultValue: 'Close modal' })}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all z-10 active:scale-90"
            >
              <X size={18} />
            </button>

            <div className="relative p-6 sm:p-7 pb-safe">
              <div className="flex flex-col items-center text-center">
                {/* Minimal Green Icon */}
                <div className="w-12 h-12 rounded-2xl bg-mintcom-green/10 border border-mintcom-green/20 text-mintcom-green flex items-center justify-center mb-4 shrink-0 shadow-sm">
                  <Landmark className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {t('settings.confirm.changeCurrencyTitle', { defaultValue: 'Change System Currency' })}
                </h3>

                {/* Content */}
                <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                  <p>
                    {t('settings.confirm.changeCurrencyLead', {
                      from: fromCurrency,
                      to: toCurrency,
                      defaultValue: `You are about to change the account currency from "${fromCurrency}" to "${toCurrency}".`,
                    })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('settings.confirm.changeCurrencyScope', {
                      defaultValue:
                        'This change will apply to all locations associated with this account and may affect both past and future transactions.',
                    })}
                  </p>
                </div>

                {/* Minimal Tip Callout */}
                <div className="w-full mt-4 p-3.5 rounded-xl bg-mintcom-green/5 border border-mintcom-green/20 text-left flex items-start gap-2.5">
                  <Lightbulb size={16} className="text-mintcom-green shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {t('common.tip', { defaultValue: 'Tip' })}:{' '}
                    </span>
                    {t('settings.confirm.changeCurrencyTip', {
                      defaultValue:
                        'If you operate a location that uses a different currency, we recommend creating a separate account for that location.',
                    }).replace(/^(Tip|نصيحة|提示)[:：]\s*/i, '')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 sm:px-6 py-3 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent transition-all duration-200 active:scale-95 touch-target disabled:opacity-50"
                >
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirm();
                  }}
                  disabled={isSubmitting}
                  className="px-4 sm:px-6 py-3 rounded-xl text-sm font-bold bg-mintcom-green hover:bg-[#6ec29a] text-black transition-all duration-200 active:scale-95 shadow-sm hover:shadow touch-target disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    t('common.continue', { defaultValue: 'Continue' })
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
