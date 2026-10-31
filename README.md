# Prime Platter - Full-Stack Food Delivery Application

A responsive food delivery web application built with a modern frontend and a robust REST API backend using Node.js, Express.js, and MongoDB.

---

## 1. Technology Stack

- **Frontend**: HTML5, CSS3 (Custom Styling & Variables), Bootstrap 5.3.2, Bootstrap Icons, Vanilla JavaScript (ES6+), Fetch API Client (`js/api.js`).
- **Backend**: Node.js, Express.js (v4.19), RESTful APIs, Mongoose (v8.4), CORS, dotenv.
- **Database**: MongoDB (Local or Atlas via `MONGO_URI`).

---

## 2. Project Structure

```
TTexp1/
├── css/
│   └── style.css                 # Custom styles, animations, responsive design
├── js/
│   ├── api.js                    # Reusable frontend REST API client service
│   └── script.js                 # Frontend application logic, filters & cart integration
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic using Mongoose
│   ├── controllers/
│   │   ├── restaurantController.js  # Restaurant CRUD handlers
│   │   ├── menuController.js        # Menu CRUD & dynamic query builder
│   │   └── cartController.js        # Dynamic cart operations & total calculation
│   ├── middleware/
│   │   └── errorMiddleware.js       # Centralized error handler & 404 router
│   ├── models/
│   │   ├── Restaurant.js         # Mongoose schema for Restaurants
│   │   ├── MenuItem.js           # Mongoose schema for Menu Items (ref: Restaurant)
│   │   └── Cart.js               # Mongoose schema for Cart with dynamic totals
│   ├── routes/
│   │   ├── restaurantRoutes.js   # Route definitions for /api/restaurants
│   │   ├── menuRoutes.js         # Route definitions for /api/menu
│   │   └── cartRoutes.js         # Route definitions for /api/cart
│   ├── .env                      # Environment configuration
│   ├── .env.example              # Template for environment variables
│   ├── package.json              # Backend dependencies and run scripts
│   ├── seed.js                   # Database seeder populating initial restaurants & foods
│   └── server.js                 # Express server entry point & static file hosting
├── index.html                    # Main responsive web page
├── package.json                  # Root convenience scripts
├── .gitignore                    # Git ignore file (node_modules, .env)
└── README.md                     # Complete project & API documentation
```

---

## 3. Getting Started & Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally on port `27017` or a MongoDB Atlas connection string.

