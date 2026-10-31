// Prime Platter - Full-Stack Food Delivery Website Logic

// State
let restaurants = [];
let foods = [];
let currentRestaurantFilter = null;
let wishlist = JSON.parse(localStorage.getItem("food_delivery_wishlist")) || [];

// DOM Elements
const loadingSpinner = document.getElementById("loading-spinner");
const restaurantContainer = document.getElementById("restaurant-container");
const menuContainer = document.getElementById("menu-container");
const cartItemsContainer = document.getElementById("cart-items");
const cartBadgeCount = document.querySelectorAll(".cart-badge");
const cartTotalElement = document.getElementById("cart-total");
const cartCountElement = document.getElementById("cart-count");
const searchInput = document.getElementById("search-input");
const searchInputHero = document.getElementById("hero-search");
const modalTitle = document.getElementById("detailModalLabel");
const modalBody = document.getElementById("detailModalBody");
const modalFooter = document.getElementById("detailModalFooter");
const filterVeg = document.getElementById("filter-veg");
const filterNonVeg = document.getElementById("filter-nonveg");
const filterCuisines = document.querySelectorAll(".filter-cuisine");
const filterPrices = document.querySelectorAll(".filter-price");
const btnResetFilters = document.getElementById("reset-filters");
const contactForm = document.getElementById("contactForm");
const scrollTopBtn = document.getElementById("scrollTopBtn");

// Initialize application on DOM load
window.addEventListener("DOMContentLoaded", async () => {
  await loadInitialData();
  initCounters();
  setupWishlistDelegation();
});

// Fetch all initial data from REST APIs
async function loadInitialData() {
  try {
    // Show spinner if present
    if (loadingSpinner) {
      loadingSpinner.style.display = "flex";
      loadingSpinner.style.opacity = "1";
    }

    // Parallel fetch for restaurants, menu items, and active cart
    const [restaurantsData, menuData, cartData] = await Promise.all([
      api.getRestaurants().catch(err => {
        console.error("Failed to load restaurants:", err);
        return [];
      }),
      api.getMenuItems().catch(err => {
        console.error("Failed to load menu items:", err);
        return [];
      }),
      api.getCart().catch(err => {
        console.error("Failed to load cart:", err);
        return { items: [], totalAmount: 0 };
      })
    ]);

    restaurants = restaurantsData;
    foods = menuData;

    displayRestaurants(restaurants);
    displayMenu(foods);
    renderCartFromBackend(cartData);
  } catch (error) {
    console.error("Error loading initial data:", error);
    showToast("Failed to connect to backend server. Make sure MongoDB & backend are running.", "danger");
  } finally {
    if (loadingSpinner) {
      loadingSpinner.style.opacity = "0";
      setTimeout(() => {
        loadingSpinner.style.display = "none";
      }, 400);
    }
  }
}

// Wishlist click handler delegation
function setupWishlistDelegation() {
  if (menuContainer) {
    menuContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".wishlist-btn");
      if (btn) {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const index = wishlist.indexOf(id);
        const icon = btn.querySelector("i");
        if (index === -1) {
          wishlist.push(id);
          btn.classList.add("active");
          if (icon) icon.style.color = "#ff4757";
          showToast("Added to favorites!", "success");
        } else {
          wishlist.splice(index, 1);
          btn.classList.remove("active");
          if (icon) icon.style.color = "#ccc";
          showToast("Removed from favorites.", "info");
        }
        localStorage.setItem("food_delivery_wishlist", JSON.stringify(wishlist));
      }
    });
  }
}

