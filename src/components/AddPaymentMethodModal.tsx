import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, Info, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../config/api';
import toast from 'react-hot-toast';
import { useScrollLock } from '../hooks/useScrollLock';

interface ApiError {
    response?: {
        data?: {
            message?: string | string[];
        };
    };
}

interface AddPaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void | Promise<void>;
}

type DetectedBrand = 'card' | 'visa' | 'mastercard' | 'amex' | 'discover';

const API_BRAND: Record<DetectedBrand, string> = {
    card: 'CARD',
    visa: 'VISA',
    mastercard: 'MASTERCARD',
    amex: 'AMEX',
    discover: 'DISCOVER',
};

const getDigits = (value: string) => value.replace(/\D/g, '');

function detectBrand(digits: string): DetectedBrand {
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
    if (/^4/.test(digits)) return 'visa';
    if (/^(6011|65|64[4-9])/.test(digits)) return 'discover';
    return 'card';
}

function formatCardNumber(value: string) {
    const digits = getDigits(value).slice(0, 19);
    const brand = detectBrand(digits);
    const groupSizes = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4, 3];
    const parts: string[] = [];
    let cursor = 0;

    for (const size of groupSizes) {
        const part = digits.slice(cursor, cursor + size);
        if (!part) break;
        parts.push(part);
        cursor += size;
    }

    return parts.join(' ');
}

