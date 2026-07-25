import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { communityApi, type CommunityCategory } from '../../services/communityApi';
import { MarkdownEditor } from '../../components/community/MarkdownEditor';
import { TagInput } from '../../components/community/TagInput';

/**
 * Compose topic page — create a new topic.
 * Requires authentication. Shows category selector + title + markdown body + tags.
 * URL: /community/new?category=:slug
 */
export function ComposeTopicPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetCategory = searchParams.get('category');

  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cats = await communityApi.getCategories();
        setCategories(cats);
        // Pre-select category from URL or first non-announcement category
        if (presetCategory) {
          const found = cats.find((c) => c.slug === presetCategory);
          if (found) setCategoryId(found.id);
        } else {
          const first = cats.find((c) => c.postingPolicy !== 'MODS_ONLY');
          if (first) setCategoryId(first.id);
        }
      } catch {
        // Categories failed to load
      }
    })();
  }, [presetCategory]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-5 rounded-xl bg-white border border-black/[0.05]">
        <p className="text-base font-semibold text-text-primary">
          {t('community.login_cta.title', { defaultValue: 'Sign in to join the conversation' })}
        </p>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {t('community.login_cta.body', {
            defaultValue: 'Post topics, reply, and vote after you log in.',
          })}
        </p>
        <Link
          to="/login?redirect=/community/new"
          className="inline-flex mt-6 h-10 px-5 items-center justify-center rounded-xl text-sm font-semibold text-white bg-[#7dc6a2] hover:bg-[#6bb892] transition-colors"
        >
          {t('community.login_cta.button', { defaultValue: 'Log in' })}
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim() || !categoryId || submitting) return;

    setSubmitting(true);
    try {
      const result = await communityApi.createTopic({
        title: title.trim(),
        body: body.trim(),
        categoryId,
        tags,
      });
      toast.success(t('community.compose.posted', { defaultValue: 'Topic created!' }));
      const cat = categories.find((c) => c.id === categoryId);
      navigate(`/community/c/${cat?.slug}/${result.slug}-${result.id}`);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error(t('community.login_cta.title', { defaultValue: 'Sign in to join the conversation' }));
        window.location.href = `/login?redirect=${encodeURIComponent('/community/new')}`;
      } else if (err?.response?.status === 429) {
        toast.error(t('community.errors.rateLimited', { defaultValue: 'Too many topics. Please wait.' }));
      } else if (err?.response?.status === 403) {
        toast.error(err?.response?.data?.message || t('community.errors.forbidden', { defaultValue: 'You cannot post here.' }));
      } else {
        toast.error(t('community.errors.actionFailed', { defaultValue: 'Failed to create topic.' }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const tagSuggestions = ['inventory', 'reporting', 'payments', 'receipts', 'hardware', 'loyalty'];

  return (
    <>
      <Helmet>
        <title>{t('community.compose.title', { defaultValue: 'New Topic' })} | {t('community.hub.title', { defaultValue: 'Community' })} | Mintcom POS</title>
      </Helmet>

      <div className="mb-4">
        <Link to="/community" className="text-sm text-gray-400 hover:text-[#5aab87]">
          ← {t('community.hub.title', { defaultValue: 'Community' })}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          {t('community.compose.title', { defaultValue: 'New Topic' })}
        </h1>
      </div>

      <div className="space-y-4">
        {/* Category selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('community.compose.category', { defaultValue: 'Category' })}
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7dc6a2]/40"
          >
            {categories
              .filter((c) => c.postingPolicy !== 'MODS_ONLY')
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('community.compose.titleLabel', { defaultValue: 'Title' })}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 160))}
            placeholder={t('community.compose.titlePlaceholder', { defaultValue: 'What is your topic about?' })}
            maxLength={160}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7dc6a2]/40"
          />
          <p className="text-xs text-gray-400 mt-0.5">{title.length} / 160</p>
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('community.compose.bodyLabel', { defaultValue: 'Body' })}
          </label>
          <MarkdownEditor
            value={body}
            onChange={setBody}
            placeholder={t('community.compose.bodyPlaceholder', { defaultValue: 'Describe your topic in detail...' })}
            maxLength={20000}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('community.compose.tagsLabel', { defaultValue: 'Tags' })}
          </label>
          <TagInput tags={tags} onChange={setTags} suggestions={tagSuggestions} />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !body.trim() || !categoryId || submitting}
            className="px-4 py-2 text-sm bg-[#7dc6a2] text-white rounded-xl hover:bg-[#6bb892] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting
              ? t('community.compose.posting', { defaultValue: 'Posting...' })
              : t('community.compose.post', { defaultValue: 'Post Topic' })}
          </button>
        </div>
      </div>
    </>
  );
}
