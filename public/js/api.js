/**
 * Prime Platter - Frontend REST API Service
 * Encapsulates all backend communication for Restaurants, Menu, and Cart operations.
 */

const API_BASE_URL = "/api";

const api = {
  /**
   * Helper method for performing fetch requests with unified JSON parsing and error handling
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

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
  // RESTAURANTS APIs
  // ==========================================

  /**
   * Fetch all restaurants
   * GET /api/restaurants
   */
  async getRestaurants() {
    const res = await this.request("/restaurants");
    return res.data || [];
  },

  /**
   * Fetch a single restaurant by ID
   * GET /api/restaurants/:id
   */
  async getRestaurantById(id) {
    const res = await this.request(`/restaurants/${id}`);
    return res.data;
  },

  // ==========================================
  // MENU ITEMS & FILTERING APIs
  // ==========================================

  /**
   * Fetch menu items with optional server-side query filters
   * GET /api/menu?type=Veg&cuisine=Indian&minPrice=100&maxPrice=500&search=pizza
   * @param {Object} filters - { type, cuisine, minPrice, maxPrice, restaurantId, search }
   */
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

  /**
   * Fetch a single menu item by ID
   * GET /api/menu/:id
   */
  async getMenuItemById(id) {
    const res = await this.request(`/menu/${id}`);
    return res.data;
  },

  // ==========================================
  // CART APIs
  // ==========================================

  /**
   * Get active cart
   * GET /api/cart
   */
  async getCart() {
    return await this.request("/cart");
  },

  /**
   * Add item to cart
   * POST /api/cart
   * @param {string} menuItemId
   * @param {number} quantity
   */
  async addToCart(menuItemId, quantity = 1) {
    return await this.request("/cart", {
      method: "POST",
      body: JSON.stringify({ menuItemId, quantity })
    });
  },

  /**
   * Update quantity of an existing cart item
   * PUT /api/cart/:menuItemId
   * @param {string} menuItemId
   * @param {number} quantity
   */
  async updateCartItem(menuItemId, quantity) {
    return await this.request(`/cart/${menuItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity })
    });
  },

  /**
   * Remove single item from cart
   * DELETE /api/cart/:menuItemId
   * @param {string} menuItemId
   */
  async removeFromCart(menuItemId) {
    return await this.request(`/cart/${menuItemId}`, {
      method: "DELETE"
    });
  },

  /**
   * Clear all items from cart
   * DELETE /api/cart
   */
  async clearCart() {
    return await this.request("/cart", {
      method: "DELETE"
    });
  }
};

// Expose globally for browser usage
window.api = api;