function luhnCheck(digits: string) {
    let sum = 0;
    let shouldDouble = false;

    for (let index = digits.length - 1; index >= 0; index -= 1) {
        let digit = Number(digits[index]);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum > 0 && sum % 10 === 0;
}

function isValidCardNumber(digits: string) {
    return digits.length >= 13 && digits.length <= 19 && luhnCheck(digits);
}

function formatExpiryDate(value: string) {
    const digits = getDigits(value).slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function parseExpiry(value: string) {
    const [monthValue, yearValue] = value.split('/');
    const month = Number(monthValue);
    const year = yearValue?.length === 2 ? 2000 + Number(yearValue) : NaN;

    if (!Number.isFinite(month) || !Number.isFinite(year)) return null;
    if (month < 1 || month > 12) return null;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return null;
    }

    return { month, year };
}

export function AddPaymentMethodModal({ isOpen, onClose, onSuccess }: AddPaymentMethodModalProps) {
    const { t } = useTranslation();
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');
    const [saveForFuturePurchases, setSaveForFuturePurchases] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    useScrollLock(isOpen);

    const cardDigits = useMemo(() => getDigits(cardNumber), [cardNumber]);
    const brand = useMemo(() => detectBrand(cardDigits), [cardDigits]);
    const cvvLength = brand === 'amex' ? 4 : 3;
    const locale = t('common.locale');

    const clearError = (key: string) => {
        if (!errors[key] && !errors.general) return;
        const next = { ...errors };
        delete next[key];
        delete next.general;
        setErrors(next);
    };

    const resetForm = () => {
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setName('');
        setSaveForFuturePurchases(false);
        setErrors({});
    };

    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const nextErrors: Record<string, string> = {};
        const parsedExpiry = parseExpiry(expiry);

        if (!isValidCardNumber(cardDigits)) {
            nextErrors.cardNumber = t('paymentMethods.modal.errors.invalidCardNumber', {
                defaultValue: 'Enter a valid card number',
            });
        }

        if (!parsedExpiry) {
            nextErrors.expiry = t('paymentMethods.modal.errors.invalidExpiry', {
                defaultValue: 'Invalid expiry date',
            });
        }

        if (getDigits(cvv).length !== cvvLength) {
            nextErrors.cvv = t('paymentMethods.modal.errors.invalidCvv', {
                defaultValue: 'Enter a valid CVV',
            });
        }

        if (!name.trim()) {
            nextErrors.name = t('common.required', { defaultValue: 'Required' });
        }

        if (Object.keys(nextErrors).length > 0 || !parsedExpiry) {
            setErrors(nextErrors);
            setTimeout(() => {
                scrollRef.current?.querySelector('[data-error="true"]')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 50);
            return;
        }

        try {
            setIsSubmitting(true);

            await api.post('/api/accounts/cards', {
                last4: cardDigits.slice(-4),
                brand: API_BRAND[brand],
                expMonth: parsedExpiry.month,
                expYear: parsedExpiry.year,
                cardholderName: name.trim(),
                saveForFuturePurchases,
                setAsDefault: saveForFuturePurchases,
            });

            toast.success(t('paymentMethods.messages.added', { defaultValue: 'Card added' }));
            resetForm();
            await onSuccess();
            onClose();
        } catch (err) {
            const rawMessage = (err as ApiError).response?.data?.message;
            const msg = Array.isArray(rawMessage)
                ? rawMessage.join('\n')
                : rawMessage || t('paymentMethods.messages.failedToAdd', { defaultValue: 'Failed to add card' });
            setErrors({ general: msg });
            setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <AnimatePresence mode="wait">
            {isOpen && (
                <div
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/45 p-0 font-barlow sm:items-center sm:p-4"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 28 }}
                        transition={{ type: 'spring', duration: 0.38, bounce: 0.16 }}
                        className="relative z-10 max-h-[92vh] w-full overflow-hidden rounded-t-[18px] border border-gray-200 bg-white shadow-2xl sm:max-w-[420px] sm:rounded-xl"
                    >
                        <div ref={scrollRef} className="max-h-[92vh] overflow-y-auto px-8 pb-6 pt-8">
                            <div className="mb-7 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold tracking-normal text-slate-700">
                                        {t('paymentMethods.modal.title', { defaultValue: 'Add payment card' })}
                                    </h2>
                                    <div className="mt-1 flex items-center gap-1.5 text-sm font-medium tracking-normal text-slate-600">
                                        <Lock size={13} />
                                        <span>
                                            {t('paymentMethods.modal.subtitle', {
                                                defaultValue: 'Secure - 256-bit encrypted',
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    aria-label={t('common.close', { defaultValue: 'Close' })}
                                    className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {errors.general && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold tracking-normal text-red-700">
                                        {errors.general}
                                    </div>
                                )}

                                <CardField
                                    label={t('paymentMethods.modal.cardNumber', { defaultValue: 'Card number' })}
                                    error={errors.cardNumber}
                                >
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => {
                                            setCardNumber(formatCardNumber(e.target.value));
                                            clearError('cardNumber');
                                        }}
                                        placeholder="0000 0000 0000 0000"
                                        inputMode="numeric"
                                        autoComplete="cc-number"
                                        maxLength={23}
                                        data-error={errors.cardNumber ? 'true' : undefined}
                                        className="h-10 min-w-0 flex-1 bg-transparent text-base font-medium tracking-normal text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                    />
                                    <CreditCard size={18} className="text-slate-500" />
                                </CardField>

                                <div className="grid grid-cols-2 gap-3">
                                    <CardField
                                        label={t('paymentMethods.modal.expiry', { defaultValue: 'Expiry date' })}
                                        error={errors.expiry}
                                    >
                                        <input
                                            type="text"
                                            value={expiry}
                                            onChange={(e) => {
                                                setExpiry(formatExpiryDate(e.target.value));
                                                clearError('expiry');
                                            }}
                                            placeholder="MM / YY"
                                            inputMode="numeric"
                                            autoComplete="cc-exp"
                                            maxLength={5}
                                            data-error={errors.expiry ? 'true' : undefined}
                                            className="h-10 min-w-0 flex-1 bg-transparent text-base font-medium tracking-normal text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                        />
                                    </CardField>

                                    <CardField
                                        label={
                                            <span className="flex items-center gap-1">
                                                CVV
                                                <Info size={12} className="text-slate-400" />
                                            </span>
                                        }
                                        error={errors.cvv}
                                    >
                                        <input
                                            type="password"
                                            value={cvv}
                                            onChange={(e) => {
                                                setCvv(getDigits(e.target.value).slice(0, cvvLength));
                                                clearError('cvv');
                                            }}
                                            placeholder="..."
                                            inputMode="numeric"
                                            autoComplete="cc-csc"
                                            maxLength={4}
                                            data-error={errors.cvv ? 'true' : undefined}
                                            className="h-10 min-w-0 flex-1 bg-transparent text-base font-medium tracking-normal text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                        />
                                    </CardField>
                                </div>

                                <CardField
                                    label={t('paymentMethods.modal.cardholder', { defaultValue: 'Cardholder name' })}
                                    error={errors.name}
                                >
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            clearError('name');
                                        }}
                                        placeholder={t('paymentMethods.modal.cardholderPlaceholder', {
                                            defaultValue: 'Name as it appears on card',
                                        })}
                                        autoComplete="cc-name"
                                        maxLength={80}
                                        data-error={errors.name ? 'true' : undefined}
                                        className="h-10 min-w-0 flex-1 bg-transparent text-base font-medium tracking-normal text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                    />
                                </CardField>

                                <button
                                    type="button"
                                    onClick={() => setSaveForFuturePurchases((value) => !value)}
                                    className="flex items-center gap-2 pt-1 text-left text-sm font-medium tracking-normal text-slate-600"
                                >
                                    <span
                                        className={`grid h-4 w-4 place-items-center rounded-sm border transition ${
                                            saveForFuturePurchases
                                                ? 'border-[#5DC99B] bg-[#5DC99B]'
                                                : 'border-slate-300 bg-white'
                                        }`}
                                    >
                                        {saveForFuturePurchases && <Check size={12} className="text-white" />}
                                    </span>
                                    <span>
                                        {t('paymentMethods.modal.saveForFuture', {
                                            defaultValue: 'Save card for future purchases',
                                        })}
                                    </span>
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#5DC99B] text-base font-semibold tracking-normal text-white shadow-lg shadow-[#5DC99B]/25 transition hover:bg-[#55bc90] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    ) : (
                                        <>
                                            <CreditCard size={15} />
                                            {t('paymentMethods.modal.addCard', { defaultValue: 'Add card' })}
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-5 pt-1 text-sm font-semibold tracking-normal text-gray-400">
                                    <BrandMark brand="mastercard" />
                                    <BrandMark brand="visa" />
                                    <BrandMark brand="amex" />
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

interface CardFieldProps {
    label: React.ReactNode;
    error?: string;
    children: React.ReactNode;
}

function CardField({ label, error, children }: CardFieldProps) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium tracking-normal text-slate-600">{label}</span>
            <span
                className={`flex h-10 items-center rounded-md border bg-white px-3 transition focus-within:border-[#5DC99B] focus-within:ring-2 focus-within:ring-[#5DC99B]/15 ${
                    error ? 'border-red-500' : 'border-gray-200'
                }`}
            >
                {children}
            </span>
            {error && <span className="mt-1 block text-xs font-semibold tracking-normal text-red-600">{error}</span>}
        </label>
    );
}

function BrandMark({ brand }: { brand: 'mastercard' | 'visa' | 'amex' }) {
    if (brand === 'mastercard') {
        return (
            <span className="inline-flex items-center gap-1">
                <span className="relative inline-block h-4 w-7">
                    <span className="absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-[#EB001B]" />
                    <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-[#F79E1B]/90" />
                </span>
                <span>Mastercard</span>
            </span>
        );
    }

    if (brand === 'visa') {
        return (
            <span className="inline-flex items-center gap-1">
                <span className="grid h-4 min-w-7 place-items-center rounded border border-gray-200 px-1 text-[8px] font-black tracking-normal text-[#1A4F9C]">
                    VISA
                </span>
                <span>Visa</span>
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1">
            <span className="grid h-4 min-w-7 place-items-center rounded bg-[#2E77BC] px-1 text-[8px] font-black tracking-normal text-white">
                AMEX
            </span>
            <span>Amex</span>
        </span>
    );
}
