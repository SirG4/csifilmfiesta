'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useToast } from './Toast';
import AuthModal from './AuthModal';

export default function Navbar({ solid = false, scrollAware = true, openAuthKey = 0 }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { show } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!scrollAware) return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollAware]);

  // parent can force-open the modal by bumping openAuthKey
  useEffect(() => {
    if (openAuthKey > 0) setAuthOpen(true);
  }, [openAuthKey]);

  const cls =
    'navbar' +
    (solid ? ' solid' : '') +
    (scrollAware && scrolled ? ' scrolled' : '');

  const handleAuthClick = async () => {
    if (session?.user) {
      await signOut({ redirect: false });
      show('Signed out successfully', 'success');
      router.push('/');
      router.refresh();
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <>
      <nav className={cls}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/film_fiesta_logo.png"
          alt="Film Fiesta Logo"
          className="logo"
          onClick={() => router.push('/')}
        />
        <button className="login-btn" onClick={handleAuthClick}>
          {status === 'loading' ? (
            <span>...</span>
          ) : session?.user ? (
            <>
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" />
              ) : null}
              <span>{session.user.name || session.user.email}</span>
              <span style={{ opacity: 0.8 }}>· Sign out</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>
      </nav>
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthed={() => router.refresh()}
      />
    </>
  );
}
