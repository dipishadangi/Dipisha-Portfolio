import { CollectionEditor } from '../../components/admin/CollectionEditor';
import { SERVICE_ART_NAMES } from '../../components/art/Illustrations';

export function ServicesEditor() {
  return (
    <CollectionEditor
      config={{
        table: 'services',
        title: 'Services',
        description:
          'The big cards on the services page. Three works best — past four the page stops feeling like a choice.',
        primary: 'title',
        secondary: 'description',
        addLabel: 'Add a service',
        emptyRow: {
          title: '',
          description: '',
          icon: 'sparkle',
          tags: [],
          visible: true,
          sort_order: 0,
        },
        fields: [
          {
            name: 'title',
            label: 'What it is',
            type: 'text',
            placeholder: 'Frontend Development',
          },
          {
            name: 'icon',
            label: 'Picture',
            type: 'select',
            options: SERVICE_ART_NAMES,
            help: 'Each one is a hand-drawn illustration, not a generic icon.',
          },
          {
            name: 'description',
            label: 'Describe it',
            type: 'textarea',
            rows: 4,
            help: 'Two or three sentences. Say what you actually do, not what the job title is.',
          },
          {
            name: 'tags',
            label: 'Tools or keywords',
            type: 'tags',
            placeholder: 'Figma, then Enter',
          },
          { name: 'visible', label: 'Show on the site', type: 'toggle' },
        ],
      }}
    />
  );
}
