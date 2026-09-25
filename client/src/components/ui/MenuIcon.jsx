import { cx } from './index';

/**
 * Three lines. That is all.
 *
 * Laid out with flex and a real gap rather than absolute positioning, so the
 * height comes from the bars themselves (3 + 4 + 3 + 4 + 3 = 17px). Nothing
 * depends on percentages or a fixed height, which means a stray border or a
 * change of font can never squash the spacing.
 *
 * `border-0` is explicit because these sit inside `.btn`, which carries a
 * border of its own.
 */
export function MenuIcon({ className }) {
  return (
    <span
      aria-hidden
      className={cx('flex w-[22px] flex-col gap-[4px] border-0', className)}
    >
      <span className="h-[3px] w-full rounded-full border-0 bg-current" />
      <span className="h-[3px] w-full rounded-full border-0 bg-current" />
      <span className="h-[3px] w-full rounded-full border-0 bg-current" />
    </span>
  );
}
