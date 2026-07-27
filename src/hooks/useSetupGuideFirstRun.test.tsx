import { StrictMode, type ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  claimSetupGuide,
  getSetupGuideState,
  replaySetupGuide,
  reportSetupGuideProgress,
  type SetupGuideState,
} from '../services/setupGuideApi';
import { useSetupGuideFirstRun } from './useSetupGuideFirstRun';

vi.mock('../services/setupGuideApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../services/setupGuideApi')>();
  return {
    ...actual,
    claimSetupGuide: vi.fn(),
    getSetupGuideState: vi.fn(),
    replaySetupGuide: vi.fn(),
    reportSetupGuideProgress: vi.fn(),
  };
});

const makeState = (
  overrides: Partial<SetupGuideState> = {},
): SetupGuideState => ({
  guideKey: 'ESTABLISHMENT_SETUP',
  guideVersion: 1,
  eligible: true,
  alreadySeen: false,
  shouldOffer: true,
  canReplay: true,
  ...overrides,
});

describe('useSetupGuideFirstRun', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSetupGuideState).mockResolvedValue(makeState());
    vi.mocked(claimSetupGuide).mockResolvedValue({
      granted: true,
      guideVersion: 1,
    });
    vi.mocked(replaySetupGuide).mockResolvedValue({ allowed: true });
    vi.mocked(reportSetupGuideProgress).mockResolvedValue();
  });

  it('survives React StrictMode and opens exactly once after a granted claim', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <StrictMode>{children}</StrictMode>
    );
    const { result } = renderHook(
      () => useSetupGuideFirstRun('location-a'),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isOpen).toBe(true));
    expect(claimSetupGuide).toHaveBeenCalledTimes(1);
    expect(claimSetupGuide).toHaveBeenCalledWith('location-a');
  });

  it('reads server eligibility while locked but does not claim until enabled', async () => {
    const { result, rerender } = renderHook(
      ({ offerFirstRun }) =>
        useSetupGuideFirstRun('location-a', { offerFirstRun }),
      { initialProps: { offerFirstRun: false } },
    );

    await waitFor(() => expect(result.current.canReplay).toBe(true));
    expect(claimSetupGuide).not.toHaveBeenCalled();

    rerender({ offerFirstRun: true });
    await waitFor(() => expect(result.current.isOpen).toBe(true));
    expect(claimSetupGuide).toHaveBeenCalledTimes(1);
  });

  it('does not claim or render when the server says the guide was seen', async () => {
    vi.mocked(getSetupGuideState).mockResolvedValue(
      makeState({ alreadySeen: true, shouldOffer: false }),
    );

    const { result } = renderHook(() =>
      useSetupGuideFirstRun('location-a'),
    );

    await waitFor(() => expect(result.current.stateStatus).toBe('ready'));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.canReplay).toBe(true);
    expect(claimSetupGuide).not.toHaveBeenCalled();
  });

  it('fails closed when state fails but preserves trusted replay state when claim fails', async () => {
    vi.mocked(getSetupGuideState).mockRejectedValueOnce(new Error('offline'));
    const stateFailure = renderHook(() =>
      useSetupGuideFirstRun('location-a'),
    );

    await waitFor(() =>
      expect(stateFailure.result.current.stateStatus).toBe('error'),
    );
    expect(stateFailure.result.current.isOpen).toBe(false);
    expect(stateFailure.result.current.canReplay).toBe(false);
    stateFailure.unmount();

    vi.mocked(getSetupGuideState).mockResolvedValue(makeState());
    vi.mocked(claimSetupGuide).mockRejectedValueOnce(new Error('500'));
    const claimFailure = renderHook(() =>
      useSetupGuideFirstRun('location-b'),
    );

    await waitFor(() => expect(claimSetupGuide).toHaveBeenCalledTimes(1));
    expect(claimFailure.result.current.isOpen).toBe(false);
    expect(claimFailure.result.current.canReplay).toBe(true);
    expect(claimFailure.result.current.stateStatus).toBe('ready');
  });

  it('opens replay only when the replay endpoint allows it', async () => {
    vi.mocked(getSetupGuideState).mockResolvedValue(
      makeState({
        eligible: false,
        shouldOffer: false,
        canReplay: false,
      }),
    );
    vi.mocked(replaySetupGuide)
      .mockResolvedValueOnce({ allowed: false })
      .mockResolvedValueOnce({ allowed: true });

    const { result } = renderHook(() =>
      useSetupGuideFirstRun('location-a', { offerFirstRun: false }),
    );
    await waitFor(() => expect(result.current.stateStatus).toBe('ready'));

    await act(async () => {
      await expect(result.current.replay()).resolves.toBe(false);
    });
    expect(result.current.isOpen).toBe(false);

    await act(async () => {
      await expect(result.current.replay()).resolves.toBe(true);
    });
    expect(result.current.isOpen).toBe(true);
    expect(replaySetupGuide).toHaveBeenCalledTimes(2);
  });

  it('ignores an allowed replay response after its route scope changes', async () => {
    let resolveReplay!: (value: { allowed: boolean }) => void;
    vi.mocked(replaySetupGuide).mockReturnValue(
      new Promise((resolve) => {
        resolveReplay = resolve;
      }),
    );

    const { result, rerender } = renderHook(
      ({ replayScopeKey }) =>
        useSetupGuideFirstRun('location-a', {
          offerFirstRun: false,
          replayScopeKey,
        }),
      {
        initialProps: {
          replayScopeKey: '/dashboard/store/products',
        },
      },
    );
    await waitFor(() => expect(result.current.stateStatus).toBe('ready'));

    let replayResult!: Promise<boolean>;
    act(() => {
      replayResult = result.current.replay();
    });

    rerender({ replayScopeKey: '/dashboard/store/orders' });

    await act(async () => {
      resolveReplay({ allowed: true });
      await expect(replayResult).resolves.toBe(false);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('does not let a late granted claim reopen a replay presentation after close', async () => {
    let resolveClaim!: (
      value: Awaited<ReturnType<typeof claimSetupGuide>>,
    ) => void;
    const claimResult = new Promise<
      Awaited<ReturnType<typeof claimSetupGuide>>
    >((resolve) => {
      resolveClaim = resolve;
    });
    vi.mocked(claimSetupGuide).mockReturnValue(claimResult);

    const { result } = renderHook(() =>
      useSetupGuideFirstRun('location-a', {
        replayScopeKey: '/dashboard/store',
      }),
    );
    await waitFor(() => expect(claimSetupGuide).toHaveBeenCalledTimes(1));

    await act(async () => {
      await expect(result.current.replay()).resolves.toBe(true);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);

    await act(async () => {
      resolveClaim({ granted: true, guideVersion: 1 });
      await claimResult;
      await Promise.resolve();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('does not let a late allowed replay reopen a claim presentation after close', async () => {
    let resolveClaim!: (
      value: Awaited<ReturnType<typeof claimSetupGuide>>,
    ) => void;
    const claimResult = new Promise<
      Awaited<ReturnType<typeof claimSetupGuide>>
    >((resolve) => {
      resolveClaim = resolve;
    });
    vi.mocked(claimSetupGuide).mockReturnValue(claimResult);

    let resolveReplay!: (
      value: Awaited<ReturnType<typeof replaySetupGuide>>,
    ) => void;
    const replayResult = new Promise<
      Awaited<ReturnType<typeof replaySetupGuide>>
    >((resolve) => {
      resolveReplay = resolve;
    });
    vi.mocked(replaySetupGuide).mockReturnValue(replayResult);

    const { result } = renderHook(() =>
      useSetupGuideFirstRun('location-a', {
        replayScopeKey: '/dashboard/store',
      }),
    );
    await waitFor(() => expect(claimSetupGuide).toHaveBeenCalledTimes(1));

    let replayPresentation!: Promise<boolean>;
    act(() => {
      replayPresentation = result.current.replay();
    });
    expect(replaySetupGuide).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveClaim({ granted: true, guideVersion: 1 });
      await claimResult;
      await Promise.resolve();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);

    await act(async () => {
      resolveReplay({ allowed: true });
      await expect(replayPresentation).resolves.toBe(false);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('keeps replay itself write-free while preserving a later required first-run claim', async () => {
    const { result, rerender } = renderHook(
      ({ offerFirstRun }) =>
        useSetupGuideFirstRun('location-a', { offerFirstRun }),
      { initialProps: { offerFirstRun: false } },
    );
    await waitFor(() => expect(result.current.stateStatus).toBe('ready'));

    await act(async () => {
      await result.current.replay();
      result.current.close();
    });
    expect(claimSetupGuide).not.toHaveBeenCalled();

    rerender({ offerFirstRun: true });

    await waitFor(() => expect(claimSetupGuide).toHaveBeenCalledTimes(1));
  });

  it('re-runs the server flow when the active establishment changes', async () => {
    const { result, rerender } = renderHook(
      ({ id }) => useSetupGuideFirstRun(id),
      { initialProps: { id: 'location-a' } },
    );
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    act(() => result.current.close());
    rerender({ id: 'location-b' });
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    expect(claimSetupGuide).toHaveBeenNthCalledWith(1, 'location-a');
    expect(claimSetupGuide).toHaveBeenNthCalledWith(2, 'location-b');
  });

  it('dismisses an open first-run modal when the overview is left', async () => {
    const { result, rerender } = renderHook(
      ({ offerFirstRun }) =>
        useSetupGuideFirstRun('location-a', { offerFirstRun }),
      { initialProps: { offerFirstRun: true } },
    );

    await waitFor(() => expect(result.current.isOpen).toBe(true));

    rerender({ offerFirstRun: false });

    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });
});
