import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  Power,
  ChefHat,
  Bike
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RestaurantDashboard = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'profile'
  const [loading, setLoading] = useState(true);

  // New Item Modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    cuisine: 'Indian',
    type: 'Veg',
    image: '',
    description: '',
    available: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch restaurant owned by or assigned to this user
      const { data: restData } = await api.get('/restaurants/owner/me');
      let currentRest = restData?.data;

      // If user owns a specific restaurant, load it; otherwise fallback to first available
      if (!currentRest) {
        const { data: allRests } = await api.get('/restaurants');
        currentRest = allRests.data?.[0];
      }

      if (currentRest) {
        setRestaurant(currentRest);
        const [menuRes, ordersRes] = await Promise.all([
          api.get('/menu', { params: { restaurantId: currentRest._id } }),
          api.get(`/orders/restaurant/${currentRest._id}`),
        ]);

        if (menuRes.data.success) setMenuItems(menuRes.data.data || []);
        if (ordersRes.data.success) setOrders(ordersRes.data.orders || []);
      }
    } catch (err) {
      // If owner endpoint not found yet, graceful fallback
      const { data: allRests } = await api.get('/restaurants');
      if (allRests.data?.[0]) {
        setRestaurant(allRests.data[0]);
        const menuRes = await api.get('/menu', {
          params: { restaurantId: allRests.data[0]._id },
        });
        setMenuItems(menuRes.data.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle restaurant open / closed
  const handleToggleOpen = async () => {
    if (!restaurant) return;
    try {
      const updatedStatus = !restaurant.isOpen;
      const { data } = await api.put(`/restaurants/${restaurant._id}`, {
        isOpen: updatedStatus,
      });
      if (data.success) {
        setRestaurant(data.data);
        success(`Restaurant is now ${updatedStatus ? 'OPEN' : 'CLOSED'}`);
      }
    } catch (err) {
      error(err.message || 'Failed to update restaurant status');
    }
  };

  // Toggle item availability
  const handleToggleItemAvailability = async (itemId) => {
    try {
      const { data } = await api.put(`/admin/menu/${itemId}/toggle`);
      if (data.success) {
        setMenuItems((prev) =>
          prev.map((item) => (item._id === itemId ? data.menuItem : item))
        );
        success(data.message);
      }
    } catch (err) {
      error(err.message || 'Could not update item');
    }
  };

  // Save new or edited food item
  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { data } = await api.put(`/menu/${editingItem._id}`, itemForm);
        if (data.success) {
          setMenuItems((prev) =>
            prev.map((i) => (i._id === editingItem._id ? data.data : i))
          );
          success('Menu item updated!');
        }
      } else {
        const { data } = await api.post('/menu', {
          ...itemForm,
          restaurantId: restaurant._id,
        });
        if (data.success) {
          setMenuItems((prev) => [data.data, ...prev]);
          success('New menu item added!');
        }
      }
      setShowItemModal(false);
      setEditingItem(null);
    } catch (err) {
      error(err.message || 'Failed to save item');
    }
  };

  // Delete food item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this dish permanently from menu?')) return;
    try {
      await api.delete(`/menu/${itemId}`);
      setMenuItems((prev) => prev.filter((i) => i._id !== itemId));
      success('Item deleted');
    } catch (err) {
      error(err.message || 'Failed to delete item');
    }
  };

  // Update order status (Accept, Reject, Preparing, Ready)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { data } = await api.put(`/orders/admin/${orderId}/status`, {
        status: newStatus,
        note: `Status updated by kitchen to ${newStatus}`,
      });
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId || o.orderId === orderId ? data.order : o))
        );
        success(`Order marked as ${newStatus}`);
      }
    } catch (err) {
      error(err.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center">
        <ChefHat className="w-10 h-10 text-orange-600 animate-bounce mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700">Loading Restaurant Partner Portal...</p>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.orderStatus === 'Delivered' || o.paymentInfo?.status === 'Paid')
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  const pendingCount = orders.filter(
    (o) => o.orderStatus === 'Order Placed' || o.orderStatus === 'Confirmed'
  ).length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black">{restaurant?.name || 'My Restaurant'}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                restaurant?.isOpen ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
              }`}
            >
              {restaurant?.isOpen ? 'Online & Taking Orders' : 'Offline / Closed'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {restaurant?.cuisine} Cuisine • {restaurant?.location} • {restaurant?.deliveryTime}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleOpen}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
              restaurant?.isOpen
                ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{restaurant?.isOpen ? 'Close Restaurant' : 'Open Restaurant'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
            <h3 className="text-2xl font-black text-slate-900">₹{totalRevenue}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Pending Orders</span>
            <h3 className="text-2xl font-black text-slate-900">{pendingCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Menu Items</span>
            <h3 className="text-2xl font-black text-slate-900">{menuItems.length}</h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'orders'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Live Kitchen Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'menu'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Manage Menu ({menuItems.length})
        </button>
      </div>

      {/* Tab 1: Live Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No active kitchen orders</p>
              <p className="text-xs text-slate-400">Incoming orders will appear here in real-time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-black text-orange-600">
                        #{order.orderId}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {order.customer?.name}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-orange-100 text-orange-800">
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.quantity} × {item.name}
                        </span>
                        <span className="font-bold">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      <strong>Cooking note:</strong> {order.specialInstructions}
                    </div>
                  )}

                  {/* Kitchen Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    {order.orderStatus === 'Order Placed' && (
                      <>
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'Confirmed')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                        >
                          Accept Order
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'Cancelled')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition border border-rose-200"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {order.orderStatus === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, 'Preparing')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition"
                      >
                        Start Preparing
                      </button>
                    )}

                    {order.orderStatus === 'Preparing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, 'Out for Delivery')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
                      >
                        Ready for Pickup
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manage Menu */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-slate-900">Food Menu Dishes</h3>
            <button
              onClick={() => {
                setEditingItem(null);
                setItemForm({
                  name: '',
                  price: '',
                  category: 'Main Course',
                  cuisine: restaurant?.cuisine || 'Indian',
                  type: 'Veg',
                  image: '',
                  description: '',
                  available: true,
                });
                setShowItemModal(true);
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex gap-4">
                  <img
                    src={
                      item.image ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          item.type === 'Veg' ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                    <p className="font-extrabold text-sm text-orange-600">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => handleToggleItemAvailability(item._id)}
                    className={`px-3 py-1 rounded-lg font-bold ${
                      item.available
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.available ? 'In Stock' : 'Out of Stock'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setItemForm(item);
                        setShowItemModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-orange-600 transition"
                      title="Edit dish"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 transition"
                      title="Delete dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item Modal (Create or Edit) */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-black text-lg text-slate-900 mb-4">
              {editingItem ? 'Edit Dish' : 'Add New Dish to Menu'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Shahi Paneer Butter Masala"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Diet Type</label>
                  <select
                    value={itemForm.type}
                    onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    placeholder="Main Course, Starters..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cuisine</label>
                  <input
                    type="text"
                    value={itemForm.cuisine}
                    onChange={(e) => setItemForm({ ...itemForm, cuisine: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={itemForm.image}
                  onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Flavor profile, spices used..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Save Dish
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
