import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MaterialIcon, { ShoppingBag, Heart, Search, Menu, X, ChevronDown } from './MaterialIcon';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { announcementsApi } from '../api/announcements';
import cultureConnectLogo from '../assets/culture-connect-logo.webp';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const { cartCount, setIsCartOpen } = useCart();
  const { customer, isLoggedIn, logout: customerLogout } = useCustomerAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  // Close account popup when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    if (accountOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [accountOpen]);

  useEffect(() => {
    let active = true;
    announcementsApi.list()
      .then((items) => { if (active) setAnnouncements(items); })
      .catch(() => { if (active) setAnnouncements([]); });
    return () => { active = false; };
  }, []);

  const navLinks = [
    { to: '/', label: 'Home', icon: 'home' },
    { to: '/store', label: 'Shop', icon: 'storefront' },
    { to: '/store?category=clothing', label: 'Clothing', icon: 'checkroom' },
    { to: '/store?category=bags', label: 'Bags', icon: 'shopping_bag' },
    { to: '/store?category=jewelry', label: 'Jewelry', icon: 'diamond' },
    { to: '/#about', label: 'Our Story', icon: 'auto_stories' },
  ];

  const isTransparent = false;

  return (
    <>
      {announcements.length > 0 && (
        <div className="bg-zinc-900 px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
          {announcements.map((announcement, index) => (
            <span key={announcement.id}>
              {index > 0 && <span className="mx-2 text-zinc-500">·</span>}
              {announcement.text}
            </span>
          ))}
        </div>
      )}

      {/* Main Navbar */}
      <header
        className={`z-50 transition-all duration-300 ${
          isLanding
            ? 'fixed left-4 right-4 top-4 rounded-2xl border border-white/70 bg-white/90 shadow-xl shadow-zinc-900/20 backdrop-blur-xl md:left-5 md:right-auto md:top-1/2 md:w-16 md:-translate-y-1/2'
            : 'sticky top-0 bg-white shadow-sm border-b border-zinc-100'
        }`}
      >
        <div className={isLanding ? 'px-2' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
          <div className={`flex items-center justify-between h-16 md:h-20 ${isLanding ? 'md:h-auto md:flex-col md:items-stretch md:gap-4 md:py-5' : ''}`}>
            {/* Logo */}
            <Link to="/" className={`flex items-center gap-2 flex-shrink-0 ${isLanding ? 'md:justify-center' : ''}`} title={isLanding ? 'Alice home' : undefined}>
              <img src={cultureConnectLogo} alt="Culture Connect" className="h-9 w-9 object-contain" />
              <div className={isLanding ? 'md:hidden' : ''}>
                <span className={`font-serif font-bold text-xl ${isTransparent ? 'text-white' : 'text-zinc-900'}`}>
                  Culture Connect
                </span>
                <p className={`text-xs hidden sm:block leading-tight ${isTransparent ? 'text-white/70' : 'text-zinc-400'}`}>
                  Carry Culture With You
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className={`hidden md:flex items-center gap-6 ${isLanding ? 'md:flex-col md:items-stretch md:gap-1' : ''}`}>
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  title={isLanding ? link.label : undefined}
                  aria-label={isLanding ? link.label : undefined}
                  className={`text-sm font-medium transition-colors hover:text-orange-500 ${isLanding ? 'md:flex md:items-center md:justify-center md:rounded-xl md:p-2.5 md:hover:bg-orange-50' : ''} ${
                    isTransparent ? 'text-white/90 hover:text-orange-300' : 'text-zinc-700 hover:text-orange-500'
                  } ${location.pathname === link.to ? 'text-orange-500' : ''}`}
                >
                  {isLanding && <MaterialIcon name={link.icon} size={20} className="hidden md:inline-flex" />}
                  <span className={isLanding ? 'md:hidden' : ''}>{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className={`flex items-center gap-1 ${isLanding ? 'md:flex-col md:items-center md:border-t md:border-zinc-100 md:pt-3' : ''}`}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-full transition-colors ${
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Search size={20} />
              </button>
              <Link
                to="/store"
                className={`p-2 rounded-full transition-colors ${
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Heart size={20} />
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className={`p-2 rounded-full transition-colors relative ${
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Customer Account / Login */}
              {isLoggedIn ? (
                <div ref={accountRef} className={`hidden md:flex items-center relative ml-2 ${isLanding ? 'md:ml-0 md:self-center' : ''}`}>
                  <button
                    onClick={() => setAccountOpen((v) => !v)}
                    title={isLanding ? customer?.name : undefined}
                    className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${isLanding ? 'md:h-9 md:w-9 md:justify-center md:p-0' : ''} ${
                      isTransparent ? 'text-white hover:bg-white/10 border border-white/30' : 'text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[11px] font-bold leading-none">{customer?.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className={isLanding ? 'md:hidden' : ''}>{customer?.name?.split(' ')[0]}</span>
                    {!isLanding && <MaterialIcon name="ChevronDown" size={14} className={`text-zinc-400 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`} />}
                  </button>

                  {/* Popup dropdown — rendered in a portal-like fixed position to avoid clipping */}
                  {accountOpen && (
                    <div className="absolute top-[calc(100%+8px)] right-0 w-52 bg-white border border-zinc-100 rounded-2xl shadow-2xl shadow-zinc-200/80 py-2 z-[200] animate-[fadeDropIn_0.15s_ease-out]">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-zinc-50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">{customer?.name?.[0]?.toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 truncate">{customer?.name}</p>
                            <p className="text-xs text-zinc-400 truncate">{customer?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        <Link
                          to="/messages"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-orange-500 transition-colors"
                        >
                          <MaterialIcon name="MessageSquare" size={17} className="text-zinc-400" />
                          Messages
                        </Link>
                        <Link
                          to="/store"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-orange-500 transition-colors"
                        >
                          <MaterialIcon name="ShoppingBag" size={17} className="text-zinc-400" />
                          Browse Store
                        </Link>
                      </div>

                      <div className="border-t border-zinc-50 pt-1.5 pb-1">
                        <button
                          onClick={() => { customerLogout(); setAccountOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-zinc-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <MaterialIcon name="LogOut" size={17} className="text-zinc-400" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" title={isLanding ? 'Sign in' : undefined} className={`hidden md:flex items-center text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ml-2 ${isLanding ? 'md:ml-0 md:h-9 md:w-9 md:justify-center md:p-0' : ''} ${
                  isTransparent ? 'border-white/30 text-white hover:bg-white/10' : 'border-zinc-200 text-zinc-600 hover:border-orange-300 hover:text-orange-500'
                }`}>
                  {isLanding && <MaterialIcon name="person" size={18} className="hidden md:inline-flex" />}
                  <span className={isLanding ? 'md:hidden' : ''}>Sign In</span>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`md:hidden p-2 rounded-full transition-colors ${
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="pb-4 animate-fade-in">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search for kente dresses, raffia bags..."
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-full text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-zinc-100 shadow-lg animate-slide-up">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-zinc-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <Link to="/messages" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">Messages</Link>
                  <button onClick={() => { customerLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">Sign Out ({customer?.name?.split(' ')[0]})</button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
