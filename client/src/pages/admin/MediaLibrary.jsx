import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { Button, Loading, cx } from '../../components/ui';
import { Notice, PageHead } from '../../components/admin/PageHead';

const FOLDERS = ['uploads', 'projects', 'profile', 'documents'];

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaLibrary() {
  const [folder, setFolder] = useState('uploads');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const input = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.media(folder));
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [folder]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(files) {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    try {
      await api.upload(Array.from(files), folder);
      await load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
    if (input.current) input.current.value = '';
  }

  async function remove(item) {
    if (
      !window.confirm(
        `Delete ${item.filename}? Anywhere it is used will show a broken image.`,
      )
    )
      return;
    try {
      await api.deleteMedia(item.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function copy(url) {
    const absolute = new URL(url, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(url);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      setError('Could not copy — select the address and copy it by hand.');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHead
        title="Images"
        description="Every file you have uploaded. You can also upload straight from the project and profile pages — this is the whole library in one place."
        action={
          <Button
            type="button"
            tone="ink"
            onClick={() => input.current?.click()}
            disabled={busy}
          >
            {busy ? 'Uploading…' : '+ Upload'}
          </Button>
        }
      />

      {error && <Notice tone="error" onDismiss={() => setError('')}>{error}</Notice>}

      <div className="block flex flex-wrap items-center gap-2 p-3">
        <span className="eyebrow px-2">Folder</span>
        {FOLDERS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setFolder(name)}
            className={cx('btn btn-sm', folder === name && 'btn-ink')}
          >
            {name}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="block fill-lavender p-12 text-center">
          <p className="font-semibold">
            Nothing in <strong>{folder}</strong> yet.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="block p-3">
              <div className="grid aspect-square place-items-center overflow-hidden rounded-[12px] border-[3px] border-ink bg-lavender-soft">
                {/\.pdf$/i.test(item.filename) ? (
                  <span className="font-display text-xl font-extrabold">PDF</span>
                ) : (
                  <img
                    src={item.url}
                    alt={item.filename}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                )}
              </div>

              <p className="mt-2.5 truncate text-xs font-semibold" title={item.filename}>
                {item.filename}
              </p>
              <p className="font-mono text-[0.625rem] text-ink-faint">
                {formatBytes(item.size_bytes)}
              </p>

              <div className="mt-2.5 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  onClick={() => copy(item.url)}
                >
                  {copied === item.url ? 'Copied' : 'Copy link'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => remove(item)}
                  aria-label={`Delete ${item.filename}`}
                >
                  ×
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
    </div>
  );
}
