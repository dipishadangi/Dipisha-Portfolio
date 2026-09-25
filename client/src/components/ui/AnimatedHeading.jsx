import { Fragment } from 'react';

// Deliberately not importing `cx` from ./index: that barrel imports this file,
// and the cycle would leave one of them half-initialised.

/**
 * A heading whose words rise into place one after another, each out of its own
 * clipped line. Splitting on words rather than letters keeps the text intact
 * for a screen reader — only the boxes around it move.
 *
 * The spaces are deliberately rendered outside the clipped spans: a
 * non-breaking space inside them would stop long headings wrapping on a phone.
 */
export function AnimatedHeading({
  text,
  as: Tag = 'h2',
  className,
  delay = 0,
  step = 70,
}) {
  const words = String(text ?? '')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return null;

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="word-line">
            <span
              className="word-rise"
              style={{ animationDelay: `${delay + i * step}ms` }}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
