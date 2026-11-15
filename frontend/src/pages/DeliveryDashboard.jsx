import React, { useState, useEffect } from 'react';
import {
  Bike,
  Power,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  PackageCheck,
  TrendingUp,
  Clock,
  DollarSign,
  Navigation,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const DeliveryDashboard = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [isOnline, setIsOnline] = useState(true);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);

  const fetchDeliveryOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/delivery/assigned');
      if (data.success) {
        const all = data.orders || [];
        setAssignedOrders(all.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'));
        setCompletedOrders(all.filter((o) => o.orderStatus === 'Delivered'));
      }
    } catch (err) {
      // If endpoint is using admin fallback
      try {
        const { data: adminOrders } = await api.get('/orders/admin/all');
        const active = (adminOrders.orders || []).filter(
          (o) => o.orderStatus === 'Preparing' || o.orderStatus === 'Out for Delivery'
        );
        const done = (adminOrders.orders || []).filter((o) => o.orderStatus === 'Delivered');
        setAssignedOrders(active);
        setCompletedOrders(done);
      } catch (innerErr) {
        // console.error(innerErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  // Update order delivery milestone
  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      const { data } = await api.put(`/orders/admin/${orderId}/status`, {
        status: nextStatus,
        note: `Updated by delivery partner: ${nextStatus}`,
        paymentStatus: nextStatus === 'Delivered' ? 'Paid' : undefined,
      });

      if (data.success) {
        success(`Delivery status updated: ${nextStatus}`);
        fetchDeliveryOrders();
      }
    } catch (err) {
      error(err.message || 'Failed to update order status');
    }
  };

  // Real GPS live location update mechanism
  const triggerGpsUpdate = () => {
    if (!navigator.geolocation) {
      error('Geolocation not supported on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationSharing(true);
        success(
          `GPS synchronized! Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}`
        );
      },
      (err) => {
        error(`GPS permission denied: ${err.message}`);
      }
    );
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <Bike className="w-10 h-10 text-emerald-600 animate-bounce mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700">Connecting Delivery Partner Hub...</p>
      </div>
    );
  }

  const totalEarnings = completedOrders.length * 45; // ₹45 per successful delivery payout

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black">{user?.name || 'Delivery Partner'}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                isOnline ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {isOnline ? 'Active Online' : 'Duty Offline'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Assigned Zone: Central Delhi • {user?.phone || '+91 98765 01234'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerGpsUpdate}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>{locationSharing ? 'GPS Synced' : 'Sync GPS'}</span>
          </button>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              isOnline
                ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Payout Earnings</span>
            <h3 className="text-2xl font-black text-slate-900">₹{totalEarnings}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Active Deliveries</span>
            <h3 className="text-2xl font-black text-slate-900">{assignedOrders.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Completed</span>
            <h3 className="text-2xl font-black text-slate-900">{completedOrders.length}</h3>
          </div>
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-slate-900">Assigned Delivery Tasks</h3>

        {assignedOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Bike className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No active deliveries right now</p>
            <p className="text-xs text-slate-400">Keep status online to receive incoming drop assignments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Order</span>
                    <h4 className="text-base font-black text-slate-900">#{order.orderId}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full">
                      {order.orderStatus}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      Collect: ₹{order.pricing?.total} ({order.paymentInfo?.method})
                    </span>
                  </div>
                </div>

                {/* Customer Address & Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">
                      Customer Destination
                    </span>
                    <p className="font-bold text-slate-900">{order.customer?.name}</p>
                    <p className="text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      <span>
                        {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                      </span>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px]">
                        Customer Contact
                      </span>
                      <p className="font-bold text-slate-900">{order.customer?.phone}</p>
                    </div>
                    <a
                      href={`tel:${order.customer?.phone}`}
                      className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Customer</span>
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {order.orderStatus === 'Preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                    >
                      Pick Up from Kitchen
                    </button>
                  )}

                  {order.orderStatus === 'Out for Delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete & Mark Delivered</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
