import { Burst, Flower } from '../art/Illustrations';
import { AnimatedHeading } from '../ui/AnimatedHeading';
import { useParallax } from '../../lib/useParallax';
import { cx } from '../ui';

/**
 * One decorative shape: floats on its own timer and drifts against the scroll.
 * Purely ornamental, so it is hidden from assistive technology.
 */
function Shape({ kind = 'burst', fill, className, speed, float, delay }) {
  const ref = useParallax(speed);
  const Art = kind === 'flower' ? Flower : Burst;

  return (
    <div ref={ref} className={cx('pointer-events-none absolute', className)} aria-hidden>
      <Art
        fill={fill}
        className={cx('w-full', float)}
        style={{ animationDelay: `${delay}ms` }}
      />
    </div>
  );
}

/* Positioned to sit inside the band even once the parallax has shifted them,
   and kept off the text column on small screens. */
const SHAPES = [
  { kind: 'burst', className: 'top-4 right-[5%] w-20 md:w-28', speed: 0.16, float: 'float-y', delay: 0 },
  { kind: 'flower', className: 'top-1/2 right-[2%] w-12 md:w-16', speed: -0.1, float: 'float-x', delay: 900 },
  { kind: 'burst', className: 'bottom-4 left-[3%] w-16 md:w-24', speed: 0.2, float: 'float-y', delay: 1600 },
];

/**
 * The banner at the top of every page but the home page: a coloured band, an
 * animated heading, and a few shapes drifting behind it.
 */
export function PageHero({
  tone = 'bg-coral',
  eyebrow,
  title,
  subtitle,
  art,
  shapeFill = '#ffffff',
  dark = false,
  children,
}) {
  return (
    <section
      className={cx(
        'relative overflow-hidden border-b-[3px] border-ink',
        tone,
        dark && 'text-white',
      )}
    >
      {SHAPES.map((shape, i) => (
        <Shape key={i} {...shape} fill={shapeFill} />
      ))}

      <div className="shell relative grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          {eyebrow && (
            <span
              className="chip pop-in inline-flex bg-white text-ink"
              style={{ animationDelay: '60ms' }}
            >
              {eyebrow}
            </span>
          )}

          <AnimatedHeading
            as="h1"
            text={title}
            delay={180}
            className="mt-5 text-[clamp(2.25rem,6vw,4rem)]"
          />

          {subtitle && (
            <p
              className="pop-in mt-5 max-w-xl text-lg leading-relaxed"
              style={{ animationDelay: `${260 + String(title ?? '').split(/\s+/).length * 70}ms` }}
            >
              {subtitle}
            </p>
          )}

          {children}
        </div>

        {art && (
          <div className="pop-in justify-self-center" style={{ animationDelay: '320ms' }}>
            {art}
          </div>
        )}
      </div>
    </section>
  );
}
