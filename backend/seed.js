const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Restaurant = require("./models/Restaurant");
const MenuItem = require("./models/MenuItem");
const Cart = require("./models/Cart");
const User = require("./models/User");

dotenv.config({
  path: path.join(__dirname, ".env")
});

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing from backend/.env");
}

const seedRestaurants = [
  {
    tempId: 1,
    name: "Spicy Villa",
    cuisine: "Indian",
    rating: 4.5,
    deliveryTime: "25-30 mins",
    minOrder: 150,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    description: "Authentic North Indian curries, aromatic biryanis, and traditional clay oven specialties."
  },
  {
    tempId: 2,
    name: "Dragon Wok",
    cuisine: "Chinese",
    rating: 4.2,
    deliveryTime: "30-35 mins",
    minOrder: 200,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    description: "Flavorsome wok noodles, fiery Schezwan gravies, and delicious hand-rolled dim sums."
  },
  {
    tempId: 3,
    name: "Bella Italia",
    cuisine: "Italian",
    rating: 4.7,
    deliveryTime: "35-40 mins",
    minOrder: 250,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    description: "Artisan wood-fired pizzas, handcrafted pastas, and authentic gourmet Italian sauces."
  },
  {
    tempId: 4,
    name: "Taco Loco",
    cuisine: "Mexican",
    rating: 4.3,
    deliveryTime: "20-25 mins",
    minOrder: 100,
    image: "https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?auto=format&fit=crop&w=600&q=80",
    description: "Freshly pressed corn tortillas, vibrant salsas, loaded quesadillas, and spicy burritos."
  },
  {
    tempId: 5,
    name: "The Curry House",
    cuisine: "Indian",
    rating: 4.4,
    deliveryTime: "25-30 mins",
    minOrder: 150,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    description: "Heritage recipes slow-cooked to perfection with freshly ground regional Indian spices."
  },
  {
    tempId: 6,
    name: "Cantina Jalisco",
    cuisine: "Mexican",
    rating: 4.1,
    deliveryTime: "30-35 mins",
    minOrder: 180,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    description: "Street-style Mexican favorites, crispy nachos, seasoned meats, and homemade guacamole."
  },
  {
    tempId: 7,
    name: "Peking Palace",
    cuisine: "Chinese",
    rating: 4.4,
    deliveryTime: "25-30 mins",
    minOrder: 150,
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80",
    description: "Traditional Cantonese and Szechuan cuisine cooked by master wok chefs."
  },
  {
    tempId: 8,
    name: "Toscana Bistro",
    cuisine: "Italian",
    rating: 4.6,
    deliveryTime: "30-35 mins",
    minOrder: 200,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    description: "Cozy bistro dining featuring fresh seafood pastas, risotto, and rich tiramisu desserts."
  }
];

