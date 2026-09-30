import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongodb';
import Settings from '@/models/Settings';

const MOVIE_ID = 'Ford v Ferrari';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

// GET: current settings (admin only)
export async function GET(req) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const { searchParams } = new URL(req.url);
  const movie = searchParams.get('movie') || MOVIE_ID;

  const s = await Settings.findOne({ movie }).lean();
  return NextResponse.json({
    movie,
    backRowsOpen: !!s?.backRowsOpen
  });
}

// PATCH: update settings (admin only)
export async function PATCH(req) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const movie = (body.movie || MOVIE_ID).trim();
  const backRowsOpen = !!body.backRowsOpen;

  await connectDB();
  const doc = await Settings.findOneAndUpdate(
    { movie },
    { $set: { backRowsOpen } },
    { new: true, upsert: true }
  ).lean();

  return NextResponse.json({
    movie: doc.movie,
    backRowsOpen: doc.backRowsOpen
  });
}
