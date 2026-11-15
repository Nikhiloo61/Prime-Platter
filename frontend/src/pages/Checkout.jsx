import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Plus,
  ArrowRight,
  AlertCircle,
  Truck,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const Checkout = () => {
  const { user, addAddress } = useAuth();
  const {
    items,
    subtotal,
    deliveryFee,
    tax,
    coupon,
    discountAmount,
    finalPayable,
    clearCart,
  } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Delivery Address State
  const defaultAddressIndex =
    user?.addresses?.findIndex((a) => a.isDefault) !== -1
      ? user?.addresses?.findIndex((a) => a.isDefault)
      : 0;

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(defaultAddressIndex || 0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(
    !user?.addresses || user.addresses.length === 0
  );

  const [newAddress, setNewAddress] = useState({
    street: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    isDefault: true,
  });

  // Payment method State
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'Online'
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Truck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mb-6">
          Add some delicious food from your favorite restaurants before heading to checkout!
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          Explore Restaurants
        </Link>
      </div>
    );
  }

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.pincode) {
      error('Please provide complete street address and pincode');
      return;
    }
    try {
      await addAddress(newAddress);
      setShowNewAddressForm(false);
      setSelectedAddressIndex(user?.addresses ? user.addresses.length : 0);
      success('Delivery address saved!');
    } catch (err) {
      error(err.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    // Determine active delivery address
    let activeAddress = null;
    if (user?.addresses && user.addresses[selectedAddressIndex]) {
      activeAddress = user.addresses[selectedAddressIndex];
    } else if (newAddress.street) {
      activeAddress = newAddress;
    }

    if (!activeAddress || !activeAddress.street) {
      error('Please select or enter a valid delivery address');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create order on backend with server-side pricing recalculation
      const orderPayload = {
        customer: {
          name: user?.name || 'Valued Customer',
          email: user?.email || 'customer@primeplatter.com',
          phone: user?.phone || '+91 9876543210',
        },
        deliveryAddress: {
          street: activeAddress.street,
          city: activeAddress.city,
          state: activeAddress.state,
          pincode: activeAddress.pincode,
        },
        specialInstructions,
        paymentMethod,
      };

      const { data: orderData } = await api.post('/orders', orderPayload);

      if (!orderData.success || !orderData.order) {
        throw new Error(orderData.message || 'Failed to initialize order');
      }

      const createdOrder = orderData.order;

      // 2. If Payment is Online via Razorpay:
      if (paymentMethod === 'Online') {
        const { data: rzpOrderRes } = await api.post('/payment/create-order', {
          orderId: createdOrder.orderId,
        });

        if (rzpOrderRes.configured && window.Razorpay) {
          // Open Razorpay Checkout modal
          const options = {
            key: rzpOrderRes.keyId,
            amount: rzpOrderRes.amount,
            currency: rzpOrderRes.currency,
            name: 'Prime Platter',
            description: `Payment for Order ${createdOrder.orderId}`,
            order_id: rzpOrderRes.razorpayOrderId,
            handler: async (response) => {
              try {
                const { data: verifyRes } = await api.post('/payment/verify', {
                  orderId: createdOrder.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });

                if (verifyRes.success) {
                  clearCart();
                  success('Payment verified successfully!');
                  navigate(`/order-tracking/${createdOrder.orderId}`);
                } else {
                  error('Payment verification failed');
                }
              } catch (verErr) {
                error(verErr.message || 'Payment verification failed');
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone,
            },
            theme: {
              color: '#fc8019',
            },
          };

          const rzpInstance = new window.Razorpay(options);
          rzpInstance.open();
          return;
        } else {
          // In test development when Razorpay keys are not yet configured
          success('Order confirmed with Test Online Payment simulation!');
          clearCart();
          navigate(`/order-tracking/${createdOrder.orderId}`);
          return;
        }
      }

      // 3. For COD (Cash on Delivery)
      clearCart();
      success('Order placed successfully with Cash on Delivery!');
      navigate(`/order-tracking/${createdOrder.orderId}`);
    } catch (err) {
      error(err.message || 'Failed to place order. Please check item availability.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Checkout Platter</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Delivery Address & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Delivery Address
              </h3>
              {!showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Existing Saved Addresses */}
            {!showNewAddressForm && user?.addresses && user.addresses.length > 0 && (
              <div className="space-y-3">
                {user.addresses.map((addr, idx) => (
                  <label
                    key={addr._id || idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                      selectedAddressIndex === idx
                        ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                        selectedAddressIndex === idx ? 'border-orange-600' : 'border-slate-300'
                      }`}
                    >
                      {selectedAddressIndex === idx && (
                        <div className="w-2 h-2 rounded-full bg-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{addr.street}</p>
                      <p className="text-xs text-slate-500">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Add New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleSaveNewAddress} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address / Flat / Building
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    placeholder="e.g. Flat 402, Royal Palms, Connaught Place"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    Save Address
                  </button>
                  {user?.addresses && user.addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              Payment Method
            </h3>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-slate-500">Pay cash or UPI upon delivery arrival</p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'COD' ? 'border-orange-600' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-orange-600" />}
                </div>
              </label>

              {/* Online Payment via Razorpay */}
              <label
                onClick={() => setPaymentMethod('Online')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'Online'
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Razorpay Online Payment (UPI / Cards / NetBanking)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Instant & 100% secure encrypted payment
                    </p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'Online' ? 'border-orange-600' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'Online' && (
                    <div className="w-2 h-2 rounded-full bg-orange-600" />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Instructions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <label className="block font-bold text-xs text-slate-700 mb-2">
              Delivery Notes / Landmark
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Ring doorbell, leave at front desk, call on arrival..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              maxLength={150}
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Button */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl sticky top-28 space-y-6">
            <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.menuItemId} className="flex justify-between items-center text-xs">
                  <div className="flex-1 pr-3">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-slate-500 block">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Bill breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-800">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & GST (5%)</span>
                <span className="font-bold text-slate-800">₹{tax}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon ({coupon.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-xl text-orange-600">₹{finalPayable}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-xl shadow-orange-600/30 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order • ₹{finalPayable}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
