import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { TourGuide, type TourStep } from '../components/TourGuide';
import { useTranslation } from 'react-i18next';
import {
  Store,
  MapPin,
  DollarSign,
  User,
  Lock,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CreditCard,
  Building2,
  UtensilsCrossed,
  Coffee,
  ShoppingBag,
  KeyRound,
  Hash,
  ShieldCheck,
  Plus,
  ChevronDown,
  Copy,
  Box,
  Tags,
  Eye,
  EyeOff,
  Smartphone,
  Tablet,
  BookOpen,
  Settings,
  PlayCircle,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Shield,
  Scale,
  Info,
  Globe,
  RefreshCw,
  CalendarClock
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { QuickInfo } from '../components/QuickInfo';
import { formatCurrencyCode } from '../utils/currency';
import {
  ANDROID_DOWNLOAD_URL,
  IOS_DOWNLOAD_URL,
  OWNER_ANDROID_DOWNLOAD_URL,
  OWNER_IOS_DOWNLOAD_URL,
  ONBOARDING_VIDEO_URL,
  isDirectInstallerDownload,
} from '../config/downloads';
import {
  BILLING_CYCLES,
  type BillingCycle,
  getMintcomPrice,
  getMintcomYearlySavings,
  MINTCOM_PRICING,
} from '../config/pricing';

// Mintcom Logo imports
import MintcomLogoGreen from '../assets/green-full-logo.svg';
import MintcomLogoWhite from '../assets/white-green-full-logo.svg';
import AppStoreBadge from '../assets/app-store-badge.svg';
import GooglePlayBadge from '../assets/google-play-badge.svg';
import { formatInputPlaceholder, formatInputLabel } from '../utils/textCase';
import {
  getBestTimeZoneForCountry,
  getCountryOptions,
  getCountryPrimaryCurrency,
  getCurrencyOptions,
  getDeviceTimeZone,
} from '../data/globalLocaleOptions';
import { getLocalizedManual } from '../utils/localizedDocs';
import {
  detectCardBrand,
  formatCardNumberInput,
  formatExpiryInput,
  getCardCvvLength,
  getCardDigits,
  isValidCardNumber,
  parseExpiryDate,
  PAYMENT_CARD_API_BRAND,
  MAX_FORMATTED_CARD_NUMBER_LENGTH,
} from '../utils/paymentCard';

const ONBOARDING_LAUNCH_STORAGE_KEY = 'mintcom.onboarding.launch.v1';

const readStoredLaunchData = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const rawValue = sessionStorage.getItem(ONBOARDING_LAUNCH_STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
  } catch {
    return {};
  }
};

const persistStoredLaunchData = (value: Record<string, unknown>) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(ONBOARDING_LAUNCH_STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.warn('[Onboarding] Failed to persist launch data:', error);
  }
};

const clearStoredLaunchData = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(ONBOARDING_LAUNCH_STORAGE_KEY);
  } catch (error) {
    console.warn('[Onboarding] Failed to clear launch data:', error);
  }
};

const CARD_INPUT_CLASS =
  'min-w-0 w-full flex-1 bg-transparent font-sans text-sm font-bold leading-none text-gray-900 dark:text-white placeholder:font-sans placeholder:font-medium placeholder:text-gray-400 focus:outline-none';

function EmbeddedCardField({
  label,
  error,
  children,
}: {
  label: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block w-full min-w-0">
      <span className="mb-1.5 flex min-h-[1.125rem] items-center gap-1 text-xs font-sans font-bold text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span
        className={`flex min-h-12 w-full items-center gap-2 rounded-2xl border bg-white px-4 py-3 transition focus-within:border-mintcom-green focus-within:ring-2 focus-within:ring-mintcom-green/20 dark:bg-black/20 ${
          error
            ? 'border-mintcom-red ring-2 ring-mintcom-red/20'
            : 'border-gray-200 dark:border-white/10'
        }`}
      >
        {children}
      </span>
      <span className="mt-1 block min-h-[1rem] text-xs font-sans font-semibold text-mintcom-red">
        {error || '\u00A0'}
      </span>
    </label>
  );
}

