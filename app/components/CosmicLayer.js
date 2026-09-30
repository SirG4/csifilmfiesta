'use client';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/*
 * Fixed cosmic backdrop for the sections below the hero.
 * All Math.random() values are seeded AFTER mount so SSR HTML matches
 * client HTML on first render (no hydration warnings).
 */
export default function CosmicLayer() {
  const reduce = useReducedMotion();
  const [stars, setStars] = useState([]);
  const [shooters, setShooters] = useState([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 90 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.6 + 0.4,
        opacity: Math.random() * 0.6 + 0.15,
        twinkle: Math.random() * 3 + 2,
        delay: Math.random() * -5
      }))
    );
    setShooters(
      Array.from({ length: 3 }, (_, i) => ({
        top: 10 + i * 25 + Math.random() * 10,
        delay: i * 6 + Math.random() * 4,
        duration: 2.2
      }))
    );
  }, []);

  return (
    <div className="ff-cosmic" aria-hidden>
      <div className="ff-cosmic-gradient" />
      <div className="ff-cosmic-stars">
        {stars.map((s, i) => (
          <motion.span
            key={i}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size
            }}
            animate={
              reduce
                ? { opacity: s.opacity }
                : { opacity: [s.opacity, s.opacity * 0.3, s.opacity] }
            }
            transition={{
              duration: s.twinkle,
              delay: s.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
      {!reduce && (
        <div className="ff-cosmic-shooters">
          {shooters.map((s, i) => (
            <motion.span
              key={i}
              style={{ top: `${s.top}%` }}
              initial={{ x: '-10vw', opacity: 0 }}
              animate={{ x: '110vw', opacity: [0, 1, 1, 0] }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                repeatDelay: 12 + i * 3,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      )}
      <div className="ff-cosmic-nebula ff-cosmic-nebula-a" />
      <div className="ff-cosmic-nebula ff-cosmic-nebula-b" />
    </div>
  );
}
