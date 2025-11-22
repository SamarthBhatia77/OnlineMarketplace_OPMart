import mongoose from "mongoose";

const WProdSchema = new mongoose.Schema(
  {
    wholesalerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: { type: String, required: true },
    description: { type: String, required: true },
    sellingPrice: { type: Number, required: true },
    numberOfItems: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true }, // image URL (Cloudinary)
  },
  { timestamps: true }
);

const WProd =
  mongoose.models.WProd || mongoose.model("WProd", WProdSchema);

export default WProd;

