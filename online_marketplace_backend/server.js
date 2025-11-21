import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { MONGODB_URI } from "./config.js";
import User from "./models/User.js";
import cors from "cors";
import Otp from "./models/Otp.js";
import WProd from "./models/WProd.js";

console.log("Cloudinary ENV check:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);


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


    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
  }
}

startServer();
