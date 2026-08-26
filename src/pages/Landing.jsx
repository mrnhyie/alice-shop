import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, Star,
  Plus, Palette, Globe2, Truck, ShoppingBag, ChevronLeft, ChevronRight,
} from '../components/MaterialIcon';
import Navbar    from '../components/Navbar';
import Footer    from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { testimonials } from '../data/products';
import { productsApi }  from '../api/products.js';
import { landingApi } from '../api/customers.js';
import { useCart }      from '../context/CartContext';
import heroLookOne from '../assets/pexels-kahlibrown-30604266.jpg';
import heroLookTwo from '../assets/pexels-daniwura-tci-492293783-35101507.jpg';
import heroLookThree from '../assets/pexels-santuraki-38209143.jpg';
import heroLookFour from '../assets/pexels-alpha-paul-696966661-18206793.jpg';
import heroLookFive from '../assets/pexels-zeal-creative-studios-58866141-20618742.jpg';
import clothingImage from '../assets/pexels-oluwadamilola-ajayi-1485601295-28521274.jpg';
import bagsImage from '../assets/pexels-pratham-mahajan-2124500-15014630.jpg';
import jewelryImage from '../assets/pexels-deeonederer-1212048.jpg';
import accessoriesImage from '../assets/pexels-akoonie-29663368.jpg';
import storyImage from '../assets/pexels-malaydi-12175082.jpg';
import storyDetailImage from '../assets/pexels-santuraki-38209146.jpg';

// ─── Kente SVG pattern ────────────────────────────────────────────────────────

function KentePattern({ id = 'kente-hero', color = '#ffffff', opacity = 0.07 }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={id} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="none" />
          <rect x="0"  y="0"  width="20" height="20" fill={color} opacity={opacity * 1.2} />
          <rect x="20" y="20" width="20" height="20" fill={color} opacity={opacity * 1.2} />
          <rect x="40" y="40" width="20" height="20" fill={color} opacity={opacity * 1.2} />
          <rect x="20" y="0"  width="20" height="20" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity} />
          <rect x="0"  y="20" width="20" height="20" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity} />
          <line x1="0" y1="30" x2="60" y2="30" stroke={color} strokeWidth="0.5" opacity={opacity * 0.5} />
          <line x1="30" y1="0" x2="30" y2="60" stroke={color} strokeWidth="0.5" opacity={opacity * 0.5} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// ─── Intersection reveal ──────────────────────────────────────────────────────

function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─── Static data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'clothing',    name: 'Clothing',    count: null, image: clothingImage },
  { slug: 'bags',        name: 'Bags',        count: null, image: bagsImage },
  { slug: 'jewelry',     name: 'Jewelry',     count: null, image: jewelryImage },
  { slug: 'accessories', name: 'Accessories', count: null, image: accessoriesImage },
];

const FEATURES = [
  { num: '01', Icon: Palette, title: 'Made to Stand Out',      desc: 'Expressive pieces with confident colour, beautiful detail, and a distinct point of view.' },
  { num: '02', Icon: Globe2,  title: 'Ethically Sourced',      desc: 'Fair wages, safe conditions, and sustainable materials across our entire supply chain — always.' },
  { num: '03', Icon: Truck,   title: 'Select City Delivery',   desc: 'We deliver to selected cities across Ghana. Fast, reliable, and straight to your doorstep.' },
];

const HERO_LOOKS = [
  { image: heroLookOne, alt: 'Model in a vibrant patterned dress', eyebrow: 'New season', title: 'Bold colour, unmistakably you.', tint: 'from-orange-950/75 via-orange-800/25 to-transparent' },
  { image: heroLookTwo, alt: 'Model in contemporary African fashion', eyebrow: 'The statement edit', title: 'Style with a story.', tint: 'from-emerald-950/75 via-emerald-800/20 to-transparent' },
  { image: heroLookThree, alt: 'Model wearing expressive fashion', eyebrow: 'Everyday icons', title: 'Dress for the moment.', tint: 'from-amber-950/75 via-amber-800/20 to-transparent' },
  { image: heroLookFour, alt: 'Model in a colourful fashion look', eyebrow: 'Fresh arrivals', title: 'Bring the energy.', tint: 'from-sky-950/75 via-sky-800/20 to-transparent' },
  { image: heroLookFive, alt: 'Fashion editorial portrait', eyebrow: 'Made to move', title: 'Your next favourite look.', tint: 'from-violet-950/75 via-violet-800/20 to-transparent' },
];

