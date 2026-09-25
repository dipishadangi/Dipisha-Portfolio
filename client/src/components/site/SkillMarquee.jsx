import { useLayoutEffect, useRef, useState } from 'react';
import { Burst } from '../art/Illustrations';
import { useMotion } from '../../lib/motion';

/** How fast the band travels, in pixels per second. */
const SPEED = 62;

/**
 * The scrolling band of skills.
 *
 * Two things make it hold up as Dipisha adds and removes skills:
 *
 *  - The items inside each half are repeated until that half is at least as
 *    wide as the band, so a short list can never leave a gap mid-loop.
 *  - The duration is worked out from the measured width, so the band always
 *    travels at the same speed whether there are four skills or forty. A fixed
 *    duration would crawl with a long list and whip past with a short one.
 *
 * The loop itself is a translate of exactly -50% across two identical halves,
 * which lands on the start of the second half — so it repeats with no jump.
 */
export function SkillMarquee({ skills }) {
  const viewportRef = useRef(null);
  const measureRef = useRef(null);
  const [repeat, setRepeat] = useState(1);
  const [duration, setDuration] = useState(30);
  const motionOn = useMotion();

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const sample = measureRef.current;
    if (!viewport || !sample || skills.length === 0) return undefined;

    const measure = () => {
      // Width of a single pass through the list, before any repetition.
      const one = sample.scrollWidth / repeat;
      if (one <= 0) return;

      const needed = Math.max(1, Math.ceil(viewport.clientWidth / one));
      if (needed !== repeat) {
        setRepeat(needed);
        return; // the next pass measures again with the new count
      }
      setDuration(Math.max(8, (one * needed) / SPEED));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [skills, repeat]);

  if (skills.length === 0) return null;

  const items = Array.from({ length: repeat }).flatMap((_, pass) =>
    skills.map((skill) => ({ ...skill, key: `${pass}-${skill.id}` })),
  );

  const half = (hidden) => (
    <ul
      ref={hidden ? undefined : measureRef}
      className="flex shrink-0 items-center gap-4 pr-4"
      aria-hidden={hidden || undefined}
    >
      {items.map((skill) => (
        <li key={`${hidden ? 'copy' : 'main'}-${skill.key}`} className="flex items-center gap-4">
          <span className="font-display text-xl font-extrabold whitespace-nowrap">
            {skill.name}
          </span>
          <Burst fill="#ffc61a" className="size-5 shrink-0" />
        </li>
      ))}
    </ul>
  );

  /* With the motion switch off, the band still has to be readable end to end,
     so it becomes an ordinary side-scrolling row. */
  if (!motionOn) {
    return (
      <div className="overflow-x-auto border-y-[3px] border-ink bg-indigo py-4 text-white">
        <div className="flex w-max">{half(false)}</div>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className="overflow-hidden border-y-[3px] border-ink bg-indigo py-4 text-white"
    >
      <div
        className="marquee-track flex w-max"
        style={{ animationDuration: `${duration}s` }}
      >
        {half(false)}
        {half(true)}
      </div>
    </div>
  );
}
