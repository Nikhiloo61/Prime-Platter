const request = require("supertest");
const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");
const dotenv = require("dotenv");

// Load test environment variables
dotenv.config({
  path: path.join(__dirname, "../.env")
});

process.env.MONGO_URI = process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/prime_platter_test_db";
process.env.JWT_SECRET = "test_jwt_secret_key_1234567890";
process.env.RAZORPAY_KEY_ID = "rzp_test_sampleKey123";
process.env.RAZORPAY_KEY_SECRET = "sampleKeySecret456";

const app = require("../../index");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const Review = require("../models/Review");

describe("Prime Platter Full-Stack Food Delivery API Test Suite", () => {
  let customerToken = "";
  let customerUser = null;
  let otherCustomerToken = "";
  let otherCustomerUser = null;
  let adminToken = "";
  let adminUser = null;
  let restaurantOwnerToken = "";
  let deliveryPartnerToken = "";
  let sampleRestaurant = null;
  let sampleMenuItem = null;
  let sampleOrder = null;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // Clean test database collections
    await Promise.all([
      User.deleteMany({ email: /@test\.com$/ }),
      Restaurant.deleteMany({ name: /Test/ }),
      MenuItem.deleteMany({ name: /Test/ }),
      Cart.deleteMany({}),
      Order.deleteMany({ "customer.email": /@test\.com$/ }),
      Coupon.deleteMany({ code: /TEST/ }),
      Review.deleteMany({})
    ]);

    // Create Admin user
    adminUser = await User.create({
      name: "Test Admin",
      email: "admin@test.com",
      phone: "+91 99999 00000",
      password: "Admin@123",
      role: "admin"
    });

    // Create Restaurant Owner user
    const ownerUser = await User.create({
      name: "Test Chef",
      email: "owner@test.com",
      phone: "+91 99999 11111",
      password: "Owner@123",
      role: "restaurant_owner"
    });

    // Create Delivery Partner user
    const riderUser = await User.create({
      name: "Test Rider",
      email: "rider@test.com",
      phone: "+91 99999 22222",
      password: "Rider@123",
      role: "delivery_partner"
    });

    // Login Admin
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "Admin@123" });
    adminToken = adminLogin.body.token;

    // Login Owner
    const ownerLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "owner@test.com", password: "Owner@123" });
    restaurantOwnerToken = ownerLogin.body.token;

    // Login Rider
    const riderLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "rider@test.com", password: "Rider@123" });
    deliveryPartnerToken = riderLogin.body.token;

    // Create a Sample Restaurant
    sampleRestaurant = await Restaurant.create({
      name: "Test Palace",
      cuisine: "Indian",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      location: "Connaught Place",
      deliveryTime: "30 mins",
      minOrder: 150,
      isOpen: true,
      ownerId: ownerUser._id
    });

    // Create a Sample Menu Item
    sampleMenuItem = await MenuItem.create({
      name: "Test Paneer Tikka",
      price: 250,
      cuisine: "Indian",
      category: "Starters",
      type: "Veg",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      restaurantId: sampleRestaurant._id,
      available: true
    });
  });

  afterAll(async () => {
    // Cleanup created test records
    await Promise.all([
      User.deleteMany({ email: /@test\.com$/ }),
      Restaurant.deleteMany({ name: /Test/ }),
      MenuItem.deleteMany({ name: /Test/ }),
      Order.deleteMany({ "customer.email": /@test\.com$/ })
    ]);
    await mongoose.connection.close();
  });

  // ==========================================
  // SCENARIO 1: User Registration
  // ==========================================
  test("1. User registration - POST /api/auth/register", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Customer One",
        email: "customer1@test.com",
        phone: "+91 99999 33333",
        password: "Password@123",
        confirmPassword: "Password@123",
        role: "customer"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("customer1@test.com");
    customerToken = res.body.token;
    customerUser = res.body.user;

    // Register second customer for cross-user permission testing
    const res2 = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Customer Two",
        email: "customer2@test.com",
        phone: "+91 99999 44444",
        password: "Password@123",
        confirmPassword: "Password@123",
        role: "customer"
      });
    otherCustomerToken = res2.body.token;
    otherCustomerUser = res2.body.user;
  });

  // ==========================================
  // SCENARIO 2: User Login
  // ==========================================
  test("2. User login - POST /api/auth/login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "customer1@test.com",
        password: "Password@123"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("customer1@test.com");
  });

  // ==========================================
  // SCENARIO 3: Invalid Login
  // ==========================================
  test("3. Invalid login - POST /api/auth/login with wrong credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "customer1@test.com",
        password: "WrongPassword999!"
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ==========================================
  // SCENARIO 4: User Profile
  // ==========================================
  test("4. User profile - GET /api/auth/me", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe("Test Customer One");
  });

  // ==========================================
  // SCENARIO 5: Restaurant Listing
  // ==========================================
  test("5. Restaurant listing - GET /api/restaurants", async () => {
    const res = await request(app).get("/api/restaurants");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ==========================================
  // SCENARIO 6: Restaurant Details
  // ==========================================
  test("6. Restaurant details - GET /api/restaurants/:id", async () => {
    const res = await request(app).get(`/api/restaurants/${sampleRestaurant._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Test Palace");
  });

  // ==========================================
  // SCENARIO 7: Food Menu Listing
  // ==========================================
  test("7. Food menu listing - GET /api/menu", async () => {
    const res = await request(app).get("/api/menu");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ==========================================
  // SCENARIO 8: Food Item Creation & Modification
  // ==========================================
  test("8. Food item creation & modification - POST /api/menu and PUT /api/menu/:id", async () => {
    // Create new menu item by Restaurant Owner
    const createRes = await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${restaurantOwnerToken}`)
      .send({
        name: "Test Butter Naan",
        price: 50,
        cuisine: "Indian",
        category: "Breads",
        type: "Veg",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        restaurantId: sampleRestaurant._id
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe("Test Butter Naan");
    const createdId = createRes.body.data._id;

    // Modify the created item
    const updateRes = await request(app)
      .put(`/api/menu/${createdId}`)
      .set("Authorization", `Bearer ${restaurantOwnerToken}`)
      .send({ price: 60 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.price).toBe(60);
  });

  // ==========================================
  // SCENARIO 9: Search and Filtering
  // ==========================================
  test("9. Search and filtering - GET /api/menu with queries", async () => {
    const res = await request(app)
      .get("/api/menu")
      .query({ type: "Veg", cuisine: "Indian", maxPrice: 300 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((item) => {
      expect(item.type).toBe("Veg");
      expect(item.price).toBeLessThanOrEqual(300);
    });
  });

  // ==========================================
  // SCENARIO 10: Add to Cart
  // ==========================================
  test("10. Add to cart - POST /api/cart", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        menuItemId: sampleMenuItem._id,
        quantity: 2
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.subtotal).toBe(500); // 250 * 2
  });

  // ==========================================
  // SCENARIO 11: Update Cart Quantity
  // ==========================================
  test("11. Update cart quantity - PUT /api/cart/:menuItemId", async () => {
    const res = await request(app)
      .put(`/api/cart/${sampleMenuItem._id}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.subtotal).toBe(750); // 250 * 3
  });

  // ==========================================
  // SCENARIO 12: Remove from Cart
  // ==========================================
  test("12. Remove from cart - DELETE /api/cart/:menuItemId", async () => {
    // Add temporary item to remove
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ menuItemId: sampleMenuItem._id, quantity: 1 });

    const res = await request(app)
      .delete(`/api/cart/${sampleMenuItem._id}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Re-add sampleMenuItem for checkout test
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ menuItemId: sampleMenuItem._id, quantity: 2 });
  });

  // ==========================================
  // SCENARIO 13 & 18: Checkout & Order Placement
  // ==========================================
  test("13 & 18. Checkout and Order Placement - POST /api/orders", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        customer: {
          name: "Test Customer One",
          email: "customer1@test.com",
          phone: "+91 99999 33333"
        },
        deliveryAddress: {
          street: "123 Royal Gardens",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110001"
        },
        paymentMethod: "COD"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.order.orderId).toBeDefined();
    expect(res.body.order.orderStatus).toBe("Order Placed");
    sampleOrder = res.body.order;
  });

  // ==========================================
  // SCENARIO 14: Payment Order Creation
  // ==========================================
  test("14. Payment order creation - POST /api/payment/create-order", async () => {
    const res = await request(app)
      .post("/api/payment/create-order")
      .send({ orderId: sampleOrder.orderId });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("configured");
  });

  // ==========================================
  // SCENARIO 15: Payment Verification
  // ==========================================
  test("15. Payment verification - POST /api/payment/verify with timing-safe HMAC", async () => {
    const razorpayOrderId = "order_test_987654";
    const razorpayPaymentId = "pay_test_123456";

    // Generate valid HMAC signature using test secret
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const validSignature = hmac.digest("hex");

    const res = await request(app)
      .post("/api/payment/verify")
      .send({
        orderId: sampleOrder.orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: validSignature
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order.paymentInfo.status).toBe("Paid");
  });

  // ==========================================
  // SCENARIO 16: Invalid Payment Signature
  // ==========================================
  test("16. Invalid payment signature - POST /api/payment/verify", async () => {
    const res = await request(app)
      .post("/api/payment/verify")
      .send({
        orderId: sampleOrder.orderId,
        razorpayOrderId: "order_fake",
        razorpayPaymentId: "pay_fake",
        razorpaySignature: "invalid_tampered_signature"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ==========================================
  // SCENARIO 17: Webhook Verification & Idempotency
  // ==========================================
  test("17. Webhook verification - POST /api/payment/webhook", async () => {
    const webhookPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_webhook_test_001",
            order_id: "order_test_987654",
            amount: 50000
          }
        }
      }
    };

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(JSON.stringify(webhookPayload));
    const signature = hmac.digest("hex");

    const res = await request(app)
      .post("/api/payment/webhook")
      .set("x-razorpay-signature", signature)
      .send(webhookPayload);

    expect(res.status).toBe(200);

    // Duplicate webhook idempotency test
    const duplicateRes = await request(app)
      .post("/api/payment/webhook")
      .set("x-razorpay-signature", signature)
      .send(webhookPayload);

    expect(duplicateRes.status).toBe(200);
    expect(duplicateRes.body.status).toBe("already_processed");
  });

  // ==========================================
  // SCENARIO 19: Order History
  // ==========================================
  test("19. Order history - GET /api/orders/my-orders", async () => {
    const res = await request(app)
      .get("/api/orders/my-orders")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.orders.length).toBeGreaterThan(0);
  });

  // ==========================================
  // SCENARIO 20: Order Status Updates
  // ==========================================
  test("20. Order status updates - PUT /api/orders/admin/:id/status", async () => {
    const res = await request(app)
      .put(`/api/orders/admin/${sampleOrder._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "Preparing", note: "Chef started cooking" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order.orderStatus).toBe("Preparing");
  });

  // ==========================================
  // SCENARIO 21: Order Cancellation
  // ==========================================
  test("21. Order cancellation validation rules - PUT /api/orders/:id/cancel", async () => {
    // Create a new fresh order that is still in "Order Placed"
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ menuItemId: sampleMenuItem._id, quantity: 1 });

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        customer: { name: "Test", email: "customer1@test.com", phone: "+91 99999 33333" },
        deliveryAddress: { street: "Road 1", city: "Delhi", state: "Delhi", pincode: "110001" },
        paymentMethod: "COD"
      });

    const newOrderId = orderRes.body.order._id;

    // Cancel while Order Placed - should succeed
    const cancelRes = await request(app)
      .put(`/api/orders/${newOrderId}/cancel`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ reason: "Changed mind" });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.order.orderStatus).toBe("Cancelled");

    // Attempting to cancel already Cancelled order should be rejected
    const repeatCancel = await request(app)
      .put(`/api/orders/${newOrderId}/cancel`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ reason: "Cancel again" });

    expect(repeatCancel.status).toBe(400);
  });

  // ==========================================
  // SCENARIO 22: Restaurant Owner Permissions
  // ==========================================
  test("22. Restaurant owner permissions - GET /api/orders/restaurant/:id", async () => {
    const res = await request(app)
      .get(`/api/orders/restaurant/${sampleRestaurant._id}`)
      .set("Authorization", `Bearer ${restaurantOwnerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ==========================================
  // SCENARIO 23: Delivery Partner Permissions
  // ==========================================
  test("23. Delivery partner permissions - GET /api/orders/delivery/assigned", async () => {
    const res = await request(app)
      .get("/api/orders/delivery/assigned")
      .set("Authorization", `Bearer ${deliveryPartnerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ==========================================
  // SCENARIO 24: Admin Permissions
  // ==========================================
  test("24. Admin permissions - GET /api/admin/stats", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toHaveProperty("totalOrders");
    expect(res.body.stats).toHaveProperty("totalRevenue");
  });

  // ==========================================
  // SCENARIO 25: Ratings and Reviews
  // ==========================================
  test("25. Ratings and reviews - POST /api/reviews and GET /api/reviews", async () => {
    const postReview = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        orderId: sampleOrder.orderId,
        rating: 5,
        comment: "Exquisite flavors, hot delivery!",
        restaurantId: sampleRestaurant._id
      });

    expect(postReview.status).toBe(201);
    expect(postReview.body.success).toBe(true);

    const getReviews = await request(app)
      .get("/api/reviews")
      .query({ restaurantId: sampleRestaurant._id.toString() });

    expect(getReviews.status).toBe(200);
    expect(getReviews.body.reviews.length).toBeGreaterThan(0);
  });

  // ==========================================
  // SCENARIO 26: Coupon Validation
  // ==========================================
  test("26. Coupon validation - POST /api/coupons/validate", async () => {
    const res = await request(app)
      .post("/api/coupons/validate")
      .send({
        code: "WELCOME50",
        subtotal: 300
      });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.coupon.discount).toBeGreaterThan(0);
  });

  // ==========================================
  // SCENARIO 27: Invalid Request Validation
  // ==========================================
  test("27. Invalid request validation - POST /api/auth/register missing password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Missing Password User",
        email: "nopass@test.com"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ==========================================
  // SCENARIO 28: Unauthorized Requests
  // ==========================================
  test("28. Unauthorized requests - GET /api/auth/me without token returns 401", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ==========================================
  // SCENARIO 29: Cross-User Authorization Protection
  // ==========================================
  test("29. Access to another user's order returns 403 Forbidden", async () => {
    // Customer 2 attempts to access Customer 1's order
    const res = await request(app)
      .get(`/api/orders/${sampleOrder.orderId}`)
      .set("Authorization", `Bearer ${otherCustomerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  // ==========================================
  // SCENARIO 30: System Health & AI Recommendations
  // ==========================================
  test("30. System Health check & AI natural language query", async () => {
    const healthRes = await request(app).get("/api/health");
    expect(healthRes.status).toBe(200);
    expect(healthRes.body.status).toBe("ok");

    const aiRes = await request(app)
      .post("/api/ai/recommend")
      .send({ query: "Suggest vegetarian food under 300" });

    expect(aiRes.status).toBe(200);
    expect(aiRes.body.success).toBe(true);
    expect(Array.isArray(aiRes.body.items)).toBe(true);
  });
});
