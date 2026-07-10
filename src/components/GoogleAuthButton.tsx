import { useEffect, useCallback, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

// Official multicolor Google "G" mark (brand colors).
const GoogleIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  disabled?: boolean;
  isOverlay?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (callback?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment?: () => boolean;
            getNotDisplayedReason: () => string;
          }) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

// Public OAuth client ID. The env var still wins, but keeping the known public
// client ID here prevents the Google UI from disappearing on builds where the
// deploy environment forgot to define VITE_GOOGLE_CLIENT_ID.
const DEFAULT_GOOGLE_CLIENT_ID =
  '661509890911-nhmhvntnrllqh36vd4s0jdvnkkaqdgt3.apps.googleusercontent.com';

export const GOOGLE_CLIENT_ID = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID
).trim();

type GoogleCredentialCallback = (credential: string) => void;

// Module-level GIS state shared across button instances (form + terms modal).
let gisInitializedForClientId: string | null = null;
// Stack of live instance callbacks so unmounting the modal doesn't kill the form button.
const credentialListeners = new Set<GoogleCredentialCallback>();

function dispatchCredential(credential: string) {
  // Prefer the most recently mounted instance (modal > form).
  const listeners = [...credentialListeners];
  const latest = listeners[listeners.length - 1];
  if (latest) {
    latest(credential);
    return;
  }
}

export interface GoogleAuthButtonHandle {
  triggerPrompt: () => void;
}

