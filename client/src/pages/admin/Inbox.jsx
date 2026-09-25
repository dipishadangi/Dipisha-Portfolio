import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Button, Loading, cx } from '../../components/ui';
import { Envelope } from '../../components/art/Illustrations';
import { Notice, PageHead } from '../../components/admin/PageHead';

export function Inbox() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    try {
      setRows(await api.messages());
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function open(message) {
    setOpenId(openId === message.id ? null : message.id);
    if (!message.read) {
      try {
        await api.markMessage(message.id, true);
        setRows((current) =>
          current.map((m) => (m.id === message.id ? { ...m, read: true } : m)),
        );
      } catch {
        /* marking as read is not worth an error message */
      }
    }
  }

  async function remove(message) {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    try {
      await api.deleteMessage(message.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const unread = rows.filter((m) => !m.read).length;

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col gap-5">
      <PageHead
        title="Inbox"
        description={
          rows.length
            ? `${rows.length} message${rows.length === 1 ? '' : 's'}, ${unread} unread.`
            : 'Anything sent through the contact form lands here.'
        }
      />

      {error && <Notice tone="error" onDismiss={() => setError('')}>{error}</Notice>}

      {rows.length === 0 ? (
        <div className="block fill-lavender p-12 text-center">
          <Envelope className="mx-auto w-40" />
          <p className="mt-6 font-semibold">
            No messages yet. They show up here the moment someone writes.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((message) => {
            const isOpen = openId === message.id;
            return (
              <li key={message.id} className="block overflow-hidden">
                <button
                  type="button"
                  onClick={() => open(message)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <span
                    className={cx(
                      'grid size-11 shrink-0 place-items-center rounded-full border-[3px] border-ink',
                      message.read ? 'bg-white' : 'bg-coral',
                    )}
                    aria-hidden
                  >
                    ✉
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cx(
                        'block truncate',
                        message.read ? 'font-semibold' : 'font-display font-extrabold',
                      )}
                    >
                      {message.subject || '(no subject)'}
                    </span>
                    <span className="block truncate text-sm text-ink-faint">
                      {message.name} · {message.email}
                    </span>
                  </span>

                  <span className="shrink-0 font-mono text-xs text-ink-faint">
                    {new Date(message.created_at).toLocaleDateString()}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t-[3px] border-ink bg-lavender-soft p-5">
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {message.body}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <Button
                        size="sm"
                        tone="ink"
                        href={`mailto:${message.email}?subject=${encodeURIComponent(
                          `Re: ${message.subject || 'your message'}`,
                        )}`}
                      >
                        Reply
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => remove(message)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
