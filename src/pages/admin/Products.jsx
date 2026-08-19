import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus, Search, Star, Pencil, Trash2,
  ChevronLeft, ChevronRight, Package, CheckSquare, Check, X,
} from '../../components/MaterialIcon';
import { productsApi } from '../../api/products.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 8;

const TABS = ['All', 'Clothing', 'Bags', 'Jewelry', 'Accessories'];

const categoryStyles = {
  Clothing: 'bg-indigo-50 text-indigo-700',
  Bags: 'bg-amber-50 text-amber-700',
  Jewelry: 'bg-pink-50 text-pink-700',
  Accessories: 'bg-teal-50 text-teal-700',
};

const badgeStyles = {
  'New Arrival': 'bg-blue-50 text-blue-700 border border-blue-100',
  'Best Seller': 'bg-orange-50 text-orange-600 border border-orange-100',
  'Sale': 'bg-red-50 text-red-600 border border-red-100',
};

const StarRow = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={11}
        className={
          i < Math.floor(rating)
            ? 'fill-amber-400 text-amber-400'
            : 'fill-zinc-200 text-zinc-200'
        }
      />
    ))}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
        toast.type === 'error' ? 'bg-red-500' : 'bg-zinc-900'
      }`}
    >
      <Check size={15} className="flex-shrink-0" />
      {toast.message}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);

  // ── Add / Edit Product Modal ───────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const [imagePreview, setImagePreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const EMPTY_DRAFT = {
    name: '', category: 'Clothing', price: '',
    artisan: '', region: '', badge: '',
    inStock: true, description: '',
    sizes: '', colors: '', imageUrl: '', galleryImages: '',
  };
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const handleDraftChange = (field, value) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'));
    const images = await Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
      })));
    setGalleryPreviews((current) => [...current, ...images]);
    event.target.value = '';
  };

  // ── API fetch ──────────────────────────────────────────────────────────────

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.list();
      setItems(data);
    } catch (err) {
      setError(err?.message || 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setDraft(EMPTY_DRAFT);
    setImagePreview('');
    setGalleryPreviews([]);
    setImageMode('url');
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setDraft(EMPTY_DRAFT);
    setImagePreview('');
    setGalleryPreviews([]);
    setImageMode('url');
    setShowAddModal(true);
  };

  // ── Add mode ───────────────────────────────────────────────────────────────

  const handleSubmitProduct = async () => {
    if (!draft.name.trim() || !draft.price) {
      showToast('Name and price are required', 'error');
      return;
    }
    const image =
      imageMode === 'upload'
        ? imagePreview
        : draft.imageUrl.trim() || '';
    const productData = {
      name: draft.name.trim(),
      category: draft.category,
      price: parseFloat(draft.price),
      artisan: draft.artisan.trim() || 'Unknown Artisan',
      region: draft.region.trim() || 'Unknown Region',
      badge: draft.badge || null,
      inStock: draft.inStock,
      description: draft.description.trim(),
      sizes: draft.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: draft.colors.split(',').map((s) => s.trim()).filter(Boolean),
      image,
      images: galleryPreviews,
    };
    try {
      const created = await productsApi.create(productData);
      setItems((prev) => [created, ...prev]);
      closeModal();
      showToast(`"${created.name}" added successfully`);
    } catch (err) {
      showToast(err?.message || 'Failed to add product', 'error');
    }
  };

  // ── Edit mode ──────────────────────────────────────────────────────────────

  const handleEdit = (product) => {
    setEditingProduct(product);
    setDraft({
      name: product.name,
      category: product.category,
      price: String(product.price),
      artisan: product.artisan || '',
      region: product.region || '',
      badge: product.badge || '',
      inStock: product.inStock,
      description: product.description || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || ''),
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors || ''),
      imageUrl: product.image || '',
      galleryImages: '',
    });
    setImagePreview(product.image || '');
    setGalleryPreviews(product.images ?? []);
    setImageMode('url');
    setShowAddModal(true);
  };

  const handleSubmitEdit = async () => {
    if (!draft.name.trim() || !draft.price) {
      showToast('Name and price are required', 'error');
      return;
    }
    const image =
      imageMode === 'upload'
        ? imagePreview
        : draft.imageUrl.trim() || '';
    const productData = {
      name: draft.name.trim(),
      category: draft.category,
      price: parseFloat(draft.price),
      artisan: draft.artisan.trim() || 'Unknown Artisan',
      region: draft.region.trim() || 'Unknown Region',
      badge: draft.badge || null,
      inStock: draft.inStock,
      description: draft.description.trim(),
      sizes: draft.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: draft.colors.split(',').map((s) => s.trim()).filter(Boolean),
      image,
      images: galleryPreviews,
    };
    try {
      const updated = await productsApi.update(editingProduct.id, productData);
      setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      closeModal();
      showToast(`"${updated.name}" updated successfully`);
    } catch (err) {
      showToast(err?.message || 'Failed to update product', 'error');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    try {
      await productsApi.delete(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      showToast('Product deleted successfully');
    } catch (err) {
      showToast(err?.message || 'Failed to delete product', 'error');
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.length;
    try {
      await productsApi.bulkDelete(selectedIds);
      setItems((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      showToast(`${count} product${count > 1 ? 's' : ''} deleted`);
    } catch (err) {
      showToast(err?.message || 'Failed to delete products', 'error');
    }
  };

  const handleAddProduct = openAddModal;

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [activeTab, search]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const stats = useMemo(() => [
    { label: 'Total Products', value: items.length, color: 'text-zinc-900' },
    { label: 'In Stock', value: items.filter((p) => p.inStock).length, color: 'text-emerald-600' },
    { label: 'Out of Stock', value: items.filter((p) => !p.inStock).length, color: 'text-red-500' },
    { label: 'On Sale', value: items.filter((p) => p.badge === 'Sale').length, color: 'text-orange-500' },
  ], [items]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((p) => {
      const matchesTab = activeTab === 'All' || p.category === activeTab;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.artisan.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [items, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredProducts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  // ── Selection helpers ──────────────────────────────────────────────────────

  const allPageSelected =
    paginatedItems.length > 0 &&
    paginatedItems.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedItems.find((p) => p.id === id)));
    } else {
      const newIds = paginatedItems.map((p) => p.id);
      setSelectedIds((prev) => [...new Set([...prev, ...newIds])]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ── Pagination helpers ─────────────────────────────────────────────────────

  const goToPage = (n) => setCurrentPage(Math.max(1, Math.min(n, totalPages)));

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, safePage - 1);
    const end = Math.min(totalPages, safePage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Toast toast={toast} />

      {/* ══════════════════════════════════════════════════════
          ADD / EDIT PRODUCT MODAL
      ══════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* ── Modal Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
              <div>
                <h2 className="font-serif text-xl font-bold text-zinc-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-sm text-zinc-400 mt-0.5">Fill in the details to add to your catalogue</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Modal Body ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Image Section */}
              <div>
                <p className="text-sm font-semibold text-zinc-700 mb-3">Product Image</p>

                {/* Mode toggle */}
                <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 w-fit mb-4">
                  <button
                    onClick={() => { setImageMode('url'); setImagePreview(draft.imageUrl); }}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      imageMode === 'url' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16, lineHeight: 1 }}>link</span>
                    Image URL
                  </button>
                  <button
                    onClick={() => { setImageMode('upload'); setImagePreview(''); }}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      imageMode === 'upload' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16, lineHeight: 1 }}>upload</span>
                    Upload
                  </button>
                </div>

                {/* URL input */}
                {imageMode === 'url' ? (
                  <div className="flex gap-3 items-start">
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={draft.imageUrl}
                      onChange={(e) => {
                        handleDraftChange('imageUrl', e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      className="flex-1 px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        onError={() => setImagePreview('')}
                        className="w-14 h-14 rounded-xl object-cover border border-zinc-200 flex-shrink-0"
                      />
                    )}
                  </div>
                ) : (
                  /* Upload drop zone */
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-zinc-300 hover:border-orange-400 rounded-2xl p-8 text-center cursor-pointer transition-colors group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Upload preview"
                          className="h-40 w-full object-cover rounded-xl"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); setImagePreview(''); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
                        >
                          <X size={13} className="text-zinc-600" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span
                          className="material-symbols-outlined text-zinc-300 group-hover:text-orange-400 transition-colors"
                          style={{ fontSize: 52 }}
                        >
                          add_photo_alternate
                        </span>
                        <p className="text-sm font-medium text-zinc-500 mt-2">Drop an image here, or click to browse</p>
                        <p className="text-xs text-zinc-400 mt-1">PNG, JPG, WebP up to 10 MB</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Additional product images</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 px-4 py-5 text-sm font-medium text-zinc-500 transition-colors hover:border-orange-400 hover:text-orange-600">
                  <span className="material-symbols-outlined">add_photo_alternate</span> Click to upload gallery images
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                </label>
                {galleryPreviews.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{galleryPreviews.map((src, index) => <div key={`${src}-${index}`} className="relative h-16 w-16 overflow-hidden rounded-lg"><img src={src} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => setGalleryPreviews((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-0 top-0 bg-white/90 p-0.5 text-zinc-600"><X size={12} /></button></div>)}</div>}
                <p className="text-xs text-zinc-400 mt-1">Select multiple files. They display as clickable thumbnails on the product page.</p>
              </div>

              {/* Product fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kente Woven Maxi Dress"
                    value={draft.name}
                    onChange={(e) => handleDraftChange('name', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Category</label>
                  <select
                    value={draft.category}
                    onChange={(e) => handleDraftChange('category', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  >
                    {['Clothing', 'Bags', 'Jewelry', 'Accessories'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                    Price (USD) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={draft.price}
                    onChange={(e) => handleDraftChange('price', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                {/* Badge */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Badge</label>
                  <select
                    value={draft.badge}
                    onChange={(e) => handleDraftChange('badge', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="">None</option>
                    <option>Best Seller</option>
                    <option>New Arrival</option>
                    <option>Sale</option>
                  </select>
                </div>

                {/* In Stock toggle */}
                <div className="flex items-center gap-3 pt-5">
                  <button
                    type="button"
                    onClick={() => handleDraftChange('inStock', !draft.inStock)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      draft.inStock ? 'bg-orange-500' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        draft.inStock ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm font-semibold text-zinc-700">In Stock</span>
                </div>

                {/* Artisan */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Artisan Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Abena Asante"
                    value={draft.artisan}
                    onChange={(e) => handleDraftChange('artisan', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Ashanti, Ghana"
                    value={draft.region}
                    onChange={(e) => handleDraftChange('region', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short description of the product..."
                    value={draft.description}
                    onChange={(e) => handleDraftChange('description', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-none"
                  />
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Sizes</label>
                  <input
                    type="text"
                    placeholder="XS, S, M, L, XL"
                    value={draft.sizes}
                    onChange={(e) => handleDraftChange('sizes', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Comma-separated</p>
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Colors</label>
                  <input
                    type="text"
                    placeholder="Red/Gold, Blue/Silver"
                    value={draft.colors}
                    onChange={(e) => handleDraftChange('colors', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Comma-separated</p>
                </div>

              </div>
            </div>

            {/* ── Modal Footer ── */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 flex-shrink-0">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingProduct ? handleSubmitEdit : handleSubmitProduct}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm"
              >
                <Plus size={15} />
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <svg
            className="animate-spin w-8 h-8 text-orange-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      )}

      {/* ── Error state ── */}
      {!loading && error && (
        <div className="p-6 max-w-screen-2xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-6 py-10 text-center">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-5 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      {!loading && !error && (
        <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-serif font-bold text-zinc-900">Products</h1>
              <p className="text-sm text-zinc-400 mt-0.5">{items.length} items in your catalogue</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search products, artisans..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 w-56"
                />
              </div>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus size={15} />
                Add Product
              </button>
            </div>
          </div>

          {/* ── Filter tabs ── */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Stats pills ── */}
          <div className="flex items-center gap-3 flex-wrap">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 bg-white border border-zinc-100 rounded-xl px-4 py-2 text-sm"
              >
                <span className="text-zinc-500">{s.label}:</span>
                <span className={`font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* ── Bulk action bar ── */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 bg-zinc-900 text-white rounded-xl px-4 py-2.5">
              <CheckSquare size={15} className="text-orange-400" />
              <span className="text-sm font-medium">{selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected</span>
              <button
                onClick={handleBulkDelete}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
              >
                <Trash2 size={13} />
                Delete Selected
              </button>
            </div>
          )}

          {/* ── Table ── */}
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="w-10 px-5 py-3">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-orange-500 cursor-pointer rounded"
                      />
                    </th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 min-w-[220px]">Product</th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 hidden lg:table-cell min-w-[160px]">Artisan</th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3">Price</th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3">Stock</th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Rating</th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 hidden xl:table-cell">Badge</th>
                    <th className="text-right text-xs font-semibold text-zinc-400 uppercase tracking-wide px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <Package size={32} className="text-zinc-200 mx-auto mb-3" />
                        <p className="text-zinc-400 text-sm font-medium">No products found</p>
                        <p className="text-zinc-300 text-xs mt-1">Try adjusting your search or filter</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((product, idx) => (
                      <tr
                        key={product.id}
                        className={`hover:bg-zinc-50/50 transition-colors ${
                          idx < paginatedItems.length - 1 ? 'border-b border-zinc-50' : ''
                        } ${selectedIds.includes(product.id) ? 'bg-orange-50/30' : ''}`}
                      >
                        {/* Checkbox */}
                        <td className="px-5 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(product.id)}
                            onChange={() => toggleSelect(product.id)}
                            className="w-4 h-4 accent-orange-500 cursor-pointer rounded"
                          />
                        </td>

                        {/* Product */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-zinc-100 flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://picsum.photos/seed/p${product.id}/48/48`;
                              }}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-zinc-900 truncate max-w-[160px]">{product.name}</p>
                              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${categoryStyles[product.category]}`}>
                                {product.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Artisan */}
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <p className="text-sm font-medium text-zinc-900 truncate max-w-[140px]">{product.artisan}</p>
                          <p className="text-xs text-zinc-400 truncate max-w-[140px]">{product.region}</p>
                        </td>

                        {/* Price */}
                        <td className="px-3 py-3">
                          {product.badge === 'Sale' ? (
                            <div>
                              <span className="font-bold text-zinc-900">${Math.round(product.price * 0.8)}</span>
                              <span className="text-zinc-400 text-xs line-through ml-1.5">${product.price}</span>
                            </div>
                          ) : (
                            <span className="font-bold text-zinc-900">${product.price}</span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-3 py-3">
                          {product.inStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              Out of Stock
                            </span>
                          )}
                        </td>

                        {/* Rating */}
                        <td className="px-3 py-3 hidden md:table-cell">
                          <StarRow rating={product.rating} />
                          <p className="text-xs text-zinc-400 mt-0.5">{product.rating} · {product.reviews} reviews</p>
                        </td>

                        {/* Badge */}
                        <td className="px-3 py-3 hidden xl:table-cell">
                          {product.badge ? (
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${badgeStyles[product.badge]}`}>
                              {product.badge}
                            </span>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-50">
                <p className="text-xs text-zinc-400">
                  Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {pageNumbers().map((n) => (
                    <button
                      key={n}
                      onClick={() => goToPage(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                        n === safePage
                          ? 'bg-orange-500 text-white'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === totalPages}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
