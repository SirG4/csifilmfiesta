'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Ticket from '../components/Ticket';
import { useToast } from '../components/Toast';

const MOVIE_ID = 'Ford v Ferrari';
const NUM_COLS = 17;

// Same layout as the original booking.html:
// Block 1: rows A-I, cols 1-17
// Spacer row
// Block 2/3: rows J-O, cols 1-5 and 13-17
// Spacer row
// Block 4: rows P-R, cols 1-17
function buildLayout() {
  const rows = [];
  const label = (i) => String.fromCharCode(65 + i);

  // Block 1: A-I
  for (let i = 0; i < 9; i++) {
    const row = label(i);
    const cells = [];
    for (let c = 1; c <= NUM_COLS; c++) cells.push({ row, col: c, kind: 'seat' });
    rows.push({ row, cells });
  }
  // Spacer
  rows.push({ row: '_gap1', cells: Array.from({ length: NUM_COLS }, () => ({ kind: 'empty' })) });
  // Block 2/3: J-O
  for (let i = 9; i < 15; i++) {
    const row = label(i);
    const cells = [];
    for (let c = 1; c <= 5; c++) cells.push({ row, col: c, kind: 'seat' });
    for (let g = 0; g < 7; g++) cells.push({ kind: 'empty' });
    for (let c = 13; c <= 17; c++) cells.push({ row, col: c, kind: 'seat' });
    rows.push({ row, cells });
  }
  // Spacer
  rows.push({ row: '_gap2', cells: Array.from({ length: NUM_COLS }, () => ({ kind: 'empty' })) });
  // Block 4: P-R
  for (let i = 15; i < 18; i++) {
    const row = label(i);
    const cells = [];
    for (let c = 1; c <= NUM_COLS; c++) cells.push({ row, col: c, kind: 'seat' });
    rows.push({ row, cells });
  }
  return rows;
}

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { show } = useToast();

  const fullLayout = useMemo(buildLayout, []);

  const [occupied, setOccupied] = useState(new Set());
  const [mySeat, setMySeat] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [authKey, setAuthKey] = useState(0);
  const [backRowsOpen, setBackRowsOpen] = useState(true);

  const loadSeats = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings?movie=${encodeURIComponent(MOVIE_ID)}`, {
        cache: 'no-store'
      });
      const json = await res.json();
      setOccupied(new Set(json.occupied || []));
      setMySeat(json.mySeat || null);
      setBackRowsOpen(!!json.backRowsOpen);
      if (json.mySeat) setSelected(json.mySeat);
    } catch (e) {
      console.warn('Failed to load seats', e);
    }
  }, []);

  const isBackRow = (row) => row && row >= 'J' && row <= 'R';

  // When the admin has NOT opened rows J-R, drop them (and their spacer)
  // from the visible layout entirely — the user only sees A-I.
  const layout = useMemo(() => {
    if (backRowsOpen) return fullLayout;
    return fullLayout.filter((r) => {
      if (r.row === '_gap1' || r.row === '_gap2') return false;
      const first = r.row.charAt(0);
      return first >= 'A' && first <= 'I';
    });
  }, [fullLayout, backRowsOpen]);

  const totalSeats = useMemo(
    () => layout.reduce((n, r) => n + r.cells.filter((c) => c.kind === 'seat').length, 0),
    [layout]
  );

  // Only count occupied seats that fall inside the currently visible block.
  const visibleBooked = useMemo(() => {
    if (backRowsOpen) return occupied.size;
    let n = 0;
    for (const code of occupied) {
      const letter = code.charAt(0);
      if (letter >= 'A' && letter <= 'I') n++;
    }
    return n;
  }, [occupied, backRowsOpen]);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  const onSeatClick = (code) => {
    if (mySeat) return; // already booked, locked
    if (occupied.has(code)) return;
    setSelected(code);
  };

  const onConfirm = async () => {
    if (!selected) {
      show('Please select a seat to continue.', 'error');
      return;
    }
    if (!session?.user) {
      show('Please login first.', 'error');
      setAuthKey((k) => k + 1);
      return;
    }
    if (mySeat) {
      show('You have already booked a seat for this movie.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie: MOVIE_ID, seatNo: selected })
      });
      const json = await res.json();
      if (!res.ok) {
        show(json.error || 'Failed to book', 'error');
        await loadSeats();
        return;
      }
      show('🎉 Booking saved!', 'success');
      show("🏮 We can't keep your reserved seat after 4:00pm", 'info', 10000);
      await loadSeats();
    } catch (e) {
      show('Network error: ' + (e.message || e), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="body-booking" style={{ minHeight: '100vh' }}>
        <Navbar solid scrollAware={false} openAuthKey={authKey} />

        {mySeat && (
          <div className="ticket-wrap">
            <Ticket
              name={session?.user?.name || session?.user?.email || 'Guest'}
              email={session?.user?.email}
              seat={mySeat}
              movie="Project Hail Mary"
            />
          </div>
        )}

        <div className="booking-container">
          {/* movie details */}
          <div className="movie-details">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/image.png"
              alt="Project Hail Mary"
              className="movie-poster"
            />
            <h2 className="movie-title">Project Hail Mary</h2>
            <div className="movie-info booking">
              <div className="info-item">
                <i className="far fa-calendar-alt" />
                <span>21 Oct 2026</span>
              </div>
              <div className="info-item">
                <i className="far fa-clock" />
                <span>2h 22m</span>
              </div>
              <div className="info-item">
                <i className="fas fa-ticket-alt" />
                <span>Sci-Fi, Drama, Adventure</span>
              </div>
            </div>
            <div className="genre-tags booking">
              <span className="genre-tag booking">Sci-Fi</span>
              <span className="genre-tag booking">Adventure</span>
              <span className="genre-tag booking">Drama</span>
            </div>
            <p className="movie-description booking">
              An astronaut wakes millions of miles from Earth with no memory of
              how he got there. His crewmates are dead, the Sun is dying, and
              the survival of humanity rests on a single mission — and an
              unexpected friendship forged across the void.
            </p>
          </div>

          {/* seat selection */}
          <div className="seat-selection">
            <div className="screen-container">
              <div className="screen-label">Screen This Way</div>
              <div className="theatre-screen" />
            </div>

            <div className="seats-container">
              <div className="seat-map">
                {/* column headers */}
                <div className="row-label" />
                {Array.from({ length: NUM_COLS }, (_, i) => (
                  <div key={`col-${i + 1}`} className="row-label">
                    {i + 1}
                  </div>
                ))}
                {/* rows */}
                {layout.map((r) => (
                  <RowFragment
                    key={r.row}
                    r={r}
                    occupied={occupied}
                    mySeat={mySeat}
                    selected={selected}
                    onSeatClick={onSeatClick}
                  />
                ))}
              </div>
            </div>

            <div className="seat-info">
              <div className="seat-info-item">
                <div className="seat-sample available-sample" />
                <span>Available</span>
              </div>
              <div className="seat-info-item">
                <div className="seat-sample selected-sample" />
                <span>Selected</span>
              </div>
              <div className="seat-info-item">
                <div className="seat-sample occupied-sample" />
                <span>Occupied</span>
              </div>
            </div>

            <div className="booking-summary">
              <h3 className="summary-title">Booking Summary</h3>
              <div className="selected-seats">
                {selected ? `Selected: ${selected}` : 'No seats selected'}
              </div>
              <div className="selected-seats">
                Total: {totalSeats} | Booked: {visibleBooked} | Available:{' '}
                {totalSeats - visibleBooked} |{' '}
                {mySeat ? `Your seat: ${mySeat}` : 'Your seat: Not booked yet'}
              </div>
              <button
                className="confirm-btn"
                onClick={onConfirm}
                disabled={submitting || !!mySeat}
              >
                {mySeat
                  ? `Booked: ${mySeat}`
                  : submitting
                  ? 'Saving...'
                  : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

function RowFragment({ r, occupied, mySeat, selected, onSeatClick }) {
  // spacer rows have no visible label; still take a label cell for grid alignment
  const isSpacer = r.row.startsWith('_');
  return (
    <>
      <div className="row-label">{isSpacer ? '' : r.row}</div>
      {r.cells.map((c, idx) => {
        if (c.kind === 'empty') {
          return <div key={`e-${r.row}-${idx}`} className="empty-cell" />;
        }
        const code = `${c.row}${c.col}`;
        const isOccupied = occupied.has(code) && code !== mySeat;
        const isMine = mySeat === code;
        const isSelected = selected === code;
        const cls =
          'seat' +
          (isOccupied ? ' occupied' : '') +
          (isSelected || isMine ? ' selected' : '');
        return (
          <button
            key={code}
            className={cls}
            data-seat={code}
            disabled={isOccupied || (mySeat && !isMine)}
            onClick={() => onSeatClick(code)}
          >
            {c.col}
          </button>
        );
      })}
    </>
  );
}
