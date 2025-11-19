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
      required: true, // for now, we’ll require it (Google users later can skip)
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
    location: {
    lat: { type: Number },
    lng: { type: Number },
    },
    address: {
    type: String,
    trim: true,
    },
    city: String,
    state: String,
    pincode: String,
  },
  { timestamps: true }
);

// 2) Before saving user, hash (scramble) the password if it was changed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
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
  return bcrypt.compare(plainPassword, this.password);
};

// 4) Create the model
const User = mongoose.model("User", userSchema);

export default User;
