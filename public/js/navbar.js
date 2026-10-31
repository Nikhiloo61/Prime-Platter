/**
 * Prime Platter - Unified Navbar & Session Manager
 * Dynamically synchronizes user authentication state, navigation links, and cart badge.
 */

document.addEventListener("DOMContentLoaded", () => {
  initNavbarAuth();
  syncCartBadge();
});

function initNavbarAuth() {
  const loginBtn = document.getElementById("btn-login");
  const authContainer = document.getElementById("auth-nav-container");

  const targetContainer = authContainer || (loginBtn ? loginBtn.parentElement : null);
  if (!targetContainer) return;

  const isAuth = window.api && window.api.isAuthenticated();
  const user = window.api ? window.api.getUser() : null;

  if (isAuth && user) {
    const firstName = user.name.split(" ")[0];
    const isAdmin = user.role === "admin";

    const adminItem = isAdmin
      ? `<li><a class="dropdown-item fw-bold text-danger" href="admin.html"><i class="bi bi-speedometer2 me-2"></i>Admin Dashboard</a></li>`
      : "";

    const userDropdownHtml = `
      <div class="dropdown" id="user-nav-dropdown">
        <button class="btn btn-outline-danger rounded-pill dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle"></i>
          <span>${firstName}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2">
          <li class="px-3 py-2 border-bottom">
            <p class="mb-0 fw-bold text-dark">${user.name}</p>
            <p class="mb-0 text-muted small">${user.email}</p>
            ${isAdmin ? '<span class="badge bg-danger mt-1">Admin</span>' : ''}
          </li>
          <li><a class="dropdown-item py-2" href="profile.html"><i class="bi bi-person me-2 text-danger"></i>My Profile</a></li>
          <li><a class="dropdown-item py-2" href="my-orders.html"><i class="bi bi-bag-check me-2 text-danger"></i>My Orders</a></li>
          ${adminItem}
          <li><hr class="dropdown-divider my-1"></li>
          <li>
            <button class="dropdown-item py-2 text-muted" type="button" onclick="window.api.logout()">
              <i class="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </li>
        </ul>
      </div>
    `;

    if (loginBtn) {
      loginBtn.outerHTML = userDropdownHtml;
    } else {
      targetContainer.innerHTML = userDropdownHtml;
    }
  } else {
    // If not authenticated, ensure login button navigates to login.html
    if (loginBtn) {
      loginBtn.removeAttribute("data-bs-toggle");
      loginBtn.removeAttribute("data-bs-target");
      loginBtn.addEventListener("click", () => {
        window.location.href = "login.html";
      });
    }
  }
}

async function syncCartBadge() {
  if (!window.api) return;
  try {
    const cart = await window.api.getCart();
    const count = (cart.items || []).reduce((sum, item) => sum + item.quantity, 0);

    const badges = document.querySelectorAll(".cart-badge");
    badges.forEach((b) => {
      b.innerText = count;
      b.style.display = count > 0 ? "inline-block" : "none";
    });
  } catch (e) {
    // Silently continue if backend is connecting
  }
}
