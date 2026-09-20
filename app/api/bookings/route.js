import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';

const MOVIE_ID = 'Ford v Ferrari';

// GET: return public seat state for a movie (list of occupied seats + your seat if signed in)
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const movie = searchParams.get('movie') || MOVIE_ID;

  const rows = await Booking.find({ movie }).select('seatNo userId').lean();
  const occupied = rows.map((r) => r.seatNo);

  const session = await getServerSession(authOptions);
  const mySeat =
    session?.user?.id &&
    rows.find((r) => r.userId === session.user.id)?.seatNo;

  return NextResponse.json({
    movie,
    total: occupied.length,
    occupied,
    mySeat: mySeat || null
  });
}

// POST: create a booking for the signed-in user
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const seatNo = (body.seatNo || '').trim();
  const movie = (body.movie || MOVIE_ID).trim();
  if (!seatNo) {
    return NextResponse.json({ error: 'seatNo required' }, { status: 400 });
  }

  await connectDB();

  // Block if this user already has a seat for this movie
  const existing = await Booking.findOne({
    movie,
    userId: session.user.id
  }).lean();
  if (existing) {
    return NextResponse.json(
      {
        error:
          'You have already booked a seat for this movie. Each account can book only 1 seat.'
      },
      { status: 409 }
    );
  }

  // Block if seat is taken
  const seatTaken = await Booking.findOne({ movie, seatNo }).lean();
  if (seatTaken) {
    return NextResponse.json(
      { error: 'That seat was just taken. Please choose another.' },
      { status: 409 }
    );
  }

  try {
    const doc = await Booking.create({
      userId: session.user.id,
      fullName: session.user.name || '',
      email: session.user.email,
      image: session.user.image || '',
      movie,
      seatNo
    });
    return NextResponse.json({ ok: true, id: doc._id.toString(), seatNo });
  } catch (e) {
    // unique index violation
    if (e && e.code === 11000) {
      return NextResponse.json(
        { error: 'Seat already booked (race). Try another seat.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: e.message || 'Failed to book' },
      { status: 500 }
    );
  }
}
