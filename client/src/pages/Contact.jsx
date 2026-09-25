import { useState } from 'react';
import { api } from '../lib/api';
import { useContent, useSection } from '../lib/content';
import { usePageMeta } from '../lib/usePageMeta';
import { Burst, Envelope } from '../components/art/Illustrations';
import { PageHero } from '../components/site/PageHero';
import { SocialLinks } from '../components/site/SocialLinks';
import { Button, Dot, Reveal, Section } from '../components/ui';

export function Contact() {
  const { profile } = useContent();
  const section = useSection('contact', { title: 'Say hello' });

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  usePageMeta(
    `Contact — ${profile.full_name}`,
    section.subtitle || 'Get in touch about a project.',
  );

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    setStatus('sending');
    setError('');

    try {
      await api.sendMessage({
        name: data.name,
        email: data.email,
        subject: data.subject,
        body: data.body,
        company: data.company, // honeypot
      });
      setStatus('sent');
      form.reset();
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  return (
    <>
      <PageHero
        tone="bg-lavender"
        eyebrow={section.eyebrow || 'say hello'}
        title={section.title}
        subtitle={section.subtitle}
        shapeFill="#ffffff"
        art={<Envelope className="w-full max-w-[16rem]" />}
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          {/* ------------------------------------------------------ form */}
          <Reveal>
            <div className="block p-7 md:p-9">
              {status === 'sent' ? (
                <div className="py-10 text-center">
                  <Burst fill="#ffc61a" className="spin-slow mx-auto size-24" />
                  <h2 className="mt-6 text-3xl">Message sent</h2>
                  <p className="mt-3 text-ink-soft">
                    It is in the inbox. I will reply as soon as I can.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-7"
                  >
                    Send another
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="eyebrow mb-2 block">Your name *</span>
                      <input
                        name="name"
                        required
                        maxLength={120}
                        autoComplete="name"
                        className="field"
                        placeholder="Ram Bahadur"
                      />
                    </label>

                    <label className="block">
                      <span className="eyebrow mb-2 block">Email *</span>
                      <input
                        name="email"
                        type="email"
                        required
                        maxLength={200}
                        autoComplete="email"
                        className="field"
                        placeholder="ram@example.com"
                      />
                    </label>
                  </div>

                  <label className="mt-5 block">
                    <span className="eyebrow mb-2 block">Subject</span>
                    <input
                      name="subject"
                      maxLength={200}
                      className="field"
                      placeholder="A landing page for my shop"
                    />
                  </label>

                  <label className="mt-5 block">
                    <span className="eyebrow mb-2 block">Message *</span>
                    <textarea
                      name="body"
                      required
                      rows={7}
                      maxLength={5000}
                      className="field resize-y"
                      placeholder="Tell me what you are making and roughly when you need it."
                    />
                  </label>

                  {/* honeypot — zero-sized, so it can never widen the page */}
                  <div aria-hidden className="h-0 w-0 overflow-hidden">
                    <label>
                      Company
                      <input name="company" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <Button
                      type="submit"
                      tone="ink"
                      disabled={status === 'sending'}
                    >
                      {status === 'sending' ? 'Sending…' : 'Send it'}
                    </Button>

                    <p role="status" aria-live="polite" className="text-sm">
                      {status === 'error' && (
                        <span className="font-semibold text-coral-deep">
                          {error}
                        </span>
                      )}
                    </p>
                  </div>
                </form>
              )}
            </div>
          </Reveal>

          {/* --------------------------------------------------- details */}
          <Reveal delay={100}>
            <div className="flex flex-col gap-5">
              <div className="block fill-yellow p-6">
                <p className="eyebrow">Straight to me</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {profile.email && (
                    <li>
                      <a
                        href={`mailto:${profile.email}`}
                        className="font-display text-lg font-bold break-all hover:underline"
                      >
                        {profile.email}
                      </a>
                    </li>
                  )}
                  {profile.phone && (
                    <li>
                      <a
                        href={`tel:${profile.phone.replace(/\s+/g, '')}`}
                        className="font-semibold hover:underline"
                      >
                        {profile.phone}
                      </a>
                    </li>
                  )}
                  {profile.location && (
                    <li className="font-semibold">{profile.location}</li>
                  )}
                </ul>
              </div>

              <div className="block p-6">
                <p className="eyebrow">Elsewhere</p>
                <div className="mt-4">
                  <SocialLinks socials={profile.socials} />
                </div>
              </div>

              <div className="block fill-coral p-6">
                <span className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-white px-3.5 py-1.5">
                  <Dot on={profile.available} />
                  <span className="eyebrow">
                    {profile.available ? 'Taking work' : 'Booked up'}
                  </span>
                </span>
                <p className="mt-4 leading-relaxed">
                  {profile.available_text ||
                    'Get in touch and I will tell you what I can take on.'}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
