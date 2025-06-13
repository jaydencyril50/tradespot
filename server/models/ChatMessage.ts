import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // allow null for admin
  spotid: { type: String, required: true },
  email: { type: String, required: true },
  text: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }, // Add status
  unread: { type: Boolean, default: true } // Add unread flag
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