// Display Restaurants in DOM
function displayRestaurants(data) {
  if (!restaurantContainer) return;
  restaurantContainer.innerHTML = "";

  if (!data || data.length === 0) {
    restaurantContainer.innerHTML = `
      <div class="col-12 text-center text-muted py-4">
        <i class="bi bi-shop fs-1 d-block mb-2 text-secondary"></i>
        No restaurants found.
      </div>`;
    return;
  }

  data.forEach(rest => {
    const id = rest._id || rest.id;
    const card = `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card custom-card h-100">
          <div class="card-img-wrapper">
            <img src="${rest.image}" alt="${rest.name}" loading="lazy">
            <span class="position-absolute bottom-0 start-0 m-3 badge bg-dark text-white">
              <i class="bi bi-clock"></i> ${rest.deliveryTime || "25-30 mins"}
            </span>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="card-title fw-bold mb-0">${rest.name}</h5>
              <span class="badge bg-warning text-dark"><i class="bi bi-star-fill"></i> ${rest.rating}</span>
            </div>
            <p class="card-text text-muted mb-3">${rest.cuisine} • Min. Order ₹${rest.minOrder || 150}</p>
            <a href="#menu" class="btn btn-outline-danger w-100 rounded-pill" onclick="filterMenuByRestaurant('${id}')">View Menu</a>
          </div>
        </div>
      </div>
    `;
    restaurantContainer.insertAdjacentHTML("beforeend", card);
  });
}

