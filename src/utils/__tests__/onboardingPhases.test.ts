import { describe, expect, it } from 'vitest';
import { clampPhase, isLaunchLocked, mapApiPhase } from '../onboardingPhases';

describe('clampPhase', () => {
  it('blocks skip ahead to billing from profile', () => {
    expect(clampPhase('billing', 'profile', false)).toBe('profile');
  });

  it('forces launch when locked after payment', () => {
    expect(clampPhase('profile', 'launch', true)).toBe('launch');
    expect(clampPhase('billing', 'billing', true)).toBe('launch');
  });

  it('allows current billing phase', () => {
    expect(clampPhase('billing', 'billing', false)).toBe('billing');
  });

  it('allows going back before complete', () => {
    expect(clampPhase('owner-login', 'billing', false)).toBe('owner-login');
    expect(clampPhase('profile', 'billing', false)).toBe('profile');
  });

  it('blocks back after launch even if not flagged locked', () => {
    expect(clampPhase('billing', 'launch', false)).toBe('launch');
  });

  it('defaults invalid requested to server phase', () => {
    expect(clampPhase('nope', 'location-login', false)).toBe('location-login');
    expect(clampPhase(undefined, 'owner-login', false)).toBe('owner-login');
  });
});

describe('mapApiPhase', () => {
  it('maps COMPLETED to launch slug', () => {
    expect(mapApiPhase('COMPLETED')).toBe('launch');
    expect(mapApiPhase('LOCATION_LOGIN')).toBe('location-login');
  });
});

describe('isLaunchLocked', () => {
  it('locks on launch/completed', () => {
    expect(isLaunchLocked('launch')).toBe(true);
    expect(isLaunchLocked('billing', 'LAUNCH')).toBe(true);
    expect(isLaunchLocked('billing', 'BILLING')).toBe(false);
  });
});
