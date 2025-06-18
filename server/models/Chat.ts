import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  spotid: { type: String, required: true },
  message: { type: String, required: true },
  imageUrl: { type: String }, // Optional, for image messages
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
export default Chat;
