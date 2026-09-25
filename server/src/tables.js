/**
 * The only tables and columns the API will ever touch. Table and column names
 * cannot be parameterised in SQL, so every identifier that reaches a query is
 * looked up in here first — nothing from the request body is trusted.
 */

export const COLLECTIONS = {
  skills: {
    columns: ['name', 'category', 'level', 'visible', 'sort_order'],
    arrays: [],
    json: [],
  },
  services: {
    columns: ['title', 'description', 'icon', 'tags', 'visible', 'sort_order'],
    arrays: ['tags'],
    json: [],
  },
  projects: {
    columns: [
      'title',
      'slug',
      'kind',
      'summary',
      'body',
      'cover_url',
      'gallery',
      'tech',
      'live_url',
      'repo_url',
      'year',
      'featured',
      'visible',
      'sort_order',
    ],
    arrays: ['tech'],
    json: ['gallery'],
  },
  timeline: {
    columns: [
      'title',
      'org',
      'kind',
      'period',
      'description',
      'url',
      'visible',
      'sort_order',
    ],
    arrays: [],
    json: [],
  },
};

export const PROFILE_COLUMNS = [
  'full_name',
  'first_name',
  'last_name',
  'headline',
  'location',
  'tagline',
  'about',
  'avatar_url',
  'resume_url',
  'email',
  'phone',
  'available',
  'available_text',
  'hero_cta_label',
  'hero_cta_href',
  'socials',
  'stats',
  'seo_title',
  'seo_description',
];

export const PROFILE_JSON = ['socials', 'stats'];

export const SECTION_COLUMNS = [
  'eyebrow',
  'title',
  'subtitle',
  'visible',
  'sort_order',
];

/**
 * Narrows a request body to the allowed columns and converts the values
 * Postgres needs in a particular shape (json columns get stringified,
 * text[] columns get a real array).
 */
export function pickColumns(body, allowed, { arrays = [], json = [] } = {}) {
  const data = {};

  for (const column of allowed) {
    if (!Object.hasOwn(body, column)) continue;
    let value = body[column];

    if (json.includes(column)) {
      value = JSON.stringify(Array.isArray(value) ? value : (value ?? []));
    } else if (arrays.includes(column)) {
      value = Array.isArray(value)
        ? value.map(String)
        : String(value ?? '')
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean);
    } else if (value === '') {
      // Empty text inputs for optional URLs should clear the column.
      value = column.endsWith('_url') ? null : '';
    }

    data[column] = value;
  }

  return data;
}
