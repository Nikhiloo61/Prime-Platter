import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';
import { MyOrders } from './pages/MyOrders';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { DeliveryDashboard } from './pages/DeliveryDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
              <Navbar onOpenAiAssistant={() => setIsAiModalOpen(true)} />

              <div className="flex-1">
                <Routes>
                  <Route
                    path="/"
                    element={<Home onOpenAiAssistant={() => setIsAiModalOpen(true)} />}
                  />
                  <Route path="/restaurant/:id" element={<RestaurantDetail />} />

                  {/* Customer Protected Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-tracking/:id"
                    element={
                      <ProtectedRoute>
                        <OrderTracking />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute>
                        <MyOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Public Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Role Specific Dashboards */}
                  <Route
                    path="/restaurant-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['restaurant_owner', 'admin']}>
                        <RestaurantDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/delivery-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['delivery_partner', 'admin']}>
                        <DeliveryDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>

              <Footer />
              <CartDrawer />
              <AiAssistantModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
              />
            </div>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
