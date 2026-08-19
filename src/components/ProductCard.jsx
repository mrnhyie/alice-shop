import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from './MaterialIcon';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize, product.colors[0]);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const badgeColors = {
    'New Arrival': 'bg-orange-500 text-white',
    'Best Seller': 'bg-zinc-900 text-white',
    'Sale': 'bg-red-500 text-white',
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  if (viewMode === 'list') {
    return (
      <div onClick={() => navigate(`/product/${product.id}`)} className="flex cursor-pointer gap-4 bg-white rounded-2xl border border-zinc-100 p-4 hover:shadow-md transition-shadow group">
        <div className="relative w-32 h-40 flex-shrink-0 rounded-xl overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.badge && (
            <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColors[product.badge]}`}>
              {product.badge}
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs text-orange-500 font-medium uppercase tracking-wide mb-1 capitalize">{product.category}</p>
            <h3 className="font-semibold text-zinc-900 text-base mb-1">{product.name}</h3>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={`fill-current ${i < Math.floor(product.rating) ? 'text-orange-400' : 'text-zinc-200'}`} />
              ))}
              <span className="text-xs text-zinc-400 ml-1">({product.reviews})</span>
            </div>
            <p className="text-xs text-zinc-500 line-clamp-2">{product.description}</p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-zinc-900">${product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-zinc-400 line-through">${product.originalPrice}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={14} />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-50">
        <img
          src={isHovered && product.image2 ? product.image2 : product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x500/f97316/white?text=${encodeURIComponent(product.name)}`;
          }}
        />

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors[product.badge]}`}>
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-red-500 text-white">
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-full">Out of Stock</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`absolute right-3 top-10 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <button
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors ${
              isWishlisted ? 'bg-orange-500 text-white' : 'bg-white text-zinc-600 hover:bg-orange-50 hover:text-orange-500'
            }`}
          >
            <Heart size={16} className={isWishlisted ? 'fill-white' : ''} />
          </button>
        </div>

        {/* Add to Cart overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-zinc-900/95 text-white p-3 transition-all duration-300 ${isHovered && product.inStock ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <div className="flex gap-2 mb-2">
            {product.sizes.slice(0, 4).map(size => (
              <button
                key={size}
                onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  selectedSize === size
                    ? 'border-orange-400 bg-orange-500 text-white'
                    : 'border-zinc-600 text-zinc-300 hover:border-orange-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-orange-500 font-medium uppercase tracking-wide mb-0.5 capitalize">{product.category}</p>
        <h3 className="font-semibold text-zinc-900 text-sm leading-snug mb-1 group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} className={`fill-current ${i < Math.floor(product.rating) ? 'text-orange-400' : 'text-zinc-200'}`} />
          ))}
          <span className="text-xs text-zinc-400 ml-1">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-900">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-zinc-400 line-through">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