### Step 1: Install Dependencies
Navigate into the `backend/` directory and install the required npm packages:
```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` inside the `backend/` folder:
```bash
cp .env.example .env
```
Ensure the values match your local or cloud setup:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/food_delivery_db
CLIENT_URL=http://localhost:8000
```
> *Note: On macOS, port `5000` is reserved by AirPlay Receiver (ControlCenter). Port `5001` is configured by default to avoid port collisions.*

### Step 3: Seed the Database
Populate MongoDB with the 8 restaurants and 16 curated menu items:
```bash
npm run seed
# or: node seed.js
```
Expected output:
```
Connected to MongoDB successfully.
Inserted 8 restaurants.
Inserted 16 menu items with valid restaurant references.
Initialized empty shopping cart.
Database seeded successfully!
```

### Step 4: Run the Application
Start the backend server:
```bash
npm start
# or for auto-reloading during development:
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:5001](http://localhost:5001)**

The Express server hosts the REST APIs on `/api/*` and serves the static frontend from the root, providing a seamless full-stack experience.

---

## 4. REST API Documentation

### Base URL: `http://localhost:5001/api`

### 4.1 Restaurants APIs

| Method | Endpoint | Description | Request Body | Expected Status |
|---|---|---|---|---|
| **GET** | `/api/restaurants` | Get all restaurants | None | `200 OK` |
| **GET** | `/api/restaurants/:id` | Get single restaurant by ID | None | `200 OK` / `404 Not Found` |
| **POST** | `/api/restaurants` | Create new restaurant | JSON (name, image, cuisine, etc.) | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/restaurants/:id` | Update restaurant details | JSON with fields to update | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/restaurants/:id` | Delete restaurant & dishes | None | `200 OK` / `404 Not Found` |

#### Example: Create Restaurant (POST `/api/restaurants`)
```json
{
  "name": "Tokyo Express",
  "cuisine": "Japanese",
  "image": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
  "rating": 4.6,
  "deliveryTime": "20-25 mins",
  "minOrder": 200,
  "description": "Authentic sushi rolls, hot ramen, and bento platters."
}
```

---

### 4.2 Menu Items APIs & Server-Side Filtering

| Method | Endpoint | Description | Query Parameters | Expected Status |
|---|---|---|---|---|
| **GET** | `/api/menu` | Get all menu items or filtered list | `type`, `cuisine`, `minPrice`, `maxPrice`, `restaurantId`, `search` | `200 OK` |
| **GET** | `/api/menu/:id` | Get menu item by ID | None | `200 OK` / `404 Not Found` |
| **POST** | `/api/menu` | Create menu item | JSON with name, price, type, cuisine, restaurantId, image | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/menu/:id` | Update menu item | JSON with updated fields | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/menu/:id` | Delete menu item | None | `200 OK` / `404 Not Found` |

#### Supported Filter Query Parameters:
- `type`: `Veg` or `Non-Veg` (e.g. `?type=Veg`)
- `cuisine`: Single cuisine or comma-separated list (e.g. `?cuisine=Indian` or `?cuisine=Italian,Chinese`)
- `minPrice` & `maxPrice`: Numeric price range boundaries (e.g. `?minPrice=200&maxPrice=500`)
- `restaurantId`: MongoDB ObjectId of the restaurant (e.g. `?restaurantId=6aa6d464bd08011b74f15572`)
- `search`: Case-insensitive text search matching name, cuisine, category, and description (e.g. `?search=pasta`)
- **Combined Filters Example**:
  ```http
  GET /api/menu?type=Veg&cuisine=Indian&minPrice=100&maxPrice=300
  ```

#### Example: Create Menu Item (POST `/api/menu`)
```json
{
  "name": "Paneer Butter Masala",
  "price": 290,
  "type": "Veg",
  "cuisine": "Indian",
  "category": "Main Course",
  "restaurantId": "6aa6d464bd08011b74f15572",
  "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
  "description": "Rich and creamy dish of paneer in a tomato, butter, and cashew sauce."
}
```

---

### 4.3 Shopping Cart APIs

| Method | Endpoint | Description | Request Body | Expected Status |
|---|---|---|---|---|
| **GET** | `/api/cart` | Get current active cart with dynamic total | None | `200 OK` |
| **POST** | `/api/cart` | Add item to cart (increments quantity if already in cart) | `{ "menuItemId": "...", "quantity": 1 }` | `200 OK` / `400 Bad Request` |
| **PUT** | `/api/cart/:menuItemId` | Update item quantity (removes if quantity <= 0) | `{ "quantity": 3 }` | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/cart/:menuItemId` | Remove item from cart | None | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/cart` | Clear entire cart | None | `200 OK` |

#### Example: Cart Response Format
```json
{
  "success": true,
  "items": [
    {
      "menuItemId": "6aa6d464bd08011b74f15580",
      "name": "Butter Chicken",
      "price": 350,
      "quantity": 2,
      "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
      "restaurantId": "6aa6d464bd08011b74f15570"
    }
  ],
  "totalAmount": 700
}
```

---

## 5. Postman Testing Guide

1. Open Postman and set up a collection named `Prime Platter API`.
2. Set variable `baseUrl` = `http://localhost:5001/api`.

### Test Cases:
- **Get Restaurants**: `GET {{baseUrl}}/restaurants`
- **Get Filtered Menu**: `GET {{baseUrl}}/menu?type=Veg&cuisine=Indian`
- **Search Food**: `GET {{baseUrl}}/menu?search=pizza`
- **Add to Cart**:
  - Method: `POST`
  - URL: `{{baseUrl}}/cart`
  - Body (`raw` JSON):
    ```json
    {
      "menuItemId": "<REPLACE_WITH_VALID_MENU_ITEM_ID>",
      "quantity": 1
    }
    ```
- **Update Quantity**:
  - Method: `PUT`
  - URL: `{{baseUrl}}/cart/<REPLACE_WITH_MENU_ITEM_ID>`
  - Body: `{ "quantity": 3 }`
- **Remove from Cart**: `DELETE {{baseUrl}}/cart/<REPLACE_WITH_MENU_ITEM_ID>`
- **Clear Cart**: `DELETE {{baseUrl}}/cart`

---

## 6. Frontend Integration Architecture

The frontend is decoupled and communicates with the backend through `js/api.js`:
- **Auto Environment Detection**: Automatically directs requests to `/api` when hosted on port `5001`, or defaults to `http://localhost:5001/api` when accessed through another origin.
- **Server-Side Filtering**: Checkbox clicks for Diet Preference, Cuisines, and Price Ranges trigger asynchronous `api.getMenuItems(filters)` queries, dynamically updating the menu grid without page reload.
- **Dynamic Search**: Input in the search bars queries the backend with regex pattern matching via `?search=...`.
- **Direct Cart Synchronization**: Quantity updates and additions call the backend Cart endpoints; the subtotal, badge count, and drawer rows are re-rendered based strictly on the backend response.
