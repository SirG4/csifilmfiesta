import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin ? session : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
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

// DELETE: wipe all bookings (admin only, requires ?confirm=YES to fire).
// Pass ?movie=... to scope the wipe; without it every booking goes.
export async function DELETE(req) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  if (searchParams.get('confirm') !== 'YES') {
    return NextResponse.json(
      { error: 'Missing confirmation. Send ?confirm=YES.' },
      { status: 400 }
    );
  }
  const movie = searchParams.get('movie');
  const filter = movie ? { movie } : {};
  await connectDB();
  const result = await Booking.deleteMany(filter);
  return NextResponse.json({
    ok: true,
    deleted: result.deletedCount || 0,
    scope: movie || 'all'
  });
}
