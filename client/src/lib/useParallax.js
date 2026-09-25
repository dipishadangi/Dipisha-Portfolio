import { useEffect, useRef } from 'react';
import { useMotion } from './motion';

/**
 * Drifts an element as the page scrolls. Writes the transform straight to the
 * node inside a rAF rather than going through React state — a scroll handler
 * that re-renders the tree is how a page starts to feel sluggish.
 *
 * `speed` is how far it moves relative to the scroll: 0.2 means a fifth.
 */
export function useParallax(speed = 0.18, { max = 70 } = {}) {
  const ref = useRef(null);
  const motionOn = useMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (!motionOn) {
      node.style.transform = '';
      return undefined;
    }

    let frame = null;

    const update = () => {
      frame = null;
      const { top, height } = node.getBoundingClientRect();
      // How far this element is from the middle of the window, so the drift
      // reads the same wherever it sits on the page.
      const fromCentre = top + height / 2 - window.innerHeight / 2;
      // Clamped, or a shape near the top of a long page drifts hundreds of
      // pixels and escapes the band it is meant to decorate.
      const offset = Math.max(-max, Math.min(max, -fromCentre * speed));
      node.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [speed, max, motionOn]);

  return ref;
}

/** A 0–1 bar of how far down the page you are. */
export function useScrollProgress() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    let frame = null;

    const update = () => {
      frame = null;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      node.style.transform = `scaleX(${progress})`;
      node.style.width = '100%';
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}
