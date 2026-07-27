import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  claimSetupGuide,
  getSetupGuideState,
  replaySetupGuide,
  reportSetupGuideProgress,
  type SetupGuideOutcome,
} from '../services/setupGuideApi';

type SetupGuideStateStatus = 'idle' | 'loading' | 'ready' | 'error';

type UseSetupGuideFirstRunOptions = {
  /**
   * Claims the first-run grant only when the overview is actually renderable.
   * The layout still performs the read-only state request while this is false so
   * Help visibility remains server-driven.
  */
  offerFirstRun?: boolean;
  /** Route/scope that must still be active when an async replay resolves. */
  replayScopeKey?: string | null;
};

export function useSetupGuideFirstRun(
  establishmentId?: string | null,
  {
    offerFirstRun = true,
    replayScopeKey = null,
  }: UseSetupGuideFirstRunOptions = {},
) {
  const [isOpen, setIsOpen] = useState(false);
  const [canReplay, setCanReplay] = useState(false);
  const [stateStatus, setStateStatus] = useState<SetupGuideStateStatus>('idle');
  const claimGuardRef = useRef<string | null>(null);
  const activeEstablishmentRef = useRef(establishmentId);
  const activeReplayScopeRef = useRef(replayScopeKey);
  const presentationGenerationRef = useRef(0);
  const presentationOwnerRef = useRef<symbol | null>(null);

  const invalidatePresentation = useCallback(() => {
    presentationGenerationRef.current += 1;
    presentationOwnerRef.current = null;
    setIsOpen(false);
  }, []);

  const presentIfCurrentOwner = useCallback(
    (generation: number, requestOwner: symbol) => {
      if (
        presentationGenerationRef.current !== generation ||
        presentationOwnerRef.current !== null
      ) {
        return false;
      }

      presentationOwnerRef.current = requestOwner;
      setIsOpen(true);
      return true;
    },
    [],
  );

  useLayoutEffect(() => {
    activeReplayScopeRef.current = replayScopeKey;
  }, [replayScopeKey]);

  useEffect(() => {
    activeEstablishmentRef.current = establishmentId;
    invalidatePresentation();
    setCanReplay(false);
    setStateStatus(establishmentId ? 'loading' : 'idle');
  }, [establishmentId, invalidatePresentation]);

  useEffect(() => {
    // The overview owns the modal. Navigating away dismisses the granted
    // presentation in this tab; the server row prevents it from being offered
    // again when the user returns. A replay started from another dashboard
    // route can still open it because `offerFirstRun` has not changed there.
    if (!offerFirstRun) invalidatePresentation();
  }, [invalidatePresentation, offerFirstRun]);

  useEffect(() => {
    if (!establishmentId) return;

    const shouldAttemptClaim = offerFirstRun;

    if (shouldAttemptClaim && claimGuardRef.current === establishmentId) {
      return;
    }
    if (shouldAttemptClaim) {
      claimGuardRef.current = establishmentId;
    }

    let cancelled = false;
    const claimPresentationGeneration = presentationGenerationRef.current;
    const claimPresentationOwner = Symbol('setup-guide-claim');

    const loadStateAndClaim = async () => {
      let state: Awaited<ReturnType<typeof getSetupGuideState>>;
      try {
        state = await getSetupGuideState(establishmentId);
      } catch {
        if (!cancelled && activeEstablishmentRef.current === establishmentId) {
          // Fail closed: an unavailable server never becomes permission to render.
          setCanReplay(false);
          setStateStatus('error');
        }
        return;
      }

      if (cancelled || activeEstablishmentRef.current !== establishmentId) return;

      setCanReplay(state.canReplay);
      setStateStatus('ready');

      if (!shouldAttemptClaim || !state.shouldOffer) return;

      try {
        // Always let the atomic claim finish once started so the server can
        // persist the first-run grant even if another presentation wins locally.
        const result = await claimSetupGuide(establishmentId);
        if (cancelled || activeEstablishmentRef.current !== establishmentId) {
          return;
        }
        if (!result.granted && result.reason === 'NOT_ELIGIBLE') {
          setCanReplay(false);
        }
        if (result.granted) {
          presentIfCurrentOwner(
            claimPresentationGeneration,
            claimPresentationOwner,
          );
        }
      } catch {
        // State already established replay eligibility. A failed claim keeps
        // that trusted state while the automatic popup itself fails closed.
      }
    };

    void loadStateAndClaim();

    return () => {
      cancelled = true;
      if (claimGuardRef.current === establishmentId) {
        // React StrictMode immediately re-runs effects after cleanup. Clearing the
        // guard lets that live effect own the request while the cancelled one exits.
        claimGuardRef.current = null;
      }
    };
  }, [establishmentId, offerFirstRun, presentIfCurrentOwner]);

  const replay = useCallback(
    async () => {
      if (!establishmentId) return false;
      const requestedReplayScope = replayScopeKey;
      const replayPresentationGeneration = presentationGenerationRef.current;
      const replayPresentationOwner = Symbol('setup-guide-replay');

      try {
        const result = await replaySetupGuide(establishmentId);
        if (
          !result.allowed ||
          activeEstablishmentRef.current !== establishmentId ||
          activeReplayScopeRef.current !== requestedReplayScope
        ) {
          return false;
        }

        setCanReplay(true);
        setStateStatus('ready');
        return presentIfCurrentOwner(
          replayPresentationGeneration,
          replayPresentationOwner,
        );
      } catch {
        // Manual replay is also server-gated and fails closed.
        return false;
      }
    },
    [establishmentId, presentIfCurrentOwner, replayScopeKey],
  );

  const reportProgress = useCallback(
    async (outcome: SetupGuideOutcome, lastStepIndex?: number) => {
      if (!establishmentId) return;
      try {
        await reportSetupGuideProgress(
          establishmentId,
          outcome,
          lastStepIndex,
        );
      } catch {
        // Progress is analytics-only and never changes first-run visibility.
      }
    },
    [establishmentId],
  );

  const close = invalidatePresentation;

  return {
    isOpen,
    canReplay,
    stateStatus,
    replay,
    reportProgress,
    close,
  };
}

export type SetupGuideController = ReturnType<typeof useSetupGuideFirstRun>;
