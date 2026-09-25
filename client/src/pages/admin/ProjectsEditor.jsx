import { CollectionEditor } from '../../components/admin/CollectionEditor';

export function ProjectsEditor() {
  return (
    <CollectionEditor
      config={{
        table: 'projects',
        title: 'Projects',
        description:
          'Each project gets a card on the work page and its own page at /work/… Mark two or three as featured — those are the ones shown on the home page.',
        primary: 'title',
        secondary: 'summary',
        addLabel: 'Add a project',
        slugFrom: { source: 'title', target: 'slug' },
        emptyRow: {
          title: '',
          slug: '',
          kind: 'Project',
          summary: '',
          body: '',
          cover_url: null,
          gallery: [],
          tech: [],
          live_url: '',
          repo_url: '',
          year: String(new Date().getFullYear()),
          featured: false,
          visible: true,
          sort_order: 0,
        },
        fields: [
          {
            name: 'title',
            label: 'Project name',
            type: 'text',
            placeholder: 'Cafe Landing Page',
          },
          {
            name: 'slug',
            label: 'Web address',
            type: 'text',
            placeholder: 'leave blank and one is made for you',
            help: 'Becomes /work/your-slug. Leave it empty and it is built from the name.',
          },
          {
            name: 'kind',
            label: 'Kind of work',
            type: 'text',
            placeholder: 'Frontend build',
            help: 'Also becomes a filter button on the work page.',
          },
          { name: 'year', label: 'Year', type: 'text', placeholder: '2026' },
          {
            name: 'cover_url',
            label: 'Cover image',
            type: 'image',
            folder: 'projects',
            help: 'Landscape works best, roughly 16:10.',
          },
          {
            name: 'summary',
            label: 'One-line summary',
            type: 'textarea',
            rows: 3,
            help: 'The sentence on the card. Keep it to one or two lines.',
          },
          {
            name: 'body',
            label: 'The full story',
            type: 'textarea',
            rows: 10,
            help: 'Shown on the project page. Leave a blank line between paragraphs. What was the problem, what did you try, what did you learn?',
          },
          {
            name: 'tech',
            label: 'Tools used',
            type: 'tags',
            placeholder: 'Figma, then Enter',
          },
          {
            name: 'gallery',
            label: 'More images',
            type: 'gallery',
            folder: 'projects',
          },
          {
            name: 'live_url',
            label: 'Live link',
            type: 'url',
            placeholder: 'https://…',
          },
          {
            name: 'repo_url',
            label: 'Code link',
            type: 'url',
            placeholder: 'https://github.com/…',
          },
          {
            name: 'featured',
            label: 'Feature it',
            type: 'toggle',
            help: 'Featured projects appear on the home page.',
          },
          { name: 'visible', label: 'Show on the site', type: 'toggle' },
        ],
      }}
    />
  );
}
