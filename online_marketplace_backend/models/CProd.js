import mongoose from 'mongoose';

const cprodSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true }, // rprodId or main prod ref
  productName: String,
  description: String,
  image: String,
  category: String,
  quantity: Number,
  pricePerItem: Number,
  totalPrice: Number,
  review: { type: Number, default: 0 }, // 1 to 5 only
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CProd', cprodSchema);
