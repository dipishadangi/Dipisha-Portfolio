import { useId, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { Button, cx } from '../ui';

export function Labelled({ label, help, children, className }) {
  return (
    <div className={cx('block', className)}>
      <span className="eyebrow mb-2 block">{label}</span>
      {children}
      {help && (
        <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{help}</p>
      )}
    </div>
  );
}

export function TextField({ label, help, value, onChange, className, ...rest }) {
  return (
    <Labelled label={label} help={help} className={className}>
      <input
        {...rest}
        className="field"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </Labelled>
  );
}

export function TextArea({
  label,
  help,
  value,
  onChange,
  rows = 5,
  className,
  ...rest
}) {
  return (
    <Labelled label={label} help={help} className={className}>
      <textarea
        {...rest}
        rows={rows}
        className="field resize-y"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </Labelled>
  );
}

export function NumberField({ label, help, value, onChange, min, max, className }) {
  return (
    <Labelled label={label} help={help} className={className}>
      <input
        type="number"
        className="field"
        min={min}
        max={max}
        value={Number.isFinite(Number(value)) ? Number(value) : 0}
        onChange={(e) => {
          const next = Number(e.target.value);
          onChange(Number.isFinite(next) ? next : 0);
        }}
      />
    </Labelled>
  );
}

export function SelectField({ label, help, value, options = [], onChange, className }) {
  return (
    <Labelled label={label} help={help} className={className}>
      <select
        className="field"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {value && !options.includes(value) && (
          <option value={value}>{value}</option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Labelled>
  );
}

/** A flat switch: a hard-edged track with a square-ish knob. */
export function Toggle({ label, help, value, onChange, className }) {
  const id = useId();
  return (
    <div className={cx('flex items-start gap-3', className)}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={Boolean(value)}
        onClick={() => onChange(!value)}
        className={cx(
          'relative mt-0.5 h-8 w-14 shrink-0 rounded-full border-[3px] border-ink transition-colors',
          value ? 'bg-mint' : 'bg-white',
        )}
      >
        <span
          aria-hidden
          className="absolute top-[2px] size-5 rounded-full border-[3px] border-ink bg-white transition-all"
          style={{ left: value ? 'calc(100% - 1.5rem)' : '2px' }}
        />
      </button>
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-bold">{label}</span>
        {help && <span className="mt-0.5 block text-xs text-ink-faint">{help}</span>}
      </label>
    </div>
  );
}

/** Comma or Enter separated chips, stored as a Postgres text[]. */
export function TagsField({ label, help, value = [], onChange, placeholder, className }) {
  const list = Array.isArray(value) ? value : [];

  function add(raw) {
    const parts = String(raw)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => !list.includes(part));
    if (parts.length) onChange([...list, ...parts]);
  }

  return (
    <Labelled label={label} help={help} className={className}>
      {list.length > 0 && (
        <ul className="mb-2.5 flex flex-wrap gap-2">
          {list.map((tag, i) => (
            <li key={`${tag}-${i}`}>
              <button
                type="button"
                onClick={() => onChange(list.filter((_, j) => j !== i))}
                className="chip bg-lavender-soft hover:bg-coral"
                title={`Remove ${tag}`}
              >
                {tag} <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        className="field"
        placeholder={placeholder ?? 'Type and press Enter'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
        onBlur={(e) => {
          add(e.currentTarget.value);
          e.currentTarget.value = '';
        }}
      />
    </Labelled>
  );
}

/* ------------------------------------------------------------- image picker */

export function ImagePicker({
  label,
  help,
  value,
  onChange,
  folder = 'uploads',
  aspect = 'aspect-[4/3]',
  className,
}) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  async function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const [saved] = await api.upload([file], folder);
      onChange(saved.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  const isPdf = typeof value === 'string' && /\.pdf$/i.test(value);

  return (
    <Labelled label={label} help={help} className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cx(
          'relative overflow-hidden rounded-[16px] border-[3px] border-ink transition-colors',
          dragging ? 'bg-yellow' : 'bg-lavender-soft',
        )}
      >
        {value ? (
          isPdf ? (
            <div className={cx('grid w-full place-items-center', aspect)}>
              <span className="font-display text-2xl font-extrabold">PDF</span>
            </div>
          ) : (
            <img src={value} alt="" className={cx('w-full object-cover', aspect)} />
          )
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={cx('grid w-full place-items-center gap-2 p-6', aspect)}
          >
            <span className="font-display text-3xl">+</span>
            <span className="text-xs font-semibold">
              Click to choose, or drop a file here
            </span>
          </button>
        )}

        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-ink/50">
            <span className="size-6 animate-spin rounded-full border-[3px] border-white border-t-transparent" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => input.current?.click()}
          disabled={busy}
        >
          {value ? 'Replace' : 'Upload'}
        </Button>
        {value && (
          <Button type="button" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </div>

      <input
        className="field mt-2.5 text-xs"
        placeholder="…or paste a link to an image"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value.trim() || null)}
      />

      {error && <p className="mt-1.5 text-xs font-bold text-coral-deep">{error}</p>}

      <input
        ref={input}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </Labelled>
  );
}

export function GalleryPicker({ label, help, value = [], onChange, folder = 'projects' }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const list = Array.isArray(value) ? value : [];

  async function handleFiles(files) {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    try {
      const saved = await api.upload(Array.from(files), folder);
      onChange([...list, ...saved.map((item) => item.url)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <Labelled label={label} help={help}>
      {list.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {list.map((url, i) => (
            <li key={`${url}-${i}`} className="relative">
              <img
                src={url}
                alt=""
                className="aspect-square w-full rounded-[12px] border-[3px] border-ink object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(list.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full border-[3px] border-ink bg-coral font-bold"
                title="Remove"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        size="sm"
        onClick={() => input.current?.click()}
        disabled={busy}
      >
        {busy ? 'Uploading…' : 'Add images'}
      </Button>

      {error && <p className="mt-1.5 text-xs font-bold text-coral-deep">{error}</p>}

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </Labelled>
  );
}
