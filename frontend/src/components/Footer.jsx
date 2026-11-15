import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShieldCheck, Heart, Award, Clock, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features highlight bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Lightning Fast Delivery</h4>
              <p className="text-xs text-slate-400">Average 30 minutes to your doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Finest Hygiene & Quality</h4>
              <p className="text-xs text-slate-400">FSSAI certified partner kitchens</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Secure Payments</h4>
              <p className="text-xs text-slate-400">Razorpay verified & Cash on Delivery</p>
            </div>
          </div>
        </div>

        {/* Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white">Prime Platter</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-4">
              Your favorite restaurants, local delicacies, and gourmet treats delivered piping hot in minutes. Inspired by the best of food tech.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-orange-400" /> +91 (800) 123-4567</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-orange-400" /> support@primeplatter.com</span>
            </div>
          </div>

          {/* Popular Cuisines */}
          <div>
            <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Popular Cuisines</h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/?cuisine=Indian" className="hover:text-orange-400 transition">North Indian</Link></li>
              <li><Link to="/?cuisine=Biryani" className="hover:text-orange-400 transition">Dum Biryani</Link></li>
              <li><Link to="/?cuisine=Chinese" className="hover:text-orange-400 transition">Chinese & Momos</Link></li>
              <li><Link to="/?cuisine=Italian" className="hover:text-orange-400 transition">Pizzas & Pasta</Link></li>
              <li><Link to="/?cuisine=Dessert" className="hover:text-orange-400 transition">Desserts & Shakes</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Company</h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/profile" className="hover:text-orange-400 transition">My Account</Link></li>
              <li><Link to="/my-orders" className="hover:text-orange-400 transition">Track Orders</Link></li>
              <li><Link to="/login" className="hover:text-orange-400 transition">Restaurant Partner</Link></li>
              <li><Link to="/login" className="hover:text-orange-400 transition">Delivery Partner</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Legal</h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><span className="hover:text-orange-400 cursor-pointer transition">Terms & Conditions</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">Privacy Policy</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">Refund & Cancellation</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">Cookie Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Prime Platter Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for exceptional food experiences
          </p>
        </div>
      </div>
    </footer>
  );
};
