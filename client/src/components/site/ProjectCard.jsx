import { Link } from 'react-router-dom';
import { Burst } from '../art/Illustrations';
import { cx } from '../ui';

const TINTS = ['fill-lavender', 'fill-coral', 'fill-yellow', 'fill-lavender'];

/** The placeholder shown until a project has a cover image. */
function CoverPlaceholder({ index }) {
  return (
    <div
      className={cx(
        'grid h-full w-full place-items-center',
        TINTS[index % TINTS.length],
      )}
    >
      <div className="relative grid place-items-center">
        <Burst
          fill="#ffffff"
          className="size-24 opacity-90 transition-transform duration-[900ms] ease-out group-hover:rotate-[135deg] group-hover:scale-110"
        />
      </div>
    </div>
  );
}

export function ProjectCard({ project, index = 0, large = false }) {
  return (
    <article className="block block-hover h-full overflow-hidden">
      <Link to={`/work/${project.slug}`} className="flex h-full flex-col">
        <div
          className={cx(
            'w-full overflow-hidden border-b-[3px] border-ink',
            large ? 'aspect-[16/10]' : 'aspect-[4/3]',
          )}
        >
          {project.cover_url ? (
            <img
              src={project.cover_url}
              alt={project.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <CoverPlaceholder index={index} />
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {project.kind && <span className="chip fill-yellow">{project.kind}</span>}
            {project.year && (
              <span className="font-mono text-xs font-bold text-ink-faint">
                {project.year}
              </span>
            )}
          </div>

          <h3
            className={cx(
              'mt-3.5',
              large ? 'text-2xl md:text-[1.75rem]' : 'text-xl',
            )}
          >
            {project.title}
          </h3>

          {project.summary && (
            <p className="mt-2.5 flex-1 leading-relaxed text-ink-soft">
              {project.summary}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            {project.tech?.length > 0 && (
              <ul className="flex flex-wrap gap-x-2.5 gap-y-1">
                {project.tech.slice(0, 3).map((tech) => (
                  <li
                    key={tech}
                    className="font-mono text-[0.6875rem] font-bold tracking-wide text-ink-faint uppercase"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            )}

            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-white transition-transform group-hover:translate-x-1"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
