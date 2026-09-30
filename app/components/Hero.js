'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/*
 * Cinematic hero for FilmFiesta — Project Hail Mary special screening.
 * The <button className="book-btn"> receives its click handler from the
 * parent (existing onBook flow — preserves the auth check + /booking route).
 */
export default function Hero({ onBook }) {
  const reduce = useReducedMotion();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    if (reduce) return;
    if (typeof window === 'undefined') return;
    // desktop only
    if (window.matchMedia('(max-width: 900px)').matches) return;

    const onMove = (e) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nx = (e.clientX / w - 0.5) * 2; // -1 .. 1
      const ny = (e.clientY / h - 0.5) * 2;
      setMouse({ x: nx * 8, y: ny * 5 });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduce]);

  const ease = [0.22, 1, 0.36, 1];

  const bgAnim = reduce
    ? { scale: 1 }
    : {
        scale: [1, 1.04, 1],
        transition: { duration: 24, ease: 'easeInOut', repeat: Infinity }
      };

  return (
    <section className="ff-hero" ref={heroRef}>
      {/* background artwork layer — image is set via CSS so a media query
          can swap in hail_mobile.png on narrow viewports */}
      <motion.div
        className="ff-hero-bg"
        style={{ x: mouse.x, y: mouse.y }}
        animate={bgAnim}
      />
      {/* gradient overlays for text contrast */}
      <div className="ff-hero-grad ff-hero-grad-left" />
      <div className="ff-hero-grad ff-hero-grad-bottom" />
      <div className="ff-hero-vignette" />
      <div className="ff-hero-grain" />

      {/* subtle floating particles (sparse, GPU friendly) */}
      {!reduce && <Particles count={18} />}

      <div className="ff-hero-content">
        <motion.div
          className="ff-eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease }}
        >
          <span className="ff-eyebrow-dot" />
          SPECIAL SCREENING
        </motion.div>

        <h1 className="ff-title">
          <motion.span
            className="ff-title-line"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease }}
          >
            PROJECT
          </motion.span>
          <motion.span
            className="ff-title-line ff-title-line-2"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, duration: 1.0, ease }}
          >
            HAIL MARY
          </motion.span>
        </h1>

        <motion.p
          className="ff-tagline"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.9, ease }}
        >
          A cinematic journey beyond the stars.
        </motion.p>

        <motion.div
          className="ff-meta"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9, ease }}
        >
          <div className="ff-meta-item">
            <div className="ff-meta-label">DATE</div>
            <div className="ff-meta-value">21 OCT 2026</div>
          </div>
          <div className="ff-meta-sep" />
          <div className="ff-meta-item">
            <div className="ff-meta-label">VENUE</div>
            <div className="ff-meta-value">VIT CAMPUS</div>
          </div>
          <div className="ff-meta-sep" />
          <div className="ff-meta-item">
            <div className="ff-meta-label">TIME</div>
            <div className="ff-meta-value">06:00 PM</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.9, ease }}
        >
          <motion.button
            className="ff-cta book-btn"
            onClick={onBook}
            whileHover={reduce ? {} : { scale: 1.03 }}
            whileTap={reduce ? {} : { scale: 0.97 }}
          >
            <span>BOOK TICKETS</span>
            <motion.span
              className="ff-cta-arrow"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.25, ease }}
              aria-hidden
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>

        <motion.div
          className="ff-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1.2 }}
          aria-hidden
        >
          <span>SCROLL</span>
          <span className="ff-scroll-line" />
        </motion.div>
      </div>
    </section>
  );
}

function Particles({ count = 16 }) {
  // Seed AFTER mount so SSR/CSR match (avoids hydration mismatch on
  // Math.random values). Server renders an empty container; the client
  // fills it on the first effect tick.
  const [items, setItems] = useState([]);
  useEffect(() => {
    setItems(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2.2 + 0.6,
        dur: Math.random() * 8 + 10,
        delay: Math.random() * -8,
        travel: Math.random() * 40 + 20,
        opacity: Math.random() * 0.35 + 0.1
      }))
    );
  }, [count]);

  return (
    <div className="ff-particles" aria-hidden>
      {items.map((p, i) => (
        <motion.span
          key={i}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity
          }}
          animate={{ y: [-p.travel / 2, p.travel / 2, -p.travel / 2] }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}
