import { useContent, useSection } from '../lib/content';
import { usePageMeta } from '../lib/usePageMeta';
import { Burst, SERVICE_ART } from '../components/art/Illustrations';
import { PageHero } from '../components/site/PageHero';
import { Button, EmptyBox, Reveal, Section } from '../components/ui';

const TINTS = ['fill-lavender', 'fill-coral', 'fill-yellow'];

const STEPS = [
  {
    title: 'Tell me what you need',
    body: 'A message with what you are making, roughly when, and what it is for. No formal brief required.',
  },
  {
    title: 'I sketch and quote',
    body: 'A rough plan and an honest price, so you know exactly what you are getting before anything starts.',
  },
  {
    title: 'I build it, you review',
    body: 'You see it as it comes together and say what needs changing, rather than at the very end.',
  },
  {
    title: 'It ships',
    body: 'You get the files or the live site, plus a walkthrough so you can keep it up to date yourself.',
  },
];

export function Services() {
  const { profile, services } = useContent();
  const section = useSection('services', { title: 'What I do' });

  usePageMeta(
    `Services — ${profile.full_name}`,
    section.subtitle || 'Frontend development, visual design and SEO.',
  );

  return (
    <>
      <PageHero
        tone="bg-indigo"
        dark
        eyebrow={section.eyebrow || 'what I do'}
        title={section.title}
        subtitle={section.subtitle}
        shapeFill="#ffc61a"
      />

      <Section>
        {services.length === 0 ? (
          <EmptyBox>No services listed yet.</EmptyBox>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const Art = SERVICE_ART[service.icon?.toLowerCase()] ?? Burst;
              return (
                <Reveal as="li" key={service.id} delay={i * 90}>
                  <article
                    className={`block block-hover group h-full ${TINTS[i % TINTS.length]} flex flex-col p-7`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="block-sm wiggle-hover grid size-20 place-items-center bg-white p-3 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110">
                        <Art className="size-full" />
                      </span>
                      <span className="font-display text-3xl font-extrabold opacity-30">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h2 className="mt-6 text-2xl">{service.title}</h2>
                    <p className="mt-3 flex-1 leading-relaxed">
                      {service.description}
                    </p>

                    {service.tags?.length > 0 && (
                      <ul className="mt-6 flex flex-wrap gap-2">
                        {service.tags.map((tag) => (
                          <li key={tag} className="chip bg-white">
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </ul>
        )}
      </Section>

      <Section className="border-t-[3px] border-ink bg-white">
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)]">How working together goes</h2>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 80}>
              <div className="block h-full p-6">
                <span className="btn btn-yellow btn-icon pointer-events-none font-display text-lg">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section className="border-t-[3px] border-ink bg-coral">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-xl text-[clamp(1.75rem,4.5vw,2.75rem)]">
            Not sure which one you need?
          </h2>
          <p className="max-w-lg text-lg">
            Describe the problem and I will tell you honestly whether I am the
            right person for it.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button to="/contact" tone="ink">
              Ask me
            </Button>
            <Button to="/work" className="bg-white">
              See the work first
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
