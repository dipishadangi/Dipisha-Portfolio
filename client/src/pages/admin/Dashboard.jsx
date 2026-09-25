import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useContent } from '../../lib/content';
import { Burst } from '../../components/art/Illustrations';
import { PageHead } from '../../components/admin/PageHead';
import { Button } from '../../components/ui';

const TILES = [
  {
    to: '/admin/profile',
    label: 'Profile & hero',
    blurb: 'Your name, photo, story and links.',
    tint: 'fill-coral',
  },
  {
    to: '/admin/projects',
    label: 'Projects',
    blurb: 'The work page and every project page.',
    tint: 'fill-yellow',
    count: 'projects',
  },
  {
    to: '/admin/skills',
    label: 'Skills',
    blurb: 'The scrolling band and the about cards.',
    tint: 'fill-lavender',
    count: 'skills',
  },
  {
    to: '/admin/services',
    label: 'Services',
    blurb: 'What you can be hired for.',
    tint: 'fill-lavender',
    count: 'services',
  },
  {
    to: '/admin/journey',
    label: 'Journey',
    blurb: 'Study, courses and certificates.',
    tint: 'fill-coral',
    count: 'timeline',
  },
  {
    to: '/admin/inbox',
    label: 'Inbox',
    blurb: 'Messages from the contact form.',
    tint: 'fill-yellow',
    count: 'unread',
  },
];

const STEPS = [
  ['Profile & hero', '/admin/profile', 'Put your real name, photo and a sentence about yourself at the top.'],
  ['Skills', '/admin/skills', 'Delete the ones that are not yours and add the ones that are.'],
  ['Projects', '/admin/projects', 'Even one finished thing beats a page of placeholders. Add a cover image.'],
  ['Page headings', '/admin/sections', 'Rename any block, or switch off the ones you are not ready for.'],
];

export function Dashboard() {
  const { profile, projects, skills, services, timeline } = useContent();
  const [unread, setUnread] = useState(null);

  useEffect(() => {
    api
      .messages()
      .then((rows) => setUnread(rows.filter((m) => !m.read).length))
      .catch(() => setUnread(0));
  }, []);

  const counts = {
    projects: projects.length,
    skills: skills.length,
    services: services.length,
    timeline: timeline.length,
    unread,
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHead
        title={`Welcome back${profile.first_name ? `, ${profile.first_name}` : ''}`}
        description="Everything on the site is editable from here — the words, the pictures, the order, and whether something shows at all. Nothing you change here can break the site."
        action={
          <Button to="/" tone="yellow">
            View the site
          </Button>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => {
          const value = tile.count ? counts[tile.count] : null;
          return (
            <li key={tile.to}>
              <Link
                to={tile.to}
                className={`block block-hover ${tile.tint} flex h-full flex-col p-6`}
              >
                <div className="flex items-start justify-between">
                  <Burst fill="#ffffff" className="size-11" />
                  {tile.count && (
                    <span className="font-display text-4xl font-extrabold">
                      {value ?? '—'}
                    </span>
                  )}
                </div>

                <h2 className="mt-5 text-xl">{tile.label}</h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed">
                  {tile.blurb}
                </p>

                {tile.count === 'unread' && unread > 0 && (
                  <span className="chip mt-4 self-start bg-white">
                    {unread} unread
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="block p-6 md:p-7">
        <h2 className="text-xl">Not sure where to start?</h2>
        <ol className="mt-5 flex flex-col gap-4">
          {STEPS.map(([label, to, blurb], i) => (
            <li key={to} className="flex gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-yellow font-display text-sm font-extrabold">
                {i + 1}
              </span>
              <p className="pt-1 leading-relaxed text-ink-soft">
                <Link to={to} className="font-bold text-ink underline decoration-[3px] underline-offset-4">
                  {label}
                </Link>
                {' — '}
                {blurb}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
