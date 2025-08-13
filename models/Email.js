// models/Email.js
import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  werbung: { type: String, enum: ['ja', 'nein'], default: 'nein' },
  code: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Falls das Modell schon existiert, wiederverwenden (wegen Hot-Reload in Next.js)
export default mongoose.models.Email || mongoose.model('Email', EmailSchema, 'e-mails');
