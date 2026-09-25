import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';

const ContentContext = createContext(null);

const EMPTY = {
  profile: {
    full_name: '',
    first_name: '',
    last_name: '',
    headline: '',
    location: '',
    tagline: '',
    about: '',
    avatar_url: null,
    resume_url: null,
    email: '',
    phone: '',
    available: true,
    available_text: '',
    hero_cta_label: 'See the work',
    hero_cta_href: '/work',
    socials: [],
    stats: [],
    seo_title: '',
    seo_description: '',
  },
  sections: {},
  skills: [],
  services: [],
  projects: [],
  timeline: [],
};

/**
 * Loads the whole site's content once and shares it with every page, so
 * moving between routes never refetches.
 */
export function ContentProvider({ children }) {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const payload = await api.content();
      setData({
        ...EMPTY,
        ...payload,
        profile: { ...EMPTY.profile, ...(payload.profile ?? {}) },
      });
      setStatus('ready');
      setError('');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ContentContext.Provider value={{ ...data, status, error, reload: load }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const value = useContext(ContentContext);
  if (!value) {
    throw new Error('useContent must be used inside a ContentProvider');
  }
  return value;
}

/** A section's headings, with safe fallbacks if the row is missing. */
export function useSection(key, fallback = {}) {
  const { sections } = useContent();
  return {
    key,
    eyebrow: '',
    title: '',
    subtitle: '',
    visible: true,
    ...fallback,
    ...(sections[key] ?? {}),
  };
}
