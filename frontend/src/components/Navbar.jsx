import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  Search,
  Sparkles,
  MapPin,
  Menu,
  X,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Bike,
  UtensilsCrossed,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = ({ onOpenAiAssistant }) => {
  const { user, logout, isAdmin, isRestaurantOwner, isDeliveryPartner } = useAuth();
  const { totalItems, openCart } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const currentAddress =
    user?.addresses?.find((a) => a.isDefault)?.city ||
    user?.addresses?.[0]?.city ||
    'Connaught Place, New Delhi';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Location */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Prime Platter
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 -mt-1">
                Food & Feast
              </span>
            </div>
          </Link>

          {/* Location Picker */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-600 bg-slate-100/80 hover:bg-slate-100 px-3.5 py-2 rounded-full cursor-pointer transition border border-slate-200/60 max-w-[240px]">
            <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0 animate-bounce" />
            <span className="font-semibold text-slate-900 truncate">Deliver to:</span>
            <span className="truncate text-slate-600">{currentAddress}</span>
          </div>
        </div>

        {/* Center: Search / Assistant shortcut */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-4">
          <button
            onClick={() => {
              if (location.pathname !== '/') {
                navigate('/?focusSearch=1');
              } else {
                document.getElementById('main-search-input')?.focus();
              }
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-500 rounded-xl text-sm transition text-left border border-slate-200/60 shadow-inner"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search for restaurants, biryani, pizza...</span>
          </button>

          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all transform hover:scale-102 flex-shrink-0 cursor-pointer"
            title="Ask AI Food Assistant"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow text-amber-200" />
            <span>AI Assistant</span>
          </button>
        </div>

        {/* Right: Actions & User Navigation */}
        <div className="flex items-center gap-3">
          {/* Cart Trigger */}
          <button
            onClick={openCart}
            className="relative flex items-center gap-2.5 px-4 py-2.5 bg-orange-50 hover:bg-orange-100/80 text-orange-700 font-semibold rounded-xl text-sm transition-all border border-orange-200/60 cursor-pointer group"
            aria-label="Open Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold">Cart</span>
          </button>

          {/* User Profile / Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shadow-sm text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-md uppercase">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile & Addresses</span>
                    </Link>

                    <Link
                      to="/my-orders"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>

                    {/* Role-Specific Dashboards */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    {isRestaurantOwner && (
                      <Link
                        to="/restaurant-dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-amber-700 bg-amber-50/70 hover:bg-amber-100/70 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-600" />
                        <span>Restaurant Dashboard</span>
                      </Link>
                    )}

                    {isDeliveryPartner && (
                      <Link
                        to="/delivery-dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/70 transition"
                      >
                        <Bike className="w-4 h-4 text-emerald-600" />
                        <span>Delivery Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-sm font-bold rounded-xl shadow-md shadow-orange-600/20 transition transform hover:scale-102"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-2 rounded-xl">
            <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="truncate">{currentAddress}</span>
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenAiAssistant();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Food Assistant</span>
          </button>

          <Link
            to="/?focusSearch=1"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search Foods & Restaurants</span>
          </Link>

          {user && (
            <>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/my-orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                <Package className="w-4 h-4 text-slate-400" />
                <span>My Orders</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 rounded-xl"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              {isRestaurantOwner && (
                <Link
                  to="/restaurant-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-amber-700 bg-amber-50 rounded-xl"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-600" />
                  <span>Restaurant Dashboard</span>
                </Link>
              )}
              {isDeliveryPartner && (
                <Link
                  to="/delivery-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl"
                >
                  <Bike className="w-4 h-4 text-emerald-600" />
                  <span>Delivery Dashboard</span>
                </Link>
              )}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
