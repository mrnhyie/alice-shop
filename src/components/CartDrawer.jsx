import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from './MaterialIcon';
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-5hi0 backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-orange-500" />
            <h2 className="font-serif font-bold text-lg text-zinc-900">
              Your Cart
            </h2>
            {cartCount > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-orange-300" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-zinc-400 text-sm mb-6">
                Add some beautiful Ghanaian pieces to your cart.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-primary"
              >
                Browse the Store
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-3 bg-zinc-50 rounded-xl">
                  <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/80x96/f97316/white?text=A`;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-zinc-900 leading-tight mb-0.5">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-zinc-400 mb-2">
                      Size: {item.size} {item.color && `· ${item.color}`}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-white rounded-full border border-zinc-200">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity - 1,
                            )
                          }
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity + 1,
                            )
                          }
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-bold text-sm text-zinc-900">
                        ${(item.product.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      removeFromCart(item.product.id, item.size, item.color)
                    }
                    className="text-zinc-300 hover:text-red-400 transition-colors self-start mt-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-zinc-100 p-5 space-y-3">
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>Shipping</span>
              <span
                className={cartTotal >= 500 ? "text-green-500 font-medium" : ""}
              >
                {cartTotal >= 500 ? "FREE" : "$30"}
              </span>
            </div>
            {cartTotal < 500 && (
              <p className="text-xs text-orange-500 text-center">
                Add ${(500 - cartTotal).toFixed(0)} more for free shipping!
              </p>
            )}
            <div className="flex items-center justify-between font-bold text-base text-zinc-900 pt-1 border-t border-zinc-100">
              <span>Total</span>
              <span>
                ${(cartTotal + (cartTotal >= 500 ? 0 : 30)).toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate("/checkout");
              }}
              className="w-full btn-primary justify-center"
            >
              Checkout
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full text-center text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
