import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Heart } from './MaterialIcon';
import cultureConnectLogo from '../assets/culture-connect-logo.webp';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-white">
      {/* Pattern stripe */}
      <div className="h-2 bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={cultureConnectLogo} alt="Culture Connect" className="h-10 w-10 object-contain" />
              <div>
                <span className="font-serif font-bold text-xl text-white">Culture Connect</span>
                <p className="text-xs text-zinc-400 leading-tight">Carry Culture With You</p>
              </div>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Celebrating Ghanaian colour, culture, and contemporary style. Find pieces that make every day feel more expressive.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, label: 'Instagram' },
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 bg-zinc-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/store', label: 'All Products' },
                { to: '/store?category=clothing', label: 'Clothing' },
                { to: '/store?category=bags', label: 'Bags & Purses' },
                { to: '/store?category=jewelry', label: 'Jewelry' },
                { to: '/store?category=accessories', label: 'Accessories' },
                { to: '/store?badge=new+arrival', label: 'New Arrivals' },
                { to: '/store?badge=sale', label: 'Sale' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-zinc-400 hover:text-orange-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Our Story' },
                { label: 'Our Collection' },
                { label: 'Sustainability' },
                { label: 'Press' },
                { label: 'Careers' },
                { label: 'Contact Us' },
              ].map(item => (
                <li key={item.label}>
                  <a href="#" className="text-zinc-400 hover:text-orange-400 text-sm transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Get in Touch</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-zinc-400 text-sm">3355 Richmond Rd, Beachwood, OH 44122, USA</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-orange-400 flex-shrink-0" />
                <span className="text-zinc-400 text-sm">+1 (216) 313-0231</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-orange-400 flex-shrink-0" />
                <span className="text-zinc-400 text-sm">aliceasimenu106@gmail.com</span>
              </li>
            </ul>

            {/* Newsletter mini */}
            <div>
              <p className="text-sm text-zinc-400 mb-2">Stay in the loop:</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-400"
                />
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © 2025 Alice. All rights reserved.
          </p>
          <p className="text-zinc-500 text-sm flex items-center gap-1">
            Made with <Heart size={13} className="text-orange-500 fill-orange-500" /> for Ghana & the USA
          </p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Returns'].map(item => (
              <a key={item} href="#" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
