import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from './mongodb';
import User from '@/models/User';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const email = (credentials?.email || '').toLowerCase().trim();
        const password = credentials?.password || '';
        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email });
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || '',
          image: user.image || '',
          phone: user.phone || ''
        };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    // On Google sign-in, upsert the user in Mongo so we have a stable local id.
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          const email = (user.email || '').toLowerCase();
          if (!email) return false;
          const existing = await User.findOne({ email });
          if (!existing) {
            const created = await User.create({
              email,
              name: user.name || profile?.name || '',
              image: user.image || profile?.picture || '',
              provider: 'google'
            });
            user.id = created._id.toString();
          } else {
            // keep name/image in sync
            existing.name = existing.name || user.name || '';
            existing.image = user.image || existing.image || '';
            if (!existing.provider) existing.provider = 'google';
            await existing.save();
            user.id = existing._id.toString();
          }
        } catch (e) {
          console.error('Google sign-in upsert failed:', e);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, profile }) {
      if (user?.id) token.uid = user.id;
      if (profile?.picture) token.picture = profile.picture;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // prefer our Mongo _id when available, fall back to Google sub
        session.user.id = token.uid || token.sub;
        session.user.image = token.picture || session.user.image;
        session.user.isAdmin =
          !!process.env.ADMIN_EMAIL &&
          session.user.email?.toLowerCase() ===
            process.env.ADMIN_EMAIL.toLowerCase();
      }
      return session;
    }
  }
};
