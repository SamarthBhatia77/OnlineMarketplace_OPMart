const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

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
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// ✅ Updated categories from your navbar
const categories = [
  'Electronics',
  'Gaming',
  'Groceries',
  'Fashion',
  'Accessories',
  'Music',
  'Home',
  'Sports',
  'Books',
  'Beauty',
  'Toys',
  'Health'
];

const productTemplates = {
  Electronics: [
    { base: 'Apple', variants: ['iPhone 15 Pro', 'MacBook Air', 'AirPods Pro', 'iPad Air', 'Apple Watch'] },
    { base: 'Samsung', variants: ['Galaxy S24', 'Galaxy Watch', 'Galaxy Buds', 'Smart TV', 'Tablet'] },
    { base: 'Sony', variants: ['WH-1000XM5', 'Camera', 'Soundbar', 'Earbuds', 'TV'] },
    { base: 'Laptop', variants: ['Dell XPS', 'HP Pavilion', 'Lenovo ThinkPad', 'ASUS ROG'] },
  ],
  Gaming: [
    { base: 'PlayStation', variants: ['5 Console', '5 Controller', 'VR Headset', 'PS5 Games'] },
    { base: 'Xbox', variants: ['Series X', 'Series S', 'Controller', 'Game Pass'] },
    { base: 'Nintendo', variants: ['Switch OLED', 'Switch Lite', 'Joy-Con', 'Games'] },
    { base: 'Gaming', variants: ['Keyboard', 'Mouse', 'Headset', 'Chair', 'Monitor'] },
  ],
  Groceries: [
    { base: 'Organic', variants: ['Fruits', 'Vegetables', 'Milk', 'Eggs', 'Bread'] },
    { base: 'Snacks', variants: ['Chips', 'Cookies', 'Chocolates', 'Nuts', 'Biscuits'] },
    { base: 'Beverages', variants: ['Coffee', 'Tea', 'Juice', 'Soda', 'Energy Drink'] },
    { base: 'Staples', variants: ['Rice', 'Wheat Flour', 'Sugar', 'Salt', 'Oil'] },
  ],
  Fashion: [
    { base: 'Nike', variants: ['Air Max', 'Running Shoes', 'T-Shirt', 'Hoodie', 'Track Pants'] },
    { base: 'Adidas', variants: ['Sneakers', 'Track Pants', 'Jersey', 'Cap', 'Jacket'] },
    { base: "Levi's", variants: ['Jeans', 'Jacket', 'Shirt', 'Shorts', 'Belt'] },
    { base: 'Puma', variants: ['Shoes', 'T-Shirt', 'Backpack', 'Socks', 'Cap'] },
  ],
  Accessories: [
    { base: 'Watch', variants: ['Smart Watch', 'Analog Watch', 'Digital Watch', 'Fitness Band'] },
    { base: 'Bag', variants: ['Backpack', 'Handbag', 'Messenger Bag', 'Duffle Bag'] },
    { base: 'Wallet', variants: ['Leather Wallet', 'Card Holder', 'Money Clip', 'Coin Purse'] },
    { base: 'Jewelry', variants: ['Necklace', 'Bracelet', 'Earrings', 'Ring'] },
  ],
  Music: [
    { base: 'Headphones', variants: ['Wireless', 'Wired', 'Gaming', 'Studio'] },
    { base: 'Speakers', variants: ['Bluetooth', 'Home Theater', 'Soundbar', 'Portable'] },
    { base: 'Instruments', variants: ['Guitar', 'Keyboard', 'Drums', 'Ukulele'] },
    { base: 'Vinyl', variants: ['Records', 'Turntable', 'Albums', 'Singles'] },
  ],
  Home: [
    { base: 'Kitchen', variants: ['Mixer Grinder', 'Toaster', 'Microwave', 'Air Fryer', 'Blender'] },
    { base: 'Decor', variants: ['Wall Art', 'Cushions', 'Curtains', 'Lamp', 'Vase'] },
    { base: 'Appliances', variants: ['Vacuum Cleaner', 'Iron', 'Fan', 'Heater', 'AC'] },
    { base: 'Furniture', variants: ['Sofa', 'Bed', 'Table', 'Chair', 'Wardrobe'] },
  ],
  Sports: [
    { base: 'Cricket', variants: ['Bat', 'Ball', 'Gloves', 'Kit Bag', 'Helmet'] },
    { base: 'Football', variants: ['Ball', 'Shoes', 'Jersey', 'Shin Guards', 'Gloves'] },
    { base: 'Badminton', variants: ['Racket', 'Shuttlecock', 'Shoes', 'Net', 'Bag'] },
    { base: 'Gym', variants: ['Treadmill', 'Cycle', 'Bench', 'Weight Set', 'Yoga Mat'] },
  ],
  Books: [
    { base: 'Programming', variants: ['JavaScript Guide', 'Python Mastery', 'React Handbook', 'SQL Basics'] },
    { base: 'Fiction', variants: ['Mystery Novel', 'Fantasy Series', 'Thriller', 'Romance'] },
    { base: 'Self-Help', variants: ['Atomic Habits', 'Rich Dad Poor Dad', 'Think and Grow Rich'] },
    { base: 'Textbook', variants: ['Physics', 'Chemistry', 'Mathematics', 'Biology'] },
  ],
  Beauty: [
    { base: 'Skincare', variants: ['Face Cream', 'Serum', 'Sunscreen', 'Face Wash', 'Toner'] },
    { base: 'Makeup', variants: ['Lipstick', 'Foundation', 'Mascara', 'Eyeshadow', 'Blush'] },
    { base: 'Haircare', variants: ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Mask', 'Serum'] },
    { base: 'Fragrance', variants: ['Perfume', 'Body Spray', 'Deodorant', 'Body Mist'] },
  ],
  Toys: [
    { base: 'LEGO', variants: ['Star Wars Set', 'City Set', 'Technic Set', 'Friends Set'] },
    { base: 'Hot Wheels', variants: ['Car Track', 'Monster Truck', 'Race Car', 'Stunt Set'] },
    { base: 'Barbie', variants: ['Dreamhouse', 'Fashion Doll', 'Pet Set', 'Career Doll'] },
    { base: 'Educational', variants: ['Science Kit', 'Puzzle Set', 'Building Blocks', 'Art Set'] },
  ],
  Health: [
    { base: 'Protein', variants: ['Whey Protein', 'Mass Gainer', 'Pre-Workout', 'BCAA'] },
    { base: 'Vitamins', variants: ['Vitamin C', 'Vitamin D', 'Multivitamin', 'Omega-3', 'Zinc'] },
    { base: 'Fitness', variants: ['Yoga Mat', 'Resistance Bands', 'Dumbbells', 'Jump Rope'] },
    { base: 'Medicine', variants: ['Pain Relief', 'Cold & Flu', 'Antacid', 'First Aid Kit'] },
  ],
};

function generateRandomProduct(index) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const templates = productTemplates[category];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const variant = template.variants[Math.floor(Math.random() * template.variants.length)];
  
  const title = `${template.base} ${variant}`;
  const basePrice = Math.floor(Math.random() * 50000) + 500;
  const hasDiscount = Math.random() > 0.4;
  const discount = hasDiscount ? Math.floor(Math.random() * 60) + 10 : null;
  const price = hasDiscount ? Math.floor(basePrice * (100 - discount) / 100) : basePrice;
  const originalPrice = hasDiscount ? basePrice : null;
  
  const deliveryDates = ['Today', 'Tomorrow', '2-3 days', '3-5 days', 'Tomorrow, 15 Nov'];
  
  // ✅ Use Picsum Photos - reliable and works!
  const randomImageId = Math.floor(Math.random() * 1000) + 1;
  
  return {
    title,
    subtitle: `Premium Quality | ${category} Product`,
    price,
    originalPrice,
    discount,
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: Math.floor(Math.random() * 10000) + 50,
    deliveryDate: deliveryDates[Math.floor(Math.random() * deliveryDates.length)],
    stock: Math.floor(Math.random() * 100) + 1,
    image: `https://picsum.photos/seed/${randomImageId}/400/400`, // ✅ This works!
    badge: category,
  };
}


async function seedBulkProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const products = [];
    for (let i = 0; i < 100; i++) {
      products.push(generateRandomProduct(i));
    }

    await Product.insertMany(products);
    console.log(`✅ Successfully added ${products.length} products to database!`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedBulkProducts();