function CardBrandMark({ brand }: { brand: 'mastercard' | 'visa' | 'amex' }) {
  // Equal-height badges so Visa / Mastercard / Amex align consistently across OS fonts.
  const shell =
    'inline-flex h-8 min-w-[4.5rem] items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 font-sans text-[11px] font-bold leading-none tracking-wide text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300';

  if (brand === 'mastercard') {
    return (
      <span className={shell} aria-label="Mastercard">
        <span className="relative inline-block h-3.5 w-6 shrink-0" aria-hidden>
          <span className="absolute left-0 top-0 h-3.5 w-3.5 rounded-full bg-[#EB001B]" />
          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-[#F79E1B]/90" />
        </span>
        <span className="font-sans text-[11px] font-bold leading-none">Mastercard</span>
      </span>
    );
  }

  if (brand === 'visa') {
    return (
      <span className={shell} aria-label="Visa">
        <span className="font-sans text-[11px] font-black leading-none tracking-[0.12em] text-[#1A4F9C] dark:text-[#6B9FE8]">
          VISA
        </span>
      </span>
    );
  }

  return (
    <span className={shell} aria-label="American Express">
      <span className="rounded bg-[#2E77BC] px-1.5 py-0.5 font-sans text-[9px] font-black leading-none tracking-wide text-white">
        AMEX
      </span>
    </span>
  );
}


export function OnboardingPage() {
  const { t, i18n } = useTranslation();
  const isRTL = t('common.locale') === 'ar';
  const locale = t('common.locale');
  const userManualDoc = getLocalizedManual('user', i18n.language);
  const setupManualDoc = getLocalizedManual('setup', i18n.language);
  const countryOptions = useMemo(() => getCountryOptions(locale), [locale]);
  const allCurrencyOptions = useMemo(() => getCurrencyOptions(locale), [locale]);
  const hasAndroidDownload = Boolean(ANDROID_DOWNLOAD_URL);
  const hasIosDownload = Boolean(IOS_DOWNLOAD_URL);
  const hasOwnerAndroidDownload = Boolean(OWNER_ANDROID_DOWNLOAD_URL);
  const hasOwnerIosDownload = Boolean(OWNER_IOS_DOWNLOAD_URL);
  const hasVideoGuide = Boolean(ONBOARDING_VIDEO_URL);
  const formatWholeUsd = (amount: number) => formatCurrencyCode(amount, 'USD', t('common.locale'), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const navigate = useNavigate();
  const { step: stepParam } = useParams<{ step?: string }>();

  // Step 1: Location Details
  const step1Schema = z.object({
    name: z.string().min(1, t('onboarding.step1.errors.nameRequired')),
    type: z.string().min(1, t('onboarding.step1.errors.typeRequired')),
    country: z.string().min(1, t('onboarding.step1.errors.countryRequired', { defaultValue: 'Country is required' })),
    address: z.string().min(1, t('onboarding.step1.errors.addressRequired')),
    currency: z.string().min(1, t('onboarding.step1.errors.currencyRequired')),
  });

  // Step 2: Location Login
  const step2Schema = z.object({
    establishmentLoginId: z.string()
      .min(4, t('onboarding.step3.errors.idMin'))
      .regex(/^[a-zA-Z0-9_-]+$/, t('onboarding.step3.errors.idRegex')),
    establishmentPassword: z.string()
      .min(8, t('auth.validation.passwordMin'))
      .regex(/[A-Z]/, t('auth.validation.passwordUppercase'))
      .regex(/[a-z]/, t('auth.validation.passwordLowercase'))
      .regex(/[0-9]/, t('auth.validation.passwordNumber'))
      .regex(/[^A-Za-z0-9]/, t('auth.validation.passwordSymbol')),
  });

  // Step 3: Admin Access
  const step3Schema = z.object({
    username: z.string()
      .trim()
      .min(1, t('onboarding.step4.errors.usernameMin')),
    password: z.string()
      .min(8, t('auth.validation.passwordMin'))
      .regex(/[A-Z]/, t('auth.validation.passwordUppercase'))
      .regex(/[a-z]/, t('auth.validation.passwordLowercase'))
      .regex(/[0-9]/, t('auth.validation.passwordNumber'))
      .regex(/[^A-Za-z0-9]/, t('auth.validation.passwordSymbol')),
    firstName: z.string().min(2, t('onboarding.step4.errors.firstNameMin')),
    lastName: z.string().min(2, t('onboarding.step4.errors.lastNameMin')),
  });

  // Step 4: Payment Method
  const step4Schema = z.object({
    cardNumber: z.string(),
    expiryDate: z.string(),
    cvv: z.string(),
    cardName: z.string(),
  }).superRefine((value, ctx) => {
    const cardDigits = getCardDigits(value.cardNumber);
    const parsedExpiry = parseExpiryDate(value.expiryDate);
    const brand = detectCardBrand(cardDigits);
    const cvvLength = getCardCvvLength(brand);

    if (!isValidCardNumber(cardDigits)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cardNumber'],
        message: t('paymentMethods.modal.errors.invalidCardNumber', {
          defaultValue: 'Enter a valid card number',
        }),
      });
    }

    if (!parsedExpiry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiryDate'],
        message: t('paymentMethods.modal.errors.invalidExpiry', {
          defaultValue: 'Invalid expiry date',
        }),
      });
    }

    if (getCardDigits(value.cvv).length !== cvvLength) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cvv'],
        message: t('paymentMethods.modal.errors.invalidCvv', {
          defaultValue: 'Enter a valid CVV',
        }),
      });
    }

    if (!value.cardName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cardName'],
        message: t('onboarding.step2.errors.cardNameRequired', {
          defaultValue: 'Name on card is required',
        }),
      });
    }
  });

  const { refreshEstablishments, account, needsOnboarding, setCurrentEstablishment, establishments, updateAccount } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<any>(() => readStoredLaunchData());

  const [useSavedCard, setUseSavedCard] = useState(true); // Default to using saved card if available
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(MINTCOM_PRICING.defaultBillingCycle);

  const isAdditionalLocation = establishments.length > 0;
  const currentMonthlyPrice = getMintcomPrice(BILLING_CYCLES.MONTHLY, isAdditionalLocation);
  const currentYearlyPrice = getMintcomPrice(BILLING_CYCLES.YEARLY, isAdditionalLocation);
  const displayPrice = getMintcomPrice(billingCycle, isAdditionalLocation);
  const yearlySavings = getMintcomYearlySavings(isAdditionalLocation);
  const selectedPeriodLabel = billingCycle === BILLING_CYCLES.YEARLY
    ? t('landing.pricing.perYear')
    : t('landing.pricing.perMonth');
  const selectedPlanLabel = billingCycle === BILLING_CYCLES.YEARLY
    ? t('onboarding.step2.yearly')
    : t('onboarding.step2.monthly');
  const selectedPriceWithPeriod = `${formatWholeUsd(displayPrice)} ${selectedPeriodLabel}`;
  // Stacked-pricing helpers: show the standard price struck-through above the discounted price
  const primaryDisplayPrice = getMintcomPrice(billingCycle, false);
  const hasLocationDiscount = isAdditionalLocation && primaryDisplayPrice > displayPrice;
  const formatWholeNumber = (amount: number) =>
    amount.toLocaleString(t('common.locale'), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const selectedUnitLabel = `${MINTCOM_PRICING.currency} ${selectedPeriodLabel}`;

  // The backend gives the first establishment a 30-day free trial (TRIAL_DAYS = 30),
  // billing from now + 30 days. Compute the same date here so the disclosure shows
  // the exact day the card will first be charged.
  const TRIAL_DAYS = 30;
  const trialEndDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + TRIAL_DAYS);
    return d;
  }, []);
  const trialEndDateLabel = trialEndDate.toLocaleDateString(t('common.locale'), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Password Visibility State
  const [showEstablishmentPassword, setShowEstablishmentPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Duplication State
  const [duplicateFromId, setDuplicateFromId] = useState<string>('');
  const [duplicateInventory, setDuplicateInventory] = useState(true);
  const [duplicateDiscounts, setDuplicateDiscounts] = useState(true);
  const [duplicatePaymentMethods, setDuplicatePaymentMethods] = useState(true);
  const [ownerLogin, setOwnerLogin] = useState<{
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string | null;
  } | null>(null);
  const [isOwnerLoginLoading, setIsOwnerLoginLoading] = useState(false);

  const handleDuplicateSourceChange = (sourceId: string) => {
    setDuplicateFromId(sourceId);

    if (sourceId) {
      setDuplicateInventory(true);
      setDuplicateDiscounts(true);
      setDuplicatePaymentMethods(true);
    }
  };

  // Tour Guide State for Step 5
  const [isTourOpen, setIsTourOpen] = useState(false);

  const goToStep = (nextStep: number) => {
    const clampedStep = Math.min(5, Math.max(1, nextStep));
    setStep(clampedStep);
    navigate(`/onboarding/step/${clampedStep}`);
  };

  const updateFormData = (updater: any) => {
    setFormData((previousValue: any) => {
      const nextValue = typeof updater === 'function' ? updater(previousValue) : updater;
      if (nextValue?.establishmentId) {
        persistStoredLaunchData(nextValue);
      }
      return nextValue;
    });
  };

  useEffect(() => {
    const parsedStep = Number(stepParam);
    const normalizedStep = Number.isInteger(parsedStep) && parsedStep >= 1 && parsedStep <= 5 ? parsedStep : 1;
    setStep(normalizedStep);

    if (normalizedStep === 1 && formData.establishmentId) {
      clearStoredLaunchData();
      setFormData({});
      return;
    }

    // Redirect to step 1 if data is missing on later steps (2, 3, 4)
    if (normalizedStep > 1 && normalizedStep < 5 && !formData.name) {
      navigate('/onboarding/step/1', { replace: true });
      return;
    }

    if (normalizedStep === 5 && !formData.establishmentLoginId) {
      navigate('/onboarding/step/1', { replace: true });
      return;
    }

    if (stepParam !== String(normalizedStep)) {
      navigate(`/onboarding/step/${normalizedStep}`, { replace: true });
    }
  }, [navigate, stepParam, formData.establishmentId, formData.establishmentLoginId, formData.name]);

  const launchCenterTourSteps: TourStep[] = [
    {
      targetId: 'tour-open-portal',
      title: t('onboarding.tour.openPortalTitle'),
      description: t('onboarding.tour.openPortalDesc')
    },
    {
      targetId: 'tour-pos-app',
      title: t('onboarding.tour.posAppTitle'),
      description: t('onboarding.tour.posAppDesc')
    },
    {
      targetId: 'tour-owner-app',
      title: t('onboarding.tour.ownerAppTitle'),
      description: t('onboarding.tour.ownerAppDesc')
    },
    {
      targetId: 'tour-chat-bot',
      title: t('onboarding.tour.chatBotTitle'),
      description: t('onboarding.tour.chatBotDesc'),
      position: 'top'
    },
    {
      targetId: 'tour-location-stats',
      title: t('onboarding.tour.locationStatsTitle'),
      description: t('onboarding.tour.locationStatsDesc')
    },
    {
      targetId: 'tour-resources',
      title: t('onboarding.tour.resourcesTitle'),
      description: t('onboarding.tour.resourcesDesc'),
      position: isRTL ? 'right' : 'left'
    }
  ];

  // Auto-start tour when reaching Step 5
  useEffect(() => {
    if (step === 5) {
      // Small delay to let the UI render before starting tour
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Determine if this is a Trial (first est) or Paid (additional est) flow
  const isTrialFlow = needsOnboarding;

  // Only show "Use Saved Card" when the account actually has a saved card.
  // Existing locations do not guarantee a reusable card exists.
  const hasSavedCard = !!account?.defaultCardId || !!account?.defaultPaymentMethod;
  const savedCardLast4 = account?.defaultPaymentMethod || '****';

  // Forms
  const form1 = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { currency: 'JOD', type: 'restaurant', country: 'JO' }
  });

  const form2 = useForm({
    resolver: zodResolver(step2Schema)
  });

  const form3 = useForm({
    resolver: zodResolver(step3Schema)
  });

  const form4 = useForm({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: '',
    },
  });

  useEffect(() => {
    if (isAdditionalLocation) return;

    const currentValues = form3.getValues();
    if (!currentValues.firstName && account?.firstName) {
      form3.setValue('firstName', account.firstName);
    }
    if (!currentValues.lastName && account?.lastName) {
      form3.setValue('lastName', account.lastName);
    }
    // Owner username is left empty on purpose so the owner can choose their own.
  }, [account?.email, account?.firstName, account?.lastName, form3, isAdditionalLocation]);

  useEffect(() => {
    let isMounted = true;

    const loadOwnerLogin = async () => {
      if (!isAdditionalLocation) {
        setOwnerLogin(null);
        return;
      }

      setIsOwnerLoginLoading(true);
      try {
        const response = await api.get('/api/accounts/all-employees', {
          headers: { 'X-Skip-Establishment-Header': 'true' },
        });
        const employees = Array.isArray(response.data) ? response.data : [];
        const owner = employees.find((employee: any) =>
          employee?.isAccountOwner || employee?.isOwnerAccount || employee?.isProtected
        );

        if (isMounted) {
          setOwnerLogin(owner || null);
        }
      } catch (error) {
        console.warn('[Onboarding] Failed to load owner login:', error);
        if (isMounted) {
          setOwnerLogin(null);
        }
      } finally {
        if (isMounted) {
          setIsOwnerLoginLoading(false);
        }
      }
    };

    loadOwnerLogin();

    return () => {
      isMounted = false;
    };
  }, [establishments.length, isAdditionalLocation]);

  // Set default currency for additional locations
  useEffect(() => {
    if (establishments.length > 0) {
      form1.setValue('currency', establishments[0].currency);
    }
  }, [establishments, form1]);

  const selectedCountry = form1.watch('country');
  const isCurrencyLocked = establishments.length > 0;

  // When the country changes on first registration, auto-select that country's
  // primary currency. The currency field stays fully editable so the user can
  // pick any other currency afterwards.
  useEffect(() => {
    if (isCurrencyLocked || !selectedCountry) return;
    const primaryCurrency = getCountryPrimaryCurrency(selectedCountry);
    if (primaryCurrency) {
      form1.setValue('currency', primaryCurrency, { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedCountry, isCurrencyLocked, form1]);

  // Always offer the full currency list so owners can override the country default.
  const currencyOptions = allCurrencyOptions;

  const cardNumberValue = form4.watch('cardNumber') || '';
  const cardDigits = getCardDigits(cardNumberValue);
  const cardBrand = detectCardBrand(cardDigits);
  const cvvLength = getCardCvvLength(cardBrand);

  useEffect(() => {
    if (hasSavedCard && useSavedCard) {
      form4.clearErrors();
    }
  }, [form4, hasSavedCard, useSavedCard]);

  const onStep1Submit = (data: any) => {
    // If currency is disabled, it might be missing from data
    const finalData = {
      ...data,
      currency: establishments.length > 0 ? establishments[0].currency : data.currency
    };

    // Save duplication preferences
    updateFormData((prev: any) => ({
      ...prev,
      ...finalData,
      duplicateFromId,
      duplicateInventory: duplicateFromId ? duplicateInventory : false,
      duplicateDiscounts: duplicateFromId ? duplicateDiscounts : false,
      duplicatePaymentMethods: duplicateFromId ? duplicatePaymentMethods : false,
    }));

    goToStep(2);
  };

  const onStep2Submit = async (data: any) => {
    setIsLoading(true);
    const rawLoginId = (data.establishmentLoginId || '').trim();

    try {
        const response = await api.get('/api/brands/availability/establishment-login-id', {
            params: { establishmentLoginId: rawLoginId },
        });

        if (!response.data?.available) {
            form2.setError('establishmentLoginId', { 
                type: 'server', 
                message: response.data?.message || t('owner.brands.validation.loginIdTakenHint', { defaultValue: 'It must be unique across all locations and brands.' }) 
            });
            setIsLoading(false);
            return;
        }
    } catch (err: any) {
        form2.setError('establishmentLoginId', {
            type: 'server',
            message: err.response?.data?.message || t('owner.brands.validation.loginIdCheckFailed', { defaultValue: 'Could not verify this Login ID right now. Please try again.' })
        });
        setIsLoading(false);
        return;
    }

    setIsLoading(false);
    updateFormData((prev: any) => ({ ...prev, ...data }));
    goToStep(3);
  };

  const onStep3Submit = (data: any) => {
    updateFormData((prev: any) => ({ ...prev, ...data }));
    goToStep(4);
  };

  const findOwnedEstablishmentByLoginId = async (loginId: string) => {
    const normalizedLoginId = String(loginId || '').trim().toLowerCase();
    if (!normalizedLoginId) return null;

    const latestEstablishments = await refreshEstablishments();
    return latestEstablishments.find(
      (est) => est.establishmentLoginId?.toLowerCase() === normalizedLoginId
    ) || null;
  };

  const saveOwnerLoginCredentials = async () => {
    if (isAdditionalLocation) return;

    await api.put('/api/accounts/owner-employee', {
      username: formData.username,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
    });
  };

  const finishOnboardingWithEstablishment = async (establishment: any) => {
    const estId = establishment?.id;
    if (!estId) {
      throw new Error('Failed to get establishment Id');
    }

    const nextEstablishment = {
      ...establishment,
      id: estId,
      name: establishment.name || formData.name,
      type: establishment.type || formData.type,
      address: establishment.address || formData.address,
      currency: establishment.currency || formData.currency,
      establishmentLoginId: establishment.establishmentLoginId || formData.establishmentLoginId,
    } as any;

    setCurrentEstablishment(nextEstablishment);
    localStorage.setItem('selectedEstablishmentId', estId);

    try {
      const welcomeTargets = new Set<string>([
        estId,
        nextEstablishment.establishmentLoginId,
        formData.establishmentLoginId,
      ].filter(Boolean) as string[]);

      welcomeTargets.forEach((target) => {
        localStorage.removeItem(`mintcom.dashboard.setup.dismissed.${target}`);
        localStorage.removeItem(`mintcom.dashboard.setup.dismissed.v3.${account?.id || 'anonymous'}.${target}`);
        localStorage.removeItem(`mintcom.dashboard.setup.dismissed.v3.anonymous.${target}`);
        localStorage.removeItem(`mintcom.dashboard.setup.dismissed.v6.${account?.id || 'anonymous'}.${target}`);
        localStorage.removeItem(`mintcom.dashboard.setup.dismissed.v6.anonymous.${target}`);
        sessionStorage.removeItem(`mintcom.dashboard.setup.session.dismissed.v4.${account?.id || 'anonymous'}.${target}`);
        sessionStorage.removeItem(`mintcom.dashboard.setup.session.dismissed.v4.anonymous.${target}`);
        sessionStorage.removeItem(`mintcom.dashboard.setup.session.dismissed.v5.${account?.id || 'anonymous'}.${target}`);
        sessionStorage.removeItem(`mintcom.dashboard.setup.session.dismissed.v5.anonymous.${target}`);
        sessionStorage.removeItem(`mintcom.dashboard.setup.session.dismissed.v6.${account?.id || 'anonymous'}.${target}`);
        sessionStorage.removeItem(`mintcom.dashboard.setup.session.dismissed.v6.anonymous.${target}`);
        localStorage.removeItem(`mintcom.dashboard.visited.${target}`);
        localStorage.setItem(`mintcom.dashboard.welcome.pending.${target}`, 'true');
      });
    } catch (storageError) {
      console.warn('[Onboarding] Failed to persist welcome popup trigger:', storageError);
    }

    updateFormData((prev: any) => ({ ...prev, establishmentId: estId }));
    goToStep(5);
    toast.success(t('onboarding.messages.complete'));
    await refreshEstablishments();
  };


  const onStep4Submit = async (data: any) => {
    setIsLoading(true);

    // Final check for ID availability to avoid failures after card entry
    try {
      const response = await api.get('/api/brands/availability/establishment-login-id', {
          params: { establishmentLoginId: formData.establishmentLoginId },
      });

      if (!response.data?.available) {
          const existingOwnedEstablishment = await findOwnedEstablishmentByLoginId(formData.establishmentLoginId);
          if (existingOwnedEstablishment) {
            await saveOwnerLoginCredentials();
            await finishOnboardingWithEstablishment(existingOwnedEstablishment);
            return;
          }

          toast.error(response.data?.message || t('owner.brands.validation.loginIdTakenHint', { defaultValue: 'This Establishment ID is already in use. Please choose a different one.' }));
          setIsLoading(false);
          goToStep(2);
          return;
      }
    } catch {
      // Continue if check fails
    }

    // Handle payment method
    let paymentMethodToken = '';
    let savedCardId = '';

    if (hasSavedCard && useSavedCard) {
      paymentMethodToken = 'use_saved_card';
      savedCardId = account?.defaultCardId || '';
    } else {
      // A card is required to start, even for the free trial (first establishment),
      // matching the admin portal where billing card capture is always required.
      // Save only safe card metadata. A gateway token/id will replace this flow later.
      const parsedExpiry = parseExpiryDate(data.expiryDate || '');
      const cardDigits = getCardDigits(data.cardNumber || '');

      if (!parsedExpiry || !isValidCardNumber(cardDigits)) {
        toast.error(t('paymentMethods.messages.failedToAdd', { defaultValue: 'Failed to add card' }));
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.post('/api/accounts/cards', {
          last4: cardDigits.slice(-4),
          brand: PAYMENT_CARD_API_BRAND[detectCardBrand(cardDigits)],
          expMonth: parsedExpiry.month,
          expYear: parsedExpiry.year,
          cardholderName: data.cardName.trim(),
          saveForFuturePurchases: true,
          setAsDefault: true,
        });

        savedCardId = response.data.card?.id;
        paymentMethodToken = 'use_saved_card';
        const newDefaultPaymentMethod = response.data.card?.last4 || cardDigits.slice(-4);

        if (savedCardId) {
          updateAccount({
            defaultCardId: savedCardId,
            defaultPaymentMethod: newDefaultPaymentMethod,
          });
        }
      } catch (err: any) {
        console.error('Failed to save payment method:', err);
        toast.error('Failed to save card. Please try again.');
        setIsLoading(false);
        return; // Stop execution if card save fails
      }
    }

    try {
      // 1. Create Establishment with user-provided Establishment Login ID
      const establishmentPayload = {
        name: formData.name,
        type: formData.type,
        address: formData.address,
        currency: formData.currency,
        country: formData.country,
        timezone: getBestTimeZoneForCountry(formData.country, getDeviceTimeZone()),
        establishmentLoginId: formData.establishmentLoginId, // User-provided unique ID for this establishment
        establishmentPassword: formData.establishmentPassword, // User-provided password
        paymentMethodToken: paymentMethodToken,
        savedCardId: savedCardId,
        billingCycle: billingCycle || MINTCOM_PRICING.defaultBillingCycle,
        monthlyPrice: currentMonthlyPrice,
        yearlyPrice: currentYearlyPrice,
        // Duplication params
        duplicateFromId: formData.duplicateFromId,
        duplicateInventory: formData.duplicateInventory,
        duplicateDiscounts: formData.duplicateDiscounts,
        duplicatePaymentMethods: formData.duplicatePaymentMethods,
      };

      let createdEstablishment: any;
      try {
        const estRes = await api.post('/api/establishments', establishmentPayload, {
          headers: {
            'X-Skip-Establishment-Header': 'true'
          }
        });
        createdEstablishment = estRes.data.establishment || estRes.data;
      } catch (err: any) {
        const status = err.response?.status;
        const message = String(err.response?.data?.message || '');
        if (status === 409 || message.toLowerCase().includes('establishment id')) {
          createdEstablishment = await findOwnedEstablishmentByLoginId(formData.establishmentLoginId);
        }

        if (!createdEstablishment) {
          throw err;
        }
      }

      await saveOwnerLoginCredentials();
      await finishOnboardingWithEstablishment(createdEstablishment);
    } catch (err: any) {
      const errorData = err.response?.data?.message;
      const errorMessage = Array.isArray(errorData)
        ? errorData.join('\n')
        : errorData || t('onboarding.errors.failedToComplete');

      toast.error(errorMessage, {
        duration: errorMessage.length > 50 ? 6000 : 4000,
        style: {
          maxWidth: '400px',
          whiteSpace: 'pre-line'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };


  const businessTypes = [
    { id: 'restaurant', label: t('onboarding.step1.businessTypes.restaurant'), icon: UtensilsCrossed },
    { id: 'cafe', label: t('onboarding.step1.businessTypes.cafe'), icon: Coffee },
    { id: 'retail', label: t('onboarding.step1.businessTypes.retail'), icon: ShoppingBag },
    { id: 'other', label: t('onboarding.step1.businessTypes.other'), icon: Building2 },
  ];

  const getEstablishmentTypeLabel = (type?: string) => {
    const normalizedType = String(type || 'restaurant').toLowerCase();
    const typeKey = normalizedType === 'retail_store' ? 'retail' : normalizedType;
    const fallback = typeKey
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());

    return t(`onboarding.step1.businessTypes.${typeKey}`, { defaultValue: fallback });
  };

  const ownerLoginDisplay = {
    firstName: ownerLogin?.firstName || account?.firstName || '',
    lastName: ownerLogin?.lastName || account?.lastName || '',
    username: ownerLogin?.username || account?.email || '',
    email: ownerLogin?.email || account?.email || '',
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col transition-colors duration-300" dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navbar - Shown on All Steps */}
      <div className="sticky top-0 z-50 p-6 flex justify-between items-center border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#050505] shadow-sm">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img
            src={MintcomLogoGreen}
            alt="Mintcom"
            className="h-8 w-auto object-contain dark:hidden"
          />
          <img
            src={MintcomLogoWhite}
            alt="Mintcom"
            className="h-8 w-auto object-contain hidden dark:block"
          />
        </Link>

        {step <= totalSteps && (
          <div className="flex items-center gap-4">
            {isRTL && <span className="text-xs font-bold text-gray-400">{t('onboarding.step')} {step} {t('onboarding.of')} {totalSteps}</span>}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-mintcom-green' : 'w-4 bg-gray-200 dark:bg-white/10'
                    }`}
                />
              ))}
            </div>
            {!isRTL && <span className="text-xs font-bold text-gray-400">{t('onboarding.step')} {step} {t('onboarding.of')} {totalSteps}</span>}
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">

          {/* STEP 1: Location Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl w-full"
            >
              <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-8 lg:p-12 shadow-2xl shadow-gray-200/50 dark:shadow-none">
                <div className="mb-10">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="font-magilio text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('onboarding.step1.title')}</h2>
                    {isAdditionalLocation && (
                      <button type="button" onClick={() => navigate('/owner')} className="text-gray-400 hover:text-mintcom-green hover:underline transition-colors flex items-center text-xs font-sans font-bold">
                        {t('common.dashboard', { defaultValue: 'Go to dashboard' })}
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-sans text-gray-600 dark:text-gray-300">{t('onboarding.step1.subtitle')}</p>
                </div>

                <form onSubmit={form1.handleSubmit(onStep1Submit)} autoComplete="off" className="space-y-8" dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-sans text-gray-400 mx-1 flex items-center">
                        {t('onboarding.step1.locationName')} <span className="text-mintcom-red mx-1">*</span>
                      </label>
                      <div className="relative group">
                        <Store className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mintcom-green transition-colors`} size={20} />
                        <input maxLength={255}
                          type="text"
                          {...form1.register('name')}
                          className={`w-full bg-gray-50 dark:bg-black/20 border ${form1.formState.errors.name ? 'border-mintcom-red ring-2 ring-mintcom-red/20' : 'border-gray-200 dark:border-white/10'} rounded-2xl py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-sans font-normal text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/50 transition-all`}
                          placeholder={formatInputPlaceholder(t('onboarding.step1.locationNamePlaceholder'), t('common.locale'))}
                        />
                      </div>
                      {form1.formState.errors.name && <p className="text-mintcom-red text-xs font-sans text-gray-500 mt-1 mx-1">{form1.formState.errors.name.message as string}</p>}
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-sans text-gray-400 mx-1 flex items-center">
                        {formatInputLabel(t('onboarding.step1.businessType'), t('common.locale'))}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {businessTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => form1.setValue('type', type.id)}
                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${form1.watch('type') === type.id ? 'border-mintcom-green bg-mintcom-green/5 text-mintcom-green' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-transparent text-gray-400'
                              }`}
                          >
                            <type.icon size={24} />
                            <span className="text-xs font-sans">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Country first — currency is linked to the selected country/region */}
                    <div className="space-y-2">
                      <label className="text-xs font-sans text-gray-400 mx-1 flex items-center">
                        {t('onboarding.step1.country', { defaultValue: 'Country' })} <span className="text-mintcom-red mx-1">*</span>
                      </label>
                      <div className="relative">
                        <Globe className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                        <select
                          {...form1.register('country')}
                          className={`w-full bg-gray-50 dark:bg-black/20 border ${form1.formState.errors.country ? 'border-mintcom-red ring-2 ring-mintcom-red/20' : 'border-gray-200 dark:border-white/10'} rounded-2xl py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-sans font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/50 transition-all appearance-none`}
                        >
                          {countryOptions.map((countryOption) => (
                            <option key={countryOption.code} value={countryOption.code}>
                              {countryOption.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`} size={16} />
                      </div>
                      {form1.formState.errors.country && <p className="text-mintcom-red text-xs font-sans text-gray-500 mt-1 mx-1">{form1.formState.errors.country.message as string}</p>}
                    </div>

                    {/* Base Currency Row: auto-filled from country, always free to change on first location */}
                    <div className="space-y-2">
                      <label className="text-xs font-sans text-gray-400 mx-1 flex items-center">
                        {t('onboarding.step1.currency')} <span className="text-mintcom-red mx-1">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 ${isCurrencyLocked ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
                        <select
                          {...form1.register('currency')}
                          disabled={isCurrencyLocked}
                          className={`w-full bg-gray-50 dark:bg-black/20 border ${form1.formState.errors.currency ? 'border-mintcom-red ring-2 ring-mintcom-red/20' : 'border-gray-200 dark:border-white/10'} rounded-2xl py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-sans font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/50 transition-all appearance-none ${isCurrencyLocked ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-white/5' : ''}`}
                        >
                          {currencyOptions.map((currencyOption) => (
                            <option key={currencyOption.code} value={currencyOption.code}>
                              {currencyOption.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`} size={16} />
                        {isCurrencyLocked && (
                          <div className={`absolute ${isRTL ? 'left-10' : 'right-10'} top-1/2 -translate-y-1/2`}>
                            <Lock size={16} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      {!isCurrencyLocked && (
                        <p className="text-[10px] font-sans text-gray-500 mt-1.5 mx-1 flex items-center gap-1.5">
                          <Info size={12} className="flex-shrink-0" />
                          {t('onboarding.step1.currencyLinkedToCountry', {
                            defaultValue: 'Currency is set from the selected country. You can change it if needed.',
                          })}
                        </p>
                      )}
                      {isCurrencyLocked && (
                        <p className="text-[10px] font-sans text-amber-600 mt-1.5 mx-1 flex items-center gap-1.5 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                          <Info size={12} className="flex-shrink-0" />
                          {t('onboarding.step1.currencyLockedNote')}
                        </p>
                      )}
                      {form1.formState.errors.currency && <p className="text-mintcom-red text-xs font-sans text-gray-500 mt-1 mx-1">{form1.formState.errors.currency.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-sans text-gray-400 mx-1 flex items-center">
                        {t('onboarding.step1.address')} <span className="text-mintcom-red mx-1">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                        <input maxLength={255}
                          type="text"
                          {...form1.register('address')}
                          className={`w-full bg-gray-50 dark:bg-black/20 border ${form1.formState.errors.address ? 'border-mintcom-red ring-2 ring-mintcom-red/20' : 'border-gray-200 dark:border-white/10'} rounded-2xl py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-sans font-normal text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/50 transition-all`}
                          placeholder={formatInputPlaceholder(t('onboarding.step1.addressPlaceholder'), t('common.locale'))}
                        />
                      </div>
                      {form1.formState.errors.address && <p className="text-mintcom-red text-xs font-sans text-gray-500 mt-1 mx-1">{form1.formState.errors.address.message as string}</p>}
                    </div>

                    {/* Import Settings Section - Only show if user has existing establishments */}
                    {establishments.length > 0 && (
                      <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                          <Copy className="text-mintcom-green" size={20} />
                          <h3 className="font-barlow text-base font-bold text-gray-900 dark:text-white">{t('onboarding.step1.quickSetup')}</h3>
                        </div>

                        <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                          <label className="text-xs font-sans text-gray-400 mb-2 flex items-center">
                            {t('onboarding.step1.copySettings')}
                            <QuickInfo text={t('onboarding.step1.copySettingsTip')} />
                          </label>
                          <div className="relative mb-4">
                            <select
                              value={duplicateFromId}
                              onChange={(e) => handleDuplicateSourceChange(e.target.value)}
                              className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white font-sans focus:outline-none focus:ring-2 focus:ring-mintcom-green/50 appearance-none"
                            >
                              <option value="">{t('onboarding.step1.startFresh')}</option>
                              {establishments.map((est) => (
                                <option key={est.id} value={est.id}>
                                  {est.name} ({getEstablishmentTypeLabel(est.type)})
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                          </div>

                          {/* Checkboxes - Only show if an establishment is selected */}
                          <AnimatePresence>
                            {duplicateFromId && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 overflow-hidden"
                              >
                                <p className="text-xs font-sans text-gray-400 mb-2">{t('onboarding.step1.selectData')}</p>

                                {/* Inventory Checkbox */}
                                <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${duplicateInventory ? 'border-mintcom-green bg-mintcom-green/5' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}>
                                  <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors ${duplicateInventory ? 'bg-mintcom-green text-black' : 'bg-gray-200 dark:bg-white/10'}`}>
                                    {duplicateInventory && <Check size={14} strokeWidth={4} />}
                                  </div>
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={duplicateInventory}
                                    onChange={(e) => setDuplicateInventory(e.target.checked)}
                                  />
                                  <div className="flex-1 flex items-center gap-2">
                                    <Box size={16} className={duplicateInventory ? 'text-mintcom-green' : 'text-gray-400'} />
                                    <div>
                                      <p className="text-sm font-sans text-gray-900 dark:text-white">{t('onboarding.step1.menu')}</p>
                                      <p className="text-xs font-sans text-gray-500">{t('onboarding.step1.menuDesc')}</p>
                                    </div>
                                  </div>
                                </label>

                                {/* Discounts Checkbox */}
                                <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${duplicateDiscounts ? 'border-mintcom-green bg-mintcom-green/5' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}>
                                  <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors ${duplicateDiscounts ? 'bg-mintcom-green text-black' : 'bg-gray-200 dark:bg-white/10'}`}>
                                    {duplicateDiscounts && <Check size={14} strokeWidth={4} />}
                                  </div>
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={duplicateDiscounts}
                                    onChange={(e) => setDuplicateDiscounts(e.target.checked)}
                                  />
                                  <div className="flex-1 flex items-center gap-2">
                                    <Tags size={16} className={duplicateDiscounts ? 'text-mintcom-green' : 'text-gray-400'} />
                                    <div>
                                      <p className="text-sm font-sans text-gray-900 dark:text-white">{t('onboarding.step1.discounts')}</p>
                                      <p className="text-xs font-sans text-gray-500">{t('onboarding.step1.discountsDesc')}</p>
                                    </div>
                                  </div>
                                </label>

                                {/* Payment Methods Checkbox */}
                                <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${duplicatePaymentMethods ? 'border-mintcom-green bg-mintcom-green/5' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}>
                                  <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors ${duplicatePaymentMethods ? 'bg-mintcom-green text-black' : 'bg-gray-200 dark:bg-white/10'}`}>
                                    {duplicatePaymentMethods && <Check size={14} strokeWidth={4} />}
                                  </div>
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={duplicatePaymentMethods}
                                    onChange={(e) => setDuplicatePaymentMethods(e.target.checked)}
                                  />
                                  <div className="flex-1 flex items-center gap-2">
                                    <CreditCard size={16} className={duplicatePaymentMethods ? 'text-mintcom-green' : 'text-gray-400'} />
                                    <div>
                                      <p className="text-sm font-sans text-gray-900 dark:text-white">{t('onboarding.step1.paymentMethods')}</p>
                                      <p className="text-xs font-sans text-gray-500">{t('onboarding.step1.paymentMethodsDesc')}</p>
                                    </div>
                                  </div>
                                </label>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-5 bg-mintcom-green text-black text-base font-sans font-bold rounded-2xl hover:bg-mintcom-green/90 transition-all shadow-xl shadow-mintcom-green/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isRTL && <ArrowRight size={24} />}
                      {t('onboarding.nextStep')}
                      {!isRTL && <ArrowRight size={24} />}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Location Login Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md w-full"
            >
              <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-8 lg:p-12 shadow-2xl shadow-gray-200/50 dark:shadow-none">
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-6">
                    <button onClick={() => goToStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-sans font-bold">
                      {!isRTL && <ArrowLeft size={14} />}
                      {t('onboarding.back')}
                      {isRTL && <ArrowLeft size={14} />}
                    </button>
                    {isAdditionalLocation && (
                      <button type="button" onClick={() => navigate('/owner')} className="text-gray-400 hover:text-mintcom-green hover:underline transition-colors flex items-center text-xs font-sans font-bold">
                        {t('common.dashboard', { defaultValue: 'Go to dashboard' })}
                      </button>
                    )}
                  </div>
                  <h2 className="font-magilio text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">{t('onboarding.step3.title')}</h2>
                  <p className="text-sm font-sans text-gray-600 dark:text-gray-300">{t('onboarding.step3.subtitle')}</p>
                  <div className="mt-4 p-3 bg-mintcom-green/10 text-mintcom-green text-sm rounded-xl font-sans border border-mintcom-green/20">
                    <p>✨ <strong>{t('onboarding.step3.uniqueAccess')}</strong> {t('onboarding.step3.uniqueAccessDesc')}</p>
                  </div>
                </div>

                <form onSubmit={form2.handleSubmit(onStep2Submit)} autoComplete="off" className="space-y-6" dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}>
                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-400 ml-1 flex items-center">
                      {t('onboarding.step3.locationId')} <span className="text-mintcom-red mx-1">*</span>
                      <QuickInfo text={t('onboarding.step3.locationIdTip')} />
                    </label>
                    <div className="relative group">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mintcom-green transition-colors" size={20} />
                      <input maxLength={255}
                        type="text"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        {...form2.register('establishmentLoginId')}
                        className={`w-full bg-gray-50 dark:bg-black/20 border ${form2.formState.errors.establishmentLoginId ? 'border-mintcom-red ring-2 ring-mintcom-red/20' : 'border-gray-200 dark:border-white/10'} rounded-2xl py-4 pl-12 pr-4 text-sm font-sans font-normal text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/50 transition-all`}
                        placeholder={formatInputPlaceholder(t('onboarding.step3.locationIdPlaceholder'), t('common.locale'))}
                      />
                    </div>
                    {form2.formState.errors.establishmentLoginId && <p className="text-mintcom-red text-xs font-sans text-gray-500 mt-1 ml-1">{form2.formState.errors.establishmentLoginId.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-400 ml-1 flex items-center">
                      {t('onboarding.step3.password')} <span className="text-mintcom-red mx-1">*</span>
                      <QuickInfo text={t('onboarding.step3.passwordTip')} />
                    </label>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mintcom-green transition-colors" size={20} />
                      <input maxLength={255}
                        type={showEstablishmentPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...form2.register('establishmentPassword')}
                        className={`w-full bg-gray-50 dark:bg-black/20 border ${form2.formState.errors.establishmentPassword ? 'border-mintcom-red ring-2 ring-mintcom-red/20' : 'border-gray-200 dark:border-white/10'} rounded-2xl py-4 pl-12 pr-12 text-sm font-sans font-normal text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/50 transition-all`}
                        placeholder={formatInputPlaceholder(t('onboarding.step3.passwordPlaceholder'), t('common.locale'))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEstablishmentPassword(!showEstablishmentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showEstablishmentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {form2.formState.errors.establishmentPassword && <p className="text-mintcom-red text-xs font-sans text-gray-500 mt-1 ml-1">{form2.formState.errors.establishmentPassword.message as string}</p>}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-5 bg-mintcom-green text-black text-base font-sans font-bold rounded-2xl hover:bg-mintcom-green/90 transition-all shadow-xl shadow-mintcom-green/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isRTL && <ArrowRight size={24} />}
                      {t('onboarding.nextStep')}
                      {!isRTL && <ArrowRight size={24} />}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Admin Access */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md w-full"
            >
              <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-8 lg:p-12 shadow-2xl shadow-gray-200/50 dark:shadow-none">
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-6">
                    <button onClick={() => goToStep(2)} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-sans font-bold">
                      {!isRTL && <ArrowLeft size={14} />}
                      {t('onboarding.back')}
                      {isRTL && <ArrowLeft size={14} />}
                    </button>
                    {isAdditionalLocation && (
                      <button type="button" onClick={() => navigate('/owner')} className="text-gray-400 hover:text-mintcom-green hover:underline transition-colors flex items-center text-xs font-sans font-bold">
                        {t('common.dashboard', { defaultValue: 'Go to dashboard' })}
                      </button>
                    )}
                  </div>
                  <h2 className="font-magilio text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                    {isAdditionalLocation
                      ? t('onboarding.step4.lockedTitle', { defaultValue: 'Owner Login Ready' })
                      : t('onboarding.step4.title')}
                  </h2>
                  <p className="text-sm font-sans text-gray-600 dark:text-gray-300">
                    {isAdditionalLocation
                      ? t('onboarding.step4.lockedSubtitle', { defaultValue: 'Your universal owner account is already linked to this account.' })
                      : t('onboarding.step4.subtitle')}
                  </p>
                  <div className="mt-4 p-3 bg-mintcom-green/10 text-mintcom-green text-sm rounded-xl font-sans border border-mintcom-green/20">
                    <p>
                      {isAdditionalLocation
                        ? t('onboarding.step4.lockedNote', {
                            defaultValue:
                              'Your previous universal owner account already has access to all locations. These details are locked here to prevent duplicate owner accounts.',
                          })
                        : t('onboarding.step4.step2Note')}
                    </p>
                  </div>
                </div>

                {isAdditionalLocation ? (
                  <div className="space-y-6" dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-100">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 shrink-0 text-mintcom-green" size={20} />
                        <p className="text-sm font-sans font-semibold leading-6">
                          {t('onboarding.step4.universalOwnerNotice', {
                            defaultValue:
                              'This owner login is universal. It will manage POS and Back Office access for this new location automatically after launch.',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-sans text-gray-400 ml-1">
                          {t('onboarding.step4.firstName')}
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            value={ownerLoginDisplay.firstName}
                            readOnly
                            className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-sans font-normal text-gray-600 dark:text-gray-300"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-sans text-gray-400 ml-1">
                          {t('onboarding.step4.lastName')}
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            value={ownerLoginDisplay.lastName}
                            readOnly
                            className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-sans font-normal text-gray-600 dark:text-gray-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-sans text-gray-400 ml-1">
                        {t('onboarding.step4.username')}
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          value={
                            isOwnerLoginLoading
                              ? t('onboarding.step4.loadingOwnerLogin', { defaultValue: 'Loading owner login...' })
                              : ownerLoginDisplay.username
                          }
                          readOnly
                          className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-sans font-normal text-gray-600 dark:text-gray-300"
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-sans text-gray-400 ml-1">
                        {t('onboarding.step4.ownerEmail', { defaultValue: 'Owner Email' })}
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          value={ownerLoginDisplay.email}
                          readOnly
                          className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-sans font-normal text-gray-600 dark:text-gray-300"
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                      <p className="text-xs font-sans text-gray-500 dark:text-gray-400 ml-1">
                        {t('onboarding.step4.lockedHelper', {
                          defaultValue:
                            'Edit the universal owner login from Employees or Account Settings, not from location setup.',
                        })}
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => goToStep(4)}
                        disabled={isOwnerLoginLoading}
                        className="w-full py-5 bg-mintcom-green text-black text-base font-sans font-bold rounded-2xl hover:bg-mintcom-green/90 transition-all shadow-xl shadow-mintcom-green/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        {isRTL && <ArrowRight size={24} />}
                        {t('onboarding.nextStep')}
                        {!isRTL && <ArrowRight size={24} />}
                      </button>
                    </div>
                  </div>
                ) : (
                <form onSubmit={form3.handleSubmit(onStep3Submit)} autoComplete="off" className="space-y-6" dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-sans text-gray-400 ml-1">
                        {t('onboarding.step4.firstName')} <span className="text-mintcom-red">*</span>
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mintcom-green transition-colors" size={20} />
                        <input maxLength={255}
                          type="text"
                          autoComplete="new-password"
                          autoCorrect="off"
                          spellCheck={false}
                          {...form3.register('firstName')}
                          className={`w-full bg-gray-50 dark:bg-black/20 border ${form3.formState.errors.firstName ? 'border-mintcom-red ring-2 ring-mintcom-red/20' : 'border-gray-200 dark:border-white/10'} rounded-2xl py-4 pl-12 pr-4 text-sm font-sans font-normal text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/50 transition-all`}
                          placeholder={formatInputPlaceholder(t('onboarding.step4.firstNamePlaceholder'), t('common.locale'))}
                        />
                      </div>
                      {form3.formState.errors.firstName && <p className="text-mintcom-red text-xs font-sans text-gray-500 mt-1 ml-1">{form3.formState.errors.firstName.message as string}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-sans text-gray-400 ml-1">
                        {t('onboarding.step4.lastName')} <span className="text-mintcom-red">*</span>
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mintcom-green transition-colors" size={20} />
                        <input maxLength={255}
                          type="text"
                          autoComplete="new-password"
                          autoCorrect="off"
                          spellCheck={false}
                          {...form3.register('lastName')}
                          className={`w-full bg-gray-50 dark:bg-black/20 border ${form3.formState.errors.lastName ? 'border-mintcom-red ring-2 ring-mintcom-red/20' : 'border-gray-200 dark:border-white/10'} rounded-2xl py-4 pl-12 pr-4 text-sm font-sans font-normal text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/50 transition-all`}
                          placeholder={formatInputPlaceholder(t('onboarding.step4.lastNamePlaceholder'), t('common.locale'))}
                        />
                      </div>
                      {form3.formState.errors.lastName && <p className="text-mintcom-red text-xs font-sans text-gray-500 mt-1 ml-1">{form3.formState.errors.lastName.message as string}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-400 ml-1 flex items-center">
                      {t('onboarding.step4.username')} <span className="text-mintcom-red mx-1">*</span>
                      <QuickInfo text={t('onboarding.step4.usernameTip')} />
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mintcom-green transition-colors" size={20} />
                      <input maxLength={255}
                        type="text"
                        autoComplete="new-password"
                        autoCorrect="off"
                        spellCheck={false}
                        {...form3.register('username')}
                        className={`w-full bg-gray-50 dark:bg-black/20 border ${form3.formState.errors.username ? 'border-mintcom-red ring-2 ring-mintcom-red/20' : 'border-gray-200 dark:border-white/10'} rounded-2xl py-4 pl-12 pr-4 text-sm font-sans font-normal text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/50 transition-all`}
                        placeholder={formatInputPlaceholder(t('onboarding.step4.usernamePlaceholder'), t('common.locale'))}
                      />
                    </div>
                    {form3.formState.errors.username && <p className="text-mintcom-red text-xs font-sans text-gray-500 mt-1 ml-1">{form3.formState.errors.username.message as string}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-400 ml-1 flex items-center">
                      {t('onboarding.step4.password')} <span className="text-mintcom-red mx-1">*</span>
                      <QuickInfo text={t('onboarding.step4.passwordTip')} />
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mintcom-green transition-colors" size={20} />
                      <input maxLength={255}
                        type={showAdminPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...form3.register('password')}
                        className={`w-full bg-gray-50 dark:bg-black/20 border ${form3.formState.errors.password ? 'border-mintcom-red ring-2 ring-mintcom-red/20' : 'border-gray-200 dark:border-white/10'} rounded-2xl py-4 pl-12 pr-12 text-sm font-sans font-normal text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/50 transition-all`}
                        placeholder={formatInputPlaceholder(t('onboarding.step4.passwordPlaceholder'), t('common.locale'))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {form3.formState.errors.password && <p className="text-mintcom-red text-xs font-sans text-gray-500 mt-1 ml-1">{form3.formState.errors.password.message as string}</p>}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-5 bg-mintcom-green text-black text-base font-sans font-bold rounded-2xl hover:bg-mintcom-green/90 transition-all shadow-xl shadow-mintcom-green/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isRTL && <ArrowRight size={24} />}
                      {t('onboarding.nextStep')}
                      {!isRTL && <ArrowRight size={24} />}
                    </button>
                  </div>
                </form>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Trial & Payment */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md w-full"
            >
              <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-8 lg:p-12 shadow-2xl shadow-gray-200/50 dark:shadow-none">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <button onClick={() => goToStep(3)} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-sans font-bold">
                      {!isRTL && <ArrowLeft size={14} />}
                      {t('onboarding.back')}
                      {isRTL && <ArrowLeft size={14} />}
                    </button>
                    {isAdditionalLocation && (
                      <button type="button" onClick={() => navigate('/owner')} className="text-gray-400 hover:text-mintcom-green hover:underline transition-colors flex items-center text-xs font-sans font-bold">
                        {t('common.dashboard', { defaultValue: 'Go to dashboard' })}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isTrialFlow ? 'bg-yellow-400/10' : 'bg-mintcom-green/10'}`}>
                      <ShieldCheck className={isTrialFlow ? 'text-yellow-500' : 'text-mintcom-green'} size={24} />
                    </div>
                    <div>
                      <h2 className="font-magilio text-xl font-bold text-gray-900 dark:text-white">
                        {isTrialFlow ? t('onboarding.step2.trialTitle') : t('onboarding.step2.activateTitle')}
                      </h2>
                      {isTrialFlow ? (
                        <span className="bg-yellow-400 text-black text-xs font-sans font-bold px-2 py-0.5 rounded">{t('onboarding.step2.freeDays')}</span>
                      ) : (
                        <span className="bg-mintcom-green text-black text-xs font-sans font-bold px-2 py-0.5 rounded">
                          {selectedPriceWithPeriod}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-sans text-gray-600 dark:text-gray-300">
                    {isTrialFlow
                      ? t('onboarding.step2.trialDesc')
                      : t('onboarding.step2.activateDesc', { amount: selectedPriceWithPeriod })
                    }
                  </p>
                  {isAdditionalLocation && !isTrialFlow && (
                    <div className="mt-3 px-3 py-2 bg-blue-500/10 text-blue-500 text-xs font-sans rounded-xl border border-blue-500/20">
                      {t('onboarding.step2.discountedAdditionalLocation', {
                        defaultValue: 'Discounted rate for additional locations',
                      })}
                    </div>
                  )}
                </div>

                <form onSubmit={form4.handleSubmit(onStep4Submit)} autoComplete="off" className="space-y-6" dir={t('common.locale') === 'ar' ? 'rtl' : 'ltr'}>
                  {/* Billing Cycle Toggle - shown for the trial too, so the owner
                      picks what they'll be billed once the free trial ends. */}
                  <div>
                    {isTrialFlow && (
                      <p className="mb-2 text-xs font-sans font-bold text-gray-500 dark:text-gray-400">
                        {t('onboarding.step2.trialChooseCycleHint', {
                          defaultValue: "Pick what you'll be billed after your free trial",
                        })}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-1.5 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-2xl p-1.5">
                      <button
                        type="button"
                        onClick={() => setBillingCycle(BILLING_CYCLES.MONTHLY)}
                        className={`py-3 rounded-xl text-sm font-sans font-bold transition-all duration-300 ${billingCycle === BILLING_CYCLES.MONTHLY
                          ? 'bg-mintcom-green text-black shadow-lg shadow-mintcom-green/20'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                      >
                        {t('onboarding.step2.monthly')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle(BILLING_CYCLES.YEARLY)}
                        className={`py-3 rounded-xl text-sm font-sans font-bold transition-all duration-300 flex items-center justify-center gap-2 ${billingCycle === BILLING_CYCLES.YEARLY
                          ? 'bg-mintcom-green text-black shadow-lg shadow-mintcom-green/20'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                      >
                        {t('onboarding.step2.yearly')}
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-sans font-bold leading-none ${billingCycle === BILLING_CYCLES.YEARLY ? 'bg-black text-mintcom-green' : 'bg-mintcom-green/15 text-mintcom-green'
                          }`}>
                          {t('common.save', { defaultValue: 'Save' })}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 dark:bg-black/20 rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                    <span className="block text-[11px] font-sans font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
                      {t('onboarding.step2.totalDue')}
                    </span>

                    {isTrialFlow ? (
                      <div className="flex items-end gap-2">
                        <span className="font-barlow text-5xl font-extrabold leading-none text-gray-900 dark:text-white">
                          {formatWholeNumber(0)}
                        </span>
                        <span className="pb-1 text-sm font-sans font-bold text-gray-500">{selectedUnitLabel}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start">
                        {/* Standard price, struck-through (only when a benefit applies) */}
                        {hasLocationDiscount && (
                          <>
                            <span className="font-barlow text-lg font-bold text-gray-400 line-through decoration-2">
                              {formatWholeNumber(primaryDisplayPrice)}{' '}
                              <span className="text-xs font-sans no-underline">{selectedUnitLabel}</span>
                            </span>
                            <ChevronDown size={18} className="my-0.5 text-mintcom-green" />
                          </>
                        )}
                        {/* Actual price, stacked below */}
                        <div className="flex items-end gap-2">
                          <span className="font-barlow text-5xl font-extrabold leading-none text-gray-900 dark:text-white">
                            {formatWholeNumber(displayPrice)}
                          </span>
                          <span className="pb-1 text-sm font-sans font-bold text-gray-500">{selectedUnitLabel}</span>
                        </div>
                      </div>
                    )}

                    {/* Billing cadence */}
                    <div className="mt-3 flex items-center gap-2 text-mintcom-green">
                      <RefreshCw size={14} />
                      <span className="text-sm font-sans font-bold">
                        {isTrialFlow
                          ? t('onboarding.step2.trialThenPrice', {
                              defaultValue: `Then ${selectedPriceWithPeriod}, billed after your 30-day trial`,
                              price: selectedPriceWithPeriod,
                            })
                          : t('onboarding.step2.billedCycle', {
                              defaultValue: `Billed ${selectedPlanLabel.toLowerCase()}`,
                              cycle: selectedPlanLabel.toLowerCase(),
                            })}
                      </span>
                    </div>

                    {/* Yearly savings note */}
                    {billingCycle === BILLING_CYCLES.YEARLY && (
                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Sparkles size={12} className="text-mintcom-green" />
                        <span className="text-xs font-bold text-mintcom-green tracking-wider uppercase">
                          {t('landing.pricing.save')} {formatWholeUsd(yearlySavings)} {t('landing.pricing.perYear')}
                        </span>
                        <span className="text-xs text-gray-400 line-through">{formatWholeUsd(currentMonthlyPrice * 12)} {t('landing.pricing.perYear')}</span>
                      </div>
                    )}

                    {/* Existing-account benefit badge */}
                    {hasLocationDiscount && (
                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-mintcom-green/20 bg-mintcom-green/10 p-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mintcom-green/20">
                          <Tags size={16} className="text-mintcom-green" />
                        </div>
                        <div className="leading-tight">
                          <p className="text-sm font-sans font-bold text-gray-900 dark:text-white">
                            {t('onboarding.step2.addedLocation', { defaultValue: 'Added location' })}
                          </p>
                          <p className="text-xs font-sans text-gray-500">
                            {t('onboarding.step2.existingAccountBenefit', { defaultValue: 'Existing account benefit' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trial billing disclosure (ChatGPT-style): exact charge date,
                      the amount that starts after the trial, and cancel-anytime. */}
                  {isTrialFlow && (
                    <div className="flex items-start gap-3 rounded-2xl border border-mintcom-green/20 bg-mintcom-green/5 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mintcom-green/15">
                        <CalendarClock size={18} className="text-mintcom-green" />
                      </div>
                      <div className="leading-snug">
                        <p className="text-sm font-sans font-bold text-gray-900 dark:text-white">
                          {t('onboarding.step2.trialDisclosureTitle', {
                            defaultValue: `Free until ${trialEndDateLabel}`,
                            date: trialEndDateLabel,
                          })}
                        </p>
                        <p className="mt-1 text-xs font-sans text-gray-600 dark:text-gray-300">
                          {t('onboarding.step2.trialDisclosureBody', {
                            defaultValue: `After your 30-day free trial ends on ${trialEndDateLabel}, you'll start paying ${selectedPriceWithPeriod} for this location. Cancel anytime before then and you won't be charged.`,
                            date: trialEndDateLabel,
                            price: selectedPriceWithPeriod,
                            days: TRIAL_DAYS,
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Saved Card Option */}
                  {hasSavedCard && (
                    <div className="space-y-4 mb-6">
                      <div
                        onClick={() => setUseSavedCard(true)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${useSavedCard
                          ? 'border-mintcom-green bg-mintcom-green/5'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${useSavedCard ? 'bg-mintcom-green' : 'bg-gray-100 dark:bg-white/5'}`}>
                            <CreditCard size={24} className={useSavedCard ? 'text-black' : 'text-gray-400'} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-sans font-bold text-gray-900 dark:text-white">{t('onboarding.step2.useSaved')}</p>
                            <p className="text-xs font-sans text-gray-500">**** **** **** {savedCardLast4}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${useSavedCard ? 'border-mintcom-green bg-mintcom-green' : 'border-gray-300'
                            }`}>
                            {useSavedCard && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setUseSavedCard(false)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${!useSavedCard
                          ? 'border-mintcom-green bg-mintcom-green/5'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${!useSavedCard ? 'bg-mintcom-green' : 'bg-gray-100 dark:bg-white/5'}`}>
                            <Plus size={24} className={!useSavedCard ? 'text-black' : 'text-gray-400'} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-sans font-bold text-gray-900 dark:text-white">{t('onboarding.step2.addNew')}</p>
                            <p className="text-xs font-sans text-gray-500">{t('onboarding.step2.differentMethod')}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!useSavedCard ? 'border-mintcom-green bg-mintcom-green' : 'border-gray-300'
                            }`}>
                            {!useSavedCard && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* New Card Form - Only show if no saved card OR user chose to add new */}
                  {(!hasSavedCard || !useSavedCard) && (
                    <div className="space-y-1 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-black/20">
                      <div className="mb-3 flex items-center gap-2 text-xs font-sans font-bold text-gray-500 dark:text-gray-400">
                        <Lock size={14} className="shrink-0 text-mintcom-green" />
                        <span className="leading-none">
                          {t('paymentMethods.modal.subtitle', {
                            defaultValue: 'Secure - 256-bit encrypted',
                          })}
                        </span>
                      </div>

                      <EmbeddedCardField
                        label={t('paymentMethods.modal.cardNumber', { defaultValue: 'Card number' })}
                        error={form4.formState.errors.cardNumber?.message as string | undefined}
                      >
                        <input
                          type="text"
                          autoComplete="cc-number"
                          {...form4.register('cardNumber')}
                          value={cardNumberValue}
                          onChange={(e) => {
                            form4.setValue('cardNumber', formatCardNumberInput(e.target.value), {
                              shouldDirty: true,
                              shouldTouch: true,
                            });
                            form4.clearErrors('cardNumber');
                          }}
                          maxLength={MAX_FORMATTED_CARD_NUMBER_LENGTH}
                          inputMode="numeric"
                          placeholder="0000 0000 0000 0000"
                          className={CARD_INPUT_CLASS}
                        />
                        <CreditCard size={18} className="shrink-0 text-gray-400" aria-hidden />
                      </EmbeddedCardField>

                      <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2 sm:items-start">
                        <EmbeddedCardField
                          label={t('paymentMethods.modal.expiry', { defaultValue: 'Expiry date' })}
                          error={form4.formState.errors.expiryDate?.message as string | undefined}
                        >
                          <input
                            type="text"
                            autoComplete="cc-exp"
                            {...form4.register('expiryDate')}
                            value={form4.watch('expiryDate') || ''}
                            onChange={(e) => {
                              form4.setValue('expiryDate', formatExpiryInput(e.target.value), {
                                shouldDirty: true,
                                shouldTouch: true,
                              });
                              form4.clearErrors('expiryDate');
                            }}
                            maxLength={5}
                            inputMode="numeric"
                            placeholder="MM/YY"
                            className={CARD_INPUT_CLASS}
                          />
                        </EmbeddedCardField>

                        <EmbeddedCardField
                          label={(
                            <>
                              {t('paymentMethods.modal.cvv', { defaultValue: 'CVV' })}
                              <Info size={12} className="shrink-0 text-gray-400" aria-hidden />
                            </>
                          )}
                          error={form4.formState.errors.cvv?.message as string | undefined}
                        >
                          <input
                            type="password"
                            autoComplete="cc-csc"
                            {...form4.register('cvv')}
                            value={form4.watch('cvv') || ''}
                            onChange={(e) => {
                              form4.setValue('cvv', getCardDigits(e.target.value).slice(0, cvvLength), {
                                shouldDirty: true,
                                shouldTouch: true,
                              });
                              form4.clearErrors('cvv');
                            }}
                            maxLength={4}
                            inputMode="numeric"
                            placeholder="•••"
                            className={CARD_INPUT_CLASS}
                          />
                        </EmbeddedCardField>
                      </div>

                      <EmbeddedCardField
                        label={t('paymentMethods.modal.cardholder', { defaultValue: 'Cardholder name' })}
                        error={form4.formState.errors.cardName?.message as string | undefined}
                      >
                        <input
                          maxLength={255}
                          type="text"
                          autoComplete="cc-name"
                          {...form4.register('cardName')}
                          value={form4.watch('cardName') || ''}
                          onChange={(e) => {
                            form4.setValue('cardName', e.target.value, {
                              shouldDirty: true,
                              shouldTouch: true,
                            });
                            form4.clearErrors('cardName');
                          }}
                          placeholder={t('paymentMethods.modal.cardholderPlaceholder', {
                            defaultValue: 'Name as it appears on card',
                          })}
                          className={CARD_INPUT_CLASS}
                        />
                      </EmbeddedCardField>

                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                        <CardBrandMark brand="mastercard" />
                        <CardBrandMark brand="visa" />
                        <CardBrandMark brand="amex" />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type={hasSavedCard && useSavedCard ? 'button' : 'submit'}
                      onClick={hasSavedCard && useSavedCard ? () => onStep4Submit({}) : undefined}
                      disabled={isLoading}
                      className="w-full py-5 bg-mintcom-green text-black text-base font-sans font-bold rounded-2xl hover:bg-mintcom-green/90 transition-all shadow-xl shadow-mintcom-green/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={24} /> : null}
                      {t('onboarding.completeLaunch')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Launch Center - Redesigned */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-7xl px-4"
            >
              {/* Top Hero Bar */}
              <div className="relative mb-6">
                <div className="absolute -inset-1 bg-gradient-to-r from-mintcom-green/30 via-mintcom-green/10 to-transparent rounded-[2rem] blur-xl opacity-60" />
                <div className="relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-6 lg:p-8 overflow-hidden">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Welcome Message (Right in RTL, Left in LTR) */}
                    {!isRTL ? (
                      <div className="flex items-center gap-5">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                          className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-mintcom-green to-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-mintcom-green/40"
                        >
                          <Sparkles size={32} className="text-black" />
                        </motion.div>
                        <div>
                          <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl lg:text-3xl font-sans font-bold text-gray-900 dark:text-white"
                          >
                            {t('onboarding.step5.welcomeTitle')}
                          </motion.h2>
                          <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 dark:text-gray-400 mt-1"
                          >
                            <span className="text-mintcom-green font-sans font-bold">{formData.name}</span> {t('onboarding.step5.isReadyToGo')}
                          </motion.p>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        id="tour-open-portal"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative"
                      >
                        {/* Animated pulse ring */}
                        <motion.div
                          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-mintcom-green rounded-2xl"
                        />

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const newEstablishment = establishments.find(e => e.id === formData.establishmentId);
                            if (newEstablishment) {
                              setCurrentEstablishment(newEstablishment);
                            }
                            window.open(`/owner/establishments?highlight=${formData.establishmentId}&setup=1`, '_blank');
                          }}
                          className="relative flex items-center gap-3 bg-mintcom-green text-black px-8 py-4 rounded-2xl font-sans font-bold text-lg shadow-xl shadow-mintcom-green/30"
                        >
                          <Building2 size={24} />
                          {t('onboarding.step5.openOwnerPortal')}
                          <ExternalLink size={20} />
                        </motion.button>
                      </motion.div>
                    )}

                    {/* Second element (Button in LTR, Welcome in RTL) */}
                    {!isRTL ? (
                      <motion.div
                        id="tour-open-portal"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative"
                      >
                        {/* Animated pulse ring */}
                        <motion.div
                          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-mintcom-green rounded-2xl"
                        />

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const newEstablishment = establishments.find(e => e.id === formData.establishmentId);
                            if (newEstablishment) {
                              setCurrentEstablishment(newEstablishment);
                            }
                            window.open(`/owner/establishments?highlight=${formData.establishmentId}&setup=1`, '_blank');
                          }}
                          className="relative flex items-center gap-3 bg-mintcom-green text-black px-8 py-4 rounded-2xl font-sans font-bold text-lg shadow-xl shadow-mintcom-green/30"
                        >
                          <Building2 size={24} />
                          {t('onboarding.step5.openOwnerPortal')}
                          <ExternalLink size={20} />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-5">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                          className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-mintcom-green to-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-mintcom-green/40"
                        >
                          <Sparkles size={32} className="text-black" />
                        </motion.div>
                        <div>
                          <motion.h2
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl lg:text-3xl font-sans font-bold text-gray-900 dark:text-white"
                          >
                            {t('onboarding.step5.welcomeTitle')}
                          </motion.h2>
                          <motion.p
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 dark:text-gray-400 mt-1"
                          >
                            <span className="text-mintcom-green font-sans font-bold">{formData.name}</span> {t('onboarding.step5.isReadyToGo')}
                          </motion.p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Download Apps (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* POS App */}
                  <motion.div
                    id="tour-pos-app"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-5"
                  >
                    <div className="flex items-start gap-4 mb-2">
                      <div className="w-14 h-14 bg-orange-500/10 dark:bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors">
                        <Tablet size={28} className="text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-barlow text-lg font-bold text-gray-900 dark:text-white">{t('onboarding.step5.posApp')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('onboarding.step5.posAppDesc')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {hasAndroidDownload ? (
                        <a
                          href={ANDROID_DOWNLOAD_URL}
                          download={isDirectInstallerDownload(ANDROID_DOWNLOAD_URL) ? true : undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Get it on Google Play"
                          className="block transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
                        >
                          <img src={GooglePlayBadge} alt="Get it on Google Play" className="block h-[52px] w-auto max-w-full object-contain mx-auto" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-label="Android app download coming soon"
                          className="block opacity-50 cursor-not-allowed"
                        >
                          <img src={GooglePlayBadge} alt="Get it on Google Play" className="block h-[52px] w-auto max-w-full object-contain mx-auto" />
                        </button>
                      )}
                      {hasIosDownload ? (
                        <a
                          href={IOS_DOWNLOAD_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Download on the App Store"
                          className="block transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
                        >
                          <img src={AppStoreBadge} alt="Download on the App Store" className="block h-[52px] w-auto max-w-full object-contain mx-auto" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-label="iOS app download coming soon"
                          className="block opacity-50 cursor-not-allowed"
                        >
                          <img src={AppStoreBadge} alt="Download on the App Store" className="block h-[52px] w-auto max-w-full object-contain mx-auto" />
                        </button>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    id="tour-owner-app"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-5"
                  >
                    <div className="flex items-start gap-4 mb-2">
                      <div className="w-14 h-14 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors">
                        <Smartphone size={28} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-barlow text-lg font-bold text-gray-900 dark:text-white">{t('onboarding.step5.ownerApp')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('onboarding.step5.ownerAppDesc')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {hasOwnerAndroidDownload ? (
                        <a
                          href={OWNER_ANDROID_DOWNLOAD_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Get it on Google Play"
                          className="block transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
                        >
                          <img src={GooglePlayBadge} alt="Get it on Google Play" className="block h-[52px] w-auto max-w-full object-contain mx-auto" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-label="Owner Android app download coming soon"
                          className="block opacity-50 cursor-not-allowed"
                        >
                          <img src={GooglePlayBadge} alt="Get it on Google Play" className="block h-[52px] w-auto max-w-full object-contain mx-auto" />
                        </button>
                      )}
                      {hasOwnerIosDownload ? (
                        <a
                          href={OWNER_IOS_DOWNLOAD_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Download on the App Store"
                          className="block transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
                        >
                          <img src={AppStoreBadge} alt="Download on the App Store" className="block h-[52px] w-auto max-w-full object-contain mx-auto" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-label="Owner iOS app download coming soon"
                          className="block opacity-50 cursor-not-allowed"
                        >
                          <img src={AppStoreBadge} alt="Download on the App Store" className="block h-[52px] w-auto max-w-full object-contain mx-auto" />
                        </button>
                      )}
                    </div>
                  </motion.div>



                  {/* Quick Stats */}                  <motion.div
                    id="tour-location-stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5 mb-3">
                      <div className="w-10 h-10 bg-mintcom-green/20 rounded-xl flex items-center justify-center">
                        <Building2 size={20} className="text-mintcom-green" />
                      </div>
                      <div>
                        <h3 className="font-barlow font-bold text-gray-900 dark:text-white text-sm">{t('onboarding.step5.locationReady')}</h3>
                        <p className="text-xs text-gray-500">{t('onboarding.step5.setupComplete')}</p>
                      </div>
                    </div>

                    {/* Location ID Row */}
                    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-white/5">
                      <Hash size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('onboarding.step5.locationId')}</p>
                        <p className="font-mono text-gray-900 dark:text-white font-sans font-bold text-sm truncate">{formData.establishmentLoginId}</p>
                      </div>
                    </div>

                    {/* Password Row */}
                    <div className="flex items-center gap-3 py-2.5">
                      <Lock size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('onboarding.step5.password')}</p>
                        <p className="text-gray-900 dark:text-white font-sans font-bold text-sm truncate font-mono tracking-wider">
                          {showEstablishmentPassword ? formData.establishmentPassword : '********'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowEstablishmentPassword(!showEstablishmentPassword)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-mintcom-green transition-colors"
                          title={showEstablishmentPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                        >
                          {showEstablishmentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(formData.establishmentPassword);
                            toast.success(t('common.copied'));
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-mintcom-green transition-colors"
                          title={t('common.copy')}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column: Resources Grid (7 cols) */}
                <div className="lg:col-span-7">
                  <motion.div
                    id="tour-resources"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-5 h-full"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-mintcom-green/10 rounded-lg flex items-center justify-center">
                        <BookOpen size={20} className="text-mintcom-green" />
                      </div>
                      <h3 className="font-barlow text-lg font-bold text-gray-900 dark:text-white">{t('onboarding.step5.resourcesAndHelp')}</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* User Manual */}
                      <a
                        href={userManualDoc.path}
                        download={userManualDoc.filename}
                        className="group p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-mintcom-green/50 hover:bg-mintcom-green/5 transition-all"
                      >
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <BookOpen size={20} className="text-blue-500" />
                        </div>
                        <h4 className="font-barlow font-bold text-gray-900 dark:text-white text-sm">{t('onboarding.step5.userManual')}</h4>
                        <p className="text-xs text-gray-500 mt-1">{t('onboarding.step5.completeGuide')}</p>
                      </a>

                      {/* Setup Manual */}
                      <a
                        href={setupManualDoc.path}
                        download={setupManualDoc.filename}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-mintcom-green/50 hover:bg-mintcom-green/5 transition-all"
                      >
                        <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Settings size={20} className="text-amber-500" />
                        </div>
                        <h4 className="font-barlow font-bold text-gray-900 dark:text-white text-sm">{t('onboarding.step5.setupManual')}</h4>
                        <p className="text-xs text-gray-500 mt-1">{t('onboarding.step5.hardwareSetup')}</p>
                      </a>

                      {/* Video Tutorial */}
                      {hasVideoGuide ? (
                        <a
                          href={ONBOARDING_VIDEO_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-mintcom-green/50 hover:bg-mintcom-green/5 transition-all"
                        >
                          <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <PlayCircle size={20} className="text-red-500" />
                          </div>
                          <h4 className="font-barlow font-bold text-gray-900 dark:text-white text-sm">{t('onboarding.step5.videoGuide')}</h4>
                          <p className="text-xs text-gray-500 mt-1">{t('onboarding.step5.quickStart')}</p>
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-label="Video guide coming soon"
                          className="group p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl opacity-60 cursor-not-allowed text-left"
                        >
                          <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-3">
                            <PlayCircle size={20} className="text-red-500" />
                          </div>
                          <h4 className="font-barlow font-bold text-gray-900 dark:text-white text-sm">{t('onboarding.step5.videoGuide')}</h4>
                          <p className="text-xs text-gray-500 mt-1">{t('onboarding.step5.quickStart')}</p>
                        </button>
                      )}

                      {/* Q&A Center */}
                      <a
                        href="/qa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-mintcom-green/50 hover:bg-mintcom-green/5 transition-all"
                      >
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <HelpCircle size={20} className="text-purple-500" />
                        </div>
                        <h4 className="font-barlow font-bold text-gray-900 dark:text-white text-sm">{t('onboarding.step5.qaCenter')}</h4>
                        <p className="text-xs text-gray-500 mt-1">{t('onboarding.step5.faqs')}</p>
                      </a>

                      {/* Privacy */}
                      <a
                        href="/legal/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-mintcom-green/50 hover:bg-mintcom-green/5 transition-all"
                      >
                        <div className="w-10 h-10 bg-mintcom-green/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Shield size={20} className="text-mintcom-green" />
                        </div>
                        <h4 className="font-barlow font-bold text-gray-900 dark:text-white text-sm">{t('onboarding.step5.privacy')}</h4>
                        <p className="text-xs text-gray-500 mt-1">{t('onboarding.step5.dataProtection')}</p>
                      </a>

                      {/* Terms */}
                      <a
                        href="/legal/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-mintcom-green/50 hover:bg-mintcom-green/5 transition-all"
                      >
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Scale size={20} className="text-blue-500" />
                        </div>
                        <h4 className="font-barlow font-bold text-gray-900 dark:text-white text-sm">{t('onboarding.step5.terms')}</h4>
                        <p className="text-xs text-gray-500 mt-1">{t('onboarding.step5.agreement')}</p>
                      </a>

                      {/* About - spans 2 cols on sm */}
                      <a
                        href="/about"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-mintcom-green/50 hover:bg-mintcom-green/5 transition-all col-span-2 sm:col-span-1"
                      >
                        <div className="w-10 h-10 bg-mintcom-green/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Info size={20} className="text-mintcom-green" />
                        </div>
                        <h4 className="font-barlow font-bold text-gray-900 dark:text-white text-sm">{t('onboarding.step5.aboutUs')}</h4>
                        <p className="text-xs text-gray-500 mt-1">{t('onboarding.step5.ourStory')}</p>
                      </a>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-gray-500">
                  {t('onboarding.step5.needHelp')} <a href="mailto:info@mintcompos.com" className="text-mintcom-green font-sans font-bold hover:underline">info@mintcompos.com</a>
                </p>
              </motion.div>

              {/* Tour Guide */}
              <TourGuide
                steps={launchCenterTourSteps}
                isOpen={isTourOpen}
                onClose={() => setIsTourOpen(false)}
                onComplete={() => setIsTourOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
