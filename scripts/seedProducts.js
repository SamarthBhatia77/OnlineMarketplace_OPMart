const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('Starting seed script...');
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

const ProductSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  rating: Number,
  reviews: Number,
  deliveryDate: String,
  stock: Number,
  image: String,
  badge: String,
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const products = [
  {
    title: "PlayStation Sony God Of War Ragnarok",
    subtitle: "Standard Edition | PS5 Game (PlayStation 5)",
    price: 3218,
    originalPrice: 5199,
    discount: 38,
    rating: 4.6,
    reviews: 3500,
    deliveryDate: "Tomorrow, 30 Oct",
    stock: 15,
    image: "https://via.placeholder.com/400x400/f97316/ffffff?text=God+of+War",
    badge: "PEGI Rating: Ages 18 & Over"
  },
  {
    title: "Goody's Extra Strength Headache Relief",
    subtitle: "Acetaminophen - Cool Orange Powder",
    price: 669,
    originalPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 157,
    deliveryDate: "2-3 days",
    stock: 50,
    image: "https://via.placeholder.com/400x400/fb923c/ffffff?text=Goodys",
    badge: "24 Packets"
  },
  {
    title: "Apple iPhone 15 Pro Max",
    subtitle: "256GB - Natural Titanium",
    price: 134900,
    originalPrice: 159900,
    discount: 16,
    rating: 4.7,
    reviews: 2845,
    deliveryDate: "Tomorrow, 30 Oct",
    stock: 8,
    image: "https://via.placeholder.com/400x400/334155/ffffff?text=iPhone+15",
    badge: "Limited Stock"
  },
  {
    title: "Sony WH-1000XM5 Wireless Headphones",
    subtitle: "Premium Noise Cancelling | 30Hr Battery",
    price: 24990,
    originalPrice: 34990,
    discount: 29,
    rating: 4.9,
    reviews: 4721,
    deliveryDate: "Tomorrow, 30 Oct",
    stock: 23,
    image: "https://via.placeholder.com/400x400/0f172a/ffffff?text=Sony+Headphones",
    badge: "Best Seller"
  }
];

async function seedProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    console.log('Inserting new products...');
    await Product.insertMany(products);
    console.log('✅ Products added successfully!');
    console.log(`✅ Added ${products.length} products`);

    mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

seedProducts();
