import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Lock, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      success(`Welcome back, ${user.name}!`);

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'restaurant_owner') navigate('/restaurant-dashboard');
      else if (user.role === 'delivery_partner') navigate('/delivery-dashboard');
      else navigate(from);
    } catch (err) {
      error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900">Prime Platter</span>
          </Link>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to manage platters, orders, and addresses</p>
        </div>

        {/* Demo Accounts Bar for evaluation */}
        <div className="p-3 bg-orange-50/70 border border-orange-200/60 rounded-2xl space-y-2">
          <span className="flex items-center gap-1 text-[11px] font-black text-orange-800 uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5 text-orange-600" />
            Quick Demo Logins:
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => quickFill('admin@primeplatter.com', 'Admin@123')}
              className="py-1 px-2 rounded-lg bg-white hover:bg-orange-100 text-slate-700 font-bold border border-orange-200 text-left transition"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => quickFill('spicyvilla@primeplatter.com', 'Restaurant@123')}
              className="py-1 px-2 rounded-lg bg-white hover:bg-orange-100 text-slate-700 font-bold border border-orange-200 text-left transition"
            >
              🍳 Restaurant Owner
            </button>
            <button
              type="button"
              onClick={() => quickFill('rider@primeplatter.com', 'Rider@123')}
              className="py-1 px-2 rounded-lg bg-white hover:bg-orange-100 text-slate-700 font-bold border border-orange-200 text-left transition"
            >
              🛵 Delivery Partner
            </button>
            <button
              type="button"
              onClick={() => quickFill('customer@primeplatter.com', 'Customer@123')}
              className="py-1 px-2 rounded-lg bg-white hover:bg-orange-100 text-slate-700 font-bold border border-orange-200 text-left transition"
            >
              👤 Customer Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <span className="text-[11px] font-semibold text-orange-600 hover:underline cursor-pointer">
                Forgot?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-60 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/30 transition transform active:scale-98 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 font-medium">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-orange-600 hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
