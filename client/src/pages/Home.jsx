import { Link } from 'react-router-dom';
import { useContent, useSection } from '../lib/content';
import { usePageMeta } from '../lib/usePageMeta';
import { useCountUp } from '../lib/useCountUp';
import { Burst, SplitScreens } from '../components/art/Illustrations';
import { HeroArt } from '../components/site/HeroArt';
import { SkillMarquee } from '../components/site/SkillMarquee';
import { ProjectCard } from '../components/site/ProjectCard';
import {
  Button,
  Chip,
  Dot,
  Reveal,
  Section,
  SectionHeading,
} from '../components/ui';

/** One of the three numbers under the hero, counting itself up on arrival. */
function Stat({ stat }) {
  const [ref, display] = useCountUp(stat.value);

  return (
    <div ref={ref} className="block block-hover flex items-center gap-4 p-6">
      <span className="font-display text-4xl font-extrabold tabular-nums md:text-5xl">
        {display}
      </span>
      <span className="text-sm leading-snug font-semibold text-ink-soft">
        {stat.label}
      </span>
    </div>
  );
}

export function Home() {
  const { profile, projects, skills, services } = useContent();
  const intro = useSection('home_intro');
  const work = useSection('home_work');

  usePageMeta(
    profile.seo_title || `${profile.full_name} — ${profile.headline}`,
    profile.seo_description || profile.tagline,
  );

  const featured = [...projects]
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.sort_order - b.sort_order;
    })
    .slice(0, 3);

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="border-b-[3px] border-ink bg-cream">
        <div className="shell grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2">
              <Chip className="fill-coral">{profile.headline}</Chip>
              {profile.location && <Chip>{profile.location}</Chip>}
            </div>

            <h1 className="mt-6 text-[clamp(2.75rem,8vw,4.75rem)]">
              {profile.first_name}
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">{profile.last_name}</span>
                <span
                  aria-hidden
                  className="underline-draw absolute inset-x-0 bottom-1 z-0 h-4 rounded-full bg-yellow md:h-5"
                />
              </span>
            </h1>

            {profile.tagline && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
                {profile.tagline}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                to={
                  profile.hero_cta_href?.startsWith('/')
                    ? profile.hero_cta_href
                    : '/work'
                }
                tone="ink"
              >
                {profile.hero_cta_label || 'See the work'}
              </Button>
              <Button to="/contact" tone="coral">
                Start a conversation
              </Button>
              {profile.resume_url && (
                <Button href={profile.resume_url} tone="yellow">
                  Download CV
                </Button>
              )}
            </div>

            <span className="mt-8 inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-white px-4 py-2">
              <Dot on={profile.available} />
              <span className="eyebrow">
                {profile.available_text ||
                  (profile.available ? 'Available' : 'Currently booked')}
              </span>
            </span>
          </Reveal>

          <HeroArt profile={profile} />
        </div>
      </section>

      {/* -------------------------------------------------------- marquee */}
      <SkillMarquee skills={skills} />

      {/* --------------------------------------------------------- stats */}
      {profile.stats?.length > 0 && (
        <Section className="!py-12">
          <ul className="grid gap-4 sm:grid-cols-3">
            {profile.stats.map((stat, i) => (
              <Reveal as="li" key={`${stat.label}-${i}`} delay={i * 80}>
                <Stat stat={stat} />
              </Reveal>
            ))}
          </ul>
        </Section>
      )}

      {/* --------------------------------------------------------- intro */}
      {intro.visible && (
        <Section>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <div className="block overflow-hidden">
                <SplitScreens className="w-full" />
              </div>
            </Reveal>

            <Reveal delay={100}>
              <SectionHeading
                eyebrow={intro.eyebrow}
                title={intro.title}
                subtitle={intro.subtitle}
              />

              {services.length > 0 && (
                <ul className="mt-8 flex flex-col gap-3">
                  {services.slice(0, 3).map((service) => (
                    <li
                      key={service.id}
                      className="block-sm flex items-center gap-4 p-4"
                    >
                      <Burst fill="#ffc61a" className="size-8 shrink-0" />
                      <div>
                        <p className="font-display text-lg font-bold">
                          {service.title}
                        </p>
                        <p className="text-sm text-ink-soft">
                          {service.description.slice(0, 92)}
                          {service.description.length > 92 ? '…' : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <Button to="/services" tone="indigo">
                  What I do
                </Button>
                <Button to="/about">More about me</Button>
              </div>
            </Reveal>
          </div>
        </Section>
      )}

      {/* ---------------------------------------------------------- work */}
      {work.visible && featured.length > 0 && (
        <Section className="border-t-[3px] border-ink bg-lavender-soft">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={work.eyebrow}
              title={work.title}
              subtitle={work.subtitle}
            />
            <Button to="/work" tone="ink">
              All {projects.length} projects
            </Button>
          </div>

          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((project, i) => (
              <Reveal as="li" key={project.id} delay={i * 90} className="group">
                <ProjectCard project={project} index={i} />
              </Reveal>
            ))}
          </ul>
        </Section>
      )}

      {/* --------------------------------------------------------- pitch */}
      <Section>
        <Reveal>
          <div className="block fill-indigo relative overflow-hidden p-8 text-center md:p-16">
            <Burst
              fill="#ffc61a"
              className="bob absolute -top-6 -left-6 size-28 opacity-80"
            />
            <Burst
              fill="#ff8573"
              className="spin-slow absolute -right-8 -bottom-8 size-32 opacity-80"
            />

            <div className="relative">
              <h2 className="text-[clamp(1.9rem,5vw,3rem)] text-white">
                Got something that needs making?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
                Tell me what you are building and roughly when you need it.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button to="/contact" tone="yellow">
                  Send me a message
                </Button>
                {profile.email && (
                  <Button href={`mailto:${profile.email}`}>
                    {profile.email}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      <div className="shell pb-16">
        <p className="text-center text-sm text-ink-faint">
          Looking for the full story?{' '}
          <Link to="/about" className="font-bold text-ink underline">
            Read the about page
          </Link>
          .
        </p>
      </div>
    </>
  );
}
