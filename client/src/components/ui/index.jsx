import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedHeading } from './AnimatedHeading';
import { motionIsOn } from '../../lib/motion';

export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/* --------------------------------------------------------------- Reveal --- */

/** Lifts a block into place the first time it scrolls into view. */
export function Reveal({ children, delay = 0, as: Tag = 'div', className }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === 'undefined' || !motionIsOn()) {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.06 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cx('reveal', shown && 'reveal-in', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------- Heading --- */

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
}) {
  return (
    <header
      className={cx(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cx(
            'mb-4 flex items-center gap-2',
            align === 'center' && 'justify-center',
          )}
        >
          <span className="chip fill-yellow">{eyebrow}</span>
        </div>
      )}

      <AnimatedHeading text={title} className="text-[clamp(1.9rem,5vw,3rem)]" />

      {subtitle && (
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{subtitle}</p>
      )}
    </header>
  );
}

/* --------------------------------------------------------------- Layout --- */

export function Section({ id, children, className }) {
  return (
    <section id={id} className={cx('py-16 md:py-24', className)}>
      <div className="shell">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------- Buttons --- */

export function Button({
  as = 'button',
  to,
  href,
  tone = 'white',
  size,
  className,
  children,
  ...rest
}) {
  const classes = cx(
    'btn',
    tone === 'ink' && 'btn-ink',
    tone === 'coral' && 'btn-coral',
    tone === 'yellow' && 'btn-yellow',
    tone === 'indigo' && 'btn-indigo',
    size === 'sm' && 'btn-sm',
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={classes}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...rest}
      >
        {children}
      </a>
    );
  }

  const Tag = as;
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

/* ----------------------------------------------------------------- Bits --- */

export function Chip({ className, children, ...rest }) {
  return (
    <span className={cx('chip', className)} {...rest}>
      {children}
    </span>
  );
}

/** A flat status dot, filled or hollow. */
export function Dot({ on = true, className }) {
  return (
    <span
      aria-hidden
      className={cx(
        'inline-block size-3 rounded-full border-[2.5px] border-ink',
        on ? 'bg-mint' : 'bg-transparent',
        className,
      )}
    />
  );
}

export function Loading({ label = 'Loading' }) {
  return (
    <div className="grid place-items-center py-24">
      <div className="flex items-center gap-3">
        <span className="size-5 animate-spin rounded-full border-[3px] border-ink border-t-transparent" />
        <span className="eyebrow">{label}</span>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ErrorBox({ title = 'Something went wrong', children }) {
  return (
    <div className="block fill-coral p-6">
      <h3 className="text-xl">{title}</h3>
      <p className="mt-2 text-[0.9375rem] leading-relaxed">{children}</p>
    </div>
  );
}

export function EmptyBox({ children }) {
  return (
    <div className="block fill-lavender p-10 text-center">
      <p className="text-[0.9375rem]">{children}</p>
    </div>
  );
}
