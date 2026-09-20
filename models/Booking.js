import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    fullName: { type: String, default: '' },
    email: { type: String, required: true },
    image: { type: String, default: '' },
    movie: { type: String, required: true, index: true },
    seatNo: { type: String, required: true }
  },
  { timestamps: true }
);

// One seat per (movie, seatNo) — cannot be double-booked
BookingSchema.index({ movie: 1, seatNo: 1 }, { unique: true });
// One booking per (movie, userId) — each account books only one seat per movie
BookingSchema.index({ movie: 1, userId: 1 }, { unique: true });

export default mongoose.models.Booking ||
  mongoose.model('Booking', BookingSchema);
