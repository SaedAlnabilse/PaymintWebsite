import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SetupGuideWelcomeModal } from './SetupGuideWelcomeModal';

let finishExit: (() => void) | undefined;

vi.mock('framer-motion', () => {
  const MotionDiv = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      animate?: unknown;
      exit?: unknown;
      transition?: unknown;
    }
  >(({ initial, animate, exit, transition, ...props }, ref) => (
    <div ref={ref} {...props} />
  ));
  MotionDiv.displayName = 'MotionDiv';

  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({
      children,
      onExitComplete,
    }: {
      children: React.ReactNode;
      onExitComplete?: () => void;
    }) => {
      finishExit = onExitComplete;
      return children;
    },
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { location?: string }) =>
      options?.location ? `${key}:${options.location}` : key === 'common.locale' ? 'en' : key,
  }),
}));

vi.mock('../../hooks/useScrollLock', () => ({ useScrollLock: vi.fn() }));

describe('SetupGuideWelcomeModal', () => {
  beforeEach(() => {
    finishExit = undefined;
    vi.clearAllMocks();
  });

  it('keeps its stable DOM id and closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <SetupGuideWelcomeModal
        isOpen
        onClose={onClose}
        onStart={vi.fn()}
        establishmentName="Downtown"
      />,
    );

    expect(document.getElementById('mintcom-dashboard-welcome-popup')).toBeInTheDocument();
    expect(
      screen.getByText('dashboard.setupGuide.message:Downtown'),
    ).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('traps focus and returns it after the modal exits', () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();

    const { rerender } = render(
      <SetupGuideWelcomeModal
        isOpen
        onClose={vi.fn()}
        onStart={vi.fn()}
      />,
    );
    const close = screen.getByRole('button', { name: 'common.close' });
    const later = screen.getByRole('button', {
      name: 'dashboard.setupGuide.later',
    });

    later.focus();
    fireEvent.keyDown(later, { key: 'Tab' });
    expect(close).toHaveFocus();

    rerender(
      <SetupGuideWelcomeModal
        isOpen={false}
        onClose={vi.fn()}
        onStart={vi.fn()}
      />,
    );
    act(() => finishExit?.());
    expect(outside).toHaveFocus();
    outside.remove();
  });

  it('falls back to the dashboard content when the trigger unmounts', () => {
    const trigger = document.createElement('button');
    const fallback = document.createElement('main');
    fallback.tabIndex = -1;
    fallback.dataset.setupGuideFocusFallback = '';
    document.body.append(trigger, fallback);
    trigger.focus();

    const { rerender } = render(
      <SetupGuideWelcomeModal
        isOpen
        onClose={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    trigger.remove();
    rerender(
      <SetupGuideWelcomeModal
        isOpen={false}
        onClose={vi.fn()}
        onStart={vi.fn()}
      />,
    );
    act(() => finishExit?.());

    expect(fallback).toHaveFocus();
    fallback.remove();
  });

  it('starts the tour only from the modal exit callback', () => {
    const onStart = vi.fn();

    function Harness() {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <SetupGuideWelcomeModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onStart={onStart}
        />
      );
    }

    render(<Harness />);
    fireEvent.click(
      screen.getByRole('button', { name: 'dashboard.setupGuide.start' }),
    );
    expect(onStart).not.toHaveBeenCalled();

    act(() => finishExit?.());
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
