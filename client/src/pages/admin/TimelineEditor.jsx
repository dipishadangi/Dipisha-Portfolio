import { CollectionEditor } from '../../components/admin/CollectionEditor';

export function TimelineEditor() {
  return (
    <CollectionEditor
      config={{
        table: 'timeline',
        title: 'Journey',
        description:
          'Education, jobs and certificates, all on one list at the bottom of the about page. Newest first reads best — use the arrows to reorder.',
        primary: 'title',
        secondary: 'org',
        addLabel: 'Add an entry',
        emptyRow: {
          title: '',
          org: '',
          kind: 'education',
          period: '',
          description: '',
          url: '',
          visible: true,
          sort_order: 0,
        },
        fields: [
          {
            name: 'title',
            label: 'Title',
            type: 'text',
            placeholder: 'Responsive Web Design',
          },
          {
            name: 'kind',
            label: 'Type',
            type: 'select',
            options: ['education', 'work', 'certificate'],
            help: 'Picks the drawing: a graduation cap, a briefcase or a medal.',
          },
          {
            name: 'org',
            label: 'Where',
            type: 'text',
            placeholder: 'College or course provider',
          },
          {
            name: 'period',
            label: 'When',
            type: 'text',
            placeholder: '2026 — present',
          },
          {
            name: 'description',
            label: 'What it covered',
            type: 'textarea',
            rows: 3,
          },
          {
            name: 'url',
            label: 'Link to the certificate',
            type: 'url',
            placeholder: 'https://…',
          },
          { name: 'visible', label: 'Show on the site', type: 'toggle' },
        ],
      }}
    />
  );
}