// Display Menu Items in DOM
function displayMenu(data) {
  if (!menuContainer) return;
  menuContainer.innerHTML = "";

  if (!data || data.length === 0) {
    menuContainer.innerHTML = `
      <div class="col-12 text-center text-muted py-5">
        <i class="bi bi-search fs-1 d-block mb-3 text-secondary"></i>
        No food items found matching current filters.
      </div>`;
    return;
  }

  data.forEach(item => {
    const id = item._id || item.id;
    // Extract restaurant name whether restaurantId is populated object or string ID
    const restName = item.restaurantId && typeof item.restaurantId === "object"
      ? item.restaurantId.name
      : restaurants.find(r => (r._id || r.id) === item.restaurantId)?.name || "Partner Kitchen";

    const typeBadge = item.type === "Veg"
      ? `<span class="badge badge-veg"><i class="bi bi-circle-fill"></i> Veg</span>`
      : `<span class="badge badge-nonveg"><i class="bi bi-triangle-fill"></i> Non-Veg</span>`;

    const isFav = wishlist.includes(String(id)) ? "active" : "";
    const favColor = wishlist.includes(String(id)) ? "color: #ff4757;" : "color: #ccc;";

    const card = `
      <div class="col-sm-6 col-lg-4 col-xl-3 mb-4 food-item-card">
        <div class="card custom-card h-100">
          <div class="card-img-wrapper">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <button class="wishlist-btn ${isFav}" data-id="${id}" aria-label="Add to favorites">
              <i class="bi bi-heart-fill" style="${favColor}"></i>
            </button>
            <span class="position-absolute bottom-0 start-0 m-3">${typeBadge}</span>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-bold mb-0 text-truncate" style="max-width: 70%;">${item.name}</h6>
              <span class="badge bg-success"><i class="bi bi-star-fill"></i> ${item.rating}</span>
            </div>
            <p class="small text-muted mb-2">${restName} • ${item.cuisine}</p>
            <p class="card-text text-truncate small mb-3">${item.description}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <span class="fw-bold fs-5 text-danger">₹${item.price}</span>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-secondary" onclick="viewDetails('${id}')">Details</button>
                <button class="btn btn-sm btn-danger" onclick="addToCart('${id}')">Add <i class="bi bi-plus-lg"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    menuContainer.insertAdjacentHTML("beforeend", card);
  });
}

// Dynamic Filter Handler (Queries Backend REST API)
let filterDebounceTimer = null;
async function applyFilters() {
  const isVegSelected = filterVeg ? filterVeg.checked : false;
  const isNonVegSelected = filterNonVeg ? filterNonVeg.checked : false;

  const filters = {};

  // 1. Diet Preference (Veg / Non-Veg)
  if (isVegSelected && !isNonVegSelected) {
    filters.type = "Veg";
  } else if (!isVegSelected && isNonVegSelected) {
    filters.type = "Non-Veg";
  }

  // 2. Cuisine Filter
  const selectedCuisines = Array.from(filterCuisines || [])
    .filter(c => c.checked)
    .map(c => c.value);
  if (selectedCuisines.length > 0) {
    filters.cuisine = selectedCuisines;
  }

  // 3. Price Filter
  const selectedPriceRanges = Array.from(filterPrices || [])
    .filter(p => p.checked)
    .map(p => p.value);

  if (selectedPriceRanges.length === 1) {
    const range = selectedPriceRanges[0];
    if (range === "under200") {
      filters.maxPrice = 200;
    } else if (range === "200-500") {
      filters.minPrice = 200;
      filters.maxPrice = 500;
    } else if (range === "above500") {
      filters.minPrice = 500;
    }
  }

  // 4. Restaurant Filter
  if (currentRestaurantFilter) {
    filters.restaurantId = currentRestaurantFilter;
  }

  // 5. Search Query
  const query = (searchInput?.value || "").trim();
  const heroQuery = (searchInputHero?.value || "").trim();
  const finalQuery = query || heroQuery;
  if (finalQuery) {
    filters.search = finalQuery;
  }

  // Display subtle loading state in menu grid
  if (menuContainer) {
    menuContainer.style.opacity = "0.5";
  }

  try {
    const filteredItems = await api.getMenuItems(filters);
    displayMenu(filteredItems);
  } catch (error) {
    console.error("Filter request failed:", error);
    showToast("Failed to load filtered menu items.", "danger");
  } finally {
    if (menuContainer) {
      menuContainer.style.opacity = "1";
    }
  }
}

// Hook Filter Listeners
if (filterVeg) filterVeg.addEventListener("change", applyFilters);
if (filterNonVeg) filterNonVeg.addEventListener("change", applyFilters);
if (filterCuisines) {
  filterCuisines.forEach(c => c.addEventListener("change", applyFilters));
}
if (filterPrices) {
  filterPrices.forEach(p => p.addEventListener("change", applyFilters));
}

// Real-time search with debounce
function onSearchInput(val) {
  clearTimeout(filterDebounceTimer);
  filterDebounceTimer = setTimeout(() => {
    applyFilters();
  }, 300);
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    if (searchInputHero) searchInputHero.value = e.target.value;
    onSearchInput(e.target.value);
  });
}

if (searchInputHero) {
  searchInputHero.addEventListener("input", (e) => {
    if (searchInput) searchInput.value = e.target.value;
    onSearchInput(e.target.value);
  });
}

// Reset Filters Button
if (btnResetFilters) {
  btnResetFilters.addEventListener("click", async () => {
    if (filterVeg) filterVeg.checked = false;
    if (filterNonVeg) filterNonVeg.checked = false;
    if (filterCuisines) filterCuisines.forEach(c => c.checked = false);
    if (filterPrices) filterPrices.forEach(p => p.checked = false);
    if (searchInput) searchInput.value = "";
    if (searchInputHero) searchInputHero.value = "";
    currentRestaurantFilter = null;

    try {
      const allItems = await api.getMenuItems();
      displayMenu(allItems);
    } catch (err) {
      console.error(err);
    }
  });
}

// View Menu of a specific restaurant
async function filterMenuByRestaurant(restId) {
  currentRestaurantFilter = restId;
  const restaurant = restaurants.find(r => (r._id || r.id) === restId);

  if (filterVeg) filterVeg.checked = false;
  if (filterNonVeg) filterNonVeg.checked = false;
  if (filterCuisines) filterCuisines.forEach(c => c.checked = false);
  if (filterPrices) filterPrices.forEach(p => p.checked = false);
  if (searchInput) searchInput.value = "";
  if (searchInputHero) searchInputHero.value = "";

  showToast(`Showing menu for ${restaurant?.name || "selected restaurant"}`, "info");
  await applyFilters();

  const menuSection = document.getElementById("menu");
  if (menuSection) {
    menuSection.scrollIntoView({ behavior: "smooth" });
  }
}

// View Details Modal
async function viewDetails(id) {
  try {
    let item = foods.find(f => (f._id || f.id) === id);
    if (!item) {
      item = await api.getMenuItemById(id);
    }
    if (!item) return;

    const restName = item.restaurantId && typeof item.restaurantId === "object"
      ? item.restaurantId.name
      : restaurants.find(r => (r._id || r.id) === item.restaurantId)?.name || "Partner Kitchen";

    const deliveryTime = item.restaurantId && typeof item.restaurantId === "object"
      ? item.restaurantId.deliveryTime
      : "25-30 mins";

    modalTitle.innerText = item.name;
    modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-6 mb-3 mb-md-0">
          <img src="${item.image}" class="img-fluid rounded-3 w-100" style="object-fit: cover; max-height: 280px;" alt="${item.name}">
        </div>
        <div class="col-md-6">
          <span class="badge ${item.type === 'Veg' ? 'badge-veg' : 'badge-nonveg'} mb-2">${item.type}</span>
          <span class="badge bg-info mb-2">${item.cuisine}</span>
          <h4 class="fw-bold mt-2">₹${item.price}</h4>
          <div class="text-warning mb-2">
            <i class="bi bi-star-fill"></i> ${item.rating} / 5.0
          </div>
          <p class="text-muted">${item.description || "Freshly cooked to order with authentic ingredients."}</p>
          <p class="small text-secondary mb-0">
            Prepared by: <strong>${restName}</strong><br>
            Estimated delivery: ${deliveryTime}
          </p>
        </div>
      </div>
    `;
    modalFooter.innerHTML = `
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-danger" onclick="addToCart('${id}'); bootstrap.Modal.getInstance(document.getElementById('detailModal')).hide();">
        Add to Cart
      </button>
    `;

    const detailModal = new bootstrap.Modal(document.getElementById("detailModal"));
    detailModal.show();
  } catch (error) {
    console.error("Failed to show details:", error);
    showToast("Could not load item details.", "danger");
  }
}

// ==========================================
// SHOPPING CART INTEGRATION
// ==========================================

// Add item to backend cart
async function addToCart(id) {
  try {
    const res = await api.addToCart(id, 1);
    renderCartFromBackend(res);
    showToast(res.message || "Added to cart!", "success");
  } catch (error) {
    console.error("Failed to add to cart:", error);
    showToast("Failed to add item to cart.", "danger");
  }
}

// Update quantity of an item in backend cart
async function changeQuantity(menuItemId, currentQuantity, delta) {
  const newQty = currentQuantity + delta;
  try {
    if (newQty <= 0) {
      await removeFromCart(menuItemId);
    } else {
      const res = await api.updateCartItem(menuItemId, newQty);
      renderCartFromBackend(res);
    }
  } catch (error) {
    console.error("Failed to update quantity:", error);
    showToast("Could not update item quantity.", "danger");
  }
}

// Remove item from backend cart
async function removeFromCart(menuItemId) {
  try {
    const res = await api.removeFromCart(menuItemId);
    renderCartFromBackend(res);
    showToast("Item removed from cart.", "warning");
  } catch (error) {
    console.error("Failed to remove item from cart:", error);
    showToast("Could not remove item.", "danger");
  }
}

// Clear all items in backend cart
async function emptyCart() {
  try {
    const res = await api.clearCart();
    renderCartFromBackend(res);
    showToast("Cart cleared.", "info");
  } catch (error) {
    console.error("Failed to clear cart:", error);
    showToast("Could not clear cart.", "danger");
  }
}

// Proceed to checkout page
function proceedToCheckout() {
  const badge = document.querySelector(".cart-badge");
  const count = parseInt(badge?.innerText || "0", 10);
  if (count <= 0) {
    showToast("Your cart is empty! Add food items to proceed.", "warning");
    return;
  }
  window.location.href = "checkout.html";
}

// Modal login handler
const modalLoginForm = document.getElementById("modal-login-form");
if (modalLoginForm) {
  modalLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const alertEl = document.getElementById("modal-login-alert");
    const submitBtn = document.getElementById("modal-login-submit");
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-pass").value;

    if (alertEl) alertEl.classList.add("d-none");

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing In...';
      }
      await api.login({ email, password });
      showToast("Signed in successfully!", "success");
      const modalEl = document.getElementById("loginModal");
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
      window.location.reload();
    } catch (err) {
      if (alertEl) {
        alertEl.textContent = err.message || "Invalid credentials";
        alertEl.classList.remove("d-none");
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Sign In";
      }
    }
  });
}

