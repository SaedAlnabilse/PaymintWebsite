import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { communityApi } from '../../services/communityApi';

const REASONS = ['SPAM', 'ABUSE', 'OFF_TOPIC', 'HARASSMENT', 'ILLEGAL', 'OTHER'] as const;

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetType: 'TOPIC' | 'REPLY' | 'PROFILE';
  topicId?: string;
  replyId?: string;
  profileId?: string;
}

export function ReportModal({
  open,
  onClose,
  targetType,
  topicId,
  replyId,
  profileId,
}: ReportModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<string>('SPAM');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await communityApi.createReport({
        targetType,
        topicId,
        replyId,
        profileId,
        reason,
        details: details.trim() || undefined,
      });
      if (res.status === 'NOOP') {
        toast.success(t('community.moderation.reportNoop', { defaultValue: 'Already handled.' }));
      } else {
        toast.success(t('community.moderation.reportSent', { defaultValue: 'Report submitted. Thank you.' }));
      }
      onClose();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error(t('community.login_cta.title', { defaultValue: 'Sign in to join the conversation' }));
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      } else {
        toast.error(t('community.errors.actionFailed', { defaultValue: 'Failed to submit report.' }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('community.moderation.reportTitle', { defaultValue: 'Report content' })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close', { defaultValue: 'Close' })}
            className="p-2 text-gray-400 hover:text-gray-900 transition-all hover:bg-gray-100 rounded-xl border border-gray-200 shadow-sm active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('community.moderation.reason', { defaultValue: 'Reason' })}
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl mb-3"
        >
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {t(`community.moderation.reasons.${r}`, { defaultValue: r.replace(/_/g, ' ') })}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('community.moderation.details', { defaultValue: 'Details (optional)' })}
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl"
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-40"
          >
            {submitting
              ? t('community.moderation.submitting', { defaultValue: 'Submitting...' })
              : t('community.moderation.submitReport', { defaultValue: 'Submit report' })}
          </button>
        </div>
      </div>
    </div>
  );
}
