import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  MapPin,
  Search,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Tag
} from 'lucide-react';
import api from '../services/api';
import { FoodCard } from '../components/FoodCard';
import { FoodSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { CustomizationModal } from '../components/CustomizationModal';

export const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters within menu
  const [searchWord, setSearchWord] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [customizingItem, setCustomizingItem] = useState(null);

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setLoading(true);
        const [restRes, menuRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get('/menu', { params: { restaurantId: id } }),
        ]);

        if (restRes.data.success) {
          setRestaurant(restRes.data.data);
        }
        if (menuRes.data.success) {
          setMenuItems(menuRes.data.data || []);
        }
      } catch (err) {
        // console.error('Failed to load restaurant data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantAndMenu();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <FoodSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Restaurant Not Found"
          description="The restaurant you requested may have relocated or is temporarily unavailable."
          actionLabel="Back to Home"
          onAction={() => (window.location.href = '/')}
        />
      </div>
    );
  }

  // Derive all unique menu categories
  const categories = ['All', ...new Set(menuItems.map((m) => m.category || 'Main Course'))];

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      !searchWord.trim() ||
      item.name.toLowerCase().includes(searchWord.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchWord.toLowerCase());

    const matchesVeg = !vegOnly || item.type === 'Veg';
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;

    return matchesSearch && matchesVeg && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Restaurant Header Section */}
      <div className="bg-slate-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Restaurants</span>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Restaurant Image */}
            <div className="md:col-span-4 h-56 rounded-3xl overflow-hidden shadow-2xl bg-slate-800 border border-slate-700">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Restaurant Info */}
            <div className="md:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-extrabold rounded-lg uppercase tracking-wide border border-orange-500/30">
                  {restaurant.cuisine}
                </span>
                <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  <Star className="w-3.5 h-3.5 fill-emerald-400" />
                  {restaurant.rating || 4.5} (500+ ratings)
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white">{restaurant.name}</h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {restaurant.description || 'Finest culinary dishes cooked to perfection.'}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-slate-300 border-t border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span>{restaurant.deliveryTime} Delivery</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>{restaurant.location || 'Connaught Place'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-orange-400" />
                  <span>Min Order ₹{restaurant.minOrder || 150}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Menu Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Menu Search & Veg Toggle Bar */}
        <div className="sticky top-20 z-30 bg-slate-50/95 backdrop-blur-md py-4 mb-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* In-menu search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="Search in menu..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Category Tabs & Veg Filter */}
          <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {/* Veg Switch */}
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 select-none flex-shrink-0">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Veg Only</span>
            </label>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <EmptyState
            title="No menu items match your filter"
            description="Try changing the category or turning off the Veg Only filter."
            actionLabel="Reset Menu Filters"
            onAction={() => {
              setSearchWord('');
              setVegOnly(false);
              setActiveCategory('All');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <FoodCard
                key={item._id}
                item={item}
                onCustomize={(i) => setCustomizingItem(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Customization Modal */}
      <CustomizationModal
        item={customizingItem}
        isOpen={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
      />
    </div>
  );
};
