import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  onImageUpload?: (file: File) => Promise<string>;
}

/**
 * Lightweight markdown editor — textarea + toolbar + live preview.
 * Toolbar inserts markdown syntax at cursor position.
 * Image upload optional (calls onImageUpload, inserts markdown image).
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  maxLength = 20000,
  onImageUpload,
}: MarkdownEditorProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSyntax = (before: string, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || placeholder;
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);

    onChange(newValue);
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selected.length;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    setUploading(true);
    try {
      const url = await onImageUpload(file);
      insertSyntax(`![${file.name}](${url})`);
    } catch {
      // Error handled by caller via toast
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toolbarButtons = [
    { label: 'B', title: 'Bold', action: () => insertSyntax('**', '**', 'bold text') },
    { label: 'I', title: 'Italic', action: () => insertSyntax('*', '*', 'italic text') },
    { label: '"', title: 'Quote', action: () => insertSyntax('> ', '', 'quoted text') },
    { label: '•', title: 'List', action: () => insertSyntax('- ', '', 'list item') },
    { label: '1.', title: 'Numbered list', action: () => insertSyntax('1. ', '', 'item') },
    { label: '<>', title: 'Code', action: () => insertSyntax('`', '`', 'code') },
    { label: '🔗', title: 'Link', action: () => insertSyntax('[', '](https://)', 'link text') },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.title}
            type="button"
            title={btn.title}
            onClick={btn.action}
            className="w-7 h-7 flex items-center justify-center rounded text-sm text-gray-600 hover:bg-gray-200"
          >
            {btn.label}
          </button>
        ))}

        {onImageUpload && (
          <label
            title={t('community.editor.uploadImage', { defaultValue: 'Upload image' })}
            className="w-7 h-7 flex items-center justify-center rounded text-sm text-gray-600 hover:bg-gray-200 cursor-pointer"
          >
            {uploading ? '⏳' : '📷'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        )}

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="px-2 py-1 text-xs rounded text-gray-600 hover:bg-gray-200"
        >
          {showPreview
            ? t('community.editor.edit', { defaultValue: 'Edit' })
            : t('community.editor.preview', { defaultValue: 'Preview' })}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className="prose prose-sm max-w-none p-3 min-h-[120px] text-gray-700"
          dir="auto"
          dangerouslySetInnerHTML={{
            __html: renderMarkdownPreview(value),
          }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          dir="auto"
          className="w-full p-3 min-h-[120px] focus:outline-none resize-y text-gray-700"
        />
      )}

      {/* Character count */}
      <div className="flex justify-end px-3 py-1 text-xs text-gray-400 border-t border-gray-100">
        {value.length} / {maxLength}
      </div>
    </div>
  );
}

/**
 * Client-side markdown preview (basic — not XSS-safe, used for preview only).
 * The server stores sanitized bodyHtml which is what gets rendered to users.
 */
function renderMarkdownPreview(markdown: string): string {
  // Very basic markdown → HTML for preview (not for production rendering)
  return markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/m, '<p>$1</p>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="nofollow ugc" target="_blank">$1</a>');
}
