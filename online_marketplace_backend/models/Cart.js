import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rprodId: { type: mongoose.Schema.Types.ObjectId, ref: 'RProd', required: true },
  quantity: { type: Number, required: true },
  // You may denormalize some product fields if desired, or just join at query time
  addedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Cart', cartSchema);
