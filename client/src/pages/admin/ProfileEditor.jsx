import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useContent } from '../../lib/content';
import { Button, Loading } from '../../components/ui';
import { Notice, PageHead } from '../../components/admin/PageHead';
import {
  ImagePicker,
  Labelled,
  SelectField,
  TextArea,
  TextField,
  Toggle,
} from '../../components/admin/fields';
import { SOCIAL_ICON_NAMES } from '../../components/site/SocialLinks';

function Card({ title, children }) {
  return (
    <section className="block p-6 md:p-7">
      <h2 className="mb-6 text-xl">{title}</h2>
      {children}
    </section>
  );
}

function SocialsEditor({ value = [], onChange }) {
  const list = Array.isArray(value) ? value : [];
  const patch = (i, changes) =>
    onChange(list.map((s, j) => (j === i ? { ...s, ...changes } : s)));

  return (
    <Labelled
      label="Social links"
      help="Each one becomes a circular button. Pick “link” for anything not in the list."
    >
      <ul className="flex flex-col gap-3">
        {list.map((social, i) => (
          <li
            key={i}
            className="grid items-end gap-3 rounded-[16px] border-[3px] border-ink bg-lavender-soft p-3 sm:grid-cols-[1fr_1.4fr_auto_auto]"
          >
            <TextField
              label="Name"
              value={social.label}
              onChange={(v) => patch(i, { label: v })}
            />
            <TextField
              label="Link"
              placeholder="https://…"
              value={social.url}
              onChange={(v) => patch(i, { url: v })}
            />
            <SelectField
              label="Icon"
              options={SOCIAL_ICON_NAMES}
              value={social.icon}
              onChange={(v) => patch(i, { icon: v })}
            />
            <Button
              type="button"
              size="sm"
              className="mb-0.5"
              onClick={() => onChange(list.filter((_, j) => j !== i))}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        size="sm"
        className="mt-3"
        onClick={() => onChange([...list, { label: '', url: '', icon: 'link' }])}
      >
        + Add a link
      </Button>
    </Labelled>
  );
}

function StatsEditor({ value = [], onChange }) {
  const list = Array.isArray(value) ? value : [];
  const patch = (i, changes) =>
    onChange(list.map((s, j) => (j === i ? { ...s, ...changes } : s)));

  return (
    <Labelled
      label="The numbers on the home page"
      help="Two or three is right. Leave the list empty to hide them completely."
    >
      <ul className="flex flex-col gap-3">
        {list.map((stat, i) => (
          <li
            key={i}
            className="grid items-end gap-3 rounded-[16px] border-[3px] border-ink bg-lavender-soft p-3 sm:grid-cols-[0.5fr_1.5fr_auto]"
          >
            <TextField
              label="Number"
              placeholder="6"
              value={stat.value}
              onChange={(v) => patch(i, { value: v })}
            />
            <TextField
              label="What it counts"
              placeholder="Projects made"
              value={stat.label}
              onChange={(v) => patch(i, { label: v })}
            />
            <Button
              type="button"
              size="sm"
              className="mb-0.5"
              onClick={() => onChange(list.filter((_, j) => j !== i))}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        size="sm"
        className="mt-3"
        onClick={() => onChange([...list, { value: '', label: '' }])}
      >
        + Add a number
      </Button>
    </Labelled>
  );
}

export function ProfileEditor() {
  const { reload } = useContent();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api
      .adminProfile()
      .then((row) =>
        setProfile({
          ...row,
          socials: Array.isArray(row?.socials) ? row.socials : [],
          stats: Array.isArray(row?.stats) ? row.stats : [],
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, value) =>
    setProfile((current) => ({ ...current, [key]: value }));

  async function save() {
    setSaving(true);
    setError('');
    try {
      await api.saveProfile({
        ...profile,
        full_name:
          profile.full_name?.trim() ||
          `${profile.first_name} ${profile.last_name}`.trim(),
      });
      setNotice('Saved. The site updates straight away.');
      reload();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  if (loading) return <Loading />;
  if (!profile) {
    return <Notice tone="error">{error || 'Could not load the profile.'}</Notice>;
  }

  const saveButton = (
    <Button type="button" tone="ink" onClick={save} disabled={saving}>
      {saving ? 'Saving…' : 'Save everything'}
    </Button>
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHead
        title="Profile & hero"
        description="Your name, your photo, the sentence at the top, and how people reach you."
        action={saveButton}
      />

      {error && <Notice tone="error" onDismiss={() => setError('')}>{error}</Notice>}
      {notice && !error && (
        <Notice onDismiss={() => setNotice('')}>{notice}</Notice>
      )}

      <Card title="Who you are">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="First name"
            help="Shown large at the top of the home page."
            value={profile.first_name}
            onChange={(v) => set('first_name', v)}
          />
          <TextField
            label="Last name"
            help="Gets the yellow highlight underneath it."
            value={profile.last_name}
            onChange={(v) => set('last_name', v)}
          />
          <TextField
            label="Full name"
            help="Used in the header, the footer and the browser tab."
            value={profile.full_name}
            onChange={(v) => set('full_name', v)}
          />
          <TextField
            label="What you do"
            placeholder="Frontend Developer & Visual Designer"
            help="The pill above your name. Change it whenever you change direction."
            value={profile.headline}
            onChange={(v) => set('headline', v)}
          />
          <TextField
            label="Where you are"
            value={profile.location}
            onChange={(v) => set('location', v)}
          />
          <ImagePicker
            label="Your photo"
            folder="profile"
            aspect="aspect-[4/5]"
            help="Portrait orientation. Without one, an illustration is shown instead."
            value={profile.avatar_url}
            onChange={(url) => set('avatar_url', url)}
          />
          <TextArea
            className="md:col-span-2"
            label="The sentence under your name"
            rows={3}
            value={profile.tagline}
            onChange={(v) => set('tagline', v)}
          />
          <TextArea
            className="md:col-span-2"
            label="Your story"
            rows={9}
            help="Fills the about page. Leave a blank line between paragraphs."
            value={profile.about}
            onChange={(v) => set('about', v)}
          />
        </div>
      </Card>

      <Card title="How people reach you">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Email"
            type="email"
            value={profile.email}
            onChange={(v) => set('email', v)}
          />
          <TextField
            label="Phone"
            help="Leave empty to hide it."
            value={profile.phone}
            onChange={(v) => set('phone', v)}
          />
          <ImagePicker
            label="Your CV"
            folder="documents"
            help="Upload a PDF and a download button appears on the home and about pages."
            value={profile.resume_url}
            onChange={(url) => set('resume_url', url)}
          />
          <div className="flex flex-col gap-5">
            <Toggle
              label="Available for work"
              help="Fills in the little green dot."
              value={profile.available}
              onChange={(v) => set('available', v)}
            />
            <TextField
              label="Availability wording"
              value={profile.available_text}
              onChange={(v) => set('available_text', v)}
            />
          </div>
          <div className="md:col-span-2">
            <SocialsEditor
              value={profile.socials}
              onChange={(v) => set('socials', v)}
            />
          </div>
        </div>
      </Card>

      <Card title="Home page button & numbers">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Button wording"
            value={profile.hero_cta_label}
            onChange={(v) => set('hero_cta_label', v)}
          />
          <TextField
            label="Button goes to"
            help="A page on this site: /work, /services, /contact or /about."
            value={profile.hero_cta_href}
            onChange={(v) => set('hero_cta_href', v)}
          />
          <div className="md:col-span-2">
            <StatsEditor
              value={profile.stats}
              onChange={(v) => set('stats', v)}
            />
          </div>
        </div>
      </Card>

      <Card title="Search & sharing">
        <div className="grid gap-5">
          <TextField
            label="Page title"
            help="What shows in the browser tab and in Google results. Around 60 characters."
            value={profile.seo_title}
            onChange={(v) => set('seo_title', v)}
          />
          <TextArea
            label="Description"
            rows={3}
            help="The grey sentence under your link in search results. Around 155 characters."
            value={profile.seo_description}
            onChange={(v) => set('seo_description', v)}
          />
        </div>
      </Card>

      <div className="flex justify-end">{saveButton}</div>
    </div>
  );
}
