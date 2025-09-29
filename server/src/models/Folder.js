import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Folder', folderSchema);





