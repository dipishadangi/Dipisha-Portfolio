import { burstPath, scallopPath, grid } from './shapes';

/* Every illustration uses the same ink, the same stroke weight and flat fills
   — no gradients and no shadows — so they read as one drawn set. */

const INK = '#111111';
const PAPER = '#ffffff';
const CORAL = '#ff8573';
const CORAL_DEEP = '#f2604a';
const INDIGO = '#4b45e8';
const YELLOW = '#ffc61a';
const LAVENDER = '#c8bfff';
const SKY = '#6fa8e8';

const BURST = burstPath();
const FLOWER = scallopPath({ bumps: 8, radius: 30 });
const FROSTING = scallopPath({ bumps: 7, radius: 26 });

/* -------------------------------------------------------------- primitives */

/** The eight-armed burst, on its own. */
export function Burst({ fill = PAPER, stroke = INK, className, ...rest }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" {...rest}>
      <path
        d={BURST}
        fill={fill}
        stroke={stroke}
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The scalloped flower with a dot at its centre. */
export function Flower({ fill = SKY, className, ...rest }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" {...rest}>
      <path
        d={FLOWER}
        fill={fill}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="9" fill={INK} />
    </svg>
  );
}

/** A cupcake: scalloped frosting on a ribbed wrapper. */
export function Cupcake({ className, ...rest }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" {...rest}>
      {/* frosting */}
      <g transform="translate(0 -12)">
        <path
          d={FROSTING}
          fill={CORAL_DEEP}
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </g>
      {/* wrapper */}
      <path
        d="M24 60 H76 L69 88 A6 6 0 0 1 63 93 H37 A6 6 0 0 1 31 88 Z"
        fill={YELLOW}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M40 62 L37 91 M52 62 L52 91 M64 62 L67 91"
        stroke={INK}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A mouse pointer. */
export function Cursor({ className, ...rest }) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden="true" {...rest}>
      <path
        d="M3 2 L3 26 L9.5 19.5 L13.5 29 L18 27 L14 18 L22 17 Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A round avatar badge. */
export function AvatarBadge({ className, ...rest }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...rest}>
      <circle
        cx="24"
        cy="24"
        r="21"
        fill={PAPER}
        stroke={INK}
        strokeWidth="3"
      />
      <circle cx="24" cy="19" r="6" fill={SKY} stroke={INK} strokeWidth="2.6" />
      <path
        d="M12.5 37a11.5 11.5 0 0 1 23 0"
        fill={SKY}
        stroke={INK}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------ the panels */

/**
 * A 4 x 4 field of bursts with one picked out in yellow — the middle panel of
 * the reference, and the site's signature motif.
 */
export function BurstGrid({
  highlight = 6,
  /** Spring each burst in on first paint. */
  animate = false,
  /** Run a diagonal wave across the grid (used on hover). */
  active = false,
  className,
  ...rest
}) {
  const cells = grid(4, 4, { pad: 15 });

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {cells.map((cell) => {
        // The wave is delayed by the diagonal, so it sweeps corner to corner
        // rather than lighting up row by row.
        const wave = (cell.col + cell.row) * 70;
        const entrance = cell.index * 38;

        return (
          <g
            key={cell.index}
            transform={`translate(${cell.x} ${cell.y}) scale(0.19) translate(-50 -50)`}
          >
            <g
              style={{
                transformOrigin: '50px 50px',
                animation: active
                  ? `burst-wave 900ms ${wave}ms ease-in-out infinite`
                  : animate
                    ? `burst-pop 560ms ${entrance}ms cubic-bezier(0.22, 1, 0.36, 1) both`
                    : undefined,
              }}
            >
              <path
                d={BURST}
                fill={cell.index === highlight ? YELLOW : LAVENDER}
                stroke={INK}
                strokeWidth="5"
                strokeLinejoin="round"
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * A phone with a picture card on its screen — the left panel of the reference.
 */
export function PhoneMock({ className, ...rest }) {
  return (
    <svg
      viewBox="0 0 120 150"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* body */}
      <rect
        x="12"
        y="8"
        width="96"
        height="150"
        rx="16"
        fill={PAPER}
        stroke={INK}
        strokeWidth="4"
      />
      {/* earpiece */}
      <path d="M50 19 H70" stroke={INK} strokeWidth="4" strokeLinecap="round" />

      {/* screen */}
      <rect
        x="21"
        y="28"
        width="78"
        height="128"
        rx="10"
        fill={LAVENDER}
        stroke={INK}
        strokeWidth="4"
      />

      {/* pills across the top of the screen */}
      <rect x="28" y="37" width="18" height="7" rx="3.5" fill={YELLOW} stroke={INK} strokeWidth="2.6" />
      <rect x="50" y="37" width="18" height="7" rx="3.5" fill={PAPER} stroke={INK} strokeWidth="2.6" />
      <rect x="72" y="37" width="18" height="7" rx="3.5" fill={PAPER} stroke={INK} strokeWidth="2.6" />

      {/* the picture */}
      <rect
        x="28"
        y="51"
        width="62"
        height="44"
        rx="6"
        fill={YELLOW}
        stroke={INK}
        strokeWidth="4"
      />
      <g transform="translate(59 73) scale(0.34) translate(-50 -50)">
        <path d={FLOWER} fill={SKY} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <circle cx="50" cy="50" r="9" fill={INK} />
      </g>

      {/* caption bar and button */}
      <rect x="28" y="102" width="62" height="11" rx="5.5" fill={PAPER} stroke={INK} strokeWidth="3" />
      <rect x="28" y="120" width="30" height="11" rx="5.5" fill={CORAL_DEEP} stroke={INK} strokeWidth="3" />
    </svg>
  );
}

/** A small browser card: dots, menu, a picture and a button. */
function MiniCard({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="0"
        y="0"
        width="70"
        height="98"
        rx="10"
        fill={LAVENDER}
        stroke={INK}
        strokeWidth="4"
      />
      {/* window chrome */}
      <circle cx="11" cy="11" r="3" fill={YELLOW} stroke={INK} strokeWidth="1.8" />
      <circle cx="18" cy="11" r="3" fill={YELLOW} stroke={INK} strokeWidth="1.8" />
      <circle cx="25" cy="11" r="3" fill={YELLOW} stroke={INK} strokeWidth="1.8" />
      <path
        d="M50 8 H61 M50 12 H61 M50 16 H61"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* picture */}
      <rect x="9" y="23" width="52" height="45" rx="6" fill={PAPER} stroke={INK} strokeWidth="3.4" />
      <g transform="translate(35 46) scale(0.36) translate(-50 -50)">
        <g transform="translate(0 -12)">
          <path d={FROSTING} fill={CORAL_DEEP} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        </g>
        <path
          d="M24 60 H76 L69 88 A6 6 0 0 1 63 93 H37 A6 6 0 0 1 31 88 Z"
          fill={YELLOW}
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </g>

      {/* button */}
      <rect x="9" y="75" width="52" height="14" rx="6" fill={INDIGO} stroke={INK} strokeWidth="3.4" />
    </g>
  );
}

/**
 * Two versions of the same screen side by side, one being clicked — the right
 * panel of the reference. Used for the "before / after" idea.
 */
export function SplitScreens({ className, ...rest }) {
  return (
    <svg
      viewBox="0 0 200 120"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <rect x="0" y="0" width="100" height="120" fill={YELLOW} />
      <rect x="100" y="0" width="100" height="120" fill={CORAL} />
      <path d="M100 0 V120" stroke={INK} strokeWidth="4" />

      <MiniCard x={15} y={11} />
      <MiniCard x={115} y={11} />

      {/* the extras on the right-hand copy */}
      <g transform="translate(160 22)">
        <circle cx="0" cy="0" r="15" fill={PAPER} stroke={INK} strokeWidth="3.4" />
        <circle cx="0" cy="-4" r="4.4" fill={SKY} stroke={INK} strokeWidth="2.4" />
        <path
          d="M-8 9a8 8 0 0 1 16 0"
          fill={SKY}
          stroke={INK}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </g>

      {/* the ripple where the pointer lands, timed with the tap below */}
      <circle
        cx="152"
        cy="92"
        r="11"
        fill="none"
        stroke={INK}
        strokeWidth="3"
        className="tap-ring"
        style={{ transformOrigin: '152px 92px' }}
      />

      {/* the pointer, tapping the button over and over */}
      <g transform="translate(155 76)">
        <g className="cursor-tap" style={{ transformOrigin: '10px 14px' }}>
          <path
            d="M3 2 L3 26 L9.5 19.5 L13.5 29 L18 27 L14 18 L22 17 Z"
            fill={PAPER}
            stroke={INK}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}

/** A stack of overlapping cards, for the "work" idea. */
export function CardStack({ className, ...rest }) {
  return (
    <svg
      viewBox="0 0 140 120"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* each card drifts on its own timer, so the stack never sits still */}
      <g className="float-y" style={{ animationDelay: '0ms', animationDuration: '8s' }}>
        <rect x="12" y="26" width="86" height="74" rx="12" fill={LAVENDER} stroke={INK} strokeWidth="4" />
      </g>
      <g className="float-y" style={{ animationDelay: '600ms', animationDuration: '7s' }}>
        <rect x="28" y="16" width="86" height="74" rx="12" fill={CORAL} stroke={INK} strokeWidth="4" />
      </g>
      <g className="float-y" style={{ animationDelay: '1200ms', animationDuration: '6.2s' }}>
        <rect x="44" y="6" width="86" height="74" rx="12" fill={PAPER} stroke={INK} strokeWidth="4" />
        <rect x="54" y="18" width="66" height="36" rx="7" fill={YELLOW} stroke={INK} strokeWidth="3.4" />
        <path d="M54 62 H120 M54 70 H100" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** An open envelope, for the contact page. */
export function Envelope({ className, ...rest }) {
  return (
    <svg
      viewBox="0 0 140 110"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <rect x="8" y="16" width="124" height="86" rx="12" fill={YELLOW} stroke={INK} strokeWidth="4" />
      <path
        d="M8 30 L70 70 L132 30"
        fill="none"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* the letter lifts out of the envelope and settles back */}
      <g className="float-y" style={{ animationDuration: '5.5s' }}>
        <rect x="34" y="4" width="72" height="46" rx="8" fill={PAPER} stroke={INK} strokeWidth="4" />
        <path d="M46 20 H94 M46 30 H80" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** A palette, for the design service. */
export function Palette({ className, ...rest }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" {...rest}>
      <path
        d="M50 12c21 0 38 15 38 34 0 11-9 16-17 16h-7c-6 0-10 4-10 9 0 3 1 5 1 8 0 5-4 9-11 9-19 0-34-17-34-38S29 12 50 12Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="34" r="7" fill={CORAL} stroke={INK} strokeWidth="3.4" />
      <circle cx="58" cy="29" r="7" fill={YELLOW} stroke={INK} strokeWidth="3.4" />
      <circle cx="72" cy="48" r="7" fill={INDIGO} stroke={INK} strokeWidth="3.4" />
      <circle cx="28" cy="58" r="7" fill={SKY} stroke={INK} strokeWidth="3.4" />
    </svg>
  );
}

/** Angle brackets, for the development service. */
export function CodeBrackets({ className, ...rest }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" {...rest}>
      <rect x="8" y="16" width="84" height="68" rx="12" fill={LAVENDER} stroke={INK} strokeWidth="5" />
      <path
        d="M36 40 L24 50 L36 60 M64 40 L76 50 L64 60 M56 34 L44 66"
        fill="none"
        stroke={INK}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A magnifier over a page, for the SEO service. */
export function SearchGlass({ className, ...rest }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" {...rest}>
      <rect x="14" y="10" width="54" height="66" rx="9" fill={PAPER} stroke={INK} strokeWidth="5" />
      <path
        d="M26 26 H56 M26 38 H50 M26 50 H44"
        stroke={INK}
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <circle cx="62" cy="60" r="20" fill={YELLOW} stroke={INK} strokeWidth="5" />
      <path d="M76 74 L90 88" stroke={INK} strokeWidth="6.5" strokeLinecap="round" />
    </svg>
  );
}

/** A trophy-ish medal, for certificates. */
export function Medal({ className, ...rest }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" {...rest}>
      <path
        d="M32 8 L44 44 M68 8 L56 44"
        stroke={INK}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="62" r="28" fill={YELLOW} stroke={INK} strokeWidth="5" />
      <g transform="translate(50 62) scale(0.3) translate(-50 -50)">
        <path d={BURST} fill={PAPER} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** A graduation cap, for education. */
export function Cap({ className, ...rest }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" {...rest}>
      <path
        d="M50 22 L92 42 L50 62 L8 42 Z"
        fill={INDIGO}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M26 51 V70 C26 78 38 83 50 83 C62 83 74 78 74 70 V51"
        fill={LAVENDER}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M90 43 V70" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** A briefcase, for work history. */
export function Briefcase({ className, ...rest }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" {...rest}>
      <path
        d="M38 30 V24 A6 6 0 0 1 44 18 H56 A6 6 0 0 1 62 24 V30"
        fill="none"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <rect x="12" y="30" width="76" height="52" rx="10" fill={CORAL} stroke={INK} strokeWidth="5" />
      <path d="M12 52 H88" stroke={INK} strokeWidth="5" />
      <rect x="42" y="45" width="16" height="14" rx="4" fill={PAPER} stroke={INK} strokeWidth="4" />
    </svg>
  );
}

export const SERVICE_ART = {
  code: CodeBrackets,
  palette: Palette,
  search: SearchGlass,
  sparkle: Burst,
  cupcake: Cupcake,
  flower: Flower,
  cards: CardStack,
  envelope: Envelope,
};

export const SERVICE_ART_NAMES = Object.keys(SERVICE_ART);

export const TIMELINE_ART = {
  education: Cap,
  work: Briefcase,
  certificate: Medal,
};
