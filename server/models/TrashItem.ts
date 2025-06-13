import mongoose, { Document, Schema } from 'mongoose';

export interface ITrashItem extends Document {
  content: string;
  createdAt: Date;
}

const TrashItemSchema = new Schema<ITrashItem>({
 content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TrashItem = mongoose.model<ITrashItem>('TrashItem', TrashItemSchema);
export default TrashItem;
