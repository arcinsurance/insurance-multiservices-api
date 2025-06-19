import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  displayName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Template', TemplateSchema);
