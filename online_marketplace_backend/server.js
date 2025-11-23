import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { MONGODB_URI } from "./config.js";
import User from "./models/User.js";
import cors from "cors";
import Otp from "./models/Otp.js";
import WProd from "./models/WProd.js";
import CProd from './models/CProd.js';

import RProd from './models/RProd.js';

import Cart from './models/Cart.js';
import WalletTransaction from "./models/WalletTransaction.js";
//console.log("Cloudinary ENV check:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);


//import cloudinary from "./cloudinary.js";


import cloudinary from "./cloudinary.js";
import { sendOtpEmail } from "./email.js";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID =
  "1028953534432-aarvrfrl3h69e16saed41s9qod8q69vc.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

const PORT = 5000;

// Connect to MongoDB Atlas and start server
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Root test route
    app.get("/", (req, res) => {
      res.send("Backend is working and connected to MongoDB!");
    });

    // REAL SIGNUP ROUTE (with OTP)
    app.post("/auth/signup", async (req, res) => {
      try {
        const {
          fullName,
          email,
          password,
          role,
          address,
          city,
          state,
          pincode,
          location,
        } = req.body;

        if (!fullName || !email || !password || !role) {
          return res
            .status(400)
            .json({ message: "All fields are required." });
        }

        const allowedRoles = ["customer", "retailer", "wholesaler"];
        if (!allowedRoles.includes(role)) {
          return res.status(400).json({ message: "Invalid role." });
        }

        const existingUser = await User.findOne({
          email: email.toLowerCase(),
        });
        if (existingUser) {
          return res
            .status(409)
            .json({ message: "Email is already registered." });
        }

        const newUser = new User({
          fullName,
          email,
          password,
          role,
          isEmailVerified: false,
          address: address || "",
          city: city || "",
          state: state || "",
          pincode: pincode || "",
          location: location || null,
        });

        await newUser.save();

        const otpCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        const expires = new Date(Date.now() + 10 * 60 * 1000);
        await Otp.create({
          email: email.toLowerCase(),
          code: otpCode,
          expiresAt: expires,
        });

        await sendOtpEmail(email, otpCode);

        return res.status(201).json({
          message: "User registered. OTP sent to email.",
          email: email.toLowerCase(),
        });
      } catch (err) {
        console.error("Error in /auth/signup:", err.message);
        return res.status(500).json({ message: "Server error." });
      }
    });


    //rprods route
    
// Add purchased retailer product into rprods
app.post("/rprods", async (req, res) => {
  try {
    const {
      retailerId, wholesalerProdId, productName, description, image,
      category, marketPrice, numberOfItems, sellingPrice
    } = req.body;
    if (!retailerId || !wholesalerProdId) return res.status(400).json({ message: "Missing info" });
    const RProd = mongoose.model('RProd') // or require('./models/RProd.js') if needed
    const rprod = await RProd.create({
      retailerId, wholesalerProdId, productName, description, image,
      category, marketPrice, numberOfItems, sellingPrice, createdAt: new Date()
    });
    return res.status(201).json({ success: true, retailerProdId: rprod._id });
  } catch (err) {
    console.error("Error in POST /rprods", err);
    return res.status(500).json({ message: "Server error." });
  }
});

//reduce wholesaler stock after bought by retailer
app.post("/wprods/:id/reduce", async (req, res) => {
  try {
    const { quantity } = req.body;
    const id = req.params.id;
    const WProd = mongoose.model('WProd'); // or require('./models/WProd.js')
    const prod = await WProd.findById(id);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    if (prod.numberOfItems < quantity) return res.status(400).json({ message: "Not enough items in stock" });
    prod.numberOfItems -= quantity;
    await prod.save();
    res.status(200).json({ success: true, numberOfItems: prod.numberOfItems });
  } catch (err) {
    console.error("Error in POST /wprods/:id/reduce", err);
    res.status(500).json({ message: "Server error." });
  }
});


