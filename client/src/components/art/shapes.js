/**
 * Geometry helpers for the illustrations. Working these out with maths rather
 * than hand-written path data keeps every shape perfectly symmetrical and
 * makes them easy to retune (more arms, deeper scallops) in one place.
 *
 * Every generator draws inside a 0–100 box, centred on (50, 50).
 */

const toRad = (deg) => ((deg - 90) * Math.PI) / 180;

function polar(deg, radius, cx = 50, cy = 50) {
  const a = toRad(deg);
  return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
}

const round = (n) => Math.round(n * 100) / 100;

/**
 * The eight-armed burst used all over the reference: arms that flare towards
 * a flat tip, with a sharp notch between each one.
 */
export function burstPath({ arms = 8, outer = 46, inner = 13, spread = 8 } = {}) {
  const step = 360 / arms;
  const points = [];

  for (let i = 0; i < arms; i += 1) {
    const angle = i * step;
    points.push(polar(angle - spread, outer));
    points.push(polar(angle + spread, outer));
    points.push(polar(angle + step / 2, inner));
  }

  return `${points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${round(x)} ${round(y)}`)
    .join(' ')} Z`;
}

/**
 * A scalloped circle — the flower shape. Each segment bulges outwards on an
 * arc, so the outline stays one continuous stroke.
 */
export function scallopPath({ bumps = 8, radius = 32, bulge = 1.15 } = {}) {
  const step = 360 / bumps;
  // The arc radius has to be at least half the chord or the arc cannot close.
  const chord = 2 * radius * Math.sin(Math.PI / bumps);
  const arc = round((chord / 2) * bulge);

  let d = '';
  for (let i = 0; i < bumps; i += 1) {
    const [x1, y1] = polar(i * step, radius);
    const [x2, y2] = polar((i + 1) * step, radius);
    if (i === 0) d += `M${round(x1)} ${round(y1)}`;
    d += ` A ${arc} ${arc} 0 0 1 ${round(x2)} ${round(y2)}`;
  }
  return `${d} Z`;
}

/** Evenly spaced positions for laying shapes out in a grid. */
export function grid(cols, rows, { pad = 14, box = 100 } = {}) {
  const cells = [];
  const stepX = (box - pad * 2) / (cols - 1 || 1);
  const stepY = (box - pad * 2) / (rows - 1 || 1);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push({
        x: pad + col * stepX,
        y: pad + row * stepY,
        col,
        row,
        index: row * cols + col,
      });
    }
  }
  return cells;
}
