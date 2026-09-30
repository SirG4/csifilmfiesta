'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const MOVIE_ID = 'Ford v Ferrari';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [backRowsOpen, setBackRowsOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState('');
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.isAdmin) {
      router.replace('/');
      return;
    }
    (async () => {
      try {
        const [b, s] = await Promise.all([
          fetch('/api/bookings/admin', { cache: 'no-store' }),
          fetch(`/api/admin/settings?movie=${encodeURIComponent(MOVIE_ID)}`, {
            cache: 'no-store'
          })
        ]);
        if (!b.ok) {
          const j = await b.json().catch(() => ({}));
          setErr(j.error || 'Failed to load bookings');
        } else {
          const j = await b.json();
          setRows(j.rows || []);
        }
        if (s.ok) {
          const j = await s.json();
          setBackRowsOpen(!!j.backRowsOpen);
        }
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [session, status, router]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const wipeBookings = async () => {
    setWiping(true);
    try {
      const res = await fetch(
        `/api/bookings/admin?confirm=YES&movie=${encodeURIComponent(MOVIE_ID)}`,
        { method: 'DELETE' }
      );
      const j = await res.json();
      if (!res.ok) {
        flash(j.error || 'Failed to reset bookings');
        return;
      }
      setRows([]);
      flash(`Reset complete — ${j.deleted} booking(s) removed`);
    } catch (e) {
      flash(e.message || 'Network error');
    } finally {
      setWiping(false);
      setConfirmWipe(false);
    }
  };

  const toggleBackRows = async () => {
    setToggling(true);
    try {
      const next = !backRowsOpen;
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie: MOVIE_ID, backRowsOpen: next })
      });
      const j = await res.json();
      if (!res.ok) {
        flash(j.error || 'Failed to update');
        return;
      }
      setBackRowsOpen(!!j.backRowsOpen);
      flash(j.backRowsOpen ? 'Rows J–R opened' : 'Rows J–R locked');
    } finally {
      setToggling(false);
    }
  };

  const uniqueUsers = new Set(rows.map((r) => r.userId)).size;
  const booked = rows.filter((r) => !!r.seatNo).length;
  const bookedFront = rows.filter(
    (r) => r.seatNo && r.seatNo[0] >= 'A' && r.seatNo[0] <= 'I'
  ).length;
  const bookedBack = rows.filter(
    (r) => r.seatNo && r.seatNo[0] >= 'J' && r.seatNo[0] <= 'R'
  ).length;

  return (
    <div className="admin-body" style={{ minHeight: '100vh' }}>
      <nav className="admin-navbar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/filmfiesta_logo.png"
          className="logo"
          alt="FilmFiesta"
          onClick={() => router.push('/')}
        />
        <button
          className="login-btn"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </button>
      </nav>

      {toast && <div className="admin-toast">{toast}</div>}

      {confirmWipe && (
        <div
          className="confirm-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmWipe(false);
          }}
        >
          <div className="confirm-dialog">
            <div className="confirm-icon">
              <i className="fas fa-exclamation-triangle" />
            </div>
            <h3>Reset all bookings?</h3>
            <p>
              This permanently deletes <strong>{rows.length}</strong> booking
              {rows.length === 1 ? '' : 's'} for Project Hail Mary. Every seat
              will open up again.
            </p>
            <p className="confirm-warn">This cannot be undone.</p>
            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={() => setConfirmWipe(false)}
                disabled={wiping}
              >
                Cancel
              </button>
              <button
                className="confirm-danger"
                onClick={wipeBookings}
                disabled={wiping}
              >
                {wiping ? 'Resetting…' : 'Yes, reset all'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-container">
        <div className="admin-grid">
          <div className="admin-side">
            <div className="card">
              <h3>Overview</h3>
              <div className="muted">
                {loading
                  ? 'Loading...'
                  : err
                  ? `Error: ${err}`
                  : `Total rows: ${rows.length} | Users: ${uniqueUsers} | Booked seats: ${booked}`}
              </div>
              {!loading && !err && (
                <div className="admin-counts">
                  <div>
                    <span className="muted">Front (A–I)</span>
                    <strong>{bookedFront}</strong>
                  </div>
                  <div>
                    <span className="muted">Back (J–R)</span>
                    <strong>{bookedBack}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="card danger-card">
              <h3 className="danger-title">Danger Zone</h3>
              <p className="muted" style={{ marginBottom: 14 }}>
                Wipe every booking for <strong>Project Hail Mary</strong>.
                Every seat becomes available again. This cannot be undone —
                use it only for testing.
              </p>
              <button
                className="danger-btn"
                onClick={() => setConfirmWipe(true)}
                disabled={wiping || rows.length === 0}
              >
                <i className="fas fa-trash-alt" style={{ marginRight: 8 }} />
                {rows.length === 0
                  ? 'No bookings to reset'
                  : `Reset bookings (${rows.length})`}
              </button>
            </div>

            <div className="card">
              <h3>Seat Release</h3>
              <p className="muted" style={{ marginBottom: 14 }}>
                Toggle whether back rows (J–R) are open for booking. When
                locked, users can only pick seats in the front rows (A–I).
              </p>
              <div className="toggle-row">
                <div>
                  <div style={{ fontWeight: 600 }}>Rows J–R</div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    Currently:{' '}
                    <span
                      style={{
                        color: backRowsOpen ? '#4ade80' : '#f0c86a',
                        fontWeight: 700
                      }}
                    >
                      {backRowsOpen ? 'OPEN' : 'LOCKED'}
                    </span>
                  </div>
                </div>
                <button
                  className={
                    'toggle-switch' + (backRowsOpen ? ' on' : '')
                  }
                  onClick={toggleBackRows}
                  disabled={toggling}
                  aria-label="Toggle back rows"
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>All Bookings</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Movie</th>
                  <th>Seat</th>
                  <th>Block</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const letter = r.seatNo ? r.seatNo[0] : '';
                  const block =
                    letter >= 'A' && letter <= 'I'
                      ? 'Front'
                      : letter >= 'J' && letter <= 'R'
                      ? 'Back'
                      : '';
                  return (
                    <tr key={r.id}>
                      <td>{r.fullName}</td>
                      <td>{r.email}</td>
                      <td>
                        <span className="badge">{r.movie}</span>
                      </td>
                      <td>{r.seatNo || '-'}</td>
                      <td>
                        <span
                          className={
                            'badge ' + (block === 'Back' ? 'badge-back' : 'badge-front')
                          }
                        >
                          {block || '-'}
                        </span>
                      </td>
                      <td className="muted">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