//customer add to cart POST
app.post('/cart', async (req, res) => {
  try {
    const { customerId, rprodId, quantity } = req.body;
    if (!customerId || !rprodId) return res.status(400).json({ message: "Missing info" });
    // Check for duplicate & update quantity if desired, or just insert new for simplicity
    const existing = await Cart.findOne({ customerId, rprodId });
    if (existing) {
      existing.quantity += Number(quantity);
      await existing.save();
      return res.status(200).json({ message: "Cart updated!" });
    }
    await Cart.create({ customerId, rprodId, quantity });
    res.status(201).json({ message: "Added to cart!" });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

//Getting all the retailer products for the customer dashboard
app.get('/rprods', async (req, res) => {
  try {
    const items = await RProd.find({}).sort({ createdAt: -1 });
    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

//Getting the cart for a customer
app.get('/cart/:customerId', async (req, res) => {
  try {
    // Populate rprodId to pull product details for card display
    const items = await Cart.find({ customerId: req.params.customerId }).populate('rprodId');
    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

//POST route for cprods collection (after customer purchases a given number of items)
app.post('/cprods', async (req, res) => {
  try {
    const { customerId, productId, productName, description, image, category, quantity, pricePerItem, totalPrice, review } = req.body;
    const newPurchase = await CProd.create({
      customerId, productId, productName, description, image, category,
      quantity, pricePerItem, totalPrice, review: review || 0
    });
    res.status(201).json({ message: "Purchase recorded", purchase: newPurchase });
  } catch (err) {
    res.status(500).json({ message: "Error recording purchase" });
  }
});

//GET for user
app.get('/cprods/user/:uid', async (req, res) => {
  const items = await CProd.find({ customerId: req.params.uid });
  res.json({ items });
});

//PUT for review
app.put('/cprods/:cid/rate', async (req, res) => {
  const { review } = req.body;
  await CProd.findByIdAndUpdate(req.params.cid, { review: Math.max(1, Math.min(5, review)) });
  res.json({ message: "Review updated" });
});

//GET retailer bought products
// Get all rprods for a specific retailer
app.get('/rprods/retailer/:retailerId', async (req, res) => {
  try {
    const items = await RProd.find({ retailerId: req.params.retailerId }).sort({ createdAt: -1 });
    res.status(200).json({ items });
  } catch (err) {
    console.error("Error fetching retailer rprods:", err);
    res.status(500).json({ message: "Server error." });
  }
});




    // LOGIN ROUTE
    app.post("/auth/login", async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res
            .status(400)
            .json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return res
            .status(401)
            .json({ message: "Invalid email or password." });
        }

        const isMatch = await user.checkPassword(password);
        if (!isMatch) {
          return res
            .status(401)
            .json({ message: "Invalid email or password." });
        }

        if (!user.isEmailVerified) {
          return res
            .status(403)
            .json({ message: "Please verify your email first." });
        }

        return res.status(200).json({
          message: "Login successful.",
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
        });
      } catch (err) {
        console.error("Error in /auth/login:", err.message);
        return res.status(500).json({ message: "Server error." });
      }
    });

    // GOOGLE AUTH ROUTE
    app.post("/auth/google", async (req, res) => {
      try {
        const { idToken, role } = req.body;

        if (!idToken) {
          return res
            .status(400)
            .json({ message: "Google ID token is required." });
        }

        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const fullName =
          payload.name || payload.given_name || "Google User";

        if (!email) {
          return res
            .status(400)
            .json({ message: "Google account has no email." });
        }

        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          const finalRole =
            role &&
            ["customer", "retailer", "wholesaler"].includes(role)
              ? role
              : "customer";

          user = new User({
            fullName,
            email,
            password: "google-auth-no-password",
            role: finalRole,
            isEmailVerified: true,
          });
          await user.save();
        }

        return res.status(200).json({
          message: "Google login successful.",
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
        });
      } catch (err) {
        console.error("Error in /auth/google:", err.message);
        return res
          .status(500)
          .json({ message: "Google login failed." });
      }
    });

    // OTP VERIFY
    app.post("/auth/verify_otp", async (req, res) => {
      try {
        const { email, code } = req.body;

        if (!email || !code) {
          return res
            .status(400)
            .json({ message: "Email and OTP code are required." });
        }

        const normalizedEmail = email.toLowerCase();

        const otpEntry = await Otp.findOne({
          email: normalizedEmail,
          code,
          used: false,
          expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (!otpEntry) {
          return res
            .status(400)
            .json({ message: "Invalid or expired OTP." });
        }

        otpEntry.used = true;
        await otpEntry.save();

        const user = await User.findOneAndUpdate(
          { email: normalizedEmail },
          { isEmailVerified: true },
          { new: true }
        );

        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({
          message: "Email verified successfully.",
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
        });
      } catch (err) {
        console.error("Error in /auth/verify_otp:", err.message);
        return res.status(500).json({ message: "Server error." });
      }
    });

    // ===========================
    // WHOLESALER PRODUCTS (WPRODS)
    // ===========================

    // Create a new product for a wholesaler
    // CREATE PRODUCT
app.post("/wprods/create", async (req, res) => {
  try {
    const {
      wholesalerId,
      productName,
      description,
      sellingPrice,
      numberOfItems,
      category,
      base64Image,
    } = req.body;

    console.log("CREATE /wprods/create body:", req.body);

    if (
      !wholesalerId ||
      !productName ||
      !description ||
      !sellingPrice ||
      !numberOfItems ||
      !category ||
      !base64Image
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields." });
    }

    // 1. Upload image to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(base64Image, {
      folder: "oopmart-wprods",
    });

    // 2. Actually create and save the product in MongoDB (IMPORTANT!)
    const newItem = await WProd.create({
      wholesalerId,
      productName,
      description,
      sellingPrice,
      numberOfItems,
      category,
      image: uploadRes.secure_url, // Only store the Cloudinary URL
    });

    // 3. Respond with the new item
    return res.status(201).json({ item: newItem });
  } catch (err) {
    console.error("Error in /wprods/create:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Add money to wallet
app.post('/api/wallet-add', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ message: 'Missing userId or amount' });
    }

    // 👇 THIS IS WHERE accountBalance GETS INCREMENTED 👇
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { accountBalance: Number(amount) } }, // ← Increments balance by amount
      { new: true } // Returns the updated user
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Record the transaction
    const txn = await WalletTransaction.create({
      userId,
      amount: Number(amount),
      type: 'credit',
      description: 'Wallet top-up'
    });

    return res.json({
      message: 'Payment successful',
      transactionId: txn._id,
      newBalance: user.accountBalance // Returns updated balance
    });
  } catch (err) {
    console.error('Error in /api/wallet-add:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/wprods/:wholesalerId", async (req, res) => {
  try {
    const { wholesalerId } = req.params;
    console.log("GET /wprods for:", wholesalerId);         // 👈 add this

    const items = await WProd.find({ wholesalerId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ items });
  } catch (err) {
    console.error("Error in GET /wprods/:wholesalerId:", err); // 👈 full error
    return res.status(500).json({ message: "Server error." });
  }
});

app.get("/wprods", async (req, res) => {
  try {
    const items = await WProd.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ items });
  } catch (err) {
    console.error("Error in GET /wprods", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Get user by ID (for fetching wallet balance)
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      accountBalance: user.accountBalance || 0
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
  }
}

startServer();
