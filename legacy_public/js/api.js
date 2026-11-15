/**
 * Prime Platter - Frontend REST API Service
 * Encapsulates all backend communication for Restaurants, Menu, Cart, Auth, Orders, Payments, and Admin.
 */

const API_BASE_URL = "/api";

const api = {
  // ==========================================
  // AUTH & SESSION STATE HELPERS
  // ==========================================

  getToken() {
    return localStorage.getItem("prime_platter_token");
  },

  setToken(token) {
    if (token) {
      localStorage.setItem("prime_platter_token", token);
    } else {
      localStorage.removeItem("prime_platter_token");
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem("prime_platter_user");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem("prime_platter_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("prime_platter_user");
    }
  },

  isAuthenticated() {
    return Boolean(this.getToken() && this.getUser());
  },

  isAdmin() {
    const user = this.getUser();
    return Boolean(user && user.role === "admin");
  },

  logout() {
    localStorage.removeItem("prime_platter_token");
    localStorage.removeItem("prime_platter_user");
    window.location.href = "/login.html";
  },

  getGuestCartId() {
    let guestId = localStorage.getItem("prime_platter_guest_cart_id");
    if (!guestId) {
      guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("prime_platter_guest_cart_id", guestId);
    }
    return guestId;
  },

  /**
   * Helper method for performing fetch requests with unified JSON parsing and error handling
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    // Attach JWT Bearer token if logged in
    const token = this.getToken();
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    // Attach guest cart session ID for persistent cart operations
    defaultHeaders["x-cart-id"] = this.getGuestCartId();

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || `API Error: ${response.statusText} (${response.status})`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.error(`[API Request Failed] ${options.method || "GET"} ${url}:`, error);
      throw error;
    }
  },

  // ==========================================
  // AUTHENTICATION & USER APIs
  // ==========================================

  async register(userData) {
    const res = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData)
    });
    if (res.token && res.user) {
      this.setToken(res.token);
      this.setUser(res.user);
    }
    return res;
  },

  async login(credentials) {
    const res = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
    if (res.token && res.user) {
      this.setToken(res.token);
      this.setUser(res.user);
    }
    return res;
  },

  async getProfile() {
    const res = await this.request("/auth/me");
    if (res.user) {
      this.setUser(res.user);
    }
    return res.user;
  },

  async updateProfile(profileData) {
    const res = await this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData)
    });
    if (res.user) {
      this.setUser(res.user);
    }
    return res;
  },

  async changePassword(passwords) {
    return await this.request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(passwords)
    });
  },

  async addAddress(addressData) {
    return await this.request("/auth/address", {
      method: "POST",
      body: JSON.stringify(addressData)
    });
  },

  async deleteAddress(addressId) {
    return await this.request(`/auth/address/${addressId}`, {
      method: "DELETE"
    });
  },

  async setDefaultAddress(addressId) {
    return await this.request(`/auth/address/${addressId}/default`, {
      method: "PUT"
    });
  },

  // ==========================================
  // RESTAURANTS APIs
  // ==========================================

  async getRestaurants() {
    const res = await this.request("/restaurants");
    return res.data || [];
  },

  async getRestaurantById(id) {
    const res = await this.request(`/restaurants/${id}`);
    return res.data;
  },

  // ==========================================
  // MENU ITEMS & FILTERING APIs
  // ==========================================

  async getMenuItems(filters = {}) {
    const params = new URLSearchParams();

    if (filters.type) {
      params.append("type", filters.type);
    }

    if (filters.cuisine) {
      if (Array.isArray(filters.cuisine)) {
        if (filters.cuisine.length > 0) {
          params.append("cuisine", filters.cuisine.join(","));
        }
      } else if (filters.cuisine.trim() !== "") {
        params.append("cuisine", filters.cuisine.trim());
      }
    }

    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== "") {
      params.append("minPrice", filters.minPrice);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== "") {
      params.append("maxPrice", filters.maxPrice);
    }

    if (filters.restaurantId) {
      params.append("restaurantId", filters.restaurantId);
    }

    if (filters.search && filters.search.trim() !== "") {
      params.append("search", filters.search.trim());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/menu?${queryString}` : "/menu";
    const res = await this.request(endpoint);
    return res.data || [];
  },

  async getMenuItemById(id) {
    const res = await this.request(`/menu/${id}`);
    return res.data;
  },

  // ==========================================
  // CART APIs
  // ==========================================

  async getCart() {
    return await this.request("/cart");
  },

  async addToCart(menuItemId, quantity = 1) {
    return await this.request("/cart", {
      method: "POST",
      body: JSON.stringify({ menuItemId, quantity })
    });
  },

  async updateCartItem(menuItemId, quantity) {
    return await this.request(`/cart/${menuItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity })
    });
  },

  async removeFromCart(menuItemId) {
    return await this.request(`/cart/${menuItemId}`, {
      method: "DELETE"
    });
  },

  async clearCart() {
    return await this.request("/cart", {
      method: "DELETE"
    });
  },

  // ==========================================
  // ORDER APIs
  // ==========================================

  async createOrder(orderPayload) {
    return await this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderPayload)
    });
  },

  async getOrderById(orderId) {
    return await this.request(`/orders/${orderId}`);
  },

  async getMyOrders() {
    return await this.request("/orders/my-orders");
  },

  async cancelOrder(orderId, reason = "") {
    return await this.request(`/orders/${orderId}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ reason })
    });
  },

  async reorder(orderId) {
    return await this.request(`/orders/${orderId}/reorder`, {
      method: "POST"
    });
  },

  // ==========================================
  // PAYMENT APIs
  // ==========================================

  async getPaymentConfig() {
    return await this.request("/payment/config");
  },

  async createRazorpayOrder(orderId) {
    return await this.request("/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ orderId })
    });
  },

  async verifyPayment(verificationData) {
    return await this.request("/payment/verify", {
      method: "POST",
      body: JSON.stringify(verificationData)
    });
  },

  // ==========================================
  // ADMIN APIs
  // ==========================================

  async getAdminStats() {
    return await this.request("/admin/stats");
  },

  async getAllOrdersAdmin(params = {}) {
    const q = new URLSearchParams(params).toString();
    const endpoint = q ? `/orders/admin/all?${q}` : "/orders/admin/all";
    return await this.request(endpoint);
  },

  async updateOrderStatusAdmin(orderId, statusData) {
    return await this.request(`/orders/admin/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData)
    });
  },

  async toggleMenuItemAvailability(menuItemId) {
    return await this.request(`/admin/menu/${menuItemId}/toggle`, {
      method: "PUT"
    });
  },

  async createMenuItem(data) {
    return await this.request("/menu", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async updateMenuItem(id, data) {
    return await this.request(`/menu/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  async deleteMenuItem(id) {
    return await this.request(`/menu/${id}`, {
      method: "DELETE"
    });
  },

  async createRestaurant(data) {
    return await this.request("/restaurants", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async updateRestaurant(id, data) {
    return await this.request(`/restaurants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  async deleteRestaurant(id) {
    return await this.request(`/restaurants/${id}`, {
      method: "DELETE"
    });
  }
};

// Expose globally for browser usage
window.api = api;
