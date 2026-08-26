import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Percent, Plus, Star, Trash2, Power, Settings2, Check, X, Search } from 'lucide-react';
import api, { extractErrorMessage } from '../../config/api';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../ConfirmModal';

interface TaxRate {
  id: string;
  name: string;
  rate: string | number;
  isDefault: boolean;
  isActive: boolean;
  taxCategory: string;
}

const TAX_CATEGORIES = ['STANDARD', 'ZERO_RATED', 'EXEMPT', 'REDUCED'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  STANDARD: 'Standard',
  ZERO_RATED: 'Zero Rated',
  EXEMPT: 'Exempt',
  REDUCED: 'Reduced',
};

interface EditorState {
  id: string | null;
  name: string;
  ratePercent: string;
  taxCategory: string;
  makeDefault: boolean;
}

const emptyEditor: EditorState = {
  id: null,
  name: '',
  ratePercent: '',
  taxCategory: 'STANDARD',
  makeDefault: false,
};

export function TaxRatesManager() {
  const { t } = useTranslation();
  const [taxes, setTaxes] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TaxRate | null>(null);
  const [deleteInfo, setDeleteInfo] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/taxes', { params: { includeInactive: true } });
      const data = Array.isArray(res.data) ? res.data : [];
      setTaxes(data);
    } catch {
      setTaxes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setEditor({ ...emptyEditor });
  const openEdit = (tax: TaxRate) =>
    setEditor({
      id: tax.id,
      name: tax.name,
      ratePercent: (Number(tax.rate) * 100).toFixed(2),
      taxCategory: tax.taxCategory || 'STANDARD',
      makeDefault: tax.isDefault,
    });

  const handleSave = async () => {
    if (!editor) return;
    if (!editor.name.trim()) {
      toast.error(t('settings.taxes.nameRequired', 'Tax name is required'));
      return;
    }
    const percent = parseFloat(editor.ratePercent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      toast.error(t('settings.taxes.rateInvalid', 'Enter a rate between 0 and 100'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: editor.name.trim(),
        rate: Number((percent / 100).toFixed(6)),
        taxCategory: editor.taxCategory,
        ...(editor.id ? {} : { isDefault: editor.makeDefault }),
      };
      if (editor.id) await api.patch(`/api/taxes/${editor.id}`, payload);
      else await api.post('/api/taxes', payload);
      toast.success(t('settings.taxes.saved', 'Tax rate saved'));
      setEditor(null);
      await load();
    } catch (error) { toast.error(extractErrorMessage(error)); }
    finally { setSaving(false); }
  };

  const handleSetDefault = async (tax: TaxRate) => {
    try {
      await api.patch(`/api/taxes/${tax.id}/set-default`, {});
      toast.success(t('settings.taxes.defaultSet', '{{name}} is now the default', { name: tax.name }));
      await load();
    } catch (error) { toast.error(extractErrorMessage(error)); }
  };

  const handleToggleActive = async (tax: TaxRate) => {
    try {
      await api.patch(`/api/taxes/${tax.id}`, { isActive: !tax.isActive });
      await load();
    } catch (error) { toast.error(extractErrorMessage(error)); }
  };

  const handleDeleteRequest = async (tax: TaxRate) => {
    setDeleteTarget(tax);
    setDeleteInfo('');
    try {
      const res = await api.get(`/api/taxes/${tax.id}/delete-impact`);
      const impact = res.data;
      if (impact?.action === 'deactivate') {
        setDeleteInfo(t('settings.taxes.inUseWarning', 'Assigned to {{count}} product(s) — it will be deactivated instead of deleted.', { count: impact.referencedItems }));
      } else if (impact?.action === 'reassign_default') {
        setDeleteInfo(t('settings.taxes.isDefaultWarning', 'This is the default tax — set another tax as default first.'));
      }
    } catch { /* advisory */ }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/taxes/${deleteTarget.id}`);
      toast.success(t('settings.taxes.deleted', 'Tax deleted'));
      setDeleteTarget(null);
      await load();
    } catch (error) {
      toast.error(extractErrorMessage(error));
      setDeleteTarget(null);
    }
  };

  const filtered = taxes.filter((tax) =>
    !filter || tax.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="pt-6 border-t border-gray-100 dark:border-white/5">
        <div className="h-10 w-40 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse mb-3" />
        <div className="h-28 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
      {/* Header — same language as every other settings card header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-mintcom-green/10 flex items-center justify-center text-mintcom-green shrink-0">
            <Percent size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-black tracking-tight text-gray-900 dark:text-white leading-none">
              {t('settings.taxes.title', 'Tax Rates & Rules')}
            </h4>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-none mt-1">
              {t('settings.taxes.subtitle', 'One default · assign any rate per product')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-mintcom-green hover:bg-[#5fa888] text-black text-xs font-black tracking-wide shadow-sm transition-colors"
        >
          <Plus size={14} strokeWidth={2.5} />
          {t('settings.taxes.add', 'Add Tax')}
        </button>
      </div>

      {/* Search — only when there is something to search */}
      {taxes.length > 2 && (
        <div className="relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t('settings.taxes.searchPlaceholder', 'Search tax rates…')}
            className="w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/20 focus:border-mintcom-green transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          {filter && (
            <button
              type="button"
              onClick={() => setFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 grid place-items-center rounded-lg bg-gray-100 dark:bg-white/10 text-gray-400 hover:text-gray-600"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          )}
        </div>
      )}

      {/* Empty state — generous, dashed, centered */}
      {taxes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02] px-6 py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 mx-auto grid place-items-center mb-3 shadow-sm">
            <Settings2 size={18} className="text-gray-400" />
          </div>
          <p className="text-sm font-black text-gray-900 dark:text-white">
            {t('settings.taxes.emptyTitle', 'No tax rates yet')}
          </p>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {t('settings.taxes.emptyDesc', 'Create your first rate — e.g. Standard 16%, Reduced 8%, or Zero-rated 0%. One of them will be the default for new products.')}
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-mintcom-green hover:bg-[#5fa888] text-black text-xs font-black shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} />
            {t('settings.taxes.createFirst', 'Create tax rate')}
          </button>
        </div>
      )}

      {/* No matches after filtering */}
      {taxes.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] px-6 py-6 text-center">
          <p className="text-xs font-bold text-gray-400">
            {t('settings.taxes.noMatches', 'No rates match “{{q}}”', { q: filter })}
          </p>
          <button
            type="button"
            onClick={() => setFilter('')}
            className="mt-2 text-xs font-black text-mintcom-green hover:underline"
          >
            {t('common.clearSearch', 'Clear search')}
          </button>
        </div>
      )}

      {/* Table — premium bordered container, consistent with the rest of Settings */}
      {filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F172A] shadow-sm">
          {/* Subtle header strip */}
          <div className="hidden sm:grid grid-cols-[1fr_92px_110px_88px_148px] gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/[0.04] border-b border-gray-100 dark:border-white/5">
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{t('settings.taxes.colName', 'Name')}</span>
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase text-right">{t('settings.taxes.colRate', 'Rate')}</span>
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{t('settings.taxes.colCategory', 'Category')}</span>
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{t('settings.taxes.colStatus', 'Status')}</span>
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase text-right">{t('common.actions', 'Actions')}</span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {filtered.map((tax) => (
              <div
                key={tax.id}
                className="grid sm:grid-cols-[1fr_92px_110px_88px_148px] gap-2 sm:gap-2 px-4 py-3 items-center hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Name + default */}
                <div className="flex items-center gap-2 min-w-0 order-1">
                  <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{tax.name}</span>
                  {tax.isDefault && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-mintcom-green/10 border border-mintcom-green/15 px-2 py-0.5 text-[10px] font-black tracking-wide text-mintcom-green">
                      <Star size={10} fill="currentColor" />
                      {t('common.default', 'Default')}
                    </span>
                  )}
                </div>

                {/* Rate */}
                <div className="order-3 sm:order-2 flex sm:justify-end items-center gap-1">
                  <span className="text-sm font-black tracking-tight text-gray-900 dark:text-white tabular-nums">
                    {(Number(tax.rate) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
                  </span>
                </div>

                {/* Category */}
                <div className="order-4 sm:order-3">
                  <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-2.5 py-1 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                    {CATEGORY_LABELS[tax.taxCategory] ?? tax.taxCategory}
                  </span>
                </div>

                {/* Status */}
                <div className="order-2 sm:order-4 flex sm:justify-start justify-end">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black tracking-wide border ${
                    tax.isActive
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/15'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200/60 dark:border-white/10'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tax.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {tax.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                  </span>
                </div>

                {/* Actions — icon row on desktop, keeps the table breathing */}
                <div className="order-5 flex items-center justify-end gap-1">
                  {!tax.isDefault && tax.isActive && (
                    <button
                      type="button"
                      title={t('settings.taxes.setDefault', 'Set as default')}
                      onClick={() => handleSetDefault(tax)}
                      className="w-8 h-8 grid place-items-center rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/15 transition-colors"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    title={tax.isActive ? t('common.deactivate', 'Deactivate') : t('common.activate', 'Activate')}
                    onClick={() => handleToggleActive(tax)}
                    className={`w-8 h-8 grid place-items-center rounded-xl border transition-colors ${
                      tax.isActive
                        ? 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10'
                        : 'border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {tax.isActive ? <Power size={14} /> : <Check size={14} strokeWidth={2.5} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(tax)}
                    className="h-8 px-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                  >
                    {t('common.edit', 'Edit')}
                  </button>
                  <button
                    type="button"
                    title={t('common.delete', 'Delete')}
                    onClick={() => handleDeleteRequest(tax)}
                    disabled={taxes.length <= 1}
                    className="w-8 h-8 grid place-items-center rounded-xl border border-red-200/60 dark:border-red-500/20 bg-white dark:bg-white/5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 bg-gray-50/60 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('settings.taxes.footnote', 'Taxes already assigned to products keep their rate even if you change the rate here. To reassign products, open the Products page and edit each product’s tax.')}
            </p>
          </div>
        </div>
      )}

      {/* Editor — consistent with every other Settings overlay on the site */}
      {editor && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setEditor(null)} />
          <div className="relative w-full sm:max-w-[480px] bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-black tracking-tight text-gray-900 dark:text-white">
                  {editor.id ? t('settings.taxes.editTitle', 'Edit Tax Rate') : t('settings.taxes.createTitle', 'New Tax Rate')}
                </h3>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                  {t('settings.taxes.editorHint', 'Rates are stored as percentages and saved as fractions (16% → 0.1600).')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditor(null)}
                disabled={saving}
                className="w-8 h-8 grid place-items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black tracking-wide text-gray-600 dark:text-gray-300">
                {t('settings.taxes.fieldName', 'Tax Name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editor.name}
                maxLength={60}
                onChange={(e) => setEditor({ ...editor, name: e.target.value })}
                placeholder={t('settings.taxes.namePlaceholder', 'e.g. Standard VAT')}
                className="w-full h-11 px-3.5 bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/15 rounded-xl text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/25 focus:border-mintcom-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black tracking-wide text-gray-600 dark:text-gray-300">
                  {t('settings.taxes.fieldRate', 'Rate %')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editor.ratePercent}
                    onChange={(e) => setEditor({ ...editor, ratePercent: e.target.value.replace(/[^0-9.]/g, '') })}
                    placeholder="16"
                    className="w-full h-11 pl-3.5 pr-8 bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/15 rounded-xl text-sm font-black tabular-nums text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mintcom-green/25 focus:border-mintcom-green"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 pointer-events-none">%</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black tracking-wide text-gray-600 dark:text-gray-300">
                  {t('settings.taxes.fieldCategory', 'Category')}
                </label>
                <select
                  value={editor.taxCategory}
                  onChange={(e) => setEditor({ ...editor, taxCategory: e.target.value })}
                  className="w-full h-11 px-3.5 bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/15 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mintcom-green/25 focus:border-mintcom-green"
                >
                  {TAX_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3.5 py-3 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={editor.makeDefault}
                onChange={(e) => setEditor({ ...editor, makeDefault: e.target.checked })}
                className="w-4 h-4 rounded accent-mintcom-green"
              />
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {t('settings.taxes.makeDefault', 'Make this the default tax')}
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditor(null)}
                disabled={saving}
                className="px-4 h-10 rounded-xl text-sm font-black text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 h-10 rounded-xl bg-mintcom-green hover:bg-[#5fa888] text-black text-sm font-black shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? t('common.saving', 'Saving…') : t('common.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t('settings.taxes.deleteTitle', 'Delete tax rate?')}
        message={deleteInfo || t('settings.taxes.deleteMessage', 'Delete “{{name}}”?', { name: deleteTarget?.name ?? '' })}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        type="danger"
      />
    </div>
  );
}
