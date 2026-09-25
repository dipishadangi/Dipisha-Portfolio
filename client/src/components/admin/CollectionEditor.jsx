import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useContent } from '../../lib/content';
import { Button, Loading, cx } from '../ui';
import { PageHead, Notice } from './PageHead';
import {
  GalleryPicker,
  ImagePicker,
  NumberField,
  SelectField,
  TagsField,
  TextArea,
  TextField,
  Toggle,
} from './fields';

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function Field({ field, value, onChange }) {
  const span = field.full ? 'md:col-span-2' : undefined;

  switch (field.type) {
    case 'textarea':
      return (
        <TextArea
          className={span ?? 'md:col-span-2'}
          label={field.label}
          help={field.help}
          rows={field.rows}
          placeholder={field.placeholder}
          value={value}
          onChange={onChange}
        />
      );
    case 'number':
      return (
        <NumberField
          className={span}
          label={field.label}
          help={field.help}
          min={field.min}
          max={field.max}
          value={value}
          onChange={onChange}
        />
      );
    case 'toggle':
      return (
        <div className={cx('flex items-end pb-2', span)}>
          <Toggle
            label={field.label}
            help={field.help}
            value={value}
            onChange={onChange}
          />
        </div>
      );
    case 'select':
      return (
        <SelectField
          className={span}
          label={field.label}
          help={field.help}
          options={field.options}
          value={value}
          onChange={onChange}
        />
      );
    case 'tags':
      return (
        <TagsField
          className={span ?? 'md:col-span-2'}
          label={field.label}
          help={field.help}
          placeholder={field.placeholder}
          value={value}
          onChange={onChange}
        />
      );
    case 'image':
      return (
        <ImagePicker
          className={span}
          label={field.label}
          help={field.help}
          folder={field.folder}
          value={value}
          onChange={onChange}
        />
      );
    case 'gallery':
      return (
        <div className={span ?? 'md:col-span-2'}>
          <GalleryPicker
            label={field.label}
            help={field.help}
            folder={field.folder}
            value={value}
            onChange={onChange}
          />
        </div>
      );
    default:
      return (
        <TextField
          className={span}
          label={field.label}
          help={field.help}
          type={field.type === 'url' ? 'url' : 'text'}
          placeholder={field.placeholder}
          value={value}
          onChange={onChange}
        />
      );
  }
}

function EditorCard({ config, draft, setDraft, onSave, onCancel, saving, isNew }) {
  return (
    <div className="block fill-lavender-soft p-6 md:p-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl">{isNew ? config.addLabel : 'Editing'}</h2>
        <Button type="button" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {config.fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={draft[field.name]}
            onChange={(next) => setDraft({ ...draft, [field.name]: next })}
          />
        ))}
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button type="button" tone="ink" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/**
 * One editor that drives every list-shaped content type. Add, edit, delete,
 * reorder and hide — all against /api/admin/:table.
 */
export function CollectionEditor({ config }) {
  const { reload } = useContent();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await api.list(config.table));
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [config.table]);

  useEffect(() => {
    load();
  }, [load]);

  function startNew() {
    const maxOrder = rows.reduce((max, r) => Math.max(max, r.sort_order ?? 0), 0);
    setDraft({ ...config.emptyRow, sort_order: maxOrder + 10, visible: true });
    setEditingId('new');
  }

  function cancel() {
    setDraft(null);
    setEditingId(null);
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError('');

    const payload = { ...draft };
    if (config.slugFrom) {
      const { source, target } = config.slugFrom;
      payload[target] =
        slugify(payload[target] || payload[source]) ||
        `item-${Date.now().toString(36)}`;
    }
    delete payload.id;
    delete payload.created_at;

    try {
      if (editingId === 'new') await api.create(config.table, payload);
      else await api.update(config.table, editingId, payload);

      setNotice(editingId === 'new' ? 'Added.' : 'Saved.');
      cancel();
      await load();
      reload();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function remove(row) {
    const name = row[config.primary] ?? 'this item';
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.remove(config.table, row.id);
      setNotice('Deleted.');
      await load();
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleVisible(row) {
    try {
      await api.update(config.table, row.id, { visible: !row.visible });
      await load();
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const a = rows[index];
    const b = rows[target];
    try {
      await Promise.all([
        api.update(config.table, a.id, { sort_order: b.sort_order }),
        api.update(config.table, b.id, { sort_order: a.sort_order }),
      ]);
      await load();
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  const imageField = config.fields.find((f) => f.type === 'image');

  return (
    <div className="flex flex-col gap-5">
      <PageHead
        title={config.title}
        description={config.description}
        action={
          <Button
            type="button"
            tone="ink"
            onClick={startNew}
            disabled={editingId === 'new'}
          >
            + {config.addLabel}
          </Button>
        }
      />

      {error && <Notice tone="error" onDismiss={() => setError('')}>{error}</Notice>}
      {notice && !error && (
        <Notice onDismiss={() => setNotice('')}>{notice}</Notice>
      )}

      {editingId === 'new' && draft && (
        <EditorCard
          config={config}
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={cancel}
          saving={saving}
          isNew
        />
      )}

      {loading ? (
        <Loading />
      ) : rows.length === 0 && editingId !== 'new' ? (
        <div className="block fill-lavender p-10 text-center">
          <p className="font-semibold">
            Nothing here yet. Use “{config.addLabel}” to make the first one.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((row, index) =>
            editingId === row.id && draft ? (
              <li key={row.id}>
                <EditorCard
                  config={config}
                  draft={draft}
                  setDraft={setDraft}
                  onSave={save}
                  onCancel={cancel}
                  saving={saving}
                />
              </li>
            ) : (
              <li key={row.id}>
                <div
                  className={cx(
                    'block flex flex-wrap items-center gap-4 p-4',
                    !row.visible && 'opacity-60',
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="btn btn-sm size-7 !p-0 disabled:opacity-25"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === rows.length - 1}
                      className="btn btn-sm size-7 !p-0 disabled:opacity-25"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>

                  {imageField && (
                    <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-[12px] border-[3px] border-ink bg-lavender-soft">
                      {row[imageField.name] ? (
                        <img
                          src={row[imageField.name]}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="font-display text-lg font-extrabold">
                          {String(row[config.primary] ?? '?').charAt(0)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg font-bold">
                      {row[config.primary] || '(untitled)'}
                    </p>
                    {config.secondary && (
                      <p className="truncate text-sm text-ink-faint">
                        {row[config.secondary]}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => toggleVisible(row)}
                      className={row.visible ? '' : 'btn-yellow'}
                    >
                      {row.visible ? 'Visible' : 'Hidden'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      tone="ink"
                      onClick={() => {
                        setDraft({ ...row });
                        setEditingId(row.id);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => remove(row)}
                      className="hover:btn-coral"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
