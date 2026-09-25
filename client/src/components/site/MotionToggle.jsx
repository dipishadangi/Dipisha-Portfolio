import { setMotion, useMotion } from '../../lib/motion';
import { cx } from '../ui';

/**
 * Turns every animation on the site on or off, and remembers the choice.
 *
 * This is here because the site animates by default rather than following the
 * operating system's "reduce motion" setting — so anyone who does want things
 * still has a way to say so.
 */
export function MotionToggle({ className }) {
  const on = useMotion();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setMotion(!on)}
      title={on ? 'Turn animations off' : 'Turn animations on'}
      className={cx(
        'inline-flex items-center gap-2.5 rounded-full border-[3px] border-ink px-3 py-1.5 text-ink transition-colors',
        on ? 'bg-yellow' : 'bg-white',
        className,
      )}
    >
      <span
        aria-hidden
        className="relative block h-4 w-7 rounded-full border-[2.5px] border-ink bg-white"
      >
        <span
          className="absolute top-[1px] size-2 rounded-full bg-ink transition-all duration-200"
          style={{ left: on ? 'calc(100% - 0.625rem)' : '1px' }}
        />
      </span>
      <span className="font-mono text-[0.625rem] font-bold tracking-[0.12em] uppercase">
        Motion {on ? 'on' : 'off'}
      </span>
    </button>
  );
}
