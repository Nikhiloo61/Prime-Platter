import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  selectedCuisine,
  onCuisineChange,
  dietFilter,
  onDietFilterChange,
  sortBy,
  onSortChange,
}) => {
  const cuisines = [
    'All',
    'Indian',
    'Biryani',
    'Chinese',
    'Italian',
    'Pizza',
    'Burgers',
    'Dessert',
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Top Search Input & Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            id="main-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for restaurants, cuisines, biryani, pizzas..."
            className="w-full pl-12 pr-10 py-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-800 placeholder-slate-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-white border border-slate-200/80 rounded-2xl px-3.5 py-3 shadow-xs text-sm font-semibold text-slate-700 min-w-[170px]">
            <ArrowUpDown className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent border-none outline-hidden cursor-pointer w-full text-xs font-bold text-slate-800"
            >
              <option value="rating">Top Rated</option>
              <option value="deliveryTime">Fastest Delivery</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Cuisine Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {cuisines.map((c) => {
            const isSelected = selectedCuisine === c || (c === 'All' && !selectedCuisine);
            return (
              <button
                key={c}
                onClick={() => onCuisineChange(c === 'All' ? '' : c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Diet preference filter (Veg / Non-Veg toggle) */}
        <div className="flex items-center bg-white border border-slate-200/80 rounded-full p-1 shadow-xs text-xs font-bold">
          <button
            onClick={() => onDietFilterChange('All')}
            className={`px-3 py-1 rounded-full transition ${
              dietFilter === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onDietFilterChange('Veg')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
              dietFilter === 'Veg'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:text-emerald-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
            Veg Only
          </button>
          <button
            onClick={() => onDietFilterChange('Non-Veg')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
              dietFilter === 'Non-Veg'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:text-rose-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-300" />
            Non-Veg
          </button>
        </div>
      </div>
    </div>
  );
};
