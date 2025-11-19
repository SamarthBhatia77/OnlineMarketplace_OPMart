import express from "express";
import mongoose from "mongoose";
import { MONGODB_URI } from "./config.js";
import User from "./models/User.js";
import cors from "cors";
import Otp from "./models/Otp.js";
import { sendOtpEmail } from "./email.js";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = "1028953534432-aarvrfrl3h69e16saed41s9qod8q69vc.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

const PORT = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB Atlas and start server
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Root test route
    app.get("/", (req, res) => {
      res.send("Backend is working and connected to MongoDB!");
    });

    // REAL SIGNUP ROUTE (no OTP yet)
    app.post("/auth/signup", async (req, res) => {
  try {
    const { fullName,
      email,
      password,
      role,
      address,
      city,
      state,
      pincode,
      location } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const allowedRoles = ["customer", "retailer", "wholesaler"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    // 1) Create user with isEmailVerified: false
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

    // 2) Generate OTP (6 digits)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3) Save OTP for this email, valid for 10 minutes
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await Otp.create({
      email: email.toLowerCase(),
      code: otpCode,
      expiresAt: expires,
    });

    // 4) Send email
    await sendOtpEmail(email, otpCode);

    // 5) Respond with success but do NOT log user in yet
    return res.status(201).json({
      message: "User registered. OTP sent to email.",
      email: email.toLowerCase(),
    });
  } catch (err) {
    console.error("Error in /auth/signup:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});


app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // 2) Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // do not reveal which part is wrong
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 3) Check password
    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 4) (Optional) check email verification later when OTP is added
     if (!user.isEmailVerified) {
       return res.status(403).json({ message: "Please verify your email first." });
    }

    // 5) For now, just return success + basic user info
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

app.post("/auth/google", async (req, res) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required." });
    }

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const fullName = payload.name || payload.given_name || "Google User";

    if (!email) {
      return res.status(400).json({ message: "Google account has no email." });
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // if role not provided (user came directly to signin) default to "customer"
      const finalRole = role && ["customer", "retailer", "wholesaler"].includes(role)
        ? role
        : "customer";

      user = new User({
        fullName,
        email,
        password: "google-auth-no-password",
        role: finalRole,
        isEmailVerified: true, // Google already verified email
      });
      await user.save();
    }

    // Optional: block if normal account exists but not verified (your call)
    // if (!user.isEmailVerified) { ... }

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
    return res.status(500).json({ message: "Google login failed." });
  }
});

app.post("/auth/verify_otp", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and OTP code are required." });
    }

    const normalizedEmail = email.toLowerCase();

    // 1) Find latest OTP for this email
    const otpEntry = await Otp.findOne({
      email: normalizedEmail,
      code,
      used: false,
      expiresAt: { $gt: new Date() }, // not expired
    }).sort({ createdAt: -1 });

    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // 2) Mark OTP as used
    otpEntry.used = true;
    await otpEntry.save();

    // 3) Mark user as verified
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

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
  }
}

startServer();
