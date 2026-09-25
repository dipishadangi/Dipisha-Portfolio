import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useContent } from '../../lib/content';
import { Button, Loading } from '../../components/ui';
import { Notice, PageHead } from '../../components/admin/PageHead';
import { TextArea, TextField, Toggle } from '../../components/admin/fields';

/** Where each heading actually shows up, so the labels mean something. */
const WHERE = {
  home_intro: 'Home · the block under the skills band',
  home_work: 'Home · the featured projects',
  about: 'About · the top of the page',
  about_skills: 'About · the skills cards',
  about_journey: 'About · the journey list',
  services: 'Services · the top of the page',
  work: 'Work · the top of the page',
  contact: 'Contact · the top of the page',
};

export function SectionsEditor() {
  const { reload } = useContent();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      setRows(await api.adminSections());
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function patch(key, changes) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...changes } : row)),
    );
  }

  async function save(row) {
    setSavingKey(row.key);
    setError('');
    try {
      await api.saveSection(row.key, {
        eyebrow: row.eyebrow,
        title: row.title,
        subtitle: row.subtitle,
        visible: row.visible,
      });
      setNotice(`Saved “${row.title || row.key}”.`);
      reload();
    } catch (err) {
      setError(err.message);
    }
    setSavingKey(null);
  }

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col gap-5">
      <PageHead
        title="Page headings"
        description="Every heading across the site lives here. Rename one, rewrite the sentence under it, or switch a whole block off."
      />

      {error && <Notice tone="error" onDismiss={() => setError('')}>{error}</Notice>}
      {notice && !error && (
        <Notice onDismiss={() => setNotice('')}>{notice}</Notice>
      )}

      <ul className="flex flex-col gap-4">
        {rows.map((row) => (
          <li key={row.key} className="block p-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="chip fill-yellow">{row.key}</span>
              <span className="text-sm font-semibold text-ink-faint">
                {WHERE[row.key] ?? ''}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                label="Small label above"
                help="The little pill, e.g. “selected work”."
                value={row.eyebrow}
                onChange={(v) => patch(row.key, { eyebrow: v })}
              />
              <TextField
                label="Heading"
                value={row.title}
                onChange={(v) => patch(row.key, { title: v })}
              />
              <TextArea
                className="md:col-span-2"
                label="Sentence underneath"
                rows={2}
                value={row.subtitle}
                onChange={(v) => patch(row.key, { subtitle: v })}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-5">
              <Button
                type="button"
                tone="ink"
                onClick={() => save(row)}
                disabled={savingKey === row.key}
              >
                {savingKey === row.key ? 'Saving…' : 'Save'}
              </Button>
              <Toggle
                label="Show this block"
                value={row.visible}
                onChange={(v) => patch(row.key, { visible: v })}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
