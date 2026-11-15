import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PackageCheck,
  Clock,
  MapPin,
  Bike,
  CheckCircle2,
  Phone,
  AlertCircle,
  ArrowLeft,
  XCircle,
  ChefHat,
  Receipt,
  Navigation
} from 'lucide-react';
import api from '../services/api';
import { getSocket, joinOrderRoom, leaveOrderRoom } from '../services/socket';
import { useToast } from '../context/ToastContext';

export const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { success, error } = useToast();

  const fetchOrder = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const { data } = await api.get(`/orders/${id}`);
      if (data.success && data.order) {
        setOrder((prev) => {
          if (prev && prev.orderStatus !== data.order.orderStatus) {
            success(`Order status updated to: ${data.order.orderStatus}`);
          }
          return data.order;
        });
      }
    } catch (err) {
      if (showLoading) {
        error(err.message || 'Could not load order tracking details');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder(true);

    // Socket.io Real-time setup
    const socket = getSocket();
    joinOrderRoom(id);

    const handleStatusUpdate = (updatedOrder) => {
      if (
        updatedOrder.orderId === id ||
        updatedOrder._id === id ||
        (order && order._id === updatedOrder._id)
      ) {
        setOrder(updatedOrder);
        success(`Order status updated to: ${updatedOrder.orderStatus}`);
      }
    };

    if (socket) {
      socket.on('order:status_updated', handleStatusUpdate);
    }

    // Smart polling fallback (essential for serverless platforms like Vercel where WebSockets disconnect)
    const interval = setInterval(() => {
      setOrder((current) => {
        const isTerminal = current && ['Delivered', 'Cancelled'].includes(current.orderStatus);
        if (!isTerminal) {
          fetchOrder(false);
        }
        return current;
      });
    }, 5000);

    return () => {
      leaveOrderRoom(id);
      if (socket) {
        socket.off('order:status_updated', handleStatusUpdate);
      }
      clearInterval(interval);
    };
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      const { data } = await api.put(`/orders/${order._id || id}/cancel`, {
        reason: 'Customer initiated cancellation via tracking dashboard',
      });
      if (data.success) {
        setOrder(data.order);
        success('Order cancelled successfully');
      }
    } catch (err) {
      error(err.message || 'Unable to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center animate-bounce">
            <Bike className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-700">Connecting live tracking...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">We could not locate this order ID in our records.</p>
        <Link to="/" className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold">
          Go Home
        </Link>
      </div>
    );
  }

  // Stages configuration
  const stages = [
    { title: 'Order Placed', icon: PackageCheck, desc: 'Received by kitchen' },
    { title: 'Confirmed', icon: CheckCircle2, desc: 'Kitchen acknowledged order' },
    { title: 'Preparing', icon: ChefHat, desc: 'Chef preparing fresh ingredients' },
    { title: 'Out for Delivery', icon: Bike, desc: 'Driver en route to your location' },
    { title: 'Delivered', icon: CheckCircle2, desc: 'Handed over at your doorstep' },
  ];

  const currentStatusIndex = stages.findIndex((s) => s.title === order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';
  const isEligibleForCancel =
    order.orderStatus === 'Order Placed' || order.orderStatus === 'Confirmed';

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top back & Order ID bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Order #{order.orderId}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isCancelled
                  ? 'bg-rose-100 text-rose-700'
                  : order.orderStatus === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-orange-100 text-orange-700 animate-pulse'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isEligibleForCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Order</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Grid: Stepper + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left: Progress Stepper */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Estimated Arrival</span>
              <h3 className="text-xl font-extrabold text-orange-600 flex items-center gap-2 mt-0.5">
                <Clock className="w-5 h-5" />
                {isCancelled
                  ? 'Order Cancelled'
                  : order.orderStatus === 'Delivered'
                  ? 'Order Delivered'
                  : order.estimatedDeliveryTime || '25-35 mins'}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold uppercase">Payment Status</span>
              <p
                className={`text-xs font-bold mt-0.5 ${
                  order.paymentInfo?.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {order.paymentInfo?.status} ({order.paymentInfo?.method})
              </p>
            </div>
          </div>

          {/* Stepper Steps */}
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <p className="font-bold text-sm mb-1">This order was cancelled</p>
              <p>
                Reason:{' '}
                {order.statusHistory?.find((s) => s.status === 'Cancelled')?.note ||
                  'Cancelled upon request.'}
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {stages.map((stage, idx) => {
                const Icon = stage.icon;
                const isPassed = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                return (
                  <div key={stage.title} className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all shadow-xs ${
                        isCurrent
                          ? 'bg-orange-600 ring-4 ring-orange-100 scale-110'
                          : isPassed
                          ? 'bg-emerald-600'
                          : 'bg-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <h4
                        className={`text-sm font-bold ${
                          isCurrent
                            ? 'text-orange-600'
                            : isPassed
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {stage.title}
                      </h4>
                      <p className="text-xs text-slate-500">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delivery Partner Contact Card */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">
                  {order.deliveryPartner?.name || 'Ravi Kumar'}
                </p>
                <p className="text-xs text-slate-500">Prime Delivery Captain • Hero Splendor</p>
              </div>
            </div>
            <a
              href={`tel:${order.deliveryPartner?.phone || '+919876501234'}`}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Call Driver</span>
            </a>
          </div>
        </div>

        {/* Right: Live Route Visualizer / Map Canvas */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-orange-600" />
              Live Route Tracker
            </h3>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              GPS Active
            </span>
          </div>

          {/* Interactive SVG Delivery Map Graphic */}
          <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center p-4">
            {/* Grid street layout styling */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:4rem_4rem]" />

            {/* Simulated route road path */}
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 200">
              <path
                d="M 50 150 Q 150 40 220 120 T 350 60"
                fill="none"
                stroke="#475569"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 50 150 Q 150 40 220 120 T 350 60"
                fill="none"
                stroke="#fc8019"
                strokeWidth="4"
                strokeDasharray="8 6"
                strokeLinecap="round"
                className="animate-pulse"
              />

              {/* Kitchen Pin */}
              <circle cx="50" cy="150" r="10" fill="#ea580c" />
              <text x="35" y="180" fill="#fed7aa" fontSize="10" fontWeight="bold">
                Kitchen
              </text>

              {/* Driver Live Location Moving Point */}
              <circle
                cx={currentStatusIndex >= 3 ? 220 : 50}
                cy={currentStatusIndex >= 3 ? 120 : 150}
                r="12"
                fill="#10b981"
                className="animate-ping"
              />
              <circle
                cx={currentStatusIndex >= 3 ? 220 : 50}
                cy={currentStatusIndex >= 3 ? 120 : 150}
                r="8"
                fill="#34d399"
              />

              {/* Customer Home Pin */}
              <circle cx="350" cy="60" r="10" fill="#3b82f6" />
              <text x="330" y="40" fill="#93c5fd" fontSize="10" fontWeight="bold">
                Your Home
              </text>
            </svg>

            {/* Floating Live Status Card */}
            <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span className="truncate">
                  {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                </span>
              </div>
              <span className="font-extrabold text-orange-400 flex-shrink-0">
                {currentStatusIndex >= 3 ? '2.4 km away' : 'At Restaurant'}
              </span>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-400 text-center font-medium">
            Location updates via authenticated Socket.IO and driver GPS synchronization.
          </div>
        </div>
      </div>

      {/* Order Items & Receipt Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="font-extrabold text-base text-slate-900 mb-4">Items in This Platter</h3>
        <div className="divide-y divide-slate-100">
          {order.items?.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                )}
                <div>
                  <h5 className="font-bold text-slate-900">{item.name}</h5>
                  <p className="text-slate-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-bold text-slate-800">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Total calculation */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="text-slate-500">
            <span>Special Request: </span>
            <span className="font-medium text-slate-800">
              {order.specialInstructions || 'None'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-500">Grand Total: </span>
            <span className="text-base font-extrabold text-orange-600">
              ₹{order.pricing?.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