// ─── Safe editorial product card (null-safe) ──────────────────────────────────

function EditorialCard({ product, tall = false, className = '' }) {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [added,   setAdded]   = useState(false);

  if (!product) return null;   // ← crash-proof guard

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product, product.sizes?.[0] ?? '', product.colors?.[0] ?? '');
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const badgeMap = {
    'New Arrival': 'bg-orange-500 text-white',
    'Best Seller': 'bg-zinc-950 text-white',
    'Sale':        'bg-red-500 text-white',
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-zinc-100 cursor-pointer select-none
                  ${tall ? 'h-full min-h-[380px]' : 'aspect-[3/4]'} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={product.image || `https://picsum.photos/seed/p${product.id}/480/640`}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        onError={(e) => { e.target.src = `https://picsum.photos/seed/p${product.id}/480/640`; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/10 to-transparent" />
      {!product.inStock && (
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
          <span className="bg-zinc-900 text-white text-xs font-semibold px-4 py-2 rounded-full">Out of Stock</span>
        </div>
      )}
      {product.badge && (
        <span className={`absolute top-3.5 left-3.5 text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full ${badgeMap[product.badge] ?? 'bg-zinc-900 text-white'}`}>
          {product.badge}
        </span>
      )}
      <button
        onClick={handleAdd}
        disabled={!product.inStock}
        aria-label="Add to cart"
        className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center
                    shadow-lg transition-all duration-300 disabled:opacity-40
                    ${added ? 'bg-emerald-500 scale-110' : 'bg-white/90 hover:bg-orange-500'}
                    ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        {added
          ? <Check size={14} className="text-white" />
          : <Plus  size={14} className="text-zinc-800 group-hover:text-white" />}
      </button>
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
        <p className="text-orange-400 text-[10px] uppercase tracking-[0.2em] mb-1">{product.category}</p>
        <div className="flex items-end justify-between gap-2">
          <h3 className="font-serif text-white font-bold text-base lg:text-lg leading-tight line-clamp-2">{product.name}</h3>
          <span className="text-white font-bold text-sm flex-shrink-0">${product.price}</span>
        </div>
        <div className="flex items-center gap-0.5 mt-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={9}
              className={i < Math.floor(product.rating ?? 0) ? 'fill-orange-400 text-orange-400' : 'fill-white/20 text-white/20'}
            />
          ))}
          <span className="text-white/40 text-[10px] ml-1.5">({product.reviews ?? 0})</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function Landing() {
  const [email,      setEmail]      = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeLook, setActiveLook] = useState(0);
  const [landingImages, setLandingImages] = useState(null);

  // Products from DB
  const [featured, setFeatured]       = useState([]);
  const [productCount, setProductCount] = useState(null); // null = loading

  useEffect(() => {
    landingApi.get().then(setLandingImages).catch(() => setLandingImages({}));
  }, []);

  useEffect(() => {
    productsApi.list()
      .then((data) => {
        setFeatured(data.slice(0, 4));
        setProductCount(data.length);
      })
      .catch(() => setProductCount(0));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveLook((current) => (current + 1) % heroLooksResolved.length), 3000);
    return () => window.clearInterval(timer);
  }, []);

  const [editRef,  editVisible]  = useReveal();
  const [catRef,   catVisible]   = useReveal();
  const [storyRef, storyVisible] = useReveal();
  const [featRef,  featVisible]  = useReveal();
  const [testRef,  testVisible]  = useReveal();
  const [newsRef,  newsVisible]  = useReveal();

  const handleSubscribe = (e) => { e.preventDefault(); if (email) setSubscribed(true); };

  const fade = (v, delay = '') =>
    `transition-all duration-700 ${delay} ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;

  const hasProducts = featured.length > 0;

  const imageValue = (key, fallback) => landingImages?.[key]?.value || fallback;
  const heroLooksResolved = HERO_LOOKS.map((look, index) => ({ ...look, image: imageValue(`hero${index + 1}`, look.image) }));
  const categoriesResolved = CATEGORIES.map((cat) => ({ ...cat, image: imageValue(`category_${cat.slug}`, cat.image) }));
  const resolvedStoryImage = imageValue('story', storyImage);
  const resolvedStoryDetailImage = imageValue('story_detail', storyDetailImage);

  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <CartDrawer />

      {/* ══════════════════════════════════════════════════════
          §1 · HERO — African fashion editorial
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#f8f3e8] px-5 pb-10 pt-28 sm:px-8 sm:pt-32 lg:min-h-screen lg:pl-28 lg:pr-10">
        <KentePattern id="hero-kente" color="#c56a28" opacity={0.035} />
        <div className="relative mx-auto max-w-7xl text-center">
          <h1 className="mx-auto mt-6 max-w-4xl font-sans text-5xl font-bold tracking-[-0.065em] text-zinc-950 sm:text-6xl lg:text-8xl lg:leading-[0.9]">
            Wear your heritage.<br />Own your story.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Bold prints and contemporary silhouettes inspired by the rich textile traditions of Africa.
          </p>
          <Link to="/store" className="group mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-orange-600">
            Shop the collection <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <div className="relative mt-12 overflow-hidden rounded-[2.5rem] bg-zinc-900 text-left shadow-2xl sm:rounded-[3.5rem] lg:mt-16">
            <div className="relative h-[430px] sm:h-[560px] lg:h-[690px]">
              {heroLooksResolved.map((look, index) => (
                <img key={look.alt} src={look.image} alt={look.alt} className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${index === activeLook ? 'hero-slide-active opacity-100' : 'scale-110 opacity-0'}`} />
              ))}
              <div className={`absolute inset-0 bg-gradient-to-t ${heroLooksResolved[activeLook].tint}`} />
              <div key={activeLook} className="hero-copy-enter absolute inset-x-0 bottom-0 p-7 text-white sm:p-10 lg:p-14">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#CBEF43]">{heroLooksResolved[activeLook].eyebrow}</p>
                <h2 className="mt-3 max-w-lg font-serif text-4xl font-bold leading-none sm:text-6xl lg:text-7xl">{heroLooksResolved[activeLook].title}</h2>
              </div>
              <button type="button" aria-label="Previous look" onClick={() => setActiveLook((activeLook - 1 + heroLooksResolved.length) % heroLooksResolved.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-zinc-900 transition hover:bg-white sm:left-6 sm:p-3"><ChevronLeft size={22} /></button>
              <button type="button" aria-label="Next look" onClick={() => setActiveLook((activeLook + 1) % heroLooksResolved.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-zinc-900 transition hover:bg-white sm:right-6 sm:p-3"><ChevronRight size={22} /></button>
              <div className="absolute bottom-5 right-6 flex gap-2 sm:bottom-8 sm:right-10">{heroLooksResolved.map((look, index) => <button key={look.alt} type="button" aria-label={`Show look ${index + 1}`} onClick={() => setActiveLook(index)} className={`h-2 rounded-full transition-all ${index === activeLook ? 'w-8 bg-white' : 'w-2 bg-white/55 hover:bg-white/80'}`} />)}</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-orange-200/80 pt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:text-xs">
            <span>Statement details</span><span>Vibrant textiles</span><span>Modern African style</span>
          </div>
        </div>
      </section>

      <section className="border-y border-orange-100 bg-white px-6 py-7">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 text-center sm:grid-cols-3">
          {[['Rooted in Africa', 'Designed with cultural care'], ['Made for Ghana & the USA', 'Thoughtful delivery and support'], ['Made to last', 'Pieces you will reach for again and again']].map(([title, text]) => (
            <div key={title} className="rounded-2xl bg-orange-50/70 px-5 py-4 first:bg-[#CBEF43] first:shadow-[0_10px_30px_rgba(203,239,67,0.22)]"><p className="font-semibold text-zinc-900">{title}</p><p className="mt-1 text-sm text-zinc-600">{text}</p></div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          §3 · FEATURED COLLECTION
      ══════════════════════════════════════════════════════ */}
      <section ref={editRef} className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

          <div className={`flex items-end justify-between mb-10 lg:mb-14 ${fade(editVisible)}`}>
            <div>
              <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-[0.3em]">01 — The Edit</span>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-zinc-900 mt-2 leading-tight">
                Featured<br />Collection
              </h2>
            </div>
            <Link
              to="/store"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-800
                         hover:text-orange-500 transition-colors group border-b border-zinc-300 hover:border-orange-400 pb-0.5"
            >
              View All <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Products or empty state */}
          {productCount === null ? (
            /* Loading skeleton */
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`rounded-2xl bg-zinc-100 animate-pulse ${i === 0 ? 'aspect-[3/4] lg:h-[640px]' : 'aspect-[3/4]'}`} />
              ))}
            </div>
          ) : hasProducts ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 ${fade(editVisible, 'delay-150')}`}>
              {/* Tall hero card */}
              <div className="min-h-[380px] lg:h-[640px]">
                <EditorialCard product={featured[0]} tall />
              </div>
              {/* Two portrait cards */}
              {featured[1] && <EditorialCard product={featured[1]} />}
              {featured[2] && <EditorialCard product={featured[2]} />}
              {/* Wide 4th card */}
              {featured[3] && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <div className="aspect-[21/7] lg:aspect-auto lg:h-[260px]">
                    <EditorialCard product={featured[3]} className="aspect-auto h-full" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty state — products not yet added */
            <div className={`text-center py-20 ${fade(editVisible, 'delay-150')}`}>
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={32} className="text-orange-300" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-zinc-900 mb-3">Coming Soon</h3>
              <p className="text-zinc-400 text-sm mb-8 max-w-xs mx-auto">
                We're stocking our shelves with beautiful pieces. Check back soon!
              </p>
              <Link
                to="/store"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600
                           text-white font-semibold px-7 py-3 rounded-full transition-colors"
              >
                Explore the Store <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          §4 · SHOP BY CATEGORY
      ══════════════════════════════════════════════════════ */}
      <section ref={catRef} className="bg-zinc-950 py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

          <div className={`flex items-center justify-between mb-12 ${fade(catVisible)}`}>
            <div>
              <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-[0.3em]">02 — Explore</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-2">Shop by Style</h2>
            </div>
          </div>

          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${fade(catVisible, 'delay-150')}`}>
            {categoriesResolved.map((cat) => (
              <Link
                key={cat.slug}
                to={`/store?category=${cat.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-800"
              >
                <img
                  src={cat.image} alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
                <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                  <h3 className="font-serif text-white text-xl lg:text-2xl font-bold">{cat.name}</h3>
                  <div className="flex items-center gap-1 text-orange-400 text-xs font-medium mt-2
                                  translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    Shop now <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          §5 · OUR STORY
      ══════════════════════════════════════════════════════ */}
      <section id="story" ref={storyRef} className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">

            <div className={fade(storyVisible)}>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">03 — Our Heritage</span>
              <blockquote className="font-serif text-[2rem] lg:text-[2.6rem] font-bold text-zinc-900 mt-6 mb-8 leading-[1.1]">
                "Fashion is a bridge<br />between cultures."
              </blockquote>
              <p className="text-zinc-500 leading-relaxed mb-5 text-[15px]">
                Alice was born from a simple belief — that getting dressed should feel like an act of joy.
                Founded in Accra, we celebrate Ghanaian culture through expressive colour, considered
                silhouettes, and pieces that make everyday moments feel more personal.
              </p>
              <ul className="space-y-3 mb-10">
                {['Inspired by Ghanaian colour and culture','New looks chosen with care','Carbon-neutral packaging · sustainable practices'].map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-zinc-700">
                    <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={11} className="text-orange-600" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <Link to="/store" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-orange-500 transition-colors group border-b-2 border-zinc-200 hover:border-orange-400 pb-0.5">
                Explore the collection <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className={`relative pb-10 ${fade(storyVisible, 'delay-200')}`}>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img src={resolvedStoryImage} alt="Alice fashion collection" className="w-full h-[480px] lg:h-[620px] object-cover" />
              </div>
              <div className="absolute -bottom-2 -left-4 w-36 lg:w-44 h-44 lg:h-56 rounded-xl overflow-hidden border-4 border-white shadow-2xl">
                <img src={resolvedStoryDetailImage} alt="Colourful fashion detail" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-4 -right-3 bg-orange-500 text-white rounded-2xl px-5 py-4 shadow-2xl">
                <div className="font-serif text-3xl font-bold">100%</div>
                <div className="text-orange-100/80 text-[11px] uppercase tracking-wide mt-0.5">Bold style</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          §6 · WHY ALICE
      ══════════════════════════════════════════════════════ */}
      <section ref={featRef} className="py-24 bg-[#CBEF43]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

          <div className={`text-center mb-16 ${fade(featVisible)}`}>
            <span className="text-[10px] font-semibold text-zinc-700 uppercase tracking-[0.3em]">04 — Why Alice</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-zinc-900 mt-3">The Alice Difference</h2>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-900/10 ${fade(featVisible, 'delay-150')}`}>
            {FEATURES.map(({ num, Icon, title, desc }) => (
              <div key={title} className="group px-8 lg:px-12 py-10 md:first:pl-0 md:last:pr-0 hover:bg-white/70 rounded-2xl transition-colors duration-300">
                <span className="font-serif text-6xl font-bold text-zinc-900/15 group-hover:text-zinc-900/25 transition-colors">{num}</span>
                <div className="w-10 h-10 bg-white/70 group-hover:bg-white rounded-xl flex items-center justify-center mt-5 mb-5 transition-colors">
                  <Icon size={20} className="text-zinc-900" />
                </div>
                <h3 className="font-serif text-xl font-bold text-zinc-900 mb-3">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          §7 · TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section ref={testRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

          <div className={`mb-14 ${fade(testVisible)}`}>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">05 — Customer Stories</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-zinc-900 mt-3">Worn & Loved</h2>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 ${fade(testVisible, 'delay-150')}`}>
            {testimonials.slice(0, 3).map(({ id, name, location, rating, text, avatar }) => (
              <div key={id} className="group">
                <div className="font-serif text-7xl text-orange-400/20 group-hover:text-orange-400/40 leading-none mb-2 select-none transition-colors duration-300">&ldquo;</div>
                <p className="text-zinc-700 leading-relaxed mb-6 text-[15px]">{text}</p>
                <div className="flex items-center gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className={i < rating ? 'fill-orange-400 text-orange-400' : 'fill-zinc-200 text-zinc-200'} />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-5 border-t border-zinc-100">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-semibold text-sm">{avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 text-sm">{name}</div>
                    <div className="text-zinc-400 text-xs mt-0.5">{location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          §8 · NEWSLETTER
      ══════════════════════════════════════════════════════ */}
      <section ref={newsRef} className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 py-28 overflow-hidden">
        <KentePattern id="news-kente" color="#ffffff" opacity={0.06} />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className={`relative z-10 max-w-xl mx-auto px-6 text-center ${fade(newsVisible)}`}>
          <span className="text-[10px] font-semibold text-white/70 uppercase tracking-[0.3em]">Join the Community</span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 mb-4 leading-[1.08]">
            Get 10% Off<br />Your First Order
          </h2>
          <p className="text-white/70 mb-10 leading-relaxed text-[15px]">
            Be the first to hear about new arrivals, styling notes, and exclusive offers.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-3 bg-white/15 border border-white/25 rounded-full px-6 py-3.5">
              <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                <Check size={13} className="text-white" />
              </div>
              <span className="text-white font-medium text-sm">You're in — check your inbox!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="flex-1 px-5 py-3.5 rounded-full bg-white/20 border border-white/30
                           text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/60
                           focus:bg-white/25 transition-all"
              />
              <button type="submit" className="px-6 py-3.5 bg-white hover:bg-orange-50 text-orange-600 font-bold text-sm rounded-full transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          )}
          <p className="text-white/40 text-xs mt-5">No spam. Unsubscribe at any time.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
