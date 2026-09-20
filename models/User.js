import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    image: { type: String, default: '' },
    // present when the account was created with email/password.
    // absent for Google-only accounts.
    passwordHash: { type: String, default: '' },
    // 'credentials' | 'google'
    provider: { type: String, default: 'credentials' }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
