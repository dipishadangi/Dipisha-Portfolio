import { useEffect, useState } from 'react';

/**
 * Whether the site animates.
 *
 * The usual approach is to follow the operating system's "reduce motion"
 * setting. This site deliberately does not: it animates by default, because
 * the motion is the design, and offers its own switch instead (in the footer).
 * That switch is remembered, so anyone who wants stillness turns it off once.
 *
 * The state lives on <html data-motion="on|off"> so CSS can read it without
 * any JavaScript running first.
 */

const KEY = 'dipisha-motion';

export function motionIsOn() {
  if (typeof document === 'undefined') return true;
  return document.documentElement.dataset.motion !== 'off';
}

export function setMotion(on) {
  document.documentElement.dataset.motion = on ? 'on' : 'off';
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* private browsing — the choice just will not be remembered */
  }
  window.dispatchEvent(new CustomEvent('motionchange', { detail: on }));
}

/** Applied before first paint by the snippet in index.html; kept here too. */
export function initMotion() {
  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {
    /* ignore */
  }
  document.documentElement.dataset.motion = saved === 'off' ? 'off' : 'on';
}

/** Re-renders whichever component uses it when the switch is flipped. */
export function useMotion() {
  const [on, setOn] = useState(motionIsOn);

  useEffect(() => {
    const sync = () => setOn(motionIsOn());
    window.addEventListener('motionchange', sync);
    return () => window.removeEventListener('motionchange', sync);
  }, []);

  return on;
}
