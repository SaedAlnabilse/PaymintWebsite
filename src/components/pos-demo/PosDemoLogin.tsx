/**
 * Demo login — mirrors mintcom-pos LoginScreen:
 * - Split layout: form (left) + green brand panel (right, desktop)
 * - Location card with back + pin + establishment name
 * - Welcome back, username, password/PIN, forgot password, Log in
 * - Footer help / legal
 * Sandbox: demo staff login via username + PIN (or quick-fill chips).
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  MapPin,
  User,
  X,
} from 'lucide-react';
import { Logo } from '../Logo';
import { DemoSupportScreen } from './PosDemoSupport';

export type DemoLoginStaff = {
  id: string;
  name: string;
  role: string;
  pin: string;
  emoji: string;
  accessNote?: string;
};

type Props = {
  businessName?: string;
  staffList: DemoLoginStaff[];
  onBack: () => void;
  onSuccess: (staff: DemoLoginStaff) => void;
};

export function PosDemoLogin({
  businessName = 'Cafe Delight',
  staffList,
  onBack,
  onSuccess,
}: Props) {
  const username = 'Sara';
  const password = '1234';
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  /** Full-screen POS Contact Support (same content as real POS Help for Live Service). */
  const [showContactSupport, setShowContactSupport] = useState(false);
  const [forgotUser, setForgotUser] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [shake, setShake] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus username on mount like a real login screen
    const t = window.setTimeout(() => usernameRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, []);

  const resolveStaff = (user: string, pass: string): DemoLoginStaff | null => {
    const u = user.trim().toLowerCase();
    const p = pass.trim();
    if (!p) return null;

    // Match by name or id + pin
    if (u) {
      const byUser = staffList.find(
        (s) =>
          s.name.toLowerCase() === u ||
          s.id.toLowerCase() === u ||
          s.role.toLowerCase() === u,
      );
      if (byUser && byUser.pin === p) return byUser;
      // Wrong pin for known user
      if (byUser) return null;
    }

    // PIN-only: unique pin match (sandbox convenience, like clock-in PIN)
    const byPin = staffList.filter((s) => s.pin === p);
    if (byPin.length === 1) return byPin[0];
    return null;
  };

  const handleLogin = async () => {
    setUsernameError('');
    setPasswordError('');

    if (!username.trim() && !password.trim()) {
      setUsernameError('Username is required');
      setPasswordError('Password or PIN is required');
      triggerShake();
      return;
    }
    if (!password.trim()) {
      setPasswordError('Password or PIN is required');
      triggerShake();
      return;
    }

    setSubmitting(true);
    // Brief delay mirrors POS loading overlay
    await new Promise((r) => window.setTimeout(r, 420));

    const match = resolveStaff(username, password);
    if (!match) {
      setSubmitting(false);
      if (username.trim()) {
        setPasswordError('Invalid credentials — try a demo account below');
      } else {
        setPasswordError('Wrong PIN — try 1234, 0000, or 9999');
      }
      triggerShake();
      return;
    }

    onSuccess(match);
  };

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleLogin();
    }
  };

  return (
    <div className="flex h-full max-h-full overflow-hidden bg-white dark:bg-mintcom-dark">
      {/* ── Left: form — static tablet half ── */}
      <div className="relative flex min-h-0 min-w-0 w-1/2 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-start justify-between gap-2 px-4 pb-1 pt-4 sm:px-6 sm:pt-5">
          <button
            type="button"
            onClick={() => setShowDisconnectModal(true)}
            className="flex max-w-[min(100%,320px)] items-center rounded-xl border border-gray-200 bg-white py-1.5 pe-4 ps-1.5 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-mintcom-surface"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mintcom-green text-white shadow-md shadow-mintcom-green/30">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </span>
            <span className="mx-2.5 h-8 w-px shrink-0 bg-gray-100 dark:bg-white/10" />
            <span className="me-2.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mintcom-green/10 text-mintcom-green">
              <MapPin size={18} strokeWidth={2.25} />
            </span>
            <span className="min-w-0 text-start">
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-mintcom-green">
                Current location
              </span>
              <span className="block truncate text-sm font-semibold text-text-primary dark:text-white">
                {businessName}
              </span>
            </span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">

          <motion.div
            animate={shake ? { x: [-7, 7, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[340px]"
          >
            <h1 className="text-center font-barlow text-[28px] font-extrabold leading-tight text-[#333] dark:text-white sm:text-[32px]">
              Welcome Back!
            </h1>
            <p className="mb-7 mt-2 text-center text-sm text-[#999]">
              Log in using your employee credentials
            </p>

            {/* Username */}
            <div className="mb-4">
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-secondary dark:text-mintcom-textSecondary mb-2">
                Username
              </label>
              <div className="flex h-14 items-center rounded-xl border border-[#d1d5db] bg-white px-4 dark:border-white/15 dark:bg-mintcom-surface">
                <User size={20} className="me-3 shrink-0 text-[#999]" />
                <input
                  ref={usernameRef}
                  type="text"
                  readOnly
                  placeholder="Username"
                  value={username}
                  onKeyDown={onKeyDown}
                  className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-[#555] dark:text-[#ccc] outline-none cursor-not-allowed select-none"
                />
              </div>
              {usernameError && (
                <p className="mt-1 text-[13px] text-[#D55263]">{usernameError}</p>
              )}
            </div>

            {/* Password / PIN */}
            <div className="mb-1">
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-secondary dark:text-mintcom-textSecondary mb-2">
                Password or PIN
              </label>
              <div className="flex h-14 items-center rounded-xl border border-[#d1d5db] bg-white px-4 dark:border-white/15 dark:bg-mintcom-surface">
                <Lock size={20} className="me-3 shrink-0 text-[#999]" />
                <input
                  ref={passwordRef}
                  type="password"
                  readOnly
                  placeholder="Password or PIN"
                  value={password}
                  onKeyDown={onKeyDown}
                  className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-[#555] dark:text-[#ccc] outline-none cursor-not-allowed select-none"
                />
              </div>
              {passwordError && (
                <p className="mt-1 text-[13px] text-[#D55263]">{passwordError}</p>
              )}
            </div>

            <div className="mb-6 flex w-full justify-end">
              <button
                type="button"
                onClick={() => {
                  setForgotUser(username);
                  setForgotSent(false);
                  setShowForgot(true);
                }}
                className="text-sm font-medium text-mintcom-green hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleLogin()}
              className={`relative flex h-14 w-full items-center justify-center rounded-xl bg-mintcom-green px-5 text-base font-semibold text-white shadow-md shadow-mintcom-green/25 transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#A0A0A0] disabled:opacity-70 disabled:shadow-none`}
            >
              <span>{submitting ? 'Logging in…' : 'Log in'}</span>
              {!submitting && (
                <ArrowRight size={20} className="absolute end-5" strokeWidth={2.25} />
              )}
            </button>




            <div className="mt-6 text-center">
              <p className="text-sm text-[#666]">
                Need help?{' '}
                <button
                  type="button"
                  onClick={() => setShowContactSupport(true)}
                  className="font-bold text-mintcom-green underline"
                >
                  Contact support
                </button>
              </p>
              <p className="mt-2 text-sm text-[#666]">
                <a
                  href="https://mintcompos.com/legal/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-mintcom-green hover:underline"
                >
                  Privacy Policy
                </a>
                <span className="mx-1.5 text-[#666]"> · </span>
                <a
                  href="https://mintcompos.com/legal/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-mintcom-green hover:underline"
                >
                  Terms of Service
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right: brand panel — always on static tablet canvas ── */}
      <div className="relative flex w-1/2 flex-col items-center justify-center overflow-hidden bg-[#6baf8b]">
        <div className="pointer-events-none absolute -bottom-16 -start-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-28 -end-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />
        <div className="pointer-events-none absolute start-0 end-0 bottom-0 h-[30%] bg-gradient-to-t from-black/10 to-transparent" />

        <div className="relative z-10 flex max-w-[460px] flex-col items-center px-10 text-center">
          <Logo theme="dark" size="lg" className="scale-125" />
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-mintcom-dark/90"
          >
            <div className="flex flex-col items-center gap-3">
              <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-mintcom-green/25 border-t-mintcom-green" />
              <p className="text-sm font-bold text-text-secondary dark:text-mintcom-textSecondary">
                Signing you in…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact support — full-screen POS Help for Live Service (mintcom-pos ContactSupportScreen) */}
      <AnimatePresence>
        {showContactSupport && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="fixed inset-0 z-[70] flex flex-col bg-white dark:bg-mintcom-dark"
          >
            <DemoSupportScreen
              variant="login"
              onBack={() => setShowContactSupport(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot password — demo modal */}
      <AnimatePresence>
        {showForgot && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-mintcom-surface"
            >
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="absolute end-3 top-3 rounded-xl p-1.5 text-text-tertiary hover:bg-cream-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
              <h3 className="pe-8 text-lg font-extrabold text-text-primary dark:text-white">
                {forgotSent ? 'Request sent' : 'Forgot password?'}
              </h3>
              <p className="mt-2 text-sm text-text-secondary dark:text-mintcom-textSecondary">
                {forgotSent
                  ? 'This is a demo. In the real POS, an admin is notified and can approve your password reset.'
                  : 'This is a demo. In the real POS, enter your username and an admin will approve the reset.'}
              </p>
              {!forgotSent && (
                <div className="mt-4 flex h-14 items-center rounded-xl border border-gray-200 px-4 dark:border-white/15">
                  <User size={20} className="me-3 text-[#B0B0B0]" />
                  <input
                    type="text"
                    placeholder="Your username"
                    value={forgotUser}
                    onChange={(e) => setForgotUser(e.target.value)}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none dark:text-white"
                  />
                </div>
              )}
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-text-primary dark:text-white dark:border-white/15"
                >
                  {forgotSent ? 'Close' : 'Cancel'}
                </button>
                {!forgotSent && (
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="flex-1 rounded-xl bg-mintcom-green py-3 text-sm font-bold text-white"
                  >
                    Send request
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secure Disconnect Modal */}
      <AnimatePresence>
        {showDisconnectModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-mintcom-surface"
            >
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                className="absolute end-3 top-3 rounded-xl p-1.5 text-text-tertiary hover:bg-cream-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
              <h3 className="pe-8 text-lg font-extrabold text-text-primary dark:text-white">
                Disconnect Store?
              </h3>
              <p className="mt-2 text-sm text-text-secondary dark:text-mintcom-textSecondary">
                To disconnect this terminal from Cafe Delight and return to the connection setup, confirm your establishment password.
              </p>

              <div className="mt-4 flex h-14 items-center rounded-xl border border-gray-200 bg-white px-4 dark:border-white/15 dark:bg-mintcom-surface">
                <Lock size={20} className="me-3 text-[#B0B0B0]" />
                <input
                  type="password"
                  readOnly
                  value="delight123"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none dark:text-white cursor-not-allowed select-none"
                />
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  disabled={disconnecting}
                  onClick={() => setShowDisconnectModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-text-primary dark:text-white dark:border-white/15"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={disconnecting}
                  onClick={async () => {
                    setDisconnecting(true);
                    await new Promise((r) => window.setTimeout(r, 600));
                    setDisconnecting(false);
                    setShowDisconnectModal(false);
                    onBack(); // Go back to store connection screen
                  }}
                  className="flex-1 rounded-xl bg-mintcom-red py-3 text-sm font-bold text-white shadow-md shadow-mintcom-red/25"
                >
                  {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
