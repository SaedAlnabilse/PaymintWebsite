import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../config/api';
import {
  SETUP_GUIDE_KEY,
  claimSetupGuide,
  getSetupGuideState,
  replaySetupGuide,
  reportSetupGuideProgress,
} from './setupGuideApi';

vi.mock('../config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const establishmentConfig = {
  headers: { 'X-Establishment-Id': 'location-a' },
};

describe('setupGuideApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scopes state to the requested establishment in both query and header', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { canReplay: true } });

    await getSetupGuideState('location-a');

    expect(api.get).toHaveBeenCalledWith('/api/setup-guide/state', {
      params: { establishmentId: 'location-a' },
      ...establishmentConfig,
    });
  });

  it('sends only the whitelisted claim and replay fields', async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce({ data: { granted: true, guideVersion: 1 } })
      .mockResolvedValueOnce({ data: { allowed: true } });

    await claimSetupGuide('location-a');
    await replaySetupGuide('location-a');

    const expectedBody = {
      establishmentId: 'location-a',
      guideKey: SETUP_GUIDE_KEY,
    };
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      '/api/setup-guide/claim',
      expectedBody,
      establishmentConfig,
    );
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      '/api/setup-guide/replay',
      expectedBody,
      establishmentConfig,
    );
    expect(Object.keys(vi.mocked(api.post).mock.calls[0][1] as object)).toEqual([
      'establishmentId',
      'guideKey',
    ]);
  });

  it('reports analytics without adding undocumented fields', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: undefined });

    await reportSetupGuideProgress('location-a', 'COMPLETED', 1);

    expect(api.patch).toHaveBeenCalledWith(
      '/api/setup-guide/progress',
      {
        establishmentId: 'location-a',
        guideKey: SETUP_GUIDE_KEY,
        outcome: 'COMPLETED',
        lastStepIndex: 1,
      },
      establishmentConfig,
    );
  });
});
