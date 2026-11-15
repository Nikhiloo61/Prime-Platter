import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  CheckCircle,
  Truck,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = () => {
  const {
    items,
    subtotal,
    deliveryFee,
    tax,
    finalPayable,
    coupon,
    discountAmount,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 299;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (applyCoupon(couponInput)) {
      setCouponInput('');
    }
  };

  const handleProceedCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Your Cart</h3>
                <p className="text-xs text-slate-500">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in platter
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition"
                  title="Clear Cart"
                >
                  Clear
                </button>
              )}
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-lg mb-1">Your cart is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mb-6">
                Good food is always just a few clicks away! Discover local restaurants and dishes.
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md text-sm transition"
              >
                Explore Restaurants
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Free Delivery Bar */}
              <div className="bg-orange-50/70 border border-orange-200/60 rounded-2xl p-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                  <div className="flex items-center gap-1.5 text-orange-700">
                    <Truck className="w-4 h-4" />
                    <span>
                      {amountNeededForFreeDelivery === 0
                        ? '🎉 You unlocked Free Delivery!'
                        : `Add ₹${amountNeededForFreeDelivery} more for Free Delivery`}
                    </span>
                  </div>
                  <span className="text-orange-600">{freeDeliveryProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-orange-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Order Items
                </h4>
                {items.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-sm text-slate-900 truncate">{item.name}</h5>
                        <p className="text-xs text-slate-500 font-semibold">₹{item.price}</p>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-xs text-xs font-bold text-slate-700">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 text-orange-600 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Offers & Coupons
                </h4>
                {coupon ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span>{coupon.code} applied</span>
                        <span className="block text-[10px] text-emerald-600 font-medium">
                          {coupon.description}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 uppercase focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>

                    {/* Quick promo suggestion badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {['WELCOME50', 'TASTY20', 'FREEDEL'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => applyCoupon(code)}
                          className="text-[11px] font-bold px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/80 rounded-lg transition"
                        >
                          🏷️ {code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bill Summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                <h5 className="font-bold text-slate-900 text-sm mb-3">Bill Details</h5>

                <div className="flex justify-between text-slate-600">
                  <span>Item Total</span>
                  <span className="font-semibold text-slate-800">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-slate-800">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Taxes & Restaurant Charges (5%)</span>
                  <span className="font-semibold text-slate-800">₹{tax}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>To Pay</span>
                  <span className="text-base text-orange-600">₹{finalPayable}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-white">
              <button
                onClick={handleProceedCheckout}
                className="w-full flex items-center justify-between py-3.5 px-6 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold rounded-2xl shadow-xl shadow-orange-600/25 transition transform active:scale-98 cursor-pointer"
              >
                <div className="text-left">
                  <span className="text-xs block text-orange-100 uppercase tracking-wider font-semibold">
                    Total: ₹{finalPayable}
                  </span>
                  <span className="text-sm">Proceed to Checkout</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
