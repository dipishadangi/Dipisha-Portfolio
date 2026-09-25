-- ============================================================================
--  Starter content. Applied by `npm run db:seed`, after db:setup.
--  All of it is placeholder — Dipisha rewrites or deletes it from /admin.
--  Running it again resets these starter rows.
-- ============================================================================

insert into profile (
  id, full_name, first_name, last_name, headline, location, tagline, about,
  email, phone, available, available_text, hero_cta_label, hero_cta_href,
  socials, stats, seo_title, seo_description
) values (
  1,
  'Dipisha Chhetri',
  'Dipisha',
  'Chhetri',
  'Frontend Developer & Visual Designer',
  'Nepal',
  'I design things that look right, then build them so they work right. Currently deep in React, typography and making pages people can actually find.',
  'I am early in my journey and I like it that way: every week something that looked impossible last month becomes ordinary. My background is visual — layout, colour, type, the small decisions that make a page feel considered — and I am now putting that behind real code with HTML, CSS and React.

I also spend time on the quieter half of the web: SEO, page structure, and writing content people actually find. If you need someone who cares whether the spacing is right and whether the page ranks, we will get along.',
  'hello@example.com',
  '',
  true,
  'Open to work & collaborations',
  'See the work',
  '/work',
  '[
    {"label": "GitHub",    "url": "https://github.com/",      "icon": "github"},
    {"label": "LinkedIn",  "url": "https://linkedin.com/in/", "icon": "linkedin"},
    {"label": "Instagram", "url": "https://instagram.com/",   "icon": "instagram"},
    {"label": "Email",     "url": "mailto:hello@example.com", "icon": "mail"}
  ]'::jsonb,
  '[
    {"value": "6",   "label": "Projects made"},
    {"value": "9",   "label": "Tools I use"},
    {"value": "1yr", "label": "Learning by building"}
  ]'::jsonb,
  'Dipisha Chhetri — Frontend Developer & Visual Designer',
  'Portfolio of Dipisha Chhetri: frontend development, visual design and SEO work from Nepal.'
)
on conflict (id) do update set
  full_name = excluded.full_name, first_name = excluded.first_name,
  last_name = excluded.last_name, headline = excluded.headline,
  location = excluded.location, tagline = excluded.tagline,
  about = excluded.about, email = excluded.email,
  available = excluded.available, available_text = excluded.available_text,
  hero_cta_label = excluded.hero_cta_label, hero_cta_href = excluded.hero_cta_href,
  socials = excluded.socials, stats = excluded.stats,
  seo_title = excluded.seo_title, seo_description = excluded.seo_description;

-- ---------------------------------------------------------------------------
--  Section headings, one per page block
-- ---------------------------------------------------------------------------
insert into sections (key, eyebrow, title, subtitle, visible, sort_order) values
  ('home_intro',    'hello',           'Design it, then build it',           'A short look at what I do. The rest lives on its own page.', true, 10),
  ('home_work',     'recent work',     'Things I have made',                 'A few favourites. There are more on the work page.',        true, 20),
  ('about',         'the short version', 'Who I am',                         'A designer learning to build the things she draws.',        true, 30),
  ('about_skills',  'the toolkit',     'What I work with',                   'Grouped by the kind of job it is for.',                     true, 40),
  ('about_journey', 'the paper trail', 'Where I have been',                  'Study, courses and the certificates that came out of them.',true, 50),
  ('services',      'what I do',       'Three things I can make for you',    'Pick whichever one you need. Or ask about all three.',      true, 60),
  ('work',          'the folio',       'Everything I have made',             'Studies, client work and experiments — newest first.',      true, 70),
  ('contact',       'say hello',       'Got something that needs making?',   'Fill this in and it lands straight in my inbox.',           true, 80)
on conflict (key) do update set
  eyebrow = excluded.eyebrow, title = excluded.title,
  subtitle = excluded.subtitle, visible = excluded.visible,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
--  Skills
-- ---------------------------------------------------------------------------
delete from skills where name in (
  'HTML5', 'CSS3', 'JavaScript', 'React', 'Tailwind CSS', 'Git & GitHub',
  'Figma', 'Canva', 'Adobe Photoshop', 'Typography', 'On-page SEO', 'Keyword Research'
);
insert into skills (name, category, level, sort_order) values
  ('HTML5',            'Frontend', 4, 10),
  ('CSS3',             'Frontend', 4, 20),
  ('JavaScript',       'Frontend', 3, 30),
  ('React',            'Frontend', 2, 40),
  ('Tailwind CSS',     'Frontend', 3, 50),
  ('Git & GitHub',     'Frontend', 3, 60),
  ('Figma',            'Design',   4, 70),
  ('Canva',            'Design',   5, 80),
  ('Adobe Photoshop',  'Design',   3, 90),
  ('Typography',       'Design',   4, 100),
  ('On-page SEO',      'SEO',      3, 110),
  ('Keyword Research', 'SEO',      3, 120);

