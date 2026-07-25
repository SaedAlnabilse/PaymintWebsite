import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  suggestions?: string[];
}

/**
 * Tag input — type and press Enter to add a tag.
 * Max 5 tags. Shows suggestions if provided.
 */
export function TagInput({
  tags,
  onChange,
  maxTags = 5,
  suggestions = [],
}: TagInputProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmed && tags.length < maxTags && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions
    .filter((s) => s.toLowerCase().includes(input.toLowerCase()))
    .filter((s) => !tags.includes(s.toLowerCase()))
    .slice(0, 5);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 p-2 border border-gray-200 rounded-xl min-h-[42px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#7dc6a2]/18 text-[#3d7a5c]"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-[#2f6b4f]"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? t('community.compose.tagPlaceholder', { defaultValue: 'Add tags (Enter to add)' }) : ''}
          disabled={tags.length >= maxTags}
          className="flex-1 min-w-[80px] text-sm focus:outline-none bg-transparent"
        />
      </div>

      {/* Suggestions */}
      {input && filteredSuggestions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
