import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { communityApi } from '../../services/communityApi';

const ACTIONS = [
  'HIDE',
  'UNHIDE',
  'LOCK',
  'UNLOCK',
  'PIN',
  'UNPIN',
  'DELETE',
  'WARN',
  'SUSPEND',
  'BAN',
  'UNBAN',
  'SHADOWBAN',
] as const;

interface ModActionMenuProps {
  targetType: 'TOPIC' | 'REPLY' | 'PROFILE';
  topicId?: string;
  replyId?: string;
  profileId?: string;
  canModerate: boolean;
  onDone?: () => void;
}

/**
 * Minimal inline mod menu for website (full queue lives in admin portal).
 * Only rendered when canModerate is true.
 */
export function ModActionMenu({
  targetType,
  topicId,
  replyId,
  profileId,
  canModerate,
  onDone,
}: ModActionMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!canModerate) return null;

  const relevant =
    targetType === 'TOPIC'
      ? (['HIDE', 'UNHIDE', 'LOCK', 'UNLOCK', 'PIN', 'UNPIN', 'DELETE'] as const)
      : targetType === 'REPLY'
        ? (['HIDE', 'UNHIDE', 'DELETE'] as const)
        : (['WARN', 'SUSPEND', 'BAN', 'SHADOWBAN', 'UNBAN'] as const);

  const run = async (action: string) => {
    setBusy(true);
    try {
      await communityApi.performModAction({
        action,
        targetType,
        topicId,
        replyId,
        profileId,
      });
      toast.success(t('community.moderation.actionDone', { defaultValue: 'Action applied' }));
      setOpen(false);
      onDone?.();
    } catch (err: any) {
      if (err?.response?.status === 403) {
        toast.error(t('community.errors.forbidden', { defaultValue: 'No permission.' }));
      } else {
        toast.error(t('community.errors.actionFailed', { defaultValue: 'Action failed.' }));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        {t('community.moderation.mod', { defaultValue: 'Mod' })}
      </button>
      {open && (
        <div className="absolute end-0 mt-1 z-20 w-40 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
          {relevant.map((a) => (
            <button
              key={a}
              type="button"
              disabled={busy}
              onClick={() => run(a)}
              className="block w-full text-start px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              {t(`community.moderation.actions.${a}`, { defaultValue: a })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
