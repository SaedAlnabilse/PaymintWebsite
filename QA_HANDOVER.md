# QA Fix Handover — Website (mintcom-website)

## Summary

The QA platform (`MINT-*`) targets the **web app** (`mintcom-website/`), not the React Native admin portal or POS apps.  
All fixes below were applied to `mintcom-website/src/`.

---

## Fixed Issues (9/9) ✅

| ID | Area | Status | File(s) Changed |
|---|---|---|---|
| MINT-ONB-010 | Onboarding — Launch Page | ✅ **FIXED** | `pages/OnboardingPage.tsx` |
| MINT-RPT-006 | Reports — Staff Filter | ✅ **FIXED** | `pages/dashboard/ReportsPage.tsx` |
| MINT-RPT-007 | Reports — Shift Filter | ✅ **FIXED** | `components/SingleSelect.tsx` |
| MINT-RPT-010 | Reports — PDF Visual Formatting | ✅ **FIXED** | `utils/export.ts` |
| MINT-ACT-001 | Activity Log — Data Column | ✅ **FIXED** | `pages/dashboard/ActivityLogsPage.tsx` |
| MINT-ACT-002 | Activity Log — User Privacy | ✅ **FIXED** | `pages/dashboard/ActivityLogsPage.tsx`, `mintcom-admin-portal/.../ActivityLogsScreen.tsx` |
| MINT-ACT-003 | Activity Log — Search by Resource | ✅ **FIXED** | `pages/dashboard/ActivityLogsPage.tsx` |
| MINT-ACT-004 | Activity Log — Discount Formatting | ✅ **FIXED** | `mintcom-api/.../app-settings.service.ts` |
| MINT-SET-001 | Settings — E-Invoicing Template | ✅ **FIXED** | `components/InvoicePreviewCard.tsx`, `pages/dashboard/SettingsPage.tsx` |

---

## Detailed Change Log

### 1. MINT-ONB-010 — POS Password Security *(previous dev)*
**File:** `mintcom-website/src/pages/OnboardingPage.tsx`

**Change:** Removed the reveal/copy controls on the launch page password row. The password is now always masked as `********`.  
**Diff:** Removed the `showEstablishmentPassword` toggle button and copy button from the final onboarding summary card.

```diff
- {showEstablishmentPassword ? formData.establishmentPassword : '********'}
+ {'********'}
```
And removed the surrounding `<div className="flex items-center gap-1">` containing the eye and copy buttons.

---

### 2. MINT-RPT-006 — Staff Filter *(previous dev)*
**File:** `mintcom-website/src/pages/dashboard/ReportsPage.tsx`

**Change:** Switched from `/reports/employees` (which returned only owner) to `/api/users` (full staff list).  
**Diff:**
```diff
- const res = await api.get('/reports/employees');
- setEmployees(res.data?.map((u: any) => ({ label: u.name, value: u.id })) || []);
+ const res = await api.get('/api/users');
+ setEmployees((res.data || []).map((u: any) => ({ label: u.name || u.username, value: u.id })));
```

---

### 3. MINT-RPT-007 — Shift Filter *(previous dev)*
**File:** `mintcom-website/src/components/SingleSelect.tsx`

**Change:** Fixed the dropdown's click-outside / scroll / resize listeners to use stable callback refs (`useCallback` + `useRef`) so React's effect cleanup doesn't remove listeners while the dropdown is open.

---

### 4. MINT-RPT-010 — PDF Visual Formatting *(previous dev)*
**File:** `mintcom-website/src/utils/export.ts`

**Change:** Reduced character spacing and font size to eliminate excessive/inconsistent spacing in exported PDFs.  
**Diff:**
```diff
+ doc.setCharSpace(0.5);
  const marginX = 40;
```
And in `autoTable` options:
```diff
- styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' }
+ styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' }
```

---

### 5. MINT-ACT-001 — Data Column Shows Inline Summary
**File:** `mintcom-website/src/pages/dashboard/ActivityLogsPage.tsx`

**Change:** The desktop table's Data column now shows an inline metadata summary (first 2 key-value pairs, truncated) alongside the detail button. When no metadata exists, an em dash (—) is displayed.

