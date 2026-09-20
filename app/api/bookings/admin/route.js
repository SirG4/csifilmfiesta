import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const rows = await Booking.find({})
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({
    rows: rows.map((r) => ({
      id: r._id.toString(),
      userId: r.userId,
      fullName: r.fullName,
      email: r.email,
      movie: r.movie,
      seatNo: r.seatNo,
      createdAt: r.createdAt
    }))
  });
}
