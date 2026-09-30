'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

/*
 * Cinematic ticket card shown after a successful booking.
 * Uses image.png on desktop and hail_mobile.png on the narrow layout.
 * Fully responsive; the "stub" reflows below the main card on mobile.
 */
export default function Ticket({
  name,
  email,
  seat,
  movie,
  date = '21 OCT 2026',
  time = '06:00 PM',
  venue = 'VIT · MUMBAI',
  bookingRef
}) {
  // Booking reference — stable per (email + seat) pair so re-renders don't spin it.
  const ref = useMemo(() => {
    if (bookingRef) return bookingRef;
    const seed = `${email || ''}|${seat || ''}`;
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = (h << 5) - h + seed.charCodeAt(i);
      h |= 0;
    }
    return 'FF-' + Math.abs(h).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  }, [email, seat, bookingRef]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 720px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const poster = isMobile ? '/assets/hail_mobile.png' : '/assets/image.png';

  return (
    <motion.div
      className="ticket"
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ticket-main">
        <div className="ticket-poster">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="Project Hail Mary" />
          <div className="ticket-poster-shade" />
          <div className="ticket-eyebrow">
            <span className="ff-eyebrow-dot" />
            ADMIT ONE
          </div>
        </div>

        <div className="ticket-body">
          <div className="ticket-head">
            <div className="ticket-brand">FILMFIESTA</div>
            <div className="ticket-sub">CSI · Vidyalankar Institute of Technology</div>
          </div>

          <div className="ticket-title-block">
            <div className="ticket-title-eyebrow">SPECIAL SCREENING</div>
            <h2 className="ticket-title">{movie || 'Project Hail Mary'}</h2>
          </div>

          <div className="ticket-grid">
            <TicketField label="NAME" value={name || '—'} />
            <TicketField label="SEAT" value={seat || '—'} big highlight />
            <TicketField label="DATE" value={date} />
            <TicketField label="TIME" value={time} />
            <TicketField label="VENUE" value={venue} />
            <TicketField label="REF" value={ref} />
          </div>

          <div className="ticket-foot">
            <div className="ticket-barcode" aria-hidden>
              {Array.from({ length: 38 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: 1 + (i % 3),
                    background: i % 5 === 0 ? '#f0c86a' : '#f4efe6'
                  }}
                />
              ))}
            </div>
            <div className="ticket-foot-text">
              Please show this ticket at entry. Doors close 5&nbsp;minutes
              before showtime.
            </div>
          </div>
        </div>
      </div>

      {/* stub */}
      <div className="ticket-stub">
        <div className="ticket-stub-perf" aria-hidden />
        <div className="ticket-stub-inner">
          <div className="ticket-stub-label">SEAT</div>
          <div className="ticket-stub-seat">{seat || '—'}</div>
          <div className="ticket-stub-ref">{ref}</div>
          <div className="ticket-stub-date">
            {date} · {time}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TicketField({ label, value, big, highlight }) {
  return (
    <div className={'ticket-field' + (highlight ? ' highlight' : '')}>
      <div className="ticket-field-label">{label}</div>
      <div className={'ticket-field-value' + (big ? ' big' : '')}>
        {value}
      </div>
    </div>
  );
}
