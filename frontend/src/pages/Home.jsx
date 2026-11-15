import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  Percent
} from 'lucide-react';
import api from '../services/api';
import { RestaurantCard } from '../components/RestaurantCard';
import { FoodCard } from '../components/FoodCard';
import { CategoryNav } from '../components/CategoryNav';
import { SearchBar } from '../components/SearchBar';
import { RestaurantSkeleton, FoodSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { CustomizationModal } from '../components/CustomizationModal';

export const Home = ({ onOpenAiAssistant }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '');
  const [dietFilter, setDietFilter] = useState('All'); // 'All', 'Veg', 'Non-Veg'
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'deliveryTime', 'priceLowHigh', 'priceHighLow'

  // Customization modal state
  const [customizingItem, setCustomizingItem] = useState(null);

  // Sync cuisine query param if changed
  useEffect(() => {
    const cuisineParam = searchParams.get('cuisine');
    if (cuisineParam) {
      setSelectedCuisine(cuisineParam);
    }
  }, [searchParams]);

  // Load all restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const { data } = await api.get('/restaurants');
        if (data.success) {
          setRestaurants(data.data || []);
        }
      } catch (err) {
        // console.error('Failed to fetch restaurants:', err);
      } finally {
        setLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Load all menu items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoadingMenu(true);
        const { data } = await api.get('/menu');
        if (data.success) {
          setMenuItems(data.data || []);
        }
      } catch (err) {
        // console.error('Failed to fetch menu:', err);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  // Filtered & Sorted Restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => {
        const matchesSearch =
          !searchQuery.trim() ||
          r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.location?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCuisine =
          !selectedCuisine ||
          r.cuisine?.toLowerCase().includes(selectedCuisine.toLowerCase());

        return matchesSearch && matchesCuisine;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'deliveryTime') {
          const timeA = parseInt(a.deliveryTime) || 30;
          const timeB = parseInt(b.deliveryTime) || 30;
          return timeA - timeB;
        }
        return 0;
      });
  }, [restaurants, searchQuery, selectedCuisine, sortBy]);

  // Filtered & Sorted Dishes
  const filteredFoods = useMemo(() => {
    return menuItems
      .filter((f) => {
        const matchesSearch =
          !searchQuery.trim() ||
          f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.category?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCuisine =
          !selectedCuisine ||
          f.cuisine?.toLowerCase().includes(selectedCuisine.toLowerCase());

        const matchesDiet =
          dietFilter === 'All' || f.type === dietFilter;

        return matchesSearch && matchesCuisine && matchesDiet;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'priceLowHigh') return a.price - b.price;
        if (sortBy === 'priceHighLow') return b.price - a.price;
        return 0;
      });
  }, [menuItems, searchQuery, selectedCuisine, dietFilter, sortBy]);

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white pt-12 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 rounded-b-[2.5rem] shadow-xl mb-10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Delivering Joy In 30 Minutes Or Free</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white drop-shadow-xs">
              Order Delicious Food <br />
              <span className="text-amber-200">From Top Restaurants</span>
            </h1>

            <p className="text-base sm:text-lg text-orange-100 max-w-xl font-medium">
              Explore authentic biryanis, gourmet burgers, artisan wood-fired pizzas, and traditional Indian curries delivered piping hot to your doorstep.
            </p>

            {/* Quick Hero Features */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-300" />
                </div>
                <span>Fast 30 Min Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-amber-300" />
                </div>
                <span>Up to 50% Discounts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                </div>
                <span>Contactless Delivery</span>
              </div>
            </div>
          </div>

          {/* Hero Promo Banner Box */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-extrabold uppercase">
                  Featured Offer
                </span>
                <span className="text-xs text-orange-100 font-semibold">Limited Time</span>
              </div>
              <h3 className="text-2xl font-black mb-1">WELCOME50</h3>
              <p className="text-xs text-orange-100 mb-4">
                Get 50% OFF up to ₹100 on your first order. Use code at checkout!
              </p>
              <div className="p-3 bg-white/15 rounded-2xl flex items-center justify-between text-xs font-bold">
                <span>Craving something special?</span>
                <button
                  onClick={onOpenAiAssistant}
                  className="px-3 py-1.5 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition shadow-xs"
                >
                  Ask AI
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Carousel */}
        <CategoryNav
          selectedCuisine={selectedCuisine}
          onSelectCuisine={(c) => {
            setSelectedCuisine(c);
            if (c) setSearchParams({ cuisine: c });
            else setSearchParams({});
          }}
        />

        {/* Search & Dynamic Filter Controls */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCuisine={selectedCuisine}
          onCuisineChange={(c) => {
            setSelectedCuisine(c);
            if (c) setSearchParams({ cuisine: c });
            else setSearchParams({});
          }}
          dietFilter={dietFilter}
          onDietFilterChange={setDietFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Section 1: Popular Dishes */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                Popular Dishes Near You
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Frequently ordered favorites by food lovers
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {filteredFoods.length} items available
            </span>
          </div>

          {loadingMenu ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <FoodSkeleton key={i} />
              ))}
            </div>
          ) : filteredFoods.length === 0 ? (
            <EmptyState
              title="No dishes found"
              description="We couldn't find any dishes matching your filters. Try clearing your search."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedCuisine('');
                setDietFilter('All');
                setSearchParams({});
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFoods.slice(0, 9).map((food) => (
                <FoodCard
                  key={food._id}
                  item={food}
                  onCustomize={(item) => setCustomizingItem(item)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Top Restaurants */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                Top Restaurants To Explore
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Handcrafted menus from the city's finest kitchens
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {filteredRestaurants.length} restaurants
            </span>
          </div>

          {loadingRestaurants ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <RestaurantSkeleton key={i} />
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <EmptyState
              title="No restaurants found"
              description="Try adjusting your cuisine or search keyword to discover more kitchens."
              actionLabel="View All Restaurants"
              onAction={() => {
                setSearchQuery('');
                setSelectedCuisine('');
                setSearchParams({});
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Item Customization Modal */}
      <CustomizationModal
        item={customizingItem}
        isOpen={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
      />
    </div>
  );
};
