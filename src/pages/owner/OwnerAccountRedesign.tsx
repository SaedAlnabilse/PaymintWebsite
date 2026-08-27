import { useCallback, useEffect, useMemo, useState, type ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User,
    Mail,
    Calendar,
    Key,
    Store,
    Building2,
    Copy,
    CheckCircle2,
    Shield,
    Info,
    KeyRound,
    AlertTriangle,
    Lock,
    Trash2,
    AlertCircle,
    X,
    Users,
    BookOpen,
    Download,
    Settings,
    PlayCircle,
    ExternalLink,
    Scale,
    Landmark,
    CreditCard,
    Library,
    HelpCircle,
    Search,
    ChevronRight,
    Sparkles,
    ShieldAlert,
    FileText,
    ArrowUpRight,
    Check,
    SlidersHorizontal,
    Globe,
    LayoutGrid,
    List,
    BadgeCheck,
    LockKeyhole,
    CheckCircle,
    Fingerprint,
    ShieldCheck,
} from 'lucide-react';
import api from '../../config/api';
import { ONBOARDING_VIDEO_URL } from '../../config/downloads';
import { CURRENCIES, useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { PasswordResetOtpModal } from '../../components/PasswordResetOtpModal';
import { ChangeCurrencyModal } from '../../components/ChangeCurrencyModal';
import { BusyOverlay } from '../../components/BusyOverlay';
import toast from 'react-hot-toast';
import { getBusinessTypeIcon } from '../../utils/businessTypeIcons';
import { SectionLoader } from '../../components/LoadingState';
import { Pagination } from '../../components/ui';
import { formatInputPlaceholder } from '../../utils/textCase';
import { StepUpVerifier } from '../../components/StepUpVerifier';
import { reauthHeaders } from '../../services/stepUp';
import { getLocalizedManual } from '../../utils/localizedDocs';
import { ACCOUNT_RECOVERY_PATH } from '../../utils/deletionRecovery';

const CRED_ITEMS_PER_PAGE_GRID = 6;
const CRED_ITEMS_PER_PAGE_LIST = 8;

interface AccountDetails {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
    trialUsed: boolean;
    trialEndDate?: string;
    defaultCardId?: string;
    deletionRequestedAt?: string;
    establishments?: any[];
}

interface BrandCredential {
    id: string;
    name: string;
    establishmentLoginId: string;
    logo?: string;
    isActive: boolean;
    createdAt: string;
    establishmentCount?: number;
    establishments?: any[];
    _count?: {
        establishments: number;
    };
}

const MAX_OWNER_PROFILE_NAME_LENGTH = 100;
const MAX_OWNER_PROFILE_EMAIL_LENGTH = 254;

const sanitizeOwnerProfileText = (value: unknown, maxLength: number) =>
    String(value ?? '').slice(0, maxLength);

const DELETE_REASON_OPTIONS = [
    { key: 'its_too_expensive', value: "It's too expensive" },
    { key: 'i_found_a_better_alternative', value: 'I found a better alternative' },
    { key: 'missing_features_i_need', value: 'Missing features I need' },
    { key: 'too_difficult_to_use', value: 'Too difficult to use' },
    { key: 'closing_my_business', value: 'Closing my business' },
    { key: 'other', value: 'Other' },
] as const;

type RedesignTab = 'credentials' | 'profile' | 'security' | 'resources';

interface OwnerAccountRedesignProps {
    onSwitchToClassic?: () => void;
}

export function OwnerAccountRedesign({ onSwitchToClassic }: OwnerAccountRedesignProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir(i18n.language) === 'rtl';
    const { account, establishments, logout, updateAccount, updateEstablishmentsCurrency } = useAuth();
    const { updateCurrency } = useCurrency();
    const navigate = useNavigate();
    const hasOnboardingVideo = Boolean(ONBOARDING_VIDEO_URL);
    const userManualDoc = getLocalizedManual('user', i18n.language);
    const setupManualDoc = getLocalizedManual('setup', i18n.language);

    const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
    const [brands, setBrands] = useState<BrandCredential[]>([]);
    const [totalStaff, setTotalStaff] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Active Tab
    const [activeTab, setActiveTab] = useState<RedesignTab>('credentials');

    // View mode for credentials: grid cards vs compact list
    const [credViewMode, setCredViewMode] = useState<'grid' | 'list'>('grid');

    // Active establishments blocking deletion modal
    const [showActiveEstBlockModal, setShowActiveEstBlockModal] = useState(false);
    const [activeBlockingEsts, setActiveBlockingEsts] = useState<any[]>([]);

    // Password reset modal state
    const [passwordModal, setPasswordModal] = useState<{
        isOpen: boolean;
        type: 'account' | 'establishment' | 'brand';
        targetId?: string;
        targetName?: string;
    }>({
        isOpen: false,
        type: 'account',
    });

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteStep, setDeleteStep] = useState(1);
    const [deleteReason, setDeleteReason] = useState('');
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    // Global Currency state
    const [globalCurrency, setGlobalCurrency] = useState('AED');
    const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false);
    const [pendingCurrency, setPendingCurrency] = useState<string | null>(null);

    // Credentials hub state
    const [credFilter, setCredFilter] = useState<'all' | 'locations' | 'brands'>('all');
    const [credSearch, setCredSearch] = useState('');
    const [credPage, setCredPage] = useState(1);

    const formatDate = useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);
            const lang = (i18n.language || 'en').toLowerCase();
            const locale = lang.startsWith('ar')
                ? 'ar-SA'
                : lang.startsWith('zh')
                    ? 'zh-CN'
                    : 'en-US';
            return date.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return t('common.na');
        }
    }, [i18n.language, t]);

    const openPasswordModal = useCallback((
        type: 'account' | 'establishment' | 'brand',
        targetId?: string,
        targetName?: string
    ) => {
        setPasswordModal({
            isOpen: true,
            type,
            targetId,
            targetName,
        });
    }, []);

    const handleUpdateGlobalCurrency = async (newCurrency: string) => {
        try {
            setIsUpdatingCurrency(true);
            const response = await api.put('/api/accounts/currency', { currency: newCurrency });
            if (response.data?.success) {
                const currency = newCurrency.toUpperCase();
                setGlobalCurrency(currency);
                updateCurrency(currency);
                updateEstablishmentsCurrency(currency);
                toast.success(t('owner.account.currencyUpdated', { currency, defaultValue: `System currency set to ${currency}` }));

                if (accountDetails?.establishments) {
                    setAccountDetails(prev => prev ? ({
                        ...prev,
                        establishments: prev.establishments!.map(e => ({ ...e, currency }))
                    }) : prev);
                }
            }
        } catch (err: any) {
            console.error('Failed to update currency:', err);
            toast.error(err.response?.data?.message || t('owner.account.currencyUpdateFailed', { defaultValue: 'Failed to update system currency' }));
        } finally {
            setIsUpdatingCurrency(false);
        }
    };

    const locationLoginEstablishments = useMemo(() => {
        const profileEstablishments = accountDetails?.establishments || [];
        const contextEstablishments = establishments || [];

        if (profileEstablishments.length > 0) {
            return profileEstablishments.map((profileEst: any) => {
                const contextMatch = contextEstablishments.find((ctxEst: any) => ctxEst.id === profileEst.id);
                return { ...contextMatch, ...profileEst };
            });
        }

        return contextEstablishments;
    }, [accountDetails?.establishments, establishments]);

    const brandLoginRows = useMemo(() => {
        return brands.map((brand) => {
            let count = brand.establishmentCount || brand._count?.establishments || (brand.establishments ? brand.establishments.length : 0);
            if (!count && establishments) {
                const directMatches = establishments.filter((e: any) => e.brandId === brand.id || e.brand?.id === brand.id).length;
                if (directMatches > 0) {
                    count = directMatches;
                } else if (brands.length === 1 && establishments.length > 0) {
                    count = establishments.length;
                }
            }
            return { ...brand, locationCount: count || 0 };
        });
    }, [brands, establishments]);

    const allCredentialItems = useMemo(() => {
        type CredRow = {
            key: string;
            name: string;
            meta: string;
            loginId: string;
            copyKey: string;
            isActive: boolean;
            statusLabel: string;
            icon: ElementType;
            onOpen?: () => void;
            onReset: () => void;
            kind: 'location' | 'brand';
            rawType?: string;
        };

        const locationRows: CredRow[] = locationLoginEstablishments.map((est: any) => {
            const slug = (est.establishmentLoginId || est.loginId || est.locationLoginId || est.id || '').trim();
            const status = String(est.subscriptionStatus || '').toUpperCase();
            const isActive = status === 'ACTIVE' || status === 'TRIAL' || status === 'TRIALING';
            let statusLabel = t('common.status.inactive');
            if (status === 'ACTIVE') statusLabel = t('common.status.active');
            else if (status === 'TRIAL' || status === 'TRIALING') statusLabel = t('common.status.trial');
            else if (status === 'PAST_DUE') statusLabel = t('common.status.pastDue');
            else if (status === 'CANCELED' || status === 'CANCELLED') statusLabel = t('common.status.canceled', { defaultValue: 'Canceled' });

            const metaParts = [
                est.currency?.toUpperCase() || globalCurrency,
                est.createdAt ? formatDate(est.createdAt) : null,
            ].filter(Boolean);

            return {
                key: est.id,
                name: est.name || t('common.unnamedLocation', { defaultValue: 'Location' }),
                meta: metaParts.join(' · '),
                loginId: slug,
                copyKey: `est-login-${est.id}`,
                isActive,
                statusLabel,
                icon: getBusinessTypeIcon(est.type),
                rawType: est.type,
                onOpen: slug ? () => window.open(`/dashboard/${slug}`, '_blank') : undefined,
                onReset: () => openPasswordModal('establishment', est.id, est.name),
                kind: 'location' as const,
            };
        });

        const brandRows: CredRow[] = brandLoginRows.map((brand) => {
            const slug = (brand.establishmentLoginId || '').trim();
            const metaParts = [
                t('owner.account.locationsCount', { count: brand.locationCount }),
                brand.createdAt ? formatDate(brand.createdAt) : null,
            ].filter(Boolean);

            return {
                key: brand.id,
                name: brand.name || t('common.unnamedBrand', { defaultValue: 'Brand' }),
                meta: metaParts.join(' · '),
                loginId: slug,
                copyKey: `brand-${brand.id}`,
                isActive: Boolean(brand.isActive),
                statusLabel: brand.isActive ? t('common.status.active') : t('common.status.inactive'),
                icon: Building2,
                onOpen: slug ? () => window.open(`/brand/${slug}`, '_blank') : undefined,
                onReset: () => openPasswordModal('brand', brand.id, brand.name),
                kind: 'brand' as const,
            };
        });

        return {
            locations: locationRows,
            brands: brandRows,
            all: [...locationRows, ...brandRows],
        };
    }, [locationLoginEstablishments, brandLoginRows, globalCurrency, t, formatDate]);

    const filteredCredentials = useMemo(() => {
        const targetList =
            credFilter === 'locations'
                ? allCredentialItems.locations
                : credFilter === 'brands'
                    ? allCredentialItems.brands
                    : allCredentialItems.all;

        const q = credSearch.trim().toLowerCase();
        if (!q) return targetList;

        return targetList.filter((item) => {
            const name = (item.name || '').toLowerCase();
            const slug = (item.loginId || '').toLowerCase();
            const meta = (item.meta || '').toLowerCase();
            return name.includes(q) || slug.includes(q) || meta.includes(q);
        });
    }, [allCredentialItems, credFilter, credSearch]);

    const itemsPerPage = credViewMode === 'grid' ? CRED_ITEMS_PER_PAGE_GRID : CRED_ITEMS_PER_PAGE_LIST;

    // Reset credentials page when filters change
    useEffect(() => {
        setCredPage(1);
    }, [credFilter, credSearch, credViewMode]);

    // Clamp page if the filtered list shrinks
    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredCredentials.length / itemsPerPage));
        setCredPage((p) => Math.min(p, totalPages));
    }, [filteredCredentials.length, itemsPerPage]);

    const handleEditClick = () => {
        if (accountDetails) {
            setEditForm({
                firstName: accountDetails.firstName || '',
                lastName: accountDetails.lastName || '',
                email: accountDetails.email || ''
            });
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            firstName: '',
            lastName: '',
            email: ''
        });
    };

    const handleSaveProfile = async () => {
        try {
            setIsSaving(true);

            const normalizedEditForm = {
                firstName: sanitizeOwnerProfileText(editForm.firstName, MAX_OWNER_PROFILE_NAME_LENGTH).trim(),
                lastName: sanitizeOwnerProfileText(editForm.lastName, MAX_OWNER_PROFILE_NAME_LENGTH).trim(),
                email: sanitizeOwnerProfileText(editForm.email, MAX_OWNER_PROFILE_EMAIL_LENGTH).trim(),
            };

            if (!normalizedEditForm.firstName || !normalizedEditForm.lastName || !normalizedEditForm.email) {
                toast.error(t('owner.account.validation.requiredFields'));
                setIsSaving(false);
                return;
            }

            const response = await api.put('/api/accounts/profile', normalizedEditForm);

            if (response.data && response.data.id) {
                const updatedData = response.data;
                const emailChangedButNotVerified = normalizedEditForm.email.toLowerCase() !== updatedData.email.toLowerCase();

                if (emailChangedButNotVerified) {
                    toast.success(t('owner.account.profileUpdatedVerifyEmail'), { duration: 5000 });
                } else {
                    toast.success(t('owner.account.profileUpdated'));
                }

                setAccountDetails(prev => prev ? ({
                    ...prev,
                    firstName: updatedData.firstName,
                    lastName: updatedData.lastName,
                    email: updatedData.email,
                    emailVerified: updatedData.emailVerified
                }) : null);

                updateAccount({
                    firstName: updatedData.firstName,
                    lastName: updatedData.lastName,
                    email: updatedData.email,
                    emailVerified: updatedData.emailVerified
                });

                setIsEditing(false);
            }
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            toast.error(err.response?.data?.message || t('owner.account.updateFailed'));
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (!showDeleteConfirm) {
            setDeleteStep(1);
            setDeleteReason('');
            setDeleteConfirmationText('');
        }
    }, [showDeleteConfirm]);

    const fetchAccountData = useCallback(async () => {
        try {
            setIsLoading(true);

            const [profileRes, employeesRes] = await Promise.all([
                api.get('/api/accounts/profile'),
                api.get('/api/accounts/all-employees').catch((err) => {
                    console.error('Failed to fetch staff count:', err);
                    return { data: [] };
                }),
            ]);

            const data = profileRes.data;
            const employees = Array.isArray(employeesRes.data) ? employeesRes.data : [];

            setAccountDetails({
                id: data.id,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                avatar: data.avatar,
                emailVerified: data.emailVerified,
                createdAt: data.createdAt,
                trialUsed: data.trialUsed,
                trialEndDate: data.trialEndDate,
                defaultCardId: data.defaultCardId,
                deletionRequestedAt: data.deletionRequestedAt,
                establishments: data.establishments || [],
            });

            if (data.establishments && data.establishments.length > 0) {
                setGlobalCurrency(data.establishments[0].currency || 'AED');
            }

            setBrands(data.brands || []);
            setTotalStaff(employees.length);
        } catch (err) {
            console.error('Failed to fetch account data:', err);
            if (account) {
                setAccountDetails({
                    id: account.id,
                    email: account.email,
                    firstName: account.firstName,
                    lastName: account.lastName,
                    emailVerified: account.emailVerified || false,
                    createdAt: new Date().toISOString(),
                    trialUsed: false,
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [account]);

    useEffect(() => {
        fetchAccountData();
    }, [fetchAccountData]);

    const handleDeleteClick = () => {
        const establishmentsToCheck = accountDetails?.establishments || establishments || [];
        const activeEsts = establishmentsToCheck.filter(
            (est: any) => est.subscriptionStatus === 'ACTIVE' || est.isActive === true
        );

        if (activeEsts.length > 0) {
            setActiveBlockingEsts(activeEsts);
            setShowActiveEstBlockModal(true);
            return;
        }

        setShowDeleteConfirm(true);
    };

    const handleDeleteAccount = async (reauthToken: string) => {
        try {
            setIsDeletingAccount(true);
            await api.delete('/api/accounts/me', {
                headers: reauthHeaders(reauthToken),
                data: { reason: deleteReason }
            });

            toast.success(t('owner.account.deletionInitiated'));
            setShowDeleteConfirm(false);

            setTimeout(async () => {
                await logout();
            }, 3000);
        } catch (err) {
            console.error('Failed to delete account:', err);
            const responseMessage = (err as any)?.response?.data?.message;
            toast.error(
                Array.isArray(responseMessage)
                    ? responseMessage.join(' ')
                    : responseMessage || t('owner.account.deletionFailed')
            );
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handleRestoreAccount = () => {
        navigate(ACCOUNT_RECOVERY_PATH);
    };

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            toast.success(t('common.copied'));
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            toast.error(t('common.copyFailed'));
        }
    };

    if (isLoading) {
        return <SectionLoader message={t('owner.account.loading')} />;
    }

    const totalLocations = locationLoginEstablishments.length;
    const totalBrands = brands.length;

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            <BusyOverlay visible={isLoading} />

            {/* Switcher & Testing Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-mintcom-green/10 via-emerald-500/5 to-transparent dark:from-mintcom-green/15 dark:via-white/[0.02] dark:to-transparent rounded-2xl border border-mintcom-green/20 dark:border-mintcom-green/25">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mintcom-green text-black font-black text-xs shadow-sm">
                        <Sparkles size={14} />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-mintcom-green">
                                {t('owner.account.redesignPreview', { defaultValue: 'Executive Redesign' })}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-mintcom-green/20 text-mintcom-green border border-mintcom-green/30">
                                Active Preview
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {t('owner.account.redesignTestingHint', { defaultValue: 'Testing view enabled. The classic design remains completely intact.' })}
                        </p>
                    </div>
                </div>

                {onSwitchToClassic && (
                    <button
                        type="button"
                        onClick={onSwitchToClassic}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 text-xs font-bold transition-all shadow-sm shrink-0"
                    >
                        <span>{t('owner.account.backToClassic', { defaultValue: 'Switch to Classic View' })}</span>
                        <ArrowUpRight size={13} className="text-gray-400" />
                    </button>
                )}
            </div>

            {/* Master Executive Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#121A2A] border border-gray-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-sm"
            >
                {/* Subtle Ambient Radial Glow */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-mintcom-green/10 dark:bg-mintcom-green/15 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Identity Info */}
                    <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-mintcom-green via-[#4ea17d] to-[#2563EB] text-black font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-mintcom-green/20 ring-4 ring-white dark:ring-[#121A2A]">
                                {(accountDetails?.firstName?.[0] || accountDetails?.email?.[0] || 'O').toUpperCase()}
                                {(accountDetails?.lastName?.[0] || '').toUpperCase()}
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-mintcom-green text-black ring-2 ring-white dark:ring-[#121A2A] shadow">
                                <BadgeCheck size={14} className="stroke-[2.5]" />
                            </span>
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
                                    {accountDetails?.firstName} {accountDetails?.lastName}
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-mintcom-green/15 text-mintcom-green border border-mintcom-green/30">
                                    {t('owner.account.badge', { defaultValue: 'Master Account' })}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <span dir="ltr" className="inline-flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                                    <Mail size={13} className="text-mintcom-green shrink-0" />
                                    <span>{accountDetails?.email}</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar size={13} className="text-gray-400 shrink-0" />
                                    <span>{t('owner.account.joined')}: {formatDate(accountDetails?.createdAt || '')}</span>
                                </span>
                                {accountDetails?.emailVerified ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <Check size={12} className="stroke-[3]" />
                                        {t('owner.account.verified')}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                                        <AlertTriangle size={12} />
                                        {t('owner.account.unverified', { defaultValue: 'Unverified' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Action Controls */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-white/5">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('profile');
                                handleEditClick();
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-800 dark:text-gray-100 text-xs font-bold transition-all"
                        >
                            <User size={14} className="text-mintcom-green" />
                            <span>{t('owner.account.editProfile')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => openPasswordModal('account')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mintcom-green/10 hover:bg-mintcom-green/20 text-mintcom-green text-xs font-bold transition-all border border-mintcom-green/20"
                        >
                            <Key size={14} />
                            <span>{t('owner.account.resetPassword')}</span>
                        </button>
                    </div>
                </div>

                {/* KPI Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-white/[0.06]">
                    <div
                        onClick={() => {
                            setActiveTab('credentials');
                            setCredFilter('locations');
                        }}
                        className="group flex flex-col p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] hover:border-mintcom-green/30 hover:bg-mintcom-green/[0.02] transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between text-gray-400 group-hover:text-mintcom-green">
                            <span className="text-[11px] font-bold tracking-wide uppercase">{t('owner.account.locations')}</span>
                            <Store size={15} />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{totalLocations}</span>
                            <span className="text-[10px] font-bold text-mintcom-green opacity-0 group-hover:opacity-100 transition-opacity">View Logins</span>
                        </div>
                    </div>

                    <div
                        onClick={() => {
                            setActiveTab('credentials');
                            setCredFilter('brands');
                        }}
                        className="group flex flex-col p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between text-gray-400 group-hover:text-blue-500">
                            <span className="text-[11px] font-bold tracking-wide uppercase">{t('owner.account.brands')}</span>
                            <Building2 size={15} />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{totalBrands}</span>
                            <span className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">View Logins</span>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/owner/employees')}
                        className="group flex flex-col p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] hover:border-purple-500/30 hover:bg-purple-500/[0.02] transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between text-gray-400 group-hover:text-purple-500">
                            <span className="text-[11px] font-bold tracking-wide uppercase">{t('owner.account.totalStaff')}</span>
                            <Users size={15} />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{totalStaff}</span>
                            <ArrowUpRight size={13} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveTab('profile')}
                        className="group flex flex-col p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between text-gray-400 group-hover:text-amber-500">
                            <span className="text-[11px] font-bold tracking-wide uppercase">{t('owner.account.systemCurrency')}</span>
                            <Landmark size={15} />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{globalCurrency}</span>
                            <span className="text-[10px] font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">Change</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Redesigned Navigation Tabs with Sliding Pill Animation */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-2 overflow-x-auto">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {[
                        { id: 'credentials' as const, label: t('owner.account.accessCredentials', { defaultValue: 'Access Logins' }), icon: KeyRound, count: allCredentialItems.all.length },
                        { id: 'profile' as const, label: t('owner.account.ownerAccountTitle', { defaultValue: 'Profile & Currency' }), icon: User },
                        { id: 'security' as const, label: t('owner.account.securityTips.title', { defaultValue: 'Security & Safety' }), icon: Shield },
                        { id: 'resources' as const, label: t('owner.account.resources.title', { defaultValue: 'Guides & Legal' }), icon: Library },
                    ].map((tab) => {
                        const TabIcon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                                    active
                                        ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-md'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                                }`}
                            >
                                <TabIcon size={16} />
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black tabular-nums ${
                                        active
                                            ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black'
                                            : 'bg-gray-100 dark:bg-white/10 text-gray-500'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TAB CONTENT */}
            <AnimatePresence mode="wait">
                {/* TAB 1: Credentials Hub */}
                {activeTab === 'credentials' && (
                    <motion.div
                        key="tab-credentials"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {/* Search & Filter Header Bar */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#121A2A] rounded-2xl border border-gray-200/80 dark:border-white/[0.08] shadow-sm">
                            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-white/[0.04] rounded-xl self-start sm:self-auto">
                                {[
                                    { id: 'all' as const, label: t('common.all', { defaultValue: 'All Logins' }), count: allCredentialItems.all.length },
                                    { id: 'locations' as const, label: t('owner.account.locations'), count: allCredentialItems.locations.length },
                                    { id: 'brands' as const, label: t('owner.account.brands'), count: allCredentialItems.brands.length },
                                ].map((filter) => {
                                    const active = credFilter === filter.id;
                                    return (
                                        <button
                                            key={filter.id}
                                            type="button"
                                            onClick={() => setCredFilter(filter.id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                active
                                                    ? 'bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            <span>{filter.label}</span>
                                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                                                active
                                                    ? 'bg-mintcom-green/20 text-mintcom-green'
                                                    : 'bg-gray-200/60 dark:bg-white/10 text-gray-500'
                                            }`}>
                                                {filter.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative flex-1 sm:w-72">
                                    <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`} />
                                    <input
                                        type="text"
                                        value={credSearch}
                                        onChange={(e) => setCredSearch(e.target.value)}
                                        placeholder={formatInputPlaceholder(
                                            t('owner.account.searchCredentials', { defaultValue: 'Search name or Login ID…' }),
                                            t('common.locale'),
                                        )}
                                        className={`w-full h-10 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/30 focus:border-mintcom-green transition-all ${isRtl ? 'pr-9 pl-9 text-right' : 'pl-9 pr-9'}`}
                                    />
                                    {credSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setCredSearch('')}
                                            className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ${isRtl ? 'left-2.5' : 'right-2.5'}`}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* View Switcher: Grid vs List */}
                                <div className="flex items-center p-1 bg-gray-100 dark:bg-white/[0.04] rounded-xl shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setCredViewMode('grid')}
                                        className={`p-1.5 rounded-lg transition-all ${
                                            credViewMode === 'grid'
                                                ? 'bg-white dark:bg-[#1E293B] text-mintcom-green shadow-sm'
                                                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                        title="Card Grid View"
                                    >
                                        <LayoutGrid size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCredViewMode('list')}
                                        className={`p-1.5 rounded-lg transition-all ${
                                            credViewMode === 'list'
                                                ? 'bg-white dark:bg-[#1E293B] text-mintcom-green shadow-sm'
                                                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                        title="Compact List View"
                                    >
                                        <List size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Credentials Content */}
                        {filteredCredentials.length === 0 ? (
                            <div className="p-12 text-center bg-white dark:bg-[#121A2A] rounded-2xl border border-gray-200/80 dark:border-white/[0.08]">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 text-gray-400">
                                    <KeyRound size={22} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {credSearch.trim() ? t('common.noResults', { defaultValue: 'No matching logins found' }) : t('owner.account.noLocationsOrBrands')}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                                    {credSearch.trim() ? 'Try checking your search spelling or switch between location and brand filters.' : t('owner.account.noLocationsOrBrandsHint')}
                                </p>
                            </div>
                        ) : credViewMode === 'grid' ? (
                            /* GRID CARDS VIEW */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredCredentials
                                    .slice((credPage - 1) * itemsPerPage, credPage * itemsPerPage)
                                    .map((item) => {
                                        const ItemIcon = item.icon;
                                        const isBrand = item.kind === 'brand';
                                        return (
                                            <div
                                                key={item.key}
                                                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#121A2A] border border-gray-200/80 dark:border-white/[0.08] hover:border-mintcom-green/40 hover:shadow-md hover:shadow-mintcom-green/5 transition-all"
                                            >
                                                {/* Top Row: Identity & Status */}
                                                <div>
                                                    <div className="flex items-start justify-between gap-2.5">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                                isBrand
                                                                    ? 'bg-blue-500/10 text-blue-500'
                                                                    : 'bg-mintcom-green/10 text-mintcom-green'
                                                            }`}>
                                                                <ItemIcon size={18} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={item.name}>
                                                                    {item.name}
                                                                </h3>
                                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                                    {item.meta}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            item.isActive
                                                                ? isBrand
                                                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                                : 'bg-gray-100 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/10'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? (isBrand ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-gray-400'}`} />
                                                            {item.statusLabel}
                                                        </span>
                                                    </div>

                                                    {/* Login ID Copy Capsule */}
                                                    <div className="mt-3.5 flex items-center justify-between gap-2 p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 shrink-0">
                                                                ID:
                                                            </span>
                                                            <code className="text-xs font-mono font-bold text-gray-900 dark:text-white truncate select-all">
                                                                {item.loginId || t('common.na')}
                                                            </code>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(item.loginId, item.copyKey)}
                                                            disabled={!item.loginId}
                                                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-[#1E293B] hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/10 text-[11px] font-bold text-gray-700 dark:text-gray-200 transition-all shrink-0 shadow-sm disabled:opacity-40"
                                                        >
                                                            {copiedId === item.copyKey ? (
                                                                <>
                                                                    <CheckCircle2 size={12} className="text-mintcom-green" />
                                                                    <span className="text-mintcom-green text-[10px]">{t('common.copied')}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy size={12} className="text-gray-400" />
                                                                    <span className="text-[10px]">{t('common.copy')}</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Bottom Actions Row */}
                                                <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={item.onReset}
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Lock size={12} />
                                                        <span>{t('owner.account.resetPassword')}</span>
                                                    </button>

                                                    {item.onOpen && (
                                                        <button
                                                            type="button"
                                                            onClick={item.onOpen}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                                                isBrand
                                                                    ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                                    : 'bg-mintcom-green/10 hover:bg-mintcom-green/20 text-mintcom-green'
                                                            }`}
                                                        >
                                                            <span>{isBrand ? 'Brand' : 'POS'}</span>
                                                            <ExternalLink size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        ) : (
                            /* COMPACT LIST VIEW */
                            <div className="bg-white dark:bg-[#121A2A] rounded-2xl border border-gray-200/80 dark:border-white/[0.08] shadow-sm overflow-hidden">
                                <div className="divide-y divide-gray-100 dark:divide-white/5">
                                    {filteredCredentials
                                        .slice((credPage - 1) * itemsPerPage, credPage * itemsPerPage)
                                        .map((item) => {
                                            const ItemIcon = item.icon;
                                            const isBrand = item.kind === 'brand';
                                            return (
                                                <div
                                                    key={item.key}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                            isBrand
                                                                ? 'bg-blue-500/10 text-blue-500'
                                                                : 'bg-mintcom-green/10 text-mintcom-green'
                                                        }`}>
                                                            <ItemIcon size={18} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                                    {item.name}
                                                                </h4>
                                                                <span className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                                                                    item.isActive
                                                                        ? isBrand
                                                                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                                                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/10'
                                                                }`}>
                                                                    {item.statusLabel}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                                                {item.meta}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/5">
                                                            <code className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                                                                {item.loginId || t('common.na')}
                                                            </code>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(item.loginId, item.copyKey)}
                                                                className="p-1 rounded text-gray-400 hover:text-mintcom-green transition-colors"
                                                            >
                                                                {copiedId === item.copyKey ? (
                                                                    <CheckCircle2 size={13} className="text-mintcom-green" />
                                                                ) : (
                                                                    <Copy size={13} />
                                                                )}
                                                            </button>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={item.onReset}
                                                            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                            title={t('owner.account.resetPassword')}
                                                        >
                                                            <Lock size={15} />
                                                        </button>

                                                        {item.onOpen && (
                                                            <button
                                                                type="button"
                                                                onClick={item.onOpen}
                                                                className={`p-2 rounded-xl transition-all ${
                                                                    isBrand
                                                                        ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                                        : 'bg-mintcom-green/10 hover:bg-mintcom-green/20 text-mintcom-green'
                                                                }`}
                                                                title="Open Dashboard"
                                                            >
                                                                <ExternalLink size={15} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        )}

                        {/* Pagination Footer */}
                        {filteredCredentials.length > itemsPerPage && (
                            <div className="p-4 bg-white dark:bg-[#121A2A] rounded-2xl border border-gray-200/80 dark:border-white/[0.08] shadow-sm">
                                <Pagination
                                    currentPage={credPage}
                                    totalPages={Math.max(1, Math.ceil(filteredCredentials.length / itemsPerPage))}
                                    onPageChange={setCredPage}
                                    variant="footer"
                                    totalItems={filteredCredentials.length}
                                    itemsPerPage={itemsPerPage}
                                />
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB 2: Profile & System Currency */}
                {activeTab === 'profile' && (
                    <motion.div
                        key="tab-profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Profile Edit Card */}
                        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121A2A] border border-gray-200/80 dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-white/[0.06]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-mintcom-green/10 flex items-center justify-center text-mintcom-green">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                                {t('owner.account.ownerAccountTitle')}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {t('owner.account.subtitle')}
                                            </p>
                                        </div>
                                    </div>

                                    {!isEditing && (
                                        <button
                                            type="button"
                                            onClick={handleEditClick}
                                            className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-xs font-bold text-gray-700 dark:text-gray-200 transition-all"
                                        >
                                            {t('owner.account.editProfile')}
                                        </button>
                                    )}
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1.5">
                                                {t('owner.account.firstName')}
                                            </label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                maxLength={MAX_OWNER_PROFILE_NAME_LENGTH}
                                                value={isEditing ? editForm.firstName : (accountDetails?.firstName || '')}
                                                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                                className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-[#0B111E] border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mintcom-green/30 disabled:opacity-75 disabled:cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1.5">
                                                {t('owner.account.lastName')}
                                            </label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                maxLength={MAX_OWNER_PROFILE_NAME_LENGTH}
                                                value={isEditing ? editForm.lastName : (accountDetails?.lastName || '')}
                                                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                                className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-[#0B111E] border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mintcom-green/30 disabled:opacity-75 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1.5">
                                            {t('owner.account.email')}
                                        </label>
                                        <input
                                            type="email"
                                            disabled={!isEditing}
                                            maxLength={MAX_OWNER_PROFILE_EMAIL_LENGTH}
                                            value={isEditing ? editForm.email : (accountDetails?.email || '')}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-[#0B111E] border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mintcom-green/30 disabled:opacity-75 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-8 pt-5 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-xs font-bold text-gray-700 dark:text-gray-300 transition-all"
                                    >
                                        {t('owner.account.cancel')}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-mintcom-green hover:bg-[#5fa888] text-black text-xs font-black transition-all shadow-md shadow-mintcom-green/20 disabled:opacity-70"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                <span>{t('owner.account.saving')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check size={14} />
                                                <span>{t('owner.account.save')}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* System Default Currency Card */}
                        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121A2A] border border-gray-200/80 dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <Landmark size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                            {t('owner.account.systemCurrency')}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t('owner.account.systemCurrencySubtitle')}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {t('owner.account.systemCurrencyDesc', { defaultValue: 'This sets the primary ISO currency for reports, pos sales, and receipts across your locations.' })}
                                    </p>

                                    <div className="relative">
                                        <select
                                            value={globalCurrency}
                                            onChange={(e) => {
                                                const next = e.target.value;
                                                if (next !== globalCurrency) setPendingCurrency(next);
                                            }}
                                            disabled={isUpdatingCurrency}
                                            className="w-full h-12 bg-gray-50 dark:bg-[#0B111E] border border-gray-200 dark:border-white/10 rounded-xl px-4 font-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all appearance-none cursor-pointer disabled:opacity-50"
                                        >
                                            {CURRENCIES.filter((c) => c.code !== 'ALL').map((c) => (
                                                <option key={c.code} value={c.code} className="bg-white dark:bg-gray-800">
                                                    {c.code} — {c.name || c.code}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <SlidersHorizontal size={16} />
                                        </div>
                                    </div>

                                    {isUpdatingCurrency && (
                                        <p className="text-xs font-bold text-amber-500 animate-pulse text-center">
                                            {t('owner.account.applyingCurrencyChanges')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-white/[0.06] text-[11px] text-gray-400 flex items-center gap-1.5">
                                <Globe size={13} className="text-amber-500 shrink-0" />
                                <span>Active system-wide across all connected POS terminals.</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB 3: Security & Danger Zone */}
                {activeTab === 'security' && (
                    <motion.div
                        key="tab-security"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Security Recommendations */}
                        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121A2A] border border-gray-200/80 dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                            {t('owner.account.securityTips.title')}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t('owner.account.securityTips.subtitle')}
                                        </p>
                                    </div>
                                </div>

                                <ul className="mt-6 space-y-3.5 text-xs text-gray-600 dark:text-gray-300">
                                    {[
                                        t('owner.account.securityTips.uniquePasswords'),
                                        t('owner.account.securityTips.updatePeriodically'),
                                        t('owner.account.securityTips.neverShareOtp'),
                                        t('owner.account.securityTips.enable2fa', { defaultValue: 'Enable two-factor authentication when available' }),
                                    ].map((tip) => (
                                        <li key={tip} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                                            <CheckCircle2 size={16} className="text-mintcom-green shrink-0 mt-0.5" />
                                            <span className="font-medium leading-relaxed">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 pt-5 border-t border-gray-100 dark:border-white/[0.06]">
                                <button
                                    type="button"
                                    onClick={() => openPasswordModal('account')}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black text-xs font-black hover:opacity-90 transition-opacity shadow-sm"
                                >
                                    <Key size={14} />
                                    <span>{t('owner.account.resetPassword')}</span>
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm flex flex-col justify-between ${
                            accountDetails?.deletionRequestedAt
                                ? 'bg-mintcom-green/5 dark:bg-mintcom-green/10 border-mintcom-green/30'
                                : 'bg-red-50/50 dark:bg-[#1A1215] border-red-500/20 dark:border-red-500/25'
                        }`}>
                            <div>
                                <div className="flex items-center gap-3 pb-5 border-b border-red-100 dark:border-red-500/20">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        accountDetails?.deletionRequestedAt ? 'bg-mintcom-green/20 text-mintcom-green' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                        <ShieldAlert size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                            {accountDetails?.deletionRequestedAt ? t('owner.account.restoreAccount') : t('owner.account.dangerZone')}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {accountDetails?.deletionRequestedAt ? t('owner.account.deletionScheduledHint') : t('owner.account.dangerZoneHint')}
                                        </p>
                                    </div>
                                </div>

                                {!accountDetails?.deletionRequestedAt && (
                                    <div className="mt-6 space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                                        {[
                                            t('owner.account.dangerZoneBullet1', { defaultValue: 'All locations and brands will be scheduled for removal' }),
                                            t('owner.account.dangerZoneBullet2', { defaultValue: 'Staff access and Login IDs stop working immediately' }),
                                            t('owner.account.dangerZoneBullet3', { defaultValue: 'You can cancel during the grace period if offered' }),
                                        ].map((bullet) => (
                                            <div key={bullet} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-red-200/50 dark:border-red-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                                                <span className="font-medium leading-relaxed">{bullet}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-5 border-t border-red-100 dark:border-red-500/20">
                                {accountDetails?.deletionRequestedAt ? (
                                    <button
                                        type="button"
                                        onClick={handleRestoreAccount}
                                        className="w-full py-3.5 px-4 rounded-xl bg-mintcom-green hover:bg-[#5fa888] text-black text-xs font-black transition-all shadow-md shadow-mintcom-green/20"
                                    >
                                        {t('owner.account.restoreMyAccount')}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleDeleteClick}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all shadow-md shadow-red-600/20"
                                    >
                                        <Trash2 size={16} />
                                        <span>{t('owner.account.deleteAccount')}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB 4: Resources & Legal */}
                {activeTab === 'resources' && (
                    <motion.div
                        key="tab-resources"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Documentation Guides */}
                        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121A2A] border border-gray-200/80 dark:border-white/[0.08] shadow-sm">
                            <div className="flex items-center gap-3 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Library size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                        {t('owner.account.resources.title')}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('owner.account.resources.subtitle')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <a
                                    href={userManualDoc.path}
                                    download={userManualDoc.filename}
                                    className="group flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-500/10 dark:to-transparent border border-blue-100 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 transition-all hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                                                <BookOpen size={18} />
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                                <Download size={13} />
                                                PDF
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-4">
                                            {t('owner.account.resources.userManual.title')}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                            {t('owner.account.resources.userManual.desc')}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                                        <span>Download</span>
                                        <ChevronRight size={14} />
                                    </div>
                                </a>

                                <a
                                    href={setupManualDoc.path}
                                    download={setupManualDoc.filename}
                                    className="group flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-500/10 dark:to-transparent border border-amber-100 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/40 transition-all hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                                                <Settings size={18} />
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                                <Download size={13} />
                                                PDF
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-4">
                                            {t('owner.account.resources.setupManual.title')}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                            {t('owner.account.resources.setupManual.desc')}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                                        <span>Download</span>
                                        <ChevronRight size={14} />
                                    </div>
                                </a>

                                {hasOnboardingVideo ? (
                                    <a
                                        href={ONBOARDING_VIDEO_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-red-50/80 to-white dark:from-red-500/10 dark:to-transparent border border-red-100 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/40 transition-all hover:shadow-md"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/25">
                                                    <PlayCircle size={18} />
                                                </div>
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                                                    <ExternalLink size={13} />
                                                    Video
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-4">
                                                {t('owner.account.resources.videoTutorial.title')}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                {t('owner.account.resources.videoTutorial.desc')}
                                            </p>
                                        </div>
                                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                                            <span>Watch Now</span>
                                            <ChevronRight size={14} />
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex flex-col justify-between p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 opacity-60">
                                        <div>
                                            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 text-gray-400 flex items-center justify-center">
                                                <PlayCircle size={18} />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-4">
                                                {t('owner.account.resources.videoTutorial.title')}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {t('common.comingSoon', { defaultValue: 'Coming soon' })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Company & Legal Directory */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { href: '/qa', icon: HelpCircle, title: t('owner.account.resources.qa.title'), description: t('owner.account.resources.qa.desc') },
                                { href: '/legal/privacy', icon: Shield, title: t('owner.account.resources.privacyPolicy.title'), description: t('owner.account.resources.privacyPolicy.desc') },
                                { href: '/legal/terms', icon: Scale, title: t('owner.account.resources.termsOfUse.title'), description: t('owner.account.resources.termsOfUse.desc') },
                                { href: '/about', icon: Info, title: t('owner.account.resources.aboutUs.title'), description: t('owner.account.resources.aboutUs.desc') },
                            ].map((item) => {
                                const ItemIcon = item.icon;
                                return (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group p-5 rounded-2xl bg-white dark:bg-[#121A2A] border border-gray-200/80 dark:border-white/[0.08] hover:border-mintcom-green/40 hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 flex items-center justify-center group-hover:bg-mintcom-green/10 group-hover:text-mintcom-green transition-colors">
                                            <ItemIcon size={18} />
                                        </div>
                                        <div className="mt-4">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
                                                <span>{item.title}</span>
                                                <ExternalLink size={13} className="text-gray-400 group-hover:text-mintcom-green transition-colors" />
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                {item.description}
                                            </p>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Password Reset Modal */}
            <PasswordResetOtpModal
                isOpen={passwordModal.isOpen}
                onClose={() => setPasswordModal({ ...passwordModal, isOpen: false })}
                onSuccess={() => {
                    fetchAccountData();
                }}
                type={passwordModal.type}
                targetId={passwordModal.targetId}
                targetName={passwordModal.targetName}
            />

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && createPortal(
                <div className="fixed inset-0 z-[9999] popup-surface flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-[#121A2A] rounded-3xl border border-gray-200 dark:border-white/[0.08] p-8 max-w-md w-full shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    {t('owner.account.deleteAccountModal.title')}
                                </h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3].map((step) => (
                                        <div
                                            key={step}
                                            className={`w-2 h-2 rounded-full transition-colors ${deleteStep >= step ? 'bg-red-500' : 'bg-gray-200 dark:bg-white/10'}`}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {deleteStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-gray-900 dark:text-white font-bold mb-1">{t('owner.account.deleteAccountModal.whyLeaving')}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('owner.account.deleteAccountModal.feedbackHint')}</p>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {DELETE_REASON_OPTIONS.map((reason) => (
                                        <button
                                            key={reason.key}
                                            onClick={() => setDeleteReason(reason.value)}
                                            className={`w-full text-start px-4 py-3 rounded-xl border transition-all text-sm font-medium ${deleteReason === reason.value
                                                ? 'bg-mintcom-green/10 border-mintcom-green text-mintcom-green'
                                                : 'bg-gray-50 dark:bg-white/[0.02] border-gray-100 dark:border-white/[0.05] text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                            }`}
                                        >
                                            {t(`owner.account.deleteAccountModal.reasons.${reason.key}`)}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setDeleteStep(2)}
                                    disabled={!deleteReason}
                                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-sm font-black disabled:opacity-50 transition-all"
                                >
                                    {t('common.continue')}
                                </button>
                            </div>
                        )}

                        {deleteStep === 2 && (
                            <div className="space-y-6">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                        {t('owner.account.deleteAccountModal.warning')}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-normal text-gray-700 dark:text-gray-300">
                                        {t('owner.account.deleteAccountModal.confirmDeletePrompt', { keyword: t('common.delete') })}
                                    </label>
                                    <input
                                        maxLength={255}
                                        type="text"
                                        value={deleteConfirmationText}
                                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                        placeholder={t('owner.account.deleteAccountModal.typeDeletePlaceholder', { keyword: t('common.delete') })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-white/[0.1] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteStep(1)}
                                        className="flex-1 py-4 bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-300 rounded-2xl text-sm font-bold"
                                    >
                                        {t('common.back')}
                                    </button>
                                    <button
                                        onClick={() => setDeleteStep(3)}
                                        disabled={deleteConfirmationText.trim().toLocaleLowerCase(i18n.language) !== t('common.delete').toLocaleLowerCase(i18n.language)}
                                        className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-sm font-black disabled:opacity-50 transition-all"
                                    >
                                        {t('common.next')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {deleteStep === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-normal text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Lock size={14} />
                                        {t('owner.account.deleteAccountModal.confirmPassword')}
                                    </label>
                                    <StepUpVerifier
                                        action="delete-account"
                                        onVerified={handleDeleteAccount}
                                        onError={(message) => toast.error(message)}
                                        submitLabel={t('owner.account.deleteAccountModal.confirmFinal')}
                                        disabled={isDeletingAccount}
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => setDeleteStep(2)}
                                        disabled={isDeletingAccount}
                                        className="w-full px-6 py-4 bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-600 dark:text-gray-300 rounded-2xl text-sm font-bold transition-all"
                                    >
                                        {t('common.back')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>,
                document.body
            )}

            {/* Active Establishments Block Modal */}
            <AnimatePresence>
                {showActiveEstBlockModal && createPortal(
                    <div className="fixed inset-0 z-[9999] popup-surface flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#121A2A] rounded-3xl border border-gray-200 dark:border-white/[0.08] p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                                        {t('owner.account.activeEstBlockModal.title')}
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/[0.05] overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.05] bg-gray-100/50 dark:bg-white/[0.02]">
                                        <p className="label-strong">{t('owner.account.activeEstBlockModal.activeLocations')}</p>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                                        {activeBlockingEsts.map((est) => {
                                            const Icon = getBusinessTypeIcon(est.type);
                                            return (
                                                <div key={est.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-white/[0.05] transition-colors">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                        <Icon className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                                                        {est.name}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => navigate('/owner/billing')}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-mintcom-green hover:bg-[#5fa888] text-black rounded-2xl text-sm font-black transition-all shadow-lg shadow-mintcom-green/20"
                                    >
                                        <CreditCard size={18} />
                                        {t('owner.account.activeEstBlockModal.goToBilling')}
                                    </button>
                                    <button
                                        onClick={() => setShowActiveEstBlockModal(false)}
                                        className="w-full px-6 py-4 bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-600 dark:text-gray-300 rounded-2xl text-sm font-bold transition-all"
                                    >
                                        {t('common.close')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>

            {/* Warning before changing the system currency for all locations. */}
            <ChangeCurrencyModal
                isOpen={pendingCurrency !== null}
                onClose={() => setPendingCurrency(null)}
                onConfirm={() => {
                    const next = pendingCurrency;
                    setPendingCurrency(null);
                    if (next) handleUpdateGlobalCurrency(next);
                }}
                fromCurrency={globalCurrency}
                toCurrency={pendingCurrency || ''}
                isSubmitting={isUpdatingCurrency}
            />
        </div>
    );
}