```diff
- {log.metadata && Object.keys(log.metadata).length > 0 ? (
-   <div className="flex justify-end">
-     <button ...><FileText /></button>
-   </div>
- ) : null}
+ {log.metadata && Object.keys(log.metadata).length > 0 ? (
+   <div className="flex items-center justify-end gap-2">
+     <span className="text-xs ... truncate">{getMetadataSummary(log.metadata)}</span>
+     <button ...><FileText /></button>
+   </div>
+ ) : (
+   <span className="text-xs ...">—</span>
+ )}
```

Added `getMetadataSummary()` helper that extracts first 2 entries with a `(+N)` suffix for remaining entries.

---

### 6. MINT-ACT-002 — IP Address Removed from Exports
**Files:** `mintcom-website/src/pages/dashboard/ActivityLogsPage.tsx`, `mintcom-admin-portal/src/screens/dashboard/ActivityLogsScreen.tsx`

**Change:** Removed IP address from both the website and admin portal activity log exports. IP was never displayed in the table UI but was included in CSV/PDF/Excel exports.

```diff
  const exportData = logsToExport.map(l => ({
    time: formatDate(l.timestamp),
    user: getActorName(l),
    action: l.action,
    desc: l.description,
-   ip: l.ipAddress
  }));
  // ...
  columns: [
    { key: 'time', label: t('activity.time') },
    { key: 'user', label: t('activity.user') },
    { key: 'action', label: t('activity.action') },
    { key: 'desc', label: t('activity.details') },
-   { key: 'ip', label: t('activity.ip') },
  ],
```

---

### 7. MINT-ACT-003 — Resource Type Filter Added
**File:** `mintcom-website/src/pages/dashboard/ActivityLogsPage.tsx`

**Change:** Added a "Resource type" filter dropdown (Products, Categories, Staff, Discounts, Payment Methods, Orders, Settings, Attributes). The frontend passes the selected value as `params.resource` to the backend API, which already supported this parameter with full term-matching logic.

The filter also appears as a purple chip in the active filter summary bar and is cleared by "Clear all".

---

### 8. MINT-ACT-004 — Discount Percentage Display Normalized
**File:** `mintcom-api/src/app-settings/app-settings.service.ts`

**Change:** Added `displayPercentage()` helper method. The DB stores percentages as `Decimal(5,2)` but different clients may write either whole numbers (10 = 10%) or decimal fractions (0.10 = 10%). The helper detects the format and normalizes for display:
- Values > 1 → used as-is (10 → "10%")
- Values ≤ 1 → multiplied by 100 (0.10 → "10%")

Applied to both "Added discount" and "Updated discount" activity log descriptions.

```diff
- `Created discount "${newDiscount.name}" with ${newDiscount.percentage.toString()}% off`
+ const displayPct = this.displayPercentage(toNumber(newDiscount.percentage));
+ `Created discount "${newDiscount.name}" with ${displayPct}% off`
```

---

### 9. MINT-SET-001 — E-Invoicing Invoice Template Preview
**Files:** `mintcom-website/src/components/InvoicePreviewCard.tsx` (new), `mintcom-website/src/pages/dashboard/SettingsPage.tsx`

**Change:** Created a new `InvoicePreviewCard` component that renders a full invoice preview matching the Mintcom template design from `docs/invoice-template/mintcom-invoice-sample.html`. The component:

- Renders a branded invoice with the Mintcom green gradient header + leaf logo
- Personalizes with the establishment's name, currency, and tax rate from settings
- Shows sample line items, tax calculation, payment info, and footer
- Includes a "Print / Save PDF" button that opens a clean print window
- Integrated into the E-Invoicing settings tab below the `FiscalComplianceCard`

```diff
  {activeTab === 'einvoicing' && (
-   <FiscalComplianceCard ... />
+   <div className="space-y-6">
+     <FiscalComplianceCard ... />
+     <InvoicePreviewCard
+       establishmentName={currentEstablishment?.name}
+       currency={settings?.currency}
+       taxRate={typeof settings?.taxRate === 'number' ? settings.taxRate : undefined}
+     />
+   </div>
  )}
```