// Render cart UI directly from backend-calculated Cart data
function renderCartFromBackend(cartData) {
  const items = cartData?.items || [];
  const totalAmount = cartData?.totalAmount || 0;
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

  // Update header badges
  cartBadgeCount.forEach(badge => {
    badge.innerText = totalQty;
    badge.style.display = totalQty > 0 ? "inline-block" : "none";
  });

  if (cartCountElement) cartCountElement.innerText = totalQty;
  if (cartTotalElement) cartTotalElement.innerText = totalAmount;

  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = "";

    if (items.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-cart-x fs-1 d-block mb-3 text-secondary"></i>
          Your cart is empty
        </div>
      `;
      return;
    }

    items.forEach(item => {
      const itemRow = `
        <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
          <div class="d-flex align-items-center">
            <img src="${item.image}" class="cart-item-img me-3" alt="${item.name}">
            <div>
              <h6 class="mb-0 fw-bold">${item.name}</h6>
              <span class="text-muted small">₹${item.price} each</span>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <div class="btn-group btn-group-sm me-3">
              <button class="btn btn-outline-secondary" onclick="changeQuantity('${item.menuItemId}', ${item.quantity}, -1)">-</button>
              <span class="btn btn-light px-3 disabled text-dark fw-bold">${item.quantity}</span>
              <button class="btn btn-outline-secondary" onclick="changeQuantity('${item.menuItemId}', ${item.quantity}, 1)">+</button>
            </div>
            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.menuItemId}')" aria-label="Delete item">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
      cartItemsContainer.insertAdjacentHTML("beforeend", itemRow);
    });
  }
}

