import { useState } from 'react';
import { Burst, BurstGrid, PhoneMock } from '../art/Illustrations';
import { cx } from '../ui';

/**
 * The illustration cluster at the top of the home page.
 *
 * Point at it (or tap it, or tab to it) and the drawings step aside to show
 * her photo: the phone folds away, the grid runs a wave, and the portrait
 * swings in. Without a photo uploaded it stays a plain illustration — the
 * reveal is simply not offered.
 */
export function HeroArt({ profile }) {
  const [revealed, setRevealed] = useState(false);
  const hasPhoto = Boolean(profile.avatar_url);
  const show = hasPhoto && revealed;

  const interaction = hasPhoto
    ? {
        onMouseEnter: () => setRevealed(true),
        onMouseLeave: () => setRevealed(false),
        onFocus: () => setRevealed(true),
        onBlur: () => setRevealed(false),
        onClick: () => setRevealed((value) => !value),
      }
    : {};

  const Wrapper = hasPhoto ? 'button' : 'div';

  return (
    <Wrapper
      type={hasPhoto ? 'button' : undefined}
      aria-pressed={hasPhoto ? revealed : undefined}
      aria-label={
        hasPhoto ? `Show a photo of ${profile.full_name}` : undefined
      }
      className={cx(
        'grid w-full grid-cols-2 gap-4 text-left',
        hasPhoto && 'cursor-pointer',
      )}
      {...interaction}
    >
      {/* ------------------------------------- the big block: phone ↔ photo */}
      <div className="block fill-coral pop-in relative grid aspect-[3/4] place-items-center overflow-hidden p-4">
        <PhoneMock
          className={cx(
            'w-full max-w-[13rem] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            show
              ? 'scale-75 -rotate-6 opacity-0'
              : 'scale-100 rotate-0 opacity-100',
          )}
        />

        {hasPhoto && (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className={cx(
              'absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] rounded-[14px] border-[3px] border-ink object-cover transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              show
                ? 'scale-100 rotate-0 opacity-100'
                : 'scale-110 rotate-3 opacity-0',
            )}
          />
        )}

        {/* the nudge that tells people there is something to point at */}
        {hasPhoto && (
          <span
            className={cx(
              'pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 transition-all duration-300',
              show ? 'translate-y-3 opacity-0' : 'opacity-100',
            )}
          >
            <span className="relative inline-flex">
              <span
                aria-hidden
                className="ping-ring absolute inset-0 rounded-full border-[3px] border-ink"
              />
              <span className="chip relative bg-white">Hover me</span>
            </span>
          </span>
        )}
      </div>

      {/* --------------------------------------------- grid and single burst */}
      <div className="flex flex-col gap-4">
        <div
          className="block fill-indigo pop-in p-4"
          style={{ animationDelay: '120ms' }}
        >
          <BurstGrid animate active={revealed} className="w-full" />
        </div>

        <div
          className="block fill-yellow pop-in grid flex-1 place-items-center p-4"
          style={{ animationDelay: '240ms' }}
        >
          <Burst
            fill="#ffffff"
            className={cx(
              'spin-slow size-16 transition-transform duration-500',
              revealed && 'scale-125',
            )}
          />
        </div>
      </div>
    </Wrapper>
  );
}
