import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../config/api';
import { PasswordResetOtpModal } from './PasswordResetOtpModal';

vi.mock('../config/api', () => ({
  default: { post: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'common.locale' ? 'en' : key),
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../hooks/useScrollLock', () => ({ useScrollLock: vi.fn() }));

describe('PasswordResetOtpModal reset proof flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.mocked(api.post).mockImplementation((url: string) => {
      if (url === '/api/accounts/request-password-otp') {
        return Promise.resolve({ data: { email: 'o***r@example.com' } });
      }
      if (url === '/api/accounts/verify-password-otp') {
        return Promise.resolve({ data: { resetProof: 'a'.repeat(64) } });
      }
      return Promise.resolve({ data: { success: true } });
    });
  });

  it('uses the high-entropy proof returned by OTP verification for reset', async () => {
    render(
      <PasswordResetOtpModal
        isOpen
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        type="account"
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'passwordReset.form.sendCode' }),
    );
    await screen.findByText('passwordReset.steps.enterCodeTitle');

    const otpInputs = screen.getAllByRole('textbox');
    '123456'.split('').forEach((digit, index) => {
      fireEvent.change(otpInputs[index], { target: { value: digit } });
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'passwordReset.form.verifyCode' }),
    );
    await screen.findByText('passwordReset.steps.newPasswordTitle');

    const passwordInputs = document.querySelectorAll<HTMLInputElement>(
      'input[type="password"]',
    );
    fireEvent.change(passwordInputs[0], {
      target: { value: 'NewPassword1!' },
    });
    fireEvent.change(passwordInputs[1], {
      target: { value: 'NewPassword1!' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'passwordReset.form.resetButton' }),
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/accounts/reset-password-otp',
        {
          resetProof: 'a'.repeat(64),
          newPassword: 'NewPassword1!',
        },
      );
    });
    expect(api.post).not.toHaveBeenCalledWith(
      '/api/accounts/reset-password-otp',
      expect.objectContaining({ otp: expect.anything() }),
    );
  });
});
