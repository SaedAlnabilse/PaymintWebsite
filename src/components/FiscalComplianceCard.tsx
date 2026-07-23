import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ChevronDown, ChevronUp, Eye, EyeOff, Plug, Search, X, Check,
  Info, AlertTriangle, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { extractErrorMessage } from '../config/api';
import { ConfirmModal } from './ConfirmModal';
import {
  getCountryConfig,
  listCountryConfigs,
  validateFiscalCredentials,
  type CredentialField,
} from '../utils/fiscalCountries';

/** The masked sentinel the API returns in place of stored secret values. */
const MASK = '••••••••';

export interface FiscalInitialConfig {
  fiscalEnabled?: boolean;
  fiscalCountryCode?: string | null;
  fiscalCredentials?: string | null;
  fiscalAutoSubmit?: boolean;
  fiscalBlockOnFailure?: boolean;
  fiscalTaxPresets?: string | null;
}

interface FiscalComplianceCardProps {
  initial: FiscalInitialConfig;
  /** Whether the current account may edit these settings. */
  disabled?: boolean;
  /** Called after a successful save so the parent can refresh app-settings. */
  onSaved?: () => void;
}

interface TestResult {
  ok: boolean;
  message?: string;
}

/** Parse the stored credentials JSON, splitting out which secrets are saved. */
function parseStoredCredentials(raw?: string | null): {
  values: Record<string, string>;
  storedSecretKeys: Set<string>;
} {
  const values: Record<string, string> = {};
  const storedSecretKeys = new Set<string>();
  if (!raw) return { values, storedSecretKeys };
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const [key, val] of Object.entries(parsed)) {
      const str = val == null ? '' : String(val);
      if (str === MASK) {
        // A masked secret: it exists on the server but we never see it. Keep the
        // input blank and remember it's already saved.
        storedSecretKeys.add(key);
      } else {
        values[key] = str;
      }
    }
  } catch {
    /* ignore malformed credential blobs */
  }
  return { values, storedSecretKeys };
}

