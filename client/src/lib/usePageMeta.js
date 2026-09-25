import { useEffect } from 'react';

const DEFAULT_TITLE = 'Dipisha Chhetri';

/**
 * Sets the tab title and meta description for a page. A single-page app has
 * no server rendering, so this runs after mount — good enough for people and
 * for Google, which executes JavaScript before indexing.
 */
export function usePageMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description]);
}
