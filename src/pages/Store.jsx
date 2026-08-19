import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  X,
  Search,
  Star,
  ChevronRight,
  Package,
} from '../components/MaterialIcon';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import { categories } from '../data/products';
import { productsApi } from '../api/products.js';

/* ─── Constants ─── */
const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

const COLORS = [
  { name: 'Black',  hex: '#18181b' },
  { name: 'White',  hex: '#f4f4f5' },
  { name: 'Red',    hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green',  hex: '#22c55e' },
  { name: 'Blue',   hex: '#3b82f6' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Gold',   hex: '#b45309' },
  { name: 'Brown',  hex: '#78350f' },
];

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Popular'            },
  { value: 'newest',     label: 'Newest'             },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Rating'             },
];

/* ─── Accordion section ─── */
function Accordion({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-100 py-4 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between text-left"
        type="button"
      >
        <span className="font-semibold text-zinc-900 text-sm">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="mt-4 space-y-1">{children}</div>}
    </div>
  );
}

/* ─── Star Rating Filter ─── */
function StarRatingFilter({ selected, onChange }) {
  return (
    <div className="space-y-1">
      {[4, 3, 2].map(r => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(selected === r ? null : r)}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
            selected === r
              ? 'bg-orange-50 text-orange-600 font-medium'
              : 'text-zinc-600 hover:bg-zinc-50'
          }`}
        >
          <span className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < r ? 'text-orange-400 fill-orange-400' : 'text-zinc-200 fill-zinc-200'}`}
              />
            ))}
          </span>
          <span>{r}+ stars</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Toggle switch ─── */
function Toggle({ enabled, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-10 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
          enabled ? 'bg-orange-500' : 'bg-zinc-200'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm font-medium text-zinc-700">{label}</span>
    </label>
  );
}

