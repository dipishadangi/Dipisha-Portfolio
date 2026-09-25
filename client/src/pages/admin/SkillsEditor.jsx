import { CollectionEditor } from '../../components/admin/CollectionEditor';

export function SkillsEditor() {
  return (
    <CollectionEditor
      config={{
        table: 'skills',
        title: 'Skills',
        description:
          'These fill the scrolling band on the home page and the grouped cards on the about page. The group is free text — whatever you type becomes a heading.',
        primary: 'name',
        secondary: 'category',
        addLabel: 'Add a skill',
        emptyRow: {
          name: '',
          category: 'General',
          level: 3,
          visible: true,
          sort_order: 0,
        },
        fields: [
          { name: 'name', label: 'Skill', type: 'text', placeholder: 'React' },
          {
            name: 'category',
            label: 'Group it under',
            type: 'text',
            placeholder: 'Frontend',
            help: 'Skills sharing a group are shown in the same card.',
          },
          {
            name: 'level',
            label: 'Confidence (1-5)',
            type: 'number',
            min: 1,
            max: 5,
            help: 'Shown as filled dots. Being honest reads better than claiming five everywhere.',
          },
          { name: 'visible', label: 'Show on the site', type: 'toggle' },
        ],
      }}
    />
  );
}
