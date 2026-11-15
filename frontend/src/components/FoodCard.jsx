import React from 'react';
import { Plus, Minus, Star, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const FoodCard = ({ item, onCustomize }) => {
  const { items: cartItems, addToCart, updateQuantity } = useCart();
  const {
    _id,
    name,
    price,
    description = '',
    image,
    rating = 4.5,
    type = 'Veg',
    category = 'Main Course',
    available = true,
  } = item;

  const isVeg = type === 'Veg';
  const cartItem = cartItems.find((ci) => ci.menuItemId === _id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const fallbackImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

  const handleAdd = () => {
    if (!available) return;
    if (onCustomize) {
      onCustomize(item);
    } else {
      addToCart(_id, 1);
    }
  };

  const handleIncrement = () => {
    updateQuantity(_id, currentQuantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(_id, currentQuantity - 1);
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
        !available ? 'opacity-60 grayscale-50' : ''
      }`}
    >
      <div className="flex gap-4">
        {/* Left: Info */}
        <div className="flex-1 pr-2">
          {/* Veg / Non-Veg Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center justify-center w-4 h-4 border-2 rounded-xs ${
                isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
              title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              {category}
            </span>
            {rating >= 4.5 && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                <Sparkles className="w-2.5 h-2.5" /> Bestseller
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-orange-600 transition-colors mb-1">
            {name}
          </h4>

          {/* Price & Rating */}
          <div className="flex items-center gap-3 mb-2">
            <span className="font-extrabold text-slate-900 text-base">₹{price}</span>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Right: Image & Add button overlay */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
          <img
            src={image || fallbackImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = fallbackImage;
            }}
            loading="lazy"
          />

          {!available && (
            <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center p-1 text-center">
              <span className="text-white text-[10px] font-extrabold uppercase">
                Out of Stock
              </span>
            </div>
          )}

          {/* Add / Quantity Stepper Button */}
          {available && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24">
              {currentQuantity > 0 ? (
                <div className="flex items-center justify-between bg-white text-orange-600 rounded-lg shadow-lg border border-orange-200 overflow-hidden text-xs font-extrabold">
                  <button
                    onClick={handleDecrement}
                    className="p-1.5 hover:bg-orange-50 transition active:scale-95 text-slate-700"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-bold">{currentQuantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="p-1.5 hover:bg-orange-50 transition active:scale-95 text-orange-600"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className="w-full py-1.5 px-3 bg-white hover:bg-orange-600 text-orange-600 hover:text-white border border-orange-200 hover:border-orange-600 text-xs font-extrabold rounded-lg shadow-md transition-all uppercase tracking-wider cursor-pointer"
                >
                  ADD +
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
