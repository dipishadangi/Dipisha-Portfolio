import { useEffect, useRef, useState } from 'react';
import { motionIsOn } from './motion';

/**
 * Counts a stat up to its final value the first time it scrolls into view.
 *
 * The values are free text in the admin panel ("6", "1yr", "10+"), so only a
 * leading number is animated and whatever follows is kept as-is. Anything
 * without a leading number is returned untouched.
 */
export function useCountUp(value, { duration = 1100 } = {}) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(() => {
    const match = /^(\d+)(.*)$/.exec(String(value ?? ''));
    return match ? `0${match[2]}` : String(value ?? '');
  });

  useEffect(() => {
    const text = String(value ?? '');
    const match = /^(\d+)(.*)$/.exec(text);

    if (!match) {
      setDisplay(text);
      return undefined;
    }

    const target = Number(match[1]);
    const suffix = match[2];
    const node = ref.current;

    if (!node || !motionIsOn() || typeof IntersectionObserver === 'undefined') {
      setDisplay(text);
      return undefined;
    }

    let frame = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          // Ease out, so it sprints then settles on the number.
          const eased = 1 - (1 - progress) ** 3;
          setDisplay(`${Math.round(target * eased)}${suffix}`);
          if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return [ref, display];
}
