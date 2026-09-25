import { useMemo, useState } from 'react';
import { useContent, useSection } from '../lib/content';
import { usePageMeta } from '../lib/usePageMeta';
import { CardStack } from '../components/art/Illustrations';
import { PageHero } from '../components/site/PageHero';
import { ProjectCard } from '../components/site/ProjectCard';
import { EmptyBox, Reveal, Section, cx } from '../components/ui';

export function Work() {
  const { profile, projects } = useContent();
  const section = useSection('work', { title: 'Everything I have made' });
  const [filter, setFilter] = useState('All');

  usePageMeta(
    `Work — ${profile.full_name}`,
    section.subtitle || 'Projects, studies and experiments.',
  );

  const kinds = useMemo(() => {
    const set = new Set(projects.map((p) => p.kind).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [projects]);

  const shown = useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
    return filter === 'All'
      ? sorted
      : sorted.filter((project) => project.kind === filter);
  }, [projects, filter]);

  return (
    <>
      <PageHero
        tone="bg-yellow"
        eyebrow={section.eyebrow || 'the folio'}
        title={section.title}
        subtitle={section.subtitle}
        shapeFill="#ffffff"
        art={<CardStack className="w-full max-w-xs" />}
      />

      <Section>
        {kinds.length > 2 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {kinds.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setFilter(kind)}
                aria-pressed={filter === kind}
                className={cx('btn btn-sm', filter === kind && 'btn-ink')}
              >
                {kind}
              </button>
            ))}
          </div>
        )}

        {shown.length === 0 ? (
          <EmptyBox>
            No projects here yet. They are added from the admin panel.
          </EmptyBox>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((project, i) => (
              <Reveal as="li" key={project.id} delay={i * 70} className="group">
                <ProjectCard project={project} index={i} />
              </Reveal>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
