import mongoose from 'mongoose';

const depositSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  credited: { type: Boolean, default: false },
  txid: { type: String },
  expiresAt: { type: Date, required: true },
});

const DepositSession = mongoose.model('DepositSession', depositSessionSchema);
export default DepositSession;
