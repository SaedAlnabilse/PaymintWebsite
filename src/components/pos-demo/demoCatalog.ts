/**
 * Shared try-pos session catalog — products, categories, add-ons soft-saved
 * for the lifetime of the playground (reset when user exits /try-pos).
 */

export type DemoCatalogCategory = {
  id: string;
  name: string;
  emoji: string;
  /** Icon key (mirrors POS category icon picker); preferred over emoji when set. */
  icon?: string;
  active: boolean;
};

export type DemoCatalogAddonOption = {
  id: string;
  name: string;
  price: number;
  /** Add-on availability (Stock Management → Add-on Availability). Defaults to true. */
  available?: boolean;
};

export type DemoCatalogAddon = {
  id: string;
  name: string;
  multi?: boolean;
  required?: boolean;
  options: DemoCatalogAddonOption[];
};

export type DemoCatalogProduct = {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  emoji: string;
  categoryId: string;
  active: boolean;
  description?: string;
  trackStock?: boolean;
  availableStock?: number;
  yellowThreshold?: number;
  redThreshold?: number;
  allowNegativeStock?: boolean;
  attributeIds?: string[];
  imageDataUrl?: string | null;
};

export type DemoCatalog = {
  categories: DemoCatalogCategory[];
  products: DemoCatalogProduct[];
  addons: DemoCatalogAddon[];
};

export type SalesMenuProduct = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  categoryId: string;
  imageDataUrl?: string | null;
  trackStock?: boolean;
  availableStock?: number;
  attributes?: {
    id: string;
    name: string;
    multi?: boolean;
    required?: boolean;
    options: { id: string; name: string; price: number; available?: boolean }[];
  }[];
};

export type SalesMenuCategory = {
  id: string;
  name: string;
  emoji: string;
};

const SEED_ADDONS: DemoCatalogAddon[] = [
  {
    id: 'size',
    name: 'Size',
    required: true,
    options: [
      { id: 's', name: 'S', price: 0 },
      { id: 'm', name: 'M', price: 0.5 },
      { id: 'l', name: 'L', price: 1 },
    ],
  },
  {
    id: 'milk',
    name: 'Milk',
    options: [
      { id: 'whole', name: 'Whole', price: 0 },
      { id: 'oat', name: 'Oat', price: 0.75 },
      { id: 'almond', name: 'Almond', price: 0.75 },
    ],
  },
  {
    id: 'extras',
    name: 'Extras',
    multi: true,
    options: [
      { id: 'shot', name: 'Extra shot', price: 1 },
      { id: 'syrup', name: 'Vanilla syrup', price: 0.5 },
      { id: 'whip', name: 'Whipped cream', price: 0.5 },
    ],
  },
  {
    id: 'heat',
    name: 'Warming',
    options: [
      { id: 'plain', name: 'As is', price: 0 },
      { id: 'warm', name: 'Warmed', price: 0.25 },
    ],
  },
  {
    id: 'toppings',
    name: 'Add-ons',
    multi: true,
    options: [
      { id: 'cheese', name: 'Extra cheese', price: 1 },
      { id: 'avocado', name: 'Avocado', price: 1.5 },
      { id: 'bacon', name: 'Bacon', price: 1.5 },
    ],
  },
  {
    id: 'dressing',
    name: 'Dressing',
    options: [
      { id: 'ranch', name: 'Ranch', price: 0 },
      { id: 'caesar', name: 'Caesar', price: 0 },
      { id: 'balsamic', name: 'Balsamic', price: 0.5 },
    ],
  },
];

const SEED_CATEGORIES: DemoCatalogCategory[] = [
  { id: 'beverages', name: 'Beverages', emoji: '', icon: 'coffee', active: true },
  { id: 'pastries', name: 'Pastries', emoji: '', icon: 'croissant', active: true },
  { id: 'food', name: 'Food', emoji: '', icon: 'utensils', active: true },
  { id: 'desserts', name: 'Desserts', emoji: '', icon: 'cake', active: true },
];