export function FiscalComplianceCard({ initial, disabled, onSaved }: FiscalComplianceCardProps) {
  const { t } = useTranslation();

  const parsed = useMemo(() => parseStoredCredentials(initial.fiscalCredentials), [initial.fiscalCredentials]);

  const [enabled, setEnabled] = useState(!!initial.fiscalEnabled);
  const [countryCode, setCountryCode] = useState((initial.fiscalCountryCode || '').toUpperCase());
  const [autoSubmit, setAutoSubmit] = useState(initial.fiscalAutoSubmit !== false);
  const [blockOnFailure, setBlockOnFailure] = useState(!!initial.fiscalBlockOnFailure);
  const [creds, setCreds] = useState<Record<string, string>>(parsed.values);
  const [storedSecretKeys, setStoredSecretKeys] = useState<Set<string>>(parsed.storedSecretKeys);

  const [credentialsDirty, setCredentialsDirty] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);

  // Re-sync from props whenever the parent reloads settings (e.g. after a save).
  useEffect(() => {
    setEnabled(!!initial.fiscalEnabled);
    setCountryCode((initial.fiscalCountryCode || '').toUpperCase());
    setAutoSubmit(initial.fiscalAutoSubmit !== false);
    setBlockOnFailure(!!initial.fiscalBlockOnFailure);
    setCreds(parsed.values);
    setStoredSecretKeys(parsed.storedSecretKeys);
    setCredentialsDirty(false);
  }, [initial, parsed]);

  const countryConfig = useMemo(() => getCountryConfig(countryCode), [countryCode]);
  const allCountries = useMemo(() => listCountryConfigs(), []);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? allCountries.filter(
          c => c.name.toLowerCase().includes(q) || (c.platformName ?? '').toLowerCase().includes(q),
        )
      : allCountries;
    return [...base].sort((a, b) => {
      const rank = (c: typeof a) => (c.providerId !== 'none' ? 0 : 1);
      return rank(a) - rank(b) || a.name.localeCompare(b.name);
    });
  }, [allCountries, search]);

  // Dirty tracking for the non-credential fields so the Save button is meaningful.
  const baseDirty =
    enabled !== !!initial.fiscalEnabled ||
    countryCode !== (initial.fiscalCountryCode || '').toUpperCase() ||
    autoSubmit !== (initial.fiscalAutoSubmit !== false) ||
    blockOnFailure !== !!initial.fiscalBlockOnFailure;
  const dirty = baseDirty || credentialsDirty;

  const countryChanged = countryCode !== (initial.fiscalCountryCode || '').toUpperCase();

  /** Has the user supplied every required field (secret fields count as saved)? */
  const credentialsComplete = useMemo(() => {
    const validation = validateFiscalCredentials(countryCode, creds);
    if (validation.valid) return true;
    // Allow required secret fields that are already stored and untouched.
    const missing = Object.keys(validation.errors ?? {});
    return missing.every(key => {
      const field = countryConfig.credentialFields.find(f => f.key === key);
      return field?.secret && storedSecretKeys.has(key) && !countryChanged;
    });
  }, [countryCode, creds, countryConfig, storedSecretKeys, countryChanged]);

  const updateCredential = (key: string, value: string) => {
    setCreds(prev => ({ ...prev, [key]: value }));
    setCredentialsDirty(true);
    setTestResult(null);
  };

  const toggleReveal = (key: string) => setRevealed(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSelectCountry = (code: string) => {
    if (code === countryCode) {
      setPickerOpen(false);
      setSearch('');
      return;
    }
    // Switching country invalidates the credentials and the connection result.
    setCountryCode(code);
    setCreds({});
    setStoredSecretKeys(new Set());
    setCredentialsDirty(true);
    setTestResult(null);
    setPickerOpen(false);
    setSearch('');
  };

  /** Build the app-settings PUT payload for the fiscal fields. */
  const buildPayload = (overrideEnabled?: boolean) => {
    const payload: Record<string, unknown> = {
      fiscalEnabled: overrideEnabled ?? enabled,
      fiscalCountryCode: countryCode || null,
      fiscalAutoSubmit: autoSubmit,
      fiscalBlockOnFailure: blockOnFailure,
    };
    // Only send credentials when the user actually edited them — this avoids
    // echoing the masked sentinel (which the API would reject) and preserves the
    // stored secret when the owner only toggles a flag.
    if (credentialsDirty) {
      const bag: Record<string, string> = {};
      for (const field of countryConfig.credentialFields) {
        const v = (creds[field.key] ?? '').trim();
        if (v) bag[field.key] = v;
      }
      payload.fiscalCredentials = JSON.stringify(bag);
    }
    // Reset presets to the new country's defaults only when the country changes,
    // so we never clobber POS-managed preset selections on an unrelated save.
    if (countryChanged) {
      payload.fiscalTaxPresets = JSON.stringify([]);
    }
    return payload;
  };

  const persist = async (overrideEnabled?: boolean): Promise<boolean> => {
    setSaving(true);
    try {
      await api.put('/app-settings', buildPayload(overrideEnabled));
      onSaved?.();
      return true;
    } catch (err) {
      toast.error(extractErrorMessage(err) || t('settings.fiscal.saveFailed', 'Could not save e-invoicing settings'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (countryConfig.credentialFields.length > 0 && enabled && !credentialsComplete) {
      toast.error(t('settings.fiscal.fillRequired', 'Please fill in all required fields before saving.'));
      return;
    }
    const ok = await persist();
    if (ok) toast.success(t('settings.fiscal.saved', 'E-invoicing settings saved'));
  };

  const handleToggleEnabled = async (next: boolean) => {
    if (!next) {
      // Turning OFF stops tax-authority reporting — confirm first.
      setConfirmDisableOpen(true);
      return;
    }
    setEnabled(true);
    setCollapsed(false);
  };

  const handleConfirmDisable = async () => {
    setConfirmDisableOpen(false);
    setEnabled(false);
    await persist(false);
    toast.success(t('settings.fiscal.disabled', 'E-invoicing turned off'));
  };

  const handleTestConnection = async () => {
    if (!credentialsComplete) {
      toast.error(t('settings.fiscal.fillRequired', 'Please fill in all required fields before saving.'));
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      // The API tests the *stored* credentials, so persist any pending edits first.
      if (dirty) {
        const saved = await persist();
        if (!saved) {
          setTesting(false);
          return;
        }
      }
      const res = await api.post('/api/fiscal/test-connection', { countryCode });
      const data = res.data as TestResult;
      setTestResult(data);
    } catch (err) {
      setTestResult({ ok: false, message: extractErrorMessage(err) || t('settings.fiscal.failed', 'Connection failed') });
    } finally {
      setTesting(false);
    }
  };

  const subtitle = countryConfig.platformName
    ? `${countryConfig.flag} ${countryConfig.name} · ${countryConfig.platformName}`
    : t('settings.fiscal.subtitle', 'Select your country to begin');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/[0.03] rounded-2xl shadow-sm font-sans ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 p-6 sm:p-8">
        <button
          type="button"
          onClick={() => enabled && setCollapsed(c => !c)}
          className="flex items-start gap-4 text-left flex-1 min-w-0"
        >
          <div className="w-12 h-12 shrink-0 rounded-xl bg-mintcom-green/10 flex items-center justify-center text-mintcom-green shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {t('settings.fiscal.title', 'E-Invoicing & Tax Compliance')}
              </h3>
              <span title={t('settings.fiscal.quickInfo', "Connect your POS to your country's tax authority so every sale is reported and the receipt carries a verification QR code.")}>
                <Info size={15} className="text-gray-400 shrink-0" />
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 truncate">{subtitle}</p>
          </div>
        </button>

        <div className="flex items-center gap-3 shrink-0">
          {enabled && (
            <button
              type="button"
              onClick={() => setCollapsed(c => !c)}
              className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label={collapsed ? t('common.expand', 'Expand') : t('common.collapse', 'Collapse')}
            >
              {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          )}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => handleToggleEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="h-7 w-12 rounded-full bg-slate-300/90 ring-1 ring-inset ring-slate-400/40 shadow-inner transition-all duration-200 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-mintcom-green/50 peer-focus-visible:ring-offset-2 dark:bg-white/15 dark:ring-white/20 peer-checked:bg-mintcom-green peer-checked:ring-mintcom-green/40 peer-checked:shadow-[0_0_0_3px_rgba(125,198,162,0.22)] after:absolute after:left-0.5 after:top-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.18)] after:transition-all after:content-[''] peer-checked:after:translate-x-5" />
          </label>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {enabled && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 sm:px-8 pb-8 pt-2 space-y-6 border-t border-gray-100 dark:border-white/5">
              {/* Country selector */}
              <div className="space-y-2 pt-6">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block tracking-wide">
                  {t('settings.fiscal.country', 'Country')}
                </label>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white hover:border-mintcom-green/40 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg leading-none">{countryConfig.flag}</span>
                    {countryConfig.name}
                  </span>
                  <ChevronDown size={18} className="text-gray-400" />
                </button>
              </div>

              {/* Registration hint */}
              {countryConfig.registrationUrl && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border-l-[3px] border-mintcom-green">
                  <Info size={15} className="text-mintcom-green mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t('settings.fiscal.registerHint', 'Get your credentials by registering at')}{' '}
                    <a
                      href={countryConfig.registrationUrl.startsWith('http') ? countryConfig.registrationUrl : `https://${countryConfig.registrationUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-mintcom-green hover:underline"
                    >
                      {countryConfig.registrationUrl}
                    </a>
                  </p>
                </div>
              )}

              {/* Dynamic credential fields */}
              {countryConfig.credentialFields.map((field: CredentialField) => {
                const isSecret = !!field.secret;
                const isRevealed = revealed[field.key];
                const value = creds[field.key] ?? '';
                const savedSecret = isSecret && storedSecretKeys.has(field.key) && !countryChanged;
                return (
                  <div key={field.key} className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block tracking-wide">
                      {field.label}{field.required ? ' *' : ''}
                    </label>
                    <div className="relative">
                      <input
                        type={isSecret && !isRevealed ? 'password' : 'text'}
                        value={value}
                        onChange={e => updateCredential(field.key, e.target.value)}
                        inputMode={field.keyboard === 'numeric' ? 'numeric' : undefined}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder={
                          field.placeholder ||
                          (savedSecret ? t('settings.fiscal.savedKeep', 'Saved — re-enter to change') : '')
                        }
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/20 focus:border-mintcom-green transition-all ${isSecret ? 'pr-11' : ''}`}
                      />
                      {isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleReveal(field.key)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          aria-label={isRevealed ? t('common.hide', 'Hide') : t('common.show', 'Show')}
                        >
                          {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      )}
                    </div>
                    {field.hint && <p className="text-[11px] text-gray-400 font-medium">{field.hint}</p>}
                  </div>
                );
              })}

              {countryConfig.credentialFields.length === 0 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    {t('settings.fiscal.noConnectionYet', 'Tax Sync is unavailable due to unsupported country settings or pending Mintcom integration.')}
                  </p>
                </div>
              )}

              {/* Test connection */}
              {countryConfig.credentialFields.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing || saving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-mintcom-green text-mintcom-green font-bold text-sm hover:bg-mintcom-green/5 transition-all disabled:opacity-50"
                  >
                    {testing ? <Loader2 size={18} className="animate-spin" /> : <Plug size={18} />}
                    {testing ? t('settings.fiscal.testing', 'Testing…') : t('settings.fiscal.testConnection', 'Test connection')}
                  </button>

                  {(testing || testResult) && (
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                        testing
                          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                          : testResult?.ok
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                      }`}
                    >
                      {testing ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-amber-500" />
                          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                            {t('settings.fiscal.checkingConnection', 'Checking connection…')}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={`w-2.5 h-2.5 rounded-full ${testResult?.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className={`text-sm font-semibold ${testResult?.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                            {testResult?.message ||
                              (testResult?.ok
                                ? t('settings.fiscal.connected', 'Connected')
                                : t('settings.fiscal.failed', 'Connection failed'))}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Submission preferences */}
              {countryConfig.credentialFields.length > 0 && (
                <div className="pt-2 border-t border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5">
                  <div className="flex items-center justify-between py-3">
                    <div className="pr-4">
                      <span className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                        {t('settings.fiscal.autoSubmit', 'Auto-submit invoices')}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-0.5">
                        {t('settings.fiscal.autoSubmitDesc', 'Report each sale to the tax authority automatically as it is completed.')}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" checked={autoSubmit} onChange={e => setAutoSubmit(e.target.checked)} className="sr-only peer" />
                      <div className="w-10 h-6 bg-gray-200 dark:bg-white/10 rounded-full peer peer-checked:bg-mintcom-green after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4 shadow-sm" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="pr-4">
                      <span className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                        {t('settings.fiscal.blockOnFailure', 'Block sale on reporting failure')}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-0.5">
                        {t('settings.fiscal.blockOnFailureDesc', 'Prevent completing a sale if it cannot be reported. Leave off to queue and retry instead.')}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" checked={blockOnFailure} onChange={e => setBlockOnFailure(e.target.checked)} className="sr-only peer" />
                      <div className="w-10 h-6 bg-gray-200 dark:bg-white/10 rounded-full peer peer-checked:bg-mintcom-green after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4 shadow-sm" />
                    </label>
                  </div>
                </div>
              )}

              {/* Save */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!dirty || saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-mintcom-green text-black font-bold text-sm hover:bg-[#5fa888] transition-all shadow-sm disabled:opacity-50 disabled:shadow-none"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {t('settings.fiscal.save', 'Save e-invoicing settings')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Country picker modal */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setPickerOpen(false); setSearch(''); }}
          >
            <motion.div
              className="w-full max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
                <div>
                  <p className="text-[11px] font-bold text-mintcom-green tracking-wide uppercase">
                    {t('settings.fiscal.selectCountry', 'Select Country')}
                  </p>
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">
                    {countryConfig.flag} {countryConfig.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setPickerOpen(false); setSearch(''); }}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 border-b border-gray-100 dark:border-white/5">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('settings.fiscal.searchCountry', 'Search countries')}
                    className="w-full pl-10 pr-9 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mintcom-green/20 focus:border-mintcom-green"
                    autoFocus
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredCountries.map(item => {
                  const selected = item.countryCode === countryCode;
                  const supported = item.providerId !== 'none';
                  return (
                    <button
                      key={item.countryCode}
                      type="button"
                      disabled={!supported}
                      onClick={() => supported && handleSelectCountry(item.countryCode)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        selected
                          ? 'border-mintcom-green bg-mintcom-green/10'
                          : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] hover:border-mintcom-green/40'
                      } ${supported ? '' : 'opacity-55 cursor-not-allowed'}`}
                    >
                      <span className="text-2xl leading-none shrink-0">{item.flag}</span>
                      <span className="flex-1 min-w-0">
                        <span className={`block text-sm font-bold truncate ${selected ? 'text-mintcom-green' : 'text-gray-900 dark:text-white'}`}>
                          {item.name}
                        </span>
                        {supported ? (
                          item.platformName && (
                            <span className="block text-[11px] text-gray-400 truncate">{item.platformName}</span>
                          )
                        ) : (
                          <span className="block text-[11px] text-gray-400 line-clamp-2">
                            {t('settings.fiscal.noConnectionYet', 'Tax Sync is unavailable due to unsupported country settings or pending Mintcom integration.')}
                          </span>
                        )}
                      </span>
                      {supported && selected && <Check size={18} className="text-mintcom-green shrink-0" />}
                    </button>
                  );
                })}
                {filteredCountries.length === 0 && (
                  <div className="py-16 text-center">
                    <Search size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {t('settings.fiscal.noCountries', 'No countries found')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{t('settings.fiscal.tryDifferentKeywords', 'Try different keywords')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmDisableOpen}
        type="danger"
        title={t('settings.fiscal.disableTitle', 'Turn off E-Invoicing?')}
        message={t('settings.fiscal.disableMessage', 'New sales will no longer be reported to the tax authority and receipts will stop carrying the verification QR code. Your connection details are kept, so you can turn it back on anytime.')}
        confirmText={t('settings.fiscal.disableConfirm', 'Turn off')}
        onConfirm={handleConfirmDisable}
        onClose={() => setConfirmDisableOpen(false)}
      />
    </motion.div>
  );
}

export default FiscalComplianceCard;
