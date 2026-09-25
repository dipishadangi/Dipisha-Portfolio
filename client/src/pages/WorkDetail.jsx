import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useContent } from '../lib/content';
import { usePageMeta } from '../lib/usePageMeta';
import { Burst } from '../components/art/Illustrations';
import { SocialGlyph } from '../components/site/SocialLinks';
import {
  Button,
  Chip,
  ErrorBox,
  Loading,
  Reveal,
  Section,
} from '../components/ui';

export function WorkDetail() {
  const { slug } = useParams();
  const { profile, projects } = useContent();
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    api
      .project(slug)
      .then((data) => {
        if (cancelled) return;
        setProject(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus(err.status === 404 ? 'missing' : 'error');
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  usePageMeta(
    project ? `${project.title} — ${profile.full_name}` : 'Project',
    project?.summary,
  );

  if (status === 'loading') return <Loading label="Opening the project" />;

  if (status === 'missing') {
    return (
      <Section>
        <div className="block fill-lavender mx-auto max-w-lg p-10 text-center">
          <Burst fill="#ffffff" className="mx-auto size-20" />
          <h1 className="mt-6 text-3xl">No project here</h1>
          <p className="mt-3 text-ink-soft">
            This one has been renamed or removed.
          </p>
          <Button to="/work" tone="ink" className="mt-7">
            See all work
          </Button>
        </div>
      </Section>
    );
  }

  if (status === 'error') {
    return (
      <Section>
        <ErrorBox title="Could not load that project">{error}</ErrorBox>
      </Section>
    );
  }

  const paragraphs = (project.body ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const gallery = Array.isArray(project.gallery) ? project.gallery : [];
  const others = projects.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <>
      <section className="border-b-[3px] border-ink bg-lavender">
        <div className="shell py-12 md:py-16">
          <Link
            to="/work"
            className="btn btn-sm inline-flex bg-white"
          >
            ← All work
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {project.kind && <Chip className="fill-yellow">{project.kind}</Chip>}
            {project.year && <Chip className="bg-white">{project.year}</Chip>}
            {project.featured && <Chip className="fill-coral">Featured</Chip>}
          </div>

          <h1 className="mt-5 max-w-3xl text-[clamp(2.25rem,6vw,4rem)]">
            {project.title}
          </h1>

          {project.summary && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed">
              {project.summary}
            </p>
          )}

          {(project.live_url || project.repo_url) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.live_url && (
                <Button href={project.live_url} tone="ink">
                  Visit it
                </Button>
              )}
              {project.repo_url && (
                <Button href={project.repo_url} className="bg-white">
                  <SocialGlyph name="github" className="size-4" />
                  Source code
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <Section>
        <Reveal>
          <div className="block overflow-hidden">
            {project.cover_url ? (
              <img
                src={project.cover_url}
                alt={project.title}
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <div className="fill-coral grid aspect-[16/9] w-full place-items-center">
                <Burst fill="#ffffff" className="spin-slow size-32" />
              </div>
            )}
          </div>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <Reveal>
            <div className="block p-7 md:p-10">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? 'text-lg leading-[1.8]'
                        : 'mt-5 leading-[1.8] text-ink-soft'
                    }
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-ink-faint italic">
                  No write-up for this one yet.
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-col gap-5">
              {project.tech?.length > 0 && (
                <div className="block fill-yellow p-6">
                  <p className="eyebrow">Made with</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <li key={tech} className="chip bg-white">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="block fill-indigo p-6">
                <p className="eyebrow text-white/70">Like this?</p>
                <p className="mt-3 font-display text-xl font-extrabold text-white">
                  I am open to similar work.
                </p>
                <Button to="/contact" tone="yellow" className="mt-5 w-full">
                  Get in touch
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        {gallery.length > 0 && (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {gallery.map((src, i) => (
              <Reveal as="li" key={`${src}-${i}`} delay={i * 70}>
                <div className="block overflow-hidden">
                  <img
                    src={src}
                    alt={`${project.title} — ${i + 1}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              </Reveal>
            ))}
          </ul>
        )}
      </Section>

      {others.length > 0 && (
        <Section className="border-t-[3px] border-ink bg-lavender-soft">
          <h2 className="text-2xl md:text-3xl">More work</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {others.map((other) => (
              <li key={other.id} className="group">
                <article className="block block-hover h-full overflow-hidden">
                  <Link to={`/work/${other.slug}`} className="block p-5">
                    <p className="font-display text-lg font-bold">
                      {other.title}
                    </p>
                    <p className="mt-1.5 text-sm text-ink-soft">
                      {other.summary?.slice(0, 80)}
                      {other.summary?.length > 80 ? '…' : ''}
                    </p>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