const SEED_PRODUCTS: DemoCatalogProduct[] = [
  {
    id: 'espresso',
    name: 'Espresso',
    price: 3.5,
    emoji: '',
    categoryId: 'beverages',
    active: true,
    attributeIds: ['size', 'extras'],
    trackStock: true,
    availableStock: 48,
  },
  {
    id: 'latte',
    name: 'Latte',
    price: 4.5,
    emoji: '',
    categoryId: 'beverages',
    active: true,
    attributeIds: ['size', 'milk', 'extras'],
    trackStock: true,
    availableStock: 35,
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    price: 4.25,
    emoji: '',
    categoryId: 'beverages',
    active: true,
    attributeIds: ['size', 'milk', 'extras'],
    trackStock: true,
    availableStock: 22,
  },
  {
    id: 'coldbrew',
    name: 'Cold brew',
    price: 4.75,
    emoji: '',
    categoryId: 'beverages',
    active: true,
    attributeIds: ['size', 'milk'],
    trackStock: true,
    availableStock: 18,
  },
  {
    id: 'soda',
    name: 'Soda',
    price: 2.5,
    emoji: '',
    categoryId: 'beverages',
    active: true,
    attributeIds: ['size'],
    trackStock: true,
    availableStock: 60,
  },
  {
    id: 'tea',
    name: 'Tea',
    price: 2.75,
    emoji: '',
    categoryId: 'beverages',
    active: true,
    attributeIds: ['size', 'milk'],
    trackStock: true,
    availableStock: 40,
  },
  {
    id: 'croissant',
    name: 'Croissant',
    price: 4,
    emoji: '',
    categoryId: 'pastries',
    active: true,
    attributeIds: ['heat'],
    trackStock: true,
    availableStock: 12,
  },
  {
    id: 'muffin',
    name: 'Muffin',
    price: 3.25,
    emoji: '',
    categoryId: 'pastries',
    active: true,
    attributeIds: ['heat'],
    trackStock: true,
    availableStock: 15,
  },
  {
    id: 'bagel',
    name: 'Bagel',
    price: 3.75,
    emoji: '',
    categoryId: 'pastries',
    active: true,
    attributeIds: ['heat', 'toppings'],
    trackStock: true,
    availableStock: 20,
  },
  {
    id: 'cookie',
    name: 'Cookie',
    price: 2,
    emoji: '',
    categoryId: 'pastries',
    active: true,
    trackStock: true,
    availableStock: 35,
  },
  {
    id: 'salad',
    name: 'Garden salad',
    price: 6.5,
    emoji: '',
    categoryId: 'food',
    active: true,
    attributeIds: ['dressing', 'toppings'],
  },
  {
    id: 'sandwich',
    name: 'Club sandwich',
    price: 7.5,
    emoji: '',
    categoryId: 'food',
    active: true,
    attributeIds: ['toppings'],
  },
  {
    id: 'soup',
    name: 'Soup of day',
    price: 5.5,
    emoji: '',
    categoryId: 'food',
    active: true,
    attributeIds: ['size'],
  },
  {
    id: 'wrap',
    name: 'Chicken wrap',
    price: 8,
    emoji: '',
    categoryId: 'food',
    active: true,
    attributeIds: ['toppings'],
  },
  {
    id: 'cheesecake',
    name: 'Cheesecake',
    price: 5.5,
    emoji: '',
    categoryId: 'desserts',
    active: true,
  },
  {
    id: 'brownie',
    name: 'Brownie',
    price: 3.5,
    emoji: '',
    categoryId: 'desserts',
    active: true,
    attributeIds: ['heat'],
  },
];

export function createInitialCatalog(): DemoCatalog {
  // Deep clone so mutations never touch the seed constants
  return {
    categories: SEED_CATEGORIES.map((c) => ({ ...c })),
    products: SEED_PRODUCTS.map((p) => ({
      ...p,
      attributeIds: p.attributeIds ? [...p.attributeIds] : [],
    })),
    addons: SEED_ADDONS.map((a) => ({
      ...a,
      options: a.options.map((o) => ({ ...o })),
    })),
  };
}

/** Categories for Sales header: "All Menu" + active categories */
export function salesCategoriesFromCatalog(catalog: DemoCatalog): SalesMenuCategory[] {
  return [
    { id: 'all', name: 'All Menu', emoji: '' },
    ...catalog.categories
      .filter((c) => c.active)
      .map((c) => ({ id: c.id, name: c.name, emoji: c.emoji })),
  ];
}

/** Active products for Sales grid, with add-on groups resolved */
export function salesProductsFromCatalog(catalog: DemoCatalog): SalesMenuProduct[] {
  const addonMap = new Map(catalog.addons.map((a) => [a.id, a]));
  return catalog.products
    .filter((p) => p.active)
    .map((p) => {
      const attributes = (p.attributeIds ?? [])
        .map((id) => addonMap.get(id))
        .filter(Boolean)
        .map((a) => ({
          id: a!.id,
          name: a!.name,
          multi: a!.multi,
          required: a!.required,
          options: a!.options.map((o) => ({ ...o })),
        }));
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        emoji: p.emoji,
        categoryId: p.categoryId,
        imageDataUrl: p.imageDataUrl,
        trackStock: p.trackStock,
        availableStock: p.availableStock,
        attributes: attributes.length ? attributes : undefined,
      };
    });
}
