import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Package,
  Store,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Tag,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Sliders,
  Settings
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const AdminDashboard = () => {
  const { success, error } = useToast();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'analytics' | 'orders' | 'restaurants' | 'menu' | 'coupons' | 'settings'
  const [activeTab, setActiveTab] = useState('analytics');

  // Filter & search states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Coupon state
  const [coupons, setCoupons] = useState([
    { code: 'WELCOME50', discount: '50% up to ₹100', minOrder: 199, active: true },
    { code: 'TASTY20', discount: '20% up to ₹75', minOrder: 199, active: true },
    { code: 'FREEDEL', discount: 'Free Delivery', minOrder: 0, active: true },
    { code: 'PRIME50', discount: '₹50 Flat Off', minOrder: 249, active: true },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, restsRes, menuRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/orders/admin/all'),
        api.get('/restaurants'),
        api.get('/menu'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders || []);
      if (restsRes.data.success) setRestaurants(restsRes.data.data || []);
      if (menuRes.data.success) setMenuItems(menuRes.data.data || []);
    } catch (err) {
      error(err.message || 'Failed to load administrator data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { data } = await api.put(`/orders/admin/${orderId}/status`, {
        status: newStatus,
        note: `Status updated by Admin to ${newStatus}`,
      });
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId || o.orderId === orderId ? data.order : o))
        );
        success(`Order status updated to: ${newStatus}`);
      }
    } catch (err) {
      error(err.message || 'Could not update status');
    }
  };

  const handleToggleMenuItem = async (itemId) => {
    try {
      const { data } = await api.put(`/admin/menu/${itemId}/toggle`);
      if (data.success) {
        setMenuItems((prev) =>
          prev.map((m) => (m._id === itemId ? data.menuItem : m))
        );
        success(data.message);
      }
    } catch (err) {
      error(err.message || 'Could not toggle item availability');
    }
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode) return;
    setCoupons([
      ...coupons,
      {
        code: newCouponCode.toUpperCase().trim(),
        discount: newCouponDiscount || 'Special Promotion',
        minOrder: 199,
        active: true,
      },
    ]);
    success(`Coupon ${newCouponCode.toUpperCase()} activated!`);
    setNewCouponCode('');
    setNewCouponDiscount('');
  };

  // Monthly revenue chart sample points
  const revenueChartData = [
    { month: 'Jun', revenue: 42000, orders: 120 },
    { month: 'Jul', revenue: 58000, orders: 165 },
    { month: 'Aug', revenue: 74000, orders: 210 },
    { month: 'Sep', revenue: 91000, orders: 280 },
    { month: 'Oct', revenue: 115000, orders: 340 },
    { month: 'Nov', revenue: stats?.totalRevenue || 132000, orders: stats?.totalOrders || 390 },
  ];

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      !orderSearch.trim() ||
      o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <ShieldCheck className="w-12 h-12 text-indigo-600 animate-bounce mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700">Connecting Prime Platter Admin Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black">Admin Command Center</h1>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-indigo-500 text-white">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Platform operations, merchant controls, revenue analytics, and real-time moderation
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
            <h3 className="text-2xl font-black text-slate-900">₹{stats?.totalRevenue || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold mb-3">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
            <h3 className="text-2xl font-black text-slate-900">{stats?.totalOrders || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-3">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Restaurants</span>
            <h3 className="text-2xl font-black text-slate-900">{restaurants.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Registered Customers</span>
            <h3 className="text-2xl font-black text-slate-900">{stats?.totalUsers || 24}</h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'analytics', label: 'Analytics & Revenue' },
          { id: 'orders', label: `Orders (${orders.length})` },
          { id: 'restaurants', label: `Restaurants (${restaurants.length})` },
          { id: 'menu', label: `Menu Items (${menuItems.length})` },
          { id: 'coupons', label: `Promotions (${coupons.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Analytics & Revenue (Recharts) */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Revenue Trend Area Chart */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Monthly Revenue Trend (₹)
                  </h3>
                  <p className="text-xs text-slate-400">Total gross order receipts across platform</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                  +28.4% MoM
                </span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fc8019" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#fc8019" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      formatter={(val) => [`₹${val}`, 'Revenue']}
                      contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ea580c"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Orders Bar Chart */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Order Volume</h3>
                <p className="text-xs text-slate-400">Monthly completed platters</p>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      formatter={(val) => [val, 'Orders']}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="orders" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Moderation */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by Order ID or Customer..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="All">All Statuses</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Admin Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-600">{o.orderId}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{o.customer?.name}</div>
                      <div className="text-[11px] text-slate-400">{o.customer?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">{o.items?.length || 0} items</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ₹{o.pricing?.total}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.paymentInfo?.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.paymentInfo?.status} ({o.paymentInfo?.method})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{o.orderStatus}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Restaurants */}
      {activeTab === 'restaurants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((rest) => (
            <div
              key={rest._id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex gap-4">
                <img
                  src={rest.image}
                  alt={rest.name}
                  className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                />
                <div>
                  <h4 className="font-bold text-base text-slate-900">{rest.name}</h4>
                  <p className="text-xs text-slate-500">{rest.cuisine}</p>
                  <p className="text-xs font-semibold text-slate-400">{rest.location}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span
                  className={`px-2.5 py-1 rounded-full font-bold ${
                    rest.isOpen
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {rest.isOpen ? 'Open' : 'Closed'}
                </span>
                <span className="font-bold text-slate-700">★ {rest.rating || 4.2}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Menu Items */}
      {activeTab === 'menu' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900">Platform Menu Catalog</h4>
            <span className="text-xs text-slate-500">{menuItems.length} active dishes</span>
          </div>
          <div className="divide-y divide-slate-100">
            {menuItems.map((item) => (
              <div key={item._id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900">{item.name}</h5>
                    <p className="text-slate-400">
                      {item.category} • ₹{item.price} • {item.cuisine}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleMenuItem(item._id)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    item.available
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {item.available ? 'In Stock' : 'Out of Stock'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Coupons & Promotions */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          {/* Create Coupon Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h4 className="font-extrabold text-base text-slate-900 mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-600" />
              Create Promo Discount Code
            </h4>
            <form onSubmit={handleCreateCoupon} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                placeholder="PROMO CODE (e.g. FESTIVE30)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 uppercase text-xs font-bold"
              />
              <input
                type="text"
                required
                value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(e.target.value)}
                placeholder="Discount Rule (e.g. 30% off up to ₹150)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Launch Coupon
              </button>
            </form>
          </div>

          {/* Active Promo Codes List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {coupons.map((c, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-orange-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm text-orange-600">{c.code}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">{c.discount}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Min Order: ₹{c.minOrder}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