// Toast Notifications Helper
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;

  const bgClass = type === "success" ? "bg-success"
    : type === "warning" ? "bg-warning text-dark"
    : type === "info" ? "bg-info text-dark"
    : "bg-danger";

  const icon = type === "success" ? "bi-check-circle-fill"
    : type === "warning" ? "bi-exclamation-triangle-fill"
    : type === "info" ? "bi-info-circle-fill"
    : "bi-x-circle-fill";

  const toastId = `toast-${Date.now()}`;
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${icon} me-2"></i> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML("beforeend", toastHTML);
  const toastEl = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
  bsToast.show();

  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove();
  });
}

// Contact Form Validation
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    contactForm.classList.add("was-validated");

    if (contactForm.checkValidity()) {
      showToast("Thank you for contacting us! Your message has been sent successfully.", "success");
      contactForm.reset();
      contactForm.classList.remove("was-validated");
    } else {
      showToast("Please correct the errors in the form.", "danger");
    }
  });
}

// Scroll to Top Button
window.addEventListener("scroll", () => {
  if (scrollTopBtn) {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }
  }
});

if (scrollTopBtn) {
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// Counter Animations
function initCounters() {
  const counters = document.querySelectorAll(".counter");
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute("data-target"), 10);
    const speed = 100;
    const updateCount = () => {
      const current = parseInt(counter.innerText, 10) || 0;
      const inc = Math.ceil(target / speed);
      if (current < target) {
        counter.innerText = current + inc;
        setTimeout(updateCount, 20);
      } else {
        counter.innerText = target;
      }
    };
    updateCount();
  });
}
