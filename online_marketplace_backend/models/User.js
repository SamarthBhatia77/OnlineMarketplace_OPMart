import mongoose from "mongoose";
import bcrypt from "bcrypt";

// 1) Define what a user looks like in the database
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // no two users with same email
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // ✅ Changed to false - Google users don't have password
    },
    role: {
      type: String,
      enum: ["customer", "retailer", "wholesaler"],
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // ✅ New fields for Google OAuth
    authProvider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    googleId: {
      type: String,
      sparse: true, // Allows multiple null values but unique non-null values
      unique: true,
    },
  },
  { timestamps: true }
);

// 2) Before saving user, hash (scramble) the password if it was changed
userSchema.pre("save", async function (next) {
  // ✅ Only hash password if it exists and was modified
  if (!this.password || !this.isModified("password")) {
    return next();
  }

  try {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(this.password, saltRounds);
    this.password = hashed;
    next();
  } catch (err) {
    next(err);
  }
});

// 3) Method to check password during login
userSchema.methods.checkPassword = async function (plainPassword) {
  // ✅ Check if password exists (Google users won't have one)
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(plainPassword, this.password);
};

// 4) Create the model (check if it already exists to avoid re-compilation)
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