const seedFoods = [
  {
    name: "Butter Chicken",
    restaurantTempId: 1,
    type: "Non-Veg",
    cuisine: "Indian",
    category: "Main Course",
    price: 350,
    rating: 4.8,
    description: "Tender chicken cooked in a rich, creamy, and mildly spiced tomato-butter sauce.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Paneer Tikka",
    restaurantTempId: 1,
    type: "Veg",
    cuisine: "Indian",
    category: "Starters",
    price: 280,
    rating: 4.6,
    description: "Marinated cottage cheese cubes grilled to perfection with onions and bell peppers.",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Rasmalai",
    restaurantTempId: 1,
    type: "Veg",
    cuisine: "Indian",
    category: "Dessert",
    price: 140,
    rating: 4.8,
    description: "Soft, spongy cottage cheese dumplings soaked in rich, creamy saffron- and cardamom-flavored milk, garnished with crunchy pistachios and almonds.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIlHb8pZAmDg_JunFeXxyJEJQmzIQtZQd80XZdHN-awr1QU9pfim3Ym4TlfkpMrOAm6HlGVg&s=10"
  },
  {
    name: "Paneer Malai",
    restaurantTempId: 1,
    type: "Veg",
    cuisine: "Indian",
    category: "Main Course",
    price: 240,
    rating: 4.5,
    description: "Tasty Paneer Malai cooked with mild aromatic spices in a velvety cream gravy.",
    image: "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFuZWVyfGVufDB8fDB8fHww"
  },
  {
    name: "Schezwan Noodles",
    restaurantTempId: 2,
    type: "Veg",
    cuisine: "Chinese",
    category: "Main Course",
    price: 180,
    rating: 4.3,
    description: "Spicy stir-fried noodles tossed with fresh vegetables and fiery Schezwan sauce.",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Kung Pao Chicken",
    restaurantTempId: 2,
    type: "Non-Veg",
    cuisine: "Chinese",
    category: "Main Course",
    price: 240,
    rating: 4.5,
    description: "Classic Chinese dish featuring diced chicken stir-fried with peanuts, vegetables, and chili peppers.",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Margherita Pizza",
    restaurantTempId: 3,
    type: "Veg",
    cuisine: "Italian",
    category: "Pizza",
    price: 299,
    rating: 4.7,
    description: "Simple yet delicious pizza topped with pure tomato sauce, fresh mozzarella, and fresh basil leaves.",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Lasagna Bolognese",
    restaurantTempId: 3,
    type: "Non-Veg",
    cuisine: "Italian",
    category: "Pasta",
    price: 380,
    rating: 4.9,
    description: "Layers of pasta sheets baked with rich meat sauce, creamy Béchamel sauce, and melted parmesan cheese.",
    image: "https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Chicken Quesadilla",
    restaurantTempId: 4,
    type: "Non-Veg",
    cuisine: "Mexican",
    category: "Main Course",
    price: 220,
    rating: 4.4,
    description: "Grilled tortilla folded with spiced chicken, melted cheese blend, served with fresh salsa.",
    image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Veggie Taco Trio",
    restaurantTempId: 4,
    type: "Veg",
    cuisine: "Mexican",
    category: "Tacos",
    price: 190,
    rating: 4.2,
    description: "Three soft-shell tacos loaded with seasoned beans, grilled corn, avocado, and lime cream.",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Dal Makhani",
    restaurantTempId: 5,
    type: "Veg",
    cuisine: "Indian",
    category: "Main Course",
    price: 210,
    rating: 4.7,
    description: "Creamy, slow-cooked black lentils with spices, finished with butter and fresh cream.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Beef Tacos",
    restaurantTempId: 6,
    type: "Non-Veg",
    cuisine: "Mexican",
    category: "Tacos",
    price: 250,
    rating: 4.5,
    description: "Hard-shell corn tortillas filled with seasoned ground beef, shredded lettuce, and cheddar cheese.",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Dim Sum Feast",
    restaurantTempId: 7,
    type: "Veg",
    cuisine: "Chinese",
    category: "Starters",
    price: 160,
    rating: 4.5,
    description: "Steamed vegetable dumplings stuffed with mushrooms and water chestnuts, served with soy dip.",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Szechuan Chilli Chicken",
    restaurantTempId: 7,
    type: "Non-Veg",
    cuisine: "Chinese",
    category: "Main Course",
    price: 230,
    rating: 4.4,
    description: "Crispy chicken bites tossed with dry red chillies, bell peppers, and scallions in Szechuan sauce.",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Fettuccine Alfredo",
    restaurantTempId: 8,
    type: "Veg",
    cuisine: "Italian",
    category: "Pasta",
    price: 320,
    rating: 4.6,
    description: "Rich, creamy parmesan cream sauce tossed with tender fettuccine pasta and fresh parsley.",
    image: "https://images.unsplash.com/photo-1554998171-7e599bc95ccd?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Shrimp Scampi",
    restaurantTempId: 8,
    type: "Non-Veg",
    cuisine: "Italian",
    category: "Pasta",
    price: 420,
    rating: 4.8,
    description: "Succulent shrimp sautéed with garlic, white wine, butter, and lemon juice over linguine pasta.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80"
  }
];

const seedDatabase = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    // Drop collections to remove any legacy indexes from previous experiments
    console.log("Dropping old collections and legacy indexes...");
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      if (["restaurants", "menuitems", "carts"].includes(col.name)) {
        await mongoose.connection.db.dropCollection(col.name);
      }
    }

    // Insert Restaurants
    console.log("Inserting restaurants...");
    const restaurantIdMap = {};
    for (const restData of seedRestaurants) {
      const { tempId, ...restFields } = restData;
      const createdRest = await Restaurant.create(restFields);
      restaurantIdMap[tempId] = createdRest._id;
    }
    console.log(`Inserted ${Object.keys(restaurantIdMap).length} restaurants.`);

    // Insert Menu Items with linked restaurantId
    console.log("Inserting menu items with valid restaurant references...");
    const menuItemsToInsert = seedFoods.map(food => {
      const { restaurantTempId, ...foodFields } = food;
      return {
        ...foodFields,
        restaurantId: restaurantIdMap[restaurantTempId]
      };
    });

    const createdMenuItems = await MenuItem.insertMany(menuItemsToInsert);
    console.log(`Inserted ${createdMenuItems.length} menu items.`);

    // Initialize clean cart
    await Cart.create({ items: [], totalAmount: 0 });
    console.log("Initialized empty shopping cart.");

    // Seed default admin user if not present
    const existingAdmin = await User.findOne({ email: "admin@primeplatter.com" });
    if (!existingAdmin) {
      await User.create({
        name: "Prime Platter Admin",
        email: "admin@primeplatter.com",
        phone: "+91 98765 00000",
        password: "Admin@123",
        role: "admin",
        addresses: [
          {
            street: "Connaught Place Head Office",
            city: "New Delhi",
            state: "Delhi",
            pincode: "110001",
            isDefault: true
          }
        ]
      });
      console.log("Seeded default admin user: admin@primeplatter.com / Admin@123");
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
