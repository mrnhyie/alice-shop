import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Heart, ShoppingBag, Star } from '../components/MaterialIcon';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { productsApi } from '../api/products';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    productsApi.get(id)
      .then((item) => {
        setProduct(item);
        setSelectedSize(item.sizes?.[0] ?? '');
        setSelectedColor(item.colors?.[0] ?? '');
      })
      .catch(() => setError('This product could not be found.'));
  }, [id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    return [...new Set([product.image, ...(product.images ?? [])].filter(Boolean))];
  }, [product]);

  if (error) return <div className="min-h-screen bg-zinc-50"><Navbar /><main className="mx-auto max-w-2xl px-6 py-28 text-center"><h1 className="font-serif text-3xl font-bold text-zinc-900">{error}</h1><Link to="/store" className="mt-6 inline-flex text-orange-600">Back to shop</Link></main></div>;
  if (!product) return <div className="min-h-screen bg-zinc-50"><Navbar /><div className="mx-auto max-w-7xl px-6 py-28 text-zinc-500">Loading product…</div></div>;

  const image = gallery[selectedImage] || `https://placehold.co/800x1000/f4f4f5/71717a?text=${encodeURIComponent(product.name)}`;
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar /><CartDrawer />
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:px-12">
        <Link to="/store" className="mb-7 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-orange-600"><ArrowLeft size={17} /> Back to shop</Link>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-16">
          <section>
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-zinc-100"><img src={image} alt={product.name} className="h-full w-full object-cover" /></div>
            {gallery.length > 1 && <div className="mt-4 flex gap-3 overflow-x-auto pb-2">{gallery.map((src, index) => <button key={src} type="button" onClick={() => setSelectedImage(index)} className={`h-20 w-16 flex-none overflow-hidden rounded-xl border-2 ${selectedImage === index ? 'border-orange-500' : 'border-transparent'}`}><img src={src} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div>}
          </section>
          <section className="lg:pt-5">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">{product.category}</p><h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-zinc-950 sm:text-5xl">{product.name}</h1></div><button type="button" onClick={() => toggleWishlist(product.id)} className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${isWishlisted ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:border-orange-300'}`} aria-label="Save to wishlist"><Heart size={20} /></button></div>
            <div className="mt-5 flex items-center gap-2"><span className="text-3xl font-bold text-zinc-950">${product.price}</span><span className="inline-flex items-center gap-1 text-sm text-zinc-500"><Star size={16} className="text-orange-500" /> {product.rating ?? 0} ({product.reviews ?? 0} reviews)</span></div>
            <p className="mt-7 leading-relaxed text-zinc-600">{product.description || 'A thoughtfully made piece that celebrates African artistry, culture, and contemporary style.'}</p>
            {product.region && <div className="mt-6 rounded-2xl bg-orange-50 p-4 text-sm text-orange-900"><span className="font-semibold">Style notes</span>{` · ${product.region}`}</div>}
            {product.colors?.length > 0 && <div className="mt-8"><p className="text-sm font-semibold text-zinc-900">Color: <span className="font-normal text-zinc-500">{selectedColor}</span></p><div className="mt-3 flex flex-wrap gap-2">{product.colors.map((color) => <button key={color} type="button" onClick={() => setSelectedColor(color)} className={`rounded-full border px-4 py-2 text-sm ${selectedColor === color ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-zinc-200 bg-white text-zinc-600'}`}>{color}</button>)}</div></div>}
            {product.sizes?.length > 0 && <div className="mt-7"><p className="text-sm font-semibold text-zinc-900">Size: <span className="font-normal text-zinc-500">{selectedSize}</span></p><div className="mt-3 flex flex-wrap gap-2">{product.sizes.map((size) => <button key={size} type="button" onClick={() => setSelectedSize(size)} className={`min-w-11 rounded-xl border px-3 py-2 text-sm font-medium ${selectedSize === size ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-600'}`}>{size}</button>)}</div></div>}
            <button type="button" disabled={!product.inStock} onClick={() => addToCart(product, selectedSize, selectedColor)} className="mt-9 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"><ShoppingBag size={19} /> {product.inStock ? 'Add to cart' : 'Out of stock'}</button>
            <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500"><Check size={17} className="text-orange-600" /> Chosen for distinctive style and lasting wear.</p>
          </section>
        </div>
      </main><Footer />
    </div>
  );
}
