# Handoff: Replace Lucide Icons with Custom Mintcom Branded Set

**Date:** 2026-08-07  
**Owner:** @saed  
**Scope:** Dashboard & POS card icons — unique visual identity  

---

## Problem

Mintcom uses **lucide-react** across 157+ files (221 unique icon names). These are generic open-source icons used by thousands of projects — Stripe, Vercel, Next.js, etc. The dashboard looks identical to every other POS SaaS. There is zero brand differentiation.

**Existing custom work:** `src/components/pos-demo/posPaymentIcons.tsx` already has 4 custom SVG payment icons (Cash, Card, Receipt, Split). Style guide: stroke-width 2, rounded caps, mint color `#7dc6a2`. This is the brand standard — new icons must match this.

**User feedback on first attempt:** The 12 placeholder icons I drew in `preview-icons.html` were rejected — too generic, not distinctive enough, don't feel like a premium POS product. Need fresh direction.

---

## What Needs to Change

Replace lucide icons **only on dashboard KPI cards and POS-facing surfaces**. Utility icons (arrows, chevrons, close buttons, toggles) can stay as lucide — nobody notices those.

### Files to modify (Phase 1 priority):

| File | Current Icon | What It Represents |
|---|---|---|
| `src/components/dashboard/overview/DashboardStatsCards.tsx` | Wallet, DollarSign, TrendingUp, Percent, Receipt, ShoppingBag, Scale, ArrowUp/DownRight | Revenue, Net Sales, Profit, Tax, Orders, On-Hold, Avg Order, Refunds, PayIn/PayOut |
| `src/pages/owner/OwnerOverviewPage.tsx` | Store, Building2, Users, DollarSign, Wallet, TrendingUp, Zap, UserPlus | Locations, Brands, Staff, Net Sales, Total Sales, Profit, Grow Business |
| `src/pages/brand/BrandDashboardPage.tsx` | DollarSign, ShoppingBag, Target, Users, TrendingUp, TrendingDown | Revenue, Orders, Avg Order Value, Team Size |
| `src/utils/businessTypeIcons.tsx` | UtensilsCrossed, Coffee, ShoppingBag, Building2, Store | Restaurant, Cafe, Retail, Other business types |

### Total icons to replace: ~15–20 unique dashboard card icons

---

## Options for New Icon Direction

### Option A: Geometric Stamp / Seal Style
- Circular or rounded-square background shapes
- Simple geometric symbol inside (like a stamp/seal)
- Examples: dollar = coin with leaf cutout, orders = ticket stub, staff = three dots connected by lines
- Pros: Feels official, trustworthy, financial-product appropriate
- Cons: Can look corporate if not careful

### Option B: Duotone Gradient Icons
- Two-tone color fills (mint + white, or mint + accent color)
- More modern, premium SaaS feel (Linear, Raycast style)
- Pros: Very distinctive, stands out from line-art competitors
- Cons: Harder to maintain in dark mode, more complex SVGs

### Option C: Minimal Line Art with Mint Accent
- Clean single-weight line drawings (matching posPaymentIcons style)
- One element colored in mint `#7dc6a2` per icon (accent detail)
- Example: revenue wallet outline with the leaf detail filled mint
- Pros: Easiest to implement, matches existing POS style perfectly, works in light/dark
- Cons: Less "punchy" than filled styles

### Option D: Bold Filled Icons
- Solid shape icons with mint fill + white negative-space cutouts
- Think: Notion, Figma, Linear icon systems
- Pros: High impact, very readable at small sizes
- Cons: Loses the delicate feel of the current POS design language

### Option E: Custom Illustration Style
- Hand-drawn or semi-realistic mini illustrations per icon
- Each card has a tiny scene (e.g., Revenue = stacked coins with leaf sprouting)
- Pros: Maximum brand uniqueness
- Cons: Highest effort, hardest to maintain, may not scale well to small sizes (24px)

---

## Recommended Approach

**Option C (Minimal Line Art with Mint Accent)** — it's the safest bet because:
1. Already proven in `posPaymentIcons.tsx` — this is the established style
2. Works identically in light and dark mode (`currentColor` inheritance)
3. Fast to implement — same SVG complexity level as current lucide icons
4. Can be refined gradually; easy to iterate on after launch

If the team wants bolder direction, go Option B (duotone) — but that requires a design pass first.

---

## Implementation Steps

1. **Decide icon style** — pick one of the 5 options above
2. **Design 15–20 SVG components** in `src/components/icons/` (or similar)
   - Export as React components with `size` and `className` props (same pattern as `posPaymentIcons.tsx`)
   - Use `currentColor` for stroke/fill so they inherit CSS color
   - viewBox `0 0 24 24`, stroke-width 2, round caps
3. **Replace imports** in the 4 files listed above
4. **Test** in both light and dark mode
5. **Run full app** — verify no layout shifts, icons align properly

---

## Design Reference

Open this for the rejected attempt (do NOT use these):
```
file:///Users/saed/Desktop/Mintcom/mintcom-website/preview-icons.html
```

Existing style reference (copy this energy):
```
src/components/pos-demo/posPaymentIcons.tsx
```

Brand colors:
- Primary mint: `#7dc6a2`
- Mint dark: `#5fa888`  
- Mint light: `#ace2bf`
- Surface (dark): `#1E293B`

---

## What Was NOT Done

- Full icon library replacement (only dashboard cards in scope)
- Nav/sidebar icons (out of scope for now)
- Mobile app icons
- Dark-mode specific variants (should work automatically with `currentColor`)

---

## Quick Commands

```bash
# See all lucide imports across codebase
grep -r "from 'lucide-react'" src --include="*.tsx" --include="*.jsx" | wc -l

# See which icons are used in dashboard cards specifically
grep -r "from 'lucide-react'" src/components/dashboard/ src/pages/owner/ src/pages/brand/ --include="*.tsx" -A1

# Build check
npm run build
```
