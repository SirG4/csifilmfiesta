'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useToast } from './components/Toast';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { show } = useToast();
  const [playing, setPlaying] = useState(false);
  const [authKey, setAuthKey] = useState(0);

  const onBook = () => {
    if (!session?.user) {
      show('Please sign in to book tickets', 'error');
      setAuthKey((k) => k + 1);
      return;
    }
    router.push('/booking');
  };

  return (
    <>
      <Navbar openAuthKey={authKey} />

      <section className="hero">
        <div className="hero-content">
          <div className="movie-info">
            <div className="genre-tags">
              <span className="genre-tag">Action</span>
              <span className="genre-tag">Adventure</span>
              <span className="genre-tag">Drama</span>
            </div>
            <div className="info-item">
              <i className="far fa-calendar-alt" />
              <span>2019</span>
            </div>
            <div className="info-item">
              <i className="far fa-clock" />
              <span>2h 32m</span>
            </div>
          </div>
          <p className="movie-description">
            American car designer Carroll Shelby and driver Ken Miles battle
            corporate interference and the laws of physics to build a
            revolutionary race car for Ford in order to defeat Ferrari at the 24
            Hours of Le Mans in 1966.
          </p>
          <button className="book-btn" onClick={onBook}>
            Book Tickets
            <i className="fas fa-arrow-right" />
          </button>
        </div>
      </section>

      <section className="trailer-section">
        <div className="container">
          <h2 className="section-title">Official Trailer</h2>
          <div className="video-container">
            <div className="video-wrapper">
              {playing ? (
                <iframe
                  src="https://www.youtube.com/embed/liNt0DBUgQ8?autoplay=1"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <div className="video-thumbnail" onClick={() => setPlaying(true)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://i.ytimg.com/vi/liNt0DBUgQ8/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLCyf2iVCb25SD7eD4cEumJiqLH-5w"
                    alt="Ford v Ferrari Trailer"
                  />
                  <div className="play-button">
                    <i className="fas fa-play" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="trailer-caption">
            Watch the official trailer for &quot;Ford v Ferrari&quot; and
            experience the thrilling journey of innovation, rivalry, and speed
            that defined an era in motorsport history.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