function waitForGoogle(): Promise<NonNullable<typeof window.google>> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    ) as HTMLScriptElement | null;

    const onReady = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
      } else {
        reject(new Error('Google GIS loaded but API missing'));
      }
    };

    if (existing) {
      // Script tag exists — either still loading or already done.
      if (window.google?.accounts?.id) {
        onReady();
        return;
      }
      existing.addEventListener('load', onReady, { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Google GIS script failed')),
        { once: true }
      );
      // Poll briefly in case "load" already fired before we attached the listener.
      let tries = 0;
      const poll = window.setInterval(() => {
        tries += 1;
        if (window.google?.accounts?.id) {
          window.clearInterval(poll);
          onReady();
        } else if (tries > 50) {
          window.clearInterval(poll);
          reject(new Error('Google GIS script timeout'));
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error('Google GIS script failed'));
    document.head.appendChild(script);
  });
}

export const GoogleAuthButton = forwardRef<GoogleAuthButtonHandle, GoogleAuthButtonProps>(
  ({ onSuccess, onError, text = 'continue_with', disabled = false }, ref) => {
    const { t, i18n } = useTranslation();
    const { resolvedTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep latest handlers in refs so GIS init effect does NOT re-run (and
    // destroy the iframe) every time the parent re-renders with new closures.
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;

    // Register this instance's credential listener for the lifetime of the mount.
    useEffect(() => {
      const listener: GoogleCredentialCallback = (credential) => {
        setIsLoading(false);
        onSuccessRef.current(credential);
      };
      credentialListeners.add(listener);
      return () => {
        credentialListeners.delete(listener);
      };
    }, []);

    // Load GIS + render the official button once per mount / theme / locale / text.
    useEffect(() => {
      if (!GOOGLE_CLIENT_ID) {
        console.warn('[GoogleAuth] No Google client ID configured');
        return;
      }

      let cancelled = false;
      let renderAttempts = 0;
      let lastPaintedWidth = 0;
      let ro: ResizeObserver | null = null;
      let retryTimer: number | undefined;

      const paint = (google: NonNullable<typeof window.google>) => {
        if (cancelled || !buttonRef.current || !containerRef.current) return;

        // Use the real rendered width — GIS paints a dead/narrow iframe when
        // width is wrong (common in production after late font/layout settle).
        const measured = Math.floor(containerRef.current.getBoundingClientRect().width);
        const width = Math.max(measured || 0, 280);

        // Skip redundant paints that thrash the iframe (and kill click handlers).
        if (Math.abs(width - lastPaintedWidth) < 4 && buttonRef.current.querySelector('iframe')) {
          setIsReady(true);
          return;
        }

        buttonRef.current.replaceChildren();
        google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: resolvedTheme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          logo_alignment: 'left',
          width,
          locale: i18n.language,
        });

        lastPaintedWidth = width;
        renderAttempts += 1;
        const hasIframe = Boolean(buttonRef.current.querySelector('iframe'));

        // Retry if layout wasn't ready or GIS failed to inject an iframe.
        if ((!hasIframe || measured < 40) && renderAttempts < 8) {
          retryTimer = window.setTimeout(() => paint(google), 150);
          return;
        }

        if (!hasIframe) {
          console.error('[GoogleAuth] GIS button rendered without iframe — clicks will fail (check CSP frame-src)');
        }

        setIsReady(true);
      };

      const mountButton = async () => {
        try {
          const google = await waitForGoogle();
          if (cancelled || !buttonRef.current) return;

          if (gisInitializedForClientId !== GOOGLE_CLIENT_ID) {
            google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: (response) => {
                if (response.credential) {
                  dispatchCredential(response.credential);
                }
              },
              auto_select: false,
              cancel_on_tap_outside: true,
            });
            gisInitializedForClientId = GOOGLE_CLIENT_ID;
          }

          // Double rAF so flex/grid layout has final width before GIS measures.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!cancelled) paint(google);
            });
          });

          // Production fonts/layout can change container width after first paint.
          ro = new ResizeObserver(() => {
            if (cancelled) return;
            const w = Math.floor(containerRef.current?.getBoundingClientRect().width || 0);
            if (w >= 40 && Math.abs(w - lastPaintedWidth) >= 4) {
              paint(google);
            }
          });
          if (containerRef.current) {
            ro.observe(containerRef.current);
          }
        } catch (error) {
          console.error('[GoogleAuth] Failed to initialize:', error);
          if (!cancelled) {
            onErrorRef.current?.(t('auth.errors.googleInitFailed'));
          }
        }
      };

      void mountButton();

      return () => {
        cancelled = true;
        if (retryTimer) window.clearTimeout(retryTimer);
        ro?.disconnect();
        // Only clear THIS instance's host — never touch shared initialize state.
        if (buttonRef.current) {
          buttonRef.current.replaceChildren();
        }
        setIsReady(false);
      };
    }, [text, i18n.language, resolvedTheme, t]);

    const handlePrompt = useCallback(() => {
      if (!window.google || !GOOGLE_CLIENT_ID || disabled || isLoading) return;

      setIsLoading(true);
      try {
        window.google.accounts.id.prompt((notification) => {
          setIsLoading(false);
          if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason();
            console.warn('[GoogleAuth] Prompt not displayed:', reason);

            if (reason === 'opt_out_or_no_session') {
              onErrorRef.current?.(t('auth.errors.googleNoSession'));
              toast.error(
                t(
                  'auth.errors.clickGoogleDirectly',
                  'Please click the "Sign in with Google" button directly to continue.'
                )
              );
            } else if (reason === 'suppressed_by_user') {
              onErrorRef.current?.(t('auth.errors.googleCancelled'));
            } else {
              onErrorRef.current?.(t('auth.errors.googleUnavailable'));
            }
          }
        });
      } catch (error) {
        setIsLoading(false);
        console.error('[GoogleAuth] Error showing prompt:', error);
        onErrorRef.current?.(t('auth.errors.googlePromptFailed'));
      }
    }, [disabled, isLoading, t]);

    useImperativeHandle(ref, () => ({
      triggerPrompt: handlePrompt,
    }));

    if (!GOOGLE_CLIENT_ID) {
      return null;
    }

    const buttonText = {
      signin_with: t('auth.google.signInWith'),
      signup_with: t('auth.google.signUpWith'),
      continue_with: t('auth.google.continueWith'),
      signin: t('auth.google.signIn'),
    }[text];

    const showLoading = isLoading || !isReady;

    // Match AppleAuthButton: one border, rounded-xl, px-4 py-3, shadow-sm.
    // GIS iframe sits on top (near-invisible) so production browsers still hit-test it.
    // Fully opacity-0 iframes are flaky under strict production CSP / privacy modes.
    return (
      <div
        ref={containerRef}
        className={`group relative isolate w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] ${
          disabled || isLoading ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        {/* Visible face — decorative only */}
        <div
          className="pointer-events-none relative z-0 flex w-full items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white"
          aria-hidden
        >
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
            <GoogleIcon size={18} />
          </span>
          <span>{showLoading ? t('common.connecting') : buttonText}</span>
        </div>

        {/* Official GIS hit-target — must receive the real click (see .google-auth-button CSS) */}
        <div
          ref={buttonRef}
          aria-label={buttonText}
          className="google-auth-button absolute inset-0 z-10"
        />
      </div>
    );
  }
);

GoogleAuthButton.displayName = 'GoogleAuthButton';

// Divider component for "or" separator
export function AuthDivider() {
  const { t } = useTranslation();
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200 dark:to-white/10" />
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
        {t('common.or')}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200 dark:to-white/10" />
    </div>
  );
}
