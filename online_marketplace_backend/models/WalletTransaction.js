// models/WalletTransaction.js
import mongoose from 'mongoose';
const walletTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('WalletTransaction', walletTransactionSchema);