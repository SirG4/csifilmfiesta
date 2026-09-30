'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import LandingNavbar from './components/LandingNavbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import { useToast } from './components/Toast';
import CosmicLayer from './components/CosmicLayer';

/*
 * If the trailer changes, just update this ID.
 * Take the YouTube URL: https://youtu.be/<THIS-PART>
 */
const TRAILER_ID = 'm08TxIsFTRI';
const TRAILER_THUMB = '/assets/trailer-thumb.png';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { show } = useToast();
  const [authKey, setAuthKey] = useState(0);
  const [playing, setPlaying] = useState(false);

  // PRESERVED business logic — same auth gate + /booking route as before.
  const onBook = () => {
    if (!session?.user) {
      show('Please sign in to book tickets', 'error');
      setAuthKey((k) => k + 1);
      return;
    }
    router.push('/booking');
  };

  const ease = [0.22, 1, 0.36, 1];

  return (
    <main className="ff-landing">
      <LandingNavbar openAuthKey={authKey} />
      <Hero onBook={onBook} />

      {/* Cosmic backdrop covering everything below the hero */}
      <CosmicLayer />

      {/* === Screening details === */}
      <section id="screening" className="ff-section ff-screening">
        {/* corner HUD marks */}
        <span className="ff-hud ff-hud-tl">
          <span>SECTOR 07</span>
          <span className="ff-hud-line" />
        </span>
        <span className="ff-hud ff-hud-tr">
          <span className="ff-hud-line" />
          <span>N 19°02&apos; · E 72°51&apos;</span>
        </span>

        <div className="ff-section-inner">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease }}
          >
            <div className="ff-eyebrow ff-eyebrow-dark">
              <span className="ff-eyebrow-dot" />
              THE SCREENING
            </div>
            <h2 className="ff-h2">A single night. One shared silence.</h2>
            <p className="ff-lead">
              Grace, gravity, and a lone astronaut carrying the weight of a
              dying sun. FilmFiesta presents a cinematic evening built around
              curiosity, isolation, and discovery — projected on the biggest
              screen VIT has to offer.
            </p>
          </motion.div>

          <motion.div
            className="ff-screening-grid"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease, delay: 0.15 }}
          >
            <div className="ff-card">
              <span className="ff-card-glyph" aria-hidden>
                ✦
              </span>
              <div className="ff-card-num">01</div>
              <h3>Cinematic Sound</h3>
              <p>
                Curated soundstage delivering every whisper of the void, from
                the hum of the ship to the crackle of stardust.
              </p>
            </div>
            <div className="ff-card">
              <span className="ff-card-glyph" aria-hidden>
                ◉
              </span>
              <div className="ff-card-num">02</div>
              <h3>Premium Seating</h3>
              <p>
                Reserve a specific seat inside the auditorium — one seat per
                Gmail account, so plan your row with your crew.
              </p>
            </div>
            <div className="ff-card">
              <span className="ff-card-glyph" aria-hidden>
                ✧
              </span>
              <div className="ff-card-num">03</div>
              <h3>Zero Interruptions</h3>
              <p>
                Doors close at 05:55 PM sharp. Once we&apos;re in orbit, no one
                gets back on board.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === Trailer === */}
      <section id="about" className="ff-section ff-trailer">
        {/* drifting planet silhouette */}
        <motion.span
          className="ff-planet"
          aria-hidden
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 2, ease }}
        />
        <span className="ff-orbit-arc" aria-hidden />

        <div className="ff-section-inner ff-trailer-inner">
          <motion.div
            className="ff-trailer-text"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease }}
          >
            <div className="ff-eyebrow ff-eyebrow-dark">
              <span className="ff-eyebrow-dot" />
              GLIMPSE
            </div>
            <h2 className="ff-h2">A first look before liftoff.</h2>
            <p className="ff-lead">
              No trailer can prepare you for the theatre. But this is a start.
            </p>
            <div className="ff-transmission">
              <span className="ff-transmission-dot" />
              INCOMING TRANSMISSION · CH 07
            </div>
          </motion.div>

          <motion.div
            className="ff-trailer-video"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease }}
          >
            <span className="ff-frame-corner ff-fc-tl" aria-hidden />
            <span className="ff-frame-corner ff-fc-tr" aria-hidden />
            <span className="ff-frame-corner ff-fc-bl" aria-hidden />
            <span className="ff-frame-corner ff-fc-br" aria-hidden />
            <div className="ff-video-wrapper">
              {playing ? (
                <iframe
                  src={`https://www.youtube.com/embed/${TRAILER_ID}?autoplay=1`}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Project Hail Mary trailer"
                />
              ) : (
                <button
                  className="ff-video-thumb"
                  onClick={() => setPlaying(true)}
                  aria-label="Play trailer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={TRAILER_THUMB}
                    alt="Project Hail Mary — Official Teaser"
                  />
                  <span className="ff-video-play">
                    <span className="ff-play-triangle" />
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* === Closing CTA === */}
      <section id="contact" className="ff-section ff-closing">
        <motion.div
          className="ff-orbit"
          aria-hidden
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.8, ease }}
        >
          <span className="ff-orbit-dot" />
          <span className="ff-orbit-ring" />
          <span className="ff-orbit-ring ff-orbit-ring-2" />
          <span className="ff-orbit-ring ff-orbit-ring-3" />
        </motion.div>

        <div className="ff-section-inner ff-closing-inner">
          <motion.div
            className="ff-eyebrow ff-eyebrow-dark ff-closing-eyebrow"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease }}
          >
            <span className="ff-eyebrow-dot" />
            FINAL BOARDING CALL
          </motion.div>
          <motion.h2
            className="ff-closing-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease }}
          >
            Your seat is somewhere out there.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease, delay: 0.15 }}
            className="ff-closing-sub"
          >
            Pick it before someone else does.
          </motion.p>
          <motion.button
            className="ff-cta ff-cta-lg book-btn"
            onClick={onBook}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease, delay: 0.25 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>BOOK TICKETS</span>
            <motion.span className="ff-cta-arrow" whileHover={{ x: 5 }}>
              →
            </motion.span>
          </motion.button>

          <div className="ff-coord">
            <span>21.10.2026</span>
            <span className="ff-coord-dot">·</span>
            <span>18:00 IST</span>
            <span className="ff-coord-dot">·</span>
            <span>VIT · MUMBAI</span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
