import { useContent, useSection } from '../lib/content';
import { usePageMeta } from '../lib/usePageMeta';
import { Burst, TIMELINE_ART, Medal } from '../components/art/Illustrations';
import { PageHero } from '../components/site/PageHero';
import { SocialLinks } from '../components/site/SocialLinks';
import {
  Button,
  EmptyBox,
  Reveal,
  Section,
  SectionHeading,
} from '../components/ui';

function PageTop({ section, profile }) {
  return (
    <PageHero
      tone="bg-coral"
      eyebrow={section.eyebrow || 'about'}
      title={section.title || 'Who I am'}
      subtitle={section.subtitle}
      shapeFill="#ffffff"
      art={
        <div className="block block-hover w-full max-w-[18rem] overflow-hidden p-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="aspect-[4/5] w-full rounded-[14px] border-[3px] border-ink object-cover"
            />
          ) : (
            <div className="fill-lavender grid aspect-[4/5] w-full place-items-center rounded-[14px] border-[3px] border-ink">
              <Burst fill="#ffffff" className="spin-slow size-28" />
            </div>
          )}
        </div>
      }
    />
  );
}

function SkillGroups({ section, skills }) {
  const groups = skills.reduce((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});

  const entries = Object.entries(groups);
  const tints = ['fill-lavender', 'fill-yellow', 'fill-coral', 'fill-cream'];

  return (
    <Section className="border-t-[3px] border-ink bg-white">
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        subtitle={section.subtitle}
      />

      {entries.length === 0 ? (
        <div className="mt-10">
          <EmptyBox>No skills added yet.</EmptyBox>
        </div>
      ) : (
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entries.map(([category, list], i) => (
            <Reveal
              as="li"
              key={category}
              delay={i * 90}
              className={`block ${tints[i % tints.length]} p-6`}
            >
              <div className="flex items-center gap-3">
                <Burst fill="#ffffff" className="size-9" />
                <h3 className="text-xl">{category}</h3>
              </div>

              <ul className="mt-5 flex flex-col gap-3">
                {list.map((skill) => (
                  <li key={skill.id} className="flex items-center gap-3">
                    <span className="flex-1 font-semibold">{skill.name}</span>
                    <span className="flex gap-1" aria-hidden>
                      {Array.from({ length: 5 }).map((_, dot) => (
                        <span
                          key={dot}
                          className={`size-2.5 rounded-full border-2 border-ink ${
                            dot < skill.level ? 'bg-ink' : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </span>
                    <span className="sr-only">{skill.level} out of 5</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Journey({ section, entries }) {
  return (
    <Section className="border-t-[3px] border-ink bg-lavender-soft">
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        subtitle={section.subtitle}
      />

      {entries.length === 0 ? (
        <div className="mt-10">
          <EmptyBox>Nothing on the timeline yet.</EmptyBox>
        </div>
      ) : (
        <ul className="mt-12 flex flex-col gap-5">
          {entries.map((entry, i) => {
            const Art = TIMELINE_ART[entry.kind?.toLowerCase()] ?? Medal;
            return (
              <Reveal as="li" key={entry.id} delay={i * 70}>
                <article className="block flex flex-col gap-5 p-6 sm:flex-row sm:items-start md:p-7">
                  <span className="block-sm fill-white grid size-16 shrink-0 place-items-center p-2">
                    <Art className="size-10" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {entry.period && (
                        <span className="chip fill-yellow">{entry.period}</span>
                      )}
                      {entry.org && (
                        <span className="font-mono text-xs font-bold text-ink-faint uppercase">
                          {entry.org}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-xl">
                      {entry.url ? (
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-[3px] underline-offset-4 hover:text-indigo"
                        >
                          {entry.title}
                        </a>
                      ) : (
                        entry.title
                      )}
                    </h3>

                    {entry.description && (
                      <p className="mt-2 leading-relaxed text-ink-soft">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

export function About() {
  const { profile, skills, timeline } = useContent();
  const about = useSection('about', { title: 'Who I am' });
  const skillsMeta = useSection('about_skills', { title: 'What I work with' });
  const journeyMeta = useSection('about_journey', { title: 'Where I have been' });

  usePageMeta(
    `About — ${profile.full_name}`,
    profile.about?.slice(0, 155) || profile.tagline,
  );

  const paragraphs = (profile.about ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <PageTop section={about} profile={profile} />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <Reveal>
            <div className="block p-7 md:p-10">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? 'text-lg leading-[1.75]'
                        : 'mt-5 leading-[1.75] text-ink-soft'
                    }
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-ink-faint italic">
                  Write your story from the admin panel — it appears here.
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex h-full flex-col gap-5">
              <div className="block fill-yellow p-6">
                <p className="eyebrow">Find me</p>
                <div className="mt-4">
                  <SocialLinks socials={profile.socials} />
                </div>
              </div>

              <div className="block flex-1 p-6">
                <p className="eyebrow">Get in touch</p>
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="mt-3 block font-display text-lg font-bold break-all hover:text-indigo"
                  >
                    {profile.email}
                  </a>
                )}
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone.replace(/\s+/g, '')}`}
                    className="mt-1 block font-semibold text-ink-soft"
                  >
                    {profile.phone}
                  </a>
                )}

                <div className="mt-5 flex flex-col gap-2">
                  <Button to="/contact" tone="coral" className="w-full">
                    Message me
                  </Button>
                  {profile.resume_url && (
                    <Button href={profile.resume_url} className="w-full">
                      Download CV
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {skillsMeta.visible && (
        <SkillGroups section={skillsMeta} skills={skills} />
      )}
      {journeyMeta.visible && (
        <Journey section={journeyMeta} entries={timeline} />
      )}
    </>
  );
}
