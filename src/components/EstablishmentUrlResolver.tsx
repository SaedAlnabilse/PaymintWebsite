import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingFallback } from './LoadingFallback';
import {
    ACCOUNT_RECOVERY_PATH,
    buildLocationDeletionRecoveryPath,
    hasPendingAccountDeletion,
    isManualEstablishmentDeletionPending,
} from '../utils/deletionRecovery';

const LOCKED_SUBSCRIPTION_STATUSES = new Set([
    'CANCELED',
    'SUSPENDED',
    'TRIAL_EXPIRED',
]);

export function EstablishmentUrlResolver({ children }: { children: React.ReactNode }) {
    const {
        establishments,
        currentEstablishment,
        setCurrentEstablishment,
        isLoading: authLoading,
        isAuthenticated,
        needsOnboarding,
        account
    } = useAuth();

    const { locationSlug } = useParams<{ locationSlug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const accountDeletionPending = hasPendingAccountDeletion(account);
    const manualDeletionPending = isManualEstablishmentDeletionPending(currentEstablishment);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            navigate('/login', { replace: true, state: { from: location } });
            return;
        }

        if (accountDeletionPending) {
            navigate(ACCOUNT_RECOVERY_PATH, { replace: true });
            return;
        }

        if (needsOnboarding) {
            navigate('/onboarding', { replace: true });
            return;
        }

        if (!locationSlug) {
            navigate('/select-establishment', { replace: true });
            return;
        }

        const isCurrentMatch = currentEstablishment && (
            currentEstablishment.establishmentLoginId === locationSlug ||
            currentEstablishment.id === locationSlug
        );

        if (isCurrentMatch) {
            const persistedEstablishment = sessionStorage.getItem('currentEstablishment');
            let persistedEstablishmentId: string | null = null;

            if (persistedEstablishment) {
                try {
                    persistedEstablishmentId = JSON.parse(persistedEstablishment)?.id ?? null;
                } catch {
                    persistedEstablishmentId = null;
                }
            }

            if (!persistedEstablishmentId || persistedEstablishmentId !== currentEstablishment.id) {
                setCurrentEstablishment(currentEstablishment);
            }

            if (isManualEstablishmentDeletionPending(currentEstablishment)) {
                const recoveryPath = buildLocationDeletionRecoveryPath(locationSlug);
                if (`${location.pathname}${location.search}` !== recoveryPath) {
                    navigate(recoveryPath, { replace: true });
                }
                return;
            }

            // Force redirect to slug if we are on ID
            if (currentEstablishment && 
                currentEstablishment.establishmentLoginId && 
                locationSlug === currentEstablishment.id && 
                locationSlug !== currentEstablishment.establishmentLoginId) {
                
                const newPath = location.pathname.replace(
                    `/dashboard/${locationSlug}`, 
                    `/dashboard/${currentEstablishment.establishmentLoginId}`
                );
                navigate(newPath, { replace: true });
            }
            return;
        }

        const targetEst = establishments.find(e =>
            e.establishmentLoginId === locationSlug ||
            e.id === locationSlug
        );

        if (targetEst) {
            setCurrentEstablishment(targetEst);
        } else {
            navigate('/select-establishment', { replace: true });
        }

    }, [
        authLoading,
        isAuthenticated,
        needsOnboarding,
        locationSlug,
        establishments,
        currentEstablishment,
        navigate,
        setCurrentEstablishment,
        location,
        accountDeletionPending,
    ]);

    if (authLoading) {
        return <LoadingFallback message="Validating location..." />;
    }

    if (accountDeletionPending) {
        return <Navigate to={ACCOUNT_RECOVERY_PATH} replace />;
    }

    if (!currentEstablishment || (
        currentEstablishment.id !== locationSlug &&
        currentEstablishment.establishmentLoginId !== locationSlug
    )) {
        return <LoadingFallback message="Switching location..." />;
    }

    if (manualDeletionPending) {
        const recoveryPath = buildLocationDeletionRecoveryPath(
            locationSlug || currentEstablishment.id,
        );
        if (`${location.pathname}${location.search}` !== recoveryPath) {
            return <Navigate to={recoveryPath} replace />;
        }
    } else if (LOCKED_SUBSCRIPTION_STATUSES.has(currentEstablishment.subscriptionStatus)) {
        // Only the owner can manage billing. Secondary admins/employees can't
        // reach the owner portal, so send them a clear message instead of
        // redirecting into an owner-only page (which would bounce in a loop).
        if (account?.isSecondaryAdmin) {
            return (
                <LoadingFallback message="This location's subscription is inactive. Please ask the account owner to reactivate it." />
            );
        }
        const isOwnerBillingPage = location.pathname.startsWith('/owner/billing');
        if (!isOwnerBillingPage) {
            return <Navigate to="/owner/billing" replace />;
        }
    }

    return <>{children}</>;
}
