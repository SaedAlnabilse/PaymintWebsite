import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { communityApi } from '../../services/communityApi';
import { CommunitySkeleton } from '../../components/community/CommunitySkeleton';

type Prefs = {
  emailDigest: string;
  pushEnabled: boolean;
  notifyReply: boolean;
  notifyMention: boolean;
  notifySolution: boolean;
  notifyStatus: boolean;
};

/**
 * Community settings — notification preference center.
 * URL: /community/settings
 */
export function CommunitySettingsPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await communityApi.getPrefs();
        setPrefs(data);
      } catch {
        toast.error(t('community.errors.loadFailed', { defaultValue: 'Failed to load.' }));
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, t]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-5 rounded-xl bg-white border border-black/[0.05]">
        <p className="text-base font-semibold text-text-primary">
          {t('community.login_cta.title', { defaultValue: 'Sign in to join the conversation' })}
        </p>
        <Link
          to="/login?redirect=/community/settings"
          className="inline-flex mt-6 h-10 px-5 items-center justify-center rounded-xl text-sm font-semibold text-white bg-[#7dc6a2] hover:bg-[#6bb892] transition-colors"
        >
          {t('community.login_cta.button', { defaultValue: 'Log in' })}
        </Link>
      </div>
    );
  }

  if (loading || !prefs) return <CommunitySkeleton />;

  const save = async (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSaving(true);
    try {
      await communityApi.updatePrefs(patch);
      toast.success(t('community.settings.saved', { defaultValue: 'Preferences saved' }));
    } catch {
      toast.error(t('community.errors.actionFailed', { defaultValue: 'Failed to save.' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {t('community.settings.title', { defaultValue: 'Community Settings' })} | Mintcom POS
        </title>
      </Helmet>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t('community.settings.title', { defaultValue: 'Community Settings' })}
      </h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('community.settings.emailDigest', { defaultValue: 'Email digest' })}
          </label>
          <select
            value={prefs.emailDigest}
            disabled={saving}
            onChange={(e) => save({ emailDigest: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl"
          >
            <option value="OFF">{t('community.settings.digestOff', { defaultValue: 'Off' })}</option>
            <option value="DAILY">{t('community.settings.digestDaily', { defaultValue: 'Daily' })}</option>
            <option value="WEEKLY">{t('community.settings.digestWeekly', { defaultValue: 'Weekly' })}</option>
          </select>
        </div>

        {(
          [
            ['pushEnabled', t('community.settings.push', { defaultValue: 'Push notifications' })],
            ['notifyReply', t('community.settings.replies', { defaultValue: 'Replies to your topics' })],
            ['notifyMention', t('community.settings.mentions', { defaultValue: 'Mentions' })],
            ['notifySolution', t('community.settings.solutions', { defaultValue: 'Solution accepted' })],
            ['notifyStatus', t('community.settings.status', { defaultValue: 'Feature status changes' })],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-700">{label}</span>
            <input
              type="checkbox"
              checked={!!prefs[key]}
              disabled={saving}
              onChange={(e) => save({ [key]: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-[#5aab87]"
            />
          </label>
        ))}
      </div>
    </>
  );
}
