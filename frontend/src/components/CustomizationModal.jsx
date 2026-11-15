import React, { useState } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CustomizationModal = ({ item, isOpen, onClose }) => {
  const { addToCart } = useCart();

  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedSize, setSelectedSize] = useState('regular');
  const [instructions, setInstructions] = useState('');

  if (!isOpen || !item) return null;

  const availableSizes = [
    { id: 'regular', name: 'Regular Portion', price: 0 },
    { id: 'large', name: 'Large Portion (Feeds 2)', price: 80 },
  ];

  const availableAddons = [
    { id: 'cheese', name: 'Extra Cheddar / Mozzarella', price: 40 },
    { id: 'dip', name: 'Chef Special Garlic Dip', price: 25 },
    { id: 'drink', name: 'Chilled Soft Drink (300ml)', price: 50 },
    { id: 'salad', name: 'Crisp Garden Salad', price: 35 },
  ];

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const sizePrice = availableSizes.find((s) => s.id === selectedSize)?.price || 0;
  const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const finalUnitPrice = item.price + sizePrice + addonsPrice;

  const handleConfirm = () => {
    addToCart(item._id, 1, {
      size: selectedSize,
      addons: selectedAddons,
      instructions,
      customPrice: finalUnitPrice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">{item.name}</h3>
            <p className="text-xs text-slate-500">Customize your food preferences</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Portion Size selection */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2.5 flex items-center justify-between">
              <span>Choose Portion Size</span>
              <span className="text-[11px] font-semibold text-orange-600 uppercase bg-orange-50 px-2 py-0.5 rounded">
                Required
              </span>
            </h4>
            <div className="space-y-2">
              {availableSizes.map((size) => (
                <label
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    selectedSize === size.id
                      ? 'border-orange-500 bg-orange-50/50 text-slate-900 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedSize === size.id ? 'border-orange-600' : 'border-slate-300'
                      }`}
                    >
                      {selectedSize === size.id && (
                        <div className="w-2 h-2 rounded-full bg-orange-600" />
                      )}
                    </div>
                    <span>{size.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {size.price > 0 ? `+₹${size.price}` : 'Free'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Add-ons selection */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2.5 flex items-center justify-between">
              <span>Add Extras & Sides</span>
              <span className="text-[11px] font-normal text-slate-400">Optional</span>
            </h4>
            <div className="space-y-2">
              {availableAddons.map((addon) => {
                const isSelected = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <label
                    key={addon.id}
                    onClick={() => toggleAddon(addon)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 text-slate-900 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span>{addon.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">+₹{addon.price}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Special Cooking Note */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Special Request for the Chef</h4>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Less spicy, keep chutney separate..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-sm"
              maxLength={100}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Item Price</span>
            <span className="text-xl font-extrabold text-slate-900">₹{finalUnitPrice}</span>
          </div>
          <button
            onClick={handleConfirm}
            className="flex-1 max-w-[220px] py-3 px-5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-600/30 transition transform active:scale-98 text-center"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
