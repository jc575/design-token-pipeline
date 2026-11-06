import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import type { ButtonIntent, ButtonSize } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Mirrors the **Button** component set in Figma (Intent x Size x State, 24 variants). Every visual value is a token generated from Figma variables, so changing a variable in Figma and re-exporting changes this component with no edits to the component file.'
      }
    }
  },
  argTypes: {
    intent: { control: 'inline-radio', options: ['primary', 'secondary', 'danger'] },
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    disabled: { control: 'boolean' },
    children: { control: 'text' }
  },
  args: { children: 'Button', intent: 'primary', size: 'medium', disabled: false }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { intent: 'secondary' } };
export const Danger: Story = { args: { intent: 'danger', children: 'Delete rule' } };
export const Small: Story = { args: { size: 'small' } };
export const Disabled: Story = { args: { disabled: true } };

const intents: ButtonIntent[] = ['primary', 'secondary', 'danger'];
const sizes: ButtonSize[] = ['medium', 'small'];
const states = [
  { label: 'Default', props: {} },
  { label: 'Hover', props: { previewState: 'hover' as const } },
  { label: 'Focus', props: { previewState: 'focus' as const } },
  { label: 'Disabled', props: { disabled: true } }
];

/** The same 3 x 2 x 4 grid as the Figma specimen, so design and code can be compared side by side. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <table style={{ borderCollapse: 'separate', borderSpacing: '16px 12px' }}>
      <thead>
        <tr>
          <th scope="col" style={{ textAlign: 'left', fontWeight: 400, color: 'var(--ds-color-text-secondary)' }}>
            Intent, size
          </th>
          {states.map((s) => (
            <th key={s.label} scope="col" style={{ textAlign: 'left', fontWeight: 400, color: 'var(--ds-color-text-secondary)' }}>
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {intents.flatMap((intent) =>
          sizes.map((size) => (
            <tr key={`${intent}-${size}`}>
              <th scope="row" style={{ textAlign: 'left', fontWeight: 400, color: 'var(--ds-color-text-secondary)' }}>
                {intent}, {size}
              </th>
              {states.map((s) => (
                <td key={s.label}>
                  <Button intent={intent} size={size} {...s.props}>
                    Button
                  </Button>
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
};
