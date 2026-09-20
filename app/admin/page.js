'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.isAdmin) {
      router.replace('/');
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/bookings/admin', { cache: 'no-store' });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setErr(j.error || 'Failed to load bookings');
          return;
        }
        const j = await res.json();
        setRows(j.rows || []);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [session, status, router]);

  const uniqueUsers = new Set(rows.map((r) => r.userId)).size;
  const booked = rows.filter((r) => !!r.seatNo).length;

  return (
    <div className="admin-body" style={{ minHeight: '100vh' }}>
      <nav className="admin-navbar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/film_fiesta_logo.png"
          className="logo"
          alt="Logo"
          onClick={() => router.push('/')}
        />
        <button
          className="login-btn"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </button>
      </nav>

      <div className="admin-container">
        <div className="admin-grid">
          <div className="card">
            <h3>Overview</h3>
            <div className="muted">
              {loading
                ? 'Loading...'
                : err
                ? `Error: ${err}`
                : `Total rows: ${rows.length} | Users: ${uniqueUsers} | Booked seats: ${booked}`}
            </div>
          </div>
          <div className="card">
            <h3>All Bookings</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Movie</th>
                  <th>Seat</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="muted">{r.userId}</td>
                    <td>{r.fullName}</td>
                    <td>{r.email}</td>
                    <td>
                      <span className="badge">{r.movie}</span>
                    </td>
                    <td>{r.seatNo || '-'}</td>
                    <td className="muted">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
