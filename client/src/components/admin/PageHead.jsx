import { cx } from '../ui';

export function PageHead({ title, description, action }) {
  return (
    <div className="block flex flex-wrap items-center gap-4 p-6">
      <div className="min-w-0 flex-1">
        <h1 className="text-[clamp(1.5rem,3vw,2rem)]">{title}</h1>
        {description && (
          <p className="mt-2 leading-relaxed text-ink-soft">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Notice({ tone = 'ok', children, onDismiss }) {
  return (
    <div
      role="status"
      className={cx(
        'block flex items-center gap-3 p-4 font-semibold',
        tone === 'error' ? 'fill-coral' : 'fill-yellow',
      )}
    >
      <span className="flex-1">{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="btn btn-sm size-8 !p-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
