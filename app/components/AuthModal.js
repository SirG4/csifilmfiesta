'use client';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useToast } from './Toast';

export default function AuthModal({ open, onClose, defaultTab = 'signin', onAuthed }) {
  const [tab, setTab] = useState(defaultTab);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [busy, setBusy] = useState(false);
  const { show } = useToast();

  // signin fields
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  // signup fields
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suPassword, setSuPassword] = useState('');

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setMsg({ text: '', type: '' });
    }
  }, [open, defaultTab]);

  if (!open) return null;

  const clearAll = () => {
    setSiEmail(''); setSiPassword('');
    setSuName(''); setSuEmail(''); setSuPhone(''); setSuPassword('');
    setMsg({ text: '', type: '' });
  };

  const close = () => { clearAll(); onClose?.(); };

  const submitSignIn = async () => {
    setMsg({ text: '', type: '' });
    if (!siEmail || !siPassword) {
      setMsg({ text: 'Please enter both email and password', type: 'error' });
      return;
    }
    setBusy(true);
    try {
      const res = await signIn('credentials', {
        email: siEmail.trim(),
        password: siPassword,
        redirect: false
      });
      if (!res || res.error) {
        setMsg({ text: res?.error || 'Invalid email or password', type: 'error' });
        return;
      }
      show('Welcome back!', 'success');
      close();
      onAuthed?.();
    } finally {
      setBusy(false);
    }
  };

  const submitSignUp = async () => {
    setMsg({ text: '', type: '' });
    if (!suName || !suEmail || !suPhone || !suPassword) {
      setMsg({ text: 'Please fill in all fields', type: 'error' });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: suName.trim(),
          email: suEmail.trim(),
          phone: suPhone.trim(),
          password: suPassword
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ text: json.error || 'Failed to create account', type: 'error' });
        return;
      }
      // auto sign-in after signup
      const sign = await signIn('credentials', {
        email: suEmail.trim(),
        password: suPassword,
        redirect: false
      });
      if (!sign || sign.error) {
        setMsg({
          text: 'Account created. Please sign in.',
          type: 'success'
        });
        setTab('signin');
        return;
      }
      show('Account created successfully!', 'success');
      close();
      onAuthed?.();
    } finally {
      setBusy(false);
    }
  };

  const submitGoogle = async () => {
    await signIn('google', { callbackUrl: window.location.pathname });
  };

  return (
    <div
      className="auth-modal-backdrop show"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="auth-modal">
        <div className="auth-tabs">
          <button
            className={'auth-tab' + (tab === 'signin' ? ' active' : '')}
            onClick={() => { setTab('signin'); setMsg({ text: '', type: '' }); }}
          >
            Sign In
          </button>
          <button
            className={'auth-tab' + (tab === 'signup' ? ' active' : '')}
            onClick={() => { setTab('signup'); setMsg({ text: '', type: '' }); }}
          >
            Sign Up
          </button>
        </div>

        <div className="auth-body">
          {tab === 'signin' ? (
            <div className="auth-form active">
              <div className="auth-field">
                <label>
                  <i className="fas fa-envelope" style={{ marginRight: 4 }} />
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@gmail.com"
                  value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label>
                  <i className="fas fa-lock" style={{ marginRight: 4 }} />
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={siPassword}
                  onChange={(e) => setSiPassword(e.target.value)}
                />
              </div>
              {msg.text ? (
                <div className={`auth-message ${msg.type} show`}>{msg.text}</div>
              ) : null}
              <div className="auth-actions">
                <button
                  className="auth-primary"
                  disabled={busy}
                  onClick={submitSignIn}
                >
                  {busy ? 'Signing in...' : 'Sign In'}
                </button>
                <div className="auth-divider">or</div>
                <button
                  className="auth-google"
                  disabled={busy}
                  onClick={submitGoogle}
                >
                  <i className="fab fa-google" />
                  <span>Continue with Google</span>
                </button>
                <button className="auth-secondary" onClick={close}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-form active">
              <div className="auth-field">
                <label>
                  <i className="fas fa-user" style={{ marginRight: 4 }} />
                  Full Name
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Raju Rastogi"
                  value={suName}
                  onChange={(e) => setSuName(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label>
                  <i className="fas fa-envelope" style={{ marginRight: 4 }} />
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@gmail.com"
                  value={suEmail}
                  onChange={(e) => setSuEmail(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label>
                  <i className="fas fa-phone" style={{ marginRight: 4 }} />
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={suPhone}
                  onChange={(e) => setSuPhone(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label>
                  <i className="fas fa-lock" style={{ marginRight: 4 }} />
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={suPassword}
                  onChange={(e) => setSuPassword(e.target.value)}
                />
              </div>
              {msg.text ? (
                <div className={`auth-message ${msg.type} show`}>{msg.text}</div>
              ) : null}
              <div className="auth-actions">
                <button
                  className="auth-primary"
                  disabled={busy}
                  onClick={submitSignUp}
                >
                  {busy ? 'Creating account...' : 'Create Account'}
                </button>
                <div className="auth-divider">or</div>
                <button
                  className="auth-google"
                  disabled={busy}
                  onClick={submitGoogle}
                >
                  <i className="fab fa-google" />
                  <span>Continue with Google</span>
                </button>
                <button className="auth-secondary" onClick={close}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
