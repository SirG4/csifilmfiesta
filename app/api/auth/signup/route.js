import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = (body.name || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!name || !email || !phone || !password) {
    return NextResponse.json(
      { error: 'Please fill in all fields' },
      { status: 400 }
    );
  }
  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
    return NextResponse.json(
      { error: 'Please use a valid Gmail address' },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters' },
      { status: 400 }
    );
  }
  if (!/^[+]?\d{8,15}$/.test(phone)) {
    return NextResponse.json(
      { error: 'Please enter a valid phone number' },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing && existing.passwordHash) {
    return NextResponse.json(
      { error: 'An account with this email already exists' },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    // Google-only account exists — add a password to it
    existing.passwordHash = passwordHash;
    existing.name = existing.name || name;
    existing.phone = existing.phone || phone;
    await existing.save();
    return NextResponse.json({ ok: true });
  }

  await User.create({
    email,
    name,
    phone,
    passwordHash,
    provider: 'credentials'
  });
  return NextResponse.json({ ok: true });
}