-- ---------------------------------------------------------------------------
--  Services
-- ---------------------------------------------------------------------------
delete from services where title in (
  'Frontend Development', 'Visual & Brand Design', 'SEO & Content Structure'
);
insert into services (title, description, icon, tags, sort_order) values
  (
    'Frontend Development',
    'Turning a design into a real, responsive page. Semantic HTML, hand-written CSS, and React where it earns its place — tested on a phone before it ships.',
    'code', array['HTML', 'CSS', 'JavaScript', 'React'], 10
  ),
  (
    'Visual & Brand Design',
    'Posters, social sets, thumbnails and small brand kits. Grids that hold up, type that is actually readable, and colour used on purpose.',
    'palette', array['Figma', 'Canva', 'Photoshop', 'Type'], 20
  ),
  (
    'SEO & Content Structure',
    'Making a page findable: heading structure, metadata, image alt text, internal links, and keyword research that reads like a human wrote it.',
    'search', array['On-page', 'Keywords', 'Metadata', 'Audits'], 30
  );

-- ---------------------------------------------------------------------------
--  Projects
-- ---------------------------------------------------------------------------
delete from projects where slug in (
  'cafe-landing-page', 'recipe-app-ui', 'seo-audit-local-business',
  'brand-kit-study', 'poster-series'
);
insert into projects (title, slug, kind, summary, body, tech, year, featured, sort_order) values
  (
    'Café Landing Page', 'cafe-landing-page', 'Frontend build',
    'A one-page site for a neighbourhood café, designed in Figma and built by hand in HTML and CSS.',
    'I wanted one project where I owned both halves — the design and the code. I started in Figma with a type scale and an eight-point grid, then built it in plain HTML and CSS so I could not hide behind a framework.

The part that taught me the most was the mobile layout. My first attempt was a desktop design squeezed into a phone; the second attempt was designed for the phone first and then allowed to grow. Everything after that got easier.',
    array['HTML', 'CSS', 'Figma'], '2026', true, 10
  ),
  (
    'Recipe App Interface', 'recipe-app-ui', 'UI design + React',
    'A small React interface for browsing recipes, with a filter bar and a card grid that stays readable at every width.',
    'A study in component thinking. I drew the card once, then found every place it needed to change — a long title, a missing image, a recipe with no tags — and made the component survive all of them.

State is deliberately simple: search text and a set of active filters, nothing more. It is the first thing I built where the code felt organised rather than merely working.',
    array['React', 'CSS', 'Figma'], '2026', true, 20
  ),
  (
    'Local Business SEO Audit', 'seo-audit-local-business', 'SEO',
    'A page-by-page audit of a small business site: heading structure, metadata, alt text and a keyword map, written up as a plain-language report.',
    'The site looked fine and ranked for nothing. I went through it page by page: duplicate title tags, four H1s on the home page, images with no alt text, and no internal links between the service pages.

I wrote the findings as a short report the owner could actually act on — each item with what was wrong, why it mattered, and the exact replacement text. Learning to explain the fix turned out to be harder, and more useful, than finding it.',
    array['On-page SEO', 'Keyword research', 'Reporting'], '2026', false, 30
  ),
  (
    'Brand Kit Study', 'brand-kit-study', 'Design',
    'A self-directed brand kit for an imaginary stationery shop: logo, palette, type pairing and a set of social templates.',
    'An exercise in restraint. One serif, one sans, four colours, and a logo that still reads at sixteen pixels.

I built the social templates as reusable Figma components so a whole week of posts could be filled in without re-drawing anything — which is the real point of a brand kit.',
    array['Figma', 'Type', 'Colour'], '2026', false, 40
  ),
  (
    'Poster Series', 'poster-series', 'Design',
    'Six posters exploring grids, scale and negative space — printed, pinned up, and criticised honestly.',
    'One constraint per poster: one typeface, or two colours, or no image at all. Printing them mattered; things that look balanced on a screen fall apart at A3.',
    array['Photoshop', 'Print', 'Layout'], '2026', false, 50
  );

-- ---------------------------------------------------------------------------
--  Journey
-- ---------------------------------------------------------------------------
delete from timeline where title in (
  'Frontend Mentorship', 'Responsive Web Design', 'Graphic Design Fundamentals',
  'SEO Fundamentals', 'Your degree'
);
insert into timeline (title, org, kind, period, description, sort_order) values
  ('Frontend Mentorship',         'One-to-one, ongoing', 'work',        '2026 — present', 'Learning React and modern CSS through weekly reviews on real builds rather than tutorials.', 10),
  ('Responsive Web Design',       'Online course',       'certificate', '2026',           'Flexbox, Grid and media queries, with a set of small builds at the end of each module.',      20),
  ('Graphic Design Fundamentals', 'Online course',       'certificate', '2025',           'Grids, hierarchy, colour theory and type pairing — the vocabulary behind the visual work.',   30),
  ('SEO Fundamentals',            'Online course',       'certificate', '2025',           'On-page optimisation, keyword research and how search engines actually read a page.',         40),
  ('Your degree',                 'Add your college',    'education',   'Add your years', 'Replace this entry with your real education from the admin panel.',                           50);