/* ═══════════════════════════════════════════════════════
   FILTER PANEL — shared between sidebar and mobile drawer
═══════════════════════════════════════════════════════ */
function FilterPanel({
  productCount,
  selectedCategory, setSelectedCategory,
  priceMin, setPriceMin,
  priceMax, setPriceMax,
  selectedSizes, toggleSize,
  selectedColors, toggleColor,
  selectedRating, setSelectedRating,
  inStockOnly, setInStockOnly,
  clearAll,
  activeFilterCount,
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <h2 className="font-serif text-xl font-bold text-zinc-900">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-orange-500 hover:text-orange-700 font-semibold transition-colors"
          >
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Category */}
      <Accordion title="Category" defaultOpen>
        <div className="space-y-0.5">
          {[{ id: 'all', name: 'All Products', count: productCount }, ...categories].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                  selectedCategory === cat.id
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-zinc-100 text-zinc-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </Accordion>

      {/* Price Range */}
      <Accordion title="Price Range" defaultOpen>
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-zinc-500 font-medium">
            <span>${priceMin}</span>
            <span>${priceMax}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={priceMax}
            onChange={e => setPriceMax(Number(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Min (USD)</label>
              <input
                type="number"
                value={priceMin}
                min={0}
                max={priceMax}
                onChange={e => setPriceMin(Math.min(Number(e.target.value), priceMax))}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Max (USD)</label>
              <input
                type="number"
                value={priceMax}
                min={priceMin}
                max={1000}
                onChange={e => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
              />
            </div>
          </div>
        </div>
      </Accordion>

      {/* Size */}
      <Accordion title="Size" defaultOpen={false}>
        <div className="grid grid-cols-4 gap-1.5">
          {SIZES.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                selectedSizes.includes(size)
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-orange-400 hover:text-orange-600'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </Accordion>

      {/* Color */}
      <Accordion title="Color" defaultOpen={false}>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map(({ name, hex }) => (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => toggleColor(name)}
              className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                selectedColors.includes(name)
                  ? 'border-orange-500 ring-2 ring-orange-400/40 scale-110'
                  : 'border-zinc-300 hover:border-zinc-400'
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        {selectedColors.length > 0 && (
          <p className="mt-2 text-xs text-zinc-400">{selectedColors.join(', ')}</p>
        )}
      </Accordion>

      {/* Rating */}
      <Accordion title="Rating" defaultOpen={false}>
        <StarRatingFilter selected={selectedRating} onChange={setSelectedRating} />
      </Accordion>

      {/* In Stock */}
      <div className="border-t border-zinc-100 pt-4">
        <Toggle enabled={inStockOnly} onChange={setInStockOnly} label="In Stock Only" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STORE PAGE
═══════════════════════════════════════════════════════ */
export default function Store() {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── UI state ── */
  const [viewMode,          setViewMode]          = useState('grid');
  const [sortBy,            setSortBy]            = useState('popular');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery,       setSearchQuery]       = useState('');

  /* ── Filter state ── */
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [priceMin,         setPriceMin]         = useState(0);
  const [priceMax,         setPriceMax]         = useState(1000);
  const [selectedSizes,    setSelectedSizes]    = useState([]);
  const [selectedColors,   setSelectedColors]   = useState([]);
  const [selectedRating,   setSelectedRating]   = useState(null);
  const [inStockOnly,      setInStockOnly]      = useState(false);

  /* Load products from DB */
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  useEffect(() => {
    productsApi.list().then((data) => { setAllProducts(data); setProductsLoading(false); }).catch(() => setProductsLoading(false));
  }, []);

  /* Sync category from URL on mount / navigation */
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  /* ── Helpers ── */
  const toggleSize = size =>
    setSelectedSizes(prev => (prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]));

  const toggleColor = color =>
    setSelectedColors(prev => (prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]));

  const clearAll = () => {
    setSelectedCategory('all');
    setPriceMin(0);
    setPriceMax(1000);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedRating(null);
    setInStockOnly(false);
    setSearchQuery('');
    setSearchParams({});
  };

  const activeFilterCount = [
    selectedCategory !== 'all',
    priceMin > 0 || priceMax < 1000,
    selectedSizes.length > 0,
    selectedColors.length > 0,
    selectedRating !== null,
    inStockOnly,
    !!searchQuery,
  ].filter(Boolean).length;

  /* ── Derived: filtered + sorted products ── */
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    /* Search */
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.artisan?.toLowerCase().includes(q) ||
          p.region?.toLowerCase().includes(q)
      );
    }

    /* Category */
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(
        p => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    /* Price */
    result = result.filter(p => p.price >= priceMin && p.price <= priceMax);

    /* Sizes */
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes?.some(s => selectedSizes.includes(s)));
    }

    /* Colors */
    if (selectedColors.length > 0) {
      result = result.filter(p => p.colors?.some(c => selectedColors.includes(c)));
    }

    /* Rating */
    if (selectedRating !== null) {
      result = result.filter(p => (p.rating ?? 0) >= selectedRating);
    }

    /* In stock */
    if (inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    /* Sort */
    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'newest':
        result = [...result].sort((a, b) => b.id - a.id);
        break;
      default: /* popular */
        result = [...result].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
    }

    return result;
  }, [
    searchQuery,
    selectedCategory,
    priceMin,
    priceMax,
    selectedSizes,
    selectedColors,
    selectedRating,
    inStockOnly,
    sortBy, allProducts,
  ]);

  /* ── Active filter chips (for the chip strip below top bar) ── */
  const activeFilterChips = [
    ...(selectedCategory !== 'all'
      ? [{ label: selectedCategory, remove: () => setSelectedCategory('all') }]
      : []),
    ...(priceMin > 0 || priceMax < 1000
      ? [{ label: `$${priceMin}–$${priceMax}`, remove: () => { setPriceMin(0); setPriceMax(1000); } }]
      : []),
    ...selectedSizes.map(s => ({ label: `Size: ${s}`, remove: () => toggleSize(s) })),
    ...selectedColors.map(c => ({ label: c, remove: () => toggleColor(c) })),
    ...(selectedRating !== null
      ? [{ label: `${selectedRating}+ Stars`, remove: () => setSelectedRating(null) }]
      : []),
    ...(inStockOnly ? [{ label: 'In Stock Only', remove: () => setInStockOnly(false) }] : []),
    ...(searchQuery ? [{ label: `"${searchQuery}"`, remove: () => setSearchQuery('') }] : []),
  ];

  /* ── Shared filter panel props ── */
  const filterPanelProps = {
    productCount: allProducts.length,
    selectedCategory, setSelectedCategory,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    selectedSizes, toggleSize,
    selectedColors, toggleColor,
    selectedRating, setSelectedRating,
    inStockOnly, setInStockOnly,
    clearAll,
    activeFilterCount,
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Navbar />
      <CartDrawer />

      {/* ════════════════════════════════
          Mobile filter drawer (slide in from right)
      ════════════════════════════════ */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Panel */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h2 className="font-serif text-xl font-bold text-zinc-900">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-2 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            {/* Scrollable filter content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FilterPanel {...filterPanelProps} />
            </div>

            {/* Footer action */}
            <div className="border-t border-zinc-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-full bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          Page body
      ════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-zinc-400">
          <a href="/" className="hover:text-orange-500 transition-colors">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-medium text-zinc-900">Shop</span>
        </nav>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-zinc-900">
            Our Collection
          </h1>
          <p className="mt-1 text-zinc-500">
            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products, styles…"
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-12 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          )}
        </div>

        {/* Two-panel layout */}
        <div className="flex gap-8">

          {/* ── Sidebar (desktop only) ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="min-w-0 flex-1">

            {/* Top bar: mobile-filter button + sort + view toggle */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

              {/* Left side */}
              <div className="flex items-center gap-3">
                {/* Mobile filter trigger */}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:border-orange-400 transition-colors lg:hidden"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <span className="hidden text-sm text-zinc-500 sm:block">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2">
                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="cursor-pointer appearance-none rounded-xl border border-zinc-200 bg-white py-2 pl-4 pr-8 text-sm font-medium text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                </div>

                {/* Grid / List toggle */}
                <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                    className={`p-2.5 transition-colors ${
                      viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:bg-zinc-50'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    title="List view"
                    className={`p-2.5 transition-colors ${
                      viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:bg-zinc-50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterChips.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {activeFilterChips.map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={chip.remove}
                    className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors"
                  >
                    {chip.label}
                    <X className="w-3 h-3" />
                  </button>
                ))}

                {activeFilterChips.length > 1 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 transition-colors"
                  >
                    Clear all <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* ── Product grid / list / empty state ── */}
            {filteredProducts.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 border border-orange-100">
                  <Package className="h-12 w-12 text-orange-300" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-zinc-900 mb-2">
                  No products found
                </h3>
                <p className="max-w-sm text-zinc-500 mb-8">
                  We couldn't find anything matching your current filters. Try adjusting your selection or clearing all filters.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3 font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                >
                  Clear All Filters
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid view */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} viewMode="grid" />
                ))}
              </div>
            ) : (
              /* List view */
              <div className="flex flex-col gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} viewMode="list" />
                ))}
              </div>
            )}

            {/* Results footer */}
            {filteredProducts.length > 0 && (
              <p className="mt-10 text-center text-sm text-zinc-400">
                Showing {filteredProducts.length} of {allProducts.length} products
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
