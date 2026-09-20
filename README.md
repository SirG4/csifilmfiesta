# CSI Film Fiesta — Next.js

Migrated from static HTML + Supabase to **Next.js (JavaScript)** with
**MongoDB Atlas** and **NextAuth** supporting both **email/password** and
**Google OAuth**.

The auditorium layout and overall UI are identical to the original
`legacy/booking.html`.

## Stack

- Next.js 15 (App Router, JavaScript — no TypeScript)
- NextAuth.js with **Google** + **Credentials** (email/password) providers
- MongoDB Atlas via Mongoose
- bcryptjs for password hashing

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a MongoDB Atlas cluster and grab the connection string.

3. Create Google OAuth credentials (Google Cloud Console → APIs & Services →
   Credentials → Create OAuth client ID → Web application). Add the redirect
   URI:

   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://YOUR_DOMAIN/api/auth/callback/google` (prod)

4. Copy `.env.local.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.local.example .env.local
   ```

   - `MONGODB_URI` — your Atlas URI, include a database name (e.g. `filmfiesta`)
   - `NEXTAUTH_URL` — `http://localhost:3000` for dev
   - `NEXTAUTH_SECRET` — a long random string (`openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `ADMIN_EMAIL` — the Google account that should see `/admin`

5. Run the dev server:

   ```bash
   npm run dev
   ```

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Home / hero + trailer |
| `/booking` | Seat picker + confirm |
| `/admin` | Admin dashboard (only for `ADMIN_EMAIL`) |
| `/api/auth/*` | NextAuth (Google + Credentials) |
| `/api/auth/signup` | `POST` create email/password account |
| `/api/bookings` | `GET` occupied seats, `POST` create booking |
| `/api/bookings/admin` | `GET` all bookings (admin-only) |

## Data model

Collection: `bookings`

```
{
  userId: String,   // Google account sub
  fullName: String,
  email: String,
  image: String,
  movie: String,    // e.g. "Ford v Ferrari"
  seatNo: String,   // e.g. "H12"
  createdAt: Date,
  updatedAt: Date
}
```

Unique indexes:

- `(movie, seatNo)` — prevents double-booking
- `(movie, userId)` — each account can book only 1 seat per movie

## Legacy

The original static HTML files are preserved under `legacy/` for reference.
They are not served by Next.js.
