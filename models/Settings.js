import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    movie: { type: String, required: true, unique: true },
    // When false, only rows A-I are bookable.
    // When admin flips it to true, rows J-R open up.
    backRowsOpen: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Settings ||
  mongoose.model('Settings', SettingsSchema);
