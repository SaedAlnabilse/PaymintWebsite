import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { communityApi } from '../../services/communityApi';
import { MarkdownEditor } from './MarkdownEditor';

interface ReplyComposerProps {
  topicId: string;
  parentReplyId?: string;
  onReplyCreated?: () => void;
}

/**
 * Reply composer — markdown editor + submit.
 * Requires authentication. Shows login prompt if not authenticated.
 */
export function ReplyComposer({ topicId, parentReplyId, onReplyCreated }: ReplyComposerProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-black/[0.05] bg-white px-4 py-5 text-center">
        <p className="text-sm text-text-secondary">
          {t('community.reply.loginToReply', { defaultValue: 'Log in to reply' })}
        </p>
        <a
          href={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
          className="inline-flex mt-3 h-9 px-4 items-center rounded-xl text-xs font-semibold text-white bg-[#7dc6a2] hover:bg-[#6bb892] transition-colors"
        >
          {t('community.login_cta.button', { defaultValue: 'Log in' })}
        </a>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!body.trim() || submitting) return;

    setSubmitting(true);
    try {
      await communityApi.createReply(topicId, {
        body: body.trim(),
        parentReplyId,
      });
      setBody('');
      toast.success(t('community.reply.posted', { defaultValue: 'Reply posted!' }));
      onReplyCreated?.();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error(t('community.reply.loginToReply', { defaultValue: 'Log in to reply' }));
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      } else if (err?.response?.status === 429) {
        toast.error(t('community.errors.rateLimited', { defaultValue: 'Too many replies. Please wait.' }));
      } else if (err?.response?.status === 403) {
        toast.error(err?.response?.data?.message || t('community.errors.forbidden', { defaultValue: 'You cannot post here.' }));
      } else {
        toast.error(t('community.errors.actionFailed', { defaultValue: 'Failed to post reply.' }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        {parentReplyId
          ? t('community.reply.replyToComment', { defaultValue: 'Reply to comment' })
          : t('community.reply.writeReply', { defaultValue: 'Write a reply' })}
      </h3>
      <MarkdownEditor
        value={body}
        onChange={setBody}
        placeholder={t('community.reply.placeholder', { defaultValue: 'Write your reply...' })}
        maxLength={10000}
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          disabled={!body.trim() || submitting}
          className="px-4 py-1.5 text-sm bg-[#7dc6a2] text-white rounded-xl hover:bg-[#6bb892] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting
            ? t('community.reply.posting', { defaultValue: 'Posting...' })
            : t('community.reply.post', { defaultValue: 'Post Reply' })}
        </button>
      </div>
    </div>
  );
}
