'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import AuthModal from './AuthModal';
import { useToast } from './Toast';

/*
 * Minimal landing bar — logo left, Login/Register right.
 * No middle nav links.
 * Auth flow is unchanged (same AuthModal, same signOut).
 */
export default function LandingNavbar({ openAuthKey = 0 }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { show } = useToast();
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (openAuthKey > 0) setAuthOpen(true);
  }, [openAuthKey]);

  const handleAuthClick = async () => {
    if (session?.user) {
      await signOut({ redirect: false });
      show('Signed out successfully', 'success');
      router.refresh();
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <>
      <motion.div
        className="ff-topbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/filmfiesta_logo.png"
          alt="FilmFiesta"
          className="ff-topbar-logo"
          onClick={() => router.push('/')}
        />

        <button className="ff-topbar-login" onClick={handleAuthClick}>
          {status === 'loading' ? (
            <span>...</span>
          ) : session?.user ? (
            <>
              <span className="ff-login-name">
                {session.user.name?.split(' ')[0] || session.user.email}
              </span>
              <span className="ff-login-dot">·</span>
              <span>SIGN OUT</span>
            </>
          ) : (
            <>
              <span>LOGIN</span>
              <span className="ff-login-dot">/</span>
              <span>REGISTER</span>
            </>
          )}
        </button>
      </motion.div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthed={() => router.refresh()}
      />
    </>
  );
}
