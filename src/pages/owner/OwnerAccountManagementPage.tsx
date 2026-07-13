import { useCallback, useEffect, useMemo, useState } from 'react';
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
    Users,
    AlertTriangle,
    Lock,
    Zap,
    Trash2,
    AlertCircle,
    X,
    XCircle,
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
} from 'lucide-react';
import api from '../../config/api';
import { ONBOARDING_VIDEO_URL } from '../../config/downloads';
import { CURRENCIES } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { PasswordResetOtpModal } from '../../components/PasswordResetOtpModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { BusyOverlay } from '../../components/BusyOverlay';
import { StatValue } from '../../components/ui/StatValue';
import toast from 'react-hot-toast';
import { getBusinessTypeIcon } from '../../utils/businessTypeIcons';
import { SectionLoader } from '../../components/LoadingState';
import { formatInputPlaceholder } from '../../utils/textCase';
import { getLocalizedManual } from '../../utils/localizedDocs';

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

interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
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

export function OwnerAccountManagementPage() {
    const { t, i18n } = useTranslation();
    const { account, establishments, logout, updateAccount } = useAuth();
    const navigate = useNavigate();
    const hasOnboardingVideo = Boolean(ONBOARDING_VIDEO_URL);
    const userManualDoc = getLocalizedManual('user', i18n.language);
    const setupManualDoc = getLocalizedManual('setup', i18n.language);
    const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
    const [brands, setBrands] = useState<BrandCredential[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRestoring, setIsRestoring] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

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
    const [deletePassword, setDeletePassword] = useState('');

    // Global Currency state
    const [globalCurrency, setGlobalCurrency] = useState('AED');
    const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false);
    // Currency awaiting confirmation (warning popup) before it is applied.
    const [pendingCurrency, setPendingCurrency] = useState<string | null>(null);

    // Access credentials hub (locations + brands) — compact list for large counts
    const [credTab, setCredTab] = useState<'locations' | 'brands'>('locations');
    const [credSearch, setCredSearch] = useState('');

    const handleUpdateGlobalCurrency = async (newCurrency: string) => {
        try {
            setIsUpdatingCurrency(true);
            const response = await api.put('/api/accounts/currency', { currency: newCurrency });
            if (response.data?.success) {
                setGlobalCurrency(newCurrency);
                toast.success(t('owner.account.currencyUpdated', { currency: newCurrency }));
                
                // Update local establishments data
                if (accountDetails?.establishments) {
                    setAccountDetails(prev => prev ? ({
                        ...prev,
                        establishments: prev.establishments!.map(e => ({ ...e, currency: newCurrency }))
                    }) : prev);
                }
            }
        } catch (err: any) {
            console.error('Failed to update currency:', err);
            toast.error(err.response?.data?.message || t('owner.account.currencyUpdateFailed'));
        } finally {
            setIsUpdatingCurrency(false);
        }
    };

    const locationLoginEstablishments = useMemo(() => {
        const profileEstablishments = accountDetails?.establishments || [];
        const contextEstablishments = establishments || [];

        // Prefer profile payload (usually richer), then fill missing fields from context.
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

    const filteredLocationLogins = useMemo(() => {
        const q = credSearch.trim().toLowerCase();
        if (!q) return locationLoginEstablishments;
        return locationLoginEstablishments.filter((est: any) => {
            const slug = String(est.establishmentLoginId || est.loginId || est.locationLoginId || est.id || '').toLowerCase();
            const name = String(est.name || '').toLowerCase();
            const currency = String(est.currency || '').toLowerCase();
            return name.includes(q) || slug.includes(q) || currency.includes(q);
        });
    }, [locationLoginEstablishments, credSearch]);

    const filteredBrandLogins = useMemo(() => {
        const q = credSearch.trim().toLowerCase();
        if (!q) return brandLoginRows;
        return brandLoginRows.filter((brand) => {
            const slug = String(brand.establishmentLoginId || '').toLowerCase();
            const name = String(brand.name || '').toLowerCase();
            return name.includes(q) || slug.includes(q);
        });
    }, [brandLoginRows, credSearch]);

    const hasAccessCredentials = locationLoginEstablishments.length > 0 || brands.length > 0;

    // Prefer the tab that has items; keep user choice when both exist.
    useEffect(() => {
        if (credTab === 'locations' && locationLoginEstablishments.length === 0 && brands.length > 0) {
            setCredTab('brands');
        } else if (credTab === 'brands' && brands.length === 0 && locationLoginEstablishments.length > 0) {
            setCredTab('locations');
        }
    }, [credTab, locationLoginEstablishments.length, brands.length]);

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

            // Backend returns the updated user object directly (check for id)
            if (response.data && response.data.id) {
                const updatedData = response.data;
                const emailChangedButNotVerified = normalizedEditForm.email.toLowerCase() !== updatedData.email.toLowerCase();

                if (emailChangedButNotVerified) {
                    toast.success(t('owner.account.profileUpdatedVerifyEmail'), { duration: 5000 });
                } else {
                    toast.success(t('owner.account.profileUpdated'));
                }

                // Update local state immediately with the fresh data from the response
                setAccountDetails(prev => prev ? ({
                    ...prev,
                    firstName: updatedData.firstName,
                    lastName: updatedData.lastName,
                    email: updatedData.email,
                    emailVerified: updatedData.emailVerified
                }) : null);

                // Update global context for other components
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
            setDeletePassword('');
        }
    }, [showDeleteConfirm]);

    const fetchAccountData = useCallback(async () => {
        try {
            setIsLoading(true);

            // Fetch both profile and employees to get accurate stats
            const [profileRes, employeesRes] = await Promise.all([
                api.get('/api/accounts/profile'),
                api.get('/api/accounts/all-employees').catch(err => {
                    console.error('Failed to fetch employees for admin count:', err);
                    return { data: [] };
                })
            ]);

            const data = profileRes.data;
            const employees = employeesRes.data || [];
            const adminsFromEmployees = employees.filter((e: any) => e.role === 'ADMIN');

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
            
            // Sync adminUsers with the employees list to ensure consistency with the Staff page
            if (adminsFromEmployees.length > 0) {
                setAdminUsers(adminsFromEmployees);
            } else {
                setAdminUsers(data.adminUsers || []);
            }
        } catch (err) {
            console.error('Failed to fetch account data:', err);
            // Use context data as fallback
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
        // Check for active establishments in either accountDetails or establishments from context
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

    const handleDeleteAccount = async () => {
        try {
            setIsDeletingAccount(true);
            // Call the correct endpoint for account deletion
            await api.delete('/api/accounts/me', {
                data: {
                    reason: deleteReason,
                    password: deletePassword
                }
            });

            toast.success(t('owner.account.deletionInitiated'));
            setShowDeleteConfirm(false);

            // Use the logout method from AuthContext to clear session and redirect
            setTimeout(async () => {
                await logout();
            }, 3000);
        } catch (err) {
            console.error('Failed to delete account:', err);
            toast.error(t('owner.account.deletionFailed'));
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handleRestoreAccount = async () => {
        try {
            setIsRestoring(true);
            const response = await api.post('/api/accounts/me/restore');

            if (response.data.success) {
                toast.success(t('owner.account.accountRestored'));
                updateAccount({ deletionRequestedAt: undefined });
                setAccountDetails(prev => prev ? { ...prev, deletionRequestedAt: undefined } : null);
            }
        } catch (err: any) {
            console.error('Failed to restore account:', err);
            toast.error(err.response?.data?.message || t('owner.account.restoreFailed'));
        } finally {
            setIsRestoring(false);
        }
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

    const formatDate = (dateString: string) => {
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
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return t('common.na');
        }
    };



    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-mintcom-green/ border border-mintcom-green/ rounded-lg text-xs font-bold tracking-widest text-mintcom-green">
                        <CheckCircle2 size={12} />
                        {t('common.status.active')}
                    </span>
                );
            case 'TRIAL':
            case 'TRIALING':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold tracking-widest text-blue-500">
                        <Zap size={12} />
                        {t('common.status.trial')}
                    </span>
                );
            case 'PAST_DUE':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-bold tracking-widest text-red-500">
                        <AlertTriangle size={12} />
                        {t('common.status.pastDue')}
                    </span>
                );
            case 'CANCELED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-bold tracking-widest text-red-500">
                        <XCircle size={12} />
                        {t('common.status.canceled')}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-500/10 border border-gray-500/20 rounded-lg text-xs font-bold tracking-widest text-gray-500">
                        {status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : ''}
                    </span>
                );
        }
    };

    const getProfileCompletion = () => {
        if (!accountDetails) return 0;
        let completed = 0;
        const total = 3;

        if (accountDetails.firstName && accountDetails.lastName) completed++;
        if (accountDetails.email) completed++;
        if (accountDetails.emailVerified) completed++;

        return Math.round((completed / total) * 100);
    };

    const openPasswordModal = (
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
    };

    if (isLoading) {
        return <SectionLoader message={t('owner.account.loading')} />;
    }

    const profileCompletion = getProfileCompletion();

    return (
        <div className="space-y-8">
            {/* Full-screen blocker while data loads, so no second action can
                be stacked on an in-flight request. */}
            <BusyOverlay visible={isLoading} />
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mintcom-green to-emerald-600 flex items-center justify-center shadow-lg shadow-mintcom-green/20">
                        <KeyRound className="w-7 h-7 text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {t('owner.account.title')}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2">
                            {t('owner.account.subtitle')}
                        </p>
                    </div>
                </div>

            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
                {/* Locations Card */}
                <div className="group relative bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] p-4 sm:p-5 transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Store className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="dashboard-stat-title mb-1 truncate">
                                {t('owner.account.stats.locations')}
                            </p>
                            <StatValue value={establishments?.length || 0} isInteger={true} className="text-xl" />
                        </div>
                    </div>
                </div>

                {/* Brands Card */}
                <div className="group relative bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] p-4 sm:p-5 transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="dashboard-stat-title mb-1 truncate">
                                {t('owner.account.stats.brands')}
                            </p>
                            <StatValue value={brands.length} isInteger={true} className="text-xl" />
                        </div>
                    </div>
                </div>

                {/* Admin Users Card */}
                <div className="group relative bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.03] p-4 sm:p-5 transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="dashboard-stat-title mb-1 truncate">
                                {t('owner.account.stats.admins')}
                            </p>
                            <StatValue value={adminUsers.length} isInteger={true} className="text-xl" />
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Account Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Account Information Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.05] p-6 shadow-sm transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-mintcom-green/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-mintcom-green/10 flex items-center justify-center">
                                        <User className="w-5 h-5 text-mintcom-green" />
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{t('owner.account.ownerAccountTitle')}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold transition-all"
                                                disabled={isSaving}
                                            >
                                                {t('owner.account.cancel')}
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                className="flex items-center gap-2 px-4 py-2 bg-mintcom-green hover:bg-[#5fa888] text-black rounded-xl text-sm font-bold transition-all disabled:opacity-70"
                                                disabled={isSaving}
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                        {t('owner.account.saving')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={16} />
                                                        {t('owner.account.save')}
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleEditClick}
                                                className="px-4 py-2 bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold transition-all"
                                            >
                                                {t('owner.account.editProfile')}
                                            </button>
                                            <button
                                                onClick={() => openPasswordModal('account')}
                                                className="flex items-center gap-2 px-4 py-2 bg-mintcom-green/10 hover:bg-mintcom-green/20 text-mintcom-green rounded-xl text-sm font-bold transition-all"
                                            >
                                                <Key size={16} />
                                                {t('owner.account.resetPassword')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="label-strong capitalize-none flex items-center gap-2">
                                        <User size={12} />
                                        {t('owner.account.fullName')}
                                    </label>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <input maxLength={MAX_OWNER_PROFILE_NAME_LENGTH}
                                                type="text"
                                                value={editForm.firstName}
                                                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                                placeholder={formatInputPlaceholder(t('owner.account.firstName'), t('common.locale'))}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-white/[0.1] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mintcom-green/50"
                                            />
                                            <input maxLength={MAX_OWNER_PROFILE_NAME_LENGTH}
                                                type="text"
                                                value={editForm.lastName}
                                                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                                placeholder={formatInputPlaceholder(t('owner.account.lastName'), t('common.locale'))}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-white/[0.1] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mintcom-green/50"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {accountDetails?.firstName} {accountDetails?.lastName}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="label-strong capitalize-none flex items-center gap-2">
                                        <Mail size={12} />
                                        {t('owner.account.email')}
                                    </label>
                                    {isEditing ? (
                                        <input maxLength={MAX_OWNER_PROFILE_EMAIL_LENGTH}
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            placeholder={formatInputPlaceholder(t('owner.account.email'), t('common.locale'))}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-white/[0.1] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mintcom-green/50"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {accountDetails?.email}
                                            </p>
                                            {accountDetails?.emailVerified && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-mintcom-green/ border border-mintcom-green/ rounded-md text-xs font-bold tracking-widest text-mintcom-green">
                                                    <Shield size={10} />
                                                    {t('owner.account.verified')}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="label-strong capitalize-none flex items-center gap-2">
                                        <Calendar size={12} />
                                        {t('owner.account.joined')}
                                    </label>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatDate(accountDetails?.createdAt || '')}
                                    </p>
                                </div>
                            </div>

                            {/* Profile Completion Bar */}
                            {profileCompletion < 100 && (
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/[0.05]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="label-strong">{t('owner.account.profileCompletion')}</span>
                                        <span className="text-sm font-bold text-mintcom-green">{profileCompletion}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-mintcom-green to-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${profileCompletion}%` }}
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 mt-2">
                                        {t('owner.account.completeProfileHint')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Access credentials hub — compact, searchable (scales to many locations/brands) */}
                    {hasAccessCredentials && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.05] shadow-sm overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/[0.05]">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 flex items-center justify-center shrink-0">
                                            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                {t('owner.account.accessCredentials', {
                                                    defaultValue: 'Access Credentials',
                                                })}
                                            </h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {t('owner.account.accessCredentialsSubtitle', {
                                                    defaultValue: 'Login IDs for location and brand dashboards — search, copy, open, or reset.',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative w-full sm:w-64 shrink-0">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={credSearch}
                                            onChange={(e) => setCredSearch(e.target.value)}
                                            placeholder={formatInputPlaceholder(
                                                t('owner.account.searchCredentials', {
                                                    defaultValue: 'Search name or login ID…',
                                                }),
                                                t('common.locale'),
                                            )}
                                            className="w-full h-10 pl-9 pr-9 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/20 focus:border-mintcom-green transition-all"
                                        />
                                        {credSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setCredSearch('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                aria-label={t('common.clearSearch', { defaultValue: 'Clear search' })}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="mt-4 flex items-center gap-1 p-1 rounded-xl bg-gray-100/80 dark:bg-white/[0.04] w-full sm:w-fit">
                                    {locationLoginEstablishments.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setCredTab('locations')}
                                            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                                                credTab === 'locations'
                                                    ? 'bg-white dark:bg-[#0F172A] text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            <Store size={14} />
                                            {t('owner.account.locations', { defaultValue: 'Locations' })}
                                            <span
                                                className={`min-w-[1.25rem] h-5 px-1.5 rounded-md text-[10px] font-black flex items-center justify-center ${
                                                    credTab === 'locations'
                                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                        : 'bg-gray-200/80 dark:bg-white/10 text-gray-500'
                                                }`}
                                            >
                                                {locationLoginEstablishments.length}
                                            </span>
                                        </button>
                                    )}
                                    {brands.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setCredTab('brands')}
                                            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                                                credTab === 'brands'
                                                    ? 'bg-white dark:bg-[#0F172A] text-purple-600 dark:text-purple-400 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            <Building2 size={14} />
                                            {t('owner.account.brands', { defaultValue: 'Brands' })}
                                            <span
                                                className={`min-w-[1.25rem] h-5 px-1.5 rounded-md text-[10px] font-black flex items-center justify-center ${
                                                    credTab === 'brands'
                                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                                        : 'bg-gray-200/80 dark:bg-white/10 text-gray-500'
                                                }`}
                                            >
                                                {brands.length}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Compact list */}
                            <div className="max-h-[28rem] overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-white/[0.04]">
                                {credTab === 'locations' && (
                                    filteredLocationLogins.length === 0 ? (
                                        <div className="py-12 px-6 text-center">
                                            <p className="text-sm font-bold text-gray-500">
                                                {credSearch.trim()
                                                    ? t('common.noResults', { defaultValue: 'No results found' })
                                                    : t('owner.account.noLocationsOrBrands')}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredLocationLogins.map((est: any) => {
                                            const slug = (est.establishmentLoginId || est.loginId || est.locationLoginId || est.id || '').trim();
                                            const Icon = getBusinessTypeIcon(est.type);
                                            const copyKey = `est-login-${est.id}`;
                                            return (
                                                <div
                                                    key={est.id}
                                                    className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                                            <Icon className="w-4 h-4 text-blue-500" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={est.name}>
                                                                    {est.name}
                                                                </h3>
                                                                {getStatusBadge(est.subscriptionStatus)}
                                                            </div>
                                                            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[11px] font-medium text-gray-500">
                                                                <span className="uppercase tracking-wide">{est.currency?.toUpperCase() || 'JOD'}</span>
                                                                {est.createdAt && (
                                                                    <>
                                                                        <span className="text-gray-300 dark:text-gray-600">·</span>
                                                                        <span className="inline-flex items-center gap-1">
                                                                            <Calendar size={11} className="opacity-70" />
                                                                            {formatDate(est.createdAt)}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 sm:gap-3 sm:ml-auto min-w-0">
                                                        <div className="flex-1 sm:flex-none min-w-0 flex items-center gap-1.5 rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50/60 dark:bg-blue-500/10 px-2.5 py-1.5 max-w-full sm:max-w-[14rem]">
                                                            <code className="text-xs font-mono font-bold text-gray-900 dark:text-white truncate select-all" title={slug}>
                                                                {slug || t('common.na')}
                                                            </code>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(slug, copyKey)}
                                                                disabled={!slug}
                                                                className="shrink-0 p-1 rounded-md text-blue-500 hover:bg-blue-100/80 dark:hover:bg-blue-500/20 transition-colors disabled:opacity-40"
                                                                title={t('common.copy')}
                                                            >
                                                                {copiedId === copyKey ? (
                                                                    <CheckCircle2 size={14} className="text-mintcom-green" />
                                                                ) : (
                                                                    <Copy size={14} />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => window.open(`/dashboard/${slug}`, '_blank')}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                                                                title={t('owner.brands.viewDashboard')}
                                                            >
                                                                <ExternalLink size={15} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openPasswordModal('establishment', est.id, est.name)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                                                title={t('owner.account.resetPassword')}
                                                            >
                                                                <Lock size={15} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )
                                )}

                                {credTab === 'brands' && (
                                    filteredBrandLogins.length === 0 ? (
                                        <div className="py-12 px-6 text-center">
                                            <p className="text-sm font-bold text-gray-500">
                                                {credSearch.trim()
                                                    ? t('common.noResults', { defaultValue: 'No results found' })
                                                    : t('owner.account.noLocationsOrBrands')}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredBrandLogins.map((brand) => {
                                            const loginId = brand.establishmentLoginId || '';
                                            const copyKey = `brand-${brand.id}`;
                                            return (
                                                <div
                                                    key={brand.id}
                                                    className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                                            <Building2 className="w-4 h-4 text-purple-500" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={brand.name}>
                                                                    {brand.name}
                                                                </h3>
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                                                    brand.isActive
                                                                        ? 'bg-mintcom-green/10 text-mintcom-green border-mintcom-green/20'
                                                                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/10'
                                                                }`}>
                                                                    {brand.isActive ? t('common.status.active') : t('common.status.inactive')}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[11px] font-medium text-gray-500">
                                                                <span>{t('owner.account.locationsCount', { count: brand.locationCount })}</span>
                                                                {brand.createdAt && (
                                                                    <>
                                                                        <span className="text-gray-300 dark:text-gray-600">·</span>
                                                                        <span className="inline-flex items-center gap-1">
                                                                            <Calendar size={11} className="opacity-70" />
                                                                            {formatDate(brand.createdAt)}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 sm:gap-3 sm:ml-auto min-w-0">
                                                        <div className="flex-1 sm:flex-none min-w-0 flex items-center gap-1.5 rounded-xl border border-purple-100 dark:border-purple-500/20 bg-purple-50/60 dark:bg-purple-500/10 px-2.5 py-1.5 max-w-full sm:max-w-[14rem]">
                                                            <code className="text-xs font-mono font-bold text-gray-900 dark:text-white truncate select-all" title={loginId}>
                                                                {loginId || t('common.na')}
                                                            </code>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(loginId, copyKey)}
                                                                disabled={!loginId}
                                                                className="shrink-0 p-1 rounded-md text-purple-500 hover:bg-purple-100/80 dark:hover:bg-purple-500/20 transition-colors disabled:opacity-40"
                                                                title={t('common.copy')}
                                                            >
                                                                {copiedId === copyKey ? (
                                                                    <CheckCircle2 size={14} className="text-mintcom-green" />
                                                                ) : (
                                                                    <Copy size={14} />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => openPasswordModal('brand', brand.id, brand.name)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                                                title={t('owner.account.resetPassword')}
                                                            >
                                                                <Lock size={15} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )
                                )}
                            </div>

                            {/* Footer hint — one line instead of per-card */}
                            <div className="px-5 py-3 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]">
                                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {credTab === 'locations'
                                        ? t('owner.account.locationLoginHint', {
                                            defaultValue: 'Use this ID to sign in to this location dashboard.',
                                        })
                                        : t('owner.account.brandLoginHint', {
                                            defaultValue: 'Use this ID to sign in to the brand dashboard.',
                                        })}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Security & Info */}
                <div className="space-y-6">

                    {/* Global System Currency */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="relative bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.05] p-6 shadow-sm transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Landmark className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{t('owner.account.systemCurrency')}</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('owner.account.systemCurrencySubtitle')}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="relative">
                                    <select
                                        value={globalCurrency}
                                        onChange={(e) => {
                                            const next = e.target.value;
                                            if (next !== globalCurrency) setPendingCurrency(next);
                                        }}
                                        disabled={isUpdatingCurrency}
                                        className="w-full h-12 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/[0.08] rounded-xl px-4 font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer disabled:opacity-50"
                                    >
                                        {CURRENCIES.map((c) => (
                                            <option key={c.code} value={c.code} className="bg-white dark:bg-gray-800">
                                                {c.code} ({c.symbol})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {isUpdatingCurrency && (
                                    <p className="text-xs font-bold text-amber-500 animate-pulse text-center">
                                        {t('owner.account.applyingCurrencyChanges')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Resources & Help — bento-style guides + compact company links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.05] shadow-sm overflow-hidden"
                    >
                        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
                        <div className="relative z-10 p-5 sm:p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 flex items-center justify-center border border-blue-500/10">
                                    <Library className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                                        {t('owner.account.resources.title')}
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('owner.account.resources.subtitle')}
                                    </p>
                                </div>
                            </div>

                            {/* Guides — 2-column tiles */}
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 px-0.5">
                                {t('owner.account.resources.guides', { defaultValue: 'Guides' })}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                                <a
                                    href={userManualDoc.path}
                                    download={userManualDoc.filename}
                                    className="group relative flex flex-col gap-3 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-500/15 bg-gradient-to-br from-blue-50/90 to-white dark:from-blue-500/10 dark:to-white/[0.02] hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/5 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm shadow-blue-500/25">
                                            <BookOpen size={16} />
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <Download size={12} />
                                            PDF
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                            {t('owner.account.resources.userManual.title')}
                                        </h4>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug line-clamp-2">
                                            {t('owner.account.resources.userManual.desc')}
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href={setupManualDoc.path}
                                    download={setupManualDoc.filename}
                                    className="group relative flex flex-col gap-3 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-500/15 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-500/10 dark:to-white/[0.02] hover:border-amber-300 dark:hover:border-amber-500/30 hover:shadow-md hover:shadow-amber-500/5 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/25">
                                            <Settings size={16} />
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <Download size={12} />
                                            PDF
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                            {t('owner.account.resources.setupManual.title')}
                                        </h4>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug line-clamp-2">
                                            {t('owner.account.resources.setupManual.desc')}
                                        </p>
                                    </div>
                                </a>

                                {hasOnboardingVideo ? (
                                    <a
                                        href={ONBOARDING_VIDEO_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative sm:col-span-2 flex items-center gap-3 p-3.5 rounded-2xl border border-red-100 dark:border-red-500/15 bg-gradient-to-r from-red-50/90 via-white to-white dark:from-red-500/10 dark:via-white/[0.02] dark:to-transparent hover:border-red-300 dark:hover:border-red-500/30 hover:shadow-md hover:shadow-red-500/5 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-sm shadow-red-500/25 shrink-0">
                                            <PlayCircle size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                {t('owner.account.resources.videoTutorial.title')}
                                            </h4>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                                {t('owner.account.resources.videoTutorial.desc')}
                                            </p>
                                        </div>
                                        <ExternalLink size={15} className="text-red-400 shrink-0 opacity-70 group-hover:opacity-100" />
                                    </a>
                                ) : (
                                    <div
                                        aria-label={t('owner.account.videoGuideComingSoon')}
                                        className="sm:col-span-2 flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.03] opacity-60"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 text-gray-500 flex items-center justify-center shrink-0">
                                            <PlayCircle size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                {t('owner.account.resources.videoTutorial.title')}
                                            </h4>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                {t('common.comingSoon', { defaultValue: 'Coming soon' })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Company / legal — compact chips */}
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 px-0.5">
                                {t('owner.account.resources.company', { defaultValue: 'Company & legal' })}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    {
                                        href: '/qa',
                                        icon: HelpCircle,
                                        title: t('owner.account.resources.qa.title'),
                                        tone: 'text-purple-500 bg-purple-500/10 border-purple-500/10 hover:border-purple-400/40',
                                    },
                                    {
                                        href: '/legal/privacy',
                                        icon: Shield,
                                        title: t('owner.account.resources.privacyPolicy.title'),
                                        tone: 'text-mintcom-green bg-mintcom-green/10 border-mintcom-green/10 hover:border-mintcom-green/40',
                                    },
                                    {
                                        href: '/legal/terms',
                                        icon: Scale,
                                        title: t('owner.account.resources.termsOfUse.title'),
                                        tone: 'text-blue-500 bg-blue-500/10 border-blue-500/10 hover:border-blue-400/40',
                                    },
                                    {
                                        href: '/about',
                                        icon: Info,
                                        title: t('owner.account.resources.aboutUs.title'),
                                        tone: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-400/40',
                                    },
                                ].map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`group flex items-center gap-2.5 p-2.5 rounded-xl border bg-white dark:bg-white/[0.02] transition-all hover:shadow-sm ${item.tone}`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center shrink-0 shadow-sm border border-black/[0.03] dark:border-white/5">
                                            <item.icon size={15} className="shrink-0" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate flex-1">
                                            {item.title}
                                        </span>
                                        <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>




                    {/* Quick Tips */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="relative bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.05] p-6 shadow-sm transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-mintcom-green/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-mintcom-green/20 flex items-center justify-center">
                                    <Info className="w-5 h-5 text-mintcom-green" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{t('owner.account.securityTips.title')}</h2>
                            </div>

                            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-mintcom-green mt-0.5 shrink-0" />
                                    <span>{t('owner.account.securityTips.uniquePasswords')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-mintcom-green mt-0.5 shrink-0" />
                                    <span>{t('owner.account.securityTips.updatePeriodically')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-mintcom-green mt-0.5 shrink-0" />
                                    <span>{t('owner.account.securityTips.neverShareOtp')}</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Danger Zone / Restoration Zone */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`relative bg-white dark:bg-[#1E293B] rounded-2xl border p-6 shadow-sm transition-all duration-300 overflow-hidden ${accountDetails?.deletionRequestedAt ? 'border-mintcom-green/20' : 'border-red-500/20'}`}
                    >
                        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${accountDetails?.deletionRequestedAt ? 'bg-mintcom-green/10' : 'bg-red-500/10'}`} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl ${accountDetails?.deletionRequestedAt ? 'bg-mintcom-green/10' : 'bg-red-500/10'} flex items-center justify-center`}>
                                    {accountDetails?.deletionRequestedAt ? (
                                        <div className="w-5 h-5 border-2 border-mintcom-green/30 border-t-mintcom-green rounded-full" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    {accountDetails?.deletionRequestedAt ? t('owner.account.restoreAccount') : t('owner.account.dangerZone')}
                                </h2>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                {accountDetails?.deletionRequestedAt
                                    ? t('owner.account.deletionScheduledHint')
                                    : t('owner.account.dangerZoneHint')}
                            </p>

                            {accountDetails?.deletionRequestedAt ? (
                                <button
                                    onClick={handleRestoreAccount}
                                    disabled={isRestoring}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-mintcom-green hover:bg-[#5fa888] text-black rounded-xl text-sm font-black transition-all shadow-lg shadow-mintcom-green/20 disabled:opacity-70"
                                >
                                    {isRestoring ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                            {t('common.restoring')}
                                        </>
                                    ) : (
                                        <>
                                            {t('owner.account.restoreMyAccount')}
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleDeleteClick}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20"
                                >
                                    <Trash2 size={18} />
                                    {t('owner.account.deleteAccount')}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Empty State */}
            {(!establishments || establishments.length === 0) && brands.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/[0.05] p-12 shadow-sm text-center"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                        <Store className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                        {t('owner.account.noLocationsOrBrands')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                        {t('owner.account.noLocationsOrBrandsHint')}
                    </p>
                </motion.div>
            )}

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
                        className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-200 dark:border-white/[0.05] p-8 max-w-md w-full shadow-2xl"
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
                                            className={`w-2 h-2 rounded-full transition-colors ${deleteStep >= step ? 'bg-red-500' : 'bg-gray-200 dark:bg-white/10'
                                                }`}
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
                                    <input maxLength={255}
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
                                    <input maxLength={255}
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder={formatInputPlaceholder(t('owner.account.deleteAccountModal.passwordPlaceholder'), t('common.locale'))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-white/[0.1] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={!deletePassword || isDeletingAccount}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-red-500/20"
                                    >
                                        {isDeletingAccount ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                {t('owner.account.deleteAccountModal.deleting')}
                                            </>
                                        ) : (
                                            t('owner.account.deleteAccountModal.confirmFinal')
                                        )}
                                    </button>
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
                            className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-200 dark:border-white/[0.05] p-8 max-w-md w-full shadow-2xl"
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
                                            )
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
            <ConfirmModal
                isOpen={pendingCurrency !== null}
                onClose={() => setPendingCurrency(null)}
                onConfirm={() => {
                    if (pendingCurrency) handleUpdateGlobalCurrency(pendingCurrency);
                    setPendingCurrency(null);
                }}
                title={t('settings.confirm.changeCurrencyTitle')}
                message={t('settings.confirm.changeCurrencyMessage', { from: globalCurrency, to: pendingCurrency || '' })}
                type="warning"
                confirmText={t('common.continue', { defaultValue: 'Continue' })}
                cancelText={t('common.cancel')}
            />
        </div>
    );
}
