import mongoose from 'mongoose';


const rProdSchema = new mongoose.Schema({
  retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wholesalerProdId: { type: mongoose.Schema.Types.ObjectId, ref: 'WProd', required: true },
  productName: String,
  description: String,
  image: String,
  category: String,
  marketPrice: Number,    // Wholesaler price
  numberOfItems: Number,
  sellingPrice: Number,   // Retailer's chosen price
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('RProd', rProdSchema);
