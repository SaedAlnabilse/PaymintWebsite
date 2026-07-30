import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getPopupSeenKey,
  getTasksStorageKey,
  SETUP_TASK_IDS,
} from '../data/setupTasks';
import { ChatWidgetEnhancer } from './ChatWidgetEnhancer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (
      key: string,
      options?: string | { defaultValue?: string; total?: number },
    ) =>
      typeof options === 'string'
        ? options
        : options?.defaultValue || key,
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial,
      animate,
      exit,
      transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      animate?: unknown;
      exit?: unknown;
      transition?: unknown;
    }) => {
      void initial;
      void animate;
      void exit;
      void transition;
      return <div {...props}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('./Chat/DualLauncher', () => ({ DualLauncher: () => null }));
vi.mock('./Chat/FAQModal', () => ({ FAQModal: () => null }));
vi.mock('./Chat/SmartChatbot', () => ({ SmartChatbot: () => null }));
vi.mock('./Chat/TasksModal', () => ({ TasksModal: () => null }));

const pathname = '/dashboard/cafe-one';
const contextId = 'dashboard-cafe-one';
const tasksKey = getTasksStorageKey(contextId);
const seenKey = getPopupSeenKey(contextId);
const completedTasks = Object.fromEntries(
  SETUP_TASK_IDS.map((id) => [id, true]),
);

function renderWidget() {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <ChatWidgetEnhancer />
    </MemoryRouter>,
  );
}

describe('ChatWidgetEnhancer setup completion popup', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('recovers from the legacy premature seen flag and acknowledges only after close', async () => {
    window.localStorage.setItem(tasksKey, JSON.stringify(completedTasks));
    window.localStorage.setItem(
      `mintcom.widget.tasks.popup.seen.${contextId}`,
      'true',
    );

    renderWidget();

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(window.localStorage.getItem(seenKey)).toBeNull();

    fireEvent.click(
      screen.getByRole('button', { name: 'Continue to Dashboard' }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(window.localStorage.getItem(seenKey)).toBe('true');
  });

  it('shows when the final task completion event arrives', async () => {
    const onePending = { ...completedTasks, 'go-live': false };
    window.localStorage.setItem(tasksKey, JSON.stringify(onePending));
    renderWidget();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    window.localStorage.setItem(tasksKey, JSON.stringify(completedTasks));
    act(() => {
      window.dispatchEvent(new Event('mintcom-tasks-all-completed'));
    });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('does not suppress a later retry when rendering is interrupted before acknowledgement', async () => {
    window.localStorage.setItem(tasksKey, JSON.stringify(completedTasks));
    const firstRender = renderWidget();
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    firstRender.unmount();
    expect(window.localStorage.getItem(seenKey)).toBeNull();

    renderWidget();
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
