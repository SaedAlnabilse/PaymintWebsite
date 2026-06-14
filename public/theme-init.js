// Pre-hydration theme initialization.
// Loaded as an external, render-blocking script from index.html so the correct
// light/dark class is applied before first paint (no flash) WITHOUT needing an
// inline <script>, which lets the CSP drop `script-src 'unsafe-inline'`.
(() => {
  try {
    const storageKey = 'mintcom-ui-theme';
    const storedTheme = localStorage.getItem(storageKey) || 'system';
    const resolvedTheme = storedTheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : storedTheme;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  } catch {
    // Ignore pre-hydration theme initialization failures.
  }
})();
