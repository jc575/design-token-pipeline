import type { Meta, StoryObj } from '@storybook/react-vite';
import { SeverityTrendChart } from './SeverityTrendChart';

// Illustrative sample data only. Nothing here comes from a real product or employer.
const week = [
  { label: 'Mon', critical: 2, high: 6, medium: 14, low: 22 },
  { label: 'Tue', critical: 3, high: 7, medium: 15, low: 20 },
  { label: 'Wed', critical: 3, high: 5, medium: 12, low: 25 },
  { label: 'Thu', critical: 9, high: 12, medium: 18, low: 19 },
  { label: 'Fri', critical: 5, high: 9, medium: 16, low: 21 },
  { label: 'Sat', critical: 1, high: 3, medium: 8, low: 14 },
  { label: 'Sun', critical: 1, high: 2, medium: 7, low: 12 }
];

const meta = {
  title: 'Patterns/Severity trend chart',
  component: SeverityTrendChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A small data visualization pattern built on the same tokens as the Button. Severity is an **ordered** scale, so it uses one hue stepping from light to dark, not a rainbow. The ramp is validated for lightness order in the build, every chart has a legend, a plain table alternative, and loading, empty, and error states.'
      }
    }
  },
  args: {
    title: 'Critical alerts tripled on Thursday, then eased',
    subtitle: 'Alerts per day by severity, last 7 days',
    source: 'Source: illustrative sample data, 7 days. Not real alert data.',
    data: week
  }
} satisfies Meta<typeof SeverityTrendChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TableOpen: Story = { args: { initialTableOpen: true } };
export const Loading: Story = { args: { state: 'loading' } };
export const Empty: Story = { args: { state: 'empty', data: [] } };
export const ErrorState: Story = { name: 'Error', args: { state: 'error', onRetry: () => undefined } };
